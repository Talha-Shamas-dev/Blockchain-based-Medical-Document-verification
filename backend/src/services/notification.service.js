import { Server } from 'socket.io';
let io = null;
const notificationService = {
  attach: (server) => {
    io = new Server(server, { path: '/ws' });
    io.on('connection', (socket) => { console.log('[WS] Client connected'); });
  },
  emit: (event, data) => { if (io) io.emit(event, data); },
  connectedCount: 0,
};
export default notificationService;
