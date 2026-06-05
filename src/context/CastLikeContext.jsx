import { useState } from "react";
import { CastLikeContext } from "./CastLikeContext";

export function CastLikeProvider({ children }) {
  const [likes, setLikes] = useState(() => {
    return JSON.parse(localStorage.getItem("castLikes")) || {};
  });

  const toggleLike = (personId) => {
    const updated = {
      ...likes,
      [personId]: !likes[personId],
    };

    setLikes(updated);
    localStorage.setItem(
      "castLikes",
      JSON.stringify(updated)
    );
  };

  const isLiked = (personId) => !!likes[personId];

  return (
    <CastLikeContext.Provider
      value={{
        likes,
        toggleLike,
        isLiked,
      }}
    >
      {children}
    </CastLikeContext.Provider>
  );
}