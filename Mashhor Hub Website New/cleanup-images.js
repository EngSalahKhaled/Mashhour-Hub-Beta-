const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const imageDirs = ['assets/images', 'assets/img'];
const excludeDirs = ['tmp_archive', '.git', 'node_modules', 'assets/images', 'assets/img'];

function getFiles(dir, allFiles = []) {
  if (!fs.existsSync(dir)) return allFiles;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (!excludeDirs.includes(file)) {
        getFiles(name, allFiles);
      }
    } else if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(name)) {
      allFiles.push(name);
    }
  });
  return allFiles;
}

const allImages = imageDirs.flatMap(dir => getFiles(dir));
const unused = [];

console.log(`Checking ${allImages.length} images...`);

allImages.forEach((img, index) => {
  const baseName = path.basename(img);
  // Using ripgrep (rg) if available, or just grep. In this environment, I'll use a JS-based search to be safe or call grep via shell.
  // Actually, I'll use the shell 'grep' via execSync for reliability since it worked for me manually.
  // But wait, the user is on win32. 'grep' might not be available directly in powershell unless it's an alias.
  // I'll use 'findstr' or just read all files once into memory and then check.
});

// Optimized: Read all searchable files ONCE.
const searchableFiles = [];
function getSearchableFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    const relName = name.replace(/\\/g, '/');
    if (fs.statSync(name).isDirectory()) {
      if (!excludeDirs.some(ex => relName.includes(ex)) && !relName.includes('tmp_archive')) {
        getSearchableFiles(name);
      }
    } else if (/\.(html|css|js|json|xml|txt)$/i.test(name)) {
      searchableFiles.push(name);
    }
  });
}

getSearchableFiles('.');
console.log(`Found ${searchableFiles.length} files to search in.`);

const fileContents = searchableFiles.map(f => {
    try {
        return fs.readFileSync(f, 'utf8');
    } catch(e) {
        return '';
    }
});

allImages.forEach(img => {
  const baseName = path.basename(img);
  const isUsed = fileContents.some(content => content.includes(baseName));
  if (!isUsed) {
    unused.push(img);
  }
});

console.log('--- UNUSED IMAGES REPORT ---');
unused.forEach(img => console.log(`[UNUSED]: ${img}`));
console.log(`\nTotal unused images: ${unused.length}`);
