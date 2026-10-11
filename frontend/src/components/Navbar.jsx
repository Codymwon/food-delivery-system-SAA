import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Menu,
  X,
  Compass,
  Clock,
  LogOut,
  ChevronRight,
  User,
  Bike,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  activeOrderId,
  onOpenProfileDrawer,
  onOpenCartDrawer,
}) {
  const { user, profile, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Customer';

  const navLinks = [
    { id: 'restaurants', label: 'Restaurants', icon: Compass },
    { id: 'orders', label: 'My Orders', icon: Clock },
    ...(activeOrderId || activeTab === 'tracker'
      ? [{ id: 'tracker', label: 'Live Tracker', icon: Bike, isLive: true }]
      : []),
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full backdrop-blur-md bg-[#FAF7F2]/90 border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Architecture Pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleNavClick('restaurants')}
            className="flex items-center gap-2.5 text-left group focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EA580C] flex items-center justify-center text-white shadow-sm group-hover:bg-[#C2410C] transition-colors">
              <UtensilsCrossed className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                FoodDash
              </span>
              <span className="text-[10px] text-slate-500 font-medium -mt-1">Campus Delivery</span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors pb-1 border-b-2 ${
                  isActive
                    ? 'text-orange-600 font-semibold border-orange-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
                <span>{link.label}</span>
                {link.isLive && (
                  <span className="relative flex h-2 w-2 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Cart, User Pill */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCartDrawer}
            className="btn-tactile relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EA580C] px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* User Status Pill */}
          <button
            type="button"
            onClick={onOpenProfileDrawer}
            className="btn-tactile flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Open user profile drawer"
          >
            <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-[#EA580C] font-bold text-xs uppercase">
              {displayName.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[110px]">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-500 leading-none mt-0.5">
                Hostel D
              </span>
            </div>
          </button>

          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" strokeWidth={1.75} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white shadow-xl px-4 py-4 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
                    <span>{link.label}</span>
                    {link.isLive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenProfileDrawer();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <User className="w-4 h-4 text-orange-600" strokeWidth={1.75} />
              <span>{displayName} (Customer Profile)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
