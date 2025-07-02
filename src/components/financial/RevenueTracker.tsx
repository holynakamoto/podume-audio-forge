
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  subscriptions: number;
  growth: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  amount: number;
  type: 'subscription' | 'one-time';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

export const RevenueTracker: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    subscriptions: 0,
    growth: 0,
    transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe]);

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual Supabase queries
      const mockData: RevenueData = {
        totalRevenue: 12450.00,
        monthlyRevenue: 3200.00,
        subscriptions: 45,
        growth: 12.5,
        transactions: [
          {
            id: '1',
            amount: 7.99,
            type: 'subscription',
            status: 'completed',
            date: '2024-01-15',
            description: 'Monthly Subscription - Premium Plan'
          },
          {
            id: '2',
            amount: 79.99,
            type: 'one-time',
            status: 'completed',
            date: '2024-01-14',
            description: 'Annual Plan Purchase'
          },
          {
            id: '3',
            amount: 29.00,
            type: 'one-time',
            status: 'pending',
            date: '2024-01-13',
            description: 'Voice Cloning Add-on'
          }
        ]
      };
      setRevenueData(mockData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Revenue Dashboard</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period as any)}
              className="text-xs"
            >
              {period}
            </Button>
          ))}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(revenueData.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center mt-2">
              {revenueData.growth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm ${revenueData.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {revenueData.growth > 0 ? '+' : ''}{revenueData.growth}%
              </span>
              <span className="text-sm text-gray-400 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(revenueData.monthlyRevenue)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400 mt-2">Current month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{revenueData.subscriptions}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-sm text-gray-400 mt-2">Recurring customers</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Average Revenue Per User</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(revenueData.totalRevenue / revenueData.subscriptions)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-sm text-gray-400 mt-2">ARPU</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-gray-400 text-sm">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <Badge variant="outline" className="text-gray-300 border-gray-600">
                        {transaction.type}
                      </Badge>
                      <p className="text-white font-bold">{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
