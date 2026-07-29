import React, { useState } from 'react';
import PoetryNarrator from './PoetryNarrator';
import { 
  BookOpen, 
  Settings, 
  Award, 
  FileText, 
  Target, 
  Trees, 
  CheckCircle, 
  MapPin, 
  Mail, 
  Phone, 
  Heart, 
  Send, 
  ShieldCheck, 
  MessageSquare,
  Activity,
  Globe,
  Sun,
  Flame,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SubTab = 'intro' | 'operations' | 'support' | 'cooperation' | 'goals';

export default function AboutCampaign() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('intro');
  
  // Ranger contact form states
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Ranger response mock simulation
  const [rangerTyping, setRangerTyping] = useState(false);
  const [rangerReply, setRangerReply] = useState<string | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Simulate Ranger typing and replying after 1.5 seconds!
      setRangerTyping(true);
      setTimeout(() => {
        setRangerTyping(false);
        setRangerReply(
          `ได้รับข้อความแล้วครับ! ทีมรุกขกรฝ่ายกิจกรรมดูแลกล้าไม้จะรีบนำทีมลงพิกัดไปดูแลต้นไม้อย่างใกล้ชิด และจัดเตรียมสรุปรายงานสุขภาพเพิ่มเติมให้ครับ ขอบคุณครับคุณ ${senderName}`
        );
      }, 1500);
    }, 1000);
  };

  const resetContactForm = () => {
    setSenderName('');
    setSenderEmail('');
    setSubject('');
    setMessage('');
    setIsSubmitted(false);
    setRangerReply(null);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-4" id="about-campaign-container">
      
      {/* 1. Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto flex flex-col items-center">
        <img src="/logo.svg" alt="10K หมื่นกล้าป่าเขียว" className="w-24 h-24 object-contain filter drop-shadow-md hover:scale-105 transition-transform" />
        <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-800 text-xs font-black rounded-full uppercase tracking-widest font-mono border border-emerald-500/20">
          หลักการร่วมฟื้นฟู & สัญญาสมบูรณ์
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-emerald-950 font-display tracking-tight leading-tight">
          โครงการ หมื่นกล้าป่าเขียว<br />
          <span className="text-emerald-600 font-bold text-2xl md:text-3xl font-sans">(10K Forest Initiative)</span>
        </h2>
        <p className="text-sm md:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          ร่วมคืนลมหายใจให้แผ่นดิน ฟื้นฟูพื้นที่สีเขียว ณ สำนักวิปัสสนาทางสายเอก หลวงปู่มั่น ดอยนางเมาะ (P6QR+5F9 ตำบลออนใต้ อำเภอสันกำแพง จังหวัดเชียงใหม่ 50130) เพื่อเป้าหมาย 10,000 ต้นกล้าไม้สักคุณภาพสูง
        </p>
      </div>

      {/* 2. Poetry Player (Atmosphere first!) */}
      <div className="max-w-4xl mx-auto">
        <PoetryNarrator />
      </div>

      {/* 3. Ecology Metrics Bento Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg md:text-xl font-bold text-stone-900 flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
            พลังงานนิเวศของผืนป่า 10,000 ต้นไม้สัก
          </h3>
          <p className="text-xs text-stone-500 max-w-xl mx-auto">
            ผลลัพธ์การดูดซับทางสิ่งแวดล้อมและสมดุลชีวภาพเมื่อกล้าไม้ในโครงการเติบโตแข็งแกร่งเป็นผืนป่าถาวร
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="ecology-bento-grid">
          {/* Card 1: Carbon Offset */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-emerald-900/20 rounded-3xl p-6 text-left shadow-lg hover:border-emerald-500/30 transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
              <Leaf className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">กักเก็บคาร์บอน CO₂</p>
            <p className="text-2xl font-black text-stone-100 font-mono mt-1">220,000 กก. / ปี</p>
            <p className="text-xs text-stone-400/80 leading-relaxed mt-2.5 font-sans">
              ต้นไม้ใหญ่ 10,000 ต้นช่วยดูดซับก๊าซคาร์บอนไดออกไซด์มลพิษปริมาณมหาศาลต่อปีเพื่อลดโลกร้อน
            </p>
          </div>

          {/* Card 2: Oxygen Production */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-emerald-900/20 rounded-3xl p-6 text-left shadow-lg hover:border-emerald-500/30 transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition">
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">สร้างอากาศบริสุทธิ์ O₂</p>
            <p className="text-2xl font-black text-stone-100 font-sans mt-1">ให้ 20,000 คน / วัน</p>
            <p className="text-xs text-stone-400/80 leading-relaxed mt-2.5 font-sans">
              หมื่นกล้าป่าเขียวช่วยสร้างออกซิเจนบริสุทธิ์เพียงพอต่อการหายใจของชุมชนขนาดใหญ่รอบดอยนางเมาะ
            </p>
          </div>

          {/* Card 3: Temperature Reduction */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-emerald-900/20 rounded-3xl p-6 text-left shadow-lg hover:border-emerald-500/30 transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <Sun className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">ลดอุณหภูมิความร้อน</p>
            <p className="text-2xl font-black text-stone-100 font-mono mt-1">-2 ถึง -4 °C</p>
            <p className="text-xs text-stone-400/80 leading-relaxed mt-2.5 font-sans">
              ลดความร้อนสะสมของพื้นที่ป่าแผ่ความชุ่มชื้นทดแทนแผ่นดิน ทำหน้าที่ดั่งเครื่องปรับอากาศธรรมชาติ
            </p>
          </div>

          {/* Card 4: Biodiversity Restoration */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-emerald-900/20 rounded-3xl p-6 text-left shadow-lg hover:border-emerald-500/30 transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition">
              <Trees className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">ฟื้นฟูความหลากหลาย</p>
            <p className="text-2xl font-black text-stone-100 font-sans mt-1">แหล่งอาศัย 450+ ชนิด</p>
            <p className="text-xs text-stone-400/80 leading-relaxed mt-2.5 font-sans">
              สร้างบ้านให้นก แมลง สัตว์เล็ก สัตว์เลื้อยคลาน และจุลินทรีย์หน้าดิน เพื่อสมดุลระบบนิเวศอย่างยั่งยืน
            </p>
          </div>
        </div>
      </div>

      {/* 4. Tabbed Documents Panel */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-8" id="about-documents-block">
        <div className="border-b border-stone-200 pb-4">
          <h3 className="text-xl font-black text-emerald-950 tracking-tight font-sans">
            หลักเกณฑ์และมาตรฐานความโปร่งใสในแคมเปญ
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            เปิดเผยเอกสาร รูปแบบข้อตกลงและหลักวิชาการวนศาสตร์เพื่อขับเคลื่อนผืนป่าสิบหมื่นกล้า
          </p>
        </div>

        {/* Dynamic sub tabs selector */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/60 max-w-fit">
          {[
            { id: 'intro', label: 'หลักการ & วัตถุประสงค์', icon: BookOpen },
            { id: 'operations', label: 'การดำเนินงานมาตรฐาน', icon: Settings },
            { id: 'support', label: 'การสนับสนุน & สิ่งที่ได้รับ', icon: Award },
            { id: 'cooperation', label: 'พื้นที่ & ข้อตกลง MOU', icon: FileText },
            { id: 'goals', label: 'เป้าหมาย & ความโปร่งใส', icon: Target }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 text-left min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeSubTab === 'intro' && (
                <div className="space-y-4 font-sans text-stone-700">
                  <h4 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    1. หลักการและเหตุผล
                  </h4>
                  <p className="text-sm leading-relaxed">
                    ประเทศไทยกำลังเผชิญกับการลดลงของพื้นที่ป่าและผลกระทบจากการเปลี่ยนแปลงสภาพภูมิอากาศ ซึ่งส่งผลต่อระบบนิเวศ แหล่งต้นน้ำ และคุณภาพชีวิตของประชาชนอย่างหลีกเลี่ยงไม่ได้
                  </p>
                  <p className="text-sm leading-relaxed">
                    โครงการ <strong className="text-emerald-800 font-bold">หมื่นกล้าป่าเขียว (10K Forest Initiative)</strong> จัดตั้งขึ้นเพื่อร่วมฟื้นฟูพื้นที่สีเขียว ณ <strong className="text-emerald-700">สำนักวิปัสสนาทางสายเอก หลวงปู่มั่น ดอยนางเมาะ (P6QR+5F9 ตำบลออนใต้ อำเภอสันกำแพง จังหวัดเชียงใหม่ 50130)</strong> โดยมุ่งปลูกต้นไม้สักคุณภาพจำนวน <strong className="text-emerald-700">10,000 ต้น</strong> บนพื้นที่ 15 ไร่ ในเฟสแรก ผ่านความร่วมมือระหว่างประชาชน ภาคเอกชน และหน่วยงานต่าง ๆ เพื่อสร้างผืนป่าที่เติบโตอย่างยั่งยืน โปร่งใส และสามารถติดตามผลได้จริงผ่านเทคโนโลยีแผนที่จำลองสะท้อนพิกัด
                  </p>
                  
                  <div className="pt-2">
                    <h5 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">วัตถุประสงค์หลักโครงการ:</h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium">
                      {[
                        'ปลูกต้นไม้สักคุณภาพจำนวน 10,000 ต้น ณ พื้นที่ป่าเสื่อมโทรมดอยนางเมาะ',
                        'เพิ่มพื้นที่สีเขียว มุ่งสร้างร่มเงาและร่วมฟื้นฟูระบบนิเวศแหล่งต้นน้ำป่าภาคเหนือ',
                        'ส่งเสริมการมีส่วนร่วมอย่างเข้มแข็งของประชาชนและพุทธศาสนิกชนในการอนุรักษ์ธรรมชาติ',
                        'พัฒนาระบบติดตามข้อมูลประจำต้นไม้ (Tree ID & GPS) ที่สามารถตรวจสอบได้จริงรายต้น',
                        'สร้างต้นแบบโครงการปลูกป่าที่ตั้งอยู่บนรากฐานความโปร่งใสและยั่งยืนอย่างแท้จริง'
                      ].map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start bg-white p-3 border border-stone-200 rounded-xl">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeSubTab === 'operations' && (
                <div className="space-y-5 font-sans text-stone-700">
                  <h4 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    2. รูปแบบการดำเนินงานมาตรฐาน (Standard Operations)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 border border-stone-200 rounded-xl space-y-1.5">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 text-[10px] font-bold rounded-full">3.1 การคัดเลือกพันธุ์ไม้สัก</span>
                      <h5 className="font-bold text-sm text-stone-900">ไม้เศรษฐกิจมูลค่าสูงของไทย</h5>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        โครงการเลือกใช้ <strong className="text-emerald-700">ต้นไม้สัก</strong> ซึ่งเป็นไม้เศรษฐกิจและไม้ยืนต้นที่มีคุณค่าทางระบบนิเวศสูง มีอายุยืนยาว แข็งแรงทนทาน และเหมาะสมอย่างยิ่งกับโครงสร้างผืนดินป่าเหนือตอนบน สามารถทนสภาพอากาศแปรปรวนได้เป็นอย่างดี
                      </p>
                    </div>

                    <div className="bg-white p-4 border border-stone-200 rounded-xl space-y-1.5">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 text-[10px] font-bold rounded-full">3.2 ปลูกแบบแม่นยำ (Precision Planting)</span>
                      <h5 className="font-bold text-sm text-stone-900">เพิ่มอัตราการรอดพ้นอย่างมั่นคง</h5>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        ดำเนินการปลูกอย่างพิถีพิถันโดยทีมงานและชาวบ้านผู้ผ่านการเตรียมความพร้อม ใช้อุปกรณ์เจาะหลุมปลูกที่เหมาะสม พร้อมทั้งกำหนดระยะห่างและแนวพิกัดตามหลักวิชาการวนศาสตร์ เพื่อให้ต้นกล้าได้รับแสงและแร่ธาตุในดินอย่างสมบูรณ์แบบที่สุด
                      </p>
                    </div>

                    <div className="bg-white p-4 border border-stone-200 rounded-xl space-y-1.5">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 text-[10px] font-bold rounded-full">3.3 ระบบติดตามและตรวจสอบรายต้น</span>
                      <h5 className="font-bold text-sm text-stone-900">ติดป้ายเลเซอร์และเชื่อมโยง GPS</h5>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        ต้นไม้ทุกต้นที่ร่วมลงดินจะได้รับข้อมูลประจำต้นเฉพาะตัว ได้แก่ <strong className="text-stone-900">รหัสต้นไม้ (Tree ID)</strong>, <strong className="text-stone-900">พิกัดดาวเทียม (GPS)</strong>, และได้รับการติดตั้ง <strong className="text-emerald-700">ป้ายชื่ออลูมิเนียมเลเซอร์</strong> ทนแดดทนฝน เพื่อให้ผู้สนับสนุนสามารถตรวจสอบความคืบหน้าของกล้าไม้ของตนได้ตลอดเวลา
                      </p>
                    </div>

                    <div className="bg-white p-4 border border-stone-200 rounded-xl space-y-1.5">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 text-[10px] font-bold rounded-full">3.4 การดูแลรักษาอย่างต่อเนื่อง</span>
                      <h5 className="font-bold text-sm text-stone-900">บำรุงหลังปลูก ภายใต้ข้อตกลง MOU</h5>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        ภายหลังการปลูก จะมีการดูแลและเฝ้าสังเกตอย่างสม่ำเสมอ ทั้งการให้น้ำช่วงหน้าแล้ง การกำจัดวัชพืชบดบังแสง การปลูกซ่อมแซมจุดที่เสียหาย การทำแนวกันไฟป่าร่วมกับทีมงานชุมชน โดยร่วมมือกับ <strong className="text-emerald-700 font-medium">สำนักวิปัสสนาทางสายเอก หลวงปู่มั่น ดอยนางเมาะ</strong> ภายใต้ข้อตกลงความร่วมมืออย่างเป็นทางการ
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'support' && (
                <div className="space-y-4 font-sans text-stone-700">
                  <h4 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    3. การร่วมอุปถัมภ์กล้าไม้สัก & สิ่งที่ได้รับ
                  </h4>

                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h5 className="font-bold text-emerald-950 text-sm">การร่วมอุปถัมภ์กล้าไม้สักสำหรับประชาชนทั่วไป</h5>
                      <p className="text-xs text-emerald-800 mt-1">ร่วมใจลงทะเบียนปลูกต้นไม้สักระบุพิกัดสลักชื่อ และดูแลรักษาให้เติบโตอย่างยั่งยืน</p>
                    </div>
                    <div className="bg-emerald-600 text-white font-black text-xs px-4 py-2 rounded-xl shrink-0 uppercase tracking-wider shadow">
                      ไม่มีค่าใช้จ่าย (ฟรี)
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <h5 className="text-xs font-bold text-stone-500">โครงการดูแลรักษาร่วมใจนี้ประกอบไปด้วย:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-medium">
                      {[
                        'จัดสรรต้นกล้าไม้สักสายพันธุ์พรีเมียมจากแหล่งเพาะชำมาตรฐานล้านนา',
                        'ค่าปุ๋ยอินทรีย์ ดินปลูก และวัสดุปรับปรุงสภาพหน้าดิน',
                        'ค่าแรงงานชาวบ้านในพื้นที่ในการเตรียมดิน ขุดหลุม และจัดทีมเดินป่าเข้าไปปลูก',
                        'ป้ายอลูมิเนียมเลเซอร์ระบุสิทธิ์ผู้สนับสนุนถาวรยึดติดประจำต้นสัก',
                        'การบันทึกข้อมูลและนำพิกัดเชื่อมโยงระบบแผนที่จำลองดิจิทัลแบบ 3 มิติ',
                        'การดูแลรักษารดน้ำและจัดแนวป้องกันไฟป่าระยะแรกเริ่มโดยคนในพื้นที่'
                      ].map((item, index) => (
                        <div key={index} className="flex gap-2 items-center bg-white p-2.5 border border-stone-200 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5 mt-2">
                    <h5 className="font-black text-amber-900 text-xs flex items-center gap-1">
                      <Award className="w-4 h-4" /> สิทธิ์ที่ผู้สนับสนุนจะได้รับ:
                    </h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      ผู้ร่วมอุปถัมภ์จะ<strong className="text-emerald-800">ได้รับเฉพาะสิทธิ์การตอก/สลักป้ายชื่ออลูมิเนียมเลเซอร์และรหัสประจำต้นไม้ (Tree ID) ของตนเอง</strong> ติดตั้งประดับไว้ถาวรบนต้นสักต้นจริง ณ แปลงปลูก สำนักวิปัสสนาทางสายเอก หลวงปู่มั่น ดอยนางเมาะ
                    </p>
                    <p className="text-[10px] text-stone-500 leading-relaxed italic">
                      *หมายเหตุเพื่อสิ่งแวดล้อม: โครงการจะไม่มีการส่งใบรับรองกระดาษหรือส่งของทางไปรษณีย์เพื่อลดขยะ มีเพียงป้ายอลูมิเนียมเลเซอร์บนต้นไม้จริง ซึ่งผู้สนับสนุนสามารถติดตามส่องพิกัดการเติบโตแบบออนไลน์ได้ตลอดเวลา!
                    </p>
                  </div>
                </div>
              )}

              {activeSubTab === 'cooperation' && (
                <div className="space-y-4 font-sans text-stone-700">
                  <h4 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    4. พื้นที่ดำเนินโครงการ & ข้อตกลงความร่วมมือ (MOU)
                  </h4>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">พิกัดสถานที่แปลงปลูก</span>
                        <h5 className="font-bold text-stone-900 text-sm">สำนักวิปัสสนาทางสายเอก หลวงปู่มั่น ดอยนางเมาะ (P6QR+5F9 ตำบลออนใต้ อำเภอสันกำแพง จังหวัดเชียงใหม่ 50130)</h5>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          พื้นที่ป่าอันสงบสุขร่มเย็น ได้รับความอนุเคราะห์จากทางสำนักวิปัสสนาทางสายเอกฯ เพื่อเป็นแปลงเรียนรู้ ฟื้นคืนสภาพแวดล้อม และเป็นแนวกันชนธรรมชาติในการฟื้นฟูธรรมชาติร่วมกับชุมชนคนในท้องถิ่นอย่างเป็นระเบียบและถูกกฎหมาย
                        </p>
                      </div>

                      <div className="border-t border-stone-200 pt-3 space-y-3">
                        <h5 className="font-bold text-xs text-stone-500 uppercase tracking-wider">ความร่วมมือร่วมใจที่สร้างขึ้นอย่างโปร่งใส (MOU Responsibility)</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <span className="font-bold text-emerald-700 text-xs block">ฝ่ายโครงการ (ผู้รับผิดชอบหลัก)</span>
                            <ul className="text-[11px] space-y-1 text-stone-500 list-disc list-inside">
                              <li>จัดหา คัดสรรต้นกล้าสักที่แข็งแรง</li>
                              <li>บริหารจัดการงบประมาณจัดซื้อและเครื่องมือ</li>
                              <li>จัดทีมนำลงแปลงร่วมปลูกร่วมชุมชน</li>
                              <li>สลักป้ายและบันทึกฐานข้อมูลลงระบบ</li>
                              <li>รายงานความคืบหน้าของป่าตามรอบปี</li>
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <span className="font-bold text-emerald-900 text-xs block">ฝ่ายสำนักวิปัสสนาทางสายเอกฯ</span>
                            <ul className="text-[11px] space-y-1 text-stone-500 list-disc list-inside">
                              <li>เอื้อเฟื้ออนุเคราะห์พื้นที่จัดปลูกถาวร</li>
                              <li>ร่วมช่วยดูแลรักษาต้นไม้หลังการปลูก</li>
                              <li>อำนวยความสะดวกพิกัดลาดตระเวนไฟป่า</li>
                              <li>ประสานงานชุมชนและปราชญ์ป่าไม้ท้องถิ่น</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-56 h-40 md:h-auto rounded-2xl overflow-hidden relative border border-stone-200">
                      <img 
                        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80" 
                        alt="ดอยนางเมาะ" 
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent flex items-end p-3">
                        <div className="text-left text-white">
                          <p className="text-[10px] font-bold font-mono tracking-wider">DOI NANG MOE</p>
                          <p className="text-[9px] text-stone-300">ดอยนางเมาะ จังหวัดเชียงใหม่</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'goals' && (
                <div className="space-y-4 font-sans text-stone-700">
                  <h4 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    5. เป้าหมายหลักและข้อตกลงความโปร่งใส (Transparency & Goals)
                  </h4>
                  <p className="text-sm leading-relaxed">
                    โครงการดำเนินงานภายใต้ <strong className="text-emerald-800">หลักธรรมาภิบาลและความโปร่งใสสุจริตสูงสุด</strong> โดยจะเผยแพร่ข้อมูลอย่างตรงไปตรงมาทุกพิกัด ทั้งภาพกิจกรรมการลงดิน พิกัดภูมิศาสตร์จดสิทธิ์ และรายงานการสำรวจระดับการรอดชีวิตของต้นสักผ่านช่องทางออนไลน์ เพื่อสร้างความสบายใจและสร้างสะพานเชื่อมต่อใจผู้สนับสนุนกับแปลงปลูกอย่างแท้จริง
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="bg-white p-4 border border-stone-200 rounded-xl text-center space-y-1">
                      <span className="text-emerald-600 font-bold text-lg block">10,000 ต้น</span>
                      <span className="text-stone-400 text-[10px] block">กล้าไม้สักลงดินในปี 2026</span>
                    </div>

                    <div className="bg-white p-4 border border-stone-200 rounded-xl text-center space-y-1">
                      <span className="text-emerald-600 font-bold text-lg block">95% อัตรารอด</span>
                      <span className="text-stone-400 text-[10px] block">มั่นใจด้วยทีมคอยเฝ้าระวังบำรุง</span>
                    </div>

                    <div className="bg-white p-4 border border-stone-200 rounded-xl text-center space-y-1">
                      <span className="text-emerald-600 font-bold text-lg block">150 ตัน CO₂</span>
                      <span className="text-stone-400 text-[10px] block">ดูดซับคาร์บอนเมื่อเต็มวัยสุทธิรายปี</span>
                    </div>

                    <div className="bg-white p-4 border border-stone-200 rounded-xl text-center space-y-1">
                      <span className="text-emerald-600 font-bold text-lg block">เศรษฐกิจชุมชน</span>
                      <span className="text-stone-400 text-[10px] block">จ้างงานและบำรุงชาวบ้านล้านนา</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 5. Contact Ranger Section & Message Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 items-start" id="ranger-contact-section">
        
        {/* Left Side: Address Details and Replanting Guarantee */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-800 text-[10px] font-black rounded-full uppercase font-mono tracking-wider">
              ช่องทางติดต่อกลาง
            </span>
            <h3 className="text-xl font-black text-emerald-950 font-display">สำนักงานและสิทธิ์การคุ้มครอง</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              สมาคมผู้พิทักษ์รักษ์ป่าแคมเปญหมื่นกล้าป่าเขียว พร้อมบริการข้อมูลและดูแลประสานงานร่วมอุปถัมภ์กล้าไม้สัก
            </p>
          </div>

          <div className="space-y-4 bg-white border border-stone-200 p-5 rounded-2xl">
            <div className="flex gap-3 items-start">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">สำนักงานประสานงานหลัก</h4>
                <p className="text-xs font-medium text-stone-800 mt-1">
                  12/3 ถนนห้วยแก้ว ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start border-t border-stone-100 pt-3">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">อีเมลกลางฝ่ายประชาสัมพันธ์</h4>
                <p className="text-xs font-medium text-emerald-700 mt-1">
                  support@10kforestinitiative.org
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start border-t border-stone-100 pt-3">
              <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">สายด่วนผู้ดูแลโครงงาน</h4>
                <p className="text-xs font-medium text-stone-800 mt-1 font-mono">
                  081-456-7890 (จันทร์ - ศุกร์ 09:00 - 17:00 น.)
                </p>
              </div>
            </div>
          </div>

          {/* Replanting Guarantee Badge */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-900 rounded-3xl p-6 text-white space-y-3 relative overflow-hidden shadow-lg">
            <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>
            
            <h4 className="text-sm font-black tracking-tight text-emerald-300 flex items-center gap-1.5 font-sans">
              <ShieldCheck className="w-4.5 h-4.5" /> การรับประกันกล้าไม้ทดแทน
            </h4>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-sans">
              ต้นไม้ทุกต้นในระบบที่ถูกสนับสนุนและดูแลโดยทีมงาน หากเสื่อมสภาพ ยืนต้นตาย หรือได้รับความเสียหายจากวาตภัยและอุทกภัยภายใน 3 ปีแรก จะได้รับสิทธิ์ <strong className="text-amber-300 font-bold">“การปลูกทดแทนทันที”</strong> โดยระบบจะปักพิกัดใหม่พร้อมส่งรายงานทางสมาชิกโดยไม่คิดค่าใช้จ่ายเพิ่มใดๆ ทั้งสิ้น
            </p>
          </div>
        </div>

        {/* Right Side: Message Form */}
        <div className="lg:col-span-7 bg-[#101913] border border-emerald-900/30 rounded-3xl p-6 md:p-8 shadow-xl text-white text-left relative overflow-hidden">
          {/* Radial visual background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="border-b border-emerald-900/20 pb-4 mb-6">
            <h3 className="text-lg font-black text-stone-100 font-sans">ส่งข้อความตรงถึงรุกขกรฝ่ายจัดสรรพื้นที่</h3>
            <p className="text-[11px] text-emerald-400 font-medium">
              มีคำถามเกี่ยวกับระบบ จัดซื้อกล้าไม้เป็นกลุ่มใหญ่ หรือติดต่อลงงานพื้นที่จริง ยินดีต้อนรับครับ
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form 
                key="contact-form"
                onSubmit={handleContactSubmit} 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">ชื่อ-นามสกุล ของท่าน *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="คุณ รักดิน ปลูกไพร"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      className="w-full bg-white/5 border border-emerald-900/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">อีเมลติดต่อกลับ *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      value={senderEmail}
                      onChange={e => setSenderEmail(e.target.value)}
                      className="w-full bg-white/5 border border-emerald-900/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">หัวข้อสอบถาม</label>
                  <input 
                    type="text" 
                    placeholder="ต้องการสนับสนุนพันธุ์ไม้ระดับกลุ่ม / ปัญหาการตรวจสอบพิกัด"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-white/5 border border-emerald-900/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">ข้อความรายละเอียด *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="พิมพ์ข้อความที่ต้องการแจ้งแก่เจ้าหน้าที่ฝ่ายจัดสรรหรือฝ่ายเทคนิคพิทักษ์ป่า..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-white/5 border border-emerald-900/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อความ'}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="contact-success"
                className="space-y-6 text-center py-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-display font-semibold text-white text-base">ได้รับข้อความของท่านแล้ว!</h4>
                  <p className="font-sans text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                    ขอบคุณที่ร่วมเป็นกำลังสำคัญในแคมเปญฯ ทีมผู้พิทักษ์ป่าจะจัดทำข้อมูลเพื่อตอบกลับทางอีเมลที่ระบุภายใน 24 ชั่วโมง
                  </p>
                </div>

                {/* Simulated Ranger Live chat bubble response */}
                <div className="bg-black/40 border border-emerald-900/20 rounded-2xl p-4 text-left space-y-3 font-sans relative">
                  <div className="flex items-center gap-2 text-stone-400 border-b border-emerald-900/10 pb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">ช่องสนทนาวิทยุสื่อสารตรง</span>
                  </div>

                  {rangerTyping && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 italic">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>รุกขกรพัฒน์ปฐพีกำลังพิมพ์...</span>
                    </div>
                  )}

                  {rangerReply && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 font-bold">รุกขกร พัฒน์ปฐพี</span>
                        <span className="text-[8px] text-stone-500">หัวหน้าฝ่ายลาดตระเวนดอยนางเมาะ</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5">
                        {rangerReply}
                      </p>
                    </motion.div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={resetContactForm}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/10 transition cursor-pointer"
                >
                  เขียนข้อความใหม่
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
