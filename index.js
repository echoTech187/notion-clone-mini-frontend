const express = require('express');
const app = express();
const cors = require('cors');
const connectToMoongose = require('./config/database/mongooseDB');
const dotenv = require('dotenv');
const authRouter = require('./routes/authRouter');
const noteRouter = require('./routes/noteRouter');
const middleware = require('./middleware/middleware');
const http = require('http');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

dotenv.config({ path: './.env' });

connectToMoongose();

const server = http.createServer(app);
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
};
const io = new Server(server, {
    cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Middleware to attach io to req object
app.use((req, res, next) => {
    req.io = io;
    next();
});

const getUserIdFromToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
};

io.use((socket, next) => {
    middleware.protect(socket.request, socket.request.res, next);
});

io.on('connection', (socket) => {
    let currentNoteId = null;
    let currentUserId = null;
    console.log(`a user connected (Socket ID: ${socket.id})`);
    socket.on('JoinNote', async ({ noteId, token }) => {
        if (!noteId) {
            socket.emit('noteError', { message: 'Note ID is required to join.' });
            return;
        }

        currentUserId = getUserIdFromToken(token);
        if (!currentUserId) {
            socket.emit('noteError', { message: 'User ID is required to join.' });
            return;
        }

        try {
            const note = await Note.findById(noteId).populate('lastEditedBy', 'username');
            if (!note) {
                socket.emit('noteError', { message: 'Catatan tidak ditemukan.' });
                return;
            }
            if (note.user.toString() !== currentUserId) {
                socket.emit('noteError', { message: 'Kamu tidak memiliki izin untuk mengakses catatan ini.' });
                return;
            }
            currentNoteId = noteId;
            socket.join(noteId);
            console.log(`User ${currentUserId} joined note room: ${noteId} (Socket ID: ${socket.id})`);
            socket.emit('noteInitialState', note);
        } catch (error) {
            socket.emit('noteError', { message: 'Error joining note.' });
            console.log(error);
        }
    });

    socket.on('noteChange', async ({ noteId, blocks, title }) => {
        if (!currentNoteId || currentNoteId !== noteId || !currentUserId) {
            socket.emit('noteError', { message: 'Tidak memiliki izin atau catatan tidak ditemukan.' });
            return;
        }
        try {

            const note = await Note.findById(noteId).populate('lastEditedBy', 'username');
            if (!note) {
                socket.emit('noteError', { message: 'Catatan tidak ditemukan.' });
                return;
            }
            if (note.user.toString() !== currentUserId) {
                socket.emit('noteError', { message: 'Kamu tidak memiliki izin untuk mengedit catatan ini.' });
                return;
            }
            const updatedNote = await Note.findByIdAndUpdate(noteId, { title }, { new: true, runValidators: true }).populate('lastEditedBy', 'username');

            if (!updatedNote) {
                socket.emit('noteError', { message: 'Gagal memperbarui catatan.' });
                return;
            } else {
                await Block.deleteMany({ note_id: noteId });
                await Block.insertMany(blocks.map(block => ({ ...block, note_id: noteId })));
            }

            console.log(`User ${currentUserId} updated note: ${noteId} (Socket ID: ${socket.id})`);
            socket.to(noteId).emit('noteChange', updatedNote);
        } catch (error) {
            socket.emit('noteError', { message: 'Error updating note.' });
            console.log(error);
        }
    });
    socket.on('disconnect', () => {
        if (currentNoteId) {
            socket.leave(currentNoteId);
        }
        console.log(`user disconnected (Socket ID: ${socket.id})`);
    });
});
app.get('/', (req, res) => res.send('API running'));
app.get('/api', (req, res) => res.send('API running'));
app.use('/api/auth', authRouter);
app.use('/api/notes', middleware.protect, noteRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});