
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash, Utensils } from 'lucide-react';
import { getInventory, saveInventory, InventoryItem } from '@/utils/localStorage';
import { toast } from '@/components/ui/use-toast';

const foodCategories = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Grains & Bread",
  "Canned Goods",
  "Frozen Foods",
  "Condiments",
  "Snacks",
  "Beverages",
  "Baking",
  "Other"
];

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, "id" | "dateAdded">>({
    name: "",
    quantity: 1,
    unit: "item",
    category: "Other",
  });

  useEffect(() => {
    const loadedInventory = getInventory();
    setInventory(loadedInventory);
  }, []);

  const filteredInventory = filter
    ? inventory.filter(item => 
        item.category.toLowerCase() === filter.toLowerCase())
    : inventory;

  const handleSaveItem = () => {
    if (!newItem.name.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    const itemToAdd: InventoryItem = {
      ...newItem,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
    };

    const updatedInventory = [...inventory, itemToAdd];
    setInventory(updatedInventory);
    saveInventory(updatedInventory);
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your inventory.`,
    });
    
    setNewItem({
      name: "",
      quantity: 1,
      unit: "item",
      category: "Other",
    });
    
    setShowAdd(false);
  };

  const handleDeleteItem = (id: string) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    saveInventory(updatedInventory);
    
    toast({
      title: "Item Removed",
      description: "The item has been removed from your inventory.",
    });
  };

  const groupedInventory = filteredInventory.reduce<Record<string, InventoryItem[]>>(
    (groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    },
    {}
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Inventory</h1>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </div>
      
      <div className="mb-6">
        <Select 
          value={filter} 
          onValueChange={setFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {foodCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {inventory.length === 0 ? (
        <div className="text-center py-12">
          <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Your inventory is empty</h3>
          <p className="text-muted-foreground mb-4">
            Add items to your inventory to get started
          </p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInventory).map(([category, items]) => (
            <div key={category}>
              <h2 className="font-medium text-lg mb-2">{category}</h2>
              <div className="space-y-2">
                {items.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                          {item.expiryDate && ` • Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                placeholder="e.g., Chicken Breast"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={newItem.quantity}
                  onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2 flex-1">
                <Label htmlFor="unit">Unit</Label>
                <Select 
                  value={newItem.unit}
                  onValueChange={value => setNewItem({...newItem, unit: value})}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item">item</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="cup">cup</SelectItem>
                    <SelectItem value="tbsp">tbsp</SelectItem>
                    <SelectItem value="tsp">tsp</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newItem.category}
                onValueChange={value => setNewItem({...newItem, category: value})}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {foodCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input 
                id="expiryDate"
                type="date"
                value={newItem.expiryDate || ''}
                onChange={e => setNewItem({...newItem, expiryDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Inventory;
