
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { MealPreference, saveMealPreferences, getMealPreferences } from '@/utils/localStorage';

const dietOptions = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'glutenFree', label: 'Gluten-Free' },
  { id: 'dairyFree', label: 'Dairy-Free' },
  { id: 'lowCarb', label: 'Low-Carb' },
  { id: 'keto', label: 'Keto' },
];

const cuisineOptions = [
  'Italian', 'Mexican', 'Asian', 'Mediterranean', 
  'American', 'Indian', 'French', 'Middle Eastern'
];

const MealGenerator = () => {
  const [preferences, setPreferences] = useState<MealPreference>(getMealPreferences());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<null | {
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    calories: number;
  }>(null);

  const handleDietChange = (id: string, checked: boolean) => {
    setPreferences(prev => {
      const currentDiets = [...prev.dietConcerns];
      if (checked) {
        return { ...prev, dietConcerns: [...currentDiets, id] };
      } else {
        return { ...prev, dietConcerns: currentDiets.filter(d => d !== id) };
      }
    });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    saveMealPreferences(preferences);
    
    // Simulate API call to generate meal
    setTimeout(() => {
      setIsGenerating(false);
      
      // Mock response data
      const meal = {
        title: "Herb-Roasted Chicken with Seasonal Vegetables",
        ingredients: [
          "2 boneless chicken breasts",
          "2 cups mixed vegetables (carrots, broccoli, bell peppers)",
          "2 tbsp olive oil",
          "2 cloves garlic, minced",
          "1 tsp dried herbs (rosemary, thyme)",
          "Salt and pepper to taste"
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Season chicken breasts with salt, pepper, and dried herbs.",
          "Heat olive oil in an oven-safe skillet over medium-high heat.",
          "Sear chicken breasts for 2-3 minutes on each side until golden.",
          "Add minced garlic and vegetables to the skillet, stirring to coat with oil.",
          "Transfer skillet to oven and roast for 15-20 minutes until chicken is cooked through.",
          "Let rest for 5 minutes before serving."
        ],
        prepTime: 30,
        calories: 450
      };
      
      setGeneratedMeal(meal);
      toast({
        title: "Meal Generated!",
        description: "Based on your preferences and inventory.",
      });
    }, 1500);
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Meal Generator</h1>
      
      {!generatedMeal ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select 
              value={preferences.mealType} 
              onValueChange={(value: 'breakfast' | 'lunch' | 'dinner' | 'snack') => 
                setPreferences({...preferences, mealType: value})
              }
            >
              <SelectTrigger id="mealType">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine Preference</Label>
            <Select 
              value={preferences.cuisine} 
              onValueChange={(value) => 
                setPreferences({...preferences, cuisine: value})
              }
            >
              <SelectTrigger id="cuisine">
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Cuisine</SelectItem>
                {cuisineOptions.map(cuisine => (
                  <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Dietary Concerns</Label>
            <div className="space-y-2">
              {dietOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id} 
                    checked={preferences.dietConcerns.includes(option.id)}
                    onCheckedChange={(checked) => 
                      handleDietChange(option.id, checked as boolean)
                    }
                  />
                  <label htmlFor={option.id} className="text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="cookingTime">Cooking Time</Label>
              <span className="text-sm text-muted-foreground">
                {preferences.cookingTime} minutes
              </span>
            </div>
            <Slider 
              id="cookingTime"
              value={[preferences.cookingTime]} 
              min={10} 
              max={120} 
              step={5}
              onValueChange={(value) => 
                setPreferences({...preferences, cookingTime: value[0]})
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="servings">Number of Servings</Label>
            <Input 
              id="servings"
              type="number" 
              min={1} 
              max={12}
              value={preferences.servings} 
              onChange={(e) => 
                setPreferences({...preferences, servings: parseInt(e.target.value) || 1})
              }
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="calories">Target Calories per Serving</Label>
              <span className="text-sm text-muted-foreground">
                {preferences.targetCalories} calories
              </span>
            </div>
            <Slider 
              id="calories"
              value={[preferences.targetCalories]} 
              min={200} 
              max={1200} 
              step={50}
              onValueChange={(value) => 
                setPreferences({...preferences, targetCalories: value[0]})
              }
            />
          </div>
          
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Meal"}
          </Button>
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-medium mb-4 text-primary">{generatedMeal.title}</h2>
            
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <div>Prep time: {generatedMeal.prepTime} mins</div>
              <div>{generatedMeal.calories} calories/serving</div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Ingredients:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {generatedMeal.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Instructions:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                {generatedMeal.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
            
            <Button 
              className="w-full mt-6" 
              variant="outline"
              onClick={() => setGeneratedMeal(null)}
            >
              Generate Another Meal
            </Button>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default MealGenerator;
