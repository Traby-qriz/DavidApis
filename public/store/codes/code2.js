        
// Audio Download Command
case 'audio2': {
    if (!m.quoted) return reply('Please reply to the song search result to download the audio.');
    await David.sendMessage(m?.chat, {react: {text: `🎧`, key: m?.key}});

    let url = global.db.data.users[m.sender].lastSearchUrl || m.quoted?.text.match(/https?:\/\/[^\s]+/g)?.[0];
    if (!url) return reply('No song URL found. Please use the *song* command first.');

    try {
        let apiUrl = `https://api-lenwy.vercel.app/mp3?url=${encodeURIComponent(url)}`;
        let result;
        let maxAttempts = 10; // Maximum attempts (10 * 15s = 150s max wait time)
        let attempt = 0;

        while (attempt < maxAttempts) {
            result = await (await fetch(apiUrl)).json();

            // Check if download_url is available and not "Converting"
            if (result.status === 200 && result.data.download_url !== "Converting") {
                let audioUrl = result.data.download_url;
                let title = result.data.title;
                let body = `*Audio Download*\n> Title: ${title}\n> Type: ${result.data.type}`;

                // Send the audio to the user
                await David.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mp4', caption: body }, { quoted: m });
                break;
            }

            // Increment attempt and wait for 15 seconds before retrying
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 15000));
        }

        // If no valid download URL after max attempts, send an error message
        if (attempt === maxAttempts) {
            reply('Error! Could not retrieve audio URL after multiple attempts. Please try again later.');
        }

    } catch (error) {
        reply('Error fetching audio. Please try again.');
    }
}
break;        
// Audio Download Command
case 'audio2': {
    if (!m.quoted) return reply('Please reply to the song search result to download the audio.');
    await David.sendMessage(m?.chat, {react: {text: `🎧`, key: m?.key}});

    let url = global.db.data.users[m.sender].lastSearchUrl || m.quoted?.text.match(/https?:\/\/[^\s]+/g)?.[0];
    if (!url) return reply('No song URL found. Please use the *song* command first.');

    try {
        let apiUrl = `https://api-lenwy.vercel.app/mp3?url=${encodeURIComponent(url)}`;
        let result;
        let maxAttempts = 10; // Maximum attempts (10 * 15s = 150s max wait time)
        let attempt = 0;

        while (attempt < maxAttempts) {
            result = await (await fetch(apiUrl)).json();

            // Check if download_url is available and not "Converting"
            if (result.status === 200 && result.data.download_url !== "Converting") {
                let audioUrl = result.data.download_url;
                let title = result.data.title;
                let body = `*Audio Download*\n> Title: ${title}\n> Type: ${result.data.type}`;

                // Send the audio to the user
                await David.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mp4', caption: body }, { quoted: m });
                break;
            }

            // Increment attempt and wait for 15 seconds before retrying
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 15000));
        }

        // If no valid download URL after max attempts, send an error message
        if (attempt === maxAttempts) {
            reply('Error! Could not retrieve audio URL after multiple attempts. Please try again later.');
        }

    } catch (error) {
        reply('Error fetching audio. Please try again.');
    }
}
break;