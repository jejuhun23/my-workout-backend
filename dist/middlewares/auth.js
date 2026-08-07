"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, // 👈 처음부터 AuthRequest로 타입 지정
res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: '인증 토큰이 없습니다.' });
        return; // 👈 return 문을 분리하여 void 반환 맞춤
    }
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
        if (err) {
            res.status(403).json({ error: '유효하지 않거나 만료된 토큰입니다.' });
            return;
        }
        const payload = decoded;
        req.userId = payload.userId; // 👈 강제 형변환(as) 없이 깔끔하게 접근 가능
        next();
    });
};
exports.authenticateToken = authenticateToken;
