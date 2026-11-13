import { Sentence, StepGuide } from './types';

export const MOVIE_INFO = {
  titleEn: 'Zootopia',
  titleKo: '주토피아',
  releaseYear: 2016,
  director: 'Byron Howard, Rich Moore',
  screenplay: 'Jared Bush, Phil Johnston',
  production: 'Walt Disney Animation Studios',
  distribution: 'Walt Disney Studios Motion Pictures',
  sceneDescription: 'Judy helps Nick buy a Jumbo-pop at the ice cream shop (주디가 아이스크림 가게에서 닉을 도와주는 장면)',
  youtubeTitle: 'Zootopia Movie CLIP - Popsicle (2016) - Ginnifer Goodwin Movie',
  channelName: 'Rotten Tomatoes Coming Soon',
  youtubeUrl: 'https://www.youtube.com/watch?v=T13EPsejOAY',
  videoId: 'T13EPsejOAY',
  startSeconds: 88,
  endSeconds: 152,
  formattedRange: '1:28 – 2:32',
  madeBy: 'SeungUk Jeon',
};

export const ONE_LINE_CREDIT =
  'Clip: Zootopia (2016), Walt Disney Studios Motion Pictures / Walt Disney Animation Studios · via YouTube · For educational use only';

export const EDUCATIONAL_NOTICE_EN =
  'This app was made only for non-commercial English learning in the university course AI and English Language Education (ENG3088, Sungkyunkwan University). The film clip is used only to practice listening and speaking (shadowing). It is not sold, shared for profit, downloaded, or edited. All rights to the film belong to its copyright holders.';

export const EDUCATIONAL_NOTICE_KO =
  '이 앱은 성균관대학교 「인공지능과 영어교육」(ENG3088) 수업의 비영리 영어 학습 목적으로만 제작되었습니다. 영화 장면은 듣기·말하기(쉐도잉) 연습에만 사용하며, 판매·영리적 배포·다운로드·편집을 하지 않습니다. 영화의 모든 권리는 저작권자에게 있습니다.';

export const DEFAULT_SENTENCES: Sentence[] = [
  {
    id: 1,
    speaker: 'Judy',
    text: "Well, I don't want to cause you any trouble.",
    korean: '음, 곤란하게 해 드리고 싶진 않아요.',
    stress: ['trouble'],
    start: 92.0,
    end: 94.4,
  },
  {
    id: 2,
    speaker: 'Judy',
    text: 'Which is kind of a big deal.',
    korean: '그건 꽤 큰 문제거든요.',
    stress: ['big deal', 'deal', 'big'],
    start: 100.0,
    end: 102.0,
  },
  {
    id: 3,
    speaker: 'Judy',
    text: 'Of course, I could let you off with a warning.',
    korean: '물론 경고로 끝내 드릴 수도 있어요.',
    stress: ['let you off', 'warning', 'let', 'off'],
    start: 103.0,
    end: 104.5,
  },
  {
    id: 4,
    speaker: 'Nick',
    text: 'Thank you so much.',
    korean: '정말 고마워요.',
    stress: ['thank', 'much'],
    start: 120.0,
    end: 121.3,
  },
  {
    id: 5,
    speaker: 'Nick',
    text: 'Are you kidding me?',
    korean: '말도 안 돼! / 장난하는 거죠?',
    stress: ['kidding'],
    start: 124.0,
    end: 125.0,
  },
  {
    id: 6,
    speaker: 'Nick',
    text: "I don't have my wallet.",
    korean: '지갑을 안 가져왔네요.',
    stress: ['wallet'],
    start: 125.4,
    end: 127.5,
  },
  {
    id: 7,
    speaker: 'Nick',
    text: "I'd lose my head if it weren't attached to my neck.",
    korean: '목에 붙어 있지 않았으면 머리도 잃어버렸을 거예요. (정신이 없네요)',
    stress: ['lose', 'head', 'neck'],
    start: 128.0,
    end: 131.5,
  },
  {
    id: 8,
    speaker: 'Nick',
    text: "Officer, I can't thank you enough.",
    korean: '경관님, 정말 뭐라고 감사해야 할지 모르겠어요.',
    stress: ['thank', 'enough'],
    start: 148.0,
    end: 150.0,
  },
];

export const STEP_GUIDES: StepGuide[] = [
  {
    id: 1,
    name: 'Step 1 Listen',
    koreanName: '1단계: 듣기',
    instruction: 'Text is hidden. Just listen closely 2–3 times to catch the rhythm and feeling.',
    koreanInstruction: '자막 없이 소리와 리듬, 감정에 집중하며 2~3번 들어보세요.',
    defaultHideText: true,
  },
  {
    id: 2,
    name: 'Step 2 Mumble',
    koreanName: '2단계: 웅얼거리기',
    instruction: 'Text is hidden. Quietly hum or mumble along, matching the actor’s timing.',
    koreanInstruction: '자막 없이 소리를 입안으로 조용히 웅얼거리며 타이밍을 맞춰보세요.',
    defaultHideText: true,
  },
  {
    id: 3,
    name: 'Step 3 Read & Shadow',
    koreanName: '3단계: 보고 따라 말하기',
    instruction: 'Text is shown! Speak aloud together with the clip, stressing the bold words.',
    koreanInstruction: '자막을 보면서 영상과 동시에 큰 소리로 말해보세요. 굵은 글씨를 강조하세요!',
    defaultHideText: false,
  },
  {
    id: 4,
    name: 'Step 4 Shadow',
    koreanName: '4단계: 진짜 쉐도잉',
    instruction: 'Text is hidden again. Speak simultaneously with the character by ear alone!',
    koreanInstruction: '자막을 가리고 영상 속 인물과 동시에 자연스럽게 말해보세요!',
    defaultHideText: true,
  },
];
