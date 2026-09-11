import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

type BlackTabContextType = {
  isUnlocked: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
};

const BlackTabContext = createContext<BlackTabContextType | null>(null);

const STORAGE_KEY = 'black_tab_unlocked';

export function BlackTabProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, String(isUnlocked));
  }, [isUnlocked]);

  const unlock = (pin: string) => {
    // TODO: Move PIN validation to backend for better security
    const correctPin = import.meta.env.VITE_BLACK_TAB_PIN || '';
    if (pin === correctPin && pin !== '') {
      setIsUnlocked(true);
      return true;
    }
    toast.error('Incorrect PIN');
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
  };

  return (
    <BlackTabContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </BlackTabContext.Provider>
  );
}

export const useBlackTab = () => {
  const context = useContext(BlackTabContext);
  if (!context) throw new Error('useBlackTab must be used within a BlackTabProvider');
  return context;
};
