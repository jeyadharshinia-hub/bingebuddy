import { useState, useCallback } from "react";
import { CommentContext } from "./CommentContext";
import apiClient from "../services/apiClient";

export function CommentProvider({ children }) {
  const [cache, setCache] = useState({});

  const fetchComments = useCallback(async (mediaId) => {
    try {
      const res = await apiClient.get(`/comments/${mediaId}`);
      setCache((prev) => ({ ...prev, [mediaId]: res.data }));
      return res.data;
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      return [];
    }
  }, []);

  const getComments = (mediaId) => cache[mediaId] || [];

  const addComment = async (mediaId, comment) => {
    try {
      const payload = {
        mediaId,
        mediaTitle: comment.mediaTitle || "",
        text:       comment.text,
        rating:     comment.rating || 0,
        parentId:   comment.parentId || null,
      };
      const res = await apiClient.post("/comments", payload);
      // If it's a reply add it under parent, else prepend to top level
      setCache((prev) => {
        const existing = prev[mediaId] || [];
        if (comment.parentId) {
          return {
            ...prev,
            [mediaId]: existing.map((c) =>
              c.id === comment.parentId
                ? { ...c, replies: [...(c.replies || []), res.data] }
                : c
            ),
          };
        }
        return {
          ...prev,
          [mediaId]: [{ ...res.data, replies: [] }, ...existing],
        };
      });
      return res.data;
    } catch (err) {
      console.error("Failed to post comment:", err);
      throw err;
    }
  };

  const editComment = async (mediaId, id, text) => {
    const res = await apiClient.put(`/comments/${id}`, { text });
    setCache((prev) => {
      const existing = prev[mediaId] || [];
      return {
        ...prev,
        [mediaId]: existing.map((c) => {
          if (c.id === id) return { ...c, text: res.data.text, isEdited: true };
          // check replies
          return {
            ...c,
            replies: (c.replies || []).map((r) =>
              r.id === id ? { ...r, text: res.data.text, isEdited: true } : r
            ),
          };
        }),
      };
    });
  };

  const deleteComment = async (mediaId, id) => {
    await apiClient.delete(`/comments/${id}`);
    setCache((prev) => {
      const existing = prev[mediaId] || [];
      return {
        ...prev,
        [mediaId]: existing
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => r.id !== id),
          })),
      };
    });
  };

  const getMyActivity = async () => {
    try {
      const res = await apiClient.get("/comments/my-activity");
      return res.data;
    } catch (err) {
      console.error("Failed to fetch activity:", err);
      return [];
    }
  };

  return (
    <CommentContext.Provider
      value={{ getComments, fetchComments, addComment,
               editComment, deleteComment, getMyActivity }}
    >
      {children}
    </CommentContext.Provider>
  );
}