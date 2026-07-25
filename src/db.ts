import mongoose from 'mongoose';
import { Tree, Order, CareUpdate, UserProfile } from './types';

// Mongoose Schemas
const CareUpdateSchema = new mongoose.Schema({
  date: String,
  status: String,
  height: Number,
  image: String,
  note: String,
});

const TreeSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  index: { type: Number, unique: true, required: true },
  ownerName: String,
  ownerOrganization: String,
  ownerPhone: String,
  userId: String,
  plantedAt: String,
  status: { type: String, enum: ['Pending Verification', 'Seedling', 'Growing', 'Young Tree', 'Mature'] },
  height: Number,
  carbonOffset: Number,
  careHistory: [CareUpdateSchema],
  slipDetails: {
    transDate: String,
    transTime: String,
    senderName: String,
    receiverName: String,
    amount: Number,
    refId: String,
    sendingBank: String,
  }
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  donorName: String,
  donorOrganization: String,
  donorPhone: String,
  userId: String,
  treeCount: Number,
  amount: Number,
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'] },
  slipVerified: Boolean,
  selectedTreeIndexes: [Number],
  treeNames: [String],
  slipDetails: {
    transDate: String,
    transTime: String,
    senderName: String,
    receiverName: String,
    amount: Number,
    refId: String,
    sendingBank: String,
  },
  createdAt: String,
  verificationCode: String,
});

const UserProfileSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  displayName: String,
  email: String,
  photoURL: String,
  phone: String,
  provider: String,
  lineUserId: String,
  pictureUrl: String,
  createdAt: String,
  verificationCode: String,
});

// Models
const TreeModel = mongoose.models.Tree || mongoose.model('Tree', TreeSchema);
const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const UserProfileModel = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);

let isConnected = false;
let connectionPromise = null;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    const msg = 'MONGODB_URI is not set in environment variables. Please set it.';
    console.error(msg);
    throw new Error(msg);
  }
  
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  try {
    // Remove bufferCommands: false to let mongoose handle it natively, or keep it but rely on connectionPromise.
    // mongoose.set('bufferCommands', false); 
    
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await connectionPromise;
    isConnected = true;
    console.log('Successfully connected to MongoDB!');
  } catch (err) {
    connectionPromise = null;
    console.error('Failed to connect to MongoDB:', err);
    throw new Error('Database connection failed. Please check your IP whitelist on MongoDB Atlas and your MONGODB_URI: ' + err.message);
  }
}

export class LocalDb {
  public static async getTrees(): Promise<Tree[]> {
    await connectDB();
    const trees = await TreeModel.find().sort({ index: 1 }).lean();
    return trees as unknown as Tree[];
  }

  public static async addTree(tree: Omit<Tree, 'id' | 'index'> & { index?: number }): Promise<Tree> {
    await connectDB();
    const id = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let index = tree.index;
    
    if (!index) {
      // Find first available index starting from 100001
      const lastTree = await TreeModel.findOne().sort({ index: -1 }).lean();
      if (lastTree && lastTree.index >= 100001) {
        // Need to find gaps or just next
        const allTrees = await TreeModel.find({} as any, 'index').lean();
        const takenIndexes = new Set(allTrees.map(t => t.index));
        index = 100001;
        while (takenIndexes.has(index)) {
          index++;
        }
      } else {
        index = 100001;
      }
    }

    const newTree = new TreeModel({ ...tree, id, index });
    await newTree.save();
    return newTree.toObject() as unknown as Tree;
  }

  public static async updateTree(id: string, updates: Partial<Tree>): Promise<Tree | null> {
    await connectDB();
    const tree = await TreeModel.findOneAndUpdate({ id } as any, { $set: updates }, { new: true } as any).lean();
    return tree as unknown as Tree | null;
  }

  public static async addCareUpdate(treeId: string, update: CareUpdate): Promise<Tree | null> {
    await connectDB();
    const tree = await TreeModel.findOne({ id: treeId } as any);
    if (tree) {
      tree.careHistory.push(update);
      const height = update.height;
      if (height >= 150) tree.status = 'Mature';
      else if (height >= 100) tree.status = 'Young Tree';
      else if (height >= 50) tree.status = 'Growing';
      else tree.status = 'Seedling';
      
      tree.carbonOffset = Number((height * 0.1).toFixed(1));
      tree.height = height;
      
      await tree.save();
      return tree.toObject() as unknown as Tree;
    }
    return null;
  }

  public static async getOrders(): Promise<Order[]> {
    await connectDB();
    const orders = await OrderModel.find().lean();
    return orders as unknown as Order[];
  }

  public static async getOrder(id: string): Promise<Order | null> {
    await connectDB();
    const order = await OrderModel.findOne({ id } as any).lean();
    return order as unknown as Order | null;
  }

  public static async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'status' | 'slipVerified'> & { status?: 'Pending' | 'Paid' | 'Failed'; slipVerified?: boolean; verificationCode?: string }): Promise<Order> {
    await connectDB();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const id = `MK-${randomStr}`;
    const newOrder = new OrderModel({
      ...order,
      id,
      status: order.status || 'Pending',
      slipVerified: order.slipVerified ?? false,
      verificationCode: order.verificationCode || '',
      createdAt: new Date().toISOString()
    });
    await newOrder.save();
    return newOrder.toObject() as unknown as Order;
  }

  public static async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    await connectDB();
    const order = await OrderModel.findOneAndUpdate({ id } as any, { $set: updates }, { new: true } as any).lean();
    return order as unknown as Order | null;
  }

  public static async saveUserProfile(user: any): Promise<any> {
    if (!user || !user.uid) return user;
    await connectDB();
    const cleanUid = user.uid.replace(/[^a-zA-Z0-9_-]/g, '_');
    const updated = await UserProfileModel.findOneAndUpdate({ uid: cleanUid } as any,
      { $set: user },
      { new: true, upsert: true }
    ).lean();
    return updated;
  }
}
