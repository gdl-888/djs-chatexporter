const print = console.log;
const ln = () => process.stdout.write('\n');

const token = 'Your token', userid = 'Bot/User account ID';
const readline = require('readline');
const fs = require('fs');
const http = require('https');

function request(path) {
    return new Promise((resolve, reject) => {
        http.request({
            host: 'discord.com',
            path: '/api/v8' + path,
            headers: {
                "Authorization": token,
                "User-Agent": 'Mozilla/5.0 (Windows NT 6.0; rv:52.0) Gecko/20100101 Firefox/52.0'
            }
        }, res => {
			var ret = '';

			res.on('data', chunk => ret += chunk);

			res.on('end', function() {
				var msg; ret = JSON.parse(ret);
				
				if(msg = ret.message) reject(msg);
				else resolve(ret);
			});
        }).end();
    });
}

const perms = {
	'관리자': 8,
	'관리 내역 보기': 128,
	'서버 인사이트 보기': 524288,
	'서버 관리자': 32,
	'권한 관리자': 268435456,
	'채널 관리자': 16,
	'추방': 2,
	'차단': 4,
	'초대': 1,
	'자신의 별명 변경': 67108864,
	'별명 관리자': 134217728,
	'그림 문자 관리자': 1073741824,
	'웹후크 관리자': 536870912,
	'메시지 읽기 & 음성 채널 보기': 1024,
	'메시지 보내기': 2048,
	'음성 메시지 보내기': 4096,
	'메시지 관리자': 8192,
	'링크 전송': 16384,
	'화일 첨부': 32768,
	'이전 메시지 보기': 65536,
	'모두 핑하기': 131072,
	'외부 그림문자 사용': 262144,
	'반응': 64,
	'음성 채널 접속': 1048576,
	'말하기': 2097152,
	'카메라 & 화면 공유': 512,
	'사용자 마이크 음소거': 4194304,
	'사용자 스피커 음소거': 8388608,
	'사용자 이동': 16777216,
	'음성 감지 사용': 33554432,
	'우선 발언자': 256
};

const hasPerm = (i, p) => (i & p) == p;

const rl = readline.createInterface(process.stdin, process.stdout);

var r, f;

rl.question('채널 ID: ', channel => {
	rl.close();
	
	var html = `
		<meta charset=utf-8 />
		
		<style>
			.res-wrapper .res {
				display: inline-block;
				min-width: 400px;
			}
		
			.res-wrapper .res .r-head {
				border-radius: 5px 5px 0 0;
				padding: 8px 10px 8px 10px;
				background: linear-gradient(rgb(226\, 237\, 254) 0%\, rgb(202\, 219\, 243) 51%\, rgb(161\, 191\, 229) 50%\, rgb(90\, 139\, 204) 100%);
				text-shadow: 1px 1px 0 #cecece;
			}
			
			.res-wrapper .res .r-body {
				padding: 8px 10px 8px 10px;
				background: linear-gradient(#eee\, #ccc);
				overflow-x: scroll;
			}
			
			.res-wrapper .res.res-type-status .r-body {
				background: linear-gradient(orange\, #ccc);
			}
			
			.res-wrapper .res .combo {
				border-radius: 0 0 5px 5px;
				padding: 8px 10px 8px 10px;
				background: linear-gradient(#777\, #333);
				color: white;
			}
			
			.res-wrapper .res .combo div {
				overflow-x: auto;
			}
			
			.res-wrapper .res .combo div img {
				max-height: 240px;
				display: inline-block;
			}
			
			.res-wrapper {
				margin: 40px 0 40px 0;
			}
			
			.pull-right {
				float: right;
			}
		</style>
		
		<div id=res-container>
	`;
	
	var msgarr = [], arr = [];
	
	function parseDate(date) {
		var hour = date.getHours();
		hour = (hour < 10 ? "0" : "") + hour;

		var min  = date.getMinutes();
		min = (min < 10 ? "0" : "") + min;

		var sec  = date.getSeconds();
		sec = (sec < 10 ? "0" : "") + sec;

		var year = date.getFullYear();

		var month = date.getMonth() + 1;
		month = (month < 10 ? "0" : "") + month;

		var day  = date.getDate();
		day = (day < 10 ? "0" : "") + day;

		return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
	}
	
	print('추출 중...');
	
	(f = function(id) {
		request('/channels/' + channel + '/messages?limit=50' + (id ? ('&before=' + id) : '')).then(messages => { // 유저봇 의심 방지
			if(!messages.length) {  // 다 불러왔음
				print('추출 완료. 파싱 중...\n');
				
				var num = 0;
				
				arr.sort((l, r) => Number(l.timestamp) - Number(r.timestamp));
				
				print('정렬 완료.');
				
				var ff, fg;
				
				(ff = function(_msg) {
					const msg = arr[_msg];
					
					console.log('HTML 그리기 -', _msg);
					
					if(_msg + 1 > arr.length) {
						print('HTML 생성 완료.');
				
						html += '</div>';
						html += '<title>' + channel + '</title>';
						
						fs.writeFileSync('./' + channel + '.htm', html);
						print('저장되었읍니다.');
						
						fs.writeFileSync('./' + channel + '.json', JSON.stringify(msgarr));  // parsemsg.js로 CSV로 변환할 때 필요
						process.exit(0);
					} else {
						var re = '';
						for(r of msg.reactions) {
							re += r.emoji.name + ' ';
						}
						
						var cnt = msg.content.replace(/[&]/g, '&amp;').replace(/["]/g, '&quot;').replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;').replace(/\n/g, '<br />');
						if(msg.type == 'join') cnt = '서버에 참가함';
						if(msg.type == 'pin')  cnt = '메시지를 고정함';
						
						html += `
							<div class=res-wrapper>
								<div class="res res-type-${msg.type != 'normal' ? 'status' : 'normal'}">
									<div class=r-head>
										<span class=num>
											<a id=${++num}>#${num}</a>
										</span>
										
										${msg.username}
										
										<span class=pull-right>
											${parseDate(new Date(msg.timestamp))}
										</span>
									</div>
									
									<div class=r-body>
										${cnt}
									</div>
									
									<div class=combo>
										<div>
						`;
						
						const attachments = msg.attachments;
						
						(fg = function(_at) {
							const at = attachments[_at];
							
							if(_at + 1 > attachments.length) {
								html += `
												</div>
												
												${re}
											</div>
										</div>
									</div>
								`;
								
								ff(_msg + 1);
							} else
							
							http.get(at.url, res => {
								console.log('첨부파일 다운로드 -', _msg + 1 + '번 메시지 중', _at + 1 + '번');
								
								res.setEncoding('base64'); 
								
								var imgsrc = 'data:' + res.headers['content-type'] + ';base64,';
								
								res.on('data', chunk => imgsrc += chunk);
								
								res.on('end', function() {
									html += `
										<img src='${imgsrc}' />
									`;
									
									fg(_at + 1);
								});
							}).end();
						})(0);
					}
				})(0);
			} else {
				msgarr = msgarr.concat(messages);
				
				for(msg of messages) {
					arr.push({
						id: msg.id,
						timestamp: (new Date(msg.timestamp)).getTime(),
						edited_timestamp: (new Date(msg.edited_timestamp)).getTime(),
						username: msg.author.username + '#' + msg.author.discriminator,
						userid: msg.author.id,
						pinned: msg.pinnded,
						tts: msg.tts,
						attachments: msg.attachments,
						embeds: msg.embeds,
						content: msg.content,
						reactions: msg.reactions || [],
						type: msg.type == 7 ? 'join' : (msg.type == 6 ? 'pin' : 'normal')
					});
					
					print(msg.author.username + '> ' + msg.content);
				}
				
				setTimeout(() => {
					f(messages[messages.length - 1].id);
				}, Math.floor((Math.random() + 0.5) * 1000));
			}
		});
	})();
});
