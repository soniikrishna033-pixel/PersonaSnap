import html2canvas from 'html2canvas';

export async function generateShareImage(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return null;
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0F0F1E',
      scale: 2, // High resolution
      logging: false,
      useCORS: true
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error generating share image:", error);
    return null;
  }
}

export function downloadImage(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function shareToPlatform(platform, text, url) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  
  switch(platform) {
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
      break;
    case 'whatsapp':
      window.open(`https://api.whatsapp.com/send?text=${encodedText} ${encodedUrl}`, '_blank');
      break;
    default:
      if (navigator.share) {
        navigator.share({
          title: 'PersonaSnap Result',
          text: text,
          url: url
        }).catch(console.error);
      } else {
        alert("Web Share API is not supported in your browser.");
      }
  }
}
