import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const URL = 'http://localhost:8080';

const socket = io(URL, {
    extraHeaders: {
        'Authorization': `Bearer ${Cookies.get('token')}`,
    },
    withCredentials: false
});

socket.on('connect', () => {
    console.log('Connected to socket.io server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from socket.io server');
});

export default socket;