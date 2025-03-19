'use server';

import { revalidatePath } from 'next/cache';

// database
import { db } from '@/lib/drizzle';
import { tasks } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

// external
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// services
import { lucia_get_user, utils_log_db_error, utils_log_server_error, utils_log_server_info } from '@/services/server';
import { fromErrorToFormState } from '@/components/helpers/form-items';
import { toFormState } from '@/components/helpers/form-items';
import { FormState } from '@/components/helpers/form-items';
import { T_schema_create_task, TaskCategory } from './types';
import { schema_create_task } from './validation';
import type { Task } from './types';
import { DatabaseError } from 'pg';

// Add type for database task
type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface CreateTaskData {
  id: string;
  name: string;
  category: TaskCategory;
  primaryImage: string;
  secondaryImage: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateTaskData {
  id?: string;
  name?: string;
  category?: string;
  status?: TaskStatus;
  primaryImage?: string;
  secondaryImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function get_tasks() {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      console.log('1');
      await utils_log_server_info('get_tasks', 'Unauthenticated');
      return [];
    }

    console.log('1');
    const result = await db.query.tasks.findMany({
      where: eq(tasks.userId, user.id),
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });
    console.log(result);
    if (!result || result.length === 0) {
      await utils_log_server_info('get_tasks', 'No tasks found for user', { userId: user.id });
      return [];
    }

    return result.map((task) => ({
      id: task.id,
      name: task.name,
      category: task.category,
      status: task.status,
      primaryImage: task.primaryImage,
      secondaryImage: task.secondaryImage || '',
      createdAt: task.createdAt?.toISOString() || new Date().toISOString(),
    }));
  } catch (error: any) {
  if (error instanceof DatabaseError) {
    await utils_log_db_error('get_tasks', error);
  } else {
    await utils_log_server_error('get_tasks', error.message);
  }
    return [];
  }
}

export async function AI_create_task(task: T_schema_create_task): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      await utils_log_server_error('AI_create_task', 'Unauthorized access attempt');
      throw new Error('Unauthorized access');
    }

    const cleanTask = schema_create_task.parse(task);

    await db.insert(tasks).values({
      id: task.id,
      name: task.name,
      category: task.category,
      status: task.status,
      primaryImage: task.primaryImage.preview,
      secondaryImage: task.secondaryImage?.preview || '',
      userId: user.id,
      createdAt: task.createdAt,
      updatedAt: new Date(),
    });

    await utils_log_server_info('AI_create_task', 'Task created successfully', {
      taskId: task.id,
      userId: user.id,
    });

    revalidatePath('/dashboard/sample-tasks');
    return toFormState('SUCCESS', 'Task created successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('AI_create_task', error);
    } else {
      await utils_log_server_error('AI_create_task', error);
    }
    return fromErrorToFormState(error);
  }
}

export async function createTask(data: CreateTaskData): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      throw new Error('Unauthorized access');
    }

    const validationData = {
      ...data,
      userId: user.id,
      status: 'pending' as TaskStatus,
    };

    // This will throw if validation fails
    const validatedData = schema_create_task.parse({
      ...validationData,
      primaryImage: { preview: data.primaryImage },
      secondaryImage: { preview: data.secondaryImage },
    });

    await db.insert(tasks).values({
      ...validatedData,
      primaryImage: validatedData.primaryImage.preview,
      secondaryImage: validatedData.secondaryImage.preview,
    });

    revalidatePath('/dashboard/sample-tasks');

    return toFormState('SUCCESS', 'Task created successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('createTask', error);
    } else {
      await utils_log_server_error('createTask', error);
    }
    return fromErrorToFormState(error);
  }
}

export async function updateTask(taskId: string, data: UpdateTaskData): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      throw new Error('Unauthorized access');
    }

    // Create update data without createdAt field
    const updateData = {
      name: data.name,
      category: data.category,
      status: data.status,
      primaryImage: data.primaryImage,
      secondaryImage: data.secondaryImage,
      updatedAt: new Date(),
    };

    const result = await db.update(tasks).set(updateData).where(eq(tasks.id, taskId)).returning();

    if (!result.length) {
      throw new Error('Task not found or unauthorized');
    }

    revalidatePath('/dashboard/sample-tasks');
    return toFormState('SUCCESS', 'Task updated successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('updateTask', error);
    } else {
      await utils_log_server_error('updateTask', error);
    }
    return fromErrorToFormState(error);
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      throw new Error('Unauthorized access');
    }

    await db.update(tasks).set({ status: status }).where(eq(tasks.id, taskId));

    revalidatePath('/dashboard/sample-tasks');
    return toFormState('SUCCESS', 'Task updated successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('updateTask', error);
    } else {
      await utils_log_server_error('updateTask', error);
    }
    return fromErrorToFormState(error);
  }
}

export async function deleteTask(taskId: string): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      await utils_log_server_error('deleteTask', 'Unauthorized access attempt');
      throw new Error('Unauthorized access');
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    await utils_log_server_info('deleteTask', 'Task deleted successfully', {
      taskId,
      userId: user.id,
    });

    revalidatePath('/dashboard/sample-tasks');
    return toFormState('SUCCESS', 'Task deleted successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('deleteTask', error);
    } else {
      await utils_log_server_error('deleteTask', error);
    }
    return fromErrorToFormState(error);
  }
}

// Sample student logs generation
export async function generate_student_sample_logs(userId: string) {
  try {
    // Group all promises into arrays for parallel execution
    const roadmapLogs = Promise.all([
      utils_log_server_info('student_roadmap_progress', 'Student roadmap progress updated', {
        userId,
        roadmapType: 'backend-engineer',
        progress: 45,
        timestamp: new Date().toISOString(),
      }),
      utils_log_server_info('student_roadmap_progress', 'Student roadmap progress updated', {
        userId,
        roadmapType: 'ai-ml-engineer',
        progress: 30,
        timestamp: new Date().toISOString(),
      }),
    ]);

    const skills = ['Python', 'TensorFlow', 'Docker', 'AWS', 'Git'];
    const proficiencies = ['beginner', 'intermediate', 'advanced'];
    const skillLogs = Promise.all(
      skills.map((skill) =>
        utils_log_server_info('student_skill_acquisition', 'Student acquired new skill', {
          userId,
          skill,
          proficiency: proficiencies[Math.floor(Math.random() * proficiencies.length)],
          timestamp: new Date().toISOString(),
        })
      )
    );

    const sections = ['education', 'experience', 'skills', 'projects'];
    const resumeLogs = Promise.all(
      sections.map((section) =>
        utils_log_server_info('student_resume_update', 'Student updated resume', {
          userId,
          section,
          timestamp: new Date().toISOString(),
        })
      )
    );

    const prompts = [
      'Generate a roadmap for becoming a cloud architect',
      'Create a learning path for DevOps',
      'Suggest skills for data engineering',
    ];
    const aiRoadmapLogs = Promise.all(
      prompts.map((prompt) =>
        utils_log_server_info('student_ai_roadmap_generation', 'Student generated AI roadmap', {
          userId,
          prompt,
          model: 'gemini-pro',
          timestamp: new Date().toISOString(),
        })
      )
    );

    const careerPaths = ['Backend Engineer', 'AI Engineer', 'Cloud Architect'];
    const careerLogs = Promise.all(
      careerPaths.map((path) =>
        utils_log_server_info('student_career_selection', 'Student selected career path', {
          userId,
          careerPath: path,
          timestamp: new Date().toISOString(),
        })
      )
    );

    const errorLogs = Promise.all([
      utils_log_server_error(
        'student_roadmap_progress',
        new Error('Failed to update roadmap progress: Database timeout'),
        userId,
        'Failed to update roadmap progress: Database timeout'
      ),
      utils_log_server_error(
        'student_skill_acquisition',
        new Error('Failed to record skill: Invalid proficiency level'),
        userId,
        'Failed to record skill: Invalid proficiency level'
      ),
      utils_log_server_error(
        'student_resume_update',
        new Error('Failed to update resume: Database timeout'),
        userId,
        'Failed to update resume: Database timeout'
      ),
      utils_log_server_error(
        'student_ai_roadmap_generation',
        new Error('Failed to generate AI roadmap: Database timeout'),
        userId,
        'Failed to generate AI roadmap: Database timeout'
      ),
      utils_log_server_error(
        'student_career_selection',
        new Error('Failed to select career path: Database timeout'),
        userId,
        'Failed to select career path: Database timeout'
      ),
      utils_log_server_error(
        'student_career_selection',
        new Error('Failed to select career path: Database timeout'),
        userId,
        'Failed to select career path: Database timeout'
      ),
    ]);

    // Execute all log groups in parallel
    await Promise.all([roadmapLogs, skillLogs, resumeLogs, aiRoadmapLogs, careerLogs, errorLogs]);

    return { success: true, message: 'Generated student sample logs successfully' };
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('generate_sample_logs', error);
    } else {
      await utils_log_server_error('generate_sample_logs', error);
    }
    return { success: false, message: 'Failed to generate student sample logs' };
  }
}

// Sample educator logs generation
export async function generate_educator_sample_logs(educatorId: string) {
  try {
    const universities = ['UM', 'USM', 'UKM', 'UPM', 'UTM'];
    const onboardingLogs = Promise.all(
      universities.map((university) =>
        utils_log_server_info('educator_onboarding', 'Educator completed onboarding', {
          userId: educatorId,
          university,
          timestamp: new Date().toISOString(),
        })
      )
    );

    const courses = [
      { id: '1', title: 'Introduction to AI', level: 'beginner' },
      { id: '2', title: 'Advanced Machine Learning', level: 'advanced' },
      { id: '3', title: 'Cloud Computing Fundamentals', level: 'intermediate' },
    ];

    const courseLogs = Promise.all(
      courses.map((course) =>
        utils_log_server_info('course_creation', 'Educator created new course', {
          userId: educatorId,
          courseId: course.id,
          courseTitle: course.title,
          courseLevel: course.level,
          timestamp: new Date().toISOString(),
        })
      )
    );

    const updateTypes = ['content', 'schedule', 'materials', 'assignments'];
    const courseUpdateLogs = Promise.all(
      courses.flatMap((course) =>
        updateTypes.map((updateType) =>
          utils_log_server_info('course_update', 'Educator updated course', {
            userId: educatorId,
            courseId: course.id,
            updateType,
            timestamp: new Date().toISOString(),
          })
        )
      )
    );

    const studentIds = ['student1', 'student2', 'student3'];
    const progressLogs = Promise.all(
      studentIds.flatMap((studentId) =>
        courses.map((course) =>
          utils_log_server_info('student_progress_review', 'Educator reviewed student progress', {
            educatorId,
            studentId,
            courseId: course.id,
            timestamp: new Date().toISOString(),
          })
        )
      )
    );

    const skillGapLogs = Promise.all(
      courses.map((course) =>
        utils_log_server_info('skill_gap_analysis', 'Educator performed skill gap analysis', {
          educatorId,
          courseId: course.id,
          timestamp: new Date().toISOString(),
        })
      )
    );

    const errorLogs = Promise.all([
      utils_log_server_error(
        'course_creation',
        new Error('Failed to create course: Invalid course data'),
        educatorId,
        'Failed to create course: Invalid course data'
      ),
      utils_log_server_error(
        'student_progress_review',
        new Error('Failed to review progress: Student not found'),
        educatorId,
        'Failed to review progress: Student not found'
      ),
      utils_log_server_error(
        'educator_onboarding',
        new Error('Failed to complete onboarding: Database timeout'),
        educatorId,
        'Failed to complete onboarding: Database timeout'
      ),
      utils_log_server_error(
        'educator_onboarding',
        new Error('Failed to complete onboarding: Database timeout'),
        educatorId,
        'Failed to complete onboarding: Database timeout'
      ),
      utils_log_server_error(
        'educator_onboarding',
        new Error('Failed to complete onboarding: Database timeout'),
        educatorId,
        'Failed to complete onboarding: Database timeout'
      ),
    ]);

    // Execute all log groups in parallel
    await Promise.all([
      onboardingLogs,
      courseLogs,
      courseUpdateLogs,
      progressLogs,
      skillGapLogs,
      errorLogs,
    ]);

    return { success: true, message: 'Generated educator sample logs successfully' };
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('generate_sample_logs', error);
    } else {
      await utils_log_server_error('generate_sample_logs', error);
    }
    return { success: false, message: 'Failed to generate educator sample logs' };
  }
}

// #########################################################
//                        FIRESTORE
// #########################################################

export async function getFirestoreTasks(): Promise<Task[]> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      await utils_log_server_info(
        'getFirestoreTasks',
        'No user found, returning empty tasks array'
      );
      return [];
    }

    // Get the user's document from tasks collection
    const userTasksDoc = await adminFirestore.collection('tasks').doc(user.id).get();

    if (!userTasksDoc.exists) {
      await utils_log_server_info('getFirestoreTasks', 'No tasks found for user', {
        userId: user.id,
      });
      return [];
    }

    const userTasks = userTasksDoc.data() || {};
    const tasks: Task[] = [];

    // Convert each task map to a Task object
    for (const [taskId, taskData] of Object.entries(userTasks)) {
      const data = taskData as any;
      tasks.push({
        id: taskId,
        name: data.name || '',
        category: data.category || 'work',
        status: data.status || 'pending',
        primaryImage: data.primaryImage || '',
        secondaryImage: data.secondaryImage || '',
        createdAt: data.createdAt || new Date().toISOString(),
      });
    }

    // Sort tasks by createdAt in descending order
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    await utils_log_server_info('getFirestoreTasks', 'Successfully retrieved tasks', {
      userId: user.id,
      taskCount: tasks.length,
    });

    return tasks;
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('getFirestoreTasks', error);
    } else {
      await utils_log_server_error('getFirestoreTasks', error);
    }
    return [];
  }
}

export async function updateFirestoreTask(
  taskId: string,
  data: UpdateTaskData
): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      throw new Error('Unauthorized access');
    }

    // Get the user's document to verify task ownership
    const userTasksDoc = await adminFirestore.collection('tasks').doc(user.id).get();
    if (!userTasksDoc.exists || !userTasksDoc.data()?.[taskId]) {
      throw new Error('Task not found or unauthorized');
    }

    const updateData = {
      name: data.name,
      category: data.category,
      status: data.status,
      primaryImage: data.primaryImage,
      secondaryImage: data.secondaryImage,
      updatedAt: new Date().toISOString(),
    };

    // Update the specific task field in the user's document
    await adminFirestore
      .collection('tasks')
      .doc(user.id)
      .update({
        [taskId]: { ...userTasksDoc.data()?.[taskId], ...updateData },
      });

    revalidatePath('/dashboard/sample-tasks');
    return toFormState('SUCCESS', 'Task updated successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('updateFirestoreTask', error);
    } else {
      await utils_log_server_error('updateFirestoreTask', error);
    }
    return fromErrorToFormState(error);
  }
}

export async function deleteFirestoreTask(taskId: string): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      await utils_log_server_error('deleteFirestoreTask', 'Unauthorized access attempt');
      throw new Error('Unauthorized access');
    }

    // Get the user's document to verify task ownership
    const userTasksDoc = await adminFirestore.collection('tasks').doc(user.id).get();
    if (!userTasksDoc.exists || !userTasksDoc.data()?.[taskId]) {
      throw new Error('Task not found or unauthorized');
    }

    // Remove the task field from the user's document
    await adminFirestore
      .collection('tasks')
      .doc(user.id)
      .update({
        [taskId]: FieldValue.delete(),
      });

    await utils_log_server_info('deleteFirestoreTask', 'Task deleted successfully', {
      taskId,
      userId: user.id,
    });

    revalidatePath('/dashboard/sample-tasks');
    return toFormState('SUCCESS', 'Task deleted successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('deleteFirestoreTask', error);
    } else {
      await utils_log_server_error('deleteFirestoreTask', error);
    }
    return fromErrorToFormState(error);
  }
}

export async function createFirestoreTask(data: CreateTaskData): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      throw new Error('Unauthorized access');
    }

    const validationData = {
      ...data,
      userId: user.id,
      status: 'pending' as TaskStatus,
    };

    // This will throw if validation fails
    const validatedData = schema_create_task.parse({
      ...validationData,
      primaryImage: { preview: data.primaryImage },
      secondaryImage: { preview: data.secondaryImage },
    });

    const taskData = {
      name: validatedData.name,
      category: validatedData.category,
      status: validatedData.status,
      primaryImage: validatedData.primaryImage.preview,
      secondaryImage: validatedData.secondaryImage.preview,
      createdAt: validatedData.createdAt.toISOString(),
      updatedAt: validatedData.updatedAt.toISOString(),
    };

    // Create or update the user's document with the new task
    await adminFirestore
      .collection('tasks')
      .doc(user.id)
      .set(
        {
          [validatedData.id]: taskData,
        },
        { merge: true }
      );

    revalidatePath('/dashboard/sample-tasks');
    return toFormState('SUCCESS', 'Task created successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('createFirestoreTask', error);
    } else {
      await utils_log_server_error('createFirestoreTask', error);
    }
    return fromErrorToFormState(error);
  }
}

export async function updateFirestoreTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<FormState> {
  try {
    const { user } = await lucia_get_user();
    if (!user?.id) {
      throw new Error('Unauthorized access');
    }

    // Get the user's document to verify task ownership
    const userTasksDoc = await adminFirestore.collection('tasks').doc(user.id).get();
    if (!userTasksDoc.exists || !userTasksDoc.data()?.[taskId]) {
      throw new Error('Task not found or unauthorized');
    }

    // Update the status and updatedAt fields of the specific task
    await adminFirestore
      .collection('tasks')
      .doc(user.id)
      .update({
        [`${taskId}.status`]: status,
        [`${taskId}.updatedAt`]: new Date().toISOString(),
      });

    revalidatePath('/dashboard/sample-tasks');
    return toFormState('SUCCESS', 'Task updated successfully');
  } catch (error: any) {
    if (error instanceof DatabaseError) {
      await utils_log_db_error('updateFirestoreTaskStatus', error);
    } else {
      await utils_log_server_error('updateFirestoreTaskStatus', error);
    }
    return fromErrorToFormState(error);
  }
}
