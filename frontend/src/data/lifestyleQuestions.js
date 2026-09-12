// 생활 시뮬레이션 문제 초안.
// 순서 고정: noise -> cleanliness -> sleep -> privacy -> conflict -> social (항목당 2문제, 총 12문제)
// 각 문제는 lifestyle_key로 어떤 lifestyle 항목에 해당하는지만 표시하고,
// 최종 noise/cleanliness/... 점수 합산은 여기서 하지 않는다. (나중에 별도 로직에서 구현)
// 선택지 점수는 항상 A=2, B=4, C=6, D=8로 고정.

export const lifestyleQuestions = [
  // noise
  {
    id: 'noise_1',
    lifestyle_key: 'noise',
    title: '🎮 새벽의 샤워',
    time: '🌙 AM 1:07',
    situation: '내일 아침 9시 수업이 있다.\n침대에 누워 막 잠들려는데,\n룸메이트가 샤워를 시작했다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '그냥 신경 쓰지 않고 다시 잔다.', score: 2 },
      { label: 'B', text: '조용히 해달라고 말한다.', score: 4 },
      { label: 'C', text: '일단 참았다가 다음날 이야기한다.', score: 6 },
      { label: 'D', text: '다음부터 늦은 시간에는 미리 말해달라고 한다.', score: 8 },
    ],
  },
  {
    id: 'noise_2',
    lifestyle_key: 'noise',
    title: '🎮 이어폰 없는 게임',
    time: '🌆 PM 11:20',
    situation: '거실에서 공부를 하고 있는데,\n룸메이트가 이어폰 없이 게임 소리를 크게 틀어놓았다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '그냥 참고 내 할 일을 계속한다.', score: 2 },
      { label: 'B', text: '소리를 조금만 줄여달라고 부탁한다.', score: 4 },
      { label: 'C', text: '방으로 자리를 옮겨서 피한다.', score: 6 },
      { label: 'D', text: '이어폰을 써달라고 확실하게 요청한다.', score: 8 },
    ],
  },

  // cleanliness
  {
    id: 'cleanliness_1',
    lifestyle_key: 'cleanliness',
    title: '🎮 쌓여가는 설거지',
    time: '🍽️ PM 8:00',
    situation: '퇴근 후 집에 왔더니,\n싱크대에 룸메이트가 사용한 그릇이 3일째 쌓여 있다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '내가 그냥 치운다.', score: 2 },
      { label: 'B', text: '다음에 마주쳤을 때 가볍게 언급한다.', score: 4 },
      { label: 'C', text: '며칠 더 지켜보고도 안 치우면 말한다.', score: 6 },
      { label: 'D', text: '바로 청소 당번을 정하자고 제안한다.', score: 8 },
    ],
  },
  {
    id: 'cleanliness_2',
    lifestyle_key: 'cleanliness',
    title: '🎮 먼지 쌓인 거실',
    time: '🧹 PM 3:00',
    situation: '일주일째 공용 거실 청소가 되어 있지 않다.\n바닥에 먼지와 머리카락이 눈에 띈다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '신경 쓰지 않고 넘어간다.', score: 2 },
      { label: 'B', text: '내가 먼저 청소를 한다.', score: 4 },
      { label: 'C', text: '이번 주말에 같이 청소하자고 제안한다.', score: 6 },
      { label: 'D', text: '청소 주기를 정해서 지키자고 제안한다.', score: 8 },
    ],
  },

  // sleep
  {
    id: 'sleep_1',
    lifestyle_key: 'sleep',
    title: '🎮 이른 아침의 알람',
    time: '🌅 AM 6:30',
    situation: '아직 한참 자야 할 시간인데,\n룸메이트의 알람 소리와 인기척에 잠이 깼다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '그냥 다시 잠을 청한다.', score: 2 },
      { label: 'B', text: '이어플러그를 끼고 참는다.', score: 4 },
      { label: 'C', text: '나중에 알람 소리를 줄여달라고 말한다.', score: 6 },
      { label: 'D', text: '서로의 기상 시간을 미리 맞춰보자고 제안한다.', score: 8 },
    ],
  },
  {
    id: 'sleep_2',
    lifestyle_key: 'sleep',
    title: '🎮 꺼지지 않는 불빛',
    time: '🌌 AM 2:00',
    situation: '나는 일찍 자는 편인데,\n룸메이트는 매일 새벽까지 불을 켜두고 활동한다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '안대를 쓰고 그냥 잔다.', score: 2 },
      { label: 'B', text: '불을 좀 꺼달라고 그때그때 부탁한다.', score: 4 },
      { label: 'C', text: '참다가 며칠 뒤에 이야기를 꺼낸다.', score: 6 },
      { label: 'D', text: '각자의 생활 패턴을 미리 공유하고 조율하자고 한다.', score: 8 },
    ],
  },

  // privacy
  {
    id: 'privacy_1',
    lifestyle_key: 'privacy',
    title: '🎮 말없이 쓴 내 물건',
    time: '🧴 PM 7:40',
    situation: '내 샴푸랑 화장품이 줄어들어 있다.\n룸메이트가 허락 없이 쓴 것 같다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '그냥 넘어간다.', score: 2 },
      { label: 'B', text: '다음에 쓸 땐 미리 말해달라고 슬쩍 말한다.', score: 4 },
      { label: 'C', text: '계속되면 그때 확실히 이야기하려고 마음먹는다.', score: 6 },
      { label: 'D', text: '바로 개인 물건은 사용하지 말아달라고 말한다.', score: 8 },
    ],
  },
  {
    id: 'privacy_2',
    lifestyle_key: 'privacy',
    title: '🎮 노크 없는 방문',
    time: '🚪 PM 9:15',
    situation: '혼자 있고 싶어서 방문을 닫아두었는데,\n룸메이트가 노크 없이 불쑥 들어왔다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '별일 아니라고 넘어간다.', score: 2 },
      { label: 'B', text: '다음에 마주쳤을 때 가볍게 언급한다.', score: 4 },
      { label: 'C', text: '몇 번 더 반복되면 이야기하려고 한다.', score: 6 },
      { label: 'D', text: '노크하고 들어와 달라고 바로 요청한다.', score: 8 },
    ],
  },

  // conflict
  {
    id: 'conflict_1',
    lifestyle_key: 'conflict',
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
    lifestyle_key: 'conflict',
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
    lifestyle_key: 'social',
    title: '🎮 함께하는 저녁',
    time: '🍜 PM 7:00',
    situation: '룸메이트가 오늘 저녁을 같이 먹자고 제안했다.\n딱히 계획은 없었다.',
    question: '어떻게 할까?',
    choices: [
      { label: 'A', text: '피곤해서 다음에 먹자고 정중히 거절한다.', score: 2 },
      { label: 'B', text: '짧게 같이 먹고 각자 시간을 보낸다.', score: 4 },
      { label: 'C', text: '흔쾌히 함께 저녁을 먹는다.', score: 6 },
      { label: 'D', text: '저녁을 먹으며 앞으로도 자주 같이 먹자고 제안한다.', score: 8 },
    ],
  },
  {
    id: 'social_2',
    lifestyle_key: 'social',
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
