// ISON MRP telemetri ucu (2026-07-16): uygulama sunucuları deneme/aktivasyon olayını buraya
// fire-and-forget POST eder. KİŞİSEL VERİ YOK: makine hash'i (XXXX-XXXX-...) + sürüm + tarih.
// Depo: Upstash Redis (REST) — env UPSTASH_REDIS_REST_URL/TOKEN yoksa uç 200 döner ama SAKLAMAZ
// (stored:false): istemci tarafı asla bu uca bağımlı değildir, sağlayıcı bağlanana kadar zarif no-op.
const ALLOWED_EVENTS = new Set(['trial_started', 'license_activated']);
const MACHINE_RE = /^([A-F0-9]{4}-){3}[A-F0-9]{4}$|^\*$/i;

async function upstash(commands) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!response.ok) throw new Error(`Upstash HTTP ${response.status}`);
  return response.json();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST bekleniyor' });
    return;
  }
  try {
    const body = typeof req.body === 'object' && req.body ? req.body : {};
    const event = String(body.event || '');
    const machineId = String(body.machineId || '').toUpperCase().slice(0, 24);
    const version = String(body.version || '').slice(0, 20);
    if (!ALLOWED_EVENTS.has(event) || !MACHINE_RE.test(machineId)) {
      res.status(400).json({ error: 'Geçersiz olay' });
      return;
    }
    const at = new Date().toISOString();
    const record = JSON.stringify({ at, event, machineId, version });
    const result = await upstash([
      ['SADD', `ison:machines:${event}`, machineId],   // benzersiz makine sayısı
      ['INCR', `ison:events:${event}`],                // toplam olay
      ['LPUSH', 'ison:recent', record],                // son olaylar
      ['LTRIM', 'ison:recent', 0, 199]
    ]);
    res.status(200).json({ ok: true, stored: result !== null });
  } catch (error) {
    // Depo hatası istemciyi ilgilendirmez — istemci zaten fire-and-forget.
    res.status(200).json({ ok: true, stored: false });
  }
};
