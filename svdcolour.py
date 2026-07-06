from matplotlib.image import imread
import matplotlib.pyplot as plt
import numpy as np
import warnings
warnings.filterwarnings('ignore', category=RuntimeWarning)

A = imread('demo.jpeg')  # shape: (height, width, 3)
A = A.astype(np.float64)

plt.figure()
plt.imshow(A.astype(np.uint8))
plt.axis('off')
plt.title('Original (color)')

for r in (5, 20, 100):
    # Reconstruct each channel separately
    channels_approx = []
    for c in range(3):  # R, G, B
        X = A[:, :, c]
        U, S, VT = np.linalg.svd(X, full_matrices=False)
        S = np.diag(S)
        X_approx = U[:, :r] @ S[:r, :r] @ VT[:r, :]
        channels_approx.append(X_approx)

    # Stack channels back into a color image
    Xapprox = np.stack(channels_approx, axis=-1)

    # Clip to valid pixel range and convert to uint8 for display
    Xapprox = np.clip(Xapprox, 0, 255).astype(np.uint8)

    plt.figure()
    plt.imshow(Xapprox)
    plt.axis('off')
    plt.title(f'rank = {r} (color)')

plt.show()