// build.js
const { execa } = require('execa');
const fs = require('fs');
const path = require('path');

const BASE_DIR = 'apps';
const APPS = ['Mail', 'Calendar', 'VPN', 'Pass', 'Auth', 'Drive'];
const LOG_DIR = 'build_logs';

// Log klasörünü oluştur
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

async function buildApp(appName) {
    const appPath = path.join(BASE_DIR, appName);
    const logFilePath = path.join(LOG_DIR, `build_${appName}.log`);

    console.log(`Building ${appName}... (Logs: ${logFilePath})`);

    if (!fs.existsSync(appPath)) {
        const error = `Folder '${appName}' not found in ${BASE_DIR}/.`;
        console.error(`FAIL: ${appName} - ${error}`);
        fs.writeFileSync(logFilePath, `ERROR: ${error}\n`);
        return;
    }

    try {
        // --no-daemon KALDIRILDI. Daemon açık kalacak, sonraki build'ler hızlanacak.
        const subprocess = execa('bash', ['-c', './gradlew assembleDebug'], {
            cwd: appPath,
            stdout: 'pipe',
            stderr: 'pipe'
        });

        const writer = fs.createWriteStream(logFilePath, { flags: 'a' });
        subprocess.stdout.pipe(writer);
        subprocess.stderr.pipe(writer);

        await subprocess;

        console.log(`SUCCESS: ${appName} built successfully.`);
        fs.appendFileSync(logFilePath, `\n--- BUILD SUCCESSFUL ---\n`);

    } catch (error) {
        console.error(`FAIL: ${appName} build failed. Check ${logFilePath}`);
        fs.appendFileSync(logFilePath, `\n--- BUILD FAILED ---\nError: ${error.message}\n`);
    }
}

async function main() {
    console.log('Starting build process for apps in "apps/" directory...\n');

    for (const app of APPS) {
        await buildApp(app);
    }

    console.log('\nAll builds finished. Check \'build_logs\' folder.');
}

main();