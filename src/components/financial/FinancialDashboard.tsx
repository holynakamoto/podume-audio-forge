
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { RevenueTracker } from './RevenueTracker';
import { BusinessMetrics } from './BusinessMetrics';
import { ExpenseTracker } from './ExpenseTracker';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  BarChart3 
} from 'lucide-react';

export const FinancialDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Financial Operations</h1>
          <p className="text-gray-300">Comprehensive financial management for your podcast business</p>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger 
              value="revenue" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger 
              value="metrics" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueTracker />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <BusinessMetrics />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseTracker />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
                <p className="text-gray-300 mb-4">
                  Detailed financial analytics and forecasting tools coming soon.
                </p>
                <p className="text-sm text-gray-400">
                  This will include cash flow projections, budget planning, and financial reporting.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
