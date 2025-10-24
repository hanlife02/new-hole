'use client';

import { useMemo, useState } from 'react';
import { HoleWithComments } from '@/types';
import { Star, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import pagesCopy from '@/content/pages.json';

interface HoleCardProps {
  hole: HoleWithComments;
}

export function HoleCard({ hole }: HoleCardProps) {
  const { language } = useLanguage();
  const common = pagesCopy[language].common;
  const [showAllComments, setShowAllComments] = useState(false);
  const [visibleComments, setVisibleComments] = useState(2);

  const displayedComments = showAllComments
    ? hole.comments
    : hole.comments.slice(0, visibleComments);

  const locale = language === 'zh' ? 'zh-CN' : 'en-US';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale);
  };

  const loadMoreComments = () => {
    const newVisible = Math.min(visibleComments + 5, hole.comments.length);
    setVisibleComments(newVisible);
    if (newVisible >= hole.comments.length) {
      setShowAllComments(true);
    }
  };

  const getReplyText = (comment: HoleWithComments['comments'][number]) => {
    if (!comment.replied_to_cid) {
      return null;
    }
    const repliedComment = hole.comments.find(
      (item) => item.cid === comment.replied_to_cid
    );
    if (repliedComment) {
      return `${common.replyPrefix} ${repliedComment.name}`;
    }
    return common.replyFallback;
  };

  const loadMoreLabel = useMemo(() => {
    if (visibleComments >= hole.comments.length) {
      return common.expandAllComments;
    }
    const remaining = hole.comments.length - visibleComments;
    return common.loadMoreComments.replace('{count}', remaining.toString());
  }, [common, hole.comments.length, visibleComments]);

  return (
    <div className="border border-black dark:border-white rounded-lg p-6 bg-white dark:bg-black">
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">{hole.pid}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(hole.created_at)}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-black dark:text-white whitespace-pre-wrap">{hole.text}</p>
        {hole.type === 'image' && hole.image_response && (
          <div className="mt-4 flex justify-center">
            <img
              src={hole.image_response}
              alt={common.imageAlt}
              className="h-auto w-2/5 min-w-[160px] rounded-lg border border-gray-300 object-contain dark:border-gray-700"
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
            {common.commentsHeading} ({hole.comments.length})
          </h4>

          <div className="space-y-3">
            {displayedComments.map((comment) => (
              <div key={comment.cid} className="rounded bg-gray-50 p-3 dark:bg-gray-900">
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
              className="mt-3 flex items-center space-x-1 text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              <ChevronDown className="h-4 w-4" />
              <span>{loadMoreLabel}</span>
            </button>
          )}

          {showAllComments && hole.comments.length > 2 && (
            <button
              onClick={() => {
                setShowAllComments(false);
                setVisibleComments(2);
              }}
              className="mt-3 flex items-center space-x-1 text-sm text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              <ChevronUp className="h-4 w-4" />
              <span>{common.collapseComments}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
