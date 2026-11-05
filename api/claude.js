const MODEL = 'claude-sonnet-5-5';

const PROMPTS = {
  pdf: '당신은 대학생의 공부를 돕는 튜터입니다. 올려준 자료를 한국어로 아래 형식에 맞춰 정리하세요. 마크다운 기호(#, *, -)는 쓰지 말고 일반 텍스트로만 쓰세요.\n\n[핵심 요약]\n5~8줄\n\n[꼭 외울 용어]\n용어: 한 줄 설명 (최대 8개)\n\n[예상 문제]\n객관식 3문제(보기 4개), 단답형 3문제, 서술형 1문제\n\n[정답 및 해설]\n각 문제의 정답과 한 줄 해설',
  lecture: '당신은 대학생의 공부를 돕는 튜터입니다. 아래는 강의를 음성인식으로 받아 적은 글이라 오타나 끊긴 문장이 있을 수 있어요. 문맥에 맞게 바로잡아 한국어로 아래 형식에 맞춰 정리하세요. 마크다운 기호(#, *, -)는 쓰지 말고 일반 텍스트로만 쓰세요.\n\n[한 줄 요약]\n\n[핵심 내용]\n주제별로 짧게 정리\n\n[중요 용어]\n용어: 설명\n\n[복습 퀴즈]\n단답형 5문제와 정답'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 가능해요.' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: '서버에 API 키가 등록되지 않았어요.' });

  const { task, text, pdf } = req.body || {};
  const system = PROMPTS[task];
  if (!system) return res.status(400).json({ error: '알 수 없는 요청이에요.' });

  const content = [];
  if (task === 'pdf') {
    if (!pdf || pdf.length > 4200000) return res.status(400).json({ error: 'PDF가 없거나 너무 커요. (3MB 이하)' });
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf } });
    content.push({ type: 'text', text: '이 자료를 요약하고 문제를 만들어주세요.' });
  } else {
    if (!text || text.length > 30000) return res.status(400).json({ error: '텍스트가 없거나 너무 길어요.' });
    content.push({ type: 'text', text });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 2000, system, messages: [{ role: 'user', content }] })
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: (d.error && d.error.message) || 'AI 호출에 실패했어요.' });
    res.status(200).json({ text: d.content.filter(b => b.type === 'text').map(b => b.text).join('\n') });
  } catch (e) {
    res.status(500).json({ error: '서버 오류가 발생했어요.' });
  }
};
