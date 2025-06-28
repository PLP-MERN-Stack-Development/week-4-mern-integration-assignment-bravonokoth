const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slug: { type: String, unique: true },
  featuredImage: { type: String, default: 'default-post.jpg' },
  isPublished: { type: Boolean, default: false },
  comments: [
    {
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Method to increment view count
postSchema.methods.incrementViewCount = async function () {
  this.views += 1;
  await this.save();
};

// Method to add a comment
postSchema.methods.addComment = async function (userId, content) {
  this.comments.push({ content, author: userId });
  await this.save();
};

module.exports = mongoose.model('Post', postSchema);