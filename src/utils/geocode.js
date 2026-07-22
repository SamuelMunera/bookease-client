// Geocodificación de la ubicación del negocio con Google Maps (Geocoding API).
// La Geocoding API devuelve `Access-Control-Allow-Origin: *`, así que se puede
// llamar desde el navegador. Si VITE_GOOGLE_MAPS_KEY no está configurada se usa
// Nominatim (OpenStreetMap) como fallback para que la app siga funcionando.
const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

export const HAS_GMAPS = !!GMAPS_KEY;

// Devuelve el long_name del primer componente relevante de una dirección Google.
function pickComponent(components, types) {
  for (const type of types) {
    const c = components?.find(x => x.types?.includes(type));
    if (c) return c.long_name;
  }
  return null;
}

// Busca una dirección/ciudad y devuelve { lat, lng, label } o null.
export async function forwardGeocode(query, { signal, country } = {}) {
  if (GMAPS_KEY) {
    const params = new URLSearchParams({ address: query, key: GMAPS_KEY, language: 'es' });
    if (country) params.set('components', `country:${country.toUpperCase()}`);
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, { signal });
    const data = await res.json();
    const r = data.results?.[0];
    if (r?.geometry?.location) {
      const { lat, lng } = r.geometry.location;
      const label =
        pickComponent(r.address_components, ['locality', 'sublocality', 'administrative_area_level_1']) ||
        r.formatted_address?.split(',')[0] || query;
      return { lat, lng, label };
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
  if (GMAPS_KEY) {
    const params = new URLSearchParams({ latlng: `${lat},${lng}`, key: GMAPS_KEY, language: 'es' });
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, { signal });
    const data = await res.json();
    const r = data.results?.[0];
    return (
      pickComponent(r?.address_components, [
        'locality', 'sublocality', 'administrative_area_level_2', 'administrative_area_level_1',
      ]) || r?.formatted_address?.split(',')[0] || null
    );
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

// URL de mapa estático de Google con un pin, o null si no hay key. El mapa
// visible principal es el embed interactivo (ver BusinessDetailPage); esto queda
// disponible por si se necesita una imagen ligera.
export function staticMapUrl(lat, lng, { width = 640, height = 240, zoom = 15 } = {}) {
  if (!GMAPS_KEY) return null;
  return (
    `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}` +
    `&zoom=${zoom}&size=${width}x${height}&scale=2` +
    `&markers=color:red%7C${lat},${lng}&language=es&key=${GMAPS_KEY}`
  );
}
