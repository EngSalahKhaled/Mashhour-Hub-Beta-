const fs = require('fs');
const path = require('path');

function replaceIndexHTMLLinks(dir) {
    let replacedCount = 0;
    
    function walk(currentDir) {
        const files = fs.readdirSync(currentDir);
        
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // exclude node_modules or .git
                if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.gemini')) {
                    walk(filePath);
                }
            } else if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
                // Only process HTML or JS files
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content;

                const replaceFn = (match, attr, quote, prefix) => {
                    if (!prefix) {
                        return `${attr}=${quote}./${quote}`;
                    } else {
                        return `${attr}=${quote}${prefix}${quote}`;
                    }
                };
                
                // Replace in HTML href and action attributes
                newContent = newContent.replace(/(href|action)=(['"])(.*?\/)?index\.html\2/g, replaceFn);
                
                // Replace in window.location.href assignments inside JS or inline scripts
                // Example: window.location.href = .href".href 
                // We'll just be careful not to break anything and target exact quotes
                newContent = newContent.replace(/(=>\s*|window\.location(\.href)?\s*=\s*)(['"])(.*?\/)?index\.html\3/g, (match, prefix, quote, urlPrefix, q2) => {
                    // prefix is '=> ' or 'window.location.href = '
                    // quote is ' or "
                    // urlPrefix is 'folder/' or undefined
                     if (!urlPrefix) {
                        return `${prefix}${quote}./${quote}`;
                    } else {
                        return `${prefix}${quote}${urlPrefix}${quote}`;
                    }
                 });

                 // Open Graph / metadata content
                 newContent = newContent.replace(/(content)=(['"])(https?:\/\/[^\s"'<>]+\/)?index\.html\2/g, (match, attr, quote, prefix) => {
                     if (prefix) {
                         return `${attr}=${quote}${prefix}${quote}`;
                     }
                     return match; // If no http prefix, do not change just in case
                 });

                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    replacedCount++;
                    // console.log(`Updated links in ${filePath}`);
                }
            }
        }
    }
    
    walk(dir);
    console.log(`Replaced 'index.html' links in ${replacedCount} files.`);
}

replaceIndexHTMLLinks(__dirname);
