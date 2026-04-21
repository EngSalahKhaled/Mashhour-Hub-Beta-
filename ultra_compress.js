const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets', 'images', 'Portofolio');

async function compressImage(inputFileBuffer, outputFile, originalName) {
    let quality = 80;
    let width = 1600;
    let size = Number.MAX_SAFE_INTEGER;
    let buffer;
    
    if (inputFileBuffer.length < 300 * 1024 && originalName.toLowerCase().endsWith('.webp')) {
         fs.writeFileSync(outputFile, inputFileBuffer);
         return true;
    }

    try {
        const metadata = await sharp(inputFileBuffer).metadata();
        if (metadata.width && metadata.width < 1600) width = metadata.width;
    } catch(e) {}

    while (size > 300 * 1024 && width >= 600) {
        try {
            buffer = await sharp(inputFileBuffer)
                .resize({ width: width, withoutEnlargement: true })
                .webp({ quality: quality, effort: 6 })
                .toBuffer();
            size = buffer.length;
            
            if (size > 300 * 1024) {
                quality -= 10;
                if (quality < 50) {
                    quality = 80;
                    width -= Math.max(200, Math.floor(width * 0.2));
                }
            }
        } catch(e) {
            console.error(e);
            break;
        }
    }
    
    if (buffer) {
        await sharp(buffer).toFile(outputFile);
        console.log(`Compressed ${originalName} to ${(size/1024).toFixed(2)} KB (width: ${width}, quality: ${quality})`);
        return true;
    } else {
        console.log(`Failed to process ${originalName}`);
        return false;
    }
}

async function run() {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            const name = path.parse(file).name;
            const inputPath = path.join(dir, file);
            let tempPath = path.join(dir, name + '_temp.webp');
            
            try {
                const stats = fs.statSync(inputPath);
                if (ext !== '.webp' || stats.size > 300 * 1024) {
                    
                    const fileBuffer = fs.readFileSync(inputPath);
                    const success = await compressImage(fileBuffer, tempPath, file);
                    
                    if (success && fs.existsSync(tempPath)) {
                        fs.unlinkSync(inputPath);
                        fs.renameSync(tempPath, path.join(dir, name + '.webp'));
                    }
                } else {
                    console.log(`Skipping ${file}, already under 300KB`);
                }
            } catch (err) {
                console.error(`Failed ${file}:`, err.message);
            }
        }
    }
    console.log("Ultra-compression complete!");
}
run();
