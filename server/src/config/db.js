import mongoose from 'mongoose';

let memoryServer = null;
export const dbStatus = {
  connected: false,
  isMemory: false,
  isPersistent: false,
  host: '',
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

  try {
    // Attempt standard connection first with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    dbStatus.connected = true;
    dbStatus.isMemory = false;
    dbStatus.isPersistent = true;
    dbStatus.host = mongoose.connection.host;
    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host} (Persistent Database)`);
  } catch (error) {
    console.warn(`[Database] Standard MongoDB connection failed: ${error.message}`);
    console.log('[Database] Initializing fallback in-memory MongoDB server for zero-friction setup...');

    try {
      // Direct mongodb-memory-server cache to workspace folder to avoid permission errors
      const pathModule = await import('path');
      const osModule = await import('os');
      const cacheDir = pathModule.resolve(process.cwd(), '.mongo-binaries');
      process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;

      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'imovies'
        }
      });
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      dbStatus.connected = true;
      dbStatus.isMemory = true;
      dbStatus.isPersistent = false;
      dbStatus.host = memoryUri;
      console.log(`[Database] In-memory MongoDB running and connected at ${memoryUri} (Session In-Memory Mode)`);
    } catch (memError) {
      dbStatus.connected = false;
      dbStatus.isMemory = false;
      dbStatus.isPersistent = false;
      dbStatus.error = memError.message;
      console.warn('[Database] In-memory MongoDB could not be started:', memError.message);
      console.warn('[Database] Continuing in API Demo mode without MongoDB.');
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
