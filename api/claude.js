const MODEL = 'claude-sonnet-5-5';

const BASE = '당신은 대학생의 공부를 돕는 튜터입니다. 모든 답은 한국어로 쓰고, 마크다운 기호(#, *, -)는 쓰지 말고 일반 텍스트로만 쓰세요.\n\n';

const PROMPTS = {
  pdf_summary: BASE + '올려준 자료를 아래 형식에 맞춰 요약하세요.\n\n[핵심 요약]\n5~8줄\n\n[목차별 정리]\n주제별로 2~3줄씩\n\n[시험에 나올 포인트]\n3~5개',
  pdf_quiz: BASE + '올려준 자료로 시험 문제를 만드세요.\n\n[객관식]\n4문제 (보기 4개)\n\n[단답형]\n4문제\n\n[서술형]\n2문제\n\n[정답 및 해설]\n문제마다 정답과 한 줄 해설',
  pdf_concept: BASE + '올려준 자료의 개념을 정리하세요.\n\n[핵심 개념]\n용어: 쉬운 설명 (최대 10개)\n\n[개념 사이의 관계]\n3~5줄\n\n[헷갈리기 쉬운 점]\n비교해서 2~4개',
  lecture: BASE + '아래는 강의를 음성인식으로 받아 적은 글이라 오타나 끊긴 문장이 있을 수 있어요. 문맥에 맞게 바로잡아 아래 형식으로 정리하세요.\n\n[한 줄 요약]\n\n[핵심 내용]\n주제별로 짧게 정리\n\n[중요 용어]\n용어: 설명\n\n[복습 퀴즈]\n단답형 5문제와 정답'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 가능해요.' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: '서버에 API 키가 등록되지 않았어요.' });

  const { task, text, pdf } = req.body || {};
  const system = PROMPTS[task];
  if (!system) return res.status(400).json({ error: '알 수 없는 요청이에요.' });

  const content = [];
  if (task.startsWith('pdf')) {
    if (!pdf || pdf.length > 4200000) return res.status(400).json({ error: 'PDF가 없거나 너무 커요. (3MB 이하)' });
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf } });
    content.push({ type: 'text', text: '이 자료로 요청한 형식에 맞게 만들어주세요.' });
  } else {
    if (!text || text.length > 30000) return res.status(400).json({ error: '텍스트가 없거나 너무 길어요.' });
    content.push({ type: 'text', text });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 2500, system, messages: [{ role: 'user', content }] })
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: (d.error && d.error.message) || 'AI 호출에 실패했어요.' });
    res.status(200).json({ text: d.content.filter(b => b.type === 'text').map(b => b.text).join('\n') });
  } catch (e) {
    res.status(500).json({ error: '서버 오류가 발생했어요.' });
  }
};
