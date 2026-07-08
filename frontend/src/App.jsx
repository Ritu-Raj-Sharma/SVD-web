// src/App.jsx
// -----------------------------------------------------------------------------
// Root component. Responsibilities:
//   1. Hold the SHARED STATE: the image the user uploaded. Both pages need it,
//      so it lives here (their common parent) and is passed down as props.
//      This pattern is called "lifting state up".
//   2. Define the ROUTES (which URL shows which page):
//        /      -> UploadPage  (pick an image, hit Upload)
//        /view  -> ViewPage    (see the image, option to upload a new one)
// -----------------------------------------------------------------------------
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import ViewPage from './pages/ViewPage.jsx'

export default function App() {
  // `image` holds everything we know about the uploaded file:
  //   - file: the raw File object (we'll send this to the Python backend later)
  //   - url:  a temporary local URL (blob:...) created with URL.createObjectURL,
  //           which lets the browser display the file instantly without any
  //           server round-trip.
  // It starts as null = "nothing uploaded yet".
  const [image, setImage] = useState(null)

  return (
    <Routes>
      {/* Landing page: intro, rank-23 demo, applications, CTA → /upload */}
      <Route path="/" element={<HomePage />} />

      {/* Upload form. We pass setImage down so the page can store
          the chosen file in this shared state before navigating away. */}
      <Route path="/upload" element={<UploadPage setImage={setImage} />} />

      {/* Page 2: view the uploaded image.
          Guard: if the user lands on /view directly (e.g. refresh or typed
          URL) with no image in state, bounce them back to the upload page. */}
      <Route
        path="/view"
        element={image ? <ViewPage image={image} setImage={setImage} /> : <Navigate to="/upload" replace />}
      />

      {/* Catch-all: any unknown URL redirects to the upload page. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
