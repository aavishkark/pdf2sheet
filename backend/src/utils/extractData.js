/**
 * Extracts data from text based on VendorMap rules.
 * @param {string} text
 * @param {Array} extractionRules
 */
export const extractData = (text, extractionRules) => {
    let results = {};
    const fullText = text || '';

    if (!Array.isArray(extractionRules)) {
        console.warn("extractData expected array, got:", typeof extractionRules);
        return results;
    }

    for (const rule of extractionRules) {
        const key = rule.targetField;
        let matchedValue = null;

        try {
            if (rule.method === 'regex' && rule.regexPattern) {
                const regex = new RegExp(rule.regexPattern, 'i');
                const match = fullText.match(regex);
                if (match) {
                    matchedValue = match[1] || match[0];
                }
            }

            else if (rule.method === 'keyword_proximity' && rule.keyword) {
                const keyword = rule.keyword;
                const lines = fullText.split('\n');

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.toLowerCase().includes(keyword.toLowerCase())) {
                        const searchLower = rule.searchDirection === 'below';

                        if (searchLower) {
                            if (i + 1 < lines.length) {
                                matchedValue = lines[i + 1].trim();
                            }
                        } else {
                            const parts = line.split(new RegExp(keyword, 'i'));
                            if (parts.length > 1) {
                                matchedValue = parts[1].trim();
                            }
                        }

                        if (matchedValue) break;
                    }
                }
            }

            if (matchedValue) {
                if (rule.removePattern) {
                    matchedValue = matchedValue.replace(new RegExp(rule.removePattern, 'g'), '');
                }

                matchedValue = matchedValue.trim();

                if (key === 'invoiceDate' || key === 'dueDate') {
                    const d = new Date(matchedValue);
                    if (!isNaN(d.getTime())) {
                        matchedValue = d.toISOString().split('T')[0];
                    }
                } else if (key === 'totalAmount') {
                    matchedValue = matchedValue.replace(/[^0-9.]/g, '');
                }

                results[key] = matchedValue;
            } else {
                results[key] = null;
            }

        } catch (err) {
            console.error(`Error extraction field ${key}:`, err);
            results[key] = null;
        }
    }

    return results;
};

export const calculateConfidence = (results, extractionRules) => {
    if (!results || !extractionRules || extractionRules.length === 0) return 0;

    let totalFields = extractionRules.length;
    let foundFields = 0;

    for (const rule of extractionRules) {
        if (results[rule.targetField]) {
            foundFields++;
        }
    }

    if (totalFields === 0) return 0;
    return Math.round((foundFields / totalFields) * 100);
};
