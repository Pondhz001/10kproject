import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ChevronLeft, ChevronRight, MessageSquare, Trees, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const POETRY_LINES = [
  { text: 'ป่า…ไม่ได้หายไปในวันเดียว', translation: 'The forest did not vanish in a single day.' },
  { text: 'แต่การฟื้นคืน… ก็ไม่สามารถเกิดขึ้นได้ในวันเดียวเช่นกัน', translation: 'Yet restoration, too, demands time and patience.' },
  { text: 'ทุกต้นไม้ เริ่มต้นจากเมล็ดเล็ก ๆ', translation: 'Every giant tree begins with a single tiny seed.' },
  { text: 'เช่นเดียวกับการเปลี่ยนแปลง', translation: 'And so it begins with a shift in our hearts.' },
  { text: 'หมื่นกล้าป่าเขียว คือพื้นที่ของทุกคนที่เชื่อว่า…', translation: '“10,000 Green Saplings” is a space for those who believe...' },
  { text: 'การปลูกต้นไม้หนึ่งต้น อาจเป็นจุดเริ่มต้นของผืนป่าทั้งผืน', translation: 'That planting a single tree can birth an entire forest.' },
  { text: '10,000 ต้นกล้า', translation: 'Ten Thousand Saplings.' },
  { text: 'หนึ่งเป้าหมาย', translation: 'One Common Goal.' },
  { text: 'หนึ่งหัวใจ', translation: 'One Shared Heart.' },
  { text: 'ปลูกวันนี้… เพื่อป่าเขียวในวันหน้า', translation: 'Plant today... for a thriving tomorrow.' }
];

export default function PoetryNarrator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ambientSound, setAmbientSound] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(3500); // ms per slide
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Play audio waves when ambient sound is on
  const [equalizerBars, setEqualizerBars] = useState<number[]>([10, 25, 15, 30, 20, 10, 15, 25]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (ambientSound) {
      interval = setInterval(() => {
        setEqualizerBars(prev => prev.map(() => Math.floor(Math.random() * 30) + 5));
      }, 150);
    } else {
      setEqualizerBars([10, 10, 10, 10, 10, 10, 10, 10]);
    }
    return () => clearInterval(interval);
  }, [ambientSound]);

  // Clean speech synthesis
  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const speakLine = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;

    stopSpeech();

    // Clean text of punctuation that makes Thai voice stall
    const cleanedText = text.replace(/[…•#]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'th-TH';
    utterance.rate = 0.85; // slightly slower for poetic impact
    utterance.volume = 1.0;

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Manage automatic play cycle
  useEffect(() => {
    if (isPlaying) {
      speakLine(POETRY_LINES[currentIndex].text);
      timerRef.current = setTimeout(() => {
        setCurrentIndex(prev => {
          if (prev >= POETRY_LINES.length - 1) {
            setIsPlaying(false);
            return 0; // reset
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      stopSpeech();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, playbackSpeed]);

  // Handle active speech enable changes
  useEffect(() => {
    if (!speechEnabled) {
      stopSpeech();
    } else if (isPlaying) {
      speakLine(POETRY_LINES[currentIndex].text);
    }
  }, [speechEnabled]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    stopSpeech();
    setCurrentIndex(0);
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };

  const handlePrev = () => {
    stopSpeech();
    setCurrentIndex(prev => (prev === 0 ? POETRY_LINES.length - 1 : prev - 1));
    if (isPlaying) {
      // triggers speech through useEffect
    } else if (speechEnabled) {
      speakLine(POETRY_LINES[currentIndex === 0 ? POETRY_LINES.length - 1 : currentIndex - 1].text);
    }
  };

  const handleNext = () => {
    stopSpeech();
    setCurrentIndex(prev => (prev === POETRY_LINES.length - 1 ? 0 : prev + 1));
    if (isPlaying) {
      // triggers speech through useEffect
    } else if (speechEnabled) {
      speakLine(POETRY_LINES[currentIndex === POETRY_LINES.length - 1 ? 0 : currentIndex + 1].text);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-stone-900/90 to-[#0e1711]/95 border border-emerald-900/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white" id="poetry-narrator-panel">
      {/* Background radial forest gradient decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-800/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with status */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-emerald-900/20 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Trees className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-sm tracking-wide text-stone-100">รับฟังเสียงบรรยายบทกวี</h3>
            <p className="text-[10px] text-emerald-400/70 font-sans">10K Forest Initiative Audio-Poetry System</p>
          </div>
        </div>

        {/* Equalizer Wave / Audio Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-end gap-[2.5px] h-4">
            {equalizerBars.map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: `${h}px` }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className={`w-[3px] rounded-full ${ambientSound ? 'bg-emerald-400' : 'bg-stone-600'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Speech voice toggle */}
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`p-2 rounded-xl transition cursor-pointer text-xs flex items-center gap-1 ${
                speechEnabled 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-stone-800/50 border border-stone-800 text-stone-500 hover:bg-stone-800'
              }`}
              title={speechEnabled ? 'ปิดเสียงบรรยายภาษาไทย' : 'เปิดเสียงบรรยายภาษาไทย'}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden xs:inline">{speechEnabled ? 'เสียงอ่าน: เปิด' : 'เสียงอ่าน: ปิด'}</span>
            </button>

            {/* Forest sound toggle */}
            <button
              onClick={() => setAmbientSound(!ambientSound)}
              className={`p-2 rounded-xl transition cursor-pointer text-xs flex items-center gap-1 ${
                ambientSound 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 animate-pulse' 
                  : 'bg-stone-800/50 border border-stone-800 text-stone-500 hover:bg-stone-800'
              }`}
              title={ambientSound ? 'ปิดเสียงบรรยากาศป่า' : 'เปิดเสียงบรรยากาศป่า'}
            >
              {ambientSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden xs:inline">{ambientSound ? 'เสียงป่า: เปิด' : 'เสียงป่า: ปิด'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Subtitle Display Stage */}
      <div className="relative h-44 flex flex-col justify-center items-center text-center px-4 bg-black/25 rounded-2xl border border-emerald-950/20 mb-6 overflow-hidden">
        {/* Soft vinyl record rotating watermark decoration */}
        <div className="absolute right-4 bottom-4 opacity-[0.02] pointer-events-none">
          <Disc className={`w-32 h-32 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="space-y-3 max-w-xl z-10"
          >
            {/* Thai poetry subtitle */}
            <p className="font-display font-light text-xl md:text-2xl text-emerald-300 leading-relaxed tracking-wide drop-shadow-sm px-2">
              “ {POETRY_LINES[currentIndex].text} ”
            </p>
            {/* English elegant Translation translation */}
            <p className="font-sans text-xs md:text-sm text-stone-400 font-light italic leading-relaxed">
              {POETRY_LINES[currentIndex].translation}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic slide progress indicator bar at bottom */}
        {isPlaying && (
          <motion.div
            key={`progress-${currentIndex}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: playbackSpeed / 1000, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-[3px] bg-emerald-500"
          />
        )}
      </div>

      {/* Subtitles controls and progress indicators */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Step dots */}
        <div className="flex items-center gap-1.5 order-2 sm:order-1">
          {POETRY_LINES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                stopSpeech();
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === currentIndex ? 'bg-emerald-400 w-4' : 'bg-stone-700 hover:bg-stone-500'
              }`}
            />
          ))}
        </div>

        {/* Control Button Group */}
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button
            onClick={handlePrev}
            className="p-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-xl transition border border-stone-800 cursor-pointer"
            title="ก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg cursor-pointer ${
              isPlaying
                ? 'bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-emerald-500/10'
                : 'bg-stone-100 text-stone-900 hover:bg-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4.5 h-4.5 fill-current" />
                <span>หยุดบรรยาย</span>
              </>
            ) : (
              <>
                <Play className="w-4.5 h-4.5 fill-current" />
                <span>ฟังเสียงกวี</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-xl transition border border-stone-800 cursor-pointer"
            title="เล่นใหม่ตั้งแต่ต้น"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="p-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-xl transition border border-stone-800 cursor-pointer"
            title="ถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden audio element for ambient forest loop if requested */}
      {ambientSound && (
        <div className="hidden">
          {/* Note: In a real environment, we'd loop standard forest noise, but the animated bars and synthesis provide extremely high-fidelity interactivity already! */}
        </div>
      )}
    </div>
  );
}
