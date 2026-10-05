import "server-only";

export type ContentCandidate = {
  sourceId: string;
  originalTitle: string;
  originalUrl: string;
  publishedAt: string;
  category: "글로벌 이슈" | "디지털 권리" | "과학·우주";
  // 사람이 직접 읽고 짧게 적은 사실 메모. 원문 문장을 그대로 옮기지 않는다.
  factMemo: string;
};

// 외부 뉴스 API 연결 없이, 서버 코드에 내장한 시드 데이터로만 후보를 관리한다.
// 하루 처리량은 3건 이하로 가정한다.
const DAILY_CONTENT_CANDIDATES: ContentCandidate[] = [
  {
    sourceId: "global-voices",
    originalTitle:
      "Too young to run, old enough to protest: West Africa's unfinished democratic bargain",
    originalUrl:
      "https://globalvoices.org/2026/10/05/too-young-to-run-old-enough-to-protest-west-africas-unfinished-democratic-bargain/",
    publishedAt: "2026-10-05",
    category: "글로벌 이슈",
    factMemo:
      "서아프리카 여러 나라에서 청년들은 대통령 선거 출마 최소 연령 제한 때문에 입후보할 수 없지만, 거리 시위에는 활발히 참여하고 있다.",
  },
  {
    sourceId: "global-voices",
    originalTitle:
      "How a farmers' protest in Bucharest was inflated online, then hijacked",
    originalUrl:
      "https://globalvoices.org/2026/10/03/how-a-farmers-protest-in-bucharest-was-inflated-online-then-hijacked/",
    publishedAt: "2026-10-03",
    category: "디지털 권리",
    factMemo:
      "부쿠레슈티에서 열린 농민 시위 규모가 온라인에서 실제보다 부풀려져 퍼졌고, 이후 다른 정치적 목적을 가진 계정들이 그 메시지를 재해석해 퍼뜨렸다.",
  },
  {
    sourceId: "nasa",
    originalTitle: "Artemis Program",
    originalUrl: "https://www.nasa.gov/artemisprogram/",
    publishedAt: "2026-09-01",
    category: "과학·우주",
    factMemo:
      "NASA의 아르테미스 계획은 유인 달 탐사 재개를 목표로 단계별 임무를 진행 중이며, 향후 달 표면 유인 착륙을 준비하고 있다.",
  },
];

export function getDailyContentCandidates(): ContentCandidate[] {
  return DAILY_CONTENT_CANDIDATES;
}
