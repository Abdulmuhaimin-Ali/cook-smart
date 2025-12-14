import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  MealPreference,
  saveMealPreferences,
  getMealPreferences,
} from "@/utils/localStorage";

const dietOptions = [
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "glutenFree", label: "Gluten-Free" },
  { id: "dairyFree", label: "Dairy-Free" },
  { id: "lowCarb", label: "Low-Carb" },
  { id: "keto", label: "Keto" },
];

const cuisineOptions = [
  "Italian",
  "Mexican",
  "Asian",
  "Mediterranean",
  "American",
  "Indian",
  "French",
  "Middle Eastern",
];

const MealGenerator = () => {
  const [preferences, setPreferences] = useState<MealPreference>(
    getMealPreferences()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<null | {
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    calories: number;
  }>(null);

  const handleDietChange = (id: string, checked: boolean) => {
    setPreferences((prev) => {
      const currentDiets = [...prev.dietConcerns];
      if (checked) {
        return { ...prev, dietConcerns: [...currentDiets, id] };
      } else {
        return { ...prev, dietConcerns: currentDiets.filter((d) => d !== id) };
      }
    });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    saveMealPreferences(preferences);
    setGeneratedMeal(null);

    const queryParams = new URLSearchParams({
      mealType: preferences.mealType,
      cuisine: preferences.cuisine,
      dietConcerns: preferences.dietConcerns.join(","),
      cookingTime: preferences.cookingTime.toString(),
      servings: preferences.servings.toString(),
      targetCalories: preferences.targetCalories.toString(),
    });

    const url = `http://localhost:3001/recipeStream?${queryParams.toString()}`;
    const eventSource = new EventSource(url);

    let fullText = "";

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "chunk") {
        fullText += data.chunk;
      }

      if (data.action === "close") {
        eventSource.close();

        const lines = fullText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const title = lines[0];
        const ingredients: string[] = [];
        const instructions: string[] = [];

        let parsingIngredients = false;
        let parsingInstructions = false;

        for (let line of lines.slice(1)) {
          if (line.toLowerCase().includes("ingredients")) {
            parsingIngredients = true;
            parsingInstructions = false;
            continue;
          }
          if (line.toLowerCase().includes("instructions")) {
            parsingInstructions = true;
            parsingIngredients = false;
            continue;
          }
          if (parsingIngredients)
            ingredients.push(line.replace(/^[-*]\s*/, ""));
          if (parsingInstructions)
            instructions.push(line.replace(/^\d+[\).]?\s*/, ""));
        }

        setGeneratedMeal({
          title,
          ingredients,
          instructions,
          prepTime: preferences.cookingTime,
          calories: preferences.targetCalories,
        });

        setIsGenerating(false);

        toast({
          title: "Meal Generated!",
          description: "Based on your preferences and inventory.",
        });
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
      setIsGenerating(false);
      toast({
        title: "Something went wrong",
        description: "Could not generate a recipe.",
        variant: "destructive",
      });
    };
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
              onValueChange={(
                value: "breakfast" | "lunch" | "dinner" | "snack"
              ) => setPreferences({ ...preferences, mealType: value })}
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
                setPreferences({ ...preferences, cuisine: value })
              }
            >
              <SelectTrigger id="cuisine">
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Cuisine</SelectItem>
                {cuisineOptions.map((cuisine) => (
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
              {dietOptions.map((option) => (
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
                setPreferences({ ...preferences, cookingTime: value[0] })
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
                setPreferences({
                  ...preferences,
                  servings: parseInt(e.target.value) || 1,
                })
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
                setPreferences({ ...preferences, targetCalories: value[0] })
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
            <h2 className="text-2xl font-medium mb-4 text-primary">
              {generatedMeal.title}
            </h2>

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

// demo
