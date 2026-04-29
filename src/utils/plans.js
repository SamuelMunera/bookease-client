export const PLAN_LIMITS = {
  solo:       1,
  team:       3,
  studio:     5,
  enterprise: Infinity,
};

const BASE_FEATURES = [
  'Reservas online ilimitadas',
  'Agenda digital',
  'Notificaciones por email',
  'Panel de negocio',
  'Código de vinculación',
  'Analytics avanzados',
  'Servicios a domicilio',
];

export const PLANS_BY_COUNTRY = {
  CO: [
    {
      id: 'solo', name: 'Independiente', tagline: 'Para profesionales que trabajan solos',
      professionals: 1, price: 49000, currency: 'COP', priceLabel: '$49.000', interval: 'mes',
      enterprise: false, forType: 'professional', popular: false,
      features: ['1 profesional', ...BASE_FEATURES],
    },
    {
      id: 'team', name: 'Equipo', tagline: 'Para negocios con pequeño equipo',
      professionals: 3, price: 89000, currency: 'COP', priceLabel: '$89.000', interval: 'mes',
      enterprise: false, forType: 'business', popular: false,
      features: ['Hasta 3 profesionales', ...BASE_FEATURES],
    },
    {
      id: 'studio', name: 'Estudio', tagline: 'Para negocios en crecimiento',
      professionals: 5, price: 149000, currency: 'COP', priceLabel: '$149.000', interval: 'mes',
      enterprise: false, forType: 'business', popular: true,
      features: ['Hasta 5 profesionales', ...BASE_FEATURES],
    },
    {
      id: 'enterprise', name: 'Empresarial', tagline: 'Para cadenas y equipos grandes',
      professionals: null, price: null, currency: 'COP', priceLabel: 'A convenir', interval: null,
      enterprise: true, forType: 'business', popular: false,
      features: ['6 o más profesionales', ...BASE_FEATURES, 'Soporte prioritario', 'Onboarding personalizado'],
    },
  ],
  US: [
    {
      id: 'solo', name: 'Independiente', tagline: 'Para profesionales que trabajan solos',
      professionals: 1, price: 14, currency: 'USD', priceLabel: '$14', interval: 'mes',
      enterprise: false, forType: 'professional', popular: false,
      features: ['1 profesional', ...BASE_FEATURES],
    },
    {
      id: 'team', name: 'Equipo', tagline: 'Para negocios con pequeño equipo',
      professionals: 3, price: 29, currency: 'USD', priceLabel: '$29', interval: 'mes',
      enterprise: false, forType: 'business', popular: false,
      features: ['Hasta 3 profesionales', ...BASE_FEATURES],
    },
    {
      id: 'studio', name: 'Estudio', tagline: 'Para negocios en crecimiento',
      professionals: 5, price: 49, currency: 'USD', priceLabel: '$49', interval: 'mes',
      enterprise: false, forType: 'business', popular: true,
      features: ['Hasta 5 profesionales', ...BASE_FEATURES],
    },
    {
      id: 'enterprise', name: 'Empresarial', tagline: 'Para cadenas y equipos grandes',
      professionals: null, price: null, currency: 'USD', priceLabel: 'A convenir', interval: null,
      enterprise: true, forType: 'business', popular: false,
      features: ['6 o más profesionales', ...BASE_FEATURES, 'Soporte prioritario', 'Onboarding personalizado'],
    },
  ],
};

export function getPlansForCountry(country) {
  return PLANS_BY_COUNTRY[country] ?? PLANS_BY_COUNTRY.CO;
}

export function getPlanById(planId, country) {
  return getPlansForCountry(country).find(p => p.id === planId) ?? null;
}

export function getPlanLimit(planId) {
  return PLAN_LIMITS[planId] ?? Infinity;
}

export const PLAN_NAMES_ES = {
  solo:       'Independiente',
  team:       'Equipo',
  studio:     'Estudio',
  enterprise: 'Empresarial',
};
