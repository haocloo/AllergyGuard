import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get the base64 image from the request
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Remove the data URL prefix if it exists
    const base64Image = image.startsWith('data:') ? image.split(',')[1] : image;

    // Get the Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // Create prompt for ingredient extraction and allergen detection
    const prompt = `
      Please analyze this food package image and extract the following information:
      
      1. All ingredients listed on the package
      2. Identify any common allergens present in the ingredients
      
      Return the information as a JSON with the following structure:
      {
        "ingredients": [
          {
            "name": "ingredient name",
            "containsAllergens": ["allergen1", "allergen2"]
          }
        ],
        "allergensFound": ["allergen1", "allergen2"],
        "language": "detected language of the ingredient list"
      }
      
      Common allergens to look for include: peanuts, tree nuts, milk, eggs, fish, shellfish, wheat, soy, sesame.
      
      If no allergens are found, return an empty array for containsAllergens and allergensFound.
      If you can't read the ingredients clearly, respond with your best guess but indicate uncertainty.
    `;

    // Create the parts for the model
    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ];

    // Generate content from the model
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
    });

    const response = result.response;
    const textResponse = response.text();

    // Extract the JSON response from the text
    let jsonResponse;
    try {
      // Check if the response is already in JSON format
      jsonResponse = JSON.parse(textResponse);
    } catch (e) {
      // If not, try to extract JSON from the text
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from Gemini API');
      }
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error in scan-ingredients API:', error);
    return NextResponse.json(
      { error: 'An error occurred while scanning ingredients' },
      { status: 500 }
    );
  }
}
