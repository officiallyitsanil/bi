import mongoose from "mongoose";

const dbConnect = async () => {
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState === 1) {
    // Already fully connected — .db is available
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    // Currently connecting — wait for it to finish
    await new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
    return mongoose.connection;
  }

  // Not connected — initiate connection
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    return mongoose.connection;
  } catch (error) {
    console.error('[dbConnect] Error connecting to MongoDB:', error.message);
    throw error; // Let API routes handle the error gracefully instead of process.exit
  }
};

export default dbConnect;
