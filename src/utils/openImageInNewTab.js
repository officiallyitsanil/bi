/**
 * Open an image in a new browser tab for viewing (not download).
 * Uses a blob HTML viewer so popup blockers don't leave an empty about:blank tab.
 */
export function openImageInNewTab(imageUrl) {
  if (!imageUrl || typeof window === 'undefined') return;

  const url = String(imageUrl).trim();
  const escaped = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  const html =
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Floor Plan</title>' +
    '<style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0f0f0f;}' +
    'img{max-width:100%;max-height:100vh;object-fit:contain;}</style></head>' +
    `<body><img src="${escaped}" alt="Floor plan" referrerpolicy="no-referrer" /></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');

  if (win) {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } else {
    URL.revokeObjectURL(blobUrl);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
