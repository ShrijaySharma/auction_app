# 🚀 Deployment Guide: Cricket Auction App

Follow these steps to deploy your application to the web.

## 1. Prepare your Codebase
I have already configured the necessary files for you:
-   **Frontend**: Created `vercel.json` for routing.
-   **Backend**: Verified server and database configuration.
-   **General**: Checked `.gitignore` to keep your repo clean.

## 2. Push to GitHub
You need to push your code to a GitHub repository.

1.  **Create a new Repository** on [GitHub](https://github.com/new).
    -   Name it something like `ez-auction-app`.
    -   Make it **Public** or **Private** (Private recommended).
    -   **Do not** initialize with README, .gitignore, or license (we already have them).

2.  **Push your code** (Run these commands in your *terminal*):
    ```bash
    # Add the remote repository (replace URL with your new repo URL)
    git remote add origin https://github.com/YOUR_USERNAME/ez-auction-app.git

    # Rename branch to main if needed
    git branch -M main

    # Add all files
    git add .

    # Commit changes
    git commit -m "Ready for deployment"

    # Push to GitHub
    git push -u origin main
    ```
    *(If you already have a remote, use `git remote set-url origin <URL>`)*

## 3. Deploy Backend to Render (Free)
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    -   **Name**: `ez-auction-backend` (or similar)
    -   **Region**: Singapore (or nearest to you)
    -   **Root Directory**: `backend`
    -   **Runtime**: Node
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server.js`
    -   **Instance Type**: Free
5.  **Environment Variables** (Advanced -> Add Environment Variable):
    -   `NODE_ENV`: `production`
    -   `SESSION_SECRET`: `change_this_to_a_random_string`
6.  Click **Create Web Service**.
7.  **Wait for deployment**. Once live, **copy the Backend URL** (e.g., `https://ez-auction-backend.onrender.com`).

> **Note**: On the free tier, the server will "sleep" after inactivity and take a minute to wake up. The SQLite database will reset if the server restarts.

## 4. Deploy Frontend to Vercel (Free)
1.  Go to [vercel.com](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    -   **Framework Preset**: Vite
    -   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    -   **Name**: `VITE_API_URL`
    -   **Value**: Paste your **Render Backend URL** (e.g., `https://ez-auction-backend.onrender.com`) - *No trailing slash!*
6.  Click **Deploy**.

## 5. Final Setup
1.  Once Vercel finishes, click **Visit**.
2.  Your app should now be live!
3.  Log in with default credentials (if using seeded data) or create a new team/admin if starting fresh.

---
**Need help?** Just ask me to clarify any step!
