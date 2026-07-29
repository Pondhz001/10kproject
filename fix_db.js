import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const TreeModel = mongoose.models.Tree || mongoose.model('Tree', new mongoose.Schema({}, {strict: false}));
  
  await TreeModel.deleteMany({ id: null });
  console.log("Deleted trees with id: null");
  process.exit(0);
}

run();
