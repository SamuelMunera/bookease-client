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

// Shared marketing copy — identical across CO/US, only price changes.
const PLAN_META = {
  solo: {
    audience: 'Profesionales independientes',
    mainBenefit: 'Tu agenda digital propia, sin comisiones por reserva',
    idealFor: 'Trabajas solo y quieres verte profesional desde el día uno.',
    ctaLabel: 'Crear cuenta de profesional',
    ctaTo: '/pro/register',
  },
  team: {
    audience: 'Negocios con equipo pequeño',
    mainBenefit: 'Organiza hasta 3 profesionales en una sola agenda',
    idealFor: 'Tienes un local con un par de colegas y quieres centralizar la agenda.',
    ctaLabel: 'Crear cuenta de negocio',
    ctaTo: '/register',
  },
  studio: {
    audience: 'Negocios en crecimiento',
    mainBenefit: 'El plan más completo para escalar tu negocio',
    idealFor: 'Tu equipo crece y necesitas más capacidad y analítica para decidir mejor.',
    ctaLabel: 'Crear cuenta de negocio',
    ctaTo: '/register',
  },
  enterprise: {
    audience: 'Cadenas y franquicias',
    mainBenefit: 'Soporte dedicado y onboarding a tu medida',
    idealFor: 'Operas 6+ profesionales o varias sedes y necesitas un plan a medida.',
    ctaLabel: 'Hablar con ventas',
    ctaTo: null,
  },
};

export const PLANS_BY_COUNTRY = {
  CO: [
    {
      id: 'solo', name: 'Independiente', tagline: 'Para profesionales que trabajan solos',
      professionals: 1, price: 49000, currency: 'COP', priceLabel: '$49.000', interval: 'mes',
      enterprise: false, forType: 'professional', popular: false,
      features: ['1 profesional', ...BASE_FEATURES],
      ...PLAN_META.solo,
    },
    {
      id: 'team', name: 'Equipo', tagline: 'Para negocios con pequeño equipo',
      professionals: 3, price: 89000, currency: 'COP', priceLabel: '$89.000', interval: 'mes',
      enterprise: false, forType: 'business', popular: false,
      features: ['Hasta 3 profesionales', ...BASE_FEATURES],
      ...PLAN_META.team,
    },
    {
      id: 'studio', name: 'Estudio', tagline: 'Para negocios en crecimiento',
      professionals: 5, price: 149000, currency: 'COP', priceLabel: '$149.000', interval: 'mes',
      enterprise: false, forType: 'business', popular: true,
      features: ['Hasta 5 profesionales', ...BASE_FEATURES],
      ...PLAN_META.studio,
    },
    {
      id: 'enterprise', name: 'Empresarial', tagline: 'Para cadenas y equipos grandes',
      professionals: null, price: null, currency: 'COP', priceLabel: 'A convenir', interval: null,
      enterprise: true, forType: 'business', popular: false,
      features: ['6 o más profesionales', ...BASE_FEATURES, 'Soporte prioritario', 'Onboarding personalizado'],
      ...PLAN_META.enterprise,
    },
  ],
  US: [
    {
      id: 'solo', name: 'Independiente', tagline: 'Para profesionales que trabajan solos',
      professionals: 1, price: 14, currency: 'USD', priceLabel: '$14', interval: 'mes',
      enterprise: false, forType: 'professional', popular: false,
      features: ['1 profesional', ...BASE_FEATURES],
      ...PLAN_META.solo,
    },
    {
      id: 'team', name: 'Equipo', tagline: 'Para negocios con pequeño equipo',
      professionals: 3, price: 29, currency: 'USD', priceLabel: '$29', interval: 'mes',
      enterprise: false, forType: 'business', popular: false,
      features: ['Hasta 3 profesionales', ...BASE_FEATURES],
      ...PLAN_META.team,
    },
    {
      id: 'studio', name: 'Estudio', tagline: 'Para negocios en crecimiento',
      professionals: 5, price: 49, currency: 'USD', priceLabel: '$49', interval: 'mes',
      enterprise: false, forType: 'business', popular: true,
      features: ['Hasta 5 profesionales', ...BASE_FEATURES],
      ...PLAN_META.studio,
    },
    {
      id: 'enterprise', name: 'Empresarial', tagline: 'Para cadenas y equipos grandes',
      professionals: null, price: null, currency: 'USD', priceLabel: 'A convenir', interval: null,
      enterprise: true, forType: 'business', popular: false,
      features: ['6 o más profesionales', ...BASE_FEATURES, 'Soporte prioritario', 'Onboarding personalizado'],
      ...PLAN_META.enterprise,
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
