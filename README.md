# SKHY Skills

SK하이닉스 AI 해커톤의 과제 이해부터 설계·구현·검증까지 연결하는 개인 제작 스킬 네 가지다. IDE의 기본 도구로 실행하며 제공 과제의 지침·구조·제출 경로와 실제 운영 규정을 우선한다.

## 스킬과 흐름

| 순서 | 스킬 | 책임 |
| --- | --- | --- |
| 1 | [task-discovery](skills/task-discovery/SKILL.md) | 요구사항과 필요한 반도체·SK하이닉스 업무 맥락을 조사해 과제를 이해한다. |
| 2 | [solution-design](skills/solution-design/SKILL.md) | 업무 순서대로 해결 방향을 합의해 설계서를 쓰고 개발 정책을 프로젝트 지침에 반영한다. |
| 3 | [plan-execution](skills/plan-execution/SKILL.md) | 구현 관점 계획을 검토·승인받고 구현한 뒤 실제 결과를 검증한다. |
| 필요 시 | [delegate-work](skills/delegate-work/SKILL.md) | 독립 작업에 적합한 위임 방식·모델·맥락·담당 범위를 정한다. |

1. **과제 분석과 현업 확인.** 과제 원문과 제공 자료로 업무 흐름과 판단 기준을 분석해 `.skhy/discovery.md`에 저장한다. 자료만으로 결정할 수 없는 업무·검증 기준은 문서 끝부분의 **확인이 필요한 부분**에 번호로 정리한다. 사용자가 질문을 현업 챗봇에 직접 보내고 답변을 전달하면 같은 번호에 답과 적용 범위를 기록하고 관련 본문도 고친다. 핵심 질문이 남으면 그 문서에서 이어가고, 해소되면 설계로 넘긴다. [분석·질문 형식](skills/task-discovery/references/discovery-output.md)
2. **업무 순서에 따른 설계.** 담당자가 어디서 시작해 어떤 정보를 확인하고 어떤 결과를 누구에게 넘기는지 먼저 짚는다. 각 단계에서 실제로 열려 있는 선택을 하나씩 합의하고, 최종 `.skhy/design.md`도 그 순서로 작성한다. [설계 대화와 산출물](skills/solution-design/references/design-dialogue.md)
3. **개발 정책 반영.** 설계에서 합의한 스택·폴더별 책임·코드 및 Git 규칙·검증 방법을 대상 프로젝트 루트 `AGENTS.md`에 반영한다. 기존 지침을 보존하고 충돌하는 결정만 확인한다. [개발 정책 반영](skills/solution-design/references/development-policy.md)
4. **실행 계획과 개발.** 확정 설계와 반영된 정책을 읽어 작업별 실행 계획을 검토한다. 사용자가 구체적인 계획을 승인하면 구현과 검증을 진행한다.

분석·설계 요청에는 해당 단계의 문서 작성이 포함된다. 기존 산출물은 유효한 부분부터 재사용하고 핵심 질문에 대한 답변이나 정책 반영만 남았으면 거기서 재개한다. 일반 질의·검토·검증만 요청한 경우와 파일 작성 금지는 [승인 기준](skills/plan-execution/references/approval.md)을 따른다.

plan-execution은 가벼운 진입점이며 아래 중 **현재 단계 지침만** 읽는다.

1. [계획 검토](skills/plan-execution/references/planning.md): 설계를 개발 관점에서 해석해 기능별 배치·모듈 연결·순서·위임·검증 기준을 제시한다. **이 구체적인 실행 계획에 사용자가 승인해야 구현한다.** 해결 방향에 대한 동의만으로 구현 승인까지 추정하지 않는다.
2. [구현](skills/plan-execution/references/implementation.md): 승인된 계획과 필요한 설계·코드만 참조해 구현·테스트·작업별 커밋을 진행한다. 승인 범위의 일상 수정은 재승인 없이 수행한다.
3. [검증](skills/plan-execution/references/verification.md): 해결 설계, 승인된 실행 계획, 실제 구현과 실행 결과를 대조한다. 수정 권한까지 있는 결함은 수정 후 관련 검증을 반복하고, 중요한 방향 변경은 해당 설계·계획 검토로 돌아간다.

기존 과제의 검증만 요청하면 plan-execution의 검증 단계로 진입한다. 필요한 자료가 없으면 없는 상태를 밝히고 요청 범위에 맞게 확인하며, 승인이나 실행 증거를 만들어내지 않는다.

## 맥락과 기록

각 스킬은 이전 단계의 최신 산출물과 필요한 원본을 이어받는다. 새 세션에서도 같은 작업을 재개할 수 있도록 승인한 범위와 다음에 할 일을 기록한다.

```text
project/
  AGENTS.md                      # 설계 후 반영한 프로젝트 개발 정책
  .agents/skills/                 # 설치된 네 스킬과 필요한 참조
  .skhy/
    discovery.md                 # 프로젝트 공통: 문제 분석·용어·요구·근거
    design.md                    # 프로젝트 공통: 합의한 해결 방향·구조·정책
    tasks/<작업-id>/             # plan-execution의 개별 구현 작업
      execution-plan.md          # 이번 작업의 구현 계획·기준 설계·실제 승인
      implementation.md          # 실제 변경·관련 커밋·남은 일
      verification.md            # 실제 확인 결과·미검증·한계
      evidence/                  # 필요한 실행 로그·diff·화면 근거
```

분석과 설계는 프로젝트 공통 문서다. 작업 ID는 `plan-execution`에서 개별 실행 작업을 시작할 때 만들고, 같은 작업을 재개할 때는 기존 ID를 사용한다. 각 기록은 해당 단계에 도달했을 때 작성한다. 검증에는 공통 설계와 해당 작업의 승인 계획·실제 결과를 사용한다.

계획 파일은 최신 확정본 하나를 유지하고 이전 승인본은 로컬 Git으로 추적한다. 기록에 필요한 시각·담당·승인 근거·검사 결과와 실행 증거 보관 방법은 [공통 기록·인계 기준](skills/plan-execution/references/records.md)을 따른다.

## 설치

설치할 프로젝트 폴더에서 다음 명령으로 [공개 저장소](https://github.com/g-hyeong/skhyskills)의 소스를 실행한다.

```sh
npx --yes --package=github:g-hyeong/skhyskills skhyskills --root "$PWD"
```

아래 명령은 이미 내려받은 로컬 소스에서 설치할 때 사용한다.

설치기는 Node.js 22 이상, 외부 의존성 없이 한 번 실행하고 종료한다.

```sh
node /path/to/skhyskills/bin/install.mjs --root /absolute/path/to/project
```

설치기는 대상 프로젝트 `.agents/skills/`에 네 폴더만 복사한다. 루트 `AGENTS.md`는 이후 실제 과제의 설계를 마쳤을 때 개발 정책 반영 단계에서 작성한다. 직접 복사하려면 네 폴더를 함께 두어 상대 참조를 보존한다. IDE에서 검색되지 않으면 `.agents/skills/task-discovery/SKILL.md`를 읽게 하거나 호스트의 재탐색 절차를 따른다. 실제 시험 IDE의 자동 검색·위임 모델 선택은 별도 현장 확인 대상이다.

대상에 있는 같은 이름의 스킬 내용이 다르면 기본 설치는 변경 전에 중단한다. 차이를 검토하고 해당 설치본을 교체할 때만 다음 명령을 실행한다.

```sh
node /path/to/skhyskills/bin/install.mjs --root /absolute/path/to/project --replace-existing
```

교체할 설치본은 `.skhy/backups/<id>/`에 백업한다. 다른 이름의 스킬은 그대로 두고, 동일 프로젝트에는 설치기를 한 번에 하나만 실행한다.

## 개발 검증

```sh
npm run check
npm test
npm pack --dry-run
```

스킬 메타데이터와 상대 참조, 신규·반복 설치, 충돌 시 중단과 명시적 교체·백업, 경로 보호와 실패 시 복구를 검사한다. 로컬 패키지를 별도 프로젝트에 설치해 동작도 확인한다. 이러한 검사는 실제 시험 IDE의 자동 선택이나 모델의 모든 판단을 보장하지 않는다.
