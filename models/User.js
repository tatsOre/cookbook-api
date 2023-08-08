const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const validator = require('validator')

const SALT_VALUE = 10

const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: [true, "Please provide an email address"],
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email"
        }
    },
    password: {
        type: String,
        required: [true, 'Please create a password'],
        minlength: [8, "Password must be at least 8 characters"]
    },
    providers: {
        google: {
            id: String,
            email: String,
            photo: String,
        },
    },
    about: String,
    avatar: String,
    favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    role: {
        type: String,
        enum: {
            values: ['admin', 'user'],
            message: `{VALUE} is not supported for user role`
        },
        default: 'user'
    },
},
    { timestamps: true }
);

UserSchema.pre('save', async function () {
    // Hash the password only when it has changed (or new)
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(SALT_VALUE)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (password) {
    const compare = await bcrypt.compare(password, this.password)
    return compare
}

UserSchema.methods.toAuthObject = function () {
    console.log('auth')
    return { _id: this._id, email: this.email, name: this.name }
}

module.exports = mongoose.model('User', UserSchema)
