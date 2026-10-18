import "server-only";

// Commercial-use license registry for every feed in
// src/lib/server/rss-sources.ts, plus the GDELT Project dataset itself.
// Built from a manual ToS/copyright-policy review on 2026-10-15 (see
// project conversation history) — NOT legal advice. Treat every verdict
// here as a conservative, non-expert reading of each publisher's own
// terms page, not a guarantee of legal safety. Before actually shipping
// any "allowed"/"conditional" source to real users at scale, get the
// underlying terms re-confirmed (and, for anything commercially
// valuable, written permission) directly from the publisher.
//
// sourceId is the exact RSS feed URL as it appears in
// CATEGORY_RSS_FEEDS (not a bare domain) — several publishers here
// (Ars Technica, BBC, NPR) serve their feed from a different subdomain
// than their articles live on, so keying by domain would either miss
// matches or require fragile manual domain-aliasing. A few entries are
// keyed differently: "gdelt-project"/"eu-press-corner"/"wikinews" since
// those aren't RSS feed URLs, and "ec.europa.eu"/"europa.eu" are keyed
// by bare domain specifically so collect-trends.ts's single-source
// publish exception (see SINGLE_SOURCE_* there) can look a cluster's
// lone article domain up directly.
export type CommercialUseVerdict = "allowed" | "conditional" | "permission_required";

export type SourcePolicy = {
  sourceId: string;
  // Human-readable domain for display/logging — the article-page domain,
  // not necessarily the feed URL's own host.
  displayDomain: string;
  verdict: CommercialUseVerdict;
  tosUrl: string;
  checkedAt: string;
  scopeNotes: string;
};

// Every entry defaults to "permission_required" unless the publisher's
// own terms page was found to say otherwise in plain language — per
// this project's conservative-by-default policy, "couldn't find a clear
// commercial grant" and "found an explicit prohibition" are treated the
// same way (excluded in production).
export const SOURCE_POLICIES: SourcePolicy[] = [
  // --- 음악 ---
  {
    sourceId: "https://www.billboard.com/feed/",
    displayDomain: "billboard.com",
    verdict: "permission_required",
    tosUrl: "https://pmc.com/terms-of-use/",
    checkedAt: "2026-10-15",
    scopeNotes:
      "Penske Media(PMC) 계열. PMC는 TollBit(AI/봇 콘텐츠 유료 라이선싱) 파트너로 확인됨 — 자동화된 상업적 재사용은 유료 라이선스 대상으로 추정. 서면 허가/계약 없이는 제외.",
  },
  {
    sourceId: "https://www.rollingstone.com/music/music-news/feed/",
    displayDomain: "rollingstone.com",
    verdict: "permission_required",
    tosUrl: "https://pmc.com/terms-of-use/",
    checkedAt: "2026-10-15",
    scopeNotes: "PMC 계열 — billboard.com과 동일 근거(TollBit 파트너).",
  },
  {
    sourceId: "https://pitchfork.com/feed/feed-news/rss",
    displayDomain: "pitchfork.com",
    verdict: "permission_required",
    tosUrl: "https://www.condenast.com/user-agreement/",
    checkedAt: "2026-10-15",
    scopeNotes:
      "Condé Nast 계열. 공통 약관: \"Service is intended for personal, noncommercial use only... may not modify, copy, reproduce, republish... any material from the Service.\"",
  },
  {
    sourceId: "https://www.nme.com/news/music/feed",
    displayDomain: "nme.com",
    verdict: "permission_required",
    tosUrl: "https://www.nmenetworks.com/policies/nme-networks-terms-of-use",
    checkedAt: "2026-10-15",
    scopeNotes:
      "원문 확인: \"콘텐츠를 상업적 목적으로 쓰려면 먼저 허가를 받아야 합니다\" — 비상업 개인용 열람/보관만 허용.",
  },

  // --- 영화·시리즈 ---
  {
    sourceId: "https://variety.com/feed/",
    displayDomain: "variety.com",
    verdict: "permission_required",
    tosUrl: "https://pmc.com/terms-of-use/",
    checkedAt: "2026-10-15",
    scopeNotes:
      "PMC 계열. 약관 페이지 경유 시 tollbit.variety.com으로 리다이렉트되어 HTTP 402 Payment Required 확인 — 자동화 접근 자체가 유료 게이트.",
  },
  {
    sourceId: "https://www.hollywoodreporter.com/feed/",
    displayDomain: "hollywoodreporter.com",
    verdict: "permission_required",
    tosUrl: "https://pmc.com/terms-of-use/",
    checkedAt: "2026-10-15",
    scopeNotes: "PMC 계열 — variety.com과 동일 근거(TollBit 유료 게이트).",
  },
  {
    sourceId: "https://deadline.com/feed/",
    displayDomain: "deadline.com",
    verdict: "permission_required",
    tosUrl: "https://pmc.com/terms-of-use/",
    checkedAt: "2026-10-15",
    scopeNotes: "PMC 계열 — 동일 근거(TollBit 유료 게이트).",
  },
  {
    sourceId: "https://www.indiewire.com/feed/",
    displayDomain: "indiewire.com",
    verdict: "permission_required",
    tosUrl: "https://pmc.com/terms-of-use/",
    checkedAt: "2026-10-15",
    scopeNotes: "PMC 계열 — 동일 근거(TollBit 유료 게이트).",
  },
  {
    sourceId: "https://pagesix.com/feed/",
    displayDomain: "pagesix.com",
    verdict: "permission_required",
    tosUrl: "https://nypost.com/terms/",
    checkedAt: "2026-10-15",
    scopeNotes:
      "News Corp(NY Post) 계열. 약관 원문 직접 확인은 실패(접근 차단) — 불확실하므로 보수적으로 제외.",
  },
  {
    sourceId: "https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml",
    displayDomain: "eonline.com",
    verdict: "permission_required",
    tosUrl: "https://www.nbcuniversal.com/terms",
    checkedAt: "2026-10-15",
    scopeNotes:
      "NBCUniversal 계열. 원문 확인: \"Users may not... resell, redistribute... or make any other commercial use of [content], whether for profit or for no profit\" — 영리 여부와 무관하게 전면 금지.",
  },

  // --- 밈·인터넷 ---
  {
    sourceId: "https://www.theverge.com/rss/index.xml",
    displayDomain: "theverge.com",
    verdict: "permission_required",
    tosUrl: "https://www.voxmedia.com/legal/terms-of-service",
    checkedAt: "2026-10-15",
    scopeNotes:
      "Vox Media 계열. 원문 확인: \"no part of the Site and no Content... may be copied, reproduced, aggregated, republished... for any commercial purpose without express prior written permission.\"",
  },
  {
    sourceId: "https://mashable.com/feeds/rss/all",
    displayDomain: "mashable.com",
    verdict: "permission_required",
    tosUrl: "https://www.ziffdavis.com/terms-of-service",
    checkedAt: "2026-10-15",
    scopeNotes:
      "Ziff Davis 계열. 약관 원문 직접 확인 실패 — Ziff Davis는 OpenAI 상대 무단 콘텐츠 사용 소송 당사자로 상업적 재사용에 보수적 입장으로 추정.",
  },
  {
    sourceId: "https://www.dazeddigital.com/rss",
    displayDomain: "dazeddigital.com",
    verdict: "permission_required",
    tosUrl: "https://www.dazeddigital.com/info/article/825/1/terms-conditions",
    checkedAt: "2026-10-15",
    scopeNotes:
      "원문 확인: \"Unless content carries a 'share' icon you may not copy, reproduce... or otherwise use DazedDigital.com content in any way except for your own personal, non-commercial use.\"",
  },

  // --- 라이프스타일 ---
  {
    sourceId: "https://www.vogue.com/feed/rss",
    displayDomain: "vogue.com",
    verdict: "permission_required",
    tosUrl: "https://www.condenast.com/user-agreement/",
    checkedAt: "2026-10-15",
    scopeNotes: "Condé Nast 계열 공통 약관 — 개인·비상업적 용도만 허용.",
  },
  {
    sourceId: "https://www.gq.com/feed/rss",
    displayDomain: "gq.com",
    verdict: "permission_required",
    tosUrl: "https://www.condenast.com/user-agreement/",
    checkedAt: "2026-10-15",
    scopeNotes: "Condé Nast 계열 공통 약관 — vogue.com과 동일.",
  },
  {
    sourceId: "https://hypebeast.com/feed",
    displayDomain: "hypebeast.com",
    verdict: "permission_required",
    tosUrl: "https://hypebeast.com/terms",
    checkedAt: "2026-10-15",
    scopeNotes:
      "원문 확인: 재게시(republishing)·재배포·복제 전면 금지 조항 확인.",
  },
  {
    sourceId: "https://www.allure.com/feed/rss",
    displayDomain: "allure.com",
    verdict: "permission_required",
    tosUrl: "https://www.condenast.com/user-agreement/",
    checkedAt: "2026-10-15",
    scopeNotes: "Condé Nast 계열 공통 약관 — vogue.com과 동일.",
  },

  // --- 테크·게임 ---
  {
    sourceId: "https://techcrunch.com/feed/",
    displayDomain: "techcrunch.com",
    verdict: "conditional",
    tosUrl: "https://techcrunch.com/rss-terms-of-use",
    checkedAt: "2026-10-15",
    scopeNotes:
      "RSS 전용 약관이 피드 항목(제목 등) 표시를 \"attribution to TechCrunch\" + 원문 링크 + 피드 내 광고 삽입 금지 조건으로 명시적으로 허용. 단 LLM 재작성 요약이나 복수 출처 교차검증 후 상업 서비스 편입까지 커버하는지는 약관에 명시 없어 제목+링크 수준으로만 의존할 것.",
  },
  {
    sourceId: "https://feeds.arstechnica.com/arstechnica/index",
    displayDomain: "arstechnica.com",
    verdict: "permission_required",
    tosUrl: "https://www.condenast.com/user-agreement/",
    checkedAt: "2026-10-15",
    scopeNotes: "Condé Nast 계열 공통 약관 — 개인·비상업적 용도만.",
  },
  {
    sourceId: "https://kotaku.com/feed",
    displayDomain: "kotaku.com",
    verdict: "permission_required",
    tosUrl: "https://kotaku.com/terms-of-use",
    checkedAt: "2026-10-15",
    scopeNotes:
      "원문 확인: \"personal, non-commercial... use only\"; \"may not use the materials for any commercial purpose.\"",
  },
  {
    sourceId: "https://www.ign.com/rss/articles/feed?tags=games",
    displayDomain: "ign.com",
    verdict: "permission_required",
    tosUrl: "https://www.ign.com/ziffdavis/terms-of-use",
    checkedAt: "2026-10-15",
    scopeNotes:
      "Ziff Davis 계열. 약관 원문 직접 확인 실패 — mashable.com과 동일 보수적 근거(Ziff Davis v. OpenAI 소송 전력).",
  },

  // --- 스포츠 ---
  {
    sourceId: "https://www.espn.com/espn/rss/news",
    displayDomain: "espn.com",
    verdict: "permission_required",
    tosUrl: "https://www.espn.com/espn/news/story?page=terms",
    checkedAt: "2026-10-15",
    scopeNotes:
      "Disney 계열. 원문 확인: \"customers may not copy, reproduce, retransmit, distribute, publish, commercially exploit... any copyrighted material\"; \"redistribution is expressly prohibited.\"",
  },
  {
    sourceId: "https://feeds.bbci.co.uk/sport/rss.xml",
    displayDomain: "bbc.co.uk",
    verdict: "permission_required",
    tosUrl: "https://www.bbc.co.uk/usingthebbc/terms-of-use/",
    checkedAt: "2026-10-15",
    scopeNotes:
      "BBC RSS 전용 약관: 개인 사이트에서의 RSS 사용만 허용, \"business use needs the BBC's permission\" — Catchy는 상업 서비스이므로 명시적으로 허가 필요 범위.",
  },
  {
    sourceId: "https://www.skysports.com/rss/12040",
    displayDomain: "skysports.com",
    verdict: "permission_required",
    tosUrl: "https://www.skysports.com/",
    checkedAt: "2026-10-15",
    scopeNotes:
      "Sky/Comcast 계열. 일반 약관 원문 직접 확인 실패 — Sky가 별도 \"Sky Clip Sales\" 상업 라이선스 창구를 운영 중인 점이 기본 약관상 상업적 무료 재사용 불가를 시사.",
  },

  // --- 글로벌 이슈 ---
  {
    sourceId: "https://feeds.bbci.co.uk/news/world/rss.xml",
    displayDomain: "bbc.co.uk",
    verdict: "permission_required",
    tosUrl: "https://www.bbc.co.uk/usingthebbc/terms-of-use/",
    checkedAt: "2026-10-15",
    scopeNotes: "BBC RSS 전용 약관 — feeds.bbci.co.uk/sport/rss.xml과 동일 근거(비즈니스 이용은 별도 허가 필요).",
  },
  {
    sourceId: "https://www.theguardian.com/world/rss",
    displayDomain: "theguardian.com",
    verdict: "permission_required",
    tosUrl: "https://www.theguardian.com/help/terms-of-service",
    checkedAt: "2026-10-15",
    scopeNotes:
      "Guardian Open Platform에 상업 라이선스 체계가 존재했던 전례는 있으나(2009년 출시 공지), 현재 요금제/조건을 원문으로 확인하지 못해 불확실 — 보수적으로 제외.",
  },
  {
    sourceId: "https://feeds.npr.org/1004/rss.xml",
    displayDomain: "npr.org",
    verdict: "permission_required",
    tosUrl: "https://www.npr.org/about-npr/179876898/terms-of-use",
    checkedAt: "2026-10-15",
    scopeNotes:
      "원문 확인: \"content may be used only for personal noncommercial use or for noncommercial online use by a 501(c)(3) Nonprofit Corporation\" — 상업 서비스는 명백히 범위 밖.",
  },
  {
    sourceId: "https://www.vox.com/rss/index.xml",
    displayDomain: "vox.com",
    verdict: "permission_required",
    tosUrl: "https://www.voxmedia.com/legal/terms-of-service",
    checkedAt: "2026-10-15",
    scopeNotes: "Vox Media 계열 — theverge.com과 동일 약관(사전 서면 허가 없는 상업적 재배포 전면 금지).",
  },
  {
    sourceId: "https://restofworld.org/feed/latest/",
    displayDomain: "restofworld.org",
    verdict: "permission_required",
    tosUrl: "https://restofworld.org/about/licensing-style-guidelines/",
    checkedAt: "2026-10-15",
    scopeNotes:
      "비영리 뉴스룸이지만 원문 확인: \"for-profit newsrooms, publications, or other entities may license articles for a one-time fee\" — 무료 예외 조항 없음, 영리 서비스는 유료 라이선스 필수.",
  },

  // --- 글로벌 이슈 대체 후보 (RSS가 아닌 공공기관 API/오픈데이터) ---
  {
    sourceId: "eu-press-corner",
    displayDomain: "ec.europa.eu",
    verdict: "conditional",
    tosUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011D0833",
    checkedAt: "2026-10-15",
    scopeNotes:
      "European Commission Press Corner RSS(ec.europa.eu/commission/presscorner/api/rss) 어댑터 식별자(sources/eu-presscorner-adapter.ts). EU 재사용 정책(Decision 2011/833/EU)에 따라 상업/비상업 불문 무료 재사용이 원칙 허용되며 출처표시만 요구 — 단 제3자 저작권 콘텐츠·로고는 예외. 2026-10-15 실시간 테스트로 같은 날 보도자료가 정상 수신됨을 확인.",
  },
  // 위 "eu-press-corner"와 별개로 도메인으로도 등록 — 기사 자체의 domain
  // 필드(ec.europa.eu)로 isCommerciallyUsable()을 조회하는 단일 출처 발행
  // 예외 게이트(collect-trends.ts의 singleSourceEligible)가 이 엔트리를
  // 쓴다. OFFICIAL_DOMAINS(collect-trends.ts)에 europa.eu/ec.europa.eu가
  // 모두 등록돼 있어 sourceType은 이미 "official"로 분류되지만, 라이선스
  // 확인 여부는 별개이므로 여기서 명시적으로 기록한다 — 등록되지 않은
  // 도메인은 "official"로 분류되더라도 isCommerciallyUsable이 기본
  // false를 반환해 단일 출처 예외가 적용되지 않는다(예: un.org, who.int).
  {
    sourceId: "ec.europa.eu",
    displayDomain: "ec.europa.eu",
    verdict: "conditional",
    tosUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011D0833",
    checkedAt: "2026-10-15",
    scopeNotes: "eu-press-corner와 동일 근거 — 기사 도메인 기준 조회용 엔트리.",
  },
  {
    sourceId: "europa.eu",
    displayDomain: "europa.eu",
    verdict: "conditional",
    tosUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011D0833",
    checkedAt: "2026-10-15",
    scopeNotes:
      "EU 기관 전반에 적용되는 Decision 2011/833/EU 재사용 정책 — 현재 Catchy가 실제로 수집하는 건 ec.europa.eu(Press Corner)뿐이며, 이 엔트리는 europa.eu 서브도메인이 향후 다른 경로(GDELT 등)로 등장할 경우를 대비한 문서화 목적.",
  },
  {
    sourceId: "wikinews",
    displayDomain: "en.wikinews.org",
    verdict: "allowed",
    tosUrl: "https://en.wikinews.org/wiki/Wikinews:Reusing_Wikinews_content",
    checkedAt: "2026-10-15",
    scopeNotes:
      "CC BY 4.0 — 상업적 이용 허용, 출처표시만 요구(ShareAlike 의무 없음, Wikipedia보다 조건이 가벼움). 단 2026-10-15 실시간 테스트 결과 Special:RecentChanges·Special:Newpages RSS 피드 모두 HTTP 200이지만 <item> 0개(발행량이 사실상 없음) — 라이선스는 깨끗하지만 트렌드 수집원으로 현재 기능하지 않아 어댑터를 구현하지 않음. 추후 재확인 가치 있음.",
  },

  // --- GDELT (RSS가 아닌 별도 데이터 소스) ---
  {
    sourceId: "gdelt-project",
    displayDomain: "gdeltproject.org",
    verdict: "allowed",
    tosUrl: "https://www.gdeltproject.org/about.html",
    checkedAt: "2026-10-15",
    scopeNotes:
      "원문 확인: \"all datasets released by the GDELT Project are available for unlimited and unrestricted use for any academic, commercial, or governmental use of any kind without fee\" — 단 \"GDELT Project\" 출처 표시 + gdeltproject.org 링크 필수. 이 허용 범위는 GDELT가 가공한 메타데이터(제목/URL/도메인/발행일)에만 적용되며, 그 URL이 가리키는 원문 기사 본문·이미지 자체의 저작권은 각 발행사 소유로 별개 — GDELT 경유 여부와 무관하게 원문 전문·이미지 재게시는 금지.",
  },
];

const POLICY_BY_SOURCE_ID = new Map(SOURCE_POLICIES.map((policy) => [policy.sourceId, policy]));

export function getSourcePolicy(sourceId: string): SourcePolicy | undefined {
  return POLICY_BY_SOURCE_ID.get(sourceId);
}

// Conservative-by-default: a sourceId with no registry entry at all
// (e.g. a feed added to rss-sources.ts without also registering its
// policy here) is treated the same as an explicit "permission_required"
// verdict, never as "allowed". This is the single gate every caller
// should use rather than reading `verdict` directly.
export function isCommerciallyUsable(sourceId: string): boolean {
  const policy = getSourcePolicy(sourceId);
  if (!policy) return false;
  return policy.verdict === "allowed" || policy.verdict === "conditional";
}
