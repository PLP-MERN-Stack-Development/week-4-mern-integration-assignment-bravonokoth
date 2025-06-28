import PostForm from '../components/PostForm';
import { useParams } from 'react-router-dom';

const EditPost = () => {
  const { id } = useParams();
  return <PostForm postId={id} />;
};

export default EditPost;