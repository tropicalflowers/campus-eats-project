# Campus Eats - Setup & Running Guide

## Quick Start

### 1. Install Dependencies
```bash
cd campus-eats
npm install
```

### 2. Setup Firebase Credentials
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Go to [Firebase Console](https://console.firebase.google.com/)

3. Select your project and get credentials from **Project Settings**

4. Fill in your `.env` file with your Firebase credentials:
   ```
   REACT_APP_FIREBASE_API_KEY=your_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### 3. Run the Project

**Start both frontend and backend together:**
```bash
npm run dev
```

**Or run individually:**
```bash
npm start          # Frontend only (http://localhost:3000)
npm run server     # Backend only (http://localhost:5000)
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start React dev server (port 3000) |
| `npm run server` | Start Node.js backend server (port 5000) |
| `npm run dev` | Start both servers concurrently |
| `npm run build` | Build for production |
| `npm test` | Run tests |

## Important Security Notes

⚠️ **NEVER commit these files to GitHub:**
- `.env` - Contains API keys and credentials
- `.env.local` - Local environment overrides
- Firebase service account JSON files
- Private keys or tokens

✅ **What's in `.gitignore`:**
- Environment files (`.env*`)
- Firebase credentials
- node_modules
- Build outputs

## Project Structure

```
campus-eats/
├── public/              # Static files & JSON data
├── src/
│   ├── App.js          # Main app component
│   ├── firebase.js      # Firebase configuration (uses .env)
│   ├── AuthContext.js   # Authentication logic
│   ├── DayScholar.js    # Day scholar page
│   ├── Hosteller.js     # Hosteller page
│   └── Manager.js       # Manager page
├── server.js            # Express backend
└── package.json         # Dependencies
```

## Troubleshooting

**Port 3000 or 5000 already in use?**
```bash
# On Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Firebase errors?**
- Check that `.env` file exists and has correct values
- Verify you're using the right Firebase project
- Clear browser cache and restart dev server

---

For more details, see `FIREBASE_SETUP_GUIDE.md`
