import {
  saveMessage,
  getChatHistory,
  getRecentChatHistory,
  findUserById
} from '../database/dbService.js';

export const sendMessageAndGetReply = async (req, res, next) => {
  const { personId, sessionId, message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'message is required'
    });
  }

  try {
    // 1. Save user message to database only if personId is provided and valid
    let shouldLog = false;
    if (personId) {
      const userObj = await findUserById(personId);
      if (userObj) {
        shouldLog = true;
      }
    }

    if (shouldLog) {
      await saveMessage(personId, sessionId, 'user', message);
    }

    // 2. Call n8n webhook (CORS is bypassed since it's server-to-server)
    const n8nUrl = process.env.N8N_WEBHOOK_URL || "https://e33uu8smpj6m.shares.zrok.io/webhook/591a4f49-ef7f-443f-9374-13120ae3dc94";
    
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'skip_zrok_interstitial': 'true'
      },
      body: JSON.stringify({
        chatInput: message,
        sessionId: sessionId || '',
        personNo: personId || ''
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`n8n error response body:`, errText);
      throw new Error(`n8n webhook responded with status ${response.status}: ${errText.substring(0, 200)}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = text;
    }

    // Parse n8n response format
    let botText = "";
    if (data && data.reply) {
      botText = data.reply;
    } else if (data && data.output) {
      botText = data.output;
    } else if (data && data.text) {
      botText = data.text;
    } else if (data && data.message) {
      botText = data.message;
    } else if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem && firstItem.reply) botText = firstItem.reply;
      else if (firstItem && firstItem.output) botText = firstItem.output;
      else if (firstItem && firstItem.text) botText = firstItem.text;
      else if (firstItem && firstItem.message) botText = firstItem.message;
      else botText = JSON.stringify(firstItem);
    } else if (typeof data === 'string' && data.trim() !== '') {
      botText = data;
    } else if (data !== undefined && data !== null && data !== "") {
      botText = JSON.stringify(data);
    }

    if (!botText.trim()) {
      botText = "⚠️ Received an empty response from n8n.";
    }

    // Extract responseType from n8n response
    let responseType = "question";
    if (data) {
      if (data.responseType) {
        responseType = data.responseType;
      } else if (Array.isArray(data) && data.length > 0 && data[0].responseType) {
        responseType = data[0].responseType;
      }
    }

    // 3. Save assistant message to database
    if (shouldLog) {
      await saveMessage(personId, sessionId, 'assistant', botText);
    }

    // 4. Return response to frontend
    return res.status(200).json({
      success: true,
      output: botText,
      responseType: responseType
    });

  } catch (error) {
    console.error("Error in sendMessageAndGetReply proxy:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to communicate with n8n AI Assistant.',
      error: error.message
    });
  }
};


export const saveMsg = async (req, res, next) => {
  const { personId, sessionId, role, message } = req.body;

  if (!personId || !role || !message) {
    return res.status(400).json({
      success: false,
      message: 'personId, role, and message are required'
    });
  }

  if (role !== 'user' && role !== 'assistant') {
    return res.status(400).json({
      success: false,
      message: "role must be either 'user' or 'assistant'"
    });
  }

  try {
    const chatMsg = await saveMessage(personId, sessionId, role, message);
    return res.status(201).json({
      success: true,
      message: 'Chat message saved successfully',
      data: chatMsg
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  const { personId, sessionId } = req.query;

  if (!personId) {
    return res.status(400).json({
      success: false,
      message: 'personId query parameter is required'
    });
  }

  try {
    const history = await getChatHistory(personId, sessionId);
    const enrichedHistory = history.map(msg => {
      let responseType = "question";
      if (msg.role === 'assistant') {
        const text = msg.message || "";
        const lower = text.toLowerCase();
        if (lower.includes('final plan')) {
          responseType = "plan_final";
        } else if (lower.includes('rough plan')) {
          responseType = "plan_rough";
        }
      }
      return {
        ...msg,
        responseType
      };
    });
    return res.status(200).json({
      success: true,
      data: enrichedHistory
    });
  } catch (error) {
    next(error);
  }
};

export const getRecent = async (req, res, next) => {
  const { limit } = req.query;
  const queryLimit = limit ? parseInt(limit, 10) : 100;

  try {
    const recentHistory = await getRecentChatHistory(queryLimit);
    const enrichedHistory = recentHistory.map(msg => {
      let responseType = "question";
      if (msg.role === 'assistant') {
        const text = msg.message || "";
        const lower = text.toLowerCase();
        if (lower.includes('final plan')) {
          responseType = "plan_final";
        } else if (lower.includes('rough plan')) {
          responseType = "plan_rough";
        }
      }
      return {
        ...msg,
        responseType
      };
    });
    return res.status(200).json({
      success: true,
      data: enrichedHistory
    });
  } catch (error) {
    next(error);
  }
};

export const checkN8nStatus = async (req, res, next) => {
  const n8nUrl = process.env.N8N_WEBHOOK_URL || "https://e33uu8smpj6m.shares.zrok.io/webhook/591a4f49-ef7f-443f-9374-13120ae3dc94";
  
  try {
    const urlObj = new URL(n8nUrl);
    const n8nBaseUrl = urlObj.origin; // e.g. https://e33uu8smpj6m.shares.zrok.io

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout for slower tunnels

    const response = await fetch(n8nBaseUrl, {
      method: 'GET',
      headers: {
        'skip_zrok_interstitial': 'true',
        'User-Agent': 'Mozilla/5.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    // Status 200 means n8n dashboard loaded. Status 502 means zrok tunnel works but n8n container is stopped.
    const isOnline = response.status === 200;
    
    return res.status(200).json({
      success: true,
      online: isOnline,
      statusCode: response.status
    });
  } catch (error) {
    console.error("n8n status check failed. Error details:", error.message);
    return res.status(200).json({
      success: true,
      online: false,
      reason: error.message
    });
  }
};
