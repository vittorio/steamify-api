const mongoose = require('mongoose');
const autoIncrement = require('mongoose-plugin-autoinc');

const Schema = mongoose.Schema;

const PackSchema = new Schema({
    name: String,
    price: {type: Number, default: 0},
    items: {
        type: [String],
        default: []
    }
});

PackSchema.plugin(autoIncrement.plugin, {model: 'Pack', field: 'packId'});

module.exports = mongoose.model('Pack', PackSchema);
