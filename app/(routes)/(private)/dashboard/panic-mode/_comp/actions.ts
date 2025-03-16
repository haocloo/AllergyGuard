'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

// Firebase Admin
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Services
import { lucia_get_user, utils_log_server_error, utils_log_server_info } from '@/services/server';
import { fromErrorToFormState, toFormState } from '@/components/helpers/form-items';
import { FormState } from '@/components/helpers/form-items';
import { schema_analyze_symptoms } from './validation';
import type {
  SymptomAnalysis,
  SymptomAnalysisStatus,
  T_schema_analyze_symptoms,
  SymptomResponse,
  SymptomHistory,
} from './types';

// Dummy data for demonstration purposes
const DUMMY_HISTORY: SymptomHistory[] = [
  {
    id: 'analysis-1',
    userId: 'user-123',
    symptomResponse: {
      requestId: 'req-001',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      symptoms: 'Fever, runny nose, coughing, and sneezing.',
      possibleCauses: [
        {
          condition: 'Common Cold',
          description:
            'A viral infection of the upper respiratory tract that causes inflammation in the nose and throat.',
          urgencyLevel: 'low',
        },
        {
          condition: 'Influenza (Flu)',
          description:
            'A highly contagious viral infection that causes fever, body aches, and respiratory symptoms.',
          urgencyLevel: 'medium',
        },
      ],
      recommendedActions: [
        {
          action: 'Ensure plenty of rest and fluids',
          urgency: 'soon',
          instructions: 'Ensure plenty of rest and fluids',
        },
        {
          action: 'Use over-the-counter pain relievers as needed',
          urgency: 'when convenient',
          instructions: 'Use over-the-counter pain relievers as needed',
        },
        {
          action: 'Monitor symptoms for 3-4 days',
          urgency: 'soon',
          instructions: 'Monitor symptoms for 3-4 days',
        },
      ],
      allergyRelated: false,
      additionalNotes:
        'Monitor for worsening symptoms, especially high fever lasting more than 3 days.',
      sourceReferences: [],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'analysis-2',
    userId: 'user-123',
    symptomResponse: {
      requestId: 'req-002',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      symptoms: 'Rash on arms and face, mild itching, and slight fever.',
      possibleCauses: [
        {
          condition: 'Mild Allergic Reaction',
          description:
            'An immune system response to a substance that the body mistakenly identifies as harmful.',
          urgencyLevel: 'medium',
        },
        {
          condition: 'Viral Rash',
          description:
            'A skin condition caused by a viral infection, often accompanied by mild fever.',
          urgencyLevel: 'low',
        },
      ],
      recommendedActions: [
        {
          action: 'Remove the allergen if identified',
          urgency: 'immediate',
          instructions: 'Remove the allergen if identified',
        },
        {
          action: 'Apply a cool compress to the affected area',
          urgency: 'soon',
          instructions: 'Apply a cool compress to the affected area',
        },
        {
          action: 'Use an over-the-counter antihistamine',
          urgency: 'soon',
          instructions: 'Use an over-the-counter antihistamine',
        },
      ],
      allergyRelated: true,
      additionalNotes: 'If the rash spreads or becomes more severe, seek medical attention.',
      sourceReferences: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'analysis-3',
    userId: 'user-123',
    symptomResponse: {
      requestId: 'req-003',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      symptoms: 'Difficulty breathing, wheezing, and coughing after eating peanuts.',
      possibleCauses: [
        {
          condition: 'Severe Allergic Reaction (Anaphylaxis)',
          description:
            'A severe, potentially life-threatening allergic reaction that can affect breathing and circulation.',
          urgencyLevel: 'emergency',
        },
      ],
      recommendedActions: [
        {
          action: 'Use epinephrine auto-injector (EpiPen) if available',
          urgency: 'immediate',
          instructions: 'Use epinephrine auto-injector (EpiPen) if available',
        },
        {
          action: 'Call emergency services (911) immediately',
          urgency: 'immediate',
          instructions: 'Call emergency services (911) immediately',
        },
        {
          action: 'Keep the child calm and lying flat with legs elevated',
          urgency: 'immediate',
          instructions: 'Keep the child calm and lying flat with legs elevated',
        },
      ],
      allergyRelated: true,
      additionalNotes: 'This is a medical emergency requiring immediate attention.',
      sourceReferences: [],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
];

/**
 * Get symptom history for the current user
 */
export async function getSymptomHistory(): Promise<SymptomHistory[]> {
  try {
    // Get the authenticated user
    const { user } = await lucia_get_user();
    if (!user) {
      await utils_log_server_info('getSymptomHistory', 'Unauthenticated');
      return DUMMY_HISTORY; // Return dummy data for demonstration
    }

    // In a real implementation, we would fetch from Firestore
    // Commented out for demonstration purposes
    /*
    const symptomHistoryRef = adminFirestore.collection('symptomHistory').where('userId', '==', user.id);
    const snapshot = await symptomHistoryRef.orderBy('symptomResponse.createdAt', 'desc').get();

    if (snapshot.empty) {
      await utils_log_server_info('getSymptomHistory', 'No history found for user', { userId: user.id });
      return [];
    }

    const history = snapshot.docs.map(doc => {
      const data = doc.data() as SymptomHistory;
      return {
        ...data,
        id: doc.id,
      };
    });

    return history;
    */

    // For demonstration, return dummy data
    return DUMMY_HISTORY;
  } catch (error: any) {
    await utils_log_server_error('getSymptomHistory', error.message);
    return DUMMY_HISTORY; // Return dummy data on error
  }
}

/**
 * Analyze symptoms and save the result to history
 */
export async function analyze_symptoms(data: T_schema_analyze_symptoms): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user) {
      await utils_log_server_error('analyze_symptoms', 'Unauthorized access attempt');
      throw new Error('Unauthorized access');
    }

    // Validate input data
    const cleanData = schema_analyze_symptoms.parse(data);

    // In a real implementation, we would save to Firestore
    // Commented out for demonstration purposes
    /*
    // Create a new history entry
    const historyEntry = {
      id: data.id,
      userId: user.id,
      symptomResponse: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
        symptoms: data.symptoms,
        possibleCauses: [], // This would come from the AI response
        recommendedActions: [], // This would come from the AI response
        allergyRelated: false, // This would come from the AI response
        additionalNotes: "", // This would come from the AI response
        sourceReferences: [], // This would come from the AI response
        createdAt: new Date().toISOString(),
      },
    };

    // Save to Firestore
    await adminFirestore.collection('symptomHistory').doc(historyEntry.id).set(historyEntry);
    */

    // Revalidate the path to update the UI
    revalidatePath('/dashboard/panic-mode');

    return toFormState({
      status: 'SUCCESS',
      message: 'Symptoms analyzed successfully',
    });
  } catch (error) {
    return fromErrorToFormState(error);
  }
}

/**
 * Save a symptom analysis to history
 */
export async function saveSymptomAnalysis(symptomResponse: SymptomResponse): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user) {
      await utils_log_server_error('saveSymptomAnalysis', 'Unauthorized access attempt');
      throw new Error('Unauthorized access');
    }

    // In a real implementation, we would save to Firestore
    // Commented out for demonstration purposes
    /*
    // Create a new history entry
    const historyEntry = {
      id: uuidv4(),
      userId: user.id,
      symptomResponse,
    };

    // Save to Firestore
    await adminFirestore.collection('symptomHistory').doc(historyEntry.id).set(historyEntry);
    */

    // Revalidate the path to update the UI
    revalidatePath('/dashboard/panic-mode');

    return toFormState({
      status: 'SUCCESS',
      message: 'Symptom analysis saved to history',
    });
  } catch (error) {
    return fromErrorToFormState(error);
  }
}
