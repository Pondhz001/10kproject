import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick
}) => {
  const sizeDimensions = {
    sm: { img: 'w-8 h-8', text: 'text-base', subtext: 'text-[9px]' },
    md: { img: 'w-11 h-11', text: 'text-lg', subtext: 'text-[10px]' },
    lg: { img: 'w-16 h-16', text: 'text-2xl', subtext: 'text-xs' },
    xl: { img: 'w-24 h-24', text: 'text-3xl', subtext: 'text-sm' },
  }[size];

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 group ${onClick ? 'cursor-pointer hover:opacity-95 transition-all' : ''} ${className}`}
    >
      <div className={`relative shrink-0 ${sizeDimensions.img} transition-transform duration-300 group-hover:scale-105`}>
        <img 
          src="/logo.svg" 
          alt="10K หมื่นกล้าป่าเขียว Logo" 
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <h1 className={`font-black tracking-tight text-emerald-950 flex items-center gap-2 font-sans ${sizeDimensions.text}`}>
              <span>หมื่นกล้าป่าเขียว</span>
            </h1>
            <span className="text-[10px] bg-emerald-700 text-amber-300 font-black px-2 py-0.5 rounded-full font-mono shadow-xs border border-emerald-600">
              10K
            </span>
          </div>
          <p className={`text-emerald-800/80 font-mono tracking-wider font-bold ${sizeDimensions.subtext}`}>
            MUEN KLA PA KHIAO FOREST CAMPAIGN
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
