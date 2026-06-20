import { Server } from 'socket.io'

let io

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        // Join a room (used by mandi rates & community forum)
        socket.on('join-room', (room) => {
            socket.join(room)
            console.log(`User ${socket.id} joined room: ${room}`)
        })

        socket.on('leave-room', (room) => {
            socket.leave(room)
        })

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`)
        })
    })

    return io
}

// Call this in any controller to emit events
const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized. Call initSocket first.')
    return io
}

export { initSocket, getIO }