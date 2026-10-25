import Seat from '../models/Seat.js';

export const setupSeatSocket = (io) => {
  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUserId = null;

    // Join show room
    socket.on('join:show', async ({ showId, userId }) => {
      currentRoom = `show:${showId}`;
      currentUserId = userId;
      socket.join(currentRoom);

      // Count viewers in room
      const roomSize = io.sockets.adapter.rooms.get(currentRoom)?.size || 1;
      io.to(currentRoom).emit('viewers:count', { count: roomSize });
    });

    // Leave show room
    socket.on('leave:show', ({ showId }) => {
      const roomName = `show:${showId}`;
      socket.leave(roomName);
      const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
      io.to(roomName).emit('viewers:count', { count: roomSize });
    });

    // Lock seat temporarily (e.g. while selecting / paying)
    socket.on('seat:lock', async ({ showId, seatNumber, userId }) => {
      try {
        const lockExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const updated = await Seat.findOneAndUpdate(
          {
            show: showId,
            seatNumber,
            $or: [
              { status: 'available' },
              { status: 'locked', lockedBy: userId },
              { status: 'locked', lockExpiresAt: { $lt: new Date() } },
            ],
          },
          {
            $set: {
              status: 'locked',
              lockedBy: userId,
              lockExpiresAt,
            },
          },
          { new: true }
        );

        if (updated) {
          io.to(`show:${showId}`).emit('seat:locked', {
            showId,
            seatNumber,
            lockedBy: userId,
            lockExpiresAt,
          });
        } else {
          socket.emit('seat:lock_failed', { seatNumber, message: 'Seat already taken' });
        }
      } catch (err) {
        console.error('[Socket] Error locking seat:', err.message);
      }
    });

    // Unlock seat
    socket.on('seat:unlock', async ({ showId, seatNumber, userId }) => {
      try {
        const updated = await Seat.findOneAndUpdate(
          {
            show: showId,
            seatNumber,
            status: 'locked',
            lockedBy: userId,
          },
          {
            $set: {
              status: 'available',
              lockedBy: null,
              lockExpiresAt: null,
            },
          },
          { new: true }
        );

        if (updated) {
          io.to(`show:${showId}`).emit('seat:unlocked', {
            showId,
            seatNumber,
          });
        }
      } catch (err) {
        console.error('[Socket] Error unlocking seat:', err.message);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (currentRoom) {
        const roomSize = io.sockets.adapter.rooms.get(currentRoom)?.size || 0;
        io.to(currentRoom).emit('viewers:count', { count: roomSize });
      }
    });
  });
};
