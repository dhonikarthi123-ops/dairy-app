"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const FarmContext = createContext();

const defaultPrices = {
  milk: 48.0, 
  concentrate: 38.0, 
  straw: 5.0, 
  napier: 2.0, 
  silage: 6.0, 
  cholam: 3.0, 
  kambu: 3.0, 
  maize: 3.0, 
  velimasal: 4.0, 
  kuthirai: 4.5, 
  karamani: 3.5
};

const defaultCows = [
  { 
    id: 'COW-01', name: 'Lakshmi', breed: 'HF Cross', weight: 450, milk: 20, 
    date: '2026-05-01', fat: 3.8, snf: 8.5,
    age: '4 Years', teeth: 4, calves: '1 Female Calf (3 Months)',
    lastCalvingDate: '2026-04-15', inseminationDate: null, isPregnant: false, lactationPhase: 'Peak',
    image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 'COW-02', name: 'Gauri', breed: 'Jersey Cross', weight: 400, milk: 15, 
    date: '2026-06-15', fat: 4.8, snf: 9.0,
    age: '3 Years', teeth: 2, calves: 'None (First Lactation)',
    lastCalvingDate: '2026-06-10', inseminationDate: null, isPregnant: false, lactationPhase: 'Mid',
    image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=400'
  },
];

const defaultCalves = [
  {
    id: 'CALF-01', name: 'Nandini', breed: 'HF Cross', motherId: 'COW-01',
    dob: '2026-04-15', birthWeight: 35, currentWeight: 60,
    image: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=400'
  }
];

const defaultInventory = [
  { id: 'concentrate', name: 'Concentrate Feed', stock: 500, lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'silage', name: 'Maize Silage', stock: 1500, lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'straw', name: 'Dry Straw', stock: 800, lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'napier', name: 'Super Napier', stock: 3000, lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'velimasal', name: 'Velimasal (வேலிமசால்)', stock: 0, lastUpdated: new Date().toISOString() },
  { id: 'kuthirai', name: 'Kuthirai Masal (குதிரை மசால்)', stock: 0, lastUpdated: new Date().toISOString() },
  { id: 'karamani', name: 'Karamani (காராமணி)', stock: 0, lastUpdated: new Date().toISOString() },
  { id: 'maize', name: '60 Days Fodder Maize', stock: 0, lastUpdated: new Date().toISOString() },
  { id: 'kambu', name: '60 Days Fodder Kambu', stock: 0, lastUpdated: new Date().toISOString() },
  { id: 'cholam', name: 'Fodder Cholam', stock: 0, lastUpdated: new Date().toISOString() },
];

export function FarmProvider({ children }) {
  const [prices, setPrices] = useState(defaultPrices);
  const [cows, setCows] = useState(defaultCows);
  const [calves, setCalves] = useState(defaultCalves);
  const [inventory, setInventory] = useState(defaultInventory);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedPrices = localStorage.getItem('farm_prices');
      const savedCows = localStorage.getItem('farm_cows');
      const savedCalves = localStorage.getItem('farm_calves');
      
      if (savedPrices) {
        const parsed = JSON.parse(savedPrices);
        setPrices(prev => ({ ...prev, ...parsed, 
          napier: parsed.napier ?? 2.0, 
          silage: parsed.silage ?? 6.0,
          cholam: parsed.cholam ?? 3.0,
          kambu: parsed.kambu ?? 3.0,
          maize: parsed.maize ?? 3.0,
          velimasal: parsed.velimasal ?? 4.0,
          kuthirai: parsed.kuthirai ?? 4.5,
          karamani: parsed.karamani ?? 3.5
        }));
      }
      
      if (savedCows) {
        const parsedCows = JSON.parse(savedCows);
        const mergedCows = parsedCows.map(pc => {
          const defaultCow = defaultCows.find(dc => dc.id === pc.id) || defaultCows[0];
          return { ...defaultCow, ...pc, fat: pc.fat || defaultCow.fat || 4.0, snf: pc.snf || defaultCow.snf || 8.5 };
        });
        setCows(mergedCows);
      }
      
      if (savedCalves) {
        setCalves(JSON.parse(savedCalves));
      }
      
      const savedInventory = localStorage.getItem('farm_inventory');
      if (savedInventory) {
        const parsedInv = JSON.parse(savedInventory);
        const mergedInv = defaultInventory.map(defItem => {
          const existing = parsedInv.find(p => p.id === defItem.id);
          return existing || defItem;
        });
        setInventory(mergedInv);
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('farm_prices', JSON.stringify(prices));
      localStorage.setItem('farm_cows', JSON.stringify(cows));
      localStorage.setItem('farm_calves', JSON.stringify(calves));
      localStorage.setItem('farm_inventory', JSON.stringify(inventory));
    }
  }, [prices, cows, calves, inventory, isLoaded]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <FarmContext.Provider value={{ prices, setPrices, cows, setCows, calves, setCalves, inventory, setInventory, isMobileMenuOpen, setIsMobileMenuOpen }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  return useContext(FarmContext);
}
