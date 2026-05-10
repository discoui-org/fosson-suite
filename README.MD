<div align="center">
  <img src="assets/icon.svg" alt="Fosson Suite logo" width="128" />
  <h1>Fosson Suite</h1>
</div>

<p align="center">
  A professional patching and build ecosystem for the Proton application suite. Fosson focuses on removing telemetry and <b>adding an extra layer of love to your privacy</b>—even though Proton is already a legend at it.
</p>

<p align="center">
  <a href="https://github.com/discoui-org/MyProtonSuite/releases">
    <img src="https://img.shields.io/github/v/release/discoui-org/MyProtonSuite?label=Latest%20Build&color=7C4DFF&style=for-the-badge" alt="Latest Build">
  </a>
  <a href="https://github.com/discoui-org/MyProtonSuite">
    <img src="https://img.shields.io/badge/F--Droid-Compatible-3DDC84?style=for-the-badge&logo=android" alt="F-Droid Compatible">
  </a>
  <a href="https://github.com/discoui-org/MyProtonSuite">
    <img src="https://img.shields.io/badge/Privacy-Hardened-000000?style=for-the-badge" alt="Privacy Hardened">
  </a>
</p>

---

## Core Philosophy

### Zero Telemetry Policy
All analytical, tracking, and telemetry services (including Sentry and Firebase Analytics) are stripped or bypassed at the source code level. Your data never leaves your device.

### Coherent User Experience
Visual inconsistencies across the suite have been eliminated. A unified design language based on Material 3 is applied across all applications to ensure a seamless transition between different services.

### Adaptive & Monochrome Icons
Full support for Android 13+ themed icons, ensuring a minimalist and integrated look on your home screen. Powered by a custom Sharp-based icon engine with curated color palettes.

---

## Features

- **Hard-Off Telemetry:** Telemetry classes are hollowed out or bypassed during the patching process.
- **Custom Theming:** Replaces default branding with a vibrant yet professional Material 3 design system.
- **Automated Patching:** Dynamic modification of upstream source code without permanent alteration of the repository.
- **F-Droid Repository:** Self-hosting capability via GitHub Pages for automated updates.
- **CI/CD Integrated:** Full GitHub Actions support for automated builds, signing, and asset management.

---

## Supported Applications

| Application | Status | Version |
| :--- | :---: | :--- |
| **Authenticator** | Active | v1.3.7 |
| **Pass** | Inactive | - |
| **VPN** | Inactive | - |
| **Drive** | Inactive | - |
| **Mail** | Inactive | - |
| **Calendar** | Inactive | - |

---

## Installation

### GitHub Releases
The easiest way to get the applications is to download the pre-built APKs from the [Releases](https://github.com/discoui-org/fosson-suite/releases) page. Each release includes both the patched APKs and the corresponding source code.

### F-Droid Repository
You can add our custom repository to your F-Droid client to receive automatic updates:
1. Copy the repository URL: `https://discoui-org.github.io/fosson-suite/`
2. In F-Droid, go to **Settings > Repositories**.
3. Tap the **+** icon and paste the URL.

---

## Development

### Automated Builds (GitHub Actions)
If you want to build your own version with custom patches:
1. Navigate to the **Actions** tab in your repository.
2. Select the **Build Suite** workflow.
3. Click **Run workflow** and choose your targets.

### Local Environment
*Note: This method requires local setup and specific build scripts not included in the repository.*

```bash
# Install dependencies
npm install

# Generate icons and apply patches
npm run patch -- --app auth

# Build with any flavor you want normally by going cd apps/appname
```

---

## License
This project adheres to the original licenses of the Proton applications ([GPLv3](LICENSE.md)). All patching logic and automation tools provided by Fosson Suite are open-source.

---

<p align="center">
  <i>"The internet is a scary place. ily Proton."</i> <br>
  — Hoax Cherry
</p>
