// clone.js
const { execa } = require('execa');
const fs = require('fs');
const path = require('path');

const BASE_DIR = 'apps';
const REPOS = [
    { name: 'Mail', url: 'https://github.com/ProtonMail/android-mail.git' },
    { name: 'Calendar', url: 'https://github.com/ProtonMail/android-calendar.git' },
    { name: 'VPN', url: 'https://github.com/ProtonVPN/android-app.git' },
    { name: 'Pass', url: 'https://github.com/protonpass/android-pass.git' },
    { name: 'Auth', url: 'https://github.com/protonpass/android-authenticator.git' },
    { name: 'Drive', url: 'https://github.com/ProtonDriveApps/android-drive.git' }
];

// apps/ klasörünü oluştur
if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR);
}

async function cloneRepo(repo) {
    const targetPath = path.join(BASE_DIR, repo.name);
    const tempDir = path.basename(repo.url, '.git');
    const tempPath = path.join(BASE_DIR, tempDir);

    try {
        console.log(`Cloning ${repo.name} into ${BASE_DIR}/...`);
        
        // Klonlama (apps/ içine)
        await execa('git', ['clone', '--depth', '1', repo.url, tempPath]);
        
        // Klasörü yeniden adlandırma (apps/Mail gibi)
        if (tempDir !== repo.name) {
            fs.renameSync(tempPath, targetPath);
        }
        
        console.log(`SUCCESS: ${repo.name}`);
    } catch (error) {
        console.error(`FAIL: ${repo.name} - ${error.message}`);
    }
}

async function main() {
    console.log('Starting clone process into "apps/" directory...\n');
    
    for (const repo of REPOS) {
        await cloneRepo(repo);
    }
    
    console.log('\nClone process finished.');
}

main();