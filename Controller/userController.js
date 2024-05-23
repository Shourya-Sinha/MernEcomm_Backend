const User = require('../Models/userModel');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;

const JWT_SECRET = 'hjgJHGhjGJhg78TgHJbiklH76GUhGHJK';

const signToken = (userId) => {
    return jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '1h' });
};

const localTime = moment();
const newTime = localTime.format('YYYY-MM-DD HH:mm:ss');

exports.getUser = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in! Please log in to get access.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user still exists
        const currentUser = await User.findById(decoded.userId);
        if (!currentUser) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token does no longer exist.'
            });
        }

        // Check if user changed password after the token was issued
        if (currentUser.passwordChangedAt && currentUser.passwordChangedAt.getTime() / 1000 > decoded.iat) {
            return res.status(401).json({
                status: 'error',
                message: 'User recently changed password! Please log in again.'
            });
        }

        // Grant access to protected route
        req.user = currentUser;
        req.userId = currentUser._id;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token. Please log in again.'
        });
    }
}

exports.register = async (req, res) => {
    try {
        const { userName, email, password, confirmPassword } = req.body;

        if (!userName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'All field Required',
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Both Password should be match'
            });
        }

        const user = await User.findOne({ email: email });

        if (user) {
            return res.status(400).json({
                status: 'error',
                message: "User already Exist with this email try different One"
            });
        }

        const newUser = new User({
            userName,
            email,
            password,
            createdAt: newTime,
        });

        await newUser.save();

        return res.status(200).json({
            status: "success",
            message: "User registered successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email }).select("+password");

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'This email does not belong to any user. Try a different one.',
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                status: 'error',
                message: 'Password does not match.',
            });
        }

        const token = signToken(user._id);

        return res.status(200).json({
            status: 'success',
            message: 'Login successfully.',
            token,
            user_id: user._id,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}

exports.forgotPassowrd = async (req, res) => {
    try {
        const { email, newPass, newConfPass } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'User not found with this email',
            });
        }

        if (newPass !== newConfPass) {
            return res.status(400).json({
                status: 'error',
                message: "Both password field should be match"
            });
        }

        user.password = newPass;
        user.passwordChangedAt = newTime;

        await user.save();

        const token = signToken(user._id);

        return res.status(200).json({
            status: 'success',
            message: 'Password updated Successfully',
            user,
            token,
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}

// exports.updateMe = async (req, res) => {
//     try {
//         const { email, userName, password } = req.body;
//         const userId = req.userId;
//         //console.log('userid',userId);
//         const user = await User.findById(userId);
//         //console.log('user details',user);

//         if (!user) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'User not found',
//             });
//         }

//         if (email) {
//             const existing_user = await User.findOne({ email: email });

//             if (existing_user && existing_user._id.toString() !== userId) {
//                 return res.status(400).json({
//                     status: 'error',
//                     message: 'Email is already in use by another user',
//                 });
//             }
//             if (!password) {
//                 return res.status(400).json({
//                     status: 'error',
//                     message: 'Password is required to update email',
//                 });
//             }

//             const isPasswordCorrect = await bcrypt.compare(password, user.password);

//             if (!isPasswordCorrect) {
//                 return res.status(400).json({
//                     status: 'error',
//                     message: 'Incorrect Password',
//                 });
//             }
//             user.email = email;
//         }
//         if (userName) {
//             user.userName = userName;
//         }
//         if (req.body.images) {
//             let images = [];
//             if (typeof req.body.images === "string") {
//                 images.push(req.body.images);
//             } else {
//                 images = req.body.images;
//             }
//             console.log('files',images);
//             let imagesLink;
//             for (let image of images) {
//                 const result = await cloudinary.v2.uploader.upload(image, {
//                     folder: "User_Avatar",
//                 });
//                 imagesLink.push({
//                     public_id: result.public_id,
//                     url: result.secure_url,
//                 })
//             }

//             user.images = imagesLink;

//         }

// //         if (req.files && req.files.images) {
// //             let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
// //             let imagesLink = [];

// // console.log('files',req.files);
// //             for (let image of images) {
// //                 const result = await cloudinary.uploader.upload(image.tempFilePath, {
// //                     folder: "User_Avatar",
// //                 });
// //                 imagesLink.push({
// //                     public_id: result.public_id,
// //                     url: result.secure_url,
// //                 });
// //             }

// //             user.images = imagesLink;
// //         }


//         await user.save();

//         let token = null;
//         if (email) {
//             token = signToken(user._id);
//         }

//         return res.status(200).json({
//             status: 'success',
//             message: 'User updated successfully',
//             data: user,
//             token,
//         });


//     } catch (error) {
//         return res.status(500).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// }

// exports.updateMe = async (req, res) => {
//     try {
//         const { email, userName, password } = req.body;
//         const userId = req.userId;

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'User not found',
//             });
//         }

//         if (email) {
//             const existing_user = await User.findOne({ email: email });

//             if (existing_user && existing_user._id.toString() !== userId) {
//                 return res.status(400).json({
//                     status: 'error',
//                     message: 'Email is already in use by another user',
//                 });
//             }

//             if (!password) {
//                 return res.status(400).json({
//                     status: 'error',
//                     message: 'Password is required to update email',
//                 });
//             }

//             const isPasswordCorrect = await bcrypt.compare(password, user.password);

//             if (!isPasswordCorrect) {
//                 return res.status(400).json({
//                     status: 'error',
//                     message: 'Incorrect Password',
//                 });
//             }
//             user.email = email;
//         }

//         if (userName) {
//             user.userName = userName;
//         }

//         if (req.files && req.files.images) {
//             let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
//             let imagesLink = [];

//             for (let image of images) {
//                 const result = await cloudinary.uploader.upload(image.tempFilePath, {
//                     folder: "User_Avatar",
//                 });
//                 imagesLink.push({
//                     public_id: result.public_id,
//                     url: result.secure_url,
//                 });
//             }

//             user.images = imagesLink;
//         }

//         await user.save();

//         let token = null;
//         if (email) {
//             token = signToken(user._id);
//         }

//         return res.status(200).json({
//             status: 'success',
//             message: 'User updated successfully',
//             data: user,
//             token,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// };

exports.updateMe = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'User not found',
            });
        }

        const { email, userName, password } = req.body;

        //console.log('Request Body:', req.body);

        if (email) {
            const existing_user = await User.findOne({ email });

            if (existing_user && existing_user._id.toString() !== userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email is already in use by another user',
                });
            }

            if (!password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Password is required to update email',
                });
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Incorrect Password',
                });
            }
            user.email = email;
        }

        if (userName) {
            user.userName = userName;
        }

        if (req.files && req.files.images) {
            let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            let imagesLink = [];

            //console.log('Images:', images);

            for (let image of images) {
                const result = await cloudinary.uploader.upload(image.tempFilePath, {
                    folder: "User_Avatar",
                });
                imagesLink.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }

            user.images = imagesLink;
        }

        await user.save();

        let token = null;
        if (email) {
            token = signToken(user._id);
        }

        return res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: user,
            token,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
