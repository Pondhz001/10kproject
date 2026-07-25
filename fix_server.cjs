const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

// replace the generate-qr endpoint
serverCode = serverCode.replace(
  /app\.post\('\/api\/payment\/generate-qr'[\s\S]*?\}\);/m,
  `app.post('/api/payment/generate-qr', async (req, res) => {
    try {
      const { amount, orderId } = req.body;
      const targetAmount = Number(amount) || 100;
      
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
  });`
);

// fix the PORT type
serverCode = serverCode.replace(
  "const PORT = process.env.PORT || 3000;",
  "const PORT = Number(process.env.PORT) || 3000;"
);

// remove the PromptPay functions
serverCode = serverCode.replace(/function crc16[\s\S]*?return rawPayload \+ crc;\n\}/m, '');
serverCode = serverCode.replace(/function generatePromptPayPayload[\s\S]*?return rawPayload \+ crc;\n\}/m, '');

fs.writeFileSync('server.ts', serverCode);
