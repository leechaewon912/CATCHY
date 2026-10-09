import "server-only";

import type { Category, ExpressionSeed } from "@/lib/mock-data";

export type GenerateTrendDraftInput = {
  category: Category;
  clusterKey: string;
  // Index of this cluster among the category's published candidates for
  // the run (0, 1, 2 — capped at 3 per category upstream). Only used to
  // pick a stub template variant so repeated clusters in one run don't
  // look identical; never derived from article text.
  variantIndex: number;
  sourceCount: number;
  domainCount: number;
};

export type GenerateTrendDraftOutput = {
  title: string;
  summary: string;
  englishSummary: string;
  koreanSummary: string;
  whyTrending: string;
  expressions: ExpressionSeed[];
};

type Variant = Omit<GenerateTrendDraftOutput, "koreanSummary" | "whyTrending"> & {
  koreanSummary: string;
  whyTrending: string;
};

// Rule-based stub generator — no OpenAI key configured yet. This never
// reads GDELT article titles/snippets into the output: everything below
// is CATCHY's own pre-written copy, cycled by category + variantIndex.
// That keeps the legal posture intentionally conservative (content can't
// accidentally echo a source's sentence) while the clustering/publish
// gate upstream still requires real multi-source, multi-domain evidence
// before a cluster ever reaches this function.
//
// Swap point for real AI: keep this file's exported `generateTrendDraft`
// signature (same input/output shape) and replace the body with an
// OpenAI call once OPENAI_API_KEY exists. Callers (collect-trends.ts)
// don't need to change.
const VARIANT_BANK: Record<Category, Variant[]> = {
  "음악": [
    {
      title: "오늘 음악 신에서 가장 많이 언급된 이슈",
      summary: "여러 음악 매체와 플랫폼에서 동시에 다뤄진 오늘의 음악 이슈를 정리했어요.",
      englishSummary:
        "A music story is making the rounds across several outlets today, and it didn't take long to pick up steam once multiple platforms started covering it. Fans and critics alike are already starting to weigh in on what it means for the artist's trajectory.",
      koreanSummary:
        "오늘 여러 음악 매체와 플랫폼에서 공통으로 다룬 이슈예요. 서로 다른 출처에서 같은 소식이 반복적으로 언급되며 화제성이 커지고 있어요.",
      whyTrending: "여러 출처에서 동시에 다뤄졌다는 점이 이 이슈가 단순 추측이 아니라는 신호로 읽히고 있어요.",
      expressions: [
        {
          phrase: "pick up steam",
          meaningKo: "점점 더 힘을 얻다, 추진력이 붙다",
          nuance: "처음엔 작았던 반응이 시간이 지나며 점점 커질 때 쓰는 표현이에요.",
          usageSituation: "음악 뉴스, 트렌드 분석",
          exampleEn: "The story picked up steam once several outlets ran it.",
          exampleKo: "그 소식은 여러 매체가 다루면서 점점 더 힘을 얻었다.",
          comparison: {
            phrase: "speed up",
            nuanceDiff: "speed up은 그냥 속도가 빨라진다는 뜻이고, pick up steam은 반응이나 관심이 점점 커지면서 탄력을 받는다는 느낌이에요.",
          },
        },
        {
          phrase: "weigh in on [something]",
          meaningKo: "~에 대해 의견을 내다",
          nuance: "전문가나 팬이 특정 이슈에 대한 생각을 밝힐 때 쓰는 표현이에요.",
          usageSituation: "리뷰, 팬 반응 기사",
          exampleEn: "Critics were quick to weigh in on the new release.",
          exampleKo: "평론가들은 새 발매에 대해 재빨리 의견을 냈다.",
          comparison: {
            phrase: "comment on [something]",
            nuanceDiff: "comment on은 그냥 어떤 주제에 대해 말한다는 중립적인 표현이고, weigh in on은 관련자가 자신의 입장을 분명히 밝힌다는 느낌이 강해요.",
          },
        },
        {
          phrase: "[someone]'s trajectory",
          meaningKo: "~의 (성장·활동) 궤적",
          nuance: "한 아티스트나 그룹의 활동 흐름 전체를 이야기할 때 쓰는 표현이에요.",
          usageSituation: "아티스트 분석 기사",
          exampleEn: "This moment could shift the artist's trajectory going forward.",
          exampleKo: "이번 일은 앞으로 그 아티스트의 활동 궤적을 바꿀 수도 있다.",
          comparison: {
            phrase: "[someone]'s career",
            nuanceDiff: "career는 그 사람의 활동 전체를 가리키고, trajectory는 그 활동이 앞으로 어떤 방향으로 나아가는지 흐름에 초점을 맞춰요.",
          },
        },
      ],
    },
    {
      title: "차트와 공식 채널이 동시에 반응한 음악 소식",
      summary: "공식 채널과 차트 플랫폼에서 동시에 확인된 오늘의 음악 트렌드예요.",
      englishSummary:
        "Once the news reached official channels and chart platforms at roughly the same time, it was hard to write off as a rumor. Commentary from outside the fandom started to roll in soon after, a sign the story had broken out of its original bubble.",
      koreanSummary:
        "공식 채널 공개 내용과 차트 플랫폼 데이터가 거의 동시에 같은 방향을 가리키면서 신빙성이 높아진 소식이에요.",
      whyTrending: "공식 발표와 플랫폼 데이터가 같은 시점에 겹쳤다는 점이 화제성을 키운 요인이에요.",
      expressions: [
        {
          phrase: "write off [something]",
          meaningKo: "~을 무시하다, 별것 아니라고 치부하다",
          nuance: "어떤 소식을 중요하지 않다고 가볍게 넘길 때 쓰는 표현이에요.",
          usageSituation: "루머/소식 평가",
          exampleEn: "It's getting harder to write off the news as just a rumor.",
          exampleKo: "그 소식을 단순 루머로 치부하기가 점점 어려워지고 있다.",
          comparison: {
            phrase: "ignore [something]",
            nuanceDiff: "ignore는 그냥 무시한다는 뜻이고, write off는 그것을 가치 없다고 판단해서 더 이상 고려하지 않는다는 느낌이 강해요.",
          },
        },
        {
          phrase: "roll in",
          meaningKo: "계속해서 들어오다, 쏟아지다",
          nuance: "반응이나 소식이 끊임없이 이어질 때 쓰는 표현이에요.",
          usageSituation: "반응/댓글 설명",
          exampleEn: "Reactions kept rolling in from outside the usual fanbase.",
          exampleKo: "기존 팬덤 밖에서도 반응이 계속 쏟아져 들어왔다.",
          comparison: {
            phrase: "arrive",
            nuanceDiff: "arrive는 그냥 도착한다는 중립적인 말이고, roll in은 끊임없이 계속 들어오는 흐름을 강조해요.",
          },
        },
        {
          phrase: "break out of [something]",
          meaningKo: "~을 벗어나다, 영역을 넘어서다",
          nuance: "원래 머물러 있던 좁은 범위를 넘어 더 넓게 퍼질 때 쓰는 표현이에요.",
          usageSituation: "문화 확산 분석",
          exampleEn: "The track broke out of its niche fanbase this week.",
          exampleKo: "그 곡은 이번 주 좁은 팬덤을 벗어나 더 넓게 퍼졌다.",
          comparison: {
            phrase: "leave [something]",
            nuanceDiff: "leave는 그냥 떠난다는 뜻이고, break out of는 원래 갇혀 있던 좁은 범위를 힘겹게 벗어난다는 느낌이 있어요.",
          },
        },
      ],
    },
    {
      title: "발표 직후 반응이 갈린 음악 이슈",
      summary: "발표 직후부터 반응이 둘로 나뉜 오늘의 음악 트렌드를 짚어봤어요.",
      englishSummary:
        "The moment this went public, reactions split almost immediately, with one side ready to defend the choice and the other calling it a step too far. Either way, the sheer volume of coverage suggests this isn't going away anytime soon.",
      koreanSummary:
        "공개 직후부터 찬반 반응이 뚜렷하게 나뉜 음악 이슈예요. 여러 출처가 함께 다루고 있어 당분간 화제가 이어질 것으로 보여요.",
      whyTrending: "찬반이 선명하게 갈리는 주제일수록 논의가 오래 이어지는 경향이 있어 주목받고 있어요.",
      expressions: [
        {
          phrase: "a step too far",
          meaningKo: "지나친 선택, 선을 넘은 결정",
          nuance: "어떤 결정이 받아들일 수 있는 범위를 넘었다고 느낄 때 쓰는 표현이에요.",
          usageSituation: "비판적 반응, 논쟁 기사",
          exampleEn: "Some fans called the move a step too far.",
          exampleKo: "일부 팬들은 그 결정을 지나친 선택이라고 불렀다.",
          comparison: {
            phrase: "a mistake",
            nuanceDiff: "mistake는 단순한 실수를 가리키고, a step too far는 괜찮은 선을 넘어선 과한 행동이라는 뜻이에요.",
          },
        },
        {
          phrase: "defend [something]",
          meaningKo: "~을 옹호하다, 변호하다",
          nuance: "비판받는 대상이나 결정을 지지하는 입장을 밝힐 때 쓰는 표현이에요.",
          usageSituation: "팬 반응, 옹호 댓글",
          exampleEn: "Loyal fans were quick to defend the decision.",
          exampleKo: "충성도 높은 팬들은 그 결정을 재빨리 옹호했다.",
          comparison: {
            phrase: "support [something]",
            nuanceDiff: "support는 그냥 지지한다는 뜻이고, defend는 비판받고 있는 대상을 적극적으로 변호한다는 느낌이 강해요.",
          },
        },
        {
          phrase: "go away anytime soon",
          meaningKo: "쉽게 가라앉지 않다",
          nuance: "화제나 논란이 금방 사라지지 않을 것 같을 때 쓰는 표현이에요.",
          usageSituation: "트렌드 전망",
          exampleEn: "This debate doesn't look like it's going away anytime soon.",
          exampleKo: "이 논쟁은 당분간 쉽게 가라앉지 않을 것 같다.",
          comparison: {
            phrase: "end",
            nuanceDiff: "end는 그냥 끝난다는 뜻이고, go away anytime soon은 (주로 부정문으로) 당분간 끝날 기미가 보이지 않는다는 뜻으로 더 많이 써요.",
          },
        },
      ],
    },
  ],
  "영화·시리즈": [
    {
      title: "스트리밍 순위와 매체 보도가 겹친 오늘의 화제작",
      summary: "공식 순위 페이지와 여러 매체가 동시에 주목한 오늘의 영화·시리즈 이슈예요.",
      englishSummary:
        "A title has started to dominate the conversation after climbing an official ranking page, with coverage from multiple outlets following close behind. It's the kind of overlap that tends to mean a show has officially crossed over into the mainstream.",
      koreanSummary:
        "공식 순위 페이지에서의 성적과 여러 매체의 보도가 겹치면서 화제성이 커진 작품이에요. 서로 다른 출처가 같은 방향을 가리키고 있어요.",
      whyTrending: "공식 순위와 보도가 동시에 같은 작품을 가리키는 경우는 흔치 않아 더 주목받고 있어요.",
      expressions: [
        {
          phrase: "dominate the conversation",
          meaningKo: "화제를 장악하다",
          nuance: "한동안 가장 많이 언급되는 주제가 되었을 때 쓰는 표현이에요.",
          usageSituation: "엔터테인먼트 분석",
          exampleEn: "The series has dominated the conversation all week.",
          exampleKo: "그 시리즈는 한 주 내내 화제를 장악했다.",
          comparison: {
            phrase: "be popular",
            nuanceDiff: "be popular는 그냥 인기 있다는 뜻이고, dominate the conversation은 한동안 가장 많이 언급되는 화제가 됐다는 뜻이에요.",
          },
        },
        {
          phrase: "follow close behind",
          meaningKo: "바로 뒤따르다, 근접해서 따라오다",
          nuance: "한 가지 일이 일어난 직후 다른 일이 거의 동시에 이어질 때 쓰는 표현이에요.",
          usageSituation: "타이밍 설명",
          exampleEn: "Media coverage followed close behind the chart news.",
          exampleKo: "매체 보도가 차트 소식 바로 뒤를 이어 나왔다.",
          comparison: {
            phrase: "come next",
            nuanceDiff: "come next는 그냥 다음 차례라는 뜻이고, follow close behind는 앞선 일이 일어난 직후 거의 동시에 이어진다는 느낌이 강해요.",
          },
        },
        {
          phrase: "cross over into the mainstream",
          meaningKo: "대중적으로 자리잡다",
          nuance: "특정 팬층을 넘어 더 넓은 대중에게 받아들여질 때 쓰는 표현이에요.",
          usageSituation: "산업 분석 기사",
          exampleEn: "The show has officially crossed over into the mainstream.",
          exampleKo: "그 작품은 공식적으로 대중적인 인기를 얻게 됐다.",
          comparison: {
            phrase: "become popular",
            nuanceDiff: "become popular는 그냥 인기가 많아졌다는 뜻이고, cross over into the mainstream은 특정 팬층을 넘어 대중 전체에게 받아들여졌다는 뜻이에요.",
          },
        },
      ],
    },
    {
      title: "공식 발표 하나로 화제가 된 시리즈 소식",
      summary: "공식 보도자료 하나로 여러 매체의 후속 보도가 이어진 오늘의 이슈예요.",
      englishSummary:
        "One official announcement was enough to set off a wave of follow-up coverage. Within hours, several outlets had already circled back with their own takes, which only added fuel to the fire.",
      koreanSummary:
        "공식 보도자료가 공개된 직후 여러 매체가 후속 보도를 내놓은 이슈예요. 짧은 시간 안에 반응이 집중됐어요.",
      whyTrending: "하나의 공식 발표가 짧은 시간에 여러 매체의 반응을 동시에 이끌어낸 점이 눈에 띄어요.",
      expressions: [
        {
          phrase: "set off a wave of [something]",
          meaningKo: "~의 물결을 촉발하다",
          nuance: "한 가지 사건이 연쇄적인 반응을 불러일으킬 때 쓰는 표현이에요.",
          usageSituation: "산업 뉴스",
          exampleEn: "The announcement set off a wave of think pieces.",
          exampleKo: "그 발표는 수많은 분석 글이 쏟아지는 물결을 촉발했다.",
          comparison: {
            phrase: "cause [something]",
            nuanceDiff: "cause는 그냥 어떤 결과를 일으킨다는 중립적인 말이고, set off a wave of는 연쇄적으로 이어지는 반응 전체를 촉발한다는 느낌이 있어요.",
          },
        },
        {
          phrase: "circle back",
          meaningKo: "다시 다루다, 되짚어보다",
          nuance: "이전 주제를 다시 한번 짚고 넘어갈 때 쓰는 표현이에요.",
          usageSituation: "후속 보도",
          exampleEn: "A few outlets circled back with deeper analysis.",
          exampleKo: "몇몇 매체는 더 깊은 분석과 함께 다시 그 주제를 다뤘다.",
          comparison: {
            phrase: "revisit [something]",
            nuanceDiff: "revisit은 그냥 다시 다룬다는 중립적인 말이고, circle back은 원래 하려던 걸 잠시 미뤄뒀다가 다시 돌아온다는 흐름을 강조해요.",
          },
        },
        {
          phrase: "add fuel to the fire",
          meaningKo: "불을 더 키우다, 상황을 더 과열시키다",
          nuance: "이미 뜨거운 화제를 더 자극하는 일이 생겼을 때 쓰는 표현이에요.",
          usageSituation: "논쟁 확산 설명",
          exampleEn: "The follow-up reports only added fuel to the fire.",
          exampleKo: "그 후속 보도는 화제를 더 키웠을 뿐이었다.",
          comparison: {
            phrase: "make it worse",
            nuanceDiff: "make it worse는 그냥 상황이 나빠졌다는 뜻이고, add fuel to the fire는 이미 과열된 상황을 더 자극한다는 뉘앙스가 있어요.",
          },
        },
      ],
    },
    {
      title: "장르를 넘나든 오늘의 화제작 소식",
      summary: "기존 팬층 밖에서도 반응이 터진 오늘의 영화·시리즈 이슈예요.",
      englishSummary:
        "What usually stays within a niche fanbase has somehow spilled over into mainstream chatter this time. Several outlets picked up on the shift almost simultaneously, which is rarely a coincidence.",
      koreanSummary:
        "원래는 특정 팬층 안에서만 화제였던 소식이 더 넓은 대중 반응으로 번진 이슈예요. 여러 출처가 거의 같은 시점에 이를 포착했어요.",
      whyTrending: "좁은 팬덤을 넘어선 확산 속도가 이례적이라는 점이 주목받고 있어요.",
      expressions: [
        {
          phrase: "spill over into [something]",
          meaningKo: "~로 번지다, 넘쳐 퍼지다",
          nuance: "한 영역에 머물던 반응이 다른 영역까지 퍼질 때 쓰는 표현이에요.",
          usageSituation: "문화 확산 기사",
          exampleEn: "The buzz spilled over into mainstream entertainment news.",
          exampleKo: "그 화제는 대중 엔터테인먼트 뉴스까지 번졌다.",
          comparison: {
            phrase: "affect [something]",
            nuanceDiff: "affect는 그냥 영향을 준다는 뜻이고, spill over into는 원래 영역을 넘어 다른 영역까지 번져나간다는 흐름을 강조해요.",
          },
        },
        {
          phrase: "mainstream chatter",
          meaningKo: "대중적인 화제, 폭넓은 반응",
          nuance: "특정 커뮤니티를 넘어 널리 퍼진 대화나 반응을 말할 때 쓰는 표현이에요.",
          usageSituation: "트렌드 분석",
          exampleEn: "It's rare for a niche title to generate this much mainstream chatter.",
          exampleKo: "마이너한 작품이 이 정도의 대중적인 화제를 만드는 건 드문 일이다.",
          comparison: {
            phrase: "popularity",
            nuanceDiff: "popularity는 그냥 인기 자체를 가리키고, mainstream chatter는 특정 집단을 넘어 널리 퍼진 대화나 반응의 양을 강조해요.",
          },
        },
        {
          phrase: "rarely a coincidence",
          meaningKo: "우연으로 보기 어렵다",
          nuance: "비슷한 반응이 동시에 여러 곳에서 나타날 때, 단순 우연이 아니라고 말할 때 쓰는 표현이에요.",
          usageSituation: "분석/해설 기사",
          exampleEn: "Multiple outlets noticing it at once is rarely a coincidence.",
          exampleKo: "여러 매체가 동시에 포착했다는 건 우연으로 보기 어렵다.",
          comparison: {
            phrase: "not random",
            nuanceDiff: "not random은 그냥 우연이 아니라는 중립적인 말이고, rarely a coincidence는 반복되는 패턴을 보고 의도나 연관성을 의심하게 만드는 뉘앙스가 있어요.",
          },
        },
      ],
    },
  ],
  "밈·인터넷": [
    {
      title: "플랫폼 트렌드 탭까지 올라온 오늘의 밈",
      summary: "여러 플랫폼의 트렌드 탭에 동시에 등장한 오늘의 인터넷 밈이에요.",
      englishSummary:
        "A joke that started in one small corner of the internet has somehow made its way onto multiple platforms' trending tabs at once. Once something spreads like wildfire across more than one app, it usually means a new audience has picked it up.",
      koreanSummary:
        "작은 커뮤니티에서 시작된 농담이 여러 플랫폼의 트렌드 탭에 동시에 오른 밈이에요. 여러 출처에서 같은 흐름이 확인돼요.",
      whyTrending: "하나의 플랫폼이 아니라 여러 플랫폼에서 동시에 퍼진 점이 이례적이라 주목받고 있어요.",
      expressions: [
        {
          phrase: "make its way onto [somewhere]",
          meaningKo: "~에까지 도달하다, 퍼지다",
          nuance: "어떤 것이 점차 이동해 특정 장소나 상태에 도달했을 때 쓰는 표현이에요.",
          usageSituation: "트렌드 확산 설명",
          exampleEn: "The joke made its way onto several trending tabs overnight.",
          exampleKo: "그 농담은 하룻밤 사이 여러 트렌드 탭에까지 퍼졌다.",
          comparison: {
            phrase: "appear on [somewhere]",
            nuanceDiff: "appear on은 그냥 나타났다는 뜻이고, make its way onto는 시간이 걸리더라도 점차 퍼지면서 도달했다는 과정을 강조해요.",
          },
        },
        {
          phrase: "spread like wildfire",
          meaningKo: "불길처럼 빠르게 퍼지다",
          nuance: "아주 빠른 속도로 널리 퍼질 때 쓰는 표현이에요.",
          usageSituation: "온라인 트렌드 기사",
          exampleEn: "The clip spread like wildfire across multiple apps.",
          exampleKo: "그 영상은 여러 앱에서 불길처럼 빠르게 퍼졌다.",
          comparison: {
            phrase: "spread quickly",
            nuanceDiff: "spread quickly는 그냥 빨리 퍼진다는 뜻이고, spread like wildfire는 통제할 수 없을 정도로 아주 빠르고 강렬하게 퍼진다는 느낌을 더해요.",
          },
        },
        {
          phrase: "pick [something] up",
          meaningKo: "~에 관심을 갖고 퍼뜨리다",
          nuance: "새로운 집단이 어떤 트렌드를 발견하고 자기들 방식으로 퍼뜨릴 때 쓰는 표현이에요.",
          usageSituation: "밈 확산 분석",
          exampleEn: "A whole new audience picked the trend up this week.",
          exampleKo: "이번 주에는 완전히 새로운 사람들이 그 트렌드에 관심을 가지고 퍼뜨렸다.",
          comparison: {
            phrase: "notice [something]",
            nuanceDiff: "notice는 그냥 알아챈다는 뜻이고, pick up은 그것을 발견해서 자기 방식대로 받아들이고 퍼뜨린다는 느낌이 있어요.",
          },
        },
      ],
    },
    {
      title: "커뮤니티를 넘어 화제가 된 오늘의 인터넷 표현",
      summary: "한 커뮤니티에서 시작해 여러 플랫폼에서 동시에 언급된 표현을 짚어봤어요.",
      englishSummary:
        "What started as an inside joke in one community has since been picked apart and reused by people who have no idea where it came from. That's usually the moment a phrase stops being niche slang and becomes something closer to shared internet vocabulary.",
      koreanSummary:
        "한 커뮤니티의 농담으로 시작된 표현이 기원을 모르는 사람들 사이에서도 쓰이기 시작한 사례예요. 여러 플랫폼에서 공통으로 확인돼요.",
      whyTrending: "원래 맥락을 모르는 사람들까지 따라 쓰기 시작했다는 점이 확산의 신호로 읽혀요.",
      expressions: [
        {
          phrase: "an inside joke",
          meaningKo: "내부에서만 통하는 농담",
          nuance: "특정 집단만 이해할 수 있는 농담을 설명할 때 쓰는 표현이에요.",
          usageSituation: "커뮤니티 문화 설명",
          exampleEn: "It started as an inside joke among a small group.",
          exampleKo: "그건 원래 소수 집단 사이의 내부 농담이었다.",
          comparison: {
            phrase: "a joke",
            nuanceDiff: "joke는 그냥 일반적인 농담이고, an inside joke는 특정 집단만 이해할 수 있는 농담이라는 뜻이에요.",
          },
        },
        {
          phrase: "pick [something] apart",
          meaningKo: "~을 분석하다, 하나하나 뜯어보다",
          nuance: "어떤 것을 세세하게 분석하거나 따져볼 때 쓰는 표현이에요.",
          usageSituation: "밈 해설 기사",
          exampleEn: "People online have been picking the phrase apart for days.",
          exampleKo: "온라인에서는 며칠째 그 표현을 분석하고 있다.",
          comparison: {
            phrase: "criticize [something]",
            nuanceDiff: "criticize는 그냥 비판한다는 뜻이고, pick apart는 세세한 부분까지 하나하나 따지며 분석한다는 느낌이 강해요.",
          },
        },
        {
          phrase: "shared [something] vocabulary",
          meaningKo: "공유된 언어, 공통 용어",
          nuance: "특정 집단을 넘어 많은 사람이 공통으로 쓰는 표현을 설명할 때 쓰는 표현이에요.",
          usageSituation: "언어 트렌드 분석",
          exampleEn: "The term has become part of shared internet vocabulary.",
          exampleKo: "그 단어는 이제 공유된 인터넷 언어의 일부가 됐다.",
          comparison: {
            phrase: "common words",
            nuanceDiff: "common words는 그냥 흔히 쓰는 단어라는 뜻이고, shared vocabulary는 특정 집단이 함께 만들어가고 이해하는 공통 언어라는 뉘앙스가 있어요.",
          },
        },
      ],
    },
    {
      title: "밈에서 출발해 매체 보도까지 이어진 오늘의 사례",
      summary: "온라인 농담이 매체 보도로까지 이어진 오늘의 인터넷 트렌드예요.",
      englishSummary:
        "This one didn't stay confined to social feeds for long — once it caught on, outside coverage followed almost immediately. It's a reminder that internet culture and traditional reporting aren't as separate as they used to be.",
      koreanSummary:
        "소셜 피드 안에서만 머물 것 같았던 농담이 매체 보도로까지 이어진 사례예요. 서로 다른 출처가 동시에 이를 다뤘어요.",
      whyTrending: "온라인 밈이 전통 매체 보도로 이어지는 속도가 빠르다는 점이 화제가 되고 있어요.",
      expressions: [
        {
          phrase: "stay confined to [somewhere]",
          meaningKo: "~안에만 머물다, 한정되다",
          nuance: "어떤 것이 특정 범위를 벗어나지 않고 그 안에서만 유지될 때 쓰는 표현이에요.",
          usageSituation: "확산 범위 설명",
          exampleEn: "The joke didn't stay confined to social feeds for long.",
          exampleKo: "그 농담은 소셜 피드 안에만 오래 머물지 않았다.",
          comparison: {
            phrase: "stay in [somewhere]",
            nuanceDiff: "stay in은 그냥 그곳에 머문다는 중립적인 말이고, stay confined to는 더 넓게 퍼질 수 있었는데도 제한된 범위 안에만 머물렀다는 뉘앙스가 있어요.",
          },
        },
        {
          phrase: "catch on",
          meaningKo: "인기를 얻다, 유행하기 시작하다",
          nuance: "무언가가 사람들 사이에서 받아들여지고 퍼지기 시작할 때 쓰는 표현이에요.",
          usageSituation: "유행 설명",
          exampleEn: "Once it caught on, coverage followed almost immediately.",
          exampleKo: "유행하기 시작하자 보도가 거의 바로 이어졌다.",
          comparison: {
            phrase: "become popular",
            nuanceDiff: "become popular는 그냥 인기가 많아졌다는 뜻이고, catch on은 사람들 사이에서 자연스럽게 퍼지며 받아들여지기 시작했다는 과정에 초점을 맞춰요.",
          },
        },
        {
          phrase: "as separate as they used to be",
          meaningKo: "예전처럼 분리되어 있지 않은",
          nuance: "두 영역이 과거에는 뚜렷이 구분됐지만 지금은 경계가 흐려졌다고 말할 때 쓰는 표현이에요.",
          usageSituation: "미디어 환경 분석",
          exampleEn: "Online culture and news reporting aren't as separate as they used to be.",
          exampleKo: "온라인 문화와 뉴스 보도는 예전처럼 분리되어 있지 않다.",
          comparison: {
            phrase: "different",
            nuanceDiff: "different는 그냥 다르다는 중립적인 말이고, as separate as they used to be는 예전에는 뚜렷이 구분됐지만 지금은 경계가 흐려졌다는 변화를 강조해요.",
          },
        },
      ],
    },
  ],
  "라이프스타일": [
    {
      title: "공식 행사 직후 반응이 더 커진 오늘의 라이프스타일 소식",
      summary: "공식 행사 페이지와 매체 보도가 함께 다룬 오늘의 라이프스타일 이슈예요.",
      englishSummary:
        "The moment official event coverage went live, reaction pieces from other outlets weren't far behind. It's often the small, unplanned moments — not the main program — that end up stealing the spotlight.",
      koreanSummary:
        "공식 행사 페이지 공개 이후 여러 매체의 반응 기사가 뒤따른 라이프스타일 이슈예요. 예정된 프로그램보다 예상 밖의 순간이 더 화제가 됐어요.",
      whyTrending: "공식 프로그램보다 예상치 못한 순간이 더 큰 반응을 얻었다는 점이 흥미로운 포인트예요.",
      expressions: [
        {
          phrase: "go live",
          meaningKo: "공개되다, 생중계되다",
          nuance: "콘텐츠나 발표가 실시간으로 공개될 때 쓰는 표현이에요.",
          usageSituation: "행사/방송 보도",
          exampleEn: "Reaction pieces followed the moment coverage went live.",
          exampleKo: "보도가 공개되는 순간 바로 반응 기사들이 뒤따랐다.",
          comparison: {
            phrase: "be released",
            nuanceDiff: "be released는 그냥 공개됐다는 중립적인 말이고, go live는 실시간으로, 바로 그 순간부터 작동하기 시작했다는 느낌을 더해요.",
          },
        },
        {
          phrase: "not far behind",
          meaningKo: "뒤이어 바로, 근접해서",
          nuance: "한 가지 일이 일어난 후 다른 일이 거의 즉시 뒤따를 때 쓰는 표현이에요.",
          usageSituation: "타이밍 설명",
          exampleEn: "Other outlets' takes were not far behind.",
          exampleKo: "다른 매체들의 반응도 바로 뒤이어 나왔다.",
          comparison: {
            phrase: "come next",
            nuanceDiff: "come next는 그냥 다음 차례라는 뜻이고, not far behind는 앞선 일과 거의 동시에, 아주 가까운 시차로 뒤따른다는 느낌이 있어요.",
          },
        },
        {
          phrase: "steal the spotlight",
          meaningKo: "스포트라이트를 가로채다",
          nuance: "원래 주인공이 아니었는데 가장 큰 관심을 받게 됐을 때 쓰는 표현이에요.",
          usageSituation: "행사 리뷰",
          exampleEn: "An unplanned moment ended up stealing the spotlight.",
          exampleKo: "예상치 못한 순간이 결국 스포트라이트를 가로챘다.",
          comparison: {
            phrase: "stand out",
            nuanceDiff: "stand out은 단순히 눈에 띈다는 뜻이고, steal the spotlight는 원래 주인공이 받아야 할 관심까지 가져온다는 뉘앙스가 있어요.",
          },
        },
      ],
    },
    {
      title: "온라인 반응이 쪼개진 오늘의 라이프스타일 화제",
      summary: "같은 소식을 두고 반응이 둘로 나뉜 오늘의 라이프스타일 이슈를 짚어봤어요.",
      englishSummary:
        "The same piece of news somehow turned heads and split opinion at the same time. Some are calling it a bold move worth celebrating, while others think it missed the mark entirely.",
      koreanSummary:
        "같은 소식에 대해 호불호가 뚜렷하게 나뉜 라이프스타일 이슈예요. 여러 출처가 이 반응의 확산을 함께 다루고 있어요.",
      whyTrending: "같은 사안에 대해 정반대 반응이 동시에 터졌다는 점이 화제성을 키우고 있어요.",
      expressions: [
        {
          phrase: "turn heads",
          meaningKo: "시선을 끌다",
          nuance: "눈에 띄게 주목을 받을 때 쓰는 표현이에요.",
          usageSituation: "패션/스타일 기사",
          exampleEn: "The look turned heads the moment it was revealed.",
          exampleKo: "그 룩은 공개되는 순간 시선을 끌었다.",
          comparison: {
            phrase: "attract attention",
            nuanceDiff: "attract attention은 중립적으로 관심을 끈다는 뜻이고, turn heads는 놀라움이나 감탄 때문에 사람들이 반응적으로 쳐다본다는 느낌이 더 강해요.",
          },
        },
        {
          phrase: "split opinion",
          meaningKo: "의견이 갈리다",
          nuance: "찬반이 뚜렷하게 나뉠 때 쓰는 표현이에요.",
          usageSituation: "리뷰, 반응 기사",
          exampleEn: "The choice has split opinion online.",
          exampleKo: "그 선택은 온라인에서 의견이 갈리게 했다.",
          comparison: {
            phrase: "spark debate",
            nuanceDiff: "spark debate는 사람들이 그 주제로 활발히 논쟁하게 만든다는 뜻이고, split opinion은 찬성과 반대로 의견이 뚜렷이 둘로 나뉘는 결과에 초점을 맞춰요.",
          },
        },
        {
          phrase: "miss the mark",
          meaningKo: "기대에 미치지 못하다, 핵심을 놓치다",
          nuance: "의도한 효과를 내지 못했다고 평가할 때 쓰는 표현이에요.",
          usageSituation: "비판적 평가",
          exampleEn: "Critics felt the styling missed the mark this time.",
          exampleKo: "평론가들은 이번 스타일링이 기대에 미치지 못했다고 느꼈다.",
          comparison: {
            phrase: "fail",
            nuanceDiff: "fail은 그냥 실패했다는 뜻이고, miss the mark는 의도했던 효과나 목표에 살짝 못 미쳤다는 뉘앙스가 있어요.",
          },
        },
      ],
    },
    {
      title: "팔로우가 몰린 오늘의 라이프스타일 트렌드",
      summary: "여러 공식·플랫폼 채널에서 동시에 다뤄진 오늘의 라이프스타일 트렌드예요.",
      englishSummary:
        "Interest in this one seems to be snowballing by the hour, with more outlets jumping on the story every time it gets mentioned again. For now, it looks like it has plenty of room left to run.",
      koreanSummary:
        "시간이 지날수록 관심이 눈덩이처럼 커지고 있는 라이프스타일 트렌드예요. 여러 출처가 반복적으로 이 흐름을 다루고 있어요.",
      whyTrending: "짧은 시간 안에 관심이 계속 불어나고 있다는 점이 눈에 띄는 포인트예요.",
      expressions: [
        {
          phrase: "snowball",
          meaningKo: "눈덩이처럼 불어나다",
          nuance: "작게 시작한 것이 점점 더 커질 때 쓰는 표현이에요.",
          usageSituation: "트렌드 확산 설명",
          exampleEn: "Interest has started to snowball by the hour.",
          exampleKo: "관심이 시간이 갈수록 눈덩이처럼 불어나고 있다.",
          comparison: {
            phrase: "grow",
            nuanceDiff: "grow는 그냥 커진다는 중립적인 말이고, snowball은 작게 시작한 것이 점점 더 빠르게, 더 크게 불어난다는 느낌을 더해요.",
          },
        },
        {
          phrase: "jump on [something]",
          meaningKo: "~에 편승하다, 재빨리 다루다",
          nuance: "화제가 되는 주제를 다른 매체나 사람들도 빠르게 다루기 시작할 때 쓰는 표현이에요.",
          usageSituation: "매체 보도 확산",
          exampleEn: "More outlets jumped on the story within hours.",
          exampleKo: "몇 시간 안에 더 많은 매체가 그 이야기에 뛰어들었다.",
          comparison: {
            phrase: "cover [something]",
            nuanceDiff: "cover는 그냥 보도한다는 중립적인 말이고, jump on은 화제가 되자마자 재빨리 편승해서 다루기 시작했다는 속도감이 있어요.",
          },
        },
        {
          phrase: "plenty of room left to run",
          meaningKo: "앞으로 더 커질 여지가 있다",
          nuance: "어떤 트렌드가 아직 정점에 도달하지 않았다고 볼 때 쓰는 표현이에요.",
          usageSituation: "트렌드 전망",
          exampleEn: "This trend still has plenty of room left to run.",
          exampleKo: "이 트렌드는 아직 더 커질 여지가 남아 있다.",
          comparison: {
            phrase: "not over yet",
            nuanceDiff: "not over yet은 그냥 아직 끝나지 않았다는 뜻이고, plenty of room left to run은 앞으로 더 커질 여지가 많이 남아 있다는 전망을 담고 있어요.",
          },
        },
      ],
    },
  ],
  "테크·게임": [
    {
      title: "허브 공개 직후 개발자들이 몰린 오늘의 테크 소식",
      summary: "공식 모델/프로젝트 허브와 개발자 커뮤니티가 동시에 반응한 오늘의 테크 이슈예요.",
      englishSummary:
        "The moment this landed on an official hub, developers didn't waste any time putting it through its paces. Early numbers are already starting to roll in, and competitors are clearly paying close attention.",
      koreanSummary:
        "공식 허브에 공개된 직후 개발자들이 곧바로 테스트에 나선 테크 이슈예요. 초기 반응 데이터가 빠르게 모이고 있어요.",
      whyTrending: "공개 직후 반응 속도가 평소보다 빠르다는 점이 주목받고 있어요.",
      expressions: [
        {
          phrase: "waste no time",
          meaningKo: "지체 없이 바로 하다",
          nuance: "어떤 일을 미루지 않고 즉시 시작할 때 쓰는 표현이에요.",
          usageSituation: "테크 뉴스",
          exampleEn: "Developers wasted no time testing the new release.",
          exampleKo: "개발자들은 지체 없이 새 릴리스를 테스트했다.",
          comparison: {
            phrase: "act quickly",
            nuanceDiff: "act quickly는 그냥 빠르게 행동한다는 뜻이고, waste no time은 망설임 없이 곧바로 시작했다는 느낌을 강조해요.",
          },
        },
        {
          phrase: "put [something] through its paces",
          meaningKo: "~의 성능을 실제로 테스트해보다",
          nuance: "새 도구가 실제로 잘 작동하는지 다양하게 시험해볼 때 쓰는 표현이에요.",
          usageSituation: "테크 리뷰",
          exampleEn: "Early adopters put the model through its paces within hours.",
          exampleKo: "얼리어답터들은 몇 시간 안에 그 모델의 성능을 테스트했다.",
          comparison: {
            phrase: "test [something] out",
            nuanceDiff: "test out은 그냥 한번 써본다는 가벼운 느낌이고, put through its paces는 다양한 상황에서 제대로 작동하는지 꼼꼼히 시험해본다는 뜻이 강해요.",
          },
        },
        {
          phrase: "pay close attention",
          meaningKo: "주의 깊게 지켜보다",
          nuance: "경쟁자나 관계자가 어떤 움직임을 유심히 살필 때 쓰는 표현이에요.",
          usageSituation: "산업 동향 분석",
          exampleEn: "Competitors are clearly paying close attention this time.",
          exampleKo: "경쟁사들은 이번엔 확실히 유심히 지켜보고 있다.",
          comparison: {
            phrase: "notice [something]",
            nuanceDiff: "notice는 그냥 알아챈다는 뜻이고, pay close attention은 의도적으로 계속 유심히 지켜본다는 느낌이 강해요.",
          },
        },
      ],
    },
    {
      title: "커뮤니티 반응이 플랫폼 데이터로 확인된 오늘의 게임 소식",
      summary: "플랫폼 공식 데이터와 커뮤니티 반응이 함께 확인된 오늘의 게임·테크 이슈예요.",
      englishSummary:
        "Numbers from an official platform page are lining up neatly with what the community has been saying for days. When the data and the chatter finally match up, it's usually a sign the story has real legs.",
      koreanSummary:
        "공식 플랫폼 데이터와 커뮤니티 반응이 같은 방향을 가리킨 게임·테크 이슈예요. 데이터와 반응이 일치한다는 점이 신뢰도를 높였어요.",
      whyTrending: "데이터와 커뮤니티 반응이 서로 교차 확인됐다는 점이 이 소식의 신뢰도를 높이고 있어요.",
      expressions: [
        {
          phrase: "line up with [something]",
          meaningKo: "~과 일치하다, 맞아떨어지다",
          nuance: "두 가지 정보나 자료가 서로 모순 없이 들어맞을 때 쓰는 표현이에요.",
          usageSituation: "데이터 분석",
          exampleEn: "The official numbers line up with community reports.",
          exampleKo: "공식 수치가 커뮤니티 보고와 일치한다.",
          comparison: {
            phrase: "match [something]",
            nuanceDiff: "match는 그냥 맞아떨어진다는 중립적인 말이고, line up with는 서로 다른 자료들이 일관되게 같은 결론을 가리킨다는 뉘앙스가 있어요.",
          },
        },
        {
          phrase: "have real legs",
          meaningKo: "오래 갈 만한 화제성이 있다",
          nuance: "어떤 트렌드가 금방 사라지지 않고 꾸준히 이어질 것 같을 때 쓰는 표현이에요.",
          usageSituation: "트렌드 전망",
          exampleEn: "Analysts think this story has real legs.",
          exampleKo: "분석가들은 이 이야기가 오래 갈 화제성이 있다고 본다.",
          comparison: {
            phrase: "last",
            nuanceDiff: "last는 그냥 오래 지속된다는 뜻이고, have real legs는 화제성이 꾸준히 이어질 만한 힘이 있다는 전망을 담고 있어요.",
          },
        },
        {
          phrase: "match up",
          meaningKo: "서로 맞아떨어지다",
          nuance: "두 개의 정보가 같은 결론을 가리킬 때 쓰는 표현이에요.",
          usageSituation: "검증/비교 기사",
          exampleEn: "Once the data and the chatter match up, people take notice.",
          exampleKo: "데이터와 반응이 맞아떨어지면 사람들은 주목하기 시작한다.",
          comparison: {
            phrase: "agree",
            nuanceDiff: "agree는 그냥 일치한다는 뜻이고, match up은 두 개의 서로 다른 정보나 자료가 비교했을 때 들어맞는다는 과정을 강조해요.",
          },
        },
      ],
    },
    {
      title: "오픈소스 공개 이후 판도가 흔들린 오늘의 테크 이슈",
      summary: "오픈소스 공개 직후 업계 반응이 이어진 오늘의 테크 트렌드예요.",
      englishSummary:
        "Releasing this as open source turned out to be a bigger deal than expected, shaking up assumptions that only closed, paid options could compete. Teams that once ruled it out are now giving it a second look.",
      koreanSummary:
        "오픈소스로 공개된 것이 예상보다 큰 반향을 일으킨 테크 이슈예요. 유료 비공개 옵션만 고려했던 팀들도 다시 살펴보기 시작했어요.",
      whyTrending: "무료 공개 버전이 유료 옵션의 입지를 흔들었다는 점이 화제가 되고 있어요.",
      expressions: [
        {
          phrase: "shake up [something]",
          meaningKo: "~을 뒤흔들다, 판도를 바꾸다",
          nuance: "기존의 가정이나 질서를 크게 흔들어놓을 때 쓰는 표현이에요.",
          usageSituation: "산업 변화 분석",
          exampleEn: "The release shook up assumptions about the market.",
          exampleKo: "그 공개는 시장에 대한 기존 가정을 뒤흔들었다.",
          comparison: {
            phrase: "change [something]",
            nuanceDiff: "change는 그냥 바꾼다는 중립적인 말이고, shake up은 기존의 가정이나 질서를 크게 흔들어놓는다는 느낌이 강해요.",
          },
        },
        {
          phrase: "rule [something] out",
          meaningKo: "~을 배제하다, 고려 대상에서 제외하다",
          nuance: "선택지에서 완전히 제외했을 때 쓰는 표현이에요.",
          usageSituation: "의사결정 설명",
          exampleEn: "Teams that once ruled it out are reconsidering.",
          exampleKo: "한때 그것을 배제했던 팀들이 다시 고려하고 있다.",
          comparison: {
            phrase: "reject [something]",
            nuanceDiff: "reject는 그냥 거부한다는 뜻이고, rule out은 선택지에서 완전히 제외하고 더 이상 고려하지 않는다는 느낌이 강해요.",
          },
        },
        {
          phrase: "give [something] a second look",
          meaningKo: "~을 다시 한번 살펴보다",
          nuance: "이전에 지나쳤던 선택지를 다시 검토할 때 쓰는 표현이에요.",
          usageSituation: "개발자 커뮤니티 반응",
          exampleEn: "More developers are giving the open-source option a second look.",
          exampleKo: "더 많은 개발자들이 오픈소스 옵션을 다시 살펴보고 있다.",
          comparison: {
            phrase: "reconsider [something]",
            nuanceDiff: "reconsider는 그냥 다시 생각해본다는 중립적인 말이고, give something a second look은 한 번 지나쳤던 걸 다시 살펴본다는 구체적인 행동을 강조해요.",
          },
        },
      ],
    },
  ],
  "스포츠": [
    {
      title: "리그 공식 발표 직후 쏟아진 오늘의 스포츠 소식",
      summary: "리그 공식 사이트 발표와 여러 매체 보도가 겹친 오늘의 스포츠 이슈예요.",
      englishSummary:
        "The news barely had time to settle before reactions started pouring in from every direction. Analysts are already weighing in on what it means, even though the dust has yet to fully settle.",
      koreanSummary:
        "리그 공식 사이트 발표 직후 여러 매체의 반응이 동시에 쏟아진 스포츠 이슈예요. 아직 상황이 완전히 정리되지 않았는데도 분석이 이어지고 있어요.",
      whyTrending: "공식 발표 직후 반응 속도와 양이 평소보다 두드러졌다는 점이 화제가 되고 있어요.",
      expressions: [
        {
          phrase: "pour in",
          meaningKo: "쏟아져 들어오다",
          nuance: "반응이나 소식이 한꺼번에 몰려들 때 쓰는 표현이에요.",
          usageSituation: "스포츠 뉴스, SNS 반응",
          exampleEn: "Reactions poured in from every direction within minutes.",
          exampleKo: "몇 분 안에 모든 방향에서 반응이 쏟아져 들어왔다.",
          comparison: {
            phrase: "arrive",
            nuanceDiff: "arrive는 그냥 도착한다는 중립적인 말이고, pour in은 한꺼번에 많은 양이 몰려든다는 느낌을 더해요.",
          },
        },
        {
          phrase: "weigh in on [something]",
          meaningKo: "~에 대해 의견을 내다",
          nuance: "전문가가 특정 이슈에 대한 생각을 밝힐 때 쓰는 표현이에요.",
          usageSituation: "전문가 분석",
          exampleEn: "Analysts were quick to weigh in on the decision.",
          exampleKo: "분석가들은 그 결정에 대해 재빨리 의견을 냈다.",
          comparison: {
            phrase: "comment on [something]",
            nuanceDiff: "comment on은 그냥 어떤 주제에 대해 말한다는 중립적인 표현이고, weigh in on은 관련자가 자신의 입장을 분명히 밝힌다는 느낌이 강해요.",
          },
        },
        {
          phrase: "the dust has yet to settle",
          meaningKo: "아직 상황이 정리되지 않았다",
          nuance: "사건 직후라 전체 상황이 아직 명확하지 않을 때 쓰는 표현이에요.",
          usageSituation: "속보/후속 분석",
          exampleEn: "The dust has yet to settle on what this means long-term.",
          exampleKo: "이게 장기적으로 무슨 의미인지는 아직 정리되지 않았다.",
          comparison: {
            phrase: "it's unclear",
            nuanceDiff: "it's unclear는 그냥 명확하지 않다는 뜻이고, the dust has yet to settle은 큰 사건 직후라 전체 상황이 아직 정리되지 않았다는 느낌을 더해요.",
          },
        },
      ],
    },
    {
      title: "공식 기록과 매체 분석이 맞붙은 오늘의 스포츠 이슈",
      summary: "리그 공식 기록과 매체들의 분석이 함께 화제가 된 오늘의 스포츠 소식이에요.",
      englishSummary:
        "Official stats back up what commentators have been saying for a while now, and that kind of confirmation tends to carry weight. Some are already calling it one for the record books.",
      koreanSummary:
        "리그 공식 기록이 평론가들의 분석을 뒷받침하면서 신뢰도가 높아진 스포츠 이슈예요. 여러 출처가 같은 결론에 도달했어요.",
      whyTrending: "공식 기록이 기존 분석을 뒷받침했다는 점에서 화제성이 더 커졌어요.",
      expressions: [
        {
          phrase: "back up [something]",
          meaningKo: "~을 뒷받침하다",
          nuance: "어떤 주장이나 분석을 근거로 지지해줄 때 쓰는 표현이에요.",
          usageSituation: "데이터 분석",
          exampleEn: "Official stats back up what analysts predicted.",
          exampleKo: "공식 기록이 분석가들의 예측을 뒷받침한다.",
          comparison: {
            phrase: "confirm [something]",
            nuanceDiff: "confirm은 그냥 확인해준다는 뜻이고, back up은 이미 나온 주장이나 분석을 근거로 뒷받침해준다는 느낌이 있어요.",
          },
        },
        {
          phrase: "carry weight",
          meaningKo: "무게감이 있다, 설득력을 갖다",
          nuance: "어떤 근거나 의견이 충분히 신뢰할 만하다고 여겨질 때 쓰는 표현이에요.",
          usageSituation: "평가/분석 기사",
          exampleEn: "Official confirmation always carries weight in these debates.",
          exampleKo: "공식 확인은 이런 논쟁에서 늘 설득력을 갖는다.",
          comparison: {
            phrase: "matter",
            nuanceDiff: "matter는 그냥 중요하다는 뜻이고, carry weight는 그 근거나 의견이 충분히 신뢰할 만해서 설득력을 갖는다는 뉘앙스가 있어요.",
          },
        },
        {
          phrase: "one for the record books",
          meaningKo: "역사에 남을 만한 일",
          nuance: "매우 인상적이거나 전례 없는 결과를 설명할 때 쓰는 표현이에요.",
          usageSituation: "경기 결과 해설",
          exampleEn: "Commentators are calling it one for the record books.",
          exampleKo: "해설진은 그것을 역사에 남을 만한 일이라고 부르고 있다.",
          comparison: {
            phrase: "impressive",
            nuanceDiff: "impressive는 그냥 인상적이라는 뜻이고, one for the record books는 역사에 남을 만큼 전례 없는 결과라는 느낌을 강조해요.",
          },
        },
      ],
    },
    {
      title: "예상 밖 결과로 반응이 폭발한 오늘의 스포츠 소식",
      summary: "예상을 벗어난 결과에 여러 매체의 반응이 동시에 터진 오늘의 스포츠 이슈예요.",
      englishSummary:
        "Hardly anyone saw this coming, which is exactly why reaction coverage blew up so fast. Now attention is turning to how the other side plans to respond.",
      koreanSummary:
        "예상을 벗어난 결과에 여러 매체의 반응이 동시에 폭발적으로 늘어난 스포츠 이슈예요. 이제는 다음 대응에 관심이 모이고 있어요.",
      whyTrending: "예측을 벗어난 결과일수록 반응 속도와 양이 더 커지는 경향이 이번에도 확인됐어요.",
      expressions: [
        {
          phrase: "see [something] coming",
          meaningKo: "~을 예상하다",
          nuance: "어떤 일이 일어나기 전에 미리 예측했는지를 말할 때 쓰는 표현이에요.",
          usageSituation: "예측/반응 기사",
          exampleEn: "Hardly anyone saw this result coming.",
          exampleKo: "이 결과를 예상한 사람은 거의 없었다.",
          comparison: {
            phrase: "expect [something]",
            nuanceDiff: "expect는 그냥 예상한다는 뜻이고, see something coming은 미리 조짐을 보고 다가올 일을 감지했다는 느낌이 더 강해요.",
          },
        },
        {
          phrase: "blow up",
          meaningKo: "폭발적으로 화제가 되다",
          nuance: "뉴스나 반응이 순식간에 크게 터질 때 쓰는 표현이에요.",
          usageSituation: "SNS, 스포츠 뉴스",
          exampleEn: "Reaction coverage blew up within the hour.",
          exampleKo: "반응 보도는 한 시간 안에 폭발적으로 늘어났다.",
          comparison: {
            phrase: "go viral",
            nuanceDiff: "go viral은 온라인에서 빠르게 공유되며 퍼진다는 뜻이고, blow up은 꼭 온라인이 아니어도 화제성 자체가 갑자기 폭발적으로 커진다는 데 초점이 있어요.",
          },
        },
        {
          phrase: "turn to [something]",
          meaningKo: "~쪽으로 관심이 옮겨가다",
          nuance: "관심의 초점이 다른 대상으로 이동할 때 쓰는 표현이에요.",
          usageSituation: "후속 전망",
          exampleEn: "Attention is now turning to how they'll respond.",
          exampleKo: "이제 관심은 그들이 어떻게 대응할지로 옮겨가고 있다.",
          comparison: {
            phrase: "focus on [something]",
            nuanceDiff: "focus on은 그냥 집중한다는 뜻이고, turn to는 관심의 초점이 다른 대상으로 옮겨간다는 변화의 흐름을 강조해요.",
          },
        },
      ],
    },
  ],
  "글로벌 이슈": [
    {
      title: "국제기구 자료와 현장 보도가 겹친 오늘의 글로벌 이슈",
      summary: "국제기구 공식 자료와 현장 매체 보도가 함께 다룬 오늘의 글로벌 이슈예요.",
      englishSummary:
        "Background material from an international body and on-the-ground reporting are pointing in the same direction today. When official data and independent coverage line up like this, the underlying issue tends to get taken more seriously.",
      koreanSummary:
        "국제기구의 공식 배경 자료와 현장 매체 보도가 같은 방향을 가리킨 글로벌 이슈예요. 여러 출처가 함께 이 흐름을 뒷받침하고 있어요.",
      whyTrending: "공식 자료와 현장 보도가 동시에 같은 결론을 가리킨다는 점이 이슈의 신뢰도를 높이고 있어요.",
      expressions: [
        {
          phrase: "point in the same direction",
          meaningKo: "같은 방향을 가리키다",
          nuance: "서로 다른 자료나 증거가 같은 결론으로 이어질 때 쓰는 표현이에요.",
          usageSituation: "시사 분석",
          exampleEn: "Official data and ground reporting point in the same direction.",
          exampleKo: "공식 자료와 현장 보도가 같은 방향을 가리키고 있다.",
          comparison: {
            phrase: "agree",
            nuanceDiff: "agree는 그냥 일치한다는 뜻이고, point in the same direction은 서로 다른 자료나 증거가 같은 결론으로 이어진다는 과정을 강조해요.",
          },
        },
        {
          phrase: "line up",
          meaningKo: "일치하다, 맞아떨어지다",
          nuance: "여러 정보가 서로 모순 없이 들어맞을 때 쓰는 표현이에요.",
          usageSituation: "검증 기사",
          exampleEn: "When sources line up like this, it's hard to dismiss.",
          exampleKo: "이렇게 여러 출처가 일치하면 무시하기 어렵다.",
          comparison: {
            phrase: "match",
            nuanceDiff: "match는 그냥 맞아떨어진다는 뜻이고, line up은 여러 정보가 서로 모순 없이 일관되게 들어맞는다는 느낌을 강조해요.",
          },
        },
        {
          phrase: "take [something] seriously",
          meaningKo: "~을 중요하게 받아들이다",
          nuance: "어떤 문제를 가볍게 넘기지 않고 중요하게 다룰 때 쓰는 표현이에요.",
          usageSituation: "정책/여론 분석",
          exampleEn: "Confirmed reports are pushing more people to take the issue seriously.",
          exampleKo: "확인된 보도는 더 많은 사람들이 그 문제를 심각하게 받아들이게 만들고 있다.",
          comparison: {
            phrase: "notice [something]",
            nuanceDiff: "notice는 그냥 알아챈다는 뜻이고, take something seriously는 그것을 중요하게 받아들여 신경 쓴다는 태도를 강조해요.",
          },
        },
      ],
    },
    {
      title: "여러 매체가 같은 패턴을 짚은 오늘의 글로벌 이슈",
      summary: "여러 지역 매체가 독립적으로 같은 흐름을 포착한 오늘의 글로벌 이슈예요.",
      englishSummary:
        "Outlets covering this from different regions, with no clear connection to each other, have independently landed on a very similar read of events. That kind of overlap is exactly what makes a story worth paying attention to.",
      koreanSummary:
        "서로 연관이 없는 여러 지역 매체가 독립적으로 비슷한 해석에 도달한 글로벌 이슈예요. 교차 확인이 가능한 사례로 주목받고 있어요.",
      whyTrending: "서로 무관한 출처들이 독립적으로 같은 결론에 이른 점이 이 이슈를 더 신뢰할 만하게 만들어요.",
      expressions: [
        {
          phrase: "land on [something]",
          meaningKo: "~라는 결론에 도달하다",
          nuance: "여러 논의나 분석을 거쳐 특정 결론에 이르렀을 때 쓰는 표현이에요.",
          usageSituation: "분석/해설 기사",
          exampleEn: "Independent outlets landed on a similar read of events.",
          exampleKo: "서로 다른 매체들이 비슷한 해석에 도달했다.",
          comparison: {
            phrase: "reach [something]",
            nuanceDiff: "reach는 그냥 도달한다는 중립적인 말이고, land on은 여러 논의나 분석을 거친 끝에 특정 결론에 이르렀다는 과정을 강조해요.",
          },
        },
        {
          phrase: "worth paying attention to",
          meaningKo: "주목할 만한",
          nuance: "중요하게 여길 만한 가치가 있다고 말할 때 쓰는 표현이에요.",
          usageSituation: "이슈 평가",
          exampleEn: "That kind of overlap makes a story worth paying attention to.",
          exampleKo: "그런 겹침은 그 이슈를 주목할 만하게 만든다.",
          comparison: {
            phrase: "important",
            nuanceDiff: "important는 그냥 중요하다는 뜻이고, worth paying attention to는 지금 당장 주목할 가치가 있다는 실용적인 조언에 가까워요.",
          },
        },
        {
          phrase: "no clear connection",
          meaningKo: "뚜렷한 연관이 없는",
          nuance: "서로 독립적인 출처임을 강조할 때 쓰는 표현이에요.",
          usageSituation: "출처 신뢰도 설명",
          exampleEn: "The outlets have no clear connection to each other.",
          exampleKo: "그 매체들은 서로 뚜렷한 연관이 없다.",
          comparison: {
            phrase: "unrelated",
            nuanceDiff: "unrelated는 그냥 무관하다는 뜻이고, no clear connection은 겉보기에 관련이 없어 보여서 신뢰도를 높이는 맥락에서 자주 쓰여요.",
          },
        },
      ],
    },
    {
      title: "공식 자료가 뒷받침한 오늘의 글로벌 이슈",
      summary: "국제기구 공식 자료가 뒷받침한 오늘의 글로벌 이슈를 짚어봤어요.",
      englishSummary:
        "This issue has been simmering for a while, but official background material has now given reporters something concrete to point to. That tends to shift coverage from speculation to something closer to documented fact.",
      koreanSummary:
        "한동안 조용히 이어지던 이슈였는데, 국제기구의 공식 배경 자료가 근거를 더해준 사례예요. 추측성 보도에서 사실 확인 단계로 넘어갔어요.",
      whyTrending: "공식 자료가 뒷받침되면서 추측에 머물던 이슈가 더 구체적으로 다뤄지기 시작했어요.",
      expressions: [
        {
          phrase: "simmer",
          meaningKo: "서서히 끓다, 조용히 지속되다",
          nuance: "아직 크게 터지지 않았지만 계속 이어지고 있는 긴장이나 이슈를 설명할 때 쓰는 표현이에요.",
          usageSituation: "시사 배경 설명",
          exampleEn: "The issue has been simmering for a while now.",
          exampleKo: "그 이슈는 한동안 조용히 이어지고 있었다.",
          comparison: {
            phrase: "continue",
            nuanceDiff: "continue는 그냥 계속된다는 뜻이고, simmer는 아직 크게 터지지 않았지만 조용히 긴장이 이어지고 있다는 느낌을 더해요.",
          },
        },
        {
          phrase: "something concrete to point to",
          meaningKo: "구체적으로 근거로 삼을 만한 것",
          nuance: "추측이 아니라 실제로 가리킬 수 있는 명확한 근거가 생겼을 때 쓰는 표현이에요.",
          usageSituation: "사실 확인 기사",
          exampleEn: "Official material gave reporters something concrete to point to.",
          exampleKo: "공식 자료는 기자들에게 구체적인 근거를 마련해줬다.",
          comparison: {
            phrase: "evidence",
            nuanceDiff: "evidence는 그냥 증거라는 일반적인 말이고, something concrete to point to는 추측이 아니라 실제로 가리킬 수 있는 구체적인 근거가 생겼다는 뉘앙스를 강조해요.",
          },
        },
        {
          phrase: "shift from [something] to [something]",
          meaningKo: "~에서 ~로 옮겨가다",
          nuance: "상황이나 성격이 한 단계에서 다른 단계로 바뀔 때 쓰는 표현이에요.",
          usageSituation: "보도 흐름 분석",
          exampleEn: "Coverage shifted from speculation to documented fact.",
          exampleKo: "보도는 추측에서 사실 확인 단계로 옮겨갔다.",
          comparison: {
            phrase: "change",
            nuanceDiff: "change는 그냥 바뀐다는 중립적인 말이고, shift from A to B는 한 단계에서 다른 단계로 넘어가는 흐름 자체를 구체적으로 보여줘요.",
          },
        },
      ],
    },
  ],
};

export async function generateTrendDraft(
  input: GenerateTrendDraftInput,
): Promise<GenerateTrendDraftOutput> {
  // Swap point for a real OpenAI call later: keep this signature, call
  // the API here instead, and return the same shape. No key is
  // configured yet, so this stays rule-based.
  return generateTrendDraftStub(input);
}

function generateTrendDraftStub(input: GenerateTrendDraftInput): GenerateTrendDraftOutput {
  const variants = VARIANT_BANK[input.category];
  const variant = variants[input.variantIndex % variants.length];
  return {
    title: variant.title,
    summary: variant.summary,
    englishSummary: variant.englishSummary,
    koreanSummary: variant.koreanSummary,
    whyTrending: variant.whyTrending,
    expressions: variant.expressions,
  };
}
