import { ShoppingBag } from 'lucide-react';
import React from 'react';

export const DefaultMiniCartIcon = ({
  totalQty,
  onClick,
  isOpen,
  disabled = false,
  showItemCount = true,
  syncStatus
}: {
  totalQty: number;
  onClick: () => void;
  isOpen: boolean;
  disabled?: boolean;
  showItemCount?: boolean;
  syncStatus: { syncing: boolean };
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`mini-cart-icon relative rounded-md p-2 text-current hover:bg-white/10 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${isOpen ? 'active' : ''}`}
      aria-label={`Shopping cart with ${totalQty} items`}
    >
      {syncStatus.syncing ? (
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-border"></div>
        </div>
      ) : (
        <ShoppingBag className="h-5 w-5" />
      )}
      {showItemCount && totalQty > 0 && !syncStatus.syncing && (
        <span className="absolute -top-1 right-0 z-10 flex h-[1.125rem] min-w-[1.125rem] translate-x-1/4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none tracking-tight whitespace-nowrap text-primary-foreground ring-2 ring-header tabular-nums">
          {totalQty > 99 ? '99+' : totalQty}
        </span>
      )}
    </button>
  );
};
