# EpiAid — Dosing Validation

This document records how every dose in `src/data/drugs.json` was checked against current WHO guidance (and, where WHO is silent, other authoritative sources, clearly labelled).

- **Validation date:** 2026-09-25
- **Data version:** Phase 2a/2b (flat schema + age groups, pregnancy status and data-driven safety rules)
- **Scope:** 10 drugs — amoxicillin, co-trimoxazole, metronidazole, ORS, zinc, vitamin A, mebendazole, artemether-lumefantrine, ciprofloxacin, ceftriaxone

> **Disclaimer.** EpiAid is a decision-support tool, not clinical guidance. National treatment guidelines and local antimicrobial resistance data take precedence.

## Status key

| Status | Meaning |
|---|---|
| ✅ Verified | App value matches the cited WHO source |
| 📝 Note only | Indication-specific dose shown as text; the calculator uses the default indication (Phase 2 will calculate it) |
| ⏳ Pending | Figure not yet confirmed in the primary document; not used in calculations |

## Summary of Phase 1 corrections

| Drug | Before | After | Source |
|---|---|---|---|
| Amoxicillin | 25 mg/kg every 8h, max 500 mg/dose | 40 mg/kg every 12h, max 1,000 mg/dose | WHO 2014 pneumonia revision; WHO AWaRe Antibiotic Book 2022 |
| Co-trimoxazole | HIV prophylaxis 480 mg/day (adult) | 960 mg once daily | WHO 2014 CPT supplement §5.2.3 |
| Co-trimoxazole | Shigellosis, "malaria prophylaxis" listed | Removed | WHO shigellosis guideline 2005; WHO 2014 CPT supplement |
| Vitamin A | Adult 200,000 IU, no pregnancy warning | Pregnancy: ≤10,000 IU/day or ≤25,000 IU/week; single dose >25,000 IU contraindicated | WHO vitamin A in pregnancy guideline 2011 |
| Vitamin A | SAM: day 1, 2, 14 for all | No high dose on WHO-standard F-75/F-100/RUTF | WHO SAM guideline 2013 (rec. 4.2–4.3) |
| Artemether-lumefantrine | 1st trimester and <5 kg contraindicated | Preferred in all trimesters; infant formulation for 2–<5 kg | WHO malaria guidelines (update 25 Nov 2022; version 10 Sept 2026) |
| Ciprofloxacin | Default cholera antibiotic | Alternative to doxycycline; child 20 mg/kg single dose | GTFCC technical note, rev. Oct 2022 |
| Ceftriaxone | 50 mg/kg, no neonatal contraindications | 80 mg/kg once daily; neonatal contraindications added | WHO Pocket Book 2013, Annex 2; WHOPAR labelling |
| Ceftriaxone | Gonorrhea 1–2 g every 12–24h | 1 g IM single dose | WHO STI guidelines 2024 |
| Zinc | Adult 20 mg/day; "malnutrition prevention" | Not recommended for adults; indication removed | WHO/UNICEF joint statement 2004; WHO SAM guideline 2013 |
| ORS | Severe dehydration listed as contraindication | IV first; nasogastric ORS if IV unavailable | WHO *The treatment of diarrhoea* 2005 |

## Per-drug validation

### 1. Amoxicillin

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Pediatric dose | 40 mg/kg every 12h | ≥40 mg/kg/dose twice daily (WHO 2014 pneumonia revision) | ✅ |
| Pediatric max | 1,000 mg/dose | AWaRe weight bands reach 1,000 mg at 20–<30 kg | ✅ |
| Weight bands | Note | 3–<6 kg 125 mg; 6–<10 kg 250 mg; 10–<15 kg 500 mg; 15–<20 kg 750 mg; 20–<30 kg 1,000 mg (AWaRe) | ✅ |
| Adult dose | 500 mg every 8h (pneumonia 1 g every 8h as text) | AWaRe: CAP 1 g every 8h; otitis media 500 mg every 8h | 📝 / ⏳ (CAP page) |
| Duration | 5 days | 5 days; 3 days for fast-breathing pneumonia in low-HIV settings | ✅ |
| UTI, skin infections | Removed | Not AWaRe first choices | ✅ |

### 2. Co-trimoxazole

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Pediatric treatment | 24 mg/kg (4 mg TMP/kg) every 12h | Pocket Book 2013, Annex 2 | ✅ |
| Adult treatment | 960 mg every 12h | AWaRe (lower UTI) | ✅ (duration ⏳) |
| HIV prophylaxis, adult | 960 mg once daily | WHO 2014 CPT supplement §5.2.3 | ✅ |
| HIV prophylaxis, pediatric | Weight/age bands (note) | WHO 2006 / 2014 CPT guidance | ✅ |
| Neonates | Contraindicated <4 weeks | CPT starts at 4–6 weeks | ✅ |
| Pregnancy | CPT continues regardless of stage (note) | WHO 2014 §5.2.2 | ✅ |

### 3. Metronidazole

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Pediatric dose | 7.5 mg/kg every 8h, max 500 mg | Pocket Book 2013 | ✅ |
| Amoebiasis / giardiasis doses | Same as default | Indication-specific doses | ⏳ (Phase 2) |
| C. difficile | Alternative, non-severe only | IDSA/SHEA 2017/2021 (non-WHO) prefer vancomycin/fidaxomicin | ✅ (non-WHO source) |
| 1st trimester | Caution (not contraindication) | No WHO absolute contraindication found | ✅ |

### 4. ORS (low-osmolarity)

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Plan A | <2y 50–100 ml; 2–10y 100–200 ml; older as much as wanted | Pocket Book 2013, Chart 15 | ✅ |
| Plan B | 75 ml/kg over 4h | *The treatment of diarrhoea* 2005 | ✅ |
| Plan C | IV first; NG ORS if IV impossible (text) | Same | ✅ (NG rate ⏳) |
| Composition | 245 mOsm/L | WHO/UNICEF 2004 | ✅ |
| SAM | Use ReSoMal (note) | WHO SAM guideline 2013 | ✅ |

### 5. Zinc sulfate

| Item | App value | WHO reference | Status |
|---|---|---|---|
| <6 months | 10 mg/day, 10–14 days | WHO/UNICEF 2004 | ✅ |
| ≥6 months | 20 mg/day, 10–14 days | WHO/UNICEF 2004 | ✅ |
| Adults | Not recommended | No WHO indication | ✅ |

### 6. Vitamin A

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Age doses | <6 mo 50,000; 6–11 mo 100,000; ≥12 mo 200,000 IU | WHO 2011 | ✅ |
| Measles | Day 1 and 2 | WHO measles guidance | ✅ |
| Eye signs | Day 1, 2 and 14 | WHO xerophthalmia guidance | ⏳ (primary document) |
| SAM | No high dose on fortified F-75/F-100/RUTF | WHO SAM guideline 2013, rec. 4.2–4.3 | ✅ |
| Pregnancy | ≤10,000 IU/day or ≤25,000 IU/week; >25,000 IU single dose contraindicated | WHO 2011 | ✅ |
| Postpartum | Not recommended (note) | WHO 2011 | ✅ |

### 7. Mebendazole

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Preventive chemotherapy | 500 mg single dose, ≥1 year | WHO STH guideline 2017 | ✅ |
| Pregnancy | Contraindicated in 1st trimester | WHO 2017 (after 1st trimester only) | ✅ |
| Pinworm | Repeat after 2 weeks (text, no dose) | WHO Model Formulary 2008 | ⏳ |

### 8. Artemether-lumefantrine

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Weight bands (20/120 mg) | 5–<15 kg 1; 15–<25 kg 2; 25–<35 kg 3; ≥35 kg 4 tabs | WHO malaria guidelines | ✅ |
| Schedule | 0, 8, 24, 36, 48, 60h | Same | ✅ |
| 1st trimester | Preferred treatment | WHO update 25 Nov 2022 (strong recommendation) | ✅ |
| Infants 2–<5 kg | Infant formulation 5/60 mg (note) | WHO malaria guidelines, version 10 Sept 2026 | ✅ (per-dose schedule ⏳) |
| 40/240 mg tablet | Halve tablet count (note); calculator does not compute AL tablet counts | Product label | ✅ |

### 9. Ciprofloxacin

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Shigellosis, child | 15 mg/kg every 12h, 3 days | WHO shigellosis guideline 2005 | ✅ |
| Cholera, adult | 1 g single dose (alternative) | GTFCC 2022, Table 1 | ✅ |
| Cholera, child | 20 mg/kg single dose, max 1 g (text) | GTFCC 2022, Table 1 | 📝 |
| Cholera first-line | Doxycycline (note) | GTFCC 2022 | ✅ |
| Typhoid | Only where resistance is low (note) | AWaRe 2022 | ⏳ (doses) |

### 10. Ceftriaxone

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Severe pneumonia / sepsis | 80 mg/kg once daily, max 2 g | Pocket Book 2013, Annex 2 | ✅ |
| Meningitis | 100 mg/kg/day or 50 mg/kg every 12h, max 4 g (text) | Pocket Book 2013, Annex 2 | 📝 |
| Neonates | Contraindicated: premature up to 41 weeks PMA, hyperbilirubinaemia, IV calcium | WHOPAR labelling | ✅ |
| Gonorrhea | 1 g IM single dose | WHO STI guidelines 2024 | ✅ |
| Adult severe infections | 1–2 g once daily | AWaRe 2022 | ⏳ (meningitis dose) |

## Patient context and safety rules

The calculator asks for an **age group** and, for patients aged 12 and older, **pregnancy status** (not pregnant / pregnant / unknown). Age groups follow the WHO age cut-offs used by the drugs in scope:

| Age group | Why this boundary is needed |
|---|---|
| Neonate (< 1 month) | Ceftriaxone neonatal regimen and contraindications; co-trimoxazole not before 4 weeks |
| Infant 1–5 months | Zinc 10 mg; vitamin A 50,000 IU |
| Infant 6–11 months | Zinc 20 mg; vitamin A 100,000 IU; mebendazole not yet allowed |
| Child 1–11 years | Vitamin A 200,000 IU; mebendazole allowed |
| 12 years and older | Adult dosing; pregnancy status asked |

Rules are stored as data in `drugs.json` (`rules[]`, `ageDoses[]`). A **block** rule stops the calculation and shows the reason; a **warn** rule shows an alert next to the calculated dose. Pregnancy status "unknown" is treated as possibly pregnant.

| Drug | Condition | Level | Source |
|---|---|---|---|
| Vitamin A | Age ≥ 12, pregnant or pregnancy unknown | Block (no high-dose capsule) | WHO 2011 |
| Co-trimoxazole | Neonate (< 4 weeks) | Block | WHO 2014 CPT supplement |
| Ceftriaxone | Neonate | Block (neonatal regimen and contraindications shown) | Pocket Book 2013 §3.9; WHOPAR |
| Mebendazole | Under 1 year | Block | WHO STH guideline 2017 |
| Artemether-lumefantrine | Weight < 5 kg | Block (use infant formulation) | WHO malaria guidelines, version 10 Sept 2026 |
| Ciprofloxacin | Pregnant | Warn | GTFCC 2022 |
| Metronidazole | Pregnant | Warn | National formulary (no WHO absolute contraindication) |
| Any mg/kg drug | Neonate | Warn (confirm neonatal dosing) | General precaution |

Fixed doses by age group: zinc (10 mg < 6 months; 20 mg ≥ 6 months) and vitamin A (50,000 / 100,000 / 200,000 IU) are selected automatically from the age group.

## Automated tests

`src/lib/dosage.test.ts` (Vitest, `npm test`) checks the WHO reference doses, maximum-dose caps, vial/tablet rounding, age-group doses and every safety rule above (28 tests). Any change to `drugs.json` must keep these tests passing.

## Known limitations

1. **One calculated dose per population.** Indication-specific doses (ceftriaxone meningitis, cholera single doses, metronidazole by indication) are shown as dosing guidance text next to the calculated default dose. A future version will let the user choose the indication so each is calculated.
2. **Pending items (⏳)** must be page-cited from the primary PDF before they are used in calculations.

## Sources

1. WHO. *Revised WHO Classification and Treatment of Pneumonia in Children at Health Facilities.* 2014.
2. WHO. *The WHO AWaRe (Access, Watch, Reserve) Antibiotic Book.* 2022.
3. WHO. *Pocket Book of Hospital Care for Children,* 2nd ed. 2013.
4. WHO. *Guidelines on Post-Exposure Prophylaxis for HIV and the Use of Co-trimoxazole Prophylaxis* (supplement). Dec 2014.
5. WHO. *Guidelines for the Control of Shigellosis.* 2005.
6. WHO/UNICEF. *Joint Statement: Clinical Management of Acute Diarrhoea.* 2004.
7. WHO. *The Treatment of Diarrhoea: A Manual for Physicians and Other Senior Health Workers,* 4th rev. 2005.
8. WHO. *Guideline: Vitamin A Supplementation in Pregnant Women.* 2011.
9. WHO. *Guideline: Updates on the Management of Severe Acute Malnutrition in Infants and Children.* 2013.
10. WHO. *Guideline: Preventive Chemotherapy to Control Soil-Transmitted Helminth Infections.* 2017.
11. WHO. *WHO Guidelines for Malaria* (update 25 Nov 2022; version 10 Sept 2026).
12. GTFCC. *Technical Note: Use of Antibiotics for the Treatment and Control of Cholera,* rev. Oct 2022.
13. WHO. *Updated Recommendations for the Treatment of N. gonorrhoeae, C. trachomatis and T. pallidum.* 2024.
14. WHO Prequalification. *Ceftriaxone WHOPAR, Part 4 (SmPC).*
15. IDSA/SHEA. *Clinical Practice Guidelines for C. difficile Infection,* 2017; focused update 2021 (non-WHO).