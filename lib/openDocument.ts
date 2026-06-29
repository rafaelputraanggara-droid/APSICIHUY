export const openDocument = (url: string) => {
  if (!url) return;
  
  // Jika URL adalah Base64 (data URI)
  if (url.startsWith('data:')) {
    try {
      const parts = url.split(';base64,');
      if (parts.length === 2) {
        const mimeType = parts[0].split(':')[1];
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return;
      }
    } catch (e) {
      console.error('Gagal membuka dokumen base64:', e);
    }
  }
  
  // Jika URL biasa (bukan base64) atau parse gagal
  window.open(url, '_blank');
};
