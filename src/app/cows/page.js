"use client"
import { useState, useEffect } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Plus, Search, Filter, X, Calendar as CalendarIcon, Activity, Wheat } from 'lucide-react';

export default function CowsPage() {
  const { cows, setCows } = useFarm();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewCowId, setViewCowId] = useState(null); // Just store ID
  const [activeFilter, setActiveFilter] = useState('All');

  const viewCow = cows.find(c => c.id === viewCowId);

  // Form State
  const [formData, setFormData] = useState({
    name: '', breed: 'HF Cross', weight: 400, milk: 20, date: '2026-07-01', lactationPhase: 'Peak'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const newCow = {
      id: `COW-0${cows.length + 1}`,
      name: formData.name,
      breed: formData.breed,
      weight: Number(formData.weight),
      milk: Number(formData.milk),
      date: formData.date,
      lactationPhase: formData.lactationPhase
    };
    setCows([...cows, newCow]);
    setIsAddOpen(false);
  };

  const formatDate = (dateObj) => dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cow Management</h1>
          <p className="text-gray-500 mt-1">Manage your herd, track health and breeding.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm font-medium">
          <Plus className="w-5 h-5" />
          Add New Cow
        </button>
      </div>

      {/* Phase Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveFilter(activeFilter === 'Peak' ? 'All' : 'Peak')}
          className={`bg-purple-50 border rounded-xl p-4 flex flex-col justify-center items-center shadow-sm cursor-pointer transition-all ${activeFilter === 'Peak' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-100 hover:border-purple-300'}`}>
          <p className="text-sm font-bold text-purple-800 uppercase tracking-wider">Peak Phase</p>
          <p className="text-3xl font-black text-purple-600 mt-1">{cows.filter(c => c.lactationPhase === 'Peak').length}</p>
        </div>
        <div 
          onClick={() => setActiveFilter(activeFilter === 'Mid' ? 'All' : 'Mid')}
          className={`bg-blue-50 border rounded-xl p-4 flex flex-col justify-center items-center shadow-sm cursor-pointer transition-all ${activeFilter === 'Mid' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-100 hover:border-blue-300'}`}>
          <p className="text-sm font-bold text-blue-800 uppercase tracking-wider">Mid Phase</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{cows.filter(c => c.lactationPhase === 'Mid').length}</p>
        </div>
        <div 
          onClick={() => setActiveFilter(activeFilter === 'Late' ? 'All' : 'Late')}
          className={`bg-emerald-50 border rounded-xl p-4 flex flex-col justify-center items-center shadow-sm cursor-pointer transition-all ${activeFilter === 'Late' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-100 hover:border-emerald-300'}`}>
          <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Late Phase</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{cows.filter(c => c.lactationPhase === 'Late').length}</p>
        </div>
        <div 
          onClick={() => setActiveFilter(activeFilter === 'Dry' ? 'All' : 'Dry')}
          className={`bg-amber-50 border rounded-xl p-4 flex flex-col justify-center items-center shadow-sm cursor-pointer transition-all ${activeFilter === 'Dry' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-100 hover:border-amber-300'}`}>
          <p className="text-sm font-bold text-amber-800 uppercase tracking-wider">Dry Stage</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{cows.filter(c => c.lactationPhase === 'Dry').length}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID, Name..." 
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white shadow-sm"
            />
          </div>
          <button className="px-4 py-2 border rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-100 text-sm font-medium bg-white shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Tag ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Breed</th>
                <th className="px-6 py-4 font-medium">Phase</th>
                <th className="px-6 py-4 font-medium">Weight / Milk</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {cows.filter(cow => activeFilter === 'All' || cow.lactationPhase === activeFilter).map(cow => (
                <tr key={cow.id} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 font-medium text-blue-600">{cow.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{cow.name}</td>
                  <td className="px-6 py-4 text-gray-600">{cow.breed}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${cow.lactationPhase === 'Peak' ? 'bg-purple-50 text-purple-700 border-purple-100' : cow.lactationPhase === 'Mid' ? 'bg-blue-50 text-blue-700 border-blue-100' : cow.lactationPhase === 'Late' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {cow.lactationPhase}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{cow.weight} kg / {cow.milk} L</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setViewCowId(cow.id)} className="text-blue-600 font-semibold hover:underline bg-blue-50 px-3 py-1.5 rounded-md">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cow Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg text-gray-800">Add New Cow</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-500 hover:bg-gray-200 p-1.5 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cow Name / Tag</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Breed</label>
                  <select value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option>HF Cross</option>
                    <option>Jersey Cross</option>
                    <option>General Crossbred</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Lactation Phase</label>
                  <select value={formData.lactationPhase} onChange={e => setFormData({...formData, lactationPhase: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="Peak">Peak</option>
                    <option value="Mid">Mid</option>
                    <option value="Late">Late / Low</option>
                    <option value="Dry">Dry (Pregnant)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (KG)</label>
                  <input required type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Milk (Liters/Day)</label>
                  <input required type="number" value={formData.milk} onChange={e => setFormData({...formData, milk: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Calving Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 shadow-sm hover:bg-blue-700 transition">Save Cow Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {viewCow && (
        <ProfileModal cow={viewCow} onClose={() => setViewCowId(null)} formatDate={formatDate} />
      )}
    </div>
  );
}

function ProfileModal({ cow, onClose, formatDate }) {
  const { prices, setCows } = useFarm();
  const [activeTab, setActiveTab] = useState('breeding');
  
  const dietMode = cow.dietMode || '1'; 

  // Biological 4-Phase Lactation & Feed Logic (ICAR Mode)
  let w = cow.weight;
  let isJersey = cow.breed.includes("Jersey");
  let green_kg_day = 0;
  let straw_kg_day = w * (isJersey ? 0.009 : 0.008);
  
  const calcDailyCost = (yield_liters, phaseFactor) => {
    let dry_kg = straw_kg_day;
    let dry_cost = dry_kg * prices.straw;
    let green_cost = 0, conc_kg = 0;

    let base_conc = 1.5 + (yield_liters / 2.5);

    if (dietMode === '1') {
      green_kg_day = w * 0.05;
      let n = green_kg_day * (7/20), maize = green_kg_day * (5/20), v = green_kg_day * (3/20), ku = green_kg_day * (3/20), ka = green_kg_day * (2/20);
      green_cost = (n * (prices.napier || 0)) + (maize * (prices.maize || 0)) + (v * (prices.velimasal || 0)) + (ku * (prices.kuthirai || 0)) + (ka * (prices.karamani || 0));
      conc_kg = base_conc;
    } else if (dietMode === '2') {
      green_kg_day = (w / 400.0) * (isJersey ? 18.0 : 20.0);
      green_cost = green_kg_day * (prices.silage || 0);
      conc_kg = base_conc * 0.85;
    } else if (dietMode === '3') {
      green_kg_day = w * 0.05;
      green_cost = green_kg_day * (prices.napier || 0);
      conc_kg = base_conc;
    } else if (dietMode === '4' || dietMode === 'custom') { // Fallback
      green_kg_day = w * 0.05;
      let s_kg = 5.0, c_kg = 2.0, kb_kg = 2.0;
      let napier_kg = green_kg_day >= 9.0 ? green_kg_day - 9.0 : 0;
      green_cost = (s_kg * (prices.silage || 0)) + (c_kg * (prices.cholam || 0)) + (kb_kg * (prices.kambu || 0)) + (napier_kg * (prices.napier || 0));
      conc_kg = base_conc * 0.90;
    } else {
      green_cost = 0; conc_kg = 0;
    }

    // Pregnancy / Dry Period Allowance:
    // During the 60-day dry period, the cow requires at least 2 kg of concentrate daily 
    // for fetal growth (NDRI guidelines), even if milk yield is 0.
    if (phaseFactor === 0.0) {
      conc_kg = 2.0;
    }
    
    let conc_cost = conc_kg * prices.concentrate;
    return { cost: green_cost + dry_cost + conc_cost, conc: conc_kg };
  };

  // Standard ICAR/NDRI 305-day Lactation + 60-day Dry Period Model
  const phases = [
    { name: "Phase 1: Early/Peak Lactation", days: 100, yieldFactor: 1.0 },
    { name: "Phase 2: Mid Lactation", days: 100, yieldFactor: 0.80 },
    { name: "Phase 3: Late Lactation", days: 105, yieldFactor: 0.55 },
    { name: "Phase 4: Dry Period (Gestation)", days: 60, yieldFactor: 0.0 }
  ];

  let yearly_milk = 0, yearly_expense = 0;

  const phaseData = phases.map(phase => {
    let daily_milk = cow.milk * phase.yieldFactor;
    yearly_milk += daily_milk * phase.days;
    let res = calcDailyCost(daily_milk, phase.yieldFactor);
    yearly_expense += res.cost * phase.days;
    return { ...phase, daily_milk, daily_cost: res.cost, daily_conc: res.conc };
  });

  let yearly_revenue = yearly_milk * prices.milk;
  let yearly_profit = yearly_revenue - yearly_expense;
  
  const getModeLabel = () => {
    if (dietMode === '1') return '5-Type Green Cocktail';
    if (dietMode === '2') return 'Maize Silage Only';
    if (dietMode === '3') return 'Super Napier Only';
    if (dietMode === '4') return 'Hybrid Mix (Silage + Sorghum + Napier)';
    return 'Unknown';
  };

  // Breeding & Timeline Logic
  const today = new Date('2026-07-02'); // Using mock system date for consistency
  const lastCalving = cow.lastCalvingDate ? new Date(cow.lastCalvingDate) : new Date(cow.date);
  const diffTime = Math.abs(today - lastCalving);
  const dim = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Days in Milk

  let nextHeatText = "";
  let expectedCalvingText = "";
  
  if (cow.isPregnant && cow.inseminationDate) {
    const aiDate = new Date(cow.inseminationDate);
    const calvDate = new Date(aiDate);
    calvDate.setDate(calvDate.getDate() + 280);
    expectedCalvingText = calvDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    nextHeatText = "Pregnant - No Heat Expected";
  } else {
    expectedCalvingText = "Not Pregnant";
    if (dim < 45) {
      const heat1 = new Date(lastCalving);
      heat1.setDate(heat1.getDate() + 45); // Voluntary waiting period
      nextHeatText = `Expected around ${heat1.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else {
      // Find next 21 day multiple from VWP (45 days)
      const cyclesPassed = Math.floor((dim - 45) / 21);
      const nextHeat = new Date(lastCalving);
      nextHeat.setDate(nextHeat.getDate() + 45 + ((cyclesPassed + 1) * 21));
      nextHeatText = `${nextHeat.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (21-Day Cycle)`;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 flex flex-col h-[90vh]">
        
        {/* Header Section with Image and Basic Details */}
        <div className="bg-white border-b shrink-0">
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-6 items-center">
              <img 
                src={cow.image || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=200'} 
                alt="Cow" 
                className="w-24 h-24 rounded-2xl object-cover shadow-sm border-2 border-gray-100"
              />
              <div>
                <h2 className="font-extrabold text-3xl text-gray-900">{cow.name} <span className="text-gray-400 font-medium text-xl">({cow.id})</span></h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">{cow.breed}</span>
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">{cow.age || 'Unknown Age'} • {cow.teeth || '?'} Teeth</span>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">{cow.weight} KG</span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100">Peak: {cow.milk} L/Day</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition"><X className="w-6 h-6"/></button>
          </div>
          
          {/* Tabs */}
          <div className="flex px-6 gap-6 border-t mt-2">
            <button 
              onClick={() => setActiveTab('breeding')}
              className={`py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'breeding' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Breeding & Health Lifecycle
            </button>
            <button 
              onClick={() => setActiveTab('feed')}
              className={`py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'feed' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Feed & Financial Projection
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-6">
          
          {activeTab === 'breeding' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Calves</p>
                  <p className="text-lg font-extrabold text-gray-900">{cow.calves || 'None'}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Lactation Stage</p>
                  <p className="text-lg font-extrabold text-blue-600">{dim} Days In Milk (DIM)</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Pregnancy Status</p>
                  <p className={`text-lg font-extrabold ${cow.isPregnant ? 'text-green-600' : 'text-amber-600'}`}>
                    {cow.isPregnant ? 'Pregnant' : 'Open (Not Pregnant)'}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Last Calved On</p>
                  <p className="text-lg font-extrabold text-gray-900">
                    {lastCalving.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Timeline UI */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400"></div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-500" /> Breeding Action Timeline
                </h3>
                
                <div className="relative border-l-2 border-dashed border-gray-200 ml-4 pl-8 space-y-10">
                  <div className="relative">
                    <div className="absolute -left-[41px] w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow"></div>
                    <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Last Calving</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">{lastCalving.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-sm text-gray-500 mt-1">Cow delivered successfully. 45-day rest period (VWP) started.</p>
                  </div>
                  
                  <div className="relative">
                    <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-4 border-white shadow ${cow.isPregnant ? 'bg-gray-300' : 'bg-rose-500'}`}></div>
                    <p className={`text-sm font-bold uppercase tracking-wide ${cow.isPregnant ? 'text-gray-400' : 'text-rose-600'}`}>Next Heat & AI Injection</p>
                    <p className={`text-lg font-extrabold mt-1 ${cow.isPregnant ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{nextHeatText}</p>
                    <p className={`text-sm mt-1 ${cow.isPregnant ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cow.isPregnant ? 'Cow is already pregnant. Skip AI.' : 'Observe for heat symptoms. Ideal time for Artificial Insemination (AI).'}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-4 border-white shadow ${cow.isPregnant ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    <p className={`text-sm font-bold uppercase tracking-wide ${cow.isPregnant ? 'text-purple-600' : 'text-gray-400'}`}>Next Expected Calving</p>
                    <p className={`text-lg font-extrabold mt-1 ${cow.isPregnant ? 'text-gray-900' : 'text-gray-400'}`}>{expectedCalvingText}</p>
                    <p className={`text-sm mt-1 ${cow.isPregnant ? 'text-gray-500' : 'text-gray-400'}`}>
                      {cow.isPregnant ? 'Ensure dry off 60 days prior to this date.' : 'Awaiting successful AI to calculate next calving.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'feed' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2 mb-1">
                    <Wheat className="w-4 h-4" /> Active Feeding Strategy
                  </h3>
                  <p className="text-xl font-bold text-gray-900">{getModeLabel()}</p>
                </div>
                <a href="/feed" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition border border-blue-200">
                  Manage in Feed Calculator
                </a>
              </div>

              {/* 4-Phase Lactation Dynamics */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 border-b pb-2">
                  <Activity className="w-5 h-5 text-indigo-600" /> ICAR & NDRI Standard 365-Day Lactation Cycle
                </h3>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4 text-sm text-blue-800">
                  <p><strong>Scientific Note:</strong> This exact data projection is strictly based on the <strong>National Dairy Research Institute (NDRI)</strong> and <strong>ICAR</strong> guidelines for a standard 365-day dairy cow cycle (305 days in milk + 60 days dry gestation period).</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Phase</th>
                        <th className="px-4 py-3 font-semibold">Duration</th>
                        <th className="px-4 py-3 font-semibold text-blue-700">Avg Milk / Day</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {phaseData.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                          <td className="px-4 py-3 text-gray-600">{p.days} Days</td>
                          <td className="px-4 py-3 font-bold text-blue-600">{p.daily_milk.toFixed(1)} L</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 1-Year Financial P&L */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 p-6 rounded-2xl shadow-sm">
                  <p className="text-sm text-green-900 font-bold uppercase mb-1">1-Year Total Revenue</p>
                  <p className="text-xs text-green-700 mb-3">Based on {yearly_milk.toFixed(0)} Liters</p>
                  <p className="text-3xl font-extrabold text-green-700">₹ {yearly_revenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 p-6 rounded-2xl shadow-sm">
                  <p className="text-sm text-red-900 font-bold uppercase mb-1">1-Year Feed Expense</p>
                  <p className="text-xs text-red-700 mb-3">Total feed cost for 365 days</p>
                  <p className="text-3xl font-extrabold text-red-700">₹ {yearly_expense.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                </div>

                <div className={`bg-gradient-to-br ${yearly_profit >= 0 ? 'from-blue-50 to-indigo-100 border-blue-200' : 'from-red-50 to-rose-100 border-red-200'} border p-6 rounded-2xl shadow-sm`}>
                  <p className={`text-sm font-bold uppercase mb-1 ${yearly_profit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>1-Year Net Profit</p>
                  <p className={`text-xs mb-3 ${yearly_profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>Revenue minus Feed Expense</p>
                  <p className={`text-4xl font-extrabold ${yearly_profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    ₹ {yearly_profit.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
