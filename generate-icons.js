const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const apps = {
    "Auth": { background: "#DDE1FF", foreground: "#1A237E", scale: .9 },
    "Pass": { background: "#F3E5F5", foreground: "#4A148C", scale: .9 },
    "VPN": { background: "#E0F2F1", foreground: "#004D40", scale: .9 },
    "Drive": { background: "#E8F5E9", foreground: "#1B5E20", scale: .9 },
    "Mail": { background: "#FFEBEE", foreground: "#B71C1C", scale: .9 },
    "Calendar": { background: "#E3F2FD", foreground: "#0D47A1", scale: .9 }
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
    for (const [appName, config] of Object.entries(apps)) {
        if (targetApp && appName !== targetApp) continue;

        const svgPath = path.join(ICONS_DIR, `${appName}.svg`);
        if (!fs.existsSync(svgPath)) continue;

        const patchJsonPath = path.join(PATCHES_DIR, `${appName}.json`);
        if (!fs.existsSync(patchJsonPath)) continue;
        const appPath = JSON.parse(fs.readFileSync(patchJsonPath, 'utf8')).appPath;
        const resDir = path.join(__dirname, appPath, 'app/src/main/res');

        const drawableDir = path.join(resDir, 'drawable');
        const mipmapDir = path.join(resDir, 'mipmap-anydpi-v26');
        [drawableDir, mipmapDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

        // CLEANUP
        [drawableDir, mipmapDir].forEach(dir => {
            if (fs.existsSync(dir)) {
                fs.readdirSync(dir).forEach(file => {
                    if (file.startsWith('fosson_ic_launcher')) fs.unlinkSync(path.join(dir, file));
                });
            }
        });

        const size = 432;
        const scaleMultiplier = config.scale || 1.0;
        const svgBuffer = fs.readFileSync(svgPath);
        let svgContent = svgBuffer.toString();

        // TINT LOGIC
        svgContent = svgContent.replace(/fill=["']#[0-9a-fA-F]{3,6}["']/gi, '');
        svgContent = svgContent.replace(/fill=["']none["']/gi, '');
        svgContent = svgContent.replace(/<svg/i, `<svg fill="${config.foreground}"`);

        // 1. Background PNG
        await sharp({
            create: {
                width: size, height: size, channels: 4, background: config.background
            }
        }).png().toFile(path.join(drawableDir, 'fosson_ic_launcher_background.png'));

        // 2. Foreground PNG (Apply scale multiplier)
        const baseForegroundSize = 288; // 72dp
        const finalForegroundSize = Math.round(baseForegroundSize * scaleMultiplier);

        const renderedSvg = await sharp(Buffer.from(svgContent))
            .resize(finalForegroundSize, finalForegroundSize)
            .toBuffer();

        await sharp({
            create: {
                width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
            .composite([{ input: renderedSvg, gravity: 'center' }])
            .png()
            .toFile(path.join(drawableDir, 'fosson_ic_launcher_foreground.png'));

        // 3. Monochrome Vector XML (Apply scale multiplier)
        const pathRegex = /<path[^>]*d=["']([^"']+)["'][^>]*>/gi;
        let match;
        const paths = [];
        while ((match = pathRegex.exec(svgContent)) !== null) paths.push(match[1]);

        const viewBoxMatch = svgContent.match(/viewBox=["'][\s]*([\d\.]+)[\s]+([\d\.]+)[\s]+([\d\.]+)[\s]+([\d\.]+)["']/i);
        const vW = viewBoxMatch ? parseFloat(viewBoxMatch[3]) : 24;
        const vH = viewBoxMatch ? parseFloat(viewBoxMatch[4]) : 24;

        const baseScale = Math.min(72 / vW, 72 / vH);
        const finalScale = baseScale * scaleMultiplier;
        const translateX = (108 - (vW * finalScale)) / 2;
        const translateY = (108 - (vH * finalScale)) / 2;

        const monoXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <group android:scaleX="${finalScale.toFixed(4)}" android:scaleY="${finalScale.toFixed(4)}"
           android:translateX="${translateX.toFixed(4)}" android:translateY="${translateY.toFixed(4)}">
        ${paths.map(p => `<path android:fillColor="#000000" android:pathData="${p}" />`).join('\n        ')}
    </group>
</vector>`;
        fs.writeFileSync(path.join(drawableDir, 'fosson_ic_launcher_monochrome.xml'), monoXml);

        // 4. Launcher XML
        const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/fosson_ic_launcher_background" />
    <foreground android:drawable="@drawable/fosson_ic_launcher_foreground" />
    <monochrome android:drawable="@drawable/fosson_ic_launcher_monochrome" />
</adaptive-icon>`;
        fs.writeFileSync(path.join(mipmapDir, 'fosson_ic_launcher.xml'), adaptiveXml);
        fs.writeFileSync(path.join(mipmapDir, 'fosson_ic_launcher_round.xml'), adaptiveXml);

        console.log(`Generated Icons for ${appName} (Scale: ${scaleMultiplier})`);
    }
}

generate().catch(console.error);
