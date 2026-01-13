// config the database connection
import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDatabase;