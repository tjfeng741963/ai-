/**
 * AI漫剧标签库 — 国内 + 出海
 *
 * 用途：
 *  1. 在 prompt 中给出完整的候选标签集合，引导 AI 从中选取最匹配的标签
 *  2. 前端标签选择器 / 筛选器的数据源
 *  3. 导出报告中标签的规范化映射
 */

// ================================================================
//  一、国内标签库 (Domestic)
// ================================================================

/** 受众频道 */
export const AUDIENCE_CHANNEL = ['男频', '女频', '中性', '全民'] as const;

/** 题材大类 */
export const GENRE_CATEGORY = [
  // 现代
  '都市', '现代', '职场', '校园', '乡村', '家庭',
  // 古风
  '古装', '古言', '宫廷', '武侠',
  // 幻想
  '玄幻', '仙侠', '修仙', '奇幻',
  // 特殊
  '科幻', '末日', '悬疑', '惊悚', '恐怖',
  // 年代
  '年代', '民国', '八零年代', '九零年代',
  // 其他
  '军旅', '体育', '游戏', '二次元',
] as const;

/** 核心情节模式 */
export const PLOT_PATTERN = [
  '重生', '逆袭', '穿越', '穿书', '复仇', '打脸',
  '系统', '金手指', '马甲', '身份反转', '扮猪吃虎',
  '废柴觉醒', '天降', '闪婚', '替身', '契约',
  '失忆', '冒名顶替', '隐藏身份', '回归',
  '夺嫡', '宅斗', '宫斗', '商战',
] as const;

/** 人设标签 */
export const CHARACTER_ARCHETYPE = [
  // 男性人设
  '战神', '赘婿', '龙王', '神医', '保安', '保镖',
  '神豪', '首富', '兵王', '特种兵', '隐世高手',
  '大男主', '强者回归', '修罗', '少帅',
  // 女性人设
  '大女主', '女强', '女帝', '千金', '假千金', '真千金',
  '毒妇', '恶毒女配', '女配翻身', '团宠', '福星', '锦鲤',
  '女性成长', '独立女性',
  // 通用 / 配角
  '萌宝', '萌娃', '奶爸', '神棍', '天才', '学霸',
  '白月光', '青梅竹马', '竹马', '绿茶',
] as const;

/** 情感 / 关系类型 */
export const ROMANCE_TROPE = [
  '甜宠', '虐恋', '救赎', '双向暗恋', '先婚后爱',
  '日久生情', '破镜重圆', '久别重逢', '欢喜冤家',
  '禁忌恋', '年下恋', '姐弟恋', '师生恋',
  '豪门恩怨', '婆媳大战', '离婚', '二婚',
  '追妻火葬场', '替嫁', '冲喜', '联姻',
  '双强', '强取豪夺', '契约婚姻',
] as const;

/** 风格 / 基调 */
export const TONE_STYLE = [
  '爽文', '热血', '燃', '治愈', '暗黑', '致郁',
  '搞笑', '轻喜剧', '沙雕', '催泪', '温情',
  '烧脑', '高智商', '群像', '纪实', '正能量',
  '快节奏', '反转不断', '高能', '上头',
] as const;

/** 题材元素关键词 */
export const THEME_ELEMENT = [
  '豪门', '权谋', '家长里短', '家庭伦理', '婆媳',
  '兄弟情', '姐妹情', '闺蜜', '兄妹', '父子',
  '继承', '遗产', '商业帝国', '创业',
  '法医', '刑侦', '律政', '医疗',
  '美食', '非遗', '乡村振兴', '支教',
  '电竞', '娱乐圈', '练习生', '选秀',
  '盗墓', '探险', '灵异', '驱魔',
  '机甲', '异能', '觉醒', '血脉',
  '御兽', '炼丹', '阵法', '功法',
  '丧尸', '生存', '废土',
] as const;

/** 平台推荐标签 */
export const PLATFORM_TAG = [
  // 红果
  '红果爆款', '红果推荐', '红果独家',
  // 番茄
  '番茄热播', '番茄推荐',
  // 抖音
  '抖音短剧', '抖音热门', '抖音爆款',
  // 快手
  '快手短剧', '快手星芒',
  // 微信
  '微短剧', '微信小程序剧',
  // 通用
  '日更', '完结', '独播', '免费', '付费',
] as const;

/** 制作形态 */
export const PRODUCTION_FORMAT = [
  '真人短剧', 'AI漫剧', '动画短剧', '互动短剧',
  '竖屏', '横屏', '沉浸式',
] as const;

// ================================================================
//  二、出海标签库 (Overseas)
// ================================================================

/** 出海 — 题材大类 */
export const OVERSEAS_GENRE = [
  'Romance', 'Fantasy', 'Supernatural', 'Thriller',
  'Action', 'Comedy', 'Drama', 'Horror',
  'Sci-Fi', 'Historical', 'Crime', 'Mystery',
  'Slice of Life', 'Adventure',
] as const;

/** 出海 — 核心情节模式 / Tropes */
export const OVERSEAS_TROPE = [
  // 超自然
  'Werewolf', 'Vampire', 'Shifter', 'Fated Mate',
  'Alpha', 'Luna', 'Pack', 'Supernatural Powers',
  // 身份 / 阶层
  'CEO', 'Billionaire', 'Mafia', 'Royal', 'Heiress',
  'Rags to Riches', 'Cinderella', 'Secret Identity',
  'Hidden Heir', 'Fake Identity',
  // 关系 / 情感
  'Enemies to Lovers', 'Friends to Lovers', 'Forbidden Love',
  'Second Chance', 'Marriage of Convenience', 'Fake Dating',
  'Love Triangle', 'Reverse Harem', 'Slow Burn',
  'Possessive Love', 'Toxic Love', 'Age Gap',
  // 复仇 / 重生
  'Revenge', 'Rebirth', 'Reincarnation', 'Betrayal',
  'Comeback', 'Payback',
  // 家庭
  'Secret Baby', 'Single Parent', 'Stepfamily',
  'Family Feud', 'Custody Battle',
] as const;

/** 出海 — 风格基调 */
export const OVERSEAS_TONE = [
  'Dark Romance', 'Sweet Romance', 'Spicy',
  'Thriller', 'Suspense', 'Feel-Good',
  'Tearjerker', 'Action-Packed', 'Mind-Bending',
  'Binge-Worthy', 'Cliffhanger', 'Plot Twist',
] as const;

/** 出海 — 目标平台标签 */
export const OVERSEAS_PLATFORM = [
  'ReelShort', 'DramaBox', 'ShortMax', 'MeloDrop',
  'FlexTV', 'GoodShort', 'TopShort',
  'YouTube Shorts', 'TikTok', 'Instagram Reels',
] as const;

/** 出海 — 目标地区 */
export const OVERSEAS_REGION = [
  'North America', 'Latin America', 'Europe',
  'Southeast Asia', 'Japan', 'Korea',
  'Middle East', 'Africa', 'India',
] as const;

// ================================================================
//  三、组合导出：供 prompt 使用的紧凑字符串
// ================================================================

/** 国内 subGenre 完整候选列表（供 prompt 内联） */
export const DOMESTIC_SUB_GENRE_LIST = [
  ...GENRE_CATEGORY,
  ...PLOT_PATTERN,
  ...CHARACTER_ARCHETYPE,
  ...ROMANCE_TROPE,
].join('|');

/** 国内 themes 候选标签合集（供 prompt 参考） */
export const DOMESTIC_THEME_REFERENCE = [
  ...TONE_STYLE,
  ...THEME_ELEMENT,
  ...PRODUCTION_FORMAT,
].join('、');

/** 出海 subGenre 完整候选列表 */
export const OVERSEAS_SUB_GENRE_LIST = [
  ...OVERSEAS_GENRE,
  ...OVERSEAS_TROPE,
].join(' | ');

/** 出海 themes 候选标签合集 */
export const OVERSEAS_THEME_REFERENCE = [
  ...OVERSEAS_TONE,
  ...OVERSEAS_PLATFORM,
].join(', ');

// ================================================================
//  四、标签分类汇总（用于 prompt 注入完整参考表）
// ================================================================

/**
 * 生成国内标签参考文本（插入到 prompt 中）
 * 格式紧凑，节省 token
 */
export function buildDomesticTagReference(): string {
  return `## 标签参考库（从中选取最匹配的标签，也可自创）

受众频道: ${AUDIENCE_CHANNEL.join('、')}

题材大类: ${GENRE_CATEGORY.join('、')}

情节模式: ${PLOT_PATTERN.join('、')}

人设标签: ${CHARACTER_ARCHETYPE.join('、')}

情感关系: ${ROMANCE_TROPE.join('、')}

风格基调: ${TONE_STYLE.join('、')}

题材元素: ${THEME_ELEMENT.join('、')}

平台标签: ${PLATFORM_TAG.join('、')}`;
}

/**
 * 生成出海标签参考文本
 */
export function buildOverseasTagReference(): string {
  return `## Overseas Tag Reference (pick best matches, or create new)

Genre: ${OVERSEAS_GENRE.join(', ')}

Tropes: ${OVERSEAS_TROPE.join(', ')}

Tone: ${OVERSEAS_TONE.join(', ')}

Platform: ${OVERSEAS_PLATFORM.join(', ')}

Region: ${OVERSEAS_REGION.join(', ')}`;
}

/**
 * 根据市场类型返回对应的标签参考文本
 */
export function buildTagReference(market: 'domestic' | 'overseas' | 'both' = 'domestic'): string {
  if (market === 'overseas') return buildOverseasTagReference();
  if (market === 'both') return `${buildDomesticTagReference()}\n\n${buildOverseasTagReference()}`;
  return buildDomesticTagReference();
}
