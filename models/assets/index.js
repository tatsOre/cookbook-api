const FIELD_ASSETS = ['cuisine', 'category', 'measure', 'fraction'];

const CUISINE_OPTIONS = [
    "african",
    "asian",
    "caribbean",
    "chinese",
    "french",
    "greek",
    "indian",
    "italian",
    "japanese",
    "latin american",
    "mexican",
    "mediterranean",
    "american",
    "spanish",
    "thai",
    "vietnamese",
    "other",
]

const CATEGORIES_OPTIONS = [
    "breakfast",
    "lunch",
    "dinner",
    "appetizer",
    "soup",
    "salad",
    "dessert",
    "sauce",
    "drink",
    "vegetarian",
    "easy",
    "quick",
    "for two",
]

const FRACTIONS_OPTIONS = [
    { label: "0", decimal: 0 },
    { label: "⅛", decimal: 0.125 }, // 1/8  ⅛ &#8539;
    { label: "¼", decimal: 0.25 }, // 1/4 ¼  &#188;
    { label: "⅓", decimal: 0.33333333333333 }, // 1/3  ⅓  &#8531;
    { label: "½", decimal: 0.5 }, // 1/2 ½  &#189;
    { label: "⅔", decimal: 0.66666666666667 }, // 2/3 ⅔  &#8532;
    { label: "¾", decimal: 0.75 }, // 3/4 ¾ &#190;
]

const MEASURE_OPTIONS = [
    "teaspoon",
    "tablespoon",
    "cup",
    "gallon",
    "gram",
    "pound",
    "kilogram",
    "ounce",
    "litre"
]

module.exports = {
    FRACTIONS_OPTIONS,
    MEASURE_OPTIONS,
    CATEGORIES_OPTIONS,
    CUISINE_OPTIONS,
    FIELD_ASSETS
}
