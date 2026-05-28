<div align="center">

# 🏥 EpiAid

**Offline-first clinical decision support tool for mission/NGO field medical workers**

[![DPGA](https://img.shields.io/badge/DPGA-Under%20Review-blue?style=flat-square)](https://digitalpublicgoods.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed-Cloudflare%20Pages-orange?style=flat-square)](https://epiaid.pages.dev)

**[Live App →](https://epiaid.pages.dev)**

</div>

---

## Overview

**EpiAid** is Module 3 of the [EpiCalc Suite](#epiclac-suite) — a collection of open-source public health tools built for field use. EpiAid provides offline-first clinical decision support for situations where connectivity is unreliable and every second counts.

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
| 💊 **Dosage Calculator** | Weight-based mg/kg dosing for WHO Essential Medicines |
| 📏 **Nutrition Assessment** | MUAC tape screening + Z-score calculation (SAM/MAM/Normal) |
| 🩺 **Diagnostic Check** | Symptom checklists for Dehydration, Pneumonia, Malaria, and Newborn danger signs (WHO IMCI protocol) |

### Phase 2 — Roadmap

| Feature | Description |
|---------|-------------|
| 🗣️ **Phrase Cards** | Key clinical phrases in English / Korean / French / Swahili |
| 📋 **Patient Log** | Offline patient records stored in IndexedDB |
| 🌙 **Dark / Light Mode** | Adaptive display for day and night field conditions |
| 🌍 **4-Language UI** | Full interface localization (EN / KR / FR / SW) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| PWA | Vite PWA Plugin + Workbox (2G/3G optimized) |
| Offline Storage | IndexedDB (patient records) |
| i18n | i18next (EN / KR / FR / SW) |
| Deployment | Cloudflare Pages |

---

## Performance

Optimized for low-bandwidth environments common in field settings:

| Metric | Value |
|--------|-------|
| Initial bundle | ~27 KB (gzip) |
| Repeat visit | 0 KB network (fully cached) |
| Minimum network | 2G supported |
| Install size | < 500 KB total |

Workbox pre-caches all assets on first install. Subsequent visits load entirely from the service worker cache.

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
git clone https://github.com/whlee5503/epiaid.git
cd epiaid

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
> All dosage calculations, diagnostic checklists, and nutritional assessments are based on WHO/MSF protocols and should always be verified with a qualified clinician before acting on the results. This tool is not a substitute for professional medical advice, diagnosis, or treatment.

---

## Developer

**Won Ho Lee, Ph.D., MPH, MDiv**
Public health researcher and field medicine educator.

Built for those who serve where no one else goes.

---

## License

[MIT License](LICENSE) © 2025 Won Ho Lee

Free to use, modify, and distribute. Attribution appreciated.
