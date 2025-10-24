'use client';

import { useState } from 'react';
import { HoleWithComments } from '@/types';
import { Star, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface HoleCardProps {
  hole: HoleWithComments;
}

export function HoleCard({ hole }: HoleCardProps) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [visibleComments, setVisibleComments] = useState(2);

  const displayedComments = showAllComments
    ? hole.comments
    : hole.comments.slice(0, visibleComments);

  const loadMoreComments = () => {
    if (visibleComments >= hole.comments.length) {
      setShowAllComments(true);
    } else {
      setVisibleComments(prev => Math.min(prev + 5, hole.comments.length));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getReplyText = (comment: any) => {
    if (comment.replied_to_cid) {
      const repliedComment = hole.comments.find(c => c.cid === comment.replied_to_cid);
      return repliedComment ? `回复 ${repliedComment.name}` : '回复评论';
    }
    return null;
  };

  return (
    <div className="border border-black dark:border-white rounded-lg p-6 bg-white dark:bg-black">
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          PID: {hole.pid}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(hole.created_at)}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-black dark:text-white whitespace-pre-wrap">
          {hole.text}
        </p>
        {hole.type === 'image' && hole.image_response && (
          <div className="mt-4">
            <img
              src={hole.image_response}
              alt="树洞图片"
              className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-black dark:text-white" />
          <span className="text-sm text-black dark:text-white">{hole.likenum}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="h-4 w-4 text-black dark:text-white" />
          <span className="text-sm text-black dark:text-white">{hole.reply}</span>
        </div>
      </div>

      {hole.comments.length > 0 && (
        <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-black dark:text-white mb-3">
            评论 ({hole.comments.length})
          </h4>

          <div className="space-y-3">
            {displayedComments.map((comment) => (
              <div key={comment.cid} className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-black dark:text-white">
                      {comment.name}
                    </span>
                    {getReplyText(comment) && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {getReplyText(comment)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-black dark:text-white whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>

          {hole.comments.length > 2 && !showAllComments && (
            <button
              onClick={loadMoreComments}
              className="mt-3 flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              <span>
                {visibleComments >= hole.comments.length
                  ? '展开所有评论'
                  : `加载更多评论 (${hole.comments.length - visibleComments} 条)`
                }
              </span>
            </button>
          )}

          {showAllComments && hole.comments.length > 2 && (
            <button
              onClick={() => {
                setShowAllComments(false);
                setVisibleComments(2);
              }}
              className="mt-3 flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
              <span>收起评论</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}