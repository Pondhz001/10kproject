import React from 'react';
import { motion } from 'motion/react';
import { 
  Trees, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Award, 
  Heart, 
  Users, 
  CheckCircle, 
  Shovel, 
  Leaf,
  Globe,
  Sun,
  Activity
} from 'lucide-react';
import { CampaignStats } from '../types';

interface HomeCampaignProps {
  stats: CampaignStats;
  onEnterCampaign: (tab: 'map' | 'plant' | 'about') => void;
}

export default function HomeCampaign({ stats, onEnterCampaign }: HomeCampaignProps) {
  const percentPlanted = ((stats.totalPlanted / stats.totalTarget) * 100).toFixed(1);

  return (
    <div className="space-y-16 py-4 max-w-6xl mx-auto" id="home-campaign-container">
      
      {/* 1. HERO SECTION */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white shadow-2xl border border-emerald-800/20 p-8 md:p-16">
        {/* Abstract background decorative blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-800/50 backdrop-blur-md text-emerald-300 text-xs font-bold rounded-full border border-emerald-700/30 uppercase tracking-widest font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            แคมเปญฟื้นฟูป่าเพื่อโลกสีเขียวอย่างยั่งยืน
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight leading-tight font-display"
          >
            ร่วมสร้างทานบารมี<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300">
              หมื่นกล้าป่าเขียว
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-emerald-100/80 leading-relaxed font-sans max-w-2xl"
          >
            ร่วมอุปถัมภ์กล้าไม้สักทองคุณภาพสูงเพียง <strong className="text-amber-300 font-bold">100฿</strong> ต่อต้น พร้อมสลักป้ายชื่อของคุณปักพิกัด GPS จริง ณ พื้นที่ป่าแคมเปญ วัดดอยนางเมาะ จังหวัดเชียงใหม่ เพื่อเป้าหมายฟื้นฟูระบบนิเวศรวม 10,000 ต้นกล้าสักทองให้แข็งแกร่งเป็นผืนป่าถาวร
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button
              onClick={() => onEnterCampaign('map')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/20"
            >
              <Trees className="w-4 h-4 text-emerald-200" />
              เข้าสู่ระบบแผนที่ & สำรวจผืนป่า
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterCampaign('plant')}
              className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl backdrop-blur-md border border-white/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shovel className="w-4 h-4 text-amber-300" />
              ร่วมปลูกกล้าไม้สักทอง 100฿
            </button>
          </motion.div>
        </div>

        {/* Floating graphical teaser representing trees */}
        <div className="absolute right-12 bottom-12 hidden lg:flex flex-col items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl w-64 shadow-xl">
          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
            <Trees className="w-8 h-8" />
          </div>
          <p className="text-xs font-black text-center text-stone-100">พิกัดโครงการดอยนางเมาะ</p>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-300 font-mono">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>19.1432° N, 99.1245° E</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${percentPlanted}%` }} />
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1">ปลูกแล้ว {percentPlanted}%</span>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-emerald-950 font-sans flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              ความคืบหน้าของโครงการล่าสุด
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              ข้อมูลสถิติที่เชื่อมโยงกับระบบฐานข้อมูลป่าไม้จำลองของวัดดอยนางเมาะแบบเรียลไทม์
            </p>
          </div>
          <button
            onClick={() => onEnterCampaign('about')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            ดูหลักการร่วมฟื้นฟู & MOU
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Target */}
          <div className="bg-white border border-emerald-900/10 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition group">
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-semibold font-mono uppercase tracking-wider">เป้าหมายโครงการ</span>
              <Trees className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 transition" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-stone-900 font-mono">
                {stats.totalTarget.toLocaleString()}
              </p>
              <div className="flex justify-between items-center mt-1 text-[10px] text-stone-500">
                <span>ต้นกล้าสักทองทั้งหมด</span>
                <span className="text-emerald-700 font-semibold font-mono">10,000 ต้น</span>
              </div>
            </div>
          </div>

          {/* Card 2: Planted */}
          <div className="bg-white border border-emerald-900/10 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition group">
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-semibold font-mono uppercase tracking-wider">ปลูกแล้วสำเร็จ</span>
              <CheckCircle className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 transition" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-stone-900 font-mono flex items-baseline gap-1.5">
                {stats.totalPlanted.toLocaleString()}
                <span className="text-xs font-semibold text-emerald-600">
                  ({percentPlanted}%)
                </span>
              </p>
              <div className="w-full bg-stone-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full" 
                  style={{ width: `${percentPlanted}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: CO2 */}
          <div className="bg-white border border-emerald-900/10 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition group">
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-semibold font-mono uppercase tracking-wider">ดูดซับคาร์บอนสะสม</span>
              <Leaf className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-stone-900 font-mono">
                {stats.totalCO2Offset.toLocaleString()} <span className="text-xs text-stone-500 font-normal">กก./ปี</span>
              </p>
              <p className="text-[10px] text-stone-500 mt-1">
                เป้าหมายช่วยลดปริมาณก๊าซเรือนกระจกสะสม
              </p>
            </div>
          </div>

          {/* Card 4: Donors */}
          <div className="bg-white border border-emerald-900/10 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition group">
            <div className="flex justify-between items-center text-stone-400">
              <span className="text-xs font-semibold font-mono uppercase tracking-wider">จำนวนผู้ร่วมปลูก</span>
              <Users className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-stone-900 font-mono">
                {stats.totalDonors.toLocaleString()} <span className="text-xs text-stone-500 font-normal">คน</span>
              </p>
              <p className="text-[10px] text-amber-700 mt-1">
                พลังสร้างสรรค์และความร่วมมือรวมใจ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CAMPAIGN FEATURES GRID */}
      <div className="space-y-8 bg-white border border-emerald-900/10 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-emerald-950 font-sans">
            จุดเด่นระบบอุปถัมภ์กล้าไม้สักทอง
          </h2>
          <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
            เชื่อมโยงเทคโนโลยีดิจิทัลเข้ากับการฟื้นฟูธรรมชาติจริง เพื่อความโปร่งใสและประโยชน์สูงสุดแก่ระบบนิเวศ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-emerald-500/20 hover:bg-emerald-50/20 transition-all space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900">ระบุพิกัดแผนที่ 3D จริง</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              ต้นสักทองทุกต้นในแคมเปญจะได้รับหมายเลขกล้าไม้ เช่น <strong className="font-mono">#MK-123</strong> และมีพิกัดที่ดินระบุจริงบนแผนที่จำลองของวัดดอยนางเมาะ คุณสามารถคลิกดูต้นไม้ของคุณได้ทุกเมื่อ
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-emerald-500/20 hover:bg-emerald-50/20 transition-all space-y-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900">เกียรติบัตรเกียรติยศดิจิทัล</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              เมื่อทำการลงทะเบียนร่วมอุปถัมภ์เสร็จสิ้น คุณจะได้รับเกียรติบัตรประกาศเกียรติคุณที่ระบุชื่อผู้ร่วมอุปถัมภ์และรหัสกล้าไม้ สามารถบันทึกรูปภาพเพื่อพิมพ์หรือส่งต่อสิทธิความภาคภูมิใจนี้ได้ทันที
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:border-emerald-500/20 hover:bg-emerald-50/20 transition-all space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900">ตรวจสลิปและดูแลกล้าไม้</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              ใช้ระบบ AI และ Slip2Go ในการยืนยันการโอนเงินโดยอัตโนมัติ เพื่อเข้าสมทบเป็นกองทุนอุปถัมภ์ พร้อมทีมงานรุกขกรและคณะผู้จัดทำโครงการเข้าบำรุงและอัปโหลดประวัติการดูแลอย่างโปร่งใส
            </p>
          </div>
        </div>
      </div>

      {/* 4. STEPS TO JOIN */}
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-emerald-950 font-sans">
            ขั้นตอนการเข้าร่วมโครงการอุปถัมภ์กล้าไม้
          </h2>
          <p className="text-xs text-stone-500">
            เพียง 4 ขั้นตอนง่ายๆ ในการร่วมสนับสนุนกองทุนฟื้นฟูระบบนิเวศ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-2 right-4 text-5xl font-black text-stone-100 font-mono select-none">1</div>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block mb-2 font-mono">STEP 01</span>
            <h3 className="text-sm font-bold text-stone-900 mb-2">เลือกพิกัดกล้าไม้สัก</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              เข้าสู่แผนที่ระบบพิกัด 3D แล้วเลือกตำแหน่งช่องดินที่ยังว่างเพื่ออุปถัมภ์ปักป้ายชื่อของคุณ
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-2 right-4 text-5xl font-black text-stone-100 font-mono select-none">2</div>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block mb-2 font-mono">STEP 02</span>
            <h3 className="text-sm font-bold text-stone-900 mb-2">กรอกชื่อและข้อมูลติดต่อ</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              ระบุชื่อผู้ต้องการสลักลงบนป้ายแทรกพิกัด และเบอร์โทรศัพท์สำหรับตรวจสอบสถานะ
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-2 right-4 text-5xl font-black text-stone-100 font-mono select-none">3</div>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block mb-2 font-mono">STEP 03</span>
            <h3 className="text-sm font-bold text-stone-900 mb-2">สแกน QR และโอนเงิน</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              สแกน QR Code เพื่อโอนเงินกองทุนอุปถัมภ์ 100฿ จากนั้นแนบหลักฐานสลิปโอนเงินเพื่อให้ระบบ AI ตรวจสอบอัตโนมัติ
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-2 right-4 text-5xl font-black text-stone-100 font-mono select-none">4</div>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block mb-2 font-mono">STEP 04</span>
            <h3 className="text-sm font-bold text-stone-900 mb-2">รับรูปภาพเกียรติบัตร</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              หลังจากสลิปได้รับการอนุมัติสำเร็จ คุณสามารถดาวน์โหลดรูปเกียรติบัตรประกาศเกียรติคุณเก็บไว้ภาคภูมิใจได้ทันที!
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => onEnterCampaign('plant')}
            className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl transition shadow-lg hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
          >
            <Shovel className="w-4 h-4 text-amber-950" />
            ร่วมปลูกกล้าไม้สักทอง 100฿ ตอนนี้เลย!
          </button>
        </div>
      </div>
    </div>
  );
}
