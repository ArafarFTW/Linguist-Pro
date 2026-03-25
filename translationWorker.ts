import { pipeline, env } from '@huggingface/transformers';

// Disable local models to force downloading from huggingface hub
env.allowLocalModels = false;

let translator: any = null;
let currentModel = '';

self.addEventListener('message', async (event) => {
    const { text, src, tgt, id } = event.data;

    // Map languages to Opus-MT codes
    const langMap: Record<string, string> = {
        'English (UK)': 'en',
        'English (US)': 'en',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Italian': 'it',
        'Dutch': 'nl',
        'Russian': 'ru',
        'Chinese (Simplified)': 'zh',
        'Japanese': 'ja',
        'Korean': 'ko',
        'Arabic': 'ar',
        'Hindi': 'hi',
        'Portuguese (Portugal)': 'pt',
        'Latin': 'la'
    };

    const srcCode = langMap[src];
    const tgtCode = langMap[tgt];

    if (!srcCode || !tgtCode) {
        self.postMessage({ status: 'error', error: 'Unsupported language pair for offline translation.', id });
        return;
    }

    // Opus-MT models are typically directional. We'll try to load the specific pair.
    // Note: Not all pairs exist. English <-> Other is most common.
    const modelName = `Xenova/opus-mt-${srcCode}-${tgtCode}`;

    try {
        if (currentModel !== modelName) {
            self.postMessage({ status: 'loading', model: modelName, id });
            translator = await pipeline('translation', modelName, {
                progress_callback: (x: any) => {
                    self.postMessage({ status: 'progress', progress: x, id });
                }
            });
            currentModel = modelName;
        }

        self.postMessage({ status: 'translating', id });
        const result = await translator(text);
        self.postMessage({ status: 'complete', result: result[0].translation_text, id });
    } catch (error: any) {
        console.error("Offline translation error:", error);
        self.postMessage({ status: 'error', error: `Offline model not available for ${src} to ${tgt}. Try English to another language.`, id });
    }
});
