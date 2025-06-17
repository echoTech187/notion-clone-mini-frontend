const Note = require('../models/Note');
const Block = require('../models/Block');

exports.getNotes = async (req, res) => {
    console.log(req.user.id);
    try {
        const notes = await Note.find({ userId: req.user.id }).sort({ createAt: -1 }).populate('lastEditedBy', 'username');

        if (!notes) {
            return res.status(404).json({ message: 'Catatan tidak ditemukan.' });
        }
        const block = [];
        await Promise.all(notes.map(async (note) => {
            const blocks = await Block.find({ note_id: note._id }).sort({ order_index: 1 }).select('-__v -_id -note_id');
            block.push(blocks);
        }));
        notes.forEach((note, i) => {
            note.blocks = block[i];
        });
        res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNote = async (req, res) => {
    try {
        const note = await Note.find({ _id: req.params.id, userId: req.user.id }).populate('lastEditedBy', 'username');

        if (!note) {
            return res.status(404).json({ message: 'Catatan tidak ditemukan.' });
        }
        const blocks = await Block.find({ note_id: note[0]._id }).sort({ order_index: 1 }).select('-__v -_id -note_id');
        res.status(200).json({
            success: true,
            data: note,
            content: reconstructBlocksForFrontend(blocks)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createNote = async (req, res) => {
    try {
        const { initialBlockId } = req.body; // Expect initialBlockId from frontend
        const newNote = new Note({
            id: require('uuid').v4(),
            userId: req.user._id,
            title: req.body.title || 'Untitled',
            lastEditedBy: req.user._id,
            lastEditedAt: Date.now()
        });
        const note = await newNote.save();
        if (!note) {
            return res.status(404).json({ message: 'Note not created.' });
        }
        const initialBlockData = {
            note_id: note._id,
            id: initialBlockId || 'default-initial-block', // Use ID from frontend or fallback
            parent_id: null,
            type: 'paragraph',
            content: [], // Empty content for a new paragraph
            props: {}, // Default props
            order_index: 0,
            children: [], // No children initially
        };
        console.log(initialBlockData);
        const initialBlock = await Block.create(initialBlockData);
        if (!initialBlock) {
            return res.status(404).json({ message: 'Initial block not created.' });
        }

        res.status(200).json({
            success: true,
            message: 'Catatan berhasil dibuat.',
            ...note.toObject(),
            content: [reconstructBlocksForFrontend([initialBlock])[0]]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const blocks = content;
        let note = await Note.findById({ _id: req.params.id, userId: req.user.id }).populate('lastEditedBy', 'username');

        if (!note) {
            res.status(404).json({ message: 'Catatan tidak ditemukan.' });
        }
        if (note.userId.toString() !== req.user.id) {
            res.status(401).json({ message: 'Anda tidak memiliki izin untuk mengedit catatan ini.' });
        }
        note.title = title !== undefined ? title : note.title;
        note.lastEditedBy = req.user.id;
        await note.save();
        if (blocks && blocks.length > 0) {
            await Block.deleteMany({ note_id: note._id });
            const blocksToInsert = prepareBlocksForDB(blocks, note._id.toString());
            await Block.insertMany(blocksToInsert);
        }
        const updatedBlocks = await Block.find({ note_id: note._id }).sort({ orderIndex: 1 });
        req.io.to(note._id.toString()).emit('note_updated', {

            note_id: note._id.toString(),
            updatedNote: {
                _id: note._id,
                title: note.title,
                content: reconstructBlocksForFrontend(updatedBlocks),
                updatedAt: note.updatedAt,
                lastEditedBy: note.lastEditedBy,
            }
        });
        res.status(200).json({
            success: true,
            message: 'Catatan berhasil diperbarui.',
            data: note,
            content: reconstructBlocksForFrontend(updatedBlocks)
        });
    } catch (error) {
        console.log(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.status(500).json({ message: error.message || 'Server error during note update' });
    }
};


exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!note) {
            res.status(404);
            throw new Error('Catatan tidak ditemukan.');
        }
        // Check if the user is the owner of the note
        if (note.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Anda tidak memiliki izin untuk menghapus catatan ini.');
        }

        await Block.deleteMany({ noteId: note._id });

        req.io.emit('note_deleted', note._id.toString());
        res.status(200).json({
            success: true,
            message: 'Catatan berhasil dihapus.',
            note
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNoteForPreview = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).select('-userId').populate('lastEditedBy', 'username'); // Don't expose userId
        if (!note) {
            return res.status(404).json({ message: 'Note not found for preview' });
        }

        // Fetch all blocks for preview
        const blocks = await Block.find({ note_id: note._id }).sort({ orderIndex: 1 });

        res.json({
            ...note.toObject(),
            content: reconstructBlocksForFrontend(blocks),
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Note not found for preview' });
        }
        console.error('Error fetching note for preview:', error);
        res.status(500).json({ message: error.message || 'Server error fetching note for preview' });
    }
};
exports.getNotesByUser = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.params.userId }).sort({ createAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper function to recursively prepare blocks for DB insertion
const prepareBlocksForDB = (blocks, noteId, parentBlockId = null) => {

    return blocks.flatMap((block, index) => {
        const dbBlock = {
            note_id: noteId,
            id: block.id,
            parent_id: parentBlockId,
            type: block.type,
            content: block.content,
            props: block.props,
            order_index: index, // Use index from the array as order within its parent/level
            // children property from BlockNote is usually derived from parentId in DB
            children: block.children ? block.children.map(child => child.id) : [], // Store children IDs for full fidelity if needed
        };

        let childBlocks = [];
        if (block.children && block.children.length > 0) {
            childBlocks = prepareBlocksForDB(block.children, noteId, block.id);
        }
        return [dbBlock, ...childBlocks];
    });
};

// Helper function to reconstruct BlockNote format from DB blocks
// This takes a flat list of blocks from DB and prepares them for BlockNoteView's `initialContent` or `replaceBlocks`
const reconstructBlocksForFrontend = (dbBlocks) => {
    // BlockNote expects 'id', 'type', 'props', 'content', 'children'
    // 'id' should map to our 'blockId' from DB
    // 'children' needs to be an array of BlockNote block objects if we are building the full tree.
    // However, for `editor.replaceBlocks`, a flat list of blocks (where nested items
    // are correctly linked via their `parent` prop within their `props` object
    // as BlockNote internally expects for list items etc.) is usually sufficient.
    // Given the current `Block.js` schema, `children` in DB refers to a list of child BlockIDs,
    // which then needs to be re-assembled into the actual block objects.
    // For simplicity, we'll assume BlockNote handles the hierarchy with a flat list
    // where `props.parent` (for e.g. list items) is crucial.
    // If you need full tree reconstruction on the backend, this function becomes more complex.

    // A simpler approach for `replaceBlocks` is to ensure correct `id` and other properties are set.
    return dbBlocks.map(b => ({
        id: b.blockId,
        type: b.type,
        props: b.props,
        content: b.content,
        children: [],
    }));
};