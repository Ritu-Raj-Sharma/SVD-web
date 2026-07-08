// src/pages/HomePage.jsx
// -----------------------------------------------------------------------------
// LANDING PAGE — the first thing a visitor sees.
// Gives a short intro to SVD compression, shows a real before/after example
// (dog.jpeg compressed at rank 23), lists a few practical applications,
// and ends with a "Try it yourself" button → /upload.
//
// The two demo images are pre-generated (real SVD output, not a mockup) and
// bundled by Vite at build time via the imports below.
// -----------------------------------------------------------------------------
import { useNavigate } from 'react-router-dom'
import demoOriginal from '../assets/demo-original.jpg'
import demoRank23 from '../assets/demo-rank23.jpg'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    // .home adds the subtle grid-box background (see index.css)
    <div className="home">
      <div className="page page--wide">
        <header className="header">
          <h1>SVD Image Compression</h1>
          <p className="subtitle">
            See how much of a picture you can throw away before your eyes notice.
          </p>
        </header>

        {/* Short intro — visitors may have already read the README,
            so just enough to orient someone landing cold. */}
        <p className="home__intro">
          Every digital image is a grid of numbers. <strong>Singular Value
          Decomposition</strong> breaks that grid into ranked layers, ordered
          from "carries most of the picture" to "barely matters". Keep only
          the top few layers and you get a smaller image that still looks
          remarkably close to the original.
        </p>

        {/* Real example: original vs rank-23 reconstruction */}
        <div className="compare compare--demo">
          <figure className="compare__card">
            <img src={demoOriginal} alt="original demo" />
            <figcaption>Original — all 236 layers</figcaption>
          </figure>
          <figure className="compare__card">
            <img src={demoRank23} alt="rank 23 demo" />
            <figcaption>Only 23 layers — 85% less data</figcaption>
          </figure>
        </div>

        {/* Practical applications, kept to three quick cards */}
        <div className="home__apps">
          <div className="home__app">
            <span className="home__app-icon">📦</span>
            <h3>Compression</h3>
            <p>The same idea powers image, video and audio codecs: keep what the eye notices, drop what it doesn't.</p>
          </div>
          <div className="home__app">
            <span className="home__app-icon">🧹</span>
            <h3>Denoising</h3>
            <p>Noise lives in the low-value layers — discarding them cleans up photos and sensor data.</p>
          </div>
          <div className="home__app">
            <span className="home__app-icon">🤖</span>
            <h3>Machine learning</h3>
            <p>Recommender systems and PCA use the same trick to find the few patterns that explain most of the data.</p>
          </div>
        </div>

        {/* Call to action → upload page */}
        <button className="btn btn--large" onClick={() => navigate('/upload')}>
          Try it yourself →
        </button>
      </div>
    </div>
  )
}
