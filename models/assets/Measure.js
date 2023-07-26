const mongoose = require("mongoose");

const IngredientMeasureSchema = new mongoose.Schema({
    label: String
})

module.exports = mongoose.model("Measure", IngredientMeasureSchema);
