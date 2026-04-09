import React from 'react';
import { MENU_CATEGORIES } from '../data/sidebarData';
import { FeatureItem, AppSettings } from '../types';

interface SidebarProps {
  onSelectFeature: (feature: FeatureItem) => void;
  selectedFeatureId: string | null;
  isOpen: boolean;
  onCloseMobile: () => void;
  appSettings: AppSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onSelectFeature, 
  selectedFeatureId, 
  isOpen,
  onCloseMobile,
  appSettings
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:static top-[89px] bottom-0 left-0 z-40
          w-64 bg-zinc-950 border-r border-zinc-800
          transition-transform duration-300 ease-in-out
          overflow-y-auto custom-scrollbar
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:h-full h-[calc(100vh-89px)]
        `}
      >
        <div className="p-6 space-y-10 pb-20">
          {MENU_CATEGORIES.map((category) => (
            <div key={category.title}>
              <h3 className="elegant-caps text-zinc-500 mb-4 px-2">
                {category.title}
              </h3>
              <div className="space-y-1.5">
                {category.items.map((item) => {
                  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                  };

                  return (
                    <button
                      key={item.id}
                      onMouseMove={handleMouseMove}
                      onClick={() => {
                        onSelectFeature(item);
                        onCloseMobile();
                      }}
                      className={`
                        w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[13px] font-medium transition-all duration-500
                        active:scale-[0.98] hover:scale-[1.01] group/btn relative overflow-hidden
                        border bg-zinc-900/40 backdrop-blur-md tracking-tight
                        ${selectedFeatureId === item.id 
                          ? 'text-white shadow-[0_0_40px_rgba(0,0,0,0.8)]' 
                          : 'text-zinc-500 border-zinc-900/50 hover:text-white hover:border-zinc-700/50'}
                      `}
                      style={{ 
                        backgroundColor: selectedFeatureId === item.id ? `${appSettings.themeColor}20` : undefined,
                        borderColor: selectedFeatureId === item.id ? `${appSettings.themeColor}60` : undefined,
                        boxShadow: selectedFeatureId === item.id ? `0 20px 40px -15px ${appSettings.themeColor}30, inset 0 0 15px ${appSettings.themeColor}10` : undefined
                      }}
                    >
                    {/* Hover Glow Up Effect - Intensified */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ 
                        background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${appSettings.themeColor}15, transparent 40%)`,
                      }}
                    ></div>
                    
                    <div 
                      className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{ 
                        boxShadow: `inset 0 0 30px ${appSettings.themeColor}20, 0 0 20px ${appSettings.themeColor}10`
                      }}
                    ></div>

                    <div 
                      className="absolute -inset-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-1000 pointer-events-none blur-[100px]"
                      style={{ 
                        background: `radial-gradient(circle at center, ${appSettings.themeColor}30 0%, transparent 70%)` 
                      }}
                    ></div>

                    <span 
                      className="relative z-10 transition-all duration-500 group-hover/btn:scale-125 group-hover/btn:rotate-[5deg]"
                      style={{ color: selectedFeatureId === item.id ? appSettings.themeColor : '#71717a' }}
                    >
                      {item.icon}
                    </span>
                    <span className={`relative z-10 transition-all duration-500 ${selectedFeatureId === item.id ? 'font-medium tracking-wider translate-x-2' : 'group-hover/btn:translate-x-2'}`}>
                      {item.label}
                    </span>

                    {/* Permanent Selection Glow Line - More Intense */}
                    {selectedFeatureId === item.id && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 shadow-[0_0_20px_currentColor]"
                        style={{ backgroundColor: appSettings.themeColor, color: appSettings.themeColor }}
                      ></div>
                    )}

                    {/* Active Indicator Dot - More Luminous */}
                    {selectedFeatureId === item.id && (
                      <div 
                        className="absolute right-4 w-2 h-2 rounded-full animate-pulse shadow-[0_0_15px_currentColor]"
                        style={{ backgroundColor: appSettings.themeColor, color: appSettings.themeColor }}
                      ></div>
                    )}
                  </button>
                );
              })}
              </div>
            </div>
          ))}
        </div>

        {/* Attribution Footer */}
        <div className="mt-auto p-6 border-t border-zinc-900/50 bg-zinc-950/50">
          <p className="text-[10px] text-zinc-600 elegant-caps tracking-[0.2em] mb-1">by</p>
          <p 
            className="text-[11px] font-bold tracking-wider uppercase"
            style={{ color: appSettings.themeColor }}
          >
            Bwork Digital agency & Content Studio
          </p>
        </div>
      </aside>
    </>
  );
};