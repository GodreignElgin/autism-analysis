# Installation & Deployment Guide

## Complete Setup Instructions

### System Requirements

- **OS**: Windows, macOS, or Linux
- **Python**: 3.11.x
- **Node.js**: 14 or higher
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 5GB free space for dependencies and models

### Step 1: Clone/Download Project

```bash
# Navigate to your desired location
cd /path/to/projects

# Download or clone the project
# If you have git: git clone <repository-url>
# Or download as ZIP and extract
```

### Step 2: Backend Setup

#### 2.1 Install uv and provision Python

```bash
cd backend

pip install uv
uv python install 3.11
```

#### 2.2 Install Dependencies

```bash
uv sync
```

**Note**: This may take 5-10 minutes due to TensorFlow installation.

#### 2.3 Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for development)
# nano .env  # or use your text editor
```

#### 2.4 Initialize Database

```bash
uv run python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

#### 2.5 Run Backend Server

```bash
uv run python app.py
```

**Expected output**:

```
Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

Backend is now running on: `http://localhost:5000`

### Step 3: Frontend Setup (New Terminal)

#### 3.1 Navigate to Frontend

```bash
cd frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

**Note**: This may take 3-5 minutes.

#### 3.3 Configure Environment (Optional)

```bash
# Copy environment template
cp .env.example .env

# Edit if you want custom API URL
# nano .env  # or use your text editor
```

#### 3.4 Start Development Server

```bash
npm start
```

**Expected output**:

```
Compiled successfully!
You can now view autism-detection-frontend in the browser.
  Local:            http://localhost:3000
```

Browser will automatically open to: `http://localhost:3000`

## Troubleshooting

### Python/Backend Issues

#### ImportError: No module named 'tensorflow'

```bash
# Sync dependencies and ensure Python 3.11 is used
uv python install 3.11
uv sync
```

#### Port 5000 Already in Use

```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux - Find and kill process
lsof -ti:5000 | xargs kill -9

# Or change port in app.py (line 55)
# app.run(debug=True, host='0.0.0.0', port=5001)
```

#### Database Locked

```bash
# Delete old database
rm backend/autism_detection.db
# Or on Windows
del backend\autism_detection.db

# Reinitialize
uv run python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### Node.js/Frontend Issues

#### npm: command not found

Install Node.js from: https://nodejs.org/ (LTS version)

#### Port 3000 Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
set PORT=3001 && npm start  # Windows
PORT=3001 npm start         # macOS/Linux
```

#### npm ERR! ERESOLVE unable to resolve dependency tree

```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

#### Module not found errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Connection Issues

#### Frontend can't connect to backend

1. **Ensure backend is running**: Check terminal shows `Running on http://127.0.0.1:5000`

2. **Check CORS**: In `backend/app.py`, CORS is already configured for localhost:3000

3. **Check API URL**: In `frontend/src/context/AuthContext.js` (line 30):

   ```javascript
   const response = await fetch('http://localhost:5000/api/auth/profile', {
   ```

4. **Verify network**: Make sure firewall isn't blocking ports 3000 and 5000

## Training the ML Model

### Dataset Preparation

1. **Create dataset directory structure**:

```
datasets/
├── positive/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
└── negative/
    ├── image1.jpg
    ├── image2.jpg
    └── ...
```

2. **Gather images**:

   - Positive: Images showing autism spectrum characteristics
   - Negative: Baseline images without indicators
   - Recommend: 500+ images per category
   - Size: 224x224 pixels (resized automatically)

3. **Run training script**:

```bash
cd ml_model
python train_model.py
```

### Model Output

- Model saved to: `ml_model/autism_model.h5`
- Training history saved to: `ml_model/training_history.pkl`

## Production Deployment

### Backend Deployment (Heroku Example)

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Create Heroku app**:

```bash
heroku create your-app-name
```

3. **Set environment variables**:

```bash
heroku config:set JWT_SECRET_KEY=your-long-random-secret-key
heroku config:set FLASK_ENV=production
```

4. **Create necessary files**:

```bash
# In backend folder, create:
# Procfile
echo "web: gunicorn app:app" > Procfile

# runtime.txt
echo "python-3.11.11" > runtime.txt
```

5. **Deploy**:

```bash
git init
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**:

```bash
npm i -g vercel
```

2. **Deploy**:

```bash
cd frontend
vercel
```

3. **Configure API URL**: Set `REACT_APP_API_URL` in environment variables

### Frontend Deployment (Netlify)

1. **Build frontend**:

```bash
cd frontend
npm run build
```

2. **Deploy folder `frontend/build` to Netlify**

3. **Configure redirect**: Create `public/_redirects`:

```
/* /index.html 200
```

## Security Checklist

- [ ] Change `JWT_SECRET_KEY` to a long random string
- [ ] Use HTTPS in production
- [ ] Set `DEBUG = False` in production
- [ ] Configure `CORS_ORIGINS` for your domain only
- [ ] Use PostgreSQL instead of SQLite in production
- [ ] Enable HTTPS redirection
- [ ] Set up database backups
- [ ] Configure proper file upload directory
- [ ] Set up logging and monitoring
- [ ] Review and update dependencies regularly

## Performance Optimization

### Backend

- Use Gunicorn instead of Flask development server
- Configure caching headers
- Use database connection pooling
- Optimize image preprocessing

### Frontend

- Enable production build: `npm run build`
- Use CDN for static assets
- Implement code splitting
- Enable gzip compression

## Monitoring & Logging

### Backend Logs

```bash
# View logs (production)
heroku logs --tail
```

### Frontend Logs

```bash
# Check browser console (F12)
# Application → Console tab
```

## Database Backup

### SQLite

```bash
# Simple backup
cp backend/autism_detection.db backend/autism_detection.backup.db
```

### PostgreSQL (Production)

```bash
# Backup
pg_dump dbname > backup.sql

# Restore
psql dbname < backup.sql
```

## Common Configuration Changes

### Change API Port

In `backend/app.py` (last line):

```python
# Change from:
app.run(debug=True, host='0.0.0.0', port=5000)
# To:
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Change Frontend Port

```bash
# Set PORT environment variable
set PORT=3001 && npm start  # Windows
PORT=3001 npm start         # macOS/Linux
```

### Change Database

In `backend/config.py`:

```python
# For PostgreSQL:
SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@localhost:5432/autism_db'

# For MySQL:
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://user:password@localhost/autism_db'
```

## Regular Maintenance

### Weekly

- [ ] Review error logs
- [ ] Check for security updates
- [ ] Backup database

### Monthly

- [ ] Update dependencies
- [ ] Review user feedback
- [ ] Monitor API performance
- [ ] Check disk space usage

### Quarterly

- [ ] Full security audit
- [ ] Performance testing
- [ ] Database optimization
- [ ] Update documentation

## Support & Troubleshooting

### Getting Help

1. **Check logs**: Look for error messages in terminal
2. **Review documentation**: Check README.md and QUICKSTART.md
3. **Test API**: Use Postman to test endpoints
4. **Check ports**: Ensure ports 3000 and 5000 are available

### Common Error Messages

| Error                 | Solution                                                    |
| --------------------- | ----------------------------------------------------------- |
| `Connection refused`  | Backend not running                                         |
| `Module not found`    | Missing dependencies, run `uv sync` |
| `Port already in use` | Kill process or use different port                          |
| `CORS error`          | Check CORS configuration in app.py                          |
| `Database locked`     | Delete db file and reinitialize                             |

## Next Steps

1. ✅ Complete setup and verify both servers running
2. ⬜ Test basic functionality (register, login, analyze)
3. ⬜ Prepare dataset for model training
4. ⬜ Train model with your data
5. ⬜ Configure production environment variables
6. ⬜ Deploy to hosting platform
7. ⬜ Set up monitoring and logging
8. ⬜ Configure domain name and SSL

---

**Questions?** Check the README.md or QUICKSTART.md files for more information.

**Happy Deploying! 🚀**
