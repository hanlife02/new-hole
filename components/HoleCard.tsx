'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Star } from 'lucide-react';
import { Comment, Hole } from '@/types';
import { useLanguage } from './LanguageProvider';
import pagesCopy from '@/content/pages.json';

interface HoleCardProps {
  hole: Hole;
  initialComments?: Comment[];
  autoLoadComments?: boolean;
}

interface CommentsResponse {
  comments: Comment[];
  nextCursor: number | null;
  hasMore: boolean;
}

export function HoleCard({ hole, initialComments, autoLoadComments = false }: HoleCardProps) {
  const { language } = useLanguage();
  const common = pagesCopy[language].common;

  const [showImageModal, setShowImageModal] = useState(false);
  const [showComments, setShowComments] = useState(
    autoLoadComments || (initialComments !== undefined && initialComments.length > 0),
  );
  const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
  const [commentsLoaded, setCommentsLoaded] = useState(initialComments !== undefined);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [visibleComments, setVisibleComments] = useState(2);
  const [showAllComments, setShowAllComments] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const mergeComments = (prev: Comment[], incoming: Comment[]) => {
    if (incoming.length === 0) {
      return prev;
    }
    const existing = new Map(prev.map((comment) => [comment.cid, comment]));
    for (const comment of incoming) {
      if (!existing.has(comment.cid)) {
        existing.set(comment.cid, comment);
      }
    }
    return Array.from(existing.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  };

  const fetchComments = useCallback(
    async (cursor?: number) => {
      setLoadingComments(true);
      setCommentsError(null);

      try {
        const params = new URLSearchParams();
        if (cursor !== undefined) {
          params.set('cursor', String(cursor));
        }

        const endpoint = params.toString()
          ? `/api/comments/${hole.pid}?${params.toString()}`
          : `/api/comments/${hole.pid}`;

        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data: CommentsResponse = await response.json();

        setComments((prev) =>
          cursor !== undefined ? mergeComments(prev, data.comments) : data.comments,
        );
        setCommentsLoaded(true);
        setNextCursor(typeof data.nextCursor === 'number' ? data.nextCursor : null);
        setHasMoreComments(Boolean(data.hasMore));

        if (cursor === undefined) {
          const initialVisible = Math.min(2, data.comments.length);
          setVisibleComments(initialVisible);
          setShowAllComments(data.comments.length <= initialVisible && !data.hasMore);
        } else {
          setVisibleComments((prev) => Math.min(prev + data.comments.length, prev + 5));
          setShowAllComments(false);
        }
      } catch (error) {
        console.error('加载评论失败:', error);
        setCommentsError(common.loadCommentsError);
      } finally {
        setLoadingComments(false);
      }
    },
    [common.loadCommentsError, hole.pid],
  );

  useEffect(() => {
    if (autoLoadComments && !commentsLoaded && !loadingComments) {
      setShowComments(true);
      void fetchComments();
    }
  }, [autoLoadComments, commentsLoaded, fetchComments, loadingComments]);

  const displayedComments = useMemo(() => {
    return showAllComments ? comments : comments.slice(0, visibleComments);
  }, [comments, showAllComments, visibleComments]);

  const remainingLocal = Math.max(comments.length - visibleComments, 0);

  const loadMoreLabel = useMemo(() => {
    if (hasMoreComments && remainingLocal === 0) {
      return common.loadMoreCommentsGeneral;
    }
    if (remainingLocal <= 0) {
      return common.expandAllComments;
    }
    return common.loadMoreComments.replace('{count}', remainingLocal.toString());
  }, [common.expandAllComments, common.loadMoreComments, common.loadMoreCommentsGeneral, hasMoreComments, remainingLocal]);

  const getReplyText = (comment: Comment) => {
    if (!comment.replied_to_cid) {
      return null;
    }

    const repliedComment = comments.find((item) => item.cid === comment.replied_to_cid);
    if (repliedComment) {
      return `${common.replyPrefix} ${repliedComment.name}`;
    }
    return common.replyFallback;
  };

  const handleToggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setShowComments(true);
    if (!commentsLoaded && !loadingComments) {
      await fetchComments();
    }
  };

  const handleLoadMore = async () => {
    if (remainingLocal > 0) {
      const newVisible = Math.min(visibleComments + 5, comments.length);
      setVisibleComments(newVisible);
      if (newVisible >= comments.length && !hasMoreComments) {
        setShowAllComments(true);
      }
      return;
    }

    if (hasMoreComments && nextCursor !== null && !loadingComments) {
      await fetchComments(nextCursor);
      return;
    }

    setShowAllComments(true);
  };

  const hasAnyComments = comments.length > 0 || hole.reply > 0 || hasMoreComments;
  const shouldShowToggle = hasAnyComments || loadingComments || commentsError;
  const shouldRenderCommentsSection = showComments && (hasAnyComments || loadingComments || commentsError);

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

      {shouldShowToggle && (
        <div className="mt-4">
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            {showComments ? (
              loadingComments && comments.length === 0 ? (
                <span>{common.loadingComments}</span>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>{common.collapseComments}</span>
                </>
              )
            ) : loadingComments ? (
              <span>{common.loadingComments}</span>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>{common.showComments}</span>
              </>
            )}
          </button>
        </div>
      )}

      {shouldRenderCommentsSection && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            {common.commentsHeading} ({commentsLoaded ? comments.length : hole.reply})
          </h4>

          {loadingComments && comments.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{common.loadingComments}</div>
          )}

          {commentsError && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
              <div className="flex items-center justify-between">
                <span>{commentsError}</span>
                <button
                  onClick={() => {
                    setCommentsError(null);
                    void fetchComments(nextCursor ?? undefined);
                  }}
                  className="text-xs font-medium underline"
                >
                  {common.retry}
                </button>
              </div>
            </div>
          )}

          {commentsLoaded && comments.length === 0 && !loadingComments && !commentsError && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{common.noComments}</div>
          )}

          {displayedComments.length > 0 && (
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
          )}

          {(comments.length > 0 || hasMoreComments) && !showAllComments && (
            <button
              onClick={handleLoadMore}
              disabled={loadingComments}
              className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-black disabled:opacity-60 dark:text-gray-400 dark:hover:text-white"
            >
              <ChevronDown className="h-4 w-4" />
              <span>{loadingComments ? common.loadingComments : loadMoreLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
