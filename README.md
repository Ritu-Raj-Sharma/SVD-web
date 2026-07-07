# SVD Image Compression

An interactive web app that compresses images using **Singular Value Decomposition (SVD)**. Upload any picture, drag a slider to change the compression rank, and watch the image quality and storage savings update in real time — with the original and compressed versions side by side.

**🔗 Live demo: [svd-web.vercel.app](https://svd-web.vercel.app/)**

## How it works

Every color image is three matrices (Red, Green, Blue). SVD factors each channel `X` into:

```
X = U · S · Vᵀ
```

Keeping only the top **r** singular values gives the best possible rank-r approximation:

```
X_r = U[:, :r] · S[:r, :r] · Vᵀ[:r, :]
```

Small `r` → heavy compression, blurry image. Large `r` → near-perfect quality.

**Storage math:** the original stores `h × w` numbers per channel, while the rank-r form stores only `r × (h + w + 1)` (r columns of U, r rows of Vᵀ, r singular values). The savings percentage shown in the app comes directly from this ratio.

**Break-even point:** compression only pays off while `r × (h + w + 1) < h × w`, i.e. up to `r* = (h × w) / (h + w + 1)`. Past that rank the SVD form is *larger* than the raw image — the app shows a warning when the slider crosses this point.

**Why the slider feels instant:** the expensive SVD runs once per upload. The backend reconstructs the image at ~14 log-spaced ranks (1, 2, 4, 6, 10, …) and sends them all back in a single response. The frontend caches these, so moving the slider just swaps which cached version is displayed — no extra network calls.

## Tech stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React 18, React Router, Vite, plain CSS      |
| Backend  | Python, Flask, NumPy (SVD), Pillow (imaging) |

Deployed on Vercel: the React app is served as a static build, and the Flask API runs as a Python serverless function.

## Project structure

```
.
├── frontend/               # React single-page app
│   ├── index.html          # SPA shell; React renders into its #root div
│   ├── vite.config.js      # Dev proxy: /api → Flask backend
│   └── src/
│       ├── main.jsx        # Entry point: mounts <App /> with the router
│       ├── App.jsx         # Routes + shared image state
│       ├── index.css       # Light theme styles
│       └── pages/
│           ├── UploadPage.jsx   # Page 1: pick / drag & drop (max 4.5 MB)
│           └── ViewPage.jsx     # Page 2: slider, side-by-side view, savings
├── api/
│   └── index.py            # Flask API: POST /api/process (SVD lives here)
├── requirements.txt        # Python dependencies
└── vercel.json             # Vercel build & routing config
```
