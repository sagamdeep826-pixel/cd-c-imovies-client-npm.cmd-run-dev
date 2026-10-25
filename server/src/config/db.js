import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

  try {
    // Attempt standard connection first with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Standard MongoDB connection failed: ${error.message}`);
    console.log('[Database] Initializing fallback in-memory MongoDB server for zero-friction setup...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB running and connected at ${memoryUri}`);
    } catch (memError) {
      console.error('[Database] Fatal: could not initialize database connection.', memError.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] ${err}`);
  });
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
