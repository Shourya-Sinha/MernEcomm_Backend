const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Name is Required"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is Required"],
        validate: {
            validator: function (email) {
                return String(email).toLocaleLowerCase().match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
            },
            message: (props) => `Email (${props.value}) is invalid!`,
        },
    },
    password: {
        type: String,
    },
    createdAt: {
        type: Date,
    },
    passwordChangedAt: {
        type: Date
    },
    role:{
        type:String,
        default:'user',
    },
    images:[{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        },
    }]
});

// userSchema.pre("save", async function (next) {
//     if (!this.isModified('password') || !this.password) {
//         return next();
//     }

//     this.password = await bcrypt.hash(this.password.toString(), 12);
//     next();
// });
const localTime = moment();
const newTime = localTime.format('YYYY-MM-DD HH:mm:ss');

userSchema.pre("save", async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordChangedAt = newTime - 1000;
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;