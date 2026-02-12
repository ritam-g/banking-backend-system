const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { use } = require("react");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required for creating user"],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'],
        unique: [true, "email all ready exiest"]
    }
    ,
    name: {
        type: String,
        required: [true, "name is required for creating account"],

    },
    password: {
        type: String,
        required: [true, "password is required for creating account"],
        minlength: [6, "password must be at least 6 characters long"],
        select: false            //! WARNING it will not come those quesry which is reated select:false
        //! it wil come whey we say 
    }
}, {
    timestamps: true
}
)

//! pre save hook for hashing password || not rusing for now thi sproject
userSchema.pre('save', async function (next) {
if (!this.isModified('password')) {return next() }
try {
const salt = await bcrypt.genSalt(10)
this.password = await bcrypt.hash(this.password, salt)
next() }
catch (error) {
next(error)}
})

module.exports = mongoose.model('user', userSchema)