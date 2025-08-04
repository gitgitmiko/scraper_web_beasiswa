#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script untuk mengecek Python dependencies
"""

import sys
import os

def test_python_dependencies():
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Current directory: {os.getcwd()}")
    print(f"🔧 Python executable: {sys.executable}")
    
    # Test imports
    dependencies = [
        'requests',
        'bs4',
        'pandas', 
        'lxml',
        'selenium',
        'fake_useragent',
        'webdriver_manager',
        'aiohttp',
        'dotenv',
        'openpyxl',
        'psycopg2'
    ]
    
    failed_deps = []
    
    for dep in dependencies:
        try:
            if dep == 'bs4':
                import bs4
                print(f"✅ {dep} module imported successfully")
            elif dep == 'fake_useragent':
                import fake_useragent
                print(f"✅ {dep} module imported successfully")
            elif dep == 'webdriver_manager':
                import webdriver_manager
                print(f"✅ {dep} module imported successfully")
            elif dep == 'dotenv':
                import dotenv
                print(f"✅ {dep} module imported successfully")
            else:
                __import__(dep)
                print(f"✅ {dep} module imported successfully")
        except ImportError as e:
            print(f"❌ {dep} module import failed: {e}")
            failed_deps.append(dep)
    
    if failed_deps:
        print(f"\n❌ Failed dependencies: {', '.join(failed_deps)}")
        return False
    else:
        print("\n🎉 All dependencies imported successfully!")
        return True

if __name__ == "__main__":
    success = test_python_dependencies()
    sys.exit(0 if success else 1) 