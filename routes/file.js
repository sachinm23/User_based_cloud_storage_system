const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, list, deleteFile } = require('../controllers/fileController');

const router = express.Router();
const uploadMiddleware = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MB limit

router.post('/upload', authMiddleware, uploadMiddleware.single('file'), upload);
router.get('/', authMiddleware, list);
router.delete('/:id', authMiddleware, deleteFile);

module.exports = router;



