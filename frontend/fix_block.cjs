const fs = require('fs');
let content = fs.readFileSync('services/volcengine.ts', 'utf8');
const lines = content.split('\n');

// Line 241: '      jsonStr = jsonStr.replace(/""/g, (match) => {'
// Line 242: '        // match 是 "" 两个连续引号'
// Line 243: '        return '",'; // 替换为 ",'
// Line 244: '      });'

// Replace lines 241-244
lines[240] = '      jsonStr = jsonStr.replace(/""/g, \'"\,\');';
lines[241] = '    }';

// Remove lines 242 and 243 and 244
lines.splice(242, 3);

fs.writeFileSync('services/volcengine.ts', lines.join('\n'));
console.log('Done');