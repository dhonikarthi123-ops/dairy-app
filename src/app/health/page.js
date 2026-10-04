"use client";
import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { HeartPulse, Syringe, CalendarHeart, Droplets, Activity, Plus, AlertCircle, CheckCircle2, Clock, Upload, Scan, FileText, X, BrainCircuit, ShieldCheck } from 'lucide-react';

export default function HealthPage() {
  const { cows } = useFarm();
  const [activeTab, setActiveTab] = useState('vaccination');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Simulated Health Data mixed with real cow data
  const healthData = cows.map(cow => {
    // Math to simulate dates based on string length just to give deterministic dummy data
    const seed = cow.name.length;
    
    // Reproduction
    const daysSinceCalving = seed * 10 + 40; 
    const isPregnant = daysSinceCalving > 100;
    const aiDate = isPregnant ? new Date(Date.now() - (seed * 20 * 86400000)) : null;
    let expectedCalving = null;
    if (aiDate) {
      expectedCalving = new Date(aiDate);
      expectedCalving.setDate(expectedCalving.getDate() + 283); // 283 days gestation
    }
    
    // Vaccination
    const daysSinceFMD = seed * 15;
    const nextFMD = new Date(Date.now() + (180 - daysSinceFMD) * 86400000); // FMD every 6 months
    const isFMDFdue = (180 - daysSinceFMD) <= 15;
    
    // Udder Health
    const cmtScore = seed % 3 === 0 ? 'Trace' : seed % 4 === 0 ? 'Negative' : 'Score 1';
    
    return {
      ...cow,
      repro: {
        daysSinceCalving,
        status: isPregnant ? 'Pregnant' : 'Open',
        aiDate,
        expectedCalving,
        nextHeat: !isPregnant ? new Date(Date.now() + (21 - (daysSinceCalving % 21)) * 86400000) : null
      },
      vaccine: {
        lastDeworming: new Date(Date.now() - (seed * 12 * 86400000)),
        nextFMD,
        isFMDFdue
      },
      udder: {
        cmtScore,
        lastTest: new Date(Date.now() - (seed * 2 * 86400000)),
        risk: cmtScore === 'Score 1' ? 'Medium' : 'Low'
      }
    };
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-rose-100 rounded-xl">
              <HeartPulse className="w-7 h-7 text-rose-600" />
            </div>
            Health & Vet Care
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Advanced medical tracking, vaccination alerts, and reproductive health.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-bold"
        >
          <Plus className="w-5 h-5" />
          Add Medical Record
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-px">
        <button 
          onClick={() => setActiveTab('vaccination')}
          className={`flex items-center gap-2 px-6 py-3 font-bold border-b-2 transition ${activeTab === 'vaccination' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Syringe className="w-5 h-5" /> Vaccination & Deworming
        </button>
        <button 
          onClick={() => setActiveTab('reproduction')}
          className={`flex items-center gap-2 px-6 py-3 font-bold border-b-2 transition ${activeTab === 'reproduction' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <CalendarHeart className="w-5 h-5" /> Reproductive Health
        </button>
        <button 
          onClick={() => setActiveTab('udder')}
          className={`flex items-center gap-2 px-6 py-3 font-bold border-b-2 transition ${activeTab === 'udder' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Droplets className="w-5 h-5" /> Udder Health (CMT)
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        
        {/* VACCINATION TAB */}
        {activeTab === 'vaccination' && (
          <div className="space-y-8">
            
            {/* Standard Protocol Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-700/50 rounded-xl backdrop-blur-sm border border-indigo-600/50"><ShieldCheck className="w-6 h-6 text-indigo-300" /></div>
                  <h2 className="text-2xl font-extrabold">Standard Farm Vaccination Protocol</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-indigo-950/50 p-4 rounded-2xl border border-indigo-700/50">
                    <h3 className="font-bold text-indigo-200">FMD (கோமாரி நோய்)</h3>
                    <p className="text-sm mt-1 text-indigo-100">Frequency: <span className="font-bold text-white">Every 6 Months</span></p>
                    <p className="text-xs text-indigo-300 mt-1">Recommended: September & March</p>
                  </div>
                  <div className="bg-indigo-950/50 p-4 rounded-2xl border border-indigo-700/50">
                    <h3 className="font-bold text-indigo-200">HS & BQ (அடைப்பான் & சப்பை)</h3>
                    <p className="text-sm mt-1 text-indigo-100">Frequency: <span className="font-bold text-white">Annually</span></p>
                    <p className="text-xs text-indigo-300 mt-1">Recommended: May/June (Pre-monsoon)</p>
                  </div>
                  <div className="bg-indigo-950/50 p-4 rounded-2xl border border-indigo-700/50">
                    <h3 className="font-bold text-indigo-200">Brucellosis (கருகலைப்பு)</h3>
                    <p className="text-sm mt-1 text-indigo-100">Frequency: <span className="font-bold text-white">Once in a lifetime</span></p>
                    <p className="text-xs text-indigo-300 mt-1">Only female calves aged 4-8 months</p>
                  </div>
                  <div className="bg-indigo-950/50 p-4 rounded-2xl border border-indigo-700/50">
                    <h3 className="font-bold text-indigo-200">Anthrax (கோமாரி அடைப்பான்)</h3>
                    <p className="text-sm mt-1 text-indigo-100">Frequency: <span className="font-bold text-white">Annually</span></p>
                    <p className="text-xs text-indigo-300 mt-1">Only in disease-prone/endemic areas</p>
                  </div>
                  <div className="bg-indigo-950/50 p-4 rounded-2xl border border-indigo-700/50">
                    <h3 className="font-bold text-indigo-200">Deworming (குடற்புழு நீக்கம்)</h3>
                    <p className="text-sm mt-1 text-indigo-100">Frequency: <span className="font-bold text-white">Every 3-4 Months</span></p>
                    <p className="text-xs text-indigo-300 mt-1">Change drug formula every time</p>
                  </div>
                </div>
              </div>
              <ShieldCheck className="w-64 h-64 absolute -bottom-10 -right-10 text-indigo-700 opacity-20" />
            </div>

            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Syringe className="w-5 h-5 text-gray-500" /> Live Herd Tracker</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthData.map(cow => (
                <div key={cow.id} className={`bg-white rounded-3xl border p-6 shadow-sm relative overflow-hidden ${cow.vaccine.isFMDFdue ? 'border-orange-300 ring-4 ring-orange-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{cow.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{cow.id}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${cow.vaccine.isFMDFdue ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {cow.vaccine.isFMDFdue ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
                        <span>FMD Vaccine Due</span>
                        <span className={cow.vaccine.isFMDFdue ? 'text-orange-600' : 'text-gray-500'}>
                          {cow.vaccine.nextFMD.toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${cow.vaccine.isFMDFdue ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: cow.vaccine.isFMDFdue ? '90%' : '30%' }}></div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Last Deworming:</span>
                        <span className="font-bold text-gray-800">{cow.vaccine.lastDeworming.toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPRODUCTION TAB */}
        {activeTab === 'reproduction' && (
          <div className="bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-indigo-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-extrabold text-indigo-900 text-lg flex items-center gap-2"><CalendarHeart className="w-5 h-5 text-indigo-600" /> Breeding & AI Tracker</h2>
                <p className="text-xs text-indigo-700/70 mt-1">Manage heat cycles, artificial insemination, and calving dates</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Cow</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Days in Milk</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Last AI Date</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Expected Calving / Next Heat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {healthData.map(cow => (
                    <tr key={cow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{cow.name} <span className="text-xs text-gray-400">({cow.id})</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${cow.repro.status === 'Pregnant' ? 'bg-indigo-100 text-indigo-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {cow.repro.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{cow.repro.daysSinceCalving} Days</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{cow.repro.aiDate ? cow.repro.aiDate.toLocaleDateString('en-IN') : '-'}</td>
                      <td className="px-6 py-4">
                        {cow.repro.status === 'Pregnant' ? (
                          <span className="font-bold text-indigo-600 flex items-center gap-2">
                            <CalendarHeart className="w-4 h-4"/> {cow.repro.expectedCalving.toLocaleDateString('en-IN')}
                          </span>
                        ) : (
                          <span className="font-bold text-yellow-600 flex items-center gap-2">
                            <Clock className="w-4 h-4"/> Heat due: {cow.repro.nextHeat.toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* UDDER HEALTH TAB */}
        {activeTab === 'udder' && (
          <div className="bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-blue-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-extrabold text-blue-900 text-lg flex items-center gap-2"><Droplets className="w-5 h-5 text-blue-600" /> Mastitis & Udder Health</h2>
                <p className="text-xs text-blue-700/70 mt-1">California Mastitis Test (CMT) tracking to prevent subclinical mastitis</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Cow</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Last CMT Test Date</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">CMT Score</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Risk Level</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {healthData.map(cow => (
                    <tr key={cow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{cow.name}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{cow.udder.lastTest.toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${cow.udder.cmtScore === 'Negative' ? 'text-green-600' : cow.udder.cmtScore === 'Trace' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {cow.udder.cmtScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${cow.udder.risk === 'Low' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {cow.udder.risk} Risk
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-500">
                        {cow.udder.cmtScore === 'Negative' ? 'Normal Milking' : 'Monitor Quarters closely, test again in 3 days.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* AI Add Medical Record Modal */}
      {isAddModalOpen && (
        <AIMedicalScannerModal onClose={() => setIsAddModalOpen(false)} cows={cows} />
      )}

    </div>
  );
}

// AI Scanner Modal Component
function AIMedicalScannerModal({ onClose, cows }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  
  const handleUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate AI Scanning process
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setScanComplete(true);
      }, 2500); // 2.5 seconds scanning animation
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="font-extrabold text-2xl text-gray-900 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-rose-600" /> AI Medical Scanner
            </h2>
            <p className="text-sm text-gray-500 mt-1">Upload a Vet prescription or lab report to auto-fill details.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-lg transition"><X className="w-6 h-6"/></button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!scanComplete ? (
            <div className="space-y-6">
              {/* Upload Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-rose-500 hover:bg-rose-50 transition relative overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {!isScanning ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Tap to Upload Report</h3>
                      <p className="text-gray-500 mt-2">JPEG, PNG, or PDF</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center animate-pulse relative">
                      <Scan className="w-10 h-10 text-rose-600 absolute animate-ping" />
                      <BrainCircuit className="w-8 h-8 text-rose-600 relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-rose-600 animate-pulse">Nitara AI is Scanning...</h3>
                      <p className="text-gray-500 mt-2">Extracting disease info & medicines</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full text-green-600"><CheckCircle2 className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold text-green-900">Scan Successful!</h3>
                  <p className="text-sm text-green-700">Nitara AI has extracted the following details from your report.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Diagnosis / Disease</label>
                  <input type="text" readOnly value="Subclinical Mastitis (Left Fore Quarter)" className="w-full border-2 border-green-200 bg-green-50/50 rounded-xl p-3 font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Cow</label>
                  <select className="w-full border-2 rounded-xl p-3 font-bold text-gray-900 focus:border-rose-500 outline-none">
                    {cows.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prescribed Medicines / Treatment</label>
                  <textarea readOnly value="1. Intramammary Infusion (Ceftriaxone) - 3 days&#10;2. Meloxicam Injection - 2 days&#10;3. Apply Udder Mint Ointment" className="w-full border-2 border-green-200 bg-green-50/50 rounded-xl p-3 font-bold text-gray-900 h-28 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vet Name</label>
                  <input type="text" readOnly value="Dr. Sivakumar (AI Extracted)" className="w-full border-2 border-green-200 bg-green-50/50 rounded-xl p-3 font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Milk Withdrawal Alert</label>
                  <div className="w-full border-2 border-red-200 bg-red-50 text-red-700 rounded-xl p-3 font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5"/> Do not sell milk for 3 days
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                Save Medical Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
