# 라로제 코리아 교육 플랫폼 — 배포 가이드

이 폴더는 관리자 대시보드 + 현장 스크립트 생성기 2개 화면으로 구성된
React 기반 웹앱이며, PWA(홈 화면 추가 가능) 설정이 포함되어 있습니다.

## 1. 로컬에서 미리 보기 (선택)

개발 지식이 없다면 이 단계는 건너뛰고 바로 2번(Vercel 배포)으로 가도 됩니다.

```bash
npm install
npm run dev
```
브라우저에서 http://localhost:5173 접속

## 2. Vercel로 무료 배포하기 (추천, 가장 쉬움)

### 준비물
- GitHub 계정 (없으면 github.com에서 무료 가입)
- Vercel 계정 (vercel.com에서 "Continue with GitHub"로 가입, 별도 가입 불필요)

### 절차

1. **GitHub에 코드 올리기**
   - github.com 접속 → 우측 상단 `+` → `New repository`
   - 이름 예: `larosee-edu` → `Create repository`
   - 이 폴더(larosee-edu) 전체를 업로드
     - 컴퓨터에 Git이 설치되어 있다면 터미널에서:
       ```bash
       cd larosee-edu
       git init
       git add .
       git commit -m "최초 업로드"
       git branch -M main
       git remote add origin https://github.com/내계정/larosee-edu.git
       git push -u origin main
       ```
     - Git이 익숙하지 않다면, GitHub 웹사이트의 "uploading an existing file" 링크로
       폴더를 드래그 앤 드롭해서 올릴 수도 있습니다 (단, 폴더째 드래그는
       브라우저에 따라 제한이 있어 Git 사용을 권장합니다)

2. **Vercel에서 배포**
   - vercel.com 로그인 → `Add New` → `Project`
   - 방금 만든 GitHub 저장소(`larosee-edu`) 선택 → `Import`
   - Framework Preset: `Vite` 자동 감지됨 (수정 불필요)
   - `Deploy` 클릭
   - 1~2분 후 `https://larosee-edu-xxxx.vercel.app` 같은 실제 URL 발급

3. **완료**
   - 이 URL을 현장 직원들에게 공유하면 바로 접속 가능
   - 이후 코드를 수정하고 GitHub에 다시 push하면 Vercel이 자동으로 재배포합니다

### 비용
무료 티어로 충분합니다 (사내 소규모 인원이 쓰는 수준이라면 무료 한도 내).

## 3. PWA로 "앱처럼" 설치하기

배포가 끝나면 직원들은 다음과 같이 홈 화면에 아이콘을 추가할 수 있습니다.

- **아이폰(Safari)**: 사이트 접속 → 하단 공유 버튼 → "홈 화면에 추가"
- **안드로이드(Chrome)**: 사이트 접속 → 우측 상단 점 3개 메뉴 → "앱 설치" 또는 "홈 화면에 추가"

설치하면 앱스토어 없이도 아이콘을 눌러 전체화면으로 실행됩니다.
별도의 앱스토어 등록/심사 절차가 필요 없습니다.

## 4. 다음 단계 (선택)

- **데이터 영속 저장**: 지금은 새로고침하면 입력값이 초기화됩니다.
  신규입사자 DB, 매출 데이터 등을 실제로 저장하려면 Supabase(무료 티어 있음)
  같은 백엔드 연동이 필요합니다.
- **로그인/권한 분리**: 관리자 화면과 현장 화면을 같은 사람만 보게 하려면
  간단한 로그인 기능 추가가 필요합니다.
- **Claude API 연동**: 스크립트 생성기를 정적 템플릿이 아닌 실시간 AI 생성으로
  바꾸려면 백엔드에서 Anthropic API를 호출하는 서버리스 함수가 필요합니다
  (Vercel은 이런 서버리스 함수도 같은 프로젝트 안에서 무료로 지원합니다).

문의사항이나 막히는 단계가 있으면 Claude에게 캡처/에러 메시지를 보여주고
다음 단계를 물어보면 됩니다.
