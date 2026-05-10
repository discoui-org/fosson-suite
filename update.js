// update.js
const { execa } = require('execa');
const fs = require('fs');
const path = require('path');

const BASE_DIR = 'apps';
const APPS = ['Mail', 'Calendar', 'VPN', 'Pass', 'Auth', 'Drive'];

async function updateApp(appName) {
    const appPath = path.join(BASE_DIR, appName);

    console.log(`Updating ${appName}...`);

    // Klasör var mı kontrol et
    if (!fs.existsSync(appPath)) {
        console.error(`SKIP: ${appName} - Folder not found in ${BASE_DIR}/.`);
        return;
    }

    // .git klasörü var mı kontrol et
    const gitPath = path.join(appPath, '.git');
    if (!fs.existsSync(gitPath)) {
        console.error(`SKIP: ${appName} - Not a git repository.`);
        return;
    }

    try {
        // Git pull komutu
        await execa('git', ['pull', '--rebase'], { cwd: appPath });
        console.log(`SUCCESS: ${appName} updated.`);
    } catch (error) {
        console.error(`FAIL: ${appName} - ${error.message}`);
    }
}

async function main() {
    console.log('Starting update process for apps in "apps/" directory...\n');

    for (const app of APPS) {
        await updateApp(app);
    }

    console.log('\nUpdate process finished.');
}

main();