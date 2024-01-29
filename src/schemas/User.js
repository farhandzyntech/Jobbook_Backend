const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
    name: { type: String },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      sparse: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      // required: [true, 'Please add a password'],
      required: false,
      minlength: 6,
      select: false
    },
    facebook: {
        id: { type: String, unique: true, sparse: true },
        token: String,
        email: String,
        displayName: String,
    },
    google: {
      id: { type: String, unique: true, sparse: true },
      token: String,
      email: String,
      displayName: String,
    },
    apple: {
      id: { type: String, unique: true, sparse: true },
      token: String,
      email: String,
      displayName: String,
    },
    phone: { type: String, unique: true, sparse: true },
    role: {
        type: String,
        required: true,
        enum: ['talent', 'company'],
        default: 'talent'
    },
    picture: { type: String },
    location: { type: String },
    address: { type: String },
    dob: { type: String },
    about: { type: String },
    skills: { type: String },
    experience: [{
      company: String,
      title: String,
      from: Date,
      to: Date,
      current: {type: Boolean, default: false}
    }],
    offers: {type: String},
    specialities: {type: String},
    experiencedIn: {type: String},
    level:{type: String},
    expectation: {type: String},
    // Jobs against this user have applied
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job', select: false }],
    // Jobs which user have saved 
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job', select: false }],
    // This field is only relevant for instructors
    trainingsTeaching: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Training' }],
    // This field is only relevant for students
    trainingsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Training' }],
    otp: { type: String },
    status: { type: String },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    resetPasswordToken: {type: String},
    resetPasswordExpire: {type: Date},
    confirmEmailToken: {type: String},
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    confirmPhoneToken: {type: String},
    isPhoneConfirmed: {
      type: Boolean,
      default: false,
    },
    twoFactorCode: {type: String},
    twoFactorCodeExpire: {type: Date},
    twoFactorEnable: {
      type: Boolean,
      default: false,
    },
    device_type:{ type: String },
    device_token:{ type: String },
},{ timestamps: true })

/**
 * Encrypts the password before saving it to the database.
 * @param {Function} next - Callback function.
 */
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


/**
 * Sign JWT and return
 * @returns {string} JWT token
 */
UserSchema.methods.getSignedJwtToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  // this.tokens = { token };
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

/**
 * Compares the given plain text password with the hashed password in the database.
 * @param {string} enteredPassword - The password entered by the user.
 * @returns {boolean} Returns true if the passwords match, else returns false.
 */UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

/**
 * Generate email confirm token
 * @param {Function} - Callback function
 */UserSchema.methods.generateEmailConfirmToken = function () {
  // email confirmation token
  const confirmationToken = crypto.randomBytes(20).toString('hex');

  this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(confirmationToken)
    .digest('hex');

  const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
  const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
  return confirmTokenCombined;
};

// // Reverse populate with virtuals
// UserSchema.virtual('jobs', {
//   ref: 'Job',
//   localField: '_id',
//   foreignField: 'user',
//   justOne: false
// });

UserSchema.indexes({ email: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
