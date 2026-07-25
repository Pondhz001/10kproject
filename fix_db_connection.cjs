const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf8');

code = code.replace(
  /let isConnected = false;[\s\S]*?export async function connectDB\(\) \{[\s\S]*?throw new Error\('Database connection failed[\s\S]*?\}\n\}/,
  `let isConnected = false;
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
}`
);

fs.writeFileSync('src/db.ts', code);
