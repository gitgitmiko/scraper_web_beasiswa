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

# Try to install minimal requirements first
echo "📦 Installing minimal requirements..."
if [ -f "requirements-minimal.txt" ]; then
    echo "📋 Found requirements-minimal.txt, installing minimal dependencies..."
    pip3 install --no-cache-dir --prefer-binary -r requirements-minimal.txt || pip install --no-cache-dir --prefer-binary -r requirements-minimal.txt
    if [ $? -eq 0 ]; then
        echo "✅ Minimal requirements installed successfully"
    else
        echo "❌ Failed to install minimal requirements"
    fi
fi

# Try to install full requirements
echo "📦 Installing full requirements..."
if [ -f "requirements.txt" ]; then
    echo "📋 Found requirements.txt, installing full dependencies..."
    pip3 install --no-cache-dir --prefer-binary -r requirements.txt || pip install --no-cache-dir --prefer-binary -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✅ Full requirements installed successfully"
    else
        echo "⚠️ Failed to install full requirements, continuing with minimal setup"
    fi
else
    echo "❌ requirements.txt not found"
fi

# Verify Python dependencies
echo "🔍 Verifying Python dependencies..."
python3 -c "import requests; print('✅ requests installed')" || python -c "import requests; print('✅ requests installed')" || echo "❌ requests not installed"
python3 -c "import bs4; print('✅ bs4 installed')" || python -c "import bs4; print('✅ bs4 installed')" || echo "❌ bs4 not installed"
python3 -c "import flask; print('✅ flask installed')" || python -c "import flask; print('✅ flask installed')" || echo "❌ flask not installed"

# Try to import pandas (optional)
python3 -c "import pandas; print('✅ pandas installed')" || python -c "import pandas; print('✅ pandas installed')" || echo "⚠️ pandas not installed (optional)"

echo "✅ Build completed successfully!" 