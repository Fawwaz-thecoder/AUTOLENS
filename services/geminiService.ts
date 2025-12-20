
import { GoogleGenAI, Type } from "@google/genai";
import { CarInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCarInfo = async (query: string): Promise<CarInfo> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Retrieve up-to-the-minute information about the car: ${query}. Use the Google Search tool as your primary source of truth for pricing, performance figures, and availability.`,
    config: {
      systemInstruction: "You are an automotive data retrieval tool. Your primary task is to use Google Search to find current, real-world data about vehicles. Do not rely on internal memory if a search can provide more accurate, live results. Ensure specifications reflect 2024 or 2025 model years where applicable. Provide balanced benefits and drawbacks based on professional automotive journalism found via search.",
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          make: { type: Type.STRING },
          model: { type: Type.STRING },
          yearRange: { type: Type.STRING },
          priceRange: { type: Type.STRING },
          description: { type: Type.STRING },
          history: { type: Type.STRING },
          specs: {
            type: Type.OBJECT,
            properties: {
              horsepower: { type: Type.NUMBER },
              torque: { type: Type.NUMBER },
              zeroToSixty: { type: Type.NUMBER },
              topSpeed: { type: Type.NUMBER },
              engineType: { type: Type.STRING },
              transmission: { type: Type.STRING },
              driveType: { type: Type.STRING },
              fuelEconomy: { type: Type.STRING },
            },
            required: ["horsepower", "torque", "zeroToSixty", "topSpeed", "engineType", "transmission", "driveType", "fuelEconomy"]
          },
          benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Real-time advantages cited in current reviews." },
          drawbacks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Current limitations or complaints found in latest reports." },
          similarCars: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["make", "model", "yearRange", "priceRange", "description", "history", "specs", "benefits", "drawbacks", "similarCars"]
      },
    },
  });

  const carData = JSON.parse(response.text.trim()) as CarInfo;
  carData.id = `${carData.make}-${carData.model}-${Date.now()}`;
  
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    carData.groundingLinks = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));
  }

  return carData;
};

export const identifyCarFromImage = async (base64Data: string, mimeType: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Use visual identification and cross-reference with your search capability to find the exact year, make, and model of the vehicle in this image. Return only the year, make, and model." }
      ]
    },
    config: {
        tools: [{ googleSearch: {} }]
    }
  });
  return response.text.trim();
};

export const generateCarImage = async (make: string, model: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A professional, ultra-realistic 2025 model year automotive press photo of a ${make} ${model}. The car is shown in a dynamic 3/4 front view on a high-end architectural background. The car MUST NOT have any license plates or number plates visible. Perfect reflections, 8k resolution, cinematic lighting, pristine showroom appearance.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Image generation failed");
};
