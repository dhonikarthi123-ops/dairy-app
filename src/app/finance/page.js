"use client";
import { useFarm } from '@/context/FarmContext';
import { DollarSign, ArrowUpRight, ArrowDownRight, Info, Calculator, FileText } from 'lucide-react';

export default function FinancePage() {
  const { cows, prices } = useFarm();

  // Dynamic Calculations based on active cows and diet modes
  let totalMilk = 0;
  let dailyIncome = 0;
  let dailyFeedCost = 0;
  
  const revenueBreakdown = [];
  const feedBreakdown = [];

  cows.forEach(cow => {
    // 1. Milk Revenue
    let m = cow.milk;
    let cowIncome = m * prices.milk;
    totalMilk += m;
    dailyIncome += cowIncome;
    
    revenueBreakdown.push({
      id: cow.id,
      name: cow.name,
      milk: m,
      price: prices.milk,
      total: cowIncome
    });

    // 2. Feed Expense (matching exact logic from Dashboard)
    let w = cow.weight, isJersey = cow.breed.includes('Jersey');
    let total_dm = (w * 0.02) + (m * (isJersey ? 0.45 : 0.40));
    let dry_kg = w * (isJersey ? 0.009 : 0.008);
    let dry_cost = dry_kg * prices.straw;
    let green_cost = 0, conc_cost = 0;
    let modeLabel = 'Unknown';
    let dietMode = cow.dietMode || '1';
    let conc_kg = 0;
    
    if (dietMode === '1') {
      let green_kg = w * 0.05;
      let n = green_kg * (7/20), maize = green_kg * (5/20), v = green_kg * (3/20), ku = green_kg * (3/20), ka = green_kg * (2/20);
      green_cost = (n * (prices.napier || 0)) + (maize * (prices.maize || 0)) + (v * (prices.velimasal || 0)) + (ku * (prices.kuthirai || 0)) + (ka * (prices.karamani || 0));
      conc_kg = Math.max(0, (total_dm - ((green_kg * 0.21) + (dry_kg * 0.90))) / 0.88);
      modeLabel = '5-Type Cocktail';
    } else if (dietMode === '2') {
      let green_kg = (w / 400.0) * (isJersey ? 18.0 : 20.0);
      green_cost = green_kg * (prices.silage || 0);
      conc_kg = Math.max(0, (total_dm - ((green_kg * 0.30) + (dry_kg * 0.90))) / 0.88);
      modeLabel = 'Maize Silage Only';
    } else if (dietMode === '3') {
      let green_kg = w * 0.05;
      green_cost = green_kg * (prices.napier || 0);
      conc_kg = Math.max(0, (total_dm - ((green_kg * 0.20) + (dry_kg * 0.90))) / 0.88);
      modeLabel = 'Super Napier Only';
    } else {
      let green_kg = w * 0.05;
      let s_kg = 5.0, c_kg = 2.0, kb_kg = 2.0;
      let napier_kg = green_kg >= 9.0 ? green_kg - 9.0 : 0;
      green_cost = (s_kg * (prices.silage || 0)) + (c_kg * (prices.cholam || 0)) + (kb_kg * (prices.kambu || 0)) + (napier_kg * (prices.napier || 0));
      let rough_dm = (s_kg*0.30) + (c_kg*0.23) + (kb_kg*0.21) + (napier_kg*0.20) + (dry_kg*0.90);
      conc_kg = Math.max(0, (total_dm - rough_dm) / 0.88);
      modeLabel = 'Hybrid Mix';
    }
    
    conc_cost = conc_kg * prices.concentrate;
    let totalCowFeed = green_cost + dry_cost + conc_cost;
    dailyFeedCost += totalCowFeed;
    
    feedBreakdown.push({
      id: cow.id,
      name: cow.name,
      mode: modeLabel,
      green: green_cost,
      dry: dry_cost,
      conc: conc_cost,
      total: totalCowFeed
    });
  });
  
  let netProfit = dailyIncome - dailyFeedCost;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <DollarSign className="w-7 h-7 text-green-600" />
            </div>
            Finance & Accounts
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Track your income, expenses, and profitability dynamically based on farm settings.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><ArrowUpRight className="w-5 h-5" /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Daily Milk Revenue</h3>
          </div>
          <p className="text-4xl font-black text-gray-900 relative z-10">₹ {dailyIncome.toFixed(2)}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit border border-blue-100 relative z-10">
            <Calculator className="w-3.5 h-3.5" /> Total {totalMilk.toFixed(1)} L @ ₹{prices.milk}/L
          </div>
        </div>
        
        <div className="bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100"><ArrowDownRight className="w-5 h-5" /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Daily Feed Expense</h3>
          </div>
          <p className="text-4xl font-black text-gray-900 relative z-10">₹ {dailyFeedCost.toFixed(2)}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg w-fit border border-red-100 relative z-10">
            <Calculator className="w-3.5 h-3.5" /> Exact breakdown below
          </div>
        </div>
        
        <div className={`bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden transition hover:shadow-md ${netProfit >= 0 ? 'border-b-4 border-b-green-500' : 'border-b-4 border-b-red-500'}`}>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className={`p-2.5 rounded-xl border ${netProfit >= 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Net Daily Profit</h3>
          </div>
          <p className={`text-4xl font-black relative z-10 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹ {netProfit.toFixed(2)}
          </p>
          <div className={`flex items-center gap-1.5 mt-3 text-xs font-bold px-3 py-1.5 rounded-lg w-fit border relative z-10 ${netProfit >= 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
            <Calculator className="w-3.5 h-3.5" /> Revenue - Expenses
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Breakdown */}
        <div className="bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-gray-900 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-extrabold text-white text-lg flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-blue-400" /> Revenue Breakdown</h2>
              <p className="text-xs text-gray-400 mt-1">Cow-by-cow milk income calculation</p>
            </div>
          </div>
          <div className="p-6 overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-blue-800 border-b-2 border-blue-100">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Cow</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">Milk Yield</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center">Price / L</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {revenueBreakdown.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-900">{item.name} <span className="text-xs text-gray-400 ml-1">({item.id})</span></td>
                    <td className="px-4 py-3 font-medium text-gray-600 text-center">{item.milk} L</td>
                    <td className="px-4 py-3 font-medium text-gray-600 text-center">₹{item.price}</td>
                    <td className="px-4 py-3 font-bold text-blue-600 text-right">₹ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                <tr>
                  <td colSpan="3" className="px-4 py-3 font-extrabold text-blue-900 text-right uppercase text-xs">Total Daily Revenue:</td>
                  <td className="px-4 py-3 font-black text-blue-700 text-right text-lg">₹ {dailyIncome.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-gray-900 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-extrabold text-white text-lg flex items-center gap-2"><ArrowDownRight className="w-5 h-5 text-red-400" /> Feed Expense Breakdown</h2>
              <p className="text-xs text-gray-400 mt-1">Cost calculation based on cow's active Diet Mode</p>
            </div>
          </div>
          <div className="p-6 overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-red-50 text-red-800 border-b-2 border-red-100">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Cow & Diet</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center" title="Green Fodder Cost">Green</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center" title="Dry Fodder Cost">Dry</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-center" title="Concentrate Cost">Conc.</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedBreakdown.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-[10px] text-red-500 font-bold uppercase mt-0.5">{item.mode}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-green-600 text-center">₹{item.green.toFixed(0)}</td>
                    <td className="px-4 py-3 font-medium text-amber-600 text-center">₹{item.dry.toFixed(0)}</td>
                    <td className="px-4 py-3 font-medium text-purple-600 text-center">₹{item.conc.toFixed(0)}</td>
                    <td className="px-4 py-3 font-bold text-red-600 text-right">₹ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-red-50 border-t-2 border-red-200">
                <tr>
                  <td colSpan="4" className="px-4 py-3 font-extrabold text-red-900 text-right uppercase text-xs">Total Daily Expense:</td>
                  <td className="px-4 py-3 font-black text-red-700 text-right text-lg">₹ {dailyFeedCost.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
