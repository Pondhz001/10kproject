import React, { useState, useMemo } from 'react';
import { Tree } from '../types';
import { TreePine, Eye, Calendar, Sparkles, Scale, Search, CheckCircle, Shovel, Info, X, User, Phone, ArrowRight, Edit2, Save, Upload, Camera, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ForestMapProps {
  trees: Tree[];
  onSelectTree: (tree: Tree | null) => void;
  selectedTree: Tree | null;
  onJoinPlanting?: (index: number) => void;
  onJoinPlantingMultiple?: (indexes: number[], asAdmin: boolean) => void;
  onTreeUpdated?: (tree: Tree) => void;
  onViewCertificate?: (tree: Tree) => void;
  isAdmin?: boolean;
}

export default function ForestMap({ trees, onSelectTree, selectedTree, onJoinPlanting, onJoinPlantingMultiple, onTreeUpdated, onViewCertificate, isAdmin = false }: ForestMapProps) {
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ownerSearchQuery, setOwnerSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'planted'>('all');
  
  // Active range of seedling numbers to display (by default 100001 - 100120 to show initial active ones)
  const [startRange, setStartRange] = useState<number>(100001);
  const itemsPerPage = 80;

  // Selected available indexes state (for seedlings that are not yet planted, allowing multiple selections)
  const [selectedAvailableIndexes, setSelectedAvailableIndexes] = useState<number[]>([]);

  // Edit states for selected tree in the modal
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editOwnerName, setEditOwnerName] = useState<string>('');
  const [editOwnerPhone, setEditOwnerPhone] = useState<string>('');
  const [editHeight, setEditHeight] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'Seedling' | 'Growing' | 'Young Tree' | 'Mature'>('Seedling');
  const [editCarbonOffset, setEditCarbonOffset] = useState<number>(0);
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [appendNewLog, setAppendNewLog] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Local image upload states
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Ref to track the last active tree ID for edit state sync logic
  const lastActiveTreeIdRef = React.useRef<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setUploadError('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, JPEG)');
        return;
      }

      setIsUploadingImage(true);
      setUploadError(null);

      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64Data })
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || 'Upload failed');
            }

            const data = await res.json();
            setEditImageUrl(data.imageUrl);
          } catch (err: any) {
            console.error('Upload request failed:', err);
            setUploadError('อัปโหลดรูปล้มเหลว กรุณาลองใหม่อีกครั้ง');
          } finally {
            setIsUploadingImage(false);
          }
        };
        reader.onerror = () => {
          setUploadError('เกิดข้อผิดพลาดในการอ่านไฟล์');
          setIsUploadingImage(false);
        };
      } catch (err) {
        console.error('File reading failed:', err);
        setUploadError('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        setIsUploadingImage(false);
      }
    }
  };

  // Sync edit states whenever selectedTree changes
  React.useEffect(() => {
    if (!selectedTree) {
      lastActiveTreeIdRef.current = null;
      return;
    }

    const isDifferentTree = lastActiveTreeIdRef.current !== selectedTree.id;
    
    if (isDifferentTree) {
      // Switched to a completely different tree, reset all edit states and default to view mode
      setEditOwnerName(selectedTree.ownerName || '');
      setEditOwnerPhone(selectedTree.ownerPhone || '');
      setEditHeight(selectedTree.height || 0);
      setEditStatus(selectedTree.status || 'Seedling');
      setEditCarbonOffset(selectedTree.carbonOffset || 0);

      const latestCare = selectedTree.careHistory?.[selectedTree.careHistory.length - 1];
      setEditImageUrl(latestCare?.image || '');
      setEditNote(latestCare?.note || '');
      setAppendNewLog(false);

      setIsEditing(false);
      setSaveError(null);
      lastActiveTreeIdRef.current = selectedTree.id;
    } else if (!isEditing) {
      // Same tree, and we are NOT in editing mode - update fields with live polled data
      setEditOwnerName(selectedTree.ownerName || '');
      setEditOwnerPhone(selectedTree.ownerPhone || '');
      setEditHeight(selectedTree.height || 0);
      setEditStatus(selectedTree.status || 'Seedling');
      setEditCarbonOffset(selectedTree.carbonOffset || 0);

      const latestCare = selectedTree.careHistory?.[selectedTree.careHistory.length - 1];
      setEditImageUrl(latestCare?.image || '');
      setEditNote(latestCare?.note || '');
      setSaveError(null);
    }
    // If same tree and currently editing (isEditing === true), we do absolutely nothing
    // so that we don't overwrite the user's keystrokes or close the edit state during background polling sync!
  }, [selectedTree, isEditing]);

  const handleSaveTreeEdit = async () => {
    if (!selectedTree) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/trees/${selectedTree.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: editOwnerName,
          ownerPhone: editOwnerPhone,
          height: editHeight,
          status: editStatus,
          carbonOffset: editCarbonOffset,
          imageUrl: editImageUrl,
          note: editNote,
          appendNewLog: appendNewLog,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update tree information');
      }

      const updatedTree = await response.json();
      if (onTreeUpdated) {
        onTreeUpdated(updatedTree);
      }
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  // Pre-calculate mapped trees by index for O(1) lookups
  const treesMap = useMemo(() => {
    const map = new Map<number, Tree>();
    trees.forEach(t => map.set(t.index, t));
    return map;
  }, [trees]);

  // Generate list of seedling numbers to display based on selected range or search
  const displayedSeedlings = useMemo(() => {
    // If there is an owner search query, filter the actual planted trees list
    if (ownerSearchQuery.trim()) {
      const q = ownerSearchQuery.trim().toLowerCase();
      const list = [];
      for (const tree of trees) {
        const nameMatch = tree.ownerName && tree.ownerName.toLowerCase().includes(q);
        const phoneMatch = tree.ownerPhone && tree.ownerPhone.includes(q);
        if (nameMatch || phoneMatch) {
          list.push({
            index: tree.index,
            tree,
            isPlanted: true
          });
        }
      }
      return list;
    }

    // If there is a search query, show that specific item (if valid) plus surrounding items
    const searchNum = parseInt(searchQuery);
    if (!isNaN(searchNum) && searchNum >= 100001 && searchNum <= 110000) {
      // Return a small list centered on the searched number
      const list = [];
      const start = Math.max(100001, searchNum - 2);
      const end = Math.min(110000, searchNum + 2);
      for (let i = start; i <= end; i++) {
        const existingTree = treesMap.get(i);
        const isPlanted = !!existingTree;
        
        if (filterStatus === 'available' && isPlanted) continue;
        if (filterStatus === 'planted' && !isPlanted) continue;
        
        list.push({
          index: i,
          tree: existingTree || null,
          isPlanted
        });
      }
      return list;
    }

    // Default: generate list of indexes for the current range page
    const list = [];
    const endRange = Math.min(110000, startRange + itemsPerPage - 1);
    
    for (let i = startRange; i <= endRange; i++) {
      const existingTree = treesMap.get(i);
      const isPlanted = !!existingTree;
      
      if (filterStatus === 'available' && isPlanted) continue;
      if (filterStatus === 'planted' && !isPlanted) continue;

      list.push({
        index: i,
        tree: existingTree || null,
        isPlanted
      });
    }
    return list;
  }, [startRange, searchQuery, ownerSearchQuery, filterStatus, treesMap, trees]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Seedling': return 'bg-lime-50 text-lime-700 border-lime-200/50';
      case 'Growing': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'Young Tree': return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'Mature': return 'bg-amber-100 text-amber-800 border-amber-300/50';
      default: return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  const handleSelectSeedlingIndex = (index: number, existingTree: Tree | null) => {
    if (existingTree) {
      onSelectTree(existingTree);
    } else {
      onSelectTree(null);
      setSelectedAvailableIndexes(prev => {
        if (prev.includes(index)) {
          return prev.filter(i => i !== index);
        } else {
          return [...prev, index];
        }
      });
    }
  };

  // Helper to check if a specific index is selected in UI
  const isIndexSelected = (index: number) => {
    if (selectedTree && selectedTree.index === index) return true;
    return selectedAvailableIndexes.includes(index);
  };

  // Calculate percentage of booked seedlings
  const bookingPercentage = ((trees.length / 10000) * 100).toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="seedling-directory-container">
      
      {/* Interactive Seedling Choices Directory */}
      <div className="lg:col-span-2 bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-sm flex flex-col relative min-h-[550px]">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Header Block */}
        <div className="z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
              <TreePine className="text-emerald-600 w-5 h-5" />
              กล้าไม้สักในโครงการ (100001 - 110000)
            </h3>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              เลือกกล้าสักเพื่อร่วมปลูก • ร่วมปลูกแล้ว {trees.length} กล้า / ทั้งหมด 10,000 กล้า ({bookingPercentage}%)
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="bg-amber-50 border border-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-2xl text-[11px] font-mono shadow-sm">
            กล้าสักเริ่มต้นที่ #100001
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 z-10">
          
          {/* Search Box (Number) */}
          <div className="md:col-span-3 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="ค้นหาตามรหัส..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setOwnerSearchQuery(''); // clear other search when typing this
              }}
              className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white text-stone-900 placeholder-stone-400 rounded-xl pl-10 pr-4 py-3 text-xs transition font-mono"
            />
          </div>

          {/* Search Box (Owner Name/Phone) */}
          <div className="md:col-span-3 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="ค้นตามชื่อผู้ร่วมปลูก..."
              value={ownerSearchQuery}
              onChange={(e) => {
                setOwnerSearchQuery(e.target.value);
                if (e.target.value) setSearchQuery(''); // clear other search when typing this
              }}
              className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white text-stone-900 placeholder-stone-400 rounded-xl pl-10 pr-4 py-3 text-xs transition"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3 flex bg-stone-100/80 p-1 rounded-xl border border-stone-200">
            {(['all', 'available', 'planted'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  filterStatus === status
                    ? 'bg-white text-emerald-800 border border-emerald-900/5 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {status === 'all' ? 'ทั้งหมด' : 
                 status === 'available' ? 'ว่าง' : 'ร่วมปลูกแล้ว'}
              </button>
            ))}
          </div>

          {/* Range Selector Dropdown (When not searching) */}
          <div className="md:col-span-3">
            <select
              disabled={!!searchQuery || !!ownerSearchQuery}
              value={startRange}
              onChange={(e) => setStartRange(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs text-stone-700 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition disabled:opacity-40"
            >
              <option value={100001}>#100001 - #100080</option>
              <option value={100081}>#100081 - #100160</option>
              <option value={100161}>#100161 - #100240</option>
              <option value={100241}>#100241 - #100320</option>
              <option value={100321}>#100321 - #100400</option>
              <option value={100401}>#100401 - #100500</option>
              <option value={100501}>#100501 - #101000</option>
              <option value={101001}>#101001 - #102000</option>
              <option value={102001}>#102001 - #105000</option>
              <option value={105001}>#105001 - #110000</option>
            </select>
          </div>
        </div>

        {/* Seedling Grid Container */}
        <div className="flex-1 bg-stone-50/50 border border-emerald-900/5 rounded-2xl p-4 min-h-[380px] z-10 shadow-inner">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2.5">
            {displayedSeedlings.map(({ index, tree, isPlanted }) => {
              const active = isIndexSelected(index);
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleSelectSeedlingIndex(index, tree)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative p-2.5 rounded-xl border text-left transition flex flex-col justify-between h-[64px] ${
                    active
                      ? 'bg-amber-500 border-amber-400 text-stone-900 shadow-md shadow-amber-500/10 z-20 font-bold'
                      : isPlanted
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50'
                        : 'bg-white border-stone-200 text-stone-400 hover:border-amber-400 hover:bg-stone-50'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold block ${active ? 'text-stone-950' : 'text-stone-500'}`}>
                    #{index}
                  </span>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[9px] font-medium truncate max-w-[65px] ${active ? 'text-stone-950' : 'text-stone-600'}`} title={isPlanted ? (tree?.ownerName || 'ร่วมปลูกแล้ว') : 'ว่าง'}>
                      {isPlanted ? (tree?.ownerName || 'ร่วมปลูกแล้ว') : 'ว่าง'}
                    </span>
                    {isPlanted ? (
                      <TreePine className={`w-3.5 h-3.5 ${active ? 'text-stone-950' : 'text-emerald-600'}`} />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-stone-950' : 'bg-stone-300'}`} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Empty Directory State */}
          {displayedSeedlings.length === 0 && (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6">
              <TreePine className="w-10 h-10 text-stone-400 mb-2 animate-bounce" />
              <p className="text-stone-600 text-sm font-semibold">ไม่พบข้อมูลกล้าสักในช่วงที่ระบุ</p>
              <p className="text-stone-400 text-xs mt-1">กรุณาปรับตัวกรอง หรือขยายช่วงการค้นหาด้านบน</p>
            </div>
          )}
        </div>

        {/* Pagination Quick Control */}
        {!searchQuery && (
          <div className="mt-4 flex items-center justify-between border-t border-stone-150 pt-3 z-10">
            <button
              disabled={startRange <= 100001}
              onClick={() => setStartRange(prev => Math.max(100001, prev - itemsPerPage))}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-800 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-[11px] font-mono transition border border-stone-200 shadow-sm"
            >
              ← ย้อนกลับ
            </button>

            <span className="text-[11px] font-mono text-stone-500">
              กำลังแสดงช่วง #{startRange} - #{Math.min(110000, startRange + itemsPerPage - 1)}
            </span>

            <button
              disabled={startRange + itemsPerPage >= 110000}
              onClick={() => setStartRange(prev => Math.min(110000, prev + itemsPerPage))}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-800 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-[11px] font-mono transition border border-stone-200 shadow-sm"
            >
              หน้าถัดไป →
            </button>
          </div>
        )}
      </div>

      {/* Selected Seedling Detail Sidebar Panel */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between overflow-hidden relative min-h-[550px]">
        <AnimatePresence mode="wait">
          
          {/* CASE 1: Already Planted Tree Selected */}
          {selectedTree ? (
            <motion.div
              key={`planted-${selectedTree.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col justify-between h-full space-y-4"
            >
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-stone-150 bg-stone-100 group">
                  <img
                    src={
                      selectedTree.careHistory?.[selectedTree.careHistory.length - 1]?.image ||
                      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80'
                    }
                    alt="Teak wood tracking"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />
                  
                  {/* Badge */}
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(selectedTree.status)}`}>
                    {selectedTree.status === 'Seedling' ? '🌱 ต้นกล้า' : 
                     selectedTree.status === 'Growing' ? '🌿 กำลังโต' : 
                     selectedTree.status === 'Young Tree' ? '🌳 สักรุ่นเยาว์' : '🌲 สักเต็มวัย'}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] text-emerald-400 font-mono font-bold">หมายเลขกล้าไม้สัก</p>
                    <h4 className="text-lg font-bold text-white font-mono">
                      #MK-{selectedTree.index}
                    </h4>
                  </div>
                </div>

                {/* Owner info */}
                <div className="space-y-3">
                  <div className="bg-emerald-50/20 p-3.5 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] text-stone-500 uppercase font-mono">ผู้ร่วมปลูก / เจ้าของดูแล</p>
                    <p className="text-sm font-semibold text-stone-900 mt-1">{selectedTree.ownerName}</p>
                    <p className="text-xs text-stone-600 font-mono mt-0.5">{selectedTree.ownerPhone}</p>
                    {onViewCertificate && (
                      <button
                        onClick={() => onViewCertificate(selectedTree)}
                        className="w-full mt-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 hover:border-amber-400 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        ดูใบประกาศเกียรติคุณ
                      </button>
                    )}
                  </div>

                  {/* Growth stats bento */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-150 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-stone-400">
                        <span className="text-[10px] font-mono">ความสูง</span>
                        <Scale className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-xl font-bold font-mono text-stone-900 mt-2">
                        {selectedTree.height} <span className="text-xs text-stone-500 font-normal">ซม.</span>
                      </p>
                    </div>

                    <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-150 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-stone-400">
                        <span className="text-[10px] font-mono">ดูดซับ CO₂</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      </div>
                      <p className="text-xl font-bold font-mono text-stone-900 mt-2">
                        {selectedTree.carbonOffset} <span className="text-xs text-stone-500 font-normal">กก./ปี</span>
                      </p>
                    </div>
                  </div>

                  {/* Planting date */}
                  <div className="flex items-center justify-between text-xs font-mono text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      วันที่ปลูก: {new Date(selectedTree.plantedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Slip Verification details if available */}
                  {selectedTree.slipDetails && (
                    <div className="bg-emerald-50/20 p-3 rounded-2xl border border-emerald-100 space-y-1.5 text-[11px] text-stone-600 font-mono">
                      <p className="text-stone-800 font-sans font-bold text-xs mb-1 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> ข้อมูลยืนยันการร่วมปลูก
                      </p>
                      {selectedTree.slipDetails.senderName && (
                        <div className="flex justify-between">
                          <span>ชื่อในสลิป:</span>
                          <span className="text-stone-800 font-sans">{selectedTree.slipDetails.senderName}</span>
                        </div>
                      )}
                      {selectedTree.slipDetails.sendingBank && (
                        <div className="flex justify-between">
                          <span>ธนาคารผู้โอน:</span>
                          <span className="text-stone-800 font-sans">{selectedTree.slipDetails.sendingBank}</span>
                        </div>
                      )}
                      {selectedTree.slipDetails.refId && (
                        <div className="flex justify-between">
                          <span>เลขอ้างอิงสลิป:</span>
                          <span className="text-stone-700">{selectedTree.slipDetails.refId}</span>
                        </div>
                      )}
                      {selectedTree.slipDetails.transDate && (
                        <div className="flex justify-between">
                          <span>วันเวลาโอน:</span>
                          <span className="text-stone-700">
                            {selectedTree.slipDetails.transDate} {selectedTree.slipDetails.transTime || ''}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-emerald-100 pt-1.5 mt-1 font-bold">
                        <span>สถานะระบบ:</span>
                        <span className="text-emerald-700 font-sans">รับรองสลิปสำเร็จ (slip2go)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-stone-500 leading-normal border-t border-stone-150 pt-4 mt-2">
                * ต้นไม้สักทุกต้นจะได้รับการดูแลใส่ปุ๋ยอินทรีย์และถางหญ้าอย่างดีจากสมาคมอนุรักษ์ธรรมชาติเพื่อการเจริญเติบโตที่สมบูรณ์อย่างยั่งยืน
              </p>
            </motion.div>
          ) : selectedAvailableIndexes.length > 0 ? (
            
            // CASE 2: Multiple Available Seedlings Selected
            <motion.div
              key="available-multiple"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col justify-between h-full"
            >
              <div className="space-y-5">
                {/* Visual Cover Header */}
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-emerald-100 bg-emerald-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-emerald-50 to-white" />
                  <TreePine className="w-16 h-16 text-emerald-200 absolute top-4 right-4" />
                  
                  <div className="z-10 text-center">
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-block mb-2 shadow-sm">
                      🟢 เลือกแล้ว ({selectedAvailableIndexes.length} ต้นกล้า)
                    </span>
                    <h4 className="text-2xl font-black text-emerald-950 tracking-tight">
                      พร้อมร่วมปลูก
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono mt-1">
                      โครงการหมื่นกล้าป่าเขียว
                    </p>
                  </div>
                </div>

                {/* Selected Indexes Chip List */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-stone-500 font-mono">หมายเลขกล้าไม้สักที่คุณเลือก:</span>
                    <button
                      onClick={() => setSelectedAvailableIndexes([])}
                      className="text-[10px] text-stone-500 hover:text-red-600 font-bold transition underline"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {selectedAvailableIndexes.sort((a, b) => a - b).map((idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1"
                      >
                        #{idx}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAvailableIndexes(prev => prev.filter(i => i !== idx));
                          }}
                          className="text-stone-400 hover:text-emerald-800 text-[10px] font-bold pl-1 border-l border-emerald-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Benefits / Details */}
                <div className="space-y-3">
                  <div className="bg-emerald-50/20 p-3.5 rounded-xl border border-emerald-100 space-y-2 text-xs">
                    <h5 className="text-[11px] font-bold text-stone-500 font-mono uppercase tracking-wider">สิทธิและสิ่งที่จะได้รับ:</h5>
                    <ul className="space-y-1 text-stone-700">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✔</span>
                        <span>ร่วมลงทะเบียนกล้าไม้สักรหัสที่เลือก ({selectedAvailableIndexes.length} ต้น)</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✔</span>
                        <span>สลักชื่อผู้ร่วมปลูกบนป้ายแทรกและใบประกาศเกียรติคุณ</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✔</span>
                        <span>รับรายงานความเจริญเติบโต ภาพถ่ายจริงตลอดอายุขัยฟรี</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Member and Admin */}
              <div className="pt-4 border-t border-stone-150 mt-4 flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    if (onJoinPlantingMultiple) {
                      onJoinPlantingMultiple(selectedAvailableIndexes, false);
                    }
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  ร่วมปลูกสำหรับสมาชิก 👑 ({selectedAvailableIndexes.length * 100}฿)
                </button>
                
                <button
                  onClick={() => {
                    if (onJoinPlantingMultiple) {
                      onJoinPlantingMultiple(selectedAvailableIndexes, true);
                    }
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Shovel className="w-3.5 h-3.5" />
                  บันทึกปลูกแอดมิน 🛠 (ฟรี)
                </button>
              </div>
            </motion.div>
          ) : (
            
            // CASE 3: No Selection (Empty Welcome State)
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
                <Eye className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-stone-800">ข้อมูลกล้าไม้สักในโครงการ</h4>
                <p className="text-xs text-stone-500 max-w-[220px] leading-relaxed">
                  คลิกกล่องหมายเลขกล้าไม้สักบนตารางเพื่อสืบค้นประวัติ อัตราเจริญเติบโต และข้อมูลผู้ร่วมปลูก หรือเลือกคลิกหมายเลขกล้าที่ว่างเพื่อตรวจสอบสถานะ <strong className="text-emerald-700 font-semibold">(สามารถเลือกพร้อมกันหลายกล้าได้!)</strong>
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pop-up Modal for Already Planted Tree Details */}
      <AnimatePresence>
        {selectedTree && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onSelectTree(null)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative bg-white border border-emerald-900/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col z-10 max-h-[90vh] text-stone-800"
            >
              {/* Close Button */}
              <button
                onClick={() => onSelectTree(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800 transition cursor-pointer z-30"
              >
                <X className="w-4 h-4" />
              </button>

              {!isEditing && isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-4 right-16 p-2 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer z-30"
                  title="แก้ไขข้อมูล"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {/* Cover Image Block */}
              <div className="relative aspect-video w-full bg-stone-100 overflow-hidden">
                <img
                  src={
                    selectedTree.careHistory?.[selectedTree.careHistory.length - 1]?.image ||
                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'
                  }
                  alt="Teak wood tracking"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent" />
                
                {/* Float badges */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-wider uppercase">กล้าไม้สักโครงการหมื่นกล้าป่าเขียว</span>
                    <h3 className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
                      #MK-{selectedTree.index}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(isEditing ? editStatus : selectedTree.status)} shadow-sm`}>
                    {(isEditing ? editStatus : selectedTree.status) === 'Seedling' ? '🌱 ต้นกล้า' : 
                     (isEditing ? editStatus : selectedTree.status) === 'Growing' ? '🌿 กำลังโต' : 
                     (isEditing ? editStatus : selectedTree.status) === 'Young Tree' ? '🌳 สักรุ่นเยาว์' : '🌲 สักเต็มวัย'}
                  </span>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
                
                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium font-sans">
                    {saveError}
                  </div>
                )}

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-center text-stone-500">
                      <span className="text-xs font-mono font-medium">ความสูงปัจจุบัน</span>
                      <Scale className="w-4 h-4 text-emerald-600" />
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-2">
                        <input
                          type="number"
                          value={editHeight}
                          onChange={(e) => setEditHeight(Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-sm font-mono text-stone-900 focus:outline-none focus:border-emerald-600"
                        />
                        <span className="text-xs text-stone-500">ซม.</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-black font-mono text-stone-900 mt-2">
                        {selectedTree.height} <span className="text-xs text-stone-500 font-normal">ซม.</span>
                      </p>
                    )}
                  </div>

                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-center text-stone-500">
                      <span className="text-xs font-mono font-medium">ดูดซับ CO₂ สะสม</span>
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-2">
                        <input
                          type="number"
                          step="0.1"
                          value={editCarbonOffset}
                          onChange={(e) => setEditCarbonOffset(Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-sm font-mono text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                        <span className="text-xs text-stone-500">กก./ปี</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-black font-mono text-stone-900 mt-2">
                        {selectedTree.carbonOffset} <span className="text-xs text-stone-500 font-normal">กก./ปี</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Owner details */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold font-mono text-stone-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-200 pb-2">
                    <User className="w-4 h-4 text-emerald-600" /> ข้อมูลผู้ร่วมอนุรักษ์ดูแล
                  </h4>
                  {isEditing ? (
                    <div className="space-y-3 font-sans">
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-500 font-mono block">ชื่อผู้ร่วมปลูก</label>
                        <input
                          type="text"
                          value={editOwnerName}
                          onChange={(e) => setEditOwnerName(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 transition"
                          placeholder="ระบุชื่อผู้ร่วมปลูก..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-500 font-mono block">ช่องทางติดต่อ</label>
                        <input
                          type="text"
                          value={editOwnerPhone}
                          onChange={(e) => setEditOwnerPhone(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 transition font-mono"
                          placeholder="ระบุเบอร์โทรศัพท์..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-500 font-mono block">สถานะต้นไม้สัก</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 transition cursor-pointer"
                        >
                          <option value="Seedling">🌱 ต้นกล้า (Seedling)</option>
                          <option value="Growing">🌿 กำลังโต (Growing)</option>
                          <option value="Young Tree">🌳 สักรุ่นเยาว์ (Young Tree)</option>
                          <option value="Mature">🌲 สักเต็มวัย (Mature)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-700 font-sans uppercase tracking-wider block">รูปภาพถ่ายจากการติดตามดูแล (Image URL)</label>
                        
                        <div className="space-y-2">
                          {/* Main URL text input */}
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-2.5 text-stone-400">
                                <ImageIcon className="w-4 h-4" />
                              </span>
                              <input
                                type="text"
                                value={editImageUrl}
                                onChange={(e) => setEditImageUrl(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 transition font-mono"
                                placeholder="วางลิ้ง URL ของภาพ (เช่น https://...) หรือกดอัปโหลดด้านขวา"
                              />
                            </div>
                            
                            {/* Upload button helper */}
                            <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition text-xs font-bold shrink-0 min-w-[90px]">
                              {isUploadingImage ? (
                                <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>อัปโหลด</span>
                                </>
                              )}
                              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                          </div>

                          {uploadError && (
                            <p className="text-[10px] text-red-600 font-medium font-sans">{uploadError}</p>
                          )}

                          {/* Image preview with live state */}
                          {editImageUrl ? (
                            <div className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-50 aspect-video max-h-40 shadow-sm mt-1">
                              <img src={editImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditImageUrl('')}
                                  className="bg-stone-900/80 hover:bg-red-600 text-white p-1.5 rounded-lg transition shadow-md"
                                  title="ลบรูปภาพ"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-stone-900/60 px-3 py-1.5 text-[10px] text-white font-mono truncate">
                                {editImageUrl}
                              </div>
                            </div>
                          ) : (
                            <div className="border border-dashed border-stone-200 rounded-xl p-6 text-center bg-stone-50/50">
                              <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-1" />
                              <p className="text-[11px] text-stone-400">ยังไม่มีการเพิ่มรูปภาพ</p>
                              <p className="text-[9px] text-stone-400">วางลิ้ง URL ของรูปภาพ หรือคลิกปุ่ม "อัปโหลด" เพื่ออัปโหลดไฟล์</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-500 font-mono block">บันทึกโน้ตการติดตาม</label>
                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          rows={2}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 transition font-sans resize-none"
                          placeholder="ระบุโน้ตความคืบหน้าการดูแล..."
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="appendNewLog"
                          checked={appendNewLog}
                          onChange={(e) => setAppendNewLog(e.target.checked)}
                          className="rounded bg-white border-stone-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <label htmlFor="appendNewLog" className="text-[11px] text-stone-700 font-medium cursor-pointer select-none">
                          บันทึกเป็นประวัติการติดตามรายการใหม่ (แทนที่จะแก้ไขรายการล่าสุด)
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-stone-500 block text-[10px]">ชื่อผู้ร่วมปลูก</span>
                          <span className="text-stone-900 text-sm font-sans font-semibold mt-0.5 block">{selectedTree.ownerName}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">ช่องทางติดต่อ</span>
                          <span className="text-stone-800 text-sm mt-0.5 block flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {selectedTree.ownerPhone}
                          </span>
                        </div>
                      </div>
                      {onViewCertificate && (
                        <button
                          onClick={() => {
                            onViewCertificate(selectedTree);
                            onSelectTree(null); // Close the modal
                          }}
                          className="w-full mt-2 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 hover:border-amber-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          ดูใบประกาศเกียรติคุณ
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Date & Slip details */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-sm space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-stone-600">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      วันที่ลงทะเบียนร่วมปลูก:
                    </span>
                    <span className="text-stone-800 font-semibold">
                      {new Date(selectedTree.plantedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  {selectedTree.slipDetails && (
                    <div className="border-t border-stone-200 pt-3 mt-2 space-y-1.5 text-[11px] text-stone-600">
                      <p className="text-emerald-700 font-sans font-bold text-xs mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> ตรวจสอบผ่านระบบ slip2go สำเร็จ
                      </p>
                      {selectedTree.slipDetails.senderName && (
                        <div className="flex justify-between">
                          <span>ชื่อบัญชีผู้โอน:</span>
                          <span className="text-stone-800 font-sans">{selectedTree.slipDetails.senderName}</span>
                        </div>
                      )}
                      {selectedTree.slipDetails.sendingBank && (
                        <div className="flex justify-between">
                          <span>ธนาคารต้นทาง:</span>
                          <span className="text-stone-800 font-sans">{selectedTree.slipDetails.sendingBank}</span>
                        </div>
                      )}
                      {selectedTree.slipDetails.refId && (
                        <div className="flex justify-between">
                          <span>เลขอ้างอิงสลิป:</span>
                          <span className="text-stone-700">{selectedTree.slipDetails.refId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Care & Maintenance log history */}
                {selectedTree.careHistory && selectedTree.careHistory.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold font-mono text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <TreePine className="w-4 h-4 text-emerald-600" /> ประวัติการดูแลรักษาและการเติบโต
                    </h4>
                    
                    <div className="space-y-3 border-l-2 border-emerald-200 ml-2.5 pl-4">
                      {selectedTree.careHistory.map((log, logIdx) => (
                        <div key={logIdx} className="relative space-y-1 text-xs">
                          {/* Dot indicator */}
                          <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-stone-400">{log.date}</span>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {log.status}
                            </span>
                            <span className="text-stone-500 font-mono text-[10px]">ความสูง: {log.height} ซม.</span>
                          </div>
                          <p className="text-stone-700 text-xs leading-relaxed">{log.note}</p>
                          {log.image && (
                            <div className="mt-1.5 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 max-w-[240px] aspect-video shadow-sm group relative">
                              <img src={log.image} alt="ภาพความคืบหน้าการเติบโต" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions/Footer */}
              {isEditing ? (
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 z-20">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSaveError(null);
                    }}
                    className="flex-1 py-2.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-medium text-xs rounded-xl transition cursor-pointer text-center"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveTreeEdit}
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer text-center shadow-sm"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        บันทึกข้อมูล
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-stone-50 border-t border-stone-150 text-center text-[11px] text-stone-500 font-sans">
                  โครงการร่วมฟื้นฟูป่าชุมชนอย่างยั่งยืน • ดูแลรักษาโดยทีมวิชาการป่าไม้ชุมชน
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
