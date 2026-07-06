# SVD Image Compression

An interactive web app that compresses images using **Singular Value Decomposition (SVD)**. Upload any picture, drag a slider to change the compression rank, and watch the image quality and storage savings update in real time — with the original and compressed versions side by side.

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

### Why the slider feels instant

The expensive SVD runs **once per upload**. The backend then reconstructs the image at ~13 log-spaced ranks (1, 2, 4, 6, 10, …) and sends them all back in a single response. The frontend caches these, so moving the slider just swaps which cached version is displayed — no extra network calls.

## Tech stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React 18, React Router, Vite, plain CSS      |
| Backend  | Python, Flask, NumPy (SVD), Pillow (imaging) |

## Project structure

```
.
├── frontend/               # React single-page app
│   ├── src/
│   │   ├── App.jsx         # Routes + shared image state
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx   # Page 1: pick / drag & drop an image
│   │   │   └── ViewPage.jsx     # Page 2: slider, side-by-side view, savings
│   │   └── index.css       # Light theme styles
│   └── vite.config.js      # Dev proxy: /api → Flask on port 5000
├── backend/
│   ├── app.py              # Flask API: POST /api/process (SVD lives here)
│   └── requirements.txt
└── svdcolour.py            # Original standalone SVD script this grew from
```

## Running locally

You need **Node.js 20.19+** and **Python 3.9+**. Use two terminals.

**Terminal 1 — backend:**

```bash
cd backend
pip install -r requirements.txt
python app.py            # starts Flask on http://127.0.0.1:5000
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm install
npm run dev              # starts Vite on http://localhost:5173
```

Open http://localhost:5173, upload an image, and drag the slider.

## API

`POST /api/process` — multipart form with an `image` file.

Returns JSON:

```json
{
  "width": 600,
  "height": 400,
  "maxRank": 400,
  "originalValues": 720000,
  "original": "data:image/jpeg;base64,...",
  "results": [
    {
      "rank": 10,
      "image": "data:image/jpeg;base64,...",
      "svdValues": 30030,
      "storagePct": 4.2,
      "savingsPct": 95.8
    }
  ]
}
```

Uploads are downscaled to max 600 px on the longest side to keep the SVD fast and the response small.

## Roadmap

- [ ] Deploy to Vercel (frontend as static build, backend as a Python serverless function)
