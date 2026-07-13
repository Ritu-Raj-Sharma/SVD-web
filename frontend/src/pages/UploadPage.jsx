// src/pages/UploadPage.jsx
// -----------------------------------------------------------------------------
// PAGE 1 — Upload
// The user picks an image file (click or drag & drop), sees a small preview,
// then hits "Upload". That stores the image in App's shared state and
// navigates to /view (Page 2).
// -----------------------------------------------------------------------------
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UploadPage({ setImage }) {
  // Max upload size. Vercel rejects request bodies over ~4.5 MB, so we
  // check on the client and tell the user BEFORE they hit a confusing
  // server error.
  const MAX_SIZE_MB = 4.5
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

  // The file the user has selected (null until they pick one).
  const [selectedFile, setSelectedFile] = useState(null)
  // Message shown when the chosen file is rejected (too big / not an image).
  const [sizeError, setSizeError] = useState(null)
  // Local preview URL for the selected file (blob:...).
  const [previewUrl, setPreviewUrl] = useState(null)
  // True while the user is dragging a file over the drop zone (for styling).
  const [dragActive, setDragActive] = useState(false)

  // Ref to the hidden <input type="file"> so clicking the drop zone opens
  // the native file picker.
  const fileInputRef = useRef(null)

  // useNavigate lets us change the page programmatically (to /view).
  const navigate = useNavigate()

  /**
   * Validate and accept a file the user chose (via picker OR drag & drop).
   * We only accept image/* types; anything else is silently ignored.
   */
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return

    // Reject files over the upload limit with a clear message.
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setSizeError(
        `This image is ${sizeMB} MB — please upload a file under ${MAX_SIZE_MB} MB.`
      )
      // Clear any previously selected file so the Upload button disables.
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    setSizeError(null)   // valid file: clear any old error
    setSelectedFile(file)
    // createObjectURL gives the browser a temporary local URL for the file,
    // so we can show it in an <img> tag immediately — no server needed.
    setPreviewUrl(URL.createObjectURL(file))
  }

  // Fired when the user picks a file with the native file dialog.
  const onInputChange = (e) => handleFile(e.target.files[0])

  // --- Drag & drop handlers -------------------------------------------------
  // preventDefault() is required, otherwise the browser would just open the
  // dropped file as a new page.
  const onDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }
  const onDragLeave = () => setDragActive(false)
  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files[0])
  }

  /**
   * "Upload" button: save the file + preview URL into App's shared state,
   * then navigate to the view page.
   */
  const onUpload = () => {
    if (!selectedFile) return
    setImage({ file: selectedFile, url: previewUrl })
    navigate('/view')
  }

  return (
    <div className="page">
      <header className="header">
        <h1>SVD Image Compression</h1>
        <p className="subtitle">Upload an image to get started</p>
      </header>

      {/* Drop zone: click it (opens file picker) or drag an image onto it. */}
      <div
        className={`dropzone ${dragActive ? 'dropzone--active' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {previewUrl ? (
          // If a file is already selected, show its preview inside the zone.
          <img src={previewUrl} alt="preview" className="dropzone__preview" />
        ) : (
          // Otherwise show the instructions.
          <div className="dropzone__hint">
            <span className="dropzone__icon">🖼️</span>
            <p>Click to browse or drag &amp; drop an image here</p>
            <p className="dropzone__formats">JPEG, PNG, WebP …</p>
          </div>
        )}
      </div>

      {/* Hidden real file input; the drop zone above triggers it. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        hidden
      />

      {/* Show the chosen file's name so the user knows what's selected. */}
      {selectedFile && <p className="filename">{selectedFile.name}</p>}

      {/* Shown only when the chosen file exceeds the size limit. */}
      {sizeError && <p className="error">{sizeError}</p>}

      {/* Upload button is disabled until a file is selected. */}
      <button className="btn" onClick={onUpload} disabled={!selectedFile}>
        Upload
      </button>
    </div>
  )
}
