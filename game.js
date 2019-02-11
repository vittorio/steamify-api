const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  playtimeTwoWeeksReadable: String,
  name: String,
  playtimeForeverReadable: String,
  appId: Number,
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
  hidden: {type: Boolean, default: false}
});

module.exports = mongoose.model('Game', GameSchema);
