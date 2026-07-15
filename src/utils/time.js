// Fecha/hora "actual" evaluada en una timezone concreta (patrón F-004): las
// agendas deben razonar con la hora del negocio/profesional, nunca con la
// fecha UTC de toISOString(), que en América ya va en "mañana" desde las
// ~19:00 locales y corría el día de la agenda (citas de hoy marcadas como
// pasadas, botones de acción ocultos).
export function nowInTimezone(tz) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || 'America/Bogota',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find(p => p.type === t)?.value;
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  };
}

// "Hoy" (YYYY-MM-DD) en la timezone dada; fallback America/Bogota.
export function todayInTimezone(tz) {
  return nowInTimezone(tz).date;
}
