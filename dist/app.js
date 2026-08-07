"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const auth_1 = __importDefault(require("./routes/auth"));
const workout_1 = __importDefault(require("./routes/workout"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// process.cwd()를 사용하면 실행 위치(프로젝트 루트) 기준으로 public 폴더를 찾아갑니다.
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
// 💡 Swagger API 문서 라우트 연결
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs));
// API 라우터 연결
app.use('/auth', auth_1.default);
app.use('/workouts', workout_1.default);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 서버 구동 중: http://localhost:${PORT}`);
    console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
});
