export const extractData = (text, mappings) => {
    let results = {};
    let fullText = text;

    let keys = Object.keys(mappings);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let mapping = mappings[keys[i]];

        if (!mapping || Array.isArray(mapping) || (!mapping.extractionRule && (!mapping.keywords || mapping.keywords.length === 0))) {
            continue;
        }

        let rule = mapping.extractionRule;

        try {
            let matchedValue = null;

            if (rule) {
                let regex = new RegExp(rule, 'i');
                let match = fullText.match(regex);
                if (match) {
                    matchedValue = match[1] || match[0];
                }
            }

            if (!matchedValue && mapping.keywords && mapping.keywords.length > 0) {
                let lines = fullText.split('\n');

                for (let keyword of mapping.keywords) {
                    let line = lines.find(l => l.toLowerCase().includes(keyword.toLowerCase()));

                    if (line) {
                        let parts = line.split(new RegExp(keyword, 'i'));
                        if (parts.length > 1) {
                            let potentialValue = parts[1].trim();
                            potentialValue = potentialValue.replace(/^[:\-\s]+/, '').trim();

                            if (potentialValue) {
                                matchedValue = potentialValue;
                                break;
                            }
                        }
                    }
                }
            }

            if (matchedValue) {
                matchedValue = matchedValue.trim();

                if (key.toLowerCase().includes('date')) {
                    let d = new Date(matchedValue);
                    if (!isNaN(d.getTime())) {
                        matchedValue = d.toISOString().split('T')[0];
                    }
                } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
                    matchedValue = matchedValue.replace(/[$,]/g, '');
                }

                results[key] = matchedValue;
            } else {
                results[key] = null;
            }

        } catch (err) {
            results[key] = null;
        }
    }

    return results;
}

export const calculateConfidence = (results, mappings) => {
    let totalFields = 0;
    let foundFields = 0;

    let keys = Object.keys(mappings);

    for (let i = 0; i < keys.length; i++) {
        let mapping = mappings[keys[i]];
        if (!mapping || Array.isArray(mapping) || (!mapping.extractionRule && (!mapping.keywords || mapping.keywords.length === 0))) {
            continue;
        }

        if (mapping.required) {
            totalFields = totalFields + 1;
            if (results[keys[i]]) {
                foundFields = foundFields + 1;
            }
        }
    }

    if (totalFields === 0) {
        return 100;
    }

    let score = (foundFields / totalFields) * 100;
    return Math.round(score);
}
