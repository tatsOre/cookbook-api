const mongoose = require("mongoose");

const { Schema } = mongoose;

const RecipeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "A recipe title is required."],
            trim: true,
            maxLength: 100,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            //required: "You must supply an author for the recipe",
        },
        description: String,
        mainIngredient: {
            type: String,
            required: [true, "Main ingredient is required."],
            trim: true,
            maxLength: 100,
        },
        photo: String,
        servings: { type: Number, default: 0 },
        ingredients: [
            {
                quantity: { type: Number, default: 0 },
                fraction: { type: Schema.Types.ObjectId, ref: 'Fraction' },
                measure: { type: Schema.Types.ObjectId, ref: 'Measure' },
                name: String,
                prepNote: String,
            },
        ],
        instructions: [String],
        categories: { type: [Schema.Types.ObjectId], ref: 'Category' },
        cuisine: { type: String, ref: 'Cuisine' },
        public: { type: Boolean, default: false },
        comments: String,
    },
    {
        timestamps: true,
    }
)

RecipeSchema.pre('findOne', function (next) {
    this.populate('cuisine categories').populate({
        path: 'ingredients',
        populate: [
            { path: 'fraction', model: 'Fraction' },
            { path: 'measure', model: 'Measure' }
        ]
    })
    next()
})

RecipeSchema.pre("find", function (next) {
    this
        .select("-ingredients -instructions -comments")
        .populate('cuisine categories')
    next()
})

const RecipeModel = mongoose.model("Recipe", RecipeSchema)

module.exports = RecipeModel

/*
FIND MANY HOOK:
.populate({
        path: "author",
        select: "_id name",
    });
*/