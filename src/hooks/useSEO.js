import { useEffect } from 'react';

const SITE_NAME = 'Slotly';
const SITE_URL = 'https://slotly.app';
// CORE-08: fallback description used to reset when a page that set a custom
// description unmounts, or when the next page omits one — otherwise the stale
// description of the previous page would leak into the new page.
const DEFAULT_DESCRIPTION =
  'Slotly — reserva citas online con los mejores negocios y profesionales.';

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

    // CORE-08: always write a description — the page's own or the default —
    // so a page without one doesn't inherit the previous page's description.
    const effectiveDescription = description || DEFAULT_DESCRIPTION;
    setMetaTag('name', 'description', effectiveDescription);
    setMetaTag('property', 'og:description', effectiveDescription);
    setMetaTag('name', 'twitter:description', effectiveDescription);

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('name', 'twitter:title', fullTitle);

    if (path) {
      setCanonical(path);
      setMetaTag('property', 'og:url', `${SITE_URL}${path}`);
    }

    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // CORE-08: on unmount / before the next run, reset the description back to
    // the default so a stale page-specific description never persists.
    return () => {
      setMetaTag('name', 'description', DEFAULT_DESCRIPTION);
      setMetaTag('property', 'og:description', DEFAULT_DESCRIPTION);
      setMetaTag('name', 'twitter:description', DEFAULT_DESCRIPTION);
    };
  }, [title, description, path, noindex]);
}
