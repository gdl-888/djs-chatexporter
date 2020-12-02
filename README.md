# djs-chatexporter

디스코드 채팅을 내보내준다.  
Exports your Discord channel's messages.

Windows 7/Node.js 6.0 이상이라면 3 혹은 4 이상의 짝수 버전을, Windows XP/Node.js 5.12.0 환경이라면 5 이상의 홀수 버전을 사용하십시오. 버전 4 이상에서 버전 번호가 짝수인 것과 홀수인 것은 서로 다른 프로그램입니다.
For Windows 7/Node.js 6.0 or higher, use version 3 or an even-numbered version of 4 or higher, and for Windows XP/Node.js 5.12.0, use an odd-numbered version of 5 or higher. In version 4 and later, even and odd version numbers are completely different programs.

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
