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
  const [showImageModal, setShowImageModal] = useState(false);

  const displayedComments = showAllComments
    ? hole.comments
    : hole.comments.slice(0, visibleComments);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
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
    <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="text-base font-medium text-gray-500 dark:text-gray-400">#{hole.pid}</div>
        <div className="text-sm text-gray-400 dark:text-gray-500">
          {formatDate(hole.created_at)}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-black dark:text-white whitespace-pre-wrap leading-relaxed">{hole.text}</p>
        {hole.type === 'image' && hole.image_response && (
          <>
            <div className="mt-4 flex justify-center">
              <img
                src={hole.image_response}
                alt={common.imageAlt}
                className="h-auto w-2/5 min-w-[160px] rounded-xl object-contain cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowImageModal(true)}
              />
            </div>
            {showImageModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                onClick={() => setShowImageModal(false)}
              >
                <div className="relative max-h-[90vh] max-w-[90vw]">
                  <img
                    src={hole.image_response}
                    alt={common.imageAlt}
                    className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{hole.likenum}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{hole.reply}</span>
        </div>
      </div>

      {hole.comments.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            {common.commentsHeading} ({hole.comments.length})
          </h4>

          <div className="space-y-3">
            {displayedComments.map((comment) => (
              <div key={comment.cid} className="bg-[#f5f5f7] dark:bg-black rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-black dark:text-white">
                      {comment.name}
                    </span>
                    {getReplyText(comment) && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getReplyText(comment)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-black dark:text-white whitespace-pre-wrap leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>

          {hole.comments.length > 2 && !showAllComments && (
            <button
              onClick={loadMoreComments}
              className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
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
              className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
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
