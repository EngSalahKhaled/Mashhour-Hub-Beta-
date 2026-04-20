const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = process.cwd();
let stats = { deletedUnused: 0, converted: 0, codeFilesUpdated: 0, errors: [] };

function walk(dir, includeRegex, excludeRegex) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        results = results.concat(walk(fullPath, includeRegex, excludeRegex));
      } else if (!stat.isDirectory()) {
         if (includeRegex.test(fullPath)) {
             if (!excludeRegex || !excludeRegex.test(fullPath)) {
                 results.push(fullPath);
             }
         }
      }
    });
  } catch (e) {}
  return results;
}

const images = walk(path.join(ROOT, 'assets', 'images'), /\.(png|webp|jpg|jpeg|svg|gif)$/i);
const codeFiles = walk(ROOT, /\.(html|js|css|json)$/i);

console.log(`Found ${images.length} images and ${codeFiles.length} code files.`);

// Preload all code file contents into memory to make search/replace super fast
let codeData = codeFiles.map(f => ({
  path: f,
  content: fs.readFileSync(f, 'utf8'),
  original: fs.readFileSync(f, 'utf8')
}));

// Create a combined string of all code just for fast checking
let allCodeText = codeData.map(c => c.content).join('\n');

async function processUnused() {
  console.log('\n🗑️ TASK 1: Removing fully unused images...');
  for (const img of images) {
    const baseName = path.basename(img);
    // If exact filename does not exist anywhere in code
    if (!allCodeText.includes(baseName)) {
      try {
        fs.unlinkSync(img);
        stats.deletedUnused++;
        console.log(`  ❌ Deleted unused: ${path.relative(ROOT, img)}`);
      } catch (e) {
        stats.errors.push(`Could not delete ${baseName}: ${e.message}`);
      }
    }
  }
}

async function convertAndReplace() {
  console.log('\n🔄 TASK 2: Converting PNGs to WebP and updating code...');
  
  // Refresh list of images since we deleted some
  const currentImages = walk(path.join(ROOT, 'assets', 'images'), /\.png$/i);
  
  for (const img of currentImages) {
    // Skip icons folder
    if (img.includes(path.join('assets', 'images', 'icons'))) {
      continue;
    }

    const baseName = path.basename(img);           // e.g. "hero-bg.png"
    const parsed = path.parse(img);
    const newBaseName = parsed.name + '.webp';     // e.g. "hero-bg.webp"
    const newPath = path.join(parsed.dir, newBaseName);

    try {
      // 1. Convert
      await sharp(img)
        .webp({ quality: 80, effort: 6 }) // high quality, good compression
        .toFile(newPath);
      
      // 2. Replace in memory
      let replacedInFile = false;
      codeData.forEach(fileObj => {
        if (fileObj.content.includes(baseName)) {
            // Regex to match exactly the filename but considering global
            // We use standard string replace if we want to be safe, but a file might reference it multiple times
            // So we use split/join which is safe and replaces all instances
            const newContent = fileObj.content.split(baseName).join(newBaseName);
            if (newContent !== fileObj.content) {
                fileObj.content = newContent;
                replacedInFile = true;
            }
        }
      });
      
      // 3. Delete old file
      fs.unlinkSync(img);
      stats.converted++;
      console.log(`  ✅ Converted & Updated: ${baseName} -> ${newBaseName}`);
      
    } catch (e) {
      stats.errors.push(`Conversion failed for ${baseName}: ${e.message}`);
    }
  }
  
  // 4. Save changed files back to disk
  for (const fileObj of codeData) {
      if (fileObj.content !== fileObj.original) {
          fs.writeFileSync(fileObj.path, fileObj.content);
          stats.codeFilesUpdated++;
      }
  }
}

async function run() {
  await processUnused();
  await convertAndReplace();
  
  console.log('\n================================');
  console.log('📊 Optimization Summary:');
  console.log(`   Unused Deleted:   ${stats.deletedUnused}`);
  console.log(`   PNGs Converted:   ${stats.converted}`);
  console.log(`   Code Files Fixed: ${stats.codeFilesUpdated}`);
  
  if (stats.errors.length > 0) {
      console.log(`\n❌ Errors (${stats.errors.length}):`);
      stats.errors.forEach(e => console.log('   - ' + e));
  }
}

run();
