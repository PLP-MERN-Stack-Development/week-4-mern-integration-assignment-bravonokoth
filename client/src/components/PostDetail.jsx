import { useEffect, useState, useContext } from 'react';
import { postService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const PostDetail = () => {
  const { user } = useContext(AuthContext);
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    postService.getPost(idOrSlug).then((data) => setPost(data));
  }, [idOrSlug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }
    try {
      await postService.addComment(post._id, { content: comment });
      setComment('');
      postService.getPost(idOrSlug).then((data) => setPost(data));
    } catch (error) {
      alert('Error adding comment: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(post._id);
        alert('Post deleted successfully');
        navigate('/');
      } catch (error) {
        alert('Error deleting post: ' + error.message);
      }
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <img src={`/uploads/${post.featuredImage}`} alt={post.title} style={{ maxWidth: '300px' }} />
      <p>{post.content}</p>
      <p>By {post.author?.username} | Category: {post.category?.name}</p>
      {user && (user._id === post.author._id || user.role === 'admin') && (
        <div>
          <button onClick={() => navigate(`/edit-post/${post._id}`)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
      <h3>Comments</h3>
      {post.comments.map((comment) => (
        <div key={comment._id} style={{ border: '1px solid #ccc', padding: '5px', margin: '5px 0' }}>
          <p>{comment.content} - {comment.user?.username}</p>
        </div>
      ))}
      {user && (
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment"
            required
          />
          <button type="submit">Post Comment</button>
        </form>
      )}
    </div>
  );
};

export default PostDetail;