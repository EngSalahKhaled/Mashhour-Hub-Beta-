const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files tracked by git
const gitFilesStr = execSync('git ls-files').toString('utf8');
const gitFiles = gitFilesStr.split('\n').map(f => f.trim()).filter(f => f);

// Create a lookup map for case-insensitive matching and basename matching
const gitLookup = {};
const gitBasenameLookup = {};
gitFiles.forEach(f => {
    gitLookup[f.toLowerCase()] = f;
    const base = path.basename(f).toLowerCase();
    if (!gitBasenameLookup[base]) {
        gitBasenameLookup[base] = [];
    }
    gitBasenameLookup[base].push(f);
});

const walk = (d) => {
  let r=[]; fs.readdirSync(d).forEach(f=>{
    const p=path.join(d,f);
    if(fs.statSync(p).isDirectory() && !p.includes('node_modules') && !p.includes('.git')) r=r.concat(walk(p));
    else if(p.endsWith('.html')) r.push(p);
  });
  return r;
};

const htmlFiles = walk(__dirname);
let totalFixed = 0;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    content = content.replace(/<(img|source)[^>]+(?:src|srcset)=["']([^"']+)["']/gi, (match, tag, srcOriginal) => {
        let parts = srcOriginal.split(',');
        let modifiedParts = parts.map(part => {
            let p = part.trim().split(' ');
            let src = p[0];
            if(src.startsWith('http') || src.startsWith('data:') || src.startsWith('javascript:')) return part;
            
            // Normalize path relative to repo root
            let absPath = path.resolve(path.dirname(file), src.replace(/\\/g, '/'));
            let relativeToRepo = path.relative(__dirname, absPath).replace(/\\/g, '/');
            
            let matchedGitPath = null;
            
            // 1. Direct case-insensitive match
            if (gitLookup[relativeToRepo.toLowerCase()]) {
                matchedGitPath = gitLookup[relativeToRepo.toLowerCase()];
            } 
            // 2. Fallback to searching by basename if path is completely wrong (e.g. inside icons/ instead of root)
            else {
                const base = path.basename(src).toLowerCase();
                if (gitBasenameLookup[base] && gitBasenameLookup[base].length === 1) {
                    matchedGitPath = gitBasenameLookup[base][0];
                }
            }

            if (matchedGitPath) {
                // We found the correct file in git! Let's generate the correct relative path for the HTML
                let correctAbsPath = path.resolve(__dirname, matchedGitPath);
                let newRelativeSrc = path.relative(path.dirname(file), correctAbsPath).replace(/\\/g, '/');
                
                if (newRelativeSrc !== src) {
                    p[0] = newRelativeSrc;
                    changed = true;
                    return p.join(' ');
                }
            }
            return part; // No change
        });
        
        if (modifiedParts.join(',') !== srcOriginal) {
            return match.replace(srcOriginal, modifiedParts.join(', '));
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        totalFixed++;
        console.log('Fixed paths in: ' + path.relative(__dirname, file));
    }
});

console.log('Total HTML files fixed for images: ' + totalFixed);
