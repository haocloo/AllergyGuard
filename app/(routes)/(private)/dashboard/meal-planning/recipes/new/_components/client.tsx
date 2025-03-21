'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, User, Check, AlertTriangle, FileText, Import } from 'lucide-react';
import { motion } from 'framer-motion';

// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Store for allergens (in a real app, we would fetch these from the API)
const commonAllergens = [
  'Peanut', 
  'Tree nuts', 
  'Milk', 
  'Egg', 
  'Wheat', 
  'Soy', 
  'Fish', 
  'Shellfish',
  'Sesame'
];

// Store for family members (in a real app, we would fetch these from the API)
const people = [
  { id: '1', name: 'John' },
  { id: '2', name: 'Mary' },
  { id: '3', name: 'Emma' },
  { id: '4', name: 'Lucas' },
  { id: '5', name: 'Sarah' },
  { id: '6', name: 'Michael' },
];

export function MealPrepFormClient() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New state for recipe import dialog
  const [recipeImportOpen, setRecipeImportOpen] = useState(false);
  const [recipeText, setRecipeText] = useState('');
  const [activeImportTab, setActiveImportTab] = useState('paste');
  
  // Form state
  const [formData, setFormData] = useState({
    servings: '',
    selectedPeople: [] as string[],
    additionalAllergies: [] as string[],
    customAllergen: '',
    mealIdea: '',
  });

  // Add new state for ingredient preview
  const [previewIngredients, setPreviewIngredients] = useState<Array<{name: string, allergic: boolean}>>([]);
  
  // Add a debounced function to analyze the meal idea for ingredients
  const analyzeMealIdea = useCallback(() => {
    if (!formData.mealIdea.trim()) {
      setPreviewIngredients([]);
      return;
    }
    
    // In a real app, this would call an API
    // Here we'll just do simple text analysis to find potential ingredients
    const text = formData.mealIdea.toLowerCase();
    
    // Simple example ingredients to detect (would be more sophisticated in real app)
    const potentialIngredients = [
      { name: 'milk', allergic: true },
      { name: 'eggs', allergic: true },
      { name: 'peanuts', allergic: true },
      { name: 'wheat', allergic: true },
      { name: 'soy', allergic: false },
      { name: 'chicken', allergic: false },
      { name: 'beef', allergic: false },
      { name: 'rice', allergic: false },
      { name: 'pasta', allergic: true },
      { name: 'tomato', allergic: false },
      { name: 'onion', allergic: false },
      { name: 'garlic', allergic: false }
    ];
    
    const foundIngredients = potentialIngredients.filter(
      ingredient => text.includes(ingredient.name)
    );
    
    setPreviewIngredients(foundIngredients);
  }, [formData.mealIdea]);
  
  // Use effect to trigger analysis when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeMealIdea();
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [formData.mealIdea, analyzeMealIdea]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle person selection
  const handlePersonSelection = (personId: string) => {
    try {
      // Make a local copy of the current selectedPeople array
      const currentSelected = [...formData.selectedPeople];
      
      // Check if the person is already selected
      const isSelected = currentSelected.includes(personId);
      
      // Update the selectedPeople array
      let newSelectedPeople;
      if (isSelected) {
        newSelectedPeople = currentSelected.filter(id => id !== personId);
      } else {
        newSelectedPeople = [...currentSelected, personId];
      }
      
      // Update the form data with the new selectedPeople array
      setFormData({
        ...formData,
        selectedPeople: newSelectedPeople
      });
      
      // Don't automatically close the popover
    } catch (error) {
      console.error('Error selecting person:', error);
    }
  };

  // Handle allergen selection
  const handleAllergenAdd = (allergen: string) => {
    if (!formData.additionalAllergies.includes(allergen)) {
      setFormData((prev) => ({
        ...prev,
        additionalAllergies: [...prev.additionalAllergies, allergen],
        customAllergen: ''
      }));
    }
  };

  // Handle custom allergen addition
  const handleAddCustomAllergen = () => {
    if (formData.customAllergen.trim() && !formData.additionalAllergies.includes(formData.customAllergen)) {
      handleAllergenAdd(formData.customAllergen.trim());
    }
  };

  // Handle allergen removal
  const handleAllergenRemove = (allergen: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalAllergies: prev.additionalAllergies.filter(a => a !== allergen)
    }));
  };

  // Handle next button click
  const handleNextClick = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Navigate to ingredients page
      router.push('/dashboard/meal-planning/recipes/new/ingredients');
    }, 1500);
  };
  
  // Handle recipe import button click
  const handleRecipeImport = () => {
    setRecipeImportOpen(true);
  };
  
  // Handle recipe text parsing
  const parseRecipeText = () => {
    // In a real app, this would use an AI service like Gemini
    // For now, we'll mock the extraction using the provided peanut cake example
    
    // Mock extraction - check if the text contains keywords from the peanut cake
    const hasPeanutCake = recipeText.toLowerCase().includes('peanut') && 
                          recipeText.toLowerCase().includes('cake');
    
    if (recipeText.trim().length < 50) {
      toast.error("Please paste a complete recipe with ingredients and instructions");
      return;
    }
    
    // Set recipe idea based on the pasted text
    setFormData(prev => ({
      ...prev,
      mealIdea: "Peanut Cake - A delicious cake made with ground peanuts, perfect for dessert or special occasions."
    }));
    
    // If it's similar to our peanut cake example, mock the results
    if (hasPeanutCake) {
      // Update allergen detection
      if (!formData.additionalAllergies.includes('Peanut')) {
        setFormData(prev => ({
          ...prev,
          additionalAllergies: [...prev.additionalAllergies, 'Peanut', 'Egg', 'Milk', 'Wheat']
        }));
      }
      
      // Update ingredient preview for the peanut cake
      setPreviewIngredients([
        { name: 'peanuts', allergic: true },
        { name: 'sugar', allergic: false },
        { name: 'eggs', allergic: true },
        { name: 'butter', allergic: false },
        { name: 'flour', allergic: true },
        { name: 'milk', allergic: true },
        { name: 'milk powder', allergic: true },
      ]);
      
      // Close the dialog
      setRecipeImportOpen(false);
      
      // Show success notification
      toast.success("Recipe imported successfully! Allergens were detected.");
    } else {
      // Generic extraction for any other recipe
      // This would typically use a more sophisticated NLP approach
      const lines = recipeText.split('\n');
      const extractedIngredients: Array<{name: string, allergic: boolean}> = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^[\d¼½¾\s\/\.\,]+\s*(?:cup|tbsp|tsp|g|kg|oz|lb|teaspoon|tablespoon)/i)) {
          const ingredientName = trimmedLine.replace(/^[\d¼½¾\s\/\.\,]+\s*(?:cup|tbsp|tsp|g|kg|oz|lb|teaspoon|tablespoon|ml|liter|pound|ounce)s?\s+(?:of)?\s*/i, '');
          
          // Check if this ingredient contains common allergens
          const isAllergic = commonAllergens.some(allergen => 
            ingredientName.toLowerCase().includes(allergen.toLowerCase())
          );
          
          extractedIngredients.push({
            name: ingredientName,
            allergic: isAllergic
          });
          
          // Add detected allergens to the form
          if (isAllergic) {
            const detectedAllergen = commonAllergens.find(allergen => 
              ingredientName.toLowerCase().includes(allergen.toLowerCase())
            );
            
            if (detectedAllergen && !formData.additionalAllergies.includes(detectedAllergen)) {
              setFormData(prev => ({
                ...prev,
                additionalAllergies: [...prev.additionalAllergies, detectedAllergen]
              }));
            }
          }
        }
      });
      
      if (extractedIngredients.length > 0) {
        setPreviewIngredients(extractedIngredients);
        setRecipeImportOpen(false);
        toast.success(`Recipe imported with ${extractedIngredients.length} ingredients detected`);
      } else {
        toast.error("No ingredients could be detected. Please check the format and try again.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Meal Preparation</h1>
          <p className="text-sm text-muted-foreground">Tell us what you're planning to cook</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 gap-2 border-dashed border-gray-300 mt-2 sm:mt-0"
          onClick={handleRecipeImport}
        >
          <FileText className="h-4 w-4" />
          <span>Paste Recipe</span>
        </Button>
      </div>
      
      <Card className="overflow-hidden border-2">
        <CardContent className="p-5">
          <form className="space-y-8">
            {/* Question 1: Servings */}
            <div className="space-y-2">
              <Label htmlFor="servings" className="text-base font-medium">1) How many servings?</Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                placeholder="Number of servings"
                value={formData.servings}
                onChange={handleInputChange}
                className="border-2 h-12"
              />
            </div>
            
            {/* Question 2: Who are you serving - Multi-select Dropdown */}
            <div className="space-y-2">
              <Label className="text-base font-medium">2) Who are you serving?</Label>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between h-12 border-2 font-normal"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {formData.selectedPeople.length === 0 && "Select people..."}
                    {formData.selectedPeople.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {formData.selectedPeople.length <= 2 ? (
                          formData.selectedPeople.map(id => 
                            people.find(p => p.id === id)?.name
                          ).join(', ')
                        ) : (
                          `${formData.selectedPeople.length} people selected`
                        )}
                      </div>
                    )}
                    <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <div className="p-2">
                    <div className="mb-2">
                      <Input 
                        placeholder="Search people..." 
                        className="h-9"
                        onChange={(e) => {
                          // Simple client-side filtering if needed
                        }} 
                      />
                    </div>
                    <div className="max-h-64 overflow-auto space-y-1">
                      {people.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded-sm"
                          onClick={() => {
                            handlePersonSelection(person.id);
                          }}
                        >
                          <div className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            formData.selectedPeople.includes(person.id)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50"
                          )}>
                            {formData.selectedPeople.includes(person.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          {person.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Selected people badges */}
              {formData.selectedPeople.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.selectedPeople.map(personId => {
                    const person = people.find(p => p.id === personId);
                    return (
                      <Badge 
                        key={personId} 
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1 text-sm"
                      >
                        {person?.name}
                        <button
                          type="button"
                          className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center hover:bg-muted"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePersonSelection(personId);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Question 3: Additional Allergies */}
            <div className="space-y-2">
              <Label className="text-base font-medium">3) Any additional allergies?</Label>
              
              {/* Display already added allergies */}
              <div className="flex flex-wrap gap-1 mb-2">
                {formData.additionalAllergies.map(allergen => (
                  <Badge 
                    key={allergen} 
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 text-sm"
                  >
                    {allergen}
                    <button
                      type="button"
                      className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center hover:bg-muted"
                      onClick={() => handleAllergenRemove(allergen)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              {/* Quick allergen selection */}
              <div className="flex items-center gap-2">
                <Input
                  name="customAllergen"
                  placeholder="Type an allergen"
                  value={formData.customAllergen}
                  onChange={handleInputChange}
                  className="border-2 h-12 flex-grow"
                />
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="h-12 px-4 border-2"
                  onClick={handleAddCustomAllergen}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Common allergens for quick addition */}
              <div className="flex flex-wrap gap-1 mt-2">
                {commonAllergens
                  .filter(allergen => !formData.additionalAllergies.includes(allergen))
                  .slice(0, 5) // Show only top 5 for UI simplicity
                  .map(allergen => (
                    <Badge 
                      key={allergen} 
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary px-3 py-1 text-sm"
                      onClick={() => handleAllergenAdd(allergen)}
                    >
                      + {allergen}
                    </Badge>
                  ))
                }
              </div>
              
              {/* AI Allergy Detection Information */}
              <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                <div className="flex items-start mb-2">
                  <div className="flex-shrink-0 text-blue-600 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M16.5 7.5h-9v9h9v-9z" />
                      <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75v2.25H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-blue-800">AI Allergen Detection</h4>
                    <p className="text-xs text-blue-600">Our AI will analyze recipes to identify potential allergens</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="text-xs">High severity</span>
                  </div>
                  <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                    <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                    <span className="text-xs">Medium severity</span>
                  </div>
                  <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    <span className="text-xs">Low severity</span>
                  </div>
                  <div className="flex items-center p-2 bg-white rounded border border-blue-100">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    <span className="text-xs">Mentioned</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Question 4: Meal Idea */}
            <div className="space-y-2">
              <Label htmlFor="mealIdea" className="text-base font-medium">4) What's in your mind?</Label>
              <Textarea
                id="mealIdea"
                name="mealIdea"
                placeholder="Describe your meal idea, ingredients, or preferences..."
                value={formData.mealIdea}
                onChange={handleInputChange}
                className="min-h-24 border-2 resize-none"
                rows={5}
              />
              
              {/* AI Ingredient Analysis */}
              {previewIngredients.length > 0 && (
                <div className="mt-3 rounded-md border border-gray-200 p-3">
                  <div className="flex items-center mb-2">
                    <div className="text-gray-600 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-medium">AI-Detected Ingredients</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {previewIngredients.map((ingredient, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center p-2 rounded ${
                          ingredient.allergic ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        {ingredient.allergic && (
                          <AlertTriangle className="w-3 h-3 text-red-500 mr-2" />
                        )}
                        <span className={`text-xs ${ingredient.allergic ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                          {ingredient.name}
                          {ingredient.allergic && ' (potential allergen)'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Our AI has detected these ingredients in your description. Potential allergens are highlighted.
                  </p>
                </div>
              )}
            </div>
            
            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleNextClick}
                disabled={isLoading}
                className="px-8 py-2"
              >
                {isLoading ? "Processing..." : "Next"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Recipe Import Dialog */}
      <Dialog open={recipeImportOpen} onOpenChange={setRecipeImportOpen}>
        <DialogContent className="sm:max-w-[575px]">
          <DialogHeader>
            <DialogTitle>Import Recipe</DialogTitle>
            <DialogDescription>
              Paste your recipe text and we'll extract the ingredients and other details for you.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="paste" value={activeImportTab} onValueChange={setActiveImportTab} className="mt-2">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="paste">Paste Recipe</TabsTrigger>
              <TabsTrigger value="example">Use Example</TabsTrigger>
            </TabsList>
            
            <TabsContent value="paste" className="mt-4">
              <Textarea 
                placeholder="Paste your complete recipe here, including ingredients and instructions..."
                className="min-h-[200px] resize-none"
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
              />
            </TabsContent>
            
            <TabsContent value="example" className="mt-4">
              <div className="border rounded-md p-3 bg-muted">
                <h3 className="font-medium mb-2">Peanut Cake Example</h3>
                <pre className="text-xs whitespace-pre-wrap bg-background p-2 rounded-sm max-h-[200px] overflow-y-auto">
                  {`Ingredients
  
2 cups peanuts
1/2 cups + 1 tbsp sugar
2 whole eggs
1/2 cup softened butter
1 1/2 cups All purpose flour
1 1/2 tsp baking powder
1/2 tsp bicarbonate of soda
1/2 cup milk
2 tbsp milk powder optional
Instructions
 
Preheat the oven to 180ºc
Add the peanuts to a grinder and grind (don't worry if there are a few big pieces left)
Cream the butter and sugar until pale
Add one egg at a time and mix until smooth
Next add the flour, baking powder and bicarb and mix well until there are no lumps left
Fold in the crushed peanuts and transfer the batter into a greased cake tin
Bake at 180ºc for 20-40 min or until cake is golden brown`}
                </pre>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setRecipeText(`Ingredients
  
2 cups peanuts
1/2 cups + 1 tbsp sugar
2 whole eggs
1/2 cup softened butter
1 1/2 cups All purpose flour
1 1/2 tsp baking powder
1/2 tsp bicarbonate of soda
1/2 cup milk
2 tbsp milk powder optional
Instructions
 
Preheat the oven to 180ºc
Add the peanuts to a grinder and grind (don't worry if there are a few big pieces left)
Cream the butter and sugar until pale
Add one egg at a time and mix until smooth
Next add the flour, baking powder and bicarb and mix well until there are no lumps left
Fold in the crushed peanuts and transfer the batter into a greased cake tin
Bake at 180ºc for 20-40 min or until cake is golden brown`);
                    setActiveImportTab('paste');
                  }}
                >
                  Use This Example
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
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