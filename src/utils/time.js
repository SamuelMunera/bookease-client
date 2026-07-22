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

// Convierte una hora "HH:mm" (24h) a formato 12h con sufijo am/pm:
// "14:00" → "2:00 pm", "09:30" → "9:30 am", "00:15" → "12:15 am".
// Devuelve el valor original si no coincide con el patrón esperado.
export function to12h(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return hhmm ?? '';
  const m = hhmm.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const suffix = h < 12 ? 'am' : 'pm';
  h = h % 12 || 12;
  return `${h}:${min} ${suffix}`;
}
