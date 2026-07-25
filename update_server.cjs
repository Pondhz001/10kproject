const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Replace imports
serverCode = serverCode.replace(
  "import QRCode from 'qrcode';\nimport { LocalDb } from './src/db';",
  "import { LocalDb, connectDB } from './src/db';"
);

// Remove PromptPay functions
serverCode = serverCode.replace(/function crc16[\s\S]*?function generatePromptPayPayload[\s\S]*?return rawPayload \+ crc;\n}\n/m, '');

// Add connectDB call
serverCode = serverCode.replace(
  "app.use(express.json({ limit: '50mb' }));",
  "app.use(express.json({ limit: '50mb' }));\n\n  // Connect to DB\n  await connectDB();"
);

// Replace /api/payment/qr
const qrCodeEndpointReplacement = `  app.post('/api/payment/qr', async (req, res) => {
    try {
      const { amount, orderId } = req.body;
      const targetAmount = amount || 100; // default 100 for 1 tree
      
      if (targetAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }

      const qrImageUrl = '/payment-qr.jpg';

      res.json({
        success: true,
        amount: targetAmount,
        orderId: orderId || null,
        payload: 'static-qr',
        qrImageUrl
      });
    } catch (e) {
      console.error('Error generating QR Code:', e);
      res.status(500).json({ error: 'ไม่สามารถสร้าง QR Code สำหรับชำระเงินได้' });
    }
  });`;

serverCode = serverCode.replace(/app\.post\('\/api\/payment\/qr'[\s\S]*?\}\);/m, qrCodeEndpointReplacement);

fs.writeFileSync('server.ts', serverCode);
console.log('server.ts updated');
