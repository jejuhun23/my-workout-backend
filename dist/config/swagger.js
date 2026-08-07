"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🏋️ 운동 메모장 API 문서',
            version: '1.0.0',
            description: 'Node.js, Express, TypeScript, Prisma 기반 운동 메모장 REST API 명세서입니다.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: '로컬 개발 서버',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts', './src/app.ts'],
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
