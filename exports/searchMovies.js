import sinhalaSub from "mrnima-moviedl";

async function searchMovies(query) {
    if (!query) {
        throw new Error("No query provided.");
    }

    try {
        const movie = await sinhalaSub();
        const results = await movie.search(query);
        return results.result.slice(0, 10); // Limit results to 10
    } catch (error) {
        throw new Error("Failed to fetch movie search results.");
    }
}

export { searchMovies };