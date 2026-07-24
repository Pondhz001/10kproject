import React, { useState, useEffect } from 'react';
import { Tree, Order, CampaignStats } from './types';
import ForestMap from './components/ForestMap';
import PlantingPortal from './components/PlantingPortal';
import CertificateCanvas from './components/CertificateCanvas';
import PoetryNarrator from './components/PoetryNarrator';
import AboutCampaign from './components/AboutCampaign';
import HomeCampaign from './components/HomeCampaign';
import BrandLogo from './components/BrandLogo';
import UserDashboard from './components/UserDashboard';
import { Trees, Search, Shovel, Trees as EcoIcon, Sparkles, Scale, Users, CheckCircle, Heart, Info, Lock, Printer, ShieldCheck, X, Mail, Phone as PhoneIcon, MessageSquare, Info as InfoIcon, FileText, Globe, Heart as HeartIcon, Home, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'plant' | 'about' | 'my-trees'>('home');
  const [plantMode, setPlantMode] = useState<'member' | 'admin'>('member');

  // Admin Access State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('is_admin') === 'true';
  });
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Core App State
  const [trees, setTrees] = useState<Tree[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalTarget: 10000,
    totalPlanted: 0,
    totalCO2Offset: 0,
    totalDonors: 0
  });
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  // Success Overlay Banner (For newly verified order)
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [justPlantedCount, setJustPlantedCount] = useState(0);
  const [isViewingCertificate, setIsViewingCertificate] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');

  // Pre-selected seedling number for planting
  const [preSelectedTreeIndex, setPreSelectedTreeIndex] = useState<number | null>(null);
  const [preSelectedTreeIndexes, setPreSelectedTreeIndexes] = useState<number[]>([]);

  // Load stats and tree list from our full-stack Express endpoints
  const fetchStatsAndTrees = async (currentSelectedId?: string) => {
    try {
      const [statsRes, treesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trees')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (treesRes.ok) {
        const treesData = await treesRes.json();
        setTrees(treesData);
        
        // If there's an active selected tree, update its reference with live data
        if (currentSelectedId) {
          const freshTree = treesData.find((t: Tree) => t.id === currentSelectedId);
          if (freshTree) {
            setSelectedTree(freshTree);
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync backend state:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatsAndTrees(selectedTree?.id);

    // Only run real-time sync polling when NO tree is actively selected/being edited!
    if (selectedTree) return;

    // Dynamic real-time sync interval (every 5 seconds)
    const interval = setInterval(() => {
      fetchStatsAndTrees();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedTree?.id]);

  // When order is successfully completed (receipt verified via slip2go)
  const handleOrderCompleted = (completedOrder: Order, newlyPlantedTrees: Tree[]) => {
    setSuccessOrder(completedOrder);
    setJustPlantedCount(completedOrder.treeCount);
    setPreSelectedTreeIndex(null);
    setPreSelectedTreeIndexes([]);
    setIsViewingCertificate(true); // Automatically show certificate on complete!
    
    // Refresh database stats
    fetchStatsAndTrees();

    // Select the first new tree so they can see it when returning to map
    if (newlyPlantedTrees.length > 0) {
      setSelectedTree(newlyPlantedTrees[0]);
    }
  };

  // When ranger updates care log, update tree in state
  const handleCareUpdated = (updatedTree: Tree) => {
    // Merge updated details in trees list
    setTrees(prev => prev.map(t => t.id === updatedTree.id ? updatedTree : t));
    setSelectedTree(updatedTree);
    
    // Recalculate stats
    fetchStatsAndTrees();
  };

  // View certificate of a specific tree
  const handleViewCertificate = (tree: Tree) => {
    setSuccessOrder({
      id: tree.id,
      donorName: tree.ownerName,
      donorPhone: tree.ownerPhone,
      treeCount: 1,
      amount: 100,
      status: 'Paid',
      slipVerified: true,
      selectedTreeIndexes: [tree.index],
      createdAt: tree.plantedAt,
    });
    setIsViewingCertificate(true);
  };

  // Check admin authorization before running action
  const checkAdminAndExecute = (action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAdminPasscodeModal(true);
      setPasscode('');
      setPasscodeError('');
    }
  };

  // Submit admin passcode
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '10kproject') {
      setIsAdmin(true);
      localStorage.setItem('is_admin', 'true');
      setShowAdminPasscodeModal(false);
      setPasscodeError('');
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      setPasscodeError('รหัสผ่านไม่ถูกต้อง เฉพาะแอดมินโครงการเท่านั้น');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f3] text-stone-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Header Navigation */}
      <header className="border-b border-emerald-900/10 bg-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand (Clickable to Home) */}
          <BrandLogo onClick={() => setActiveTab('home')} size="md" />

          {/* Elegant tab controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {isAdmin && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl text-xs text-amber-900 font-medium shrink-0 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>แอดมิน</span>
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    localStorage.removeItem('is_admin');
                    setActiveTab('map');
                  }}
                  className="text-[10px] text-stone-400 hover:text-red-600 transition ml-1 cursor-pointer font-bold font-mono"
                >
                  [ออก]
                </button>
              </div>
            )}

            <nav className="flex gap-1 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80 shadow-xs shrink-0 max-w-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-amber-300' : 'text-emerald-600'}`} />
                หน้าแรก
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Trees className={`w-4 h-4 ${activeTab === 'map' ? 'text-amber-300' : 'text-emerald-600'}`} />
                กล้าไม้สักในโครงการ
              </button>

              <button
                onClick={() => {
                  setPlantMode('member');
                  setActiveTab('plant');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'member'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'member' ? 'text-amber-300' : 'text-amber-500'}`} />
                ร่วมปลูก (สมาชิก)
              </button>

              <button
                onClick={() => {
                  checkAdminAndExecute(() => {
                    setPlantMode('admin');
                    setActiveTab('plant');
                  });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'plant' && plantMode === 'admin'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-black border border-amber-400'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <EcoIcon className={`w-4 h-4 ${activeTab === 'plant' && plantMode === 'admin' ? 'text-stone-950' : 'text-amber-700'}`} />
                บันทึกปลูก (แอดมิน)
              </button>

              <button
                onClick={() => setActiveTab('my-trees')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'my-trees'
                    ? 'bg-emerald-700 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${activeTab === 'my-trees' ? 'text-amber-300' : 'text-emerald-600'}`} />
                ต้นไม้ของฉัน
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'about'
                    ? 'bg-emerald-800 text-white shadow-sm font-black'
                    : 'text-stone-600 hover:text-emerald-900 hover:bg-white/80'
                }`}
              >
                <Info className={`w-4 h-4 ${activeTab === 'about' ? 'text-amber-300' : 'text-emerald-600'}`} />
                เกี่ยวกับโครงการ / MOU
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Campaign Stats Dashboard (Bento Grid) - Conditionally hidden on Home tab */}
      {activeTab !== 'home' && (
        <section className="bg-[#e9f0e9] border-b border-emerald-900/5 py-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
          
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="campaign-bento-grid">
            
            {/* Total Goal */}
            <div className="bg-white border border-emerald-900/10 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider">เป้าหมายโครงการ</span>
                <EcoIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-black text-stone-900 font-mono">
                  {stats.totalTarget.toLocaleString()}
                </p>
                <div className="flex justify-between items-center mt-1 text-[10px] text-stone-500">
                  <span>ต้นกล้าไม้สัก</span>
                  <span className="text-emerald-700 font-semibold">100% สักสายพันธุ์ดี</span>
                </div>
              </div>
            </div>

            {/* Total Planted */}
            <div className="bg-white border border-emerald-900/10 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider">ปลูกแล้วสำเร็จ</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-black text-stone-900 font-mono flex items-baseline gap-1.5">
                  {stats.totalPlanted.toLocaleString()}
                  <span className="text-xs font-semibold text-emerald-600">
                    ({((stats.totalPlanted / stats.totalTarget) * 100).toFixed(1)}%)
                  </span>
                </p>
                {/* Visual Progress bar */}
                <div className="w-full bg-[#f0f4f0] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                     style={{ width: `${(stats.totalPlanted / stats.totalTarget) * 100}%` }}
                     className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Carbon Offset */}
            <div className="bg-white border border-emerald-900/10 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider">ดูดซับคาร์บอนสะสม</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-black text-stone-900 font-mono">
                  {stats.totalCO2Offset.toLocaleString()} <span className="text-xs text-stone-500 font-normal">กก./ปี</span>
                </p>
                <p className="text-[10px] text-stone-500 mt-1">
                  ลดปริมาณก๊าซเรือนกระจกเพื่อโลกสีเขียว
                </p>
              </div>
            </div>

            {/* Total Donors */}
            <div className="bg-white border border-emerald-900/10 p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-center text-stone-400">
                <span className="text-xs font-semibold font-mono uppercase tracking-wider">จำนวนผู้ร่วมปลูก</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-black text-stone-900 font-mono">
                  {stats.totalDonors.toLocaleString()} <span className="text-xs text-stone-500 font-normal">คน</span>
                </p>
                <p className="text-[10px] text-amber-700/80 mt-1">
                  ร่วมสร้างทานบารมี คืนชีวิตสู่แผ่นดิน
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
      )}

      {/* Main Feature Content Router Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {successOrder && (
            <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden print-container"
              >
                {/* Glow decorative effects */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {!isViewingCertificate ? (
                  // VIEW 1: Success Confirmation Message
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 animate-bounce">
                      <CheckCircle className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white tracking-tight">ร่วมลงทะเบียนปลูกกล้าไม้สักสำเร็จ!</h3>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        ข้อมูลผู้ร่วมปลูกและป้ายแทรกสลักชื่อของคุณได้รับการบันทึกเข้าระบบนิเวศป่าเรียบร้อยแล้ว!
                      </p>
                    </div>

                    {/* Receipt breakdown */}
                    <div className="bg-stone-950 border border-stone-800/80 rounded-2xl p-5 text-left space-y-3 font-sans">
                      <div className="flex justify-between items-center pb-2.5 border-b border-stone-800/40">
                        <span className="text-xs text-stone-500 font-medium">ชื่อผู้ร่วมปลูก (ป้ายแทรก)</span>
                        <span className="text-sm font-semibold text-stone-200">{successOrder.donorName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-stone-800/40">
                        <span className="text-xs text-stone-500 font-medium">ข้อมูลติดต่อ</span>
                        <span className="text-sm font-mono font-semibold text-stone-200">{successOrder.donorPhone}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-stone-800/40">
                        <span className="text-xs text-stone-500 font-medium">จำนวนกล้าไม้สัก</span>
                        <span className="text-sm font-semibold text-emerald-400">{successOrder.treeCount} ต้น</span>
                      </div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-stone-800/40">
                        <span className="text-xs text-stone-500 font-medium">หมายเลขประจำกล้าไม้สัก</span>
                        <span className="text-sm font-mono font-bold text-emerald-500 text-right max-w-[300px] break-words">
                          {successOrder.selectedTreeIndexes?.map(idx => `#MK-${idx}`).join(', ') || 'สุ่มกล้าสัก'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-stone-500 font-medium">ค่าลงทะเบียนและป้ายแทรก</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">ฟรี (ไม่มีค่าใช้จ่าย)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setIsViewingCertificate(true)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        รับรูปใบประกาศเกียรติคุณ
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('map');
                          setSuccessOrder(null);
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trees className="w-4 h-4" />
                        ดูกล้าสักในโครงการ
                      </button>
                    </div>

                    <button
                      onClick={() => setSuccessOrder(null)}
                      className="text-xs text-stone-500 hover:text-stone-300 underline font-medium block mx-auto transition pt-2"
                    >
                      ปิดหน้าต่างกลับสู่โครงการ
                    </button>
                  </div>
                ) : (
                  // VIEW 2: Certificate of Tree Planting (Fully Rendered HTML5 Canvas with PNG Downloader!)
                  <div className="space-y-6 text-left">
                    <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                      <h4 className="text-sm font-bold text-stone-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        เกียรติบัตรเกียรติยศผู้ร่วมคืนป่าเขียว
                      </h4>
                      <button
                        onClick={() => setIsViewingCertificate(false)}
                        className="text-xs text-stone-500 hover:text-stone-400 underline transition cursor-pointer"
                      >
                        ย้อนกลับ
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-stone-400">
                        เกียรติบัตรฉบับนี้จัดทำขึ้นเพื่อประกาศเกียรติคุณและเชิดชูเกียรติแก่ผู้ร่วมสร้างการเปลี่ยนแปลงอุปถัมภ์กล้าไม้และสนับสนุนทุนฟื้นฟูระบบนิเวศวิทยาทางชีวภาพของแผ่นดินป่าเมืองเหนืออย่างซื่อสัตย์และงดงามในแคมเปญหมื่นกล้าป่าเขียว
                      </p>
                    </div>

                    {/* Integrated Certificate Canvas */}
                    <CertificateCanvas
                      donorName={successOrder.donorName}
                      treeCount={successOrder.treeCount}
                      selectedTreeIndexes={successOrder.selectedTreeIndexes || []}
                    />

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => {
                          setActiveTab('map');
                          setSuccessOrder(null);
                        }}
                        className="text-xs text-stone-500 hover:text-stone-300 underline font-medium transition cursor-pointer"
                      >
                        ปิดหน้าต่างนี้และกลับไปดูแผนที่
                      </button>
                      <button
                        onClick={() => setIsViewingCertificate(false)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
                      >
                        ย้อนดูรายละเอียดใบเสร็จ
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAdminPasscodeModal && (
            <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                className="w-full max-w-md bg-white border border-emerald-900/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowAdminPasscodeModal(false);
                    setPendingAction(null);
                    setPasscode('');
                    setPasscodeError('');
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Header Decoration */}
                <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <Lock className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-emerald-950 tracking-tight font-sans">เฉพาะแอดมินโครงการ</h3>
                    <p className="text-xs text-stone-500">
                      กรุณากรอกรหัสผ่านเพื่อสิทธิ์เข้าถึงฟังก์ชันร่วมปลูกกล้าไม้สัก
                    </p>
                  </div>

                  <form onSubmit={handleVerifyPasscode} className="space-y-3 pt-2">
                    <div>
                      <input
                        type="password"
                        placeholder="กรอกรหัสผ่านแอดมิน..."
                        value={passcode}
                        onChange={(e) => {
                          setPasscode(e.target.value);
                          setPasscodeError('');
                        }}
                        autoFocus
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-center text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition font-mono tracking-wider"
                      />
                      {passcodeError && (
                        <p className="text-rose-600 text-[11px] mt-1.5 font-medium">
                          ⚠ {passcodeError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      ยืนยันรหัสผ่านแอดมิน
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {activeTab === 'home' && (
              <HomeCampaign 
                stats={stats}
                onEnterCampaign={(tab) => {
                  if (tab === 'plant') {
                    setPlantMode('member');
                  }
                  setActiveTab(tab);
                }}
              />
            )}

            {activeTab === 'map' && (
              <ForestMap
                trees={trees}
                onSelectTree={setSelectedTree}
                selectedTree={selectedTree}
                onTreeUpdated={handleCareUpdated}
                onViewCertificate={handleViewCertificate}
                isAdmin={isAdmin}
                onJoinPlanting={(index) => {
                  setPreSelectedTreeIndex(index);
                  setPreSelectedTreeIndexes([]);
                  setPlantMode('member');
                  setActiveTab('plant');
                }}
                onJoinPlantingMultiple={(indexes, asAdmin) => {
                  if (asAdmin) {
                    checkAdminAndExecute(() => {
                      setPreSelectedTreeIndexes(indexes);
                      setPreSelectedTreeIndex(null);
                      setPlantMode('admin');
                      setActiveTab('plant');
                    });
                  } else {
                    setPreSelectedTreeIndexes(indexes);
                    setPreSelectedTreeIndex(null);
                    setPlantMode('member');
                    setActiveTab('plant');
                  }
                }}
              />
            )}

            {activeTab === 'plant' && (
              <PlantingPortal
                onOrderCompleted={handleOrderCompleted}
                preSelectedTreeIndex={preSelectedTreeIndex}
                setPreSelectedTreeIndex={setPreSelectedTreeIndex}
                preSelectedTreeIndexes={preSelectedTreeIndexes}
                setPreSelectedTreeIndexes={setPreSelectedTreeIndexes}
                trees={trees}
                initialMemberMode={plantMode === 'member'}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'my-trees' && (
              <UserDashboard
                trees={trees}
                onViewCertificate={handleViewCertificate}
                onGoToPlanting={() => {
                  setPlantMode('member');
                  setActiveTab('plant');
                }}
              />
            )}

            {activeTab === 'about' && (
              <AboutCampaign />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Elegant Footer Credit */}
      <footer className="border-t border-emerald-900/10 bg-white text-stone-500 text-[10px] font-mono py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-stone-700">โครงการหมื่นกล้าป่าเขียว (10K Forest) © 2026</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span>Slip Verification by slip2go</span>
            <span>•</span>
            <span>ระบบลงทะเบียนกล้าไม้สักอุปถัมภ์</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
