// 'use client';

// import { useTranslations } from 'next-intl';
// import { CURRENCIES, useCurrency } from '@/contexts/CurrencyContext';

// export function CurrencySelector() {
//   const t = useTranslations('Currency');
//   const { selectedCurrency, setSelectedCurrency } = useCurrency();

//   const handleCurrencyChange = (currencyCode: string) => {
//     const currency = CURRENCIES[currencyCode];
//     if (currency) {
//       setSelectedCurrency(currency);
//     }
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <span className="text-sm font-medium text-gray-700">{t('currency')}:</span>
//       <select
//         value={selectedCurrency.code}
//         onChange={(e) => handleCurrencyChange(e.target.value)}
//         className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
//       >
//         {Object.values(CURRENCIES).map((currency) => (
//           <option key={currency.code} value={currency.code}>
//             {currency.symbol} {currency.name}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }
