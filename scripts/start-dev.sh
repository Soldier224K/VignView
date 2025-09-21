#!/bin/bash

# VighnView Development Server Startup Script
# This script starts all development servers for VighnView

set -e

echo "🚀 Starting VighnView Development Servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please run setup.sh first."
    exit 1
fi

# Function to start backend server
start_backend() {
    print_status "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    print_success "Backend server started (PID: $BACKEND_PID)"
}

# Function to start frontend server
start_frontend() {
    print_status "Starting frontend server..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    print_success "Frontend server started (PID: $FRONTEND_PID)"
}

# Function to start AI service
start_ai_service() {
    print_status "Starting AI service..."
    cd ai-services
    source venv/bin/activate
    python app.py &
    AI_PID=$!
    cd ..
    print_success "AI service started (PID: $AI_PID)"
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$AI_PID" ]; then
        kill $AI_PID 2>/dev/null || true
    fi
    print_success "All servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start servers
start_backend
sleep 2
start_frontend
sleep 2
start_ai_service

echo ""
echo "🎉 All development servers are running!"
echo ""
echo "📱 Web App: http://localhost:3001"
echo "🔧 Backend API: http://localhost:3000"
echo "📚 API Docs: http://localhost:3000/api/docs"
echo "🤖 AI Service: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
wait