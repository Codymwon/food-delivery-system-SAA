import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Plus,
  LogOut,
  Loader2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddressCard from './AddressCard';

export default function ProfileDrawer({ isOpen, onClose }) {
  const { user, profile, logout, addAddress } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Address Form State
  const [label, setLabel] = useState('Hostel');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('VIT Vellore, Tamil Nadu');
  const [zipCode, setZipCode] = useState('632014');
  const [isDefault, setIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  if (!isOpen) return null;

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Customer';
  const displayPhone = profile?.phone || '+91 98765 43210';
  const addresses = profile?.addresses || [];

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    if (!street.trim()) {
      setAddressError('Street address is required.');
      return;
    }

    setSavingAddress(true);
    const res = await addAddress({
      label,
      street: street.trim(),
      city: city.trim(),
      zipCode: zipCode.trim(),
      isDefault,
    });
    setSavingAddress(false);

    if (res.success) {
      setStreet('');
      setShowAddForm(false);
    } else {
      setAddressError(res.error || 'Failed to save address.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Profile</h2>
            <p className="text-xs text-slate-500 font-mono">SWE4007 Microservices Identity</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* User Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/30 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{displayName}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                  <Shield className="w-3 h-3 text-orange-600" />
                  CUSTOMER
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 space-y-2 text-xs text-slate-600 font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || 'customer@vit.ac.in'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayPhone}</span>
              </div>
            </div>
          </div>

          {/* Saved Addresses Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                Saved Delivery Addresses
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddForm ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {/* Address List */}
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  No addresses saved yet.
                </div>
              ) : (
                addresses.map((addr, idx) => (
                  <AddressCard key={addr._id || idx} address={addr} />
                ))
              )}
            </div>

            {/* Add Address Collapsible Form */}
            {showAddForm && (
              <form
                onSubmit={handleAddAddress}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200 mt-3"
              >
                <div className="font-bold text-xs text-slate-900">New Address Details</div>

                {addressError && (
                  <div className="p-2 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
                    {addressError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Label
                  </label>
                  <div className="flex gap-2">
                    {['Hostel', 'Library', 'Lab', 'Other'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLabel(l)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          label === l
                            ? 'bg-orange-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Room / Building / Street
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Block D, Room 412"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Set as default address</span>
                </label>

                <button
                  type="submit"
                  disabled={savingAddress}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                >
                  {savingAddress ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Address
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer: Sign Out Action */}
        <div className="p-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="btn-tactile w-full py-3 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Sign Out & Return to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
