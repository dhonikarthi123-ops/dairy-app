"use client";
import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Dna, Calendar, Plus, TestTube, CheckCircle2, Clock, AlertTriangle, Snowflake, ArrowRight } from 'lucide-react';

export default function BreedingPage() {
  const { cows } = useFarm();
  const [isLogAIModalOpen, setIsLogAIModalOpen] = useState(false);

  // Dummy Semen Inventory
  const semenInventory = [
    { id: 'B1', bullName: 'Holstein 402', type: 'Sexed (Female)', stock: 12, code: 'H402-S' },
    { id: 'B2', bullName: 'Jersey JX-9', type: 'Conventional', stock: 25, code: 'JX09-C' },
    { id: 'B3', bullName: 'Sahiwal King', type: 'Conventional', stock: 5, code: 'SW01-C' },
  ];

  const now = new Date();

  // Compute Breeding State for Kanban
  const kanbanCows = cows.map(cow => {
    const seed = cow.name.length;
    const daysSinceCalving = seed * 15 + 30; // 30 to 180 days
    let stage = 'Open';
    let details = {};

    // Logic for pseudo-data assignment
    if (daysSinceCalving < 50) {
      stage = 'Open';
      const daysToHeat = 60 - daysSinceCalving;
      details = { title: 'Rest Period', desc: `Voluntary waiting period. Watch for heat in ${daysToHeat} days.`, color: 'emerald' };
    } else if (daysSinceCalving < 90) {
      stage = 'Inseminated';
      const aiDate = new Date(now.getTime() - (daysSinceCalving - 50) * 86400000);
      const daysSinceAI = Math.floor((now - aiDate) / 86400000);
      details = { title: 'Waiting for PD', desc: `AI done ${daysSinceAI} days ago. PD check at 60 days.`, color: 'blue', aiDate };
    } else if (daysSinceCalving < 280) {
      stage = 'Pregnant';
      const aiDate = new Date(now.getTime() - (daysSinceCalving - 50) * 86400000);
      const expectedCalving = new Date(aiDate.getTime() + 283 * 86400000);
      const daysToCalve = Math.floor((expectedCalving - now) / 86400000);
      
      if (daysToCalve <= 60) {
        stage = 'Dry';
        details = { title: 'Dry Period', desc: `Calving in ${daysToCalve} days. Stop milking immediately.`, color: 'red', expectedCalving };
      } else {
        details = { title: 'Confirmed Pregnant', desc: `Calving in ${daysToCalve} days. Continue normal milking.`, color: 'purple', expectedCalving };
      }
    } else {
      // Very close to calving or just calved
      stage = 'Dry';
      details = { title: 'Maternity', desc: 'Calving expected any day now.', color: 'red' };
    }

    return { ...cow, stage, details };
  });

  const columns = [
    { id: 'Open', title: 'Open (Waiting for Heat)', icon: Calendar, color: 'emerald' },
    { id: 'Inseminated', title: 'Inseminated (Wait for PD)', icon: TestTube, color: 'blue' },
    { id: 'Pregnant', title: 'Pregnant (Gestation)', icon: CheckCircle2, color: 'purple' },
    { id: 'Dry', title: 'Dry (Pre-Calving)', icon: AlertTriangle, color: 'red' }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <Dna className="w-7 h-7 text-indigo-600" />
            </div>
            Breeding Management
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Kanban board tracking herd reproductive lifecycle and semen inventory.</p>
        </div>
        <button 
          onClick={() => setIsLogAIModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-bold"
        >
          <Plus className="w-5 h-5" />
          Log AI Event
        </button>
      </div>

      {/* Semen Inventory Ribbon */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-blue-500" /> Semen Straw Inventory (Cryocan)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {semenInventory.map(straw => (
            <div key={straw.id} className="border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 flex justify-between items-center hover:border-indigo-200 transition">
              <div>
                <h3 className="font-extrabold text-gray-900">{straw.bullName}</h3>
                <p className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md w-fit mt-1">{straw.type}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{straw.code}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-gray-800">{straw.stock}</p>
                <p className="text-xs text-gray-500 font-bold">STRAWS</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex overflow-x-auto gap-6 pb-4">
        {columns.map(col => (
          <div key={col.id} className="flex-none w-80 bg-gray-50 rounded-3xl border border-gray-200 flex flex-col max-h-[800px]">
            {/* Column Header */}
            <div className={`p-4 border-b-2 border-gray-200 bg-${col.color}-50/50 rounded-t-3xl shrink-0 flex items-center gap-3`}>
              <div className={`p-2 bg-${col.color}-100 text-${col.color}-600 rounded-lg`}>
                <col.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-bold text-${col.color}-900`}>{col.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{kanbanCows.filter(c => c.stage === col.id).length} Cows</p>
              </div>
            </div>

            {/* Column Body / Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {kanbanCows.filter(c => c.stage === col.id).map(cow => (
                <div key={cow.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-grab">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-lg">{cow.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{cow.id}</p>
                    </div>
                    {cow.details.expectedCalving && (
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Calving</p>
                        <p className={`text-xs font-bold text-${col.color}-600`}>{cow.details.expectedCalving.toLocaleDateString('en-IN')}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className={`bg-${col.color}-50 p-2.5 rounded-xl border border-${col.color}-100`}>
                    <p className={`text-xs font-bold text-${col.color}-800`}>{cow.details.title}</p>
                    <p className={`text-[11px] text-${col.color}-600 mt-0.5 leading-tight`}>{cow.details.desc}</p>
                  </div>
                  
                  {col.id === 'Open' && (
                    <button className="w-full mt-3 text-xs font-bold text-indigo-600 bg-indigo-50 py-1.5 rounded-lg hover:bg-indigo-100 transition flex justify-center items-center gap-1">
                      Log Heat/AI <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {col.id === 'Inseminated' && (
                    <button className="w-full mt-3 text-xs font-bold text-blue-600 bg-blue-50 py-1.5 rounded-lg hover:bg-blue-100 transition flex justify-center items-center gap-1">
                      Confirm PD <CheckCircle2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              
              {kanbanCows.filter(c => c.stage === col.id).length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center text-center opacity-50">
                  <Clock className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-bold text-gray-500">No cows in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Log AI Modal */}
      {isLogAIModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
                <TestTube className="w-5 h-5 text-indigo-600" /> Log AI Event
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Cow</label>
                <select className="w-full border-2 rounded-xl p-3 font-bold text-gray-900 focus:border-indigo-500 outline-none">
                  {kanbanCows.filter(c => c.stage === 'Open').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Bull Semen</label>
                <select className="w-full border-2 rounded-xl p-3 font-bold text-gray-900 focus:border-indigo-500 outline-none">
                  {semenInventory.map(s => <option key={s.id} value={s.id}>{s.bullName} - {s.type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Inseminator (AI Tech)</label>
                <input type="text" placeholder="Dr. Name or Tech ID" className="w-full border-2 rounded-xl p-3 font-bold text-gray-900 focus:border-indigo-500 outline-none" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsLogAIModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition">Cancel</button>
                <button onClick={() => setIsLogAIModalOpen(false)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition">Save AI Record</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
