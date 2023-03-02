# 용도
트위치 한국 스트리머 상위 200명의 실시간 방송 정보를 탐지하여 제목에 특정 키워드가 있으면 녹화가 자동으로 켜지는 코드를 만들었습니다.

# 실행방법

node recorder.js

# keyword.txt

해당 텍스트 파일에 필터링할 키워드를 넣습니다, 해당 키워드가 제목에 포함된 실시간 방송을 10초마다 탐지하여 녹화를 시작합니다.

# channellist.txt

해당 텍스트 파일에는 트위치 한국인으로 등록된, 팔로우 순 상위 200명의 아이디가 있습니다. 특정 스트리머들의 특정 키워드가 포함된 방송만 녹화를 원할 시 수정

# 사용 전 기입해야 하는 내용

channelWorker.js 의 8,9번 라인에 본인의 CLIENT_ID, CLIENT_SECRET 입력.

const CLIENT_ID = ''; //클라이언트 입력 https://dev.twitch.tv/console/apps/create
const CLIENT_SECRET = ''; //클라이언트 비번 입력

recording.js 의 5번 라인에 본인의 토큰을 입력  // 트위치 로그인 후 메인페이지에서 f12로 콘솔창을 연 후 cookies['auth-token'] 입력

const twitch_token = ''; //광고 제거를 위해 토큰을 입력

