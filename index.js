import fs from 'fs';
import os from 'os';
import qs from 'qs';
import http from 'http';
import express from 'express';
import FormData from "form-data";
import ytSearch from "yt-search";
import path from 'path';
 import axios from 'axios';

 import translate from "@vitalets/google-translate-api";
import crypto from 'crypto';
import { v4 as uuidv4 } from "uuid";

import QRCode from "qrcode";

import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Mp3, 
         Mp4, 
         tiktokdl, 
         Lyrics,
         ddownr,
         svweb,
         chatbot } from './exports/index.js';

const __filename = fileURLToPath(import.meta.url),
      __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());
const serverStartTime = Date.now();

const port = process.env.PORT || 3000;
app.enable('trust proxy');
app.set('json spaces', 2);
app.use(express.static(path.join(__dirname, 'public')));
import cors from 'cors';
app.use(cors());

import mongoose from 'mongoose';



mongoose.set('strictQuery', false);

const uri = "mongodb+srv://davidcyril209:85200555dcx@david.sfonwmo.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch(err => console.error("Connection error:", err));
 

import bcrypt from 'bcrypt';
import User from './exports/User.js'; // Use the full path with the `.js` extension'; // Ensure the file extension is included for ES modules

import bodyParser from 'body-parser'; 



// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


import session from 'express-session';



// Serve Registration Page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/register.html"));
});

// Serve Login Page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"));
});

// Serve Dashboard Page
app.get("/dashboard", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login?error=Please login first.");
  }
  res.sendFile(path.join(__dirname, "public/html/dashboard.html"));
});
 


import flash from 'express-flash' ;


// Middleware for sessions
app.use(
  session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware for flash messages
app.use(flash());

// Route for registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Example: Validation and registration logic
  if (!username || !password) {
    req.flash('error', 'All fields are required!');
    return res.redirect('/register');
  }

  // Simulating successful registration
  req.flash('success', 'Registration successful! You can now log in.');
  res.redirect('/login');
});

// Route for rendering the register page
app.get('/register', (req, res) => {
  res.render('register', {
    error: req.flash('error'),
    success: req.flash('success'),
  });
});

// Handle Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect("/login?error=User not found");
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.redirect("/login?error=Invalid credentials");
    }

    // Save username in session and redirect to dashboard
    req.session.username = user.username;
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/login?error=Login failed. Please try again.");
  }
});

// Handle Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login?success=You have logged out successfully.");
  });
});












// Middleware to parse JSON and form data



// Serve static files (HTML, CSS, JS) from the "store" folder
app.use(express.static(path.join(__dirname, 'store')));

// Load valid keys from keys.json
const keysFilePath = path.join(__dirname, 'keys.json');
let keys = JSON.parse(fs.readFileSync(keysFilePath, 'utf-8'));

// In-memory store for temporary links (to track expiration)
const tempLinks = {};

// API endpoint to validate keys
app.post('/api/validate-key', (req, res) => {
    const { key, codeId } = req.body;

    if (!key || !codeId) {
        return res.status(400).json({ success: false, message: 'Key or Code ID missing' });
    }

    // Check if the key exists
    if (!keys.includes(key)) {
        return res.status(403).json({ success: false, message: 'Invalid key' });
    }

    // Generate a secure unique token for the temporary link
    const token = crypto.randomBytes(16).toString('hex');
    const tempLink = `/store/temp/${token}-${codeId}.js`;

    // Write the temporary file content (for demo purposes)
    const tempFilePath = path.join(__dirname, tempLink);
    fs.writeFileSync(tempFilePath, `// This is the content of ${codeId}`, 'utf-8');

    // Store the temporary link with expiration time
    tempLinks[token] = {
        path: tempFilePath,
        expiresAt: Date.now() + 5 * 60 * 1000, // Expires in 5 minutes
    };

    // Set a timeout to delete the temporary file and remove the link
    setTimeout(() => {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        delete tempLinks[token];
    }, 5 * 60 * 1000); // 5 minutes

    // Send the temporary link back to the client
    return res.status(200).json({ success: true, link: tempLink });
});

// Serve temporary files securely
app.get('/store/temp/:token-:codeId.js', (req, res) => {
    const { token, codeId } = req.params;

    // Check if the token exists and hasn't expired
    const tempLinkData = tempLinks[token];
    if (!tempLinkData || Date.now() > tempLinkData.expiresAt) {
        return res.status(404).send('Temporary file not found or expired.');
    }

    // Send the temporary file
    res.sendFile(tempLinkData.path);
});

// Admin endpoint to add a new key
app.post('/api/add-key', (req, res) => {
    const { newKey } = req.body;

    if (!newKey) {
        return res.status(400).json({ success: false, message: 'New key is required' });
    }

    if (keys.includes(newKey)) {
        return res.status(409).json({ success: false, message: 'Key already exists' });
    }

    // Add the new key and save to keys.json
    keys.push(newKey);
    fs.writeFileSync(keysFilePath, JSON.stringify(keys, null, 2), 'utf-8');

    return res.status(200).json({ success: true, message: 'Key added successfully' });
});

// Admin endpoint to remove a key
app.post('/api/remove-key', (req, res) => {
    const { keyToRemove } = req.body;

    if (!keyToRemove) {
        return res.status(400).json({ success: false, message: 'Key to remove is required' });
    }

    if (!keys.includes(keyToRemove)) {
        return res.status(404).json({ success: false, message: 'Key not found' });
    }

    // Remove the key and save to keys.json
    keys = keys.filter((key) => key !== keyToRemove);
    fs.writeFileSync(keysFilePath, JSON.stringify(keys, null, 2), 'utf-8');

    return res.status(200).json({ success: true, message: 'Key removed successfully' });
});








const byteToKB = 1 / 1024,
      byteToMB = 1 / Math.pow(1024, 2),
      byteToGB = 1 / Math.pow(1024, 3);

// Utility Functions
function formatBytes(bytes) {
  if (bytes >= Math.pow(1024, 3)) {
    return (bytes * byteToGB).toFixed(2) + ' GB';
  } else if (bytes >= Math.pow(1024, 2)) {
    return (bytes * byteToMB).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes * byteToKB).toFixed(2) + ' KB';
  } else {
    return bytes.toFixed(2) + ' bytes';
  }
}

function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24)),
        h = Math.floor((seconds % (3600 * 24)) / 3600),
        m = Math.floor((seconds % 3600) / 60),
        s = Math.floor(seconds % 60),
        dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '',
        hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '',
        mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '',
        sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}










import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./visitors.db');

// Initialize Tables
function initializeTables() {
    // Create Visitors Table
    const createVisitorsTable = `
        CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            total_visitors INTEGER NOT NULL DEFAULT 0,
            today_visitors INTEGER NOT NULL DEFAULT 0
        )
    `;

    // Create Requests Table
    const createRequestsTable = `
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_requests INTEGER NOT NULL DEFAULT 0
        )
    `;

    db.run(createVisitorsTable, (err) => {
        if (err) {
            console.error("Error creating visitors table:", err.message);
            process.exit(1);
        } else {
            console.log("Visitors table is ready.");
            initializeTodayRow();
        }
    });

    db.run(createRequestsTable, (err) => {
        if (err) {
            console.error("Error creating requests table:", err.message);
            process.exit(1);
        } else {
            console.log("Requests table is ready.");
            initializeTotalRequests();
        }
    });
}

// Initialize Today's Row in Visitors Table
function initializeTodayRow() {
    const today = new Date().toISOString().split('T')[0];
    db.get('SELECT * FROM visitors WHERE date = ?', [today], (err, row) => {
        if (err) {
            console.error("Error checking today's data:", err.message);
        } else if (!row) {
            db.run(
                'INSERT INTO visitors (date, total_visitors, today_visitors) VALUES (?, ?, ?)',
                [today, 0, 0],
                (err) => {
                    if (err) console.error("Error initializing today's data:", err.message);
                    else console.log("Initialized today's data in visitors table.");
                }
            );
        }
    });
}

// Initialize Total Requests
function initializeTotalRequests() {
    db.get('SELECT * FROM requests', (err, row) => {
        if (err) {
            console.error("Error initializing requests table:", err.message);
        } else if (!row) {
            db.run('INSERT INTO requests (total_requests) VALUES (0)', (err) => {
                if (err) console.error("Error initializing total requests:", err.message);
                else console.log("Initialized requests table.");
            });
        }
    });
}

// Visitor Count Endpoint
app.get('/countd', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    // Increment total requests
    db.run('UPDATE requests SET total_requestss = total_requestsss + 1', (err) => {
        if (err) {
            console.error("Error updating total requests:", err.message);
            return res.status(500).json({
                creator: "David Cyril",
                error: "Failed to update total requests.",
            });
        }

        // Update visitor data for today
        db.get('SELECT * FROM visitors WHERE date = ?', [today], (err, row) => {
            if (err) {
                console.error('Error retrieving visitor data:', err.message);
                return res.status(500).json({
                    creator: "David Cyril",
                    error: "Failed to retrieve visitor data.",
                });
            }

            const updatedTodayVisitors = (row ? row.today_visitors : 0) + 1;
            const updatedTotalVisitors = (row ? row.total_visitors : 0) + 1;

            db.run(
                'UPDATE visitors SET today_visitors = ?, total_visitors = ? WHERE date = ?',
                [updatedTodayVisitors, updatedTotalVisitors, today],
                (err) => {
                    if (err) {
                        console.error("Error updating visitor data:", err.message);
                        return res.status(500).json({
                            creator: "David Cyril",
                            error: "Failed to update visitor data.",
                        });
                    }

                    // Fetch total requests to include in the response
                    db.get('SELECT total_requestss FROM requests', (err, requestRow) => {
                        if (err) {
                            console.error("Error retrieving total requests:", err.message);
                            return res.status(500).json({
                                creator: "David Cyril",
                                error: "Failed to retrieve total requests.",
                            });
                        }

                        res.json({
                            creator: "David Cyril",
                            total_visitors: updatedTotalVisitors,
                            today_visitors: updatedTodayVisitors,
                            total_requestss: requestRow.total_requestss,
                        });
                    });
                }
            );
        });
    });
});

// Initialize Tables Before Starting the Server
initializeTables();



// Status Endpoint
app.get('/status', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000),
        totalMemoryBytes = os.totalmem(),
        freeMemoryBytes = os.freemem(),
        clientIP = req.ip || req.connection.remoteAddress;
  res.json({
    runtime: runtime(uptimeSeconds),
    memory: `${formatBytes(freeMemoryBytes)} / ${formatBytes(totalMemoryBytes)}`,
    yourip: clientIP,
  });
});

import Stats from './exports/Stats.js'; // Adjust path if necessary

async function initializeStats() {
  try {
    const stats = await Stats.findOne();
    if (!stats) {
      await Stats.create({ total_requests: 0 });
      console.log('Initialized stats in MongoDB.');
    } else {
      console.log('Stats already initialized.');
    }
  } catch (error) {
    console.error('Error initializing stats:', error.message);
    process.exit(1);
  }
}

// Call this function before starting the server
initializeStats();

app.get('/stats', async (req, res) => {
  try {
    const stats = await Stats.findOne();
    res.json({
      creator: "David Cyril",
      total_requests: stats.total_requests,
    });
  } catch (error) {
    console.error('Error retrieving stats:', error.message);
    res.status(500).json({ error: "Failed to retrieve stats." });
  }
});

app.get('/count', async (req, res) => {
  try {
    const stats = await Stats.findOne();
    stats.total_requests += 1;
    await stats.save();

    res.json({
      creator: "David Cyril",
      total_requests: stats.total_requests,
    });
  } catch (error) {
    console.error('Error updating stats:', error.message);
    res.status(500).json({ error: "Failed to update stats." });
  }
});



app.use(express.json());












const BASE_URL = "https://apis.davidcyriltech.my.id"; // Your API domain
const TEMP_DIR = path.join(__dirname, "temp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeID(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}

// YouTube MP3 Download Endpoint
app.get("/download/ytmp3", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            creator: "David Cyril Tech",
            status: 400,
            success: false,
            message: "Please provide a valid YouTube video URL using the url query parameter.",
        });
    }

    try {
        // Fetch the MP3 download link from the external API (hidden from the client)
        const apiResponse = await axios.get(`https://api.siputzx.my.id/api/dl/youtube/mp3?url=${encodeURIComponent(url)}`);
        const { status, data: downloadUrl } = apiResponse.data;

        if (!status || !downloadUrl) {
            return res.status(500).json({
                creator: "David Cyril Tech",
                status: 500,
                success: false,
                message: "Failed to fetch download URL.",
            });
        }

        // Generate a random filename
        const fileName = `${crypto.randomBytes(6).toString("hex")}.mp3`;
        const filePath = path.join(TEMP_DIR, fileName);

        // Download the MP3 file from the external API (hidden from the client)
        const mp3Response = await axios({
            method: "GET",
            url: downloadUrl,
            responseType: "stream",
        });

        // Save the file locally
        const writer = fs.createWriteStream(filePath);
        mp3Response.data.pipe(writer);

        writer.on("finish", () => {
            // Respond with your own structure, hiding the external API details
            res.json({
                creator: "David Cyril Tech",
                status: 200,
                success: true,
                result: {
                    type: "audio",
                    quality: "128kbps", // You can customize this if needed
                    title: "YouTube MP3", // You can fetch the title if the API provides it
                    thumbnail: `https://img.youtube.com/vi/${extractYouTubeID(url)}/hqdefault.jpg`,
                    download_url: `${BASE_URL}/temp/${fileName}`,
                },
            });

            // Schedule file deletion after 5 minutes
            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting file:", err);
                    else console.log(`Deleted file: ${fileName}`);
                });
            }, 5 * 60 * 1000); // Delete after 5 minutes
        });

        writer.on("error", (error) => {
            console.error("File write error:", error);
            res.status(500).json({
                creator: "David Cyril Tech",
                status: 500,
                success: false,
                message: "Error saving the MP3 file.",
            });
        });
    } catch (error) {
        console.error("Error downloading MP3:", error.message);
        res.status(500).json({
            creator: "David Cyril Tech",
            status: 500,
            success: false,
            message: "Failed to download MP3. Please try again.",
        });
    }
});

// Serve downloaded MP3 files
app.use("/temp", express.static(TEMP_DIR));




const formatAudio = ["mp3", "m4a", "webm", "acc", "flac", "opus", "ogg", "wav"];
const formatVideo = ["360", "480", "720", "1080", "1440", "4k"];

// Helper function to check progress
async function cekProgress(id) {
    const configProgress = {
        method: "GET",
        url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Connection": "keep-alive",
            "X-Requested-With": "XMLHttpRequest",
        },
    };

    while (true) {
        const response = await axios.request(configProgress);
        if (response.data && response.data.success && response.data.progress === 1000) {
            return response.data.download_url;
        }
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
    }
}

// Main downloader function
async function ytdlv2(url, format) {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
        throw new Error("Invalid format. Please check the list of valid formats.");
    }

    const configDownload = {
        method: "GET",
        url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Connection": "keep-alive",
            "X-Requested-With": "XMLHttpRequest",
        },
    };

    const response = await axios.request(configDownload);

    if (response.data && response.data.success) {
        const { id, title, info } = response.data;
        const { image } = info;

        const downloadUrl = await cekProgress(id);

        return {
            id: id,
            image: image,
            title: title,
            downloadUrl: downloadUrl,
        };
    }

    throw new Error("Failed to fetch video details.");
}

app.get('/facebook', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const response = await axios.get(`https://api.paxsenix.biz.id/dl/fb`, {
            params: { url },
        });

        const data = response.data;

        if (!data.ok || !data.url) {
            return res.status(400).json({ error: 'Failed to fetch video details' });
        }

        // Restructure the API response with custom creator name
        const result = {
            creator: "David Cyril",
            status: 200,
      success: true,
            video: {
                thumbnail: data.cover,
                downloads: data.url.map(video => ({
                    quality: video.quality,
                    downloadUrl: video.downloadUrl,
                })),
            },
        };

        return res.json(result);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});


app.get("/download/ytmp4", async (req, res) => {
    const { url, format = "720" } = req.query; // Default to 720p if format isn't provided

    if (!url) {
        return res.status(400).json({
            creator: "David Cyril",
            status: 400,
            success: false,
            message: "Please provide a valid YouTube video URL using the `url` query parameter.",
        });
    }

    try {
        // Call the new API
        const response = await axios.get(`https://ytdl.siputzx.my.id/api/convert?url=${encodeURIComponent(url)}&type=mp4`);
        
        if (!response.data || !response.data.dl) {
            return res.status(500).json({
                creator: "David Cyril",
                status: 500,
                success: false,
                message: "Failed to fetch download link. Please try again later.",
            });
        }

        // Return response in the old format
        res.json({
            creator: "David Cyril",
            status: 200,
            success: true,
            result: {
                type: "video",
                quality: `${format}p`,
                title: response.data.title,
                thumbnail: `https://img.youtube.com/vi/${url.split("v=")[1]}/hqdefault.jpg`,
                download_url: response.data.dl,
            },
        });
    } catch (error) {
        console.error("Error processing YouTube MP4 request:", error.message);

        res.status(500).json({
            creator: "David Cyril",
            status: 500,
            success: false,
            message: "An unexpected error occurred while processing the request. Please try again later.",
        });
    }
});




















// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404/index.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});