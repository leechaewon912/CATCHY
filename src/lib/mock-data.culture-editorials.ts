import "server-only";

import type { Trend } from "@/lib/mock-data";
import { buildQuizFromExpressions } from "@/lib/server/build-quiz";

// ============================================================================
// Catchy 포트폴리오용 "컬처 에디토리얼" Mock 콘텐츠 — 7개, 카테고리별 1개.
//
// 뉴스 기사를 요약·재가공한 것이 아니라, 글로벌 문화·라이프스타일을 소재로
// 독자적으로 작성된 에디토리얼이다. 제목/본문/번역/표현/예문은 모두 제공받은
// 원문을 그대로 사용했고, 이 파일에서 임의로 줄이거나 새로 쓴 문장은 없다.
//
// 기존 src/lib/mock-data.ts의 손으로 작성한 7개(+ 검증용 데모 2개) 트렌드와
// 완전히 분리된 별도 파일로 둬서, 두 콘텐츠 세트가 서로 섞이지 않는다.
// MOCK_MODE=true일 때만 src/lib/server/trend-repository.ts가 이 파일의
// getCultureEditorialTrends()를 사용한다 — MOCK_MODE가 false/미설정이면
// 이 파일은 전혀 import되지 않고, 기존 DB-first + mock-data.ts 폴백 동작이
// 그대로 유지된다.
//
// 이 콘텐츠는 뉴스 트렌드가 아니라 자체 제작 에디토리얼이라 다음 두 필드는
// 의도적으로 비워둔다 (둘 다 mock-data.ts에서 선택 필드로 확장됨):
//   - sources: 실제 기사 출처를 임의로 지어내지 않기 위해 빈 배열로 둔다.
//     trend/[id]/page.tsx가 sources.length === 0일 때 "참고 출처" 섹션과
//     "출처 N개 보기" 링크를 자연스럽게 숨긴다.
//   - whyTrending: 특정 사건의 화제성을 설명하는 필드라 에디토리얼 성격과
//     맞지 않아 비워둔다. 상세 페이지가 비어 있으면 "왜 지금 화제일까요?"
//     섹션 자체를 생략한다.
//
// 콘텐츠당 영어 표현은 3개씩, 기존 src/lib/mock-data.ts(원본 Catchy
// 콘텐츠)와 동일하게 phrase/meaningKo/nuance/comparison/exampleEn/exampleKo
// 를 모두 채운다. 세 번째 표현은 각 에디토리얼의 영어 본문(englishSummary)
// 에 실제로 등장하는 구절 중에서 골라, 상세 페이지의 하이라이트가 항상
// 정상적으로 걸리도록 했다. usageSituation은 원본 Catchy 콘텐츠에도 있던
// 필드지만 어떤 화면에도 실제로 노출되지 않아 비워뒀다.
// ============================================================================

// quiz/generatedAt/reviewedAt을 뺀 나머지 전부 — quiz는 expressions로부터
// 계산되고, generatedAt/reviewedAt은 아래 getCultureEditorialTrends()가
// 호출될 때마다 "지금" 기준 최근 7일 안에서 새로 채운다 (고정 날짜를
// 박아두면 시간이 지나는 순간 조용히 과거 콘텐츠가 되어 버리기 때문 —
// 아래 getCultureEditorialTrends()의 주석 참고).
type CultureEditorialSeed = Omit<Trend, "quiz" | "generatedAt" | "reviewedAt">;

const CULTURE_EDITORIAL_SEEDS: CultureEditorialSeed[] = [
  {
    id: "culture-music-playlist-personality",
    title: "이제 플레이리스트가 나를 소개하는 방법이 됐다",
    englishTitle: "Your Playlist Is Your Personality Now",
    category: "음악",
    summary: "당신의 플레이리스트는 당신에 대해 무엇을 말해줄까요?",
    englishSummary: `What does your playlist say about you?

For many young music lovers, playlists are more than just collections of songs. They're personal soundtracks that capture different moods, memories, and even versions of ourselves.

There's a playlist for almost everything: getting ready for a night out, walking home alone, romanticizing an ordinary afternoon, or simply staring out the window. And sometimes, the name of a playlist tells an entire story before the first song even plays.

Sharing a playlist can feel surprisingly personal. Instead of explaining how you feel, you can let a few carefully chosen songs do the talking. It's a subtle way of saying, "This is my kind of vibe."

Whether you're discovering a new artist or keeping the same favorite track on repeat, your music choices create a little world of their own.

Maybe the next time someone asks you to introduce yourself, all you need to do is send them a playlist.`,
    koreanSummary: `당신의 플레이리스트는 당신에 대해 무엇을 말해줄까요?

음악을 좋아하는 많은 젊은 세대에게 플레이리스트는 단순히 노래를 모아둔 목록 그 이상이에요. 그날의 기분과 추억, 때로는 자신의 다양한 모습을 담아내는 개인적인 사운드트랙이죠.

외출 준비를 할 때, 혼자 집으로 걸어갈 때, 평범한 오후를 영화 속 장면처럼 느끼고 싶을 때까지. 이제 거의 모든 순간에 어울리는 플레이리스트가 있어요. 때로는 첫 곡을 듣기도 전에 플레이리스트의 이름만으로 하나의 이야기가 전해지기도 하죠.

플레이리스트를 공유하는 일은 생각보다 개인적인 경험이에요. 자신의 감정을 길게 설명하는 대신, 신중하게 고른 몇 곡으로 마음을 표현할 수 있으니까요. '이게 바로 내가 좋아하는 분위기야'라고 말하는 은근한 방법인 셈이에요.

새로운 아티스트를 발견하든, 좋아하는 노래 한 곡을 계속 반복해서 듣든, 음악 취향은 자신만의 작은 세계를 만들어 줍니다.

어쩌면 다음에 누군가 자기소개를 부탁한다면, 플레이리스트 하나만 보내도 충분할지 몰라요.`,
    sources: [],
    expressions: [
      {
        phrase: "On repeat",
        meaningKo: "반복해서 듣는, 계속 재생하는",
        nuance: "같은 노래나 영상을 질리지 않고 계속 반복해서 즐길 때 쓰는 표현이에요.",
        comparison: {
          phrase: "replay",
          nuanceDiff:
            "replay는 다시 한 번 재생한다는 동작 자체를 가리키고, on repeat은 한동안 계속 반복해서 듣고 있다는 지속적인 상태를 강조해요.",
        },
        exampleEn: "I've had this song on repeat all week.",
        exampleKo: "이번 주 내내 이 노래만 반복해서 듣고 있어요.",
      },
      {
        phrase: "My kind of vibe",
        meaningKo: "딱 내 취향인 분위기",
        nuance: "어떤 분위기나 스타일이 자신의 취향과 잘 맞는다고 느낄 때 쓰는 가벼운 표현이에요.",
        comparison: {
          phrase: "my thing",
          nuanceDiff:
            "my thing은 관심사나 즐겨 하는 활동을 가리키는 더 넓은 표현이고, my kind of vibe는 특정 순간의 분위기나 느낌에 더 초점을 맞춘 표현이에요.",
        },
        exampleEn: "This playlist is totally my kind of vibe.",
        exampleKo: "이 플레이리스트 완전 내 취향이에요.",
      },
      {
        phrase: "Do the talking",
        meaningKo: "~이 대신 말해주다, ~으로 의사를 표현하다",
        nuance: "말로 길게 설명하지 않고 행동이나 선택으로 메시지를 대신 전달할 때 쓰는 표현이에요.",
        comparison: {
          phrase: "speak for itself",
          nuanceDiff:
            "speak for itself는 결과나 성과가 너무 명백해서 따로 설명이 필요 없다는 뜻이고, let ... do the talking은 말 대신 다른 수단으로 의도적으로 메시지를 전달한다는 뜻이에요.",
        },
        exampleEn: "I let my playlist do the talking instead of explaining how I felt.",
        exampleKo: "나는 내 기분을 설명하는 대신 플레이리스트가 대신 말하게 했어요.",
      },
    ],
    status: "published",
  },
  {
    id: "culture-film-comfort-watch",
    title: "결말을 아는데도 같은 작품을 다시 보는 이유",
    englishTitle: "Why We Keep Rewatching the Same Shows",
    category: "영화·시리즈",
    summary:
      "스트리밍 앱을 열고 수십 개의 신작을 둘러보다가 결국 다섯 번째로 같은 드라마를 재생한 적 있나요?",
    englishSummary: `You open your streaming app, scroll through dozens of new releases, and somehow end up watching the same show for the fifth time. Sound familiar?

With endless movies and series available at our fingertips, you might think we'd always be looking for something new. But sometimes, the most appealing option is one where you already know the story by heart.

That's the beauty of a comfort watch. You know exactly what happens, which characters you'll fall in love with, and which scenes will make you laugh. There's no pressure to follow a complicated plot or worry about an unexpected ending.

Rewatching can also bring back memories of when you first discovered a show. A familiar soundtrack or favorite line can instantly transport you to a different moment in your life.

Maybe entertainment doesn't always have to surprise us. Sometimes, we just want something that feels like home.`,
    koreanSummary: `스트리밍 앱을 열고 수십 개의 신작을 둘러보다가 결국 다섯 번째로 같은 드라마를 재생한 적 있나요?

수많은 영화와 시리즈를 언제든 볼 수 있는 시대지만, 우리는 항상 새로운 작품만 찾지는 않아요. 때로는 이미 내용을 훤히 아는 이야기가 가장 끌리기도 하죠.

이것이 바로 '컴포트 워치(Comfort watch)'의 매력이에요. 어떤 일이 벌어질지, 어떤 캐릭터를 좋아하게 될지, 어느 장면에서 웃게 될지 이미 알고 있으니까요. 복잡한 줄거리를 따라가거나 예상치 못한 결말을 걱정할 필요도 없어요.

익숙한 작품을 다시 보는 일은 처음 그 작품을 만났던 순간의 기억을 떠올리게 하기도 해요. 익숙한 배경음악이나 좋아하는 대사 하나만으로도 과거의 어느 순간으로 돌아간 듯한 기분을 느낄 수 있죠.

어쩌면 콘텐츠가 항상 우리를 놀라게 할 필요는 없는지도 몰라요. 가끔은 집처럼 편안하게 느껴지는 이야기가 필요하니까요.`,
    sources: [],
    expressions: [
      {
        phrase: "Comfort watch",
        meaningKo: "마음이 편해져서 반복해서 보게 되는 작품",
        nuance: "새로운 자극보다 익숙함에서 오는 편안함을 느끼고 싶을 때 다시 찾는 작품을 가리키는 표현이에요.",
        comparison: {
          phrase: "guilty pleasure",
          nuanceDiff:
            "guilty pleasure는 남들에게 말하기 조금 부끄럽지만 즐기는 것을 뜻하고, comfort watch는 부끄러움 없이 순수하게 마음이 편해져서 다시 찾는 작품을 뜻해요.",
        },
        exampleEn: "This sitcom is my go-to comfort watch after a long day.",
        exampleKo: "이 시트콤은 긴 하루를 보낸 뒤 내가 즐겨 보는 힐링 작품이에요.",
      },
      {
        phrase: "Know [something] by heart",
        meaningKo: "완전히 외우다, 속속들이 알다",
        nuance: "너무 많이 보거나 들어서 대사나 내용을 토씨 하나까지 기억할 정도로 잘 알고 있을 때 쓰는 표현이에요.",
        comparison: {
          phrase: "remember",
          nuanceDiff: "remember는 단순히 기억한다는 뜻이고, know by heart는 완전히 암기할 정도로 깊이 익혔다는 느낌을 더해요.",
        },
        exampleEn: "I've watched this movie so many times that I know every line by heart.",
        exampleKo: "이 영화를 너무 많이 봐서 대사를 전부 외울 정도예요.",
      },
      {
        phrase: "At our fingertips",
        meaningKo: "손쉽게 이용할 수 있는, 바로 이용 가능한",
        nuance: "원하면 언제든 바로 손에 넣을 수 있을 만큼 가깝고 편리하게 있다는 느낌을 줄 때 쓰는 표현이에요.",
        comparison: {
          phrase: "within reach",
          nuanceDiff:
            "within reach는 물리적으로나 상황적으로 닿을 수 있는 거리에 있다는 뜻이고, at ... fingertips는 그보다 더 즉각적으로, 손가락 하나로 바로 이용할 수 있다는 느낌을 강조해요.",
        },
        exampleEn: "With so many shows at our fingertips, it's hard to pick just one.",
        exampleKo: "너무 많은 작품을 손쉽게 볼 수 있어서 하나만 고르기 어려워요.",
      },
    ],
    status: "published",
  },
  {
    id: "culture-meme-its-giving",
    title: "설명보다 느낌이 중요한 인터넷 언어, It's giving",
    englishTitle: "It's Giving: The Internet's Favorite Way to Describe a Vibe",
    category: "밈·인터넷",
    summary:
      "친구가 선글라스에 화려한 코트까지 입고 영화 속 주인공 같은 모습으로 나타났다고 상상해 보세요.",
    englishSummary: `Imagine your friend shows up wearing sunglasses, a dramatic coat, and an outfit that looks straight out of a movie. Instead of saying, "You look really confident and stylish," you simply say, "It's giving main character energy."

Welcome to the world of "It's giving," an expression used across social media to describe the mood, aesthetic, or impression something creates.

The beauty of this phrase is how flexible it is. A cozy café might be "giving Paris in the fall," while someone's colorful outfit could be "giving early 2000s pop star." It doesn't have to be a literal comparison. It's about capturing a feeling in a way that other people instantly understand.

Of course, internet slang moves quickly, and expressions can become overused almost as fast as they become popular.

But "It's giving" shows something interesting about online communication: sometimes a shared vibe says more than a detailed explanation ever could.`,
    koreanSummary: `친구가 선글라스에 화려한 코트까지 입고 영화 속 주인공 같은 모습으로 나타났다고 상상해 보세요. "오늘 정말 자신감 넘치고 스타일리시해 보여"라고 길게 말하는 대신, "It's giving main character energy"라고 한마디 하는 거예요.

이것이 바로 소셜미디어에서 분위기나 인상을 표현할 때 사용하는 "It's giving"의 세계예요.

이 표현의 매력은 활용 범위가 넓다는 점이에요. 아늑한 카페를 보고 "가을의 파리 같은 느낌"이라고 할 수도 있고, 화려한 옷차림을 보고 "2000년대 초반 팝스타 느낌"이라고 표현할 수도 있죠. 꼭 문자 그대로 비슷할 필요는 없어요. 다른 사람도 바로 이해할 수 있도록 특정한 느낌을 전달하는 것이 핵심이니까요.

물론 인터넷 유행어는 빠르게 변하고, 인기를 얻은 표현이 순식간에 너무 흔해지기도 해요.

하지만 "It's giving"은 온라인 소통의 흥미로운 특징을 보여줘요. 때로는 긴 설명보다 하나의 분위기를 공유하는 편이 더 많은 것을 전달할 수 있다는 거죠.`,
    sources: [],
    expressions: [
      {
        phrase: "[something] giving",
        meaningKo: "~한 느낌이 나, ~한 분위기야",
        nuance: "구체적으로 설명하기보다 전체적인 분위기나 인상을 직관적으로 전달할 때 쓰는 인터넷 표현이에요.",
        comparison: {
          phrase: "it looks like",
          nuanceDiff:
            "it looks like는 시각적으로 비슷해 보인다는 사실 위주의 표현이고, it's giving은 그 대상이 주는 전체적인 느낌이나 분위기를 더 감각적으로 전달해요.",
        },
        exampleEn: "Your outfit is giving 90s supermodel.",
        exampleKo: "네 옷차림 완전 90년대 슈퍼모델 느낌이에요.",
      },
      {
        phrase: "Main character energy",
        meaningKo: "주인공 같은 자신감과 존재감",
        nuance: "영화나 드라마의 주인공처럼 자신감 있고 돋보이는 태도나 분위기를 묘사할 때 쓰는 표현이에요.",
        comparison: {
          phrase: "confidence",
          nuanceDiff:
            "confidence는 자신감이라는 감정 자체를 가리키고, main character energy는 그 자신감이 마치 이야기의 주인공처럼 눈에 띄고 존재감 있게 드러난다는 뉘앙스를 더해요.",
        },
        exampleEn: "She walked into the room with total main character energy.",
        exampleKo: "그녀는 완전히 주인공 같은 존재감으로 방에 들어왔어요.",
      },
      {
        phrase: "Straight out of",
        meaningKo: "꼭 ~에서 그대로 나온 것 같은",
        nuance: "어떤 모습이나 장면이 특정 영화·드라마·시대에서 그대로 옮겨온 것처럼 생생할 때 쓰는 표현이에요.",
        comparison: {
          phrase: "like something from [somewhere]",
          nuanceDiff:
            "like something from은 단순히 비슷하다는 느낌이고, straight out of는 마치 그곳에서 바로 튀어나온 것처럼 더 생생하고 직접적인 느낌을 줘요.",
        },
        exampleEn: "Her outfit looked straight out of a 90s movie.",
        exampleKo: "그녀의 옷차림은 꼭 90년대 영화에서 그대로 나온 것 같았어요.",
      },
    ],
    status: "published",
  },
  {
    id: "culture-lifestyle-offline-joy",
    title: "잠시 연결을 끊는 것만으로 달라지는 하루",
    englishTitle: "The Joy of Being Offline for a While",
    category: "라이프스타일",
    summary: "휴대폰을 확인하지 않고 온전히 한 시간을 보낸 게 언제였나요?",
    englishSummary: `When was the last time you spent an entire hour without checking your phone?

From the moment we wake up, screens seem to follow us everywhere. We scroll through notifications over breakfast, listen to videos while getting ready, and check social media whenever there's a quiet moment.

Being constantly connected can feel normal, but sometimes it's nice to unplug.

It doesn't have to mean deleting every app or disappearing from the internet for a week. It could be something as simple as going for a walk without headphones, reading a few pages of a book, or enjoying a coffee without taking a photo first.

These small moments give us a chance to slow down and pay attention to what's happening around us.

And when we finally return to our screens, we might realize that we haven't missed as much as we thought.

Sometimes, the best way to recharge isn't to do more. It's to do a little less.`,
    koreanSummary: `휴대폰을 확인하지 않고 온전히 한 시간을 보낸 게 언제였나요?

아침에 눈을 뜨는 순간부터 화면은 우리를 따라다녀요. 아침을 먹으며 알림을 확인하고, 외출 준비를 하면서 영상을 틀어두고, 잠깐의 빈 시간이 생기면 소셜미디어를 열어보죠.

늘 연결된 상태가 자연스럽게 느껴지지만, 가끔은 잠시 디지털 세상에서 벗어나는 것도 좋아요.

모든 앱을 삭제하거나 일주일 동안 인터넷에서 사라질 필요까지는 없어요. 이어폰 없이 산책하기, 책 몇 페이지 읽기, 사진을 찍기 전에 커피를 천천히 즐기기처럼 작은 행동만으로도 충분하죠.

이런 순간들은 우리의 속도를 늦추고 주변에서 일어나는 일들에 집중할 기회를 만들어 줘요.

그리고 다시 화면으로 돌아왔을 때, 생각보다 놓친 것이 별로 없다는 사실을 발견할지도 몰라요.

때로는 더 많은 일을 하는 것보다 조금 덜 하는 것이 가장 좋은 재충전 방법일 수 있어요.`,
    sources: [],
    expressions: [
      {
        phrase: "Unplug",
        meaningKo: "디지털 기기에서 벗어나 휴식을 취하다",
        nuance: "전자기기나 온라인 연결에서 의도적으로 잠시 멀어져 쉴 때 쓰는 표현이에요.",
        comparison: {
          phrase: "take a break",
          nuanceDiff:
            "take a break는 어떤 활동에서든 쓸 수 있는 일반적인 휴식을 뜻하고, unplug는 특히 디지털 기기와의 연결을 끊는 휴식에 초점을 맞춰요.",
        },
        exampleEn: "I'm trying to unplug for a few hours every weekend.",
        exampleKo: "주말마다 몇 시간씩 디지털 기기에서 벗어나려고 노력 중이에요.",
      },
      {
        phrase: "Slow down",
        meaningKo: "속도를 늦추다, 여유를 가지다",
        nuance: "바쁘게 서두르던 일상의 속도를 의도적으로 늦추고 여유를 가질 때 쓰는 표현이에요.",
        comparison: {
          phrase: "relax",
          nuanceDiff: "relax는 긴장을 풀고 편안해진다는 상태를 가리키고, slow down은 행동이나 생활의 속도 자체를 늦춘다는 데 초점이 있어요.",
        },
        exampleEn: "Sometimes you need to slow down and enjoy the little things.",
        exampleKo: "가끔은 속도를 늦추고 작은 것들을 즐길 필요가 있어요.",
      },
      {
        phrase: "Recharge",
        meaningKo: "재충전하다, 활력을 되찾다",
        nuance: "지치거나 소진된 상태에서 휴식을 통해 에너지를 다시 채운다는 의미로 쓰는 표현이에요.",
        comparison: {
          phrase: "rest",
          nuanceDiff: "rest는 단순히 쉰다는 뜻이고, recharge는 배터리를 충전하듯 다시 활력을 얻는다는 느낌을 더 강조해요.",
        },
        exampleEn: "I spent the weekend offline just to recharge.",
        exampleKo: "그냥 재충전하려고 주말 내내 오프라인으로 지냈어요.",
      },
    ],
    status: "published",
  },
  {
    id: "culture-tech-vibe-coding",
    title: "말로 설명한 아이디어가 실제 앱이 된다면?",
    englishTitle: "What If You Could Build an App Just by Describing It?",
    category: "테크·게임",
    summary: "앱 아이디어가 떠올랐지만 코딩을 할 줄 몰라서 포기한 적 있나요?",
    englishSummary: `Have you ever had an idea for an app but given up because you didn't know how to code?

AI-powered development tools are changing how people approach creative projects. Instead of writing every line of code from scratch, users can describe what they want to build, review the result, and ask the AI to make changes.

This approach is often called vibe coding. You might start with a simple idea, like a personal reading tracker or a website that recommends movies based on your mood, and gradually bring it to life through conversation.

Of course, building something that works reliably still takes testing, problem-solving, and attention to detail. AI can help create a first version, but it doesn't automatically make every idea a finished product.

Still, the ability to experiment without mastering every technical skill first can be a game changer.

Maybe the most exciting question is no longer just "Can I build this?" but "What should I build?"`,
    koreanSummary: `앱 아이디어가 떠올랐지만 코딩을 할 줄 몰라서 포기한 적 있나요?

AI 기반 개발 도구는 사람들이 창작 프로젝트에 접근하는 방식을 바꾸고 있어요. 모든 코드를 처음부터 직접 작성하는 대신, 만들고 싶은 것을 설명하고 결과물을 확인한 뒤 AI에게 수정해 달라고 요청할 수 있죠.

이런 접근 방식은 흔히 '바이브 코딩(Vibe Coding)'이라고 불려요. 독서 기록 앱이나 기분에 따라 영화를 추천하는 웹사이트 같은 간단한 아이디어에서 시작해, AI와 대화하며 점차 실제 서비스로 구현할 수 있어요.

물론 안정적으로 작동하는 제품을 만들기 위해서는 여전히 테스트와 문제 해결, 세부적인 검토가 필요해요. AI가 첫 번째 버전을 만드는 데 도움을 줄 수는 있지만, 모든 아이디어를 자동으로 완성된 제품으로 바꿔주지는 않으니까요.

그럼에도 모든 기술을 먼저 익히지 않고도 아이디어를 실험해 볼 수 있다는 점은 큰 변화를 만들어 낼 수 있어요.

어쩌면 이제 가장 흥미로운 질문은 "내가 이걸 만들 수 있을까?"가 아니라 "나는 무엇을 만들어 볼까?"인지도 몰라요.`,
    sources: [],
    expressions: [
      {
        phrase: "Bring [something] to life",
        meaningKo: "아이디어나 상상을 현실로 구현하다",
        nuance: "머릿속에만 있던 아이디어나 상상을 실제로 눈에 보이는 결과물로 만들어낼 때 쓰는 표현이에요.",
        comparison: {
          phrase: "create",
          nuanceDiff:
            "create는 무언가를 새로 만든다는 일반적인 표현이고, bring to life는 그 전에는 없던 것에 생명을 불어넣듯 구체적으로 실현시킨다는 느낌이 더해져요.",
        },
        exampleEn: "AI tools helped me bring my app idea to life.",
        exampleKo: "AI 도구 덕분에 내 앱 아이디어를 실제로 구현할 수 있었어요.",
      },
      {
        phrase: "Game changer",
        meaningKo: "상황이나 판도를 크게 바꾸는 것",
        nuance: "기존의 방식이나 판도를 완전히 뒤바꿀 만큼 중요한 변화를 가져오는 대상을 가리킬 때 쓰는 표현이에요.",
        comparison: {
          phrase: "big deal",
          nuanceDiff:
            "big deal은 중요한 일이라는 뜻을 가진 일반적인 표현이고, game changer는 그 일이 기존의 흐름이나 규칙 자체를 바꿔놓았다는 더 구체적인 의미를 담고 있어요.",
        },
        exampleEn: "This tool could be a game changer for independent creators.",
        exampleKo: "이 도구는 개인 창작자들에게 큰 변화를 가져올 수 있어요.",
      },
      {
        phrase: "From scratch",
        meaningKo: "맨 처음부터, 아무것도 없는 상태에서",
        nuance: "기존에 있는 것을 활용하지 않고 완전히 처음부터 새로 시작할 때 쓰는 표현이에요.",
        comparison: {
          phrase: "from the beginning",
          nuanceDiff:
            "from the beginning은 단순히 시간상 처음을 가리키고, from scratch는 아무 재료나 기반 없이 맨바닥에서 새로 만든다는 뉘앙스가 더해져요.",
        },
        exampleEn: "Instead of coding from scratch, she used an AI tool to build the first version.",
        exampleKo: "그녀는 맨 처음부터 코딩하는 대신 AI 도구로 첫 버전을 만들었어요.",
      },
    ],
    status: "published",
  },
  {
    id: "culture-sports-die-hard-fan",
    title: "스포츠 팬이 된다는 건 단순히 승리를 응원하는 일이 아니다",
    englishTitle: "More Than a Game: Why Being a Fan Feels Personal",
    category: "스포츠",
    summary: "몇 년 동안 실망스러운 경기 결과가 이어져도 사람들은 왜 한 팀을 계속 응원할까요?",
    englishSummary: `Why do people stay loyal to a sports team even after years of disappointing results?

If you're a die-hard fan, you probably already know the answer. Supporting a team is rarely just about winning.

It's about the nervous excitement before a big match, the shared reactions when someone scores, and the memories created while watching games with friends or family.

For some people, being a fan becomes part of their identity. They wear team colors, follow players through difficult seasons, and find a sense of community with complete strangers who happen to root for the same side.

Social media has added another layer to this experience. Fans share reactions, create memes, celebrate unforgettable moments, and keep conversations going long after the final whistle.

Of course, losing still hurts. Sometimes a lot.

But perhaps that's what makes the good moments feel so special. When you've supported a team through the difficult times, celebrating a victory means something more.`,
    koreanSummary: `몇 년 동안 실망스러운 경기 결과가 이어져도 사람들은 왜 한 팀을 계속 응원할까요?

열성 팬이라면 이미 답을 알고 있을지도 몰라요. 한 팀을 응원한다는 건 단순히 승리만을 바라는 일이 아니거든요.

중요한 경기를 앞두고 느끼는 긴장과 설렘, 득점 순간 함께 터져 나오는 환호, 친구나 가족과 경기를 보며 쌓은 추억들이 모두 그 경험의 일부예요.

어떤 사람들에게는 팬이라는 사실 자체가 정체성의 일부가 되기도 해요. 팀의 상징색을 입고, 어려운 시즌에도 선수를 응원하며, 같은 팀을 좋아한다는 이유만으로 처음 보는 사람과도 유대감을 느끼죠.

소셜미디어는 이런 경험을 더욱 확장했어요. 팬들은 경기 반응을 공유하고, 밈을 만들고, 잊지 못할 순간을 함께 기념하며 경기가 끝난 뒤에도 이야기를 이어가요.

물론 패배는 여전히 속상한 일이에요. 때로는 정말 많이요.

하지만 어쩌면 그렇기 때문에 승리의 순간이 더욱 특별하게 느껴지는 걸지도 몰라요. 어려운 시기를 함께 견딘 뒤의 승리는 단순한 경기 결과 이상의 의미가 있으니까요.`,
    sources: [],
    expressions: [
      {
        phrase: "Root for",
        meaningKo: "팀이나 사람을 응원하다",
        nuance: "특정 팀이나 사람이 잘되기를 바라며 적극적으로 응원할 때 쓰는 표현이에요.",
        comparison: {
          phrase: "support",
          nuanceDiff:
            "support는 넓은 의미의 지지나 후원을 가리키고, root for는 스포츠 경기나 경쟁에서 특정 편이 이기기를 적극적으로 응원한다는 느낌이 강해요.",
        },
        exampleEn: "I've been rooting for this team since I was a kid.",
        exampleKo: "나는 어릴 때부터 이 팀을 응원해 왔어요.",
      },
      {
        phrase: "Die-hard fan",
        meaningKo: "열성 팬, 골수팬",
        nuance: "결과와 상관없이 변함없이 열정적으로 좋아하는 대상을 응원하는 사람을 가리키는 표현이에요.",
        comparison: {
          phrase: "big fan",
          nuanceDiff: "big fan은 단순히 많이 좋아하는 팬을 가리키고, die-hard fan은 어려운 시기에도 흔들리지 않는 끈질긴 충성심까지 담고 있어요.",
        },
        exampleEn: "She's a die-hard fan who never misses a home game.",
        exampleKo: "그녀는 홈경기를 한 번도 놓치지 않는 열성 팬이에요.",
      },
      {
        phrase: "Stay loyal to",
        meaningKo: "~에 충실하다, 변함없이 응원하다",
        nuance: "힘든 시기에도 떠나지 않고 꾸준히 지지하거나 곁을 지킬 때 쓰는 표현이에요.",
        comparison: {
          phrase: "support",
          nuanceDiff:
            "support는 단순히 응원하거나 지지한다는 뜻이고, stay loyal to는 어려운 상황에서도 변함없이 곁을 지킨다는 의리의 느낌이 더해져요.",
        },
        exampleEn: "Fans stayed loyal to the team even during its worst season.",
        exampleKo: "팬들은 최악의 시즌에도 그 팀에게 변함없이 충실했어요.",
      },
    ],
    status: "published",
  },
  {
    id: "culture-global-everyday-choices",
    title: "일상 속 작은 선택이 정말 세상을 바꿀 수 있을까?",
    englishTitle: "Can Small Everyday Choices Really Make a Difference?",
    category: "라이프스타일", // 구 "글로벌 이슈"(문화) — 카테고리 통합으로 라이프스타일에 편입
    summary:
      "개인 컵을 챙기고, 물건을 새로 사는 대신 수리하고, 옷을 하나 더 구매하기 전에 다시 생각해 보는 것.",
    englishSummary: `Bring your own coffee cup. Repair something instead of replacing it. Think twice before buying another piece of clothing.

These small choices might seem insignificant when compared with the scale of global environmental challenges. After all, can one reusable bottle or one secondhand purchase really make a difference?

The answer isn't as simple as yes or no.

Individual actions alone can't solve problems that require changes from governments, industries, and entire communities. But everyday habits can still reflect what we care about and influence the conversations happening around us.

Choosing to buy less, share more, or extend the life of something we already own can also encourage us to rethink our relationship with consumption.

And sustainable living doesn't have to mean doing everything perfectly. It's about making thoughtful choices when we can, without expecting ourselves to change the world overnight.

Big changes often involve many different efforts working together.

Sometimes, taking small steps is a meaningful place to start.`,
    koreanSummary: `개인 컵을 챙기고, 물건을 새로 사는 대신 수리하고, 옷을 하나 더 구매하기 전에 다시 생각해 보는 것.

이런 작은 선택들은 전 세계가 직면한 환경 문제의 규모와 비교하면 별것 아닌 것처럼 느껴질 수 있어요. 텀블러 하나, 중고 제품 하나를 구매하는 일이 정말 무언가를 바꿀 수 있을까요?

그 답은 단순히 그렇다거나 그렇지 않다고 말하기 어려워요.

개인의 행동만으로 정부와 기업, 사회 전체의 변화가 필요한 문제를 해결할 수는 없어요. 하지만 일상의 습관은 우리가 무엇을 중요하게 생각하는지 보여주고, 주변의 대화와 인식에도 영향을 줄 수 있어요.

덜 사고, 더 많이 나누고, 이미 가진 물건을 오래 사용하는 선택은 소비를 바라보는 방식 자체를 다시 생각하게 만들기도 하죠.

지속 가능한 삶이 모든 것을 완벽하게 실천하는 것을 의미하지는 않아요. 하루아침에 세상을 바꿔야 한다는 부담 없이, 가능한 순간에 조금 더 신중하게 선택하는 것이 중요해요.

큰 변화는 서로 다른 수많은 노력이 함께할 때 만들어지기도 해요.

때로는 작은 실천이 의미 있는 출발점이 될 수 있어요.`,
    sources: [],
    expressions: [
      {
        phrase: "Make a difference",
        meaningKo: "긍정적인 영향을 주다, 변화를 만들다",
        nuance: "작은 행동이라도 세상이나 다른 사람에게 의미 있는 긍정적 영향을 줄 때 쓰는 표현이에요.",
        comparison: {
          phrase: "help",
          nuanceDiff: "help는 단순히 도움을 준다는 뜻이고, make a difference는 그 도움이 실제로 눈에 띄는 긍정적인 변화로 이어진다는 느낌을 더해요.",
        },
        exampleEn: "Even small actions can make a difference in your community.",
        exampleKo: "작은 행동도 지역사회에 긍정적인 변화를 만들 수 있어요.",
      },
      {
        phrase: "Small steps",
        meaningKo: "작은 단계들, 작은 실천들",
        nuance: "큰 목표를 한 번에 이루려 하지 않고, 꾸준히 작은 실천을 쌓아갈 때 쓰는 표현이에요.",
        comparison: {
          phrase: "baby steps",
          nuanceDiff: "baby steps는 아주 느리고 조심스러운 진행을 강조하는 구어적 표현이고, small steps는 꾸준함과 지속성에 좀 더 초점을 맞춘 표현이에요.",
        },
        exampleEn: "I'm taking small steps toward a more sustainable lifestyle.",
        exampleKo: "나는 더 지속 가능한 생활을 위해 작은 실천들을 하고 있어요.",
      },
      {
        phrase: "Think twice",
        meaningKo: "다시 한번 생각하다, 신중하게 고민하다",
        nuance: "어떤 행동을 하기 전에 충동적으로 하지 않고 한 번 더 신중히 고려할 때 쓰는 표현이에요.",
        comparison: {
          phrase: "reconsider",
          nuanceDiff:
            "reconsider는 이미 내린 결정을 다시 검토한다는 뜻이고, think twice는 행동하기 전에 미리 한 번 더 신중하게 생각해본다는 뜻이에요.",
        },
        exampleEn: "I always think twice before buying something I don't really need.",
        exampleKo: "나는 정말 필요하지 않은 물건을 사기 전에 항상 한 번 더 생각해요.",
      },
    ],
    status: "published",
  },
  // ────────────────────────────────────────────────────────────────────
  // 아래 7개는 GPT-4o-mini로 생성한 두 번째 배치 — 위 7개(손으로 쓴 원본)는
  // 건드리지 않고 그대로 두고, 카테고리당 1개씩 추가해 카테고리별 2개
  // 구성을 만든다. 생성·검증 과정(주제/표현 중복 검사, 번역 일치 검사,
  // 하이라이트 검증)은 대화 기록 참고.
  // ────────────────────────────────────────────────────────────────────
  {
    id: "culture-music-earworm",
    title: `귀에서 맴도는 노래, 이어웜의 정체`,
    englishTitle: `Why Is This Song Stuck in My Head?`,
    category: "음악",
    summary: `귀에서 맴도는 노래, 이어웜의 정체를 알아봐요.`,
    englishSummary: `You hear a catchy tune on the radio, and suddenly, it’s like a switch has flipped in your brain. Hours later, you find yourself humming that same melody, unable to shake it off. This phenomenon is known as an earworm, a song that burrows into your mind and plays on repeat. You might be in the shower, washing your hair, and there it is again, looping endlessly. It’s frustrating but also oddly comforting. These tunes often have simple, repetitive hooks that make them easy to remember. So, what makes some songs stick while others fade away? It’s a blend of melody, rhythm, and emotional resonance that keeps us coming back for more, even when we want to let go. The next time a song gets stuck in your head, just know you’re not alone!`,
    koreanSummary: `라디오에서 귀에 쏙 들어오는 멜로디를 듣고 나면, 갑자기 머릿속에서 스위치가 켜진 듯해요. 몇 시간 후, 그 멜로디를 계속 흥얼거리며 지우려 해도 지워지지 않죠. 이런 현상을 우리는 이어웜이라고 부르는데, 머릿속에 파고들어 반복 재생되는 노래를 의미해요. 샤워를 하면서도 반복적으로 그 노래가 떠오르고, 계속해서 맴돌죠. 짜증나기도 하지만, 이상하게도 위안이 되기도 해요. 이런 노래들은 간단하고 반복적인 후렴이 특징이어서 기억하기 쉽죠. 어떤 노래는 쉽게 잊혀지는데, 어떤 노래는 계속 남는 이유는 멜로디와 리듬, 그리고 감정적 공명이 뒤섞여 있기 때문이에요. 다음에 어떤 노래가 머릿속에 맴돈다면, 당신만 그런 게 아니라는 걸 기억하세요!`,
    sources: [],
    expressions: [
      {
        phrase: `earworm`,
        meaningKo: `중독성 있는 노래`,
        nuance: `귀에 맴도는, 쉽게 잊혀지지 않는 멜로디를 가진 곡을 표현하는 용어`,
        comparison: {
          phrase: `catchy tune`,
          nuanceDiff:
            `catchy tune은 멜로디가 매력적이고 기억하기 쉬운 노래를 의미하지만, earworm은 특히 머리에 계속 맴도는 곡을 강조해요.`,
        },
        exampleEn: `That song is such an earworm; I can't get it out of my head!`,
        exampleKo: `그 노래는 정말 중독성 있어; 머리에서 도저히 빠져나오지 않아!`,
      },
      {
        phrase: `shake it off`,
        meaningKo: `떨쳐내다, 털어버리다`,
        nuance: `원치 않는 생각이나 기분을 억지로 떨쳐내려 할 때 쓰는 표현이에요.`,
        comparison: {
          phrase: `let it go`,
          nuanceDiff:
            `let it go는 어떤 일이나 감정에 더 이상 집착하지 않고 놓아준다는 더 넓은 의미이고, shake it off는 특히 성가시거나 거슬리는 것을 즉각적으로 떨쳐낸다는 느낌이 강해요.`,
        },
        exampleEn: `I tried to shake it off, but the song kept playing in my head.`,
        exampleKo: `떨쳐내려고 했지만, 그 노래는 계속 머릿속에서 맴돌았어요.`,
      },
      {
        phrase: `humming that same melody`,
        meaningKo: `같은 멜로디를 흥얼거리다`,
        nuance: `특정한 멜로디를 입으로 소리 내지 않고 조용히 흥얼거리는 상황을 설명`,
        comparison: {
          phrase: `singing along`,
          nuanceDiff:
            `humming은 조용히 흥얼거리는 것이고, singing along은 곡에 맞춰 노래하는 것으로 더 큰 소리를 내는 것을 의미해요.`,
        },
        exampleEn: `I found myself humming that same melody all week long.`,
        exampleKo: `나는 일주일 내내 같은 멜로디를 흥얼거리고 있었어요.`,
      },
    ],
    status: "published",
  },
  {
    id: "culture-film-spoiler-race",
    title: `스포일러 전에 봐야 한다는 압박`,
    englishTitle: `The Race to Watch It Before You Get Spoiled`,
    category: "영화·시리즈",
    summary: `SNS에서 스포일러를 보기 전에 작품을 챙겨 보는 문화에 대한 이야기.`,
    englishSummary: `You’re scrolling through your social media feed, and suddenly, there it is: a huge spoiler for the show you’ve been meaning to watch. Sound familiar? In a world where everyone is binge-watching the latest series, the pressure to finish before getting spoiled is real. The thrill of going in blind has faded as spoilers can ruin the experience. Friends are constantly asking if you’ve seen the latest episode, and the fear of being left out drives you to watch it ASAP. You find yourself racing against time, pausing to avoid any posts that could reveal the twists. It’s a wild ride, filled with excitement and anxiety, as you aim to join the conversation without revealing your own spoilers. So, how do you navigate this race? It’s all about timing and a bit of luck!`,
    koreanSummary: `당신은 소셜 미디어 피드를 스크롤하다가 갑자기 큰 스포일러를 마주하게 됩니다. 이런 경험, 익숙하시죠? 모두가 최신 시리즈를 몰아보는 시대에 스포일러를 피하려는 압박은 정말 큽니다. 아무런 정보 없이 보는 재미가 사라지는 요즘, 주변 친구들이 최신 에피소드를 봤는지 끊임없이 물어보니, 대화에 끼지 못할까봐 조급해지죠. 그래서 당신은 최대한 빨리 작품을 챙겨 보려 하게 되고, 스포일러가 있을 법한 포스트는 피하며 시간을 쏟습니다. 이렇게 흥미진진하고도 긴장감 넘치는 레이스에서 대화에 끼기 위한 시간 관리와 약간의 행운이 필요하죠!`,
    sources: [],
    expressions: [
      {
        phrase: `binge-watching`,
        meaningKo: `몰아보기`,
        nuance: `최근 유행하는 시리즈를 한꺼번에 보는 것을 의미하며, 시간이 없거나 기다릴 수 없는 사람들에게 흔히 사용되는 표현입니다.`,
        comparison: {
          phrase: `watching in one sitting`,
          nuanceDiff:
            `‘watching in one sitting’은 한 번에 끝까지 보는 것을 의미하지만, ‘binge-watching’은 여러 에피소드를 한꺼번에 보는 느낌을 강조합니다.`,
        },
        exampleEn: `Many people enjoy binge-watching their favorite shows over the weekend.`,
        exampleKo: `많은 사람들은 주말에 좋아하는 프로그램을 몰아보는 것을 즐깁니다.`,
      },
      {
        phrase: `go in blind`,
        meaningKo: `사전 정보 없이 시작하다`,
        nuance: `무언가를 시작할 때 미리 정보를 알지 못하고 시작하는 것을 강조하는 표현입니다.`,
        comparison: {
          phrase: `know beforehand`,
          nuanceDiff:
            `‘know beforehand’는 미리 알고 있는 것을 의미하는 반면, ‘go in blind’는 전혀 모르고 시작하는 것을 강조합니다.`,
        },
        exampleEn: `I like to go in blind when it comes to new movies; it makes the experience more exciting.`,
        exampleKo: `새로운 영화에 대해서는 사전 정보 없이 시작하는 것을 좋아합니다; 그게 경험을 더 흥미롭게 만듭니다.`,
      },
      {
        phrase: `racing against time`,
        meaningKo: `시간과 싸우다, 시간에 쫓기다`,
        nuance: `정해진 시간 안에 뭔가를 끝내려고 서두르며 긴박하게 움직일 때 쓰는 표현이에요.`,
        comparison: {
          phrase: `running out of time`,
          nuanceDiff:
            `running out of time은 남은 시간이 거의 없다는 상태 자체를 가리키고, racing against time은 그 제한된 시간 안에 끝내려고 적극적으로 서두르는 행동에 초점을 맞춰요.`,
        },
        exampleEn: `I was racing against time to finish the series before someone spoiled the ending.`,
        exampleKo: `누군가 결말을 스포일러하기 전에 시리즈를 다 보려고 시간과 싸우고 있었어요.`,
      },
    ],
    status: "published",
  },
  {
    id: "culture-meme-thought-of-you",
    title: `밈을 보내는 것, 애정을 표현하는 방식`,
    englishTitle: `Sending Memes Is How We Say 'I Thought of You'`,
    category: "밈·인터넷",
    summary: `밈을 통해 친구에게 애정과 유대감을 표현하는 방법.`,
    englishSummary: `Have you ever found yourself scrolling through memes and suddenly thinking of a friend? You quickly send it off with a simple 'This is so you!' It's a modern way of showing you care, and it’s become a universal language among friends. Memes capture shared experiences, inside jokes, and relatable moments, making them perfect for expressing affection. When you tag someone in a funny meme, it’s like saying, 'I thought of you!' without needing to write a long message. This quick exchange can brighten someone’s day and strengthen your bond. In a world where communication can sometimes feel distant, sending a meme feels personal and intimate. It’s a reminder that you’re thinking of them, even if it's just for a laugh. So next time you see a meme that screams your friend's name, don’t hesitate to share it!`,
    koreanSummary: `친구를 생각하며 밈을 스크롤하다가 갑자기 떠오른 적이 있나요? '이거 당신 같아!'라는 메시지와 함께 빠르게 보내는 그 순간. 요즘 이렇게 보내는 밈이 서로의 애정을 표현하는 현대적인 방법이 되었죠. 밈은 공유된 경험과 속마음을 담고 있어, 애정을 전하기에 딱 맞습니다. 친구에게 웃긴 밈을 태그하면, '당신을 생각했어요!'라고 말하는 것과 같아요. 이런 짧은 교환이 누군가의 하루를 밝게 하고, 유대감을 강화할 수 있습니다. 소통이 가끔은 멀게 느껴질 때, 밈을 보내는 건 개인적이고 친밀한 느낌을 줍니다. 다음에 친구의 이름이 떠오르는 밈을 본다면 주저하지 말고 공유해보세요!`,
    sources: [],
    expressions: [
      {
        phrase: `This is so you!`,
        meaningKo: `너를 위한 거예요!`,
        nuance: `친구에게 맞춤형으로 생각하고 있다는 것을 표현하는 친근한 말.`,
        comparison: {
          phrase: `This is perfect for you!`,
          nuanceDiff:
            `'This is perfect for you!'는 더 공식적이고 칭찬하는 느낌이 강한 반면, 'This is so you!'는 더 친근하고 개인적인 느낌을 줘요.`,
        },
        exampleEn: `When I saw that meme about cats, I immediately thought of you and said, 'This is so you!'`,
        exampleKo: `고양이에 관한 그 밈을 보자마자 네가 떠올라서 '이건 너를 위한 거야!'라고 말했어요.`,
      },
      {
        phrase: `I thought of you!`,
        meaningKo: `너를 생각했어요!`,
        nuance: `특별한 순간이나 기억을 공유하며 상대방을 떠올리게 했다는 감정을 표현하는 말.`,
        comparison: {
          phrase: `You came to my mind!`,
          nuanceDiff:
            `'You came to my mind!'는 좀 더 순간적인 생각을 강조하지만, 'I thought of you!'는 보다 깊은 감정과 연결된 느낌을 줘요.`,
        },
        exampleEn: `When I came across that hilarious video, I couldn't help but say, 'I thought of you!'`,
        exampleKo: `그 웃긴 영상을 보자마자 '너를 생각했어!'라고 말할 수밖에 없었어요.`,
      },
      {
        phrase: `Tag someone`,
        meaningKo: `누군가를 태그하다`,
        nuance: `소셜 미디어에서 친구를 언급하거나 연결짓는 행위를 강조하는 표현.`,
        comparison: {
          phrase: `Mention someone`,
          nuanceDiff:
            `'Mention someone'은 단순히 이름을 언급하는 것에 집중하지만, 'Tag someone'은 소셜 미디어에서의 상호작용을 강조해요.`,
        },
        exampleEn: `When you see a funny post, don't forget to tag someone who would appreciate it!`,
        exampleKo: `재미있는 게시물을 보게 되면, 그것을 좋아할 사람을 태그하는 것을 잊지 마세요!`,
      },
    ],
    status: "published",
  },
  {
    id: "culture-lifestyle-jomo",
    title: `약속 대신 집을 선택하는 게 승리처럼 느껴지는 이유`,
    englishTitle: `Why Staying In Feels Like Winning`,
    category: "라이프스타일",
    summary: `JOMO를 즐기는 현대인들의 집콕 문화에 대해 이야기해요.`,
    englishSummary: `Picture this: it's a Saturday night, and your friends are gearing up for a big party. As the invitations roll in, you find yourself scrolling through your favorite streaming service, ready to binge-watch that new series. Sound familiar? This feeling, known as JOMO (Joy of Missing Out), is sweeping through our culture. Unlike FOMO (Fear of Missing Out), which makes us anxious about what we might miss, JOMO embraces the joy of staying in. It’s about relishing the cozy comfort of your couch, wearing your comfiest pajamas, and enjoying your own company. Sure, you might ponder if you should go out, but then you remember the bliss of a quiet night, free from social obligations. It's a victory, really — choosing self-care over the pressure to socialize. In a world that often pushes us to be constantly outgoing, finding joy in staying in is truly winning.`,
    koreanSummary: `상상해보세요: 토요일 밤, 친구들이 큰 파티를 준비하고 있어요. 초대장이 쏟아지는 그 순간, 당신은 좋아하는 스트리밍 서비스에서 새로운 시리즈를 몰아보려고 스크롤하고 있습니다. 익숙하죠? 이런 기분이 바로 JOMO(놓치는 것에 대한 즐거움)입니다. FOMO(놓치는 것에 대한 두려움)가 놓칠까 봐 불안하게 만든다면, JOMO는 집에 머무는 즐거움을 만끽하게 해줍니다. 소파의 아늑한 편안함을 느끼고, 가장 편한 잠옷을 입고, 혼자만의 시간을 즐기는 거죠. 나가야 할지 고민할 수 있지만, 조용한 밤의 행복을 떠올리면 결국 자기 돌봄을 선택하게 됩니다. 사회적 의무에서 벗어나 JOMO를 즐기는 것은 진정한 승리입니다.`,
    sources: [],
    expressions: [
      {
        phrase: `Joy of Missing Out`,
        meaningKo: `놓치는 것의 기쁨`,
        nuance: `사회적 압박 없이 혼자 있는 것을 즐기는 마음을 나타냄`,
        comparison: {
          phrase: `Fear of Missing Out`,
          nuanceDiff:
            `FOMO는 놓치는 것에 대한 불안, JOMO는 놓치는 것을 오히려 즐기는 마음`,
        },
        exampleEn: `Many people are starting to embrace the Joy of Missing Out.`,
        exampleKo: `많은 사람들이 놓치는 것의 기쁨을 받아들이기 시작하고 있어요.`,
      },
      {
        phrase: `cozy comfort`,
        meaningKo: `아늑한 편안함`,
        nuance: `안락하고 따뜻한 느낌을 강조`,
        comparison: {
          phrase: `homey feel`,
          nuanceDiff:
            `cozy comfort는 더 따뜻하고 아늑한 느낌을 주는 반면, homey feel은 단순히 집 같은 편안함을 의미함`,
        },
        exampleEn: `There's nothing like the cozy comfort of a warm blanket on a cold night.`,
        exampleKo: `추운 밤에 따뜻한 담요의 아늑한 편안함보다 좋은 것은 없어요.`,
      },
      {
        phrase: `social obligations`,
        meaningKo: `사회적 의무`,
        nuance: `타인과의 관계에서 느끼는 의무감이나 부담을 나타냄`,
        comparison: {
          phrase: `social commitments`,
          nuanceDiff:
            `social obligations는 더 강한 의무감을 의미하며, social commitments는 약간의 선택적 성향을 내포할 수 있음`,
        },
        exampleEn: `Sometimes, we need to take a break from our social obligations.`,
        exampleKo: `때때로 우리는 사회적 의무에서 벗어날 필요가 있어요.`,
      },
    ],
    status: "published",
  },
  {
    id: "culture-tech-cozy-games",
    title: `경쟁하지 않아도 괜찮아, 코지 게임의 매력`,
    englishTitle: `The Appeal of Cozy Games: Playing Without Pressure`,
    category: "테크·게임",
    summary: `승패 없이 편안하게 즐길 수 있는 코지 게임의 매력.`,
    englishSummary: `Have you ever found yourself sinking into a game where the stakes are low and the vibes are just right? Cozy games are all about that: no pressure, no competition, just pure enjoyment. Picture yourself tending to a virtual garden, crafting handmade items, or exploring a charming village filled with friendly characters. These games invite you to take your time, savor the experience, and escape from the hustle and bustle of everyday life. You don’t have to worry about leveling up or beating a high score; instead, you can relax and let your creativity flow. Whether it’s building a cozy home or helping adorable animals, cozy games provide a soothing retreat that feels like a warm hug after a long day. It's this sense of comfort and simplicity that draws players in, making them a beloved escape in the gaming world.`,
    koreanSummary: `낮은 경쟁률과 편안한 분위기를 가진 게임에 깊이 빠져본 적이 있나요? 코지 게임은 그런 게임입니다. 승부도 없고, 경쟁도 없는 순수한 즐거움이 가득하죠. 가상의 정원을 가꾸거나, 수공예 아이템을 만들거나, 친근한 캐릭터가 가득한 작은 마을을 탐험하는 모습을 상상해 보세요. 이러한 게임은 시간을 충분히 갖고, 경험을 음미하며, 일상의 복잡함에서 벗어날 수 있도록 초대합니다. 레벨을 올리거나 높은 점수를 따야 할 걱정은 없고, 대신 편안하게 창의력을 발휘할 수 있습니다. 아늑한 집을 짓거나 귀여운 동물들을 도와주는 것처럼 코지 게임은 긴 하루를 보낸 후 따뜻한 포옹처럼 느껴지는 편안한 피난처를 제공합니다. 이러한 편안함과 단순함이 플레이어들을 끌어들이고, 게임 세계에서 사랑받는 이유입니다.`,
    sources: [],
    expressions: [
      {
        phrase: `just right`,
        meaningKo: `딱 맞는`,
        nuance: `어떤 상황이나 조건이 완벽하게 맞아떨어지는 느낌을 전달합니다.`,
        comparison: {
          phrase: `perfectly suited`,
          nuanceDiff:
            `perfectly suited는 적합성에 초점을 맞추지만, just right는 더 자연스럽고 편안한 느낌을 줍니다.`,
        },
        exampleEn: `The weather was just right for a picnic.`,
        exampleKo: `소풍 가기에 날씨가 딱 맞았어요.`,
      },
      {
        phrase: `take your time`,
        meaningKo: `천천히 해도 괜찮다`,
        nuance: `급하지 않으니 여유를 가지고 행동하라는 의미를 전달합니다.`,
        comparison: {
          phrase: `rush through`,
          nuanceDiff:
            `rush through는 서두르라는 의미로, 여유를 가지라는 take your time과 정반대의 뉘앙스를 가집니다.`,
        },
        exampleEn: `You can take your time to finish the project.`,
        exampleKo: `프로젝트를 끝내는 데 천천히 해도 괜찮아.`,
      },
      {
        phrase: `hustle and bustle`,
        meaningKo: `분주함, 북적거림`,
        nuance: `바쁘고 정신없이 돌아가는 일상의 소란스러움을 가리키는 표현이에요.`,
        comparison: {
          phrase: `busy schedule`,
          nuanceDiff:
            `busy schedule은 개인의 바쁜 일정 자체를 가리키고, hustle and bustle은 주변 환경 전체가 분주하고 소란스러운 분위기를 묘사해요.`,
        },
        exampleEn: `Cozy games let you escape the hustle and bustle of everyday life for a while.`,
        exampleKo: `코지 게임은 잠시나마 일상의 분주함에서 벗어나게 해줘요.`,
      },
    ],
    status: "published",
  },
  {
    id: "culture-sports-fantasy-league",
    title: `친구들과의 판타지 스포츠, 우정 섞인 경쟁`,
    englishTitle: `The Friendly Rivalry of Fantasy Sports Leagues`,
    category: "스포츠",
    summary: `판타지 스포츠 리그에서 친구들과의 경쟁은 즐거운 경험이에요.`,
    englishSummary: `Picture this: it's a Sunday afternoon, and your group chat is buzzing with excitement. You and your friends have created fantasy sports teams, and the stakes are high. Each touchdown or home run sends notifications flying, and suddenly, it's not just a game — it's bragging rights on the line! The thrill of watching your players perform brings everyone together, even as you engage in some friendly trash talk. 'Did you see that catch?' or 'What a game!' becomes the norm. As the season unfolds, you find yourself cheering for your friends' players too, sharing laughs and creating lasting memories. It’s a rollercoaster ride, especially when it comes down to the wire in the final week. In the end, it's not just about winning; it’s the camaraderie and the joy of sharing the experience that makes fantasy sports leagues so special.`,
    koreanSummary: `상상해보세요: 일요일 오후, 친구들 사이에서 흥분이 가득한 그룹 채팅이 울려 퍼집니다. 여러분은 판타지 스포츠 팀을 꾸렸고, 이제 승부는 한층 치열해졌죠. 각 터치다운이나 홈런이 알림을 날리며, 갑자기 이건 단순한 게임이 아니에요 — 자존심을 걸고 싸우는 거죠! 선수들이 활약하는 모습을 지켜보는 스릴이 모두를 하나로 묶어주고, 서로 농담을 주고받는 것도 잊지 않아요. '그 캐치 보셨어요?' 혹은 '정말 멋진 경기였어요!' 같은 말들이 난무하죠. 시즌이 진행될수록 친구들의 선수들도 응원하게 되고, 웃음을 나누며 잊지 못할 추억을 만들게 됩니다. 마지막 주에 승부가 엎치락뒤치락할 때의 긴장감은 정말 짜릿하죠. 결국, 이긴다는 것만이 중요한 게 아니라 함께 경험을 나누는 우정이 판타지 스포츠 리그의 특별함을 만들어준답니다.`,
    sources: [],
    expressions: [
      {
        phrase: `what a game!`,
        meaningKo: `정말 멋진 경기!`,
        nuance: `스포츠 경기의 흥미롭고 놀라운 순간을 강조하는 감탄사로, 감정이 고조된 상황에서 사용돼요.`,
        comparison: {
          phrase: `what a match!`,
          nuanceDiff:
            `'what a match!'는 경기를 좀 더 공식적으로 칭찬하는 표현으로, 보통 경쟁의 수준이나 기술적인 면을 강조할 때 사용돼요.`,
        },
        exampleEn: `After watching the final minutes of the match, I turned to my friend and said, 'What a game!'`,
        exampleKo: `경기 마지막 몇 분을 보고 난 후, 나는 친구에게 '정말 멋진 경기였어!'라고 말했어요.`,
      },
      {
        phrase: `down to the wire`,
        meaningKo: `마지막 순간까지`,
        nuance: `경기의 결과가 마지막 순간까지 결정되지 않는 긴장감 있는 상황을 묘사할 때 사용돼요.`,
        comparison: {
          phrase: `close call`,
          nuanceDiff:
            `'close call'은 결과가 아슬아슬하게 결정된 상황을 나타내지만, 'down to the wire'는 경기가 끝날 때까지 긴장감이 유지되는 상황을 강조해요.`,
        },
        exampleEn: `The championship game was so intense, going down to the wire with both teams tied.`,
        exampleKo: `챔피언십 경기는 너무 치열해서 양 팀이 동점인 채로 마지막 순간까지 갔어요.`,
      },
      {
        phrase: `bragging rights`,
        meaningKo: `자랑할 권리`,
        nuance: `경기에서 이긴 사람이나 팀이 다른 사람에게 자랑할 수 있는 권리를 의미하며, 경쟁의 재미를 더하는 요소로 사용돼요.`,
        comparison: {
          phrase: `victory lap`,
          nuanceDiff:
            `'victory lap'는 승리 후의 기분 좋은 순간이나 이를 즐기는 과정을 나타내는 표현으로, 자랑할 권리보다 더 행동적인 측면에 초점을 맞춰요.`,
        },
        exampleEn: `Winning the league gives you bragging rights over your friends for the whole year.`,
        exampleKo: `리그에서 이기는 것은 친구들 앞에서 1년 내내 자랑할 권리를 줘요.`,
      },
    ],
    status: "published",
  },
  {
    id: "culture-global-digital-nomad",
    title: `일하는 곳과 사는 곳이 분리되는 시대`,
    englishTitle: `Why 'Where You Work' No Longer Means 'Where You Live'`,
    category: "라이프스타일", // 구 "글로벌 이슈"(문화) — 카테고리 통합으로 라이프스타일에 편입
    summary: `디지털 노마드 시대, 일과 삶의 경계가 허물어지는 이야기`,
    englishSummary: `Picture this: It’s 7 AM and you’re sipping your coffee in a quaint café in Lisbon, while the sun rises over the cobblestone streets. You open your laptop, logging into a video call with your team back home, adjusting for the time difference. As they wrap up their day, you’re just getting started, ready to tackle your tasks with the vibrant city as your backdrop. This is the life of a digital nomad, where 'where you work' is not confined to a cubicle but can be anywhere with Wi-Fi. After the meeting, you stroll through the streets, with your laptop in your bag, ready to set up shop at another café, blending work and exploration seamlessly. It’s not just about work anymore; it’s about crafting a lifestyle that balances productivity and adventure.`,
    koreanSummary: `상상해보세요: 아침 7시, 리스본의 아담한 카페에서 커피를 홀짝이며, 해가 떠오르는 조약돌 거리를 바라보고 있어요. 노트북을 열고 고국 팀과 화상회의를 시작하는데, 시차를 고려해야 합니다. 팀원들이 하루를 마무리할 때, 당신은 이제 막 일을 시작하며 활기찬 도시 풍경을 배경으로 업무에 몰두할 준비가 되어 있죠. 이게 바로 디지털 노마드의 삶입니다. '일하는 곳'이 사무실에 한정되지 않고, Wi-Fi만 있으면 어디서든 가능하니까요. 회의가 끝난 후, 노트북을 가방에 챙겨 다른 카페로 이동하며 일과 탐험을 자연스럽게 조화시키는 거죠. 이제 일은 단순한 일이 아니라, 생산성과 모험이 어우러진 라이프스타일을 만들어가는 과정입니다.`,
    sources: [],
    expressions: [
      {
        phrase: `set up shop`,
        meaningKo: `가게를 차리다, 사업을 시작하다`,
        nuance: `어떤 장소에 자리를 잡고 활동을 시작하는 느낌을 줘요.`,
        comparison: {
          phrase: `establish a presence`,
          nuanceDiff:
            `‘set up shop’는 특정 장소에서 활동을 시작하는 느낌이 강한 반면, ‘establish a presence’는 단순히 존재를 알리는 행위를 더 강조해요.`,
        },
        exampleEn: `I decided to set up shop at the park to enjoy the fresh air while working.`,
        exampleKo: `신선한 공기를 즐기기 위해 공원에 자리를 잡기로 했어요.`,
      },
      {
        phrase: `time difference`,
        meaningKo: `시차`,
        nuance: `두 지역 간의 시간 차이를 나타내며, 주로 국제적인 상황에서 사용돼요.`,
        comparison: {
          phrase: `timezone`,
          nuanceDiff:
            `‘time difference’는 두 지역 간의 시차를 강조하지만, ‘timezone’은 특정 지역의 시간대를 지칭해요.`,
        },
        exampleEn: `Adjusting for the time difference can be challenging for remote workers.`,
        exampleKo: `시차에 맞춰 조정하는 것은 원격 근무자에게 어려울 수 있어요.`,
      },
      {
        phrase: `blend work and exploration`,
        meaningKo: `일과 탐험을 혼합하다`,
        nuance: `일상적인 업무와 새로운 경험을 조화롭게 연결하는 느낌을 줘요.`,
        comparison: {
          phrase: `mix business and pleasure`,
          nuanceDiff:
            `‘blend work and exploration’은 일과 새로운 경험을 조화롭게 연결하는 데 초점을 맞추고, ‘mix business and pleasure’는 일과 여가를 섞는 일반적인 개념을 강조해요.`,
        },
        exampleEn: `Many travelers strive to blend work and exploration while on the road.`,
        exampleKo: `많은 여행자들이 여행 중에 일과 탐험을 혼합하려고 노력해요.`,
      },
    ],
    status: "published",
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// "이번 주 월요일 0시(KST)"의 실제(true) UTC ms. 같은 "+9h 보정 후 UTC
// getter로 읽기" 트릭을 src/app/page.tsx(toKstWallClock/startOfKstDayMs)
// 와 동일하게 쓰되, 그 결과(보정된 "가짜 UTC" ms)를 다시 -9h 해서 진짜
// UTC ms로 되돌린다 — 이 함수가 만드는 타임스탬프는 실제로 저장되는
// generatedAt(ISO, true UTC)이어야 하기 때문.
function kstThisMondayStartRealUtcMs(now: Date): number {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const kstMidnightFakeUtcMs = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const todayStartRealUtcMs = kstMidnightFakeUtcMs - KST_OFFSET_MS;
  const daysSinceMonday = (kst.getUTCDay() + 6) % 7; // 0=월 .. 6=일
  return todayStartRealUtcMs - daysSinceMonday * DAY_MS;
}

// CULTURE_EDITORIAL_SEEDS의 인덱스별 요일(0=월, 1=화, 2=수) — 14개(카테고리당
// 2개: 0~6은 기존 7개, 7~13은 같은 카테고리 순서로 이어지는 신규 7개)를
// 월5·화5·수4로 고정 배치한다. 같은 카테고리의 두 콘텐츠는 항상 서로
// 다른 요일에 오도록 짝지어 뒀다 — 예: 음악(기존, idx0)은 월, 음악(신규,
// idx7)은 수.
//
// 이 배열은 "요일" 자체가 아니라 배열 위치(인덱스)로만 동작해서, 아래
// 카테고리 이름은 전부 배치 당시(통합 전) 이름을 남겨둔 주석일 뿐이다 —
// "글로벌 이슈"로 표시된 idx6/idx13 두 자리는 카테고리 통합 이후 실제
// seed.category 값이 "라이프스타일"로 바뀌었지만, 배치 로직 자체는
// 영향받지 않는다(index 기반이라 category 필드를 읽지 않음).
//
//   월(5): 음악·영화·시리즈·밈·인터넷(기존 3개) + 라이프스타일·테크·게임(신규 2개)
//   화(5): 라이프스타일·테크·게임(기존 2개) + 밈·인터넷·스포츠·글로벌 이슈(신규 3개)
//   수(4): 스포츠·글로벌 이슈(기존 2개) + 음악·영화·시리즈(신규 2개)
const SEED_DAY_INDEX: number[] = [
  0, 0, 0, // 음악-기존, 영화·시리즈-기존, 밈·인터넷-기존 → 월
  1, 1, //    라이프스타일-기존, 테크·게임-기존 → 화
  2, 2, //    스포츠-기존, 글로벌 이슈-기존 → 수
  2, 2, //    음악-신규, 영화·시리즈-신규 → 수
  1, //       밈·인터넷-신규 → 화
  0, 0, //    라이프스타일-신규, 테크·게임-신규 → 월
  1, 1, //    스포츠-신규, 글로벌 이슈-신규 → 화
];

// 고정 날짜가 아니라 매 요청마다 `now` 기준 "이번 주 월요일"을 새로
// 계산하므로, 몇 주가 지나도 요일 배치가 과거로 밀려나 사라지지 않는다.
//
// 전부 월/화/수에만 배치하므로(요청된 5/5/4 합계가 정확히 14), 퀴즈
// 피커(src/app/quiz/page.tsx의 isGeneratedToday, "오늘 생성"만 보여줌)는
// 오늘이 월~수가 아닌 날(목~일)엔 고를 거리가 하나도 없다 — 그 경우
// QuizEntryClient가 이미 가지고 있는 "오늘 생성된 트렌드가 아직 없어요"
// 빈 화면 문구가 그대로 뜬다(화면이 깨지지 않음, 별도 처리 불필요).
function resolveDayAssignments(now: Date): number[] {
  const mondayStartMs = kstThisMondayStartRealUtcMs(now);
  const dayStartMsByIndex = [mondayStartMs, mondayStartMs + DAY_MS, mondayStartMs + 2 * DAY_MS];
  return SEED_DAY_INDEX.map((dayIndex) => dayStartMsByIndex[dayIndex]);
}

// MOCK_MODE 하에서 getHomeTrends()/getTrendDetail()가 매 요청마다 호출한다.
// generatedAt/reviewedAt을 고정 날짜로 박아두지 않고 호출 시점의 `now`
// 기준으로 매번 새로 계산하므로, 시간이 지나도 월/화/수 배치 자체는
// 계속 유지된다 (콘텐츠가 과거로 밀려나 사라지지 않음). 다만 이 날짜는
// 실제 발행 시각이 아니라 샘플 타임스탬프다 — 실제 발행 날짜로 오인하지
// 않도록 홈/상세 페이지의 샘플 모드 안내 배너(MOCK_MODE일 때만 노출)가
// 이 점을 명시한다.
export function getCultureEditorialTrends(now: Date = new Date()): Trend[] {
  const dayMsPerSeed = resolveDayAssignments(now);
  return CULTURE_EDITORIAL_SEEDS.map((seed, index) => {
    // 09:00 KST(+ 인덱스별 1분씩) — 실제 데이터 쪽의 "오전 9시 공개"
    // 감각과 맞추고, 같은 날 항목끼리 생성 시각이 겹치지 않게 한다.
    const timestamp = new Date(
      dayMsPerSeed[index] + 9 * 60 * 60 * 1000 + index * 60 * 1000,
    ).toISOString();
    return {
      ...seed,
      quiz: buildQuizFromExpressions(seed.expressions),
      generatedAt: timestamp,
      reviewedAt: timestamp,
    };
  });
}
