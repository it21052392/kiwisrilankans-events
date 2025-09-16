import { Category } from '../models/category.model.js';
import { Event } from '../models/event.model.js';

class CategoryService {
  async getCategories({ page = 1, limit = 10, search, active }) {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (active !== undefined) {
      query.active = active;
    }

    const categories = await Category.find(query)
      .populate('createdBy', 'name email')
      .sort({ sortOrder: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Category.countDocuments(query);

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCategoryById(id) {
    const category = await Category.findById(id).populate(
      'createdBy',
      'name email'
    );

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async createCategory(categoryData) {
    const category = await Category.create(categoryData);
    return category;
  }

  async updateCategory(id, updateData) {
    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findById(id);

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has events
    const eventCount = await Event.countDocuments({ category: id });
    if (eventCount > 0) {
      throw new Error('Cannot delete category with existing events');
    }

    await Category.findByIdAndDelete(id);
    return { success: true };
  }

  async toggleCategoryStatus(id) {
    const category = await Category.findById(id);

    if (!category) {
      throw new Error('Category not found');
    }

    category.active = !category.active;
    await category.save();

    return category;
  }

  async getActiveCategories() {
    return await Category.findActive();
  }

  async updateCategoryEventCount(categoryId) {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new Error('Category not found');
    }

    await category.updateEventCount();
    return category;
  }

  async getCategoryStats(categoryId) {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new Error('Category not found');
    }

    const stats = await Event.aggregate([
      { $match: { category: categoryId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEvents = stats.reduce((sum, stat) => sum + stat.count, 0);
    const publishedEvents =
      stats.find(stat => stat._id === 'published')?.count || 0;
    const draftEvents = stats.find(stat => stat._id === 'draft')?.count || 0;

    return {
      category: {
        id: category._id,
        name: category.name,
        eventCount: category.eventCount,
      },
      stats: {
        totalEvents,
        publishedEvents,
        draftEvents,
        active: category.active,
      },
    };
  }
}

export const categoryService = new CategoryService();
