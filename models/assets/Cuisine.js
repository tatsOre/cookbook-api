const mongoose = require("mongoose");

const CuisineSchema = new mongoose.Schema({
    label: String
});

module.exports = mongoose.model("Cuisine", CuisineSchema);
