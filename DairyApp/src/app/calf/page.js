"use client"
import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Plus, Search, Filter, X, Baby, HeartPulse, Dna, IndianRupee, Wheat, Calendar, Syringe, ShieldCheck, Activity } from 'lucide-react';

export default function CalfPage() {
  const { calves, setCalves } = useFarm();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewCalfId, setViewCalfId] = useState(null);

  const viewCalf = calves?.find(c => c.id === viewCalfId);

  const [formData, setFormData] = useState({
    name: '', breed: 'HF Cross', motherId: '', dob: '2026-07-01', birthWeight: 30, currentWeight: 35
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const newCalf = {
      id: `CALF-0${(calves?.length || 0) + 1}`,
      name: formData.name,
      breed: formData.breed,
      motherId: formData.motherId,
      dob: formData.dob,
      birthWeight: Number(formData.birthWeight),
      currentWeight: Number(formData.currentWeight),
      image: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=400'
    };
    setCalves([...(calves || []), newCalf]);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Baby className="w-7 h-7 text-blue-600" />
            </div>
            Calf & Heifer Management
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Manage calves from birth to their first calving (24 months lifecycle).</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-bold">
          <Plus className="w-5 h-5" />
          Register Calf
        </button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID, Name..." 
              className="pl-10 pr-4 py-2.5 border-2 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-72 bg-white shadow-sm transition"
            />
          </div>
          <button className="px-4 py-2 border-2 rounded-xl flex items-center gap-2 text-gray-700 hover:bg-gray-100 font-bold bg-white shadow-sm transition">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Calf ID</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Name</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Breed & Mother</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Age & Weight</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {calves?.map(calf => {
                const ageDays = Math.floor((new Date() - new Date(calf.dob)) / (1000 * 60 * 60 * 24));
                const ageMonths = Math.floor(ageDays / 30);
                return (
                  <tr key={calf.id} className="hover:bg-blue-50/50 transition cursor-pointer" onClick={() => setViewCalfId(calf.id)}>
                    <td className="px-6 py-4 font-bold text-blue-600">{calf.id}</td>
                    <td className="px-6 py-4 font-extrabold text-gray-900 flex items-center gap-3">
                      <img src={calf.image} alt={calf.name} className="w-8 h-8 rounded-full object-cover border" />
                      {calf.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {calf.breed} <span className="text-gray-400 font-normal block text-xs">Mother: {calf.motherId}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {ageMonths} Months <span className="text-gray-400 font-normal block text-xs">{calf.currentWeight} KG</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setViewCalfId(calf.id); }} className="text-blue-600 font-bold hover:underline bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">Lifecycle Details</button>
                    </td>
                  </tr>
                )
              })}
              {(!calves || calves.length === 0) && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No calves registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-extrabold text-xl text-gray-900">Register New Calf</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-xl transition"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Calf Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. Nandini" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Breed</label>
                  <select value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium text-gray-700">
                    <option>HF Cross</option>
                    <option>Jersey Cross</option>
                    <option>Indigenous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Mother's Tag ID</label>
                  <input required type="text" value={formData.motherId} onChange={e => setFormData({...formData, motherId: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="e.g. COW-01" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Date of Birth</label>
                  <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Birth Wt (KG)</label>
                  <input required type="number" value={formData.birthWeight} onChange={e => setFormData({...formData, birthWeight: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Current Wt (KG)</label>
                  <input required type="number" value={formData.currentWeight} onChange={e => setFormData({...formData, currentWeight: e.target.value})} className="w-full border-2 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all hover:-translate-y-0.5 mt-2">Complete Registration</button>
            </form>
          </div>
        </div>
      )}

      {viewCalf && <CalfLifecycleModal calf={viewCalf} onClose={() => setViewCalfId(null)} />}
    </div>
  );
}

function CalfLifecycleModal({ calf, onClose }) {
  const { prices } = useFarm();
  const [activeTab, setActiveTab] = useState('rearing');

  // Scientific 5-Phase Calf to Heifer Rearing Model (24 Months)
  // Costs calculated based on FarmContext prices
  const phases = [
    { 
      id: 1, name: "Colostrum Phase", duration: "Days 1-3 (3 Days)",
      action: "Feed 10% of body weight in Colostrum (சீம்பால்)",
      reason: "Provides essential maternal antibodies for immunity. Crucial for calf survival.",
      feedVol: "3.5 L/day",
      cost: 3 * 3.5 * prices.milk, // Opportunity cost
      status: "critical"
    },
    { 
      id: 2, name: "Pre-Weaning / Milk Phase", duration: "Days 4-90 (87 Days)",
      action: "Whole Milk + Intro to Calf Starter + Tender Green Grass",
      reason: "Milk for core nutrition. Starter grain stimulates early rumen (stomach) papillae development.",
      feedVol: "3 L Milk/day + 0.5 KG Starter",
      cost: (87 * 3 * prices.milk) + (87 * 0.5 * prices.concentrate),
      status: "growth"
    },
    { 
      id: 3, name: "Grower Phase", duration: "Months 3-6 (90 Days)",
      action: "Weaning complete. Feed Grower Concentrate + Green Fodder",
      reason: "Accelerates skeletal and muscle growth. Rumen is now fully functional.",
      feedVol: "1 KG Grower + 5 KG Green",
      cost: (90 * 1 * prices.concentrate) + (90 * 5 * (prices.napier || 2.0)),
      status: "growth"
    },
    { 
      id: 4, name: "Heifer / Puberty Phase", duration: "Months 6-14 (240 Days)",
      action: "Heifer Ration + Fodder. Observe 1st Heat (~10 mo). Do NOT breed.",
      reason: "Target to reach 60% adult weight (~250kg). Waiting until 2nd/3rd heat ensures pelvic maturity for safe calving.",
      feedVol: "1.5 KG Conc + 10 KG Green + 2 KG Dry",
      cost: (240 * 1.5 * prices.concentrate) + (240 * 10 * (prices.napier || 2.0)) + (240 * 2 * prices.straw),
      status: "puberty"
    },
    { 
      id: 5, name: "Pregnant Heifer", duration: "Months 15-24 (310 Days)",
      action: "Perform AI. Gestation for 280 days. Add pregnancy ration in last 2 months.",
      reason: "Cow is now mature enough to carry calf. Proper nutrition ensures healthy fetus and good milk yield in 1st lactation.",
      feedVol: "2 KG Conc + 15 KG Green + 4 KG Dry",
      cost: (310 * 2 * prices.concentrate) + (310 * 15 * (prices.napier || 2.0)) + (310 * 4 * prices.straw),
      status: "pregnant"
    }
  ];

  const totalInvestment = phases.reduce((sum, p) => sum + p.cost, 0);
  const ageDays = Math.floor((new Date() - new Date(calf.dob)) / (1000 * 60 * 60 * 24));
  let currentPhase = 1;
  if (ageDays > 3 && ageDays <= 90) currentPhase = 2;
  else if (ageDays > 90 && ageDays <= 180) currentPhase = 3;
  else if (ageDays > 180 && ageDays <= 420) currentPhase = 4;
  else if (ageDays > 420) currentPhase = 5;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-50 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 flex flex-col h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-white border-b shrink-0">
          <div className="p-6 flex justify-between items-start gap-6">
            <div className="flex gap-6 items-center">
              <img src={calf.image} alt="Calf" className="w-24 h-24 rounded-2xl object-cover shadow-sm border-4 border-white" />
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-extrabold text-3xl text-gray-900">{calf.name}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded border border-blue-200 uppercase tracking-wide">Heifer (Female)</span>
                </div>
                <p className="text-gray-500 font-medium mt-1">ID: {calf.id} • Breed: {calf.breed} • Mother: {calf.motherId}</p>
                <div className="flex gap-3 mt-3">
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg border">Age: {Math.floor(ageDays/30)} Months</span>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200">Current Wt: {calf.currentWeight} KG</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-xl transition"><X className="w-6 h-6"/></button>
          </div>
          
          <div className="flex px-6 gap-6 border-t mt-2">
            <button 
              onClick={() => setActiveTab('rearing')}
              className={`py-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'rearing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <Wheat className="w-4 h-4" /> 5-Phase Rearing & Feeding
            </button>
            <button 
              onClick={() => setActiveTab('medical')}
              className={`py-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'medical' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <Syringe className="w-4 h-4" /> Medical & Vaccination
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`py-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'finance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <IndianRupee className="w-4 h-4" /> Financial Investment
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-6">
          
          {activeTab === 'rearing' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-500" /> Scientific Rearing Lifecycle (24 Months)
                  </h3>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                    Current Phase: Phase {currentPhase}
                  </span>
                </div>

                <div className="space-y-6">
                  {phases.map((phase) => (
                    <div key={phase.id} className={`p-5 rounded-2xl border-2 transition-all ${phase.id === currentPhase ? 'border-blue-400 bg-blue-50/30 shadow-md ring-4 ring-blue-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${phase.id === currentPhase ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {phase.id}
                            </span>
                            <h4 className={`text-lg font-extrabold ${phase.id === currentPhase ? 'text-blue-900' : 'text-gray-900'}`}>{phase.name}</h4>
                            <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">{phase.duration}</span>
                          </div>
                          <div className="ml-11 space-y-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Dna className="w-4 h-4 text-purple-500" /> Feeding Strategy & Action</p>
                              <p className="text-sm text-gray-700 mt-0.5">{phase.action}</p>
                            </div>
                            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Why do we do this?</p>
                              <p className="text-sm text-amber-800 font-medium">{phase.reason}</p>
                            </div>
                          </div>
                        </div>
                        <div className="md:w-48 bg-gray-50 p-4 rounded-xl border shrink-0 flex flex-col justify-center">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Daily Feed Volume</p>
                          <p className="text-sm font-bold text-indigo-700">{phase.feedVol}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" /> NDDB/ICAR Standard Vaccination Schedule
                  </h3>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                    Birth to 24 Months
                  </span>
                </div>
                
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 mb-6 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-emerald-800">
                    This medical schedule is strictly based on the guidelines provided by the <strong>National Dairy Development Board (NDDB)</strong> and the <strong>Veterinary Council of India</strong>. Ensure female calves receive the Brucellosis vaccine between 4-8 months to prevent contagious abortion later in life.
                  </p>
                </div>

                <div className="relative border-l-2 border-dashed border-gray-200 ml-4 pl-8 space-y-8">
                  
                  {[
                    { day: "Day 10 - 15", name: "1st Deworming", type: "Deworming", dose: "15-20 ml (Piperazine)", disease: "Roundworms (Ascaris)", color: "text-amber-500", bg: "bg-amber-500" },
                    { day: "Month 1 to 6", name: "Monthly Deworming", type: "Deworming", dose: "As per body weight", disease: "Internal Parasites (Repeat every month)", color: "text-amber-500", bg: "bg-amber-500" },
                    { day: "Month 3", name: "Theileriosis Vaccine", type: "Vaccine", dose: "3 ml Subcutaneous (SC)", disease: "Theileriosis (Rakshavac-T)", color: "text-blue-500", bg: "bg-blue-500" },
                    { day: "Month 4", name: "FMD Vaccine (1st Dose)", type: "Vaccine", dose: "2 ml SC/IM", disease: "Foot & Mouth Disease", color: "text-blue-500", bg: "bg-blue-500" },
                    { day: "Month 4 - 8", name: "Brucellosis Vaccine", type: "Critical Vaccine", dose: "2 ml SC (Females Only)", disease: "Brucellosis (Given ONLY ONCE in a lifetime)", color: "text-rose-500", bg: "bg-rose-500" },
                    { day: "Month 5", name: "FMD Booster", type: "Vaccine", dose: "2 ml SC/IM", disease: "Foot & Mouth Disease (1 month after 1st dose)", color: "text-blue-500", bg: "bg-blue-500" },
                    { day: "Month 6", name: "HS & BQ Vaccine", type: "Vaccine", dose: "2-3 ml SC", disease: "Haemorrhagic Septicaemia & Black Quarter", color: "text-blue-500", bg: "bg-blue-500" },
                    { day: "Month 7 onwards", name: "Quarterly Deworming", type: "Deworming", dose: "As per weight", disease: "Change drug formulation every time", color: "text-amber-500", bg: "bg-amber-500" },
                    { day: "Month 12 & Annually", name: "Annual Boosters", type: "Vaccine", dose: "As prescribed", disease: "FMD (every 6 months), HS & BQ (annually)", color: "text-blue-500", bg: "bg-blue-500" }
                  ].map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-4 border-white shadow ${item.bg}`}></div>
                      <div className="bg-gray-50 border p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition bg-white hover:border-gray-300">
                        <div>
                          <p className={`text-sm font-black uppercase tracking-widest mb-1 ${item.color}`}>{item.day}</p>
                          <h4 className="text-lg font-extrabold text-gray-900">{item.name}</h4>
                          <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-1.5">
                            <Syringe className="w-3.5 h-3.5" /> Prevents: {item.disease}
                          </p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-xl shrink-0 md:w-48 border border-gray-200 text-center">
                          <p className="text-xs font-bold text-gray-500 uppercase">Dosage</p>
                          <p className="text-sm font-extrabold text-gray-900 mt-0.5">{item.dose}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl shadow-xl border border-gray-800 text-white relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <IndianRupee className="w-64 h-64 -mb-10 -mr-10" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Total Capital Investment</p>
                  <p className="text-5xl font-black text-white">₹ {totalInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                  <p className="text-sm text-gray-400 mt-4 max-w-lg font-medium leading-relaxed">
                    This is the exact financial investment required to rear this calf from Birth (Day 1) to its First Calving (~24 Months), based on your active Farm Context feed prices.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6">Phase-by-Phase Cost Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl">Phase</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Major Expense</th>
                        <th className="px-4 py-3 text-right rounded-tr-xl">Phase Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {phases.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-4 font-bold text-gray-800">{p.name}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-600">{p.duration}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{p.feedVol}</td>
                          <td className="px-4 py-4 font-black text-red-600 text-right">₹ {p.cost.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-red-50 border-t-2 border-red-100">
                      <tr>
                        <td colSpan="3" className="px-4 py-5 font-black text-red-900 text-right text-lg">Total Investment to 1st Calving:</td>
                        <td className="px-4 py-5 font-black text-red-700 text-right text-2xl">₹ {totalInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
