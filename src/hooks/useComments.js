import { useState, useEffect } from "react";

// Global in-memory comments store keyed by mediaId
// In production, replace with API calls to your Java backend
const globalComments = {};

export default function useComments(mediaId) {
  const storageKey = `bb_comments_${mediaId}`;

  const [comments, setComments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch { return []; }
  });

  const addComment = (user, text, rating = 0) => {
    const comment = {
      id: Date.now(),
      userId: user.uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      text,
      rating,
      time: new Date().toISOString(),
    };
    setComments((prev) => {
      const next = [comment, ...prev];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return { comments, addComment };
}
