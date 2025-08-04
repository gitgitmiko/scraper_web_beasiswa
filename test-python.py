#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script untuk mengecek Python dan dependencies
"""

import sys
import os

def test_python():
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Current directory: {os.getcwd()}")
    print(f"🔧 Python executable: {sys.executable}")
    
    # Test imports
    try:
        import requests
        print("✅ requests module imported successfully")
    except ImportError as e:
        print(f"❌ requests module import failed: {e}")
        return False
    
    try:
        import bs4
        print("✅ beautifulsoup4 (bs4) module imported successfully")
    except ImportError as e:
        print(f"❌ beautifulsoup4 (bs4) module import failed: {e}")
        return False
    
    try:
        import pandas
        print("✅ pandas module imported successfully")
    except ImportError as e:
        print(f"❌ pandas module import failed: {e}")
        return False
    
    try:
        import lxml
        print("✅ lxml module imported successfully")
    except ImportError as e:
        print(f"❌ lxml module import failed: {e}")
        return False
    
    print("🎉 All tests passed!")
    return True

if __name__ == "__main__":
    success = test_python()
    sys.exit(0 if success else 1) 