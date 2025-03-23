'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Scan,
  AlertTriangle,
  Info,
  ShoppingBag,
  Camera,
  FileWarning,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';

// Import mock data from the correct location
import { familyMembers, childAllergies } from '../../_comp/mock-data';
import { Allergen } from '../../_comp/store';
import { children } from '@/services/dummy-data';

// Allergen icons and info
const ALLERGEN_INFO = {
  Peanuts: { icon: '🥜', description: 'Common in snacks and Asian cuisine' },
  Milk: { icon: '🥛', description: 'Found in dairy products and baked goods' },
  Soy: { icon: '🫘', description: 'Common in Asian foods and processed items' },
  Wheat: { icon: '🌾', description: 'Present in most baked goods and pasta' },
  Eggs: { icon: '🥚', description: 'Used in baked goods and mayonnaise' },
  'Tree Nuts': { icon: '🌰', description: 'Found in desserts and Asian dishes' },
  Fish: { icon: '🐟', description: 'In seafood dishes and fish sauce' },
  Shellfish: { icon: '🦐', description: 'Common in seafood and Asian cuisine' },
  Sesame: { icon: '⚪', description: 'In Asian dishes and bread products' },
  Mustard: { icon: '🟡', description: 'Found in sauces and dressings' },
};

// Enhanced food suggestions with more detailed alternatives
const FOOD_SUGGESTIONS = [
  {
    name: 'Oat Milk',
    replaces: 'Dairy',
    description: 'Creamy dairy-free milk alternative made from whole grain oats',
    safeFor: ['Dairy allergies', 'Lactose intolerance', 'Nut allergies'],
    nutritionInfo: 'Rich in fiber, beta-glucans, and fortified with calcium & vitamin D',
    brands: ['Oatly Barista', 'Planet Oat Extra Creamy', 'Califia Farms Protein'],
    tips: 'Great for coffee, cereal, and baking. Choose fortified versions for better nutrition.',
    icon: '🥛',
  },
  {
    name: 'Sunflower Seed Butter',
    replaces: 'Peanut',
    description: 'Creamy spread made from roasted sunflower seeds',
    safeFor: ['Peanut allergies', 'Tree nut allergies', 'Soy allergies'],
    nutritionInfo: 'High in vitamin E, protein, and healthy fats',
    brands: ['SunButter Organic', '88 Acres Dark Chocolate', 'Once Again Sugar Free'],
    tips: 'Perfect for sandwiches and baking. Store upside down to prevent oil separation.',
    icon: '🌻',
  },
  {
    name: 'Cassava Flour',
    replaces: 'Wheat',
    description: 'Grain-free flour that works as a 1:1 replacement in most recipes',
    safeFor: ['Gluten allergies', 'Wheat allergies', 'Grain allergies'],
    nutritionInfo: 'Naturally gluten-free, good source of resistant starch',
    brands: ["Otto's Naturals", "Anthony's Premium", 'Terrasoul Superfoods'],
    tips: 'Best for crispy textures. Add xanthan gum for better binding in baked goods.',
    icon: '🌾',
  },
  {
    name: 'Coconut Aminos',
    replaces: 'Soy',
    description: 'Soy-free savory sauce made from coconut tree sap',
    safeFor: ['Soy allergies', 'Gluten allergies', 'Wheat allergies'],
    nutritionInfo: '73% less sodium than soy sauce, contains 17 amino acids',
    brands: ['Coconut Secret Raw', 'Big Tree Farms', 'Kevala Organic'],
    tips: 'Use slightly more than soy sauce in recipes as flavor is milder.',
    icon: '🥥',
  },
  {
    name: 'Aquafaba',
    replaces: 'Egg',
    description: 'Chickpea liquid that works as an egg replacer in many recipes',
    safeFor: ['Egg allergies', 'Dairy allergies'],
    nutritionInfo: 'Low calorie, naturally cholesterol-free',
    brands: ['Any canned chickpea liquid', 'or make your own from dried chickpeas'],
    tips: '3 tablespoons = 1 egg. Best for meringues and baked goods.',
    icon: '🥚',
  },
  {
    name: 'Hemp Milk',
    replaces: 'Dairy',
    description: 'Plant-based milk rich in omega-3 fatty acids',
    safeFor: ['Dairy allergies', 'Nut allergies', 'Soy allergies'],
    nutritionInfo: 'Complete protein source, rich in omega-3 and omega-6',
    brands: ['Pacific Foods', 'Living Harvest', 'Manitoba Harvest'],
    tips: 'Shake well before use. Great in smoothies and coffee.',
    icon: '🌱',
  },
];

// Instructions for users
const SCANNING_INSTRUCTIONS = [
  {
    icon: <Camera className="h-5 w-5 text-primary" />,
    title: 'Clear Photo',
    description: 'Take a clear photo of the ingredient list on the packaging',
  },
  {
    icon: <FileWarning className="h-5 w-5 text-primary" />,
    title: 'Ingredient List',
    description: 'Ensure the text is clearly visible and not blurry',
  },
  {
    icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    title: 'Verification',
    description: 'Double-check results with the actual packaging',
  },
  {
    icon: <AlertCircle className="h-5 w-5 text-primary" />,
    title: 'Important Note',
    description: 'This tool is an aid only - always verify with healthcare providers',
  },
];

// Dummy data for detected ingredients and allergens
const DETECTED_INGREDIENTS = [
  'Peanuts',
  'Milk',
  'Soy',
  'Wheat',
  'Eggs',
  'Tree Nuts',
  'Fish',
  'Shellfish',
];

// Convert familyMembers to the format expected by the component
type AffectedChild = {
  id: string;
  name: string;
  allergies: string[];
  photoUrl: string;
};

const AFFECTED_CHILDREN: AffectedChild[] = familyMembers.map((member: {id: string; name: string; allergies: string[]}) => ({
  id: member.id,
  name: member.name,
  allergies: member.allergies,
  photoUrl: children.find(c => c.id === member.id)?.photoUrl || '',
}));

export function ScannerClient() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{
    ingredients: string[];
    affected: typeof AFFECTED_CHILDREN;
  } | null>(null);
  const [resultsSheetOpen, setResultsSheetOpen] = useState(false);
  const [quickGuideCollapsed, setQuickGuideCollapsed] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setScanResults(null);
      setHasScanned(false);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Use a mix of allergens from the childAllergies list
    const detectedIngredients: string[] = childAllergies.map((allergen: Allergen) => allergen.name).slice(0, 4);
    
    // Filter affected children based on the detected ingredients
    const affectedChildren = AFFECTED_CHILDREN.filter((child: AffectedChild) =>
      child.allergies.some((allergy: string) => 
        detectedIngredients.some((ingredient: string) => 
          ingredient.toLowerCase() === allergy.toLowerCase())
      )
    );

    setScanResults({
      ingredients: detectedIngredients,
      affected: affectedChildren,
    });
    setIsScanning(false);
    setHasScanned(true);
    setResultsSheetOpen(true);
  };

  const resetScan = () => {
    setImage(null);
    setHasScanned(false);
    setResultsSheetOpen(false);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Quick Guide Card - Improved UI with collapse functionality */}
      <Card className="mb-4 shadow-sm overflow-hidden transition-all duration-300">
        <div 
          className="flex items-center justify-between p-3 cursor-pointer bg-blue-50 border-b"
          onClick={() => setQuickGuideCollapsed(!quickGuideCollapsed)}
        >
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-medium text-slate-800">Scanning Guide</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              Tips for best results
            </div>
            <ChevronRight className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${quickGuideCollapsed ? 'rotate-90' : 'rotate-270'}`} />
          </div>
        </div>
        
        {!quickGuideCollapsed && (
          <div className="p-3">
            <div className="grid grid-cols-2 gap-3">
              {SCANNING_INSTRUCTIONS.map((instruction) => (
                <div
                  key={instruction.title}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="shrink-0 mt-0.5 bg-blue-100 p-1.5 rounded-full">
                    <span className="flex h-4 w-4 text-blue-500">
                      {instruction.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-800">{instruction.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {instruction.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Capture Area */}
        <div className="relative flex-1 flex flex-col">
          <Card className="flex-1 p-4 flex flex-col justify-between">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full h-full max-h-[50vh] relative rounded-lg overflow-hidden border border-border bg-blue-50 flex items-center justify-center">
                {image ? (
                  <div className="relative h-full w-full">
                    <img
                      src={image}
                      alt="Captured food"
                      className="w-full h-full object-contain"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                      onClick={() => setImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-6">
                      <Camera className="h-10 w-10 text-blue-500 mx-auto mb-4" />
                      <p className="text-sm font-medium text-slate-800 mb-1">Take a photo or upload an image</p>
                      <p className="text-xs text-slate-500 max-w-[250px] mx-auto">For best results, capture a clear image of the ingredient list</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-3">
              {!image ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={triggerCameraCapture}
                    className="h-14"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Take Photo
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={triggerFileUpload}
                    className="h-14"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {!hasScanned ? (
                    <Button 
                      className="w-full h-14" 
                      onClick={handleScan} 
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <Scan className="h-5 w-5 mr-2 animate-pulse" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Scan className="h-5 w-5 mr-2" />
                          Scan Ingredients
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full h-14"
                      variant="outline"
                      onClick={resetScan}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Take a new photo
                    </Button>
                  )}
                  
                  {/* View Previous Results Button - Only show if there are results and sheet is closed */}
                  {scanResults && !resultsSheetOpen && (
                    <Button 
                      variant={hasScanned ? "default" : "outline"}
                      className="w-full" 
                      onClick={() => setResultsSheetOpen(true)}
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      View Scan Results
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Results Bottom Sheet */}
      <Sheet open={resultsSheetOpen} onOpenChange={setResultsSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-xl overflow-hidden">
          <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10">
            <div className="flex justify-between items-center w-full">
              <Button variant="ghost" size="icon" onClick={() => setResultsSheetOpen(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <SheetTitle className="text-center flex-1">Scan Results</SheetTitle>
              <Button variant="ghost" size="icon" className="opacity-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          
          {scanResults && (
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              <div className="p-4 space-y-4">
                {/* Detected Allergens */}
                <Card className="p-3 border-none shadow-sm bg-muted/30">
                  <h3 className="text-base font-semibold mb-2">Detected Allergens</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResults.ingredients.map((ingredient) => {
                      const info = ALLERGEN_INFO[ingredient as keyof typeof ALLERGEN_INFO];
                      return (
                        <Badge
                          key={ingredient}
                          variant={
                            scanResults.affected.some((child) => 
                              child.allergies.includes(ingredient)
                            )
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
                        >
                          <span role="img" aria-label={ingredient}>
                            {info?.icon}
                          </span>
                          {ingredient}
                        </Badge>
                      );
                    })}
                  </div>
                </Card>

                {/* Affected Children */}
                {scanResults.affected.length > 0 && (
                  <Card className="p-4 border-destructive">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <h3 className="text-base font-semibold">Allergy Alerts</h3>
                    </div>
                    <div className="space-y-3">
                      {scanResults.affected.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="h-14 w-14 rounded-full overflow-hidden bg-muted">
                            <img
                              src={child.photoUrl}
                              alt={child.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{child.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {child.allergies
                                .filter((allergy) => scanResults.ingredients.includes(allergy))
                                .map((allergy) => {
                                  const info = ALLERGEN_INFO[allergy as keyof typeof ALLERGEN_INFO];
                                  return (
                                    <Badge key={allergy} variant="destructive" className="text-xs">
                                      {info?.icon} {allergy}
                                    </Badge>
                                  );
                                })}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="rounded-full">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Alternative Suggestions */}
                <Card className="p-4 border-none shadow-sm bg-muted/30">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Safe Alternatives</h3>
                  </div>
                  <div className="space-y-3">
                    {FOOD_SUGGESTIONS.filter((suggestion) =>
                      scanResults.ingredients.includes(suggestion.replaces)
                    ).map((suggestion) => (
                      <Card
                        key={suggestion.name}
                        className="p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl" role="img" aria-label={suggestion.name}>
                            {suggestion.icon}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{suggestion.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                Replaces {suggestion.replaces}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {suggestion.description}
                            </p>
                            
                            <div className="mt-3 space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {suggestion.safeFor.map((safety) => (
                                  <Badge key={safety} variant="secondary" className="text-[10px]">
                                    ✓ {safety}
                                  </Badge>
                                ))}
                              </div>
                              
                              <p className="text-xs text-muted-foreground mt-2">
                                <span className="font-medium">Pro Tip: </span>
                                {suggestion.tips}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
