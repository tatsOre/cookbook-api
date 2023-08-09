const mongoose = require("mongoose");

const { Schema } = mongoose;

const ShoppingListSchema = new Schema(
  {
    recipe: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: "You must supply an recipe id",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: "You must supply an author for the shopping list",
    },
    items: [String],
  },
  {
    timestamps: true,
  }
);

// item[n] = { name: '1 1/2 Rice Flour', checked: boolean }

const ShoppingListModel = mongoose.model("ShoppingList", ShoppingListSchema);

module.exports = ShoppingListModel;
