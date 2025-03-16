'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, RefreshCw, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMealPlanningStore } from './store';
import { IngredientsList } from './shared/IngredientsList';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function IngredientScanner() {
  const {
    scanImage,
    scannedImage,
    setScannedImage,
    scannedIngredients,
    isLoading,
    clearScanResults,
  } = useMealPlanningStore();

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setScannedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Handle scan button
  const handleScan = async () => {
    if (!scannedImage) return;

    setError(null);
    try {
      await scanImage(scannedImage);
    } catch (err) {
      setError('Failed to scan image. Please try again.');
      console.error(err);
    }
  };

  // Reset the scanner
  const handleReset = () => {
    clearScanResults();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Camera className="w-6 h-6 mr-2" />
            Ingredient Scanner
          </CardTitle>
          <CardDescription>
            Upload an image of food packaging to identify ingredients and potential allergens
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Image Preview */}
            {scannedImage ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={scannedImage}
                  alt="Food package"
                  className="w-full object-contain max-h-[300px]"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleReset}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500 mb-4">
                    Upload an image of the ingredients list from a food package
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>Select Image</Button>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={!scannedImage || isLoading}>
            Reset
          </Button>

          <Button onClick={handleScan} disabled={!scannedImage || isLoading} className="space-x-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : scannedIngredients.length > 0 ? (
              <>
                <Check className="h-4 w-4" />
                <span>Scanned</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                <span>Scan Ingredients</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Results Section */}
      {scannedIngredients.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>Ingredients detected in the image</CardDescription>
          </CardHeader>

          <CardContent>
            <IngredientsList ingredients={scannedIngredients} />
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => {
                // Here we could add navigation to meal planning with these ingredients
                // For now, just log
                console.log('Use these ingredients for meal planning:', scannedIngredients);
              }}
            >
              Use These Ingredients for Meal Planning
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
