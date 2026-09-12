// 생활 시뮬레이션 문제 초안.
// 순서 고정: noise -> cleanliness -> sleep -> privacy -> conflict -> social (항목당 2문제, 총 12문제)
// 각 문제는 lifestyleKey로 어떤 lifestyle 항목에 해당하는지만 표시하고,
// 최종 noise/cleanliness/... 점수 합산은 여기서 하지 않는다. (나중에 별도 로직에서 구현)
// 선택지 점수는 항상 A=2, B=4, C=6, D=8로 고정.

export const lifestyleQuestions = [
  // noise
  {
    id: 'noise_1',
    lifestyleKey: 'noise',
    title: '🎮 룸메이트의 전화 통화',
    time: '🌙 PM 7:07',
    situation: '일정을 마치고 돌아왔다.\n침대에 조금 쉬려는데,\n룸메이트가 큰 목소리로 전화 통화를 시작했다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '백색소음처럼 느껴진다. 전혀 신경 쓰이지 않는다.', score: 2 },
      { label: 'B', text: '조금 불편지만, 길어지지 않으면 굳이 신경 쓰지 않는다.', score: 4 },
      { label: 'C', text: '일단 참았다가 나중 이야기한다.', score: 6 },
      { label: 'D', text: '"미안한데 통화는 밖에서 해줄 수 있을까?"라고 즉시 정중하게 요청한다.', score: 8 },
    ],
  },
  {
    id: 'noise_2',
    lifestyleKey: 'noise',
    title: '🎮 이어폰 없는 게임',
    time: '🌆 PM 11:20',
    situation: '거실에서 공부를 하고 있는데,\n룸메이트가 이어폰 없이 게임 소리를 크게 틀어놓았다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '타건음을 들으니 오히려 나도 집중이 잘 된다.', score: 2 },
      { label: 'B', text: '소리가 들리긴 하지만 금방 적응해서 내 할 일에 집중한다.', score: 4 },
      { label: 'C', text: '꽤 거슬려서 귀마개를 찾거나 자꾸 룸메이트 쪽을 쳐다보게 된다.', score: 6 },
      { label: 'D', text: '도저히 집중할 수 없어 무소음 마우스/키보드 사용을 강하게 요한다.', score: 8 },
    ],
  },

  // cleanliness
  {
    id: 'cleanliness_1',
    lifestyleKey: 'cleanliness',
    title: '🎮 쌓여가는 설거지',
    time: '🍽️ PM 8:00',
    situation: '퇴근 후 집에 왔더니,\n싱크대에 룸메이트가 사용한 그릇이 3일째 쌓여 있다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '남 일이 아니다. 내 그릇도 같이 쌓여 있다.', score: 2 },
      { label: 'B', text: '조금 불편하므로 며칠 더 지켜보고도 안 치우면 말한다.', score: 4 },
      { label: 'C', text: '즉시 룸메이트에게 치워달라고 이야기한다.', score: 6 },
      { label: 'D', text: '너무 싫다. 바로 청소 당번을 정하자고 제안하고 규칙을 정한다.', score: 8 },
    ],
  },
  {
    id: 'cleanliness_2',
    lifestyleKey: 'cleanliness',
    title: '🎮 먼지 쌓인 거실',
    time: '🧹 PM 3:00',
    situation: '방바닥에 머리카락과 먼지가 보이기 시작한다.',
    question: '당신의 청소 패턴은?',
    choices: [
      { label: 'A', text: '바닥이 전체적으로 지저분해져서 발에 밟히는 게 많을 때쯤 날 잡고 청소한다.', score: 2 },
      { label: 'B', text: '일주일에 한 번 정도 주말에 몰아서 빗자루질이나 청소기를 돌린다.', score: 4 },
      { label: 'C', text: '눈에 띌 때마다 2~3일에 한 번씩은 가볍게라도 치우는 편이다.', score: 6 },
      { label: 'D', text: '매일 돌돌이나 청소기를 사용해 먼지 하나 없이 유지해야 직성이 풀린다.', score: 8 },
    ],
  },

  // sleep
  {
    id: 'sleep_1',
    lifestyleKey: 'sleep',
    title: '🎮 이른 아침의 알람',
    time: '🌅 AM 6:30',
    situation: '이른 새벽 시간, 룸메이트의 알람 소리가 들린다.',
    question: '이 상황에서 당신의 평소 생활 패턴은?',
    choices: [
      { label: 'A', text: '어차피 그때 막 잠들었거나 아직 깨어있을 시간이다.', score: 2 },
      { label: 'B', text: '늦게 자는 편이라 아침에 깨면 피곤하지만, 그냥 이불 덮고 금방 다시 잠든다.', score: 4 },
      { label: 'C', text: '정해진 시간에 자고 일어나는 편이라, 아침엔 조금만 조용히 해달라고 부탁한다.', score: 6 },
      { label: 'D', text: '이미 일어나있을 시간이다. 일찍 자고 규칙적으로 생활한다.', score: 8 },
    ],
  },
  {
    id: 'sleep_2',
    lifestyleKey: 'sleep',
    title: '🎮 소등 규칙 정하기',
    time: '🌌 PM 2:00',
    situation: '첫 입주 날, 룸메이트와 소등 시간을 상의하려고 한다.',
    question: '어떤 규칙을 제안할까?',
    choices: [
      { label: 'A', text: '규칙? 굳이 정해야 할까? 밤낮이 자주 바뀌는 편이라 상관없다.', score: 2 },
      { label: 'B', text: '"새벽 2시쯤 끄는 건 어때?" 새벽 시간대로 제안한다.', score: 4 },
      { label: 'C', text: '자정(12시) 즈음에는 전체 불을 끄고 각자 스탠드만 썼으면 한다.', score: 6 },
      { label: 'D', text: '밤 10시~11시 사이에는 무조건 불을 끄고 조용히 했으면 좋겠다.', score: 8 },
    ],
  },

  // privacy
  {
    id: 'privacy_1',
    lifestyleKey: 'privacy',
    title: '🎮 말없이 쓴 내 물건',
    time: '🧴 PM 7:40',
    situation: '내 샴푸랑 화장품이 줄어들어 있다.\n룸메이트가 허락 없이 쓴 것 같다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '"룸메끼리 뭐 어때." 아무렇지 않게 넘다.', score: 2 },
      { label: 'B', text: '"급했나 보네." 이해는 하지만 다음엔 미리 말해줬으면 좋겠다고 생각한다.', score: 4 },
      { label: 'C', text: '"그래도 남의 물건인데..." 기분이 상해서 반드시 먼저 허락을 구하라고 말한다.', score: 6 },
      { label: 'D', text: '"내 물건에 손대는 건 절대 금지!" 타인이 내 물건과 공간을 침범하는 것 자체를 극도로 혐오한다.', score: 8 },
    ],
  },
  {
    id: 'privacy_2',
    lifestyleKey: 'privacy',
    title: '🎮 초대하지 않은 손님',
    time: '🚪 PM 9:15',
    situation: '내가 잠시 자리를 비운 사이,\n룸메이트가 내 침대 위에 앉아 쉬고 있다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '"내 침대가 푹신하긴 하지." 같이 걸터앉아 수다를 떤다.', score: 2 },
      { label: 'B', text: '외출복만 아니면 잠깐 앉아있는 것 정도는 크게 신경 쓰지 않는다.', score: 4 },
      { label: 'C', text: '속으로는 불편해서 내 침대 말고 의자에 앉아달라고 돌려 말한다.', score: 6 },
      { label: 'D', text: '내 침대는 나만의 신성한 구역이다. 절대 침범하지 말라고 단호하게 선을 긋는다.', score: 8 },
    ],
  },

  // conflict
  {
    id: 'conflict_1',
    lifestyleKey: 'conflict',
    title: '🎮 사소한 말다툼',
    time: '💬 PM 6:00',
    situation: '사소한 일로 룸메이트와 말다툼이 생겼다.\n분위기가 조금 어색해졌다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '그냥 시간이 지나서 자연스레 풀리길 기다린다.', score: 2 },
      { label: 'B', text: '분위기를 풀기 위해 먼저 가볍게 말을 건다.', score: 4 },
      { label: 'C', text: '서로 진정된 후에 차분히 이야기를 나눈다.', score: 6 },
      { label: 'D', text: '바로 그 자리에서 오해를 확실히 풀고 넘어간다.', score: 8 },
    ],
  },
  {
    id: 'conflict_2',
    lifestyleKey: 'conflict',
    title: '🎮 어긴 약속',
    time: '📋 PM 5:00',
    situation: '이번 주 청소 당번은 룸메이트였는데,\n약속한 날이 지나도 하지 않았다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '이번엔 그냥 내가 대신 한다.', score: 2 },
      { label: 'B', text: '살짝 언급하며 다음엔 챙겨달라고 한다.', score: 4 },
      { label: 'C', text: '반복되면 그때 확실히 말하려고 지켜본다.', score: 6 },
      { label: 'D', text: '바로 약속을 지켜달라고 분명하게 말한다.', score: 8 },
    ],
  },

  // social
  {
    id: 'social_1',
    lifestyleKey: 'social',
    title: '🎮 함께하는 저녁',
    time: '🍜 PM 7:00',
    situation: '룸메이트가 오늘 저녁을 같이 먹자고 제안했다.\n딱히 계획은 없었다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '혼자 조용히 쉬고 싶다. 약속이 있다고 핑계를 댄다.', score: 2 },
      { label: 'B', text: '짧게 같이 먹고 각자 시간을 보낸다.', score: 4 },
      { label: 'C', text: '흔쾌히 함께 저녁을 먹는다.', score: 6 },
      { label: 'D', text: '저녁을 먹으며 앞으로도 자주 같이 먹자고 제안한다.', score: 8 },
    ],
  },
  {
    id: 'social_2',
    lifestyleKey: 'social',
    title: '🎮 놀러온 친구들',
    time: '🎉 PM 9:00',
    situation: '룸메이트의 친구들이 집에 놀러 왔고,\n같이 어울리자고 권유한다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '정중히 사양하고 방에서 혼자 시간을 보낸다.', score: 2 },
      { label: 'B', text: '인사만 나누고 자리를 비켜준다.', score: 4 },
      { label: 'C', text: '잠깐 함께 어울리다가 자리를 뜬다.', score: 6 },
      { label: 'D', text: '적극적으로 함께 어울린다.', score: 8 },
    ],
  },
]
