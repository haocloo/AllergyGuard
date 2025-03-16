'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Import validation schemas
import { classroomSchema, childSchema, allergySchema, emailSchema } from './validation';
import { Classroom, Child, Allergy, SymptomResponse } from './types';

// Import dummy data for testing - in production this would be replaced with Firestore access
import { classrooms, children, medical_data } from '@/services/dummy-data';

// Helper to get current user (this would normally be implemented in the app)
// In production: const { user } = await lucia_get_user();
const getCurrentUser = () => {
  return {
    id: process.env.NEXT_PUBLIC_user_id || 'b806239e-8a3a-4712-9862-1ccd9b821981',
    name: 'Test User',
    email: 'user@example.com',
    role: 'admin',
  };
};

// #####################################################
//               CLASSROOM MANAGEMENT
// #####################################################

export async function get_classrooms() {
  try {
    // In production, this would fetch from Firestore
    // const classroomsRef = collection(db, 'classrooms');
    // const q = query(classroomsRef, where('createdBy', '==', getCurrentUser().id));
    // const querySnapshot = await getDocs(q);
    // const classroomsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Return dummy data for testing
    return classrooms;
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    throw new Error('Failed to fetch classrooms');
  }
}

export async function create_classroom(formData: FormData) {
  try {
    // Parse and validate form data
    const rawFormData = {
      name: formData.get('name') as string,
      accessCode: formData.get('accessCode') as string,
    };

    const result = classroomSchema.safeParse(rawFormData);

    if (!result.success) {
      return {
        status: 'ERROR',
        message: 'Invalid form data',
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const { name, accessCode } = result.data;
    const currentUser = getCurrentUser();

    // Create new classroom object
    const newClassroom: Classroom = {
      id: uuidv4(),
      name,
      accessCode,
      children: [],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    // In production, this would save to Firestore
    // await addDoc(collection(db, 'classrooms'), newClassroom);

    // For testing, we would add to the array (but this is just for simulation)
    // classrooms.push(newClassroom);

    revalidatePath('/dashboard/profile-management');

    return {
      status: 'SUCCESS',
      message: 'Classroom created successfully',
      data: newClassroom,
    };
  } catch (error) {
    console.error('Error creating classroom:', error);
    return {
      status: 'ERROR',
      message: 'Failed to create classroom',
    };
  }
}

export async function update_classroom(formData: FormData) {
  try {
    // Parse and validate form data
    const classroomId = formData.get('id') as string;

    if (!classroomId) {
      return {
        status: 'ERROR',
        message: 'Classroom ID is required',
      };
    }

    const rawFormData = {
      name: formData.get('name') as string,
      accessCode: formData.get('accessCode') as string,
    };

    const result = classroomSchema.safeParse(rawFormData);

    if (!result.success) {
      return {
        status: 'ERROR',
        message: 'Invalid form data',
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const { name, accessCode } = result.data;

    // In production, this would update the document in Firestore
    // const classroomRef = doc(db, 'classrooms', classroomId);
    // await updateDoc(classroomRef, { name, accessCode });

    // For testing, we would update the array (but this is just for simulation)
    // const index = classrooms.findIndex(c => c.id === classroomId);
    // if (index !== -1) {
    //   classrooms[index] = { ...classrooms[index], name, accessCode };
    // }

    revalidatePath('/dashboard/profile-management');

    return {
      status: 'SUCCESS',
      message: 'Classroom updated successfully',
    };
  } catch (error) {
    console.error('Error updating classroom:', error);
    return {
      status: 'ERROR',
      message: 'Failed to update classroom',
    };
  }
}

export async function delete_classroom(formData: FormData) {
  try {
    const classroomId = formData.get('id') as string;

    if (!classroomId) {
      return {
        status: 'ERROR',
        message: 'Classroom ID is required',
      };
    }

    // In production, this would delete from Firestore
    // await deleteDoc(doc(db, 'classrooms', classroomId));

    // For testing, we would remove from the array (but this is just for simulation)
    // const index = classrooms.findIndex(c => c.id === classroomId);
    // if (index !== -1) {
    //   classrooms.splice(index, 1);
    // }

    revalidatePath('/dashboard/profile-management');

    return {
      status: 'SUCCESS',
      message: 'Classroom deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting classroom:', error);
    return {
      status: 'ERROR',
      message: 'Failed to delete classroom',
    };
  }
}

// #####################################################
//               CHILD PROFILE MANAGEMENT
// #####################################################

export async function get_children() {
  try {
    // In production, this would fetch from Firestore
    // const childrenRef = collection(db, 'children');
    // const q = query(childrenRef, where('createdBy', '==', getCurrentUser().id));
    // const querySnapshot = await getDocs(q);
    // const childrenData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Return dummy data for testing
    return children;
  } catch (error) {
    console.error('Error fetching children:', error);
    throw new Error('Failed to fetch children');
  }
}

export async function create_child(formData: FormData) {
  try {
    // Parse and validate form data
    const rawFormData = {
      name: formData.get('name') as string,
      dob: formData.get('dob') as string,
      parentId: (formData.get('parentId') as string) || getCurrentUser().id,
      classroomId: (formData.get('classroomId') as string) || undefined,
    };

    const result = childSchema.safeParse(rawFormData);

    if (!result.success) {
      return {
        status: 'ERROR',
        message: 'Invalid form data',
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    // Parse allergies from form data
    const allergiesJson = formData.get('allergies') as string;
    let allergies: Allergy[] = [];

    if (allergiesJson) {
      try {
        const parsedAllergies = JSON.parse(allergiesJson);
        allergies = parsedAllergies;
      } catch (error) {
        return {
          status: 'ERROR',
          message: 'Invalid allergies data',
        };
      }
    }

    const { name, dob, parentId, classroomId } = result.data;
    const currentUser = getCurrentUser();

    // Create new child object
    const newChild: Child = {
      id: uuidv4(),
      name,
      dob,
      allergies,
      parentId: parentId || currentUser.id,
      classroomId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    // In production, this would save to Firestore
    // await addDoc(collection(db, 'children'), newChild);

    // If child is added to a classroom, update the classroom's children array
    if (classroomId) {
      // const classroomRef = doc(db, 'classrooms', classroomId);
      // const classroomDoc = await getDoc(classroomRef);
      // if (classroomDoc.exists()) {
      //   const classroomData = classroomDoc.data();
      //   await updateDoc(classroomRef, {
      //     children: [...(classroomData.children || []), newChild.id]
      //   });
      // }
    }

    revalidatePath('/dashboard/profile-management');

    return {
      status: 'SUCCESS',
      message: 'Child profile created successfully',
      data: newChild,
    };
  } catch (error) {
    console.error('Error creating child profile:', error);
    return {
      status: 'ERROR',
      message: 'Failed to create child profile',
    };
  }
}

export async function update_child(formData: FormData) {
  try {
    // Parse and validate form data
    const childId = formData.get('id') as string;

    if (!childId) {
      return {
        status: 'ERROR',
        message: 'Child ID is required',
      };
    }

    const rawFormData = {
      name: formData.get('name') as string,
      dob: formData.get('dob') as string,
      parentId: formData.get('parentId') as string,
      classroomId: (formData.get('classroomId') as string) || undefined,
    };

    const result = childSchema.safeParse(rawFormData);

    if (!result.success) {
      return {
        status: 'ERROR',
        message: 'Invalid form data',
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    // Parse allergies from form data
    const allergiesJson = formData.get('allergies') as string;
    let allergies: Allergy[] = [];

    if (allergiesJson) {
      try {
        const parsedAllergies = JSON.parse(allergiesJson);
        allergies = parsedAllergies;
      } catch (error) {
        return {
          status: 'ERROR',
          message: 'Invalid allergies data',
        };
      }
    }

    const { name, dob, parentId, classroomId } = result.data;

    // In production, this would update the document in Firestore
    // const childRef = doc(db, 'children', childId);
    // const childDoc = await getDoc(childRef);

    // if (!childDoc.exists()) {
    //   return {
    //     status: 'ERROR',
    //     message: 'Child profile not found',
    //   };
    // }

    // const childData = childDoc.data();
    // const oldClassroomId = childData.classroomId;

    // // Update the child document
    // await updateDoc(childRef, {
    //   name,
    //   dob,
    //   allergies,
    //   parentId,
    //   classroomId,
    // });

    // // Handle classroom changes if needed
    // if (oldClassroomId !== classroomId) {
    //   // Remove from old classroom if it exists
    //   if (oldClassroomId) {
    //     const oldClassroomRef = doc(db, 'classrooms', oldClassroomId);
    //     const oldClassroomDoc = await getDoc(oldClassroomRef);
    //     if (oldClassroomDoc.exists()) {
    //       const oldClassroomData = oldClassroomDoc.data();
    //       await updateDoc(oldClassroomRef, {
    //         children: oldClassroomData.children.filter(id => id !== childId)
    //       });
    //     }
    //   }

    //   // Add to new classroom if it exists
    //   if (classroomId) {
    //     const newClassroomRef = doc(db, 'classrooms', classroomId);
    //     const newClassroomDoc = await getDoc(newClassroomRef);
    //     if (newClassroomDoc.exists()) {
    //       const newClassroomData = newClassroomDoc.data();
    //       await updateDoc(newClassroomRef, {
    //         children: [...(newClassroomData.children || []), childId]
    //       });
    //     }
    //   }
    // }

    revalidatePath('/dashboard/profile-management');

    return {
      status: 'SUCCESS',
      message: 'Child profile updated successfully',
    };
  } catch (error) {
    console.error('Error updating child profile:', error);
    return {
      status: 'ERROR',
      message: 'Failed to update child profile',
    };
  }
}

export async function delete_child(formData: FormData) {
  try {
    const childId = formData.get('id') as string;

    if (!childId) {
      return {
        status: 'ERROR',
        message: 'Child ID is required',
      };
    }

    // In production, this would delete from Firestore and update classrooms
    // const childRef = doc(db, 'children', childId);
    // const childDoc = await getDoc(childRef);

    // if (!childDoc.exists()) {
    //   return {
    //     status: 'ERROR',
    //     message: 'Child profile not found',
    //   };
    // }

    // const childData = childDoc.data();
    // const classroomId = childData.classroomId;

    // // If child is in a classroom, remove from classroom's children array
    // if (classroomId) {
    //   const classroomRef = doc(db, 'classrooms', classroomId);
    //   const classroomDoc = await getDoc(classroomRef);
    //   if (classroomDoc.exists()) {
    //     const classroomData = classroomDoc.data();
    //     await updateDoc(classroomRef, {
    //       children: classroomData.children.filter(id => id !== childId)
    //     });
    //   }
    // }

    // // Delete child document
    // await deleteDoc(childRef);

    revalidatePath('/dashboard/profile-management');

    return {
      status: 'SUCCESS',
      message: 'Child profile deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting child profile:', error);
    return {
      status: 'ERROR',
      message: 'Failed to delete child profile',
    };
  }
}

// #####################################################
//               LINK CHILD TO PARENT
// #####################################################

export async function link_child_to_parent(formData: FormData) {
  try {
    const childId = formData.get('childId') as string;
    const email = formData.get('email') as string;

    if (!childId) {
      return {
        status: 'ERROR',
        message: 'Child ID is required',
      };
    }

    // Validate email
    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      return {
        status: 'ERROR',
        message: 'Invalid email address',
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    // In production, this would handle the parent linking in Firestore
    // 1. Find user by email
    // const usersRef = collection(db, 'users');
    // const q = query(usersRef, where('email', '==', email));
    // const querySnapshot = await getDocs(q);

    // if (querySnapshot.empty) {
    //   return {
    //     status: 'ERROR',
    //     message: 'No user found with that email address',
    //   };
    // }

    // const parentDoc = querySnapshot.docs[0];
    // const parentId = parentDoc.id;

    // 2. Update child document with parent ID
    // const childRef = doc(db, 'children', childId);
    // await updateDoc(childRef, { parentId });

    revalidatePath('/dashboard/profile-management');

    return {
      status: 'SUCCESS',
      message: 'Child successfully linked to parent',
    };
  } catch (error) {
    console.error('Error linking child to parent:', error);
    return {
      status: 'ERROR',
      message: 'Failed to link child to parent',
    };
  }
}

// #####################################################
//               SYMPTOM RESPONSE GUIDE
// #####################################################

export async function get_allergy_response(formData: FormData) {
  try {
    const allergen = formData.get('allergen') as string;
    const symptom = formData.get('symptom') as string;

    if (!allergen || !symptom) {
      return {
        status: 'ERROR',
        message: 'Allergen and symptom are required',
      };
    }

    // In production, this would query the RAG model through Supabase
    // For testing, we'll use the dummy data

    const matchingDisease = medical_data.find(
      (data) =>
        data.disease_name.toLowerCase().includes(allergen.toLowerCase()) &&
        data.symptoms.some((s) => s.toLowerCase().includes(symptom.toLowerCase()))
    );

    if (!matchingDisease) {
      return {
        status: 'SUCCESS',
        message: 'No specific guidance found for these symptoms',
        data: {
          actions: [
            'Monitor the child closely',
            'Call the parent or guardian',
            'If symptoms worsen, seek medical attention immediately',
          ],
        },
      };
    }

    return {
      status: 'SUCCESS',
      data: {
        symptom,
        allergen,
        actions: matchingDisease.actions,
      },
    };
  } catch (error) {
    console.error('Error getting allergy response:', error);
    return {
      status: 'ERROR',
      message: 'Failed to get allergy response',
    };
  }
}
