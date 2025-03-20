'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Camera, ChevronDown, AlertTriangle, Check, X, Info, ChevronRight, Sparkles, Utensils } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";

// Add import for food list store
import { useFoodListStore } from '@/app/(routes)/(private)/dashboard/meal-planning/_comp/food-list-store';

// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  allergens: Array<{
    name: string;
    severity: 'High' | 'Medium' | 'Low';
  }>;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  substitutions?: {
    id: string;
    name: string;
    description: string;
    matchScore: number; // 0-100
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
  const [activeStep, setActiveStep] = useState(0);
  const [recipeInstructions, setRecipeInstructions] = useState('');
  const [generatingInstructions, setGeneratingInstructions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('ingredients');
  const [isSaving, setIsSaving] = useState(false);

  // Progress percentage based on active step and form completion
  const calculateProgress = () => {
    if (activeStep === 0) {
      // First step progress based on having at least recipe name and 1 ingredient
      return Math.min(100, ((recipeName ? 50 : 0) + (ingredients.length > 0 ? 50 : 0)));
    } else if (activeStep === 1) {
      // Second step progress based on allergen analysis
      return 100;
    } else if (activeStep === 2) {
      // Third step progress based on instructions length
      return Math.min(100, recipeInstructions.length > 0 ? 100 : 0);
    }
    return 0;
  };

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

  // Handle removing an ingredient
  const handleRemoveIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
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

  // Handle check button click - enhanced AI analysis
  const handleCheck = () => {
    setIsAnalyzing(true);
    
    // Simulate API call for ingredient analysis
    setTimeout(() => {
      const results: AnalysisResult[] = ingredients.map((ing) => {
        // More sophisticated allergen detection logic
        const name = ing.name.toLowerCase();
        let allergens = [];
        
        if (name.includes('peanut')) {
          allergens.push({ name: 'Peanut', severity: 'High' as const });
        }
        if (name.includes('milk') || name.includes('butter') || name.includes('cream')) {
          allergens.push({ name: 'Milk', severity: 'Medium' as const });
        }
        if (name.includes('wheat') || name.includes('flour')) {
          allergens.push({ name: 'Wheat', severity: 'Medium' as const });
        }
        if (name.includes('egg')) {
          allergens.push({ name: 'Egg', severity: 'Low' as const });
        }
        if (name.includes('tree nut') || name.includes('almond') || name.includes('cashew')) {
          allergens.push({ name: 'Tree nuts', severity: 'High' as const });
        }
        
        // Nutritional info based on ingredient name (simplified)
        let nutritionalInfo;
        if (name.includes('chicken')) {
          nutritionalInfo = { calories: 120, protein: 25, carbs: 0, fat: 3 };
        } else if (name.includes('rice')) {
          nutritionalInfo = { calories: 130, protein: 3, carbs: 28, fat: 0 };
        } else if (name.includes('broccoli')) {
          nutritionalInfo = { calories: 55, protein: 4, carbs: 11, fat: 0 };
        } else {
          // Default values
          nutritionalInfo = { 
            calories: Math.floor(Math.random() * 200), 
            protein: Math.floor(Math.random() * 20), 
            carbs: Math.floor(Math.random() * 30), 
            fat: Math.floor(Math.random() * 15)
          };
        }
        
        // Generate substitutions for allergen-containing ingredients
        const substitutions = allergens.length > 0 ? [
          { 
            id: '1', 
            name: name.includes('peanut') ? 'Sunflower Seeds' : name.includes('milk') ? 'Almond Milk' : 'Rice Flour', 
            description: 'A safe alternative with similar properties', 
            matchScore: 85
          },
          { 
            id: '2', 
            name: name.includes('peanut') ? 'Pumpkin Seeds' : name.includes('milk') ? 'Coconut Milk' : 'Oat Flour', 
            description: 'Different flavor profile but works well as a substitute', 
            matchScore: 75 
          },
          { 
            id: '3', 
            name: name.includes('peanut') ? 'Roasted Chickpeas' : name.includes('milk') ? 'Oat Milk' : 'Coconut Flour', 
            description: 'Unique alternative with different nutritional benefits', 
            matchScore: 65
          }
        ] : undefined;
        
        return {
          ingredient: ing,
          isSafe: allergens.length === 0,
          allergens,
          nutritionalInfo,
          substitutions
        };
      });
      
      setAnalysisResults(results);
      setIsAnalyzing(false);
      
      // No longer auto-expand unsafe ingredients
      setExpandedIngredients([]);
      
      // If there's at least one unsafe ingredient, show tips
      if (results.some(result => !result.isSafe)) {
        setAiSuggestions([
          "Consider using the suggested alternatives for allergen-containing ingredients",
          "Some cooking methods can reduce allergenicity - try longer cooking times",
          "Cross-contamination is a risk - use separate utensils and preparation areas"
        ]);
      }
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
    
    // Move to next step
    setActiveStep(2);
    setCurrentTab('instructions');
  };

  // Generate recipe instructions with AI
  const handleGenerateInstructions = () => {
    setGeneratingInstructions(true);
    
    // Simulate API call for AI-generated instructions
    setTimeout(() => {
      const ingredientsList = ingredients.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`).join(', ');
      
      const generatedInstructions = `Here's how to prepare this delicious recipe:

1. Gather all ingredients: ${ingredientsList}.
2. Prepare your workspace by cleaning all surfaces and washing your hands.
3. Begin by preheating your oven to 350°F (175°C).
4. Mix the dry ingredients in a large bowl.
5. In a separate bowl, combine the wet ingredients until well blended.
6. Gradually add the dry ingredients to the wet ingredients, stirring continuously.
7. Transfer the mixture to a baking dish.
8. Bake for 30-35 minutes or until golden brown.
9. Allow to cool for 10 minutes before serving.
10. Enjoy your meal!`;
      
      setRecipeInstructions(generatedInstructions);
      setGeneratingInstructions(false);
    }, 2000);
  };

  // Save the recipe and navigate
  const handleSaveRecipe = async () => {
    setIsSaving(true);
    
    try {
      // Get addRecipe from food list store
      const { addRecipe } = useFoodListStore.getState();
      
      // Format ingredients for the recipe
      const formattedIngredients = ingredients.map(ing => ({
        name: ing.name,
        containsAllergens: analysisResults
          .find(result => result.ingredient.id === ing.id)?.allergens
          .map(a => a.name) || []
      }));
      
      // Create recipe object
      const newRecipe = {
        name: recipeName || 'My Custom Recipe',
        description: recipeInstructions ? recipeInstructions.slice(0, 100) + '...' : `A custom recipe with ${ingredients.length} ingredients`,
        ingredients: formattedIngredients,
        instructions: recipeInstructions 
          ? recipeInstructions.split('\n').filter(line => line.trim())
          : ["Follow the ingredient list and prepare as needed", "Enjoy your allergy-safe meal!"],
        allergensFound: analysisResults
          .filter(r => !r.isSafe)
          .flatMap(r => r.allergens.map(a => a.name)),
        suggestions: aiSuggestions || [],
        imageUrl: recipeImage || '',
      };
      
      // Add recipe to store
      addRecipe(newRecipe);
      
      // Show success message
      toast.success("Recipe saved successfully!");
      
      // Navigate to the dashboard meal planning page
      router.push('/dashboard/meal-planning');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error("Failed to save recipe. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <div className="text-sm font-medium">
            Step {activeStep + 1} of 3: {activeStep === 0 ? 'Ingredients' : activeStep === 1 ? 'Allergen Analysis' : 'Instructions'}
          </div>
          <div className="text-sm text-gray-500">{calculateProgress()}% complete</div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>
    
      <Tabs 
        value={currentTab} 
        onValueChange={setCurrentTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger 
            value="ingredients" 
            className={activeStep > 0 ? "flex items-center gap-1" : ""}
            onClick={() => activeStep > 0 && setActiveStep(0)}
          >
            {activeStep > 0 && <Check className="w-4 h-4" />}
            Ingredients
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            disabled={ingredients.length === 0}
            className={activeStep > 1 ? "flex items-center gap-1" : ""}
            onClick={() => {
              if (ingredients.length > 0 && activeStep < 1) {
                handleCheck();
                setActiveStep(1);
              } else if (activeStep > 1) {
                setActiveStep(1);
              }
            }}
          >
            {activeStep > 1 && <Check className="w-4 h-4" />}
            Allergen Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="instructions"
            disabled={activeStep < 2}
            onClick={() => activeStep >= 2 && setActiveStep(2)}
          >
            Instructions
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="ingredients">
          <Card className="border rounded-xl overflow-hidden">
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
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

                {/* Ingredient List Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">Ingredients</h3>
                  <Badge variant="outline" className="h-6">
                    {ingredients.length} {ingredients.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>

                {/* Ingredient List */}
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {ingredients.map((ingredient) => (
                      <motion.div
                        key={ingredient.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className="flex-grow flex items-center gap-3">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIngredient(ingredient.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
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
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      setActiveStep(1);
                      setCurrentTab('analysis');
                      handleCheck();
                    }}
                    disabled={ingredients.length === 0 || !recipeName}
                    className="w-36"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis">
          <Card className="border rounded-xl">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-xl text-gray-800">Allergen Analysis</h3>
                {isAnalyzing ? (
                  <Badge variant="outline" className="animate-pulse">
                    Analyzing...
                  </Badge>
                ) : (
                  <Badge variant={analysisResults.some(r => !r.isSafe) ? "destructive" : "success"}>
                    {analysisResults.some(r => !r.isSafe) ? "Allergens Detected" : "All Ingredients Safe"}
                  </Badge>
                )}
              </div>
              
              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <Sparkles className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-700 mb-1">AI Suggestions</h4>
                      <ul className="space-y-1">
                        {aiSuggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-blue-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
  
              {/* Analysis Results */}
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-400 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">Analyzing ingredients for allergens...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysisResults.map((result) => (
                    <div 
                      key={result.ingredient.id}
                      className={cn(
                        "border rounded-lg overflow-hidden",
                        result.isSafe ? "border-green-200" : "border-red-200"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-between p-4",
                        result.isSafe ? "bg-green-50" : "bg-red-50"
                      )}>
                        <div className="flex items-center gap-3">
                          {result.isSafe ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <span className="font-medium">{result.ingredient.name}</span>
                            <span className="text-gray-500 ml-2">
                              ({result.ingredient.amount} {result.ingredient.unit})
                            </span>
                          </div>
                        </div>
                        {!result.isSafe && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleIngredient(result.ingredient.id)}
                          >
                            {expandedIngredients.includes(result.ingredient.id) ? 'Hide Details' : 'Show Details'}
                            <ChevronDown className={cn(
                              "ml-1 h-4 w-4 transition-transform",
                              expandedIngredients.includes(result.ingredient.id) && "transform rotate-180"
                            )} />
                          </Button>
                        )}
                      </div>
                      
                      {/* Detailed Analysis Panel */}
                      {expandedIngredients.includes(result.ingredient.id) && (
                        <div className="p-4 space-y-4">
                          {/* Allergen information */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Detected Allergens:</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.allergens.map((allergen, idx) => (
                                <Badge 
                                  key={idx}
                                  className={cn(
                                    "px-3 py-1",
                                    allergen.severity === 'High' ? "bg-red-500" : 
                                    allergen.severity === 'Medium' ? "bg-orange-500" : 
                                    "bg-yellow-500"
                                  )}
                                >
                                  {allergen.name} ({allergen.severity})
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Nutritional information */}
                          {result.nutritionalInfo && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Nutritional Information:</h4>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <div className="text-gray-500 text-xs">Calories</div>
                                  <div className="font-medium">{result.nutritionalInfo.calories}</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <div className="text-gray-500 text-xs">Protein</div>
                                  <div className="font-medium">{result.nutritionalInfo.protein}g</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <div className="text-gray-500 text-xs">Carbs</div>
                                  <div className="font-medium">{result.nutritionalInfo.carbs}g</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <div className="text-gray-500 text-xs">Fat</div>
                                  <div className="font-medium">{result.nutritionalInfo.fat}g</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Substitution options */}
                          {result.substitutions && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Suggested Substitutions:</h4>
                              <div className="space-y-2">
                                {result.substitutions.map((sub) => (
                                  <div key={sub.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg bg-white">
                                    <Checkbox
                                      id={`${result.ingredient.id}-${sub.id}`}
                                      checked={selectedSubstitutions[result.ingredient.id]?.includes(sub.id)}
                                      onCheckedChange={() => handleSubstitutionChange(result.ingredient.id, sub.id)}
                                      className="mt-1"
                                    />
                                    <div className="flex-grow">
                                      <div className="flex items-center justify-between">
                                        <label
                                          htmlFor={`${result.ingredient.id}-${sub.id}`}
                                          className="font-medium cursor-pointer"
                                        >
                                          {sub.name}
                                        </label>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <div className="bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium">
                                                {sub.matchScore}% match
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-xs">Compatibility score with original ingredient</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{sub.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveStep(0);
                    setCurrentTab('ingredients');
                  }}
                  className="w-28"
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleApplySubstitutions}
                  disabled={isAnalyzing || (analysisResults.some(r => !r.isSafe) && Object.keys(selectedSubstitutions).length === 0)}
                  className="w-36"
                >
                  {analysisResults.some(r => !r.isSafe) ? 'Apply Changes' : 'Continue'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructions">
          <Card className="border rounded-xl">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-xl text-gray-800">Recipe Instructions</h3>
                <div className="flex items-center">
                  <Utensils className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">{recipeName}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="Add cooking instructions here or use the AI generator below..."
                  value={recipeInstructions}
                  onChange={(e) => setRecipeInstructions(e.target.value)}
                  className="min-h-[250px] p-4"
                />
                
                <Button
                  variant="outline"
                  onClick={handleGenerateInstructions}
                  disabled={generatingInstructions}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {generatingInstructions ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-current"></div>
                      <span>Generating instructions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate instructions with AI</span>
                    </>
                  )}
                </Button>
                
                {/* Preview */}
                {recipeInstructions && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-2">Preview:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap">
                      {recipeInstructions}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveStep(1);
                    setCurrentTab('analysis');
                  }}
                  className="w-28"
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleSaveRecipe}
                  disabled={!recipeInstructions}
                  className="w-28"
                >
                  Save Recipe
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}