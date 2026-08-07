"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
function validateWorkoutInput(title, sets, reps, weight) {
    if (!title || sets === undefined || reps === undefined || weight === undefined) {
        return '모든 운동 정보를 입력해 주세요.';
    }
    const numSets = Number(sets);
    const numReps = Number(reps);
    const numWeight = Number(weight);
    if (numSets < 0 || numReps < 0 || numWeight < 0) {
        return '세트, 횟수, 무게는 숫자여야 합니다.';
    }
    if (numSets <= 0 || numReps <= 0 || numWeight < 0) {
        return '세트/횟수/무게는 0보다 커야 합니다.';
    }
    return null; // 문제 없음
}
// 모든 운동 라우트에 인증 미들웨어 적용
router.use(auth_1.authenticateToken); // 토큰 확인을 통하여 로그인한 사람이 맞는지 검사
// 1. 내 운동 기록 저장
router.post('/', async (req, res) => {
    try {
        const authReq = req;
        const { title, sets, reps, weight } = req.body;
        const userId = authReq.userId;
        // 🔧 옛날 검증 코드 삭제하고, 우리가 만든 함수로 교체!
        const validationError = validateWorkoutInput(title, sets, reps, weight);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const newWorkout = await prisma_1.prisma.workout.create({
            data: {
                title,
                sets: Number(sets),
                reps: Number(reps),
                weight: Number(weight),
                userId,
            },
        });
        res.status(201).json({ message: '✅ 운동 기록 저장 완료!', data: newWorkout });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: '데이터 저장 중 서버 오류 발생' });
    }
});
// 2. 운동 종목별 추정 1RM 계산 및 통계 조회 API
router.get('/stats/1rm', async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.userId;
        // 사용자의 모든 운동 기록 조회
        const workouts = await prisma_1.prisma.workout.findMany({
            where: { userId },
        });
        // 종목별 최고 1RM 저장용 객체
        const max1RMMap = {};
        workouts.forEach((w) => {
            // Epley 공식 적용 (1회 반복인 경우는 무게 그대로)
            const estimated1RM = w.reps === 1
                ? w.weight
                : Math.round(w.weight * (1 + w.reps / 30));
            // 기존 최고 기록보다 높은 경우 업데이트
            if (!max1RMMap[w.title] || estimated1RM > max1RMMap[w.title]) {
                max1RMMap[w.title] = estimated1RM;
            }
        });
        // 배열 형태로 가공
        const stats = Object.keys(max1RMMap).map((title) => ({
            title,
            max1RM: max1RMMap[title],
        }));
        res.status(200).json({ message: '1RM 계산 성공!', data: stats });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: '1RM 계산 중 오류 발생' });
    }
});
// 3. 내가 작성한 운동 기록만 조회 (날짜 쿼리 파라미터 가능)
router.get('/', async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.userId;
        const { date } = req.query; // URL의 ?date=YYYY-MM-DD 가져오기
        // 날짜 조건 설정
        let dateFilter = {};
        if (date) {
            const targetDate = new Date(date);
            // 선택한 날짜의 00:00:00.000 ~ 23:59:59.999 범위 생성
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
            dateFilter = {
                createdAt: {
                    gte: startOfDay, // 선택한 날짜의 시작 이후
                    lte: endOfDay, // 선택한 날짜의 끝 이전
                },
            };
        }
        const workouts = await prisma_1.prisma.workout.findMany({
            where: {
                userId,
                ...dateFilter, // date가 있으면 날짜 조건 추가, 없으면 전체 조회
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ message: '✅ 운동 기록 조회 성공!', data: workouts });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: '데이터를 가져오는 중 서버 오류 발생' });
    }
});
// 4. 내 운동 기록 수정 (PUT)
router.put('/:id', async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        const userId = authReq.userId;
        const { title, sets, reps, weight } = req.body;
        // ① 내 소유의 기록이 맞는지 검증
        const existingWorkout = await prisma_1.prisma.workout.findFirst({
            where: {
                id: Number(id),
                userId
            },
        });
        if (isNaN(reps) || isNaN(reps) || isNaN(weight)) {
            return res.status(400).json({ error: '숫자여야 합니다.' });
        }
        // ② 남의 기록이거나 없는 ID일 경우 404/403 처리
        if (!existingWorkout) {
            return res.status(404).json({ error: '해당 운동 기록을 찾을 수 없거나 수정 권한이 없습니다.' });
        }
        // ③ 검증 통과 시 수정 처리
        const updatedWorkout = await prisma_1.prisma.workout.update({
            where: { id: Number(id) },
            data: {
                title,
                sets: Number(sets),
                reps: Number(reps),
                weight: Number(weight),
            },
        });
        res.status(200).json({ message: '✅ 수정 완료!', data: updatedWorkout });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: '수정 중 오류가 발생했습니다.' });
    }
});
// 5. 내 운동 기록 삭제 (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        const userId = authReq.userId;
        const existingWorkout = await prisma_1.prisma.workout.findFirst({
            where: { id: Number(id), userId },
        });
        if (!existingWorkout) {
            return res.status(404).json({ error: '해당 운동 기록을 찾을 수 없거나 권한이 없습니다.' });
        }
        await prisma_1.prisma.workout.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: '✅ 삭제 완료!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: '데이터를 삭제하는 중 서버 오류 발생' });
    }
});
exports.default = router;
