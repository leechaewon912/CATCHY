export type Category =
  | "GLOBAL TREND"
  | "K-POP"
  | "MEME"
  | "MOVIE"
  | "SPORTS"
  | "TECH";

export type Trend = {
  id: string;
  category: Category;
  title: string;
  summary: string;
  sourcesCount: number;
  expressionsCount: number;
  readTime: string;
};

export type Expression = {
  id: string;
  trendId: string;
  phrase: string;
  meaning: string;
  situation: string;
  context: string;
  example: string;
  exampleTranslation: string;
  sourceCategory: Category;
};

export const categoryStyles: Record<
  Category,
  { gradient: string; tag: string }
> = {
  "GLOBAL TREND": {
    gradient: "from-violet-500 via-fuchsia-500 to-rose-500",
    tag: "bg-fuchsia-300",
  },
  "K-POP": {
    gradient: "from-pink-500 to-rose-400",
    tag: "bg-pink-300",
  },
  MEME: {
    gradient: "from-lime-400 to-emerald-400",
    tag: "bg-lime-300",
  },
  MOVIE: {
    gradient: "from-indigo-500 to-blue-500",
    tag: "bg-indigo-300",
  },
  SPORTS: {
    gradient: "from-orange-500 to-amber-400",
    tag: "bg-amber-300",
  },
  TECH: {
    gradient: "from-cyan-500 to-sky-400",
    tag: "bg-cyan-300",
  },
};

export const heroTrend: Trend = {
  id: "hero-taylor",
  category: "GLOBAL TREND",
  title: '테일러 스위프트 "is this real?" 약혼설 게시물, 24시간만에 1억 뷰',
  summary:
    "테일러 스위프트가 남긴 짧은 게시물 하나에 전세계 팬덤이 들썩였어요. AI가 11개 매체 보도를 종합해 무슨 일이 있었는지, 그리고 사람들이 왜 이 표현을 쓰는지 정리했어요.",
  sourcesCount: 11,
  expressionsCount: 5,
  readTime: "3분",
};

export const trends: Trend[] = [
  {
    id: "trend-rose",
    category: "K-POP",
    title: "블랙핑크 로제, 빌보드 핫100 또 한 번 강타",
    summary:
      "로제의 신곡이 3주 연속 빌보드 상위권을 지키며 SNS에서 밈으로 재생산되는 중이에요.",
    sourcesCount: 8,
    expressionsCount: 4,
    readTime: "2분",
  },
  {
    id: "trend-meme",
    category: "MEME",
    title: '"it\'s giving…" 밈, 다시 SNS를 점령하다',
    summary:
      "Z세대가 문장마다 붙이는 이 표현, 대체 어디서 왔고 어떻게 쓰이는 걸까요.",
    sourcesCount: 6,
    expressionsCount: 3,
    readTime: "2분",
  },
  {
    id: "trend-dune",
    category: "MOVIE",
    title: "'듄: 파트3' 캐스팅 루머에 팬덤 폭발",
    summary:
      "공식 발표 전부터 터진 루머 하나로 영화 커뮤니티가 밤새 들썩였어요.",
    sourcesCount: 9,
    expressionsCount: 3,
    readTime: "3분",
  },
  {
    id: "trend-nba",
    category: "SPORTS",
    title: "NBA 트레이드 데드라인, 실시간 반응 폭주",
    summary:
      "마감 시간을 앞두고 벌어진 급박한 트레이드 소식에 팬들의 반응이 쏟아졌어요.",
    sourcesCount: 12,
    expressionsCount: 4,
    readTime: "3분",
  },
  {
    id: "trend-llm",
    category: "TECH",
    title: "오픈소스 LLM 경쟁, 개발자들의 반응은?",
    summary:
      "새 모델 하나가 공개될 때마다 개발자 커뮤니티의 온도가 달라지고 있어요.",
    sourcesCount: 14,
    expressionsCount: 3,
    readTime: "4분",
  },
  {
    id: "trend-award",
    category: "GLOBAL TREND",
    title: "그래미 시상식 레드카펫, 올해의 화제 룩은",
    summary:
      "시상식 다음 날 아침, SNS 타임라인을 뒤덮은 룩과 그에 대한 반응을 모았어요.",
    sourcesCount: 10,
    expressionsCount: 4,
    readTime: "2분",
  },
];

export const allTrends: Trend[] = [heroTrend, ...trends];

export const expressions: Expression[] = [
  {
    id: "expr-isthisreal",
    trendId: "hero-taylor",
    phrase: "is this real?",
    meaning: "설마 이게 진짜야?",
    situation: "SNS 댓글 · 놀라움 반응",
    context:
      "진위를 진지하게 묻는다기보다, 믿기 힘든 소식에 반사적으로 튀어나오는 감탄사에 가까워요.",
    example: "Wait... is this real? I can't believe it.",
    exampleTranslation: "잠깐... 이거 실화야? 못 믿겠어.",
    sourceCategory: "GLOBAL TREND",
  },
  {
    id: "expr-itsgiving",
    trendId: "trend-meme",
    phrase: "it's giving [x]",
    meaning: "…느낌이야, …분위기야",
    situation: "SNS · 캐주얼 대화",
    context:
      "어떤 분위기나 이미지를 한 문장으로 요약할 때 쓰는 Z세대 표현. 뒤에 원하는 명사구를 자유롭게 붙여요.",
    example: "This outfit is giving main character energy.",
    exampleTranslation: "이 옷 완전 주인공st 느낌이야.",
    sourceCategory: "MEME",
  },
  {
    id: "expr-nocap",
    trendId: "trend-meme",
    phrase: "no cap",
    meaning: "진짜야, 거짓말 아니야",
    situation: "캐주얼 대화 · SNS",
    context:
      "'cap'이 거짓말을 뜻하는 슬랭에서 유래한 표현으로, 문장 끝에 붙여 진심을 강조해요.",
    example: "That show was actually amazing, no cap.",
    exampleTranslation: "그 공연 진짜 대박이었어, 거짓말 안 보태고.",
    sourceCategory: "MEME",
  },
  {
    id: "expr-deadlinedrama",
    trendId: "trend-nba",
    phrase: "deadline drama",
    meaning: "마감 앞두고 벌어지는 소동",
    situation: "스포츠 뉴스 헤드라인",
    context:
      "마감 기한 직전 급박하게 터지는 이슈를 가리킬 때 스포츠 저널리즘에서 자주 쓰는 표현이에요.",
    example: "Every trade deadline brings a whole new level of deadline drama.",
    exampleTranslation: "트레이드 마감 때마다 늘 한바탕 소동이 벌어져.",
    sourceCategory: "SPORTS",
  },
  {
    id: "expr-notready",
    trendId: "trend-llm",
    phrase: "the internet is not ready",
    meaning: "사람들이 감당 못 할 정도의 반응",
    situation: "SNS 캡션 · 헤드라인",
    context:
      "예상 밖의 화제성 있는 소식이 터졌을 때 과장을 섞어 쓰는 표현이에요.",
    example: "This new model just dropped and the internet is not ready.",
    exampleTranslation: "이 신제품 방금 나왔는데 사람들이 감당을 못 하고 있어.",
    sourceCategory: "TECH",
  },
  {
    id: "expr-mainchar",
    trendId: "trend-rose",
    phrase: "main character energy",
    meaning: "주인공 같은 존재감",
    situation: "SNS 캡션 · 칭찬",
    context:
      "누군가 압도적인 존재감이나 자신감을 보일 때 쓰는 표현으로, 스포트라이트를 받는 순간을 묘사해요.",
    example: "She walked in with pure main character energy.",
    exampleTranslation: "그녀는 완전 주인공 같은 존재감으로 등장했어.",
    sourceCategory: "K-POP",
  },
  {
    id: "expr-plottwist",
    trendId: "trend-dune",
    phrase: "plot twist",
    meaning: "반전, 예상 밖의 전개",
    situation: "캐주얼 대화 · 리뷰",
    context:
      "원래 영화·드라마 용어지만, 일상 대화에서 예상 밖 상황을 가리킬 때도 자주 쓰여요.",
    example: "Nobody saw that casting news coming — total plot twist.",
    exampleTranslation: "그 캐스팅 소식은 아무도 예상 못했어, 완전 반전이야.",
    sourceCategory: "MOVIE",
  },
  {
    id: "expr-redcarpetready",
    trendId: "trend-award",
    phrase: "red carpet ready",
    meaning: "완벽하게 꾸민, 준비된",
    situation: "SNS 캡션 · 패션 코멘트",
    context:
      "레드카펫에 설 준비가 된 것처럼 완벽하게 꾸민 모습을 표현할 때 쓰는 문구예요.",
    example: "Give me ten minutes and I'll be red carpet ready.",
    exampleTranslation: "10분만 줘, 바로 레드카펫 나갈 준비 끝낼게.",
    sourceCategory: "GLOBAL TREND",
  },
];

export const quizStats = {
  questionCount: 3,
  estimatedMinutes: 1,
  reviewDue: 4,
  streakDays: 5,
};

export function getTrendById(id: string): Trend | undefined {
  return allTrends.find((trend) => trend.id === id);
}

export function getExpressionsByTrendId(trendId: string): Expression[] {
  return expressions.filter((expression) => expression.trendId === trendId);
}

export type QuizQuestion = {
  id: string;
  phrase: string;
  correctMeaning: string;
  options: string[];
};

export function buildQuizQuestions(
  count: number = quizStats.questionCount,
): QuizQuestion[] {
  const selected = expressions.slice(0, count);

  return selected.map((expression, index) => {
    const distractorPool = expressions
      .filter((candidate) => candidate.id !== expression.id)
      .map((candidate) => candidate.meaning);

    const distractorA = distractorPool[index % distractorPool.length];
    const distractorB = distractorPool[(index + 3) % distractorPool.length];
    const options = [expression.meaning, distractorA, distractorB];
    const rotation = index % options.length;
    const rotatedOptions = [
      ...options.slice(rotation),
      ...options.slice(0, rotation),
    ];

    return {
      id: expression.id,
      phrase: expression.phrase,
      correctMeaning: expression.meaning,
      options: rotatedOptions,
    };
  });
}
