// src/utils/amadeusClient.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.AMADEUS_BASE_URL;
const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = null;

/**
 * Get OAuth2 token from Amadeus
 */
async function getAccessToken() {
    // Agar token valid hai toh reuse karo
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
        return accessToken;
    }

    try {
        const res = await axios.post(
            `${BASE_URL}/v1/security/oauth2/token`,
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        accessToken = res.data.access_token;
        // Token expiry set karo (res.data.expires_in seconds hota hai)
        tokenExpiry = new Date(new Date().getTime() + res.data.expires_in * 1000);

        return accessToken;
    } catch (err) {
        console.error("❌ Amadeus Auth Error:", err.response?.data || err.message);
        throw new Error("Failed to fetch Amadeus access token");
    }
}

/**
 * Helper for GET requests
 */
export async function amadeusGet(endpoint, params = {}) {
    const token = await getAccessToken();

    const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });

    return res.data;
}

/**
 * Helper for POST requests
 */
export async function amadeusPost(endpoint, body = {}) {
    const token = await getAccessToken();

    const res = await axios.post(`${BASE_URL}${endpoint}`, body, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    return res.data;
}
