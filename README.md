<div align="center">

# 🏥 EpiAid

**Offline-first clinical decision support tool for mission/NGO field medical workers**

[![DPGA](https://img.shields.io/badge/DPGA-Under%20Review-blue?style=flat-square)](https://digitalpublicgoods.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed-Cloudflare%20Pages-orange?style=flat-square)](https://epiaid.pages.dev)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20436469.svg)](https://doi.org/10.5281/zenodo.20436469)

**[Live App →](https://epiaid.pages.dev)**

</div>

---

## Overview

**EpiAid** is Module 3 of the [EpiCalc Suite](#epicalc-suite) — a collection of open-source public health tools built for field use. EpiAid provides offline-first clinical decision support for situations where connectivity is unreliable and every second counts.

Designed for **missionaries, NGO field medical workers, and Community Health Workers (CHW)** operating in remote or resource-limited settings. No login. No subscription. No internet required after the first visit.

**Core values:**
- **Offline-first** — fully functional without any network connection
- **Free & open** — MIT licensed, no cost, no ads
- **Instant to use** — no registration, works on any smartphone

---

## Features

### Phase 1 — Available Now

| Feature | Description |
|---------|-------------|
| 💊 **Dosage Calculator** | Weight-based dosing (mg/kg or WHO weight bands) for WHO Essential Medicines |
| 📏 **Nutrition Assessment** | MUAC tape screening + Z-score calculation (SAM/MAM/Normal) |
| 🩺 **Diagnostic Check** | Symptom checklists for Dehydration, Pneumonia, Malaria, and Newborn danger signs (WHO IMCI protocol) |

### Phase 2 — Available Now

| Feature | Description |
|---------|-------------|
| 🗣️ **Phrase Cards** | Key clinical phrases in English / Korean / French / Swahili |
| 📋 **Patient Log** | Offline patient records stored on the device (browser localStorage), with optional password encryption |
| 🌙 **Dark / Light Mode** | Adaptive display for day and night field conditions |
| 🌍 **4-Language UI** | Full interface localization (EN / KR / FR / SW) |

---
## Security

Patient records can be optionally protected with on-device encryption (AES-256-GCM). When enabled:

- A password you choose derives the encryption key (PBKDF2, 310,000 iterations) — it is never sent anywhere or stored in plain form.
- A one-time 16-character recovery code is generated when you enable encryption or change your password. **This code is shown only once and cannot be retrieved later** — write it down and keep it somewhere safe.
- If both the password and the recovery code are lost, encrypted records **cannot be recovered by any means**. The app provides an explicit, confirmation-gated reset that erases the encrypted data and returns the app to an unencrypted state — this is a deliberate security tradeoff (a true backdoor would defeat the purpose of encryption).
- All data stays on the device. Nothing is transmitted to any server at any time, encrypted or not.

---
## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| PWA | Vite PWA Plugin + Workbox (offline precaching) |
| Offline Storage | Browser localStorage (patient records; optional AES-GCM encryption) |
| i18n | i18next (EN / KR / FR / SW) |
| Deployment | Cloudflare Pages |

---

## Performance

Optimized for low-bandwidth environments common in field settings:

| Metric | Value |
|--------|-------|
| App shell (entry script, React and i18n chunks, stylesheet) | about 127 KB (gzip) |
| Full install (22 precached files) | about 543 KiB (uncompressed) |
| Repeat visits | served from the service worker cache; works without a network connection |
| Network needed | first visit only |

Workbox pre-caches the app files on first install (the link-preview image is not cached). Later visits load from the service worker cache. The web fonts (DM Sans) are requested from Google Fonts on the first online visit and cached after that. Figures are from the production build of 2026-11-20 and will change as the app grows.

---

## EpiCalc Suite

EpiAid is part of a broader suite of free, open-source epidemiology and field medicine tools:

| Module | App | URL |
|--------|-----|-----|
| Module 1 | **EpiCalc** — Epidemiology & pharmacology calculator | [epi.chem-health-calc.com](https://epi.chem-health-calc.com) |
| Module 2 | **EpiLog** — Field disease surveillance log | [epilog-d72.pages.dev](https://epilog-d72.pages.dev) |
| Module 3 | **EpiAid** — Clinical decision support *(this app)* | [epiaid.pages.dev](https://epiaid.pages.dev) |

---

## Getting Started

```bash
# Clone
git clone https://github.com/whlee5503-dot/EpiAid.git
cd EpiAid

# Install
npm install

# Develop
npm run dev

# Build
npm run build
```

The PWA build outputs to `dist/`. Deploy directly to Cloudflare Pages, Netlify, or any static host.

---

## Disclaimer

> **EpiAid is a clinical decision-support tool intended to assist — not replace — the judgment of qualified healthcare professionals.**
>
> All dosage calculations, diagnostic checklists, and nutritional assessments are based on WHO/MSF protocols and should always be verified with a qualified clinician before acting on the results. This tool is not a substitute for professional medical advice, diagnosis, or treatment. How each dose and checklist was checked against WHO sources is recorded in [VALIDATION.md](VALIDATION.md).

---

## Developer

**Won Ho Lee, Ph.D., MPH, MDiv**
Public health researcher and field medicine educator.

Built for those who serve where no one else goes.

---

## License

[MIT License](LICENSE) © 2026 Won Ho Lee

Free to use, modify, and distribute. Attribution appreciated.
