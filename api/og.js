import fs from 'fs';
import path from 'path';
import { findVideoByIdOrAlias } from '../src/data/showcaseItems.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function updateMeta(htmlContent, attrName, attrVal, newContent) {
  const regex = new RegExp('<meta\\s+[^>]*?' + attrName + '=["\']' + attrVal + '["\'][^>]*?>', 'gi');
  const replacement = `<meta ${attrName}="${attrVal}" content="${escapeHtml(newContent)}" />`;
  if (regex.test(htmlContent)) {
    return htmlContent.replace(regex, replacement);
  }
  return htmlContent.replace('</head>', `  ${replacement}\n</head>`);
}

function getBaseHtml() {
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.resolve(process.cwd(), 'dist/index.html'),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8');
      }
    } catch {
      // continue
    }
  }
  return null;
}

export default async function handler(req, res) {
  try {
    let videoQuery = req.query?.video || req.query?.v || req.query?.id;

    if (!videoQuery && req.url) {
      try {
        const parsedUrl = new URL(req.url, 'http://localhost');
        videoQuery =
          parsedUrl.searchParams.get('video') ||
          parsedUrl.searchParams.get('v') ||
          parsedUrl.searchParams.get('id');
      } catch {
        // ignore
      }
    }

    let html = getBaseHtml();

    // Fallback if local dist/index.html was not read
    if (!html) {
      try {
        const upstreamRes = await fetch('https://www.mintbes.country/', {
          headers: { 'User-Agent': 'Mintbes-OG-Internal/1.0' },
        });
        if (upstreamRes.ok) {
          html = await upstreamRes.text();
        }
      } catch {
        // ignore
      }
    }

    if (!html) {
      return res.status(500).send('Internal Server Error: base template not found');
    }

    const video = videoQuery ? findVideoByIdOrAlias(videoQuery) : null;

    if (!video) {
      // If no video was requested or matched, return default HTML
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
      return res.status(200).send(html);
    }

    const host = req.headers?.host || 'www.mintbes.country';
    const origin = host.includes('localhost') ? `http://${host}` : 'https://www.mintbes.country';
    const posterPath = (video.poster || '').replace(/^\//, '');
    const posterUrl = `${origin}/${posterPath}`;
    const canonicalUrl = `${origin}/v/${encodeURIComponent(video.id)}`;

    const pageTitle = `${video.title} — Mintbes 🌿 AI Video`;
    const cleanPrompt = (video.prompt || '').replace(/\s+/g, ' ').trim();
    const summaryDesc = `${video.title} (9:16 Vertical AI Cinema • ${video.duration} • ${video.engine}). Prompt: ${cleanPrompt}`.slice(0, 260);

    // 1. Page Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);

    // 2. Standard Meta Description
    html = updateMeta(html, 'name', 'description', summaryDesc);

    // 3. Open Graph Tags (Clean Image Preview - No intrusive video embeds)
    html = updateMeta(html, 'property', 'og:type', 'website');
    html = updateMeta(html, 'property', 'og:site_name', 'Mintbes');
    html = updateMeta(html, 'property', 'og:url', canonicalUrl);
    html = updateMeta(html, 'property', 'og:title', pageTitle);
    html = updateMeta(html, 'property', 'og:description', summaryDesc);
    html = updateMeta(html, 'property', 'og:image', posterUrl);
    html = updateMeta(html, 'property', 'og:image:secure_url', posterUrl);
    html = updateMeta(html, 'property', 'og:image:type', 'image/jpeg');
    html = updateMeta(html, 'property', 'og:image:width', '720');
    html = updateMeta(html, 'property', 'og:image:height', '1280');
    html = updateMeta(html, 'property', 'og:image:alt', video.title);

    // Strip any video meta tags so Telegram/WhatsApp/Discord don't render an autoplay video player
    html = html.replace(/<meta\s+[^>]*?property=["']og:video[^"']*["'][^>]*?>/gi, '');

    // 4. Twitter / X Cards
    html = updateMeta(html, 'name', 'twitter:card', 'summary_large_image');
    html = updateMeta(html, 'name', 'twitter:url', canonicalUrl);
    html = updateMeta(html, 'name', 'twitter:title', pageTitle);
    html = updateMeta(html, 'name', 'twitter:description', summaryDesc);
    html = updateMeta(html, 'name', 'twitter:image', posterUrl);
    html = updateMeta(html, 'name', 'twitter:image:alt', video.title);
    html = updateMeta(html, 'name', 'twitter:site', '@MintbuilderES');
    html = updateMeta(html, 'name', 'twitter:creator', '@MintbuilderES');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error generating dynamic OG preview:', error);
    const html = getBaseHtml();
    if (html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }
    return res.status(500).send('Internal Server Error');
  }
}
