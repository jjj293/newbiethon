// preferences 입력 화면(구글폼 스타일) 설정.
// O -> true, X -> false 로 저장.

export const preferenceQuestions = [
  {
    key: 'guestAllowed',
    question: '룸메이트의 외부인 방문을 허용하시나요?',
  },
  {
    key: 'petAllowed',
    question: '룸메이트의 반려동물을 허용하시나요?',
  },
]

// 예산은 보증금/월세를 따로 입력받지 않고 고정 조합 중에서 다중 선택한다.
// 단위: 만원
export const budgetOptions = [
  { deposit: 100, monthlyRent: 30 },
  { deposit: 300, monthlyRent: 40 },
  { deposit: 500, monthlyRent: 50 },
]
