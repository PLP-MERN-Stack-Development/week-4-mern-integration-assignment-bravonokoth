const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth'); // Updated to destructure protect
const upload = require('../middleware/upload');

router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:idOrSlug', postController.getPost);
router.post('/', protect, upload.single('featuredImage'), postController.createPost); // Use protect
router.put('/:id', protect, upload.single('featuredImage'), postController.updatePost); // Use protect
router.delete('/:id', protect, postController.deletePost); // Use protect
router.post('/:postId/comments', protect, postController.addComment); // Use protect

module.exports = router;