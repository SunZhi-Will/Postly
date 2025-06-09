import { useSession } from "next-auth/react";
import Image from "next/image";

interface Post {
  id: string;
  content: string;
  author_id: string;
  author: string | null;
  picture: string | null;
  is_anonymous: boolean;
  created_at: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.email && post.author_id && session.user.email === post.author_id;

  // 如果是匿名文章且是作者本人，顯示自己的資料
  const displayAuthor = post.is_anonymous && isAuthor ? session?.user?.name : post.author;
  const displayPicture = post.is_anonymous && isAuthor ? session?.user?.image : post.picture;

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <Image
          src={displayPicture || "/default-avatar.png"}
          alt={displayAuthor || "匿名用戶"}
          width={40}
          height={40}
          className="rounded-full mr-4"
        />
        <div>
          <h3 className="font-semibold">{displayAuthor || "匿名用戶"}</h3>
          <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
        </div>
      </div>
      <p className="mb-4">{post.content}</p>
      {/* ... existing code ... */}
    </div>
  );
} 