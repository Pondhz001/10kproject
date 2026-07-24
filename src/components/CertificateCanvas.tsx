import React, { useEffect, useRef } from 'react';
import { Download, Sparkles, Printer } from 'lucide-react';

interface CertificateCanvasProps {
  donorName: string;
  treeCount: number;
  selectedTreeIndexes?: number[];
  dateString?: string;
  onClose?: () => void;
}

export default function CertificateCanvas({ donorName, treeCount, selectedTreeIndexes = [], dateString, onClose }: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 800;

    // Reset and clear canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw elegant background gradient / color
    ctx.fillStyle = '#fafaf9'; // stone-50 warm off-white
    ctx.fillRect(0, 0, width, height);

    // Draw subtle radial pattern or watermark
    ctx.fillStyle = '#eae7e2';
    for (let x = 60; x < width - 60; x += 30) {
      for (let y = 60; y < height - 60; y += 30) {
        if ((x + y) % 60 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw border
    const goldColor = '#d4af37';
    const darkGreenColor = '#0c3b24';
    const textGrayColor = '#4b5563';

    // Outer double border
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(32, 32, width - 64, height - 64);

    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Draw elegant corner decorations
    const drawCornerDecoration = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = goldColor;
      // Draw a small decorative gold corner block
      ctx.fillRect(-15, -15, 30, 4);
      ctx.fillRect(-15, -15, 4, 30);
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCornerDecoration(40, 40, 0);
    drawCornerDecoration(width - 40, 40, Math.PI / 2);
    drawCornerDecoration(width - 40, height - 40, Math.PI);
    drawCornerDecoration(40, height - 40, -Math.PI / 2);

    // 3. Write Texts & Draw Logo
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw Brand Logo Image
    const img = new Image();
    img.src = '/logo.svg';
    img.onload = () => {
      ctx.drawImage(img, width / 2 - 40, 50, 80, 72);
    };

    // Header Title
    ctx.fillStyle = darkGreenColor;
    ctx.font = "bold 44px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText('ใบประกาศเกียรติคุณ', width / 2, 145);

    // Campaign text
    ctx.fillStyle = goldColor;
    ctx.font = "bold 24px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText('โครงการหมื่นกล้าป่าเขียว (10K Forest Initiative)', width / 2, 195);

    // Gold decorative line
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 220, 220);
    ctx.lineTo(width / 2 + 220, 220);
    ctx.stroke();

    // Body prefix
    ctx.fillStyle = textGrayColor;
    ctx.font = "20px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText('ใบประกาศฉบับนี้ให้ไว้เพื่อแสดงว่า', width / 2, 270);

    // Donor Name (Large, prominent and bold)
    ctx.fillStyle = '#0a5c36';
    ctx.font = "bold 42px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText(`คุณ ${donorName || 'ผู้ร่วมอุทกภัยกล้าไม้'}`, width / 2, 335);

    // Purpose text
    ctx.fillStyle = textGrayColor;
    ctx.font = "20px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText('ได้มีเจตนารมณ์อันประเสริฐในการร่วมสนับสนุนและอุปถัมภ์กล้าไม้', width / 2, 405);

    // Tree count and species (Bold)
    ctx.fillStyle = '#0d2b1a';
    ctx.font = "bold 25px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText(`"กล้าไม้สัก (Teak Wood)" เป็นจำนวน ${treeCount} ต้น`, width / 2, 460);

    // Selected Tree Indices
    const idsString = selectedTreeIndexes.length > 0 
      ? selectedTreeIndexes.map(idx => `#MK-${idx}`).join(', ')
      : 'จัดสรรอัตโนมัติ';
    ctx.fillStyle = goldColor;
    ctx.font = "bold 21px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText(`รหัสประจำต้นกล้าสลักชื่อเลเซอร์: ${idsString}`, width / 2, 515);

    // Location
    ctx.fillStyle = textGrayColor;
    ctx.font = "19px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText('ณ สำนักวิปัสสนาทางสายเอก หลวงปู่มั่น ดอยนางเมาะ จ.เชียงใหม่', width / 2, 565);

    // Blessing text (Traditional Thai blessing)
    ctx.fillStyle = '#555555';
    ctx.font = "italic 16px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText('ขออำนาจคุณพระศรีรัตนตรัยและสิ่งศักดิ์สิทธิ์ ดลบันดาลให้ท่านและครอบครัวเจริญด้วยอายุ วรรณะ สุขะ พละ และปฏิภาณธนสารสมบัติสืบไป', width / 2, 625);

    // Horizontal separator
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 665);
    ctx.lineTo(width - 150, 665);
    ctx.stroke();

    // 4. Draw Signature Section (Left Side)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    ctx.font = "14px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillText('ลงชื่อ ..............................................................', 170, 715);

    // Dynamic hand-drawn bezier signature
    ctx.save();
    ctx.strokeStyle = '#1e3a8a'; // Deep navy blue ink
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(210, 710);
    ctx.bezierCurveTo(230, 680, 260, 720, 280, 685);
    ctx.bezierCurveTo(300, 665, 310, 710, 330, 695);
    ctx.stroke();
    ctx.restore();

    ctx.font = "bold 15px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillStyle = '#374151';
    ctx.fillText('คณะผู้ดำเนินงานจัดตั้งแคมเปญรักษ์ป่า', 170, 745);
    ctx.font = "13px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('โครงการหมื่นกล้าป่าเขียว จ.เชียงใหม่', 170, 765);

    // 5. Draw Date and Cert ID Section (Right Side)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#374151';
    ctx.font = "bold 15px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    const displayDate = dateString || new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`ให้ไว้ ณ วันที่ ${displayDate}`, width - 170, 715);

    ctx.font = "13px 'Thonburi', 'Sarabun', 'Georgia', 'Arial', sans-serif";
    ctx.fillStyle = '#9ca3af';
    // Consistent reproducible hash for Certificate Number
    const certNum = Math.floor(100000 + Math.random() * 900000);
    ctx.fillText(`เลขที่ใบประกาศ: CERT-10K-${certNum}`, width - 170, 745);

    // 6. Draw Official Golden/Green Seal (Centered at bottom)
    const sealX = width / 2;
    const sealY = 715;

    ctx.save();
    // Seal Outer Gold Circle
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 45, 0, Math.PI * 2);
    ctx.stroke();

    // Seal Inner Solid Dark Green Fill
    ctx.fillStyle = darkGreenColor;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 41, 0, Math.PI * 2);
    ctx.fill();

    // Seal Inner Thin Gold Circle
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 36, 0, Math.PI * 2);
    ctx.stroke();

    // Seal Text
    ctx.fillStyle = goldColor;
    ctx.font = "bold 10px 'Thonburi', 'Sarabun', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('หมื่นกล้า', sealX, sealY - 8);
    ctx.fillText('ป่าเขียว', sealX, sealY + 8);
    ctx.restore();
  };

  useEffect(() => {
    // Small delay to ensure any custom fonts can load, then draw
    const timer = setTimeout(() => {
      drawCertificate();
    }, 100);
    return () => clearTimeout(timer);
  }, [donorName, treeCount, selectedTreeIndexes, dateString]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = `ใบประกาศคุณความดี_คุณ_${donorName || 'ผู้สนับสนุน'}_โครงการหมื่นกล้าป่าเขียว.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download image from canvas:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Canvas container with scaling */}
      <div className="relative w-full bg-stone-100 rounded-2xl overflow-hidden p-2 border border-stone-300/30 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="w-full aspect-[3/2] h-auto max-w-full rounded-xl shadow-lg border border-stone-200 bg-stone-50"
          id="certificate-canvas-element"
        />
      </div>

      {/* Operation actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleDownload}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          id="btn-download-cert"
        >
          <Download className="w-4.5 h-4.5" />
          ดาวน์โหลดเกียรติบัตร (.PNG)
        </button>

        <button
          onClick={() => window.print()}
          className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm rounded-xl transition border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
          id="btn-print-cert"
        >
          <Printer className="w-4.5 h-4.5" />
          พิมพ์เกียรติบัตร / บันทึก PDF
        </button>
      </div>
    </div>
  );
}
