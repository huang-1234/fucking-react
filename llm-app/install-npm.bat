@echo off
echo Installing core dependencies with npm...
npm install @nestjs/common @nestjs/config @nestjs/core @nestjs/platform-express @nestjs/websockets express openai rxjs @codegenie/serverless-express@4.17.0 socket.io reflect-metadata

echo Installing dev dependencies...
npm install --save-dev typescript ts-node ts-node-dev @types/node @types/express

echo Installation completed!
echo You can now run 'npm run start:dev' to start the development server
pause
