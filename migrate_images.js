const fs = require('fs');
const path = require('path');

const arFiles = [
  ['ar/portfolio/al-sultan-pharmacy.html', '../../assets/images/Portofolio/aldawaeya.webp'],
  ['ar/portfolio/pharma-life.html', '../../assets/images/Portofolio/pharmalife.webp'],
  ['ar/portfolio/cosmo-life.html', '../../assets/images/Portofolio/cosmo-life.webp'],
  ['ar/portfolio/offers-only.html', '../../assets/images/Portofolio/offers-and-only.webp'],
  ['ar/portfolio/kashkha.html', '../../assets/images/Portofolio/oud-box.webp'],
  ['ar/portfolio/infinity-sama-smile.html', '../../assets/images/Portofolio/asnan-q8.webp'],
  ['ar/portfolio/beauty-world.html', '../../assets/images/Portofolio/beauty-world.webp'],
  ['ar/portfolio/last-night-beauty.html', '../../assets/images/Portofolio/lastnight.webp'],
  ['ar/portfolio/souq-media.html', '../../assets/images/Portofolio/souq-media.webp']
];

const enFiles = [
  ['portfolio/al-sultan-pharmacy.html', '../assets/images/Portofolio/aldawaeya.webp'],
  ['portfolio/pharma-life.html', '../assets/images/Portofolio/pharmalife.webp'],
  ['portfolio/cosmo-life.html', '../assets/images/Portofolio/cosmo-life.webp'],
  ['portfolio/offers-only.html', '../assets/images/Portofolio/offers-and-only.webp'],
  ['portfolio/kashkha.html', '../assets/images/Portofolio/oud-box.webp'],
  ['portfolio/infinity-sama-smile.html', '../assets/images/Portofolio/asnan-q8.webp'],
  ['portfolio/beauty-world.html', '../assets/images/Portofolio/beauty-world.webp'],
  ['portfolio/last-night-beauty.html', '../assets/images/Portofolio/lastnight.webp'],
  ['portfolio/souq-media.html', '../assets/images/Portofolio/souq-media.webp']
];

function migrate(files) {
  files.forEach(([filePath, newImg]) => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      // Replace src="..." in tags with class="cs-hero-image"
      const regex = /<img src="[^"]+" alt="[^"]+" class="cs-hero-image[^"]*"/i;
      const match = content.match(regex);
      if (match) {
        let updatedTag = match[0].replace(/src="[^"]+"/, `src="${newImg}"`);
        content = content.replace(match[0], updatedTag);
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      } else {
        console.warn(`Could not find hero image tag in ${filePath}`);
      }
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
    }
  });
}

migrate(arFiles);
migrate(enFiles);
