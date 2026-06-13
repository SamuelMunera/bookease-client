import { useEffect } from 'react';

const SITE_NAME = 'Slotly';
const SITE_URL = 'https://slotly.app';

function setMetaTag(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(path) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', `${SITE_URL}${path}`);
}

/**
 * Sets the document title, meta description, canonical URL and Open Graph /
 * Twitter tags for the current page. Falls back to the defaults already
 * present in index.html when a field is omitted.
 */
export default function useSEO({ title, description, path, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('name', 'twitter:title', fullTitle);

    if (path) {
      setCanonical(path);
      setMetaTag('property', 'og:url', `${SITE_URL}${path}`);
    }

    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, path, noindex]);
}
