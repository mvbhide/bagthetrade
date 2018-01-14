import {Injectable, EventEmitter} from '@angular/core';
import {DataService} from './data-service.service'

@Injectable()
export class TickerService {

	api_key : string = '2ii3pn7061sv4cmf';
	user_id : string = 'RP6292';
	public_token : string = '4d3d5784e80affaa3c15b9e37fd2f690';
	address : string = 'wss:\/\/ws.zerodha.com/';

	read_timeout: any = 5; // seconds
	reconnect_interval = 5;
	reconnect_tries = 5;

	// message flags (outgoing)
	mSubscribe = "subscribe";
	mUnSubscribe = "unsubscribe";
	mSetMode = "mode";

	// incoming
	mAlert = 10;
	mMessage = 11;
	mLogout = 12;
	mReload = 13;
	mClearCache = 14;

	// public constants
	modeFull  = "full"; // Full quote including market depth. 164 bytes.
	modeQuote = "quote"; // Quote excluding market depth. 52 bytes.
	modeLTP   = "ltp";

	constructor(private ds: DataService)  {
		this.connect();
		var self = this;
		this.on("tick", function(ticks) {
			console.log(ticks)
			self.ds.updateTicks(ticks);
		})
	}

	ws = null;
	triggers = {"connect": [],
				"tick": [],
				"disconnect": [],
				"reconnecting": [],
				"noreconnect": []};

	read_timer = null;
	last_read: any = 0;
	reconnect_timer = null;
	auto_reconnect = false;
	reconnections = 0;
	currentWsUrl = null;
	token_modes = {};

	// segment constants
	NseCM = 1;
	NseFO = 2;
	NseCD = 3;
	BseCM = 4;
	BseFO = 5;
	BseCD = 6;
	McxFO = 7;
	McxSX = 8;
	NseIndices = 9;

	/**
	 * Auto reconnect settings
	 * @param  {bool} Enable or disable auto disconnect, defaults to false
	 * @param  {number} [times=5] Number of times to retry, defaults to 5. Set -1 for infinite reconnections.
	 * @param  {number} [times=5] Timeout in seconds, default to 5.
	 * @memberOf KiteTicker
	 * @method autoReconnect
	 */
	autoReconnect(t, times, timeout) {
		this.auto_reconnect = (t == true ? true : false);

		if(times) {
			this.reconnect_tries = times;
		}

		if(timeout) {
			this.reconnect_interval = timeout;
		}
	};

	/**
	 * Initiate a websocket connectipn
	 * @memberOf KiteTicker
	 * @method connect
	 * @instance
	 */
	connect() {
		if(this.ws && (this.ws.readyState == this.ws.CONNECTING || this.ws.readyState == this.ws.OPEN)) {
			return;
		}

		this.ws = new WebSocket(this.address + "?api_key=" + this.api_key + "&user_id=" + this.user_id +
			"&public_token=" + this.public_token + "&uid=" + (new Date().getTime().toString()));
		this.ws.binaryType = "arraybuffer";

		var self = this;

		this.ws.onopen = function() {
			// Store current open connection url to check for auto reconnection
			if (!this.currentWsUrl) {
				this.currentWsUrl = this.url
			}

			// Reset reconnections attempt
			this.reconnections = 0

			// Trigger onconnect event
			self.trigger("connect");

			// If there isn't an incoming message in n seconds, assume disconnection.
			clearInterval(this.read_timer);

			this.last_read = new Date();
			this.read_timer = setInterval(function() {
				let currentTimeOffset = ((new Date().getTime() - this.last_read ) / 1000);
				if(this.read_timeout < currentTimeOffset) {
					// reset currentWsUrl incase current connection times out
					// This is determined when last heart beat received time interval
					// exceeds read_timeout value
					this.currentWsUrl = null;

					if(this.ws) {
						this.ws.close();
					}

					clearInterval(this.read_timer);
					this.triggerDisconnect();
				}
			}, this.read_timeout * 1000);
		};

		this.ws.onmessage = function(e) {
			// Binary tick data.
			if(e.data instanceof ArrayBuffer) {
				if(e.data.byteLength > 2) {
					var d = self.parseBinary(e.data);
					if(d) {
						self.trigger("tick", [d]);
					}
				}
			}

			// Set last read time to check for connection timeout
			this.last_read = new Date();
		};

		this.ws.onerror = function(e) {
			if(this && this.readyState == this.OPEN) {
				this.close();
			}
		};

		this.ws.onclose = function(e) {
			// the ws id doesn't match the current global id,
			// meaning it's a ghost close event. just ignore.
			if(this.currentWsUrl && (this.url != this.currentWsUrl)) {
				return;
			}

			self.triggerDisconnect();
		};
	};

	/**
	 * @memberOf KiteTicker
	 * @method disconnect
	 * @instance
	 */
	disconnect() {
		if(this.ws && this.ws.readyState != this.ws.CLOSING && this.ws.readyState != this.ws.CLOSED) {
			this.ws.close();
		}
	}

	/**
	 * Check if the ticker is connected
	 * @memberOf KiteTicker
	 * @method connected
	 * @instance
	 * @returns {bool}
	 */
	connected() {
		if(this.ws && this.ws.readyState == this.ws.OPEN) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Register websocket event callbacks
	 * Available events
	 * ~~~~
	 * connect -  when connection is successfully established.
	 * tick - when ticks are available (Arrays of `ticks` object as the first argument).
	 * disconnect - when socket connction is disconnected.
	 * reconnecting - When reconnecting (Reconnecting interval and current reconnetion count as arguments respectively).
	 * noreconnect - When reconnection fails after n number times.
	 * ~~~~
	 *
	 * @memberOf KiteTicker
	 * @method on
	 * @instance
	 *
	 * @example
	 * ticker.on("tick", callback);
	 * ticker.on("connect", callback);
	 * ticker.on("disconnect", callback);
	 */
	on = function(e, callback) {
		if(this.triggers.hasOwnProperty(e)) {
			this.triggers[e].push(callback);
		}
	};

	/**
	 * Subscribe to array of tokens
	 * @memberOf KiteTicker
	 * @method subscribe
	 * @instance
	 * @param {array} tokens Array of tokens to be subscribed
	 *
	 * @example
	 * ticker.subscribe([738561]);
	 */
	subscribe(tokens) {
		if(tokens.length > 0) {
			this.send({"a": this.mSetMode, "v":[this.modeFull, tokens]});
		}
		return tokens;
	};

	/**
	 * Unsubscribe to array of tokens
	 * @memberOf KiteTicker
	 * @method unsubscribe
	 * @instance
	 * @param {array} tokens Array of tokens to be subscribed
	 *
	 * @example
	 * ticker.unsubscribe([738561]);
	 */
	unsubscribe(tokens) {
		if(tokens.length > 0) {
			this.send({"a": this.mUnSubscribe, "v": tokens});
		}
		return tokens;
	};

	/**
	 * Set modes to array of tokens
	 * @memberOf KiteTicker
	 * @method setMode
	 * @instance
	 * @param {string} mode - mode to set
	 * @param {array} tokens Array of tokens to be subscribed
	 *
	 * @example
	 * ticker.setMode(ticker.modeFull, [738561]);
	 */
	setMode(mode, tokens) {
		if(tokens.length > 0) {
			this.send({"a": this.mSetMode, "v": [mode, tokens]});
		}
		return tokens;
	}

	/**
	 * On close/error of websocket, trigger the disconnect event and start attemping reconnections
	 * @memberOf KiteTicker
	 * @method triggerDisconnect
	 * @instance
	 */
	triggerDisconnect() {
		this.ws = null;
		this.trigger("disconnect");

		if(this.auto_reconnect) {
			this.attemptReconnection();
		}
	}

	// send a message via the socket
	// automatically encodes json if possible
	send(message) {
		if(!this.ws || this.ws.readyState != this.ws.OPEN) return;

		try {
			if(typeof(message) == "object") {
				message = JSON.stringify(message);
			}
			this.ws.send(message);
		} catch(e) { this.ws.close(); };
	}

	// trigger event callbacks
	trigger(e, args = null) {
		for(var n=0; n<this.triggers[e].length; n++) {
			this.triggers[e][n].apply(this.triggers[e][n], args ? args : []);
		}
	}

	// parse received binary message. each message is a combination of multiple tick packets
	// [2-bytes num packets][size1][tick1][size2][tick2] ...
	parseBinary(binpacks) {
		// token and segment.

		var packets = this.splitPackets(binpacks),
			ticks = [],
			q :any = {};

		for(var n=0; n<packets.length; n++) {
			var bin = packets[n];

			var t = this.buf2long(bin.slice(0, 4)),
				token = t >> 8,
				segment = t & 0xff;

			switch(segment) {
				case this.NseIndices:
					var dec = 100;
					q = {
						mode: this.modeFull,
						tradeable: false,
						Token: t,
						LastTradedPrice: this.buf2long(bin.slice(4,8)) / dec,
						HighPrice: this.buf2long(bin.slice(8,12)) / dec,
						LowPrice: this.buf2long(bin.slice(12,16)) / dec,
						OpenPrice: this.buf2long(bin.slice(16,20)) / dec,
						ClosePrice: this.buf2long(bin.slice(20,24)) / dec,
						NetPriceChangeFromClosingPrice: this.buf2long(bin.slice(24,28)) / dec
					};

					ticks.push(q);
				break;

				case this.McxFO:
				case this.NseCM:
				case this.BseCM:
				case this.NseFO:
				case this.NseCD:
					// decimal precision
					var dec = (segment == this.NseCD) ? 10000000 : 100;

					// ltp only quote
					if(bin.byteLength == 8) {
						ticks.push({
							mode: this.modeLTP,
							tradeable: true,
							Token: t,
							LastTradedPrice: this.buf2long(bin.slice(4,8)) / dec
						});

						continue;
					}

					q = {
						mode: this.modeQuote,
						tradeable: true,
						Token: t,
						LastTradedPrice: this.buf2long(bin.slice(4,8)) / dec,
						LastTradeQuantity: this.buf2long(bin.slice(8,12)),
						AverageTradePrice: this.buf2long(bin.slice(12,16))  / dec,
						VolumeTradedToday: this.buf2long(bin.slice(16,20)),
						TotalBuyQuantity: this.buf2long(bin.slice(20,24)),
						TotalSellQuantity: this.buf2long(bin.slice(24,28)),
						OpenPrice: this.buf2long(bin.slice(28,32)) / dec,
						HighPrice: this.buf2long(bin.slice(32,36)) / dec,
						LowPrice: this.buf2long(bin.slice(36,40)) / dec,
						ClosePrice: this.buf2long(bin.slice(40,44)) / dec,
						Depth: {"buy": [], "sell": []}
					};

					// Change %
					q.NetPriceChangeFromClosingPrice = 0;
					if(q.ClosePrice !== 0) {
						q.NetPriceChangeFromClosingPrice = (q.LastTradedPrice - q.ClosePrice)*100 / q.ClosePrice;
					}

					// full quote including depth
					if(bin.byteLength > 60) {
						q.mode = this.modeFull;

						var s = 0, depth = bin.slice(44, 164);
						for(var i=0; i<10; i++) {
							s = i * 12;
							q.Depth[i < 5 ? "buy" : "sell"].push({
								Quantity: this.buf2long(depth.slice(s, s+4)),
								Price:    this.buf2long(depth.slice(s+4, s+8)) / dec,
								Total:    this.buf2long(depth.slice(s+8, s+10))
							});
						}
					}

					ticks.push(q);
				break;
			}
		}

		return ticks;
	}

	// split one long binary message into individual tick packets
	splitPackets(bin) {
		// number of packets
		var num = this.buf2long(bin.slice(0, 2)),
			j = 2,
			packets = [];

		for(var i=0; i<num; i++) {
			// first two bytes is the packet length
			var size = this.buf2long(bin.slice(j, j+2)),
				packet = bin.slice(j+2, j+2+size);

			packets.push(packet);

			j += 2 + size;
		}

		return packets;
	}

	attemptReconnection() {
		// Try reconnecting only so many times.
		if(this.reconnect_tries !== -1 && this.reconnections >= this.reconnect_tries) {
			this.trigger("noreconnect");
			return;
		}
		var self = this;
		this.trigger("reconnecting", [this.reconnect_interval, this.reconnections]);
		this.reconnect_timer = setTimeout(function() {
			self.connect();
		}, this.reconnect_interval * 1000);

		this.reconnections++;
	}

	// Big endian byte array to long.
	buf2long(buf) {
		var b = new Uint8Array(buf),
			val = 0,
			len = b.length;

		for(var i=0, j=len-1; i<len; i++, j--) {
			val += b[j] << (i*8);
		}

		return val;
	}
}
