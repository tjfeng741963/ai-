import type { MarketType } from '../services/market-context';

interface MarketTypeSelectorProps {
  value: MarketType;
  onChange: (market: MarketType) => void;
  compact?: boolean;
}

export function MarketTypeSelector({ value, onChange, compact }: MarketTypeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
      <button
        onClick={() => onChange('domestic')}
        className={`${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-md font-medium transition-all flex items-center gap-1 ${
          value === 'domestic'
            ? 'bg-red-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        🇨🇳 国内
      </button>
      <button
        onClick={() => onChange('overseas')}
        className={`${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-md font-medium transition-all flex items-center gap-1 ${
          value === 'overseas'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        🌏 出海
      </button>
    </div>
  );
}
