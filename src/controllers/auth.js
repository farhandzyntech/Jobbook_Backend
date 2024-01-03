const User = require('../schemas/User')
const crypto = require('crypto');
const asyncHandler = require('../middleware/async');
const nodemailer = require('../utils/nodemailer');
const ErrorResponse = require('../utils/errorResponse');

//--//
/**
 * @description creates a new user
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {function} next - next middleware function
 * @returns {object} JSON response
 */
exports.signup = async (req, res, next) => {
  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(new ErrorResponse('Email is already registered', 409));
    }
    // Create and save a new user document
    const user = await User.create(req.body)
    
    // grab token and send to email
    const confirmEmailToken = user.generateEmailConfirmToken();

    // Create reset url
    const confirmEmailURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/jobbook/auth/confirmemail?token=${confirmEmailToken}`;

    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

    user.save({ validateBeforeSave: false });

    const sendResult = await nodemailer.sendEmail({
      email: user.email,
      subject: 'Email confirmation token',
      message,
    });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('ERROR', error)
    return next(error);
  }
}

exports.signupFacebook = async (req, res, next) => {
  try {
    const { facebookId, token, email, displayName } = req.body;

    // Check if the Facebook ID is already registered
    const user = await User.findOne({
      $or: [
        { "facebook.id": facebookId },
        { email: email }
      ]
    });
    if (user) {
      if(user.facebook.id === undefined){
        user.facebook.id = facebookId,
        user.facebook.token = token
        user.facebook.email = email
        user.facebook.displayName = displayName
      }
      await user.save();
      sendTokenResponse(user, 200, res);
    }else{
      let newUser = new User();
      newUser.email = email
      newUser.name = req.body.name
      newUser.email = email
      newUser.facebook.id = facebookId
      newUser.facebook.token = token
      newUser.facebook.email = email
      newUser.facebook.displayName = displayName
      await newUser.save();
      sendTokenResponse(newUser, 200, res);
    }
    
    // Create a new user with Facebook authentication
    // const newUser = new User({
    //   facebook: {
    //     id: facebookId,
    //     token,
    //     email,
    //     displayName,
    //   },
    // });

    // await newUser.save();

    // return res.status(201).json({ message: 'User created successfully with Facebook' });
  } catch (error) {
    console.error('ERROR', error)
    return next(error);
  }
}


exports.signupGoogle = async (req, res, next) => {
  try {
    const { googleId, token, email, name } = req.body;

    // Check if the google ID is already registered
    const user = await User.findOne({
      $or: [
        { "google.id": googleId },
        { email: email }
      ]
    });
    if (user) {
      if(user.google.id === undefined){
        user.google.id = googleId,
        user.google.token = token
        user.google.email = email
        user.google.displayName = name
      }
      await user.save();
      sendTokenResponse(user, 200, res);
    }else{
      let newUser = new User();
      newUser.email = email
      newUser.name = req.body.name
      newUser.email = email
      newUser.google.id = googleId
      newUser.google.token = token
      newUser.google.email = email
      newUser.google.displayName = displayName
      await newUser.save();
      sendTokenResponse(newUser, 200, res);
    }
    
    // Create a new user with google authentication
    // const newUser = new User({
    //   google: {
    //     id: googleId,
    //     token,
    //     email,
    //     displayName,
    //   },
    // });

    // await newUser.save();

    // return res.status(201).json({ message: 'User created successfully with google' });
  } catch (error) {
    console.error('ERROR', error)
    return next(error);
  }
}


exports.signupApple = async (req, res, next) => {
  try {
    const { appleId, token, email, name } = req.body;

    // Check if the apple ID is already registered
    const user = await User.findOne({
      $or: [
        { "apple.id": appleId },
        { email: email }
      ]
    });
    if (user) {
      if(user.apple.id === undefined){
        user.apple.id = appleId,
        user.apple.token = token
        user.apple.email = email
        user.apple.displayName = name
      }
      await user.save();
      sendTokenResponse(user, 200, res);
    }else{
      let newUser = new User();
      newUser.email = email
      newUser.name = req.body.name
      newUser.email = email
      newUser.apple.id = appleId 
      newUser.apple.token = token
      newUser.apple.email = email
      newUser.apple.displayName = displayName
      await newUser.save();
      sendTokenResponse(newUser, 200, res);
    }
    
    // Create a new user with apple authentication
    // const newUser = new User({
    //   apple: {
    //     id: appleId,
    //     token,
    //     email,
    //     displayName,
    //   },
    // });

    // await newUser.save();

    // return res.status(201).json({ message: 'User created successfully with apple' });
  } catch (error) {
    console.error('ERROR', error)
    return next(error);
  }
}


/**
 * @description Authenticate user and generate token
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {function} next - next middleware function
 * @returns {object} JSON response
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password, socialId } = req.body;

    // Validate email and password
    if (!username || !password) return next(new ErrorResponse('Please provide an email and password', 400));

    // Check for user
    const user = await User.findOne({
      $or: [
        { email: username },
        { phone: username },
      ]
    }).select("+password");
    
    if (!user || !user.password) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    if(user && socialId) { sendTokenResponse(user, 200, res); }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    sendTokenResponse(user, 200, res);
    
    // // Get token
    // const token = user.getSignedJwtToken();

    // res.status(200).cookie('token', token).json({
    //   success: true,
    //   token,
    //   user: {
    //     id: user._id,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     email: user.email,
    //     phone: user.phone,
    //     dob: user.dob
    //   }
    // });
  } catch (error) {
    console.error('ERROR', error);
    return next(error);
  }
};

// Social login
exports.socialLogin = async (req, res, next) => {
  try {
    const { socialId } = req.body;
    // Check if the Social ID is registered
    const user = await User.findOne({
      $or: [
        { "facebook.id": socialId },
        { "google.id": socialId },
        { "apple.id": socialId },
      ]
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid social token' });
    }
    if (user) {
      await user.save();
      sendTokenResponse(user, 200, res);
    }
  } catch (error) {
    console.error('ERROR', error);
    return next(error);
  }
};

/**
 * @description generates a 4 digit otp and sends it to the user's phone number
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {function} next - next middleware function
 * @returns {object} JSON response
 */
exports.generateOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
        return next(new ErrorResponse('Phone number is required', 400));
    }
  
    const user = await User.findOne({
      phone: phone,
    });

    if (!user) {
      return next(new ErrorResponse('Invalid phone', 400));
    }

    //generate 4 digit random number 
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.otp = otp.toString();
    user.otp = '1010';
    // user.confirmationToken = null;

    await user.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('ERROR', error);
    return next(error);
  }
};

/**
 * @description recieve a 4 digit otp and verify it from the user's phone number
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {function} next - next middleware function
 * @returns {object} JSON response
 */
// exports.verifyotp = async (req, res, next) => {
//   try {
//     const { phone, code } = req.body;

//     if (!code || !phone) {
//         return next(new ErrorResponse('phome & otp is required', 400));
//     }
  
//     const user = await User.findOne({
//       phone: phone,
//     });

//     if (!user) {
//       return next(new ErrorResponse('Invalid phone', 400));
//     }

//     if(code !== user.otp){
//       return next(new ErrorResponse('Invalid otp'), 400)
//     }else{
//     //remove otp from use 
//       user.otp = '';
//       await user.save();
//     }
//     res.status(200).json({
//       success: true,
//       data: {},
//     });
//   } catch (error) {
//     console.error('ERROR', error);
//     return next(error);
//   }
// };
exports.verifyotp = async (req, res, next) => {
  let user;
  try {
    const { username, code } = req.body;

    // Validate email and code
    if (!username || !code) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    user = await User.findOne({
      $or: [
        { email: username },
        { phone: username },
      ]
    }).select('+otp');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const resetToken = user.getResetPasswordToken();

    if(code != user.otp){
      return next(new ErrorResponse('Invalid otp'), 400)
    }else if(code == user.otp){
    //remove otp from use 
      user.otp = '';
      await user.save({ validateBeforeSave: false });
      // await user.save();
    }
    res.status(200).json({
      success: true,
      data: {
        token: resetToken
      },
    });
  } catch (error) {
    console.error('ERROR', error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    return next(error);
  }
};


exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @description Get the currently authenticated user
 * @param {object} req - request object
 * @param {object} res - response object
 * @returns {object} JSON response
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name phone emailAddress mobileNumber dob address licence picture');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
      console.error('ERROR', error)
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find().select('-otp -confirmEmailToken -isEmailConfirmed -twoFactorEnable');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
      console.error('ERROR', error)
  }
}

exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.name = req.body.name || user.name;
    user.about = req.body.about || user.about;
    user.skills = req.body.skills || user.skills;
    let experience =  JSON.parse(req.body.experience)
    experience.forEach(element => {
      user.experience.push(element)
    });
    user.dob = req.body.dob || user.dob;
    user.address = req.body.address || user.address;
    user.picture = (req.file) ? req.file.filename : user.picture || "";
    await user.save();
    return  res.status(200).json({
      success: true,
      data: user,
    });
      // if(!user){
      //   return res.status(400).json({success: false, msg:"No user found"})
      // }
      //   // Update user fields
      //   // Check for existing email
      //   if (req.body.email !== user.email) {
      //     var exists = await User.findOne({email: req.body.email});
      //     if (exists) {
      //       return next(new ErrorResponse('Email already exist', 404));
      //     }
      //   } 
      //   user.name = req.body.name || user.name;
      //   user.email = req.body.email || user.email;
        // const updatedUser = await user.updateOne(req.body)
  } catch (error) {
      console.error('ERROR', error)
      return next(error)
  }
}

// exports.forgotPassword = asyncHandler(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new ErrorResponse('There is no user with that email', 404));
//   }
//   // Get reset token
//   const resetToken = user.getResetPasswordToken();
//   await user.save({ validateBeforeSave: false });

//   // Create reset url
//   const resetUrl = `${req.protocol}://${req.get(
//     'host',
//   )}/api/v1/auth/resetpassword/${resetToken}`;
//   const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  
//   try {
//     await nodemailer.sendEmail({
//       email: user.email,
//       subject: 'Password reset token',
//       message,
//     });
//     res.status(200).json({ success: true, data: 'Email sent' });
//   } catch (err) {
//     console.log(err);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(new ErrorResponse('Email could not be sent', 500));
//   }
// });

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if(req.body.email){
    const user = await User.findOne({ email: req.body.email }).select('+otp');
      if (!user) {
        return next(new ErrorResponse('No user found', 404));
      }
      //generate 4 digit random number 
      const otp = Math.floor(1000 + Math.random() * 9000);
      // user.otp = otp.toString();
      user.otp = '1010';
      // user.confirmationToken = null;
  
      // Get reset token
      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });
    
      // Create reset url
      // const resetUrl = `${req.protocol}://${req.get(
      //   'host',
      // )}/api/v1/auth/resetpassword/${resetToken}`;
      const message = `You are receiving this email because you (or someone else) has requested the reset of a password ${otp}`;
      
      try {
        await nodemailer.sendEmail({
          email: user.email,
          subject: 'Password reset token',
          message,
        });
        res.status(200).json({ success: true, data: "otp sent to email" });
      } catch (err) {
        console.log(err);
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpire = undefined;
        // await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse('Email could not be sent', 500));
      }
  }else if(req.body.phone){
    try {
      const { phone } = req.body;
      const user = await User.findOne({
        phone: phone,
      }).select('+otp');
  
      if (!user) {
        return next(new ErrorResponse('Invalid phone', 400));
      }
  
      //generate 4 digit random number 
      const otp = Math.floor(1000 + Math.random() * 9000);
      // user.otp = otp.toString();
      user.otp = '1010';
      // user.confirmationToken = null;
  
      // Get reset token
      // const resetToken = user.getResetPasswordToken();
      await user.save();
  
      res.status(200).json({
        success: true,
        data: "opt sent to phone",
      });
    } catch (error) {
      console.error('ERROR', error);
      return next(error);
    }
  }else{
    return next(new ErrorResponse("Please provide email or phone", 400))
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.confirmEmail = asyncHandler(async (req, res, next) => {
  // grab token from email
  const { token } = req.query;

  if (!token) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  const splitToken = token.split('.')[0];
  const confirmEmailToken = crypto
    .createHash('sha256')
    .update(splitToken)
    .digest('hex');

  // get user by token
  const user = await User.findOne({
    confirmEmailToken,
    isEmailConfirmed: false,
  });

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  // update confirmed to true
  user.confirmEmailToken = undefined;
  user.isEmailConfirmed = true;

  // save
  user.save({ validateBeforeSave: false });

  // return token
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();
    res.status(statusCode).cookie('token', token).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  };
  