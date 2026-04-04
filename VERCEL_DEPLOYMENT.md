# AGL.ai - Vercel Deployment Guide

## ✅ Code Already Pushed to GitHub

Your AGL.ai code is now available at: **https://github.com/kimikukiu/AGL.ai**

## 🚀 Deploy to Vercel (3 Simple Steps)

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Paste your GitHub repo URL: `https://github.com/kimikukiu/AGL.ai`
4. Click **"Import"**

### Step 2: Configure Environment Variables
Vercel will ask you to set environment variables. Add these:

```
VITE_APP_ID=PqpbSuTc7zoQqjcx4gU9DV
VITE_OAUTH_PORTAL_URL=https://manus.im
VITE_APP_TITLE=AGL.ai
VITE_APP_LOGO=https://files.manuscdn.com/user_upload_by_module/web_dev_logo/310519663375123518/ohwsjrsRlYbUPUjt.png
VITE_ANALYTICS_ENDPOINT=https://manus-analytics.com
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.ai
VITE_FRONTEND_FORGE_API_KEY=Y6tW8eKyp7hGChFrL6RR7K
VITE_ANALYTICS_WEBSITE_ID=82c580ad-e836-40d1-8284-604fbdd3b2d8
JWT_SECRET=4Vg3AVgZAGSDTMKAHcQRFg
OAUTH_SERVER_URL=https://api.manus.ai
DATABASE_URL=mysql://2xnypDGAWFmJcQ1.1aee7d177719:5nX3wMDza931KUP1Bbij@gateway04.us-east-1.prod.aws.tidbcloud.com:4000/PqpbSuTc7zoQqjcx4gU9DV?ssl={"rejectUnauthorized":true}
BUILT_IN_FORGE_API_URL=https://forge.manus.ai
BUILT_IN_FORGE_API_KEY=WLvLHd5t9ZigThrDYqKoWY
```

### Step 3: Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live at: `https://agl-ai.vercel.app` (or your custom domain)

## 🔗 Custom Domain Setup

To use a custom domain:
1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## 📋 Project Features

✅ **5 Specialized AI Models**
- Kali GPT (🛠️ Penetration Testing)
- Dark GPT (🧠 Threat Intelligence)
- Zero Day GPT (💻 Exploit Development)
- Onion GPT (🧅 Privacy & Anonymity)
- Red Team Operator (🎯 Advanced Red Team Operations)

✅ **Free Trial System**
- 3 days + 100,000 tokens for new users

✅ **Admin Features**
- Password: `#AllOfThem-3301`
- Recovery Code: `Merleoskyn`
- Unlimited free access to all tools

✅ **Monero (XMR) Payment**
- Address: `8BbApiMBHsPVKkLEP4rVbST6CnSb3LW2gXygngCi5MGiBuwAFh6bFEzT3UTuFCkLHtyHnrYNnHycdaGb2Kgkkmw8jViCdB6`
- Payment confirmation system

✅ **Telegram Integration**
- Support Bot: `t.me/loghandelbot`
- Community Channel: `t.me/cybersecunity`
- Admin management commands

## 🛠️ Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Ensure `package.json` exists in the root directory
- Verify Node.js version compatibility (18+)

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check TiDB Cloud connection status
- Ensure SSL certificate is valid

### Payment Not Working
- Verify Monero address is correct
- Test with small XMR amounts first
- Check Telegram bot token configuration

## 📞 Support

- **Telegram Bot**: t.me/loghandelbot
- **Community**: t.me/cybersecunity
- **GitHub Issues**: https://github.com/kimikukiu/AGL.ai/issues

## 🎯 Next Steps After Deployment

1. Test the pricing page at `/pricing`
2. Test admin login at `/admin/login` with password `#AllOfThem-3301`
3. Test payment flow at `/payment`
4. Configure Telegram bot token for admin commands
5. Set up Monero payment verification

---

**Deployment Status**: Ready for production ✅
**Last Updated**: April 4, 2026
