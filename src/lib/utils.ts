import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Converts various image URL formats (HTML img tags, <a> links, Google Drive view links,
 * Dropbox links, Imgur, Markdown, base64 data URLs) into directly renderable browser image URLs.
 */
export function getImageUrl(rawUrl: string | undefined | null, fallback = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'): string {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  let url = rawUrl.trim();
  if (!url) return fallback;

  // Unescape common HTML entities
  url = url
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  // Extract from HTML <img ... src="..."> or <img ... src='...'> or <img ... src=...> tag if present
  const imgMatch = url.match(/<img[^>]+src=["']?([^"'\s>]+)["']?[^>]*>/i) || url.match(/src=["']?([^"'\s>]+)["']?/i);
  if (imgMatch && imgMatch[1]) {
    url = imgMatch[1];
  }

  // Extract from HTML <a ... href="..."> tag if no img src found
  if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:')) {
    const hrefMatch = url.match(/href=["']?([^"'\s>]+)["']?/i);
    if (hrefMatch && hrefMatch[1]) {
      url = hrefMatch[1];
    }
  }

  // Extract from Markdown image syntax ![alt](url) or link [text](url)
  const mdMatch = url.match(/!\[.*?\]\(([^\)]+)\)/) || url.match(/\[.*?\]\(([^\)]+)\)/);
  if (mdMatch && mdMatch[1]) {
    url = mdMatch[1];
  }

  // Strip any lingering quotes, brackets, or trailing characters
  url = url.replace(/^["'<>]+|["'<>]+$/g, '').trim();

  // Handle Base64 Data URLs directly
  if (url.startsWith('data:image/') || url.startsWith('blob:')) {
    return url;
  }

  // Google Drive Link conversion
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      // Return high-resolution thumbnail preview that bypasses Google login checks
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
  }

  // Google User Content Link
  if (url.includes('googleusercontent.com')) {
    return url;
  }

  // Dropbox Link conversion
  if (url.includes('dropbox.com')) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?dl=1');
  }

  // Imgur page to direct image link conversion
  if (url.includes('imgur.com/') && !url.includes('i.imgur.com')) {
    const imgurMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)$/);
    if (imgurMatch && imgurMatch[1]) {
      return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }
  }

  // Return url if it starts with valid HTTP/HTTPS protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return fallback;
}

/**
 * Parses video URLs (YouTube, Vimeo, Google Drive, direct MP4) into embeddable iframe or video player sources.
 */
export function getVideoEmbedUrl(rawUrl: string | undefined | null): { type: 'iframe' | 'video' | 'none'; url: string } {
  if (!rawUrl || typeof rawUrl !== 'string') return { type: 'none', url: '' };
  let url = rawUrl.trim();
  if (!url) return { type: 'none', url: '' };

  // Extract from HTML <iframe src="..."> tag if present
  const srcMatch = url.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    url = srcMatch[1];
  }

  // YouTube Shorts, Watch, or Shortlink
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]+)/i);
  if (ytMatch && ytMatch[1]) {
    return { type: 'iframe', url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0` };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: 'iframe', url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Google Drive Video
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return { type: 'iframe', url: `https://drive.google.com/file/d/${fileIdMatch[1]}/preview` };
    }
  }

  // Direct MP4 or WebM
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: 'video', url };
  }

  // Default to iframe if valid http link
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return { type: 'iframe', url };
  }

  return { type: 'none', url: '' };
}

