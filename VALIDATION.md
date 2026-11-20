# EpiAid — Dosing Validation

This document records how every dose in `src/data/drugs.json` was checked against current WHO guidance (and, where WHO is silent, other authoritative sources, clearly labelled).

- **Validation date:** 2026-09-25 (amoxicillin weight bands re-validated against AWaRe 2022, p.152, on 2026-11-17; co-trimoxazole, metronidazole, ciprofloxacin and ceftriaxone doses re-validated against AWaRe 2022 on 2026-11-18; co-trimoxazole lower UTI duration, ciprofloxacin typhoid duration and the ceftriaxone gonorrhoea footnote checked, and two nutrition unit errors in the protocol screens corrected, on 2026-11-19; severe malaria and dengue warning-sign alerts added and the pneumonia, dehydration and newborn classifications updated to WHO criteria in the Diagnostic Check, the vitamin A eye-sign schedule checked, the ORS nasogastric rate added and the artemether-lumefantrine infant formulation wording corrected and the mebendazole pinworm indication clarified, on 2026-11-19; metronidazole amoebiasis and giardiasis separated from the calculated dose, on 2026-11-20)
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
| Pediatric dose | Weight-band table (fixed mg per dose, every 12h); mg/kg is no longer used for the calculation | Oral 80–90 mg/kg/day, given as weight bands (AWaRe 2022, p.152, CAP – mild, children) | ✅ |
| Pediatric max | 1,000 mg/dose (≥20 kg band) | AWaRe p.152: ≥20 kg 500 mg every 8h or 1 g every 12h; Table 50.1 (p.640): maximum daily dose 1.5 g, can be higher for serious bacterial infections | ✅ |
| Weight bands | 3–<6 kg 250 mg; 6–<10 kg 375 mg; 10–<15 kg 500 mg; 15–<20 kg 750 mg; ≥20 kg 1,000 mg (every 12h); below 3 kg: calculation blocked | Identical to AWaRe p.152 oral weight bands; the table starts at 3 kg | ✅ |
| Adult dose | 1 g every 8h (default); 500 mg every 8h for pharyngitis, acute otitis media, mild COPD exacerbation, dental infections (text) | AWaRe 2022, Table 49.1, p.629: lower dose 500 mg every 8h; higher dose 1 g every 8h (acute sinusitis, mild CAP). Mild CAP first choice 1 g every 8h, p.150 | ✅ / 📝 (lower-dose indications as text) |
| Duration | Children, pneumonia: 3 days (low HIV prevalence, no chest indrawing) or 5 days (high HIV prevalence, chest indrawing). Adults, mild CAP: 5 days. Other indications: see AWaRe book | AWaRe 2022, p.152 (children) and p.150 (adults) | ✅ (pneumonia) / ⏳ (otitis media, sinusitis) |
| UTI, skin infections | Removed | Not AWaRe first choices | ✅ |

**Correction (2026-11-17).** The earlier weight-band note listed 125 mg for 3–<6 kg, 250 mg for 6–<10 kg and "20–<30 kg 1,000 mg; ≥30 kg adult dose". These values came from the November 2021 draft and do not match the final book (p.152: 250 mg, 375 mg, and ≥20 kg 500 mg every 8h or 1 g every 12h). In addition, the calculator multiplied 40 mg/kg while displaying the band note, so the screen could show two different doses. The calculation now uses the weight-band table (`weightBands` in `drugs.json`) and weights below 3 kg are blocked. Tests: `src/lib/dosage.test.ts` (band boundaries 3, 5.9, 6, 9.9, 10, 14.9, 15, 19.9, 20 and 45 kg, and the 2.9 kg block).

**Correction (2026-11-17, adult dose and duration).** The adult calculation used 500 mg every 8h, but AWaRe Table 49.1 (p.629) lists 1 g every 8h for acute sinusitis and mild CAP (p.150) and 500 mg every 8h only for pharyngitis, acute otitis media, mild COPD exacerbation and dental infections. The default is now 1 g every 8h, with the lower-dose indications listed as text. The `duration` field described only the paediatric pneumonia criteria (p.152) and is now split by age group (adult mild CAP: 5 days, p.150). The paediatric weight-band table (Table 50.1, p.640) applies to all oral indications; WHO states a maximum daily dose of 1.5 g that can be higher in serious bacterial infections.

**Revision (2026-11-18, other drugs and tablet rounding; gonorrhoea footnote checked 2026-11-19).** Co-trimoxazole (p.651), ciprofloxacin (p.646) and metronidazole (p.649) now use the AWaRe 2022 paediatric weight-band tables (Table 50.1) instead of mg/kg, and weights below 3 kg are blocked, as for amoxicillin. Metronidazole's adult default was raised from 400 mg to 500 mg every 8h (Table 49.1, p.636). Ceftriaxone's paediatric maximum was raised from 2 g to 3 g per day to match Table 50.1 (p.645); the earlier 2 g came from product labelling. The Pocket Book (2013) allows 4 g/day in meningitis, so both values are shown in the note. The ceftriaxone gonorrhoea single dose (1 g IM, WHO 2024) was not changed: AWaRe 2022 Table 49.1 (p.633) lists 250 mg, and its footnote (a) (p.638) only states that WHO guidelines for sexually transmitted infections are being revised and that the WHO website should be checked for updates. The AWaRe gonococcal infection chapter (p.244) also notes that 500 mg or 1 g ceftriaxone IM is recommended in some international guidelines. The 1 g dose follows the 2024 WHO revision, so no change was needed. Separately, tablet counts are no longer shown when rounding to the nearest half tablet changes the dose by more than 10% (for example, 375 mg on a 500 mg tablet); the mg dose is still shown and a liquid form should be used.

**Revision (2026-11-19, co-trimoxazole UTI duration).** The co-trimoxazole `duration` text said "5 to 10 days", which did not match AWaRe 2022 (chapter 23, lower urinary tract infection). AWaRe lists sulfamethoxazole+trimethoprim 800 mg+160 mg every 12h for 3 days in adults, with the note that longer treatment is usually considered in pregnancy (usually 5 days) and in men (usually 7 days); for children (p.283) the duration is also 3 days. The text now gives these values by group, and the adult dose (960 mg every 12h) was confirmed. The AWaRe pages also state that resistance is high in many settings and that the drug is not active against most ESBL-producing isolates, and they name nitrofurantoin as the preferred option for acute lower UTI. Durations for other indications (for example infectious diarrhoea) were not checked, and the text refers to the AWaRe book.

**Revision (2026-11-19, ciprofloxacin typhoid duration).** The ciprofloxacin `duration` text said only "typhoid: per local resistance". AWaRe 2022 chapter 15 (enteric fever; adults p.186, children p.187) gives 7 days for mild and 10 days for severe cases, if there is clinical improvement and the patient is afebrile for 48 hours, with ciprofloxacin 500 mg every 12h (children 15 mg/kg every 12h, using the same weight bands as Table 50.1) when the risk of fluoroquinolone resistance is low. When that risk is high, AWaRe uses azithromycin for mild cases and ceftriaxone for severe cases instead. The adult dose and the paediatric weight bands were already consistent with AWaRe and were not changed; the duration text now states the durations and names the high-resistance alternatives. The cholera and shigellosis rows were not re-checked in this step.

### 2. Co-trimoxazole

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Pediatric treatment | Weight bands every 12h: 3–<6 kg 120 mg; 6–<10 kg 240 mg; 10–<30 kg 480 mg; ≥30 kg 960 mg (SMX+TMP; `weightBands`); blocked below 3 kg; max daily 1200 mg SMX component (note) | AWaRe 2022, Table 50.1, p.651 | ✅ |
| Adult treatment | 960 mg every 12h; lower UTI duration 3 days (usually 5 days in pregnancy, 7 days in men); children 3 days (`duration` text) | AWaRe 2022, chapter 23 lower UTI (children p.283) | ✅ (duration corrected 2026-11-19) |
| HIV prophylaxis, adult | 960 mg once daily | WHO 2014 CPT supplement §5.2.3 | ✅ |
| HIV prophylaxis, pediatric | Weight/age bands (note) | WHO 2006 / 2014 CPT guidance | ✅ |
| Neonates | Contraindicated <4 weeks | CPT starts at 4–6 weeks | ✅ |
| Pregnancy | CPT continues regardless of stage (note) | WHO 2014 §5.2.2 | ✅ |

### 3. Metronidazole

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Pediatric dose | Weight bands every 8h: 3–<6 kg 30 mg; 6–<10 kg 50 mg; 10–<15 kg 100 mg; 15–<20 kg 150 mg; 20–<30 kg 200 mg; ≥30 kg 500 mg (`weightBands`); blocked below 3 kg; 7.5 mg/kg and max 1 g/day in note | AWaRe 2022, Table 50.1, p.649 | ✅ |
| Adult dose | 500 mg every 8h (default); 750 mg every 8h amoebic abscess; 500 mg every 12h trichomoniasis; single doses (text) | AWaRe 2022, Table 49.1, p.636 | ✅ |
| Amoebiasis / giardiasis doses | Removed from the indication list; the note says the calculated dose does not apply and lists the WHO Pocket Book (2013, 10 mg/kg three times daily) and MSF regimens | WHO Pocket Book 2013, annex 2; MSF Essential Drugs (metronidazole oral); sources differ; AWaRe 2022 not checked for these two indications | ⏳ (Phase 2) |
| C. difficile | Alternative, non-severe only | IDSA/SHEA 2017/2021 (non-WHO) prefer vancomycin/fidaxomicin | ✅ (non-WHO source) |
| 1st trimester | Caution (not contraindication) | No WHO absolute contraindication found | ✅ |

### 4. ORS (low-osmolarity)

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Plan A | <2y 50–100 ml; 2–10y 100–200 ml; older as much as wanted | Pocket Book 2013, Chart 15 | ✅ |
| Plan B | 75 ml/kg over 4h | *The treatment of diarrhoea* 2005 | ✅ |
| Plan C | IV first; if IV is impossible, children can receive ORS by nasogastric tube (or by mouth) at 20 mL/kg/hour for 6 hours (total 120 mL/kg), reassessed every 1 to 2 hours, slower if repeated vomiting or abdominal distension (text only; not applied to adults) | WHO IMCI chart booklet 2019, Plan C | ✅ |
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
| Eye signs | Day 1, 2 and again 2 to 4 weeks later (the app uses day 14) | WHO measles guidance (third dose 2 to 4 weeks later if eye signs are present); Community Eye Health 2013 (day 1, 2 and 14); MSF Medical Guidelines (day 1, 2 and 8 or 15). The primary WHO guide on vitamin A supplements (1997) was not retrieved, so the schedule was checked against these WHO-derived sources | ⏳ (primary document) |
| SAM | No high dose on fortified F-75/F-100/RUTF | WHO SAM guideline 2013, rec. 4.2–4.3 | ✅ |
| Pregnancy | ≤10,000 IU/day or ≤25,000 IU/week; >25,000 IU single dose contraindicated | WHO 2011 | ✅ |
| Postpartum | Not recommended (note) | WHO 2011 | ✅ |

### 7. Mebendazole

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Preventive chemotherapy | 500 mg single dose, ≥1 year | WHO STH guideline 2017 | ✅ |
| Pregnancy | Contraindicated in 1st trimester | WHO 2017 (after 1st trimester only) | ✅ |
| Pinworm | Removed from the indication list; note gives 100 mg once, repeated after 2 weeks | CDC pinworm clinical overview; manufacturer labeling (WHO Model Formulary 2008 not retrieved) | ⏳ |

### 8. Artemether-lumefantrine

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Weight bands (20/120 mg) | 5–<15 kg 1; 15–<25 kg 2; 25–<35 kg 3; ≥35 kg 4 tabs | WHO malaria guidelines | ✅ |
| Schedule | 0, 8, 24, 36, 48, 60h | Same | ✅ |
| 1st trimester | Preferred treatment | WHO update 25 Nov 2022 (strong recommendation) | ✅ |
| Infants 2–<5 kg | Infant formulation Coartem Baby (dispersible tablets of 2.5/30 mg); 2 tablets (5/60 mg) twice daily for 3 days as studied in CALINA (note only; the app still blocks the calculation under 5 kg) | WHO malaria guidelines, version 10 Sept 2026; Swissmedic approval (July 2025) and WHO prequalification of Coartem Baby; CALINA phase 2/3 study (PMC12590907) | ✅ (dose taken from the CALINA study; the product label was not read) |
| 40/240 mg tablet | Halve tablet count (note); calculator does not compute AL tablet counts | Product label | ✅ |

### 9. Ciprofloxacin

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Pediatric oral dose | Weight bands every 12h: 3–<6 kg 50 mg; 6–<10 kg 100 mg; 10–<15 kg 150 mg; 15–<20 kg 200 mg; 20–<30 kg 300 mg; ≥30 kg 500 mg (`weightBands`); blocked below 3 kg; WHO max 1.5 g/day (note) | AWaRe 2022, Table 50.1, p.646 | ✅ |
| Shigellosis, child | 15 mg/kg every 12h, 3 days | WHO shigellosis guideline 2005 | ✅ |
| Cholera, adult | 1 g single dose (alternative) | GTFCC 2022, Table 1 | ✅ |
| Cholera, child | 20 mg/kg single dose, max 1 g (text) | GTFCC 2022, Table 1 | 📝 |
| Cholera first-line | Doxycycline (note) | GTFCC 2022 | ✅ |
| Typhoid (enteric fever) | Low fluoroquinolone resistance: 500 mg every 12h (adult), weight bands (child); 7 days mild, 10 days severe if improved and afebrile for 48 h (`duration` text); azithromycin or ceftriaxone named for high-resistance areas | AWaRe 2022, chapter 15 (adults p.186, children p.187) | ✅ (duration added 2026-11-19) |

### 10. Ceftriaxone

| Item | App value | WHO reference | Status |
|---|---|---|---|
| Severe pneumonia / sepsis | 80 mg/kg once daily, max 3 g | AWaRe 2022, Table 50.1, p.645 | ✅ |
| Meningitis | 100 mg/kg once daily, max 3 g (text); the Pocket Book allows up to 4 g/day | AWaRe 2022, Table 50.1, p.645; Pocket Book 2013, Annex 2 | 📝 |
| Neonates | Contraindicated: premature up to 41 weeks PMA, hyperbilirubinaemia, IV calcium | WHOPAR labelling | ✅ |
| Gonorrhea | 1 g IM single dose | WHO STI guidelines 2024 | ✅ |
| Adult dose | 1 g once daily (severe diarrhoea, severe upper UTI) is the calculated default; 2 g once daily (severe CAP, sepsis, bone and joint, intra-abdominal, HAP, severe enteric fever) and meningitis 2 g every 12h are shown as text | AWaRe 2022, Table 49.1, p.633 | ✅ |

## Protocol screens (`protocols.json`)

Checked on 2026-11-19 against the current `drugs.json` and public programme references (FANTA CMAM guidelines 2010; Nutriset product sheets). Two nutrition unit errors were corrected; the other statements that differ from the calculator are queued for review and are not changed yet.

| Protocol | Statement in the protocol screen | Calculator / source | Status |
|---|---|---|---|
| SAM | RUTF 92 g/kg/day | Corrected to about 150-200 kcal/kg/day (one 92 g sachet = 500 kcal); FANTA 2010, Nutriset | ✅ corrected 2026-11-19 |
| MAM | Supplementary food 75 g/kg/day | Corrected to about 75 kcal/kg/day (for example one Plumpy'Sup sachet per day); Nutriset | ✅ corrected 2026-11-19 |
| ARI | Amoxicillin 25 mg/kg twice daily for 5 days (non-severe); 40 mg/kg twice daily and refer (chest indrawing) | Calculator uses AWaRe 2022 weight bands (p.152); duration 3 or 5 days by HIV prevalence and chest indrawing | ⏳ to reconcile |
| AWD / cholera | Ciprofloxacin 1 g single dose | Calculator note: doxycycline first-line, ciprofloxacin or azithromycin alternatives (GTFCC 2022) | ⏳ to reconcile |
| Dysentery | Ceftriaxone 50 mg/kg for 5 days (child) | Calculator: 80 mg/kg, maximum 3 g/day (AWaRe 2022, p.645) | ⏳ to reconcile |
| Dysentery | Metronidazole 30-50 mg/kg/day in 3 doses for 5 days | Calculator: weight bands; amoebiasis dose is a Phase 2 item | ⏳ to reconcile |
| SAM | Amoxicillin 25 mg/kg twice daily for 7 days | SAM-specific source needed (FANTA 2010 lists 50-100 mg/kg/day, three times daily, 7 days) | ⏳ to reconcile |
| SAM | Vitamin A on day 1, 2 and 14 for all SAM | Calculator: 3 doses only with eye signs of deficiency | ⏳ to reconcile |
| Malaria | AL 6 doses over 3 days | Matches calculator | ✅ |
| Dysentery | Ciprofloxacin 500 mg twice daily for 3 days (adult) | Matches calculator | ✅ |

## Diagnostic Check (`DiagnosticCheck.tsx`)

Checked on 2026-11-19 by reading the component logic and the English strings; this was a code and wording review, not clinical testing. The four checklists had no validation record before this date. `protocols.json` is not imported by any component, so the Protocol screens table above applies to repository data only.

| Tab | Logic in the app | Reference checked | Status |
|---|---|---|---|
| Malaria / dengue | Any cerebral sign (confusion, seizures) now gives a red "Possible Severe Malaria" result with urgent referral and parenteral artesunate; any bleeding sign gives a red "Dengue with Warning Signs" result with hospital referral. Other results still compare the share of ticked signs. | WHO severe malaria criteria (impaired consciousness, medical emergency, no delay for tests); WHO 2009 dengue warning signs (mucosal bleeding) | ✅ alerts added 2026-11-19; ⏳ the "likelihood" bars and share-based result are not validated |
| Dehydration | WHO IMCI signs. Severe: lethargic or unconscious, or not able to drink (either one alone, kept as a general danger sign), or two or more of lethargic or unconscious, not able to drink, sunken eyes, skin pinch very slowly. Some: two or more of restless or irritable, sunken eyes, drinks eagerly, skin pinch slowly. Diarrhoea and vomiting no longer count as signs. Some dehydration: ORS 75 mL/kg over 4 h in small frequent sips, reassess after 4 h | WHO IMCI chart booklet (classification of dehydration; Plan B: ORS 75 mL/kg over 4 h, reassess after 4 h) and WHO Pocket Book 2013 as reproduced in MSF Medical Guidelines, appendix 14. The earlier "reassess every 30 min" wording was not found in WHO Plan B; "reassess every 1 to 2 hours" belongs to Plan C (IV fluids) | ✅ classification updated; Swahili text still to be checked |
| Pneumonia | Age in months and respiratory rate (thresholds 60 below 2 months, 50 for 2 to 11 months, 40 for 12 to 59 months); chest indrawing or fast breathing without a general danger sign gives "Pneumonia" (oral amoxicillin); a general danger sign (not able to drink or breastfeed, vomits everything, convulsions, lethargic or unconscious, stridor at rest, central cyanosis) gives "Severe Pneumonia" with urgent referral; under 2 months, fast breathing or chest indrawing also gives "Severe Pneumonia"; age 60 months or more is out of range | Revised on 2026-11-19 to the WHO 2014 pneumonia classification and the WHO 2024 guideline: chest indrawing without general danger signs is outpatient pneumonia, consistent with AWaRe 2022 p.152, and HIV-positive children with chest indrawing are referred. Respiratory-rate thresholds (60, 50, 40) match WHO IMCI. Under 2 months follows WHO guidance on possible serious bacterial infection (refer to hospital) | ✅ classification updated; the 48 h reassessment wording and the Swahili text are still to be checked |
| Newborn | Any danger sign (not able to feed, convulsions, fast breathing, severe chest indrawing, fever, hypothermia, yellow palms and soles or jaundice in the first 24 hours, decreased or absent movement) gives a red "URGENT REFERRAL"; otherwise a red umbilicus or eye discharge gives a yellow "Local Infection" (oral amoxicillin for 5 days, home care, follow up in 2 days, refer if worse); no sign gives "No danger signs detected" | WHO IMCI sick young infant chart booklet (2019) and WHO 2024 recommendations on serious bacterial infection in infants 0 to 59 days: signs of possible serious bacterial infection, local bacterial infection treated with amoxicillin for 5 days, severe jaundice. The fever threshold was changed from 37.5 to 38 degrees C to match the current WHO criteria; fast breathing is 60 breaths per minute or more. National charts differ on whether a red umbilicus that spreads to the skin is local or serious infection; the app advises referral if redness spreads. The tab is labelled 0 to 28 days while the WHO chart covers 0 to 59 days | ✅ classification updated; skin pustules are not asked separately and the Swahili text is still to be checked |

The French and Korean texts for the new malaria and dengue messages were checked on screen. The Swahili texts were written without native review and should be checked by a Swahili-speaking clinician before relying on them.

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

`src/lib/dosage.test.ts` (Vitest, `npm test`) checks the WHO reference doses, maximum-dose caps, vial/tablet rounding, age-group doses and every safety rule above (83 tests). Any change to `drugs.json` must keep these tests passing.

## Known limitations

1. **One calculated dose per population.** Indication-specific doses (ceftriaxone meningitis, cholera single doses, metronidazole by indication) are shown as dosing guidance text next to the calculated default dose. A future version will let the user choose the indication so each is calculated.  Example: adult amoxicillin is 500 mg every 8h for otitis media but 1 g every 8h for pneumonia and sinusitis (AWaRe 2022, p.629); the calculator uses 1 g.
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