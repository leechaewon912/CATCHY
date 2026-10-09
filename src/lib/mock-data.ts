import "server-only";

import {
  hasEnoughSources,
  hasOfficialOrPlatformSource,
  isPublishableTrend,
} from "@/lib/trend-validation";
import { buildQuizFromExpressions } from "@/lib/server/build-quiz";
import { toExpressions } from "@/lib/server/to-expressions";

export { hasEnoughSources, hasOfficialOrPlatformSource, isPublishableTrend };

export type Category =
  | "음악"
  | "영화·시리즈"
  | "밈·인터넷"
  | "라이프스타일"
  | "테크·게임"
  | "스포츠"
  | "글로벌 이슈";

// official: 아티스트/소속사, 영화사/스트리밍, 시상식/리그/기관의 공식 발표나
//           공식 페이지, 공식 보도자료.
// platform: Spotify, YouTube, Netflix, Billboard 차트 등 플랫폼·차트성 자료.
// media: 매체 기사. 사실관계 보조 확인용으로만 사용하고, 문장이나 이미지는
//        인용하지 않는다.
// reference: 배경 정보 확인용 자료.
export type SourceType = "official" | "platform" | "media" | "reference";

export type TrendSource = {
  sourceName: string;
  sourceType: SourceType;
  originalTitle: string;
  originalUrl: string;
  publishedAt: string;
  usageNote: string;
};

// 헷갈리기 쉬운 유사 표현 하나와, 단순 동의어가 아니라 둘의 뉘앙스가 어떻게
// 다른지에 대한 짧은 설명.
export type ExpressionComparison = {
  phrase: string;
  nuanceDiff: string;
};

export type ExpressionSeed = {
  phrase: string;
  meaningKo: string;
  nuance: string;
  usageSituation: string;
  exampleEn: string;
  exampleKo: string;
  // 트렌드 요약 속 예문과는 별개로, 일상 대화에서 쓸 수 있는 두 번째 예문.
  // 아직 일부 기존 DB 행에는 채워지지 않았을 수 있어 선택 필드로 둔다 —
  // 없으면 상세 페이지에서 두 번째 예문 블록을 그냥 생략한다.
  dailyExampleEn?: string;
  dailyExampleKo?: string;
  // 마찬가지로 기존 DB 행과의 호환을 위해 선택 필드. GDELT 수집 파이프라인
  // (generate-trend-draft.ts)은 항상 기본값을 채워 넣지만, 이 필드가 생기기
  // 전에 저장된 행에는 없을 수 있다.
  comparison?: ExpressionComparison;
};

export type Expression = ExpressionSeed & {
  id: string;
  trendId: string;
  category: Category;
};

export type QuizQuestionSeed = {
  phrase: string;
  correctMeaningKo: string;
  optionsKo: string[];
};

export type Trend = {
  id: string;
  title: string;
  category: Category;
  // 카드/히어로에 쓰는 짧은 한 줄 요약.
  summary: string;
  // 표현 학습용 영어 요약. 아래 expressions의 phrase를 문장 안에 포함해
  // 상세 페이지에서 하이라이트된다.
  englishSummary: string;
  // 상세 페이지 "한국어 요약" 섹션에 쓰는 조금 더 긴 한국어 설명.
  koreanSummary: string;
  whyTrending: string;
  sources: TrendSource[];
  expressions: ExpressionSeed[];
  quiz: QuizQuestionSeed[];
  status: "draft" | "published";
  generatedAt: string;
  reviewedAt: string | null;
};

// DESIGN.md's palette is 99% achromatic with a single reserved accent
// (never for general UI), so category badges no longer get a distinct
// color per category — every category renders with the same neutral
// "Tag Pill Badge" styling (see .badge-outline in globals.css).
export const CATEGORY_BADGE_CLASS = "badge-outline";

const GENERATED_AT = "2026-10-06T00:00:00.000Z";
const REVIEWED_AT = "2026-10-06T00:00:00.000Z";

function makeTrend(input: Omit<Trend, "quiz">): Trend {
  return { ...input, quiz: buildQuizFromExpressions(input.expressions) };
}

// 사람이 직접 검토하고 작성한 트렌드 목록. 자동 수집·자동 게시 파이프라인은
// 없고, 모든 콘텐츠는 여기서 draft 또는 published 상태로 수동 관리된다.
// published라도 isPublishableTrend 기준(출처 2개 이상 + official/platform
// 출처 최소 1개)을 통과하지 못하면 getPublishedTrends()에서 제외된다 —
// status 필드 하나만으로 노출 여부를 신뢰하지 않는다.
const ALL_TRENDS: Trend[] = [
  makeTrend({
    id: "music-kpop-solo-global-charts",
    title: "K-pop 솔로 컴백, 해외 메인 차트까지 흔들다",
    category: "음악",
    summary:
      "K-pop 아티스트의 솔로 활동이 소속사 공식 채널과 해외 메인 음악 차트에서 동시에 주목받고 있어요.",
    englishSummary:
      "When a K-pop artist drops a solo single, fans expect it to take the world by storm within days. Official channels post teaser clips first, and soon the track starts to climb the charts overseas as well as at home. For many artists, a strong solo run also helps them cross over into markets where they were once a niche interest.",
    koreanSummary:
      "최근 몇 년 사이 여러 K-pop 아티스트들이 그룹 활동과 별개로 솔로 곡을 내며 해외 메인 음악 차트에 이름을 올리는 사례가 이어지고 있어요. 소속사 공식 채널에 올라온 콘텐츠 반응과 해외 차트 성적이 함께 화제가 되는 경우가 많아요.",
    whyTrending:
      "그룹 활동만으로는 설명되지 않는 개인 성과가 쌓이면서, 팬덤 밖 대중에게도 아티스트 개인의 이름이 알려지는 경우가 늘고 있어요. 공식 채널 공개 직후 해외 차트 반응까지 빠르게 이어지는 속도감이 화제성을 키우는 요인으로 꼽혀요.",
    sources: [
      {
        sourceName: "BLACKPINK 공식 유튜브 채널",
        sourceType: "official",
        originalTitle: "BLACKPINK Official YouTube Channel",
        originalUrl: "https://www.youtube.com/@BLACKPINK",
        publishedAt: "상시 업데이트",
        usageNote:
          "소속 아티스트의 공식 콘텐츠 공개 채널. 영상 내용을 인용하지 않고 공식 발표 채널로서만 참고함.",
      },
      {
        sourceName: "Billboard Hot 100",
        sourceType: "platform",
        originalTitle: "Billboard Hot 100 Chart",
        originalUrl: "https://www.billboard.com/charts/hot-100/",
        publishedAt: "상시 업데이트",
        usageNote: "해외 메인 음악 차트 성적을 확인하기 위한 플랫폼 자료.",
      },
    ],
    expressions: [
      {
        phrase: "take [somewhere] by storm",
        meaningKo: "~을 순식간에 사로잡다, 강타하다",
        nuance: "짧은 시간 안에 폭발적인 인기를 얻었을 때 쓰는 표현이에요.",
        usageSituation: "연예/음악 뉴스, 공식 보도자료",
        exampleEn: "The single took global charts by storm within a week.",
        exampleKo: "그 싱글은 일주일 만에 글로벌 차트를 순식간에 사로잡았다.",
        dailyExampleEn: "Her homemade kimchi took the office potluck by storm.",
        dailyExampleKo: "그녀가 직접 담근 김치는 사무실 회식 자리를 순식간에 사로잡았다.",
        comparison: {
          phrase: "become popular",
          nuanceDiff: "become popular는 그냥 인기를 얻었다는 뜻이고, take ... by storm은 그 인기가 아주 빠르고 강렬하게 퍼졌다는 느낌을 더해요.",
        },
      },
      {
        phrase: "climb the charts",
        meaningKo: "차트 순위를 올라가다",
        nuance: "발매 이후 순위가 꾸준히 상승하는 상황을 설명할 때 써요.",
        usageSituation: "음악 뉴스 헤드라인",
        exampleEn: "Her solo track kept climbing the charts for weeks.",
        exampleKo: "그녀의 솔로 곡은 몇 주 동안 계속 차트를 올라갔다.",
        dailyExampleEn: "My step count has been climbing the charts since I got a dog.",
        dailyExampleKo: "강아지를 키우기 시작한 뒤로 내 걸음 수가 계속 올라가고 있다.",
        comparison: {
          phrase: "top the charts",
          nuanceDiff: "top the charts는 이미 1위를 차지했다는 뜻이고, climb the charts는 아직 순위가 올라가는 중이라는 과정에 초점을 맞춰요.",
        },
      },
      {
        phrase: "cross over into [something]",
        meaningKo: "~ 영역으로 넘어가다, 진출하다",
        nuance:
          "원래 활동하던 영역을 넘어 새로운 시장이나 분야로 확장할 때 쓰는 표현이에요.",
        usageSituation: "음악/엔터테인먼트 분석 기사",
        exampleEn: "The song helped the group cross over into the global pop mainstream.",
        exampleKo: "그 노래는 그룹이 글로벌 팝 메인스트림으로 진출하는 데 도움을 줬다.",
        dailyExampleEn: "He started as a chef but crossed over into running his own YouTube channel.",
        dailyExampleKo: "그는 요리사로 시작했지만 자신의 유튜브 채널을 운영하는 쪽으로 넘어갔다.",
        comparison: {
          phrase: "branch out into [something]",
          nuanceDiff: "branch out into는 원래 영역을 유지하면서 새 분야를 넓혀가는 느낌이고, cross over into는 원래 영역을 벗어나 다른 영역으로 옮겨가는 느낌이 더 강해요.",
        },
      },
    ],
    status: "published",
    generatedAt: GENERATED_AT,
    reviewedAt: REVIEWED_AT,
  }),
  makeTrend({
    id: "movie-netflix-non-english-hit",
    title: "비영어권 시리즈, Netflix 글로벌 톱10을 점령하다",
    category: "영화·시리즈",
    summary:
      "영어가 아닌 언어로 만들어진 시리즈가 Netflix 공식 글로벌 순위에서 꾸준히 상위권을 지키고 있어요.",
    englishSummary:
      "Non-English series have increasingly started to dominate Netflix's own global rankings. Once a show manages to break through, it is often described as the one that put a country's entire industry on the map. A single breakout title can set the stage for an entire wave of similar shows from the same region.",
    koreanSummary:
      "Netflix 공식 글로벌 톱10 페이지를 보면 영어가 아닌 언어로 제작된 시리즈가 여러 주 동안 상위권에 오르는 경우를 자주 볼 수 있어요. 이런 작품 한 편의 성공이 같은 지역에서 만든 다른 작품들에 대한 관심으로 이어지는 흐름도 함께 나타나고 있어요.",
    whyTrending:
      "언어 장벽에도 자막·더빙만으로 전세계 시청자에게 도달한 사례가 쌓이면서, 특정 국가의 콘텐츠 산업 전체에 대한 관심이 함께 올라가는 효과가 주목받고 있어요.",
    sources: [
      {
        sourceName: "Netflix Tudum 공식 글로벌 톱10",
        sourceType: "platform",
        originalTitle: "Netflix Global Top 10",
        originalUrl: "https://www.netflix.com/tudum/top10/",
        publishedAt: "상시 업데이트",
        usageNote: "Netflix가 직접 공개하는 공식 시청 순위 플랫폼 자료.",
      },
      {
        sourceName: "Netflix 공식 뉴스룸",
        sourceType: "official",
        originalTitle: "About Netflix",
        originalUrl: "https://about.netflix.com/en",
        publishedAt: "상시 업데이트",
        usageNote: "Netflix 공식 발표·보도자료 페이지.",
      },
    ],
    expressions: [
      {
        phrase: "break through",
        meaningKo: "(장벽을 넘어) 성공하다, 돌파하다",
        nuance:
          "진입이 어려운 시장이나 영역에서 마침내 큰 성공을 거뒀을 때 쓰는 표현이에요.",
        usageSituation: "엔터테인먼트 산업 분석 기사",
        exampleEn: "The series finally broke through to a global audience.",
        exampleKo: "그 시리즈는 마침내 전세계 시청자에게 성공적으로 다가갔다.",
        dailyExampleEn: "After months of practice, she finally broke through and nailed the dance routine.",
        dailyExampleKo: "몇 달간의 연습 끝에 그녀는 마침내 그 춤 동작을 성공적으로 해냈다.",
        comparison: {
          phrase: "succeed",
          nuanceDiff: "succeed는 그냥 성공했다는 일반적인 말이고, break through는 원래 뚫기 어려웠던 장벽을 넘어섰다는 느낌을 담고 있어요.",
        },
      },
      {
        phrase: "put [somewhere] on the map",
        meaningKo: "~을 유명하게 만들다, 주목받게 만들다",
        nuance:
          "이전에 잘 알려지지 않았던 대상이 어떤 사건을 계기로 널리 알려질 때 쓰는 표현이에요.",
        usageSituation: "산업/문화 분석 기사",
        exampleEn: "This one show put the country's streaming industry on the map.",
        exampleKo: "이 작품 하나가 그 나라의 스트리밍 산업을 널리 알렸다.",
        dailyExampleEn: "That one food truck put our neighborhood on the map.",
        dailyExampleKo: "그 푸드트럭 하나가 우리 동네를 유명하게 만들었다.",
        comparison: {
          phrase: "make [somewhere] famous",
          nuanceDiff: "make famous는 단순히 유명해졌다는 뜻이고, put on the map은 원래 잘 알려지지 않았던 곳이 처음으로 주목받기 시작했다는 느낌이 강해요.",
        },
      },
      {
        phrase: "set the stage for [something]",
        meaningKo: "~을 위한 발판을 마련하다",
        nuance:
          "앞으로 일어날 일의 토대나 분위기를 미리 만들어줄 때 쓰는 표현이에요.",
        usageSituation: "리뷰, 산업 전망 기사",
        exampleEn: "Its success set the stage for a wave of similar international shows.",
        exampleKo: "그 작품의 성공은 비슷한 해외 작품들이 이어질 발판을 마련했다.",
        dailyExampleEn: "Finishing the first draft set the stage for the rest of the project.",
        dailyExampleKo: "초안을 끝낸 것이 나머지 프로젝트를 위한 발판을 마련했다.",
        comparison: {
          phrase: "pave the way for [something]",
          nuanceDiff: "pave the way for는 다음 일이 더 쉽게 일어나도록 길을 닦아준다는 뜻이고, set the stage for는 다음 일이 일어날 상황이나 분위기를 조성했다는 쪽에 더 가까워요.",
        },
      },
    ],
    status: "published",
    generatedAt: GENERATED_AT,
    reviewedAt: REVIEWED_AT,
  }),
  makeTrend({
    id: "meme-internet-slang-dictionary",
    title: "인터넷 밈 표현, 사전 '올해의 단어'까지 오르다",
    category: "밈·인터넷",
    summary:
      "SNS에서 유행한 표현이 매년 여러 사전 출판사의 '올해의 단어'로 선정되며 공식 언어로 자리잡고 있어요.",
    englishSummary:
      "Every year, a handful of expressions that start out as internet slang end up getting serious recognition. Dictionary publishers often say a term has started to enter the mainstream once it begins to gain traction far beyond its original online community. What used to feel like a niche joke can end up being named word of the year.",
    koreanSummary:
      "매년 연말이 되면 주요 사전 출판사들이 그 해를 대표하는 '올해의 단어'를 발표하는데, 최근에는 SNS나 인터넷 커뮤니티에서 유행한 표현이 선정되는 경우가 눈에 띄게 늘었어요. 이는 밈으로 시작된 표현이 일상 언어로 자리잡는 과정을 보여주는 사례로 자주 언급돼요.",
    whyTrending:
      "온라인에서만 쓰이던 표현이 공식적인 사전 출판사의 인정을 받는다는 점이 화제가 되고, 그 표현이 어디서 왔고 왜 퍼졌는지를 두고 다시 온라인에서 이야기가 이어지는 순환이 나타나요.",
    sources: [
      {
        sourceName: "Oxford University Press",
        sourceType: "official",
        originalTitle: "Oxford Word of the Year",
        originalUrl: "https://corp.oup.com/word-of-the-year/",
        publishedAt: "연례 발표",
        usageNote: "사전 출판사의 공식 '올해의 단어' 발표 페이지.",
      },
      {
        sourceName: "Dictionary.com",
        sourceType: "reference",
        originalTitle: "Word of the Year",
        originalUrl: "https://www.dictionary.com/e/word-of-the-year/",
        publishedAt: "연례 발표",
        usageNote:
          "다른 사전 출판사의 올해의 단어 선정 배경을 비교 확인하기 위한 참고 자료.",
      },
    ],
    expressions: [
      {
        phrase: "gain traction",
        meaningKo: "(점점) 주목받다, 확산되다",
        nuance:
          "어떤 표현이나 아이디어가 점점 더 많은 사람들 사이에서 퍼질 때 쓰는 표현이에요.",
        usageSituation: "온라인 트렌드 분석",
        exampleEn: "The phrase gained traction long before any dictionary noticed it.",
        exampleKo: "그 표현은 어떤 사전이 주목하기 훨씬 전부터 이미 확산되고 있었다.",
        dailyExampleEn: "My new morning routine is finally gaining traction.",
        dailyExampleKo: "내 새로운 아침 루틴이 마침내 자리를 잡아가고 있다.",
        comparison: {
          phrase: "become popular",
          nuanceDiff: "become popular는 그냥 인기가 많아졌다는 뜻이고, gain traction은 점점 더 많은 지지나 관심을 서서히 얻어가는 과정을 강조해요.",
        },
      },
      {
        phrase: "enter the mainstream",
        meaningKo: "대중적으로 자리잡다, 주류가 되다",
        nuance:
          "특정 집단에서만 쓰이던 것이 더 넓은 대중에게 받아들여질 때 쓰는 표현이에요.",
        usageSituation: "문화 트렌드 기사",
        exampleEn: "Slang terms often enter the mainstream once older generations start using them too.",
        exampleKo: "속어는 보통 기성세대도 쓰기 시작하면 대중적으로 자리잡는다.",
        dailyExampleEn: "Oat milk has really entered the mainstream at coffee shops now.",
        dailyExampleKo: "오트밀크는 이제 카페에서 완전히 대중적으로 자리잡았다.",
        comparison: {
          phrase: "go viral",
          nuanceDiff: "go viral은 짧은 시간에 폭발적으로 퍼졌다는 뜻이고, enter the mainstream은 시간이 걸리더라도 결국 주류 문화로 받아들여졌다는 뜻이에요.",
        },
      },
      {
        phrase: "start out as [something]",
        meaningKo: "처음엔 ~으로 시작하다",
        nuance: "지금과 다른 모습에서 출발했음을 설명할 때 쓰는 표현이에요.",
        usageSituation: "배경 설명, 기원 소개",
        exampleEn: "The word started out as a joke among a small group of users.",
        exampleKo: "그 단어는 처음엔 소수 사용자들 사이의 농담으로 시작했다.",
        dailyExampleEn: "This recipe started out as a joke between roommates.",
        dailyExampleKo: "이 레시피는 원래 룸메이트들 사이의 농담으로 시작됐다.",
        comparison: {
          phrase: "begin as [something]",
          nuanceDiff: "begin as는 그냥 출발점을 설명하는 중립적인 말이고, start out as는 지금과는 다른 모습에서 시작해 변화해왔다는 느낌을 담고 있어요.",
        },
      },
    ],
    status: "published",
    generatedAt: GENERATED_AT,
    reviewedAt: REVIEWED_AT,
  }),
  makeTrend({
    id: "lifestyle-award-show-fashion",
    title: "시상식 레드카펫, 수상 결과보다 화제인 순간",
    category: "라이프스타일",
    summary:
      "대형 시상식 레드카펫에서 나온 룩 하나가 수상 결과보다 더 큰 화제를 모으는 일이 자주 벌어져요.",
    englishSummary:
      "At nearly every major award show, a handful of red carpet looks end up managing to steal the spotlight from the actual winners. A single bold outfit can turn heads online within minutes of the first photos going out. By the next morning, the look has already split opinion online, long after most people have forgotten who actually won.",
    koreanSummary:
      "그래미 같은 대형 시상식이 끝나고 나면, 정작 수상 결과보다 레드카펫에서 나온 특정 룩이 더 오래 화제가 되는 경우가 많아요. 시상식 주최 측 공식 홈페이지 공개 내용과 별개로, 그 패션에 대한 반응이 온라인에서 따로 퍼지는 흐름이 생겨요.",
    whyTrending:
      "예상 밖의 과감한 스타일링일수록 호불호가 뚜렷하게 갈리고, 그 논쟁 자체가 화제성을 키우는 요인이 돼요.",
    sources: [
      {
        sourceName: "Recording Academy / GRAMMY.com",
        sourceType: "official",
        originalTitle: "GRAMMY Awards Official Site",
        originalUrl: "https://www.grammy.com/",
        publishedAt: "연례 시상식",
        usageNote: "시상식 주최 기관의 공식 홈페이지.",
      },
      {
        sourceName: "Vogue",
        sourceType: "media",
        originalTitle: "Vogue Fashion",
        originalUrl: "https://www.vogue.com/fashion",
        publishedAt: "상시 업데이트",
        usageNote: "레드카펫 패션 보도 경향을 배경 확인용으로만 참고함.",
      },
    ],
    expressions: [
      {
        phrase: "steal the spotlight",
        meaningKo: "스포트라이트를 가로채다, 가장 주목받다",
        nuance:
          "원래 주인공이 아니었는데 가장 큰 관심을 받게 됐을 때 쓰는 표현이에요.",
        usageSituation: "연예 뉴스, 시상식 리뷰",
        exampleEn: "One guest's outfit stole the spotlight from the winners.",
        exampleKo: "한 게스트의 옷차림이 수상자들보다 더 큰 스포트라이트를 가로챘다.",
        dailyExampleEn: "My little brother stole the spotlight at dinner with his jokes.",
        dailyExampleKo: "내 남동생은 농담으로 저녁 식사 자리에서 스포트라이트를 가로챘다.",
        comparison: {
          phrase: "stand out",
          nuanceDiff: "stand out은 단순히 눈에 띈다는 뜻이고, steal the spotlight는 원래 주인공이 받아야 할 관심까지 가져온다는 뉘앙스가 있어요.",
        },
      },
      {
        phrase: "turn heads",
        meaningKo: "시선을 끌다, 주목하게 만들다",
        nuance:
          "지나가는 사람들이 돌아볼 정도로 눈에 띄는 모습을 설명할 때 쓰는 표현이에요.",
        usageSituation: "패션/스타일 기사",
        exampleEn: "Her bold look turned heads the moment she arrived.",
        exampleKo: "그녀의 과감한 룩은 도착하는 순간부터 시선을 끌었다.",
        dailyExampleEn: "Her new haircut turned heads at the office this morning.",
        dailyExampleKo: "그녀의 새 머리 스타일은 오늘 아침 사무실에서 시선을 끌었다.",
        comparison: {
          phrase: "attract attention",
          nuanceDiff: "attract attention은 중립적으로 관심을 끈다는 뜻이고, turn heads는 놀라움이나 감탄 때문에 사람들이 반응적으로 쳐다본다는 느낌이 더 강해요.",
        },
      },
      {
        phrase: "split opinion",
        meaningKo: "의견이 갈리다, 호불호가 나뉘다",
        nuance:
          "어떤 선택이나 스타일에 대해 찬반이 뚜렷하게 나뉠 때 쓰는 표현이에요.",
        usageSituation: "리뷰, 반응 기사",
        exampleEn: "The outfit split opinion online almost instantly.",
        exampleKo: "그 옷차림은 거의 즉시 온라인에서 호불호가 갈렸다.",
        dailyExampleEn: "The new coffee shop's prices really split opinion among my friends.",
        dailyExampleKo: "그 새 카페의 가격은 내 친구들 사이에서 의견을 완전히 갈리게 했다.",
        comparison: {
          phrase: "spark debate",
          nuanceDiff: "spark debate는 사람들이 그 주제로 활발히 논쟁하게 만든다는 뜻이고, split opinion은 찬성과 반대로 의견이 뚜렷이 둘로 나뉘는 결과에 초점을 맞춰요.",
        },
      },
    ],
    status: "published",
    generatedAt: GENERATED_AT,
    reviewedAt: REVIEWED_AT,
  }),
  makeTrend({
    id: "tech-open-source-llm-race",
    title: "오픈소스 LLM 경쟁, 공개될 때마다 벤치마크 전쟁",
    category: "테크·게임",
    summary:
      "새로운 오픈소스 언어모델이 공개될 때마다 개발자들이 공식 모델 허브와 벤치마크로 몰려들어요.",
    englishSummary:
      "Every time a new open-source model gets released, developers rush to put it through its paces using the same benchmarks. A model that manages to rack up downloads within hours is quickly noticed by the wider community. Teams that once relied only on closed, paid models are now starting to give the open-source alternative a real shot.",
    koreanSummary:
      "새로운 오픈소스 언어모델이 공개되면 개발자들이 공식 모델 허브에 올라온 자료를 받아 직접 벤치마크를 돌려보는 경우가 많아요. 성능이 기대 이상으로 나오면 짧은 시간 안에 다운로드 수와 커뮤니티 반응이 함께 올라가요.",
    whyTrending:
      "무료로 공개된 모델이 유료 상업용 모델과 비슷한 성능을 보여줄 때마다, 개발자 커뮤니티 전체의 선택지가 넓어진다는 점에서 매번 화제가 돼요.",
    sources: [
      {
        sourceName: "Hugging Face",
        sourceType: "platform",
        originalTitle: "Hugging Face Models",
        originalUrl: "https://huggingface.co/models",
        publishedAt: "상시 업데이트",
        usageNote: "오픈소스 모델이 실제로 공개되는 공식 플랫폼 허브.",
      },
      {
        sourceName: "GitHub",
        sourceType: "platform",
        originalTitle: "GitHub Trending",
        originalUrl: "https://github.com/trending",
        publishedAt: "상시 업데이트",
        usageNote: "오픈소스 프로젝트에 대한 개발자 반응을 확인하기 위한 플랫폼 자료.",
      },
    ],
    expressions: [
      {
        phrase: "put [something] through its paces",
        meaningKo: "~의 성능을 실제로 테스트해보다",
        nuance:
          "새 도구나 모델이 실제로 잘 작동하는지 다양하게 시험해볼 때 쓰는 표현이에요.",
        usageSituation: "테크 리뷰",
        exampleEn: "Developers immediately put the new model through its paces.",
        exampleKo: "개발자들은 새 모델이 공개되자마자 바로 성능을 테스트해봤다.",
        dailyExampleEn: "We put the new blender through its paces by making five smoothies in a row.",
        dailyExampleKo: "우리는 스무디를 연달아 다섯 개 만들면서 새 블렌더의 성능을 테스트해봤다.",
        comparison: {
          phrase: "test [something] out",
          nuanceDiff: "test out은 그냥 한번 써본다는 가벼운 느낌이고, put through its paces는 다양한 상황에서 제대로 작동하는지 꼼꼼히 시험해본다는 뜻이 강해요.",
        },
      },
      {
        phrase: "rack up [something]",
        meaningKo: "~을 쌓아 올리다, 많이 모으다",
        nuance:
          "짧은 시간 안에 수치(다운로드 수, 조회수 등)가 빠르게 쌓일 때 쓰는 표현이에요.",
        usageSituation: "테크 뉴스, 성과 보도",
        exampleEn: "The model racked up thousands of downloads within a day.",
        exampleKo: "그 모델은 하루 만에 수천 건의 다운로드를 쌓아 올렸다.",
        dailyExampleEn: "He racked up a ton of likes on his very first post.",
        dailyExampleKo: "그는 첫 게시물에서 엄청난 좋아요를 쌓아 올렸다.",
        comparison: {
          phrase: "get a lot of [something]",
          nuanceDiff: "get a lot of는 그냥 많이 얻었다는 중립적인 표현이고, rack up은 짧은 시간 안에 수치가 빠르게 쌓여가는 속도감을 담고 있어요.",
        },
      },
      {
        phrase: "give [something] a real shot",
        meaningKo: "~을 진지하게 한번 써보다, 제대로 시도해보다",
        nuance:
          "이전에는 크게 고려하지 않았던 선택지를 이제는 진지하게 검토해볼 때 쓰는 표현이에요.",
        usageSituation: "개발자 커뮤니티, 리뷰",
        exampleEn: "More teams are finally giving open-source models a real shot.",
        exampleKo: "더 많은 팀들이 마침내 오픈소스 모델을 진지하게 써보고 있다.",
        dailyExampleEn: "I finally gave meal prepping a real shot this week.",
        dailyExampleKo: "나는 이번 주에 마침내 밀프렙을 진지하게 한번 해봤다.",
        comparison: {
          phrase: "try [something]",
          nuanceDiff: "try는 그냥 한번 시도해본다는 뜻이고, give something a real shot은 이전엔 가볍게 여겼던 걸 이번엔 제대로 진지하게 시도해본다는 느낌이 있어요.",
        },
      },
    ],
    status: "published",
    generatedAt: GENERATED_AT,
    reviewedAt: REVIEWED_AT,
  }),
  makeTrend({
    id: "sports-nba-trade-deadline",
    title: "NBA 트레이드 데드라인, 몇 시간 만에 쏟아지는 소식",
    category: "스포츠",
    summary: "NBA 트레이드 마감일에는 여러 구단이 동시에 딜을 발표하며 팬들의 반응이 쏟아져요.",
    englishSummary:
      "Every trade deadline, several teams tend to announce deals within the same few hours, and reactions can blow up social media within minutes. Analysts are quick to weigh in on every single deal, even before either team has played a game together. By the next day, most fans already have an opinion on which side came out ahead.",
    koreanSummary:
      "NBA는 매 시즌 정해진 트레이드 마감일이 있는데, 이 시점이 다가오면 여러 구단이 거의 동시에 딜을 발표하는 경우가 많아요. 리그 공식 사이트에서 트레이드가 확정되는 순간, 팬들의 반응이 실시간으로 쏟아지는 패턴이 반복돼요.",
    whyTrending:
      "예상 밖의 팀으로 선수가 이적하는 소식일수록 반응이 폭발적으로 늘고, 실제 경기 전부터 양 팀의 득실을 따지는 분석이 쏟아지는 점이 매 시즌 반복되는 화제 포인트예요.",
    sources: [
      {
        sourceName: "NBA",
        sourceType: "official",
        originalTitle: "NBA Official Site",
        originalUrl: "https://www.nba.com/",
        publishedAt: "상시 업데이트",
        usageNote: "리그 공식 홈페이지. 트레이드 공식 확정 정보 확인용.",
      },
      {
        sourceName: "ESPN",
        sourceType: "media",
        originalTitle: "ESPN NBA",
        originalUrl: "https://www.espn.com/nba/",
        publishedAt: "상시 업데이트",
        usageNote: "트레이드 반응 및 분석 보도 경향을 배경 확인용으로만 참고함.",
      },
    ],
    expressions: [
      {
        phrase: "blow up",
        meaningKo: "폭발적으로 화제가 되다, 난리가 나다",
        nuance: "뉴스나 사건이 순식간에 큰 반응을 일으킬 때 쓰는 표현이에요.",
        usageSituation: "SNS, 스포츠 뉴스",
        exampleEn: "The trade news blew up social media within minutes.",
        exampleKo: "그 트레이드 소식은 몇 분 만에 SNS에서 난리가 났다.",
        dailyExampleEn: "The video of my cat blew up overnight.",
        dailyExampleKo: "내 고양이 영상이 하룻밤 사이에 폭발적으로 화제가 됐다.",
        comparison: {
          phrase: "go viral",
          nuanceDiff: "go viral은 온라인에서 빠르게 공유되며 퍼진다는 뜻이고, blow up은 꼭 온라인이 아니어도 화제성 자체가 갑자기 폭발적으로 커진다는 데 초점이 있어요.",
        },
      },
      {
        phrase: "weigh in on [something]",
        meaningKo: "~에 대해 의견을 내다, 한마디 하다",
        nuance:
          "전문가나 유명인이 특정 이슈에 대한 자신의 의견을 밝힐 때 쓰는 표현이에요.",
        usageSituation: "분석 기사, 전문가 코멘트",
        exampleEn: "Analysts quickly weighed in on who won the trade.",
        exampleKo: "분석가들은 누가 이번 트레이드에서 이득을 봤는지에 대해 바로 의견을 냈다.",
        dailyExampleEn: "Everyone in the group chat weighed in on where to eat.",
        dailyExampleKo: "단체 채팅방의 모두가 어디서 먹을지에 대해 의견을 냈다.",
        comparison: {
          phrase: "comment on [something]",
          nuanceDiff: "comment on은 그냥 어떤 주제에 대해 말한다는 중립적인 표현이고, weigh in on은 관련자가 자신의 입장을 분명히 밝힌다는 느낌이 강해요.",
        },
      },
      {
        phrase: "come out ahead",
        meaningKo: "더 나은 결과를 얻다, 이득을 보다",
        nuance:
          "거래나 경쟁에서 상대적으로 더 유리한 쪽이 됐을 때 쓰는 표현이에요.",
        usageSituation: "스포츠 분석, 비즈니스 기사",
        exampleEn: "Most analysts agreed that the smaller team came out ahead.",
        exampleKo: "대부분의 분석가들은 그 작은 구단이 더 이득을 봤다고 평가했다.",
        dailyExampleEn: "After splitting the bill fairly, we both came out ahead.",
        dailyExampleKo: "비용을 공평하게 나눈 뒤 우리 둘 다 더 나은 결과를 얻었다.",
        comparison: {
          phrase: "win",
          nuanceDiff: "win은 명확한 승패가 있는 상황에서 이겼다는 뜻이고, come out ahead는 꼭 승부가 아니어도 비교했을 때 더 유리한 쪽이 됐다는 뜻으로 더 넓게 쓰여요.",
        },
      },
    ],
    status: "published",
    generatedAt: GENERATED_AT,
    reviewedAt: REVIEWED_AT,
  }),
  makeTrend({
    id: "global-west-africa-youth-political-participation",
    title: "투표는 못 해도 거리로 나온 서아프리카 청년들",
    category: "글로벌 이슈",
    summary:
      "서아프리카 여러 나라에서 청년들은 피선거권 연령 제한 때문에 출마할 수 없지만 시위에는 적극적으로 참여하고 있어요.",
    englishSummary:
      "In several West African countries, age limits keep many young citizens from running for president, even as they take to the streets to make their voices heard. Observers say this gap between voting rights and the right to run keeps sparking debate every election cycle. Advocacy groups argue that electoral systems still need to keep pace with a much younger population, and that the ongoing protests shed light on exactly why.",
    koreanSummary:
      "서아프리카 여러 나라에서는 대통령 선거 출마에 필요한 최소 연령 제한 때문에 청년들이 입후보할 수 없는 경우가 많아요. 그럼에도 거리 시위에는 청년들이 활발히 참여하고 있고, 이 간극이 여러 공개 자료에서 반복적으로 다뤄지고 있어요.",
    whyTrending:
      "투표권이나 피선거권이 제한된 상태에서도 목소리를 내는 청년들의 모습이 공감을 얻으면서, 정치 참여 연령 제도 전반에 대한 논의로 이어지고 있어요.",
    sources: [
      {
        sourceName: "United Nations",
        sourceType: "official",
        originalTitle: "Global Issues: Youth",
        originalUrl: "https://www.un.org/en/global-issues/youth",
        publishedAt: "상시 업데이트",
        usageNote: "청년 정치·사회 참여에 대한 국제기구 공식 배경 자료.",
      },
      {
        sourceName: "Global Voices",
        sourceType: "media",
        originalTitle:
          "Too young to run, old enough to protest: West Africa's unfinished democratic bargain",
        originalUrl:
          "https://globalvoices.org/2026/10/05/too-young-to-run-old-enough-to-protest-west-africas-unfinished-democratic-bargain/",
        publishedAt: "2026-10-05",
        usageNote: "사실관계 보조 확인용 매체 기사. 문장을 그대로 인용하지 않음.",
      },
    ],
    expressions: [
      {
        phrase: "take to the streets",
        meaningKo: "거리로 나서다, 시위에 나서다",
        nuance:
          "불만이나 요구를 표현하기 위해 공개적으로 거리 시위에 나설 때 쓰는 표현이에요.",
        usageSituation: "시사 뉴스",
        exampleEn: "Thousands took to the streets to demand electoral reform.",
        exampleKo: "수천 명이 선거 제도 개혁을 요구하며 거리로 나섰다.",
        dailyExampleEn: "Fans took to the streets to celebrate the team's win.",
        dailyExampleKo: "팬들은 팀의 승리를 축하하기 위해 거리로 나섰다.",
        comparison: {
          phrase: "protest",
          nuanceDiff: "protest는 반대 의사를 표현하는 행위 자체를 가리키고, take to the streets는 많은 사람이 실제로 거리에 나와 집단으로 행동하는 장면을 강조해요.",
        },
      },
      {
        phrase: "keep pace with [something]",
        meaningKo: "~에 발맞추다, ~을 따라가다",
        nuance:
          "변화하는 상황이나 흐름에 맞춰 함께 변하고 있는지를 설명할 때 쓰는 표현이에요.",
        usageSituation: "시사 분석 기사",
        exampleEn: "Critics say election laws haven't kept pace with a younger population.",
        exampleKo: "비판가들은 선거법이 젊어진 인구 구조에 발맞추지 못했다고 말한다.",
        dailyExampleEn: "My phone can barely keep pace with all the new apps I download.",
        dailyExampleKo: "내 휴대폰은 내가 다운로드하는 새 앱들을 거의 따라가지 못한다.",
        comparison: {
          phrase: "catch up with [something]",
          nuanceDiff: "catch up with는 뒤처진 상태에서 따라잡는다는 뜻이고, keep pace with는 처음부터 계속 같은 속도를 유지하며 따라간다는 뜻이에요.",
        },
      },
      {
        phrase: "shed light on [something]",
        meaningKo: "~을 조명하다, 밝히다",
        nuance:
          "잘 드러나지 않던 문제를 더 잘 이해할 수 있게 드러낼 때 쓰는 표현이에요.",
        usageSituation: "뉴스 분석, 보고서",
        exampleEn: "The protests shed light on a generational gap in political representation.",
        exampleKo: "그 시위는 정치적 대표성에서 나타나는 세대 간 간극을 조명했다.",
        dailyExampleEn: "The documentary shed light on how my favorite coffee is actually grown.",
        dailyExampleKo: "그 다큐멘터리는 내가 좋아하는 커피가 실제로 어떻게 재배되는지를 조명했다.",
        comparison: {
          phrase: "reveal [something]",
          nuanceDiff: "reveal은 숨겨진 사실을 드러낸다는 뜻이고, shed light on은 이미 알려져 있었지만 잘 이해되지 않던 부분을 더 명확히 이해할 수 있게 해준다는 뉘앙스예요.",
        },
      },
    ],
    status: "published",
    generatedAt: GENERATED_AT,
    reviewedAt: REVIEWED_AT,
  }),
  // 아래 두 건은 published로 노출되지 않아야 하는 경우를 보여주는 예시다.
  makeTrend({
    id: "draft-single-source-example",
    title: "(검토 중) 출처 1개뿐인 초안 예시",
    category: "음악",
    summary: "출처가 1개뿐이라 아직 검토 중인 초안 예시예요.",
    englishSummary:
      "This is a draft example used to show that a trend with only one source should stay in draft status and never reach the homepage.",
    koreanSummary:
      "출처가 1개뿐인 콘텐츠는 여러 출처로 사실관계를 교차 확인하지 못했기 때문에 draft 상태로만 둔다는 규칙을 보여주기 위한 예시예요.",
    whyTrending: "이 항목은 실제 노출용이 아니라 draft 처리 규칙을 보여주기 위한 예시예요.",
    sources: [
      {
        sourceName: "demo source placeholder",
        sourceType: "media",
        originalTitle: "Demo source placeholder",
        originalUrl: "https://example.com/demo-source-placeholder",
        publishedAt: "미확인",
        usageNote: "demo source placeholder — 실제 출처 URL이 확인되지 않아 draft로만 유지함.",
      },
    ],
    expressions: [
      {
        phrase: "stay in the works",
        meaningKo: "아직 준비 중이다, 진행 중이다",
        nuance: "결과물이 아직 공개되지 않고 내부적으로 진행 중일 때 쓰는 표현이에요.",
        usageSituation: "프로젝트 상태 설명",
        exampleEn: "The full story is still in the works.",
        exampleKo: "전체 이야기는 아직 준비 중이다.",
      },
      {
        phrase: "hold off on [something]",
        meaningKo: "~을 미루다, 보류하다",
        nuance: "아직 확실하지 않아서 결정이나 발표를 뒤로 미룰 때 쓰는 표현이에요.",
        usageSituation: "편집/검토 프로세스",
        exampleEn: "Editors decided to hold off on publishing until more sources appeared.",
        exampleKo: "편집자들은 출처가 더 확인될 때까지 게시를 보류하기로 했다.",
      },
      {
        phrase: "fall short of [something]",
        meaningKo: "~에 미치지 못하다",
        nuance: "어떤 기준이나 조건을 충분히 만족시키지 못했을 때 쓰는 표현이에요.",
        usageSituation: "검토/평가 기준 설명",
        exampleEn: "A single source falls short of CATCHY's publishing bar.",
        exampleKo: "출처 1개만으로는 CATCHY의 게시 기준에 미치지 못한다.",
      },
    ],
    status: "draft",
    generatedAt: GENERATED_AT,
    reviewedAt: null,
  }),
  makeTrend({
    id: "draft-media-only-mistake-example",
    title: "(검토 중) 공식/플랫폼 출처 누락 예시",
    category: "영화·시리즈",
    summary: "출처는 2개지만 공식/플랫폼 출처가 없어 published 후보가 될 수 없는 예시예요.",
    englishSummary:
      "This is a deliberate test case: status is mistakenly marked as published, but both sources are media outlets, so the validator should still hide this from the homepage.",
    koreanSummary:
      "출처가 2개여도 모두 보조 매체(media)뿐이라면 공식 또는 플랫폼 출처 기준을 통과하지 못해요. status 필드가 실수로 published로 표시되더라도, isPublishableTrend 검증 함수가 이를 다시 걸러내는지 보여주기 위한 예시예요.",
    whyTrending: "이 항목은 검증 함수가 실제로 동작하는지 보여주기 위한 테스트 예시예요.",
    sources: [
      {
        sourceName: "demo source placeholder A",
        sourceType: "media",
        originalTitle: "Demo media source A",
        originalUrl: "https://example.com/demo-media-source-a",
        publishedAt: "미확인",
        usageNote: "demo source placeholder — 실제 매체 기사가 아니라 검증 로직 테스트용.",
      },
      {
        sourceName: "demo source placeholder B",
        sourceType: "media",
        originalTitle: "Demo media source B",
        originalUrl: "https://example.com/demo-media-source-b",
        publishedAt: "미확인",
        usageNote: "demo source placeholder — 실제 매체 기사가 아니라 검증 로직 테스트용.",
      },
    ],
    expressions: [
      {
        phrase: "slip through [something]",
        meaningKo: "~을 모르게 통과하다, 빠져나가다",
        nuance: "점검 과정에서 걸러지지 않고 넘어갈 뻔했을 때 쓰는 표현이에요.",
        usageSituation: "품질 관리, 검토 프로세스",
        exampleEn: "A mislabeled draft nearly slipped through the review process.",
        exampleKo: "잘못 표시된 초안이 검토 과정을 거의 통과할 뻔했다.",
      },
      {
        phrase: "catch [something]",
        meaningKo: "~을 발견하다, 잡아내다",
        nuance: "실수나 오류를 미리 발견해냈을 때 쓰는 표현이에요.",
        usageSituation: "검증/디버깅 설명",
        exampleEn: "The validator caught the mistake before it reached the homepage.",
        exampleKo: "검증 함수가 홈 화면에 노출되기 전에 그 실수를 잡아냈다.",
      },
      {
        phrase: "double-check [something]",
        meaningKo: "~을 다시 한번 확인하다",
        nuance: "이미 확인한 내용을 한 번 더 점검할 때 쓰는 표현이에요.",
        usageSituation: "검토/편집 프로세스",
        exampleEn: "It's always worth double-checking the source types before publishing.",
        exampleKo: "게시하기 전에 출처 유형을 다시 한번 확인하는 게 늘 가치 있다.",
      },
    ],
    // 의도적으로 published로 표시했지만, official/platform 출처가 없어
    // isPublishableTrend가 false를 반환하고 getPublishedTrends()에서 제외된다.
    status: "published",
    generatedAt: GENERATED_AT,
    reviewedAt: REVIEWED_AT,
  }),
];

export function getPublishedTrends(): Trend[] {
  return ALL_TRENDS.filter(isPublishableTrend);
}

export const trends: Trend[] = getPublishedTrends();
export const allTrends: Trend[] = trends;
export const heroTrend: Trend = trends[0];

export function getTrendById(id: string): Trend | undefined {
  return trends.find((trend) => trend.id === id);
}

export const featuredExpressions: Expression[] = trends.flatMap((trend) => {
  const [first] = toExpressions(trend);
  return first ? [first] : [];
});

export const quizStats = {
  questionCount: 3,
  estimatedMinutes: 1,
  reviewDue: trends.length * 3,
  streakDays: 5,
};
