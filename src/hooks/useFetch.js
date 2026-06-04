import { useState, useEffect, useRef } from "react";

/**
 * useFetch — generic data-fetching hook with AbortController cleanup
 *
 * @param {Function} fetchFn  — async function that accepts a signal and returns data
 * @param {Array}    deps     — dependency array (re-fetches when these change)
 *
 * Usage:
 *   const { data, loading, error } = useFetch(
 *     (signal) => getMovieDetails(id, type, signal),
 *     [id, type]
 *   );
 */
export function useFetch(fetchFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // Keep a ref to the latest fetchFn so the effect always calls
    // the freshest version without adding it to the dep array
    const fetchFnRef = useRef(fetchFn);
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);


    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            try {
                const result = await fetchFnRef.current(controller.signal);

                if (!controller.signal.aborted) {
                    setData(result);
                }
            } catch (err) {
                if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;

                if (!controller.signal.aborted) {
                    setError(true);
                }

                console.error(err);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        run();

        return () => controller.abort();
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    return { data, loading, error };
}