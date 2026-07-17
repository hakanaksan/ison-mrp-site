// ISON MRP telemetri ucu (2026-07-16): uygulama sunucuları deneme/aktivasyon olayını buraya
// fire-and-forget POST eder. KİŞİSEL VERİ YOK: makine hash'i (XXXX-XXXX-...) + sürüm + tarih.
//
// DEPO = GitHub'daki ÖZEL repoda düz metin dosyası (ison-telemetry/events.txt, satır başına bir JSON) —
// ekstra servis/hesap YOK, github.com'dan çıplak gözle okunabilir. Yazma yetkisi Vercel env'indeki
// TELEMETRY_GITHUB_TOKEN ile (fine-grained PAT: YALNIZ ison-telemetry reposu, Contents: Read&Write).
// Token yoksa uç 200 döner ama SAKLAMAZ (stored:false): istemci bu uca asla bağımlı değildir.
const ALLOWED_EVENTS = new Set(['trial_started', 'license_activated']);
const MACHINE_RE = /^([A-F0-9]{4}-){3}[A-F0-9]{4}$|^\*$/i;
const REPO = process.env.TELEMETRY_REPO || 'hakanaksan/ison-telemetry';
const FILE_PATH = 'events.txt';

async function githubAppend(line) {
  const token = process.env.TELEMETRY_GITHUB_TOKEN;
  if (!token) return false;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ison-mrp-telemetry',
    'Content-Type': 'application/json'
  };
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
  // Düşük hacim (günde birkaç olay) → oku-ekle-yaz yeterli; sha çakışmasında bir kez yeniden dener.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let sha = null;
    let existing = '';
    const current = await fetch(url, { headers });
    if (current.ok) {
      const payload = await current.json();
      sha = payload.sha;
      existing = Buffer.from(payload.content || '', 'base64').toString('utf8');
    } else if (current.status !== 404) {
      throw new Error(`GitHub GET ${current.status}`);
    }
    const put = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `telemetri: ${line.slice(0, 60)}`,
        content: Buffer.from(existing + line + '\n', 'utf8').toString('base64'),
        ...(sha ? { sha } : {})
      })
    });
    if (put.ok) return true;
    if (put.status !== 409 && put.status !== 422) throw new Error(`GitHub PUT ${put.status}`);
    // sha bayatladı (yarış) → yeniden oku ve tekrar dene
  }
  return false;
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
    const stored = await githubAppend(JSON.stringify({ at: new Date().toISOString(), event, machineId, version }));
    res.status(200).json({ ok: true, stored });
  } catch (error) {
    // Depo hatası istemciyi ilgilendirmez — istemci zaten fire-and-forget.
    res.status(200).json({ ok: true, stored: false });
  }
};
