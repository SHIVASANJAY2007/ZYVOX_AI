import { jsPDF } from 'jspdf';

// Strict character cleaner: filters out non-ASCII characters to prevent Helvetica font encoding bugs (like 'þ')
const cleanTextForParsing = (str) => {
    if (!str || typeof str !== 'string') return '';
    
    // Replace smart punctuation
    let cleaned = str
        .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
        .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
        .replace(/[\u2013\u2014]/g, '-') // En-dash and Em-dash
        .replace(/\u2022/g, '-'); // Unicode bullet U+2022
        
    // Keep only printable ASCII (characters 32-126) and common currency symbols: ₹ (U+20B9), £ (U+00A3), € (U+20AC), ¥ (U+00A5)
    const allowedCharsRegex = /[^\x20-\x7E\u20B9\u00A3\u20AC\u00A5]/g;
    return cleaned.replace(allowedCharsRegex, '').trim();
};

// Simple text cleaner for standard labels (e.g. usernames)
const cleanLabelText = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[^\x20-\x7E\u20B9\u00A3\u20AC\u00A5]/g, '').trim();
};

// Helper to scan messages and extract confirmed travel dates & traveler counts
const extractTravelDetails = (messages) => {
    let dates = null;
    let travellers = null;

    if (!messages || !Array.isArray(messages)) {
        return { dates, travellers };
    }

    // Scan from latest to earliest messages to get final confirmed values
    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        const text = msg.text || '';

        // Match Dates: e.g. "Travel Dates: 28th Aug" or "Dates: 8/28/2026"
        const dateMatch = text.match(/(?:travel\s+)?dates?\s*:\s*\*?([^\n\*]+)/i);
        if (dateMatch && !dateMatch[1].toLowerCase().includes('confirm') && !dates) {
            dates = dateMatch[1].replace(/[\(\)\*]/g, '').trim();
        }

        // Match Travellers: e.g. "Travellers: 2"
        const travelerMatch = text.match(/(?:number\s+of\s+)?travellers?\s*:\s*\*?([^\n\*]+)/i);
        if (travelerMatch && !travelerMatch[1].toLowerCase().includes('confirm') && !travellers) {
            travellers = travelerMatch[1].replace(/[\(\)\*]/g, '').trim();
        }
    }

    return { dates, travellers };
};

// Replaces prompt placeholders with actual confirmed values if available
const replacePlaceholders = (text, dates, travellers) => {
    let processed = text;
    if (dates) {
        processed = processed.replace(/\(Please confirm your exact travel dates so I can refine the plan further\.\)\*?/gi, dates);
    }
    if (travellers) {
        processed = processed.replace(/\(Please confirm the number of travellers for better cost estimates\.\)\*?/gi, travellers);
    }
    return processed;
};

// Helper to add centered page numbers to the footer
const addFooters = (doc, pageHeight, pageWidth, margin) => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
};

// Tokenize inline markdown elements: bold (**), italic (*), links ([label](url)), and normal text
const parseInlineTokens = (text) => {
    const tokens = [];
    let currentIndex = 0;
    
    // Regex matching bold, italic, or markdown links
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    let match;
    
    while ((match = tokenRegex.exec(text)) !== null) {
        const matchIndex = match.index;
        const matchText = match[0];
        
        // Preceding normal text
        if (matchIndex > currentIndex) {
            tokens.push({
                type: 'normal',
                text: text.substring(currentIndex, matchIndex)
            });
        }
        
        // Parse matched group type
        if (matchText.startsWith('**')) {
            tokens.push({
                type: 'bold',
                text: matchText.slice(2, -2)
            });
        } else if (matchText.startsWith('*')) {
            tokens.push({
                type: 'italic',
                text: matchText.slice(1, -1)
            });
        } else if (matchText.startsWith('[')) {
            const linkMatch = matchText.match(/\[(.*?)\]\((.*?)\)/);
            if (linkMatch) {
                tokens.push({
                    type: 'link',
                    text: linkMatch[1],
                    url: linkMatch[2]
                });
            }
        }
        
        currentIndex = tokenRegex.lastIndex;
    }
    
    // Remaining normal text
    if (currentIndex < text.length) {
        tokens.push({
            type: 'normal',
            text: text.substring(currentIndex)
        });
    }
    
    return tokens;
};

// Helper to identify markdown table rows
const isTableRow = (line) => {
    return line.trim().startsWith('|') && line.trim().endsWith('|');
};

// Markdown line-by-line renderer with formatting and page break handling
const renderMarkdownToPDF = (doc, markdownText, startY, margin, printableWidth, pageHeight) => {
    let y = startY;
    let lastDividerY = startY;
    const bottomMargin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Strip trailing horizontal rules from the end of the text to prevent duplicates
    const textToProcess = markdownText.trim().replace(/(?:\s*[\-\*_]{3,}\s*)+$/, '');
    
    // Split and pre-process lines to collapse consecutive empty spacings
    const rawLines = textToProcess.split('\n');
    const lines = [];
    let prevWasEmpty = false;
    
    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (line === '') {
            if (!prevWasEmpty && lines.length > 0) {
                lines.push('');
                prevWasEmpty = true;
            }
        } else {
            lines.push(line);
            prevWasEmpty = false;
        }
    }
    
    // Remove trailing empty line if it exists
    if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
    }

    const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > pageHeight - bottomMargin) {
            doc.addPage();
            // Draw clean page header band
            doc.setFillColor(255, 109, 56);
            doc.rect(0, 0, pageWidth, 4, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('ZYVOX AI TRAVEL CONCIERGE', margin, 15);
            
            doc.setDrawColor(240, 240, 240);
            doc.line(margin, 17, pageWidth - margin, 17);
            
            y = 25; // Reset y coordinate on the new page
        }
    };

    // Helper to render bold prefix next to normal wrapped body text (e.g. - **Morning**: text)
    const renderLineWithBoldPrefix = (prefix, text, isListItem) => {
        const bulletIndent = isListItem ? 8 : 0;
        const prefixText = prefix + ': ';
        const cleanPrefix = cleanTextForParsing(prefixText);
        const cleanBody = cleanTextForParsing(text).replace(/\*\*/g, ''); // strip duplicate inner markdown bold markers

        // Draw orange vector bullet circle (100% bug-free, resolves 'pb' character encoding)
        if (isListItem) {
            doc.setFillColor(255, 109, 56);
            doc.circle(margin + 4, y - 3, 1.2, 'F');
        }

        // Measure bold prefix width
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        const prefixWidth = doc.getTextWidth(cleanPrefix);

        // Find how much body text fits on the first line next to the bold prefix
        const firstLineMaxW = printableWidth - bulletIndent - prefixWidth;
        const bodyWords = cleanBody.split(' ');
        
        let firstLineText = '';
        let wordIdx = 0;
        
        while (wordIdx < bodyWords.length) {
            const testText = firstLineText ? firstLineText + ' ' + bodyWords[wordIdx] : bodyWords[wordIdx];
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            if (doc.getTextWidth(testText) > firstLineMaxW) {
                break;
            }
            firstLineText = testText;
            wordIdx++;
        }

        // Draw Prefix in Bold
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text(cleanPrefix, margin + bulletIndent, y);

        // Draw first line of body next to it in normal font
        if (firstLineText) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.text(firstLineText, margin + bulletIndent + prefixWidth, y);
        }

        y += 5.2;

        // Wrap and draw any remaining words on the subsequent lines
        if (wordIdx < bodyWords.length) {
            const remainingBody = bodyWords.slice(wordIdx).join(' ');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            const splitLines = doc.splitTextToSize(remainingBody, printableWidth - bulletIndent);
            
            for (let j = 0; j < splitLines.length; j++) {
                checkPageBreak(6);
                doc.text(splitLines[j], margin + bulletIndent, y);
                y += 5.2;
            }
        }
    };

    // Helper to render standard wrapped lines (list item or paragraph)
    const renderStyledLine = (text, isListItem) => {
        const bulletIndent = isListItem ? 8 : 0;
        let currentX = margin + bulletIndent;
        
        // Draw orange vector bullet circle (100% bug-free, resolves 'pb' character encoding)
        if (isListItem) {
            doc.setFillColor(255, 109, 56);
            doc.circle(margin + 4, y - 3, 1.2, 'F');
        }

        const cleanedLineText = cleanTextForParsing(text);
        const tokens = parseInlineTokens(cleanedLineText);

        tokens.forEach((token) => {
            // Apply appropriate font styling
            if (token.type === 'bold') {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(30, 30, 30);
            } else if (token.type === 'italic') {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
            } else if (token.type === 'link') {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(255, 109, 56); // Brand orange for hyperlinks
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
            }

            const words = token.text.split(' ');
            
            words.forEach((word, wIdx) => {
                if (word === '' && wIdx > 0) return;
                
                const wordWithSpace = wIdx < words.length - 1 ? word + ' ' : word;
                const wordWidth = doc.getTextWidth(wordWithSpace);
                
                // Wrap text if it exceeds the margin width
                if (currentX + wordWidth > margin + printableWidth) {
                    y += 5.2;
                    currentX = margin + bulletIndent;
                    checkPageBreak(6);
                }

                // Render word
                doc.text(word, currentX, y);

                // For clickable links, add underline and configure active link bounds
                if (token.type === 'link') {
                    doc.setDrawColor(255, 109, 56);
                    doc.setLineWidth(0.3);
                    const wordWidthWithoutSpace = doc.getTextWidth(word);
                    doc.line(currentX, y + 0.5, currentX + wordWidthWithoutSpace, y + 0.5);
                    doc.link(currentX, y - 3.5, wordWidthWithoutSpace, 4.5, { url: token.url });
                }

                currentX += wordWidth;
            });
        });

        y += 5.2;
    };

    // Vector-drawn Grid Table Renderer inside PDF
    const renderParsedTable = (tableLines) => {
        const startY = y;
        
        // Parse rows and split by pipes
        const parsedRows = tableLines.map(rowLine => {
            const cells = rowLine.split('|')
                .slice(1, -1) // remove empty outer cells
                .map(cell => cleanTextForParsing(cell.trim()).replace(/\*\*/g, ''));
            return cells;
        });

        if (parsedRows.length === 0) return y;

        // Skip markdown table border/separator row (e.g. |---|---|)
        const rows = parsedRows.filter(cells => {
            const isSeparator = cells.every(cell => cell.match(/^[-:\s]+$/));
            return !isSeparator;
        });

        if (rows.length === 0) return y;

        const headers = rows[0];
        const dataRows = rows.slice(1);
        const colCount = headers.length;
        const colWidth = printableWidth / colCount;

        // Ensure table header + at least one data row fits on the page
        checkPageBreak(18);

        // 1. Draw Table Header Row background
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y - 4, printableWidth, 7, 'F');
        doc.setDrawColor(215, 215, 215);
        doc.setLineWidth(0.3);
        doc.line(margin, y - 4, margin + printableWidth, y - 4);
        doc.line(margin, y + 3, margin + printableWidth, y + 3);

        // Draw header text cells
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);

        headers.forEach((headerText, colIdx) => {
            const cellX = margin + (colIdx * colWidth) + 2;
            doc.text(headerText, cellX, y);
        });

        y += 7;

        // 2. Draw Data Rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);

        dataRows.forEach((rowCells, rowIdx) => {
            // Pre-calculate line wraps per cell to evaluate dynamic row height
            let maxCellLines = 1;
            const cellTextLines = rowCells.map(cellText => {
                const split = doc.splitTextToSize(cellText, colWidth - 4);
                if (split.length > maxCellLines) {
                    maxCellLines = split.length;
                }
                return split;
            });

            const rowHeight = maxCellLines * 4.5 + 2;
            checkPageBreak(rowHeight);

            // Alternate row zebra backgrounds
            if (rowIdx % 2 === 1) {
                doc.setFillColor(250, 250, 250);
                doc.rect(margin, y - 3.5, printableWidth, rowHeight, 'F');
            }

            // Render each cell content
            cellTextLines.forEach((splitLines, colIdx) => {
                const cellX = margin + (colIdx * colWidth) + 2;
                let cellY = y;
                
                // If it is a clickable link cell (e.g. maps URL), draw it as blue/orange active link
                const rawCellText = rowCells[colIdx];
                if (rawCellText === 'Open' || rawCellText.startsWith('http')) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(255, 109, 56);
                    doc.text(rawCellText, cellX, cellY);
                    
                    doc.setDrawColor(255, 109, 56);
                    doc.setLineWidth(0.3);
                    const textWidth = doc.getTextWidth(rawCellText);
                    doc.line(cellX, cellY + 0.5, cellX + textWidth, cellY + 0.5);
                    
                    // Recover link destination URL from raw markdown block
                    const originalCell = tableLines[rowIdx + 2].split('|').slice(1, -1)[colIdx];
                    const linkMatch = originalCell.match(/\[.*?\]\((.*?)\)/);
                    if (linkMatch) {
                        doc.link(cellX, cellY - 3, textWidth, 4, { url: linkMatch[1] });
                    }
                } else {
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(60, 60, 60);
                    splitLines.forEach((splitLine, lineIdx) => {
                        doc.text(splitLine, cellX, cellY + (lineIdx * 4));
                    });
                }
            });

            // Draw horizontal row border
            doc.setDrawColor(235, 235, 235);
            doc.line(margin, y + rowHeight - 3.5, margin + printableWidth, y + rowHeight - 3.5);

            y += rowHeight;
        });

        // 3. Draw vertical columns border grid
        doc.setDrawColor(220, 220, 220);
        for (let colIdx = 0; colIdx <= colCount; colIdx++) {
            const lineX = margin + (colIdx * colWidth);
            doc.line(lineX, startY - 4, lineX, y - 3.5);
        }

        y += 4;
        lastDividerY = y;
        return y;
    };

    // Regex to match bold prefixes at the start of a list item or line: - **Morning**: Details
    const boldPrefixRegex = /^(?:[-*•●■▪◆❖✦➢➤➤þ]\s*|\d+\.\s*)?\*\*(.*?)\*\*(?:\s*:\s*|\s*-\s*|\s+)(.*)$/;
    // Regex to match raw bold titles like **Heading Title** on a single line
    const boldTitleRegex = /^\*\*(.*?)\*\*$/;

    let lastWasHorizontalRule = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line === '') {
            y += 3; // collapsed empty space
            continue;
        }

        // 0. Parse Tables (| Header | Column |)
        if (isTableRow(line)) {
            const tableLines = [];
            while (i < lines.length && isTableRow(lines[i])) {
                tableLines.push(lines[i]);
                i++;
            }
            i--; // Adjust index back
            
            y = renderParsedTable(tableLines);
            lastWasHorizontalRule = false;
            continue;
        }

        const isHorizontalRule = !!line.match(/^[\-\*_]{3,}$/);
        if (!isHorizontalRule) {
            lastWasHorizontalRule = false;
        }

        // 1. Parse Horizontal Rules (---, ***, ___)
        if (isHorizontalRule) {
            // Only draw if we are at least 35mm away from the last divider/table/header
            if (y - lastDividerY >= 35) {
                checkPageBreak(5);
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.5);
                doc.line(margin, y - 2, pageWidth - margin, y - 2);
                y += 4;
                lastDividerY = y;
                lastWasHorizontalRule = true;
            } else {
                y += 2; // Add a tiny spacer instead of a line
            }
            continue;
        }

        // 2. Parse Markdown Headings (# Heading, ## Heading)
        if (line.startsWith('#')) {
            const level = (line.match(/^#+/) || ['#'])[0].length;
            const headingText = cleanTextForParsing(line.replace(/^#+\s*/, '')).replace(/\*\*/g, '');
            
            let fontSize = 12;
            let spacing = 4;
            if (level === 1) { fontSize = 15; spacing = 6; }
            else if (level === 2) { fontSize = 13; spacing = 5; }
            else { fontSize = 11; spacing = 4; }

            checkPageBreak(fontSize + 6);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(fontSize);
            doc.setTextColor(30, 30, 30);
            doc.text(headingText, margin, y);
            y += fontSize / 2 + spacing;
            continue;
        }

        // 3. Parse Bold Titles on single lines (e.g. **Estimated Expenses (For 4 People)**)
        const boldTitleMatch = line.match(boldTitleRegex);
        if (boldTitleMatch) {
            const headingText = cleanTextForParsing(boldTitleMatch[1]);
            
            checkPageBreak(18);
            y += 2; // Spacing before section
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(30, 30, 30);
            doc.text(headingText, margin, y);
            y += 6 + 4;
            continue;
        }

        // 4. Parse Quotes (> Quote Text)
        if (line.startsWith('>')) {
            let quoteText = cleanTextForParsing(line.replace(/^>\s*/, '').replace(/\*\*/g, ''));
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);

            const splitLines = doc.splitTextToSize(quoteText, printableWidth - 10);
            const quoteHeight = splitLines.length * 5.2;
            
            checkPageBreak(quoteHeight + 4);

            // Left vertical accent bar in brand orange
            doc.setFillColor(255, 109, 56);
            doc.rect(margin, y - 3.5, 1.5, quoteHeight + 1, 'F');

            for (let j = 0; j < splitLines.length; j++) {
                doc.text(splitLines[j], margin + 6, y);
                y += 5.2;
            }
            y += 2.0;
            continue;
        }

        // 5. List Items & Paragraphs
        // Detect bullet indicators including unicode lists to filter out symbols properly
        const isListItem = line.startsWith('-') || line.startsWith('*') || line.startsWith('•') || line.startsWith('●') || line.startsWith('■') || line.startsWith('▪') || line.startsWith('◆') || line.startsWith('❖') || line.startsWith('✦') || line.startsWith('➢') || line.startsWith('➤') || line.startsWith('þ') || !!line.match(/^\d+\.\s/);
        
        let textContent = line;
        if (isListItem) {
            // Strip the markdown bullet character at the start of the line
            textContent = line.replace(/^[\-\*•●■▪◆❖✦➢➤þ\d\.]+\s*/, '');
            if (!textContent.trim()) {
                continue; // Skip empty bullet lines
            }
        }

        const boldPrefixMatch = textContent.match(boldPrefixRegex);

        if (boldPrefixMatch) {
            const prefix = boldPrefixMatch[1];
            const body = boldPrefixMatch[2];
            
            checkPageBreak(12);
            renderLineWithBoldPrefix(prefix, body, isListItem);
            y += isListItem ? 1.0 : 2.0;
        } else {
            checkPageBreak(12);
            renderStyledLine(textContent, isListItem);
            y += isListItem ? 1.0 : 2.0;
        }
    }
    return y;
};

// Generates PDF for a single response
export const downloadSingleReplyPDF = (messageText, userName = 'Explorer', messages = []) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const printableWidth = pageWidth - (margin * 2);
    
    let y = 20;

    // Draw header accent band
    doc.setFillColor(255, 109, 56); // Brand orange
    doc.rect(0, 0, pageWidth, 8, 'F');
    y += 10;

    // Brand logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 109, 56);
    doc.text('ZYVOX AI', margin, y);
    
    // Brand subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('YOUR NEURAL TRAVEL CONCIERGE', margin, y + 5);

    // Right-aligned Metadata Grid
    const dateStr = new Date().toLocaleDateString();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('TRAVELER', pageWidth - margin - 45, y, { align: 'right' });
    doc.text('DATE', pageWidth - margin, y, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(cleanLabelText(userName).toUpperCase(), pageWidth - margin - 45, y + 5, { align: 'right' });
    doc.text(dateStr, pageWidth - margin, y + 5, { align: 'right' });
    
    y += 12;

    // Elegant Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 12;

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('TRAVEL BRIEFING & ITINERARY', margin, y);
    
    y += 10;

    // Scan for confirmed traveler details and replace prompts
    const { dates, travellers } = extractTravelDetails(messages);
    const cleanedMessageText = replacePlaceholders(messageText, dates, travellers);

    // Render message body
    y = renderMarkdownToPDF(doc, cleanedMessageText, y, margin, printableWidth, pageHeight);

    // Apply Centered Page Numbers
    addFooters(doc, pageHeight, pageWidth, margin);

    doc.save(`zyvox-itinerary-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Generates PDF for the full chat transcript
export const downloadFullChatPDF = (messages, userName = 'Explorer') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const printableWidth = pageWidth - (margin * 2);
    
    let y = 20;

    // Draw header accent band
    doc.setFillColor(255, 109, 56); // Brand orange
    doc.rect(0, 0, pageWidth, 8, 'F');
    y += 10;

    // Brand logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 109, 56);
    doc.text('ZYVOX AI', margin, y);
    
    // Brand subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('YOUR NEURAL TRAVEL CONCIERGE', margin, y + 5);

    // Right-aligned Metadata Grid
    const dateStr = new Date().toLocaleDateString();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('TRAVELER', pageWidth - margin - 45, y, { align: 'right' });
    doc.text('DATE', pageWidth - margin, y, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(cleanLabelText(userName).toUpperCase(), pageWidth - margin - 45, y + 5, { align: 'right' });
    doc.text(dateStr, pageWidth - margin, y + 5, { align: 'right' });
    
    y += 12;

    // Elegant Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 12;

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('COMPLETE CONVERSATION LOG', margin, y);
    
    y += 15;

    const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > pageHeight - 20) {
            doc.addPage();
            // Draw page header band
            doc.setFillColor(255, 109, 56);
            doc.rect(0, 0, pageWidth, 4, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('ZYVOX AI CHAT LOG', margin, 15);
            
            doc.setDrawColor(240, 240, 240);
            doc.line(margin, 17, pageWidth - margin, 17);
            
            y = 25;
        }
    };

    // Scan and get confirmed details once
    const { dates, travellers } = extractTravelDetails(messages);

    messages.forEach((msg) => {
        const senderName = msg.isBot ? 'ZYVOX AI AGENT' : cleanLabelText(userName).toUpperCase();
        const timeStr = msg.time || '';
        
        checkPageBreak(18);

        // Draw a premium looking Pill Tag for Sender
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        const nameWidth = doc.getTextWidth(senderName);
        
        if (msg.isBot) {
            doc.setFillColor(255, 246, 242); // Light orange background
            doc.rect(margin, y - 4, nameWidth + 6, 6, 'F');
            doc.setTextColor(255, 109, 56); // Brand orange text
            doc.text(senderName, margin + 3, y);
        } else {
            doc.setFillColor(245, 245, 245); // Light gray background
            doc.rect(margin, y - 4, nameWidth + 6, 6, 'F');
            doc.setTextColor(80, 80, 80); // Gray text
            doc.text(senderName, margin + 3, y);
        }
        
        // Draw Timestamp next to sender tag
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(`(${timeStr})`, margin + nameWidth + 9, y);
        
        y += 8;

        // Render message content
        if (msg.isBot) {
            const cleanedBotText = replacePlaceholders(msg.text, dates, travellers);
            y = renderMarkdownToPDF(doc, cleanedBotText, y, margin, printableWidth, pageHeight);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            const splitLines = doc.splitTextToSize(cleanTextForParsing(msg.text), printableWidth);
            for (let j = 0; j < splitLines.length; j++) {
                checkPageBreak(6);
                doc.text(splitLines[j], margin, y);
                y += 5.2;
            }
            y += 2;
        }

        // Draw horizontal divider between dialogue exchanges
        checkPageBreak(10);
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
    });

    // Apply Centered Page Numbers
    addFooters(doc, pageHeight, pageWidth, margin);

    doc.save(`zyvox-chat-history-${new Date().toISOString().slice(0, 10)}.pdf`);
};
