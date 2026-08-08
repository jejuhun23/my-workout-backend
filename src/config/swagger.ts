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
      {
        url: 'http://localhost:3000',
        description: 'Local Server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // 라우트 파일 위치
};




export const specs = swaggerJSDoc(options);