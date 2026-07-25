const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf8');

code = code.replace(
  /if \(!process\.env\.MONGODB_URI\) \{[\s\S]*?return;[\s\S]*?\}/,
  `if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables');
    throw new Error('MONGODB_URI is not set in environment variables. Please set it in your .env file or host environment.');
  }`
);

code = code.replace(
  /await mongoose\.connect\(process\.env\.MONGODB_URI\);/,
  `await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });`
);

fs.writeFileSync('src/db.ts', code);
