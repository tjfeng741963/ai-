import { type ContentType, CONTENT_TYPE_CONFIGS } from '../types/rating';

interface ContentTypeSelectorProps {
  value: ContentType;
  onChange: (type: ContentType) => void;
  disabled?: boolean;
}

export function ContentTypeSelector({ value, onChange, disabled }: ContentTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CONTENT_TYPE_CONFIGS.map((config) => {
        const isSelected = value === config.type;
        return (
          <button
            key={config.type}
            onClick={() => onChange(config.type)}
            disabled={disabled}
            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* 选中指示器 */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* 图标和标题 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{config.icon}</span>
              <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                {config.label}
              </span>
            </div>

            {/* 描述 */}
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{config.description}</p>

            {/* 元信息 */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                {config.timeRange}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                {config.platform.split('、')[0]}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
