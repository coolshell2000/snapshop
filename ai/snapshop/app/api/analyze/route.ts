import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export async function POST(req: Request) {
    try {
        const { image, apiKey } = await req.json();

        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key is required" },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Analyze this image and identify the main product. 
        Focus on:
        1. Brand name (look for logos or text).
        2. Specific model or product name.
        3. Key distinguishing features (color, material, type).
        
        Return ONLY a JSON object with: 
        - 'productName' (Detailed Brand + Model + Product Type)
        - 'searchQuery' (Optimized Amazon search string, e.g. "Nike Air Max 90 white men") 
        - 'category' (Broad category, e.g. "Electronics")
        - 'priceEstimate' (e.g. "$100 - $150")
        - 'confidence' (0.0-1.0)
        
        If the image is blurry or unclear, make your best guess but lower the confidence score. Do not use markdown code blocks.`;

        // Remove data:image/jpeg;base64, prefix if present
        // Handle both jpeg and png or other formats
        const match = image.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        const mimeType = match ? match[1] : "image/jpeg";
        const base64Data = match ? match[2] : image;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = await result.response;
        let text = response.text();
        console.log("Gemini raw response:", text); // Debug log

        if (!text) {
            throw new Error("Received empty response from Gemini");
        }

        // Clean up markdown code blocks if present (just in case)
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            return NextResponse.json(JSON.parse(text));
        } catch (e) {
            console.error("JSON parse error:", e);
            console.error("Failed text:", text);
            throw new Error("Invalid JSON response from model");
        }
    } catch (error) {
        console.error("Analysis error details:", error);
        return NextResponse.json(
            { error: "Failed to analyze image. Check server logs." },
            { status: 500 }
        );
    }
}
