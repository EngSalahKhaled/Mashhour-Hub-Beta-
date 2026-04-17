const fs = require('fs');
const path = require('path');

const targetDir = 'c:\\Users\\USER\\Downloads\\Mashhour-New\\Mashhour-New\\Mashhor Hub Website New';
const oldPhone = '96555377309';
const newPhone = '96555377309';
const extensions = ['.html', '.php', '.js'];

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (extensions.includes(path.extname(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(oldPhone)) {
        content = content.split(oldPhone).join(newPhone);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

replaceInDir(targetDir);
console.log('Finished replacing WA number.');
