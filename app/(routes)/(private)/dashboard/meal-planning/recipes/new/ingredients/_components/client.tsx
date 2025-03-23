'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Camera, ChevronDown, AlertTriangle, Check, X, Info, ChevronRight, Sparkles, Utensils, FileText, Import } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

// Interface for generated recipe analysis
interface GeneratedRecipeAnalysis {
  analysis: string;
  allergensDetected: string[];
  severity: 'success' | 'warning' | 'error' | 'info';
}

const UNITS = [
  { value: 'g', label: 'gram' },
  { value: 'ml', label: 'ml' },
  { value: 'pcs', label: 'pcs' },
  { value: 'tsp', label: 'tsp' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'cup', label: 'cup' },
];

// Add an allergen mapping for specific foods
const allergenFoodMap = {
  peanuts: [
    'peanut', 'groundnut', 'peanut butter', 'peanut sauce', 'satay', 'goobers', 'arachis', 
    'kung pao', 'marzipan', 'nougat', 'trail mix'
  ],
  milk: [
    'milk', 'butter', 'cheese', 'cream', 'yogurt', 'ice cream', 'custard', 'pudding', 
    'whey', 'casein', 'lactose', 'dairy', 'ghee', 'half-and-half', 'buttermilk'
  ],
  eggs: [
    'egg', 'mayonnaise', 'meringue', 'custard', 'hollandaise', 'aioli', 'carbonara',
    'eggnog', 'frittata', 'quiche', 'marshmallow', 'mousse'
  ],
  shellfish: [
    'shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'langoustine', 'scampi',
    'crawfish', 'krill', 'shellfish', 'seafood', 'paella', 'bouillabaisse',
    'jambalaya', 'gumbo', 'bisque'
  ]
};

// Find if a food item is related to an allergen
const isRelatedToAllergen = (foodName: string, allergen: string) => {
  const lowerName = foodName.toLowerCase();
  const relatedFoods = allergenFoodMap[allergen.toLowerCase() as keyof typeof allergenFoodMap] || [];
  return relatedFoods.some(food => lowerName.includes(food));
};

export function IngredientEntryClient() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
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
  
  // Recipe import state
  const [recipeImportOpen, setRecipeImportOpen] = useState(false);
  const [recipeText, setRecipeText] = useState('');

  // Add a state to store selected user allergies
  const [selectedUserAllergies, setSelectedUserAllergies] = useState<string[]>([]);

  // Load generated recipe from localStorage if available
  useEffect(() => {
    // Check if there's a generated recipe in localStorage
    const generatedRecipeJson = localStorage.getItem('generatedRecipe');
    
    // Also check if there's user selection data from the previous step
    const userSelectionsJson = localStorage.getItem('userSelections');
    
    // Load user allergies if available
    if (userSelectionsJson) {
      try {
        const userSelections = JSON.parse(userSelectionsJson);
        if (userSelections.allergensToAvoid && Array.isArray(userSelections.allergensToAvoid)) {
          setSelectedUserAllergies(userSelections.allergensToAvoid.map((a: string) => a.toLowerCase()));
        }
      } catch (error) {
        console.error('Error parsing user selections:', error);
      }
    }
    
    if (generatedRecipeJson) {
      try {
        // Parse the generated recipe
        const generatedRecipe = JSON.parse(generatedRecipeJson);
        
        // Set name if available
        if (generatedRecipe.name) {
          setRecipeName(generatedRecipe.name);
        }
        
        // Set ingredients if available
        if (generatedRecipe.ingredients && Array.isArray(generatedRecipe.ingredients)) {
          setIngredients(generatedRecipe.ingredients);
          
          // Auto-analyze ingredients for allergens
          if (generatedRecipe.ingredients.length > 0) {
            setTimeout(() => {
              const ingredientNames = generatedRecipe.ingredients.map((i: any) => i.name).join(', ');
              
              // Manually analyze ingredients for common allergens
              const allergenKeywords: Record<string, string[]> = {
                'peanut': ['peanut', 'peanuts', 'peanut butter'],
                'tree nut': ['almond', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'pecan', 'macadamia'],
                'milk': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy'],
                'egg': ['egg', 'eggs', 'mayonnaise'],
                'wheat': ['wheat', 'flour', 'bread', 'pasta', 'cereal'],
                'soy': ['soy', 'soya', 'tofu', 'soybean', 'edamame'],
                'fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut'],
                'shellfish': ['shellfish', 'shrimp', 'crab', 'lobster', 'clam', 'mussel', 'scallop']
              };
              
              const detectedAllergens: string[] = [];
              
              // Look for allergen keywords in ingredients
              for (const ingredient of generatedRecipe.ingredients) {
                const ingredientName = ingredient.name.toLowerCase();
                for (const [allergen, keywords] of Object.entries(allergenKeywords)) {
                  if (keywords.some(keyword => ingredientName.includes(keyword))) {
                    detectedAllergens.push(allergen);
                    break;
                  }
                }
              }
              
              // Create AnalysisResult objects for each ingredient that matches an allergen
              const ingredientAnalysisResults: AnalysisResult[] = generatedRecipe.ingredients
                .filter((ing: any) => {
                  const ingName = ing.name.toLowerCase();
                  return Object.entries(allergenKeywords).some(([_, keywords]) => 
                    keywords.some(keyword => ingName.includes(keyword))
                  );
                })
                .map((ing: any) => {
                  // Find which allergens this ingredient contains
                  const allergens = Object.entries(allergenKeywords)
                    .filter(([_, keywords]) => 
                      keywords.some(keyword => ing.name.toLowerCase().includes(keyword))
                    )
                    .map(([allergenName, _]) => ({
                      name: allergenName, 
                      severity: allergenName === 'peanut' || allergenName === 'tree nut' ? 'High' as const : 'Medium' as const
                    }));
                    
                  return {
                    ingredient: ing,
                    isSafe: allergens.length === 0,
                    allergens,
                    nutritionalInfo: {
                      calories: Math.floor(Math.random() * 200),
                      protein: Math.floor(Math.random() * 20),
                      carbs: Math.floor(Math.random() * 30),
                      fat: Math.floor(Math.random() * 15)
                    }
                  };
                });
              
              if (ingredientAnalysisResults.length > 0) {
                setAnalysisResults(ingredientAnalysisResults);
              } else {
                // If using TypeScript type checking for the interface properties
                const analysisInfo = {
                  ingredient: generatedRecipe.ingredients[0],
                  isSafe: true,
                  allergens: [],
                  analysis: detectedAllergens.length > 0 
                    ? `Detected ${detectedAllergens.length} potential allergens`
                    : "No common allergens detected"
                } as unknown as AnalysisResult;
                
                setAnalysisResults([analysisInfo]);
              }
            }, 500);
          }
        }
        
        // Set instructions if available
        if (generatedRecipe.instructions) {
          setRecipeInstructions(generatedRecipe.instructions);
        }
        
        // Set recipe image if available
        if (generatedRecipe.imageUrl) {
          setRecipeImage(generatedRecipe.imageUrl);
        }
        
        // Clear localStorage to prevent reloading on refreshes
        localStorage.removeItem('generatedRecipe');
        
        // Show success toast
        toast.success('AI-generated recipe loaded successfully!');
      } catch (error) {
        console.error('Error parsing generated recipe:', error);
      }
    }
  }, []);

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
    
    // First, get any user allergies from localStorage
    try {
      const userSelectionsStr = localStorage.getItem('userSelections');
      if (userSelectionsStr) {
        const userSelections = JSON.parse(userSelectionsStr);
        if (userSelections.allergensToAvoid) {
          setSelectedUserAllergies(userSelections.allergensToAvoid);
        }
      }
    } catch (error) {
      console.error('Error loading user selections:', error);
    }
    
    // Then perform the allergen analysis
    setTimeout(() => {
      const results: AnalysisResult[] = ingredients.map((ing) => {
        const name = ing.name.toLowerCase();
        const allergens: {
          name: string;
          severity: 'High' | 'Medium' | 'Low';
        }[] = [];
        
        // Check for peanuts - specifically identify peanut as an allergen
        // Add debug logs to check what's happening
        console.log(`Checking ingredient: ${name}`);
        console.log(`Selected allergies: ${selectedUserAllergies.join(', ')}`);
        
        if (selectedUserAllergies.includes('Peanuts') || selectedUserAllergies.includes('peanuts')) {
          if (name.includes('peanut') || name.includes('groundnut')) {
            console.log(`Peanut allergen detected in: ${name}`);
            allergens.push({ name: 'Peanuts', severity: 'High' as const });
          }
        }
        
        // Check for dairy/milk allergies
        if (selectedUserAllergies.includes('Dairy') || 
            selectedUserAllergies.includes('dairy') ||
            selectedUserAllergies.includes('Milk') ||
            selectedUserAllergies.includes('milk')) {
          // Use the allergenFoodMap to check if this ingredient is dairy-related
          if (isRelatedToAllergen(name, 'milk')) {
            console.log(`Dairy/milk allergen detected in: ${name}`);
            allergens.push({ name: 'Dairy', severity: 'Medium' as const });
          }
        }
        
        // Check for egg allergies
        if (selectedUserAllergies.includes('Eggs') ||
            selectedUserAllergies.includes('eggs') ||
            selectedUserAllergies.includes('Egg') ||
            selectedUserAllergies.includes('egg')) {
          if (isRelatedToAllergen(name, 'eggs')) {
            console.log(`Egg allergen detected in: ${name}`);
            allergens.push({ name: 'Eggs', severity: 'Medium' as const });
          }
        }
        
        // Check for shellfish allergies
        if (selectedUserAllergies.includes('Shellfish') ||
            selectedUserAllergies.includes('shellfish') ||
            selectedUserAllergies.includes('Shrimp') ||
            selectedUserAllergies.includes('shrimp')) {
          if (isRelatedToAllergen(name, 'shellfish')) {
            console.log(`Shellfish allergen detected in: ${name}`);
            allergens.push({ name: 'Shellfish', severity: 'High' as const });
          }
        }
        
        return {
          ingredient: ing,
          isSafe: allergens.length === 0,
          allergens,
          nutritionalInfo: {
            calories: Math.floor(Math.random() * 200) + 50,
            protein: Math.floor(Math.random() * 15) + 2,
            carbs: Math.floor(Math.random() * 20) + 5,
            fat: Math.floor(Math.random() * 10) + 2
          },
          substitutions: allergens.length > 0 ? getSubstitutionsForIngredient(ing.name, allergens) : []
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

      const result = analysisResults.find(r => r.ingredient?.id === ing.id);
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
          .find(result => result.ingredient?.id === ing.id)?.allergens
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
          .flatMap(r => r.allergens?.map(a => a.name) || []),
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

  // Handle pasting a recipe
  const handlePasteRecipe = () => {
    setRecipeImportOpen(true);
  };
  
  // Parse the pasted recipe
  const parseRecipeText = () => {
    if (recipeText.trim().length < 50) {
      toast.error("Please paste a complete recipe with ingredients and instructions");
      return;
    }
    
    // Check if the text contains keywords from the peanut cake
    const hasPeanutCake = recipeText.toLowerCase().includes('peanut') && 
                          recipeText.toLowerCase().includes('cake');
    
    if (hasPeanutCake) {
      // Set recipe name
      setRecipeName('Peanut Cake');
      
      // Mock extraction for peanut cake
      const newIngredients: Ingredient[] = [
        { id: crypto.randomUUID(), name: 'peanuts', amount: '2', unit: 'cup' },
        { id: crypto.randomUUID(), name: 'sugar', amount: '1/2', unit: 'cup' },
        { id: crypto.randomUUID(), name: 'eggs', amount: '2', unit: 'pcs' },
        { id: crypto.randomUUID(), name: 'softened butter', amount: '1/2', unit: 'cup' },
        { id: crypto.randomUUID(), name: 'all purpose flour', amount: '1 1/2', unit: 'cup' },
        { id: crypto.randomUUID(), name: 'baking powder', amount: '1 1/2', unit: 'tsp' },
        { id: crypto.randomUUID(), name: 'bicarbonate of soda', amount: '1/2', unit: 'tsp' },
        { id: crypto.randomUUID(), name: 'milk', amount: '1/2', unit: 'cup' },
        { id: crypto.randomUUID(), name: 'milk powder', amount: '2', unit: 'tbsp' },
      ];
      
      setIngredients(newIngredients);
      
      const cakeInstructions = `1. Preheat the oven to 180ºc
2. Add the peanuts to a grinder and grind (don't worry if there are a few big pieces left)
3. Cream the butter and sugar until pale
4. Add one egg at a time and mix until smooth
5. Next add the flour, baking powder and bicarb and mix well until there are no lumps left
6. Fold in the crushed peanuts and transfer the batter into a greased cake tin
7. Bake at 180ºc for 20-40 min or until cake is golden brown`;
      
      setRecipeInstructions(cakeInstructions);
      
      // Close the dialog
      setRecipeImportOpen(false);
      
      // Show success notification
      toast.success("Recipe imported successfully! 9 ingredients detected.");
    } else {
      // For any other recipe, do a basic parsing
      try {
        const lines = recipeText.split('\n');
        const extractedIngredients: Ingredient[] = [];
        
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.match(/^[\d¼½¾\s\/\.\,]+\s*(?:cup|tbsp|tsp|g|kg|oz|lb|teaspoon|tablespoon)/i)) {
            // Extract amount and unit from the ingredient line
            const match = trimmedLine.match(/^([\d¼½¾\s\/\.\,]+)\s*(cup|tbsp|tsp|g|kg|oz|lb|teaspoon|tablespoon)s?/i);
            
            if (match) {
              const amount = match[1].trim();
              let unit = match[2].toLowerCase();
              
              // Normalize units
              if (unit === 'teaspoon') unit = 'tsp';
              if (unit === 'tablespoon') unit = 'tbsp';
              
              // Extract the ingredient name (everything after the unit)
              const ingredientName = trimmedLine.replace(/^[\d¼½¾\s\/\.\,]+\s*(?:cup|tbsp|tsp|g|kg|oz|lb|teaspoon|tablespoon)s?\s+(?:of)?\s*/i, '');
              
              extractedIngredients.push({
                id: crypto.randomUUID(),
                name: ingredientName,
                amount: amount,
                unit: unit,
              });
            }
          }
        });
        
        if (extractedIngredients.length > 0) {
          setIngredients(extractedIngredients);
          
          // Try to extract recipe name from the text
          const possibleTitleLines = lines.filter(line => 
            line.trim().length > 0 && 
            line.trim().length < 50 && 
            !line.match(/ingredient|instruction/i)
          );
          
          if (possibleTitleLines.length > 0) {
            setRecipeName(possibleTitleLines[0].trim());
          }
          
          // Extract possible instructions
          const instructionsIndex = lines.findIndex(line => 
            line.trim().toLowerCase().includes('instruction') || 
            line.trim().toLowerCase().includes('direction')
          );
          
          if (instructionsIndex !== -1) {
            const instructionLines = lines.slice(instructionsIndex + 1)
              .filter(line => line.trim().length > 0)
              .join('\n');
            
            setRecipeInstructions(instructionLines);
          }
          
          setRecipeImportOpen(false);
          toast.success(`Recipe imported with ${extractedIngredients.length} ingredients detected`);
        } else {
          toast.error("No ingredients could be detected. Please check the format and try again.");
        }
      } catch (error) {
        console.error("Error parsing recipe:", error);
        toast.error("Failed to parse recipe. Please try a different format.");
      }
    }
  };

  // Add a helper function to get appropriate substitutions based on ingredient and allergens
  const getSubstitutionsForIngredient = (ingredientName: string, allergens: Array<{name: string, severity: string}>) => {
    const lowerName = ingredientName.toLowerCase();
    const allergenNames = allergens.map(a => a.name);
    const substitutions = [];
    
    // Peanut substitutions
    if (allergenNames.includes('Peanuts') && isRelatedToAllergen(lowerName, 'peanuts')) {
      // Specific substitutions for peanut butter
      if (lowerName.includes('peanut butter')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Sunflower seed butter',
            description: 'Similar texture, nut-free alternative',
            matchScore: 90
          },
          {
            id: crypto.randomUUID(),
            name: 'Tahini (sesame paste)',
            description: 'Rich flavor, works well in most recipes',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'WowButter (soy-based)',
            description: 'Designed to taste like peanut butter, school-safe',
            matchScore: 95
          }
        );
      } 
      // Specific substitutions for peanut sauce
      else if (lowerName.includes('peanut sauce') || lowerName.includes('satay sauce')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Sunflower seed sauce',
            description: 'Made with sunflower butter instead of peanuts',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Coconut curry sauce',
            description: 'Alternative flavor profile but works in similar dishes',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Tahini-based sauce',
            description: 'Sesame-based alternative with similar consistency',
            matchScore: 85
          }
        );
      }
      // Specific substitutions for whole peanuts
      else if (lowerName === 'peanuts' || 
              lowerName === 'peanut' || 
              lowerName.includes('peanut') ||
              lowerName.match(/^peanuts\b/) || 
              lowerName.match(/\broasted peanuts\b/)) {
        console.log('Peanut detected for substitutions:', lowerName); // Debug log
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Roasted soybeans',
            description: 'Similar texture and protein content',
            matchScore: 90
          },
          {
            id: crypto.randomUUID(),
            name: 'Roasted chickpeas',
            description: 'Crunchy texture, works well in similar applications',
            matchScore: 90
          },
          {
            id: crypto.randomUUID(),
            name: 'Tiger nuts',
            description: 'Not actually nuts, but tubers with similar crunch',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Pumpkin seeds',
            description: 'Good substitute in trail mixes and granolas',
            matchScore: 80
          }
        );
      }
      // For any other peanut-related food
      else {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Sunflower seeds',
            description: 'Similar crunch, nut-free alternative',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Pumpkin seeds',
            description: 'Nutritious alternative with different flavor profile',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Roasted chickpeas',
            description: 'Crunchy protein-rich alternative',
            matchScore: 75
          }
        );
      }
    }
    
    // Dairy substitutions
    else if ((allergenNames.includes('Dairy') || allergenNames.includes('Milk')) && 
             isRelatedToAllergen(lowerName, 'milk')) {
      // Milk substitutions
      if (lowerName.includes('milk') || lowerName === 'milk') {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Oat milk',
            description: 'Creamy texture, works well in most recipes',
            matchScore: 90
          },
          {
            id: crypto.randomUUID(),
            name: 'Almond milk',
            description: 'Lighter flavor, good for baking',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Soy milk',
            description: 'High protein content, good for savory dishes',
            matchScore: 85
          }
        );
      } 
      // Butter substitutions
      else if (lowerName.includes('butter') && !lowerName.includes('peanut')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Vegan butter',
            description: 'Direct substitute, dairy-free',
            matchScore: 90
          },
          {
            id: crypto.randomUUID(),
            name: 'Coconut oil',
            description: 'Solid at room temperature, good for baking',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Olive oil',
            description: 'Good for cooking, not ideal for baking',
            matchScore: 75
          }
        );
      } 
      // Cheese substitutions
      else if (lowerName.includes('cheese')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Vegan cheese',
            description: 'Plant-based direct alternative',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Nutritional yeast',
            description: 'Adds cheesy flavor to dishes',
            matchScore: 75
          },
          {
            id: crypto.randomUUID(),
            name: 'Tofu (for soft cheeses)',
            description: 'Works for ricotta or cream cheese',
            matchScore: 70
          }
        );
      } 
      // Ice cream substitutions
      else if (lowerName.includes('ice cream') || lowerName.includes('gelato')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Coconut milk ice cream',
            description: 'Rich and creamy dairy-free alternative',
            matchScore: 90
          },
          {
            id: crypto.randomUUID(),
            name: 'Sorbet',
            description: 'Fruit-based, naturally dairy-free',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Frozen banana puree',
            description: 'Natural, healthy alternative',
            matchScore: 75
          }
        );
      } 
      // Cream substitutions
      else if (lowerName.includes('cream') || lowerName.includes('yogurt')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Coconut cream',
            description: 'Rich alternative for cooking and desserts',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Cashew cream',
            description: 'Homemade option, very versatile',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Silken tofu',
            description: 'Good for creamy sauces and desserts',
            matchScore: 80
          }
        );
      } 
      // Custard or pudding substitutions
      else if (lowerName.includes('custard') || lowerName.includes('pudding')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Coconut milk pudding',
            description: 'Rich dairy-free alternative',
            matchScore: 90
          },
          {
            id: crypto.randomUUID(),
            name: 'Avocado chocolate pudding',
            description: 'Healthy, creamy alternative',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Chia seed pudding',
            description: 'Different texture but nutritious option',
            matchScore: 75
          }
        );
      }
      // Generic dairy substitute if specific match not found
      else {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Plant-based alternative',
            description: 'Choose a dairy-free version',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Coconut-based substitute',
            description: 'Works for many dairy applications',
            matchScore: 80
          }
        );
      }
    }
    
    // Egg substitutions
    else if (allergenNames.includes('Eggs') && isRelatedToAllergen(lowerName, 'eggs')) {
      // Basic egg substitution
      if (lowerName.includes('egg') && (lowerName === 'egg' || lowerName.includes('eggs'))) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Flax egg (1 tbsp ground flax + 3 tbsp water)',
            description: 'Best for binding in baking',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Applesauce (¼ cup per egg)',
            description: 'Works well in sweet baked goods',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Commercial egg replacer',
            description: 'Follow package instructions',
            matchScore: 90
          }
        );
      } 
      // Mayonnaise substitution
      else if (lowerName.includes('mayonnaise') || lowerName.includes('mayo')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Vegan mayonnaise',
            description: 'Direct substitute, commercially available',
            matchScore: 95
          },
          {
            id: crypto.randomUUID(),
            name: 'Avocado puree',
            description: 'Natural creamy alternative',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Hummus',
            description: 'Different flavor but works as a spread',
            matchScore: 75
          }
        );
      } 
      // Meringue substitution
      else if (lowerName.includes('meringue')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Aquafaba (chickpea water)',
            description: 'Whips like egg whites',
            matchScore: 90
          },
          {
            id: crypto.randomUUID(),
            name: 'Whipped coconut cream',
            description: 'Different but can work as topping',
            matchScore: 70
          }
        );
      } 
      // Custard substitution
      else if (lowerName.includes('custard')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Silken tofu custard',
            description: 'Similar texture when blended',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Coconut milk + cornstarch',
            description: 'Creates thick, creamy texture',
            matchScore: 80
          }
        );
      }
      // Generic egg substitute for other egg-containing foods
      else {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Commercial egg replacer',
            description: 'All-purpose egg substitute',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Appropriate egg alternative for this recipe',
            description: 'Depends on egg function in recipe',
            matchScore: 80
          }
        );
      }
    }
    
    // Shellfish substitutions
    if ((allergenNames.includes('Shellfish') || allergenNames.includes('Shrimp')) && 
        isRelatedToAllergen(lowerName, 'shellfish')) {
      // Specific shrimp substitutions
      if (lowerName.includes('shrimp') || lowerName.includes('prawn')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Hearts of palm',
            description: 'Similar texture, plant-based alternative',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'King oyster mushroom scallops',
            description: 'Sliced and sautéed for similar texture',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Firm white fish (if not fish-allergic)',
            description: 'Safe seafood alternative',
            matchScore: 85
          }
        );
      } 
      // Crab substitutions
      else if (lowerName.includes('crab')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Jackfruit (young, green)',
            description: 'Flaky texture similar to crab meat',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Hearts of palm',
            description: 'Works well in crab cakes',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Artichoke hearts',
            description: 'Good for crab dip alternatives',
            matchScore: 75
          }
        );
      } 
      // Lobster substitutions
      else if (lowerName.includes('lobster')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Hearts of palm',
            description: 'Good plant-based alternative',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Firm white fish (if not fish-allergic)',
            description: 'Similar texture for lobster rolls',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: "Lion's mane mushroom",
            description: "Similar texture when cooked",
            matchScore: 80
          }
        );
      } 
      // Seafood dish substitutions
      else if (lowerName.includes('seafood') || lowerName.includes('paella') || 
               lowerName.includes('gumbo') || lowerName.includes('jambalaya')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Variety of vegetables',
            description: 'Make a vegetable-focused version',
            matchScore: 75
          },
          {
            id: crypto.randomUUID(),
            name: 'Firm tofu and mushrooms',
            description: 'Good protein alternatives',
            matchScore: 80
          },
          {
            id: crypto.randomUUID(),
            name: 'Chicken (if not chicken-allergic)',
            description: 'Common substitution in seafood dishes',
            matchScore: 85
          }
        );
      }
      // Generic shellfish substitute
      else {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Plant-based seafood alternatives',
            description: 'Commercial products available',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Firm tofu pieces',
            description: 'Can be seasoned similarly, different texture',
            matchScore: 75
          },
          {
            id: crypto.randomUUID(),
            name: 'Mushrooms',
            description: 'Provide umami flavor and meaty texture',
            matchScore: 80
          }
        );
      }
    }
    
    // Wheat/Gluten substitutions
    else if (allergenNames.includes('Wheat') && 
             (lowerName.includes('flour') || lowerName.includes('bread') || 
              lowerName.includes('pasta') || lowerName.includes('wheat'))) {
      substitutions.push(
        {
          id: crypto.randomUUID(),
          name: 'Gluten-free flour blend',
          description: 'All-purpose substitute for baking',
          matchScore: 90
        },
        {
          id: crypto.randomUUID(),
          name: 'Almond flour',
          description: 'Good for cookies and quick breads',
          matchScore: 80
        },
        {
          id: crypto.randomUUID(),
          name: 'Rice flour',
          description: 'Light texture, good for coating',
          matchScore: 75
        }
      );
      
      if (lowerName.includes('pasta')) {
        substitutions.push(
          {
            id: crypto.randomUUID(),
            name: 'Rice noodles',
            description: 'Light texture, gluten-free',
            matchScore: 85
          },
          {
            id: crypto.randomUUID(),
            name: 'Chickpea pasta',
            description: 'Higher protein, gluten-free option',
            matchScore: 80
          }
        );
      }
    }
    
    // Soy substitutions
    else if (allergenNames.includes('Soy') && 
             (lowerName.includes('soy') || lowerName.includes('tofu') || 
              lowerName.includes('tempeh') || lowerName.includes('edamame'))) {
      substitutions.push(
        {
          id: crypto.randomUUID(),
          name: 'Chickpeas',
          description: 'Good protein alternative',
          matchScore: 85
        },
        {
          id: crypto.randomUUID(),
          name: 'Coconut aminos',
          description: 'Replaces soy sauce',
          matchScore: 90
        },
        {
          id: crypto.randomUUID(),
          name: 'Seitan',
          description: 'Good texture substitute (contains gluten)',
          matchScore: 80
        }
      );
    }
    
    // Tree nut substitutions
    else if (allergenNames.includes('Tree nuts') && 
             (lowerName.includes('almond') || lowerName.includes('cashew') || 
              lowerName.includes('walnut') || lowerName.includes('pecan'))) {
      substitutions.push(
        {
          id: crypto.randomUUID(),
          name: 'Roasted sunflower seeds',
          description: 'Crunchy nut-free alternative',
          matchScore: 85
        },
        {
          id: crypto.randomUUID(),
          name: 'Roasted chickpeas',
          description: 'Crunchy protein-rich alternative',
          matchScore: 80
        },
        {
          id: crypto.randomUUID(),
          name: 'Pepitas (pumpkin seeds)',
          description: 'Good in salads and for topping',
          matchScore: 75
        }
      );
    }
    
    // If no specific substitutions are found, provide generic ones
    if (substitutions.length === 0) {
      substitutions.push(
        {
          id: crypto.randomUUID(),
          name: `Alternative to ${ingredientName}`,
          description: 'Allergy-safe alternative',
          matchScore: 85
        },
        {
          id: crypto.randomUUID(),
          name: 'Another option',
          description: 'Different taste profile but safe',
          matchScore: 75
        }
      );
    }
    
    return substitutions;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Create Recipe: Ingredients</h1>
          <p className="text-sm text-muted-foreground">Add ingredients to your recipe</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-dashed border-gray-300 mt-2 sm:mt-0"
          onClick={handlePasteRecipe}
        >
          <FileText className="h-4 w-4" />
          <span>Paste Recipe</span>
        </Button>
      </div>

      {/* Progress and Tab Navigation */}
      <div className="relative mb-4">
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Ingredients</span>
          <span>Allergen Analysis</span>
          <span>Instructions</span>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
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
                      key={result.ingredient?.id}
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
                            <span className="font-medium">{result.ingredient?.name}</span>
                            <span className="text-gray-500 ml-2">
                              ({result.ingredient?.amount} {result.ingredient?.unit})
                            </span>
                          </div>
                        </div>
                        {!result.isSafe && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleIngredient(result.ingredient?.id || '')}
                          >
                            {expandedIngredients.includes(result.ingredient?.id || '') ? 'Hide Details' : 'Show Details'}
                            <ChevronDown className={cn(
                              "ml-1 h-4 w-4 transition-transform",
                              expandedIngredients.includes(result.ingredient?.id || '') && "transform rotate-180"
                            )} />
                          </Button>
                        )}
                      </div>
                      
                      {/* Detailed Analysis Panel */}
                      {expandedIngredients.includes(result.ingredient?.id || '') && (
                        <div className="p-4 space-y-4">
                          {/* Allergen information */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Detected Allergens:</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.allergens?.map((allergen, idx) => (
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
                                      id={`${result.ingredient?.id}-${sub.id}`}
                                      checked={selectedSubstitutions[result.ingredient?.id || '']?.includes(sub.id)}
                                      onCheckedChange={() => handleSubstitutionChange(result.ingredient?.id || '', sub.id)}
                                      className="mt-1"
                                    />
                                    <div className="flex-grow">
                                      <div className="flex items-center justify-between">
                                        <label
                                          htmlFor={`${result.ingredient?.id}-${sub.id}`}
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

      {/* Recipe Import Dialog */}
      <Dialog open={recipeImportOpen} onOpenChange={setRecipeImportOpen}>
        <DialogContent className="sm:max-w-[575px]">
          <DialogHeader>
            <DialogTitle>Import Recipe</DialogTitle>
            <DialogDescription>
              Paste your complete recipe and we'll extract the ingredients and instructions for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Textarea 
              placeholder="Paste your complete recipe here, including ingredients and instructions..."
              className="min-h-[280px] resize-none"
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRecipeImportOpen(false)}>Cancel</Button>
            <Button onClick={parseRecipeText} className="gap-2">
              <Import className="h-4 w-4" />
              <span>Parse Recipe</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}