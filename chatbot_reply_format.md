# Zyvox AI Chatbot - Reply Message Format (Prompt & Code)

This document contains:
1. **The System Prompt**: The system instructions to configure the LLM (in n8n or direct integrations) to generate responses that perfectly render into Zyvox AI's premium interactive widgets.
2. **The Frontend Parser Code**: The core regex and parsing logic extracted from [ResponseRenderer.jsx](file:///d:/Zyvox%20&%20Finexa/Zyvox%20AI/Zyvox%20AI/frontend/src/components/ResponseRenderer.jsx).

---

## 1. The System Prompt (For LLM / n8n Configuration)

Copy and paste the following prompt into your n8n AI Agent Node, System Instructions, or LLM prompt settings to ensure the chatbot outputs correctly parsed blocks.

```markdown
You are the Zyvox AI Travel Concierge, an elite agent designing luxury itineraries.
Your responses are parsed dynamically by a frontend engine. You MUST structure your responses using the following syntaxes to trigger interactive UI widgets:

### 1. General Formatting
- Write in standard Markdown. Use bolding (**word**) for emphasis, lists for highlights, and headings (# or ##) to separate thoughts.
- Currency: Use currency symbols like ₹, $, €, £. These will be highlighted automatically by the UI.

### 2. Multi-Plan Option Tabs
To present multiple itinerary options, use Plan headers:
Format: `# Plan [Number] - [Plan Name]` or `**Option [Letter]: [Plan Name]**`
Example:
# Plan 1 - Ultra Luxury Escape
This option focus on private villas and yacht transfers...

# Plan 2 - Adventure & Nature
This option is designed for hiking and beach tours...

### 3. Itinerary Timelines (Days & Time Segments)
To trigger the visual timeline, write consecutive Days and Time Segments.
- Day headers must match: `## Day [Number] - [Title]` or `**Day [Number]: [Title]**`
- Time segments must match: `**[Time]**: [Details]` (Use Morning, Afternoon, Evening, or Night).
Example:
**Day 1: Arrival & Coastal Sunset**
**Morning**: Driver meets you at the airport in an Audi Q7 and transfers you to the resort.
**Afternoon**: Check-in at Alila Diwa and enjoy private beach lounging.
**Evening**: Candlelit dinner at the beach side shack.

### 4. Rich Callout Boxes
To highlight warnings, tips, success states, or notes, use the Callout format.
Format: `[Emoji] **[Type]**: [Message]`
Supported Types: Tip, Warning, Important, Note, Remember, Caution, Alert, Success, Info.
Example:
💡 **Tip**: Secure your hot air balloon slots at least 2 weeks in advance.
⚠️ **Warning**: Monsoons in this region can disrupt boat transfers.

### 5. Media (Images & Videos)
If you place a single URL on its own line, the frontend will automatically embed it as a responsive media player or image.
- Image URLs (ending in .jpg, .png, etc., or from unsplash) render as images.
- Video URLs (YouTube, Vimeo, or .mp4) render as video player widgets.
Example:
https://images.unsplash.com/photo-1544735716-392fe2489ffa

### 6. Sources & References Citation Cards
To show citations at the end of your response:
Format: Use a header like `### Sources` or `### References`, followed by markdown links.
Example:
### Sources
- [Goa Tourism Guide](https://goatourism.gov.in)
- [Booking.com Stays](https://booking.com)

### 7. Custom JSON Widgets (Action buttons, Links, Recommendations)
If you need to render highly specific cards, links, or CTA buttons, insert a JSON code block with the class "json".
Format:
```json
{
  "type": "buttons",
  "buttons": [
    {
      "label": "🗺️ Open Maps Route",
      "url": "https://maps.google.com",
      "style": "primary"
    },
    {
      "label": "🏨 View Stays",
      "url": "https://booking.com",
      "style": "secondary"
    }
  ]
}
```
Available JSON types:
- `buttons`: Render Call-to-Action buttons.
- `links`: Render lists of clickable links with favicons.
- `cards` (or places, news, recommendations): Render grid cards with titles, images, descriptions, ratings, and price tags.
- `callout`: Render custom alerts.
- `image`: Render an image with custom alt text and captions.
```

---

## 2. Frontend Parser Code Reference

Below is the JavaScript parsing engine extracted from [ResponseRenderer.jsx](file:///d:/Zyvox%20&%20Finexa/Zyvox%20AI/Zyvox%20AI/frontend/src/components/ResponseRenderer.jsx) that decodes the chatbot's message into React components.

### Regex Constants
These regex patterns identify block starts in the text output of the AI:
```javascript
const dayHeaderRegex = /^(?:#+\s+|\*\*|)\b(Day\s+\d+|DAY\s+\d+)\b(?:\s*[:\-]\s*|\s+)(.*?)(?:\*\*|)$/i;
const timeSegmentRegex = /^\s*[\-\*\d\.\+\s]*\*\*?(Morning|Afternoon|Evening|Night)(?:\s*\([^)]+\))?\*\*?:?\s*(.*?)\s*$/i;
const calloutRegex = /^(?:💡|⚠️|🚨|ℹ️|🛑|📌|👉)?\s*\*\*?(Tip|Warning|Important|Note|Remember|Caution|Alert|Success|Info)\*\*?\s*:\s*(.*?)$/i;
const planHeaderRegex = /^(?:#+\s+|\*\*|)\b(Plan\s+\d+|Option\s+[A-Z])\b(?:\s*[:\-]\s*|\s+)(.*?)(?:\*\*|)$/i;
const sourcesHeaderRegex = /^(?:#+\s+|\*\*|)(Sources|References|Citations)(?:\s*[:\-]\s*|\s*)(?:\*\*|)$/i;
const sourceLinkRegex = /^\s*[\-\*\d\.\+\s]*(?:\[(.*?)\]\((.*?)\)|(https?:\/\/[^\s]+))\s*$/i;
```

### Preprocessing Text (Emoji/Bullet Fixes)
This function separates list items that are squeezed together with emojis:
```javascript
const preprocessBotReplyText = (text) => {
    if (!text) return '';
    
    let lines = text.split('\n');
    let processedLines = lines.map(line => {
        let currentLine = line;
        
        // 1. Split on keycaps 1️⃣ to 10️⃣ and list bullets (✨, 💡, ⭐️) preceded by non-whitespace
        const generalListRegex = /([^\s])\s*((?:[1-9]|10)️⃣|✨|💡|⭐️)\s+/g;
        currentLine = currentLine.replace(generalListRegex, '$1\n- $2 ');
        
        // 2. Split on activity emojis followed by titles and colons/dashes
        const titleListRegex = /([^\s])\s*(🏄|🌿|🏛️|🛍️|🍴|👤|🏨|🎟️|🎡|🚕|🚗|🚌|💰|💵|🗺️|🏔️|🏝️|⛺|🚂|✈️|⏱️|🎒)\s+([A-Za-z0-9\s&]+?)(:|–|-)\s+/g;
        currentLine = currentLine.replace(titleListRegex, '$1\n- $2 $3$4 ');
        
        return currentLine;
    });
    
    // Eliminate consecutive horizontal rule lines
    let filteredLines = [];
    let lastWasHr = false;
    for (let i = 0; i < processedLines.length; i++) {
        const line = processedLines[i];
        if (/^\s*([-*_])\s*(?:\1\s*){2,}\s*$/.test(line)) {
            if (lastWasHr) continue;
            lastWasHr = true;
        } else {
            lastWasHr = false;
        }
        filteredLines.push(line);
    }
    
    return filteredLines.join('\n');
};
```

### Sub-Block Parser
This divides the message into structured block arrays:
```javascript
const parseSubBlocks = (lines) => {
    const blocks = [];
    let accumulatedMarkdown = [];
    
    const flushMarkdown = () => {
        if (accumulatedMarkdown.length > 0) {
            blocks.push({ type: 'markdown', content: accumulatedMarkdown.join('\n') });
            accumulatedMarkdown = [];
        }
    };

    let currentDay = null;
    let currentSegment = null;
    let sourceLinks = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 1. Sources Block check
        if (line.match(sourcesHeaderRegex)) {
            flushMarkdown();
            if (currentDay) {
                blocks.push({ type: 'day', day: currentDay });
                currentDay = null;
            }
            sourceLinks = [];
            continue;
        }
        
        if (sourceLinks !== null) {
            const linkMatch = line.match(sourceLinkRegex);
            if (linkMatch) {
                const title = linkMatch[1] || linkMatch[3];
                const url = linkMatch[2] || linkMatch[3];
                sourceLinks.push({ title, url });
                continue;
            } else if (line.trim() === '') {
                continue; 
            } else {
                blocks.push({ type: 'sources', items: sourceLinks });
                sourceLinks = null;
            }
        }
        
        // 2. Day Block check
        const dayMatch = line.match(dayHeaderRegex);
        if (dayMatch) {
            flushMarkdown();
            if (currentDay) {
                blocks.push({ type: 'day', day: currentDay });
            }
            currentDay = {
                dayNum: dayMatch[1],
                title: dayMatch[2] || 'Exploration',
                description: '',
                segments: []
            };
            currentSegment = null;
            continue;
        }
        
        // 3. Callout Box check
        const calloutMatch = line.match(calloutRegex);
        if (calloutMatch) {
            flushMarkdown();
            const type = calloutMatch[1].toLowerCase();
            const text = calloutMatch[2];
            let style = 'info';
            if (['warning', 'caution', 'alert'].includes(type)) style = 'warning';
            else if (['success', 'done'].includes(type)) style = 'success';
            else if (['error', 'danger'].includes(type)) style = 'error';
            
            blocks.push({ type: 'callout', style, title: calloutMatch[1], text });
            continue;
        }
        
        // 4. Day Segments (Morning, Afternoon, etc.) check
        if (currentDay) {
            const timeMatch = line.match(timeSegmentRegex);
            if (timeMatch) {
                currentSegment = { time: timeMatch[1], details: timeMatch[2] };
                currentDay.segments.push(currentSegment);
                continue;
            }
            
            const timeHeaderMatch = line.match(/^[#\s\*]*\s*(Morning|Afternoon|Evening|Night)\s*$/i);
            if (timeHeaderMatch) {
                currentSegment = { time: timeHeaderMatch[1], details: '' };
                currentDay.segments.push(currentSegment);
                continue;
            }
            
            if (line.trim() !== '') {
                if (currentSegment) {
                    currentSegment.details += (currentSegment.details ? '\n' : '') + line.replace(/^\s*[\-\*\+\s]*/, '');
                } else {
                    currentDay.description += (currentDay.description ? '\n' : '') + line.replace(/^\s*[\-\*\+\s]*/, '');
                }
                continue;
            }
        }
        
        // 5. Raw Image/Video Media check
        const urlRegex = /(https?:\/\/[^\s\)]+)/g;
        const urls = line.match(urlRegex);
        if (urls && urls.length === 1 && line.trim() === urls[0]) {
            const url = urls[0];
            const isGif = url.match(/\.gif/i) || url.includes('giphy.com') || url.includes('tenor.com');
            const isImage = isImageUrl(url);
            const isVideo = isVideoUrl(url);
            
            if (isGif || isImage || isVideo) {
                flushMarkdown();
                blocks.push({
                    type: 'media',
                    mediaType: isGif ? 'gif' : isVideo ? 'video' : 'image',
                    url: url
                });
                continue;
            }
        }
        
        accumulatedMarkdown.push(line);
    }
    
    flushMarkdown();
    if (currentDay) blocks.push({ type: 'day', day: currentDay });
    if (sourceLinks) blocks.push({ type: 'sources', items: sourceLinks });
    
    // Group consecutive Day blocks into itineraries
    const finalBlocks = [];
    let currentItineraryDays = [];
    
    for (let block of blocks) {
        if (block.type === 'day') {
            currentItineraryDays.push(block.day);
        } else {
            if (currentItineraryDays.length > 0) {
                finalBlocks.push({ type: 'itinerary', days: currentItineraryDays });
                currentItineraryDays = [];
            }
            finalBlocks.push(block);
        }
    }
    if (currentItineraryDays.length > 0) {
        finalBlocks.push({ type: 'itinerary', days: currentItineraryDays });
    }
    
    return finalBlocks;
};
```
