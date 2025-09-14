import express from 'express';
import multer from 'multer';
import {
  uploadSingle,
  uploadMultiple,
  getFileById,
  getMyFiles,
  deleteFile,
  getDownloadUrl,
  getAllFiles,
  cleanupOrphanedFiles,
} from '../controllers/uploads.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/rbac.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.js';
import { uploadSchemas } from '../validators/upload.schema.js';
import { commonSchemas } from '../middlewares/validate.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files
  },
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  fileFilter: (req, file, cb) => {
    // Allow common image and document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      return cb(null, true);
    } else {
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      cb(
        new Error('Invalid file type. Only images and documents are allowed.')
      );
    }
  },
});

// Protected routes
router.use(authenticate);

// File upload routes
router.post(
  '/single',
  upload.single('file'),
  validateBody(uploadSchemas.uploadSingle),
  uploadSingle
);
router.post(
  '/multiple',
  upload.array('files', 5),
  validateBody(uploadSchemas.uploadMultiple),
  uploadMultiple
);

// File management routes
router.get('/:id', validateParams(commonSchemas.mongoId), getFileById);
router.get('/my-files', validateQuery(commonSchemas.pagination), getMyFiles);
router.delete('/:id', validateParams(commonSchemas.mongoId), deleteFile);
router.get(
  '/:id/download',
  validateParams(commonSchemas.mongoId),
  getDownloadUrl
);

// Admin only routes
router.use(requireAdmin);

router.get('/', validateQuery(commonSchemas.pagination), getAllFiles);
router.post('/cleanup', cleanupOrphanedFiles);

export default router;
