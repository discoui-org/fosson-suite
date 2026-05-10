const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const apps = {
  "Auth": { background: "#DDE1FF", foreground: "#1A237E" },
  "Pass": { background: "#F3E5F5", foreground: "#4A148C" },
  "VPN": { background: "#E0F2F1", foreground: "#004D40" },
  "Drive": { background: "#E8F5E9", foreground: "#1B5E20" },
  "Mail": { background: "#FFEBEE", foreground: "#B71C1C" },
  "Calendar": { background: "#E3F2FD", foreground: "#0D47A1" }
};

const ICONS_DIR = path.join(__dirname, 'icons');
const PATCHES_DIR = path.join(__dirname, 'patches');

const args = process.argv.slice(2);
let targetApp = null;
const appIndex = args.indexOf('--app');
if (appIndex !== -1 && args[appIndex + 1]) {
    const inputApp = args[appIndex + 1].toLowerCase();
    targetApp = Object.keys(apps).find(a => a.toLowerCase() === inputApp);
}

async function generate() {
    for (const [appName, colors] of Object.entries(apps)) {
        if (targetApp && appName !== targetApp) continue;

        const svgPath = path.join(ICONS_DIR, `${appName}.svg`);
        if (!fs.existsSync(svgPath)) continue;

        // Get app path from its patch JSON
        const patchJsonPath = path.join(PATCHES_DIR, `${appName}.json`);
        if (!fs.existsSync(patchJsonPath)) continue;
        const appPath = JSON.parse(fs.readFileSync(patchJsonPath, 'utf8')).appPath;
        const resDir = path.join(__dirname, appPath, 'app/src/main/res');

        const drawableDir = path.join(resDir, 'drawable');
        const mipmapDir = path.join(resDir, 'mipmap-anydpi-v26');
        [drawableDir, mipmapDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

        // 1. Background PNG (Solid Color)
        // Adaptive icons are 108dp. At xxxhdpi (4x), that's 432px.
        const size = 432;
        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: colors.background
            }
        }).png().toFile(path.join(drawableDir, 'fosson_ic_launcher_background.png'));

        // 2. Foreground PNG (Render SVG)
        // SVG safe zone is 72dp center. 72/108 * 432 = 288px.
        const foregroundSize = 288;
        const svgBuffer = fs.readFileSync(svgPath);
        const renderedSvg = await sharp(svgBuffer)
            .resize(foregroundSize, foregroundSize)
            .tint(colors.foreground)
            .toBuffer();

        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
        .composite([{ input: renderedSvg, gravity: 'center' }])
        .png()
        .toFile(path.join(drawableDir, 'fosson_ic_launcher_foreground.png'));

        // 3. Monochrome Vector (STAY VECTOR for Android 13 theme support)
        const svgContent = svgBuffer.toString();
        const pathRegex = /<path[^>]*d=["']([^"']+)["'][^>]*>/gi;
        let match;
        const paths = [];
        while ((match = pathRegex.exec(svgContent)) !== null) paths.push(match[1]);
        
        const viewBoxMatch = svgContent.match(/viewBox=["'][\s]*([\d\.]+)[\s]+([\d\.]+)[\s]+([\d\.]+)[\s]+([\d\.]+)["']/i);
        const vW = viewBoxMatch ? parseFloat(viewBoxMatch[3]) : 24;
        const vH = viewBoxMatch ? parseFloat(viewBoxMatch[4]) : 24;
        const scale = Math.min(72 / vW, 72 / vH);
        const translateX = (108 - (vW * scale)) / 2;
        const translateY = (108 - (vH * scale)) / 2;

        const monoXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group android:scaleX="${scale.toFixed(4)}" android:scaleY="${scale.toFixed(4)}"
           android:translateX="${translateX.toFixed(4)}" android:translateY="${translateY.toFixed(4)}">
        ${paths.map(p => `<path android:fillColor="#000000" android:pathData="${p}" />`).join('\n        ')}
    </group>
</vector>`;
        fs.writeFileSync(path.join(drawableDir, 'fosson_ic_launcher_monochrome.xml'), monoXml);

        // 4. Adaptive Icon XML
        const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/fosson_ic_launcher_background" />
    <foreground android:drawable="@drawable/fosson_ic_launcher_foreground" />
    <monochrome android:drawable="@drawable/fosson_ic_launcher_monochrome" />
</adaptive-icon>`;
        fs.writeFileSync(path.join(mipmapDir, 'fosson_ic_launcher.xml'), adaptiveXml);
        fs.writeFileSync(path.join(mipmapDir, 'fosson_ic_launcher_round.xml'), adaptiveXml);

        console.log(`[+] Generated Bitmap & Vector Icons for ${appName} directly in app folder`);
    }
}

generate().catch(console.error);
