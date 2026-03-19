import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character, CharacterRelationship, CharacterRole } from '@/types/rating-advanced.ts';

interface CharacterNetworkProps {
  characters: Character[];
  relationships: CharacterRelationship[];
  goldenLines?: Array<{ character: string; line: string; context: string }>;
  voiceDistinction?: string;
}

// 角色类型配置
const ROLE_CONFIG: Record<CharacterRole, { color: string; size: number; label: string }> = {
  protagonist: { color: '#6366f1', size: 60, label: '主角' },
  antagonist: { color: '#ef4444', size: 55, label: '反派' },
  supporting: { color: '#22c55e', size: 45, label: '配角' },
  minor: { color: '#9ca3af', size: 35, label: '次要' },
};

// 关系类型颜色
const RELATION_COLORS: Record<string, string> = {
  '爱情': '#ec4899',
  '父子': '#3b82f6',
  '母子': '#3b82f6',
  '对立': '#ef4444',
  '合作': '#22c55e',
  '师徒': '#8b5cf6',
  '兄弟': '#06b6d4',
  '姐妹': '#06b6d4',
  '朋友': '#84cc16',
};

// 张力等级配置
const TENSION_CONFIG = {
  high: { width: 3, dash: '' },
  medium: { width: 2, dash: '5,5' },
  low: { width: 1, dash: '3,3' },
};

// 计算节点位置（环形布局）
function calculatePositions(count: number, centerX: number, centerY: number, radius: number) {
  const positions: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }
  return positions;
}

export function CharacterNetwork({
  characters,
  relationships,
  goldenLines = [],
  voiceDistinction,
}: CharacterNetworkProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [hoveredRelation, setHoveredRelation] = useState<CharacterRelationship | null>(null);

  // 计算布局
  const layout = useMemo(() => {
    const width = 400;
    const height = 350;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;

    // 按角色重要性排序
    const sortedChars = [...characters].sort((a, b) => {
      const order = { protagonist: 0, antagonist: 1, supporting: 2, minor: 3 };
      return order[a.role] - order[b.role];
    });

    const positions = calculatePositions(sortedChars.length, centerX, centerY, radius);

    return {
      width,
      height,
      characters: sortedChars.map((char, i) => ({
        ...char,
        x: positions[i].x,
        y: positions[i].y,
      })),
    };
  }, [characters]);

  // 获取角色位置
  const getCharPosition = (charId: string) => {
    const char = layout.characters.find((c) => c.id === charId || c.name === charId);
    return char ? { x: char.x, y: char.y } : null;
  };

  // 获取选中角色的关系
  const selectedRelations = selectedCharacter
    ? relationships.filter(
        (r) =>
          r.from === selectedCharacter.id ||
          r.to === selectedCharacter.id ||
          r.from === selectedCharacter.name ||
          r.to === selectedCharacter.name
      )
    : [];

  if (characters.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👥</span>
          人物关系图
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          暂无人物关系数据
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">👥</span>
          人物关系图
        </h3>

        {voiceDistinction && (
          <span
            className={`
              px-2 py-1 text-xs rounded-full
              ${voiceDistinction === 'excellent' ? 'bg-green-100 text-green-600' : ''}
              ${voiceDistinction === 'good' ? 'bg-blue-100 text-blue-600' : ''}
              ${voiceDistinction === 'fair' ? 'bg-yellow-100 text-yellow-600' : ''}
              ${voiceDistinction === 'poor' ? 'bg-red-100 text-red-600' : ''}
            `}
          >
            语言区分度：{
              { excellent: '优秀', good: '良好', fair: '一般', poor: '较弱' }[voiceDistinction]
            }
          </span>
        )}
      </div>

      {/* SVG 图表 */}
      <div className="relative">
        <svg
          width="100%"
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="overflow-visible"
        >
          {/* 关系连线 */}
          <g className="relationships">
            {relationships.map((rel, index) => {
              const from = getCharPosition(rel.from);
              const to = getCharPosition(rel.to);
              if (!from || !to) return null;

              const color = RELATION_COLORS[rel.type] || '#94a3b8';
              const tension = TENSION_CONFIG[rel.tension] || TENSION_CONFIG.medium;
              const isHighlighted =
                hoveredRelation === rel ||
                (selectedCharacter &&
                  (rel.from === selectedCharacter.id ||
                    rel.from === selectedCharacter.name ||
                    rel.to === selectedCharacter.id ||
                    rel.to === selectedCharacter.name));

              // 计算曲线控制点
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const offset = 20;
              const ctrlX = midX + (dy / Math.sqrt(dx * dx + dy * dy)) * offset;
              const ctrlY = midY - (dx / Math.sqrt(dx * dx + dy * dy)) * offset;

              return (
                <g
                  key={`rel-${index}`}
                  onMouseEnter={() => setHoveredRelation(rel)}
                  onMouseLeave={() => setHoveredRelation(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHighlighted ? tension.width + 1 : tension.width}
                    strokeDasharray={tension.dash}
                    opacity={isHighlighted ? 1 : 0.6}
                    className="transition-all duration-200"
                  />

                  {/* 关系标签 */}
                  {isHighlighted && (
                    <text
                      x={ctrlX}
                      y={ctrlY - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill={color}
                      className="pointer-events-none"
                    >
                      {rel.type}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 角色节点 */}
          <g className="characters">
            {layout.characters.map((char) => {
              const config = ROLE_CONFIG[char.role] || ROLE_CONFIG.minor;
              const isSelected = selectedCharacter?.id === char.id;

              return (
                <g
                  key={char.id}
                  transform={`translate(${char.x}, ${char.y})`}
                  onClick={() => setSelectedCharacter(isSelected ? null : char)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* 外圈（选中时） */}
                  {isSelected && (
                    <motion.circle
                      r={config.size / 2 + 8}
                      fill="none"
                      stroke={config.color}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    />
                  )}

                  {/* 主圆 */}
                  <circle
                    r={config.size / 2}
                    fill={config.color}
                    opacity={0.9}
                    className="transition-all duration-200 hover:opacity-100"
                  />

                  {/* 角色名 */}
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fill="white"
                    fontSize={config.size > 45 ? 12 : 10}
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {char.name.slice(0, 3)}
                  </text>

                  {/* 角色类型标签 */}
                  <text
                    textAnchor="middle"
                    y={config.size / 2 + 14}
                    fill="#64748b"
                    fontSize="10"
                    className="pointer-events-none"
                  >
                    {config.label}
                  </text>

                  {/* 评分 */}
                  {char.score && (
                    <g transform={`translate(${config.size / 2 - 5}, ${-config.size / 2 + 5})`}>
                      <circle r="10" fill="white" stroke={config.color} strokeWidth="1" />
                      <text
                        textAnchor="middle"
                        dy="0.35em"
                        fontSize="9"
                        fill={config.color}
                        fontWeight="bold"
                      >
                        {char.score}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* 悬浮关系信息 */}
        <AnimatePresence>
          {hoveredRelation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 text-sm max-w-xs"
            >
              <div className="font-semibold text-gray-800">
                {hoveredRelation.from} → {hoveredRelation.to}
              </div>
              <div className="text-gray-500 mt-1">
                关系：{hoveredRelation.type} | 张力：
                {{ high: '高', medium: '中', low: '低' }[hoveredRelation.tension]}
              </div>
              {hoveredRelation.description && (
                <div className="text-gray-400 text-xs mt-1">
                  {hoveredRelation.description}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 选中角色详情 */}
      <AnimatePresence>
        {selectedCharacter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-xl overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  {selectedCharacter.name}
                  <span
                    className="px-2 py-0.5 text-xs rounded-full text-white"
                    style={{ backgroundColor: ROLE_CONFIG[selectedCharacter.role].color }}
                  >
                    {ROLE_CONFIG[selectedCharacter.role].label}
                  </span>
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  弧线类型：{selectedCharacter.arcType}
                </p>
              </div>
              <button
                onClick={() => setSelectedCharacter(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div>
                <span className="text-gray-500">动机：</span>
                <span className="text-gray-700">{selectedCharacter.motivation}</span>
              </div>
              <div>
                <span className="text-gray-500">缺陷：</span>
                <span className="text-gray-700">{selectedCharacter.flaw}</span>
              </div>
            </div>

            {selectedCharacter.emotionalArc && (
              <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                情感弧线：{selectedCharacter.emotionalArc}
              </p>
            )}

            {selectedCharacter.memorableTraits?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCharacter.memorableTraits.map((trait, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full">
                    {trait}
                  </span>
                ))}
              </div>
            )}

            {/* 相关关系 */}
            {selectedRelations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-xs font-semibold text-gray-500 mb-2">相关关系</h5>
                <div className="space-y-1">
                  {selectedRelations.map((rel, i) => (
                    <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: RELATION_COLORS[rel.type] || '#94a3b8' }}
                      />
                      {rel.from} - {rel.type} - {rel.to}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 角色卡片列表 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {layout.characters.map((char) => {
          const config = ROLE_CONFIG[char.role] || ROLE_CONFIG.minor;
          const charGoldenLines = goldenLines.filter((l) => l.character === char.name);

          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* 角色头部 */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                >
                  {char.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-800">{char.name}</h4>
                    <span
                      className="px-2 py-0.5 text-xs rounded-full text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.label}
                    </span>
                    {char.score && (
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-600">
                        塑造分: {char.score}/10
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {char.arcType && `弧线: ${char.arcType}`}
                  </p>
                </div>
              </div>

              {/* 角色详情 */}
              <div className="space-y-2 text-sm">
                {char.motivation && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">🎯</span>
                    <div>
                      <span className="text-gray-500">核心动机：</span>
                      <span className="text-gray-700">{char.motivation}</span>
                    </div>
                  </div>
                )}
                {char.flaw && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">⚡</span>
                    <div>
                      <span className="text-gray-500">性格缺陷：</span>
                      <span className="text-gray-700">{char.flaw}</span>
                    </div>
                  </div>
                )}
                {char.emotionalArc && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">📈</span>
                    <div>
                      <span className="text-gray-500">情感弧线：</span>
                      <span className="text-gray-700">{char.emotionalArc}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 记忆点标签 */}
              {char.memorableTraits && char.memorableTraits.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {char.memorableTraits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full border border-gray-200"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}

              {/* 该角色的金句 */}
              {charGoldenLines.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-amber-600 font-medium mb-1">💬 代表台词</p>
                  {charGoldenLines.slice(0, 2).map((line, i) => (
                    <p key={i} className="text-sm text-gray-700 italic mb-1">
                      "{line.line}"
                      <span className="text-gray-400 text-xs not-italic ml-1">— {line.context}</span>
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 金句展示 */}
      {goldenLines.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 rounded-xl">
          <h4 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1">
            <span>💬</span>
            全部金句台词 ({goldenLines.length}句)
          </h4>
          <div className="space-y-3">
            {goldenLines.map((line, i) => (
              <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">{line.character}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500 text-sm">{line.context}</span>
                </div>
                <p className="mt-1 text-gray-700 italic">"{line.line}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => (
          <div key={role} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default CharacterNetwork;
