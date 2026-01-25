// Helper function to get proper image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === '?') {
    return 'https://via.placeholder.com/300x300?text=?';
  }

  // If it's already a full URL (http/https), check if it's localhost and convert
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // If it contains localhost or 127.0.0.1, replace with current hostname
    if (imagePath.includes('localhost') || imagePath.includes('127.0.0.1')) {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      try {
        const url = new URL(imagePath);
        return `${protocol}//${host}:${url.port}${url.pathname}`;
      } catch (e) {
        // If URL parsing fails, try simple replacement
        return imagePath.replace(/localhost|127\.0\.0\.1/, host);
      }
    }
    // Otherwise return as is (external URLs)
    return imagePath;
  }

  // If it's a relative path starting with /uploads, convert to full URL
  if (imagePath.startsWith('/uploads/')) {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const port = '4000'; // Backend port
    return `${protocol}//${host}:${port}${imagePath}`;
  }

  // Return as is for other cases
  return imagePath;
};

