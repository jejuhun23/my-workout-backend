"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// 모든 운동 라우트에 JWT 인증 미들웨어 적용
router.use(auth_1.authenticateToken);
// 입력값 유효성 검증 함수
function validateWorkoutInput(title, sets, reps, weight) {
    if (!title || sets === undefined || reps === undefined || weight === undefined) {
        return '모든 운동 정보를 입력해 주세요.';
    }
    const numSets = Number(sets);
    const numReps = Number(reps);
    const numWeight = Number(weight);
    if (isNaN(numSets) || isNaN(numReps) || isNaN(numWeight)) {
        return '세트, 횟수, 무게는 숫자여야 합니다.';
    }
    if (numSets <= 0 || numReps <= 0 || numWeight < 0) {
        return '세트와 횟수는 0보다 커야 하며, 무게는 0 이상이어야 합니다.';
    }
    return null; // 검증 통과
}
/**
 * @swagger
 * /workouts:
 *   get:
 *     summary: 내 운동 기록 목록 조회
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: 조회할 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 운동 목록 조회 성공
 *   post:
 *     summary: 운동 기록 생성
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "벤치프레스"
 *               sets:
 *                 type: number
 *                 example: 5
 *               reps:
 *                 type: number
 *                 example: 10
 *               weight:
 *                 type: number
 *                 example: 80
 *     responses:
 *       201:
 *         description: 운동 기록 생성 성공
 */
// 1. 내 운동 기록 목록 조회 (날짜 검색 가능)
router.get('/', async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.userId;
        const { date } = req.query;
        let dateFilter = {};
        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
            dateFilter = {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            };
        }
        const workouts = await prisma_1.prisma.workout.findMany({
            where: {
                userId,
                ...dateFilter,
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
// 2. 운동 기록 생성
router.post('/', async (req, res) => {
    try {
        const authReq = req;
        const { title, sets, reps, weight } = req.body;
        const userId = authReq.userId;
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
/**
 * @swagger
 * /workouts/stats/1rm:
 *   get:
 *     summary: 종목별 추정 1RM 계산 및 통계 조회
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 1RM 계산 성공
 */
router.get('/stats/1rm', async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.userId;
        const workouts = await prisma_1.prisma.workout.findMany({
            where: { userId },
        });
        const max1RMMap = {};
        workouts.forEach((w) => {
            const estimated1RM = w.reps === 1 ? w.weight : Math.round(w.weight * (1 + w.reps / 30));
            if (!max1RMMap[w.title] || estimated1RM > max1RMMap[w.title]) {
                max1RMMap[w.title] = estimated1RM;
            }
        });
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
/**
 * @swagger
 * /workouts/{id}:
 *   put:
 *     summary: 운동 기록 수정
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               sets:
 *                 type: number
 *               reps:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       200:
 *         description: 운동 기록 수정 성공
 *       403:
 *         description: 수정 권한 없음
 *       404:
 *         description: 운동 기록 없음
 *   delete:
 *     summary: 운동 기록 삭제
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 운동 기록 삭제 성공
 *       403:
 *         description: 삭제 권한 없음
 *       404:
 *         description: 운동 기록 없음
 */
// 4. 운동 기록 수정 (PUT)
router.put('/:id', async (req, res) => {
    try {
        const authReq = req;
        const workoutId = Number(req.params.id);
        const userId = authReq.userId;
        const { title, sets, reps, weight } = req.body;
        const validationError = validateWorkoutInput(title, sets, reps, weight);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const existingWorkout = await prisma_1.prisma.workout.findUnique({
            where: { id: workoutId },
        });
        if (!existingWorkout) {
            return res.status(404).json({ error: '해당 운동 기록을 찾을 수 없습니다.' });
        }
        if (existingWorkout.userId !== userId) {
            return res.status(403).json({ error: '본인의 운동 기록만 수정할 수 있습니다.' });
        }
        const updatedWorkout = await prisma_1.prisma.workout.update({
            where: { id: workoutId },
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
// 5. 운동 기록 삭제 (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const authReq = req;
        const workoutId = Number(req.params.id);
        const userId = authReq.userId;
        const existingWorkout = await prisma_1.prisma.workout.findUnique({
            where: { id: workoutId },
        });
        if (!existingWorkout) {
            return res.status(404).json({ error: '해당 운동 기록을 찾을 수 없습니다.' });
        }
        if (existingWorkout.userId !== userId) {
            return res.status(403).json({ error: '본인의 운동 기록만 삭제할 수 있습니다.' });
        }
        await prisma_1.prisma.workout.delete({
            where: { id: workoutId },
        });
        res.status(200).json({ message: '🗑️ 운동 기록 삭제 완료!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: '운동 기록 삭제 중 오류가 발생했습니다.' });
    }
});
exports.default = router;
