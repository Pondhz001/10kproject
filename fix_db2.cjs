const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf8');

code = code.replace(
  /export async function connectDB\(\) \{[\s\S]*?console\.error\('Failed to connect to MongoDB:', err\);\n  \}/,
  `export async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) {
    const msg = 'MONGODB_URI is not set in environment variables. Please set it.';
    console.error(msg);
    throw new Error(msg);
  }
  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('Successfully connected to MongoDB!');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw new Error('Database connection failed. Please check your MONGODB_URI: ' + err.message);
  }`
);

fs.writeFileSync('src/db.ts', code);
