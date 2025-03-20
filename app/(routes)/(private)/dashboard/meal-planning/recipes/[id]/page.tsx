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
  
  // Fetch food recipe with error handling
  const recipe = await getFoodRecipeById(id);
  
  if (!recipe) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Meal Planning', href: '/dashboard/meal-planning' },
    { label: 'Food List', href: '/dashboard/meal-planning' },
    { label: recipe.name },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex-grow flex flex-col px-3 sm:px-6 overflow-y-auto pt-1 pb-5 max-w-full">
        <RecipeDetailClient recipe={recipe} />
      </div>
    </div>
  );
} 