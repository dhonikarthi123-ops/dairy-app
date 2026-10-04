import { Search, Bell, Menu } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-gray-500 hover:text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search cows, records..." 
            className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-gray-50"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
