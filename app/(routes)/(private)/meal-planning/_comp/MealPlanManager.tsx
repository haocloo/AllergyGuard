'use client';

import { useState } from 'react';
import { Calendar, Plus, Edit, Trash, Utensils } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMealPlanningStore, type MealPlan, type Ingredient } from './store';
import { IngredientsList } from './shared/IngredientsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AllergenBadge } from './shared/AllergenBadge';

// Create Meal Plan Dialog
function CreateMealPlanDialog() {
  const { createMealPlan } = useMealPlanningStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');

  // Add ingredient to the list
  const addIngredient = () => {
    if (!currentIngredient.trim()) return;

    setIngredients((prev) => [
      ...prev,
      {
        name: currentIngredient.trim(),
        containsAllergens: [],
      },
    ]);
    setCurrentIngredient('');
  };

  // Remove ingredient from the list
  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    createMealPlan({
      name,
      description,
      ingredients,
      allergensFound: [],
      suggestions: [],
    });

    // Reset form and close dialog
    setName('');
    setDescription('');
    setIngredients([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Meal Plan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Meal Plan</DialogTitle>
            <DialogDescription>Add details for your new meal plan</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Weekly Family Menu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe your meal plan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ingredients</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add an ingredient..."
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  className="flex-1"
                />
                <Button type="button" onClick={addIngredient} disabled={!currentIngredient.trim()}>
                  Add
                </Button>
              </div>

              <div className="min-h-[100px] max-h-[150px] overflow-y-auto border rounded-md p-2 mt-2">
                {ingredients.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">No ingredients added yet</div>
                ) : (
                  <ul className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{ingredient.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Meal Plan Card
function MealPlanCard({ mealPlan }: { mealPlan: MealPlan }) {
  const { deleteMealPlan: removeMealPlan } = useMealPlanningStore();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle>{mealPlan.name}</CardTitle>
        <CardDescription className="flex items-center text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(mealPlan.createdAt)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {mealPlan.description || 'No description provided'}
        </p>

        <div className="text-xs text-gray-500 mb-1">Ingredients:</div>
        <div className="text-sm line-clamp-2">
          {mealPlan.ingredients.map((i) => i.name).join(', ')}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" className="space-x-1">
          <Edit className="h-3 w-3" />
          <span>Edit</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="space-x-1"
          onClick={() => removeMealPlan(mealPlan.id)}
        >
          <Trash className="h-3 w-3" />
          <span>Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Main Meal Plan Manager Component
export function MealPlanManager() {
  const { mealPlans, deleteMealPlan: removeMealPlan } = useMealPlanningStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Utensils className="w-6 h-6 mr-2" />
            Meal Plans
          </h2>
          <p className="text-gray-500">Create and manage allergy-safe meal plans</p>
        </div>

        <CreateMealPlanDialog />
      </div>

      {mealPlans.length === 0 ? (
        <Card className="border-dashed border-gray-300">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Utensils className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Meal Plans Yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first meal plan to organize allergy-safe meals
            </p>
            <CreateMealPlanDialog />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mealPlans.map((mealPlan) => (
                <MealPlanCard key={mealPlan.id} mealPlan={mealPlan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <div className="space-y-4">
              {mealPlans.map((mealPlan) => (
                <Card key={mealPlan.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{mealPlan.name}</h3>
                      <p className="text-sm text-gray-500">
                        {mealPlan.ingredients.length} ingredients
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMealPlan(mealPlan.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
