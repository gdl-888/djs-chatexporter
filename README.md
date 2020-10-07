# djs-chatexporter

디스코드 채팅을 내보내준다.
Exports your Discord channel's messages

100개의 메시지를 끊어서 저장하는데 두 가지 방법이 있다.

exp1.js: **사용하지 말 것.** 개발중인 버전이였고 엉망(...)이다.
exp1.js is the first version that is kinda broken.

exp2.js: **사용하지 말 것.** 100개의 메시지를 저장할 때마다 엔터를 눌러야 한다. 그리고 너무 빨리씩 누르면 API 스팸으로 일시 차단될 수 있으므로 주의. 차단은 이틀에서 사흘 후면 풀린다. 그리고 이 코드는 정렬이 아직 되지 않는다.
exp2.js is the second version which requires a little manuel controls, and does not sort the messages (by time).

exp3.js: 3초마다 100개씩 메시지를 불러온다.(자동으로 처리)
exp3.js is the latest version.

## 추출 후 처리할 작업
MS 오피스로 열 경우 인코딩을 ANSI(정확히는 ANSI가 아니라 CP949 등)로 바꾸어 주어야 한다.
To open the CSV file with MS-Office, change the encoding to ANSI.

## 속도
1.5초에 100개씩 끊어 내보내는데 이 간격 시간을 낮추해서 속도를 높일 수 있지만 그만큼 봇이 디스코드에서 임시 차단될 가능성이 높아진다. (주관적 안전 기준은 0.75초)

메시지가 약 20,000개인 채널에서 내보내기 시 약 8분 소요.

메시지가 약 5,000개인 채널은 약 3분 소요.

1초로 설정했을 때 2,000개인 채널은 약 15초 소요.

## 사용된 외부 라이브러리
- https://www.npmjs.com/package/cli-progress
- https://www.npmjs.com/package/wait-console-input
- https://www.npmjs.com/package/node-emoji
- readline
