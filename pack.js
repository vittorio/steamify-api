const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackSchema = new Schema({
    name: String,
    price: {type: Number, default: 0},
    items: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('Pack', PackSchema);
