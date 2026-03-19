/**
 * JSON 解析测试脚本
 * 运行: npx ts-node test-json-parsing.ts
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

// 测试用例7: 数组元素之间连续引号无逗号（DeepSeek 常见错误）
const testCase7 = `{
  "tags": ["末日生存""人类史诗""星际战争"]
}`;

// ==================== 从 volcengine.ts 复制的函数 ====================

function escapeControlCharsInJsonStrings(jsonStr: string): string {
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

function removeJsonComments(jsonStr: string): string {
  const result: string[] = [];
  let i = 0;
  let inString = false;
  let escaped = false;

  while (i < jsonStr.length) {
    const char = jsonStr[i];
    const nextChar = jsonStr[i + 1];

    // 处理转义字符
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

    // 跟踪字符串状态
    if (char === '"') {
      inString = !inString;
      result.push(char);
      i++;
      continue;
    }

    // 在字符串外部时，检测并跳过注释
    if (!inString) {
      // # 风格注释（Python）- 跳过到行尾
      if (char === '#') {
        // 跳过整行注释
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
        i += 2; // 跳过 /*
        while (i < jsonStr.length - 1) {
          if (jsonStr[i] === '*' && jsonStr[i + 1] === '/') {
            i += 2; // 跳过 */
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

function fixUnescapedQuotesInStrings(jsonStr: string): string {
  const result: string[] = [];
  let i = 0;

  while (i < jsonStr.length) {
    const char = jsonStr[i];

    if (char !== '"') {
      result.push(char);
      i++;
      continue;
    }

    // 找到一个引号，开始处理字符串
    result.push(char); // 输出开头引号
    i++;

    // 收集字符串内容直到找到真正的结束引号
    let stringContent = '';
    let foundEnd = false;

    while (i < jsonStr.length && !foundEnd) {
      const c = jsonStr[i];

      if (c === '\\' && i + 1 < jsonStr.length) {
        // 已转义的字符，直接保留
        stringContent += c + jsonStr[i + 1];
        i += 2;
        continue;
      }

      if (c === '"') {
        // 检查这个引号后面是不是有效的 JSON 结构
        const afterQuoteRaw = jsonStr.slice(i + 1);
        const afterQuote = afterQuoteRaw.trimStart();
        const nextChar = afterQuote[0];
        const nextTwoChars = afterQuote.slice(0, 2);
        // 检查引号后面是否有空白然后是另一个引号（缺少逗号的情况）
        const hasWhitespaceThenQuote = /^\s+\"/.test(afterQuoteRaw);

        // 如果引号后面是 , } ] : 或字符串结束，这是真正的结束引号
        // 也包括注释标记 # 或 //（这些会在后续被移除）
        // 也包括 空白+"（表示两个字符串之间缺少逗号，后续会修复）
        if (!nextChar || nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === ':' || nextChar === '#' || hasWhitespaceThenQuote || nextTwoChars === '//') {
          foundEnd = true;
          result.push(stringContent);
          result.push('"'); // 输出结束引号
          i++;
          continue;
        }

        // 否则这是字符串中间的引号，需要转义
        stringContent += '\\"';
        i++;
        continue;
      }

      stringContent += c;
      i++;
    }

    // 如果没有找到结束引号，把剩余内容都加上
    if (!foundEnd) {
      result.push(stringContent);
    }
  }

  return result.join('');
}

function repairBrokenJSON(jsonStr: string): string {
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

function extractJSON<T>(content: string): T {
  // ===== 第零阶段：提取 JSON 字符串 =====
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
      // 例如: "executiveSummary": { ... }
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

  // ===== 第二阶段：修复引号相关问题 =====

  // 修复0: 处理数组元素之间连续引号无逗号的情况（DeepSeek 常见错误）
  // 例如: ["a""b"] -> ["a", "b"]
  // 使用循环持续修复，因为一次替换可能产生新的连续引号
  {
    let prevLength = 0;
    while (prevLength !== jsonStr.length) {
      prevLength = jsonStr.length;
      jsonStr = jsonStr.replace(/""/g, '", "');
    }
  }

  // 修复1: 处理缺少开头引号的字符串值 (如: "key": value", -> "key": "value",)
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

  // 修复1: 处理字符串中未转义的引号
  jsonStr = fixUnescapedQuotesInStrings(jsonStr);

  // 修复2: 移除 JSON 中的注释
  jsonStr = removeJsonComments(jsonStr);

  // 修复3: 转义控制字符
  jsonStr = escapeControlCharsInJsonStrings(jsonStr);

  // 修复4: 处理数组元素之间缺少逗号
  jsonStr = jsonStr.replace(/"\s+"/g, '", "');

  // 修复5: 确保 {} 配对
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
    return JSON.parse(jsonStr) as T;
  } catch (firstError) {
    console.warn('[extractJSON] 首次解析失败，尝试修复 JSON...', firstError);

    // ===== 第二阶段：其他修复 =====

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
      return JSON.parse(jsonStr) as T;
    } catch (secondError) {
      console.error('[extractJSON] 修复后仍然失败:', secondError);

      // 提取错误位置信息
      const errorMsg = secondError instanceof Error ? secondError.message : String(secondError);
      const posMatch = errorMsg.match(/position (\d+)/);
      const position = posMatch ? parseInt(posMatch[1]) : 0;

      // 显示错误位置周围的内容
      const start = Math.max(0, position - 200);
      const end = Math.min(jsonStr.length, position + 200);
      console.error('[extractJSON] ========== 错误详情 ==========');
      console.error('[extractJSON] 错误消息:', errorMsg);
      console.error('[extractJSON] 错误位置:', position);
      console.error('[extractJSON] 错误位置前200字符:\n', jsonStr.slice(start, position));
      console.error('[extractJSON] >>> 错误位置字符:', JSON.stringify(jsonStr.slice(position, position + 20)));
      console.error('[extractJSON] 错误位置后200字符:\n', jsonStr.slice(position, end));
      console.error('[extractJSON] ========== JSON 全文 (分段) ==========');
      for (let i = 0; i < jsonStr.length; i += 3000) {
        console.error(`[extractJSON] JSON [${i}-${Math.min(i + 3000, jsonStr.length)}]:`, jsonStr.slice(i, i + 3000));
      }
      console.error('[extractJSON] JSON 总长度:', jsonStr.length);
      console.error('[extractJSON] ================================');

      throw new Error(`JSON 解析失败: ${errorMsg}`);
    }
  }
}

// ==================== 测试运行 ====================

function runTest(name: string, testJson: string) {
  console.log(`\n========== ${name} ==========`);
  console.log('输入:', testJson.slice(0, 100) + '...');

  try {
    const result = extractJSON(testJson);
    console.log('✅ 成功:', JSON.stringify(result, null, 2).slice(0, 200) + '...');
    return true;
  } catch (error) {
    console.log('❌ 失败:', (error as Error).message);
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
  runTest('测试7: 连续引号无逗号', testCase7),
];

console.log('\n========================================');
console.log('测试结果汇总');
console.log('========================================');
console.log(`通过: ${results.filter(r => r).length}/${results.length}`);
console.log(`失败: ${results.filter(r => !r).length}/${results.length}`);
