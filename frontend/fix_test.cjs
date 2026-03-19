const fs = require('fs');
let content = fs.readFileSync('test-json-parsing.ts', 'utf8');

// Find the location to insert the consecutive quotes fix
// It should be before 修复0: 处理缺少开头引号

const oldBlock = `  // ===== 第二阶段：修复引号相关问题 =====

  // 修复0: 处理缺少开头引号的字符串值`;

const newBlock = `  // ===== 第二阶段：修复引号相关问题 =====

  // 修复0: 处理数组元素之间连续引号无逗号的情况（DeepSeek 常见错误）
  // 例如: ["a""b"] -> ["a", "b"]
  // 使用循环持续修复，因为一次替换可能产生新的连续引号
  {
    let prevLength = 0;
    while (prevLength !== jsonStr.length) {
      prevLength = jsonStr.length;
      jsonStr = jsonStr.replace(/""/g, '",');
    }
  }

  // 修复1: 处理缺少开头引号的字符串值`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('test-json-parsing.ts', content);
console.log('Done');