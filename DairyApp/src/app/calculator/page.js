"use client";
import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Calculator, Activity, Wheat, CheckCircle2, Info } from 'lucide-react';

export default function FeedCalculatorPage() {
  const { prices } = useFarm();
  
  const [inputs, setInputs] = useState({
    weight: 400,
    milk: 15,
    breed: 'HF Cross',
    dietMode: '1',
    lactationPhase: 'Peak'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: name === 'weight' || name === 'milk' ? Number(value) : value });
  };

  // Logic Calculations
  let w = inputs.weight || 0;
  let m = inputs.milk || 0;
  let isJersey = inputs.breed.includes("Jersey");
  
  // Base DM calculation
  let required_dm_maintenance = w * 0.02; // 2% of body weight
  let required_dm_milk = m * (isJersey ? 0.45 : 0.40);
  let total_dm = required_dm_maintenance + required_dm_milk;

  // Dry Fodder
  let dry_kg = w * (isJersey ? 0.009 : 0.008);
  let dry_cost = dry_kg * prices.straw;

  // Green Fodder & Concentrate
  let green_kg = 0;
  let green_cost = 0;
  let conc_kg = 0;
  let feedDetails = [];
  let modeLabel = '';

  let base_conc = 1.5 + (m / 2.5);

  if (inputs.dietMode === '1') {
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
    modeLabel = '5-Type Green Cocktail';
  } else if (inputs.dietMode === '2') {
    green_kg = (w / 400.0) * (isJersey ? 18.0 : 20.0);
    feedDetails = [{ name: 'Maize Silage', kg: green_kg, cost: green_kg * (prices.silage || 0) }];
    green_cost = green_kg * (prices.silage || 0);
    conc_kg = base_conc * 0.85;
    modeLabel = 'Maize Silage Only';
  } else if (inputs.dietMode === '3') {
    green_kg = w * 0.05;
    feedDetails = [{ name: 'Super Napier', kg: green_kg, cost: green_kg * (prices.napier || 0) }];
    green_cost = green_kg * (prices.napier || 0);
    conc_kg = base_conc;
    modeLabel = 'Super Napier Only';
  }

  // Phase Adjustments
  if (inputs.lactationPhase === 'Peak') {
    conc_kg = conc_kg * 1.10;
  } else if (inputs.lactationPhase === 'Late') {
    conc_kg = conc_kg * 0.90;
  } else if (inputs.lactationPhase === 'Dry') {
    conc_kg = 2.0;
  }

  let conc_cost = conc_kg * prices.concentrate;
  let total_cost = green_cost + dry_cost + conc_cost;

  let green_dm_ratio = 0.21;
  if (inputs.dietMode === '2') green_dm_ratio = 0.30;
  if (inputs.dietMode === '3') green_dm_ratio = 0.20;

  let green_dm_kg = green_kg * green_dm_ratio;
  let dry_dm_kg = dry_kg * 0.90;
  let conc_dm_kg = conc_kg * 0.88;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" /> Scientific Feed Simulator
        </h1>
        <p className="text-gray-500 mt-1">Simulate NDDB/TNAU standard feed requirements for any custom cow weight and yield.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Input Form */}
        <div className="bg-white border rounded-xl shadow-sm p-6 lg:col-span-1 space-y-5 h-fit">
          <h2 className="font-bold text-gray-800 border-b pb-2">Simulator Inputs</h2>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cow Weight (KG)</label>
            <input type="number" name="weight" value={inputs.weight} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            <p className="text-xs text-gray-400 mt-1">Typical: 350-500 KG</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Milk Yield (Liters/Day)</label>
            <input type="number" name="milk" value={inputs.milk} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Breed Category</label>
            <select name="breed" value={inputs.breed} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
              <option value="HF Cross">HF Crossbred</option>
              <option value="Jersey Cross">Jersey Crossbred</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Lactation Phase</label>
            <select name="lactationPhase" value={inputs.lactationPhase} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
              <option value="Peak">Peak (Early)</option>
              <option value="Mid">Mid</option>
              <option value="Late">Late / Low</option>
              <option value="Dry">Dry (Pregnant)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Diet Strategy</label>
            <select name="dietMode" value={inputs.dietMode} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
              <option value="1">5-Type Green Cocktail</option>
              <option value="2">Maize Silage Only</option>
              <option value="3">Super Napier Only</option>
            </select>
          </div>
        </div>

        {/* Right: Results */}
        <div className="bg-white border rounded-xl shadow-sm p-6 lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
            Simulation Results
            <span className="text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Live Calculation</span>
          </h2>
          
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Dry Matter (DM) Requirement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                <p className="text-xs text-gray-500 font-medium">Body Maintenance (2% of wt)</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{required_dm_maintenance.toFixed(2)} <span className="text-sm font-normal text-gray-500">kg</span></p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                <p className="text-xs text-gray-500 font-medium">Production Demand</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{required_dm_milk.toFixed(2)} <span className="text-sm font-normal text-gray-500">kg</span></p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg shadow-sm border border-blue-700 text-white">
                <p className="text-xs text-blue-100 font-medium">Total Required DM</p>
                <p className="text-xl font-bold mt-1">{total_dm.toFixed(2)} <span className="text-sm font-normal text-blue-200">kg</span></p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Suggested Fodder Mix ({modeLabel})</h3>
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
            
            <details className="p-4 bg-amber-50 rounded-lg border border-amber-100 group cursor-pointer transition-all relative overflow-hidden">
              <summary className="flex justify-between items-center list-none outline-none">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
                <div>
                  <p className="text-xs text-amber-700 font-medium mb-1">Concentrate Mix <span className="text-[10px] opacity-70 ml-1">(Click details)</span></p>
                  <p className="text-2xl font-bold text-amber-900">{conc_kg.toFixed(1)} <span className="text-sm font-medium">kg</span></p>
                  <p className="text-[10px] font-bold text-amber-700 mt-1 bg-amber-100/50 inline-block px-1.5 py-0.5 rounded">Provides {conc_dm_kg.toFixed(1)} kg DM</p>
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

          {inputs.lactationPhase === 'Peak' && (
            <div className="bg-purple-50 border border-purple-200 text-purple-800 p-3 rounded-lg mb-6 text-sm">
              <strong><Activity className="w-4 h-4 inline mr-1" /> Challenge Feeding Applied (NDDB Standard):</strong> An extra 10% concentrate is added to prevent weight loss and support peak milk yield.
            </div>
          )}
          {inputs.lactationPhase === 'Late' && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg mb-6 text-sm">
              <strong><Activity className="w-4 h-4 inline mr-1" /> Late Phase Adjustment:</strong> Concentrate is reduced by 10% to prevent excessive fat deposition.
            </div>
          )}
          {inputs.lactationPhase === 'Dry' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-6 text-sm">
              <strong><Activity className="w-4 h-4 inline mr-1" /> Dry Phase Maintenance:</strong> Only the mandatory 2 KG maintenance concentrate is provided for fetal growth (Yield is ignored).
            </div>
          )}

          <div className="flex justify-between items-center bg-gray-900 text-white p-6 rounded-2xl shadow-sm">
            <div>
              <p className="text-sm font-bold tracking-wide uppercase mb-1 text-gray-400">Estimated Daily Cost</p>
              <p className="text-xs text-gray-500">Based on global farm inventory prices</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-green-400">₹{total_cost.toFixed(2)}</p>
            </div>
          </div>

          {/* REFERENCE NUTRITION TABLE */}
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="bg-blue-50 border-b p-4">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" /> Nutritional Value per 1 KG (Fresh Basis)
              </h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Feed Type (1 KG)</th>
                    <th className="px-4 py-3 font-semibold">Dry Matter (DM)</th>
                    <th className="px-4 py-3 font-semibold">Crude Protein (CP)</th>
                    <th className="px-4 py-3 font-semibold">TDN (Energy)</th>
                    <th className="px-4 py-3 font-semibold">NDF (Fiber)</th>
                    <th className="px-4 py-3 font-semibold">Calcium (Ca)</th>
                    <th className="px-4 py-3 font-semibold">Phosphorus (P)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-green-700">🌽 Maize Silage</td>
                    <td className="px-4 py-3">300g (30%)</td>
                    <td className="px-4 py-3">24g</td>
                    <td className="px-4 py-3">180g</td>
                    <td className="px-4 py-3">165g</td>
                    <td className="px-4 py-3">1.2g</td>
                    <td className="px-4 py-3">0.75g</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-emerald-600">🌿 Super Napier</td>
                    <td className="px-4 py-3">200g (20%)</td>
                    <td className="px-4 py-3">20g</td>
                    <td className="px-4 py-3">120g</td>
                    <td className="px-4 py-3">110g</td>
                    <td className="px-4 py-3">0.8g</td>
                    <td className="px-4 py-3">0.5g</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-yellow-600">🌾 Rice Straw</td>
                    <td className="px-4 py-3">900g (90%)</td>
                    <td className="px-4 py-3">27g</td>
                    <td className="px-4 py-3">360g</td>
                    <td className="px-4 py-3">675g</td>
                    <td className="px-4 py-3">1.8g</td>
                    <td className="px-4 py-3">0.9g</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-amber-700">👜 Concentrate Mix</td>
                    <td className="px-4 py-3">900g (90%)</td>
                    <td className="px-4 py-3 font-bold text-indigo-700">216g</td>
                    <td className="px-4 py-3 font-bold text-indigo-700">675g</td>
                    <td className="px-4 py-3">135g</td>
                    <td className="px-4 py-3 font-bold">7.2g</td>
                    <td className="px-4 py-3 font-bold">4.5g</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
