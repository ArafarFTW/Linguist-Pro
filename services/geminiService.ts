
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ROLES } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Handles API errors by inspecting the error object and throwing a more user-friendly message.
 * @param error The catched error object.
 * @param context A string describing the operation that failed.
 */
function handleApiError(error: unknown, context: 'translation' | 'language detection' | 'chatbot' | 'content generation'): never {
    console.error(`Error during ${context}:`, error);

    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('api key') || message.includes('permission denied')) {
            throw new Error("API Key is invalid or missing. Please ensure it is correctly configured.");
        }
        if (message.includes('rate limit') || message.includes('resource has been exhausted')) {
            throw new Error("You've exceeded the request limit. Please wait a moment and try again.");
        }
        if (message.includes('fetch')) {
            throw new Error("A network error occurred. Please check your internet connection and try again.");
        }
        if (message.includes('candidate was blocked due to safety')) {
            throw new Error("The request was blocked due to safety settings. Please modify your input text.");
        }
    }
    
    // Generic fallback for other types of errors
    throw new Error(`The AI service failed during ${context}. Please try again later.`);
}


interface TranslationResponse {
    correctedSource: string;
    translation: string;
    phonetic: string;
}

export async function translateText(
    text: string,
    sourceLang: string,
    targetLang: string,
    role: string,
    isThinkingMode: boolean,
    isAutoCorrectEnabled: boolean = true,
    customProfession?: string
): Promise<TranslationResponse> {
    try {
        let roleDescription = '';
        let roleName = role;
        
        if (role === 'Custom Profession' && customProfession) {
            roleName = customProfession;
            roleDescription = `You are an expert in the field of ${customProfession}. Translate the text using the precise terminology, tone, and style appropriate for a professional in this field.`;
        } else {
            const roleObj = ROLES.find(r => r.name === role);
            roleDescription = roleObj ? roleObj.description : '';
        }
        
        let systemInstruction = `You are an expert linguist and ${roleName}. ${roleDescription} `;
        
        if (isAutoCorrectEnabled) {
            systemInstruction += `Your task is to first correct any grammatical, spelling, or stylistic errors in the original source text to make it sound natural and professional in its original language. Then, provide an expert-level translation of this corrected text and its corresponding phonetic pronunciation guide.
- Correct the source text's grammar, punctuation, and phrasing.
- Strictly adhere to all grammatical rules, including correct syntax, punctuation, and idiomatic expressions of the target language.`;
        } else {
            systemInstruction += `Your task is to provide an expert-level translation of the source text exactly as written, without correcting its grammar or spelling, and provide its corresponding phonetic pronunciation guide.
- Translate the text as faithfully as possible to the original input.
- Strictly adhere to all grammatical rules, including correct syntax, punctuation, and idiomatic expressions of the target language.
- The 'correctedSource' field should simply be the exact original text provided, without modifications.`;
        }

        systemInstruction += `\n- Provide a phonetic pronunciation guide for the complete translated text. Use simple, readable syllables based on the phonetics and orthography of the SOURCE language (e.g., if translating from Portuguese to English, write the English pronunciation using Portuguese phonetic approximations) to help a layperson pronounce it easily. Do NOT use strict IPA symbols.
- You MUST respond with a JSON object containing three keys: "correctedSource", "translation", and "phonetic". Do not add any other text or explanations.`;
        
        const prompt = `Translate the following text from ${sourceLang} to ${targetLang}:\n\n"${text}"`;

        const modelName = isThinkingMode ? 'gemini-3.1-pro-preview' : 'gemini-3.1-flash-lite-preview';
        
        const modelConfig: any = {
            systemInstruction: systemInstruction,
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    correctedSource: {
                        type: Type.STRING,
                        description: "The grammatically corrected and improved version of the original source text in the source language."
                    },
                    translation: {
                        type: Type.STRING,
                        description: "The translated text."
                    },
                    phonetic: {
                        type: Type.STRING,
                        description: "A phonetic pronunciation guide for the translated text, written using simple syllables based on the phonetics and orthography of the source language, making it easy for a native speaker of the source language to read aloud."
                    }
                },
                required: ["correctedSource", "translation", "phonetic"],
            }
        };

        if (isThinkingMode) {
            modelConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: modelConfig,
        });

        try {
            const jsonText = response.text.trim();
            const parsedResponse: TranslationResponse = JSON.parse(jsonText);
            return parsedResponse;
        } catch (jsonError) {
            console.error("Error parsing JSON response from Gemini API:", jsonError);
            console.error("Raw response text:", response.text);
            throw new Error("The AI returned a response in an invalid format. Please try again.");
        }

    } catch (error) {
        handleApiError(error, 'translation');
    }
}

export async function generateRepurposedContent(
    translatedText: string,
    targetLang: string,
    format: string,
    role: string,
    customProfession?: string
): Promise<string> {
    try {
        let roleDescription = '';
        let roleName = role;
        
        if (role === 'Custom Profession' && customProfession) {
            roleName = customProfession;
            roleDescription = `You are an expert in the field of ${customProfession}.`;
        } else {
            const roleObj = ROLES.find(r => r.name === role);
            roleDescription = roleObj ? roleObj.description : '';
        }

        const systemInstruction = `You are an expert linguist and ${roleName}. ${roleDescription}
Your task is to take the provided translated text and repurpose it into a ${format}.
The output MUST be written in ${targetLang}.
Ensure the tone, style, and terminology are appropriate for a ${format} in the context of your role.
Do not include any introductory or concluding remarks, just provide the final repurposed content.`;

        const prompt = `Repurpose the following text into a ${format} in ${targetLang}:\n\n"${translatedText}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            },
        });

        return response.text.trim();
    } catch (error) {
        handleApiError(error, 'content generation');
    }
}


export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: mimeType,
                    }
                },
                "Transcribe the audio accurately. Respond ONLY with the transcription."
            ]
        });
        return response.text.trim();
    } catch (error) {
        handleApiError(error, 'audio transcription' as any);
    }
}

export async function detectLanguage(
    text: string,
    possibleLanguages: string[]
): Promise<string> {
    try {
        const systemInstruction = `Your task is to identify the language of the given text. The language must be one of the following: [${possibleLanguages.join(', ')}]. Respond ONLY with the name of the language from the list. If you cannot determine the language or it's not in the list, respond with "Unknown".`;
        
        const prompt = `Identify the language of this text:\n\n"${text}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0, // Deterministic for classification
            }
        });

        const detectedLang = response.text.trim();
        if (possibleLanguages.includes(detectedLang)) {
            return detectedLang;
        } else {
            console.warn(`Detected language "${detectedLang}" not in the possible languages list.`);
            throw new Error("Language could not be reliably detected from the provided list.");
        }

    } catch (error) {
        handleApiError(error, 'language detection');
    }
}


interface ChatbotResponse {
    text: string;
    sources: { uri: string; title: string }[];
}

export async function getChatbotResponse(prompt: string, useMaps: boolean = false): Promise<ChatbotResponse> {
    try {
        const systemInstruction = `You are an official translator, having all languages of the world as your field, but having as an initial basis always the translation from Portuguese of Portugal to English of England, always using a professional language linked to tourism in general and golf in particular. You can also answer questions and provide information related to these fields.`;
        
        const model = useMaps ? "gemini-2.5-flash" : "gemini-3.1-pro-preview";
        const tools = useMaps ? [{ googleMaps: {} }] : [{ googleSearch: {} }];
        
        const config: any = {
            systemInstruction: systemInstruction,
            tools: tools,
        };

        if (!useMaps) {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
        }
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: config,
        });

        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        const sources: { uri: string; title: string }[] = [];
        if (groundingChunks) {
            for (const chunk of groundingChunks) {
                if (chunk.web && chunk.web.uri && chunk.web.title) {
                    sources.push({
                        uri: chunk.web.uri,
                        title: chunk.web.title,
                    });
                } else if (chunk.maps && chunk.maps.uri && chunk.maps.title) {
                    sources.push({
                        uri: chunk.maps.uri,
                        title: chunk.maps.title,
                    });
                }
            }
        }
        
        return { text, sources };

    } catch (error) {
        handleApiError(error, 'chatbot' as any);
    }
}
