'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

type CurrencyDisplayProps = {
  amount: number;
  className?: string;
};

export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  const { formatCurrency } = useCurrency();
  
  return (
    <span className={className}>
      {formatCurrency(amount)}
    </span>
  );
}
