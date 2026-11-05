const MODEL = 'claude-sonnet-5-5';

const BASE = '당신은 대학생의 공부를 돕는 튜터입니다. 모든 답은 한국어로 쓰고, 마크다운 기호(#, *, -)는 쓰지 말고 일반 텍스트로만 쓰세요.\n\n';
const BASE_TOOL = '당신은 대학생의 공부를 돕는 튜터입니다. 결과는 반드시 submit 도구를 호출해서 제출하세요. 도구를 쓸 수 없다면 다른 말 없이 같은 구조의 JSON 하나만 출력하세요. 모든 내용은 한국어로 쓰세요(전문 용어는 원어를 같이 써도 돼요).\n\n';

const QUIZ = BASE_TOOL + '자료를 읽고 개념 확인용 객관식 퀴즈를 만드세요.\n규칙:\n개념은 5~10개, 이름은 짧게(15자 이내), 설명은 한두 문장.\n문제는 8개, 보기는 꼭 4개, answer는 정답 보기의 번호(0~3)이고 정답 위치를 골고루 섞기.\n모든 문제의 concept는 concepts에 있는 name과 글자까지 똑같이 쓰기.\n개념마다 문제가 최소 1개는 있게 하기.\nexplain은 왜 정답인지 한 줄.';

const PLAN = BASE_TOOL + '학생 정보를 보고 시험 전날까지 하루 단위 공부 계획을 세우세요.\n규칙:\n"계획에 쓸 날짜"에 있는 날짜만 쓰기(YYYY-MM-DD).\n하루 할 일은 1~3개, 각 35자 이내로 무엇을 어떻게 할지 구체적으로.\n아직 이해 못한 개념을 앞쪽에 먼저 넣고, 2~3일 간격으로 다시 복습.\n마지막 1~2일은 전체 복습과 문제 풀이.\n하루 공부 가능 시간을 넘기지 않기.\n공부 기록 분석에 잘 맞는 시간대나 집중 길이가 있으면 할 일에 반영(예: "오전에", "50분씩 2번").\nadvice에는 이 계획의 전략을 2~3문장으로.';

const CONST = BASE_TOOL + '한 과목의 개념 목록을 보고 서로 관련 있는 개념끼리 묶어 별자리를 만드세요.\n규칙:\n별자리는 2~6개, 별자리마다 개념 2~6개.\n개념 이름은 목록과 글자까지 똑같이 쓰고, 한 개념은 한 별자리에만 넣기. 어디에도 잘 맞지 않는 개념은 빼도 돼요.\nname은 묶음의 공통 주제로 "OO자리" 형식(예: 약동학자리), 8자 이내.\nlinks는 별자리 안에서 직접 이어지는 개념 쌍이에요. 학습 순서나 인과 관계대로 잇고, 모든 개념이 선으로 이어지게 하세요.';

const TOOLS = {
  quiz: {
    type: 'object',
    properties: {
      concepts: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, desc: { type: 'string' } }, required: ['name', 'desc'] } },
      questions: { type: 'array', items: { type: 'object', properties: {
        q: { type: 'string' }, choices: { type: 'array', items: { type: 'string' } }, answer: { type: 'integer' },
        concept: { type: 'string' }, explain: { type: 'string' } }, required: ['q', 'choices', 'answer', 'concept', 'explain'] } }
    },
    required: ['concepts', 'questions']
  },
  constellation: {
    type: 'object',
    properties: {
      groups: { type: 'array', items: { type: 'object', properties: {
        name: { type: 'string' }, members: { type: 'array', items: { type: 'string' } },
        links: { type: 'array', items: { type: 'array', items: { type: 'string' } } } }, required: ['name', 'members', 'links'] } }
    },
    required: ['groups']
  },
  plan: {
    type: 'object',
    properties: {
      advice: { type: 'string' },
      days: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, tasks: { type: 'array', items: { type: 'string' } } }, required: ['date', 'tasks'] } }
    },
    required: ['advice', 'days']
  }
};

const TASKS = {
  pdf_summary: { src: 'pdf', sys: BASE + '올려준 자료를 아래 형식에 맞춰 요약하세요.\n\n[핵심 요약]\n5~8줄\n\n[목차별 정리]\n주제별로 2~3줄씩\n\n[시험에 나올 포인트]\n3~5개' },
  pdf_concept: { src: 'pdf', sys: BASE + '올려준 자료의 개념을 정리하세요.\n\n[핵심 개념]\n용어: 쉬운 설명 (최대 10개)\n\n[개념 사이의 관계]\n3~5줄\n\n[헷갈리기 쉬운 점]\n비교해서 2~4개' },
  pdf_quiz: { src: 'pdf', sys: QUIZ, tool: 'quiz' },
  lecture: { src: 'text', sys: BASE + '아래는 강의를 음성인식으로 받아 적은 글이라 오타나 끊긴 문장이 있을 수 있어요. 문맥에 맞게 바로잡아 아래 형식으로 정리하세요.\n\n[한 줄 요약]\n\n[핵심 내용]\n주제별로 짧게 정리\n\n[중요 용어]\n용어: 설명\n\n[복습 퀴즈]\n단답형 5문제와 정답' },
  lecture_quiz: { src: 'text', sys: QUIZ + '\n자료는 강의를 음성인식으로 받아 적은 글이라 오타가 있을 수 있어요. 문맥에 맞게 이해해서 만드세요.', tool: 'quiz' },
  plan: { src: 'text', sys: PLAN, tool: 'plan' },
  constellation: { src: 'text', sys: CONST, tool: 'constellation' },
  insight: { src: 'text', sys: BASE + '아래는 한 학생의 공부 기록 통계예요. 이 학생에게 맞는 공부 방식을 4~6문장으로 조언하세요. 숫자를 근거로 들되, 기록이 적으면 단정하지 말고 "경향"이라고 표현하세요. 바로 실천할 수 있는 행동 1~2개로 끝내세요.' }
};

function cleanQuiz(x) {
  const cs = (Array.isArray(x.concepts) ? x.concepts : [])
    .filter(c => c && typeof c.name === 'string' && c.name.trim())
    .map(c => ({ name: c.name.trim().slice(0, 40), desc: String(c.desc || '').slice(0, 400) }));
  const names = new Set(cs.map(c => c.name));
  const qs = (Array.isArray(x.questions) ? x.questions : [])
    .map(q => ({ ...q, answer: Number(q && q.answer) }))
    .filter(q => typeof q.q === 'string' && Array.isArray(q.choices) && q.choices.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4)
    .map(q => ({ q: q.q, choices: q.choices.map(String), answer: q.answer, concept: String(q.concept || '').trim().slice(0, 40), explain: String(q.explain || '') }));
  qs.forEach(q => { if (q.concept && !names.has(q.concept)) { cs.push({ name: q.concept, desc: '' }); names.add(q.concept); } });
  if (qs.length < 3) throw new Error('문제를 충분히 만들지 못했어요. 다시 시도해주세요.');
  return { concepts: cs, questions: qs };
}

function cleanConst(x) {
  const groups = (Array.isArray(x.groups) ? x.groups : [])
    .filter(g => g && typeof g.name === 'string' && Array.isArray(g.members))
    .map(g => ({ name: g.name.trim().slice(0, 12), members: g.members.map(String).filter(Boolean),
      links: (Array.isArray(g.links) ? g.links : []).filter(l => Array.isArray(l) && l.length === 2).map(l => [String(l[0]), String(l[1])]) }))
    .filter(g => g.members.length >= 2);
  if (!groups.length) throw new Error('이을 만한 별자리를 찾지 못했어요.');
  return { groups };
}

function cleanPlan(x) {
  const days = (Array.isArray(x.days) ? x.days : [])
    .filter(d => d && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Array.isArray(d.tasks))
    .map(d => ({ date: d.date, tasks: d.tasks.map(String).filter(Boolean).slice(0, 3) }))
    .filter(d => d.tasks.length);
  if (!days.length) throw new Error('계획을 만들지 못했어요. 다시 시도해주세요.');
  return { advice: String(x.advice || ''), days };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 가능해요.' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: '서버에 API 키가 등록되지 않았어요.' });

  const { task, text, pdf } = req.body || {};
  const T = TASKS[task];
  if (!T) return res.status(400).json({ error: '알 수 없는 요청이에요.' });

  const content = [];
  if (T.src === 'pdf') {
    if (!pdf || pdf.length > 4200000) return res.status(400).json({ error: 'PDF가 없거나 너무 커요. (3MB 이하)' });
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf } });
    content.push({ type: 'text', text: '이 자료로 요청한 형식에 맞게 만들어주세요.' });
  } else {
    if (!text || text.length > 30000) return res.status(400).json({ error: '텍스트가 없거나 너무 길어요.' });
    content.push({ type: 'text', text });
  }

  const body = { model: MODEL, max_tokens: T.tool ? 4000 : 2500, system: T.sys, messages: [{ role: 'user', content }] };
  if (T.tool) {
    body.tools = [{ name: 'submit', description: '결과 제출', input_schema: TOOLS[T.tool] }];
    body.tool_choice = { type: 'auto' };
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body)
    });
    const d = await r.json();
    if (!r.ok) return res.status(502).json({ error: (d.error && d.error.message) || 'AI 호출에 실패했어요.' });
    if (T.tool) {
      let input = ((d.content || []).find(b => b.type === 'tool_use') || {}).input;
      if (!input) {
        const t = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
        const a = t.indexOf('{'), z = t.lastIndexOf('}');
        try { input = JSON.parse(t.slice(a, z + 1)); } catch (e) { input = null; }
      }
      if (!input) return res.status(502).json({ error: 'AI 응답을 읽지 못했어요. 다시 시도해주세요.' });
      const use = { input };
      try {
        return res.status(200).json({ data: T.tool === 'quiz' ? cleanQuiz(use.input) : T.tool === 'plan' ? cleanPlan(use.input) : cleanConst(use.input) });
      } catch (e) {
        return res.status(502).json({ error: e.message });
      }
    }
    res.status(200).json({ text: d.content.filter(b => b.type === 'text').map(b => b.text).join('\n') });
  } catch (e) {
    res.status(500).json({ error: '서버 오류가 발생했어요.' });
  }
};
