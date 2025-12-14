
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStats, StatRecord } from '@/utils/localStorage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

const Stats = () => {
  const [stats, setStats] = useState<StatRecord[]>([]);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    // Load stats from localStorage
    const loadedStats = getStats();
    
    // If no stats exist, create some sample data
    if (loadedStats.length === 0) {
      const sampleStats: StatRecord[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        sampleStats.push({
          date: date.toISOString().split('T')[0],
          caloriesConsumed: Math.floor(Math.random() * 1000) + 1000,
          moneySpent: Math.floor(Math.random() * 15) + 5,
          carbonFootprint: Math.floor(Math.random() * 4) + 1,
          mealsCooked: Math.floor(Math.random() * 3) + 1
        });
      }
      
      setStats(sampleStats);
    } else {
      setStats(loadedStats);
    }
  }, []);

  // Calculate totals for summary
  const totalCalories = stats.reduce((sum, day) => sum + day.caloriesConsumed, 0);
  const totalSpent = stats.reduce((sum, day) => sum + day.moneySpent, 0);
  const totalCarbon = stats.reduce((sum, day) => sum + day.carbonFootprint, 0);
  const totalMeals = stats.reduce((sum, day) => sum + day.mealsCooked, 0);
  
  // Format stats for charts
  const formattedStats = stats.map(stat => ({
    ...stat,
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Statistics</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="calories">Calories</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Calories (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCalories.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(totalCalories / 7).toLocaleString()} daily avg
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Money Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  ${(totalSpent / 7).toFixed(2)} daily avg
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Carbon Footprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCarbon.toFixed(1)} kg CO₂</div>
                <p className="text-xs text-muted-foreground">
                  {(totalCarbon / 7).toFixed(1)} kg daily avg
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Meals Cooked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMeals}</div>
                <p className="text-xs text-muted-foreground">
                  {(totalMeals / 7).toFixed(1)} daily avg
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={formattedStats}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="mealsCooked" name="Meals Cooked" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calories">
          <Card>
            <CardHeader>
              <CardTitle>Calorie Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedStats}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="caloriesConsumed"
                    name="Calories"
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="spending">
          <Card>
            <CardHeader>
              <CardTitle>Food Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedStats}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                  <Bar
                    dataKey="moneySpent"
                    name="Money Spent"
                    fill="#fb923c"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Stats;

// demo