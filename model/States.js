const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  abbreviation: {
    type: String,
    required: true,
    unique: true,
  },
  funfacts: [String],
});

module.exports = mongoose.model("State", stateSchema);