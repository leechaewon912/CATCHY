// LOCAL TEST ONLY. Hand-written Korean/English summaries for specific
// real EU Press Corner articles — composed by reading the real title AND
// RSS <description> field once (no LLM, no API key configured — the
// person doing this composing is standing in for the LLM call this
// pipeline would otherwise make), then discarding the description text
// entirely. Every field below is a paraphrase in new sentence structure,
// not a copy of the original description's sentences — only factual
// content (event name, date, purpose) carries over, which is fact, not
// protected expression (same distinction generate-trend-with-llm.ts's
// real prompt draws). Matched by exact title string, since the feed
// rotates daily; a title not in this map falls back to the generic
// title-only rendering in build-eu-preview-trend.ts rather than
// guessing a machine translation/summary without an LLM.
//
// Source description actually read for the entry below (2026-10-15,
// via ec.europa.eu/commission/presscorner/api/rss — never stored,
// quoted here only for this file's own audit trail): "On the occasion
// of the International Day for Disaster Risk Management, the European
// Commission is convening the very first cross-regional dialogue 'From
// Space to Grassroots: Strengthening Community Resilience to Natural
// Hazards through Space Technologies'. The dialogue marked the start of
// a process to further strengthen international cooperation to
// anticipate, prepare for and respond to disasters using space
// technologies."
export type KnownTranslation = {
  titleKo: string;
  englishSummary: string;
  koreanSummary: string;
};

export const KNOWN_TITLE_TRANSLATIONS: Record<string, KnownTranslation> = {
  "Commissioners Kubilius and Lahbib strengthen global disaster risk management through space technologies": {
    titleKo: "Kubilius·Lahbib 집행위원, 우주 기술로 전 세계 재해 위험 관리 강화",
    englishSummary:
      "The European Commission held its first cross-regional dialogue on using space technologies to help communities withstand natural disasters, timed to the International Day for Disaster Risk Management. The event focused on ways to strengthen local resilience through disaster risk management built on space technologies. Officials said the dialogue marks the start of deeper international cooperation in this area.",
    koreanSummary:
      "유럽연합 집행위원회가 '국제 재해위험관리의 날'을 맞아 우주 기술을 활용한 첫 지역간 대화를 열었습니다. 이번 행사는 자연재해에 대한 지역 공동체의 회복력을 우주 기술 기반으로 강화하는 방안을 논의했습니다. 집행위원회는 이를 계기로 우주 기술을 활용한 재해 대응 국제 협력을 한층 강화해 나가겠다고 밝혔습니다.",
  },
};
