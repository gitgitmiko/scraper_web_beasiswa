#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script untuk mengecek database connection
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_database_connection():
    print("🔍 Testing Database Connection")
    print("=============================")
    
    # Check environment variables
    database_url = os.getenv('DATABASE_URL')
    print(f"📊 DATABASE_URL: {'✅ Set' if database_url else '❌ Not set'}")
    
    if database_url:
        print(f"🔗 Database URL: {database_url[:50]}...")
    
    # Try to import psycopg2
    try:
        import psycopg2
        print("✅ psycopg2 imported successfully")
        
        # Try to connect to database
        if database_url:
            try:
                conn = psycopg2.connect(database_url)
                cursor = conn.cursor()
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                print(f"✅ Database connected successfully!")
                print(f"📊 PostgreSQL version: {version[0]}")
                cursor.close()
                conn.close()
            except Exception as e:
                print(f"❌ Database connection failed: {e}")
        else:
            print("⚠️ DATABASE_URL not set, skipping connection test")
            
    except ImportError as e:
        print(f"❌ psycopg2 import failed: {e}")
        print("💡 Try installing: pip install psycopg2-binary")
    
    # Check other environment variables
    vercel_url = os.getenv('VERCEL_URL')
    telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
    telegram_chat_id = os.getenv('TELEGRAM_CHAT_ID')
    
    print(f"\n📋 Environment Variables:")
    print(f"• VERCEL_URL: {'✅ Set' if vercel_url else '❌ Not set'}")
    print(f"• TELEGRAM_BOT_TOKEN: {'✅ Set' if telegram_token else '❌ Not set'}")
    print(f"• TELEGRAM_CHAT_ID: {'✅ Set' if telegram_chat_id else '❌ Not set'}")

if __name__ == "__main__":
    test_database_connection() 