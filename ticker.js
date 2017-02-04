var util = require('util');
var events = require('events');

class Ticker { 
	constructor(){
		let handler = () => this.emit('tick');

		setInterval(handler, 1000); 
	}
}

util.inherits(Ticker, events.EventEmitter);
let ticker = new Ticker(); 

ticker.on('tick', function() {
	console.log("tick tock");
});