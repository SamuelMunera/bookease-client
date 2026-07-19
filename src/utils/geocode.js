// Geocodificación con Mapbox (Geocoding API v6), mucho más precisa que Nominatim.
// Si VITE_MAPBOX_TOKEN no está configurado se usa Nominatim (OpenStreetMap) como
// fallback para que la app siga funcionando sin el token.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const HAS_MAPBOX = !!MAPBOX_TOKEN;

// Busca una dirección/ciudad y devuelve { lat, lng, label } o null.
export async function forwardGeocode(query, { signal, country } = {}) {
  if (MAPBOX_TOKEN) {
    const params = new URLSearchParams({
      q: query,
      access_token: MAPBOX_TOKEN,
      limit: '1',
      language: 'es',
    });
    if (country) params.set('country', country.toLowerCase());
    const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { signal });
    const data = await res.json();
    const f = data.features?.[0];
    if (f?.geometry?.coordinates) {
      const [lng, lat] = f.geometry.coordinates;
      return { lat, lng, label: f.properties?.name || query };
    }
    return null;
  }
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    { signal }
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      label: data[0].display_name?.split(',')[0] || query,
    };
  }
  return null;
}

// Devuelve el nombre del lugar (ciudad/barrio) para unas coordenadas, o null.
export async function reverseGeocode(lat, lng, { signal } = {}) {
  if (MAPBOX_TOKEN) {
    const params = new URLSearchParams({
      longitude: String(lng),
      latitude: String(lat),
      access_token: MAPBOX_TOKEN,
      language: 'es',
      types: 'place,locality,neighborhood',
    });
    const res = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?${params}`, { signal });
    const data = await res.json();
    return data.features?.[0]?.properties?.name || null;
  }
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { signal }
  );
  const d = await res.json();
  return (
    d.address?.city || d.address?.town || d.address?.village || d.address?.suburb ||
    d.display_name?.split(',')[0] || null
  );
}

// URL de imagen de mapa estático de Mapbox con un pin, o null si no hay token.
export function staticMapUrl(lat, lng, { width = 640, height = 240, zoom = 15 } = {}) {
  if (!MAPBOX_TOKEN) return null;
  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
    `pin-s+e11d48(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height}@2x` +
    `?access_token=${MAPBOX_TOKEN}`
  );
}
