const MODEL = 'claude-sonnet-5-5';

const BASE = '당신은 대학생의 공부를 돕는 튜터입니다. 모든 답은 한국어로 쓰고, 마크다운 기호(#, *, -)는 쓰지 말고 일반 텍스트로만 쓰세요.\n\n';
const BASE_TOOL = '당신은 대학생의 공부를 돕는 튜터입니다. 결과는 반드시 submit 도구를 호출해서 제출하세요. 도구를 쓸 수 없다면 다른 말 없이 같은 구조의 JSON 하나만 출력하세요. 모든 내용은 한국어로 쓰세요(전문 용어는 원어를 같이 써도 돼요).\n\n';

const QUIZ = BASE_TOOL + '자료를 읽고 개념 확인용 객관식 퀴즈를 만드세요.\n규칙:\n개념은 5~10개, 이름은 짧게(15자 이내), 설명은 한두 문장.\n문제는 8개, 보기는 꼭 4개, answer는 정답 보기의 번호(0~3)이고 정답 위치를 골고루 섞기.\n모든 문제의 concept는 concepts에 있는 name과 글자까지 똑같이 쓰기.\n개념마다 문제가 최소 1개는 있게 하기.\nexplain은 왜 정답인지 한 줄.';

const PLAN = BASE_TOOL + '학생 정보를 보고 시험 전날까지 하루 단위 공부 계획을 세우세요.\n규칙:\n"계획에 쓸 날짜"에 있는 날짜만 쓰기(YYYY-MM-DD).\n하루 할 일은 1~3개, 각 35자 이내로 무엇을 어떻게 할지 구체적으로.\n아직 이해 못한 개념을 앞쪽에 먼저 넣고, 2~3일 간격으로 다시 복습.\n마지막 1~2일은 전체 복습과 문제 풀이.\n하루 공부 가능 시간을 넘기지 않기.\n공부 기록 분석에 잘 맞는 시간대나 집중 길이가 있으면 할 일에 반영(예: "오전에", "50분씩 2번").\nadvice에는 이 계획의 전략을 2~3문장으로.';

const CONST = BASE_TOOL + '한 과목의 개념 목록을 보고 서로 관련 있는 개념끼리 묶어 별자리를 만드세요.\n규칙:\n별자리는 2~6개, 별자리마다 개념 2~6개.\n개념 이름은 목록과 글자까지 똑같이 쓰고, 한 개념은 한 별자리에만 넣기. 어디에도 잘 맞지 않는 개념은 빼도 돼요.\nname은 묶음의 공통 주제로 "OO자리" 형식(예: 약동학자리), 8자 이내.\nlinks는 별자리 안에서 직접 이어지는 개념 쌍이에요. 학습 순서나 인과 관계대로 잇고, 모든 개념이 선으로 이어지게 하세요.';

const NOTE = "대학 전공 과목 시험 대비 요약 정리 프롬프트\n\n너는 대학 전공 과목의 ‘시험 대비 요약 정리본’을 만드는 전문가야.\n\n아래 [원문]을 내가 정한 [정리 규칙]과 [출력 형식]에 맞춰 정리해줘.\n\n전공 분야와 관계없이 원문의 핵심 개념·이론·원리·분류·과정·수치·공식·비교 관계를 정확하게 보존하면서 시험 직전에 빠르게 암기하고 복습할 수 있는 압축 정리본을 만드는 것이 목표야.\n\n1. 목표\n\n* 원문을 시험 직전에 빠르게 훑어볼 수 있는 고밀도 압축 정리본으로 변환한다.\n* 핵심 개념, 정의, 특징, 수치, 기준, 분류, 이론, 공식, 원인-결과 관계, 과정, 조건, 예외를 빠짐없이 유지한다.\n* 설명을 길게 풀어 쓰지 않고 핵심어와 기호 중심으로 압축한다.\n* 단순히 분량을 줄이는 것이 아니라 시험 출제에 필요한 정보의 손실을 최소화한다.\n* 교수자가 강조한 내용, 반복되는 핵심 개념, 비교·구분이 필요한 요소를 우선 보존한다.\n* 원문의 논리적 흐름과 개념 간 관계를 유지하여 암기와 이해가 동시에 가능하도록 정리한다.\n\n2. 정리 규칙\n\n(1) 내용 원칙\n\n* 원문에 없는 내용은 절대 추가하지 않는다. 외부 지식이나 일반 상식으로 보충하지 않는다.\n* 원문의 의미를 임의로 해석하거나 수정하지 않는다.\n* 수치(연도, 나이, 용량, 비율, 기간, 범위, 기준값 등), 단위, 고유명사(학자, 이론, 법칙, 제도, 검사명 등), 영문 용어와 약어는 원문 그대로 유지한다.\n* 정의·원리·특징·조건·분류·단계·원인·결과·장단점·예외는 반드시 보존한다.\n* 시험에 필요한 공식과 변수, 조건, 단위, 계산 관계는 생략하지 않는다.\n* 인사말, 불필요한 접속어, 중복 설명, 장황한 예시, 수식어는 삭제한다.\n* 시험에 나올 만한 사례와 예시는 핵심어만 괄호로 남긴다.\n* 동일한 내용이 반복되면 한 번만 정리하되, 서로 다른 조건이나 예외가 포함되어 있으면 각각 유지한다.\n* 원문에 명시된 인과관계, 순서, 비교 관계를 임의로 변경하지 않는다.\n* 원문이 불명확하거나 내용이 누락된 것으로 판단되면 임의로 채우지 않고 [확인 필요] 표시한다.\n* 원문에 없는 중요도, 출제 빈도, 암기법을 임의로 만들어 넣지 않는다.\n\n(2) 문체\n\n* 문장형 종결(~이다, ~한다, ~합니다)을 사용하지 않고 명사·체언 종결 또는 짧은 어구로 정리한다.\n* 조사와 서술어를 최대한 줄이고 핵심어 위주로 작성한다.\n* 하나의 문장에 여러 개념이 포함되면 개념별로 분리한다.\n* 의미가 유지되는 범위에서 최대한 짧게 압축한다.\n* 원문의 전문용어는 유지하고 불필요한 일상어만 삭제한다.\n* 단순 나열보다 개념 간 관계가 드러나도록 정리한다.\n\n예시\n\n* “~을 의미한다” → “용어 : 정의”\n* “~의 특징으로는 A, B, C가 있다” → “특징 : A·B·C”\n* “~로 인해 B가 발생한다” → “A → B 발생”\n* “~에 따라 세 가지로 구분된다” → “분류 : A / B / C”\n* “~와 비교했을 때 증가한다” → “A 대비 증가”\n\n(3) 기호 규칙\n\n아래 기호는 지정된 의미로만 일관되게 사용한다.\n\n* 용어 : 설명 → 정의·개념·특징·조건\n* → → 원인-결과, 진행 순서, 변화 과정, 기전\n* / → 같은 층위의 병렬 항목 또는 “또는”\n* · → 짧은 단어 나열\n* = → 같은 의미, 동의어, 대표값, 수학적 등식\n* ~ → 수치·기간·범위\n* ①②③ → 순서가 있는 단계 또는 번호가 필요한 요소\n* ※ → 시험 포인트, 예외, 주의사항, 핵심 기준\n* ( ) → 예시, 보충 설명, 원어\n* vs → 서로 다른 개념의 비교·대조\n* ↑ → 증가·상승\n* ↓ → 감소·하락\n* + → 결합·합산·추가\n* - → 하위 항목 또는 음수(문맥으로 구분)\n* ≠ → 같지 않음\n* ≥ / ≤ / > / < → 수학적 크기·기준 비교\n\n기호 사용 주의사항\n\n* 단순 병렬 관계에 → 사용 금지\n* 원인-결과 관계에 / 사용 금지\n* 서로 다른 개념을 =로 연결 금지\n* 수치 범위에 - 대신 ~ 사용\n* 공식과 수학 기호는 원문 표기를 우선 유지\n* 기호를 과도하게 사용하여 의미가 불명확해지지 않도록 작성\n\n(4) 구조(위계) 규칙\n\n* 원문의 대·중·소제목 위계를 그대로 유지한다.\n* 기본 위계 : Chapter → N절 → 1. → 1) → (1) → ① → - → ◦\n* 원문에 없는 장·절·소제목을 임의로 추가하지 않는다.\n* 원문의 번호와 순서를 유지한다.\n* 한 줄에 한 개념만 작성한다.\n* 하위 항목은 상위 항목보다 한 칸 들여쓴다.\n* 단, ① → - → ◦과 같은 하위 설명은 한 칸만 들여쓰거나 들여쓰지 않는다.\n* 같은 위계의 항목은 동일한 기호와 들여쓰기 방식으로 통일한다.\n* 상위 개념과 하위 개념의 포함 관계가 명확하게 드러나도록 구성한다.\n* 제목만 있고 내용이 없는 항목은 원문에 실제로 존재하는 경우에만 유지한다.\n* 원문에서 서로 다른 항목으로 구분된 내용을 임의로 합치지 않는다.\n\n(5) 전공별 핵심 내용 정리 순서\n\n내용의 유형에 따라 아래 순서를 적용한다.\n\n단, 원문에 없는 항목은 생략하고, 원문에 명시된 내용만 정리한다.\n\n① 개념·용어\n\n* 정의 → 핵심 특징 → 구성요소 → 분류 → 예시 → 예외\n\n② 이론·학설·모형\n\n* 제시자 → 핵심 개념 → 주요 주장 → 구성요소 → 단계 → 특징 → 한계·비판\n\n③ 원리·법칙·현상\n\n* 정의 → 성립 조건 → 작용 원리 → 과정 → 결과 → 예외\n\n④ 과정·절차·단계\n\n* 목적 → 조건 → ①②③ 진행 순서 → 단계별 특징 → 결과 → 주의사항\n\n⑤ 분류·유형\n\n* 분류 기준 → 유형별 정의 → 특징 → 차이점 → 대표 사례\n\n⑥ 공식·계산\n\n* 공식 → 변수 의미 → 단위 → 적용 조건 → 계산 순서 → 예외\n\n⑦ 제도·정책·법률\n\n* 정의 → 목적 → 적용 대상 → 주요 내용 → 기준 → 절차 → 예외\n\n⑧ 질환·문제·사례\n\n* 원인(발생 기전) → 증상·특징 → 진단·평가 → 치료·해결 방법 → 관리·중재 → 합병증·결과\n\n⑨ 인물·학자·사상\n\n* 인물 → 핵심 주장 → 주요 개념 → 특징 → 다른 이론과의 차이\n\n⑩ 연구·실험·분석\n\n* 목적 → 가설 → 방법 → 변수 → 결과 → 해석 → 한계\n\n※ 위 순서는 정리 기준이며, 원문의 제목 체계와 내용 범위를 우선한다.\n※ 원문에 없는 항목을 채우기 위해 새로운 정보를 추가하지 않는다.\n※ 전공 특성상 별도 관리가 필요한 항목(간호, 중재, 교육, 예방 등)은 원문에 존재하는 경우 독립된 항목으로 구분한다.\n\n(6) 분류·비교 내용 처리\n\n* 단계, 유형, 이론, 학자별 주장, 개념별 특징 등 항목 간 비교가 필요한 내용은 표로 정리한다.\n* 두 개 이상의 개념을 동일한 기준으로 비교할 수 있으면 표 사용을 우선한다.\n* 표 제목은 표 N-N 제목 형식으로 작성한다.\n* 표의 열은 비교 기준에 맞춰 구성한다.\n* 표의 행은 비교 대상별로 구분한다.\n* 표의 각 칸은 핵심어 중심으로 압축한다.\n* 원문에 해당 정보가 없으면 -로 표시한다.\n* 표의 내용은 원문에서 확인되는 정보만 사용한다.\n* 원문의 단순 나열은 불필요하게 표로 바꾸지 않는다.\n* 비교 기준이 서로 다른 내용을 억지로 하나의 표에 넣지 않는다.\n* 표 안의 긴 문장은 핵심어와 기호로 압축한다.\n* 표 밖에 동일한 내용을 반복하여 작성하지 않는다.\n\n표 작성 방식\n\n* 표 제목 : 일반 텍스트\n* 표 본문 : 탭(Tab)으로 열 구분\n* 마크다운 표 문법 사용 금지\n\n(7) 원인·결과 및 과정 정리\n\n* 원인과 결과가 명확한 경우 → 사용\n* 순서가 있는 과정은 ①②③ 또는 →로 정리\n* 서로 다른 원인은 병렬 항목으로 구분\n* 하나의 원인에서 여러 결과가 발생하면 결과별로 분리\n* 조건에 따라 결과가 달라지면 조건별로 구분\n* 단순한 시간적 선후 관계와 인과관계를 혼동하지 않는다.\n* 원문에 없는 중간 기전이나 과정을 추론하여 추가하지 않는다.\n\n(8) 수치·기준·공식 보존\n\n* 모든 수치, 단위, 기간, 비율, 범위, 연도, 기준값을 원문 그대로 유지한다.\n* 수치가 적용되는 대상과 조건을 함께 표시한다.\n* 정상·비정상, 이상·이하, 초과·미만 등의 구분을 정확히 유지한다.\n* 공식의 분자·분모·연산자·괄호를 변경하지 않는다.\n* 서로 다른 기준값을 하나로 통합하지 않는다.\n* 근삿값, 평균값, 대표값을 임의로 정확한 값으로 변경하지 않는다.\n* 원문의 약, 이상, 이하, 초과, 미만 표현을 반드시 보존한다.\n* 수치의 의미가 불명확하면 [확인 필요] 표시한다.\n\n(9) 강조·암기\n\n* 시험에 자주 출제될 가능성이 높은 핵심 정보는 문장 끝에 ※ 표시한다.\n* 강조 대상 : 수치·기준값·공식·핵심 정의·대표 이론·분류 기준·예외·금기·최초·유일·최대·최소\n* 원문에 명시된 가장, 반드시, 오직, 유일, 항상, 절대, 예외 등의 표현은 유지한다.\n* 원문에서 강조한 내용은 압축 과정에서도 강조 의미를 보존한다.\n* 암기용 두문자, 연상법, 약어는 원문에 있는 경우에만 사용한다.\n* 새로운 암기법이나 임의의 출제 예상 문제를 만들지 않는다.\n* 모든 문장에 ※를 붙이지 않고 실제 암기 우선순위가 높은 내용에만 사용한다.\n\n(10) 압축 수준\n\n* 목표 : 원문 대비 분량 축소 + 핵심 정보 최대 보존\n* 반복 설명과 장황한 문장은 적극 삭제\n* 정의·분류·기준·원리·공식·과정·예외는 삭제 금지\n* 긴 문장은 핵심어·기호·짧은 어구로 변환\n* 동일한 의미의 반복 문장은 통합\n* 단, 서로 다른 조건이나 세부 기준이 존재하면 통합 금지\n* 단순히 짧게 만들기 위해 개념의 정확성을 훼손하지 않는다.\n* 원문 분량이 많아도 핵심 내용 누락 없이 정리한다.\n* 원문이 이미 간결하면 불필요하게 다시 축약하지 않는다.\n\n3. 출력 형식\n\n* 마크다운 문법(#, 굵게, 마크다운 표 등)을 사용하지 않는다.\n* 일반 텍스트로 출력한다.\n* 한글(HWP)·워드(Word)에 그대로 붙여넣을 수 있도록 작성한다.\n* 표만 탭(Tab)으로 열을 구분한다.\n* 제목과 본문의 위계를 들여쓰기로 구분한다.\n* 문장형 설명보다 키워드 중심의 압축 정리를 우선한다.\n* 불필요한 인사말, 안내문, 해설, 마무리 문장은 출력하지 않는다.\n* 원문의 제목부터 바로 정리한다.\n* 모든 내용을 한 번에 정리하기 어려우면 원문 순서대로 이어서 정리하고, 임의로 후반부를 생략하지 않는다.\n\n4. 출력 예시\n\n3장. 핵심 개념과 이론\n\n1. 주요 개념\n\n1. 기본 개념\n    개념 A : 특정 현상의 핵심 정의\n\n* 특징 : 요소 1·요소 2·요소 3\n* 구성 : A / B / C\n* 조건 : 특정 기준 충족\n* 결과 : 원인 → 변화 → 결과\n    ※ 핵심 기준 : 원문 수치 유지\n\n2. 주요 원리\n    원리 A : 현상 발생의 기본 원칙\n\n* 조건 : 조건 1·조건 2\n* 과정 : ① 시작 → ② 변화 → ③ 결과\n* 예외 : 특정 조건에서 적용 불가 ※\n\n2. 주요 이론\n    표 3-1 이론별 핵심 비교\n\n이론\t주요 개념\t핵심 특징\t차이점\n이론 A\t개념 A\t특징 1·2\t차이 A\n이론 B\t개념 B\t특징 3·4\t차이 B\n이론 C\t개념 C\t특징 5·6\t차이 C\n\n3. 주요 과정\n\n1. 과정 A\n    목적 : 핵심 목적\n    조건 : 적용 조건\n    단계\n    ① 준비 : 핵심 요소\n    ② 진행 : 주요 작용\n    ③ 결과 : 최종 변화\n    주의 : 특정 조건에서 제한 ※\n\n4. 주요 공식\n\n1. 공식 A\n    공식 : A = B / C\n\n* A : 결과값\n* B : 변수 1\n* C : 변수 2\n* 적용 조건 : 특정 조건\n* 기준값 : 원문 수치 유지 ※\n\n5. 최종 검토 규칙\n\n정리 완료 전 반드시 다음 사항을 내부적으로 점검한다.\n\n① 원문의 핵심 개념·정의·분류·이론·공식·과정 누락 여부\n② 수치·단위·연도·기간·기준값의 정확성\n③ 고유명사·영문 용어·약어의 원문 일치 여부\n④ 원인-결과 및 단계별 순서의 정확성\n⑤ 비교 대상 간 특징·차이점 누락 여부\n⑥ 예외·금기·주의사항 누락 여부\n⑦ 원문에 없는 내용 추가 여부\n⑧ 제목 위계·번호·들여쓰기 일관성\n⑨ 기호 사용의 정확성과 통일성\n⑩ 명사형·키워드 중심 압축 여부\n⑪ 표의 비교 기준과 내용 정확성\n⑫ 동일한 내용의 불필요한 반복 여부\n\n※ 핵심 내용이 누락되었다면 최종 출력 전에 반드시 복원한다.\n※ 내용 보존과 압축이 충돌하면 내용 보존을 우선한다.\n※ 원문에 없는 내용은 절대 추가하지 않는다.\n\n6. 마지막 출력\n\n정리본 마지막에 반드시 다음 항목을 추가한다.\n\n[빠진 내용 점검]\n\n* 원문 대비 핵심 개념·수치·분류·공식·과정 누락 여부\n* 압축 과정에서 삭제한 내용 중 시험에 필요한 정보 존재 여부\n* 원문이 불명확하거나 확인이 필요한 부분\n\n※ 최대 3줄 이내\n※ 누락이 없으면 “핵심 내용 누락 없음” 표시\n※ 확인이 필요한 부분은 해당 항목을 구체적으로 표시\n\n7. 정리할 원문\n\n[원문]은 함께 보낸 책·자료 사진이다. 사진이 여러 장이면 보낸 순서대로 이어지는 원문으로 본다.\n사진 속 글자를 읽어 정리하고, 흐리거나 잘려서 읽기 어려운 부분은 임의로 채우지 않고 [확인 필요] 표시한다.\n사진에 있는 그림·도표는 원문 글자로 확인되는 내용만 정리한다.\n\n8. 앱 표시 규칙 (반드시 지킴)\n\n* 시험에서 빈칸으로 가려 외울 핵심 키워드(전문용어·수치·기준값·고유명사·분류명·단계명)는 {{키워드}}처럼 이중 중괄호로 감싼다.\n* 한 줄에 0~3개, 단어나 짧은 어구 단위로만 감싼다. 문장 전체나 줄 전체를 감싸지 않는다.\n* 표 제목과 위계 번호(1., 1), ① 등)는 감싸지 않는다.\n* 이 표시 외의 마크다운 문법은 쓰지 않는다.";

const NOTE_PDF = NOTE
  .replace('[원문]은 함께 보낸 책·자료 사진이다. 사진이 여러 장이면 보낸 순서대로 이어지는 원문으로 본다.', '[원문]은 함께 보낸 PDF 자료이다. 페이지 순서대로 이어지는 원문으로 본다.')
  .replace('사진 속 글자를 읽어 정리하고, 흐리거나 잘려서 읽기 어려운 부분은', 'PDF의 글자를 읽어 정리하고, 읽기 어려운 부분은')
  .replace('사진에 있는 그림·도표는', 'PDF에 있는 그림·도표는');

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
  note_image: { src: 'images', sys: NOTE, max: 8000 },
  note_pdf: { src: 'pdf', sys: NOTE_PDF, max: 8000 },
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

  const { task, text, pdf, images } = req.body || {};
  const T = TASKS[task];
  if (!T) return res.status(400).json({ error: '알 수 없는 요청이에요.' });

  const content = [];
  if (T.src === 'pdf') {
    if (!pdf || pdf.length > 4200000) return res.status(400).json({ error: 'PDF가 없거나 너무 커요. (3MB 이하)' });
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf } });
    content.push({ type: 'text', text: '이 자료로 요청한 형식에 맞게 만들어주세요.' + (task === 'note_pdf' && text ? '\n참고(과목·범위): ' + String(text).slice(0, 200) : '') });
  } else if (T.src === 'images') {
    const ok = Array.isArray(images) && images.length >= 1 && images.length <= 8 && images.every(x => typeof x === 'string' && x.length > 100);
    const size = ok ? images.reduce((a, x) => a + x.length, 0) : 0;
    if (!ok || size > 4200000) return res.status(400).json({ error: '사진이 없거나 너무 커요. (최대 8장, 합쳐서 3MB 이하)' });
    images.forEach((x, i) => {
      content.push({ type: 'text', text: `사진 ${i + 1}` });
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: x } });
    });
    content.push({ type: 'text', text: '위 사진들이 [원문]이에요. 규칙에 맞춰 정리본만 출력해주세요.' + (text ? '\n참고(과목·범위): ' + String(text).slice(0, 200) : '') });
  } else {
    if (!text || text.length > 30000) return res.status(400).json({ error: '텍스트가 없거나 너무 길어요.' });
    content.push({ type: 'text', text });
  }

  const body = { model: MODEL, max_tokens: T.max || (T.tool ? 4000 : 2500), system: T.sys, messages: [{ role: 'user', content }] };
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
