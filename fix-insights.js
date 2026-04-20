const fs = require('fs');
const path = require('path');

// Fix ar/blog/insights.html - image src paths are ../assets (wrong from depth 2)
// Should be ../../assets
const file = path.join(process.cwd(), 'ar', 'blog', 'insights.html');
let content = fs.readFileSync(file, 'utf8');

// Replace src="../assets/ with src="../../assets/ 
// but NOT src="../../assets/ (already correct)
let count = 0;
const fixed = content.replace(/src="\.\.\/assets\//g, () => { count++; return 'src="../../assets/'; });

if (count > 0) {
  fs.writeFileSync(file, fixed);
  console.log('Fixed', count, 'image paths in ar/blog/insights.html');
} else {
  console.log('No changes needed');
}
