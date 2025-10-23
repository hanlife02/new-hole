'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Comment {
  cid: number;
  text: string;
  name: string;
  replied_to_cid: number | null;
  created_at: string;
}

interface Hole {
  pid: number;
  text: string;
  type: string;
  likenum: number;
  reply: number;
  image_response?: string;
  created_at: string;
  comments?: Comment[];
}

export default function HoleCard({ hole }: { hole: Hole }) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentPage, setCommentPage] = useState(0);

  const displayedComments = showAllComments
    ? hole.comments?.slice(0, (commentPage + 1) * 5) || []
    : hole.comments?.slice(0, 2) || [];

  return (
    <div className="border border-black dark:border-white rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="text-sm text-gray-600 dark:text-gray-400">#{hole.pid}</div>
        <div className="flex space-x-4 text-sm">
          <span>⭐ {hole.likenum}</span>
          <span>💬 {hole.reply}</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="whitespace-pre-wrap">{hole.text}</p>
        {hole.type === 'image' && hole.image_response && (
          <Image
            src={hole.image_response}
            alt="树洞图片"
            width={300}
            height={200}
            className="rounded"
          />
        )}
      </div>

      {hole.comments && hole.comments.length > 0 && (
        <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
          <div className="space-y-2">
            {displayedComments.map((comment) => (
              <div key={comment.cid} className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                <div className="font-medium">{comment.name}</div>
                {comment.replied_to_cid && (
                  <div className="text-xs text-gray-500">回复 #{comment.replied_to_cid}</div>
                )}
                <div>{comment.text}</div>
              </div>
            ))}
          </div>

          {hole.comments.length > 2 && (
            <div className="mt-2 space-x-2">
              {!showAllComments ? (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  展开更多评论
                </button>
              ) : (
                hole.comments.length > (commentPage + 1) * 5 && (
                  <button
                    onClick={() => setCommentPage(prev => prev + 1)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    加载更多评论
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}