# djs-chatexporter

디스코드 채팅 추출기이다. Tyrrrz의 DiscordChatExporter의 존재에서만 영감을 얻었으며 코드상로는 관련이 없다.

100개의 메시지를 끊어서 저장하는데 두 가지 방법이 있다.
exp2.js: 100개의 메시지를 저장할 때마다 엔터를 눌러야 한다. 그리고 너무 빨리씩 누르면 API 스팸으로 일시 차단될 수 있으므로 주의. 차단은 이틀-사흘 후면 풀린다.


exp3.js: 3초마다 100개씩 메시지를 불러온다.(자동으로 처리)
