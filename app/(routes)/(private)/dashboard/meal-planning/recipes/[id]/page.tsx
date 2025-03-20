import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/layout/breadcrumb';
import { getFoodRecipeById } from '../../_comp/actions';
import { RecipeDetailClient } from './client';

interface Props {
  params: {
    id: string;
  };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = params;
  
  // Fetch food recipe from server data
  const serverRecipe = await getFoodRecipeById(id);
  
  // If not found in server, the client component will check localStorage
  // We'll pass the ID even if the server recipe is not found
  
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Meal Planning', href: '/dashboard/meal-planning' },
    { label: 'Recipes', href: '/dashboard/meal-planning' },
    { label: serverRecipe?.name || 'Recipe Details' },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <RecipeDetailClient serverRecipe={serverRecipe} recipeId={id} />
      </div>
    </div>
  );
} 