'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, User, Check } from 'lucide-react';
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
  
  // Form state
  const [formData, setFormData] = useState({
    servings: '',
    selectedPeople: [] as string[],
    additionalAllergies: [] as string[],
    customAllergen: '',
    mealIdea: '',
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle person selection
  const handlePersonSelection = (personId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedPeople.includes(personId);
      
      if (isSelected) {
        return {
          ...prev,
          selectedPeople: prev.selectedPeople.filter(id => id !== personId)
        };
      } else {
        return {
          ...prev,
          selectedPeople: [...prev.selectedPeople, personId]
        };
      }
    });
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
      
      // Navigate to recipe suggestions or appropriate page
      router.push('/dashboard/meal-planning/recipes');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Meal Preparation</h1>
        <p className="text-sm text-muted-foreground">Tell us what you're planning to cook</p>
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
                <PopoverContent className="w-[300px] p-0" side="bottom" align="start">
                  <Command>
                    <CommandInput placeholder="Search people..." className="h-9" />
                    <CommandEmpty>No person found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {people.map((person) => (
                        <CommandItem
                          key={person.id}
                          onSelect={() => {
                            handlePersonSelection(person.id);
                            // Don't close the popover on selection
                          }}
                          className="flex items-center gap-2 cursor-pointer"
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
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
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
    </div>
  );
} 