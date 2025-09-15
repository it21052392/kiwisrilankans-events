import { User } from '../models/user.model.js';

class UserService {
  async getUsers({ page = 1, limit = 10, search, role }) {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select(
        '-password -emailVerificationToken -passwordResetToken -passwordResetExpires'
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await User.findById(id).select(
      '-password -emailVerificationToken -passwordResetToken -passwordResetExpires'
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(id, updateData) {
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select(
      '-password -emailVerificationToken -passwordResetToken -passwordResetExpires'
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new Error('User not found');
    }

    return { success: true };
  }

  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const users = stats.find(stat => stat._id === 'user')?.count || 0;
    const moderators = stats.find(stat => stat._id === 'moderator')?.count || 0;
    const admins = stats.find(stat => stat._id === 'admin')?.count || 0;

    return {
      total,
      users,
      moderators,
      admins,
    };
  }

  async getActiveUsers() {
    return await User.find({ isActive: true })
      .select(
        '-password -emailVerificationToken -passwordResetToken -passwordResetExpires'
      )
      .sort({ name: 1 });
  }

  async getUserByEmail(email) {
    return await User.findByEmail(email);
  }

  async createUser(userData) {
    const user = await User.create(userData);
    return user;
  }

  async updateUserRole(id, role) {
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select(
      '-password -emailVerificationToken -passwordResetToken -passwordResetExpires'
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async toggleUserStatus(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }
}

export const userService = new UserService();
