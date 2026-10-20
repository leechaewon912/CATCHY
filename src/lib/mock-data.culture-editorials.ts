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
        exampleKo: "이번 주 내내 이 노래만 반복해서 듣고 있어.",
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
        exampleKo: "이 플레이리스트 완전 내 취향이야.",
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
        exampleKo: "나는 내 기분을 설명하는 대신 플레이리스트가 대신 말하게 했다.",
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

With endless movies and series available at our fingertips, you might think we'd always be looking for something new. But sometimes, the most appealing option is a story we already know by heart.

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
        exampleKo: "이 시트콤은 긴 하루를 보낸 뒤 내가 즐겨 보는 힐링 작품이야.",
      },
      {
        phrase: "Know by heart",
        meaningKo: "완전히 외우다, 속속들이 알다",
        nuance: "너무 많이 보거나 들어서 대사나 내용을 토씨 하나까지 기억할 정도로 잘 알고 있을 때 쓰는 표현이에요.",
        comparison: {
          phrase: "remember",
          nuanceDiff: "remember는 단순히 기억한다는 뜻이고, know by heart는 완전히 암기할 정도로 깊이 익혔다는 느낌을 더해요.",
        },
        exampleEn: "I've watched this movie so many times that I know every line by heart.",
        exampleKo: "이 영화를 너무 많이 봐서 대사를 전부 외울 정도야.",
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
        exampleKo: "너무 많은 작품을 손쉽게 볼 수 있어서 하나만 고르기 어렵다.",
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
        phrase: "It's giving",
        meaningKo: "~한 느낌이 나, ~한 분위기야",
        nuance: "구체적으로 설명하기보다 전체적인 분위기나 인상을 직관적으로 전달할 때 쓰는 인터넷 표현이에요.",
        comparison: {
          phrase: "it looks like",
          nuanceDiff:
            "it looks like는 시각적으로 비슷해 보인다는 사실 위주의 표현이고, it's giving은 그 대상이 주는 전체적인 느낌이나 분위기를 더 감각적으로 전달해요.",
        },
        exampleEn: "Your outfit is giving 90s supermodel.",
        exampleKo: "네 옷차림 완전 90년대 슈퍼모델 느낌이야.",
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
        exampleKo: "그녀는 완전히 주인공 같은 존재감으로 방에 들어왔어.",
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
        exampleKo: "그녀의 옷차림은 꼭 90년대 영화에서 그대로 나온 것 같았다.",
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
        exampleKo: "주말마다 몇 시간씩 디지털 기기에서 벗어나려고 노력 중이야.",
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
        exampleKo: "가끔은 속도를 늦추고 작은 것들을 즐길 필요가 있어.",
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
        exampleKo: "그냥 재충전하려고 주말 내내 오프라인으로 지냈다.",
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
        exampleKo: "AI 도구 덕분에 내 앱 아이디어를 실제로 구현할 수 있었어.",
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
        exampleKo: "이 도구는 개인 창작자들에게 큰 변화를 가져올 수 있어.",
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
        exampleKo: "그녀는 맨 처음부터 코딩하는 대신 AI 도구로 첫 버전을 만들었다.",
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
        exampleKo: "나는 어릴 때부터 이 팀을 응원해 왔어.",
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
        exampleKo: "그녀는 홈경기를 한 번도 놓치지 않는 열성 팬이야.",
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
        exampleKo: "팬들은 최악의 시즌에도 그 팀에게 변함없이 충실했다.",
      },
    ],
    status: "published",
  },
  {
    id: "culture-global-everyday-choices",
    title: "일상 속 작은 선택이 정말 세상을 바꿀 수 있을까?",
    englishTitle: "Can Small Everyday Choices Really Make a Difference?",
    category: "글로벌 이슈",
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
        exampleKo: "작은 행동도 지역사회에 긍정적인 변화를 만들 수 있어.",
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
        exampleKo: "나는 더 지속 가능한 생활을 위해 작은 실천들을 하고 있어.",
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
        exampleKo: "나는 정말 필요하지 않은 물건을 사기 전에 항상 한 번 더 생각한다.",
      },
    ],
    status: "published",
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

// 7개 중 처음 4개(음악/영화·시리즈/밈·인터넷/라이프스타일)는 오늘,
// 나머지 3개(테크·게임/스포츠/글로벌 이슈)는 어제 생성된 것으로 둔다 —
// 하루에 여러 건이 올라오는 실제 발행 패턴처럼 보이도록 "오늘·어제" 두
// 날짜에 적절히 나눠 배치한다. 인덱스(오프셋, "며칠 전"인지)별 개수.
const GENERATED_AT_DAY_OFFSETS = [0, 0, 0, 0, 1, 1, 1];

// MOCK_MODE 하에서 getHomeTrends()/getTrendDetail()가 매 요청마다 호출한다.
// generatedAt/reviewedAt을 고정 날짜로 박아두지 않고 호출 시점의 `now`
// 기준 "오늘/어제"로 매번 새로 계산하므로, 시간이 지나도 "오늘·어제"라는
// 상대적 위치 자체는 계속 유지된다 (콘텐츠가 과거로 밀려나 사라지지
// 않음). 다만 이 날짜는 실제 발행 시각이 아니라 샘플 타임스탬프다 —
// 실제 발행 날짜로 오인하지 않도록 홈/상세 페이지의 샘플 모드 안내
// 배너(MOCK_MODE일 때만 노출)가 이 점을 명시한다.
//
// 홈 피드의 요일 필터(src/app/page.tsx)와 퀴즈 피커(src/app/quiz/page.tsx)
// 는 각각 "이번 주(월~일)"/"오늘 생성"만 보여주는 원래 로직을 그대로
// 쓴다 — 콘텐츠를 오늘·어제에만 두면 자연히 그 범위 안에 들어오므로
// (주가 시작되는 월요일 자정 직후처럼 "어제"가 지난주로 넘어가는 극히
// 짧은 예외적인 순간은 실제 데이터와 동일하게 자연스러운 동작으로 둔다),
// 더 이상 MOCK_MODE 전용 예외 처리가 필요 없다. 수~일(아직 안 지난
// 요일)은 원래 설계대로 "그날 오전 9시에 공개돼요" 안내만 보여준다.
export function getCultureEditorialTrends(now: Date = new Date()): Trend[] {
  return CULTURE_EDITORIAL_SEEDS.map((seed, index) => {
    const dayOffset = GENERATED_AT_DAY_OFFSETS[index];
    const timestamp = new Date(now.getTime() - dayOffset * DAY_MS).toISOString();
    return {
      ...seed,
      quiz: buildQuizFromExpressions(seed.expressions),
      generatedAt: timestamp,
      reviewedAt: timestamp,
    };
  });
}
