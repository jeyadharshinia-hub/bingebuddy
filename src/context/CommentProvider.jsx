import { useState, useCallback } from "react";
import { CommentContext } from "./CommentContext";
import apiClient from "../services/apiClient";

export function CommentProvider({ children }) {
  // Cache: { [mediaId]: Comment[] }
  // Avoids re-fetching on every render while keeping data fresh after posts
  const [cache, setCache] = useState({});

  // Fetch comments for a media item from MySQL
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

  // Returns cached comments or empty array
  // Components should call fetchComments(mediaId) on mount to populate cache
  const getComments = (mediaId) => cache[mediaId] || [];

  // Post a new comment to MySQL
  const addComment = async (mediaId, comment) => {
    try {
      const payload = {
        mediaId,
        mediaTitle: comment.mediaTitle || "",
        text:       comment.text,
        rating:     comment.rating || 0,
      };

      const res = await apiClient.post("/comments", payload);

      // Update cache immediately so UI re-renders without refetch
      setCache((prev) => ({
        ...prev,
        [mediaId]: [res.data, ...(prev[mediaId] || [])],
      }));

      return res.data;
    } catch (err) {
      console.error("Failed to post comment:", err);
      throw err;
    }
  };

  // Fetch activity for the profile page
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
      value={{ getComments, fetchComments, addComment, getMyActivity }}
    >
      {children}
    </CommentContext.Provider>
  );
}