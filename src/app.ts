import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import authRouter from './routes/auth';
import workoutRouter from './routes/workout';
import path from 'path';

const app = express();


// process.cwd()를 사용하면 실행 위치(프로젝트 루트) 기준으로 public 폴더를 찾아갑니다.
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(express.static('public'));
app.use('/workouts', workoutRouter); // 또는 /api/workouts

// 💡 Swagger API 문서 라우트 연결
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API 라우터 연결
app.use('/auth', authRouter);
app.use('/workouts', workoutRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 구동 중: http://localhost:${PORT}`);
  console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
});