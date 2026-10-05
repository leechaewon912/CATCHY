export type Category =
  | "라이프스타일"
  | "음악"
  | "밈·인터넷"
  | "영화·시리즈"
  | "스포츠"
  | "테크·게임";

export type Source = {
  outlet: string;
  title: string;
  url: string;
};

export type Trend = {
  id: string;
  category: Category;
  title: string;
  summary: string;
  whyTrending: string;
  sourcesCount: number;
  expressionsCount: number;
  readTime: string;
  sources: Source[];
};

export type Expression = {
  id: string;
  trendId: string;
  phrase: string;
  meaning: string;
  nuance: string;
  situation: string;
  example: string;
  exampleTranslation: string;
  sourceCategory: Category;
  featured?: boolean;
};

export const categoryStyles: Record<
  Category,
  { gradient: string; tag: string }
> = {
  "라이프스타일": {
    gradient: "from-violet-500 via-fuchsia-500 to-rose-500",
    tag: "bg-fuchsia-300",
  },
  "음악": {
    gradient: "from-pink-500 to-rose-400",
    tag: "bg-pink-300",
  },
  "밈·인터넷": {
    gradient: "from-lime-400 to-emerald-400",
    tag: "bg-lime-300",
  },
  "영화·시리즈": {
    gradient: "from-indigo-500 to-blue-500",
    tag: "bg-indigo-300",
  },
  "스포츠": {
    gradient: "from-orange-500 to-amber-400",
    tag: "bg-amber-300",
  },
  "테크·게임": {
    gradient: "from-cyan-500 to-sky-400",
    tag: "bg-cyan-300",
  },
};

export const heroTrend: Trend = {
  id: "hero-taylor",
  category: "라이프스타일",
  title: '테일러 스위프트 "is this real?" 약혼설 게시물, 24시간만에 1억 뷰',
  summary:
    "테일러 스위프트가 남긴 짧은 게시물 하나에 전세계 팬덤이 들썩였어요. AI가 11개 매체 보도를 종합해 무슨 일이 있었는지, 그리고 사람들이 왜 이 표현을 쓰는지 정리했어요.",
  whyTrending:
    "테일러 스위프트가 별다른 설명 없이 올린 게시물 하나가 24시간 만에 1억 뷰를 넘기며 전 세계 트렌드 1위에 올랐어요. 파파라치 사진이나 공식 발표가 아니라 본인의 SNS를 통해 직접 소식을 전한 방식이 화제성을 키웠고, 팬덤뿐 아니라 일반 대중까지 반응하면서 순식간에 글로벌 이슈가 됐어요.",
  sourcesCount: 11,
  expressionsCount: 3,
  readTime: "3분",
  sources: [
    {
      outlet: "Entertainment Weekly",
      title: "Taylor Swift Just Broke the Internet — Here's What Happened",
      url: "https://news.example/entertainment-weekly/taylor-swift-announcement",
    },
    {
      outlet: "People",
      title: "Fans React to Taylor Swift's Surprise Post",
      url: "https://news.example/people/taylor-swift-fan-reaction",
    },
    {
      outlet: "BuzzFeed News",
      title: "Why Everyone Is Talking About Taylor Swift Today",
      url: "https://news.example/buzzfeed-news/taylor-swift-trending",
    },
  ],
};

export const trends: Trend[] = [
  {
    id: "trend-rose",
    category: "음악",
    title: "블랙핑크 로제, 빌보드 핫100 또 한 번 강타",
    summary:
      "로제의 신곡이 3주 연속 빌보드 상위권을 지키며 SNS에서 밈으로 재생산되는 중이에요.",
    whyTrending:
      "로제의 신곡이 발매 3주 만에 빌보드 상위권에 재진입하면서, 이번엔 성적 그 자체보다 노래 속 가사 한 줄이 밈으로 재생산되며 화제가 됐어요. 팬들이 가사를 자기 상황에 빗대어 쓰기 시작하면서 음악 이슈에서 SNS 밈 트렌드로 확장됐어요.",
    sourcesCount: 8,
    expressionsCount: 3,
    readTime: "2분",
    sources: [
      {
        outlet: "Billboard",
        title: "Rosé Returns to the Hot 100 for a Third Week",
        url: "https://news.example/billboard/rose-hot-100-week-three",
      },
      {
        outlet: "Rolling Stone",
        title: "How Rosé's Lyric Became a Meme",
        url: "https://news.example/rolling-stone/rose-lyric-meme",
      },
      {
        outlet: "Teen Vogue",
        title: "Fans Can't Stop Quoting Rosé's New Song",
        url: "https://news.example/teen-vogue/rose-new-song-quotes",
      },
    ],
  },
  {
    id: "trend-meme",
    category: "밈·인터넷",
    title: '"it\'s giving…" 밈, 다시 SNS를 점령하다',
    summary:
      "Z세대가 문장마다 붙이는 이 표현, 대체 어디서 왔고 어떻게 쓰이는 걸까요.",
    whyTrending:
      "'it's giving...' 표현이 몇 달째 잠잠하다가, 한 유명인의 인터뷰 클립이 퍼지면서 다시 폭발적으로 쓰이기 시작했어요. 원래 있던 표현이 특정 밈 포맷과 결합하면서 새로운 방식으로 재유행하는, 전형적인 인터넷 밈의 순환 구조를 보여주는 사례예요.",
    sourcesCount: 6,
    expressionsCount: 3,
    readTime: "2분",
    sources: [
      {
        outlet: "Know Your Meme",
        title: "The Return of 'It's Giving': A Timeline",
        url: "https://news.example/know-your-meme/its-giving-timeline",
      },
      {
        outlet: "Dazed",
        title: "Why Gen Z Can't Stop Saying 'It's Giving'",
        url: "https://news.example/dazed/gen-z-its-giving",
      },
      {
        outlet: "The Cut",
        title: "A Linguist Explains the 'It's Giving' Phenomenon",
        url: "https://news.example/the-cut/linguist-its-giving",
      },
    ],
  },
  {
    id: "trend-dune",
    category: "영화·시리즈",
    title: "'듄: 파트3' 캐스팅 루머에 팬덤 폭발",
    summary:
      "공식 발표 전부터 터진 루머 하나로 영화 커뮤니티가 밤새 들썩였어요.",
    whyTrending:
      "공식 발표 전, 한 팬 계정이 촬영장 근처에서 찍힌 사진을 근거로 캐스팅 루머를 제기하면서 영화 커뮤니티가 밤새 들썩였어요. 스튜디오 측의 침묵이 오히려 추측을 키우면서, 진위 여부와 별개로 화제성만으로 하루 종일 실시간 트렌드에 올랐어요.",
    sourcesCount: 9,
    expressionsCount: 3,
    readTime: "3분",
    sources: [
      {
        outlet: "Variety",
        title: "Dune: Part Three Casting Rumors Intensify",
        url: "https://news.example/variety/dune-part-three-casting-rumors",
      },
      {
        outlet: "The Hollywood Reporter",
        title: "Studio Stays Silent Amid Dune Casting Buzz",
        url: "https://news.example/hollywood-reporter/dune-casting-buzz",
      },
      {
        outlet: "IGN",
        title: "Everything We Know About the Dune: Part Three Cast",
        url: "https://news.example/ign/dune-part-three-cast-rumors",
      },
    ],
  },
  {
    id: "trend-nba",
    category: "스포츠",
    title: "NBA 트레이드 데드라인, 실시간 반응 폭주",
    summary:
      "마감 시간을 앞두고 벌어진 급박한 트레이드 소식에 팬들의 반응이 쏟아졌어요.",
    whyTrending:
      "트레이드 마감 시한 몇 시간을 남기고 여러 팀이 동시다발적으로 딜을 성사시키면서, 실시간으로 중계를 지켜보던 팬들의 반응이 SNS를 뒤덮었어요. 특히 예상 밖의 팀으로 이적한 선수 소식이 알려지자 반응이 폭발적으로 늘었어요.",
    sourcesCount: 12,
    expressionsCount: 3,
    readTime: "3분",
    sources: [
      {
        outlet: "ESPN",
        title: "Trade Deadline Recap: Every Deal That Went Down",
        url: "https://news.example/espn/trade-deadline-recap",
      },
      {
        outlet: "The Athletic",
        title: "Grading Every Trade From Deadline Day",
        url: "https://news.example/the-athletic/trade-deadline-grades",
      },
      {
        outlet: "Bleacher Report",
        title: "Fans React to Shocking Deadline Day Trades",
        url: "https://news.example/bleacher-report/deadline-day-fan-reaction",
      },
    ],
  },
  {
    id: "trend-llm",
    category: "테크·게임",
    title: "오픈소스 LLM 경쟁, 개발자들의 반응은?",
    summary:
      "새 모델 하나가 공개될 때마다 개발자 커뮤니티의 온도가 달라지고 있어요.",
    whyTrending:
      "새로운 오픈소스 LLM이 공개되자마자 벤치마크 점수가 기존 모델을 앞서면서 개발자 커뮤니티에서 실시간으로 화제가 됐어요. 무료로 공개된 점과 상업용 모델과 견줄 만한 성능이 동시에 주목받으며, 하루 만에 여러 기술 매체가 앞다퉈 보도했어요.",
    sourcesCount: 14,
    expressionsCount: 3,
    readTime: "4분",
    sources: [
      {
        outlet: "TechCrunch",
        title: "New Open-Source Model Beats Benchmarks Overnight",
        url: "https://news.example/techcrunch/open-source-model-benchmarks",
      },
      {
        outlet: "The Verge",
        title: "Developers Are Buzzing About This New AI Model",
        url: "https://news.example/the-verge/developers-new-ai-model",
      },
      {
        outlet: "Ars Technica",
        title: "Inside the Open-Source Model Taking Over Reddit",
        url: "https://news.example/ars-technica/open-source-model-reddit",
      },
    ],
  },
  {
    id: "trend-award",
    category: "라이프스타일",
    title: "그래미 시상식 레드카펫, 올해의 화제 룩은",
    summary:
      "시상식 다음 날 아침, SNS 타임라인을 뒤덮은 룩과 그에 대한 반응을 모았어요.",
    whyTrending:
      "시상식 다음 날 아침, 레드카펫에서 포착된 몇몇 룩이 패션 커뮤니티를 중심으로 급속도로 퍼지면서 시상식 결과보다 패션이 더 화제가 됐어요. 특히 예상 밖의 과감한 스타일링이 호불호를 가르며 논쟁으로 번진 점이 화제성을 키웠어요.",
    sourcesCount: 10,
    expressionsCount: 3,
    readTime: "2분",
    sources: [
      {
        outlet: "Vogue",
        title: "Every Best-Dressed Look From This Year's Grammys",
        url: "https://news.example/vogue/grammys-best-dressed",
      },
      {
        outlet: "E! News",
        title: "The Red Carpet Look Everyone's Talking About",
        url: "https://news.example/e-news/grammys-red-carpet-buzz",
      },
      {
        outlet: "Harper's Bazaar",
        title: "Grammys Fashion: The Boldest Choices of the Night",
        url: "https://news.example/harpers-bazaar/grammys-boldest-fashion",
      },
    ],
  },
];

export const allTrends: Trend[] = [heroTrend, ...trends];

export const expressions: Expression[] = [
  // hero-taylor
  {
    id: "expr-isthisreal",
    trendId: "hero-taylor",
    phrase: "is this real?",
    meaning: "설마 이게 진짜야?",
    nuance:
      "진위를 진지하게 묻는다기보다, 믿기 힘든 소식에 반사적으로 튀어나오는 감탄사에 가까워요.",
    situation: "SNS 댓글 · 놀라움 반응",
    example: "Wait... is this real? I can't believe it.",
    exampleTranslation: "잠깐... 이거 실화야? 못 믿겠어.",
    sourceCategory: "라이프스타일",
    featured: true,
  },
  {
    id: "expr-internetbroke",
    trendId: "hero-taylor",
    phrase: "the internet broke",
    meaning: "인터넷이 난리 났다, 폭발적인 반응이 쏟아졌다",
    nuance:
      "실제로 서버가 다운됐다는 뜻이 아니라, SNS 반응이 폭발적일 때 과장해서 쓰는 표현이에요.",
    situation: "뉴스 헤드라인 · SNS 캡션",
    example: "The internet broke when the photos leaked.",
    exampleTranslation: "사진이 유출되자 인터넷이 난리가 났다.",
    sourceCategory: "라이프스타일",
  },
  {
    id: "expr-caughtoffguard",
    trendId: "hero-taylor",
    phrase: "caught everyone off guard",
    meaning: "모두의 허를 찔렀다, 예상 못한 타이밍이었다",
    nuance:
      "발표 시점이나 방식이 전혀 예상 밖이었을 때, 격식 있는 뉴스 문체에서도 자주 쓰는 표현이에요.",
    situation: "뉴스 기사 본문",
    example: "The announcement caught everyone off guard.",
    exampleTranslation: "그 발표는 모두의 허를 찔렀다.",
    sourceCategory: "라이프스타일",
  },

  // trend-rose
  {
    id: "expr-mainchar",
    trendId: "trend-rose",
    phrase: "main character energy",
    meaning: "주인공 같은 존재감",
    nuance:
      "누군가 압도적인 존재감이나 자신감을 보일 때 쓰는 표현으로, 스포트라이트를 받는 순간을 묘사해요.",
    situation: "SNS 캡션 · 칭찬",
    example: "She walked in with pure main character energy.",
    exampleTranslation: "그녀는 완전 주인공 같은 존재감으로 등장했어.",
    sourceCategory: "음악",
    featured: true,
  },
  {
    id: "expr-runsthecharts",
    trendId: "trend-rose",
    phrase: "runs the charts",
    meaning: "차트를 휩쓸다, 장악하다",
    nuance:
      "압도적인 성적을 낼 때 스포츠 중계하듯 쓰는 캐주얼한 음악 저널리즘 표현이에요.",
    situation: "음악 뉴스 헤드라인",
    example: "Her new single is running the charts this week.",
    exampleTranslation: "그녀의 신곡이 이번 주 차트를 휩쓸고 있어.",
    sourceCategory: "음악",
  },
  {
    id: "expr-breakingtheinternet",
    trendId: "trend-rose",
    phrase: "breaking the internet",
    meaning: "(반응이) 폭발적이다, 난리다",
    nuance:
      "'the internet broke'와 비슷하지만 진행형으로 써서 '지금 한창 화제'라는 현재진행 뉘앙스를 강조해요.",
    situation: "SNS 캡션",
    example: "Rosé is breaking the internet with this comeback.",
    exampleTranslation: "로제가 이번 컴백으로 인터넷을 뒤집어놓고 있어.",
    sourceCategory: "음악",
  },

  // trend-meme
  {
    id: "expr-itsgiving",
    trendId: "trend-meme",
    phrase: "it's giving [x]",
    meaning: "…느낌이야, …분위기야",
    nuance:
      "어떤 분위기나 이미지를 한 문장으로 요약할 때 쓰는 Z세대 표현. 뒤에 원하는 명사구를 자유롭게 붙여요.",
    situation: "SNS · 캐주얼 대화",
    example: "This outfit is giving main character energy.",
    exampleTranslation: "이 옷 완전 주인공st 느낌이야.",
    sourceCategory: "밈·인터넷",
    featured: true,
  },
  {
    id: "expr-nocap",
    trendId: "trend-meme",
    phrase: "no cap",
    meaning: "진짜야, 거짓말 아니야",
    nuance:
      "'cap'이 거짓말을 뜻하는 슬랭에서 유래한 표현으로, 문장 끝에 붙여 진심을 강조해요.",
    situation: "캐주얼 대화 · SNS",
    example: "That show was actually amazing, no cap.",
    exampleTranslation: "그 공연 진짜 대박이었어, 거짓말 안 보태고.",
    sourceCategory: "밈·인터넷",
  },
  {
    id: "expr-itsxforme",
    trendId: "trend-meme",
    phrase: "it's the [x] for me",
    meaning: "내가 제일 꽂힌/공감되는 부분은 …야",
    nuance:
      "문장 전체에서 특정 디테일 하나를 콕 집어 강조할 때 쓰는 Z세대 화법이에요.",
    situation: "트윗 · 댓글",
    example: "It's the confidence for me.",
    exampleTranslation: "나는 그 자신감이 제일 좋더라.",
    sourceCategory: "밈·인터넷",
  },

  // trend-dune
  {
    id: "expr-plottwist",
    trendId: "trend-dune",
    phrase: "plot twist",
    meaning: "반전, 예상 밖의 전개",
    nuance:
      "원래 영화·드라마 용어지만, 일상 대화에서 예상 밖 상황을 가리킬 때도 자주 쓰여요.",
    situation: "캐주얼 대화 · 리뷰",
    example: "Nobody saw that casting news coming — total plot twist.",
    exampleTranslation: "그 캐스팅 소식은 아무도 예상 못했어, 완전 반전이야.",
    sourceCategory: "영화·시리즈",
    featured: true,
  },
  {
    id: "expr-confirmedtherumors",
    trendId: "trend-dune",
    phrase: "confirmed the rumors",
    meaning: "소문을 공식화했다, 사실로 확인해줬다",
    nuance:
      "루머가 사실로 밝혀졌을 때 엔터 뉴스에서 자주 쓰는 정형화된 표현이에요.",
    situation: "뉴스 헤드라인",
    example: "The studio finally confirmed the rumors.",
    exampleTranslation: "제작사가 마침내 그 소문을 공식 확인했다.",
    sourceCategory: "영화·시리즈",
  },
  {
    id: "expr-brokethenews",
    trendId: "trend-dune",
    phrase: "broke the news",
    meaning: "소식을 처음 전하다, 특종을 내다",
    nuance:
      "저널리즘 용어지만 일상에서도 '제일 먼저 말해준 사람'을 가리킬 때 캐주얼하게 써요.",
    situation: "뉴스 바이라인 · 캐주얼 대화",
    example: "A fan account broke the news before any official outlet.",
    exampleTranslation: "한 팬 계정이 공식 매체보다 먼저 소식을 터뜨렸어.",
    sourceCategory: "영화·시리즈",
  },

  // trend-nba
  {
    id: "expr-deadlinedrama",
    trendId: "trend-nba",
    phrase: "deadline drama",
    meaning: "마감 앞두고 벌어지는 소동",
    nuance:
      "마감 기한 직전 급박하게 터지는 이슈를 가리킬 때 스포츠 저널리즘에서 자주 쓰는 표현이에요.",
    situation: "스포츠 뉴스 헤드라인",
    example: "Every trade deadline brings a whole new level of deadline drama.",
    exampleTranslation: "트레이드 마감 때마다 늘 한바탕 소동이 벌어져.",
    sourceCategory: "스포츠",
    featured: true,
  },
  {
    id: "expr-shookuptheleague",
    trendId: "trend-nba",
    phrase: "shook up the league",
    meaning: "리그 판도를 뒤흔들다",
    nuance:
      "트레이드나 사건 하나가 전체 판세에 큰 영향을 줬을 때 쓰는 스포츠 저널리즘 관용구예요.",
    situation: "스포츠 헤드라인",
    example: "That trade shook up the entire league.",
    exampleTranslation: "그 트레이드 하나가 리그 전체를 뒤흔들었다.",
    sourceCategory: "스포츠",
  },
  {
    id: "expr-callingitearly",
    trendId: "trend-nba",
    phrase: "calling it early",
    meaning: "미리 예측/단정 짓다",
    nuance:
      "아직 결과가 안 나왔는데 성급하게 결론 내는 사람을 가리킬 때 약간 비꼬는 뉘앙스로도 쓰여요.",
    situation: "캐주얼 대화 · 댓글",
    example: "I'm calling it early — this trade wins them the title.",
    exampleTranslation: "미리 말해두는데, 이 트레이드로 우승 갈 거야.",
    sourceCategory: "스포츠",
  },

  // trend-llm
  {
    id: "expr-notready",
    trendId: "trend-llm",
    phrase: "the internet is not ready",
    meaning: "사람들이 감당 못 할 정도의 반응",
    nuance:
      "예상 밖의 화제성 있는 소식이 터졌을 때 과장을 섞어 쓰는 표현이에요.",
    situation: "SNS 캡션 · 헤드라인",
    example: "This new model just dropped and the internet is not ready.",
    exampleTranslation: "이 신제품 방금 나왔는데 사람들이 감당을 못 하고 있어.",
    sourceCategory: "테크·게임",
    featured: true,
  },
  {
    id: "expr-underthehood",
    trendId: "trend-llm",
    phrase: "under the hood",
    meaning: "내부적으로, 세부 구조를 들여다보면",
    nuance:
      "겉으로 보이는 결과물이 아니라 내부 구조·작동 방식을 설명할 때 개발자들이 즐겨 쓰는 관용구예요.",
    situation: "기술 리뷰 · 개발자 토론",
    example: "Under the hood, the model uses a completely new architecture.",
    exampleTranslation: "내부적으로 보면 이 모델은 완전히 새로운 구조를 쓰고 있어.",
    sourceCategory: "테크·게임",
  },
  {
    id: "expr-gamechanger",
    trendId: "trend-llm",
    phrase: "game changer",
    meaning: "판도를 바꾸는 것",
    nuance:
      "과장 섞인 극찬으로 테크 업계에서 남발되는 편이라, 약간 클리셰처럼 받아들여지기도 해요.",
    situation: "리뷰 · 트윗",
    example: "This release could be a real game changer for open-source AI.",
    exampleTranslation: "이번 출시는 오픈소스 AI 업계의 판도를 바꿀 수도 있어.",
    sourceCategory: "테크·게임",
  },

  // trend-award
  {
    id: "expr-redcarpetready",
    trendId: "trend-award",
    phrase: "red carpet ready",
    meaning: "완벽하게 꾸민, 준비된",
    nuance:
      "레드카펫에 설 준비가 된 것처럼 완벽하게 꾸민 모습을 표현할 때 쓰는 문구예요.",
    situation: "SNS 캡션 · 패션 코멘트",
    example: "Give me ten minutes and I'll be red carpet ready.",
    exampleTranslation: "10분만 줘, 바로 레드카펫 나갈 준비 끝낼게.",
    sourceCategory: "라이프스타일",
    featured: true,
  },
  {
    id: "expr-stoletheshow",
    trendId: "trend-award",
    phrase: "stole the show",
    meaning: "그 자리를 완전히 장악하다, 최고의 주목을 받다",
    nuance:
      "다른 사람들도 많았지만 한 사람·한 순간이 유독 부각됐을 때 쓰는 흔한 엔터 표현이에요.",
    situation: "시상식 리뷰 기사",
    example: "Her entrance completely stole the show.",
    exampleTranslation: "그녀의 등장이 그날 시상식을 완전히 훔쳤다.",
    sourceCategory: "라이프스타일",
  },
  {
    id: "expr-servinglooks",
    trendId: "trend-award",
    phrase: "serving looks",
    meaning: "완벽한 스타일링을 선보이다",
    nuance:
      "패션·뷰티 쪽 SNS 용어로, 'serve'가 여기서는 음식이 아니라 '선보이다'라는 캐주얼한 의미로 쓰여요.",
    situation: "패션 코멘트 · SNS 캡션",
    example: "Everyone on the carpet was serving looks tonight.",
    exampleTranslation: "오늘 레드카펫 다들 완전 비주얼 미쳤더라.",
    sourceCategory: "라이프스타일",
  },
];

export const featuredExpressions: Expression[] = expressions.filter(
  (expression) => expression.featured,
);

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

export function buildQuizQuestions(params?: {
  trendId?: string;
  count?: number;
}): QuizQuestion[] {
  const pool = params?.trendId
    ? getExpressionsByTrendId(params.trendId)
    : expressions;
  const count = params?.count ?? Math.min(quizStats.questionCount, pool.length);
  const selected = pool.slice(0, count);

  return selected.map((expression, index) => {
    const distractorPool = pool
      .filter((candidate) => candidate.id !== expression.id)
      .map((candidate) => candidate.meaning);

    const distractorA = distractorPool[index % distractorPool.length];
    const distractorB =
      distractorPool[(index + 1) % distractorPool.length] !== distractorA
        ? distractorPool[(index + 1) % distractorPool.length]
        : distractorPool[(index + 2) % distractorPool.length];
    const answerOptions = [expression.meaning, distractorA, distractorB].filter(
      (option, i, arr) => arr.indexOf(option) === i,
    );
    const rotation = index % answerOptions.length;
    const rotatedOptions = [
      ...answerOptions.slice(rotation),
      ...answerOptions.slice(0, rotation),
    ];

    return {
      id: expression.id,
      phrase: expression.phrase,
      correctMeaning: expression.meaning,
      options: rotatedOptions,
    };
  });
}
