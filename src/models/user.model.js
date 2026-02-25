const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required for creating user"],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'],
        unique: [true, "email all ready exiest"]
    },
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
    },
    systemUser: {
        type: Boolean,
        immutable: true,
        default: false,
        select: false
    }
},
    { timestamps: true }//NOTE - //! it will show hwen user updated tiem table  
)
//! it always run fast 

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return
    }
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    return
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}


module.exports = mongoose.model('user', userSchema)