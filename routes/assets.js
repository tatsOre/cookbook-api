const router = require("express").Router();
const { StatusCodes } = require('http-status-codes');

const Category = require("../models/assets/Category");
const Cuisine = require('../models/assets/Cuisine');
const Fraction = require("../models/assets/Fraction");
const Measure = require("../models/assets/Measure");

const {
    FRACTIONS_OPTIONS,
    MEASURE_OPTIONS,
    CATEGORIES_OPTIONS,
    CUISINE_OPTIONS,
    FIELD_ASSETS
} = require("../models/assets/index");


const MODELS = {
    category: Category,
    cuisine: Cuisine,
    fraction: Fraction,
    measure: Measure
}

/**
 * Get api/v2/assets/
 * Retrieve FrontEnd assets for Submit Recipe Form Dropdowns
 */
module.exports = app => {
    app.get('/api/v2/assets', async (req, res) => {
        const [category, cuisine, fraction, measure] = await Promise.all([
            Category.find({}).select("-__v").sort({ label: "asc" }),
            Cuisine.find({}).select("-__v").sort({ label: "asc" }),
            Fraction.find({}).select("-__v"),
            Measure.find({}).select("-__v")
        ]);

        res.status(StatusCodes.OK).json({
            categories_options: category,
            cuisine_options: cuisine,
            fraction_options: fraction,
            measure_options: measure
        });
    })

    app.post("/api/v2/assets/:field", async (req, res) => {
        const { field } = req.params;

        if (!FIELD_ASSETS.includes(field)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "wrong field"
            })
        }

        if (!req.body.label) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Label value is missing"
            })
        }

        if (field === "category"
            && (!req.body.decimal || isNaN(req.body.decimal))
        ) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Decimal value is missing and should be a number"
            })
        }
        const doc = await MODELS[field].create(req.body)
        res.status(StatusCodes.CREATED).json({
            field, doc, message: "success"
        })
    })

    app.put("/api/v2/:field/:id", async (req, res) => {
        const { field, id } = req.params;

        if (!FIELD_ASSETS.includes(field) || !id) {
            return res.status(400).json({ message: "Wrong field parameter or missing id" });
        }

        if (!req.body.label) {
            return res.status(400).json({ message: "Label value is missing" })
        }

        if (field === "category"
            && (!req.body.decimal || isNaN(req.body.decimal))
        ) {
            return res.status(400).json({
                message: "Decimal value is missing and should be a number"
            })
        }

        const doc = await MODELS[field].findOneAndUpdate({
            _id: id
        }, req.body, { new: true })

        res.status(StatusCodes.OK).json({ field, doc, message: "success" })
    })

    app.delete("/api/v2/:field/:id", async (req, res) => {
        const { field, id } = req.params;

        if (!FIELD_ASSETS.includes(field) || !id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Wrong field parameter or missing id"
            })
        }
        await MODELS[field].findByIdAndRemove(id)
        res.status(StatusCodes.NO_CONTENT).send()
    })

    /**
     * (!) Only once. Populates DB.
     * To populate again remove underscores from URI.
     */
    app.get("api/v2/assets/seed__", async (req, res) => {
        await Cuisine.deleteMany({});
        await Category.deleteMany({});
        await Fraction.deleteMany({});
        await Measure.deleteMany({});

        for (const value of CUISINE_OPTIONS) {
            await Cuisine.create({ label: value });
        };
        for (const value of CATEGORIES_OPTIONS) {
            await Category.create({ label: value });
        };
        for (const obj of FRACTIONS_OPTIONS) {
            await Fraction.create({ label: obj.label, decimal: obj.decimal });
        };
        for (const value of MEASURE_OPTIONS) {
            await Measure.create({ label: value })
        };
        res.status(StatusCodes.CREATED).json({ message: 'You all seed' });
    })

}
