const crypto = require('crypto');

const DB_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const DB_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(...cmd) {
  const r = await fetch(DB_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + DB_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error);
  return d.result;
}

const hashPw = (pw, salt) => new Promise((ok, no) =>
  crypto.scrypt(pw, salt, 32, (e, k) => (e ? no(e) : ok(k.toString('hex')))));

const fail = (res, code, msg) => res.status(code).json({ error: msg });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'POST 요청만 가능해요.');
  if (!DB_URL || !DB_TOKEN) return fail(res, 500, '데이터베이스가 아직 연결되지 않았어요.');

  const { action, id, pw, token, data } = req.body || {};
  try {
    // ---- 가입 / 로그인 ----
    if (action === 'signup' || action === 'login') {
      const uid = String(id || '').trim().toLowerCase();
      if (!/^[a-z0-9_-]{3,20}$/.test(uid)) return fail(res, 400, '아이디는 영문 소문자, 숫자, _ - 로 3~20자예요.');
      if (typeof pw !== 'string' || pw.length < 4 || pw.length > 64) return fail(res, 400, '비밀번호는 4자 이상이어야 해요.');
      const key = 'user:' + uid;
      let rec;

      if (action === 'signup') {
        const body = data && typeof data === 'object' ? data : {};
        if (JSON.stringify(body).length > 800000) return fail(res, 413, '저장할 데이터가 너무 커요.');
        const salt = crypto.randomBytes(16).toString('hex');
        rec = { salt, hash: await hashPw(pw, salt), data: body, at: Date.now() };
        const made = await redis('SETNX', key, JSON.stringify(rec));
        if (made !== 1) return fail(res, 409, '이미 있는 아이디예요. 다른 아이디를 써주세요.');
      } else {
        const failKey = 'fail:' + uid;
        const fails = Number(await redis('GET', failKey)) || 0;
        if (fails >= 5) return fail(res, 429, '비밀번호를 여러 번 틀렸어요. 10분 뒤에 다시 시도해주세요.');
        const raw = await redis('GET', key);
        rec = raw ? JSON.parse(raw) : null;
        const h = rec ? await hashPw(pw, rec.salt) : null;
        const ok = rec && crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(rec.hash, 'hex'));
        if (!ok) {
          await redis('INCR', failKey);
          await redis('EXPIRE', failKey, 600);
          return fail(res, 401, '아이디 또는 비밀번호가 맞지 않아요.');
        }
        await redis('DEL', failKey);
      }

      const t = crypto.randomBytes(24).toString('hex');
      await redis('SET', 'sess:' + t, uid, 'EX', 60 * 60 * 24 * 60);
      return res.status(200).json({ token: t, id: uid, data: rec.data, at: rec.at });
    }

    // ---- 이후 요청은 로그인 토큰 필요 ----
    const uid = token ? await redis('GET', 'sess:' + token) : null;
    if (!uid) return fail(res, 401, '다시 로그인해주세요.');

    if (action === 'logout') {
      await redis('DEL', 'sess:' + token);
      return res.status(200).json({ ok: true });
    }

    const key = 'user:' + uid;
    const raw = await redis('GET', key);
    if (!raw) return fail(res, 401, '다시 로그인해주세요.');
    const rec = JSON.parse(raw);

    if (action === 'load') return res.status(200).json({ data: rec.data, at: rec.at });

    if (action === 'save') {
      if (!data || typeof data !== 'object') return fail(res, 400, '저장할 데이터가 없어요.');
      if (JSON.stringify(data).length > 800000) return fail(res, 413, '저장할 데이터가 너무 커요.');
      rec.data = data;
      rec.at = Date.now();
      await redis('SET', key, JSON.stringify(rec));
      return res.status(200).json({ at: rec.at });
    }

    return fail(res, 400, '알 수 없는 요청이에요.');
  } catch (e) {
    return fail(res, 500, '서버 오류가 발생했어요.');
  }
};
