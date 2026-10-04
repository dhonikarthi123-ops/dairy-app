"use client";
import { useState, useEffect } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Wheat, CheckCircle2, Save, Activity } from 'lucide-react';

export default function FeedPage() {
  const { cows, setCows, prices } = useFarm();
  const [selectedCowId, setSelectedCowId] = useState(cows[0]?.id || '');
  
  // TMR Mix Specialized Calculator State
  const [tmrWeight, setTmrWeight] = useState(550);
  const [tmrMilk, setTmrMilk] = useState(20);

  const cow = cows.find(c => c.id === selectedCowId);

  // Local state for the selected cow's diet
  const [dietMode, setDietMode] = useState('custom');
  const [customDiet, setCustomDiet] = useState({
    greenKg: 20, greenPrice: 3.0, dryKg: 4, dryPrice: 5, concKg: 10, concPrice: 38
  });

  // Sync local state when a new cow is selected
  useEffect(() => {
    if (cow) {
      setDietMode(cow.dietMode || '1');
      setCustomDiet(cow.customDiet || {
        greenKg: 20, greenPrice: 3.0, 
        dryKg: 4, dryPrice: prices.straw || 5, 
        concKg: 10, concPrice: prices.concentrate || 38
      });
    }
  }, [selectedCowId, cow, prices]);

  const handleCustomChange = (e) => {
    setCustomDiet({ ...customDiet, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleSaveDiet = () => {
    if (!cow) return;
    setCows(prev => prev.map(c => c.id === cow.id ? { ...c, dietMode, customDiet } : c));
    alert(`${cow.name}'s feeding strategy has been saved globally. The Dashboard will now reflect this cost.`);
  };

  // Live calculation for preview
  let daily_cost = 0;
  let green_cost = 0, dry_cost = 0, conc_cost = 0;
  let green_kg = 0, dry_kg = 0, conc_kg = 0;
  let provided_dm = 0, provided_cp = 0, required_dm = 0, required_cp = 0;
  let green_dm_kg = 0, dry_dm_kg = 0, conc_dm_kg = 0;
  let feedDetails = [];

  if (cow) {
    let w = cow.weight, m = cow.milk, isJersey = cow.breed.includes("Jersey");
    let total_dm = (w * 0.02) + (m * (isJersey ? 0.45 : 0.40));
    required_dm = total_dm;
    required_cp = total_dm * 0.14; // Approx 14% of DM for milking cow

    dry_kg = w * (isJersey ? 0.009 : 0.008);
    dry_cost = dry_kg * prices.straw;

    let base_conc = 1.5 + (m / 2.5);

    if (dietMode === '1') {
      green_kg = w * 0.05;
      let n = green_kg * (7/20), maize = green_kg * (5/20), v = green_kg * (3/20), ku = green_kg * (3/20), ka = green_kg * (2/20);
      feedDetails = [
        { name: 'Super Napier', kg: n, cost: n * (prices.napier || 0) },
        { name: 'Maize Fodder', kg: maize, cost: maize * (prices.maize || 0) },
        { name: 'Velimasal', kg: v, cost: v * (prices.velimasal || 0) },
        { name: 'Kuthiraimasal', kg: ku, cost: ku * (prices.kuthirai || 0) },
        { name: 'Karamani', kg: ka, cost: ka * (prices.karamani || 0) }
      ];
      green_cost = feedDetails.reduce((sum, item) => sum + item.cost, 0);
      conc_kg = base_conc;
    } else if (dietMode === '2') {
      green_kg = (w / 400.0) * (isJersey ? 18.0 : 20.0);
      feedDetails = [{ name: 'Maize Silage', kg: green_kg, cost: green_kg * (prices.silage || 0) }];
      green_cost = green_kg * (prices.silage || 0);
      conc_kg = base_conc * 0.85;
    } else if (dietMode === '3') {
      green_kg = w * 0.05;
      feedDetails = [{ name: 'Super Napier', kg: green_kg, cost: green_kg * (prices.napier || 0) }];
      green_cost = green_kg * (prices.napier || 0);
      conc_kg = base_conc;
    }
    
    // Phase Adjustments for ICAR Modes (1 to 4)
    if (dietMode !== 'custom') {
      if (cow.lactationPhase === 'Peak') {
        conc_kg = conc_kg * 1.10;
      } else if (cow.lactationPhase === 'Late') {
        conc_kg = conc_kg * 0.90;
      } else if (cow.lactationPhase === 'Dry') {
        conc_kg = 2.0; // Maintenance ration
      }
      conc_cost = conc_kg * prices.concentrate;
    }

    if (dietMode === 'custom') { // Custom
      green_kg = customDiet.greenKg;
      dry_kg = customDiet.dryKg;
      conc_kg = customDiet.concKg;
      green_cost = green_kg * customDiet.greenPrice;
      dry_cost = dry_kg * customDiet.dryPrice;
      conc_cost = conc_kg * customDiet.concPrice;
      feedDetails = [{ name: 'Custom Fodder Mix', kg: green_kg, cost: green_cost }];
    }
    
    daily_cost = green_cost + dry_cost + conc_cost;

    // Calculate required values based on standard biological ratios
    required_cp = required_dm * 0.1516;
    let required_tdn = required_dm * 0.6527;
    let required_ndf = required_dm * 0.33;
    let required_ca = required_dm * 5.5; // grams
    let required_p = required_dm * 3.666; // grams

    // Calculate provided DM
    let green_dm_ratio = 0.21;
    if (dietMode === '2') green_dm_ratio = 0.30;
    if (dietMode === '3') green_dm_ratio = 0.20;
    if (dietMode === 'custom') green_dm_ratio = 0.25;

    green_dm_kg = green_kg * green_dm_ratio;
    dry_dm_kg = dry_kg * 0.90;
    conc_dm_kg = conc_kg * 0.88;

    provided_dm = green_dm_kg + dry_dm_kg + conc_dm_kg;
    
    // Calculate provided CP
    provided_cp = (green_dm_kg * 0.10) + (dry_dm_kg * 0.03) + (conc_dm_kg * 0.24);

    // Calculate provided TDN
    let provided_tdn = (green_dm_kg * 0.60) + (dry_dm_kg * 0.45) + (conc_dm_kg * 0.75);

    // Calculate provided NDF
    let provided_ndf = (green_dm_kg * 0.45) + (dry_dm_kg * 0.70) + (conc_dm_kg * 0.20);

    // Calculate provided Calcium (g)
    let provided_ca = (green_dm_kg * 4.0) + (dry_dm_kg * 2.0) + (conc_dm_kg * 10.0);

    // Calculate provided Phosphorus (g)
    let provided_p = (green_dm_kg * 2.0) + (dry_dm_kg * 1.0) + (conc_dm_kg * 6.0);

    cow.biological = {
      req: { dm: required_dm, cp: required_cp, tdn: required_tdn, ndf: required_ndf, ca: required_ca, p: required_p },
      prov: { dm: provided_dm, cp: provided_cp, tdn: provided_tdn, ndf: provided_ndf, ca: provided_ca, p: provided_p }
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wheat className="w-6 h-6 text-green-600" /> Scientific Feed Calculator
        </h1>
        <p className="text-gray-500 mt-1">Configure and fix feeding strategies per cow. Changes instantly sync with the Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl shadow-sm p-6 lg:col-span-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Cow to Configure</label>
            <select 
              value={selectedCowId}
              onChange={e => setSelectedCowId(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {cows.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id}) - {c.milk}L, {c.weight}kg</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Feeding Strategy</label>
            <div className="space-y-3">
              {[
                { id: '1', label: '5-Type Green Cocktail' },
                { id: '2', label: 'Maize Silage Only' },
                { id: '3', label: 'Super Napier Only' }
              ].map(opt => (
                <label key={opt.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${dietMode === opt.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" checked={dietMode === opt.id} onChange={() => setDietMode(opt.id)} className="w-4 h-4 text-blue-600" />
                  <span className={`ml-3 text-sm font-medium ${dietMode === opt.id ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleSaveDiet} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm transition flex justify-center items-center gap-2">
            <Save className="w-5 h-5" /> Save Strategy Globally
          </button>
        </div>

        {cow && (
          <div className="bg-white border rounded-xl shadow-sm p-6 lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Diet Preview for {cow.name}</h2>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" /> Complete Biological Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <p className="text-xs text-gray-500 font-medium">Dry Matter (DM)</p>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xl font-bold text-gray-900">{cow.biological.prov.dm.toFixed(2)} <span className="text-sm font-normal text-gray-500">kg</span></p>
                    <p className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Req: {cow.biological.req.dm.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <p className="text-xs text-gray-500 font-medium">Crude Protein (CP)</p>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xl font-bold text-gray-900">{cow.biological.prov.cp.toFixed(2)} <span className="text-sm font-normal text-gray-500">kg</span></p>
                    <p className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">Req: {cow.biological.req.cp.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <p className="text-xs text-gray-500 font-medium">Total Digestible (TDN)</p>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xl font-bold text-gray-900">{cow.biological.prov.tdn.toFixed(2)} <span className="text-sm font-normal text-gray-500">kg</span></p>
                    <p className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Req: {cow.biological.req.tdn.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <p className="text-xs text-gray-500 font-medium">Neutral Fiber (NDF)</p>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xl font-bold text-gray-900">{cow.biological.prov.ndf.toFixed(2)} <span className="text-sm font-normal text-gray-500">kg</span></p>
                    <p className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Req: {cow.biological.req.ndf.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <p className="text-xs text-gray-500 font-medium">Calcium (Ca)</p>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xl font-bold text-gray-900">{cow.biological.prov.ca.toFixed(1)} <span className="text-sm font-normal text-gray-500">g</span></p>
                    <p className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Req: {cow.biological.req.ca.toFixed(1)}</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                  <p className="text-xs text-gray-500 font-medium">Phosphorus (P)</p>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xl font-bold text-gray-900">{cow.biological.prov.p.toFixed(1)} <span className="text-sm font-normal text-gray-500">g</span></p>
                    <p className="text-[10px] text-cyan-600 font-bold bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">Req: {cow.biological.req.p.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Green Fodder Breakdown</h3>
            <ul className="space-y-2 mb-6">
              {feedDetails.map((f, i) => f.kg > 0 && (
                <li key={i} className="flex justify-between items-center text-sm border border-gray-100 p-3 rounded-lg bg-gray-50/50">
                  <span className="flex items-center gap-2 font-medium text-gray-800"><CheckCircle2 className="w-4 h-4 text-green-500" /> {f.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{f.kg.toFixed(1)} kg</span>
                    <span className="text-gray-500 ml-3 text-xs bg-gray-200 px-2 py-0.5 rounded-full">₹ {f.cost.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <details className="p-4 bg-green-50 rounded-lg border border-green-100 group cursor-pointer transition-all">
                <summary className="flex justify-between items-center list-none outline-none">
                  <div>
                    <p className="text-xs text-green-700 font-medium mb-1">Total Green Fodder <span className="text-[10px] opacity-70 ml-1">(Click details)</span></p>
                    <p className="text-2xl font-bold text-green-900">{green_kg.toFixed(1)} <span className="text-sm font-medium">kg</span></p>
                    <p className="text-[10px] font-bold text-green-700 mt-1 bg-green-100/50 inline-block px-1.5 py-0.5 rounded">Provides {green_dm_kg.toFixed(1)} kg DM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600">Cost</p>
                    <p className="text-lg font-bold text-green-700">₹{green_cost.toFixed(0)}</p>
                  </div>
                </summary>
                <div className="mt-4 pt-3 border-t border-green-200/50 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-green-800">
                  <p><strong>DM:</strong> {green_dm_kg.toFixed(2)} kg</p>
                  <p><strong>CP:</strong> {(green_dm_kg * 0.10).toFixed(2)} kg</p>
                  <p><strong>TDN:</strong> {(green_dm_kg * 0.60).toFixed(2)} kg</p>
                  <p><strong>NDF:</strong> {(green_dm_kg * 0.55).toFixed(2)} kg</p>
                  <p><strong>Calcium (Ca):</strong> {(green_dm_kg * 4.0).toFixed(1)} g</p>
                  <p><strong>Phosphorus (P):</strong> {(green_dm_kg * 2.5).toFixed(1)} g</p>
                </div>
              </details>
              
              <details className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 group cursor-pointer transition-all">
                <summary className="flex justify-between items-center list-none outline-none">
                  <div>
                    <p className="text-xs text-yellow-700 font-medium mb-1">Paddy Straw <span className="text-[10px] opacity-70 ml-1">(Click details)</span></p>
                    <p className="text-2xl font-bold text-yellow-900">{dry_kg.toFixed(1)} <span className="text-sm font-medium">kg</span></p>
                    <p className="text-[10px] font-bold text-yellow-700 mt-1 bg-yellow-100/50 inline-block px-1.5 py-0.5 rounded">Provides {dry_dm_kg.toFixed(1)} kg DM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-600">Cost</p>
                    <p className="text-lg font-bold text-yellow-700">₹{dry_cost.toFixed(0)}</p>
                  </div>
                </summary>
                <div className="mt-4 pt-3 border-t border-yellow-200/50 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-yellow-800">
                  <p><strong>DM:</strong> {dry_dm_kg.toFixed(2)} kg</p>
                  <p><strong>CP:</strong> {(dry_dm_kg * 0.03).toFixed(2)} kg</p>
                  <p><strong>TDN:</strong> {(dry_dm_kg * 0.40).toFixed(2)} kg</p>
                  <p><strong>NDF:</strong> {(dry_dm_kg * 0.75).toFixed(2)} kg</p>
                  <p><strong>Calcium (Ca):</strong> {(dry_dm_kg * 2.0).toFixed(1)} g</p>
                  <p><strong>Phosphorus (P):</strong> {(dry_dm_kg * 1.0).toFixed(1)} g</p>
                </div>
              </details>
              
              <details className="p-4 bg-amber-50 rounded-lg border border-amber-100 group cursor-pointer transition-all">
                <summary className="flex justify-between items-center list-none outline-none">
                  <div>
                    <p className="text-xs text-amber-700 font-medium mb-1">Concentrate Mix <span className="text-[10px] opacity-70 ml-1">(Click details)</span></p>
                    <p className="text-2xl font-bold text-amber-900">{conc_kg.toFixed(1)} <span className="text-sm font-medium">kg</span></p>
                    <p className="text-[10px] font-bold text-amber-700 mt-1 bg-amber-100/50 inline-block px-1.5 py-0.5 rounded">Provides {conc_dm_kg.toFixed(1)} kg DM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-amber-600">Cost</p>
                    <p className="text-lg font-bold text-amber-700">₹{conc_cost.toFixed(0)}</p>
                  </div>
                </summary>
                <div className="mt-4 pt-3 border-t border-amber-200/50 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-amber-800">
                  <p><strong>DM:</strong> {conc_dm_kg.toFixed(2)} kg</p>
                  <p><strong>CP:</strong> {(conc_dm_kg * 0.24).toFixed(2)} kg</p>
                  <p><strong>Crude Fiber:</strong> {(conc_dm_kg * 0.12).toFixed(2)} kg</p>
                  <p><strong>Crude Fat (EE):</strong> {(conc_dm_kg * 0.04).toFixed(2)} kg</p>
                  <p><strong>Calcium (Ca):</strong> {(conc_dm_kg * 8.0).toFixed(1)} g</p>
                  <p><strong>Total Phos:</strong> {(conc_dm_kg * 5.0).toFixed(1)} g</p>
                </div>
              </details>
            </div>

            {dietMode !== 'custom' && cow.lactationPhase === 'Peak' && (
              <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-xl mb-6 text-sm shadow-sm">
                <strong><Activity className="w-4 h-4 inline mr-1" /> Challenge Feeding Applied (NDDB Standard):</strong> Cow is in Peak Phase. An extra 10% concentrate is added to the base requirement to prevent weight loss and support peak milk yield.
              </div>
            )}
            {dietMode !== 'custom' && cow.lactationPhase === 'Late' && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 text-sm shadow-sm">
                <strong><Activity className="w-4 h-4 inline mr-1" /> Late Phase Adjustment:</strong> Cow is in Late Phase. Concentrate is reduced by 10% from the base requirement to prevent excessive fat deposition.
              </div>
            )}
            {dietMode !== 'custom' && cow.lactationPhase === 'Dry' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-sm shadow-sm">
                <strong><Activity className="w-4 h-4 inline mr-1" /> Dry Phase Maintenance:</strong> Cow is pregnant/dry. Only the mandatory 2 KG maintenance concentrate is provided for fetal growth (Yield is ignored).
              </div>
            )}

            <div className="flex justify-between items-center bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border border-red-200 p-6 rounded-2xl shadow-sm transition hover:shadow-md">
              <div>
                <p className="text-sm text-red-900 font-bold tracking-wide uppercase mb-1">Estimated Daily Cost</p>
                <p className="text-xs text-red-700/80 mb-3">Total daily feed expense for {cow.name}</p>
                {dietMode !== 'custom' && (
                  <a href="/settings" className="text-xs font-semibold bg-white/60 hover:bg-white text-red-700 px-3 py-1.5 rounded-full transition shadow-sm border border-red-100">
                    Edit Global Prices ➔
                  </a>
                )}
              </div>
              <div className="text-right">
                <p className="text-4xl font-extrabold text-red-700 drop-shadow-sm">
                  <span className="text-2xl mr-1 text-red-500">₹</span>{daily_cost.toFixed(2)}
                </p>
                <p className="text-xs font-bold text-red-500 mt-2 tracking-wider">PER DAY</p>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* --- TMR MIX DEDICATED CALCULATOR SECTION --- */}
      <div className="mt-12 bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Wheat className="w-8 h-8 text-amber-400" /> Scientific TMR Mix Calculator
          </h2>
          <p className="text-blue-200 mt-2 text-sm leading-relaxed">
            Conventional Thumb Rule vs Maize Silage TMR: Why do we feed less concentrate (6kg instead of 8kg) for high yielders?
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Cattle Weight (KG)</label>
              <input type="number" value={tmrWeight} onChange={(e) => setTmrWeight(Number(e.target.value) || 0)} className="w-full p-3 border-2 border-slate-200 rounded-lg font-bold text-lg focus:border-blue-500 outline-none" />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Milk Yield (Liters)</label>
              <input type="number" value={tmrMilk} onChange={(e) => setTmrMilk(Number(e.target.value) || 0)} className="w-full p-3 border-2 border-slate-200 rounded-lg font-bold text-lg focus:border-blue-500 outline-none" />
            </div>
          </div>

          {(() => {
            let maint_tdn = (tmrWeight / 450) * 3.10;
            let prod_tdn = tmrMilk * 0.28;
            let silage_kg = tmrWeight * (24.0 / 550.0);
            let conv_conc = 1.5 + (tmrMilk * 0.325);
            let hidden_energy = silage_kg * (2.0 / 24.0);
            let tmr_conc = conv_conc - hidden_energy;

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Conventional Box */}
                  <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
                    <h3 className="font-bold text-red-900 text-lg mb-4">Conventional Feeding (Thumb Rule)</h3>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>Maintenance Concentrate: <strong>1.50 kg</strong></li>
                      <li>Production ({tmrMilk}L × 325g): <strong>{(tmrMilk * 0.325).toFixed(2)} kg</strong></li>
                      <li className="pt-2 border-t border-red-200 mt-2 text-lg">
                        Total Concentrate Needed: <strong className="text-red-900 font-black">{conv_conc.toFixed(2)} KG</strong>
                      </li>
                    </ul>
                    <p className="mt-4 text-xs text-red-700 bg-red-100 p-2 rounded">
                      Risk: Feeding 8+ kg of concentrate rapidly ferments in the rumen, causing 20-25% digestion loss and Acidosis risk.
                    </p>
                  </div>

                  {/* TMR Box */}
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-xl">
                    <h3 className="font-bold text-emerald-900 text-lg mb-4">Scientific TMR (Maize Silage Based)</h3>
                    <ul className="space-y-2 text-sm text-emerald-800">
                      <li>Target Maize Silage Intake: <strong>{silage_kg.toFixed(1)} kg</strong></li>
                      <li>Hidden Grain Power in Silage: <strong>~{hidden_energy.toFixed(2)} kg</strong> <span className="text-[10px] bg-emerald-200 px-1 rounded">Equivalent Concentrate</span></li>
                      <li className="pt-2 border-t border-emerald-200 mt-2 text-lg">
                        Actual Concentrate Needed: <strong className="text-emerald-900 font-black">{tmr_conc.toFixed(2)} KG</strong>
                      </li>
                    </ul>
                    <p className="mt-4 text-xs text-emerald-700 bg-emerald-100 p-2 rounded">
                      Advantage: The {silage_kg.toFixed(0)}kg silage inherently contains 20-25% fermented corn kernels. We subtract this hidden energy from the concentrate bag, saving money safely!
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl text-slate-300 text-sm leading-relaxed">
                  <h4 className="text-white font-bold text-lg mb-3">சயின்டிஃபிக் விளக்கம் (Scientific Breakdown):</h4>
                  <p className="mb-2"><strong>1. ஏன் கூடுதல் சத்தை மாவுல ஏத்தாம சைலேஜ்ல ஏத்துறோம்?</strong></p>
                  <p className="mb-4">450kg மாட்டை விட 550kg மாட்டுக்கு வெறும் <strong>0.45 kg TDN</strong> தான் கூடுதலாகத் தேவை. இதை விலை உயர்ந்த மாவில் ஈடுகட்டுவதை விட, சைலேஜை கொஞ்சம் கூட்டிக் கொடுத்தாலே (சுமார் 2.4 kg கூடுதல் சைலேஜ்) இந்த 0.45 kg TDN எளிதாகக் கிடைத்துவிடும். கூடவே வைக்கோலும் சேரும்போது மாட்டின் உடம்பு பராமரிப்பு முழுமையாக நிறைவடைகிறது.</p>
                  <p className="mb-2"><strong>2. {tmrMilk} லிட்டருக்கு {conv_conc.toFixed(1)} கிலோ மாவு VS {tmr_conc.toFixed(1)} கிலோ மாவு அறிவியல்:</strong></p>
                  <p>வழக்கமான கட்டைவிரல் விதிப்படி (Thumb Rule) {tmrMilk} லிட்டருக்கு <strong>{conv_conc.toFixed(1)} கிலோ</strong> மாவு தேவை. ஆனால், தரமான TMR முறையில் நாம் வைக்கும் <strong>{silage_kg.toFixed(0)} கிலோ</strong> மக்காச்சோள சைலேஜில், ஏற்கனவே நொதித்த மக்காச்சோளத் தானியங்கள் (Cracked Corn) உள்ளன. இது மாட்டின் வயிற்றுக்குள் <strong>{hidden_energy.toFixed(1)} கிலோ</strong> மாவுக்கான சக்தியை (Hidden Energy) நேரடியாகவே கொடுத்துவிடுகிறது. எனவே, {conv_conc.toFixed(1)} கிலோ மாவுக்குப் பதிலாக, சரியாக <strong>{tmr_conc.toFixed(1)} கிலோ</strong> (High CP 24%) மாவு வைத்தாலே மாட்டுக்குத் தேவையான 100% சத்துக்களும் கிடைத்துவிடும்!</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
