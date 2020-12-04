# djs-chatexporter

디스코드 채팅을 내보내준다.  
Exports your Discord channel's messages.

버전 6(exp6.js) 이상을 사용하십시오.. Node.js 5.0 이상 버전이 필요합니다. Node.js 6.0 미만이어서 Discord.js 버전 11 설치가 불가능하다면 [이 포팅된 버전](https://github.com/turbo-whistler/djs11-node5)을 사용하십시오.

Use version 6(exp6.js) or higher. Node.js >= 5.0 required. If you're using Node.js < 6.0 because Node.js 6 dropped support for XP and vista, and cannot install DJS v11, use [this](https://github.com/turbo-whistler/djs11-node5) ported version.

## npm
```
npm i djs11@npm:discord.js@11.6.4
npm i cli-progress (cli-progress@1.8.0 if you're using Node.js < 6)
npm i node-emoji
npm i deasync
```

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
