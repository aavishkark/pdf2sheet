import pdf from 'pdf-parse';

export const extractTextFromPdf = async (buffer) => {
    try {
        const data = await pdf(buffer);
        return {
            text: data.text,
            pageCount: data.numpages,
            metadata: data.info
        };
    } catch (err) {
        console.error('PDF Text Extraction Error:', err);
        throw new Error('Failed to parse PDF text');
    }
};

export const extractByKeyword = (fullText, keyword) => {
    const lines = fullText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(keyword)) {
            const sameLineValue = line.split(keyword)[1]?.trim();
            if (sameLineValue && sameLineValue.length > 0) {
                return sameLineValue;
            }

            if (i + 1 < lines.length) {
                return lines[i + 1].trim();
            }
        }
    }
    return null;
};
