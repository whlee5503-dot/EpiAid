# EpiAid — Project Context

## 프로젝트 개요
선교/NGO 오지 현장 의료봉사자를 위한 오프라인 우선 PWA 앱.
EpiCalc Suite의 세 번째 모듈 (Module 3).

- EpiCalc (Module 1): https://epi.chem-health-calc.com
- EpiLog (Module 2): https://epilog-d72.pages.dev
- EpiAid (Module 3): https://epiaid.pages.dev ✅

## 배포 상태
- **URL**: https://epiaid.pages.dev (Cloudflare Pages) ✅
- **GitHub**: whlee5503-dot/EpiAid (Public, MIT) ✅
- **Zenodo DOI**: 10.5281/zenodo.20436469 ✅
- **PWA**: 완성 ✅

## 기술 스택
- React + Vite + TypeScript
- Tailwind CSS v4
- PWA (Vite PWA Plugin + Workbox) — 2G/3G 최적화
- IndexedDB (오프라인 환자 기록)
- Cloudflare Pages 배포
- i18next (EN/KR/FR/SW 4개 언어)

## 디자인 원칙
- EpiCalc Suite 브랜딩 통일 (forest green #1a6b4a, DM Sans)
- 비의료인도 즉시 사용 가능한 UI
- 2G/3G 환경 최적화
- 한/영/불/스와힐리 4개 언어 지원

## 개발자
Won Ho Lee, Ph.D., MPH, MDiv
(MD 아님 — 모든 문서에서 MD 표기 금지)

## 개발 현황

### Phase 1 — 완료 (2026-05-28) ✅
1. 약물 용량 계산기 (체중 기반 mg/kg, WHO Essential Medicines)
2. 영양 평가 (MUAC + Z-score + 부종)
3. 증상 체크리스트 (탈수/폐렴/말라리아/신생아 위험 징후, WHO IMCI)

### Phase 2 — 완료 (2026-05-29) ✅
4. Dark/Light Mode
5. 현지어 문장 카드 (EN/KR/FR/SW)
6. 간이 환자 기록 (IndexedDB 오프라인)
7. 신생아 위험 징후 체크리스트
8. 2G/3G 최적화 (초기 번들 -80%, ~27KB gzip)
9. README.md + Zenodo DOI 뱃지

## 다음 단계
- DPGA 심사 신청 (EpiAid)
- DPGA 승인 후: 커스텀 도메인, LinkedIn 공개

## EpiCalc Suite DOI
- EpiCalc (Module 1): 10.5281/zenodo.20181520
- EpiLog (Module 2): 10.5281/zenodo.20349994
- EpiAid (Module 3): 10.5281/zenodo.20436469

## 중요 원칙
- 모든 계산 결과에 면책 고지 필수:
  "Always verify with a qualified clinician"
- WHO/MSF 프로토콜 기준 준수
- EpiLog/EpiCalc 디자인 패턴 일관성 유지
