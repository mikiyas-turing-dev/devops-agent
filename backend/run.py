#!/usr/bin/env python3
"""
Development server runner for DevOps Agent Backend
"""

if __name__ == "__main__":
    from dotenv import load_dotenv
    
    # Load environment variables from .env file
    load_dotenv()
    
    import uvicorn
    
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )