# Local MongoDB Setup Guide for Windows

## Download and Install

1. Download MongoDB Community Server from:
   https://www.mongodb.com/try/download/community

2. Choose:
   - Version: Latest (7.0 or higher)
   - Platform: Windows
   - Package: MSI

3. Run the installer:
   - Choose "Complete" installation
   - Install MongoDB as a Service (check this option)
   - Install MongoDB Compass (optional GUI tool)

## Verify Installation

Open Command Prompt and run:
```bash
mongod --version
```

## Check if MongoDB Service is Running

Open Services (Win + R, type `services.msc`):
- Look for "MongoDB Server"
- Status should be "Running"
- If not, right-click and select "Start"

## Update .env

Use this connection string in your .env file:
```
MONGODB_URI=mongodb://127.0.0.1:27017/eventease
```

## Test Connection

After setting up, run:
```bash
npm run db:reset
```

This will seed your database with demo data.
