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
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                if (file !== 'build' && file !== 'node_modules' && file !== '.git') {
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
            const oldPkg = config.oldPackage;
            const newPkg = config.newPackage;
            
            // SADECE build, config ve build-logic dosyalarında paket ismini değiştir
            const isBuildLogic = filePath.includes('build-logic') || filePath.includes('buildSrc');
            const isConfigFile = ['.kts', '.gradle', '.xml', '.properties'].includes(ext) || filePath.includes('PlatformAndroidConfig.kt') || isBuildLogic;
            
            if (isConfigFile && content.includes(oldPkg)) {
                const lines = content.split('\n');
                const patchedLines = lines.map(line => {
                    // Sınıf yollarını (android:name) ve Namespace satırlarını elleme
                    if (line.includes('android:name') || line.includes('namespace') || line.includes('NAMESPACE')) {
                        return line;
                    }
                    
                    let newLine = line;
                    const oldWithMe = 'me.' + oldPkg;
                    while (newLine.includes(oldWithMe)) {
                        newLine = newLine.replace(oldWithMe, newPkg);
                        changed = true;
                    }
                    while (newLine.includes(oldPkg)) {
                        newLine = newLine.replace(oldPkg, newPkg);
                        changed = true;
                    }
                    return newLine;
                });
                
                if (changed) {
                    content = patchedLines.join('\n');
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
            // --- C. Custom Replacements (User Defined) ---
            if (config.customReplacements && Array.isArray(config.customReplacements)) {
                config.customReplacements.forEach(rep => {
                    if (content.includes(rep.target)) {
                        while (content.includes(rep.target)) {
                            content = content.replace(rep.target, rep.replacement || '');
                            changed = true;
                        }
                    }
                });
            }

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`   ✅ Modified: ${path.relative(baseDir, filePath)}`);
            }
        }
    });
});

console.log('\n✨ All patches applied successfully!');