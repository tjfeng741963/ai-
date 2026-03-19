/**
 * JSON 解析测试脚本
 * 运行: node test-json-parsing.cjs
 */

// 模拟 DeepSeek 可能返回的各种错误 JSON 格式

// 测试用例1: 缺少开头引号
const testCase1 = `{
  "characterAnalysis": {
    "characters": [
      {
        "id": "c1",
        "name": "陈北斗",
        "motivation": 为在星火大屠杀中死去的人复仇",
        "flaw": "性格缺陷"
      }
    ]
  }
}`;

// 测试用例2: 字符串中有未转义的引号
const testCase2 = `{
  "characterAnalysis": {
    "description": "他说"你好"然后走了",
    "name": "测试"
  }
}`;

// 测试用例3: 字符串中有换行符
const testCase3 = `{
  "analysis": "这是第一行
这是第二行
这是第三行",
  "score": 85
}`;

// 测试用例4: 属性名没有引号
const testCase4 = `{
  name: "陈北斗",
  "score": 85
}`;

// 测试用例5: 尾随逗号
const testCase5 = `{
  "name": "测试",
  "items": ["a", "b", "c",],
}`;

// 测试用例6: 复杂的混合错误
const testCase6 = `{
  "characterAnalysis": {
    "characters": [
      {
        "id": "c1",
        "name": "陈北斗",
        "role": "protagonist",
        "arcType": "觉醒/救赎/从精致利己者到主动抉择者",
        "motivation": 前期：完成卧底任务，换取自由身份。中期：在猩红舰队发现被掩盖的星火大屠杀真相，内心正义感与求生欲激烈冲突。后期：从被动的棋子成长为主动为信念承担代价的人",
        "flaw": "习惯性逃避责任、过度自我保护",
        "emotionalArc": "从被联邦逮捕的屈辱开始。在猩红舰队中，从最初的伪装与警惕，到被小星的纯真、血齿的守护所触动。目睹星火真相后，陷入信仰崩塌的痛苦",
        "score": 85
      }
    ]
  }
}`;

// 测试用例7: 数组字符串中包含未转义的引号（真实生产错误场景）
const testCase7 = `{
  "characterAnalysis": {
    "characters": [
      {
        "id": "c3",
        "name": "血齿",
        "memorableTraits": ["左脸巨大刀疤", "刻有"小燃"的星火刃", ""护犊子"的极致守护", ""我儿子叫小燃，五岁"", "外表凶悍内心柔软的反差"],
        "score": 9
      }
    ]
  }
}`;

// 测试用例8: JSON 中包含 Python 风格的 # 注释（DeepSeek 新错误）
const testCase8 = `{
  "marketSuggestion": {
    "platformTags": ["战场逆袭", # 红果推荐���签
                     "古代职场求生记", # 抖音标签
                     "权谋宫斗"],
    "targetPlatform": "红果短剧" # 首推平台
  }
}`;

// 测试用例9: 引号后紧跟文字（如 "战场生存指南"互动）
const testCase9 = `{
  "characters": [
    {
      "name": "王大壮",
      "traits": ["憨厚老实、搞笑的瘦猴。", "战场生存指南"互动式教学"", "军事才能"]
    }
  ]
}`;

// 测试用例10: 数组元素之间缺少逗号（DeepSeek 新错误）
const testCase10 = `{
  "executiveSummary": {
    "genre": "中性",
    "subGenre": "科幻",
    "themes": ["末日生存" "人类史诗", "文明存续", "牺牲与背叛"],
    "platformTags": ["硬核科幻"  "史诗巨制"],
    "oneSentence": "测试"
  }
}`;

// 测试用例11: 数组元素之间用换行分隔没有逗号
const testCase11 = `{
  "themes": ["末日生存"
"人类史诗"
"文明存续"],
  "score": 85
}`;

// 测试用例12: 缺少外层 {}（DeepSeek 常见错误）
const testCase12 = `"executiveSummary": {
  "genre": "男频",
  "subGenre": "逆袭",
  "themes": ["历史战争", "反英雄成长"],
  "oneSentence": "测试"
}`;

// 测试用例13: JSON 被截断（缺少结尾的 }，但结构完整）
const testCase13 = `{
  "executiveSummary": {
    "genre": "男频",
    "themes": ["测试1", "测试2"]
  }`;

// 测试用例14: JSON 前后有多余内容
const testCase14 = `好的，以下是分析结果：
\`\`\`json
{
  "score": 85,
  "grade": "A"
}
\`\`\`
以上就是分析。`;

// ==================== 从 volcengine.ts 复制的函数 ====================

/** 移除 JSON 中的注释（# 风格和 // 风格）*/
function removeJsonComments(jsonStr) {
  const result = [];
  let i = 0;
  let inString = false;
  let escaped = false;

  while (i < jsonStr.length) {
    const char = jsonStr[i];
    const nextChar = jsonStr[i + 1];

    if (escaped) {
      result.push(char);
      escaped = false;
      i++;
      continue;
    }

    if (char === '\\' && inString) {
      result.push(char);
      escaped = true;
      i++;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result.push(char);
      i++;
      continue;
    }

    if (!inString) {
      // # 风格注释（Python）- 跳过到行尾
      if (char === '#') {
        while (i < jsonStr.length && jsonStr[i] !== '\n') {
          i++;
        }
        continue;
      }

      // // 风格注释（JavaScript）- 跳过到行尾
      if (char === '/' && nextChar === '/') {
        while (i < jsonStr.length && jsonStr[i] !== '\n') {
          i++;
        }
        continue;
      }

      // /* */ 风格注释（多行）
      if (char === '/' && nextChar === '*') {
        i += 2;
        while (i < jsonStr.length - 1) {
          if (jsonStr[i] === '*' && jsonStr[i + 1] === '/') {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
    }

    result.push(char);
    i++;
  }

  return result.join('');
}

function escapeControlCharsInJsonStrings(jsonStr) {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      const code = char.charCodeAt(0);
      if (code < 32) {
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else {
          result += '\\u' + code.toString(16).padStart(4, '0');
        }
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }

  return result;
}

function fixUnescapedQuotesInStrings(jsonStr) {
  const result = [];
  let i = 0;

  while (i < jsonStr.length) {
    const char = jsonStr[i];

    if (char !== '"') {
      result.push(char);
      i++;
      continue;
    }

    result.push(char);
    i++;

    let stringContent = '';
    let foundEnd = false;

    while (i < jsonStr.length && !foundEnd) {
      const c = jsonStr[i];

      if (c === '\\' && i + 1 < jsonStr.length) {
        stringContent += c + jsonStr[i + 1];
        i += 2;
        continue;
      }

      if (c === '"') {
        const afterQuoteRaw = jsonStr.slice(i + 1);
        const afterQuote = afterQuoteRaw.trimStart();
        const nextChar = afterQuote[0];
        const nextTwoChars = afterQuote.slice(0, 2);
        // 检查引号后面是否有空白然后是另一个引号（缺少逗号的情况）
        const hasWhitespaceThenQuote = /^\s+\"/.test(afterQuoteRaw);

        // 也包括注释标记 # 或 //（这些会在后续被移除）
        // 也包括 空白+"（表示两个字符串之间缺少逗号，后续会修复）
        if (!nextChar || nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === ':' || nextChar === '#' || hasWhitespaceThenQuote || nextTwoChars === '//') {
          foundEnd = true;
          result.push(stringContent);
          result.push('"');
          i++;
          continue;
        }

        stringContent += '\\"';
        i++;
        continue;
      }

      stringContent += c;
      i++;
    }

    if (!foundEnd) {
      result.push(stringContent);
    }
  }

  return result.join('');
}

function repairBrokenJSON(jsonStr) {
  let result = jsonStr;

  result = fixUnescapedQuotesInStrings(result);

  result = result.replace(
    /("[\w\u4e00-\u9fa5]+"\s*:\s*"[^"]*?)(\n\s*[,\}\]])/g,
    '$1"$2'
  );

  result = result.replace(
    /\{\s*([a-zA-Z_][\w]*)\s*:/g,
    '{"$1":'
  );
  result = result.replace(
    /,\s*([a-zA-Z_][\w]*)\s*:/g,
    ',"$1":'
  );

  return result;
}

function extractJSON(content) {
  // ===== 第���阶段：提取 JSON 字符串 =====
  let jsonStr = '';

  // 方式1: 尝试匹配 ```json ... ``` 代码块
  const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    // 方式2: 尝试匹配完整的 JSON 对象 {...}
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0];
    } else {
      // 方式3: DeepSeek 可能返回不完整的 JSON（缺少外层 {}）
      const partialMatch = content.match(/"[\w]+"\s*:\s*\{[\s\S]*\}?/);
      if (partialMatch) {
        jsonStr = '{' + partialMatch[0] + '}';
        console.log('[extractJSON] 修复缺少外层 {}');
      }
    }
  }

  if (!jsonStr) {
    throw new Error('无法解析 AI 返回的 JSON');
  }

  // ===== 第一阶段：确保 JSON 以 { 开头 =====
  jsonStr = jsonStr.trim();
  if (!jsonStr.startsWith('{')) {
    if (/^"[\w]+"\s*:/.test(jsonStr)) {
      jsonStr = '{' + jsonStr + '}';
      console.log('[extractJSON] 修复缺少外层 {}');
    }
  }

  // ===== 第二阶段：引号相关修复 =====

  // 修复1: 处理缺少开头引号的字符串值
  jsonStr = jsonStr.replace(
    /:\s*([^"\[\]{}\s:,\d][^"]*)"(\s*[,\}\]"\n])/g,
    (match, value, suffix) => {
      const trimmed = value.trim();
      if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null') {
        return match;
      }
      console.log('[extractJSON] 修复缺少开头引号:', trimmed.slice(0, 30) + '...');
      return `: "${trimmed}"${suffix}`;
    }
  );

  // 修复2: 处理字符串中未转义的引号
  jsonStr = fixUnescapedQuotesInStrings(jsonStr);

  // 修复3: 移除 JSON 中的注释
  jsonStr = removeJsonComments(jsonStr);

  // 修复4: 转义控制字符
  jsonStr = escapeControlCharsInJsonStrings(jsonStr);

  // 修复5: 处理数组元素之间缺少逗号
  jsonStr = jsonStr.replace(/"\s+"/g, '", "');

  // 修复6: 确保 {} 配对（处理被截断的 JSON）
  {
    let braceCount = 0;
    let inString = false;
    let escaped = false;
    for (const char of jsonStr) {
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
    }
    if (braceCount > 0) {
      jsonStr += '}'.repeat(braceCount);
      console.log('[extractJSON] 修复缺少结尾 }，补全', braceCount, '个');
    }
  }

  // 尝试解析
  try {
    return JSON.parse(jsonStr);
  } catch (firstError) {
    console.warn('[extractJSON] 首次解析失败，尝试修复 JSON...', firstError.message);

    // ===== 第三阶段：其他修复 =====

    // 修复6: 处理数组中缺少引号的值
    jsonStr = jsonStr.replace(/,\s*([#@][^",\[\]{}]+)(\s*[,\]\}])/g, ',"$1"$2');

    // 修复7: 处理数组开头缺少引号的值
    jsonStr = jsonStr.replace(/\[\s*([#@][^",\[\]{}]+)(\s*[,\]])/g, '["$1"$2');

    // 修复8: 处理尾随逗号
    jsonStr = jsonStr.replace(/,(\s*[\]\}])/g, '$1');

    // 修复9: 处理属性名缺少引号
    jsonStr = jsonStr.replace(/\{\s*([a-zA-Z_][\w]*)\s*:/g, '{"$1":');
    jsonStr = jsonStr.replace(/,\s*([a-zA-Z_][\w]*)\s*:/g, ',"$1":');

    try {
      return JSON.parse(jsonStr);
    } catch (secondError) {
      const errorMsg = secondError.message;
      const posMatch = errorMsg.match(/position (\d+)/);
      const position = posMatch ? parseInt(posMatch[1]) : 0;

      console.error('[extractJSON] ========== 错误详情 ==========');
      console.error('[extractJSON] 错误消息:', errorMsg);
      console.error('[extractJSON] 错误位置:', position);
      console.error('[extractJSON] 错误位置附近:', jsonStr.slice(Math.max(0, position - 50), position + 50));
      console.error('[extractJSON] ================================');

      throw new Error(`JSON 解析失败: ${errorMsg}`);
    }
  }
}

// ==================== ���试运行 ====================

function runTest(name, testJson) {
  console.log(`\n========== ${name} ==========`);
  console.log('输入:', testJson.slice(0, 100).replace(/\n/g, '\\n') + '...');

  try {
    const result = extractJSON(testJson);
    console.log('✅ 成功:', JSON.stringify(result, null, 2).slice(0, 200) + '...');
    return true;
  } catch (error) {
    console.log('❌ 失败:', error.message);
    return false;
  }
}

console.log('========================================');
console.log('JSON 解析测试');
console.log('========================================');

const results = [
  runTest('测试1: 缺少开头引号', testCase1),
  runTest('测试2: 未转义的引号', testCase2),
  runTest('测试3: 字符串中的换行', testCase3),
  runTest('测试4: 属性名无引号', testCase4),
  runTest('测试5: 尾随逗号', testCase5),
  runTest('测试6: 复杂混合错误', testCase6),
  runTest('测试7: 数组字符串含引号(生产场景)', testCase7),
  runTest('测试8: JSON中#注释(DeepSeek)', testCase8),
  runTest('测试9: 引号后紧跟文字', testCase9),
  runTest('测试10: 数组元素缺少逗号(DeepSeek)', testCase10),
  runTest('测试11: 数组换行无逗号', testCase11),
  runTest('测试12: 缺少外层{}(DeepSeek)', testCase12),
  runTest('测试13: JSON被截断', testCase13),
  runTest('测试14: JSON前后有多余内容', testCase14),
];

console.log('\n========================================');
console.log('测试结果汇总');
console.log('========================================');
console.log(`通过: ${results.filter(r => r).length}/${results.length}`);
console.log(`失败: ${results.filter(r => !r).length}/${results.length}`);

if (results.some(r => !r)) {
  process.exit(1);
}
