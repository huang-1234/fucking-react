#!/bin/bash

# Navigate to the nodejs directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Start the development server
echo "Starting Vite development server..."
pnpm run dev
