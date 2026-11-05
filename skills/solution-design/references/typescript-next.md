# TypeScript·Next.js 웹 후보

Next.js App Router + React + strict TypeScript는 UI와 BFF API를 한 프로세스로 운영하는 선택지다. 기존 스택이 있으면 전환 이익을 따진다. 긴 배치·독립 서버·연결 유지가 필수면 별도 서버 구조를 비교한다. 실제 채택 전 제공 버전과 공식 호환 자료를 확인한다.

```text
src/app/                    라우트·레이아웃·API 진입점
src/features/<feature>/     기능의 UI·순수 업무 로직·계약·테스트
src/server/integrations/    외부 API·생성형 AI 어댑터
src/server/repositories/    저장소 접근이 실제 필요할 때
src/components/ui/          여러 기능이 공유하는 기본 컴포넌트
src/lib/                    환경 검증·공통 오류 등 작은 공통 기능
src/styles/                 색상·간격·타이포그래피 토큰
```

- 라우트는 입력 검증 → 업무 함수 → 응답 변환만 담당한다. 순수 업무 함수가 React·HTTP·프레임워크에 의존하지 않게 한다.
- 화면 → 기능 → 서버 어댑터의 책임을 나눈다. 클라이언트에서 서버 전용 모듈을 import하지 않는다. 비밀 값은 서버에만 둔다.
- API와 UI가 공유할 DTO는 기능의 계약 파일에 둔다. 외부 응답은 런타임 검증 후 내부 타입으로 변환한다. `as`로 검증을 대체하지 않는다.
- 기능 추가는 해당 feature에 UI·계약·로직·테스트를 함께 둔다. 삭제 시 라우트·사용처·환경 값·테스트·문서의 잔여 참조를 확인한다.
- 함수는 의미 있는 책임으로 나눈다. 한 번 쓰는 코드까지 범용 계층·패턴으로 추상화하지 않는다. DB·캐시·상태 관리 라이브러리는 필요성이 확인된 경우만 도입한다.
- 예제 트리는 선택한 구조를 설명할 때만 사용한다. 복사하려고 빈 폴더를 전부 만들지 않는다. 실제 코드 변경은 승인된 실행 계획에 따른다.

공식 근거(확인 2026-10-27):
- https://nextjs.org/docs/app/getting-started/project-structure
- https://nextjs.org/docs/app/guides/backend-for-frontend
- https://nextjs.org/docs/app/getting-started/server-and-client-components

위 폴더 배치는 이 하네스의 선택안이며 Next.js가 강제하는 유일한 구조가 아니다.
