const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function fixThumbnails() {
    const ogDir = path.join(__dirname, 'assets', 'images', 'og');
    if (!fs.existsSync(ogDir)) {
        console.error('OG directory not found', ogDir);
        return;
    }

    const files = fs.readdirSync(ogDir);
    const webpFiles = files.filter(f => f.endsWith('.webp'));
    let convertedCount = 0;

    console.log(`Converting ${webpFiles.length} WebP thumbnails to JPG...`);
    for (const file of webpFiles) {
        const fullPath = path.join(ogDir, file);
        const nameWithoutExt = path.parse(file).name;
        const newFileName = `${nameWithoutExt}.jpg`;
        const newPath = path.join(ogDir, newFileName);
        
        try {
            await sharp(fullPath)
                .resize(1200, 630, { fit: 'cover' })
                .jpeg({ quality: 85 })
                .toFile(newPath);
            convertedCount++;
        } catch (e) {
            console.error('Error processing', file, e);
        }
    }
    console.log(`Successfully converted ${convertedCount} images to JPG.`);

    let replacedHtmlCount = 0;

    function walk(currentDir) {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const p = path.join(currentDir, item);
            const s = fs.statSync(p);

            // Exclude directories
            if (s.isDirectory()) {
                if (['node_modules', '.git', '.gemini'].includes(item)) continue;
                walk(p);
            } else if (p.endsWith('.html')) {
                let content = fs.readFileSync(p, 'utf8');
                let newContent = content;

                // Replace webp with jpg in og:image, secure_url, twitter:image
                const imageTagRegex = /(property="og:image(?::secure_url)?"|name="twitter:image")\s+content="([^"]+)\.webp"/g;
                newContent = newContent.replace(imageTagRegex, '$1 content="$2.jpg"');

                // Ensure og:image:type is image/jpeg
                const typeRegex = /<meta\s+property="og:image:type"\s+content="[^"]+">/g;
                newContent = newContent.replace(typeRegex, '<meta property="og:image:type" content="image/jpeg">');

                if (content !== newContent) {
                    fs.writeFileSync(p, newContent, 'utf8');
                    replacedHtmlCount++;
                }
            }
        }
    }

    console.log('Replacing references in HTML files...');
    walk(__dirname);
    console.log(`Updated meta tags in ${replacedHtmlCount} HTML files.`);
    
    // Optionally delete the webp files in og directory to clean up
    for (const file of webpFiles) {
        fs.unlinkSync(path.join(ogDir, file));
    }
    console.log(`Cleaned up ${webpFiles.length} original WebP images.`);
}

fixThumbnails().catch(console.error);
