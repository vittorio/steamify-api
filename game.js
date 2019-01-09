const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  basic: {
    appid: Number,
    name: String,
    playtimeTwoWeeks: Number,
    playtimeTwoWeeksReadable: String,
    playtimeForever: Number,
    playtimeForeverReadable: String,
    icon: String,
    logo: String,
    header: String,
    hasCommunityVisibleStats: Boolean
  },

  details: {
    id: Number,
    name: String,
    controllerSupport: String,
    description: String,
    about: String,
    header: String,
    website: String,
    pcRequirements: {
      minimum: String
    },
    legal: String,
    developers: [String],
    publishers: [String],
    price: {
      currency: String,
      initial: Number,
      final: Number,
      discount_percent: Number,
      initial_formatted: String,
      final_formatted: String
    },
    platforms: {
      windows: Boolean,
      mac: Boolean,
      linux: Boolean
    },
    metacritic: {
      score: Number,
      url: String
    },
    categories: [{
      id: Number,
      description: String
    }],
    genres: [{
      id: Number,
      description: String
    }],
    release: {
      coming_soon: Boolean,
      date: String
    }
  },

  extras: {
    actual_price: Number
  }
});

module.exports = mongoose.model('Games', GameSchema);