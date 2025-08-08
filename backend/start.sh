#!/bin/bash
# Start the DevOps Agent Backend

echo "🚀 Starting DevOps Agent Backend..."
echo "📡 API will be available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies if needed
if [ ! -f ".dependencies_installed" ]; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    touch .dependencies_installed
fi

# Start the server
python run.py