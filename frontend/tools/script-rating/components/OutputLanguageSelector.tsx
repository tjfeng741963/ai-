interface OutputLanguageSelectorProps {
  value: 'zh' | 'en';
  onChange: (lang: 'zh' | 'en') => void;
  compact?: boolean;
}

export function OutputLanguageSelector({ value, onChange, compact }: OutputLanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
      <button
        onClick={() => onChange('zh')}
        className={`${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-md font-medium transition-all flex items-center gap-1 ${
          value === 'zh'
            ? 'bg-indigo-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        🇨🇳 中文台词
      </button>
      <button
        onClick={() => onChange('en')}
        className={`${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-md font-medium transition-all flex items-center gap-1 ${
          value === 'en'
            ? 'bg-indigo-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        🇬🇧 英文台词
      </button>
    </div>
  );
}
