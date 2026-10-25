import express from 'express';
import { upload } from '../middleware/upload.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }

  // Generate URL for uploaded file
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
  });
});

export default router;
