"use client";
import { useState } from 'react';
import { Bell, HeartPulse, Wheat, Dna, DollarSign, Server, Check, Trash2, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const initialNotifications = [
    {
      id: 1,
      type: 'health',
      title: 'Vaccination Due: FMD Alert',
      message: 'FMD vaccination is due for 12 cows in the next 3 days. Please schedule the vet visit.',
      time: '2 hours ago',
      read: false,
      icon: HeartPulse,
      color: 'rose'
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Critical Stock Level: Groundnut Cake',
      message: 'Inventory alert! Groundnut cake stock is critically low (estimated 2 days left). Reorder immediately to avoid diet disruption.',
      time: '5 hours ago',
      read: false,
      icon: Wheat,
      color: 'orange'
    },
    {
      id: 3,
      type: 'breeding',
      title: 'Heat Cycle Watch: Lakshmi (C001)',
      message: 'Lakshmi is 60 days post-calving. Voluntary waiting period is over. Please monitor for signs of heat.',
      time: '1 day ago',
      read: true,
      icon: Dna,
      color: 'indigo'
    },
    {
      id: 4,
      type: 'finance',
      title: 'Payment Received',
      message: 'Milk co-operative payment of ₹45,200 has been successfully credited for the period ending June 30th.',
      time: '2 days ago',
      read: true,
      icon: DollarSign,
      color: 'emerald'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Backup Complete',
      message: 'Your farm data has been successfully backed up to the cloud securely.',
      time: '2 days ago',
      read: true,
      icon: Server,
      color: 'blue'
    }
  ];

  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gray-900 rounded-xl relative">
              <Bell className="w-7 h-7 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </div>
            Notifications Inbox
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Professional alerts and system updates for your farm.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm font-bold border border-gray-300"
          >
            <CheckCircle2 className="w-5 h-5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-bold border-b-2 transition ${activeTab === 'all' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          All Messages
        </button>
        <button 
          onClick={() => setActiveTab('unread')}
          className={`flex items-center gap-2 px-6 py-3 font-bold border-b-2 transition ${activeTab === 'unread' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Unread {unreadCount > 0 && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md text-xs">{unreadCount}</span>}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 animate-in fade-in duration-300">
        {filteredNotifications.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">All caught up!</h3>
            <p className="text-gray-500 mt-2">You have no new notifications right now.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const Icon = notification.icon;
            const col = notification.color;
            
            return (
              <div 
                key={notification.id} 
                className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border transition-all ${notification.read ? 'bg-white border-gray-100 opacity-80' : `bg-${col}-50/30 border-${col}-200 shadow-sm ring-1 ring-${col}-100/50`}`}
              >
                {/* Icon */}
                <div className="shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-100 text-gray-500' : `bg-${col}-100 text-${col}-600`}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-4">{notification.time}</span>
                  </div>
                  <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {notification.message}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex sm:flex-col justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDismiss(notification.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Dismiss"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
