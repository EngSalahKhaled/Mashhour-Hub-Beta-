const fs = require('fs');

const path = 'assets/js/mashhor-platform.js';
let content = fs.readFileSync(path, 'utf8');

// Replace ${baseUrl}index.html with ${baseUrl}
content = content.replace(/\}index\.html/g, '}');

// Replace /index.html with / (for example folder/index.html -> folder/)
// But avoid breaking the regex in isActive function
content = content.replace(/(?<!\\)\/index\.html/g, '/');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed mashhor-platform.js');
