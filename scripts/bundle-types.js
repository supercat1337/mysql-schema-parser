import fs from 'fs';
import path from 'path';

const tempDir = './dist/types-temp/src';
const outputFile = './dist/mysql-schema-parser.esm.d.ts';
const headerFile = './index.d.ts';

function bundleTypes() {
    // 1. Read the header (your interfaces and declare global)
    let finalContent = '';
    if (fs.existsSync(headerFile)) {
        finalContent += fs.readFileSync(headerFile, 'utf8') + '\n';
    }

    // 2. Get the list of all .d.ts files in the folder, excluding index.d.ts
    // (because index.d.ts in temp usually just contains export { ... })
    const files = fs
        .readdirSync(tempDir)
        .filter(file => file.endsWith('.d.ts') && file !== 'index.d.ts');

    console.log(`Found ${files.length} type files to bundle...`);

    files.forEach(file => {
        const filePath = path.join(tempDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // 3. Clean up the content
        content = content
            // Remove all import statements (import ... from ...)
            .replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '')
            // Remove external re-exports (export { ... } from ...)
            .replace(/^export\s+.*?\s+from\s+['"].*?['"];?/gm, '')
            // Remove empty lines that may remain after removing imports
            .trim();

        if (content) {
            finalContent += `\n/* From ${file} */\n` + content + '\n';
        }
    });

    // 4. Final cleanup: remove multiple blank lines
    finalContent = finalContent.replace(/\n{3,}/g, '\n\n');

    fs.writeFileSync(outputFile, finalContent);
    console.log(`Bundle created: ${outputFile}`);
}

bundleTypes();
