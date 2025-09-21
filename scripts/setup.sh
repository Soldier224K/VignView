#!/bin/bash

# VighnView Setup Script
# This script sets up the development environment for VighnView

set -e

echo "🚀 Setting up VighnView Development Environment..."

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+"
        exit 1
    fi
    
    # Check Flutter (optional)
    if ! command -v flutter &> /dev/null; then
        print_warning "Flutter is not installed. Mobile app development will not be available."
        print_warning "Install Flutter from https://flutter.dev/docs/get-started/install"
    fi
    
    # Check PostgreSQL (optional)
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. You'll need to set up a database."
        print_warning "Install PostgreSQL from https://www.postgresql.org/download/"
    fi
    
    # Check Redis (optional)
    if ! command -v redis-server &> /dev/null; then
        print_warning "Redis is not installed. Caching will not be available."
        print_warning "Install Redis from https://redis.io/download"
    fi
    
    print_success "System requirements check completed"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_warning "Please edit .env file with your configuration"
    else
        print_status ".env file already exists"
    fi
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
        print_success "Backend dependencies installed"
    else
        print_status "Backend dependencies already installed"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
        print_success "Frontend dependencies installed"
    else
        print_status "Frontend dependencies already installed"
    fi
    
    cd ..
}

# Setup AI services
setup_ai_services() {
    print_status "Setting up AI services..."
    
    cd ai-services
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    fi
    
    # Activate virtual environment and install dependencies
    print_status "Installing AI service dependencies..."
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    print_success "AI service dependencies installed"
    
    # Create models directory
    mkdir -p models
    
    cd ..
}

# Setup mobile app
setup_mobile() {
    if command -v flutter &> /dev/null; then
        print_status "Setting up mobile app..."
        
        cd mobile
        
        if [ ! -d "build" ]; then
            print_status "Getting Flutter dependencies..."
            flutter pub get
            print_success "Flutter dependencies installed"
        else
            print_status "Flutter dependencies already installed"
        fi
        
        cd ..
    else
        print_warning "Skipping mobile setup - Flutter not installed"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL is available"
        print_warning "Please create a database named 'vighnview' and update .env file"
        print_warning "Run: createdb vighnview"
    else
        print_warning "PostgreSQL not available - please set up database manually"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p ai-services/models
    mkdir -p mobile/assets/images
    mkdir -p mobile/assets/icons
    mkdir -p mobile/assets/animations
    mkdir -p mobile/assets/fonts
    
    print_success "Directories created"
}

# Main setup function
main() {
    echo "🌱 VighnView - Smart Civic Monitoring Platform"
    echo "=============================================="
    echo ""
    
    check_requirements
    setup_environment
    create_directories
    setup_backend
    setup_frontend
    setup_ai_services
    setup_mobile
    setup_database
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Set up PostgreSQL database"
    echo "3. Run 'npm run dev' to start development servers"
    echo "4. Visit http://localhost:3001 for the web app"
    echo "5. Visit http://localhost:3000/api/docs for API documentation"
    echo ""
    echo "For mobile development:"
    echo "1. cd mobile"
    echo "2. flutter run"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"