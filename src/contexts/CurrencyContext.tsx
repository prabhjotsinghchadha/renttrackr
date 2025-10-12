'use client';

import React, { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // Rate relative to USD
};

export const CURRENCIES: Record<string, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    exchangeRate: 83.0, // Approximate rate
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    exchangeRate: 1.5, // Approximate rate
  },
};

type CurrencyContextType = {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  convertCurrency: (amount: number, fromCurrency?: Currency) => number;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES.USD!);

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      try {
        const currency = JSON.parse(savedCurrency);
        if (CURRENCIES[currency.code]) {
          setSelectedCurrency(CURRENCIES[currency.code]!);
        }
      } catch (error) {
        console.error('Error loading saved currency:', error);
      }
    }
  }, []);

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedCurrency', JSON.stringify(selectedCurrency));
  }, [selectedCurrency]);

  const convertCurrency = useCallback((amount: number, fromCurrency?: Currency): number => {
    const from = fromCurrency || CURRENCIES.USD;
    const to = selectedCurrency;
    
    // Convert from source currency to USD, then to target currency
    const usdAmount = amount / from!.exchangeRate;
    const convertedAmount = usdAmount * to.exchangeRate;
    
    return convertedAmount;
  }, [selectedCurrency]);

  const formatCurrency = useCallback((amount: number): string => {
    const convertedAmount = convertCurrency(amount);
    
    // Format based on currency
    switch (selectedCurrency.code) {
      case 'INR':
        return `₹${convertedAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'AUD':
        return `A$${convertedAmount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'USD':
      default:
        return `$${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }, [selectedCurrency, convertCurrency]);

  const value: CurrencyContextType = useMemo(() => ({
    selectedCurrency,
    setSelectedCurrency,
    formatCurrency,
    convertCurrency,
  }), [selectedCurrency, formatCurrency, convertCurrency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = use(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
