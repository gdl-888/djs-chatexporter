const fs = require('fs'); // 화일시스템 라이브러리 가져오기
const inputReader = require('wait-console-input') // 입력받는 라이브러리 가져오기
const readline = require('readline'); // 한글 입력받기 위함

const Discord = require('discord.js'); // DJS 라이브러리
// const Constants = require('discord.js/src/util/Constants.js'); // 안 씀.

const emoji = require('node-emoji'); // 반응을 텍스트로 변환

const cliProgress = require('cli-progress'); // 진행율 표시기

// Constants.DefaultOptions.ws.properties.$browser = `Discord Android`; // 안 씀. 봇에 휴대폰 표시 나오게 하는거.
const client = new Discord.Client();

// 익숙한 BASIC과 파이선 따라가기
function print(x) {
	console.log(x);
}

// 개행 없이 출력
function prt(x) {
	process.stdout.write(x);
}

// 입력 함수
function input(p) {
	prt(p); // 일부러 이렇게. 바로하면 한글 깨짐.
	return inputReader.readLine('');
}

// 대상 채널 ID
var chid = '12345678';

// 저장할 화일명
const fn = String(Math.floor(Math.random() * (99999999 - 10000000) + 10000000)) + ".CSV";

// 화일 저장하는 함수
function appendFile(filename, content) {
	fs.appendFile(filename, content, 'utf-8', function(err) {
		if(err) {
			return;
		}
	}); 
	
	// fs.close();
}

// @멘션을 읽을 수 있게 변환
function convertMention(mention) {
	var retval = mention;
	
	const matches = mention.match(/<@!?(\d+)>/g); // @멘션 정규식

	if (!matches) return mention; // @멘션 없으면 그대로 반환
	
	for(m of matches) {
		try {
			// @멘션을 읽을 수 있게 변환
			const id = m.match(/<@!?(\d+)>/)[1];
			const us = client.users.find(user => user.id == id)['username'];
			const dc = client.users.find(user => user.id == id)['discriminator'];
			retval = retval.replace(m, `[@${us}#${dc}]`);
		} catch(e) {}
	}
	
	// 결과값 반환
	return retval;

	//const id = matches[1];

	//return client.users.find(user => user.id == id);
}

client.on('ready', async function() {
	// 혹시 모르니..
	client.user.setPresence({
		status: "invisible"
	});
	
	var s  = 1;
	var sl = [];
	
	for(server of client.guilds.array())
		{
			print(`[${s}] ${server['name']}`);
			sl.push(s++);
		}
	
	var guildname = input("대상 서버: ");
		
	if(!sl.includes(Number(guildname))) {
		print('\r\n서버가 존재하지 않습니다.');
		return;
	}
	
	var guild = client.guilds.array()[Number(guildname) - 1];
	prt('\r\n');
	
	var c  = 0;
	var cl = [];
	
	for(ch of guild.channels.array())
		{
			if(ch['type'] == 'category') { c++; continue; }
			if(ch['type'] == 'voice') { c++; continue; }
			print(`[${c}] ${ch['name']}`);
			cl.push(c++);
		}
		
	var chname = input("대상 채널: ");
		
	if(!cl.includes(Number(chname))) {
		print('\r\n채널이 사용가능하지 않습니다.');
		return;
	}
	
	var channel = guild.channels.array()[chname];
	
	chid = channel.id;
	
	var excludedUser = '';
	
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	rl.question("\r\n제외할 사용자 이름(없으면 빈칸): ", (answer) => {
		excludedUser = answer.toLowerCase();
		
		rl.close();
		
		const rl2 = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		
		rl2.question("제외할 메시지 키워드(없으면 빈칸): ", (answer2) => {
			excludedKeyword = answer2.toLowerCase();
			
			rl2.close();
	
			print("\r\n내보내기를 시작합니다. 취소하려면 3초 이내에 <Ctrl+C>을 누르십시오.\r\n");
			print("       0         25        50        75        100 (%)");

			var sid = '1';
			var bid = '0'; // 채널의 첫 메시지 ID
			var lid = '0'; // 채널의 가장 마지막 메시지 ID
			
			// 먼저 가장 최근 1개의 메시지를 가져와서 그것의 ID를 lid에 저장
			channel.fetchMessages({ limit: 1 }).then(async function(messages) {
				for(rmsg of messages) {
					const cm = rmsg[1];
					
					lid = String(cm['id']);
				}
				
				// 가장 첫 1개의 메시지를 가져와서 그것의 ID를 bid에 저장
				channel.fetchMessages({ limit: 1, after: '1' }).then(async function(messages) {
					for(rmsg of messages) {
						const cm = rmsg[1];
						
						bid = String(cm['id']);
					}
				
					const pb = new cliProgress.Bar({ // 진행율 표시기 생성
						barIncompleteChar: '_',
						barCompleteChar: '█',
						format: '처리중 [{bar}] ({percentage}%) {total} 중 {value} 완료'
					}, cliProgress.Presets.legacy);
					
					pb.start(Number(lid.slice(0, 7)) - Number(bid.slice(0, 7)), 0); // 진행율 표시기 시작
					
					// 이제 메시지들을 가장 오래된 것부터 가져온다.
					var msglst    = []; // 2차원 배열. 가져온 메시지들을 저장하고 나중에 화일로 저장하기.
					var save      = 0;
					var msgcount  = 0;
					var excmsgcnt = 0;
					
					function time(i) {
						// 메시지 개수 한계 지정. 높여도 됨. 너무 많이는 높이지 말 것.
						if(i <= 12345678) {
							setTimeout(async function() { // 3초마다 100개씩 가져오기. 한 번에 해 버리면 일시적 차단이 되므로 하지말것.
								const msgs = await channel.fetchMessages({ limit: 100, after: sid }); // .then()로 하면 구현이 불가하므로 이제는 비동기 await로.
								
								try {
									pb.update(Number(msgs.first()['id'].slice(0, 7)) - Number(bid.slice(0, 7))); // 진행율 증가
								} catch(e) {}
								
								for(var msg of msgs) {
									const cm = msg[1]; // 메시지 오브젝트
									
									if (
										(cm.content.toLowerCase().includes(excludedKeyword) && excludedKeyword != '') ||
										(cm.author.username.toLowerCase() == excludedUser && excludedUser != '')
									) {
										excmsgcnt++; continue;
									}
									
									// 유닉스 시각을 가져와서 일반 시간으로 변환
									var date = new Date(Number(cm['createdTimestamp']));

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

									// 변환된 시간을 tsp에 저장
									const tsp = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
									
									var atm = ''; // 첨부화일 URL 목록
									var rec = ''; // 반응 목록
									
									for(var r of cm['reactions']) {
										if(emoji.hasEmoji(r[0])) {
											rec += emoji.find(r[0])['key'] + ' ';
										} else {
											rec += r[0] + ' ';
										}
									}
									
									for(var am of cm.attachments) {
										atm += ` [파일 ${am[1]['url']}]`; // attachments 콜랙션에서 하나씩 추가
									}
									
									// if(atm == '') atm = '-'; // 없으면 -로
									
									var msgcntnt = cm['content'];
									
									// 이모티콘 변환(유니코드 안되는 윈도우 사용자 배려)
									if(!cm['embeds'].length && !cm['system'] && cm['content'].length >= 2) {
										for(var chr=0; chr<cm['content'].length-1; chr++) {
											const emj = String(cm['content'][chr]) + String(cm['content'][chr+1]);
											
											if(emoji.hasEmoji(emj) && emoji.find(emj)['key'] != emj) {
												msgcntnt = msgcntnt.replace(emj, ':' + emoji.find(emj)['key'] + ':')
											}
										}
									}
									if(cm['embeds'].length && cm['author']['bot']) {
										msgcntnt = `[임베드] `;
										for(var embed of cm['embeds']) {
											msgcntnt += `${embed['title']}: ${embed['description']}   `;
										}
									}
									if(cm['system']) {
										switch(cm['type']) {
											case 'GUILD_MEMBER_JOIN':
												msgcntnt = '[시스템] 서버에 참가함.';
											break;case 'PINS_ADD':
												msgcntnt = '[시스템] 메시지를 고정함.';
											break;default:
												msgcntnt = '[시스템] 서버를 부스트했거나 채널 이름이나 아이콘을 변경, 혹은 통화를 시작함.';
										}
									}
									
									// msglst에 메시지 정보를 담은 배열 저장. [시간, 사용자ID, 사용자이름, 메시지ID, 메시지내용, 유닉스시간, 첨부화일 주소목록, 반응]
									msglst.push([tsp, cm['author']['id'], cm['author']['username'].replace(/["]/g, '""'), cm['id'], convertMention(msgcntnt).replace(/["]/g, '""').replace(/\r/g, ''), Number(cm['createdTimestamp']), atm, rec]);
									// msglst.push(`"(${cm['author']['id']})","${cm['author']['username'].replace(/["]/g, '""')}","(${cm['id']})","${cm['content'].replace(/["]/g, '""').replace(/\r/g, '')}"`);
									
									// sid = cm['id'];
									
									msgcount++;
								}
								
								// if(sid != '1') print(`(${sid} / ${lid})`); // sid와 lid 정보 표시
								// else print("처리 중입니다.\r\n");
								
								try {
									sid = msgs.first()['id']; // sid에 이번에 가져온 100개 메시지 중 가장 마지막 메시지 ID 저장
								} catch(e) { 
									save = 1;
								}
								
								if(Number(sid) > Number(lid) || save) { // 모든 메시지를 가져왔을 때 화일로 저장하기.
									pb.stop(); // 진행율 표시기 멈춤
									
									var ac = ''; // CSV 내용
									
									// 정렬
									print("\r\n\r\n시간 순으로 정렬하는 중입니다.\r\n");
									
									msglst.sort(function(l, r) {
										return l[5] - r[5]; // 5번지인 유닉스 시간을 비교
									});
									
									for(var it of msglst) {
										// ac에 CSV 행 추가
										ac += `"${it[0]}","'${it[5]}","'${it[1]}","${it[2]}","'${it[3]}","${it[4]}${it[6]}","${it[7]}"` + "\r\n";
									}
									
									// 화일로 저장
									appendFile(fn, `"전송 시간","타임스탬프","사용자 번호","이름","메시지 번호","내용","반응"\r\n` + ac);
							
									print(`${excmsgcnt}개를 제외한 ${msgcount}개의 메시지가 ${fn}에 저장되었읍니다.`);
									print('창을 닫아도 좋습니다.');
									
									return;
								}
								
								// 다음 100개 메시지 가져오기
								time(i + 1);
							}, 1500); // 1500: 1.5초.(밀리초 단위) | 조금은 줄여도 되지만 봇이 차단될 경우 책임지지 않습니다.
						} else {
							// 한도 초과 시..
							
							print("메시지가 너무 많습니다. 메시지가 1,234,567,799통 이하인 채널만 내보낼 수 있읍니다.");
							
							return;
						}
					}
					
					time(1);
				}).catch(console.error);
			}).catch(console.error);
		});
	});
});

// 여기에 봇 토큰 입력. 실제계정 토큰으로 지정해서 벌어지는 일과 불이익에 대해서 책임지지 않습니다. 가능하면 봇 계정으로 할 것.
client.login("...");
