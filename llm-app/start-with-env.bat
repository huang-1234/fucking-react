@echo off
echo Setting environment variables...
set PORT=3000
set NODE_ENV=development
set OPENAI_API_KEY=your_openai_api_key_here
set OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
set CORS_ORIGIN=*

echo Starting NestJS server...
npx ts-node --skipProject src/main.ts
pause
