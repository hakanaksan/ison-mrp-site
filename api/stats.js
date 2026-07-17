// Telemetri okuma ucu (SATICI): deneme/aktivasyon sayıları + son olaylar.
// Koruma: env STATS_KEY ile ?key= eşleşmeli (anahtar yoksa uç kapalı — 404).
// Tüketici: web/tools/stats.mjs (ISON_TELEMETRY_STATS_KEY env'i aynı değerle).
async function upstash(commands) {
  // İki bağlama yolunun env adları da tanınır: doğrudan Upstash (UPSTASH_REDIS_REST_*) ya da
  // Vercel Marketplace 'Upstash for Redis' entegrasyonu (KV_REST_API_*).
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
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
  const expected = (process.env.STATS_KEY || '').trim();
  const provided = String((req.query || {}).key || '');
  if (!expected || provided !== expected) {
    res.status(404).json({ error: 'Bulunamadı' });
    return;
  }
  try {
    const result = await upstash([
      ['SCARD', 'ison:machines:trial_started'],
      ['GET', 'ison:events:trial_started'],
      ['SCARD', 'ison:machines:license_activated'],
      ['GET', 'ison:events:license_activated'],
      ['LRANGE', 'ison:recent', 0, 19]
    ]);
    if (!result) {
      res.status(200).json({ configured: false, message: 'Upstash bağlanmamış (UPSTASH_REDIS_REST_URL/TOKEN env eksik).' });
      return;
    }
    const value = (index) => result[index]?.result;
    const recent = (value(4) || []).map((row) => {
      try { return JSON.parse(row); } catch { return null; }
    }).filter(Boolean);
    res.status(200).json({
      configured: true,
      trialMachines: Number(value(0) || 0),
      trialEvents: Number(value(1) || 0),
      activationMachines: Number(value(2) || 0),
      activationEvents: Number(value(3) || 0),
      recent
    });
  } catch (error) {
    res.status(500).json({ error: 'Depo okunamadı' });
  }
};
