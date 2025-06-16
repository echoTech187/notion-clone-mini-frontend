const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { strict } = require('assert');

const userSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createAt: { type: Date, default: Date.now }
}, {
    strictPopulate: false
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    // const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
    // this.password = await crypto.createHash('sha256').update(this.password).digest('hex');
    next();
});

userSchema.methods.matchPassword = async function (password) {
    if (!password) {
        return false;
    }

    const isMatch = await bcrypt.compare(password, this.password).then(res => res);
    console.log(isMatch);
    return isMatch;

}

userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model('User', userSchema);