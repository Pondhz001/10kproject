import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const TreeModel = mongoose.models.Tree || mongoose.model('Tree', new mongoose.Schema({}, {strict: false}));
  const OrderModel = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({}, {strict: false}));
  
  const indexes = [101004, 101005, 101006, 101007, 101008, 101009];
  const orderId = `MK-${Math.random().toString(36).substring(2, 6).toUpperCase()}999`;
  
  // check if these indexes are already taken
  const existing = await TreeModel.find({ index: { $in: indexes } });
  if (existing.length > 0) {
    console.log("Trees already exist. Deleting existing.");
    await TreeModel.deleteMany({ index: { $in: indexes } });
  }
  
  // Also delete order if it exists
  await OrderModel.deleteMany({ donorName: 'น้องปาย' });

  const newOrder = new OrderModel({
    id: orderId,
    donorName: 'น้องปาย',
    donorOrganization: 'เสพศิลป์ วินเทจ',
    donorPhone: '0000000000',
    treeCount: 6,
    amount: 600,
    status: 'Paid',
    selectedTreeIndexes: indexes,
    treeNames: indexes.map(() => 'น้องปาย (เสพศิลป์ วินเทจ)'),
    createdAt: new Date().toISOString()
  });
  
  await newOrder.save();
  
  const trees = indexes.map((index, i) => ({
    id: `T-${index}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    index,
    ownerName: 'น้องปาย (เสพศิลป์ วินเทจ)',
    plantedAt: new Date().toISOString(),
    status: 'Planted',
    carbonOffset: 25,
    orderId: orderId
  }));
  
  await TreeModel.insertMany(trees);
  
  console.log("Added test data for น้องปาย");
  process.exit(0);
}

run();
