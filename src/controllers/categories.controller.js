import { asyncHandler } from '../utils/asyncHandler.js';
import { categoryService } from '../services/categories.service.js';
import { logger } from '../config/logger.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, active } = req.query;

  const categories = await categoryService.getCategories({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    active: active === 'true',
  });

  res.json({
    success: true,
    data: categories,
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await categoryService.getCategoryById(id);

  res.json({
    success: true,
    data: { category },
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const categoryData = req.body;

  const category = await categoryService.createCategory(categoryData);

  logger.info(`Category created: ${category.name}`);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category },
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const category = await categoryService.updateCategory(id, updateData);

  logger.info(`Category updated: ${category.name}`);

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await categoryService.deleteCategory(id);

  logger.info(`Category deleted: ${id}`);

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

// @desc    Toggle category status
// @route   PATCH /api/categories/:id/toggle
// @access  Private/Admin
const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await categoryService.toggleCategoryStatus(id);

  logger.info(
    `Category status toggled: ${category.name} - ${category.active ? 'Active' : 'Inactive'}`
  );

  res.json({
    success: true,
    message: `Category ${category.active ? 'activated' : 'deactivated'} successfully`,
    data: { category },
  });
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};
