/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object:
 *             properties:
 *               email:
 *                 type: string
 *                 example: rlawogjs222000@naver.com
 *               password:
 *                 type: string
 *                 example: "@bbc1472588!"
 *     responses:
 *       200:
 *         description: 로그인 성공 및 토큰 발급
 *       400:
 *         description: 잘못된 요청 또는 회원 정보 없음
 */import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Request 인터페이스 확장
export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticateToken = (
  req: AuthRequest, // 👈 처음부터 AuthRequest로 타입 지정
  res: Response,
  next: NextFunction
): void => { // 👈 미들웨어의 반환 타입은 void
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: '인증 토큰이 없습니다.' });
    return; // 👈 return 문을 분리하여 void 반환 맞춤
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: '유효하지 않거나 만료된 토큰입니다.' });
      return;
    }

    const payload = decoded as { userId: number };
    req.userId = payload.userId; // 👈 강제 형변환(as) 없이 깔끔하게 접근 가능
    next();
  });
};