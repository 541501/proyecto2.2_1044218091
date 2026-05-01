'use client';

import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface SeedModeBannerProps {
  visible: boolean;
  onDismiss?: () => void;
}

export function SeedModeBanner({ visible, onDismiss }: SeedModeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!visible || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-[#FEF3C7] border-b border-[#F59E0B] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertCircle size={20} className="text-[#92400E]" />
        <div className="flex-1">
          <p className="text-sm font-medium text-[#92400E]">
            Sistema en modo semilla. Dirígete a{' '}
            <a href="/admin/db-setup" className="underline font-semibold hover:opacity-80">
              /admin/db-setup
            </a>
            {' '}para completar la configuración inicial del bootstrap.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-[#92400E] hover:bg-[#FCD34D] rounded"
          aria-label="Cerrar banner"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
