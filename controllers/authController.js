const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const uuid = require('uuid').v7;

const getSignedJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

const sendTokenResponse = (user, statusCode, res) => {
    const token = getSignedJwtToken(user._id);
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Lax'
    }
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            id: user.key,
            name: user.username
        }
    });
}

exports.register = asyncHandler(async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        // const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));

        // Create user
        const user = await User.create({
            key: uuid(),
            username,
            email,
            password: hashedPassword
        });

        if (user) {
            sendTokenResponse(user, 201, res);
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
        // throw new Error('Server Error');
    }

});


exports.login = asyncHandler(async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email tidak terdaftar' });
        }
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(400).json({ message: 'Password salah' });
        }
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

exports.me = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({
            success: user ? true : false,
            token: getSignedJwtToken(user._id),
            data: {
                id: user.key,
                name: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
    }

});

exports.logout = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 1 * 1000),
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Lax'
    });
    return res.status(200).json({
        success: true,
        message: 'Logout successfully'
    });
})
