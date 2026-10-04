"use client";
import { useFarm } from '@/context/FarmContext';
import { Settings as SettingsIcon, Save, Info } from 'lucide-react';

import { useState, useEffect } from 'react';

const InputField = ({ label, name, value, helpText, step = 1, setPrices }) => {
  const [localVal, setLocalVal] = useState(value === undefined ? '' : value);

  // Sync if global value changes (e.g. initial load)
  useEffect(() => {
    setLocalVal((value === undefined || value === 0) ? '' : value);
  }, [value]);

  const handleChange = (e) => {
    setLocalVal(e.target.value);
  };

  const handleBlur = () => {
    const parsed = parseFloat(localVal);
    if (!isNaN(parsed) && parsed >= 0) {
      setPrices(prev => ({ ...prev, [name]: parsed }));
      setLocalVal(parsed);
    } else {
      setPrices(prev => ({ ...prev, [name]: 0 }));
      setLocalVal('');
    }
  };

  const handleIncrement = (delta) => {
    const parsed = parseFloat(localVal) || 0;
    const newVal = Math.max(0, parsed + delta);
    setPrices(prev => ({ ...prev, [name]: newVal }));
    setLocalVal(newVal);
  };

  return (
    <div className="relative group">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all bg-gray-50/50">
        <span className="pl-4 pr-2 text-gray-400 font-medium">₹</span>
        <input 
          type="number" 
          name={name} 
          value={localVal} 
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full py-3 text-gray-900 bg-transparent focus:outline-none" 
        />
        <div className="flex border-l border-gray-200">
          <button type="button" onClick={() => handleIncrement(-step)} className="px-3 hover:bg-gray-200 text-gray-600 transition">-</button>
          <div className="w-px bg-gray-200"></div>
          <button type="button" onClick={() => handleIncrement(step)} className="px-3 hover:bg-gray-200 text-gray-600 transition">+</button>
        </div>
      </div>
      {helpText && <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1"><Info className="w-3 h-3" /> {helpText}</p>}
    </div>
  );
};

export default function SettingsPage() {
  const { prices, setPrices } = useFarm();

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <SettingsIcon className="w-7 h-7" />
          </div>
          Global Farm Settings
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Configure your market prices. Changes here instantly update Feed and Finance mathematics across the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            Core Commodities
            <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Primary</span>
          </h2>
          <div className="space-y-6">
            <InputField setPrices={setPrices} label="1 Liter Milk Price" name="milk" value={prices.milk} helpText="Average selling price per liter." />
            <InputField setPrices={setPrices} label="1 KG Concentrate Mix Price" name="concentrate" value={prices.concentrate} helpText="Your 24% CP cattle feed formulation cost." />
            <InputField setPrices={setPrices} label="1 KG Paddy Straw Price" name="straw" value={prices.straw} helpText="Dry fodder bulk purchasing price." />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            Green Fodder (₹ / KG)
            <span className="text-xs font-medium bg-green-50 text-green-600 px-3 py-1 rounded-full">Agriculture</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField setPrices={setPrices} label="Super Napier" name="napier" value={prices.napier} step={0.5} />
            <InputField setPrices={setPrices} label="Maize Silage" name="silage" value={prices.silage} step={0.5} />
            <InputField setPrices={setPrices} label="White Sorghum" name="cholam" value={prices.cholam} step={0.5} />
            <InputField setPrices={setPrices} label="Pearl Millet" name="kambu" value={prices.kambu} step={0.5} />
            <InputField setPrices={setPrices} label="Maize Fodder (Green)" name="maize" value={prices.maize} step={0.5} />
            <InputField setPrices={setPrices} label="Velimasal" name="velimasal" value={prices.velimasal} step={0.5} />
            <InputField setPrices={setPrices} label="Kuthiraimasal" name="kuthirai" value={prices.kuthirai} step={0.5} />
            <InputField setPrices={setPrices} label="Karamani" name="karamani" value={prices.karamani} step={0.5} />
          </div>
        </div>
      </div>
    </div>
  );
}
