import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

function render_page(pageData) {
    let render_options = {
        normalizeWhitespace: true,
        disableCombineTextItems: false
    }

    return pageData.getTextContent(render_options)
        .then(function (textContent) {
            let lastY, text = '';

            const items = textContent.items.sort((a, b) => {
                const yDiff = b.transform[5] - a.transform[5];

                if (Math.abs(yDiff) < 5) {
                    return a.transform[4] - b.transform[4];
                }

                return yDiff;
            });

            let sortedText = '';
            let lastItem = null;

            for (let item of items) {
                if (lastItem && (lastItem.transform[5] - item.transform[5]) > 10) {
                    sortedText += '\n';
                } else if (lastItem && (item.transform[4] - (lastItem.transform[4] + lastItem.width)) > 10) {
                    sortedText += ' ';
                }

                sortedText += item.str;
                lastItem = item;
            }

            if (!sortedText && items.length > 0) {
                return items.map(item => item.str).join(' ');
            }

            return sortedText;
        });
}

export const readPdfBuffer = async (buffer) => {
    try {
        if (typeof pdf !== 'function') {
            throw new Error('PDF parser not initialized correctly');
        }

        let options = {
            pagerender: render_page
        }

        let data = await pdf(buffer, options);
        let text = data.text;

        if (!text) {
            return '';
        }

        return text;
    } catch (e) {
        console.error("PDF Parse Error:", e);
        throw e;
    }
}
