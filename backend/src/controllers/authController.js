import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

export const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        console.log('Registration attempt:', { email, firstName, lastName, hasPassword: !!password });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        const user = await User.create({
            email,
            password,
            firstName,
            lastName
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                forwardingEmail: user.settings.forwardingEmail
            },
            token
        });
    } catch (error) {
        console.log('Registration error:', error);
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: user.getPublicProfile(),
            token
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};
