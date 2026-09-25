# EpiAid Dosing Cross-Validation Against WHO Guidance (status as of September 2026)

EpiAid's dose table has five safety-critical errors. It gives 200,000 IU of vitamin A to adults with no pregnancy warning, 480 mg of co-trimoxazole daily for adult HIV prophylaxis, a three-times-daily amoxicillin regimen capped at 500 mg per dose, the outdated day 1/2/14 vitamin A regimen for all children with severe acute malnutrition (SAM), and ciprofloxacin as the default cholera antibiotic. A single dose per drug cannot represent WHO guidance, because WHO doses change with indication, weight band and pregnancy status.

## TL;DR
- **Must fix now:**
  - **Vitamin A:** limit to ≤10,000 IU/day or ≤25,000 IU/week in pregnancy and in women who may be pregnant, and never give a single dose >25,000 IU (WHO 2011).
  - **Co-trimoxazole:** the adult HIV prophylaxis dose is 960 mg once daily (WHO 2014).
  - **Amoxicillin:** children get 40–50 mg/kg/dose twice daily with weight bands up to 1,000 mg per dose (WHO 2014 pneumonia revision; AWaRe).
  - **SAM vitamin A:** no routine high dose if the child is on WHO-standard F-75, F-100 or RUTF (WHO 2013).
  - **Cholera:** doxycycline is first-line; ciprofloxacin is an alternative given as 20 mg/kg (max 1 g) in one dose, not 15 mg/kg every 12 h (GTFCC 2022).
- **Remove or relabel:**
  - Co-trimoxazole for shigellosis: WHO 2005 lists it as inappropriate because of resistance.
  - Co-trimoxazole as standalone "malaria prophylaxis": its malaria benefit exists only within HIV prophylaxis.
  - Zinc for adult diarrhoea and for "malnutrition prevention": WHO has no such indication.
  - Plain amoxicillin as first choice for UTI or skin infections: AWaRe lists other Access antibiotics.
  - The first-trimester contraindication for artemether-lumefantrine (AL): WHO changed this on 25 Nov 2022.
- **Update to 2025–2026 changes:**
  - WHO's malaria guidelines (version of 10 Sept 2026) now include a new AL formulation for infants under 5 kg (Coartem Baby, 2 to <5 kg). The app's "<5 kg contraindicated" rule should become "use the infant formulation."
  - WHO's 2024 gonorrhoea regimen is ceftriaxone 1 g IM as a single dose.

## Key Findings — Prioritized Safety-Critical Corrections

1. **Vitamin A in pregnancy and women of reproductive age (highest risk: teratogenic).**
   - WHO 2011 (pregnant women) allows up to 10,000 IU daily or up to 25,000 IU weekly, and only where vitamin A deficiency is a severe public health problem.
   - A single dose above 25,000 IU is never advised in pregnancy.
   - WHO 2011 (postpartum women) does not recommend postpartum supplementation for preventing maternal or infant illness and death.
   - The app's "adult 200,000 IU single dose" with no pregnancy contraindication is unsafe. Add a hard stop for pregnant or possibly pregnant women.
2. **Co-trimoxazole prophylaxis (CPT), adult dose.**
   - WHO 2014 (§5.2.3) recommends 960 mg once daily. WHO reviewed 480 mg and explicitly kept 960 mg.
   - The app's 480 mg is wrong.
   - Children need weight bands (see table). CPT is not recommended in neonates under 4 weeks; HIV-exposed infants start at 4–6 weeks.
3. **Amoxicillin in children.**
   - WHO 2014 pneumonia revision: 40 mg/kg/dose twice daily (80 mg/kg/day).
   - AWaRe weight bands reach 1,000 mg per dose at 20 to <30 kg.
   - The app's 25 mg/kg every 8 h with a 500 mg cap underdoses heavier children.
4. **Vitamin A in SAM.**
   - WHO 2013 SAM guideline, recommendation 4.2: no high-dose vitamin A if the child is receiving WHO-specification F-75, F-100 or RUTF.
   - Recommendation 4.3: give a single age-based high dose on admission only if the foods are not fortified.
   - The day 1/2/14 regimen now applies only to measles or eye signs of deficiency.
5. **Cholera (ciprofloxacin).**
   - GTFCC technical note (revised Oct 2022): doxycycline first-line for all patients, including pregnant women and children (300 mg single dose in adults; 2–4 mg/kg single dose under 12 years).
   - Alternatives: azithromycin 1 g or 20 mg/kg (max 1 g) as a single dose, or ciprofloxacin 1 g or 20 mg/kg (max 1 g) as a single dose.
   - Antibiotics are for selected patients only: severe dehydration, high purging, failure of the first 4 hours of rehydration, pregnancy, SAM, HIV, or age over 60.
6. **Ceftriaxone in neonates.**
   - Contraindicated in premature neonates up to 41 weeks postmenstrual age and in hyperbilirubinaemic neonates.
   - Must not be given IV to neonates receiving calcium-containing IV solutions (WHO prequalification labelling, WHOPAR).
   - The app lists none of these.
7. **Ceftriaxone for meningitis.**
   - Dose is 100 mg/kg once daily, or 50 mg/kg every 12 h with a maximum single dose of 4 g (Pocket Book 2013, Annex 2).
   - The app's "max 2 g" cap underdoses meningitis.
8. **Artemether-lumefantrine.**
   - Remove the first-trimester contraindication: WHO issued a strong recommendation for AL as first-line in the first trimester on 25 Nov 2022.
   - Replace "<5 kg contraindicated" with the Coartem Baby pathway for 2 to <5 kg.
9. **Co-trimoxazole for shigellosis.** Remove it. WHO 2005 lists it as "inappropriate" because of resistance; first-line is ciprofloxacin 15 mg/kg twice daily for 3 days.
10. **Metronidazole for C. difficile.**
    - Relabel it as an alternative for non-severe disease only.
    - IDSA/SHEA 2017 and the 2021 focused update prefer fidaxomicin or oral vancomycin. Metronidazole 500 mg three times daily for 10 days is reserved for when those are unavailable.

## Details — Per-Drug Reference Tables

Verdict key: **Match**, **Minor difference**, **Must fix**, **No WHO guidance**. The "To verify" flag marks figures I could not open in the primary PDF during this review. Check them before you commit them to VALIDATION.md.

### 1. Amoxicillin (oral)

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Pneumonia, fast breathing | Children 2–59 mo | ≥40 mg/kg/dose (80 mg/kg/day) | Every 12 h | 5 days; 3 days in low-HIV-prevalence areas | Weight band (below) | Chest indrawing without danger signs is also treated with oral amoxicillin for 5 days | WHO *Revised WHO Classification and Treatment of Pneumonia in Children at Health Facilities*, 2014 (evidence chapter, NCBI NBK264159) | 25 mg/kg every 8 h, max 500 mg/dose, 5–7 days | **Must fix** |
| Pneumonia, chest indrawing | Children 2–59 mo | 40 mg/kg/dose | Every 12 h | 5 days | Weight band | Danger signs require referral and injectable antibiotics | Same, 2014 | Same as above | **Must fix** |
| Paediatric weight bands (all AWaRe amoxicillin indications) | Children | 3 to <6 kg: 125 mg; 6 to <10 kg: 250 mg; 10 to <15 kg: 500 mg; 15 to <20 kg: 750 mg; 20 to <30 kg: 1,000 mg; ≥30 kg: adult dose | Every 12 h | Per indication | 1,000 mg/dose in children | — | WHO AWaRe Antibiotic Book (EML Antibiotic Book), 2022; draft of Nov 2021, otitis media/sinusitis tables | Max 500 mg/dose | **Must fix** |
| Community-acquired pneumonia (CAP), mild | Adults | 1 g | Every 8 h | 5 days | 3 g/day | — | AWaRe 2022, "CAP – mild" (To verify page) | 500 mg every 8 h | **Must fix** (underdose) |
| Acute otitis media | Children | 40–50 mg/kg/dose (weight bands above) | Every 12 h | 5 days | — | Most mild cases need no antibiotic. Treat if severe, immunosuppressed, or bilateral under 2 years | AWaRe draft 2021, AOM Table 3 | 25 mg/kg every 8 h | **Must fix** |
| Acute otitis media | Adults | 500 mg | Every 8 h | 5 days | — | Same | AWaRe, AOM Table 3 | 500 mg every 8 h | **Match** (duration 5 days) |
| Acute sinusitis | Adults | 1 g (or amoxicillin-clavulanate 500+125 mg every 8 h) | Every 8 h | 5 days | — | Antibiotics only if severe (≥39 °C with purulent discharge ≥3–4 days), comorbid, or red flags | AWaRe, Sinusitis Table 3 | 500 mg every 8 h | **Must fix** |
| Acute sinusitis | Children | 40–50 mg/kg/dose (weight bands) | Every 12 h | 5 days | — | Same | AWaRe, Sinusitis Table 3 | 25 mg/kg every 8 h | **Must fix** |
| Lower UTI | All | Amoxicillin not listed. Access first choices are nitrofurantoin, co-trimoxazole, trimethoprim, or amoxicillin-clavulanate | — | — | — | — | AWaRe, Table 2 (primary care) | Listed as indication | **Must fix** (remove or relabel as non-first-line) |
| Skin/soft tissue, mild | All | Amoxicillin not listed. Choices are amoxicillin-clavulanate, cefalexin, or cloxacillin | — | — | — | — | AWaRe, Table 2 | Listed as indication | **Must fix** (remove) |

### 2. Co-trimoxazole (sulfamethoxazole + trimethoprim, oral)

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Treatment (UTI and other) | Children | 4 mg/kg TMP + 20 mg/kg SMX (= 24 mg/kg combined) | Every 12 h | Per indication | — | Infants <1 month get a fixed half paediatric tablet or 1.25 ml syrup twice daily. Avoid in premature or jaundiced neonates (wording to verify) | Pocket Book of Hospital Care for Children, 2nd ed., 2013, Annex 2 pp. 360–361 | 24 mg/kg every 12 h, max 960 mg | **Match** (add neonatal rule) |
| Lower UTI | Adults | 960 mg | Every 12 h | 3 days (AWaRe, to verify) | — | Use only where local resistance allows | AWaRe 2022, lower UTI | 960 mg every 12 h, 5–10 days | **Minor difference** (duration) |
| HIV CPT | Adults and adolescents >14 y or >30 kg, including pregnant women | 960 mg (800/160) | Once daily | Long-term; may stop when stable on ART with immune recovery and viral suppression, but continue where malaria or severe bacterial infections are highly prevalent | 960 mg/day | Give regardless of pregnancy stage. Do not add intermittent preventive treatment in pregnancy (IPTp-SP) on top of CPT | WHO *Guidelines on PEP and co-trimoxazole prophylaxis*, Dec 2014 supplement, §5.2, §5.2.2, §5.2.3 | 480 mg once daily | **Must fix** |
| HIV CPT | Children <6 mo or <5 kg | 100/20 mg | Once daily | Until HIV excluded after breastfeeding ends (HIV-exposed) or long-term (living with HIV) | — | Start at 4–6 weeks. Not recommended in neonates <4 weeks (kernicterus concern) | WHO 2006 CPT guideline; 2014 supplement §5.4 and §5.6; WHO consolidated HIV guidelines 2021, Table A1.6 | Not present | **Must fix** (add) |
| HIV CPT | 6 mo–5 y or 5–15 kg | 200/40 mg | Once daily | As above | — | — | Same | Not present | **Must fix** |
| HIV CPT | 6–14 y or 15–30 kg | 400/80 mg | Once daily | As above | — | — | Same | Not present | **Must fix** |
| Shigellosis | All | Not recommended | — | — | — | Listed as "inappropriate" because of resistance | WHO *Guidelines for the control of shigellosis*, 2005 | Listed | **Must fix** (remove) |
| Malaria prophylaxis (standalone) | All | No WHO recommendation outside HIV CPT | — | — | — | — | WHO 2014 CPT supplement (malaria benefit is within CPT only) | Listed | **No WHO guidance** (remove; make it a note under CPT) |
| Pregnancy contraindication | — | WHO recommends CPT regardless of pregnancy stage. WHO's guideline group could not conclude teratogenicity | — | — | — | Folate interaction noted | WHO 2014 §5.2.2 | 1st and 3rd trimester contraindicated | **Must fix** (per-indication: allowed for CPT; caution for treatment) |

### 3. Metronidazole (oral/IV)

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| General / anaerobic, SAM small-bowel overgrowth | Children | 7.5 mg/kg | Every 8 h | 7 days (SAM) | 500 mg/dose | — | Pocket Book 2013 (current WHO dose as described by Standing et al. 2018; Annex 2 page to verify) | 7.5 mg/kg every 8 h | **Match** |
| Amoebic dysentery | Children | Pocket Book: 7.5–10 mg/kg every 8 h for 5–10 days (To verify). BNF for Children (non-WHO): 10 mg/kg (max 800 mg) three times daily for 5 days | Every 8 h | 5–10 days | 800 mg/dose (BNFC) | — | Pocket Book §5.4 (To verify); WHO Model Formulary for Children 2010 §6.5.1 (To verify) | 7.5 mg/kg every 8 h, 5–7 days | **Minor difference** (indication-specific dose needed) |
| Giardiasis | Children | Pocket Book: 5 mg/kg every 8 h for 5 days (To verify) | Every 8 h | 5 days | — | — | Same (To verify) | 7.5 mg/kg every 8 h | **Minor difference** |
| C. difficile, non-severe | Adults | AWaRe: metronidazole 500 mg every 8 h for 10 days (To verify). IDSA/SHEA 2017/2021 (non-WHO): fidaxomicin 200 mg twice daily or vancomycin 125 mg four times daily for 10 days; metronidazole 500 mg three times daily only if these are unavailable | Every 8 h | 10 days | — | Not for fulminant disease. Fulminant: oral vancomycin 500 mg every 6 h plus IV metronidazole 500 mg every 8 h | AWaRe 2022, C. difficile chapter; IDSA/SHEA 2017 with 2021 update | Listed | **Minor difference** (label as alternative) |
| Pregnancy, first trimester | — | No verified WHO absolute contraindication found | — | — | — | — | — | 1st trimester contraindicated | **No WHO guidance** (keep as caution, cite national formulary) |

### 4. Oral rehydration salts (low-osmolarity)

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Plan A (no dehydration) | <2 y | 50–100 ml | After each loose stool | Until diarrhoea stops | — | — | Pocket Book 2013, Chart 15 (Plan A); *The treatment of diarrhoea*, 4th rev. 2005 | 10 ml/kg per stool | **Minor difference** (use WHO age bands) |
| Plan A | 2–10 y | 100–200 ml | After each loose stool | Same | — | — | Same | 10 ml/kg per stool | **Minor difference** |
| Plan A | >10 y and adults | As much as wanted; MSF guide to WHO Plan A: 200–400 ml | After each loose stool | Same | — | — | *The treatment of diarrhoea*; MSF Essential Drugs (non-WHO wording) | 200–400 ml | **Match** |
| Plan B (some dehydration) | All | 75 ml/kg | Over 4 h, then reassess | 4 h | — | — | *The treatment of diarrhoea* 2005 | 75 ml/kg over 4 h | **Match** |
| Plan C (severe) | All | IV first. If IV is impossible, ORS by nasogastric (NG) tube at 20 ml/kg/h for 6 h (120 ml/kg) and refer (To verify chart wording) | — | 6 h | — | — | *The treatment of diarrhoea* 2005, Plan C chart (To verify) | "Severe dehydration: use IV" | **Must fix** (add NG fallback; do not contraindicate ORS) |
| Composition | — | Na 75 mEq/L, glucose 75 mmol/L, total osmolarity 245 mOsm/L | — | — | — | Use ReSoMal, not standard ORS, in SAM | WHO/UNICEF joint statement 2004; EMLc | Not specified | **Minor difference** (add) |

### 5. Zinc sulfate

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Acute diarrhoea | <6 mo | 10 mg | Daily | 10–14 days | — | — | WHO/UNICEF joint statement 2004; Pocket Book Chart 15 | 10 mg/day, 10–14 days | **Match** |
| Acute diarrhoea | ≥6 mo to 5 y | 20 mg | Daily | 10–14 days (GTFCC: 10 days) | — | Not needed in children on therapeutic foods for SAM | Same; GTFCC 2022 note | 20 mg/day | **Match** |
| Adult diarrhoea | Adults | No WHO recommendation | — | — | — | — | — | 20 mg daily | **No WHO guidance** (remove) |
| "Malnutrition prevention" | — | No WHO recommendation. SAM therapeutic foods already contain zinc | — | — | — | — | WHO 2013 SAM guideline; GTFCC 2022 | Listed | **No WHO guidance** (remove) |

### 6. Vitamin A (retinol, oral)

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Prevention (where deficiency is a public health problem) | 6–11 mo | 100,000 IU | Once | — | — | — | WHO 2011 guideline, infants and children 6–59 mo | 100,000 IU | **Match** |
| Prevention | 12–59 mo | 200,000 IU | Every 4–6 mo | — | — | — | Same | 200,000 IU | **Match** |
| Measles | <6 mo / 6–11 mo / ≥12 mo | 50,000 / 100,000 / 200,000 IU | 2 doses, 24 h apart; 3rd age-based dose 2–4 weeks later if signs of deficiency | — | — | — | WHO measles guidance (summarised by Medscape and CDC); Pocket Book §7 | Single dose | **Must fix** (two-dose regimen) |
| Xerophthalmia / night blindness (children) | Same age bands | Age dose on day 1, day 2, and ~day 14 | — | 3 doses | — | — | WHO/UNICEF/IVACG xerophthalmia guidance (To verify) | Single dose | **Must fix** |
| SAM | Children | No high dose if on WHO-specification F-75, F-100 or RUTF (recommendation 4.2). High dose on admission only if foods not fortified (recommendation 4.3). Day 1/2/14 only for eye signs or measles | — | — | — | — | WHO *Guideline: Updates on the management of SAM*, 2013 | Day 1, 2, 14 | **Must fix** (outdated) |
| Pregnancy (night-blindness prevention) | Pregnant women | ≤10,000 IU daily or ≤25,000 IU weekly | Daily/weekly | ≥12 weeks until delivery | Never a single dose >25,000 IU | Only where night blindness ≥5% in pregnant women or in children 24–59 mo | WHO *Guideline: Vitamin A supplementation in pregnant women*, 2011 | No contraindication; adult 200,000 IU | **Must fix** (critical) |
| Postpartum | Women | Not recommended | — | — | — | — | WHO 2011 postpartum guideline | 200,000 IU adult | **Must fix** |

### 7. Mebendazole

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Preventive chemotherapy for soil-transmitted helminths (roundworm, hookworm, whipworm) | 12–23 mo, preschool, school-age | 500 mg | Single dose, annually or twice yearly | — | — | Where baseline prevalence ≥20%. Twice yearly if ≥50% | WHO *Guideline: Preventive chemotherapy to control STH infections*, 2017 | 500 mg single, ≥1 y | **Match** |
| Preventive chemotherapy | Pregnant women after 1st trimester | 500 mg | Single | — | — | Only if hookworm/T. trichiura ≥20% and anaemia ≥40% | Same, 2017 | 1st trimester contraindicated | **Match** |
| Pinworm (individual treatment) | ≥1 y | 100 mg | Single, repeat after 2 weeks | — | — | — | WHO Model Formulary 2008 (To verify) | 500 mg single | **Must fix** |
| Trichuriasis/hookworm (individual treatment) | ≥1 y | 100 mg twice daily (single 500 mg acceptable) | Twice daily | 3 days | — | — | WHO Model Formulary 2008 (To verify) | 500 mg single | **Minor difference** |
| <1 year | — | Not covered by preventive chemotherapy | — | — | — | — | 2017 guideline (age bands begin at 12 mo) | <1 y contraindicated | **Match** |

### 8. Artemether-lumefantrine (AL, oral)

| Indication | Population | WHO dose (20/120 mg tablets) | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Uncomplicated P. falciparum | 5 to <15 kg | 1 tablet | 0 h, 8 h, then every 12 h (0, 8, 24, 36, 48, 60 h) | 3 days, 6 doses | — | Not for severe malaria (use artesunate). Take with fat-containing food | WHO *Guidelines for malaria* (MAGICapp, version 10 Sept 2026); product label | 5–14 kg: 1 tablet | **Match** (write bands as "<15") |
| Same | 15 to <25 kg | 2 tablets (or 1 × 40/240) | Same | Same | — | — | Same | 15–24 kg: 2 | **Match** |
| Same | 25 to <35 kg | 3 tablets (1 × 40/240 + 1 × 20/120) | Same | Same | — | — | Same | 25–34 kg: 3 | **Match** |
| Same | ≥35 kg | 4 tablets (or 2 × 40/240) | Same | Same | — | — | Same | ≥35 kg: 4 | **Match** |
| First trimester of pregnancy | Pregnant women | Same weight-band dose; AL is the preferred treatment | Same | Same | — | Other ACTs if AL unavailable. Not artesunate-SP (antifolate) | WHO malaria guideline update of 25 Nov 2022 (strong recommendation) | 1st trimester contraindicated | **Must fix** |
| Infants 2 to <5 kg | Neonates and young infants | Coartem Baby / Riamet Baby artemether/lumefantrine 5 mg/60 mg dispersible tablet for infants ≥2 kg to <5 kg (Novartis study NCT07713602); per-dose schedule per label (to verify) | Per label | 3 days | — | — | Swissmedic approval 8 July 2025; WHO prequalification 24 April 2026 (WHO news release); WHO *Guidelines for malaria*, 10 Sept 2026 version | <5 kg contraindicated | **Must fix** |

### 9. Ciprofloxacin (oral/IV)

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Cholera (alternative to doxycycline) | Adults, including pregnant women | 1 g | Single dose | 1 dose | 1 g | Only for eligible patients (severe dehydration, high purging, etc.) | GTFCC *Use of antibiotics for the treatment and control of cholera*, rev. Oct 2022, Table 1 | 1 g single | **Match** (label as alternative) |
| Cholera | Children <12 y | 20 mg/kg | Single dose | 1 dose | 1 g | Doxycycline 2–4 mg/kg single dose is first-line | GTFCC 2022, Table 1 | 15 mg/kg every 12 h | **Must fix** |
| Shigellosis | Children | 15 mg/kg | Every 12 h | 3 days | 500 mg/dose (To verify) | Second-line: ceftriaxone 50–100 mg/kg IM for 2–5 days, or pivmecillinam 20 mg/kg four times daily for 5 days | WHO shigellosis guideline 2005; Pocket Book 2013 §5.4 | 15 mg/kg every 12 h | **Match** (duration 3 days) |
| Shigellosis | Adults | 500 mg (To verify) | Every 12 h | 3 days | — | — | WHO 2005 | 500 mg every 12 h | **Minor difference** (duration) |
| Typhoid / enteric fever | All | AWaRe: ciprofloxacin only where fluoroquinolone resistance is low; otherwise azithromycin or cefixime, and ceftriaxone if severe (doses to verify) | Every 12 h | 7 days (To verify) | — | In Asia, resistance to nalidixic acid/fluoroquinolones rose from 20% (2001–2005) to 65% (2011–2015) (Britto et al., PLOS NTD 2018). Worldwide, 42.4% of S. Typhi isolates were ciprofloxacin-resistant (updated systematic review, CMI 2026) | AWaRe 2022, enteric fever chapter (To verify) | Listed | **Minor difference** (add resistance gate) |
| Complicated / upper UTI | Adults | AWaRe upper UTI chapter (To verify) | — | — | — | — | AWaRe 2022 (To verify) | 500 mg every 12 h | Verify |
| Paediatric use | — | Used short-course in children (shigellosis, cholera single dose). GTFCC notes no evidence of lasting musculoskeletal harm and none after a single dose | — | — | — | Separate from zinc: give 2 h before or 4–6 h after zinc | GTFCC 2022 | Not flagged | **Minor difference** (add zinc interaction) |

### 10. Ceftriaxone (IV/IM)

| Indication | Population | WHO dose | Frequency | Duration | Max | Contraindications/age limits | Source | App value | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Severe pneumonia / sepsis | Children >1 mo | 80 mg/kg | Once daily (30 min infusion or 3 min IV injection) | Per indication (≥5 days) | 2 g/dose (label) | — | Pocket Book 2013, Annex 2 p. 358 | 50 mg/kg every 12–24 h, max 2 g | **Must fix** (use 80 mg/kg once daily) |
| Meningitis | Children >1 mo | 100 mg/kg once daily, or 50 mg/kg every 12 h | Once daily or every 12 h | 7–10+ days | 4 g single dose; 4 g/day | — | Pocket Book 2013, Annex 2 | Max 2 g | **Must fix** |
| Neonatal meningitis (alternative to ampicillin + gentamicin) | Neonates | 50 mg/kg every 12 h if <7 days old; 75 mg/kg after 1 week; with gentamicin | Every 12 h | 3 weeks | — | Premature (<41 wk postmenstrual age) and hyperbilirubinaemic neonates contraindicated. No IV calcium-containing fluids in neonates | Pocket Book 2013 §3.9 p. 56; WHOPAR / SmPC | Not present | **Must fix** |
| Shigellosis, resistant | Children | 50–100 mg/kg IM | Once daily | 2–5 days | — | Only when local strains are ciprofloxacin-resistant | WHO 2005 | — | Add |
| Gonorrhoea, uncomplicated | Adults and adolescents | 1 g IM | Single dose | 1 dose | — | Alternatives: cefixime 800 mg orally; spectinomycin 2 g IM + azithromycin 2 g; or gentamicin 240 mg IM + azithromycin 2 g | WHO *Updated recommendations for the treatment of N. gonorrhoeae, C. trachomatis and T. pallidum*, 2024 | 1–2 g every 12–24 h | **Must fix** (indication-specific) |
| Gonococcal conjunctivitis | Neonates | 50 mg/kg IM (max 150 mg) | Single | — | 150 mg | Neonatal contraindications apply | WHO STI guidelines | — | Add |
| Adult severe infections (sepsis, meningitis, severe typhoid) | Adults | 1–2 g daily; meningitis 2 g every 12 h (AWaRe, to verify) | Every 12–24 h | Per indication | 4 g/day | — | AWaRe 2022 (To verify) | 1–2 g every 12–24 h, max 4 g | **Match** (split by indication) |

## Discrepancies Between WHO Documents / Outdated Guidance

- **Co-trimoxazole for dysentery.**
  - WHO 2005 shigellosis guidance and the 2013 Pocket Book list co-trimoxazole as inappropriate.
  - The AWaRe draft (Nov 2021, Table 2) still lists sulfamethoxazole+trimethoprim among options for acute bloody diarrhoea, alongside ciprofloxacin, azithromycin and cefixime.
  - Treat ciprofloxacin as current first-line and co-trimoxazole as susceptibility-guided only.
- **Amoxicillin frequency.**
  - The pre-2014 IMCI and Pocket Book regimens used 25 mg/kg twice daily or three times daily dosing.
  - Current guidance is the 2014 revision (40 mg/kg/dose twice daily), and AWaRe keeps twice-daily 40–50 mg/kg/dose.
  - Adult AWaRe doses are three times daily (500 mg for otitis media; 1 g for sinusitis and CAP).
- **Vitamin A in SAM.**
  - The 1999/2003 WHO SAM manuals gave high doses on days 1, 2 and 14.
  - The 2013 guideline supersedes them (no routine high dose with fortified foods).
- **Cholera first-line.**
  - Older GTFCC and MSF-era summaries ranked azithromycin or ciprofloxacin first for children and pregnant women and discouraged doxycycline under 8 years.
  - The October 2022 GTFCC note makes doxycycline first-line for all groups. It cites a systematic review showing that "the safety profile of doxycycline differs from tetracycline and there was no correlation between the use of doxycycline and teratogenic effects or dental discoloration."
  - Some secondary sources (for example ICDDR,B presentations) still show azithromycin first-line.
- **AL in first trimester.**
  - WHO 2015 recommended quinine plus clindamycin in the first trimester.
  - Since 25 Nov 2022, AL is the preferred treatment.
- **AL for infants under 5 kg.**
  - Until 2025–2026 there was no evidence-based formulation. As WHO put it on 24 Apr 2026, "infants with malaria have been treated with formulations intended for older children, which increase the risk of dosing errors, side effects and toxicity."
  - The 10 Sept 2026 WHO malaria guidelines add the new infant formulation (Coartem Baby).
- **CPT adult dose.** WHO's 2014 CPT supplement reports that "Two trials found 480 mg to be non-inferior to 960 mg" for death, PCP, toxoplasmosis, malaria, pneumonia and diarrhoea, but "there was no consistent reduction in treatment-limiting adverse events," so WHO kept 960 mg daily. The app has likely taken the lower dose from trial literature.
- **Zinc age boundary.** WHO says "<6 months"; some national workflows (ICMR India) say "2–6 months." Use WHO.
- **C. difficile.** AWaRe (a WHO Access-first stewardship document) and IDSA/SHEA 2017/2021 differ: IDSA downgraded metronidazole to use only when vancomycin or fidaxomicin are unavailable. Flag the difference rather than pick one.
- **Neonatal ceftriaxone.**
  - The Pocket Book gives ceftriaxone as an alternative for neonatal meningitis.
  - Regulatory labelling (WHOPAR/EMA) contraindicates it in hyperbilirubinaemic and premature neonates.
  - In jaundiced or preterm neonates, cefotaxime is the safer third-generation option.

## Recommendations (data model and VALIDATION.md)

1. **Restructure drugs.json** into `drug → indications[] → regimens[]`. Each regimen carries:
   - `population` (neonate / weight band / age band / adult / pregnancy trimester)
   - `dose` (mg/kg or fixed; weight-band lookup table)
   - `frequency`, `duration`, `maxDose`, `maxDaily`, `route`
   - `contraindications[]`, `sourceId`, `section`, `verifiedDate`, `status` (current/superseded)
2. **Make weight bands the primary representation** for amoxicillin, co-trimoxazole CPT, AL and ceftriaxone. These are WHO's own dosing mechanism and reduce calculation errors.
3. **Add hard-stop rules**:
   - Vitamin A >25,000 IU if female 12–49 y and pregnancy not excluded
   - Ceftriaxone IV in a neonate who is on calcium, preterm or jaundiced
   - AL in severe malaria
   - Mebendazole in preventive chemotherapy under 12 months
4. **Add an "evidence tier" field** so VALIDATION.md separates WHO primary sources from non-WHO sources (IDSA, BNFC, MSF).
5. **Before merging, open and page-cite every "To verify" row**, especially:
   - Pocket Book Annex 2 (amoxicillin, metronidazole, ciprofloxacin)
   - AWaRe 2022 final (adult CAP, enteric fever, upper UTI, C. difficile)
   - WHO Model Formulary 2008 / for Children 2010 (mebendazole, metronidazole)
   - Coartem Baby label dose

## Caveats

- AWaRe figures above come from the November 2021 public-comment draft. The final 2022 book may differ slightly; check doses against the final PDF.
- Pocket Book Annex 2 ceftriaxone and co-trimoxazole numbers come from extracts of the NCBI annex PDFs. The PDFs themselves were behind a CAPTCHA and could not be opened directly.
- The WHO 2005 shigellosis figures were confirmed through a 2018 peer-reviewed review (Williams & Berkley), not the original PDF.
- The Coartem Baby per-dose schedule was not retrieved. The tablet strength (5 mg/60 mg dispersible) comes from Novartis's post-marketing study registration, and the prequalification date (24 April 2026) from WHO's news release. The WHO guideline inclusion is reported by MMV (15 Sept 2026) and by the WHO guideline page's version note (10 Sept 2026).
- There may be a newer edition of the Pocket Book. I found only the 2013 2nd edition online plus a separate WHO Europe primary-care pocket book (2022/2024 app).
- This is a validation aid, not clinical guidance. National guidelines and local resistance data override it.