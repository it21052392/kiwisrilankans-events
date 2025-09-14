import { asyncHandler } from '../utils/asyncHandler.js';
import { userService } from '../services/user.service.js';
import { logger } from '../config/logger.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;

  const users = await userService.getUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role,
  });

  res.json({
    success: true,
    data: users,
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await userService.getUserById(id);

  res.json({
    success: true,
    data: { user },
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const user = await userService.updateUser(id, updateData);

  logger.info(`User updated: ${user.email}`);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await userService.deleteUser(id);

  logger.info(`User deleted: ${id}`);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updateData = req.body;

  const user = await userService.updateUser(userId, updateData);

  logger.info(`Profile updated: ${user.email}`);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  await userService.changePassword(userId, currentPassword, newPassword);

  logger.info(`Password changed: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
};
