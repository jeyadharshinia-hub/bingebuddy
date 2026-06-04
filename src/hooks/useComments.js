import { useContext } from "react";
import { CommentContext } from "../context/CommentContext";

export const useComments = () => useContext(CommentContext);