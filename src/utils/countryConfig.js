export const COUNTRIES = [
  { code: 'CO', label: '🇨🇴 Colombia' },
  { code: 'US', label: '🇺🇸 United States' },
];

export const US_TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern (ET) — New York, Miami' },
  { value: 'America/Chicago',     label: 'Central (CT) — Chicago, Houston' },
  { value: 'America/Denver',      label: 'Mountain (MT) — Denver, Salt Lake City' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT) — Los Angeles, Seattle' },
  { value: 'America/Phoenix',     label: 'Arizona (MT, no DST)' },
  { value: 'America/Anchorage',   label: 'Alaska' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii' },
];

export const COUNTRY_CONFIG = {
  CO: {
    timezone:           'America/Bogota',
    phonePlaceholder:   '+57 300 000 0000',
    addressPlaceholder: 'Calle 123 # 45-67',
    cityPlaceholder:    'Bogotá',
    cityLabel:          'Ciudad',
    addressLabel:       'Dirección',
    hasState:           false,
    hasZip:             false,
  },
  US: {
    timezone:           null, // user picks
    phonePlaceholder:   '+1 (305) 555-0123',
    addressPlaceholder: '123 Main St',
    cityPlaceholder:    'Miami',
    cityLabel:          'City',
    addressLabel:       'Address',
    stateLabel:         'State',
    statePlaceholder:   'FL',
    zipLabel:           'ZIP Code',
    zipPlaceholder:     '33101',
    hasState:           true,
    hasZip:             true,
  },
};

export function getTimezone(country, timezone) {
  if (country === 'CO') return 'America/Bogota';
  return timezone || 'America/New_York';
}
