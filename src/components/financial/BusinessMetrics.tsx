
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MetricData {
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  churnRate: number;
  conversionRate: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  growthRate: number;
  burnRate: number;
  runwayMonths: number;
}

export const BusinessMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData>({
    customerAcquisitionCost: 25.50,
    customerLifetimeValue: 180.00,
    churnRate: 5.2,
    conversionRate: 12.8,
    monthlyRecurringRevenue: 3200.00,
    annualRecurringRevenue: 38400.00,
    growthRate: 15.3,
    burnRate: 1200.00,
    runwayMonths: 18
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getHealthColor = (value: number, type: 'churn' | 'conversion' | 'growth') => {
    switch (type) {
      case 'churn':
        return value < 5 ? 'text-green-400' : value < 10 ? 'text-yellow-400' : 'text-red-400';
      case 'conversion':
        return value > 15 ? 'text-green-400' : value > 10 ? 'text-yellow-400' : 'text-red-400';
      case 'growth':
        return value > 10 ? 'text-green-400' : value > 5 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getHealthIcon = (value: number, type: 'churn' | 'conversion' | 'growth') => {
    const isGood = 
      (type === 'churn' && value < 5) ||
      (type === 'conversion' && value > 15) ||
      (type === 'growth' && value > 10);
    
    return isGood ? 
      <ArrowUpRight className="h-4 w-4 text-green-400" /> : 
      <ArrowDownRight className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Business Metrics</h2>
        <Badge variant="outline" className="text-gray-300 border-gray-600">
          Real-time data
        </Badge>
      </div>

      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Customer Metrics</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">CAC</span>
                <span className="text-white font-semibold">{formatCurrency(metrics.customerAcquisitionCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">LTV</span>
                <span className="text-white font-semibold">{formatCurrency(metrics.customerLifetimeValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">LTV:CAC Ratio</span>
                <span className="text-green-400 font-semibold">
                  {(metrics.customerLifetimeValue / metrics.customerAcquisitionCost).toFixed(1)}:1
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Growth Metrics</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Churn Rate</span>
                <div className="flex items-center gap-1">
                  {getHealthIcon(metrics.churnRate, 'churn')}
                  <span className={`font-semibold ${getHealthColor(metrics.churnRate, 'churn')}`}>
                    {formatPercentage(metrics.churnRate)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Conversion Rate</span>
                <div className="flex items-center gap-1">
                  {getHealthIcon(metrics.conversionRate, 'conversion')}
                  <span className={`font-semibold ${getHealthColor(metrics.conversionRate, 'conversion')}`}>
                    {formatPercentage(metrics.conversionRate)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Growth Rate</span>
                <div className="flex items-center gap-1">
                  {getHealthIcon(metrics.growthRate, 'growth')}
                  <span className={`font-semibold ${getHealthColor(metrics.growthRate, 'growth')}`}>
                    {formatPercentage(metrics.growthRate)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-300">Financial Health</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Burn Rate</span>
                <span className="text-white font-semibold">{formatCurrency(metrics.burnRate)}/mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Runway</span>
                <span className="text-orange-400 font-semibold">{metrics.runwayMonths} months</span>
              </div>
              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Runway Progress</span>
                  <span>{Math.round((18 - metrics.runwayMonths) / 18 * 100)}%</span>
                </div>
                <Progress value={(18 - metrics.runwayMonths) / 18 * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(metrics.monthlyRecurringRevenue)}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">+15.3%</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Annual Recurring Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(metrics.annualRecurringRevenue)}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Projected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Growth Target</span>
                  <span className="text-white">20%</span>
                </div>
                <Progress value={metrics.growthRate / 20 * 100} className="h-2" />
                <p className="text-xs text-gray-500">Current: {formatPercentage(metrics.growthRate)}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Churn Reduction Target</span>
                  <span className="text-white">3%</span>
                </div>
                <Progress value={Math.max(0, (10 - metrics.churnRate) / 7 * 100)} className="h-2" />
                <p className="text-xs text-gray-500">Current: {formatPercentage(metrics.churnRate)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Conversion Target</span>
                  <span className="text-white">18%</span>
                </div>
                <Progress value={metrics.conversionRate / 18 * 100} className="h-2" />
                <p className="text-xs text-gray-500">Current: {formatPercentage(metrics.conversionRate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
