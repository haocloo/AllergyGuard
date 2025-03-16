import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for RAG
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Type for the response
interface SymptomAnalysisResult {
  potentialCauses: Array<{
    name: string;
    description: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    recommendedActions: string[];
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, childAge, childAllergies = [], language = 'en' } = body;

    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms text is required' }, { status: 400 });
    }

    // Get relevant medical information from Supabase for RAG
    const { data: medicalData, error: medicalError } = await supabase
      .from('medical_knowledge')
      .select('condition, symptoms, treatment, urgency_level')
      .limit(20);

    if (medicalError) {
      console.error('Error fetching medical data from Supabase:', medicalError);
      // Continue with analysis but without RAG context
    }

    // Format the RAG context
    const ragContext = medicalData
      ? medicalData
          .map(
            (item) =>
              `Condition: ${item.condition}\nSymptoms: ${item.symptoms}\nTreatment: ${item.treatment}\nUrgency: ${item.urgency_level}`
          )
          .join('\n\n')
      : '';

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create prompt for symptom analysis
    const prompt = `
      You are a medical analysis assistant specializing in pediatric care. A caregiver has described the following symptoms for a child:
      
      "${symptoms}"
      
      Additional information:
      - Child's age: ${childAge || 'Not provided'}
      - Known allergies: ${childAllergies.join(', ') || 'None specified'}
      - Language of description: ${language}
      
      ${ragContext ? 'Here is relevant medical knowledge to consider:\n\n' + ragContext : ''}
      
      Based on this information, please analyze the symptoms and provide:
      1. Possible causes with appropriate descriptions and urgency levels
      2. Specific recommended actions for each cause
      
      IMPORTANT GUIDELINES:
      - Do NOT provide a definitive diagnosis
      - Clearly indicate when urgent medical attention is needed
      - For severe symptoms (difficulty breathing, severe bleeding, unconsciousness, etc.), always recommend immediate emergency care
      - If symptoms are allergy-related, prioritize this information
      - Use simple, clear language that a layperson can understand
      
      Format your response as a JSON object with the following structure:
      {
        "potentialCauses": [
          {
            "name": "Condition Name",
            "description": "Brief description of the condition",
            "urgencyLevel": "low|medium|high|emergency",
            "recommendedActions": ["Action 1", "Action 2", "Action 3"]
          }
        ]
      }
    `;

    // Generate content from the model
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = result.response;
    const textResponse = response.text();

    // Extract the JSON response from the text
    let jsonResponse: SymptomAnalysisResult;
    try {
      // Try to parse the response as JSON
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
    console.error('Error in analyze-symptoms API:', error);
    return NextResponse.json(
      { error: 'An error occurred while analyzing symptoms' },
      { status: 500 }
    );
  }
}
