const Post = require('../models/Post');
const Category = require('../models/Category');

// Get all posts with pagination and optional category filter
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = category ? { category } : {};
    const posts = await Post.find(query)
      .populate('author', 'username')
      .populate('category', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Post.countDocuments(query);
    res.json({ posts, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single post by ID or slug
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      $or: [{ _id: req.params.idOrSlug }, { slug: req.params.idOrSlug }],
    })
      .populate('author', 'username')
      .populate('category', 'name');
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    await post.incrementViewCount();
    res.json(post);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, isPublished } = req.body;
    const featuredImage = req.file ? req.file.filename : 'default-post.jpg';
    const post = new Post({
      title,
      content,
      excerpt,
      category,
      tags: tags ? tags.split(',') : [],
      isPublished: isPublished === 'true',
      author: req.user._id,
      featuredImage,
    });
    await post.save();
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, isPublished } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    post.title = title || post.title;
    post.content = content || post.content;
    post.excerpt = excerpt || post.excerpt;
    post.category = category || post.category;
    post.tags = tags ? tags.split(',') : post.tags;
    post.isPublished = isPublished !== undefined ? isPublished === 'true' : post.isPublished;
    post.featuredImage = req.file ? req.file.filename : post.featuredImage;
    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    await post.addComment(req.user._id, content);
    const updatedPost = await Post.findById(req.params.postId).populate('comments.user', 'username');
    res.json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Search posts
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('author', 'username')
      .populate('category', 'name');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};