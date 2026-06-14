export const PLAN_LIMITS = {
  solo:       1,
  team:       3,
  studio:     6,
  enterprise: Infinity,
};

// Single source of truth for every feature that can appear in a plan.
export const FEATURES = {
  bookings:          'Reservas online ilimitadas',
  agenda:            'Agenda digital',
  notifications:     'Notificaciones por email',
  panel:             'Panel de negocio',
  homeService:       'Servicios a domicilio',
  prioritySupport:   'Soporte prioritario',
  linkCode:          'Código de vinculación',
  advancedAnalytics: 'Analíticas avanzadas',
  onboarding:        'Onboarding personalizado',
};

// Which features each plan unlocks. Soporte prioritario is included in
// every plan on purpose — it's a baseline, not a tier differentiator.
const PLAN_FEATURE_KEYS = {
  solo:       ['bookings', 'agenda', 'notifications', 'panel', 'homeService', 'prioritySupport'],
  team:       ['bookings', 'agenda', 'notifications', 'panel', 'homeService', 'prioritySupport', 'linkCode', 'advancedAnalytics'],
  studio:     ['bookings', 'agenda', 'notifications', 'panel', 'homeService', 'prioritySupport', 'linkCode', 'advancedAnalytics'],
  enterprise: Object.keys(FEATURES),
};

function included(planId) {
  return PLAN_FEATURE_KEYS[planId].map(k => FEATURES[k]);
}

function excluded(planId) {
  const keys = PLAN_FEATURE_KEYS[planId];
  return Object.keys(FEATURES).filter(k => !keys.includes(k)).map(k => FEATURES[k]);
}

// Rows shown in the compact "key differences" matrix.
export const COMPARE_FEATURE_KEYS = ['linkCode', 'advancedAnalytics', 'prioritySupport'];

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
    mainBenefit: 'Vincula y organiza hasta 3 profesionales en una sola agenda',
    idealFor: 'Tienes un local con un par de colegas y quieres centralizar la agenda.',
    ctaLabel: 'Crear cuenta de negocio',
    ctaTo: '/register',
  },
  studio: {
    audience: 'Negocios en crecimiento',
    mainBenefit: 'Hasta 6 profesionales + analíticas para tomar mejores decisiones',
    idealFor: 'Tu equipo crece y necesitas datos para decidir qué funciona.',
    ctaLabel: 'Crear cuenta de negocio',
    ctaTo: '/register',
  },
  enterprise: {
    audience: 'Cadenas y franquicias',
    mainBenefit: 'Todo lo del plan Estudio + onboarding a tu medida',
    idealFor: 'Operas 7+ profesionales o varias sedes y necesitas un plan a medida.',
    ctaLabel: 'Hablar con ventas',
    ctaTo: null,
  },
};

function buildPlans(priceMap, currency) {
  return [
    {
      id: 'solo', name: 'Independiente', tagline: 'Para profesionales que trabajan solos',
      professionals: 1, price: priceMap.solo, currency, priceLabel: priceMap.soloLabel, interval: 'mes',
      enterprise: false, forType: 'professional', popular: false,
      features: included('solo'), excludedFeatures: excluded('solo'),
      ...PLAN_META.solo,
    },
    {
      id: 'team', name: 'Equipo', tagline: 'Para negocios con pequeño equipo',
      professionals: 3, price: priceMap.team, currency, priceLabel: priceMap.teamLabel, interval: 'mes',
      enterprise: false, forType: 'business', popular: false,
      features: included('team'), excludedFeatures: excluded('team'),
      ...PLAN_META.team,
    },
    {
      id: 'studio', name: 'Estudio', tagline: 'Para negocios en crecimiento',
      professionals: 6, price: priceMap.studio, currency, priceLabel: priceMap.studioLabel, interval: 'mes',
      enterprise: false, forType: 'business', popular: true,
      features: included('studio'), excludedFeatures: excluded('studio'),
      ...PLAN_META.studio,
    },
    {
      id: 'enterprise', name: 'Empresarial', tagline: 'Para cadenas y equipos grandes',
      professionals: null, price: null, currency, priceLabel: 'A convenir', interval: null,
      enterprise: true, forType: 'business', popular: false,
      features: included('enterprise'), excludedFeatures: excluded('enterprise'),
      ...PLAN_META.enterprise,
    },
  ];
}

export const PLANS_BY_COUNTRY = {
  CO: buildPlans({
    solo: 30000,  soloLabel: '$30.000',
    team: 45000,  teamLabel: '$45.000',
    studio: 60000, studioLabel: '$60.000',
  }, 'COP'),
  US: buildPlans({
    solo: 15, soloLabel: '$15',
    team: 20, teamLabel: '$20',
    studio: 25, studioLabel: '$25',
  }, 'USD'),
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
