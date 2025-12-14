
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button'; 
import { Scan, Plus, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<string[]>([]);

  
  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      // Mock scanned items
      const mockItems = [
        'Chicken Breast (500g)',
        'Brown Rice (1kg)',
        'Broccoli (300g)',
        'Olive Oil (500ml)',
        'Sweet Potatoes (1kg)',
        'Apples (2)',
        'Peanuts (200g)',
        'Chicken Breast (500g)',
        'Brown Rice (1kg)',
        'Broccoli (300g)',
        'Olive Oil (500ml)',
        'Sweet Potatoes (1kg)',
        'Apples (2)',
        'Peanuts (200g)'
      ];
      setScannedItems(mockItems);
      toast({
        title: "Receipt Scanned Successfully",
        description: `Found ${mockItems.length} items in your receipt.`,
      });
    }, 2000);
  };
  
  const addToInventory = () => {
    // In a real app, we would process these items and add them to inventory
    toast({
      title: "Items Added to Inventory",
      description: `${scannedItems.length} items have been added to your inventory.`,
      variant: "default",
    });
    setScannedItems([]);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-2 text-primary">CookSmart</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Scan your receipts to update your food inventory
        </p>
        
        <div className="w-full max-w-md aspect-video bg-accent rounded-lg mb-8 flex items-center justify-center">
          {isScanning ? (
            <div className="animate-pulse flex flex-col items-center">
              <Scan size={64} className="text-secondary mb-4" />
              <p>Scanning Receipt...</p>
            </div>
          ) : scannedItems.length > 0 ? (
            <Card className="w-full">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <Check size={16} className="text-primary mr-2" />
                  Scanned Items
                </h3>
                <ul className="text-sm space-y-1">
                  {scannedItems.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item}</span>
                      <Plus size={16} className="text-primary" />
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-4" 
                  onClick={addToInventory}
                >
                  Add All to Inventory
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground">
              <Scan size={48} className="mx-auto mb-2" />
              <p>No receipt detected</p>
              <p className="text-xs">Position your receipt in the frame</p>
            </div>
          )}
        </div>
        
        <Button 
          size="lg" 
          className="gap-2" 
          onClick={handleScan}
          disabled={isScanning || scannedItems.length > 0}
        >
          <Scan size={20} />
          Scan Receipt
        </Button>
        
        <p className="text-xs text-muted-foreground mt-8 max-w-xs text-center">
          CookSmart uses your camera to scan and analyze grocery receipts to automatically update your food inventory.
        </p>
      </div>
    </Layout>
  );
};

export default Index;
