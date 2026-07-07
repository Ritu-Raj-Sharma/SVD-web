# api/index.py
# =============================================================================
# SVD IMAGE COMPRESSION - BACKEND API
# =============================================================================
# This file lives in /api because that's where Vercel looks for serverless
# functions. Vercel detects the Flask `app` object below (a WSGI app) and
# wraps it automatically: every request that reaches this function is handed
# to Flask, which dispatches it to the matching @app.route.
#
# The SAME file also works as a normal local dev server - see the
# `if __name__ == "__main__"` block at the bottom.
#
# HOW IT ACHIEVES "REALTIME" SLIDER UPDATES:
# ------------------------------------------
# Recomputing the SVD on every slider move would mean a network round-trip
# each time (slow, laggy). Instead we do ALL the heavy work ONCE per upload:
#
#   1. Frontend POSTs the image to /api/process (one single request).
#   2. We compute the SVD of each color channel ONE time.
#      (The expensive part - np.linalg.svd.)
#   3. We then reconstruct the image at 14 different ranks (just
#      matrix multiplications with slices of U, S, VT) and send ALL of them
#      back, together with the storage stats for each rank.
#   4. The frontend caches these in memory. Dragging the slider just swaps
#      which cached image is shown which is instant, and zero network delay.
#
# THE MATH BEHIND SVD IMAGE COMPRESSION:
#   For each channel X (h x w matrix):  X = U @ S @ VT       (full SVD)
#   Rank-r approximation:               X_r = U[:, :r] @ S[:r, :r] @ VT[:r, :]
#
# STORAGE MATH :
#   Original image  : h * w numbers per channel
#   Rank-r SVD form : r*(h + w + 1) numbers per channel
#                     (r columns of U of length h, r rows of VT of length w,
#                      r singular values)
#   Savings % = 1 - r*(h+w+1) / (h*w)
# =============================================================================

import base64
import io

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
# CORS allows the React dev server (port 5173) to call this API (port 5000).
CORS(app)

# --- Tunables ----------------------------------------------------------------
MAX_DIM = 600       # Images are downscaled so the longest side is <= 600 px.
                    # Keeps the SVD fast and the response payload small,
                    # while still looking good on screen.
JPEG_QUALITY = 85   # Quality of the JPEGs we send back to the browser.
NUM_RANKS = 14      # How many rank "steps" the slider will have.


def pick_ranks(max_rank: int, count: int = NUM_RANKS) -> list[int]:
    """
    Choose ~`count` rank values between 1 and max_rank, spaced
    LOGARITHMICALLY (1, 2, 3, 5, 8, 13, 21, ...).

    Why log spacing? Image quality improves very fast at low ranks and very
    slowly at high ranks, so small ranks deserve more slider steps.
    """
    ranks = np.logspace(0, np.log10(max_rank), count)   # floats, log-spaced
    ranks = np.unique(np.round(ranks).astype(int))      # ints, no duplicates
    return ranks.tolist()


def to_data_url(arr: np.ndarray) -> str:
    """
    Convert a (h, w, 3) uint8 numpy array into a base64 'data URL' string.
    The browser can put this string directly into <img src=...> - no need
    to host image files anywhere.
    """
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG", quality=JPEG_QUALITY)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


@app.route("/api/process", methods=["POST"])
def process_image():
    """
    Receives: multipart form with an 'image' file.
    Returns : JSON with the (downscaled) original + one compressed version
              per rank, each with its storage-savings stats.
    """
    # --- 1. Read and prepare the uploaded image ------------------------------
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    img = Image.open(request.files["image"].stream).convert("RGB")
    img.thumbnail((MAX_DIM, MAX_DIM))       # downscale in place, keeps aspect

    A = np.asarray(img, dtype=np.float64)   # shape (h, w, 3), like your script
    h, w, _ = A.shape
    max_rank = min(h, w)                    # SVD rank can't exceed min(h, w)

    # --- 2. THE EXPENSIVE STEP, DONE ONCE: SVD of each color channel ---------
    # svds = [(U_r, S_r, VT_r), (U_g, ...), (U_b, ...)]
    svds = [np.linalg.svd(A[:, :, c], full_matrices=False) for c in range(3)]

    # Numbers needed to store the original (per all 3 channels):
    original_values = h * w * 3

    # --- 3. Reconstruct the image at each chosen rank ----------------
    results = []
    for r in pick_ranks(max_rank):
        channels = []
        for U, S, VT in svds:
            # (U[:, :r] * S[:r]) multiplies each column i of U by S[i],
            # which equals U[:, :r] @ np.diag(S[:r]) but avoids building
            # a big diagonal matrix.
            X_approx = (U[:, :r] * S[:r]) @ VT[:r, :]
            channels.append(X_approx)

        # Stack R,G,B back together, clip to valid pixel range, to uint8.
        X = np.clip(np.stack(channels, axis=-1), 0, 255).astype(np.uint8)

        # Storage stats for this rank.
        svd_values = r * (h + w + 1) * 3
        storage_pct = svd_values / original_values * 100
        savings_pct = max(0.0, 100.0 - storage_pct)

        results.append({
            "rank": r,
            "image": to_data_url(X),
            "svdValues": svd_values,          # numbers the SVD form stores
            "storagePct": round(storage_pct, 1),
            "savingsPct": round(savings_pct, 1),
        })

    # --- 4. Send everything back in one response ------------------------------
    return jsonify({
        "width": w,
        "height": h,
        "maxRank": max_rank,
        "originalValues": original_values,    # numbers the original stores
        "original": to_data_url(A.astype(np.uint8)),
        "results": results,
    })


if __name__ == "__main__":
    # LOCAL DEVELOPMENT ONLY: `python api/index.py` starts Flask on port 5000
    # (the Vite dev proxy forwards /api requests here).
    # On Vercel this block never runs - Vercel imports `app` directly and
    # serves it as a serverless function.
    app.run(host="127.0.0.1", port=5000, debug=True)
