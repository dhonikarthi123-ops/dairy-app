"use client"
import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Users, Droplet, Wheat, TrendingUp, AlertCircle, Calendar, X, FlaskConical, Syringe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const milkData = [
  { name: 'Mon', yield: 35 },
  { name: 'Tue', yield: 36 },
  { name: 'Wed', yield: 34 },
  { name: 'Thu', yield: 38 },
  { name: 'Fri', yield: 40 },
  { name: 'Sat', yield: 39 },
  { name: 'Sun', yield: 37 },
];

export default function Dashboard() {
  const { cows, prices, inventory } = useFarm();
  const [showFeedBreakdown, setShowFeedBreakdown] = useState(false);
  const [showProfitBreakdown, setShowProfitBreakdown] = useState(false);
  const [showCowsModal, setShowCowsModal] = useState(false);
  const [showMilkModal, setShowMilkModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  
  const totalCows = cows.length;
  const totalMilk = cows.reduce((sum, c) => sum + c.milk, 0);
  const dailyIncome = totalMilk * prices.milk;
  const avgFat = cows.length > 0 ? (cows.reduce((sum, c) => sum + (c.fat || 4.0), 0) / cows.length).toFixed(1) : "0.0";
  const avgSnf = cows.length > 0 ? (cows.reduce((sum, c) => sum + (c.snf || 8.5), 0) / cows.length).toFixed(1) : "0.0";
  
  let dailyFeedCost = 0;
  const feedBreakdown = [];
  let dailyReqs = { concentrate: 0, silage: 0, straw: 0, napier: 0, cholam: 0, kambu: 0, maize: 0, velimasal: 0, kuthirai: 0, karamani: 0 };

  cows.forEach(cow => {
    let green_cost = 0, dry_cost = 0, conc_cost = 0;
    let modeLabel = 'Unknown';
    let dietMode = cow.dietMode || '1';
    
    let w = cow.weight, m = cow.milk, isJersey = cow.breed.includes('Jersey');
    let total_dm = (w * 0.02) + (m * (isJersey ? 0.45 : 0.40));
    let dry_kg = w * (isJersey ? 0.009 : 0.008);
    dry_cost = dry_kg * prices.straw;
    dailyReqs.straw += dry_kg;
    let conc_kg = 0;

    let base_conc = 1.5 + (m / 2.5);

    if (dietMode === '1') {
      let green_kg = w * 0.05;
      let n = green_kg * (7/20), maize = green_kg * (5/20), v = green_kg * (3/20), ku = green_kg * (3/20), ka = green_kg * (2/20);
      green_cost = (n * (prices.napier || 0)) + (maize * (prices.maize || 0)) + (v * (prices.velimasal || 0)) + (ku * (prices.kuthirai || 0)) + (ka * (prices.karamani || 0));
      dailyReqs.napier += n; dailyReqs.maize += maize; dailyReqs.velimasal += v; dailyReqs.kuthirai += ku; dailyReqs.karamani += ka;
      conc_kg = base_conc;
      modeLabel = '5-Type Cocktail';
    } else if (dietMode === '2') {
      let green_kg = (w / 400.0) * (isJersey ? 18.0 : 20.0);
      green_cost = green_kg * (prices.silage || 0);
      dailyReqs.silage += green_kg;
      conc_kg = base_conc * 0.85;
      modeLabel = 'Maize Silage Only';
    } else if (dietMode === '3') {
      let green_kg = w * 0.05;
      green_cost = green_kg * (prices.napier || 0);
      dailyReqs.napier += green_kg;
      conc_kg = base_conc;
      modeLabel = 'Super Napier Only';
    } else if (dietMode === '4' || dietMode === 'custom') { // Fallback custom to 4 for safety
      let green_kg = w * 0.05;
      let s_kg = 5.0, c_kg = 2.0, kb_kg = 2.0;
      let napier_kg = green_kg >= 9.0 ? green_kg - 9.0 : 0;
      green_cost = (s_kg * (prices.silage || 0)) + (c_kg * (prices.cholam || 0)) + (kb_kg * (prices.kambu || 0)) + (napier_kg * (prices.napier || 0));
      dailyReqs.silage += s_kg; dailyReqs.cholam += c_kg; dailyReqs.kambu += kb_kg; dailyReqs.napier += napier_kg;
      conc_kg = base_conc * 0.90;
      modeLabel = 'Hybrid Mix';
    }
    
    // Phase Adjustments for Dashboard
    if (cow.lactationPhase === 'Peak') {
      conc_kg = conc_kg * 1.10;
    } else if (cow.lactationPhase === 'Late') {
      conc_kg = conc_kg * 0.90;
    } else if (cow.lactationPhase === 'Dry') {
      conc_kg = 2.0;
    }

    conc_cost = conc_kg * prices.concentrate;
    dailyReqs.concentrate += conc_kg;
    
    let total = green_cost + dry_cost + conc_cost;
    dailyFeedCost += total;
    
    feedBreakdown.push({
      id: cow.id,
      name: cow.name,
      mode: modeLabel,
      milk: m,
      income: m * prices.milk,
      green: green_cost,
      dry: dry_cost,
      conc: conc_cost,
      total: total
    });
  });
  const netProfit = dailyIncome - dailyFeedCost;

  const alerts = [];
  const now = new Date();
  
  if (inventory) {
    inventory.forEach(item => {
      const dailyReq = dailyReqs[item.id] || 0;
      if (dailyReq > 0) {
        const elapsedDays = Math.floor((now - new Date(item.lastUpdated)) / 86400000);
        let effectiveStock = Math.max(0, item.stock - (elapsedDays * dailyReq));
        let daysLeft = Math.floor(effectiveStock / dailyReq);
        if (daysLeft <= 2 && daysLeft >= 0) {
          alerts.push({
            title: `Low Stock: ${item.name}`,
            desc: `${item.name} will run out in ${daysLeft} days.`,
            type: daysLeft === 0 ? 'critical' : 'warning',
            icon: Wheat,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          });
        }
      }
    });
  }

  cows.forEach(cow => {
    const seed = cow.name.length;
    const daysSinceCalving = seed * 10 + 40; 
    const isPregnant = daysSinceCalving > 100;
    
    if (!isPregnant) {
      const daysUntilHeat = 21 - (daysSinceCalving % 21);
      if (daysUntilHeat <= 2 && daysUntilHeat >= 0) {
        alerts.push({
          title: `Heat Alert: ${cow.name}`,
          desc: `Expected in ${daysUntilHeat} days.`,
          type: 'warning',
          icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50'
        });
      }
    } else {
      const aiDate = new Date(Date.now() - (seed * 20 * 86400000));
      const expectedCalving = new Date(aiDate);
      expectedCalving.setDate(expectedCalving.getDate() + 283);
      const daysUntilCalving = Math.floor((expectedCalving - now) / 86400000);
      if (daysUntilCalving <= 2 && daysUntilCalving >= 0) {
        alerts.push({
          title: `Calving Alert: ${cow.name}`,
          desc: `Expected to calve in ${daysUntilCalving} days.`,
          type: 'critical',
          icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50'
        });
      }
    }
    
    const daysSinceFMD = seed * 15;
    const daysUntilFMD = 180 - daysSinceFMD;
    if (daysUntilFMD <= 2 && daysUntilFMD >= 0) {
      alerts.push({
        title: `Vaccine Due: ${cow.name}`,
        desc: `FMD vaccine due in ${daysUntilFMD} days.`,
        type: 'critical',
        icon: Syringe, color: 'text-rose-600', bg: 'bg-rose-50'
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500 bg-white px-3 py-1.5 border rounded-md shadow-sm">
          July 2, 2026
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <MetricCard 
          title="Total Cows" 
          value={totalCows} 
          icon={<Users className="w-6 h-6 text-blue-600" />} 
          onClick={() => setShowCowsModal(true)}
          clickable={true}
          theme="blue"
        />
        <MetricCard 
          title="Today's Milk" 
          value={`${totalMilk} Liters`} 
          icon={<Droplet className="w-6 h-6 text-blue-600" />} 
          onClick={() => setShowMilkModal(true)}
          clickable={true}
          theme="blue"
        />
        <MetricCard 
          title="Avg Milk Quality" 
          value={`${avgFat} F / ${avgSnf} S`} 
          icon={<FlaskConical className="w-6 h-6 text-purple-600" />} 
          onClick={() => setShowQualityModal(true)}
          clickable={true}
          theme="purple"
        />
        <MetricCard 
          title="Daily Feed Cost" 
          value={`₹ ${dailyFeedCost.toFixed(0)}`} 
          icon={<Wheat className="w-6 h-6 text-amber-600" />} 
          onClick={() => setShowFeedBreakdown(true)}
          clickable={true}
          theme="amber"
        />
        <MetricCard 
          title="Daily Net Profit" 
          value={`₹ ${netProfit.toFixed(0)}`} 
          icon={<TrendingUp className="w-6 h-6 text-green-600" />} 
          trendUp={netProfit > 0} 
          onClick={() => setShowProfitBreakdown(true)}
          clickable={true}
          theme="green"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Weekly Milk Production</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={milkData}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Area type="monotone" dataKey="yield" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Tasks */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Critical Alerts
            </h2>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map((alert, idx) => (
                <div key={idx} className={`p-3 border rounded-lg ${alert.bg} border-${alert.color.split('-')[1]}-100`}>
                  <p className={`text-sm font-medium ${alert.color.replace('text', 'text').replace('600', '800')}`}>{alert.title}</p>
                  <p className={`text-xs mt-1 ${alert.color}`}>{alert.desc}</p>
                </div>
              )) : (
                <p className="text-sm text-gray-500 italic text-center py-4">No critical alerts for the next 2 days! ✅</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" /> Upcoming Tasks
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Pregnancy Check: Gauri</p>
                  <p className="text-xs text-gray-500">In 2 days</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Order Silage</p>
                  <p className="text-xs text-gray-500">Next week</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feed Breakdown Modal */}
      {showFeedBreakdown && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-900 text-white shrink-0">
              <div>
                <h2 className="font-extrabold text-2xl">Daily Feed Cost Breakdown</h2>
                <p className="text-sm text-gray-300 mt-1">Exact cost calculation based on your Farm Settings</p>
              </div>
              <button onClick={() => setShowFeedBreakdown(false)} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Cow</th>
                      <th className="px-4 py-3 font-semibold">Diet Mode</th>
                      <th className="px-4 py-3 font-semibold text-green-700">Green Cost</th>
                      <th className="px-4 py-3 font-semibold text-yellow-700">Dry Cost</th>
                      <th className="px-4 py-3 font-semibold text-amber-700">Concentrate Cost</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 text-right">Total Daily Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {feedBreakdown.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-800">{item.name} <span className="text-xs text-gray-400 font-normal ml-1">({item.id})</span></td>
                        <td className="px-4 py-3 text-xs font-semibold"><span className={`px-2 py-1 rounded-md ${item.mode === 'ICAR Science' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{item.mode}</span></td>
                        <td className="px-4 py-3 font-medium text-green-600">₹ {item.green.toFixed(1)}</td>
                        <td className="px-4 py-3 font-medium text-yellow-600">₹ {item.dry.toFixed(1)}</td>
                        <td className="px-4 py-3 font-medium text-amber-600">₹ {item.conc.toFixed(1)}</td>
                        <td className="px-4 py-3 font-bold text-gray-900 text-right">₹ {item.total.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-amber-50">
                    <tr>
                      <td colSpan="5" className="px-4 py-4 font-extrabold text-amber-900 text-right">Grand Total Feed Cost:</td>
                      <td className="px-4 py-4 font-extrabold text-amber-700 text-right text-lg">₹ {dailyFeedCost.toFixed(0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profit Breakdown Modal */}
      {showProfitBreakdown && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-900 text-white shrink-0">
              <div>
                <h2 className="font-extrabold text-2xl flex items-center gap-2"><TrendingUp className="w-6 h-6 text-green-400" /> Daily Net Profit Breakdown</h2>
                <p className="text-sm text-gray-300 mt-1">Milk Income minus Feed Expense for each cow</p>
              </div>
              <button onClick={() => setShowProfitBreakdown(false)} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Cow</th>
                      <th className="px-4 py-3 font-semibold">Milk Yield</th>
                      <th className="px-4 py-3 font-semibold text-blue-700">Milk Income</th>
                      <th className="px-4 py-3 font-semibold text-red-700">Total Feed Cost</th>
                      <th className="px-4 py-3 font-semibold text-green-700 text-right">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {feedBreakdown.map((item) => {
                      const profit = item.income - item.total;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold text-gray-800">{item.name} <span className="text-xs text-gray-400 font-normal ml-1">({item.id})</span></td>
                          <td className="px-4 py-3 font-medium text-gray-700">{item.milk} L</td>
                          <td className="px-4 py-3 font-bold text-blue-600">₹ {item.income.toFixed(0)}</td>
                          <td className="px-4 py-3 font-medium text-red-500">- ₹ {item.total.toFixed(0)}</td>
                          <td className={`px-4 py-3 font-extrabold text-right ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}₹ {profit.toFixed(0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-green-50 border-t-2 border-green-200">
                    <tr>
                      <td colSpan="2" className="px-4 py-4 font-extrabold text-green-900 text-right">Grand Total:</td>
                      <td className="px-4 py-4 font-bold text-blue-700">₹ {dailyIncome.toFixed(0)}</td>
                      <td className="px-4 py-4 font-bold text-red-600">- ₹ {dailyFeedCost.toFixed(0)}</td>
                      <td className="px-4 py-4 font-black text-green-700 text-right text-xl">₹ {netProfit.toFixed(0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Total Cows Modal */}
      {showCowsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-900 text-white shrink-0">
              <div>
                <h2 className="font-extrabold text-2xl flex items-center gap-2"><Users className="w-6 h-6 text-blue-400" /> Active Herd Directory</h2>
                <p className="text-sm text-gray-300 mt-1">List of all cows currently in milk and dry phases</p>
              </div>
              <button onClick={() => setShowCowsModal(false)} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition"><X className="w-6 h-6"/></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cows.map(cow => (
                  <div key={cow.id} className="border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition bg-gray-50">
                    <img src={cow.image} alt={cow.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-lg">{cow.name}</h4>
                      <p className="text-sm text-gray-500 font-medium">{cow.id} • {cow.breed}</p>
                      <p className="text-xs text-blue-600 font-bold mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">{cow.weight} KG • {cow.age || 'Unknown Age'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Milk Modal */}
      {showMilkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-900 text-white shrink-0">
              <div>
                <h2 className="font-extrabold text-2xl flex items-center gap-2"><Droplet className="w-6 h-6 text-blue-400 fill-current" /> Daily Milk Production Log</h2>
                <p className="text-sm text-gray-300 mt-1">Cow-by-cow breakdown and AI Drop Analysis</p>
              </div>
              <button onClick={() => setShowMilkModal(false)} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-blue-50 text-blue-900 border-b-2 border-blue-100">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Cow</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">Yesterday's Milk</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">Today's Milk</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cows.map(cow => {
                      // Mock historical data for demonstration. Gauri is dropping.
                      const isDrop = cow.name === 'Gauri';
                      const yesterday = isDrop ? cow.milk + 2.5 : cow.milk; // Gauri dropped by 2.5 liters
                      const variance = cow.milk - yesterday;
                      const isNegative = variance < 0;

                      return (
                        <tr key={cow.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 font-extrabold text-gray-900 text-lg flex items-center gap-3">
                            <img src={cow.image} alt={cow.name} className="w-10 h-10 rounded-full object-cover border" />
                            {cow.name} <span className="text-xs text-gray-400 font-normal ml-1">({cow.id})</span>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-600 text-center text-lg">{yesterday.toFixed(1)} L</td>
                          <td className={`px-4 py-4 font-black text-center text-xl ${isNegative ? 'text-red-600' : 'text-blue-600'}`}>
                            {cow.milk.toFixed(1)} L
                          </td>
                          <td className="px-4 py-4 text-center">
                            {isNegative ? (
                              <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-bold border border-red-200 flex items-center justify-center gap-1 w-fit mx-auto">
                                ↓ {Math.abs(variance).toFixed(1)} L
                              </span>
                            ) : (
                              <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold border border-green-200 flex items-center justify-center gap-1 w-fit mx-auto">
                                ↔ Stable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* AI Drop Analysis Section */}
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                <h3 className="text-red-900 font-extrabold text-lg flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6" /> GauGuru AI: Milk Drop Alert
                </h3>
                <p className="text-red-800 font-medium mb-4">
                  We noticed a <strong className="font-black text-red-900">2.5 Liter drop</strong> in <strong>Gauri's (COW-02)</strong> milk production today. Here are the most likely scientific reasons based on our analysis:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2"><span className="text-xl">🌡️</span> Heat Stress</h4>
                    <p className="text-sm text-gray-600 mt-1">If the ambient temperature crossed 32°C yesterday, Jersey crossbreds face severe heat stress leading to reduced DMI (Dry Matter Intake) and immediate milk drop.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2"><span className="text-xl">🌾</span> Feed Inconsistency</h4>
                    <p className="text-sm text-gray-600 mt-1">Check if the quality of green fodder (moisture content) dropped, or if the concentrate was changed suddenly affecting rumen microflora.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2"><span className="text-xl">🩺</span> Sub-Clinical Mastitis</h4>
                    <p className="text-sm text-gray-600 mt-1">A sudden drop without other symptoms can be early mastitis. Perform a California Mastitis Test (CMT) immediately before the next milking.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2"><span className="text-xl">❤️</span> Coming into Heat (Estrus)</h4>
                    <p className="text-sm text-gray-600 mt-1">Gauri calved on June 10. She is approaching her first post-partum heat. Cows often drop milk for 24-48 hours when entering estrus due to hormonal shifts.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      
      {/* Quality Breakdown Modal */}
      {showQualityModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-900 text-white shrink-0">
              <div>
                <h2 className="font-extrabold text-2xl flex items-center gap-2"><FlaskConical className="w-6 h-6 text-purple-400" /> Milk Quality Analysis</h2>
                <p className="text-sm text-gray-300 mt-1">Cow-by-cow FAT and SNF breakdown</p>
              </div>
              <button onClick={() => setShowQualityModal(false)} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-purple-50 text-purple-900 border-b-2 border-purple-100">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Cow</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">Breed</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">FAT %</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">SNF %</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">Quality Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cows.map(cow => {
                      const fat = cow.fat || 4.0;
                      const snf = cow.snf || 8.5;
                      const isGood = fat >= 4.0 && snf >= 8.5;

                      return (
                        <tr key={cow.id} className="hover:bg-gray-50 bg-white">
                          <td className="px-4 py-4 font-extrabold text-gray-900 text-lg flex items-center gap-3">
                            <img src={cow.image} alt={cow.name} className="w-10 h-10 rounded-full object-cover border" />
                            {cow.name} <span className="text-xs text-gray-400 font-normal ml-1">({cow.id})</span>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-600 text-center">{cow.breed}</td>
                          <td className="px-4 py-4 font-black text-center text-lg text-purple-700">{fat.toFixed(1)} %</td>
                          <td className="px-4 py-4 font-black text-center text-lg text-indigo-700">{snf.toFixed(1)} %</td>
                          <td className="px-4 py-4 text-center">
                            {isGood ? (
                              <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold border border-green-200">Premium</span>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-bold border border-amber-200">Standard</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-purple-50">
                    <tr>
                      <td colSpan="2" className="px-4 py-4 font-extrabold text-purple-900 text-right uppercase tracking-wider">Herd Average:</td>
                      <td className="px-4 py-4 font-black text-purple-700 text-center text-xl">{avgFat} %</td>
                      <td className="px-4 py-4 font-black text-indigo-700 text-center text-xl">{avgSnf} %</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tips Section */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-blue-500" /> Tips to Improve FAT and SNF</h3>
                <ul className="space-y-3 text-sm text-gray-600 font-medium">
                  <li className="flex gap-3"><span className="text-purple-500 font-bold">•</span> To improve FAT%, ensure sufficient Dry Fodder ( വൈக்கோல் ) intake to promote rumen rumination and acetic acid production.</li>
                  <li className="flex gap-3"><span className="text-indigo-500 font-bold">•</span> To improve SNF%, balance the diet with good quality protein sources like Cotton Seed Cake ( பருத்தி கொட்டை ) or Groundnut Cake ( கடலை பிண்ணாக்கு ).</li>
                  <li className="flex gap-3"><span className="text-blue-500 font-bold">•</span> Heat stress can lower both FAT and SNF. Ensure cows have access to clean drinking water 24/7.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MetricCard({ title, value, icon, trend, trendUp, onClick, clickable, theme = 'blue' }) {
  const themes = {
    blue: 'hover:border-blue-300 hover:ring-blue-100 group-hover:text-blue-700 text-blue-500 bg-blue-50 group-hover:bg-blue-100',
    amber: 'hover:border-amber-300 hover:ring-amber-100 group-hover:text-amber-700 text-amber-500 bg-amber-50 group-hover:bg-amber-100',
    green: 'hover:border-green-300 hover:ring-green-100 group-hover:text-green-700 text-green-500 bg-green-50 group-hover:bg-green-100',
    purple: 'hover:border-purple-300 hover:ring-purple-100 group-hover:text-purple-700 text-purple-500 bg-purple-50 group-hover:bg-purple-100',
  };
  
  const colors = themes[theme];
  const borderRing = clickable ? `hover:shadow-md ring-2 ring-transparent ${colors.split(' ')[0]} ${colors.split(' ')[1]}` : '';
  const titleColor = clickable ? `text-gray-600 ${colors.split(' ')[2]} transition` : 'text-gray-500';
  const clickTextColor = colors.split(' ')[3];
  const iconBg = clickable ? `${colors.split(' ')[4]} ${colors.split(' ')[5]} transition` : colors.split(' ')[4];

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between transition-all ${clickable ? `cursor-pointer group ${borderRing}` : ''}`}
    >
      <div>
        <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>
            {trend} from last week
          </p>
        )}
        {clickable && (
          <p className={`text-xs ${clickTextColor} mt-1 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition`}>Click for breakdown →</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
    </div>
  )
}
