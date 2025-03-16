import axios from 'axios';
import cheerio from 'cheerio';

async function fetchWithRetry(fn, url, retries = 3, headers = {}) {
  let attempts = 0;
  let lastError;
  while (attempts < retries) {
    try {
      return await fn(url, headers);
    } catch (error) {
      lastError = error;
      attempts++;
      console.error(`Attempt ${attempts} failed. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`Failed after ${retries} attempts: ${lastError.message}`);
}

const Lyrics = {
  async search(song) {
    try {
      const fetchFunction = async (url) => {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const results = $('.best-matches .bm-case')
          .map((i, element) => {
            const title = $(element).find('.bm-label a').first().text();
            const artist = $(element).find('.bm-label a').last().text();
            const album = $(element).find('.bm-label')
              .eq(1)
              .text()
              .trim()
              .replace(/\s+/g, ' ');
            const imageUrl = $(element).find('.album-thumb img').attr('src');
            const link = $(element).find('.bm-label a').first().attr('href');

            return {
              title,
              artist,
              album,
              imageUrl,
              link: `https://www.lyrics.com${link}`,
            };
          })
          .get();

        return results;
      };

      return await fetchWithRetry(fetchFunction, `https://www.lyrics.com/lyrics/${song}`);
    } catch (error) {
      console.error(`Error fetching lyrics search results: ${error.message}`);
      throw error;
    }
  },

  async getLyrics(url) {
    try {
      const fetchFunction = async (url) => {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const artistImage = $('#featured-artist-avatar img').attr('src');
        const about = $('.artist-meta .bio').text().trim();
        const year = $('.lyric-details dt:contains("Year:") + dd').text().trim();
        const playlists = $('.lyric-details dt:contains("Playlists") + dd a')
          .text()
          .trim();
        const lyrics = $('#lyric-body-text').text().trim();

        return { artistImage, about, year, playlists, lyrics };
      };

      return await fetchWithRetry(fetchFunction, url);
    } catch (error) {
      console.error(`Error fetching lyrics: ${error.message}`);
      throw error;
    }
  },
};

export { Lyrics };