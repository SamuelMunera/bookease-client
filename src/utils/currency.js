// Formato de dinero compartido. La app no guarda moneda por transacción: se
// deriva del país del profesional/negocio, con fallback explícito a COP.
const COUNTRY_CURRENCY = { CO: 'COP', US: 'USD' };

export function currencyForCountry(country) {
  return COUNTRY_CURRENCY[country] || 'COP';
}

export function fmtMoney(val, currency = 'COP') {
  if (currency === 'USD') return `$${Number(val || 0).toLocaleString('en-US')}`;
  return `$${Number(val || 0).toLocaleString('es-CO')}`;
}
