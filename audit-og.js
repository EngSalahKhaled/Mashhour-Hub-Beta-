const fs = require('fs');
const path = require('path');

const missing = [];
const broken = [];
const noTwitter = [];
const wrongType = [];

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        const s = fs.statSync(p);
        if (s.isDirectory() && !['node_modules', '.git', '.gemini', 'assets'].includes(f)) {
            walk(p);
        } else if (p.endsWith('.html') && !p.includes('Complete_Vault') && !p.includes('flaticon') && !p.includes('license')) {
            const c = fs.readFileSync(p, 'utf8');
            
            // Check og:image
            const ogM = c.match(/property="og:image"\s+content="([^"]+)"/);
            if (!ogM) {
                missing.push(p);
            } else {
                const url = ogM[1];
                const fname = url.split('/').pop();
                const ogPath = path.join('assets', 'images', 'og', fname);
                if (!fs.existsSync(ogPath)) {
                    broken.push({ file: p, img: fname });
                }
            }
            
            // Check twitter:image
            const twM = c.match(/name="twitter:image"\s+content="([^"]+)"/);
            if (!twM) {
                noTwitter.push(p);
            }
            
            // Check og:image:type is jpeg
            const typeM = c.match(/property="og:image:type"\s+content="([^"]+)"/);
            if (typeM && typeM[1] !== 'image/jpeg') {
                wrongType.push({ file: p, type: typeM[1] });
            }
            
            // Check for .webp still in og:image
            if (ogM && ogM[1].endsWith('.webp')) {
                console.log('STILL WEBP:', p);
            }
        }
    });
}

walk('.');

console.log('=== Missing og:image (' + missing.length + ') ===');
missing.forEach(m => console.log('  ', m));

console.log('\n=== Broken og:image file not found (' + broken.length + ') ===');
broken.forEach(b => console.log('  ', b.file, '->', b.img));

console.log('\n=== Missing twitter:image (' + noTwitter.length + ') ===');
noTwitter.forEach(m => console.log('  ', m));

console.log('\n=== Wrong og:image:type (' + wrongType.length + ') ===');
wrongType.forEach(w => console.log('  ', w.file, '->', w.type));
