const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\USER\\Downloads\\Mashhour-New\\Mashhour-New\\Mashhor Hub Website New\\assets\\images\\Portofolio';

async function convert() {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            const name = path.parse(file).name;
            const inputPath = path.join(dir, file);
            const outputPath = path.join(dir, name + '.webp');
            
            console.log(`Converting ${file} -> ${name}.webp`);
            try {
                // Ensure output path is different from input path
                if (inputPath.toLowerCase() === outputPath.toLowerCase()) {
                    console.warn(`Skipping ${file}: Output path is same as input path.`);
                    continue;
                }

                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                
                console.log(`Deleting original ${file}...`);
                fs.unlinkSync(inputPath);
            } catch (err) {
                console.error(`Error processing ${file}:`, err);
            }
        }
    }
    console.log('Conversion complete!');
}

convert();
