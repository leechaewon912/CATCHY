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
  phrase: string;
  meaning: string;
  situation: string;
  context: string;
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

export const expressions: Expression[] = [
  {
    id: "expr-isthisreal",
    phrase: "is this real?",
    meaning: "설마 이게 진짜야?",
    situation: "SNS 댓글 · 놀라움 반응",
    context:
      "진위를 진지하게 묻는다기보다, 믿기 힘든 소식에 반사적으로 튀어나오는 감탄사에 가까워요.",
    sourceCategory: "GLOBAL TREND",
  },
  {
    id: "expr-itsgiving",
    phrase: "it's giving [x]",
    meaning: "…느낌이야, …분위기야",
    situation: "SNS · 캐주얼 대화",
    context:
      "어떤 분위기나 이미지를 한 문장으로 요약할 때 쓰는 Z세대 표현. 뒤에 원하는 명사구를 자유롭게 붙여요.",
    sourceCategory: "MEME",
  },
  {
    id: "expr-nocap",
    phrase: "no cap",
    meaning: "진짜야, 거짓말 아니야",
    situation: "캐주얼 대화 · SNS",
    context:
      "'cap'이 거짓말을 뜻하는 슬랭에서 유래한 표현으로, 문장 끝에 붙여 진심을 강조해요.",
    sourceCategory: "MEME",
  },
  {
    id: "expr-deadlinedrama",
    phrase: "deadline drama",
    meaning: "마감 앞두고 벌어지는 소동",
    situation: "스포츠 뉴스 헤드라인",
    context:
      "마감 기한 직전 급박하게 터지는 이슈를 가리킬 때 스포츠 저널리즘에서 자주 쓰는 표현이에요.",
    sourceCategory: "SPORTS",
  },
  {
    id: "expr-notready",
    phrase: "the internet is not ready",
    meaning: "사람들이 감당 못 할 정도의 반응",
    situation: "SNS 캡션 · 헤드라인",
    context:
      "예상 밖의 화제성 있는 소식이 터졌을 때 과장을 섞어 쓰는 표현이에요.",
    sourceCategory: "TECH",
  },
];

export const quizStats = {
  questionCount: 3,
  estimatedMinutes: 1,
  reviewDue: 4,
  streakDays: 5,
};
