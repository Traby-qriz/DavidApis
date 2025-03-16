import axios from "axios";

const SUPPORTED_VIDEO_QUALITIES = {
  low: "360",
  medium: "480",
  hd: "720",
  fullHd: "1080",
  hdHigh: "1440",
  ultraHd: "4k",
};

const ytdl = {
  request: async (url, quality) => {
    if (!SUPPORTED_VIDEO_QUALITIES[quality]) {
      throw new Error(
        `Invalid video quality. Supported qualities are: ${Object.keys(SUPPORTED_VIDEO_QUALITIES).join(", ")}`
      );
    }

    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/download.php?format=${SUPPORTED_VIDEO_QUALITIES[quality]}&url=${encodeURIComponent(
        url
      )}`,
    };

    try {
      const { data } = await axios.request(config);

      if (data.success) {
        return {
          id: data.id,
          title: data.title,
          thumbnail: data.info?.image || null,
        };
      } else {
        throw new Error("Failed to fetch video details.");
      }
    } catch (error) {
      console.error("Error fetching video details:", error.message);
      throw error;
    }
  },

  progress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
    };

    try {
      while (true) {
        const { data } = await axios.request(config);

        if (data.success && data.progress === 1000) {
          return data.download_url;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Poll every 3 seconds
      }
    } catch (error) {
      console.error("Error polling progress:", error.message);
      throw error;
    }
  },
};

export { ytdl };