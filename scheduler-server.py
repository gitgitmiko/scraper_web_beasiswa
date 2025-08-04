#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scheduler Server untuk Scraping Beasiswa
Menggantikan scheduler-server-working.js
"""

import os
import sys
import time
import json
import logging
import asyncio
import subprocess
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Scheduler state
scheduler_state = {
    'isRunning': False,
    'isEnabled': False,
    'lastUpdate': None,
    'nextUpdate': None,
    'isUpdating': False,
    'logs': []
}

# Environment variables
DATABASE_URL = os.getenv('DATABASE_URL')
VERCEL_URL = os.getenv('VERCEL_URL', 'https://scrapingbeasiswaweb.vercel.app')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SCHEDULER_PORT = int(os.getenv('SCHEDULER_PORT', 3001))

def get_next_update_time():
    """Get next update time (17:00 UTC = 00:00 WIB)"""
    now = datetime.now(timezone.utc)
    next_update = now.replace(hour=17, minute=0, second=0, microsecond=0)
    
    if now.hour >= 17:
        next_update += timedelta(days=1)
    
    return next_update.isoformat()

def send_telegram_notification(message):
    """Send Telegram notification"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("Telegram credentials not configured")
        return
    
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            'chat_id': TELEGRAM_CHAT_ID,
            'text': message,
            'parse_mode': 'HTML'
        }
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 200:
            logger.info("Telegram notification sent successfully")
        else:
            logger.error(f"Failed to send Telegram notification: {response.status_code}")
    except Exception as e:
        logger.error(f"Error sending Telegram notification: {e}")

def execute_scraping():
    """Execute scraping process"""
    if scheduler_state['isUpdating']:
        logger.warning("Scraping already in progress, skipping...")
        return
    
    try:
        logger.info("🔄 Starting scraping process...")
        scheduler_state['isUpdating'] = True
        
        # Clear previous logs from database
        try:
            response = requests.delete(f"{VERCEL_URL}/api/logs", timeout=10)
            logger.info("🗑️ Previous logs cleared from database")
        except Exception as e:
            logger.error(f"Failed to clear previous logs: {e}")
        
        # Clear previous logs from memory
        scheduler_state['logs'] = []
        
        # Add initial log
        initial_log = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'message': '[START] Memulai proses scraping...',
            'level': 'INFO'
        }
        scheduler_state['logs'].append(initial_log)
        
        # Save initial log to database
        try:
            response = requests.post(
                f"{VERCEL_URL}/api/logs",
                json={'logs': [initial_log]},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
        except Exception as e:
            logger.error(f"Failed to save initial log to database: {e}")
        
        # Test Python environment
        logger.info("🔍 Testing Python environment...")
        try:
            import requests as req
            import bs4
            import selenium
            import fake_useragent
            import webdriver_manager
            import aiohttp
            import dotenv
            
            # Try to import optional dependencies
            try:
                import psycopg2
                logger.info("✅ psycopg2 imported successfully")
            except ImportError:
                logger.warning("⚠️ psycopg2 not available, continuing without database connection")
            
            try:
                import pandas
                logger.info("✅ pandas imported successfully")
            except ImportError:
                logger.warning("⚠️ pandas not available, continuing without pandas")
            
            try:
                import lxml
                logger.info("✅ lxml imported successfully")
            except ImportError:
                logger.warning("⚠️ lxml not available, continuing without lxml")
            
            try:
                import openpyxl
                logger.info("✅ openpyxl imported successfully")
            except ImportError:
                logger.warning("⚠️ openpyxl not available, continuing without openpyxl")
            
            logger.info("✅ Core Python dependencies imported successfully!")
        except ImportError as e:
            logger.error(f"❌ Core Python dependency import failed: {e}")
            raise
        
        # Execute main scraper
        logger.info("🔍 Executing main scraper...")
        start_time = time.time()
        
        # Run main_scraper.py
        result = subprocess.run(
            [sys.executable, 'main_scraper.py'],
            capture_output=True,
            text=True,
            cwd=os.getcwd(),
            env={**os.environ, 'PYTHONIOENCODING': 'utf-8'}
        )
        
        end_time = time.time()
        duration = f"{int(end_time - start_time)} detik"
        
        # Process output
        if result.stdout:
            logger.info(f"📊 Scraper output: {result.stdout}")
        
        if result.stderr:
            logger.error(f"❌ Scraper error: {result.stderr}")
        
        # Handle completion
        scheduler_state['isUpdating'] = False
        scheduler_state['lastUpdate'] = datetime.now(timezone.utc).isoformat()
        
        if result.returncode == 0:
            logger.info("[SUCCESS] Scraping completed successfully")
            
            # Add success log
            success_log = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'message': '[SUCCESS] Scraping selesai dengan sukses',
                'level': 'SUCCESS'
            }
            scheduler_state['logs'].append(success_log)
            
            # Get beasiswa count
            try:
                response = requests.get(f"{VERCEL_URL}/api/beasiswa", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    total_beasiswa = len(data.get('data', []))
                else:
                    total_beasiswa = 'N/A'
            except Exception as e:
                logger.error(f"Failed to get beasiswa count: {e}")
                total_beasiswa = 'N/A'
            
            # Send success notification
            success_message = f"""
✅ <b>Scraping Beasiswa Berhasil!</b>

📊 <b>Detail:</b>
• Status: Berhasil
• Waktu Selesai: {datetime.now().strftime('%d/%m/%Y, %H.%M.%S')}
• Total Beasiswa: {total_beasiswa}
• Durasi: {duration}
• Retry Attempts: 1

🤖 Notifikasi otomatis dari sistem scraping beasiswa
            """
            send_telegram_notification(success_message)
            
        else:
            logger.error(f"[ERROR] Scraping failed with code: {result.returncode}")
            
            # Add error log
            error_log = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'message': f'[ERROR] Scraping gagal dengan kode: {result.returncode}',
                'level': 'ERROR'
            }
            scheduler_state['logs'].append(error_log)
            
            # Send failure notification
            failure_message = f"""
❌ <b>Scraping Beasiswa Gagal</b>

🚨 <b>Detail Error:</b>
• Status: Gagal
• Waktu Error: {datetime.now().strftime('%d/%m/%Y, %H.%M.%S')}
• Error Message: Scraping failed with code: {result.returncode}
• Retry Attempts: 1
• Durasi: {duration}

⚠️ Action Required: Silakan periksa sistem scraping secara manual untuk mengatasi masalah ini.

🤖 Notifikasi otomatis dari sistem scraping beasiswa
            """
            send_telegram_notification(failure_message)
        
        # Save logs to database
        try:
            response = requests.post(
                f"{VERCEL_URL}/api/logs",
                json={'logs': scheduler_state['logs']},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
        except Exception as e:
            logger.error(f"Failed to save logs to database: {e}")
        
        # Update next update time
        scheduler_state['nextUpdate'] = get_next_update_time()
        
    except Exception as e:
        scheduler_state['isUpdating'] = False
        logger.error(f"❌ Scraping execution failed: {e}")
        
        # Send execution error notification
        error_message = f"""
❌ <b>Scraping Beasiswa Gagal</b>

🚨 <b>Detail Error:</b>
• Status: Gagal
• Waktu Error: {datetime.now().strftime('%d/%m/%Y, %H.%M.%S')}
• Error Message: {str(e)}
• Retry Attempts: 1
• Durasi: N/A

⚠️ Action Required: Silakan periksa sistem scraping secara manual untuk mengatasi masalah ini.

🤖 Notifikasi otomatis dari sistem scraping beasiswa
        """
        send_telegram_notification(error_message)
        
        raise

# API Endpoints
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'service': 'scheduler-service',
        'scheduler': {
            'isRunning': scheduler_state['isRunning'],
            'isEnabled': scheduler_state['isEnabled'],
            'lastUpdate': scheduler_state['lastUpdate'],
            'nextUpdate': scheduler_state['nextUpdate'],
            'isUpdating': scheduler_state['isUpdating']
        }
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Get scheduler status"""
    return jsonify({
        'isRunning': scheduler_state['isRunning'],
        'isEnabled': scheduler_state['isEnabled'],
        'lastUpdate': scheduler_state['lastUpdate'],
        'nextUpdate': scheduler_state['nextUpdate'],
        'isUpdating': scheduler_state['isUpdating']
    })

@app.route('/logs', methods=['GET'])
def get_logs():
    """Get logs"""
    log_messages = []
    for log in scheduler_state['logs']:
        if isinstance(log, dict) and 'message' in log:
            log_messages.append(log['message'])
        else:
            log_messages.append(str(log))
    
    return jsonify({'logs': log_messages})

@app.route('/start', methods=['POST'])
def start_scheduler():
    """Start scheduler"""
    try:
        logger.info("🚀 Starting scheduler...")
        
        if scheduler_state['isRunning']:
            return jsonify({'message': 'Scheduler is already running'})
        
        scheduler_state['isRunning'] = True
        scheduler_state['isEnabled'] = True
        scheduler_state['nextUpdate'] = get_next_update_time()
        
        logger.info("✅ Scheduler started successfully")
        logger.info(f"📅 Next update: {scheduler_state['nextUpdate']}")
        
        return jsonify({
            'message': 'Scheduler started successfully',
            'nextUpdate': scheduler_state['nextUpdate']
        })
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
        return jsonify({
            'error': 'Failed to start scheduler',
            'message': str(e)
        }), 500

@app.route('/stop', methods=['POST'])
def stop_scheduler():
    """Stop scheduler"""
    try:
        logger.info("🛑 Stopping scheduler...")
        
        scheduler_state['isRunning'] = False
        scheduler_state['isEnabled'] = False
        scheduler_state['nextUpdate'] = None
        
        logger.info("✅ Scheduler stopped successfully")
        
        return jsonify({'message': 'Scheduler stopped successfully'})
    except Exception as e:
        logger.error(f"Failed to stop scheduler: {e}")
        return jsonify({
            'error': 'Failed to stop scheduler',
            'message': str(e)
        }), 500

@app.route('/execute', methods=['POST'])
def execute_manual():
    """Manual execution"""
    try:
        logger.info("🔧 Manual execution requested")
        
        if scheduler_state['isUpdating']:
            return jsonify({
                'error': 'Scraping already in progress',
                'message': 'Please wait for current scraping to complete'
            }), 400
        
        # Execute scraping in background
        import threading
        thread = threading.Thread(target=execute_scraping)
        thread.daemon = True
        thread.start()
        
        return jsonify({'message': 'Manual execution started successfully'})
    except Exception as e:
        logger.error(f"Failed to execute manual scraping: {e}")
        return jsonify({
            'error': 'Failed to execute manual scraping',
            'message': str(e)
        }), 500

@app.route('/reset', methods=['POST'])
def reset_scheduler():
    """Reset stuck state"""
    try:
        logger.info("[WARNING] Resetting scheduler state")
        scheduler_state['isUpdating'] = False
        scheduler_state['isRunning'] = False
        scheduler_state['isEnabled'] = False
        scheduler_state['lastUpdate'] = None
        scheduler_state['nextUpdate'] = None
        
        return jsonify({'message': 'Scheduler state reset successfully'})
    except Exception as e:
        logger.error(f"Failed to reset scheduler state: {e}")
        return jsonify({
            'error': 'Failed to reset scheduler state',
            'message': str(e)
        }), 500

@app.route('/beasiswa', methods=['GET'])
def get_beasiswa():
    """Get beasiswa data"""
    try:
        kategori = request.args.get('kategori')
        
        # Forward to main API
        api_url = f"{VERCEL_URL}/api/beasiswa"
        if kategori:
            api_url += f"?kategori={kategori}"
        
        response = requests.get(api_url, timeout=10)
        return jsonify(response.json())
    except Exception as e:
        logger.error(f"Failed to fetch beasiswa data: {e}")
        return jsonify({
            'error': 'Failed to fetch beasiswa data',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """404 handler"""
    return jsonify({'error': 'Endpoint not found'}), 404

if __name__ == '__main__':
    logger.info(f"🚀 Scheduler Service running on http://localhost:{SCHEDULER_PORT}")
    logger.info(f"📊 Health check: http://localhost:{SCHEDULER_PORT}/health")
    logger.info(f"📈 Status: http://localhost:{SCHEDULER_PORT}/status")
    logger.info("⏰ Auto update scheduled for 00:00 WIB (17:00 UTC) daily")
    
    app.run(host='0.0.0.0', port=SCHEDULER_PORT, debug=False) 