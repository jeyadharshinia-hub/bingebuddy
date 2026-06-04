import { useState } from "react";
import { CommentContext } from "./CommentContext";

export function CommentProvider({ children }) {
  const [comments, setComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("comments")) || [];
    } catch {
      return [];
    }
  });

  const addComment = (comment) => {
    const updated = [
      { ...comment, createdAt: Date.now() },
      ...comments,
    ];
    setComments(updated);
    localStorage.setItem("comments", JSON.stringify(updated));
  };

  return (
    <CommentContext.Provider value={{ comments, addComment }}>
      {children}
    </CommentContext.Provider>
  );
}