import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    if (mongoose.connections && mongoose.connections[0].readyState) { return }
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

export default dbConnect;

