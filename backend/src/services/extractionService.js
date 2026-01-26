
import PDFParser from 'pdf2json';

const DEFAULT_RULES = [
    { targetField: 'invoiceNumber', method: 'keyword_proximity', keyword: 'Invoice Number', searchDirection: 'auto' },
    { targetField: 'invoiceNumber', method: 'keyword_proximity', keyword: 'Invoice #', searchDirection: 'auto' },
    { targetField: 'invoiceNumber', method: 'keyword_proximity', keyword: 'Inv #', searchDirection: 'auto' },
    { targetField: 'invoiceNumber', method: 'keyword_proximity', keyword: '#', searchDirection: 'right' },
    { targetField: 'totalAmount', method: 'keyword_proximity', keyword: 'Total Amount', searchDirection: 'auto' },
    { targetField: 'totalAmount', method: 'keyword_proximity', keyword: 'Grand Total', searchDirection: 'auto' },
    { targetField: 'totalAmount', method: 'keyword_proximity', keyword: 'Total', searchDirection: 'auto' },
    { targetField: 'totalAmount', method: 'keyword_proximity', keyword: 'Amount Due', searchDirection: 'auto' },
    { targetField: 'invoiceDate', method: 'keyword_proximity', keyword: 'Invoice Date', searchDirection: 'auto' },
    { targetField: 'invoiceDate', method: 'keyword_proximity', keyword: 'Date:', searchDirection: 'auto' },
    { targetField: 'invoiceDate', method: 'keyword_proximity', keyword: 'Date', searchDirection: 'auto' },
    { targetField: 'dueDate', method: 'keyword_proximity', keyword: 'Due Date', searchDirection: 'auto' },
    { targetField: 'dueDate', method: 'keyword_proximity', keyword: 'DueDate', searchDirection: 'auto' }
];

export const normalizeDate = (val) => {
    if (!val) return '';
    let cleanVal = String(val).trim();

    cleanVal = cleanVal
        .replace(/Invoice\s*Date[:\s]*/i, '')
        .replace(/Due\s*Date[:\s]*/i, '')
        .replace(/Date[:\s]*/i, '')
        .trim();

    const dmyMatch = cleanVal.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
        const d = parseInt(dmyMatch[1], 10);
        const m = parseInt(dmyMatch[2], 10);
        const y = parseInt(dmyMatch[3], 10);
        return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
    }

    const date = new Date(cleanVal);
    if (!isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${d}-${m}-${y}`; // DD-MM-YYYY
    }

    return val;
};

const cleanExtractedValue = (key, rawValue) => {
    if (!rawValue) return '';
    let val = rawValue.trim();

    if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('total')) {
        val = val.replace(/Balance\s*Due[:\s]*/gi, '')
            .replace(/Total\s*Amount[:\s]*/gi, '')
            .replace(/Total[:\s]*/gi, '')
            .replace(/Amount[:\s]*/gi, '')
            .trim();
        val = val.replace(/[^0-9.,-]/g, '');
    }

    if (key === 'invoiceNumber') {
        val = val.replace(/^#\s*/, '')
            .replace(/Invoice\s*#\s*/i, '')
            .replace(/Inv\s*#\s*/i, '')
            .replace(/Invoice\s*No\.?\s*/i, '')
            .trim();
    }

    if (key.toLowerCase().includes('date')) {
        val = val.replace(/Invoice\s*Date[:\s]*/gi, '')
            .replace(/Due\s*Date[:\s]*/gi, '')
            .replace(/Date[:\s]*/gi, '')
            .trim();
        const std = normalizeDate(val);
        if (std && std.match(/^\d{2}-\d{2}-\d{4}$/)) {
            val = std;
        }
    }

    return val;
};

const assembleLines = (textItems) => {
    if (!textItems || textItems.length === 0) return [];

    const sorted = [...textItems].sort((a, b) => {
        if (a.pageIndex !== b.pageIndex) return a.pageIndex - b.pageIndex;
        if (Math.abs(a.y - b.y) > 0.5) return a.y - b.y;
        return a.x - b.x;
    });

    const lines = [];
    let currentLine = [];
    let lastItem = null;

    sorted.forEach(item => {
        if (!lastItem) {
            currentLine.push(item);
        } else {
            const samePage = item.pageIndex === lastItem.pageIndex;
            const sameRow = Math.abs(item.y - lastItem.y) < 0.5;

            if (samePage && sameRow) {
                currentLine.push(item);
            } else {
                lines.push(currentLine);
                currentLine = [item];
            }
        }
        lastItem = item;
    });
    if (currentLine.length > 0) lines.push(currentLine);

    return lines.map(lineItems => {
        const first = lineItems[0];
        const last = lineItems[lineItems.length - 1];

        let fullStr = '';
        let minX = first.x;
        let minY = first.y;
        let maxX = last.x + last.width;
        let maxHeight = 0;

        lineItems.forEach((it, idx) => {
            if (idx > 0) {
                const prev = lineItems[idx - 1];
                const gap = it.x - (prev.x + prev.width);
                if (gap > 0.4) fullStr += ' ';
            }
            fullStr += it.str;
            maxHeight = Math.max(maxHeight, it.height);
        });

        return {
            str: fullStr,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxHeight,
            pageIndex: first.pageIndex
        };
    });
};

export const findCoordinates = (textItems, targetValue, fieldKey = '') => {
    if (!targetValue || !textItems) return null;

    const assembledLines = assembleLines(textItems);

    const matchTarget = String(targetValue).trim();
    const isDate = fieldKey.toLowerCase().includes('date');
    const isAmount = fieldKey.toLowerCase().includes('amount') || fieldKey.toLowerCase().includes('total');

    let normTargetDate = null;
    if (isDate) {
        normTargetDate = normalizeDate(matchTarget);
    }

    const isMatch = (str) => {
        const raw = str.trim();
        if (raw === matchTarget) return true;
        if (raw.includes(matchTarget)) return true;
        if (isDate && normTargetDate) {
            const normRaw = normalizeDate(raw);
            if (normRaw && normRaw === normTargetDate) return true;
        }
        if (isAmount) {
            const cleanRaw = raw.replace(/[^0-9.]/g, '');
            const cleanTarget = matchTarget.replace(/[^0-9.]/g, '');
            if (cleanRaw && cleanRaw === cleanTarget) return true;
        }
        return false;
    };

    for (const line of assembledLines) {
        if (isMatch(line.str)) {
            return {
                x: line.x, y: line.y, width: line.width, height: line.height, pageIndex: line.pageIndex
            };
        }
    }
    return null;
};

export const extractTextWithCoordinates = (buffer) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        const timeout = setTimeout(() => reject(new Error('PDF Parse Timeout')), 5000);

        pdfParser.on("pdfParser_dataError", errData => {
            clearTimeout(timeout);
            reject(errData.parserError);
        });

        pdfParser.on("pdfParser_dataReady", pdfData => {
            clearTimeout(timeout);
            let fullText = '';
            const textItems = [];

            pdfData.Pages.forEach((page, pageIndex) => {
                page.Texts.forEach(textBlock => {
                    textBlock.R.forEach(run => {
                        let str = '';
                        try { str = decodeURIComponent(run.T); } catch (e) { str = run.T; }
                        if (!str || str.trim().length === 0) return;

                        textItems.push({
                            str: str,
                            x: textBlock.x,
                            y: textBlock.y,
                            width: textBlock.w,
                            height: 1,
                            pageIndex: pageIndex
                        });
                    });
                });
            });

            resolve({ fullText: '', textItems, pageCount: pdfData.Pages.length });
        });

        pdfParser.parseBuffer(buffer);
    });
};

export const extractData = async (buffer, rules) => {
    try {
        const { textItems } = await extractTextWithCoordinates(buffer);
        const results = {};
        const activeRules = (rules && rules.length > 0) ? rules : DEFAULT_RULES;

        const lines = assembleLines(textItems);

        for (const rule of activeRules) {
            if (results[rule.targetField]) continue;

            if (rule.method === 'coordinate' && rule.coordinates) {
                const { x, y, width, height, pageIndex } = rule.coordinates;

                const match = lines.find(line => {
                    if (line.pageIndex !== pageIndex) return false;
                    const noOverlap = (
                        line.x > x + width ||
                        line.x + line.width < x ||
                        line.y > y + height ||
                        line.y + line.height < y
                    );
                    if (noOverlap) return false;
                    if (Math.abs(line.y - y) > 1.0) return false;
                    return true;
                });

                if (match) {
                    const cleanVal = cleanExtractedValue(rule.targetField, match.str);
                    results[rule.targetField] = cleanVal;
                }
            }
        }

        return { results, textItems, fullText: '' };
    } catch (e) { throw e; }
};

export const calculateConfidence = (extractedData, rules) => {
    if (!extractedData || Object.keys(extractedData).length === 0) return 0;
    if (!rules || rules.length === 0) {
        const foundCount = Object.keys(extractedData).length;
        return Math.min(foundCount * 20, 60);
    }
    const totalFields = rules.length;
    let foundFields = 0;
    rules.forEach(rule => { if (extractedData[rule.targetField]) foundFields++; });
    return Math.round((foundFields / totalFields) * 100);
};
