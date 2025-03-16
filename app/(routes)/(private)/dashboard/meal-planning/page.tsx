import { redirect } from 'next/navigation';

export default function MealPlanningIndexPage() {
  // Redirect to meal planning plans page
  redirect('/meal-planning/plans');
}
