const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

const pathsToRestore = [
    'assets/images/shape/',
    'assets/images/banner/',
    'assets/images/slack.png',
    'assets/images/telegram.png',
    'assets/images/twitter.png',
    'assets/images/behance.png',
    'assets/images/app-store.png',
    'assets/images/play-store.png',
    'assets/images/messenger.png',
    'assets/images/skype.png',
    'assets/images/printerest.png',
    'assets/images/rate-star.png',
    'assets/images/rate-star-md.png',
    'assets/images/rate-star-lg.png'
];

// Restore the png files from git
try {
    const cmd = 'git checkout -- ' + pathsToRestore.map(p => `"${p.replace(/\\/g, '/')}"`).join(' ');
    console.log('Running:', cmd);
    execSync(cmd);
    console.log('Restored original PNGs from Git.');
} catch (e) {
    console.error('Git checkout error', e.message);
}

// Delete their corresponding .webp files (to clean up)
function getWebpVersion(p) {
    if (p.endsWith('/')) return null; // directory handled separately
    return p.replace('.png', '.webp');
}

pathsToRestore.forEach(p => {
    if (!p.endsWith('/')) {
        const webp = path.join(ROOT, getWebpVersion(p));
        if (fs.existsSync(webp)) fs.unlinkSync(webp);
    } else {
        const dir = path.join(ROOT, p);
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(f => {
                if (f.endsWith('.webp')) fs.unlinkSync(path.join(dir, f));
            });
        }
    }
});
console.log('Cleaned up corrupted WebP versions.');

// Update HTML/CSS files to point back to .png
function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        results = results.concat(walk(fullPath));
      } else if (/\.(html|css|js)$/.test(file)) {
          results.push(fullPath);
      }
    });
  } catch (e) {}
  return results;
}

const allFiles = walk(ROOT);
let count = 0;

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Pattern for shape and banner folder
    const regex1 = /(assets\/images\/(?:shape|banner)\/[a-zA-Z0-9\-]+)\.webp/g;
    if (regex1.test(content)) {
        content = content.replace(regex1, '$1.png');
        changed = true;
    }

    // Pattern for floating icons
    const icons = ['slack', 'telegram', 'twitter', 'behance', 'app-store', 'play-store', 'messenger', 'skype', 'printerest', 'rate-star', 'rate-star-md', 'rate-star-lg'];
    icons.forEach(ic => {
        const icRegex = new RegExp('(assets/images/' + ic + ')\\.webp', 'g');
        if (icRegex.test(content)) {
            content = content.replace(icRegex, '$1.png');
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(file, content);
        count++;
    }
});

console.log('Reverted references to .png in ' + count + ' files.');
