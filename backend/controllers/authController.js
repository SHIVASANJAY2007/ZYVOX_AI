import bcrypt from 'bcrypt';
import {
  createUser,
  findUserByEmail,
  updateLastLogin
} from '../database/dbService.js';

export const signup = async (req, res, next) => {
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone, email, and password are required'
    });
  }

  try {
    const newUser = await createUser(name, phone, email, password);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        personNo: newUser.person_id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email
      }
    });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    const updatedUser = await updateLastLogin(user.person_id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        personNo: updatedUser.person_id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email
      }
    });
  } catch (error) {
    next(error);
  }
};

export const checkEmail = async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email parameter is required'
    });
  }

  try {
    const user = await findUserByEmail(email);
    return res.status(200).json({
      success: true,
      exists: !!user,
      message: user ? 'Email already exists' : 'Email is available'
    });
  } catch (error) {
    next(error);
  }
};
