const mongoose = require("mongoose");

const IngredientFractionSchema = new mongoose.Schema({
    label: String,
    decimal: Number
})

module.exports = mongoose.model("Fraction", IngredientFractionSchema);
