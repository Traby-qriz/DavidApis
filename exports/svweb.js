import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const svweb = {
  recording: async (link, responseType = 1, convertOption = '--convert') => {
    try {
      const { data } = await axios.post(
        'https://tella.mockso-cloud.com/screenshot/video',
        { url: link },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Postify/1.0.0'
          },
          responseType: 'arraybuffer'
        }
      );

      const result = responseType === 1 ? Buffer.from(data) : Buffer.from(data).toString('base64');
      const domainName = new URL(link).hostname.replace('www.', '').split('.')[0];

      if (result.length < 1024) {
        throw new Error('Website tersebut tidak dapat terhubung..');
      }

      if (convertOption === '--convert') {
        const fileName = `${domainName}_video.mp4`;
        const filePath = path.join(process.cwd(), 'downloads', fileName);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, result, responseType === 1 ? null : 'base64');
        console.log(`Video telah disimpan ke ${filePath}`);
        return { filePath, data: result };
      }

      if (convertOption === '--unconvert') {
        return { type: responseType === 1 ? 'buffer' : 'base64', data: result };
      }

      throw new Error('❌ Opsi konversinya kagak valid. pake --convert atau --unconvert yakk...');
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
};

export { svweb };