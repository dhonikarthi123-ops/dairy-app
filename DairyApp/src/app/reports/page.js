"use client";
import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Download, FileText, Calendar, IndianRupee, TrendingUp, TrendingDown, PieChart, Settings2, X, Table } from 'lucide-react';

export default function ReportsPage() {
  const { cows, prices } = useFarm();
  
  // Custom fixed costs that user can change
  const [medicalCost, setMedicalCost] = useState(2500);
  const [transportCost, setTransportCost] = useState(3000);
  const [salary, setSalary] = useState(120000); // Farm annual salary
  
  const [selectedCow, setSelectedCow] = useState(null);

  const annualMedical = Number(medicalCost) || 0;
  const annualTransport = Number(transportCost) || 0;
  const annualSalary = Number(salary) || 0;
  
  const salaryPerCow = cows.length > 0 ? annualSalary / cows.length : 0;

  // Project 365 Days Summary
  const reports = cows.map(cow => {
    // We will use the scientific curve to calculate exact annual income and feed.
    let totalAnnualIncome = 0;
    let totalAnnualFeed = 0;
    let w = cow.weight, isJersey = cow.breed.includes('Jersey');
    let dietMode = cow.dietMode || '1';
    
    // Simulate 305 milking days + 60 dry days
    for (let day = 1; day <= 365; day++) {
      let currentMilk = 0;
      if (day <= 100) currentMilk = cow.milk; // Phase 1: Peak (100%)
      else if (day <= 200) currentMilk = cow.milk * 0.80; // Phase 2: Mid (80%)
      else if (day <= 305) currentMilk = cow.milk * 0.55; // Phase 3: Late (55%)
      else currentMilk = 0; // Phase 4: Dry period (306-365)
      
      totalAnnualIncome += currentMilk * prices.milk;
      
      // Daily Feed logic
      let total_dm = (w * 0.02) + (currentMilk * (isJersey ? 0.45 : 0.40));
      let dry_kg = w * (isJersey ? 0.009 : 0.008);
      let dry_cost = dry_kg * prices.straw;
      let green_cost = 0, conc_cost = 0;
      let conc_kg = 0;
      
      if (dietMode === '1') {
        let green_kg = w * 0.05;
        let n = green_kg * (7/20), maize = green_kg * (5/20), v = green_kg * (3/20), ku = green_kg * (3/20), ka = green_kg * (2/20);
        green_cost = (n * (prices.napier || 0)) + (maize * (prices.maize || 0)) + (v * (prices.velimasal || 0)) + (ku * (prices.kuthirai || 0)) + (ka * (prices.karamani || 0));
        conc_kg = Math.max(0, (total_dm - ((green_kg * 0.21) + (dry_kg * 0.90))) / 0.88);
      } else if (dietMode === '2') {
        let green_kg = (w / 400.0) * (isJersey ? 18.0 : 20.0);
        green_cost = green_kg * (prices.silage || 0);
        conc_kg = Math.max(0, (total_dm - ((green_kg * 0.30) + (dry_kg * 0.90))) / 0.88);
      } else if (dietMode === '3') {
        let green_kg = w * 0.05;
        green_cost = green_kg * (prices.napier || 0);
        conc_kg = Math.max(0, (total_dm - ((green_kg * 0.20) + (dry_kg * 0.90))) / 0.88);
      } else {
        let green_kg = w * 0.05;
        let napier_kg = green_kg >= 9.0 ? green_kg - 9.0 : 0;
        green_cost = (5.0 * (prices.silage || 0)) + (2.0 * (prices.cholam || 0)) + (2.0 * (prices.kambu || 0)) + (napier_kg * (prices.napier || 0));
        let rough_dm = (5.0*0.30) + (2.0*0.23) + (2.0*0.21) + (napier_kg*0.20) + (dry_kg*0.90);
        conc_kg = Math.max(0, (total_dm - rough_dm) / 0.88);
      }
      conc_cost = conc_kg * prices.concentrate;
      totalAnnualFeed += (green_cost + dry_cost + conc_cost);
    }
    
    const totalExpense = totalAnnualFeed + annualMedical + annualTransport + salaryPerCow;
    const netProfit = totalAnnualIncome - totalExpense;

    return {
      id: cow.id,
      name: cow.name,
      cowRef: cow, // For modal
      annualIncome: totalAnnualIncome,
      annualFeed: totalAnnualFeed,
      annualMedical,
      annualTransport,
      salaryShare: salaryPerCow,
      totalExpense,
      netProfit
    };
  });

  const grandTotalIncome = reports.reduce((s, r) => s + r.annualIncome, 0);
  const grandTotalFeed = reports.reduce((s, r) => s + r.annualFeed, 0);
  const grandTotalMedical = reports.reduce((s, r) => s + r.annualMedical, 0);
  const grandTotalTransport = reports.reduce((s, r) => s + r.annualTransport, 0);
  const grandTotalExpense = reports.reduce((s, r) => s + r.totalExpense, 0);
  const grandTotalProfit = reports.reduce((s, r) => s + r.netProfit, 0);

  const handleDownloadAnnualExcel = () => {
    let csvData = "Cow ID,Cow Name,Annual Income (Rs),Annual Feed Cost (Rs),Annual Medical Exp (Rs),Annual Transport Exp (Rs),Worker Salary Share (Rs),Total Expense (Rs),Net Profit (Rs)\n";
    reports.forEach(r => {
      csvData += `${r.id},${r.name},${r.annualIncome.toFixed(2)},${r.annualFeed.toFixed(2)},${r.annualMedical.toFixed(2)},${r.annualTransport.toFixed(2)},${r.salaryShare.toFixed(2)},${r.totalExpense.toFixed(2)},${r.netProfit.toFixed(2)}\n`;
    });
    
    csvData += `,,,,,,\nHERD TOTAL,All Cows,${grandTotalIncome.toFixed(2)},${grandTotalFeed.toFixed(2)},${grandTotalMedical.toFixed(2)},${grandTotalTransport.toFixed(2)},${annualSalary.toFixed(2)},${grandTotalExpense.toFixed(2)},${grandTotalProfit.toFixed(2)}\n`;
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Farm_Annual_Report_365_Days.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <FileText className="w-7 h-7 text-indigo-600" />
            </div>
            Annual Farm Report
          </h1>
          <p className="text-gray-500 mt-2 font-medium">365-Day projected financial statement based on current parameters.</p>
        </div>
        <button 
          onClick={handleDownloadAnnualExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-bold"
        >
          <Download className="w-5 h-5" />
          Export to Excel (CSV)
        </button>
      </div>

      {/* Report Settings */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 bg-gray-100 rounded-xl">
            <Settings2 className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Report Settings</h3>
            <p className="text-xs text-gray-500">Adjust annual fixed estimates</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Farm Worker Salary (₹/Yr)</label>
            <input 
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold text-gray-900 bg-gray-50 focus:bg-white transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Annual Medical (₹/Cow)</label>
            <input 
              type="number"
              value={medicalCost}
              onChange={(e) => setMedicalCost(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold text-gray-900 bg-gray-50 focus:bg-white transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Annual Transport (₹/Cow)</label>
            <input 
              type="number"
              value={transportCost}
              onChange={(e) => setTransportCost(e.target.value)}
              className="w-full border-2 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold text-gray-900 bg-gray-50 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Herd Total Cards */}
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><PieChart className="w-5 h-5 text-gray-500" /> Herd Total (365 Days Projection)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><IndianRupee className="w-5 h-5" /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Income</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">₹ {(grandTotalIncome/100000).toFixed(2)} L</p>
          <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md w-fit border border-blue-100 mt-2">For 305 Milking Days</p>
        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100"><TrendingDown className="w-5 h-5" /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Feed Exp.</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">₹ {(grandTotalFeed/100000).toFixed(2)} L</p>
          <p className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-md w-fit border border-orange-100 mt-2">For 365 Days</p>
        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100"><TrendingDown className="w-5 h-5" /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Fixed Expenses</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">₹ {((grandTotalMedical+grandTotalTransport+annualSalary)/1000).toFixed(1)} K</p>
          <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-md w-fit border border-red-100 mt-2">Med + Trans + Salary</p>
        </div>

        <div className={`bg-white rounded-3xl border shadow-sm p-6 relative overflow-hidden transition hover:shadow-md ${grandTotalProfit >= 0 ? 'border-b-4 border-b-green-500' : 'border-b-4 border-b-red-500'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl border ${grandTotalProfit >= 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Net Annual Profit</h3>
          </div>
          <p className={`text-3xl font-black ${grandTotalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹ {(grandTotalProfit/100000).toFixed(2)} L
          </p>
          <p className={`text-xs font-bold px-3 py-1 rounded-md w-fit border mt-2 ${grandTotalProfit >= 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>Income - All Expenses</p>
        </div>
      </div>

      {/* Individual Cow Table */}
      <div className="bg-white border rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gray-900 flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-extrabold text-white text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400" /> Individual Cow Summary</h2>
            <p className="text-xs text-gray-400 mt-1">Click on any cow to see its Day-by-Day 365 Ledger</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-indigo-50 text-indigo-900 border-b-2 border-indigo-100">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Cow</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right text-blue-700">Income (305d)</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right text-orange-700">Feed (365d)</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right text-red-700">Fixed Share</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right text-gray-800">Total Expense</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right text-green-700">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map(item => (
                <tr 
                  key={item.id} 
                  className="hover:bg-indigo-50 cursor-pointer transition"
                  onClick={() => setSelectedCow(item)}
                >
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    {item.name} <span className="text-xs text-gray-400">({item.id})</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md ml-2">Click to view Ledger</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600 text-right bg-blue-50/30">₹ {item.annualIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                  <td className="px-6 py-4 font-medium text-orange-600 text-right">₹ {item.annualFeed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                  <td className="px-6 py-4 font-medium text-red-500 text-right">₹ {(item.annualMedical + item.annualTransport + item.salaryShare).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-right bg-gray-50/50">₹ {item.totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                  <td className={`px-6 py-4 font-black text-right ${item.netProfit >= 0 ? 'text-green-600 bg-green-50/30' : 'text-red-600 bg-red-50/30'}`}>
                    ₹ {item.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 305-Day Ledger Modal */}
      {selectedCow && (
        <CowLedgerModal 
          cowData={selectedCow}
          prices={prices}
          onClose={() => setSelectedCow(null)}
        />
      )}
    </div>
  );
}

// Separate Component for the Modal to keep code clean
function CowLedgerModal({ cowData, prices, onClose }) {
  const { cowRef, annualMedical, annualTransport, salaryShare } = cowData;
  const fixedDailyExpense = (annualMedical + annualTransport + salaryShare) / 365;
  const startDate = new Date(cowRef.lastCalvingDate || Date.now());
  
  let ledger = [];
  let w = cowRef.weight, isJersey = cowRef.breed.includes('Jersey'), dietMode = cowRef.dietMode || '1';

  for (let day = 1; day <= 365; day++) {
    // Scientific Curve Logic as per requested format
    let currentMilk = 0;
    let phaseName = '';
    if (day <= 100) { currentMilk = cowRef.milk; phaseName = 'Phase 1: Peak'; }
    else if (day <= 200) { currentMilk = cowRef.milk * 0.80; phaseName = 'Phase 2: Mid'; }
    else if (day <= 305) { currentMilk = cowRef.milk * 0.55; phaseName = 'Phase 3: Late'; }
    else { currentMilk = 0; phaseName = 'Phase 4: Dry'; }

    const dailyIncome = currentMilk * prices.milk;

    // Daily Feed logic
    let total_dm = (w * 0.02) + (currentMilk * (isJersey ? 0.45 : 0.40));
    let dry_kg = w * (isJersey ? 0.009 : 0.008);
    let dry_cost = dry_kg * prices.straw;
    let green_cost = 0, conc_kg = 0;
    
    if (dietMode === '1') {
      let green_kg = w * 0.05;
      let n = green_kg * (7/20), maize = green_kg * (5/20), v = green_kg * (3/20), ku = green_kg * (3/20), ka = green_kg * (2/20);
      green_cost = (n * (prices.napier || 0)) + (maize * (prices.maize || 0)) + (v * (prices.velimasal || 0)) + (ku * (prices.kuthirai || 0)) + (ka * (prices.karamani || 0));
      conc_kg = Math.max(0, (total_dm - ((green_kg * 0.21) + (dry_kg * 0.90))) / 0.88);
    } else if (dietMode === '2') {
      let green_kg = (w / 400.0) * (isJersey ? 18.0 : 20.0);
      green_cost = green_kg * (prices.silage || 0);
      conc_kg = Math.max(0, (total_dm - ((green_kg * 0.30) + (dry_kg * 0.90))) / 0.88);
    } else if (dietMode === '3') {
      let green_kg = w * 0.05;
      green_cost = green_kg * (prices.napier || 0);
      conc_kg = Math.max(0, (total_dm - ((green_kg * 0.20) + (dry_kg * 0.90))) / 0.88);
    } else {
      let green_kg = w * 0.05;
      let napier_kg = green_kg >= 9.0 ? green_kg - 9.0 : 0;
      green_cost = (5.0 * (prices.silage || 0)) + (2.0 * (prices.cholam || 0)) + (2.0 * (prices.kambu || 0)) + (napier_kg * (prices.napier || 0));
      let rough_dm = (5.0*0.30) + (2.0*0.23) + (2.0*0.21) + (napier_kg*0.20) + (dry_kg*0.90);
      conc_kg = Math.max(0, (total_dm - rough_dm) / 0.88);
    }
    const conc_cost = conc_kg * prices.concentrate;
    const dailyFeed = green_cost + dry_cost + conc_cost;
    
    const totalDailyExpense = dailyFeed + fixedDailyExpense;
    const dailyProfit = dailyIncome - totalDailyExpense;

    let dDate = new Date(startDate);
    dDate.setDate(dDate.getDate() + (day - 1));

    ledger.push({
      day,
      dateStr: dDate.toLocaleDateString('en-IN'),
      phase: phaseName,
      milk: currentMilk,
      income: dailyIncome,
      feed: dailyFeed,
      fixed: fixedDailyExpense,
      totalExp: totalDailyExpense,
      profit: dailyProfit
    });
  }

  const handleDownloadLedger = () => {
    let csvData = `Day,Date,Phase,Milk Yield (L),Income (Rs),Feed Cost (Rs),Fixed Cost Share (Rs),Total Expense (Rs),Net Profit (Rs)\n`;
    ledger.forEach(r => {
      csvData += `${r.day},${r.dateStr},${r.phase},${r.milk.toFixed(1)},${r.income.toFixed(2)},${r.feed.toFixed(2)},${r.fixed.toFixed(2)},${r.totalExp.toFixed(2)},${r.profit.toFixed(2)}\n`;
    });
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${cowData.name}_365_Day_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-900 text-white shrink-0">
          <div>
            <h2 className="font-extrabold text-2xl flex items-center gap-2"><Table className="w-6 h-6 text-indigo-400" /> {cowData.name}'s 365-Day Ledger</h2>
            <p className="text-sm text-gray-300 mt-1">Daily Breakdown (100d Peak, 100d Mid, 105d Late, 60d Dry)</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleDownloadLedger}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Ledger
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition"><X className="w-6 h-6"/></button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 bg-gray-50 p-6">
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-indigo-50 text-indigo-900 border-b-2 border-indigo-100 sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase text-xs">Day / Date</th>
                  <th className="px-4 py-3 font-bold uppercase text-xs text-center">Phase</th>
                  <th className="px-4 py-3 font-bold uppercase text-xs text-right text-blue-700">Yield (L)</th>
                  <th className="px-4 py-3 font-bold uppercase text-xs text-right text-blue-700">Income</th>
                  <th className="px-4 py-3 font-bold uppercase text-xs text-right text-orange-700">Feed Cost</th>
                  <th className="px-4 py-3 font-bold uppercase text-xs text-right text-red-700">Fixed Cost</th>
                  <th className="px-4 py-3 font-bold uppercase text-xs text-right text-gray-800">Total Exp</th>
                  <th className="px-4 py-3 font-bold uppercase text-xs text-right text-green-700">Daily Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledger.map(row => (
                  <tr key={row.day} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-bold text-gray-900">Day {row.day} <span className="font-normal text-gray-400 ml-1 text-xs">{row.dateStr}</span></td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${row.phase.includes('Peak') ? 'bg-purple-100 text-purple-700' : row.phase.includes('Mid') ? 'bg-blue-100 text-blue-700' : row.phase.includes('Late') ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{row.phase}</span>
                    </td>
                    <td className="px-4 py-2 font-bold text-blue-600 text-right">{row.milk.toFixed(1)}</td>
                    <td className="px-4 py-2 font-medium text-blue-600 text-right">₹ {row.income.toFixed(2)}</td>
                    <td className="px-4 py-2 font-medium text-orange-600 text-right">₹ {row.feed.toFixed(2)}</td>
                    <td className="px-4 py-2 font-medium text-red-500 text-right">₹ {row.fixed.toFixed(2)}</td>
                    <td className="px-4 py-2 font-bold text-gray-800 text-right">₹ {row.totalExp.toFixed(2)}</td>
                    <td className={`px-4 py-2 font-black text-right ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹ {row.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
