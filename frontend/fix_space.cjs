const fs = require('fs');
let content = fs.readFileSync('services/volcengine.ts', 'utf8');

// Replace the consecutive quotes fix to add space
content = content.replace(/jsonStr\.replace\(\/""\/g, '",'\)/g, 'jsonStr.replace(/""/g, \'", \\"\')');

fs.writeFileSync('services/volcengine.ts', content);
console.log('Done');