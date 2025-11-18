import mongoose from 'mongoose';
// Database bootstrap: sets up a single Mongoose connection used by all models.

const mongoUrl = process.env.MongoURL || 'mongodb://localhost:27017/workspaceBooking';
// Read MongoDB connection string from env; fall back to local dev.
if (!process.env.MongoURL) {
  console.warn('MongoURL not set. Falling back to local mongodb://localhost:27017/workspaceBooking');
}

mongoose.set('strictQuery', true);
// strictQuery keeps filters limited to known schema paths for safer queries.

export const connectPromise = mongoose
  .connect(mongoUrl)
  .then(() => {
    // DB is ready. Server can start listening now.
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    // Fail fast so the process does not run without a DB.
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Export the mongoose instance so models can define schemas.
export default mongoose;