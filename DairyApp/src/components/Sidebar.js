"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Droplet, Wheat, HeartPulse, Dna, Baby, Box, DollarSign, Users, FileText, Bell, Settings, Calculator } from 'lucide-react';

const navItems = [
  { name: 'Dashboard Overview', href: '/', icon: Home },
  { name: 'Cow Management', href: '/cows', icon: List },
  { name: 'Milk Management', href: '/milk', icon: Droplet },
  { name: 'Feed Management', href: '/feed', icon: Wheat },
  { name: 'Feed Simulator', href: '/calculator', icon: Calculator },
  { name: 'Precision TMR Engine', href: '/tmr-engine', icon: Calculator },
  { name: 'Health & Vet Care', href: '/health', icon: HeartPulse },
  { name: 'Breeding', href: '/breeding', icon: Dna },
  { name: 'Calf', href: '/calf', icon: Baby },
  { name: 'Inventory', href: '/inventory', icon: Box },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Nitara AI', href: '/ai', icon: Users }, // AI Assistant
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

import { useFarm } from '@/context/FarmContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useFarm();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-screen bg-white border-r flex flex-col shadow-lg lg:shadow-sm z-50
        transition-transform duration-300 ease-in-out w-64
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:block shrink-0
      `}>
        <div className="h-16 flex items-center px-6 border-b justify-between">
          <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
            🐄 Nitara ERP
          </span>
          <button className="lg:hidden p-1 text-gray-500" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">A</div>
            <div>
              <p>Admin</p>
              <p className="text-xs text-gray-500 font-normal">Farm Manager</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
