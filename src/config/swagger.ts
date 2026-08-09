import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Workout API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'https://my-workout-api-g497.onrender.com',
        description: 'Production Server (Render)',
      },
    ],
    // 👇 이 부분(components, security)을 추가해 주세요!
    // 👇 아래 components 및 security 설정 추가
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};




export const specs = swaggerJSDoc(options);