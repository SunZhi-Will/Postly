import { useSession } from "next-auth/react";
import Image from "next/image";

interface Comment {
  id: string;
  content: string;
  author_id: string;
  author: string | null;
  picture: string | null;
  is_anonymous: boolean;
  created_at: string;
}

interface CommentProps {
  comment: Comment;
}

export default function Comment({ comment }: CommentProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.email && comment.author_id && session.user.email === comment.author_id;

  // 如果是匿名留言且是作者本人，顯示自己的資料
  const displayAuthor = comment.is_anonymous && isAuthor ? session?.user?.name : comment.author;
  const displayPicture = comment.is_anonymous && isAuthor ? session?.user?.image : comment.picture;

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center mb-2">
        <Image
          src={displayPicture || "/default-avatar.png"}
          alt={displayAuthor || "匿名用戶"}
          width={32}
          height={32}
          className="rounded-full mr-3"
        />
        <div>
          <h4 className="font-medium">{displayAuthor || "匿名用戶"}</h4>
          <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
        </div>
      </div>
      <p className="pl-11">{comment.content}</p>
    </div>
  );
} 