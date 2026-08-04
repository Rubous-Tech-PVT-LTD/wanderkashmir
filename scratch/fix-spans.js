const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\hp\\.gemini\\antigravity-ide\\scratch\\wanderkashmir\\src';

function scanAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replace Wander<span...>Kashmir</span>
            const regex = /Wander(<span[^>]*>)Kashmir(<\/span>)/g;
            if (regex.test(content)) {
                content = content.replace(regex, 'India$1hiles$2');
                modified = true;
            }
            
            // Replace Wander Admin
            if (content.includes('Wander Admin')) {
                content = content.replace(/Wander Admin/g, 'Indiahiles Admin');
                modified = true;
            }

            // Replace WANDERKASHMIR
            if (content.includes('WANDERKASHMIR')) {
                content = content.replace(/WANDERKASHMIR/g, 'INDIAHILES');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed:', fullPath);
            }
        }
    }
}

scanAndReplace(dir);
console.log("Done");
