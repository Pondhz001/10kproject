import React, { useState, useRef } from 'react';
import { Tree, Order } from '../types';
import { ShoppingBag, QrCode, UploadCloud, FileImage, ShieldCheck, HelpCircle, CheckCircle, Trees, Loader2, Sparkles, Download, LogIn, LogOut, ExternalLink, HardDrive, Building2, UserCheck, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initAuth, googleSignIn, logout, uploadCertificateToDrive } from '../lib/firebase';
import { lineSignIn, getSavedLineUser, lineLogout } from '../lib/lineAuth';

interface PlantingPortalProps {
  onOrderCompleted: (order: Order, newTrees: Tree[]) => void;
  preSelectedTreeIndex?: number | null;
  setPreSelectedTreeIndex?: (index: number | null) => void;
  preSelectedTreeIndexes?: number[];
  setPreSelectedTreeIndexes?: (indexes: number[]) => void;
  trees: Tree[];
  initialMemberMode?: boolean;
  isAdmin?: boolean;
}

// CRC16 CCITT Standard for Thai PromptPay QR Code
function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    const charCode = str.charCodeAt(c);
    let x = ((crc >> 8) ^ charCode) & 0xFF;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Generate PromptPay EMVCo Payload
function generatePromptPayPayload(amount: number, phoneNumber: string = '0817960622'): string {
  const targetPP = phoneNumber.startsWith('0') 
    ? `0066${phoneNumber.substring(1)}` 
    : phoneNumber;
  
  // Account Info Field
  const accountInfo = `0016A0000006770101110113${targetPP}`;
  const merchantField = `29${accountInfo.length}${accountInfo}`;
  
  // Amount Field
  const amountStr = Number(amount).toFixed(2);
  const amountField = `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  
  // Construct baseline payload
  let payload = `000201010211${merchantField}5303764${amountField}5802TH6304`;
  const checksum = crc16(payload);
  return payload + checksum;
}

export default function PlantingPortal({
  onOrderCompleted,
  preSelectedTreeIndex,
  setPreSelectedTreeIndex,
  preSelectedTreeIndexes,
  setPreSelectedTreeIndexes,
  trees,
  initialMemberMode = false,
  isAdmin = false
}: PlantingPortalProps) {
  // Google Drive & Member Authentication State
  const [isMemberMode, setIsMemberMode] = useState(!isAdmin ? true : initialMemberMode);

  React.useEffect(() => {
    if (!isAdmin) {
      setIsMemberMode(true);
    } else {
      setIsMemberMode(initialMemberMode);
    }
  }, [initialMemberMode, isAdmin]);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [backupToDrive, setBackupToDrive] = useState(true);

  React.useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setVerifyError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setIsMemberMode(true); // Auto switch to member mode on login
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setVerifyError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้: ' + (err.message || ''));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setIsMemberMode(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // LINE Login State
  const [lineUser, setLineUser] = useState<any>(getSavedLineUser());

  const handleLineLogin = async () => {
    setIsLoggingIn(true);
    setVerifyError(null);
    try {
      const lineProfile = await lineSignIn({
        displayName: donorName.trim() ? donorName : 'ผู้ร่วมปลูก LINE',
        phone: donorPhone
      });
      setLineUser(lineProfile);
      setUser(lineProfile);
    } catch (err: any) {
      console.error('LINE login failed:', err);
      setVerifyError('ไม่สามารถเข้าสู่ระบบด้วย LINE ได้: ' + (err.message || ''));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLineLogout = () => {
    lineLogout();
    setLineUser(null);
    if (user?.provider === 'line') setUser(null);
  };

  // Order Form State
  const [donorName, setDonorName] = useState('');
  const [donorOrganization, setDonorOrganization] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [treeCount, setTreeCount] = useState(1);
  const [useSeparateNames, setUseSeparateNames] = useState(false);
  const [separateNames, setSeparateNames] = useState<string[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [donorNameError, setDonorNameError] = useState(false);
  const [donorPhoneError, setDonorPhoneError] = useState(false);

  // Post payment modal prompt
  const [postPaymentPrompt, setPostPaymentPrompt] = useState<{ order: Order; newTrees: Tree[] } | null>(null);

  // Sync separateNames length with treeCount
  React.useEffect(() => {
    setSeparateNames(prev => {
      const arr = [...prev];
      if (arr.length < treeCount) {
        while (arr.length < treeCount) {
          arr.push('');
        }
      } else if (arr.length > treeCount) {
        arr.length = treeCount;
      }
      return arr;
    });
  }, [treeCount]);

  // Seedling Number Selector State
  const [selectedStartIndex, setSelectedStartIndex] = useState<number>(100001);
  const [manualIndexInput, setManualIndexInput] = useState('');
  const [manualInputError, setManualInputError] = useState<string | null>(null);

  // Pre-calculate taken indexes
  const takenIndexes = React.useMemo(() => new Set(trees.map(t => t.index)), [trees]);

  // First available starting index
  const firstAvailableIndex = React.useMemo(() => {
    let current = 100001;
    while (takenIndexes.has(current)) {
      current++;
    }
    return current;
  }, [takenIndexes]);

  // Sync starting index if preSelectedTreeIndex or preSelectedTreeIndexes changes
  React.useEffect(() => {
    if (preSelectedTreeIndexes && preSelectedTreeIndexes.length > 0) {
      setTreeCount(preSelectedTreeIndexes.length);
      setSelectedStartIndex(preSelectedTreeIndexes[0]);
    } else if (preSelectedTreeIndex) {
      setSelectedStartIndex(preSelectedTreeIndex);
      setManualIndexInput(String(preSelectedTreeIndex));
    } else {
      setSelectedStartIndex(firstAvailableIndex);
      setManualIndexInput('');
    }
  }, [preSelectedTreeIndex, preSelectedTreeIndexes, firstAvailableIndex]);

  // Helper to assign count consecutive available indexes
  const getAssignedIndexes = (start: number, count: number, taken: Set<number>) => {
    const assigned: number[] = [];
    let current = start;
    while (assigned.length < count && current <= 110000) {
      if (!taken.has(current)) {
        assigned.push(current);
      }
      current++;
    }
    return assigned;
  };

  // Currently assigned indexes for the order
  const assignedIndexes = React.useMemo(() => {
    if (preSelectedTreeIndexes && preSelectedTreeIndexes.length > 0) {
      return preSelectedTreeIndexes;
    }
    return getAssignedIndexes(selectedStartIndex, treeCount, takenIndexes);
  }, [preSelectedTreeIndexes, selectedStartIndex, treeCount, takenIndexes]);

  // Generate list of 100 available seedling choices
  const availableChoices = React.useMemo(() => {
    const choices: number[] = [];
    let current = 100001;
    if (preSelectedTreeIndex && !takenIndexes.has(preSelectedTreeIndex)) {
      choices.push(preSelectedTreeIndex);
    }
    while (choices.length < 100 && current <= 110000) {
      if (!takenIndexes.has(current) && current !== preSelectedTreeIndex) {
        choices.push(current);
      }
      current++;
    }
    return choices.sort((a, b) => a - b);
  }, [takenIndexes, preSelectedTreeIndex]);

  // Handler for manual seedling input
  const handleManualIndexChange = (val: string) => {
    setManualIndexInput(val);
    if (!val) {
      setManualInputError(null);
      setSelectedStartIndex(firstAvailableIndex);
      return;
    }

    const num = parseInt(val);
    if (isNaN(num) || num < 100001 || num > 110000) {
      setManualInputError('รหัสต้องอยู่ระหว่าง 100001 - 110000');
    } else if (takenIndexes.has(num)) {
      setManualInputError(`หมายเลข #${num} มีผู้ร่วมปลูกแล้ว`);
    } else {
      setManualInputError(null);
      setSelectedStartIndex(num);
    }
  };
  
  // Current Order Session State
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  // File Slip Upload State
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifyingSlip, setIsVerifyingSlip] = useState(false);
  const [verifyStep, setVerifyStep] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let currentUser = user;
    if (!currentUser) {
      try {
        const { anonymousSignIn } = await import('../lib/firebase');
        const anonUser = await anonymousSignIn();
        if (anonUser) {
          currentUser = anonUser;
          setUser(anonUser);
        } else {
          setVerifyError('ไม่สามารถเริ่มการเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง');
          return;
        }
      } catch (err) {
        setVerifyError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบนิรนาม กรุณาเข้าสู่ระบบด้วย Google');
        return;
      }
    }

    let hasError = false;
    if (!donorName.trim()) {
      setDonorNameError(true);
      hasError = true;
    } else {
      setDonorNameError(false);
    }

    if (!donorPhone.trim()) {
      setDonorPhoneError(true);
      hasError = true;
    } else {
      setDonorPhoneError(false);
    }

    if (manualInputError) {
      setVerifyError(manualInputError);
      return;
    }

    if (hasError) {
      setVerifyError('กรุณากรอกข้อมูลผู้ร่วมปลูกและเบอร์โทรศัพท์ให้ครบถ้วนก่อนร่วมปลูก');
      return;
    }

    setIsSubmittingOrder(true);
    setVerifyError(null);

    const finalTreeNames = useSeparateNames 
      ? separateNames.map((name, i) => name.trim() || `${donorName} (ต้นที่ ${i + 1})`)
      : Array(treeCount).fill(donorName);

    try {
      const response = await fetch('/api/forest/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName,
          organization: donorOrganization,
          donorOrganization,
          donorPhone,
          treeCount,
          selectedTreeIndexes: assignedIndexes,
          treeNames: finalTreeNames,
          userId: currentUser?.uid || ''
        })
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถบันทึกข้อมูลร่วมปลูกได้');
      }

      const responseData = await response.json();
      if (responseData.order) {
        setActiveOrder(responseData.order);
      } else {
        throw new Error('ไม่สามารถสร้างรายการร่วมปลูกได้');
      }
    } catch (err: any) {
      setVerifyError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setVerifyError(null);
    } else {
      setVerifyError('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ (JPG, PNG) เท่านั้น');
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Slip Verify handler (communicating with our full-stack slip2go + Gemini backend)
  const handleVerifySlip = async () => {
    if (!activeOrder || !uploadedFile) return;

    setIsVerifyingSlip(true);
    setVerifyError(null);
    
    // Simulate real steps for visually stunning UI progress
    const steps = [
      'เชื่อมต่อระบบตรวจสอบสลิป slip2go...',
      'กำลังอ่านข้อมูลและวิเคราะห์ QR Code สลิป...',
      'ตรวจสอบยอดเงินโอนและธนาคารคู่ค้าคู่สัญญา...',
      'จับคู่รหัสร่วมปลูกและลงทะเบียนกล้าไม้สัก...'
    ];

    let currentStepIdx = 0;
    setVerifyStep(steps[0]);

    const stepTimer = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        setVerifyStep(steps[currentStepIdx]);
      }
    }, 1200);

    try {
      const base64Image = await fileToBase64(uploadedFile);
      
      const response = await fetch('/api/verify-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          slipImage: base64Image
        })
      });

      clearInterval(stepTimer);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'การตรวจสอบสลิปล้มเหลว ยอดเงินไม่ตรงหรือสลิปไม่ถูกต้อง');
      }

      setVerifyStep('ยืนยันความถูกต้องและสลักข้อมูลปลูกแล้ว!');

      let isUploaded = false;
      if (isMemberMode && accessToken && backupToDrive) {
        setVerifyStep('กำลังอัปโหลดใบรับรองลง Google Drive ของคุณ...');
        try {
          await uploadCertificateToDrive(
            accessToken,
            result.order.donorName,
            result.order.treeCount,
            result.order.selectedTreeIndexes || [],
            result.order.amount,
            result.order.id
          );
          isUploaded = true;
          setVerifyStep('อัปโหลดใบรับรองลง Google Drive เรียบร้อยแล้ว! 🌲✨');
        } catch (driveErr) {
          console.error('Drive upload failed:', driveErr);
        }
      }

      setTimeout(() => {
        if (!user) {
          setPostPaymentPrompt({ order: result.order, newTrees: result.newTrees });
        } else {
          onOrderCompleted(result.order, result.newTrees);
        }
        // Reset states
        setActiveOrder(null);
        setUploadedFile(null);
        setPreviewUrl(null);
        setIsVerifyingSlip(false);
      }, isUploaded ? 2000 : 1000);

    } catch (err: any) {
      clearInterval(stepTimer);
      setVerifyError(err.message || 'การตรวจสอบสลิปล้มเหลว กรุณาตรวจสอบยอดเงินโอนและอัปโหลดไฟล์รูปสลิปอีกครั้ง');
      setIsVerifyingSlip(false);
    }
  };

  // Generate PromptPay String for amount
  const promptPayString = activeOrder ? generatePromptPayPayload(activeOrder.amount) : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(promptPayString)}`;

  const handleDownloadQR = async () => {
    if (!qrCodeUrl) return;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `muenkla-promptpay-${activeOrder ? activeOrder.amount : 100}thb.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download QR code image directly, opening in new tab:', err);
      window.open(qrCodeUrl, '_blank');
    }
  };

  return (
    <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 lg:p-8 shadow-sm max-w-4xl mx-auto" id="planting-portal">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-950/5 rounded-full blur-3xl pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {!activeOrder ? (
          // STEP 1: Buy / Order Form
          <motion.div
            key="order-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-8"
          >
            {/* Project Campaign Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.svg" alt="10K Logo" className="w-12 h-12 object-contain filter drop-shadow-xs" />
                  <div>
                    <span className="bg-amber-50 text-amber-800 border border-amber-200/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Campaign 2026
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-black text-emerald-950 tracking-tight leading-tight">
                      10K หมื่นกล้าป่าเขียว
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  ร่วมลงทะเบียนบันทึกข้อมูลกล้าไม้สักคุณภาพสายพันธุ์ดีจำนวน 10,000 ต้น และจัดทำป้ายแทรกปักประจำต้นสัก เพื่อร่วมฟื้นฟูระบบนิเวศน์ผืนป่าต้นน้ำแม่ยม พร้อมระบบติดตามรายงานการดูแลรายต้นแบบตลอดชีวิต
                </p>
              </div>

              {/* Perks List */}
              <div className="space-y-3 border-t border-stone-200 pt-4 text-xs text-stone-700">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 bg-emerald-50 text-emerald-700 rounded-lg mt-0.5 border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-stone-800">สายพันธุ์คัดพิเศษ ไม้สัก</strong>
                    <p className="text-stone-500 mt-0.5 font-medium">คัดสรรกล้าไม้สักที่แข็งแรงสมบูรณ์สูงสุด มีอัตราการรอดชีวิตสูงกว่า 95%</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 bg-emerald-50 text-emerald-700 rounded-lg mt-0.5 border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-stone-800">สลักหมายเลขกล้าสัก & ติดป้ายแทรกชื่อคุณ</strong>
                    <p className="text-stone-500 mt-0.5 font-medium">ทุกต้นจะได้รับหมายเลขและติดตั้งป้ายแทรกสลักชื่อผู้ร่วมปลูก สามารถติดตามดูความสูงและภาพถ่ายได้ตลอดเวลา</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 bg-emerald-50 text-emerald-700 rounded-lg mt-0.5 border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-stone-800">ดูแลถางหญ้าใส่ปุ๋ยบำรุง 1 ปี</strong>
                    <p className="text-stone-500 mt-0.5 font-medium">ทีมเจ้าหน้าที่ป่าไม้และชุมชนท้องถิ่น คอยดูแลตัดวัชพืช รดน้ำ ใส่ปุ๋ยอินทรีย์ ป้องกันไฟป่า ให้ต้นกล้าเติบโตอย่างปลอดภัย</p>
                  </div>
                </div>
              </div>

              {/* Campaign Info Tag */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-150 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] text-stone-500 font-mono">โครงการร่วมปลูกและลงทะเบียน</p>
                  <p className="text-xs text-amber-700 font-bold">บันทึกข้อมูลกล้าในโครงการและป้ายแทรก</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-stone-900 font-mono">ฟรี</p>
                  <p className="text-[10px] text-stone-500 font-medium">สมทบทุนจัดสรรเรียบร้อย</p>
                </div>
              </div>
            </div>

            {/* Registration Form / Information Card */}
            <form onSubmit={handleCreateOrder} className="md:col-span-3 bg-emerald-50/25 p-6 rounded-3xl border border-emerald-900/5 space-y-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Trees className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-stone-800">ข้อมูลผู้รับใบประกาศเกียรติคุณ</h3>
                </div>

                {/* Mode Selector */}
                {isAdmin ? (
                  <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl border border-stone-200 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setIsMemberMode(false)}
                      className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${!isMemberMode ? 'bg-white text-emerald-850 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      🌱 บันทึกปลูกแอดมิน (ฟรี)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMemberMode(true)}
                      className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${isMemberMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-500 hover:text-emerald-700'}`}
                    >
                      👑 สำหรับสมาชิก (100฿)
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>คุณกำลังทำรายการในฐานะ สมาชิกโครงการ (โหมดพรีเมียม 100฿)</span>
                  </div>
                )}

                {isMemberMode && (
                  <div className="space-y-3 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 p-4 rounded-2xl border border-emerald-500/10 shadow-sm text-left">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>โหมดสมาชิก (Member Joint Planting)</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-normal">
                      สลักชื่อของคุณบนป้ายพิเศษ ได้รับสิทธิ์ดูแลต้นไม้แบบพรีเมียม พร้อมระบบสำรองไฟล์ใบรับรองลง Google Drive อัตโนมัติเมื่อทำรายการเสร็จสิ้น
                    </p>
                    
                    {!user ? (
                      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={isLoggingIn}
                          onClick={handleGoogleLogin}
                          className="w-full py-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-60 cursor-pointer"
                        >
                          {isLoggingIn ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          ) : (
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                          )}
                          <span>Google Login</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLoggingIn}
                          onClick={handleLineLogin}
                          className="w-full py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-60 cursor-pointer border-none"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>LINE Login</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between p-3 bg-white border border-emerald-900/10 rounded-xl">
                          <div className="flex items-center gap-2.5">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-emerald-600/20" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">
                                {user.displayName ? user.displayName.substring(0, 1) : 'U'}
                              </div>
                            )}
                            <div className="text-left">
                              <p className="text-xs font-bold text-stone-800 leading-none mb-0.5">{user.displayName}</p>
                              <p className="text-[10px] text-stone-450 font-mono leading-none">{user.email || 'LINE Account'}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={user.provider === 'line' ? handleLineLogout : handleGoogleLogout}
                            className="text-[10px] text-red-650 hover:text-red-700 font-bold underline cursor-pointer transition"
                          >
                            ออกจากระบบ
                          </button>
                        </div>
                        
                        {/* Backup Toggle */}
                        {user.provider === 'google' && (
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={backupToDrive}
                              onChange={(e) => setBackupToDrive(e.target.checked)}
                              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                            />
                            <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                              สำรองไฟล์ใบรับรองลง Google Drive โดยอัตโนมัติ
                            </span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Form Fields: Donor name */}
                <div className="space-y-1">
                  <label className="text-xs text-stone-500 font-semibold">ชื่อผู้ร่วมปลูก (สลักป้ายและใบประกาศ)</label>
                  <input
                    type="text"
                    placeholder="ระบุชื่อจริงหรือชื่อของคุณ..."
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className={`w-full bg-white border ${donorNameError ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition`}
                  />
                  {donorNameError && (
                    <p className="text-[10px] text-red-600">กรุณาระบุชื่อผู้ร่วมปลูกเพื่อสลักป้าย</p>
                  )}
                </div>

                {/* Form Fields: Donor Organization (New) */}
                <div className="space-y-1">
                  <label className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>องค์กร / บริษัท / ชุมชน <span className="text-stone-400 font-normal">(ถ้ามี)</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="ระบุชื่อองค์กร บริษัท หรือหน่วยงาน..."
                    value={donorOrganization}
                    onChange={(e) => setDonorOrganization(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                {/* Form Fields: Contact info */}
                <div className="space-y-1">
                  <label className="text-xs text-stone-500 font-semibold">ช่องทางการติดต่อ (เบอร์โทรศัพท์)</label>
                  <input
                    type="tel"
                    placeholder="เบอร์โทรศัพท์สำหรับการจัดส่งรายงาน..."
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className={`w-full bg-white border ${donorPhoneError ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition`}
                  />
                  {donorPhoneError && (
                    <p className="text-[10px] text-red-600">กรุณาระบุช่องทางการติดต่อสำหรับรับใบประกาศ/รายงาน</p>
                  )}
                </div>

                {/* 17 ร่วมปลูก option: Custom Individual Names per Seedling */}
                {treeCount > 1 && (
                  <div className="bg-white border border-emerald-900/10 rounded-2xl p-4 space-y-3 shadow-sm transition text-left">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ฟีเจอร์ผู้ร่วมปลูกหลายคน
                        </span>
                        <h4 className="text-xs font-bold text-stone-800 mt-1">กำหนดรายชื่อปลูกแยกรายต้น</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={useSeparateNames}
                          onChange={(e) => setUseSeparateNames(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <p className="text-[10px] text-stone-500 leading-normal">
                      กรณีระดมทุนอุปถัมภ์ร่วมกันในครอบครัวหรือกลุ่มเพื่อน คุณสามารถระบุชื่อที่สลักลงบนป้ายอลูมิเนียมของแต่ละต้นแยกกันได้เลยครับ (เช่น phong ปลูก 3 ต้น ระบุชื่อ phong, พรพรรณ, มงคล)
                    </p>

                    <AnimatePresence>
                      {useSeparateNames && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 pt-2 border-t border-stone-100 overflow-hidden"
                        >
                          <span className="text-[10px] font-bold text-stone-400 block uppercase">รายชื่อสำหรับสลักบนต้นไม้สักแต่ละต้น:</span>
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {assignedIndexes.map((idx, index) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                                  #{idx}
                                </span>
                                <input
                                  type="text"
                                  placeholder={`ระบุชื่อผู้ปลูกต้นที่ ${index + 1} (หากว่างจะใช้ชื่อ ${donorName || 'หลัก'})`}
                                  value={separateNames[index] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSeparateNames(prev => {
                                      const arr = [...prev];
                                      arr[index] = val;
                                      return arr;
                                    });
                                  }}
                                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition"
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Dynamic seedling selector depending on table selection */}
                {preSelectedTreeIndexes && preSelectedTreeIndexes.length > 0 ? (
                  // Customized display for pre-selected multiple seedlings
                  <div className="space-y-3 bg-amber-50/60 border border-amber-100 rounded-xl p-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-stone-500 font-semibold">จำนวนที่ร่วมปลูก:</span>
                      <span className="text-sm font-black text-amber-700 font-mono">{preSelectedTreeIndexes.length} ต้น</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-500 uppercase font-mono block">หมายเลขกล้าที่ท่านเลือกจากตาราง:</span>
                      <div className="flex flex-wrap gap-1 mt-1.5 max-h-[110px] overflow-y-auto">
                        {preSelectedTreeIndexes.sort((a, b) => a - b).map((idx) => (
                          <span key={idx} className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                            #{idx}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                      <span className="text-[10px] text-stone-500">หากต้องการเปลี่ยนกล้า สามารถล้างเพื่อสุ่มได้</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPreSelectedTreeIndexes?.([]);
                          setTreeCount(1);
                        }}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold underline transition"
                      >
                        เปลี่ยนเป็นแบบสุ่ม/ระบุเลขเอง
                      </button>
                    </div>
                  </div>
                ) : (
                  // Original selectors for quantity and single start index
                  <>
                    {/* Tree Counter selector */}
                    <div className="space-y-1">
                      <label className="text-xs text-stone-500 font-semibold block">จำนวนที่อยากปลูก</label>
                      <select
                        value={treeCount}
                        onChange={(e) => setTreeCount(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-600 transition cursor-pointer"
                      >
                        <option value={1}>1 ต้น</option>
                        <option value={2}>2 ต้น</option>
                        <option value={3}>3 ต้น</option>
                        <option value={5}>5 ต้น</option>
                        <option value={10}>10 ต้น</option>
                        <option value={20}>20 ต้น</option>
                        <option value={50}>50 ต้น</option>
                        <option value={100}>100 ต้น</option>
                      </select>
                    </div>

                    {/* Seedling Number range selector */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-stone-500 font-semibold">ระบุหมายเลขกล้าไม้สักที่ต้องการ (100001-110000)</label>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-6">
                          <select
                            value={selectedStartIndex}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSelectedStartIndex(val);
                              setManualIndexInput(String(val));
                            }}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 transition font-mono cursor-pointer"
                          >
                            {availableChoices.map((idx) => (
                              <option key={idx} value={idx}>
                                กล้าสัก #{idx}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-6">
                          <input
                            type="text"
                            placeholder="ระบุเลขอื่นเอง..."
                            value={manualIndexInput}
                            onChange={(e) => handleManualIndexChange(e.target.value)}
                            className={`w-full bg-white border ${manualInputError ? 'border-red-500' : 'border-stone-200'} rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition font-mono`}
                          />
                        </div>
                      </div>

                      {manualInputError && (
                        <p className="text-[10px] text-red-600 mt-1">{manualInputError}</p>
                      )}

                      {/* Seedling Selection Preview Card */}
                      <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 mt-1.5">
                        <span className="text-[10px] text-stone-500 uppercase font-mono block">หมายเลขกล้าที่จะได้รับการปลูก ({assignedIndexes.length} ต้น):</span>
                        <div className="flex flex-wrap gap-1 mt-1.5 max-h-[80px] overflow-y-auto">
                          {assignedIndexes.map((idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                              #{idx}
                            </span>
                          ))}
                        </div>
                        {assignedIndexes.length < treeCount && (
                          <p className="text-[9px] text-stone-500 mt-1">
                            * ระบบสุ่มและจัดสรรกล้าที่ว่างให้ครบถ้วนตามความต้องการร่วมปลูกของคุณ
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Panel */}
              <div className="pt-4 border-t border-stone-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] text-stone-500 font-mono">
                      {isMemberMode ? 'สมทบทุนช่วยปลูกโครงการพรีเมียม' : 'ลงทะเบียนป้ายแทรกฟรี'}
                    </p>
                    <p className="text-xs text-emerald-700 font-bold">
                      {isMemberMode ? `ยอดชำระร่วมปลูก: ${treeCount * 100} บาท` : `สลักชื่อ: ${donorName || 'ผู้ร่วมปลูก'}`}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        กำลังบันทึกข้อมูล...
                      </>
                    ) : (
                      <>
                        {isMemberMode ? (
                          <>
                            <QrCode className="w-4 h-4" />
                            <span>ชำระเงินร่วมปลูก ({treeCount * 100}฿)</span>
                          </>
                        ) : (
                          <>
                            <Trees className="w-4 h-4" />
                            <span>บันทึกข้อมูลร่วมปลูก (ฟรี)</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>

                {verifyError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {verifyError}
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        ) : (
          // STEP 2: QR Code Scan Pay & Verification (Styled for Light-Green Theme)
          <motion.div
            key="scan-pay"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* PP QR Code Container */}
            <div className="md:col-span-5 flex flex-col items-center text-center space-y-4">
              <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
                <button
                  onClick={handleDownloadQR}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด QR Code พร้อมเพย์ (ระบุยอดเงิน)
                </button>
                <a
                  href="https://drive.google.com/file/d/1nLuLa-CAGaE4zW-JJdM5LwwH-UAxlEbn/view?usp=drivesdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-center no-underline border-none"
                >
                  <ExternalLink className="w-4 h-4" />
                  เปิดบัญชีรับเงิน QR จาก Google Drive
                </a>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-200 inline-block relative overflow-hidden">
                {/* PromptPay Standard Logo banner mockup */}
                <div className="bg-[#002f6c] text-white py-1 px-3 rounded-lg text-[9px] font-bold tracking-wider uppercase mb-3 flex items-center justify-center gap-1">
                  <span className="text-[#00ffcc]">●</span> PROMPTPAY / พร้อมเพย์
                </div>
                
                <img
                  src={qrCodeUrl}
                  alt="PromptPay QR Code"
                  className="w-48 h-48 mx-auto"
                  referrerPolicy="no-referrer"
                />

                <p className="text-[10px] text-stone-500 font-mono mt-3">
                  สแกนจ่ายได้ด้วยทุกแอปธนาคารไทย (QR Thai Standard)
                </p>
              </div>

              {/* PromptPay Account Details Card */}
              <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 text-left space-y-2 w-full max-w-sm mx-auto shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-medium">ช่องทางโอนเงิน:</span>
                  <span className="text-stone-800 font-semibold font-mono">พร้อมเพย์ (PromptPay)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-medium">เบอร์พร้อมเพย์:</span>
                  <span className="text-emerald-700 font-bold font-mono">081-796-0622</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500 font-medium">ชื่อบัญชีผู้รับ:</span>
                  <span className="text-stone-800 font-semibold">ปินะ ไชยบุตร</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-stone-500">กรุณาสแกนโอนชำระเงินจำนวน</p>
                <p className="text-2xl font-black text-stone-900 font-mono">
                  {activeOrder.amount.toLocaleString()} <span className="text-sm text-emerald-600">฿</span>
                </p>
                <p className="text-[10px] text-stone-500 font-mono">
                  (กล้าไม้สักจำนวน {activeOrder.treeCount} ต้น)
                </p>
              </div>

              <button
                onClick={() => setActiveOrder(null)}
                className="text-xs text-stone-500 hover:text-stone-700 underline font-medium transition"
              >
                ย้อนกลับไปแก้ไขจำนวนกล้าสัก
              </button>
            </div>

            {/* Slip Verification Box */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-stone-800">
                    อัปโหลดสลิปธนาคารเพื่อตรวจสอบผ่าน slip2go
                  </h3>
                </div>

                <p className="text-xs text-stone-500 leading-normal">
                  เพื่อความรวดเร็วและแม่นยำ กรุณาอัปโหลดรูปภาพสลิปที่โอนชำระเงินสำเร็จแล้ว ระบบ slip2go ร่วมกับโมเดลวิเคราะห์ AI จะทำการสแกนประวัติการโอนเงิน ตรวจยอดโอน และร่วมปลูกต้นไม้สักให้คุณโดยอัตโนมัติภายใน 5 วินาที!
                </p>

                {/* Drag and drop zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-stone-200 bg-stone-50/50 hover:border-emerald-300 hover:bg-emerald-50/10'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="relative mx-auto max-w-[120px] rounded-lg overflow-hidden border border-stone-200 shadow-sm">
                        <img src={previewUrl} alt="Receipt Slip Preview" className="w-full h-auto object-contain" />
                        <div className="absolute inset-0 bg-black/5" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 font-mono">
                        {uploadedFile?.name}
                      </p>
                      <p className="text-[10px] text-stone-500">คลิกที่นี่หรือลากไฟล์มาวางเพื่อเปลี่ยนรูปสลิป</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-stone-100 rounded-full inline-block text-stone-500 border border-stone-200 shadow-inner">
                        <UploadCloud className="w-6 h-6 text-stone-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-stone-600">ลากและวางรูปสลิป หรือ คลิกเพื่อเลือกรูป</p>
                        <p className="text-[10px] text-stone-400 font-mono">รองรับไฟล์ JPG, PNG ขนาดสูงสุด 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {isVerifyingSlip ? (
                  <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    <div className="space-y-1 text-center">
                      <p className="text-xs font-semibold text-emerald-700 font-mono animate-pulse">
                        {verifyStep}
                      </p>
                      <p className="text-[10px] text-stone-500">ระบบ slip2go กำลังรับรองความปลอดภัยทางการเงิน</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleVerifySlip}
                    disabled={!uploadedFile}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-100 disabled:text-stone-450 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4.5 h-4.5" />
                    ตรวจสอบสลิปและร่วมปลูกทันที
                  </button>
                )}

                {verifyError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                    {verifyError}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Payment Modal Prompt */}
      <AnimatePresence>
        {postPaymentPrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 text-center shadow-2xl border border-emerald-900/10"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">
                  ชำระเงินและสลักชื่อสำเร็จ!
                </span>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  ต้องการเข้าสู่ระบบเพื่อบันทึกและติดตามต้นไม้หรือไม่?
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  คุณร่วมปลูกต้นไม้สักจำนวน <strong className="text-emerald-800">{postPaymentPrompt.order.treeCount} ต้น</strong> เรียบร้อยแล้ว สามารถเข้าสู่ระบบผ่าน Google หรือ LINE เพื่อติดตามการเติบโตและดูใบประกาศใน "ต้นไม้ของฉัน" ได้ตลอดเวลา
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={async () => {
                    const res = await googleSignIn();
                    if (res?.user) {
                      setUser(res.user);
                    }
                    onOrderCompleted(postPaymentPrompt.order, postPaymentPrompt.newTrees);
                    setPostPaymentPrompt(null);
                  }}
                  className="w-full py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google</span>
                </button>

                <button
                  onClick={async () => {
                    const lineProfile = await lineSignIn({
                      displayName: postPaymentPrompt.order.donorName,
                      phone: postPaymentPrompt.order.donorPhone
                    });
                    setLineUser(lineProfile);
                    setUser(lineProfile);
                    onOrderCompleted(postPaymentPrompt.order, postPaymentPrompt.newTrees);
                    setPostPaymentPrompt(null);
                  }}
                  className="w-full py-3 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>เข้าสู่ระบบด้วย LINE</span>
                </button>

                <button
                  onClick={() => {
                    onOrderCompleted(postPaymentPrompt.order, postPaymentPrompt.newTrees);
                    setPostPaymentPrompt(null);
                  }}
                  className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-xs font-semibold underline cursor-pointer"
                >
                  ข้ามขั้นตอน / ดูใบประกาศเกียรติคุณทันที
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
