# 🚀 Render Deployment Guide

## Pre-deployment Checklist

- [ ] MongoDB Atlas cluster created and credentials ready
- [ ] Git repository pushed with all changes
- [ ] Environment variables documented
- [ ] Both client and server build successfully locally

---

## Step 1: Set up services on Render

### Option A: Using render.yaml (Recommended)
1. Go to [https://render.com](https://render.com)
2. Connect your GitHub repo
3. Click "Deploy" – Render will auto-detect `render.yaml`
4. Configure environment variables (see below)

### Option B: Manual setup
Create two services:

#### Service 1: mascertify-api (Backend)
- **Type:** Web Service
- **Runtime:** Node
- **Build Command:** `cd server && npm install`
- **Start Command:** `cd server && node index.js`
- **Environment Variables:**
  ```
  NODE_ENV=production
  MONGO_URI=<your-atlas-connection-string>
  JWT_SECRET=<generate-random-secret>
  JWT_EXPIRE=7d
  CLIENT_URL=https://mascertify.onrender.com
  ```

#### Service 2: mascertify-client (Frontend)
- **Type:** Web Service
- **Runtime:** Node
- **Build Command:** `cd client && npm install && npm run build`
- **Start Command:** `cd client && npm run serve`
- **Environment Variables:**
  ```
  VITE_API_URL=https://mascertify-api.onrender.com
  ```

---

## Step 2: Connect MongoDB Atlas

1. Get your connection string from MongoDB Atlas:
   - Go to Clusters → Connect → Drivers
   - Copy the connection string
   - Format: `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority`

2. Add to environment variable:
   - **Key:** `MONGO_URI`
   - **Value:** Your connection string with real credentials

---

## Step 3: Environment Variables on Render

Set these in your Render services:

### Backend (mascertify-api)
```
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.ww8drhj.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRE=7d
CLIENT_URL=https://mascertify.onrender.com
PORT=10000
```

### Frontend (mascertify-client)
```
VITE_API_URL=https://mascertify-api.onrender.com
```

---

## Step 4: Deploy & Test

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production: Render deployment ready"
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to Render dashboard
   - Watch build logs in real-time
   - Check "Events" tab for deployment status

3. **Test endpoints:**
   ```bash
   # Health check
   curl https://mascertify-api.onrender.com/api/health
   
   # Should return: {"status":"ok","app":"MAScertify"}
   ```

4. **Test frontend:**
   - Visit `https://mascertify.onrender.com`
   - Register as organization
   - Create a certificate
   - Verify in MongoDB Atlas that docs are saved

---

## Troubleshooting

### Service won't build
- Check build logs in Render dashboard
- Ensure `package.json` has all dependencies
- Run `npm install` locally to verify

### API 502/503 errors
- Check backend service logs
- Verify `MONGO_URI` is correct
- Ensure MongoDB Atlas allows Render IPs (allow all: 0.0.0.0/0)

### Frontend can't reach API
- Verify `VITE_API_URL` is set to backend service URL
- Check browser console for CORS errors
- Backend should log: `CLIENT_URL=[frontend-url]`

### MongoDB connection timeout
- Check `MONGO_URI` credentials
- Whitelist Render's IP in MongoDB Atlas Network Access
- Ensure database exists with correct name `mascertify`

---

## Performance Tips

- Enable Render's auto-deploy for main branch
- Use production database with backups enabled
- Monitor logs: Render dashboard → Services → Logs
- Set up Render alerts for deployment failures

---

## Security Checklist

- [ ] JWT_SECRET is cryptographically random (32+ chars)
- [ ] MONGO_URI has restricted database user (not admin)
- [ ] CLIENT_URL matches your domain exactly
- [ ] No secrets in `.env` files (only `.env.example`)
- [ ] `NODE_ENV=production` set on backend

---

For more: [https://render.com/docs](https://render.com/docs)
