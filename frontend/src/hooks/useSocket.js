// src/hooks/useSocket.js
// Connects to the backend Socket.io server and returns the socket instance.
// Usage:
//   const socket = useSocket();
//   useEffect(() => {
//     socket.on('mandi-update', (data) => { ... });
//     return () => socket.off('mandi-update');
//   }, [socket]);

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Single socket instance shared across the app
let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;

    if (!socketUrl && import.meta.env.DEV) {
      console.warn(
        '[useSocket] VITE_SOCKET_URL is not set — falling back to same-origin. ' +
        'Set VITE_SOCKET_URL in your .env file for local development.'
      );
    }

    socketInstance = io(socketUrl || window.location.origin, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socketInstance;
};

export default function useSocket() {
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // Don't disconnect on unmount — socket is shared across components.
      // Only disconnect on full app teardown.
    };
  }, []);

  return socketRef.current;
}