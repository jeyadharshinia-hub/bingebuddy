import { useContext } from "react";
import { CastLikeContext } from "../context/CastLikeContext";

export default function useCastLike() {
  return useContext(CastLikeContext);
}