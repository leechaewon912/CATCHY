import { MOCK_MODE } from "@/lib/server/trend-repository";

export function SiteFooter() {
  return (
    <footer className="border-t border-cloud px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-[12px] text-ash">
        <p>
          {MOCK_MODE ? (
            <>
              아래 트렌드는 CATCHY가 포트폴리오 목적으로 직접 기획·작성한 샘플
              에디토리얼로, 외부 기사 출처 없이 제작되었습니다.
            </>
          ) : (
            <>
              모든 트렌드 콘텐츠는 공개 출처를 참고해 CATCHY가 영어 학습용으로
              재구성한 것이며, 원문 출처 링크를 함께 제공합니다.
            </>
          )}
        </p>
        <p>© 2026 CATCHY. Source discovery via curated publisher RSS feeds.</p>
      </div>
    </footer>
  );
}
