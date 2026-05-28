# EpiAid — Project Context

## 프로젝트 개요
선교/NGO 오지 현장 의료봉사자를 위한 오프라인 우선 PWA 앱.
EpiCalc Suite의 세 번째 모듈 (Module 3).

- EpiCalc (Module 1): https://epi.chem-health-calc.com
- EpiLog (Module 2): https://epilog-d72.pages.dev
- EpiAid (Module 3): 개발 중

## 기술 스택
- React + Vite + TypeScript
- Tailwind CSS
- PWA (Vite PWA Plugin + Workbox)
- IndexedDB (오프라인 환자 기록)
- Cloudflare Pages 배포

## 디자인 원칙
- EpiCalc Suite 브랜딩 통일 (forest green #1a6b4a, DM Sans)
- 비의료인도 즉시 사용 가능한 UI
- 2G/3G 환경 최적화
- 한/영/불/스와힐리 4개 언어 지원

## 개발자
Won Ho Lee, Ph.D., MPH, MDiv
(MD 아님 — 모든 문서에서 MD 표기 금지)

## 로드맵
### Phase 1 (현재)
1. 약물 용량 계산기 (체중 기반 mg/kg)
2. MUAC 영양 평가
3. 탈수/폐렴 증상 체크리스트

### Phase 2
4. 현지어 문장 카드
5. 간이 환자 기록
6. 신생아 위험 징후 체크리스트

## 중요 원칙
- 모든 계산 결과에 면책 고지 필수:
  "Always verify with a qualified clinician"
- WHO/MSF 프로토콜 기준 준수
- EpiLog/EpiCalc 디자인 패턴 일관성 유지
