const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const logger = require("morgan");
require("express-async-errors")
require("dotenv").config({ path: "variables.env" });

// Register Models
require("./models/Recipe");
require("./models/User");
require("./models/ShoppingList");

// MongoDB
require("./config/db")();

const errorHandlerMiddleware = require('./middleware/error-handler')

const app = express();

// adding Helmet to enhance API's security
app.use(helmet());

app.use(
    cors({
        credentials: true,
        origin: true,
    })
);
app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// App Custom Routes
app.get("/", (req, res) => res.status(200).send("Welcome to Cookbook API 2.0 :)"))
require('./routes/auth')(app)
require('./routes/recipes')(app)
require('./routes/assets')(app)

// catch 404 and forward to error handler
app.use((req, res) => res.status(404).send('Route does not exist'))

// Handle errors
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port`, PORT);
});
