import type { PreferredCategory } from "@/lib/server/local-test/google-trends-types";

// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// Hand-authored, category-level vocabulary banks — not derived from any
// specific trending term's news coverage (no article was read to write
// these). Each entry teaches language genuinely useful for talking
// about that category in English generally, which is exactly what
// "Catch the Language" asks for: self-written expressions, not content
// copied from an external source.
export type TrendExpression = {
  phrase: string;
  meaningKo: string;
  nuance: string;
  usageSituation: string;
  exampleEn: string;
  exampleKo: string;
};

const EXPRESSION_BANK: Record<PreferredCategory, TrendExpression[]> = {
  Entertainment: [
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
      phrase: "a fan favorite",
      meaningKo: "팬들이 특히 좋아하는 존재",
      nuance: "비평적 인정보다 팬덤 안에서의 인기를 강조할 때 써요.",
      usageSituation: "팬 반응, 커뮤니티 화제",
      exampleEn: "The character quickly became a fan favorite.",
      exampleKo: "그 캐릭터는 금세 팬들이 가장 좋아하는 존재가 됐다.",
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
  "Fashion & Beauty": [
    {
      phrase: "a must-have",
      meaningKo: "꼭 가져야 할 아이템",
      nuance: "유행이나 품질 때문에 많은 사람이 갖고 싶어 하는 물건을 가리켜요.",
      usageSituation: "패션·뷰티 아이템 추천",
      exampleEn: "This bag has become a must-have this season.",
      exampleKo: "이 가방은 이번 시즌 꼭 가져야 할 아이템이 됐다.",
    },
    {
      phrase: "sell out",
      meaningKo: "품절되다",
      nuance: "인기 때문에 재고가 전부 팔려나갔을 때 쓰는 표현이에요.",
      usageSituation: "한정판, 콜라보 출시",
      exampleEn: "The limited collection sold out within hours.",
      exampleKo: "그 한정판 컬렉션은 몇 시간 만에 품절됐다.",
    },
    {
      phrase: "on-trend",
      meaningKo: "요즘 유행에 맞는",
      nuance: "최신 스타일 흐름을 잘 따르고 있다는 뜻의 형용사예요.",
      usageSituation: "스타일링, 트렌드 분석",
      exampleEn: "Her outfit was effortlessly on-trend.",
      exampleKo: "그녀의 옷차림은 힘 안 들이고도 유행에 딱 맞았다.",
    },
    {
      phrase: "signature look",
      meaningKo: "시그니처 스타일",
      nuance: "그 사람이나 브랜드만의 알아볼 수 있는 고유한 스타일을 말해요.",
      usageSituation: "브랜드·셀럽 스타일 소개",
      exampleEn: "Bold red lips are part of her signature look.",
      exampleKo: "선명한 레드 립은 그녀의 시그니처 스타일 중 하나다.",
    },
  ],
  "Internet Culture": [
    {
      phrase: "go viral",
      meaningKo: "입소문을 타고 급속히 퍼지다",
      nuance: "온라인에서 짧은 시간에 폭넓게 공유될 때 쓰는 가장 기본적인 표현이에요.",
      usageSituation: "밈, 챌린지, 바이럴 콘텐츠",
      exampleEn: "The clip went viral within a day.",
      exampleKo: "그 영상은 하루 만에 입소문을 타고 퍼졌다.",
    },
    {
      phrase: "a running joke",
      meaningKo: "계속 이어지는 밈·드립",
      nuance: "한 커뮤니티 안에서 계속 반복·변형되며 쓰이는 농담을 가리켜요.",
      usageSituation: "밈 문화, 커뮤니티 유머",
      exampleEn: "It's become a running joke in the comments section.",
      exampleKo: "그건 댓글창에서 계속 이어지는 밈이 됐다.",
    },
    {
      phrase: "blow up",
      meaningKo: "갑자기 폭발적으로 인기를 얻다",
      nuance: "go viral과 비슷하지만 좀 더 캐주얼하고 구어적인 느낌이에요.",
      usageSituation: "SNS, 스트리밍 플랫폼",
      exampleEn: "That sound blew up on the app last week.",
      exampleKo: "그 사운드는 지난주 그 앱에서 폭발적으로 인기를 얻었다.",
    },
    {
      phrase: "internet is obsessed with [something]",
      meaningKo: "인터넷이 ~에 푹 빠지다",
      nuance: "온라인 전반에서 어떤 주제에 대한 관심이 과열됐을 때 쓰는 표현이에요.",
      usageSituation: "온라인 화제 요약",
      exampleEn: "The internet is obsessed with this new trend.",
      exampleKo: "인터넷이 이 새로운 트렌드에 푹 빠져 있다.",
    },
  ],
  Lifestyle: [
    {
      phrase: "score a deal",
      meaningKo: "좋은 조건으로 득템하다",
      nuance: "할인이나 특가를 잘 잡았을 때 쓰는 캐주얼한 표현이에요.",
      usageSituation: "쇼핑, 세일 시즌",
      exampleEn: "Shoppers lined up early to score a deal.",
      exampleKo: "쇼핑객들은 득템하려고 일찍부터 줄을 섰다.",
    },
    {
      phrase: "treat yourself",
      meaningKo: "자기 자신에게 선물하다",
      nuance: "스스로를 위한 작은 사치나 보상을 할 때 흔히 쓰는 표현이에요.",
      usageSituation: "웰빙, 자기관리 콘텐츠",
      exampleEn: "It's okay to treat yourself once in a while.",
      exampleKo: "가끔은 자기 자신에게 선물해도 괜찮다.",
    },
    {
      phrase: "a seasonal must-do",
      meaningKo: "그 계절엔 꼭 해야 하는 일",
      nuance: "특정 시기마다 당연하게 여겨지는 활동이나 이벤트를 가리켜요.",
      usageSituation: "연중 행사, 시즌 콘텐츠",
      exampleEn: "Holiday shopping has become a seasonal must-do.",
      exampleKo: "연말 쇼핑은 그 계절의 필수 코스가 됐다.",
    },
    {
      phrase: "get swept up in [something]",
      meaningKo: "~에 휩쓸리다",
      nuance: "주변 분위기나 유행에 자연스럽게 휩쓸려 들어가는 느낌을 담아요.",
      usageSituation: "유행·분위기 묘사",
      exampleEn: "It's easy to get swept up in the holiday rush.",
      exampleKo: "연말 분위기에 휩쓸리기 쉽다.",
    },
  ],
  Technology: [
    {
      phrase: "roll out",
      meaningKo: "(기능·제품을) 단계적으로 출시하다",
      nuance: "한 번에 전체 공개가 아니라 순차적으로 배포한다는 뉘앙스가 있어요.",
      usageSituation: "앱 업데이트, 신제품 출시",
      exampleEn: "The company began to roll out the new feature.",
      exampleKo: "그 회사는 새 기능을 단계적으로 출시하기 시작했다.",
    },
    {
      phrase: "under the hood",
      meaningKo: "내부적으로, 겉으로 안 보이는 부분에서",
      nuance: "눈에 보이는 디자인보다 내부 기술적 변화를 말할 때 써요.",
      usageSituation: "기술 리뷰, 제품 분석",
      exampleEn: "A lot changed under the hood in this update.",
      exampleKo: "이번 업데이트에서는 내부적으로 많은 게 바뀌었다.",
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
};

// Up to `limit` expressions for a category, cycling by `offset` so
// repeated trends in the same category don't always show the identical
// 3-5 (same rotation idea as generate-trend-draft.ts's variantIndex).
export function pickExpressions(
  category: PreferredCategory,
  offset: number,
  limit = 4,
): TrendExpression[] {
  const bank = EXPRESSION_BANK[category];
  const rotated = [...bank.slice(offset % bank.length), ...bank.slice(0, offset % bank.length)];
  return rotated.slice(0, Math.min(limit, bank.length));
}
