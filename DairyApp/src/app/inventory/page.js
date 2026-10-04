"use client"
import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Box, Plus, AlertTriangle, CheckCircle, Clock, Wheat, Info, X } from 'lucide-react';

export default function InventoryPage() {
  const { cows, inventory, setInventory } = useFarm();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ id: 'concentrate', addedStock: 0 });

  // 1. Calculate Daily Feed Requirements dynamically based on active cows
  let reqs = { concentrate: 0, silage: 0, straw: 0, napier: 0, cholam: 0, kambu: 0, maize: 0, velimasal: 0, kuthirai: 0, karamani: 0 };
  
  cows.forEach(cow => {
    let w = cow.weight, m = cow.milk, isJersey = cow.breed.includes('Jersey');
    let total_dm = (w * 0.02) + (m * (isJersey ? 0.45 : 0.40));
    let dry_kg = w * (isJersey ? 0.009 : 0.008);
    reqs.straw += dry_kg;
    let dietMode = cow.dietMode || '1';
    let green_kg = 0;
    
    if (dietMode === '1') {
      green_kg = w * 0.05;
      reqs.napier += green_kg * (7/20);
      reqs.maize += green_kg * (5/20);
      reqs.velimasal += green_kg * (3/20);
      reqs.kuthirai += green_kg * (3/20);
      reqs.karamani += green_kg * (2/20);
      reqs.concentrate += Math.max(0, (total_dm - ((green_kg * 0.21) + (dry_kg * 0.90))) / 0.88);
    } else if (dietMode === '2') {
      green_kg = (w / 400.0) * (isJersey ? 18.0 : 20.0);
      reqs.silage += green_kg;
      reqs.concentrate += Math.max(0, (total_dm - ((green_kg * 0.30) + (dry_kg * 0.90))) / 0.88);
    } else if (dietMode === '3') {
      green_kg = w * 0.05;
      reqs.napier += green_kg;
      reqs.concentrate += Math.max(0, (total_dm - ((green_kg * 0.20) + (dry_kg * 0.90))) / 0.88);
    } else {
      green_kg = w * 0.05;
      reqs.silage += 5.0; reqs.cholam += 2.0; reqs.kambu += 2.0;
      let napier_kg = green_kg >= 9.0 ? green_kg - 9.0 : 0;
      reqs.napier += napier_kg;
      let rough_dm = (5.0*0.30) + (2.0*0.23) + (2.0*0.21) + (napier_kg*0.20) + (dry_kg*0.90);
      reqs.concentrate += Math.max(0, (total_dm - rough_dm) / 0.88);
    }
  });

  // 2. Calculate Effective Stock and Alerts
  const now = new Date();
  
  const processedInventory = inventory.map(item => {
    const dailyReq = reqs[item.id] || 0;
    const lastUpdateDate = new Date(item.lastUpdated);
    // Number of full days elapsed since last stock update
    const elapsedDays = Math.floor((now - lastUpdateDate) / (1000 * 60 * 60 * 24));
    
    // Auto-depletion logic
    let effectiveStock = item.stock - (elapsedDays * dailyReq);
    if (effectiveStock < 0) effectiveStock = 0;
    
    // Estimated days remaining
    let daysLeft = Infinity;
    if (dailyReq > 0) {
      daysLeft = Math.floor(effectiveStock / dailyReq);
    } else if (effectiveStock === 0) {
      daysLeft = 0;
    }
    
    // Determine Alert Status
    let status = 'safe';
    if (daysLeft <= 1) status = 'extreme';
    else if (daysLeft <= 3) status = 'critical';
    else if (daysLeft <= 7) status = 'warning';
    
    return { ...item, dailyReq, elapsedDays, effectiveStock, daysLeft, status };
  });

  // Handle Form Submit
  const handleUpdateStock = (e) => {
    e.preventDefault();
    const updated = inventory.map(item => {
      if (item.id === updateForm.id) {
        // Find how much was left before updating
        const processed = processedInventory.find(p => p.id === item.id);
        const currentLeft = processed.effectiveStock;
        
        return {
          ...item,
          stock: currentLeft + Number(updateForm.addedStock),
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    });
    setInventory(updated);
    setIsUpdateOpen(false);
    setUpdateForm({ ...updateForm, addedStock: 0 });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <Box className="w-7 h-7 text-indigo-600" />
            </div>
            Smart Feed Inventory
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Auto-depleting stock tracker based on daily herd feed requirements.</p>
        </div>
        <button 
          onClick={() => setIsUpdateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-bold"
        >
          <Plus className="w-5 h-5" />
          Update Stock
        </button>
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-indigo-900 leading-relaxed">
          <strong>Auto-Depletion Active:</strong> The system automatically deducts feed every day based on the total daily consumption of your <strong>{cows.length} active cows</strong>. Just add stock when a truck arrives, and we'll alert you exactly when you need to reorder.
        </p>
      </div>

      {/* Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedInventory.map((item) => {
          let colors = {
            border: 'border-gray-200', bg: 'bg-white', text: 'text-gray-900', icon: 'text-green-500', alertBg: 'bg-green-50 text-green-700 border-green-200'
          };
          let alertIcon = <CheckCircle className="w-5 h-5" />;
          let message = `${item.daysLeft} Days of stock left`;
          
          if (item.status === 'extreme') {
            colors = { border: 'border-red-300 ring-4 ring-red-50', bg: 'bg-white', text: 'text-red-900', icon: 'text-red-500', alertBg: 'bg-red-50 text-red-700 border-red-200' };
            alertIcon = <AlertTriangle className="w-5 h-5 animate-pulse" />;
            message = item.daysLeft === 0 ? "OUT OF STOCK!" : "1 Day of stock left! REORDER NOW!";
          } else if (item.status === 'critical') {
            colors = { border: 'border-orange-300 ring-4 ring-orange-50', bg: 'bg-white', text: 'text-orange-900', icon: 'text-orange-500', alertBg: 'bg-orange-50 text-orange-700 border-orange-200' };
            alertIcon = <Clock className="w-5 h-5" />;
            message = `Only ${item.daysLeft} Days left! Reorder soon.`;
          } else if (item.status === 'warning') {
            colors = { border: 'border-yellow-300 ring-4 ring-yellow-50', bg: 'bg-white', text: 'text-yellow-900', icon: 'text-yellow-500', alertBg: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
            alertIcon = <Clock className="w-5 h-5" />;
            message = `${item.daysLeft} Days left. 1 Week Warning.`;
          }

          if (item.dailyReq === 0 && item.effectiveStock === 0) {
            // Only hide if there's no stock AND no daily requirement. If they have stock but 0 requirement, show it.
            // Wait, the user said "show all feed details". Let's show everything so they can see it's zero.
            // Let's just not return null at all!
          }

          if (item.dailyReq === 0 && item.effectiveStock > 0) {
            message = "Stock available. No active consumption.";
            alertIcon = <Info className="w-5 h-5" />;
          }

          return (
            <div key={item.id} className={`rounded-3xl shadow-sm border p-6 transition-all relative overflow-hidden ${colors.border} ${colors.bg}`}>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className={`text-xl font-extrabold ${colors.text}`}>{item.name}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Farm Requirement: <span className="font-bold text-gray-700">{item.dailyReq.toFixed(1)} KG / day</span></p>
                </div>
                <div className={`p-3 rounded-2xl bg-gray-50 border ${colors.icon}`}>
                  <Wheat className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-black ${item.status === 'extreme' ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.effectiveStock.toFixed(0)}
                  </span>
                  <span className="text-gray-500 font-bold mb-1">KG Remaining</span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mt-4">
                  <div 
                    className={`h-2.5 rounded-full ${item.status === 'extreme' ? 'bg-red-500' : item.status === 'critical' ? 'bg-orange-500' : item.status === 'warning' ? 'bg-yellow-400' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (item.effectiveStock / (item.stock || 1)) * 100)}%` }}
                  ></div>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-xl border font-bold text-sm mt-3 ${colors.alertBg}`}>
                  {alertIcon}
                  {message}
                </div>
                
                {item.elapsedDays > 0 && (
                  <p className="text-xs text-gray-400 text-center font-medium mt-2">
                    Auto-deducted {item.elapsedDays} day(s) of usage since last refill.
                  </p>
                )}
              </div>
              
              {/* Background watermark */}
              <div className={`absolute -bottom-6 -right-6 opacity-5 ${colors.icon}`}>
                <Wheat className="w-48 h-48" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Stock Modal */}
      {isUpdateOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-extrabold text-xl text-gray-900">Add Inventory Stock</h2>
              <button onClick={() => setIsUpdateOpen(false)} className="text-gray-500 hover:bg-gray-200 p-2 rounded-xl transition"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleUpdateStock} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Feed Type</label>
                <select 
                  value={updateForm.id} 
                  onChange={e => setUpdateForm({...updateForm, id: e.target.value})} 
                  className="w-full border-2 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-gray-700"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Quantity Added (KG)</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  value={updateForm.addedStock || ''} 
                  onChange={e => setUpdateForm({...updateForm, addedStock: e.target.value})} 
                  className="w-full border-2 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-lg font-bold" 
                  placeholder="e.g. 500" 
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all hover:-translate-y-0.5 mt-2">
                Update Stock
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
