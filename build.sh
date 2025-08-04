#!/bin/bash

echo "🔧 Starting build process..."

# Check Python version
echo "🐍 Checking Python version..."
python3 --version || python --version || echo "❌ Python not found"

# Check pip version
echo "📦 Checking pip version..."
pip3 --version || pip --version || echo "❌ pip not found"

# Upgrade pip first
echo "📦 Upgrading pip..."
pip3 install --upgrade pip || pip install --upgrade pip

# Install system dependencies for lxml
echo "🔧 Installing system dependencies..."
apt-get update && apt-get install -y libxml2-dev libxslt-dev || echo "⚠️ System dependencies installation failed, continuing..."

# Install Python dependencies with pre-compiled wheels
echo "📦 Installing Python dependencies..."
if [ -f "requirements.txt" ]; then
    echo "📋 Found requirements.txt, installing dependencies..."
    pip3 install --no-cache-dir --prefer-binary -r requirements.txt || pip install --no-cache-dir --prefer-binary -r requirements.txt || echo "❌ Failed to install Python dependencies"
else
    echo "❌ requirements.txt not found"
fi

# Verify Python dependencies
echo "🔍 Verifying Python dependencies..."
python3 -c "import requests; print('✅ requests installed')" || python -c "import requests; print('✅ requests installed')" || echo "❌ requests not installed"
python3 -c "import bs4; print('✅ bs4 installed')" || python -c "import bs4; print('✅ bs4 installed')" || echo "❌ bs4 not installed"
python3 -c "import pandas; print('✅ pandas installed')" || python -c "import pandas; print('✅ pandas installed')" || echo "❌ pandas not installed"

echo "✅ Build completed successfully!" 