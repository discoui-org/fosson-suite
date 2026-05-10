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
    options: { background: "amoled", accent: "aesthetic_purple", fonts: "system" },
    presets: {
        amoled: { background: "#000000", surface: "#000000" },
        light: { background: "#FFFFFF", surface: "#F5F5F5" },
        aesthetic_purple: { primary: "#6D4CFF", secondary: "#573BCC" }
    }
};

if (fs.existsSync(themePath)) {
    try {
        const customTheme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
        themeConfig = { ...themeConfig, ...customTheme };
    } catch (e) {
        console.warn("Warning: Could not parse theme.json, using defaults.");
    }
}

// Prepare resolved colors based on selected options
const selectedBg = themeConfig.options.background;
const selectedAccent = themeConfig.options.accent;

const resolvedColors = {
    dark: {
        background: selectedBg === "amoled" ? themeConfig.presets.amoled.background : null,
        surface: selectedBg === "amoled" ? themeConfig.presets.amoled.surface : null
    },
    light: {
        background: themeConfig.presets.light.background,
        surface: themeConfig.presets.light.surface
    },
    accent: {
        primary: (selectedAccent !== "proton_default") ? (themeConfig.presets[selectedAccent]?.primary || themeConfig.presets.aesthetic_purple.primary) : null,
        secondary: (selectedAccent !== "proton_default") ? (themeConfig.presets[selectedAccent]?.secondary || themeConfig.presets.aesthetic_purple.secondary) : null
    }
};

// Function to convert hex to Compose Color format (0xFFRRGGBB)
function toComposeColor(hex) {
    if (!hex) return null;
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

    // --- NEW: Create new files if specified ---
    if (config.newFiles && Array.isArray(config.newFiles)) {
        config.newFiles.forEach(fileDef => {
            const fullPath = path.join(baseDir, fileDef.path);
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            let content = fileDef.content;
            if (fileDef.contentFile) {
                const snippetPath = path.join(__dirname, 'snippets', fileDef.contentFile);
                if (fs.existsSync(snippetPath)) {
                    content = fs.readFileSync(snippetPath, 'utf8');
                } else {
                    console.warn(`   Snippet file not found: ${fileDef.contentFile}`);
                }
            }
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`   Created New File: ${fileDef.path}`);
        });
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
        if (['.kts', '.xml', '.kt', '.gradle', '.java', '.proto', '.properties', '.pro'].includes(ext)) {
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

            // --- A2. Update all source imports and references in source files ---
            if ((ext === '.kt' || ext === '.java') && content.includes(oldPkg)) {
                // R class, databinding, and internal references
                const lines = content.split('\n');
                const patchedLines = lines.map(line => {
                    if (line.trim().startsWith('import ') || line.includes(oldPkg + '.')) {
                        let newLine = line;
                        while (newLine.includes(oldPkg)) {
                            newLine = newLine.replace(oldPkg, newPkg);
                            changed = true;
                        }
                        return newLine;
                    }
                    return line;
                });
                if (changed) {
                    content = patchedLines.join('\n');
                    appliedPatches.add('Source Package Imports');
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
                    // Check if this replacement is restricted to specific files
                    if (rep.files && Array.isArray(rep.files)) {
                        const fileName = path.basename(filePath);
                        const isMatch = rep.files.some(f => filePath.endsWith(f) || fileName === f);
                        if (!isMatch) return;
                    }

                    if (rep.disabled) {
                        console.log(`   [SKIP] ${rep.name || 'Custom Patch'} (Disabled)`);
                        return;
                    }
                    const featureName = rep.name || 'Custom Patch';
                    
                    // Support both single patch and array of patches
                    const patches = rep.patches || [{ target: rep.target, replacement: rep.replacement, replacementFile: rep.replacementFile }];
                    
                    patches.forEach(p => {
                        let target = p.target;
                        let replacement = p.replacement || '';
                        let skipPatch = false;

                        // Load replacement from file if specified
                        if (p.replacementFile) {
                            const snippetPath = path.join(__dirname, 'snippets', p.replacementFile);
                            if (fs.existsSync(snippetPath)) {
                                replacement = fs.readFileSync(snippetPath, 'utf8');
                            } else {
                                console.warn(`   Snippet file not found: ${p.replacementFile}`);
                                skipPatch = true;
                            }
                        }

                        // Resolve dynamic theme variables in replacement
                        if (!skipPatch && replacement.includes('{{theme.')) {
                            const vars = {
                                '{{theme.dark.background}}': toComposeColor(resolvedColors.dark.background),
                                '{{theme.dark.surface}}': toComposeColor(resolvedColors.dark.surface),
                                '{{theme.light.background}}': toComposeColor(resolvedColors.light.background),
                                '{{theme.accent.primary}}': toComposeColor(resolvedColors.accent.primary),
                                '{{theme.accent.secondary}}': toComposeColor(resolvedColors.accent.secondary)
                            };

                            for (const [key, value] of Object.entries(vars)) {
                                if (replacement.includes(key)) {
                                    if (value === null) {
                                        skipPatch = true;
                                        break;
                                    }
                                    replacement = replacement.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
                                }
                            }
                        }

                        if (!skipPatch && content.includes(target)) {
                            content = content.split(target).join(replacement);
                            changed = true;
                            appliedPatches.add(`Feature: ${featureName}`);
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