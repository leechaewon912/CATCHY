import type { TrendCategoryV2 } from "@/lib/server/local-test/google-trends-categories-v2";

// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// Hand-authored, category-level vocabulary — not derived from any
// specific trending term's news coverage. Same discipline as
// google-trends-expressions.ts's v1 bank (reused directly for the 3
// categories that map cleanly onto it); 국제·사회/경제·금융/기타 are new.
export type TrendExpressionV2 = {
  phrase: string;
  meaningKo: string;
  nuance: string;
  usageSituation: string;
  exampleEn: string;
  exampleKo: string;
};

const EXPRESSION_BANK_V2: Record<TrendCategoryV2, TrendExpressionV2[]> = {
  "국제·사회": [
    {
      phrase: "a public figure",
      meaningKo: "공인",
      nuance: "정치인, 관료 등 대중에게 알려지고 책임을 지는 위치의 사람을 가리켜요.",
      usageSituation: "정치·사회 뉴스",
      exampleEn: "As a public figure, every statement she makes gets scrutinized.",
      exampleKo: "공인으로서 그녀의 모든 발언은 꼼꼼히 검토된다.",
    },
    {
      phrase: "draw criticism",
      meaningKo: "비판을 받다",
      nuance: "어떤 발언이나 행동이 비판적 반응을 불러일으킬 때 쓰는 중립적 표현이에요.",
      usageSituation: "정치·사회 이슈",
      exampleEn: "The policy change drew criticism from several lawmakers.",
      exampleKo: "그 정책 변경은 여러 의원들로부터 비판을 받았다.",
    },
    {
      phrase: "a developing story",
      meaningKo: "현재 진행 중인 사안",
      nuance: "아직 결론이 나지 않고 계속 업데이트되고 있는 뉴스를 가리킬 때 써요.",
      usageSituation: "속보, 사회 이슈",
      exampleEn: "We'll keep following this developing story.",
      exampleKo: "이 진행 중인 사안을 계속 지켜볼 예정이다.",
    },
    {
      phrase: "gain traction",
      meaningKo: "점점 더 지지/관심을 얻다",
      nuance: "어떤 주장이나 움직임이 서서히 더 많은 지지를 얻어갈 때 써요.",
      usageSituation: "사회 운동, 여론 흐름",
      exampleEn: "The proposal is gaining traction among voters.",
      exampleKo: "그 제안은 유권자들 사이에서 점점 더 지지를 얻고 있다.",
    },
  ],
  "경제·금융": [
    {
      phrase: "trade higher/lower",
      meaningKo: "주가가 오르다/내리다",
      nuance: "주식 시세가 어느 방향으로 움직였는지 말할 때 쓰는 표준 표현이에요.",
      usageSituation: "주식·증시 뉴스",
      exampleEn: "Shares traded lower after the announcement.",
      exampleKo: "발표 이후 주가는 하락세로 거래됐다.",
    },
    {
      phrase: "a sell-off",
      meaningKo: "투매, 대량 매도",
      nuance: "많은 투자자가 한꺼번에 팔면서 가격이 급락하는 상황을 가리켜요.",
      usageSituation: "증시 급락 뉴스",
      exampleEn: "The sector saw a sharp sell-off this week.",
      exampleKo: "이번 주 그 업종에서는 급격한 투매가 있었다.",
    },
    {
      phrase: "go public",
      meaningKo: "기업공개(IPO)를 하다",
      nuance: "사기업이 증시에 상장해 일반 투자자에게 주식을 공개 판매한다는 뜻이에요.",
      usageSituation: "IPO·기업 뉴스",
      exampleEn: "The startup plans to go public next year.",
      exampleKo: "그 스타트업은 내년에 기업공개를 할 계획이다.",
    },
    {
      phrase: "score a deal",
      meaningKo: "좋은 조건으로 득템하다",
      nuance: "할인이나 특가를 잘 잡았을 때 쓰는 캐주얼한 표현이에요.",
      usageSituation: "쇼핑, 세일 시즌",
      exampleEn: "Shoppers lined up early to score a deal.",
      exampleKo: "쇼핑객들은 득템하려고 일찍부터 줄을 섰다.",
    },
  ],
  "기술·과학": [
    {
      phrase: "roll out",
      meaningKo: "(기능·제품을) 단계적으로 출시하다",
      nuance: "한 번에 전체 공개가 아니라 순차적으로 배포한다는 뉘앙스가 있어요.",
      usageSituation: "앱 업데이트, 신제품 출시",
      exampleEn: "The company began to roll out the new feature.",
      exampleKo: "그 회사는 새 기능을 단계적으로 출시하기 시작했다.",
    },
    {
      phrase: "a game changer",
      meaningKo: "판도를 바꾸는 것",
      nuance: "업계나 상황 전체의 흐름을 바꿀 만큼 중요한 변화를 가리켜요.",
      usageSituation: "신기술·신제품 평가",
      exampleEn: "This could be a game changer for the industry.",
      exampleKo: "이건 업계의 판도를 바꿀 수도 있다.",
    },
    {
      phrase: "early adopters",
      meaningKo: "얼리어답터, 초기 수용자",
      nuance: "신기술을 남들보다 먼저 써보는 사람들을 가리키는 표준 표현이에요.",
      usageSituation: "신제품 반응, 사용자 트렌드",
      exampleEn: "Early adopters are already testing the new device.",
      exampleKo: "얼리어답터들은 벌써 그 신제품을 테스트하고 있다.",
    },
  ],
  "엔터테인먼트·문화": [
    {
      phrase: "steal the spotlight",
      meaningKo: "관심을 독차지하다",
      nuance: "원래 주목받던 사람/상황을 제치고 누군가 갑자기 시선을 다 가져갈 때 써요.",
      usageSituation: "시상식, 공연, 연예 뉴스",
      exampleEn: "The newcomer stole the spotlight at the premiere.",
      exampleKo: "그 신인이 시사회에서 관심을 독차지했다.",
    },
    {
      phrase: "make headlines",
      meaningKo: "뉴스에 대서특필되다",
      nuance: "어떤 소식이 여러 매체에서 크게 다뤄질 때 쓰는 일반적인 표현이에요.",
      usageSituation: "연예·문화 뉴스 전반",
      exampleEn: "The surprise announcement made headlines overnight.",
      exampleKo: "그 깜짝 발표는 하룻밤 사이에 대서특필됐다.",
    },
    {
      phrase: "build buzz",
      meaningKo: "화제성을 만들다",
      nuance: "출시나 공개 전에 사람들의 기대와 관심을 미리 키운다는 뜻이에요.",
      usageSituation: "컴백, 개봉 전 마케팅",
      exampleEn: "The teaser trailer built a lot of buzz online.",
      exampleKo: "그 티저 예고편은 온라인에서 큰 화제성을 만들었다.",
    },
  ],
  스포츠: [
    {
      phrase: "in the running for [something]",
      meaningKo: "~를 두고 경쟁 중인",
      nuance: "어떤 자리나 타이틀을 놓고 유력한 후보로 거론될 때 써요.",
      usageSituation: "이적설, 순위 경쟁",
      exampleEn: "He's in the running for a trade before the deadline.",
      exampleKo: "그는 마감 전 트레이드 후보로 거론되고 있다.",
    },
    {
      phrase: "make the cut",
      meaningKo: "선발/합격하다",
      nuance: "경쟁에서 살아남아 최종 명단에 들었다는 뜻이에요.",
      usageSituation: "선발 명단, 로스터 뉴스",
      exampleEn: "Only a few rookies made the cut this season.",
      exampleKo: "이번 시즌엔 소수의 신인만 선발 명단에 들었다.",
    },
    {
      phrase: "a close call",
      meaningKo: "아슬아슬한 상황",
      nuance: "결과가 근소한 차이로 갈릴 뻔했을 때 쓰는 표현이에요.",
      usageSituation: "경기 결과, 판정 논란",
      exampleEn: "The final play was a close call.",
      exampleKo: "마지막 플레이는 아슬아슬했다.",
    },
  ],
  "라이프스타일·인터넷": [
    {
      phrase: "go viral",
      meaningKo: "입소문을 타고 급속히 퍼지다",
      nuance: "온라인에서 짧은 시간에 폭넓게 공유될 때 쓰는 가장 기본적인 표현이에요.",
      usageSituation: "밈, 챌린지, 바이럴 콘텐츠",
      exampleEn: "The clip went viral within a day.",
      exampleKo: "그 영상은 하루 만에 입소문을 타고 퍼졌다.",
    },
    {
      phrase: "build a following",
      meaningKo: "팬층(구독자)을 쌓다",
      nuance: "크리에이터가 시간을 두고 꾸준한 지지층을 모았다는 뜻이에요.",
      usageSituation: "크리에이터·스트리머 소개",
      exampleEn: "She built a loyal following over several years.",
      exampleKo: "그녀는 몇 년에 걸쳐 충성도 높은 팬층을 쌓았다.",
    },
    {
      phrase: "blow up",
      meaningKo: "갑자기 폭발적으로 인기를 얻다",
      nuance: "go viral과 비슷하지만 좀 더 캐주얼하고 구어적인 느낌이에요.",
      usageSituation: "SNS, 스트리밍 플랫폼",
      exampleEn: "That channel blew up after one viral stream.",
      exampleKo: "그 채널은 방송 하나가 떠서 폭발적으로 인기를 얻었다.",
    },
  ],
  기타: [
    {
      phrase: "search interest",
      meaningKo: "검색 관심도",
      nuance: "특정 검색어에 대해 사람들이 얼마나 많이 검색하고 있는지를 가리키는 데이터 용어예요.",
      usageSituation: "검색 트렌드 설명",
      exampleEn: "Search interest in the term spiked overnight.",
      exampleKo: "그 검색어에 대한 검색 관심도가 하룻밤 사이 급증했다.",
    },
    {
      phrase: "a spike in [something]",
      meaningKo: "~의 급증",
      nuance: "짧은 시간에 갑자기 수치가 크게 오르는 것을 가리켜요.",
      usageSituation: "데이터·통계 설명",
      exampleEn: "There was a spike in searches for the topic.",
      exampleKo: "그 주제에 대한 검색이 급증했다.",
    },
    {
      phrase: "out of the blue",
      meaningKo: "뜬금없이, 예상치 못하게",
      nuance: "아무 예고 없이 갑자기 어떤 일이 일어났을 때 쓰는 표현이에요.",
      usageSituation: "예상치 못한 화제 설명",
      exampleEn: "The term started trending out of the blue.",
      exampleKo: "그 검색어는 뜬금없이 트렌딩에 올랐다.",
    },
  ],
};

export function pickExpressionsV2(
  category: TrendCategoryV2,
  offset: number,
  limit = 3,
): TrendExpressionV2[] {
  const bank = EXPRESSION_BANK_V2[category];
  const rotated = [...bank.slice(offset % bank.length), ...bank.slice(0, offset % bank.length)];
  return rotated.slice(0, Math.min(limit, bank.length));
}
