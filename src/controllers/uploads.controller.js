import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadService } from '../services/uploads.service.js';
import { logger } from '../config/logger.js';

// @desc    Upload single file
// @route   POST /api/uploads/single
// @access  Private
const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const { type = 'general' } = req.body;
  const userId = req.user._id;

  // Debug logging
  logger.info('Upload request received:', {
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
    uploadType: type,
    userId: userId,
  });

  const uploadResult = await uploadService.uploadSingle(req.file, type, userId);

  logger.info(`File uploaded: ${uploadResult.filename} - ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: uploadResult,
  });
});

// @desc    Upload multiple files
// @route   POST /api/uploads/multiple
// @access  Private
const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
    });
  }

  const { type = 'general' } = req.body;
  const userId = req.user._id;

  const uploadResults = await uploadService.uploadMultiple(
    req.files,
    type,
    userId
  );

  logger.info(`${uploadResults.length} files uploaded - ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: `${uploadResults.length} files uploaded successfully`,
    data: { uploads: uploadResults },
  });
});

// @desc    Get file by ID
// @route   GET /api/uploads/:id
// @access  Private
const getFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const file = await uploadService.getFileById(id, userId);

  res.json({
    success: true,
    data: { file },
  });
});

// @desc    Get user's files
// @route   GET /api/uploads/my-files
// @access  Private
const getMyFiles = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, type } = req.query;

  const files = await uploadService.getUserFiles(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
  });

  res.json({
    success: true,
    data: files,
  });
});

// @desc    Delete file
// @route   DELETE /api/uploads/:id
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await uploadService.deleteFile(id, userId);

  logger.info(`File deleted: ${id} - ${req.user.email}`);

  res.json({
    success: true,
    message: 'File deleted successfully',
  });
});

// @desc    Get file download URL
// @route   GET /api/uploads/:id/download
// @access  Private
const getDownloadUrl = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const downloadUrl = await uploadService.getDownloadUrl(id, userId);

  res.json({
    success: true,
    data: { downloadUrl },
  });
});

// @desc    Get all files (Admin)
// @route   GET /api/uploads
// @access  Private/Admin
const getAllFiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, userId, startDate, endDate } = req.query;

  const files = await uploadService.getAllFiles({
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    userId,
    startDate,
    endDate,
  });

  res.json({
    success: true,
    data: files,
  });
});

// @desc    Clean up orphaned files
// @route   POST /api/uploads/cleanup
// @access  Private/Admin
const cleanupOrphanedFiles = asyncHandler(async (req, res) => {
  const result = await uploadService.cleanupOrphanedFiles();

  logger.info(`Cleanup completed: ${result.deletedCount} files deleted`);

  res.json({
    success: true,
    message: `Cleanup completed: ${result.deletedCount} files deleted`,
    data: result,
  });
});

export {
  uploadSingle,
  uploadMultiple,
  getFileById,
  getMyFiles,
  deleteFile,
  getDownloadUrl,
  getAllFiles,
  cleanupOrphanedFiles,
};
