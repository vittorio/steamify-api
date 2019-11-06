const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  name: String,
  appId: {type: Number, required: true},
  playtimeTwoWeeks: Number,
  header: String,
  icon: String,
  price: {type: Number, default: 0},
  playtimeForever: Number,
  logo: String,
  lastSync: Number,
  dlc: {type: [{
    name: String,
    price: Number
  }], default: []},
  status: {type: String, default: 'default'},
  store: {type: String, default: 'steam'}
});

module.exports = mongoose.model('Game', GameSchema);
