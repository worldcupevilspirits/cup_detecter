# cup_detecter
트위치 한국 스트리머 상위 200명의 실시간 방송 정보를 탐지하여 제목에 특정 키워드가 있으면 녹화가 자동으로 켜지는 코드를 만들었습니다.



# 실행방법

# 1

channelWorker.js 의 8,9번 라인에 본인의 CLIENT_ID, CLIENT_SECRET 입력.

const CLIENT_ID = ''; //클라이언트 입력 https://dev.twitch.tv/console/apps/create
const CLIENT_SECRET = ''; //클라이언트 비번 입력

# 2

recording.js 의 5번 라인에 본인의 토큰을 입력  // 트위치 로그인 후 메인페이지에서 f12로 콘솔창을 연 후 cookies['auth-token'] 입력

const twitch_token = ''; //광고 제거를 위해 토큰을 입력

