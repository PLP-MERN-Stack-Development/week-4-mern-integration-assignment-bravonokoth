import { useState, useEffect, useContext } from 'react';
import { postService, categoryService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PostForm = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    isPublished: false,
    featuredImage: null,
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAllCategories().then((data) => setCategories(data));
    if (postId) {
      postService.getPost(postId).then((data) =>
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category._id,
          tags: data.tags.join(','),
          isPublished: data.isPublished,
          featuredImage: null,
        })
      );
    }
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to create a post');
      return;
    }
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('excerpt', formData.excerpt);
    data.append('category', formData.category);
    data.append('tags', formData.tags);
    data.append('isPublished', formData.isPublished);
    if (formData.featuredImage) {
      data.append('featuredImage', formData.featuredImage);
    }

    try {
      if (postId) {
        await postService.updatePost(postId, data);
        alert('Post updated successfully');
      } else {
        await postService.createPost(data);
        alert('Post created successfully');
      }
      navigate('/');
    } catch (error) {
      alert('Error saving post: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Excerpt</label>
        <input
          type="text"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        />
      </div>
      <div>
        <label>Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />
      </div>
      <div>
        <label>Publish</label>
        <input
          type="checkbox"
          checked={formData.isPublished}
          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
        />
      </div>
      <div>
        <label>Featured Image</label>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => setFormData({ ...formData, featuredImage: e.target.files[0] })}
        />
      </div>
      <button type="submit">{  postId ? 'Update Post' : 'Create Post'}</button>
    </form>
  );
};

export default PostForm;