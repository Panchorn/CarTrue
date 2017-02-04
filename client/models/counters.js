var db = require('./connection.js');

// auto increment

const CounterSchema = db.Mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
}, {collection:'counters'});

const counter = module.exports = db.Connection.model('counters', CounterSchema);