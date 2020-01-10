const https = require('https');

let voice_options = {
	janjaap: {
		language: 'nl-Nl',
		gender: 'male',
		wav: 'nl-Nl-Wavenet-B'
	},
	kees: {
		language: 'nl-Nl',
		gender: 'male',
		wav: 'nl-Nl-Wavenet-C'
	},
	sjaan: {
		language: 'nl-Nl',
		gender: 'female',
		wav: 'nl-Nl-Wavenet-D'
	},
	bep: {
		language: 'nl-Nl',
		gender: 'Female',
		wav: 'nl-Nl-Wavenet-E'
	},
	miep: {
		language: 'nl-Nl',
		gender: 'female',
		wav: 'nl-Nl-Wavenet-A'
	},
	russel: {
		language: 'en-AU',
		gender: 'male',
		wav: 'en-AU-Wavenet-B'
	},
	thomas: {
		language: 'en-AU',
		gender: 'male',
		wav: 'en-AU-Wavenet-D'
	},
	nicole: {
		language: 'en-AU',
		gender: 'female',
		wav: 'en-AU-Wavenet-A'
	},
	mary: {
		language: 'en-AU',
		gender: 'female',
		wav: 'en-AU-Wavenet-C'
	},
	brian: {
		language: 'en-GB',
		gender: 'male',
		wav: 'en-GB-Wavenet-B'
	},
	paul: {
		language: 'en-GB',
		gender: 'male',
		wav: 'en-GB-Wavenet-D'
	},
	emma: {
		language: 'en-GB',
		gender: 'female',
		wav: 'en-GB-Wavenet-A'
	},
	amy: {
		language: 'en-GB',
		gender: 'female',
		wav: 'en-GB-Wavenet-C'
	},
	mathew: {
		language: 'en-US',
		gender: 'male',
		wav: 'en-US-Wavenet-B'
	},
	justin: {
		language: 'en-US',
		gender: 'male',
		wav: 'en-US-Wavenet-D'
	},
	joanna: {
		language: 'en-US',
		gender: 'female',
		wav: 'en-US-Wavenet-A'
	},
	ivy: {
		language: 'en-US',
		gender: 'female',
		wav: 'en-US-Wavenet-C'
	},
	kimberly: {
		language: 'en-US',
		gender: 'female',
		wav: 'en-US-Wavenet-E'
	},
	salli: {
		language: 'en-US',
		gender: 'female',
		wav: 'en-US-Wavenet-F'
	},
	ella: {
		language: 'da-DK',
		gender: 'female',
		wav: 'da-DK-Wavenet-A'
	},
}

let voice_names = [
	"mathew",
	"justin",
	"joanna",
	"ivy",
	"kimberly",
	"salli",
	"russel",
	"thomas",
	"nicole",
	"mary",
	"brian",
	"paul",
	"emma",
	"amy",
	"ella",
	"janjaap",
	"kees",
	"sjaan",
	"bep",
	"miep"
]

const makeHttpCall = async (options) => {
	try {
		return new Promise((resolve) => {
			var req = https.request(options, res => {
				res.setEncoding('utf8');
				var returnData = "";
				res.on('data', chunk => {
					returnData = returnData + chunk;
				});
				res.on('end', () => {
					let results = JSON.parse(returnData);
					resolve(results);
				});
			});
			if (options.method == 'POST' || options.method == 'PATCH') {
				req.write(JSON.stringify(options.body));
			}
			req.end();
		})
	} catch (error) {
		return `error: ` + error;
	}
}

// Get a random item
const randomItem = (arrayOfItems) => {
	let i = 0;
	i = Math.floor(Math.random() * arrayOfItems.length);
	return (arrayOfItems[i]);
};

const getVoice = (voice) => {
	voice = (voice == 'random') ? randomItem(voice_names) : voice;
	let chosen = voice_options[voice];
	let data = {
		languageCode: chosen.language,
		gender: chosen.gender,
		voice: chosen.wav
	}
	return data;
}

const getAudioFile = async (txt, data) => {

	let options = {
		host: 'texttospeech.googleapis.com',
		port: 443,
		path: '/v1/text:synthesize',
		headers: {
			'Content-Type': 'application/json',
			"charset": 'utf-8',
			"X-Goog-Api-Key": `${data.key}`
		},
		body: {
			'input': {
				'ssml': `<speak>${txt}</speak>`
			},
			'voice': {
				'languageCode': data.languageCode,
				'name': data.voice,
				'ssmlGender': data.gender
			},
			'audioConfig': {
				// "sampleRateHertz": 48000,
				"speakingRate": "0.90",
				'audioEncoding': 'MP3'
			}
		},
		method: 'POST'
	};

	let resp = await makeHttpCall(options);
	// console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
	if (resp.error) {
		return { error: resp.error.message };
	} else {
		return resp.audioContent;
	}
}

module.exports = function (RED) {
	function WavenetNode(config) {
		RED.nodes.createNode(this, config);
		var regexp = new RegExp('^[A-Za-z0-9+\/=]*$');
		var node = this;
		node.on('input', function (msg) {
			let key = RED.nodes.getNode(config.key);
			let txt = msg.payload;

			let voice = getVoice(config.voice);
			voice.key = key.speech_api;
			// msg.voice = voice;

			let audioContent = getAudioFile(txt, voice);
			audioContent.then((value) => {
				if (value.error) {
					node.status({ fill: "red", shape: "ring", text: 'API error' });
					node.error(value.error);
				} else {
					try {
						// console.log('getting file:');
						var load = value.replace(/\s+/g, '');      // remove any whitespace
						if (regexp.test(load) && (load.length % 4 === 0)) {
							value = Buffer.from(load, 'base64');
							node.status({ fill: "green", shape: "dot", text: `${voice.languageCode} - ${voice.gender}` });
							msg.payload = value;
							node.send(msg);
						}
						else {
							node.log("Not a Base64 string - maybe we should encode it...");
							value = Buffer.from(value).toString('base64');
							node.status({ fill: "green", shape: "ring", text: `${voice.languageCode} - ${voice.gender}` });
							msg.payload = value;
							// RED.util.setMessageProperty(msg, node.property, value);
							node.send(msg);
						}
					} catch (error) {
						node.status({ fill: "red", shape: "dot", text: 'error' });
						node.error(error);
					}
				}
			});
		});
	}

	RED.nodes.registerType("wavenet", WavenetNode);

	function WavenetConfigNode(n) {
		RED.nodes.createNode(this, n);
		this.speech_api = n.speech_api;
	}
	RED.nodes.registerType("wavenet-config", WavenetConfigNode);
}