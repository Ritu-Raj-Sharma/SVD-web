// src/pages/ViewPage.jsx
// -----------------------------------------------------------------------------
// PAGE 2 — Compression view
//
// WHAT HAPPENS HERE:
//   1. On arrival, the uploaded image is POSTed ONCE to the Python backend
//      (/api/process). The backend runs the SVD one time and sends back the
//      original + a compressed version for 14 different ranks, each with
//      its storage stats.
//   2. All of those versions are cached in the `data` state below.
//   3. The slider just picks WHICH cached version to display, so dragging
//      it updates the image AND the savings numbers instantly, with zero
//      network requests. That is what makes it feel realtime.
//
// LAYOUT: original and rank-r image side by side, slider under them,
// storage-savings panel at the bottom.
// -----------------------------------------------------------------------------
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ViewPage({ image, setImage }) {
  const navigate = useNavigate()

  // Full backend response (original, results per rank, stats). null = not yet loaded.
  const [data, setData] = useState(null)
  // Error message if the backend call fails (e.g. backend not running).
  const [error, setError] = useState(null)
  // Which entry of data.results the slider currently points at.
  // Start in the middle so the first thing the user sees is a visible
  // difference between original and compressed.
  const [idx, setIdx] = useState(0)

  // ---------------------------------------------------------------------------
  // Send the image to the backend exactly once, when this page first mounts.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController() // lets us cancel if user leaves

    async function processImage() {
      try {
        // FormData mimics an HTML file-upload form; the backend reads
        // request.files['image'].
        const form = new FormData()
        form.append('image', image.file)

        const res = await fetch('/api/process', {
          method: 'POST',
          body: form,
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Server responded with ${res.status}`)

        const json = await res.json()
        setData(json)
        // Start the slider roughly in the middle of the rank range.
        setIdx(Math.floor(json.results.length / 2))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not reach the compression server. Is the backend running? (python api/index.py)')
        }
      }
    }

    processImage()
    // Cleanup: abort the request if the user navigates away mid-flight.
    return () => controller.abort()
  }, [image.file])

  /** "Upload a new image": free the blob URL, clear state, back to Page 1. */
  const onUploadNew = () => {
    URL.revokeObjectURL(image.url)
    setImage(null)
    navigate('/')
  }

  // --- Render: error state ---------------------------------------------------
  if (error) {
    return (
      <div className="page">
        <header className="header"><h1>Something went wrong</h1></header>
        <p className="error">{error}</p>
        <button className="btn btn--secondary" onClick={onUploadNew}>
          ← Upload a new image
        </button>
      </div>
    )
  }

  // --- Render: loading state (SVD is being computed on the server) -----------
  if (!data) {
    return (
      <div className="page">
        <header className="header">
          <h1>Compressing…</h1>
          <p className="subtitle">Running SVD on {image.file.name}</p>
        </header>
        <div className="spinner" />
      </div>
    )
  }

  // --- Render: main view -------------------------------------------------------
  // `current` = the compressed version the slider points at right now.
  const current = data.results[idx]

  return (
    <div className="page page--wide">
      <header className="header">
        <h1>SVD Image Compression</h1>
        <p className="subtitle">{image.file.name} · {data.width}×{data.height}px · max rank {data.maxRank}</p>
      </header>

      {/* Side-by-side comparison: original | compressed at current rank */}
      <div className="compare">
        <figure className="compare__card">
          <img src={data.original} alt="original" />
          <figcaption>Original</figcaption>
        </figure>
        <figure className="compare__card">
          <img src={current.image} alt={`rank ${current.rank}`} />
          <figcaption>Rank {current.rank}</figcaption>
        </figure>
      </div>

      {/* Slider: its value is an INDEX into data.results, not the rank
          itself, because our ranks are log-spaced (1, 2, 3, 5, 8, ...).
          onChange fires continuously while dragging -> instant updates. */}
      <div className="slider-block">
        <label htmlFor="rank">
          Rank: <strong>{current.rank}</strong>
        </label>
        <input
          id="rank"
          type="range"
          min="0"
          max={data.results.length - 1}
          step="1"
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
        />
        <div className="slider-block__ends">
          <span>1 (most compressed)</span>
          <span>{data.maxRank} (best quality)</span>
        </div>
      </div>

      {/* Storage savings panel — recalculated by the backend per rank and
          swapped in instantly as the slider moves. */}
      <div className="stats">
        <div className="stats__item">
          <span className="stats__value stats__value--good">{current.savingsPct}%</span>
          <span className="stats__label">storage saved</span>
        </div>
        <div className="stats__item">
          <span className="stats__value">{current.storagePct}%</span>
          <span className="stats__label">of original data kept</span>
        </div>
        <div className="stats__item">
          <span className="stats__value">{current.svdValues.toLocaleString()}</span>
          <span className="stats__label">values stored (SVD) vs {data.originalValues.toLocaleString()} original</span>
        </div>
      </div>
      {/* Warning shown only when the rank is past the break-even point,
          i.e. the SVD form needs MORE numbers than the raw image itself.
          Break-even happens at r ≈ (h × w) / (h + w + 1). */}
      {current.storagePct >= 100 && (
        <p className="stats__warning">
          ⚠ Rank {current.rank} is past the break-even point — at this rank the
          SVD representation is larger than the original image, so nothing is saved.
        </p>
      )}

      <button className="btn btn--secondary" onClick={onUploadNew}>
        ← Upload a new image
      </button>
    </div>
  )
}
