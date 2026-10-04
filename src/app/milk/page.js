"use client"
import { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import Link from 'next/link';
import { Droplet, TrendingUp, Sun, Moon, Calendar, IndianRupee, History, Plus, Activity, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const milkLog = [
  { day: 'Mon', morning: 18, evening: 17, total: 35 },
  { day: 'Tue', morning: 19, evening: 17, total: 36 },
  { day: 'Wed', morning: 18, evening: 16, total: 34 },
  { day: 'Thu', morning: 20, evening: 18, total: 38 },
  { day: 'Fri', morning: 21, evening: 19, total: 40 },
  { day: 'Sat', morning: 22, evening: 19, total: 41 },
  { day: 'Sun', morning: 21, evening: 20, total: 41 },
];

export default function MilkPage() {
  const { cows, prices } = useFarm();
  const [selectedCowId, setSelectedCowId] = useState(cows[0]?.id || '');
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    alert("Milk log saved successfully!");
    setMorning('');
    setEvening('');
  };

  const totalWeek = milkLog.reduce((sum, item) => sum + item.total, 0);
  const avgDaily = (totalWeek / 7).toFixed(1);
  const estimatedRevenue = totalWeek * (prices.milk || 48);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-4 rounded-xl shadow-xl border border-gray-700">
          <p className="font-bold text-lg mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="flex items-center justify-between gap-4">
              <span className="text-blue-400">Morning:</span> 
              <span className="font-bold">{payload[0].value} L</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="text-purple-400">Evening:</span> 
              <span className="font-bold">{payload[1].value} L</span>
            </p>
            <div className="pt-2 mt-2 border-t border-gray-700 flex items-center justify-between gap-4">
              <span className="text-gray-300">Total:</span> 
              <span className="font-bold text-white text-base">{(payload[0].value + payload[1].value).toFixed(1)} L</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Droplet className="w-7 h-7 text-blue-600 fill-blue-600" />
            </div>
            Milk Production
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Log, track, and analyze your herd's daily milk yield and revenue.</p>
        </div>
        <Link href="/" className="bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 p-3 rounded-xl transition border hover:border-red-200 shadow-sm flex items-center gap-2 font-bold">
          <X className="w-5 h-5" />
          Exit
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <Droplet className="w-32 h-32" />
          </div>
          <p className="text-blue-100 font-semibold mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> This Week's Total
          </p>
          <h3 className="text-4xl font-black">{totalWeek} <span className="text-xl font-medium">Liters</span></h3>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <TrendingUp className="w-32 h-32" />
          </div>
          <p className="text-indigo-100 font-semibold mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Daily Average
          </p>
          <h3 className="text-4xl font-black">{avgDaily} <span className="text-xl font-medium">L/Day</span></h3>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <IndianRupee className="w-32 h-32" />
          </div>
          <p className="text-emerald-100 font-semibold mb-1 flex items-center gap-2">
            <IndianRupee className="w-4 h-4" /> Estimated Revenue
          </p>
          <h3 className="text-4xl font-black">₹{estimatedRevenue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Logging Form */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> Log Today's Yield
            </h2>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Cow</label>
                <select 
                  value={selectedCowId}
                  onChange={(e) => setSelectedCowId(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-800 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                >
                  {cows.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-orange-500" /> Morning Yield
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      value={morning}
                      onChange={(e) => setMorning(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 pl-4 pr-12 text-lg font-bold text-gray-900 bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 outline-none transition" 
                      placeholder="0.0" 
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">L</span>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-500" /> Evening Yield
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      value={evening}
                      onChange={(e) => setEvening(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 pl-4 pr-12 text-lg font-bold text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 outline-none transition" 
                      placeholder="0.0" 
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">L</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-4">
                Save Record
              </button>
            </form>
          </div>

          {/* Recent Logs (UI Mock) */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Logs
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Lakshmi', m: 9.5, e: 8.5, time: 'Today, 6:30 PM' },
                { name: 'Gauri', m: 7.0, e: 6.5, time: 'Today, 6:15 PM' },
                { name: 'Kamadhenu', m: 10.0, e: 9.0, time: 'Today, 6:00 PM' }
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{log.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 text-sm">{(log.m + log.e).toFixed(1)} L</p>
                    <p className="text-[10px] text-gray-400 font-medium">{log.m}M + {log.e}E</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Production Trend</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Farm-wide yield over the last 7 days</p>
              </div>
            </div>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={milkLog} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={0}>
                  <defs>
                    <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorEvening" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontWeight: 600, fontSize: 12}} 
                    dy={15} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontWeight: 600, fontSize: 12}} 
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '14px' }} />
                  
                  <Bar dataKey="morning" name="Morning Yield" fill="url(#colorMorning)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="evening" name="Evening Yield" fill="url(#colorEvening)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
