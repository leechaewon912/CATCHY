// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// A small, hand-written dictionary of GENERIC, evergreen background
// facts for well-established concepts — never specific/"latest" claims
// about a particular person, event, or product (that would require
// external verification this pipeline deliberately doesn't do). Matched
// by keyword against the trending term; a term with no match gets no
// "Get to Know" section at all (omitted, not guessed) — see
// build-google-trends-content.ts.
export const GET_TO_KNOW_GLOSSARY: Array<{ keyword: string; en: string; ko: string }> = [
  {
    keyword: "black friday",
    en: "Black Friday is the day after the U.S. Thanksgiving holiday (the fourth Thursday of November) and has long marked the unofficial start of the holiday shopping season, known for widespread retail discounts.",
    ko: "블랙 프라이데이는 미국 추수감사절(11월 넷째 주 목요일) 다음 날로, 오랫동안 연말 쇼핑 시즌의 비공식적인 시작으로 여겨져 왔으며 대대적인 할인 행사로 잘 알려져 있습니다.",
  },
  {
    keyword: "powerball",
    en: "Powerball is a multi-state lottery game played across most of the United States, known for its large jackpots.",
    ko: "파워볼은 미국 대부분의 주에서 함께 운영하는 복권 게임으로, 큰 규모의 당첨금으로 잘 알려져 있습니다.",
  },
  {
    keyword: "cyber monday",
    en: "Cyber Monday is the Monday after Thanksgiving, traditionally promoted as a major day for online-only shopping deals in the U.S.",
    ko: "사이버 먼데이는 추수감사절 다음 월요일로, 미국에서 전통적으로 온라인 전용 할인 행사가 집중되는 날로 알려져 있습니다.",
  },
];

export function findGetToKnow(term: string): { en: string; ko: string } | null {
  const lower = term.toLowerCase();
  const match = GET_TO_KNOW_GLOSSARY.find((entry) => lower.includes(entry.keyword));
  return match ? { en: match.en, ko: match.ko } : null;
}
