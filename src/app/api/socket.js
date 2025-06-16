import { io } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const socket = io(URL, {
    withCredentials: true,
});

socket.on('connect', () => {
    console.log('Connected to socket.io server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from socket.io server');
});

export default socket;