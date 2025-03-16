import fetch from 'node-fetch'

const API_URL = 'https://api.tiklydown.eu.org/api/download/v3?url='

export async function tiktokdl(url) {
  return fetch(`${API_URL}${encodeURIComponent(url)}`)
    .then((response) => response.json())
    .then((data) => data.result)
    .catch((error) => {
      console.error('Error fetching tiktok data:', error)
      return null
    })
           }
