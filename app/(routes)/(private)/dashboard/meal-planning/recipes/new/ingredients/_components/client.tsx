'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Camera, ChevronDown, AlertTriangle, Check } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  imageUrl?: string;
}

interface AnalysisResult {
  ingredient: Ingredient;
  isSafe: boolean;
  allergens: string[];
  substitutions?: {
    id: string;
    name: string;
    description: string;
  }[];
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [expandedIngredients, setExpandedIngredients] = useState<string[]>([]);
  const [selectedSubstitutions, setSelectedSubstitutions] = useState<Record<string, string[]>>({});

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

  const toggleIngredient = (ingredientId: string) => {
    setExpandedIngredients(prev => 
      prev.includes(ingredientId) 
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const handleSubstitutionChange = (ingredientId: string, substitutionId: string) => {
    setSelectedSubstitutions(prev => {
      const current = prev[ingredientId] || [];
      const newSubs = current.includes(substitutionId)
        ? current.filter(id => id !== substitutionId)
        : [substitutionId]; // Only allow one substitution per ingredient
      return {
        ...prev,
        [ingredientId]: newSubs
      };
    });
  };

  // Handle check button click
  const handleCheck = () => {
    setIsAnalyzing(true);
    
    // Simulate API call for ingredient analysis
    setTimeout(() => {
      const results: AnalysisResult[] = ingredients.map((ing) => {
        const hasAllergen = ing.name.toLowerCase().includes('nut') || ing.name.toLowerCase().includes('peanut');
        return {
          ingredient: ing,
          isSafe: !hasAllergen, // This will be true for all ingredients except those with allergens
          allergens: hasAllergen ? ['Peanut'] : [], // Empty array for safe ingredients
          substitutions: hasAllergen ? [
            { id: '1', name: 'Cranberries', description: 'Sweet and tart flavor, great for snacking' },
            { id: '2', name: 'Sunflower Seeds', description: 'Similar nutty flavor and texture' },
            { id: '3', name: 'Pumpkin Seeds', description: 'Rich in protein and healthy fats' }
          ] : undefined
        };
      });
      setAnalysisResults(results);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleApplySubstitutions = () => {
    setIngredients(prev => prev.map(ing => {
      const substitutionId = selectedSubstitutions[ing.id]?.[0];
      if (!substitutionId) return ing;

      const result = analysisResults.find(r => r.ingredient.id === ing.id);
      const substitution = result?.substitutions?.find(s => s.id === substitutionId);
      
      if (!substitution) return ing;

      return {
        ...ing,
        name: substitution.name
      };
    }));
    setAnalysisResults([]);
    setSelectedSubstitutions({});
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
              {(analysisResults.length > 0 ? analysisResults : ingredients).map((item) => {
                const result = analysisResults.length > 0 ? item as AnalysisResult : null;
                const ingredient = result?.ingredient || item as Ingredient;
                
                return (
                  <motion.div
                    key={ingredient.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      analysisResults.length > 0 ? (result?.isSafe ? "bg-green-50" : "bg-red-50") : ""
                    )}>
                      <div className="flex-grow flex items-center gap-3">
                        {result && (
                          result.isSafe ? (
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          )
                        )}
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
                      </div>
                      {result && !result.isSafe && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleIngredient(ingredient.id)}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className={cn(
                            "h-5 w-5 transition-transform",
                            expandedIngredients.includes(ingredient.id) && "transform rotate-180"
                          )} />
                        </Button>
                      )}
                    </div>

                    {/* Substitutions Panel */}
                    {result && !result.isSafe && expandedIngredients.includes(ingredient.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-8 p-4 border rounded-lg bg-white space-y-3"
                      >
                        <p className="text-red-600 text-sm">
                          Warning: Contains {result.allergens.join(', ')}
                        </p>
                        <div className="space-y-2">
                          {result.substitutions?.map((sub) => (
                            <div key={sub.id} className="flex items-start gap-3">
                              <Checkbox
                                id={`${ingredient.id}-${sub.id}`}
                                checked={selectedSubstitutions[ingredient.id]?.includes(sub.id)}
                                onCheckedChange={() => handleSubstitutionChange(ingredient.id, sub.id)}
                              />
                              <div className="space-y-1">
                                <label
                                  htmlFor={`${ingredient.id}-${sub.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {sub.name}
                                </label>
                                <p className="text-sm text-gray-500">{sub.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Add New Ingredient */}
          {analysisResults.length === 0 && (
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
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {analysisResults.length === 0 ? (
              <Button
                variant="outline"
                onClick={handleCheck}
                disabled={isAnalyzing || ingredients.length === 0}
                className="w-28"
              >
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                  'Check'
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnalysisResults([]);
                    setSelectedSubstitutions({});
                  }}
                  className="w-28"
                >
                  Back
                </Button>
                <Button
                  onClick={handleApplySubstitutions}
                  disabled={Object.keys(selectedSubstitutions).length === 0}
                  className="w-28"
                >
                  Apply
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}