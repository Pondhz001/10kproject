import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/db';

dotenv.config();

async function run() {
  await connectDB();
  const TreeModel = mongoose.model('Tree');
  const OrderModel = mongoose.model('Order');
  
  const treeRes = await TreeModel.deleteMany({ status: 'Pending Verification' });
  console.log(`Deleted ${treeRes.deletedCount} pending trees.`);
  
  const orderRes = await OrderModel.deleteMany({ status: 'Pending' });
  console.log(`Deleted ${orderRes.deletedCount} pending orders.`);
  
  process.exit(0);
}

run().catch(console.error);
