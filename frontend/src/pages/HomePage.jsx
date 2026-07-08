// src/pages/HomePage.jsx
// -----------------------------------------------------------------------------
// LANDING PAGE — the first thing a visitor sees.
// Gives a short intro to SVD compression with a "Try it yourself" button
// (kept above the fold so visitors don't have to scroll to find it),
// then a real before/after example (Sunset.jpeg compressed at rank 23)
// and a few practical applications.
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

        {/* Call to action right after the intro, so visitors see it without
            scrolling to the bottom of the page. */}
        <button className="btn btn--large" onClick={() => navigate('/upload')}>
          Try it yourself →
        </button>

        {/* Real example: original vs rank-23 reconstruction */}
        <div className="compare compare--demo">
          <figure className="compare__card">
            <img src={demoOriginal} alt="original demo" />
            <figcaption>Original — all 287 layers</figcaption>
          </figure>
          <figure className="compare__card">
            <img src={demoRank23} alt="rank 23 demo" />
            <figcaption>Only 23 layers — 88% less data</figcaption>
          </figure>
        </div>

        {/* Practical applications, kept to three quick cards */}
        <h2 className="home__section-title">Where SVD is used in real life</h2>
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
    </div>
  )
}
