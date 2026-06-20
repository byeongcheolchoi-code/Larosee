# 라로제 코리아 교육 플랫폼 — 배포 가이드

이 폴더는 회원가입/로그인/승인, 관리자 대시보드, 현장 스크립트 생성기로
구성된 React + Supabase 기반 웹앱이며, PWA(홈 화면 추가 가능) 설정이
포함되어 있습니다.

## 0. Supabase 연동 설정 (필수)

이 앱은 Supabase를 로그인/데이터베이스로 사용합니다. 배포 전에 반드시
환경변수를 설정해야 합니다.

### 로컬에서 테스트할 때
1. `.env.example` 파일을 복사해서 `.env` 파일을 만드세요
2. Supabase 대시보드 → Settings → API에서 Project URL과 Publishable key를 복사해 채워넣으세요
   ```
   VITE_SUPABASE_URL=https://ycqhivfuajzujtpnbpnm.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxx
   ```

### Vercel에 배포할 때
Vercel 프로젝트 설정 → Settings → Environment Variables 에서 위 두 값을
똑같이 등록해야 합니다. (자세한 절차는 아래 "2-1. Vercel 환경변수 설정"
참고)

## 0-1. 권한 체계

이 앱은 4단계 권한을 사용합니다.

| 권한 | 할 수 있는 일 |
|---|---|
| 최고관리자 | 전체 데이터 열람 + 가입 승인 + **본사관리자/최고관리자 권한 부여** |
| 본사관리자 | 전체 데이터 열람 + 가입 승인 (단, 일반직원·파트장 권한만 부여 가능) |
| 파트장 | 본인 지점 데이터 열람, 코칭 기록 작성 |
| 일반직원 | 본인 데이터 열람, 현장 스크립트 생성기 사용 |

본사관리자는 여러 명(교육팀원 등) 둘 수 있지만, "본사관리자 권한을 새로 부여하는 것"은
최고관리자(라온님)만 할 수 있습니다. 이렇게 해야 관리자 권한이 통제 없이 계속 늘어나는
것을 막을 수 있습니다.

### 첫 최고관리자 계정 만들기
이 앱은 직원이 스스로 가입하고 관리자가 승인하는 구조라서, 맨 처음
"최고관리자"가 한 명도 없으면 아무도 승인할 사람이 없는 상태가 됩니다.
다음 순서로 첫 계정을 만드세요.

1. 배포된 사이트에서 본인(라온님) 계정으로 회원가입 (신청 권한은 아무거나 선택)
2. **DB에 아직 `최고관리자` 권한이 없다면**, Supabase 대시보드 → SQL Editor에서
   `supabase/migration_super_admin.sql` 파일 내용을 먼저 실행하세요 (최초 1회만)
3. **매출 입력 기능을 쓰려면**, `supabase/migration_sales_insert.sql` 파일 내용도
   실행하세요 (최초 1회만) — 직원이 본인 매출을, 파트장이 지점 매출을 입력할
   수 있게 하는 권한입니다
4. **이카운트 엑셀 업로드 기능을 쓰려면**, `supabase/migration_ecount_upload.sql`
   파일 내용도 실행하세요 (최초 1회만) — 지점명 매핑 테이블 생성 및 관리자
   매출 입력 권한을 추가합니다
5. **전체 51개 지점(운영중+오픈예정 포함)을 등록하려면**,
   `supabase/migration_full_stores.sql` 파일 내용을 실행하세요 (최초 1회만)
   — 기존 예시 지점 4개를 지우고 실제 지점 전체로 교체합니다. 등록 후
   "지점 관리" 메뉴에서 오픈예정 지점을 운영중으로 전환할 수 있습니다

### 이카운트 엑셀 업로드 사용법
1. 본사관리자로 로그인 → 상단 메뉴 "지점명 매핑 관리"에서 이카운트 거래처명과
   우리 지점을 1회 연결해두세요 (예: "롯데쇼핑(주)잠실점" → "롯데 본점")
2. "이카운트 업로드" 메뉴에서 이카운트의 "판매사원별 상세" 엑셀 파일을 업로드
3. 자동으로 직원/지점이 매칭되고, 매칭 실패 건은 화면에 표시됩니다
4. 미리보기 확인 후 "등록 확정" 버튼을 눌러야 실제 저장됩니다
5. 같은 파일을 실수로 다시 업로드해도 중복 등록되지 않습니다
3. 같은 SQL Editor에서 아래 SQL 실행 (이메일 부분만 본인 것으로 수정)
   ```sql
   update public.profiles
   set role = '최고관리자', status = 'approved'
   where email = '본인이메일@example.com';
   ```
4. 이후 로그인하면 관리자 대시보드와 가입 승인 메뉴가 보입니다
5. 다른 직원들의 가입 승인은 이제부터 사이트의 "가입 승인" 메뉴에서 처리하면 됩니다
   - 교육팀원을 "본사관리자"로 승인하고 싶다면, 라온님(최고관리자) 계정으로 로그인한
     상태에서 승인 화면의 "부여 권한"을 본사관리자로 선택하면 됩니다
   - 본사관리자로 로그인한 사람은 일반직원/파트장만 승인 가능하고, 본사관리자
     권한 부여 옵션 자체가 보이지 않습니다

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
   - **`Deploy` 누르기 전에** "Environment Variables" 섹션을 펼쳐서 아래 두 개를 추가하세요
     - Name: `VITE_SUPABASE_URL` / Value: Supabase Project URL
     - Name: `VITE_SUPABASE_ANON_KEY` / Value: Supabase Publishable key
   - `Deploy` 클릭
   - 1~2분 후 `https://larosee-edu-xxxx.vercel.app` 같은 실제 URL 발급

   ### 2-1. Vercel 환경변수 설정 (배포 후 추가/수정하는 경우)
   이미 배포된 프로젝트에 환경변수를 나중에 추가하거나 수정하려면:
   - Vercel 프로젝트 페이지 → `Settings` → `Environment Variables`
   - 위 두 값을 입력하고 `Save`
   - 변경 후에는 `Deployments` 탭에서 가장 최근 배포 옆 `...` 메뉴 → `Redeploy`를 눌러야 반영됩니다

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
