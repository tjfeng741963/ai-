/**
 * 广告知识库
 *
 * 来自 Pattern 08 — 将广告模式、剧本模板、流派素材作为结构化知识库，
 * 在 Prompt 组装时由对应 Layer 注入。不再写死在 prompt 文本中。
 *
 * 五品类知识：
 *   ad_patterns      — 广告插入模式（软广/硬广/原生/情感/对比/反转）
 *   script_templates — 剧本结构模板（不同时长/平台的结构）
 *   genre_materials  — 流派素材（场景/道具/对话风格/产品融入方式）
 *   product_profiles — 产品画像（由对话过程中积累）
 *   audience_profiles — 人群画像（由对话过程中积累）
 */

/**
 * @typedef {object} AdPattern
 * @property {string} id
 * @property {'emotional' | 'pain-amplify' | 'contrast' | 'reversal' | 'scene-demo' | 'testimonial'} type
 * @property {string} name
 * @property {string} formula - 模式公式
 * @property {string} example - 完整示例
 * @property {string[]} bestFor - 适合的品类
 * @property {string[]} notFor - 不适合的品类
 */

/** @type {Record<string, AdPattern>} */
export const AD_PATTERNS = {
  'emotional': {
    id: 'emotional',
    type: 'emotional',
    name: '情感共鸣',
    formula: '[真实痛点场景] → [情绪放大] → [产品作为理解者出现] → [情感释放] → [CTA：你值得]',
    example: '深夜加班回家，累到不想说话。躺在恒温被里，像被温柔抱住。这一刻终于是自己的。恒温37°C，懂你的疲惫。',
    bestFor: ['家居家纺', '母婴', '宠物', '健康食品', '情感消费品'],
    notFor: ['3C数码参数型', 'B2B', '工业品'],
  },
  'pain-amplify': {
    id: 'pain-amplify',
    type: 'pain-amplify',
    name: '痛点放大',
    formula: '[夸张化痛点场景] → [痛点视觉化/戏剧化] → [产品作为英雄登场] → [一键解决] → [CTA：别忍了]',
    example: '参数怪兽吞没了吴姐的夜晚——无穷弹窗、追评小作文3D环绕、老公的"不就一支笔嘛"变成紧箍咒。AI学习笔登场，一键清空所有噪音。',
    bestFor: ['效率工具', '3C数码', '家居清洁', '个护', '教育产品'],
    notFor: ['奢侈品类', '殡葬', '医疗严肃品类'],
  },
  'contrast': {
    id: 'contrast',
    type: 'contrast',
    name: '效果对比',
    formula: '[使用前的困境] → [对比实验/A/B测试] → [压倒性差异展示] → [理性说服] → [CTA：一目了然]',
    example: '左边传统点读笔：卡顿、功能单一、屏幕伤眼。右边AI学习笔：秒速搜题、AI口语陪练、护眼墨水屏。399元，你只需要一个下单动作。',
    bestFor: ['3C数码', '家电', '美妆', '汽车', '教育产品'],
    notFor: ['奢侈品类', '文化艺术'],
  },
  'reversal': {
    id: 'reversal',
    type: 'reversal',
    name: '搞笑反转',
    formula: '[建立预期] → [预期落空/反转] → [意外笑点] → [产品自然收束] → [CTA：没想到吧]',
    example: '以为是霸道总裁爱上我，结果总裁掏出AI学习笔：英语不会？我教你。反转+功能展示双赢。',
    bestFor: ['快消品', '社交App', '零食饮料', '个护', '潮玩'],
    notFor: ['金融理财', '医疗', 'B2B'],
  },
  'scene-demo': {
    id: 'scene-demo',
    type: 'scene-demo',
    name: '场景展示',
    formula: '[真实使用场景] → [产品自然出现] → [演示核心功能] → [场景化效果展示] → [CTA：你也需要]',
    example: '露营烧烤，朋友掏出户外电源。煮咖啡、放投影、手机充电全搞定。全场MVP就是它。',
    bestFor: ['户外装备', '厨电', '汽车用品', '家居', '3C配件'],
    notFor: ['纯虚拟产品', '服务类'],
  },
  'testimonial': {
    id: 'testimonial',
    type: 'testimonial',
    name: '口碑证言',
    formula: '[真实用户/专家出场] → [讲述使用体验] → [产品功能穿插展示] → [信任背书] → [CTA：他们都在用]',
    example: '10年教龄的王老师说：我推荐给每个学生家长。不是因为它多贵，是因为它真的能让孩子自己学进去。',
    bestFor: ['教育产品', '母婴', '健康产品', '美妆', '高客单价产品'],
    notFor: ['时尚快消', '冲动消费品'],
  },
};

/**
 * @typedef {object} ScriptTemplate
 * @property {string} id
 * @property {string} name
 * @property {string} genre - 流派标签
 * @property {string} duration - 适用时长
 * @property {string} structure - 结构描述
 * @property {number[]} adInsertionPoints - 广告插入秒数
 * @property {string[]} tropes - 套路标签
 */

/** @type {Record<string, ScriptTemplate>} */
export const SCRIPT_TEMPLATES = {
  'urban-reversal': {
    id: 'urban-reversal',
    name: '都市反转流',
    genre: 'modern-urban',
    duration: '30-90s',
    structure: '建立日常 → 意外事件 → 反转揭示 → 产品作为关键道具 → 爽感收尾',
    adInsertionPoints: [25, 55],
    tropes: ['隐藏身份曝光', '打脸势利眼', '废柴逆袭', '扮猪吃虎'],
  },
  'family-warmth': {
    id: 'family-warmth',
    name: '家庭温情流',
    genre: 'modern-urban',
    duration: '30-120s',
    structure: '日常小摩擦 → 情感积累 → 温情转折 → 产品承载关爱 → 暖心收尾',
    adInsertionPoints: [35, 65],
    tropes: ['代际理解', '默默付出被发现', '小礼物大心意', '孩子成长瞬间'],
  },
  'campus-growth': {
    id: 'campus-growth',
    name: '校园成长流',
    genre: 'campus',
    duration: '30-90s',
    structure: '学业/社交困境 → 努力但受挫 → 产品作为助力登场 → 突破成长 → 自信收尾',
    adInsertionPoints: [30, 60],
    tropes: ['学渣逆袭', '被嘲笑后证明自己', '考试/比赛关键时刻', '友情+努力+胜利'],
  },
  'scifi-concept': {
    id: 'scifi-concept',
    name: '科幻概念流',
    genre: 'sci-fi',
    duration: '60-180s',
    structure: '近未来世界观建立 → 核心冲突 → 产品作为科技解决方案 → 视觉奇观 → 余味收尾',
    adInsertionPoints: [40, 80],
    tropes: ['近未来科技', 'AI伙伴', '虚拟vs现实', '人类vs系统'],
  },
  'workplace-pressure': {
    id: 'workplace-pressure',
    name: '职场压力流',
    genre: 'modern-urban',
    duration: '30-90s',
    structure: '职场困境 → 压力升级 → 产品提供解决方案 → 效率/形象提升 → 职场逆袭',
    adInsertionPoints: [30, 60],
    tropes: ['996疲惫', '职场PUA', '新人的逆袭', '效率工具改变命运'],
  },
  'daily-life': {
    id: 'daily-life',
    name: '生活日常流',
    genre: 'modern-urban',
    duration: '15-60s',
    structure: '生活小困扰 → 放大不适 → 产品出现 → 问题解决 → 生活变美好',
    adInsertionPoints: [15, 35],
    tropes: ['懒人福音', '幸福感提升', '对比邻居/同事', '生活品质升级'],
  },
};

/**
 * @typedef {object} GenreMaterial
 * @property {string} id
 * @property {string} genre - 流派
 * @property {string} name
 * @property {string} sceneTemplate - 场景模板
 * @property {string[]} commonProps - 常见道具
 * @property {string} dialogueStyle - 对话风格
 * @property {string} productAdaptation - 产品融入方式
 */

/** @type {Record<string, GenreMaterial>} */
export const GENRE_MATERIALS = {
  'modern-office': {
    id: 'modern-office',
    genre: 'modern-urban',
    name: '现代办公场景',
    sceneTemplate: '开放式办公室、会议室、午休茶水间、写字楼电梯、下班地铁',
    commonProps: ['笔记本电脑', '手机', '咖啡杯', '工牌', '耳机', '文件夹'],
    dialogueStyle: '职场口语，夹杂英文术语，快节奏，同事间半正式调侃',
    productAdaptation: '产品作为办公效率工具、职场形象加分项、同事羡慕的焦点',
  },
  'modern-home': {
    id: 'modern-home',
    genre: 'modern-urban',
    name: '现代居家场景',
    sceneTemplate: '客厅沙发、卧室床上、厨房料理台、阳台、儿童房书桌',
    commonProps: ['遥控器', '手机', '零食', '毛毯', '台灯', '闹钟'],
    dialogueStyle: '家庭成员对话，温馨或拌嘴，生活化语言',
    productAdaptation: '产品融入日常生活流，作为解决家庭小摩擦/提升幸福感的工具',
  },
  'campus-classroom': {
    id: 'campus-classroom',
    genre: 'campus',
    name: '校园课堂场景',
    sceneTemplate: '教室课桌、走廊、操场、图书馆、宿舍、校门口',
    commonProps: ['书包', '课本', '文具', '水杯', '校服', '手机'],
    dialogueStyle: '同学间口语、师生对话，青春感，偶有网络用语',
    productAdaptation: '产品作为学习工具、社交谈资、被同学关注的理由',
  },
  'scifi-near-future': {
    id: 'scifi-near-future',
    genre: 'sci-fi',
    name: '近未来科幻场景',
    sceneTemplate: '全息教室/考场、智能家居空间、赛博街区、虚拟训练场',
    commonProps: ['全息投影', '能量环', '智能终端', '悬浮屏幕', '光效粒子'],
    dialogueStyle: '现代语言+少量科技词汇，不古风不文言，保持可理解性',
    productAdaptation: '产品作为未来科技的载体，功能视觉化为光效/全息/粒子特效',
  },
  'outdoor-travel': {
    id: 'outdoor-travel',
    genre: 'modern-urban',
    name: '户外旅行场景',
    sceneTemplate: '露营地、山顶、海滩、公路、民宿、古镇街道',
    commonProps: ['帐篷', '背包', '运动鞋', '太阳镜', '保温杯', '相机'],
    dialogueStyle: '轻松自然，朋友间调侃，情侣对话，带旅行感的旁白',
    productAdaptation: '产品作为旅行必备品、户外好物、拍照道具、旅途救星',
  },
};

/**
 * 根据用户的创意方向和产品品类，推荐最匹配的广告模式
 * @param {object} params
 * @param {string} [params.creativeDirection] - 用户创意方向
 * @param {string} [params.productCategory] - 产品品类
 * @param {string} [params.emotionalTone] - 情感基调
 * @returns {AdPattern[]} 推荐的前3个广告模式
 */
export function recommendAdPatterns({ creativeDirection, productCategory, emotionalTone } = {}) {
  // 简单规则匹配
  const scores = Object.values(AD_PATTERNS).map((pattern) => {
    let score = 1;
    const text = JSON.stringify(pattern).toLowerCase();

    if (creativeDirection) {
      if (text.includes(creativeDirection.toLowerCase())) score += 2;
    }
    if (productCategory) {
      if (pattern.bestFor.some((cat) => productCategory.includes(cat) || cat.includes(productCategory))) score += 3;
    }
    if (emotionalTone) {
      const toneMap = { '温情': ['emotional'], '搞笑': ['reversal', 'pain-amplify'], '理性': ['contrast', 'scene-demo'], '热血': ['pain-amplify', 'scene-demo'] };
      if (toneMap[emotionalTone]?.includes(pattern.type)) score += 2;
    }

    return { pattern, score };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.pattern);
}

/**
 * 根据用户创意方向和时长推荐剧本模板
 * @param {object} params
 * @param {string} [params.creativeDirection]
 * @param {string} [params.tier] - 时长档位
 * @returns {ScriptTemplate[]} 推荐的前2个模板
 */
export function recommendScriptTemplates({ creativeDirection, tier } = {}) {
  // 流派关键词映射（中文 → 模板id）
  const genreKeywords = {
    'scifi-concept': ['科幻', '未来', '赛博', 'AI', '星际'],
    'campus-growth': ['校园', '学生', '考试', '课堂', '学渣', '学霸', '学校'],
    'family-warmth': ['家庭', '妈妈', '爸爸', '孩子', '亲子', '温情', '温暖'],
    'urban-reversal': ['都市', '职场', '反转', '逆袭', '打脸', '爽'],
    'workplace-pressure': ['职场', '上班', '加班', '白领', '办公', '效率', '压力'],
    'daily-life': ['日常', '生活', '居家', '懒人', '幸福感'],
  };

  const scores = Object.values(SCRIPT_TEMPLATES).map((tmpl) => {
    let score = 1;

    // 中英文混合匹配
    const text = `${tmpl.name} ${tmpl.genre} ${tmpl.tropes.join(' ')}`.toLowerCase();
    if (creativeDirection) {
      const dir = creativeDirection.toLowerCase();
      if (text.includes(dir)) {
        score += 2;
      } else {
        // 关键词匹配
        const keywords = genreKeywords[tmpl.id] || [];
        for (const kw of keywords) {
          if (dir.includes(kw.toLowerCase())) { score += 2; break; }
        }
      }
    }

    if (tier) {
      const [min, max] = tmpl.duration.split('-').map((s) => parseInt(s) || 0);
      const tierDurations = {
        'ultra-short': [15, 30],
        'short': [30, 60],
        'standard': [60, 120],
        'story': [120, 180],
      };
      const [tMin, tMax] = tierDurations[tier] || [0, Infinity];
      if (min <= tMax && max >= tMin) score += 3;
    }

    return { tmpl, score };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((s) => s.tmpl);
}
