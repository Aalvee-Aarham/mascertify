# 🚀 Render Deployment Setup for mascertify.onrender.com

## Your Deployment URLs

- **Frontend:** https://mascertify.onrender.com (Static Site)
- **Backend API:** https://mascertify-api.onrender.com (Web Service)

---

## Quick Setup (5 minutes)

### 1. Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Render production config: mascertify.onrender.com"
git push origin main
```

### 2. Deploy to Render via Dashboard

Go to [https://render.com/dashboard](https://render.com/dashboard)

#### Service 1: Backend API (mascertify-api)
1. Click **New +** → **Web Service**
2. Connect GitHub repo
3. Configure:
   - **Name:** `mascertify-api`
   - **Runtime:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && node index.js`
   - **Plan:** Free

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=<your-atlas-connection-string>
   JWT_SECRET=<generate-random-secret>
   JWT_EXPIRE=7d
   CLIENT_URL=https://mascertify.onrender.com
   ```

#### Service 2: Frontend Static Site (mascertify)
1. Click **New +** → **Static Site**
2. Connect GitHub repo
3. Configure:
   - **Name:** `mascertify`
   - **Build Command:** `cd client && npm install && npx vite build`
   - **Publish Directory:** `client/dist`

4. **Add Environment Variable:**
   ```
   VITE_API_URL=https://mascertify-api.onrender.com
   ```

### 3. Monitor Deployment

- Both services will build automatically
- Check logs in Render dashboard
- Once deployed, test:

```bash
# Health check (API should respond)
curl https://mascertify-api.onrender.com/api/health

# Frontend should load at
https://mascertify.onrender.com
```

---

## Your Environment Files (Already Configured)

### server/.env (Production)
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://aalveeaarham_db_user:aalvee123@mascertify.ww8drhj.mongodb.net/?appName=mascertify
JWT_SECRET=mascertify_super_secret_jwt_key_2024
JWT_EXPIRE=7d
CLIENT_URL=https://mascertify.onrender.com
```

### client/.env (Production)
```
VITE_API_URL=https://mascertify-api.onrender.com
```

### client/.env.local (Local Development)
```
VITE_API_URL=http://localhost:5000
```

---

## Development vs Production Routes

| Environment | Client URL | API URL |
|---|---|---|
| **Local Dev** | http://localhost:5173 | http://localhost:5000 |
| **Render Prod** | https://mascertify.onrender.com | https://mascertify-api.onrender.com |

When you run locally, `client/.env.local` overrides production settings automatically.

---

## Testing Checklist

After deployment:

1. **Frontend loads:**
   - [ ] Visit https://mascertify.onrender.com
   - [ ] Page renders without API errors
   - [ ] Check browser console (should be clean)

2. **API responds:**
   - [ ] `GET https://mascertify-api.onrender.com/api/health`
   - [ ] Returns: `{"status":"ok","app":"MAScertify"}`

3. **Auth works:**
   - [ ] Register as organization
   - [ ] Login succeeds
   - [ ] Token saved in localStorage

4. **Database saves:**
   - [ ] Create a certificate
   - [ ] Check MongoDB Atlas → `mascertify` db → `certificates` collection
   - [ ] Document appears with certificateId

---

## Troubleshooting

### Frontend 404 or blank page
- Check Static Site build logs in Render
- Ensure `cd client && npm run build` produces `dist/` folder
- Verify Publish Directory is `client/dist`

### API 502/503 errors
- Check Web Service logs
- Verify all env vars are set correctly
- Ensure MongoDB credentials are correct in `.env`
- Test locally first: `cd server && npm start`

### API calls from frontend return 401/403
- Check browser DevTools → Network → check request headers
- Verify `VITE_API_URL` is set in frontend
- Confirm JWT_SECRET matches on backend

### Database connection timeout
- Test your MongoDB Atlas connection string locally
- Whitelist Render's IP: MongoDB Atlas → Network Access → Allow 0.0.0.0/0
- Verify database name is `mascertify`

---

## Local Development Setup

```bash
# Terminal 1: Start backend (uses client/.env.local)
cd server
npm start

# Terminal 2: Start frontend in dev mode
cd client
npm run dev
```

Access at: `http://localhost:5173` (automatically proxies API to `http://localhost:5000`)

---

## Deployment via render.yaml (Alternative)

If you want automated deployment:

```bash
git push origin main
```

Render will auto-detect `render.yaml` and deploy both services. This is **recommended** for CI/CD.

---

## Security Notes

✅ **What's configured:**
- CORS restricted to frontend domain only
- Error stack traces hidden in production
- Connection pooling for MongoDB
- Graceful shutdown on Render redeploys

⚠️ **Action Items:**
- [ ] Change `JWT_SECRET` to a random 32+ char value in Render dashboard
- [ ] Use a restricted MongoDB user (not admin)
- [ ] Monitor logs for errors: Render dashboard → Service logs

---

## Next: Actual Deploy Steps

1. Go to [render.com](https://render.com)
2. Sign up / login
3. Click **Dashboard** → **New +** → **Web Service**
4. Connect your GitHub repo
5. Follow the configurations above
6. Deploy!

Your app should be live at `https://mascertify.onrender.com` in ~3-5 minutes.

Questions? Check Render docs: [render.com/docs](https://render.com/docs)
