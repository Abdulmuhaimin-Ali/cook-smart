
// Types
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  category: string;
  dateAdded: string;
}

export interface MealPreference {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cuisine: string;
  dietConcerns: string[];
  cookingTime: number;
  servings: number;
  targetCalories: number;
}

export interface StatRecord {
  date: string;
  caloriesConsumed: number;
  moneySpent: number;
  carbonFootprint: number;
  mealsCooked: number;
}

// Keys
const INVENTORY_KEY = 'cooksmart_inventory';
const MEAL_PREFERENCES_KEY = 'cooksmart_meal_preferences';
const STATS_KEY = 'cooksmart_stats';

// Inventory Functions
export const getInventory = (): InventoryItem[] => {
  const items = localStorage.getItem(INVENTORY_KEY);
  return items ? JSON.parse(items) : [];
};

export const saveInventory = (inventory: InventoryItem[]): void => {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
};

export const addInventoryItem = (item: InventoryItem): void => {
  const inventory = getInventory();
  inventory.push(item);
  saveInventory(inventory);
};

export const updateInventoryItem = (item: InventoryItem): void => {
  const inventory = getInventory();
  const index = inventory.findIndex(i => i.id === item.id);
  if (index !== -1) {
    inventory[index] = item;
    saveInventory(inventory);
  }
};

export const removeInventoryItem = (id: string): void => {
  const inventory = getInventory();
  const updatedInventory = inventory.filter(item => item.id !== id);
  saveInventory(updatedInventory);
};

// Meal Preferences Functions
export const getMealPreferences = (): MealPreference => {
  const preferences = localStorage.getItem(MEAL_PREFERENCES_KEY);
  return preferences ? JSON.parse(preferences) : {
    mealType: 'dinner',
    cuisine: '',
    dietConcerns: [],
    cookingTime: 30,
    servings: 2,
    targetCalories: 600
  };
};

export const saveMealPreferences = (preferences: MealPreference): void => {
  localStorage.setItem(MEAL_PREFERENCES_KEY, JSON.stringify(preferences));
};

// Stats Functions
export const getStats = (): StatRecord[] => {
  const stats = localStorage.getItem(STATS_KEY);
  return stats ? JSON.parse(stats) : [];
};

export const saveStats = (stats: StatRecord[]): void => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const addStatRecord = (record: StatRecord): void => {
  const stats = getStats();
  stats.push(record);
  saveStats(stats);
};

export const getTodayStats = (): StatRecord | undefined => {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  return stats.find(record => record.date === today);
};

export const updateTodayStats = (updates: Partial<StatRecord>): void => {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  const index = stats.findIndex(record => record.date === today);
  
  if (index !== -1) {
    stats[index] = { ...stats[index], ...updates };
  } else {
    stats.push({
      date: today,
      caloriesConsumed: 0,
      moneySpent: 0,
      carbonFootprint: 0,
      mealsCooked: 0,
      ...updates
    });
  }
  
  saveStats(stats);
};
