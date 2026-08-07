# 1. Node.js 베이스 이미지 설정
FROM node:22-alpine

# 💡 Alpine 환경에 Prisma 필수 라이브러리(openssl) 설치
RUN apk add --no-cache openssl
# 2. 작업 디렉토리 생성
WORKDIR /app

# 3. 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 4. Prisma 스키마 복사 및 클라이언트 생성
COPY prisma ./prisma/
RUN npx prisma generate

# 5. 소스 코드 전체 복사 및 빌드
COPY . .
RUN npm run build

# 6. 포트 노출
EXPOSE 3000

# 7. 서버 실행
CMD ["npm", "start"]