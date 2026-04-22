const fs = require('fs');
const path = require('path');
const { db } = require('../config/firebase');

/**
 * Mashhor Hub Content Migrator
 * Reads static JS files and uploads content to Firestore collections.
 */

async function migrateFile(filePath, collectionName, varName, language) {
    console.log(`\n--- Migrating ${filePath} to collection: ${collectionName} ---`);
    
    try {
        const absolutePath = path.resolve(__dirname, '../../../', filePath);
        if (!fs.existsSync(absolutePath)) {
            console.error(`File not found: ${absolutePath}`);
            return;
        }

        const content = fs.readFileSync(absolutePath, 'utf8');
        
        // Extract the array using regex
        // Matches something like: const varName = [ ... ];
        const regex = new RegExp(`${varName}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*;`, 'm');
        const match = content.match(regex);
        
        if (!match) {
            console.error(`Could not find variable [${varName}] in ${filePath}`);
            return;
        }

        let data;
        try {
            // Clean up potentially problematic JS-style comments or trailing commas before parsing
            // Use eval for safety as these are trusted local JS data files
            data = eval(match[1]);
        } catch (e) {
            console.error(`Failed to parse data from ${filePath}:`, e.message);
            return;
        }

        if (!Array.isArray(data)) {
            console.error(`Data extracted from ${filePath} is not an array.`);
            return;
        }

        console.log(`Found ${data.length} items. Uploading...`);

        const batch = db.batch();
        let count = 0;

        for (const item of data) {
            const docRef = db.collection(collectionName).doc();
            batch.set(docRef, {
                ...item,
                language: language,
                migrated: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            count++;

            // Commit in chunks of 500 (Firestore limit)
            if (count % 400 === 0) {
                await batch.commit();
                console.log(`Commited ${count} items...`);
            }
        }

        await batch.commit();
        console.log(`✅ Successfully migrated ${count} items to ${collectionName} (${language})`);

    } catch (error) {
        console.error(`Error migrating ${filePath}:`, error.message);
    }
}

async function runMigration() {
    // 1. Prompts
    await migrateFile('assets/js/prompts-data-en.js', 'prompts', 'prompts', 'en');
    await migrateFile('assets/js/prompts-data-ar.js', 'prompts', 'prompts', 'ar');

    // 2. Tools
    await migrateFile('assets/js/tools-data-en.js', 'tools', 'tools', 'en');
    await migrateFile('assets/js/tools-data-ar.js', 'tools', 'tools', 'ar');

    // 3. Vault
    await migrateFile('assets/js/vault-data-en.js', 'vault', 'MR_PROMPTS_EN', 'en');
    await migrateFile('assets/js/vault-data-ar.js', 'vault', 'MR_PROMPTS_AR', 'ar');

    // 4. Library
    await migrateFile('assets/js/library-data.js', 'library_items', 'window.MR_LIBRARY_RESOURCES', 'en'); 

    console.log('\n🌟 Migration Finished!');
    process.exit(0);
}

runMigration();
