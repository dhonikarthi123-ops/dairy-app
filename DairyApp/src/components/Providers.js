"use client";

import { FarmProvider } from '@/context/FarmContext';

export default function Providers({ children }) {
  return (
    <FarmProvider>
      {children}
    </FarmProvider>
  );
}
