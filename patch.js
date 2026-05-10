const fs = require('fs');
const path = require('path');

const patchesDir = path.join(__dirname, 'patches');

// 1. Check if the patches directory exists
if (!fs.existsSync(patchesDir)) {
    console.error("❌ 'patches' directory not found!");
    process.exit(1);
}

const patchFiles = fs.readdirSync(patchesDir).filter(f => f.endsWith('.json'));

patchFiles.forEach(file => {
    const config = JSON.parse(fs.readFileSync(path.join(patchesDir, file), 'utf8'));
    console.log(`\n🚀 Patching Project: ${config.appName}`);

    const baseDir = path.join(__dirname, config.appPath);

    if (!fs.existsSync(baseDir)) {
        console.warn(`   ⚠️  Directory not found, skipping: ${config.appPath}`);
        return;
    }

    /**
     * Recursively walks through the directory and executes a callback for each file.
     */
    function walkSync(dir, callback) {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            
            // Skip hidden folders, build artifacts, and node_modules
            if (fs.statSync(filePath).isDirectory()) {
                if (!file.startsWith('.') && file !== 'build' && file !== 'node_modules') {
                    walkSync(filePath, callback);
                }
            } else {
                callback(filePath);
            }
        });
    }

    walkSync(baseDir, (filePath) => {
        const ext = path.extname(filePath);
        // Only target relevant Android/Kotlin/Gradle/Proto files
        if (['.kts', '.xml', '.kt', '.gradle', '.java', '.proto', '.properties'].includes(ext)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;

            // --- A. Package Name Replacement ---
            // Sadece tam paket eşleşmelerini veya paketle başlayan alt yolları değiştirir.
            // Örneğin "proton.android.auth" içindeki "android.auth" kısmını yanlışlıkla değiştirmemesi için.
            if (content.includes(config.oldPackage)) {
                // Regex: oldPackage'ı bulur, ancak önünde bir harf veya rakam olmamalıdır (kelime başı veya . sonrası)
                const packageRegex = new RegExp('(?<![a-zA-Z0-9])' + config.oldPackage.replace(/\./g, '\\.'), 'g');
                if (packageRegex.test(content)) {
                    content = content.replace(packageRegex, config.newPackage);
                    changed = true;
                }
            }

            // --- B. App Title Replacement (Targeting strings.xml) ---
            if (ext === '.xml' && filePath.includes('strings.xml') && content.includes('name="app_name"')) {
                const titleRegex = /(<string name="app_name".*?>)(.*?)(<\/string>)/g;
                if (titleRegex.test(content)) {
                    content = content.replace(titleRegex, `$1${config.newTitle}$3`);
                    changed = true;
                }
            }

            // --- C. Remove applicationIdSuffix (Clean Package Name) ---
            // Gradle dosyalarındaki suffix eklerini temizler (.fdroid, .dev vb. eklenmesini engeller)
            if (['.gradle', '.kts'].includes(ext)) {
                const suffixRegex = /applicationIdSuffix\s*=?\s*['"].*?['"]/g;
                if (suffixRegex.test(content)) {
                    content = content.replace(suffixRegex, '// applicationIdSuffix removed by patch.js');
                    changed = true;
                }
            }

            // --- D. Write changes back to file ---
            if (changed) {
                fs.writeFileSync(filePath, content);
                console.log(`   ✅ Modified: ${path.relative(baseDir, filePath)}`);
            }
        }
    });
});

console.log("\n✨ All patches applied successfully!");