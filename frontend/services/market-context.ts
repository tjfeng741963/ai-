/**
 * 国内/出海市场上下文配置
 *
 * 根据用户选择的市场类型（国内/出海），提供不同的：
 * - 平台推荐、爆剧案例、成本参考、合规要点、受众画像、热门元素
 */

export type MarketType = 'domestic' | 'overseas';

export interface MarketContext {
  label: string;
  platforms: Array<{ name: string; desc: string }>;
  hitShows: Array<{ title: string; platform: string; highlight: string }>;
  costReference: string;
  complianceRules: string[];
  audienceProfile: string;
  trendElements: string[];
  culturalNotes?: string[];
}

const DOMESTIC_CONTEXT: MarketContext = {
  label: '国内市场',
  platforms: [
    { name: '红果短剧', desc: '字节系，流量大，付费+广告双模式，偏男频逆袭/女频甜宠' },
    { name: '番茄短剧', desc: '字节系，免费+广告模式，用户基数大，题材偏大众化' },
    { name: '抖音', desc: '短视频分发，适合切片引流，算法推荐强' },
    { name: '快手', desc: '下沉市场强，适合接地气题材，家庭/情感类受欢迎' },
    { name: '微信小程序', desc: '私域流量，适合付费解锁模式，女频表现好' },
  ],
  hitShows: [
    { title: '我在精神病院学斩神', platform: '红果短剧', highlight: '玄幻+逆袭，爽点密集，男频爆款' },
    { title: '重生之我是仙尊', platform: '番茄短剧', highlight: '重生+修仙，经典男频套路' },
    { title: '闪婚后亿万老公掉马了', platform: '红果短剧', highlight: '甜宠+豪门，女频经典' },
    { title: '神豪从系统开始', platform: '抖音', highlight: '系统流+装逼打脸，男频爽文' },
    { title: '离婚后前夫跪着求复合', platform: '快手', highlight: '虐渣+逆袭，女频情感向' },
  ],
  costReference: `## AI漫剧制作成本参考（2025年国内市场）
- 每集约30-40个分镜
- C级轻量（纯对话/静态场景为主）：30-50元/集，80集约2400-4000元
- B级标准（常规动态场景）：50-80元/集，80集约4000-6400元
- A级优质（丰富场景/中等特效）：80-120元/集，80集约6400-9600元
- S级精品（复杂场景/大量特效/高品质）：120-200元/集，80集约9600-16000元
- 成本构成：AI绘图40-50%、配音20-30%、剪辑后期15-20%、其他10%`,
  complianceRules: [
    '广电总局内容审核标准：禁止暴力血腥、色情低俗、封建迷信',
    '红果/番茄平台规范：严控擦边内容，要求正向价值观导向',
    'AI生成内容需标注"AI生成"标识',
    '未成年人保护：不得出现诱导未成年人消费、暴力模仿等内容',
    '价值观要求：善恶有报，正能量闭环',
  ],
  audienceProfile: '核心受众：25-45岁，下沉市场为主，碎片化娱乐需求强。男频偏18-35岁男性（逆袭/打脸/升级），女频偏25-40岁女性（甜宠/虐恋/豪门）。付费意愿中等，广告容忍度高。',
  trendElements: [
    '重生/穿越', '系统流', '逆袭打脸', '甜宠撒糖', '豪门虐恋',
    '修仙/玄幻', '都市神豪', '战神归来', '闪婚/契约婚姻', '复仇爽文',
  ],
};

const OVERSEAS_CONTEXT: MarketContext = {
  label: '出海市场',
  platforms: [
    { name: 'ReelShort', desc: '北美头部短剧平台，付费解锁模式，偏霸总/狼人/吸血鬼题材' },
    { name: 'DramaBox', desc: '枫叶互动旗下，全球分发，女频表现突出' },
    { name: 'ShortMax', desc: '九州文化旗下，北美+东南亚市场，题材多元' },
    { name: 'FlexTV', desc: '新力量短剧平台，主打北美市场' },
    { name: 'TikTok', desc: '全球短视频平台，适合切片引流和品牌曝光' },
    { name: 'YouTube Shorts', desc: '全球覆盖，适合预告片和精彩片段分发' },
  ],
  hitShows: [
    { title: 'Never satisfsatisfy satisfying', platform: 'ReelShort', highlight: '霸总+灰姑娘，北美女性用户最爱' },
    { title: 'Fated to My Forbidden Alpha', platform: 'ReelShort', highlight: '狼人+禁忌之恋，欧美奇幻题材爆款' },
    { title: 'The Double Life of My Billionaire Husband', platform: 'DramaBox', highlight: '隐婚+豪门，全球女频通吃' },
    { title: 'Revenge of the satisfying', platform: 'ShortMax', highlight: '复仇+逆袭，跨文化共鸣强' },
    { title: 'Alpha King\'s Mate', platform: 'ReelShort', highlight: '狼人ABO设定，北美特色题材' },
  ],
  costReference: `## AI漫剧制作成本参考（2025年出海市场）
- 每集约30-40个分镜
- 基础制作成本与国内相同：30-200元/集
- 额外出海成本：
  - 翻译/本地化：5-15元/集（英语），10-25元/集（小语种）
  - 英文配音：10-30元/集（AI配音），50-150元/集（真人配音）
  - 字幕制作：3-8元/集
- 出海综合成本：50-300元/集（含本地化）
- 收益参考：ReelShort爆款单日收入可达数万美元`,
  complianceRules: [
    '北美市场：COPPA儿童保护法，避免未成年人不当内容',
    '欧洲市场：GDPR数据保护，内容分级制度',
    '中东市场：宗教敏感内容（猪、酒精、暴露着装需注意）',
    '东南亚市场：王室/宗教/政治敏感话题',
    'AI内容标识：部分地区要求标注AI生成',
    '文化敏感：避免种族歧视、宗教冒犯、政治争议内容',
  ],
  audienceProfile: '核心受众：北美18-45岁女性为主（占70%+），偏好霸总/狼人/吸血鬼/禁忌之恋题材。东南亚市场男女均衡，偏好都市/复仇/甜宠。中东市场偏好家庭/情感/复仇。付费意愿较高（北美ARPU远高于国内）。',
  trendElements: [
    'Billionaire/CEO romance', 'Werewolf/Alpha mate', 'Vampire romance',
    'Revenge/Betrayal', 'Secret identity', 'Forbidden love',
    'Cinderella story', 'Mafia romance', 'Second chance romance',
    'Fake marriage', 'Enemies to lovers', 'Rejected mate',
  ],
  culturalNotes: [
    '北美观众偏好强女主（independent heroine），不接受过度柔弱的女主设定',
    '狼人/ABO/Mate设定是北美短剧特色题材，国内没有对应品类',
    '霸总题材需本地化：CEO而非"总裁"，避免中式霸总的强制行为',
    '复仇题材全球通吃，但需注意暴力尺度因地区而异',
    '避免中国特色梗（如"打脸"需转化为"karma/comeuppance"）',
    '英文对白需自然流畅，避免中式英语（Chinglish）',
  ],
};

/** 获取市场上下文 */
export function getMarketContext(market: MarketType): MarketContext {
  return market === 'overseas' ? OVERSEAS_CONTEXT : DOMESTIC_CONTEXT;
}

/** 生成注入到prompt中的市场上下文文本 */
export function getMarketContextPrompt(market: MarketType): string {
  const ctx = getMarketContext(market);
  const lines: string[] = [
    `## 目标市场：${ctx.label}`,
    '',
    `### 推荐平台`,
    ...ctx.platforms.map(p => `- **${p.name}**：${p.desc}`),
    '',
    `### 近期爆款案例`,
    ...ctx.hitShows.map(s => `- 《${s.title}》（${s.platform}）：${s.highlight}`),
    '',
    ctx.costReference,
    '',
    `### 合规要点`,
    ...ctx.complianceRules.map(r => `- ${r}`),
    '',
    `### 受众画像`,
    ctx.audienceProfile,
    '',
    `### 当前热门元素/梗`,
    ctx.trendElements.join('、'),
  ];

  if (ctx.culturalNotes) {
    lines.push('', `### 跨文化注意事项`, ...ctx.culturalNotes.map(n => `- ${n}`));
  }

  if (market === 'overseas') {
    lines.push(
      '',
      `### 出海特殊要求`,
      `- 如果剧本包含英文台词或英文对白，请分析英文对白的质量和自然度`,
      `- 评估剧本的跨文化适配性：哪些情节/梗海外观众能理解，哪些需要本地化`,
      `- 匹配海外平台的内容偏好和爆款模式`,
      `- 评估是否需要文化改编（如中式霸总→CEO romance）`,
    );
  }

  return lines.join('\n');
}
