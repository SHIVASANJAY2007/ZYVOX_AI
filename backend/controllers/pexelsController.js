import { findUserById } from '../database/dbService.js';

export const searchPexelsMedia = async (req, res, next) => {
  const { query } = req.query;
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: 'PEXELS_API_KEY is not configured in backend environment variables.'
    });
  }

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'query parameter is required'
    });
  }

  try {
    // 1. Fetch photos from Pexels
    const photoRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, {
      headers: {
        Authorization: apiKey
      }
    });

    // 2. Fetch videos from Pexels
    const videoRes = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=2`, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!photoRes.ok || !videoRes.ok) {
      throw new Error(`Pexels API responded with error: Photos status ${photoRes.status}, Videos status ${videoRes.status}`);
    }

    const photoData = await photoRes.json();
    const videoData = await videoRes.json();

    // Map photos to a clean format
    const photos = (photoData.photos || []).map(p => ({
      id: p.id,
      url: p.url,
      src: p.src.large2x || p.src.large || p.src.medium,
      photographer: p.photographer,
      photographerUrl: p.photographer_url
    }));

    // Map videos to a clean format
    const videos = (videoData.videos || []).map(v => {
      const files = v.video_files || [];
      const mp4File = files.find(f => f.file_type === 'video/mp4') || files[0];
      return {
        id: v.id,
        url: v.url,
        image: v.image,
        videoUrl: mp4File ? mp4File.link : null,
        duration: v.duration,
        user: v.user ? v.user.name : 'Pexels'
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        photos,
        videos
      }
    });

  } catch (error) {
    console.error("Error fetching Pexels media:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve media from Pexels API.',
      error: error.message
    });
  }
};
