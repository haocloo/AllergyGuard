'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Camera } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  imageUrl?: string;
}

const UNITS = [
  { value: 'g', label: 'gram' },
  { value: 'ml', label: 'ml' },
  { value: 'pcs', label: 'pcs' },
  { value: 'tsp', label: 'tsp' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'cup', label: 'cup' },
];

export function IngredientEntryClient() {
  const router = useRouter();
  const [recipeImage, setRecipeImage] = useState<string>();
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState({ 
    name: '', 
    amount: '',
    unit: 'g'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle recipe image upload
  const handleRecipeImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setRecipeImage(url);
  };

  // Handle ingredient image upload
  const handleImageUpload = (ingredientId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setIngredients(prev =>
      prev.map(ing =>
        ing.id === ingredientId
          ? { ...ing, imageUrl: url }
          : ing
      )
    );
  };

  // Handle adding new ingredient
  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount) return;

    setIngredients(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newIngredient.name,
        amount: newIngredient.amount,
        unit: newIngredient.unit,
      }
    ]);

    setNewIngredient({ name: '', amount: '', unit: 'g' });
  };

  // Handle key press for adding ingredient
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  // Handle check button click
  const handleCheck = () => {
    setIsLoading(true);
    
    // Store ingredients data in localStorage for now
    // In production, you would save this to your database
    localStorage.setItem('ingredientsData', JSON.stringify({
      recipeName,
      recipeImage,
      ingredients
    }));
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard/meal-planning/recipes/new/analysis');
    }, 800);
  };

  return (
    <Card className="max-w-md mx-auto border rounded-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Recipe Image Upload */}
        <label className={cn(
          "block w-full h-48 cursor-pointer transition-all duration-200",
          "bg-gray-50 hover:bg-gray-100",
          "relative"
        )}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleRecipeImageUpload(file);
            }}
          />
          {recipeImage ? (
            <div className="relative w-full h-full">
              <Image
                src={recipeImage}
                alt="Recipe"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Camera className="w-10 h-10 mb-2" />
              <span className="text-sm font-medium">Upload recipe image</span>
            </div>
          )}
        </label>

        <div className="p-6 space-y-6">
          {/* Recipe Name Input */}
          <Input
            placeholder="Recipe name"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="text-lg font-medium h-12 px-4"
          />

          {/* Ingredient List */}
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {ingredients.map((ingredient) => (
                <motion.div
                  key={ingredient.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3"
                >
                  <Input
                    value={ingredient.name}
                    readOnly
                    className="flex-grow h-11"
                  />
                  <Input
                    value={ingredient.amount}
                    readOnly
                    className="w-20 text-center h-11"
                  />
                  <div className="w-24 px-3 py-2 border rounded-md text-center font-medium">
                    {UNITS.find(u => u.value === ingredient.unit)?.label || ingredient.unit}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(ingredient.id, file);
                      }}
                    />
                    <Camera className={cn(
                      "h-5 w-5",
                      ingredient.imageUrl ? "text-green-500" : "text-gray-400 hover:text-gray-500"
                    )} />
                  </label>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add New Ingredient */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="Ingredient name"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="flex-grow h-11"
            />
            <Input
              type="text"
              placeholder="Amount"
              value={newIngredient.amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setNewIngredient(prev => ({ ...prev, amount: value }));
              }}
              onKeyPress={handleKeyPress}
              className="w-20 text-center h-11"
            />
            <Select
              value={newIngredient.unit}
              onValueChange={(value) => setNewIngredient(prev => ({ ...prev, unit: value }))}
            >
              <SelectTrigger className="w-24 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map(unit => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddIngredient}
              disabled={!newIngredient.name || !newIngredient.amount}
              className="h-11 w-11 p-0"
              variant="outline"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleCheck}
              disabled={isLoading || ingredients.length === 0}
              className="w-28"
            >
              Check
            </Button>
            <Button
              variant="outline"
              onClick={() => {/* Save functionality */}}
              disabled={ingredients.length === 0}
              className="w-28"
            >
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}