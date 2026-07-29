import React, { useState, useEffect } from 'react';
import { Leaf, Map, TreePine, Navigation, ArrowRight, BookOpen, Clock, Heart, Users, Target, Code, MessageCircle, HeartHandshake, FileText, CheckCircle, ShieldCheck, PlayCircle, Sprout, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CampaignStats, Tree } from '../types';

interface HomeCampaignProps {
  onEnterCampaign: (tab?: 'map' | 'plant' | 'my-trees' | 'about') => void;
  isAdmin?: boolean;
}

const HomeCampaign: React.FC<HomeCampaignProps> = ({ onEnterCampaign, isAdmin }) => {
  const [stats, setStats] = useState<CampaignStats>({
    totalTarget: 10000,
    totalPlanted: 0,
    totalCO2Offset: 0,
    totalDonors: 0
  });
  const [recentTrees, setRecentTrees] = useState<Tree[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchStatsAndTrees();
  }, []);

  const fetchStatsAndTrees = async () => {
    try {
      setIsLoadingStats(true);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleViewCertificate = (tree: Tree) => {
    window.open('https://lin.ee/Sv5qrGD', '_blank');
  };

  const checkAdminAndExecute = (action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าถึงส่วนนี้ได้');
    }
  };

  return (
    <>
      <div className="relative overflow-hidden bg-emerald-950 pt-24 pb-32">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2800')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/80 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
          <div className="max-w-3xl space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/50 border border-emerald-700/50 text-emerald-300 text-sm font-medium backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>แคมเปญระดมทุนอุปถัมภ์กล้าไม้ 2026</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight font-sans">
              10K หมื่นกล้า<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-300">ป่าเขียว</span>
            </h1>
            
            <p className="text-lg md:text-xl text-emerald-100/90 leading-relaxed font-medium max-w-2xl">
              หมื่นกล้าป่าเขียว ก่อตั้งขึ้นด้วยเจตนารมณ์ในการสร้างผืนป่าที่ยั่งยืน และเปิดโอกาสให้ทุกคนมีส่วนร่วมในการฟื้นฟูธรรมชาติได้อย่างง่ายดาย โดยเราเป็นผู้ปลูก ดูแล และติดตามการเติบโตของต้นไม้แทนผู้สนับสนุน เพื่อให้ทุกต้นเติบโตเป็นคุณค่าที่ส่งต่อสู่สิ่งแวดล้อมและคนรุ่นต่อไป พร้อมสร้างระบบการปลูกป่าที่โปร่งใส ตรวจสอบได้ และเกิดประโยชน์ต่อสังคมอย่างแท้จริง
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => onEnterCampaign('map')}
                className="px-8 py-4 bg-white text-emerald-950 font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.05] transition-all flex items-center justify-center gap-3"
              >
                เข้าสู่ระบบแผนที่ & สำรวจผืนป่า
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEnterCampaign('plant')}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.05] transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/20"
              >
                <Sparkles className="w-6 h-6 text-amber-300" />
                ร่วมปลูกกล้าไม้สัก 100฿
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-16 relative z-20 pb-24 space-y-24">
        {/* Project Stats */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">เป้าหมาย</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-stone-900 font-mono">10,000</span>
                <span className="text-sm font-medium text-stone-500">ต้น</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <TreePine className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">ปลูกแล้ว</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-stone-900 font-mono">
                  {isLoadingStats ? '...' : stats.totalPlanted.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-stone-500">ต้น</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">ผู้ร่วมปลูก</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-stone-900 font-mono">
                  {isLoadingStats ? '...' : stats.totalDonors.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-stone-500">คน</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-600 mb-1">
                <Map className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">พื้นที่ฟื้นฟู</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-stone-900 font-mono">
                  {isLoadingStats ? '...' : +(stats.totalPlanted * 0.0015).toFixed(2)}
                </span>
                <span className="text-sm font-medium text-stone-500">ไร่</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">ความคืบหน้าโครงการ</span>
              <span className="text-sm font-black text-emerald-700 font-mono">
                {isLoadingStats ? '0' : Math.min(100, (stats.totalPlanted / 10000) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${isLoadingStats ? 0 : Math.min(100, (stats.totalPlanted / 10000) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Introduction / Problem & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=1600" 
              alt="Forest canopy" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex flex-col justify-end p-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl inline-flex items-center gap-4 text-white">
                <Leaf className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-xs font-medium text-emerald-200">สายพันธุ์คุณภาพ</p>
                  <p className="font-bold">กล้าไม้สัก (Tectona grandis)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>หลักการและเหตุผล</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              ทำไมต้องปลูก<br />
              <span className="text-emerald-700">"หมื่นกล้าป่าเขียว"?</span>
            </h2>
            
            <p className="text-stone-600 leading-relaxed">
              ผืนป่าเสื่อมโทรมต้องการการฟื้นฟูอย่างเร่งด่วน โครงการของเรามุ่งเน้นการปลูกป่าอย่างยั่งยืน โดยใช้สายพันธุ์ไม้เศรษฐกิจและไม้ท้องถิ่นอย่าง "ไม้สัก" ที่มีอัตราการรอดชีวิตสูง ช่วยยึดหน้าดิน ป้องกันน้ำท่วมป่าต้นน้ำ และเป็นแหล่งดูดซับคาร์บอน (Carbon Sink) ชั้นเยี่ยม
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-stone-200 p-4 rounded-xl flex items-start gap-3 bg-white">
                <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-stone-900">ปลูกแล้วรอด</p>
                  <p className="text-[11px] text-stone-500 mt-1">ดูแลโดยชุมชนและรุกขกรต่อเนื่อง 1 ปีแรก</p>
                </div>
              </div>
              <div className="border border-stone-200 p-4 rounded-xl flex items-start gap-3 bg-white">
                <Code className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-stone-900">โปร่งใส 100%</p>
                  <p className="text-[11px] text-stone-500 mt-1">ติดตามต้นไม้ของคุณผ่านพิกัด GPS บนระบบ 3D</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Preview Section */}
        <div className="bg-emerald-950 rounded-3xl p-1 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative bg-white rounded-[22px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="p-8 lg:p-10 space-y-6 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>ระบบแผนที่พิกัด 3D</span>
                </div>
                
                <h2 className="text-3xl font-black text-stone-900 leading-tight">
                  จองพิกัดพื้นที่ป่า<br />ในจุดที่คุณต้องการ
                </h2>
                
                <p className="text-sm text-stone-600 leading-relaxed">
                  เราแปลงพื้นที่ป่าจริงให้เป็น Virtual Map เพื่อให้คุณสามารถเลือกตำแหน่งที่จะปลูกกล้าไม้สักของคุณได้ด้วยตัวเอง แต่ละช่องแสดงสถานะแบบเรียลไทม์
                </p>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-stone-200 rounded-sm" />
                    <span className="text-sm text-stone-600 font-medium">พื้นที่ว่าง (Available)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-sm" />
                    <span className="text-sm text-stone-600 font-medium">รอชำระเงิน (Reserved)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                    <span className="text-sm text-stone-600 font-medium">ปลูกแล้ว (Planted)</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onEnterCampaign('map')}
                  className="mt-4 px-6 py-3.5 bg-emerald-950 hover:bg-emerald-900 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Map className="w-4 h-4" />
                  เปิดแผนที่และเลือกพิกัด
                </button>
              </div>
              
              <div className="lg:col-span-2 h-[400px] lg:h-auto bg-stone-100 relative min-h-[400px]">
                
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent pointer-events-none hidden lg:block" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. CORE FEATURES */}
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-emerald-950 font-sans">
              นวัตกรรมการจัดการป่าไม้
            </h2>
            <p className="text-xs text-stone-500">
              ยกระดับการปลูกป่าด้วยเทคโนโลยี เพื่อความโปร่งใสและยั่งยืน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-emerald-500/20 hover:bg-emerald-50/20 transition-all space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-stone-900">E-Certificate อัตโนมัติ</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                เมื่อได้รับการยืนยัน คุณสามารถสร้างและดาวน์โหลดใบประกาศเกียรติคุณแบบดิจิทัล พร้อมหมายเลข Serial ประจำกล้าไม้ของคุณ เพื่อใช้เป็นหลักฐานและแชร์ความภาคภูมิใจ
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-emerald-500/20 hover:bg-emerald-50/20 transition-all space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-stone-900">พิกัด 3D เสมือนจริง</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                แสดงผลตำแหน่งกล้าไม้บนแผนที่ Interactive 3D คุณสามารถคลิกดูรายละเอียดของต้นไม้แต่ละต้น รวมถึงชื่อผู้ร่วมปลูกและวันที่ปลูกได้อย่างชัดเจน
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-emerald-500/20 hover:bg-emerald-50/20 transition-all space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-stone-900">การดูแลและติดตามผล</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                ทีมงานรุกขกรและคณะผู้จัดทำโครงการเข้าบำรุงดูแลต้นไม้ของคุณ พร้อมอัปโหลดประวัติการดูแลอย่างโปร่งใส ให้คุณติดตามการเติบโตได้ตลอดเวลา
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeCampaign;
