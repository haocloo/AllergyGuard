'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  X,
  User,
  Check,
  AlertTriangle,
  FileText,
  Import,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Import familyMembers from mock-data
import { familyMembers } from '../../../_comp/mock-data';

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
  'Sesame',
];

export function MealPrepFormClient() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New state for recipe import dialog
  const [recipeImportOpen, setRecipeImportOpen] = useState(false);
  const [recipeText, setRecipeText] = useState('');
  const [activeImportTab, setActiveImportTab] = useState('paste');

  // New state for recipe generation
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [recipeGenerationOpen, setRecipeGenerationOpen] = useState(false);
  const [generatedRecipeData, setGeneratedRecipeData] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    servings: '',
    selectedPeople: [] as string[],
    additionalAllergies: [] as string[],
    customAllergen: '',
    mealIdea: '', // Prefilled for demo
  });

  // Add new state for ingredient preview
  const [previewIngredients, setPreviewIngredients] = useState<
    Array<{ name: string; allergic: boolean }>
  >([]);

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
      { name: 'garlic', allergic: false },
    ];

    const foundIngredients = potentialIngredients.filter((ingredient) =>
      text.includes(ingredient.name)
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
        newSelectedPeople = currentSelected.filter((id) => id !== personId);
      } else {
        newSelectedPeople = [...currentSelected, personId];
      }

      // Update the form data with the new selectedPeople array
      setFormData({
        ...formData,
        selectedPeople: newSelectedPeople,
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
        customAllergen: '',
      }));
    }
  };

  // Handle custom allergen addition
  const handleAddCustomAllergen = () => {
    if (
      formData.customAllergen.trim() &&
      !formData.additionalAllergies.includes(formData.customAllergen)
    ) {
      handleAllergenAdd(formData.customAllergen.trim());
    }
  };

  // Handle allergen removal
  const handleAllergenRemove = (allergen: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalAllergies: prev.additionalAllergies.filter((a) => a !== allergen),
    }));
  };

  // Handle next button click
  const handleNextClick = () => {
    // Still check required fields as a safeguard
    if (!areRequiredFieldsFilled()) {
      return;
    }

    setIsLoading(true);

    // Store user selections in localStorage for the ingredients page
    const selectedPeopleAllergies = Array.from(
      new Set(
        formData.selectedPeople
          .map((personId) => familyMembers.find((p) => p.id === personId)?.allergies || [])
          .flat()
      )
    );

    // Combine allergies from selected people and additional allergies
    const allAllergensToAvoid = Array.from(
      new Set([...selectedPeopleAllergies, ...formData.additionalAllergies])
    );

    // Save user selections to localStorage
    localStorage.setItem(
      'userSelections',
      JSON.stringify({
        selectedPeople: formData.selectedPeople,
        allergensToAvoid: allAllergensToAvoid,
        servings: formData.servings,
        mealIdea: formData.mealIdea,
      })
    );

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
    const hasPeanutCake =
      recipeText.toLowerCase().includes('peanut') && recipeText.toLowerCase().includes('cake');

    if (recipeText.trim().length < 50) {
      toast.error('Please paste a complete recipe with ingredients and instructions');
      return;
    }

    // Set recipe idea based on the pasted text
    setFormData((prev) => ({
      ...prev,
      mealIdea:
        'Peanut Cake - A delicious cake made with ground peanuts, perfect for dessert or special occasions.',
    }));

    // If it's similar to our peanut cake example, mock the results
    if (hasPeanutCake) {
      // Update allergen detection
      if (!formData.additionalAllergies.includes('Peanut')) {
        setFormData((prev) => ({
          ...prev,
          additionalAllergies: [...prev.additionalAllergies, 'Peanut', 'Egg', 'Milk', 'Wheat'],
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
      toast.success('Recipe imported successfully! Allergens were detected.');
    } else {
      // Generic extraction for any other recipe
      // This would typically use a more sophisticated NLP approach
      const lines = recipeText.split('\n');
      const extractedIngredients: Array<{ name: string; allergic: boolean }> = [];

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (
          trimmedLine.match(/^[\d¼½¾\s\/\.\,]+\s*(?:cup|tbsp|tsp|g|kg|oz|lb|teaspoon|tablespoon)/i)
        ) {
          const ingredientName = trimmedLine.replace(
            /^[\d¼½¾\s\/\.\,]+\s*(?:cup|tbsp|tsp|g|kg|oz|lb|teaspoon|tablespoon|ml|liter|pound|ounce)s?\s+(?:of)?\s*/i,
            ''
          );

          // Check if this ingredient contains common allergens
          const isAllergic = commonAllergens.some((allergen) =>
            ingredientName.toLowerCase().includes(allergen.toLowerCase())
          );

          extractedIngredients.push({
            name: ingredientName,
            allergic: isAllergic,
          });

          // Add detected allergens to the form
          if (isAllergic) {
            const detectedAllergen = commonAllergens.find((allergen) =>
              ingredientName.toLowerCase().includes(allergen.toLowerCase())
            );

            if (detectedAllergen && !formData.additionalAllergies.includes(detectedAllergen)) {
              setFormData((prev) => ({
                ...prev,
                additionalAllergies: [...prev.additionalAllergies, detectedAllergen],
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
        toast.error('No ingredients could be detected. Please check the format and try again.');
      }
    }
  };

  // Handle recipe generation
  const handleRecipeGeneration = () => {
    // Still check required fields as a safeguard
    if (!areRequiredFieldsFilled()) {
      return;
    }

    // Check if meal idea is provided
    if (!formData.mealIdea.trim()) {
      toast.error('Please describe your meal idea first');
      return;
    }

    // Open the generation dialog
    setRecipeGenerationOpen(true);
  };

  // Start the actual generation process
  const startRecipeGeneration = async () => {
    setGeneratingRecipe(true);

    try {
      // In a real app, this would call an API endpoint
      // For our demo, we'll create a mock recipe based on the form data

      // Get allergies from selected people
      const selectedPeopleAllergies = Array.from(
        new Set(
          formData.selectedPeople
            .map((personId) => familyMembers.find((p) => p.id === personId)?.allergies || [])
            .flat()
        )
      );

      // Combine allergies from selected people and additional allergies
      const allergensToAvoid = Array.from(
        new Set([...selectedPeopleAllergies, ...formData.additionalAllergies])
      );

      // Save user selections to localStorage - similar to handleNextClick
      localStorage.setItem(
        'userSelections',
        JSON.stringify({
          selectedPeople: formData.selectedPeople,
          allergensToAvoid: allergensToAvoid,
          servings: formData.servings,
          mealIdea: formData.mealIdea,
        })
      );

      // Extract some keywords from the meal idea to guide the recipe generation
      const mealIdea = formData.mealIdea.toLowerCase();

      // Special case for Spicy Egg Noodle
      if (mealIdea.includes('spicy egg noodle') || mealIdea.includes('egg noodle')) {
        // Create a specialized recipe for Spicy Egg Noodle
        const spicyEggNoodleRecipe = {
          name: 'Spicy Egg Noodles with Vegetables',
          ingredients: [
            { id: crypto.randomUUID(), name: 'egg noodles', amount: '250', unit: 'g' },
            { id: crypto.randomUUID(), name: 'eggs', amount: '3', unit: 'pcs' },
            { id: crypto.randomUUID(), name: 'red bell pepper', amount: '1', unit: 'pcs' },
            { id: crypto.randomUUID(), name: 'carrots', amount: '2', unit: 'pcs' },
            { id: crypto.randomUUID(), name: 'spring onions', amount: '4', unit: 'pcs' },
            { id: crypto.randomUUID(), name: 'garlic cloves', amount: '3', unit: 'pcs' },
            { id: crypto.randomUUID(), name: 'chili flakes', amount: '1', unit: 'tsp' },
            { id: crypto.randomUUID(), name: 'soy sauce', amount: '3', unit: 'tbsp' },
            { id: crypto.randomUUID(), name: 'sesame oil', amount: '1', unit: 'tbsp' },
            { id: crypto.randomUUID(), name: 'vegetable oil', amount: '2', unit: 'tbsp' },
            { id: crypto.randomUUID(), name: 'salt', amount: '1/2', unit: 'tsp' },
            { id: crypto.randomUUID(), name: 'black pepper', amount: '1/4', unit: 'tsp' },
          ],
          instructions: `1. Bring a large pot of water to a boil. Add the egg noodles and cook according to package instructions until al dente (usually 3-4 minutes). Drain and rinse with cold water to stop the cooking process.

2. While the noodles are cooking, thinly slice the red bell pepper and carrots into matchsticks. Chop the spring onions, separating the white and green parts. Mince the garlic cloves.

3. In a small bowl, beat the eggs with a pinch of salt and pepper.

4. Heat 1 tablespoon of vegetable oil in a large wok or skillet over medium-high heat. Pour in the beaten eggs and cook until set but still moist, about 1-2 minutes. Remove the eggs and set aside.

5. In the same wok, add the remaining vegetable oil. Add the white parts of spring onions and garlic, and stir-fry for 30 seconds until fragrant.

6. Add the carrots and stir-fry for 2 minutes, then add the bell peppers and cook for another minute.

7. Add the cooked noodles to the wok and toss with the vegetables. Add the soy sauce, sesame oil, chili flakes, salt, and pepper. Stir-fry for 2-3 minutes until everything is well combined and heated through.

8. Break the cooked egg into pieces and add back to the wok. Toss gently to combine.

9. Garnish with the green parts of spring onions, additional chili flakes if desired, and serve hot.

10. Enjoy your spicy egg noodles!`,
          allergensToAvoid: allergensToAvoid,
          imageUrl:
            'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        };

        // Store the generated recipe data
        setGeneratedRecipeData(spicyEggNoodleRecipe);

        // Store in localStorage to pass to the ingredients page
        localStorage.setItem('generatedRecipe', JSON.stringify(spicyEggNoodleRecipe));

        // Wait a moment before redirecting (simulating the generation process)
        setTimeout(() => {
          setGeneratingRecipe(false);
          setRecipeGenerationOpen(false);

          // Navigate to the ingredients page
          router.push('/dashboard/meal-planning/recipes/new/ingredients');
        }, 3000);

        return;
      }

      // For other recipes, continue with existing code
      const hasChicken = mealIdea.includes('chicken');
      const hasVegetarian = mealIdea.includes('vegetarian') || mealIdea.includes('vegan');
      const hasDessert =
        mealIdea.includes('dessert') || mealIdea.includes('cake') || mealIdea.includes('sweet');

      // Generate a recipe name based on the meal idea
      let recipeName = 'Custom Recipe';
      if (mealIdea.includes('pasta')) {
        recipeName = hasChicken ? 'Chicken Pasta' : 'Vegetable Pasta';
      } else if (mealIdea.includes('salad')) {
        recipeName = hasChicken ? 'Chicken Salad' : 'Garden Salad';
      } else if (mealIdea.includes('soup')) {
        recipeName = hasChicken ? 'Chicken Soup' : 'Vegetable Soup';
      } else if (hasDessert) {
        recipeName = mealIdea.includes('chocolate') ? 'Chocolate Dessert' : 'Fruit Dessert';
      } else if (hasChicken) {
        recipeName = 'Roasted Chicken Dish';
      } else if (hasVegetarian) {
        recipeName = 'Vegetarian Delight';
      }

      // Generate a list of ingredients that avoid the allergens
      const baseIngredients = [];

      // Add protein
      if (hasChicken && !allergensToAvoid.includes('chicken')) {
        baseIngredients.push({
          id: crypto.randomUUID(),
          name: 'chicken breast',
          amount: '2',
          unit: 'pcs',
        });
      } else if (hasVegetarian || allergensToAvoid.includes('chicken')) {
        if (!allergensToAvoid.includes('tofu')) {
          baseIngredients.push({
            id: crypto.randomUUID(),
            name: 'firm tofu',
            amount: '200',
            unit: 'g',
          });
        } else {
          baseIngredients.push({
            id: crypto.randomUUID(),
            name: 'chickpeas',
            amount: '1',
            unit: 'cup',
          });
        }
      }

      // Add carbs (avoiding wheat if it's an allergen)
      if (allergensToAvoid.includes('wheat')) {
        baseIngredients.push({ id: crypto.randomUUID(), name: 'rice', amount: '1', unit: 'cup' });
      } else if (mealIdea.includes('pasta')) {
        baseIngredients.push({ id: crypto.randomUUID(), name: 'pasta', amount: '200', unit: 'g' });
      } else {
        baseIngredients.push({ id: crypto.randomUUID(), name: 'quinoa', amount: '1', unit: 'cup' });
      }

      // Add vegetables
      baseIngredients.push({ id: crypto.randomUUID(), name: 'carrots', amount: '2', unit: 'pcs' });
      baseIngredients.push({ id: crypto.randomUUID(), name: 'onion', amount: '1', unit: 'pcs' });
      baseIngredients.push({ id: crypto.randomUUID(), name: 'garlic', amount: '2', unit: 'pcs' });

      // Add oil
      baseIngredients.push({
        id: crypto.randomUUID(),
        name: 'olive oil',
        amount: '2',
        unit: 'tbsp',
      });

      // Add seasonings
      baseIngredients.push({ id: crypto.randomUUID(), name: 'salt', amount: '1', unit: 'tsp' });
      baseIngredients.push({
        id: crypto.randomUUID(),
        name: 'black pepper',
        amount: '1/2',
        unit: 'tsp',
      });

      // Generate instructions based on the ingredients
      let instructions = `Here's how to prepare ${recipeName}:\n\n`;

      if (hasChicken) {
        instructions += `1. Season the chicken with salt and pepper.\n`;
        instructions += `2. Heat the olive oil in a pan and cook the chicken until golden brown, about 6-7 minutes per side.\n`;
        instructions += `3. Remove the chicken and set aside.\n\n`;
      } else if (baseIngredients.some((i) => i.name === 'firm tofu')) {
        instructions += `1. Press the tofu to remove excess water, then cut into cubes.\n`;
        instructions += `2. Heat the olive oil in a pan and cook the tofu until golden, about 3-4 minutes per side.\n`;
        instructions += `3. Remove the tofu and set aside.\n\n`;
      }

      instructions += `4. In the same pan, sauté the onions until translucent, about 3 minutes.\n`;
      instructions += `5. Add garlic and cook for another minute until fragrant.\n`;
      instructions += `6. Add the carrots and cook for 5 minutes until slightly softened.\n`;

      if (baseIngredients.some((i) => i.name === 'pasta')) {
        instructions += `7. Meanwhile, cook the pasta according to package instructions. Drain and set aside.\n`;
        instructions += `8. Add the cooked pasta to the vegetable mixture and toss to combine.\n`;
      } else if (baseIngredients.some((i) => i.name === 'rice')) {
        instructions += `7. Meanwhile, cook the rice according to package instructions.\n`;
        instructions += `8. Serve the vegetables over the cooked rice.\n`;
      } else if (baseIngredients.some((i) => i.name === 'quinoa')) {
        instructions += `7. Meanwhile, cook the quinoa according to package instructions.\n`;
        instructions += `8. Serve the vegetables over the cooked quinoa.\n`;
      }

      if (hasChicken) {
        instructions += `9. Return the chicken to the pan and heat through for 2 minutes.\n`;
      } else if (baseIngredients.some((i) => i.name === 'firm tofu')) {
        instructions += `9. Return the tofu to the pan and heat through for 2 minutes.\n`;
      }

      instructions += `10. Serve hot and enjoy your allergen-free meal!`;

      // Prepare the recipe data to be saved in localStorage for the ingredients page
      const generatedRecipe = {
        name: recipeName,
        ingredients: baseIngredients,
        instructions: instructions,
        allergensToAvoid: allergensToAvoid,
      };

      // Store the generated recipe data
      setGeneratedRecipeData(generatedRecipe);

      // Store in localStorage to pass to the ingredients page
      localStorage.setItem('generatedRecipe', JSON.stringify(generatedRecipe));

      // Wait a moment before redirecting (simulating the generation process)
      setTimeout(() => {
        setGeneratingRecipe(false);
        setRecipeGenerationOpen(false);

        // Navigate to the ingredients page
        router.push('/dashboard/meal-planning/recipes/new/ingredients');
      }, 3000);
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
      setGeneratingRecipe(false);
    }
  };

  // Check if required fields are filled
  const areRequiredFieldsFilled = () => {
    const isServingsFilled = formData.servings !== '' && formData.servings !== '0';
    const isPeopleSelected = formData.selectedPeople.length > 0;

    if (!isServingsFilled || !isPeopleSelected) {
      if (!isServingsFilled) {
        toast.error('Please specify the number of servings');
      } else if (!isPeopleSelected) {
        toast.error("Please select at least one person you're serving");
      }
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-primary">Meal Preparation</h1>
          <p className="text-sm text-muted-foreground">Tell us what you're planning to cook</p>
        </div>
      </div>

      <Card className="overflow-hidden border-2">
        <CardContent className="p-5">
          <form className="space-y-8">
            {/* Question 1: Servings */}
            <div className="space-y-2">
              <Label htmlFor="servings" className="text-base font-medium">
                1) How many servings? 
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Required: Enter the number of people this meal is for.
              </p>
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
              <Label className="text-base font-medium">
                2) Who are you serving? 
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Required: Select at least one person you're preparing this meal for.
              </p>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className="w-full justify-between h-12 border-2 font-normal"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {formData.selectedPeople.length === 0 && 'Select people...'}
                    {formData.selectedPeople.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {formData.selectedPeople.length <= 2
                          ? formData.selectedPeople
                              .map((id) => familyMembers.find((p) => p.id === id)?.name)
                              .join(', ')
                          : `${formData.selectedPeople.length} people selected`}
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
                      {familyMembers.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded-sm"
                          onClick={() => {
                            handlePersonSelection(person.id);
                          }}
                        >
                          <div
                            className={cn(
                              'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                              formData.selectedPeople.includes(person.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50'
                            )}
                          >
                            {formData.selectedPeople.includes(person.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span>{person.name}</span>
                            {person.allergies && person.allergies.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Allergies: {person.allergies.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Selected people badges */}
              {formData.selectedPeople.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.selectedPeople.map((personId) => {
                    const person = familyMembers.find((p) => p.id === personId);
                    return (
                      <Badge
                        key={person?.id || personId}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1 text-sm"
                      >
                        <span>{person?.name || personId}</span>
                        {person?.allergies && person.allergies.length > 0 && (
                          <span className="inline-flex items-center ml-1 text-xs text-amber-600 bg-amber-100 px-1 rounded">
                            {person.allergies.length}{' '}
                            {person.allergies.length === 1 ? 'allergy' : 'allergies'}
                          </span>
                        )}
                        <button
                          type="button"
                          className="ml-1 rounded-full hover:bg-gray-200 h-4 w-4 inline-flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
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

              {/* Consolidated allergen box - show all allergies from selected people */}
              {formData.selectedPeople.length > 0 && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="text-blue-500 h-4 w-4 mr-2" />
                    <h4 className="text-sm font-medium text-blue-700">
                      Allergies from selected people:
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {/* Get unique allergies from all selected people */}
                    {Array.from(
                      new Set(
                        formData.selectedPeople
                          .map(
                            (personId) =>
                              familyMembers.find((p) => p.id === personId)?.allergies || []
                          )
                          .flat()
                      )
                    ).map((allergen, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                      >
                        {allergen}
                      </Badge>
                    ))}
                    {/* If no allergies found, show message */}
                    {!formData.selectedPeople.some((personId) => {
                      const person = familyMembers.find((p) => p.id === personId);
                      return person?.allergies && person.allergies.length > 0;
                    }) && (
                      <p className="text-sm text-blue-700">No allergies for selected people.</p>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    These allergies will automatically be avoided in your recipe. Add any additional
                    allergies in the section below.
                  </div>
                </div>
              )}
            </div>

            {/* Question 3: Additional Allergies */}
            <div className="space-y-2">
              <Label className="text-base font-medium">3) Any additional allergies?</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add any allergies not already listed above.
              </p>

              {/* Display already added allergies */}
              <div className="flex flex-wrap gap-1 mb-2">
                {formData.additionalAllergies.map((allergen) => (
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
                  .filter((allergen) => !formData.additionalAllergies.includes(allergen))
                  .slice(0, 5) // Show only top 5 for UI simplicity
                  .map((allergen) => (
                    <Badge
                      key={allergen}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary px-3 py-1 text-sm"
                      onClick={() => handleAllergenAdd(allergen)}
                    >
                      + {allergen}
                    </Badge>
                  ))}
              </div>

              {/* AI Allergy Detection Information */}
              <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                <div className="flex items-start mb-2">
                  <div className="flex-shrink-0 text-blue-600 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M16.5 7.5h-9v9h9v-9z" />
                      <path
                        fillRule="evenodd"
                        d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75v2.25H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-blue-800">AI Allergen Detection</h4>
                    <p className="text-xs text-blue-600">
                      Our AI will analyze recipes to identify potential allergens
                    </p>
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
              <Label className="text-base font-medium">
                4) What kind of meal would you like to make?
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe your meal idea. This helps with recipe suggestions.
              </p>
              <Textarea
                name="mealIdea"
                placeholder="Describe your meal idea"
                value={formData.mealIdea}
                onChange={handleInputChange}
                className="resize-none min-h-[100px]"
              />

              {/* AI Recipe Generation Button - Highlighted */}
              <div className="mt-3">
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex items-center justify-center gap-2 h-12 transition-all"
                  onClick={handleRecipeGeneration}
                  disabled={!areRequiredFieldsFilled()}
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Generate Recipe with AI</span>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Our AI will create a complete recipe based on your meal idea and dietary
                  restrictions
                </p>
              </div>

              {/* Ingredient Preview */}
              {previewIngredients.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Detected Ingredients:</h4>
                    <Badge variant="outline" className="text-xs">
                      {previewIngredients.length} items
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {previewIngredients.map((ing, idx) => (
                      <Badge
                        key={idx}
                        variant={ing.allergic ? 'destructive' : 'secondary'}
                        className="px-2 py-1 text-xs"
                      >
                        {ing.name}
                        {ing.allergic && <AlertTriangle className="ml-1 h-3 w-3" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons Section */}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleNextClick}
                disabled={isLoading || !areRequiredFieldsFilled()}
                className="px-8 py-2"
              >
                {isLoading ? 'Processing...' : 'Next'}
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

          <Tabs
            defaultValue="paste"
            value={activeImportTab}
            onValueChange={setActiveImportTab}
            className="mt-2"
          >
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
            <Button variant="outline" onClick={() => setRecipeImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={parseRecipeText} className="gap-2">
              <Import className="h-4 w-4" />
              <span>Parse Recipe</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Generation Dialog - new code */}
      <Dialog open={recipeGenerationOpen} onOpenChange={setRecipeGenerationOpen}>
        <DialogContent className="sm:max-w-[575px]">
          <DialogHeader>
            <DialogTitle>Generate Allergen-Safe Recipe</DialogTitle>
            <DialogDescription>
              We'll create a recipe based on your meal idea and ensure it avoids all specified
              allergens.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-4">
            <div className="flex flex-col space-y-2 border-l-4 border-primary pl-4 py-2">
              <span className="text-sm font-medium">Meal Idea:</span>
              <p className="text-sm text-muted-foreground">{formData.mealIdea}</p>
            </div>

            {formData.additionalAllergies.length > 0 && (
              <div className="flex flex-col space-y-2 border-l-4 border-red-500 pl-4 py-2">
                <span className="text-sm font-medium">Allergies to Avoid:</span>
                <div className="flex flex-wrap gap-1">
                  {formData.additionalAllergies.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant="destructive"
                      className="bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted rounded-md p-4 text-sm">
              <p>Our AI will:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Generate a complete recipe based on your meal idea</li>
                <li>Ensure all ingredients are safe and free of specified allergens</li>
                <li>Create detailed step-by-step instructions</li>
                <li>Take you directly to the ingredients page with everything filled in</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRecipeGenerationOpen(false)}
              disabled={generatingRecipe}
            >
              Cancel
            </Button>
            <Button onClick={startRecipeGeneration} disabled={generatingRecipe} className="gap-2">
              {generatingRecipe ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Recipe</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
