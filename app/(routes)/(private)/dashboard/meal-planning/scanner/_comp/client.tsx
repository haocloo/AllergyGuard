'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/cn';

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
    replaces: 'Milk',
    description: 'Creamy dairy-free milk alternative made from whole grain oats',
    safeFor: ['Dairy allergies', 'Lactose intolerance', 'Nut allergies'],
    nutritionInfo: 'Rich in fiber, beta-glucans, and fortified with calcium & vitamin D',
    brands: ['Oatly Barista', 'Planet Oat Extra Creamy', 'Califia Farms Protein'],
    tips: 'Great for coffee, cereal, and baking. Choose fortified versions for better nutrition.',
    icon: '🥛',
  },
  {
    name: 'Sunflower Seed Butter',
    replaces: 'Peanut Butter',
    description: 'Creamy spread made from roasted sunflower seeds',
    safeFor: ['Peanut allergies', 'Tree nut allergies', 'Soy allergies'],
    nutritionInfo: 'High in vitamin E, protein, and healthy fats',
    brands: ['SunButter Organic', '88 Acres Dark Chocolate', 'Once Again Sugar Free'],
    tips: 'Perfect for sandwiches and baking. Store upside down to prevent oil separation.',
    icon: '🌻',
  },
  {
    name: 'Cassava Flour',
    replaces: 'Wheat Flour',
    description: 'Grain-free flour that works as a 1:1 replacement in most recipes',
    safeFor: ['Gluten allergies', 'Wheat allergies', 'Grain allergies'],
    nutritionInfo: 'Naturally gluten-free, good source of resistant starch',
    brands: ["Otto's Naturals", "Anthony's Premium", 'Terrasoul Superfoods'],
    tips: 'Best for crispy textures. Add xanthan gum for better binding in baked goods.',
    icon: '🌾',
  },
  {
    name: 'Coconut Aminos',
    replaces: 'Soy Sauce',
    description: 'Soy-free savory sauce made from coconut tree sap',
    safeFor: ['Soy allergies', 'Gluten allergies', 'Wheat allergies'],
    nutritionInfo: '73% less sodium than soy sauce, contains 17 amino acids',
    brands: ['Coconut Secret Raw', 'Big Tree Farms', 'Kevala Organic'],
    tips: 'Use slightly more than soy sauce in recipes as flavor is milder.',
    icon: '🥥',
  },
  {
    name: 'Aquafaba',
    replaces: 'Eggs',
    description: 'Chickpea liquid that works as an egg replacer in many recipes',
    safeFor: ['Egg allergies', 'Dairy allergies'],
    nutritionInfo: 'Low calorie, naturally cholesterol-free',
    brands: ['Any canned chickpea liquid', 'or make your own from dried chickpeas'],
    tips: '3 tablespoons = 1 egg. Best for meringues and baked goods.',
    icon: '🥚',
  },
  {
    name: 'Hemp Milk',
    replaces: 'Milk',
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

// Update affected children with real-life photos
const AFFECTED_CHILDREN = [
  {
    id: 'c1',
    name: 'Alice Brown',
    allergies: ['Peanuts', 'Eggs'],
    photoUrl:
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'c2',
    name: 'Bob Wilson',
    allergies: ['Milk'],
    photoUrl:
      'https://images.unsplash.com/photo-1517252035391-27b6c0d8c5ff?q=80&w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'c3',
    name: 'Emma Davis',
    allergies: ['Shellfish', 'Fish'],
    photoUrl:
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'c4',
    name: 'Michael Chen',
    allergies: ['Peanuts', 'Tree Nuts'],
    photoUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'c5',
    name: 'Sofia Garcia',
    allergies: ['Soy', 'Wheat'],
    photoUrl:
      'https://images.unsplash.com/photo-1521146764736-56c929d59c83?q=80&w=100&h=100&fit=crop&crop=faces',
  },
];

export function ScannerClient() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{
    ingredients: string[];
    affected: typeof AFFECTED_CHILDREN;
  } | null>(null);
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
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    setIsScanning(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate ingredient detection and allergen matching
    const detectedIngredients = DETECTED_INGREDIENTS.filter(() => Math.random() > 0.5);
    const affectedChildren = AFFECTED_CHILDREN.filter((child) =>
      child.allergies.some((allergy) => detectedIngredients.includes(allergy))
    );

    setScanResults({
      ingredients: detectedIngredients,
      affected: affectedChildren,
    });
    setIsScanning(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 h-[calc(100vh-8rem)] overflow-y-auto px-1">
      {/* Instructions Card - More Compact */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Quick Guide</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SCANNING_INSTRUCTIONS.map((instruction) => (
            <div
              key={instruction.title}
              className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
            >
              {instruction.icon}
              <div>
                <h3 className="font-medium text-xs">{instruction.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {instruction.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upload Section - Slightly reduced height */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="relative aspect-[21/9] rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {image ? (
              <img
                src={image}
                alt="Uploaded food"
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload food image</p>
              </div>
            )}
          </div>

          <Button className="w-full" onClick={handleScan} disabled={!image || isScanning}>
            {isScanning ? (
              <>
                <Scan className="h-4 w-4 mr-2 animate-pulse" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="h-4 w-4 mr-2" />
                Scan Ingredients
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Section - Scrollable */}
      <AnimatePresence>
        {scanResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {/* Detected Ingredients - Updated to remove severity */}
            <Card className="p-3">
              <h3 className="text-base font-semibold mb-2">Detected Allergens</h3>
              <div className="flex flex-wrap gap-1.5">
                {scanResults.ingredients.map((ingredient) => {
                  const info = ALLERGEN_INFO[ingredient as keyof typeof ALLERGEN_INFO];
                  return (
                    <Badge
                      key={ingredient}
                      variant={
                        scanResults.affected.some((child) => child.allergies.includes(ingredient))
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="flex items-center gap-1.5"
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

            {/* Affected Children - Updated with better photo handling */}
            {scanResults.affected.length > 0 && (
              <Card className="p-3 border-destructive">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h3 className="text-base font-semibold">Allergy Alerts</h3>
                </div>
                <div className="space-y-2">
                  {scanResults.affected.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                        <img
                          src={child.photoUrl}
                          alt={child.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
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
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Enhanced Alternative Suggestions */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Safe Alternatives</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {FOOD_SUGGESTIONS.filter((suggestion) =>
                  scanResults.ingredients.includes(suggestion.replaces)
                ).map((suggestion) => (
                  <div
                    key={suggestion.name}
                    className="p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-label={suggestion.name}>
                          {suggestion.icon}
                        </span>
                        <div>
                          <h4 className="font-medium">{suggestion.name}</h4>
                          <Badge variant="outline" className="mt-1">
                            Replaces {suggestion.replaces}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>

                      <div className="bg-background/50 rounded-md p-2 space-y-1">
                        <p className="text-xs font-medium text-primary">Nutrition Benefits</p>
                        <p className="text-xs text-muted-foreground">{suggestion.nutritionInfo}</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1">
                          {suggestion.safeFor.map((safety) => (
                            <Badge key={safety} variant="secondary" className="text-[10px]">
                              ✓ {safety}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-primary">Pro Tips</p>
                        <p className="text-xs text-muted-foreground">{suggestion.tips}</p>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Recommended Brands: </span>
                          {suggestion.brands.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
