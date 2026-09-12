import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useBlackTab } from '../context/BlackTabContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

export function BlackTabUnlockModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { unlock } = useBlackTab();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleUnlock = () => {
    if (unlock(pin)) {
      setPin('');
      setShowPin(false);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setPin('');
          setShowPin(false);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unlock Restricted Features</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="block text-sm font-medium mb-2">PIN / Password</label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 rounded transition-colors"
              aria-label={showPin ? 'Hide password' : 'Show password'}
              title={showPin ? 'Hide password' : 'Show password'}
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <DialogFooter>
          <button
            className="px-4 py-2 border border-border rounded-md hover:bg-accent"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={handleUnlock}
          >
            Unlock
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
