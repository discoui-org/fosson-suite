const fs = require('fs');
const path = require('path');

const patchesDir = path.join(__dirname, 'patches');

// 1. Check if the patches directory exists
if (!fs.existsSync(patchesDir)) {
    console.error("Error: 'patches' directory not found!");
    process.exit(1);
}

let patchFiles = fs.readdirSync(patchesDir).filter(f => f.endsWith('.json'));

// --- Theme Loading ---
const themePath = path.join(__dirname, 'theme.json');
let themeConfig = {
    dark: { background: "#000000", surface: "#000000" },
    light: { background: "#FFFFFF", surface: "#F5F5F5" },
    accent: { primary: "#6D4CFF", secondary: "#573BCC" },
    fonts: { useSystemFont: true }
};

if (fs.existsSync(themePath)) {
    try {
        const customTheme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
        themeConfig = { ...themeConfig, ...customTheme };
    } catch (e) {
        console.warn("Warning: Could not parse theme.json, using defaults.");
    }
}

// Function to convert hex to Compose Color format (0xFFRRGGBB)
function toComposeColor(hex) {
    if (!hex) return "Color.Black";
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 6) cleanHex = 'FF' + cleanHex;
    return `Color(color = 0x${cleanHex.toUpperCase()})`;
}

// --- Argument Parsing ---
const args = process.argv.slice(2);
const appArgIndex = args.indexOf('--app');
let targetApp = null;

if (appArgIndex !== -1 && args[appArgIndex + 1]) {
    targetApp = args[appArgIndex + 1].toLowerCase();
} else if (args.length > 0 && !args[0].startsWith('--')) {
    targetApp = args[0].toLowerCase();
}

if (targetApp) {
    patchFiles = patchFiles.filter(file => file.toLowerCase().startsWith(targetApp));
    if (patchFiles.length === 0) {
        console.error(`Error: Project "${targetApp}" not found in patches directory.`);
        process.exit(1);
    }
}

patchFiles.forEach(file => {
    const config = JSON.parse(fs.readFileSync(path.join(patchesDir, file), 'utf8'));
    console.log(`\nPatching Project: ${config.appName}`);

    const baseDir = path.join(__dirname, config.appPath);

    if (!fs.existsSync(baseDir)) {
        console.warn(`   Directory not found, skipping: ${config.appPath}`);
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

    const appliedPatches = new Set();
    let appFilesModified = 0;

    walkSync(baseDir, (filePath) => {
        const ext = path.extname(filePath);
        if (['.kts', '.xml', '.kt', '.gradle', '.java', '.proto', '.properties'].includes(ext)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;

            // --- A. Package Name Replacement ---
            const oldPkg = config.oldPackage;
            const newPkg = config.newPackage;
            const isBuildLogic = filePath.includes('build-logic') || filePath.includes('buildSrc');
            const isConfigFile = ['.kts', '.gradle', '.xml', '.properties'].includes(ext) || filePath.includes('PlatformAndroidConfig.kt') || isBuildLogic;
            
            if (isConfigFile && content.includes(oldPkg)) {
                const lines = content.split('\n');
                const patchedLines = lines.map(line => {
                    if (line.includes('android:name') || line.includes('namespace') || line.includes('NAMESPACE')) return line;
                    let newLine = line;
                    const oldWithMe = 'me.' + oldPkg;
                    while (newLine.includes(oldWithMe)) { newLine = newLine.replace(oldWithMe, newPkg); changed = true; }
                    while (newLine.includes(oldPkg)) { newLine = newLine.replace(oldPkg, newPkg); changed = true; }
                    return newLine;
                });
                if (changed) {
                    content = patchedLines.join('\n');
                    appliedPatches.add('Package Name');
                }
            }

            // --- B. App Title Replacement ---
            if (ext === '.xml' && filePath.includes('strings.xml') && content.includes('name="app_name"')) {
                const titleRegex = /(<string name="app_name".*?>)(.*?)(<\/string>)/g;
                if (titleRegex.test(content)) {
                    content = content.replace(titleRegex, `$1${config.newTitle}$3`);
                    changed = true;
                    appliedPatches.add('App Title');
                }
            }

            // --- C. Remove applicationIdSuffix (Clean Package Name) ---
            if (['.gradle', '.kts'].includes(ext)) {
                const suffixRegex = /applicationIdSuffix\s*=?\s*['"].*?['"]/g;
                if (suffixRegex.test(content)) {
                    content = content.replace(suffixRegex, '// applicationIdSuffix removed by patch.js');
                    changed = true;
                    appliedPatches.add('Package Name Suffix Clean');
                }
            }

            // --- D. Custom Replacements ---
            if (config.customReplacements && Array.isArray(config.customReplacements)) {
                config.customReplacements.forEach(rep => {
                    const featureName = rep.name || 'Custom Patch';
                    
                    // Support both single patch and array of patches
                    const patches = rep.patches || [{ target: rep.target, replacement: rep.replacement }];
                    
                    patches.forEach(p => {
                        let target = p.target;
                        let replacement = p.replacement || '';

                        // Resolve dynamic theme variables in replacement
                        if (replacement.includes('{{theme.')) {
                            replacement = replacement.replace(/{{theme\.dark\.background}}/g, toComposeColor(themeConfig.dark.background));
                            replacement = replacement.replace(/{{theme\.dark\.surface}}/g, toComposeColor(themeConfig.dark.surface));
                            replacement = replacement.replace(/{{theme\.light\.background}}/g, toComposeColor(themeConfig.light.background));
                            replacement = replacement.replace(/{{theme\.accent\.primary}}/g, toComposeColor(themeConfig.accent.primary));
                            replacement = replacement.replace(/{{theme\.accent\.secondary}}/g, toComposeColor(themeConfig.accent.secondary));
                        }

                        if (content.includes(target)) {
                            while (content.includes(target)) {
                                content = content.replace(target, replacement);
                                changed = true;
                                appliedPatches.add(`Feature: ${featureName}`);
                            }
                        }
                    });
                });
            }

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
                appFilesModified++;
            }
        }
    });

    if (appliedPatches.size > 0) {
        appliedPatches.forEach(p => console.log(`   Patched ${p}`));
        console.log(`   Total files modified: ${appFilesModified}`);
    } else {
        console.log('   No changes needed.');
    }
});

console.log('\nAll projects processed successfully!');