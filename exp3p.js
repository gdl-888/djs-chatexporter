const fs = require('fs');
const inputReader = require('wait-console-input')

const Discord = require('discord.js');
const Constants = require('discord.js/src/util/Constants.js');

// Constants.DefaultOptions.ws.properties.$browser = `Discord Android`;
const client = new Discord.Client();

function print(x) {
	console.log(x);
}

function prt(x) {
	process.stdout.write(x);
}

function input(p) {
	prt(p);
	return inputReader.readLine('');
}

var chid = '12345678';
const fn = String(Math.floor(Math.random() * (99999999 - 10000000) + 10000000)) + ".CSV";

function appendFile(filename, content) {
	fs.appendFile(filename, content, 'utf-8', function(err) {
		if(err) {
			return;
		}
	}); 
	
	// fs.close();
}

function convertMention(mention) {
	var retval = mention;
	
	const matches = mention.match(/<@!?(\d+)>/g);

	if (!matches) return mention;
	
	for(m of matches) {
		try {
			const id = m.match(/<@!?(\d+)>/)[1];
			const us = client.users.find(user => user.id == id)['username'];
			const dc = client.users.find(user => user.id == id)['discriminator'];
			retval = retval.replace(m, `[@${us}#${dc}]`);
		} catch(e) {}
	}
	
	return retval;

	//const id = matches[1];

	//return client.users.find(user => user.id == id);
}

client.on('ready', async function() {
	client.user.setPresence({
		status: "invisible"
	});
	
	var s = 1;
	
	for(server of client.guilds.array())
		{
			print(`[${s++}] ${server['name']}`);
		}
	
	var guildname = input("대상 서버: ");
	var guild = client.guilds.array()[Number(guildname) - 1];
	prt('\r\n');
	
	var c = 0;
	
	for(ch of guild.channels.array())
		{
			if(ch['type'] == 'category') { c++; continue; }
			if(ch['type'] == 'voice') { c++; continue; }
			print(`[${c++}] ${ch['name']}`);
		}
		
	var chname = input("대상 채널: ");
	var channel = guild.channels.array()[chname];
	
	chid = channel.id;
	
	print("\n메시지를 불러오는 중입니다.\r\n");
	
	var sid = '1';
	var lid = '0';
	
	channel.fetchMessages({ limit: 1 }).then(async function(messages) {
		for(rmsg of messages) {
			const cm = rmsg[1];
			
			lid = String(cm['id']);
		}
		
		var msglst = [];
		
		function time(i) {
			if(i <= 12345678) {
				setTimeout(async function() {
					const msgs = await channel.fetchMessages({ limit: 100, after: sid });
					
					for(var msg of msgs) {
						const cm = msg[1];
						
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

						const tsp = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
						
						msglst.push([tsp, cm['author']['id'], cm['author']['username'].replace(/["]/g, '""'), cm['id'], convertMention(cm['content']).replace(/["]/g, '""').replace(/\r/g, ''), Number(cm['createdTimestamp'])]);
						// msglst.push(`"(${cm['author']['id']})","${cm['author']['username'].replace(/["]/g, '""')}","(${cm['id']})","${cm['content'].replace(/["]/g, '""').replace(/\r/g, '')}"`);
						
						// sid = cm['id'];
					}
					
					if(sid != '1') print(`(${sid} / ${lid})`);
					else print("\r\n처리 중입니다.\r\n");
					
					try {
						sid = msgs.first()['id'];
					} catch(e) {
						var ac = '';
						
						print("\r\n시간 순으로 정렬하는 중입니다.\r\n");
						
						msglst.sort(function(l, r) {
							return l[5] - r[5];
						});
						
						for(var it of msglst) {
							ac += `"${it[0]}","'${it[1]}","${it[2]}","'${it[3]}","${it[4]}"` + "\r\n";
						}
						
						appendFile(fn, `"타임스탬프","사용자 번호","이름","메시지 번호","내용"\r\n` + ac);
				
						print(`\r\n${fn}에 저장되었읍니다.`);
						
						return;
					}
					
					if(Number(sid) > Number(lid)) {
						var ac = '';
						
						print("\r\n시간 순으로 정렬하는 중입니다.\r\n");
						
						msglst.sort(function(l, r) {
							return l[5] - r[5];
						});
						
						for(var it of msglst) {
							ac += `"${it[0]}","'${it[1]}","${it[2]}","'${it[3]}","${it[4]}"` + "\r\n";
						}
						
						appendFile(fn, `"타임스탬프","사용자 번호","이름","메시지 번호","내용"\r\n` + ac);
				
						print(`\r\n${fn}에 저장되었읍니다.`);
						
						return;
					}
					
					time(i + 1);
				}, 3000);
			} else {
				print("메시지가 너무 많습니다. 메시지가 12,345,678통 이하인 채널만 추출할 수 있읍니다.");
				
				return;
			}
		}
		
		time(1);
	}).catch(console.error);
});

client.login("defr4gtetyrsse");
