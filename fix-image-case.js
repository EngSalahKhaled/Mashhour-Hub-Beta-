const fs = require('fs');
const path = require('path');

const walk = (d) => {
  let r=[]; fs.readdirSync(d).forEach(f=>{
    const p=path.join(d,f);
    if(fs.statSync(p).isDirectory() && !p.includes('node_modules') && !p.includes('.git')) r=r.concat(walk(p));
    else if(p.endsWith('.html')) r.push(p);
  });
  return r;
};

// Returns the true case-sensitive filename from the directory
const getTrueCaseFileName = (dir, requestedFileName) => {
    if (!fs.existsSync(dir)) return requestedFileName;
    const files = fs.readdirSync(dir);
    for (let f of files) {
        if (f.toLowerCase() === requestedFileName.toLowerCase()) {
            return f;
        }
    }
    return requestedFileName;
};

let fixedCount = 0;
const files = walk(__dirname);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    content = content.replace(/<(img|source)[^>]+(?:src|srcset)=["']([^"']+)["']/gi, (match, tag, srcOriginal) => {
        let src = srcOriginal.split(',')[0].trim().split(' ')[0]; // Handle srcset
        if(src.startsWith('http') || src.startsWith('data:')) return match;
        
        let newSrc = src.replace(/\\/g, '/');
        
        let parts = newSrc.split('/');
        let currentPath = path.dirname(file);
        
        for(let i=0; i<parts.length; i++) {
            if(parts[i] === '..') {
                currentPath = path.join(currentPath, '..');
            } else if(parts[i] === '.') {
                // skip
            } else if (parts[i]) {
                const trueName = getTrueCaseFileName(currentPath, parts[i]);
                parts[i] = trueName;
                currentPath = path.join(currentPath, trueName);
            }
        }
        
        const finalResolvedSrc = parts.join('/');
        
        if (finalResolvedSrc !== srcOriginal) {
            changed = true;
            return match.replace(srcOriginal, finalResolvedSrc);
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        fixedCount++;
        console.log('Fixed paths in: ' + path.basename(file));
    }
});

console.log('Total files fixed: ' + fixedCount);
