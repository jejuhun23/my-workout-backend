# 🏋️ Workout Tracker Backend API Server

사용자의 운동 기록을 관리하고, Epley 공식 기반의 추정 1RM 통계를 제공하는 RESTful API 백엔드 서버입니다.  
클라우드 플랫폼에 배포되어 실시간 API 문서(Swagger UI)를 통해 모든 엔드포인트를 직접 테스트할 수 있습니다.

---

## 🔗 Live Demo & Documentation
* **Swagger API Docs:** [https://my-workout-api-g497.onrender.com/api-docs/](https://my-workout-api-g497.onrender.com/api-docs/)
* **Base URL:** `https://my-workout-api-g497.onrender.com`

---

## 🛠️ Tech Stack
* **Language:** TypeScript
* **Runtime:** Node.js (Express.js)
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Authentication:** JWT (JSON Web Token), bcrypt
* **Documentation & Cloud:** Swagger (OpenAPI 3.0), Render Cloud

---

## 📌 Key Features

### 1. 인증 및 인가 (Authentication & Authorization)
* **비밀번호 단방향 암호화:** `bcrypt` 해싱을 통한 회원가입 보안 처리
* **JWT 기반 Stateless 인증:** `authenticateToken` 미들웨어를 구축하여 Bearer Token 검증
* **데이터 소유권 기반 인가 (Ownership Check):** 타인의 운동 기록에 대한 수정(`PUT`) 및 삭제(`DELETE`) 요청을 원천 차단 (`403 Forbidden`)

### 2. 운동 기록 C.R.U.D & 비즈니스 로직
* **데이터 생성/수정 유효성 검사:** 세트 수, 횟수, 무게에 대한 엄격한 값 검증 (`400 Bad Request`)
* **날짜별 필터링 조회:** Query Parameter(`?date=YYYY-MM-DD`)를 통한 특정 일자 운동 기록 필터링
* **추정 1RM 통계 엔진:** Epley 공식($\text{Weight} \times (1 + \text{Reps} / 30)$)을 적용한 종목별 개인 최고 1RM 산출

---

## 📡 API Specification Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | 신규 회원가입 | ❌ |
| `POST` | `/auth/login` | 로그인 및 JWT 토큰 발급 | ❌ |
| `GET` | `/workouts` | 내 운동 기록 전체/날짜별 조회 | ✅ |
| `POST` | `/workouts` | 신규 운동 기록 생성 | ✅ |
| `GET` | `/workouts/stats/1rm` | 종목별 추정 1RM 통계 조회 | ✅ |
| `PUT` | `/workouts/:id` | 특정 운동 기록 수정 (본인 확인) | ✅ |
| `DELETE`| `/workouts/:id` | 특정 운동 기록 삭제 (본인 확인) | ✅ |

---

## 💡 Troubleshooting & Technical Growth

* **토큰 무효화 및 CORS/정적 자원 에러 대응:**  
  클라우드 환경 배포 시 Swagger UI의 정적 Asset 경로 누락 문제를 CDN 경로 오버라이딩을 통해 해결
* **요청 식별자 일원화 및 인가 파이프라인 정립:**  
  Express `Request` 인터페이스를 확장한 `AuthRequest`를 정의하여 인증 미들웨어와 라우터 간 `userId` 전달 일관성 확보
* **엄격한 데이터 정합성 보장:**  
  Prisma 트랜잭션 및 유효성 검사 모듈을 분리하여 비정상적인 수치(음수, 0) 입력 시 DB 반영 전 사전 차단