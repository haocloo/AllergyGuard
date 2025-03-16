import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get ingredients and allergies from the request
    const { ingredients = [], allergies = [] } = body;

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: 'Ingredients are required' }, { status: 400 });
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create prompt for recipe generation
    const prompt = `
      Generate 3 nutritionally balanced, appealing recipes using some or all of these ingredients: ${ingredients.join(
        ', '
      )}.
      
      The recipes should be safe for people with the following allergies: ${
        allergies.join(', ') || 'None specified'
      }.
      
      For each recipe, provide:
      1. Recipe name
      2. Brief description
      3. Complete list of ingredients (including quantities)
      4. Step-by-step cooking instructions
      5. Any allergens that might be present
      6. Suggestions for alternative ingredients to make the recipe safer for people with allergies
      
      Return the information as a JSON with the following structure:
      {
        "recipes": [
          {
            "id": "unique_string",
            "name": "Recipe Name",
            "description": "Brief description",
            "ingredients": [
              {
                "name": "Ingredient with quantity",
                "containsAllergens": ["allergen1", "allergen2"] 
              }
            ],
            "instructions": ["Step 1", "Step 2", "Step 3"],
            "allergensFound": ["allergen1", "allergen2"],
            "suggestions": ["Suggestion 1", "Suggestion 2"]
          }
        ]
      }
      
      Make sure each recipe is nutritionally balanced with proteins, carbohydrates, and vegetables where possible.
      The recipes should be suitable for Malaysian/Southeast Asian taste preferences.
    `;

    // Generate content from the model
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    // Ensure each recipe has a unique ID
    if (jsonResponse.recipes) {
      jsonResponse.recipes = jsonResponse.recipes.map((recipe: any) => ({
        ...recipe,
        id: recipe.id || crypto.randomUUID(),
      }));
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error in generate-recipes API:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating recipes' },
      { status: 500 }
    );
  }
}
