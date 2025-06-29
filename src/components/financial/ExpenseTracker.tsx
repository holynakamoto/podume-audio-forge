
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  PlusCircle, 
  CreditCard, 
  Server, 
  Mic, 
  Users, 
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  recurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annually';
}

type ExpenseCategory = 'infrastructure' | 'software' | 'marketing' | 'personnel' | 'operations' | 'other';

const categoryIcons = {
  infrastructure: Server,
  software: CreditCard,
  marketing: Users,
  personnel: Users,
  operations: Mic,
  other: DollarSign
};

const categoryColors = {
  infrastructure: 'bg-blue-100 text-blue-800',
  software: 'bg-purple-100 text-purple-800',
  marketing: 'bg-green-100 text-green-800',
  personnel: 'bg-orange-100 text-orange-800',
  operations: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800'
};

export const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'AWS Infrastructure',
      amount: 280.50,
      category: 'infrastructure',
      date: '2024-01-15',
      recurring: true,
      frequency: 'monthly'
    },
    {
      id: '2',
      description: 'Deepgram API Credits',
      amount: 89.99,
      category: 'software',
      date: '2024-01-14',
      recurring: true,
      frequency: 'monthly'
    },
    {
      id: '3',
      description: 'Google Ads Campaign',
      amount: 450.00,
      category: 'marketing',
      date: '2024-01-13',
      recurring: false
    },
    {
      id: '4',
      description: 'Content Creator Fee',
      amount: 500.00,
      category: 'personnel',
      date: '2024-01-12',
      recurring: false
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'operations',
    recurring: false,
    date: new Date().toISOString().split('T')[0]
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyRecurring = expenses
    .filter(expense => expense.recurring)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description!,
      amount: newExpense.amount!,
      category: newExpense.category as ExpenseCategory,
      date: newExpense.date!,
      recurring: newExpense.recurring!,
      frequency: newExpense.recurring ? newExpense.frequency : undefined
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      description: '',
      amount: 0,
      category: 'operations',
      recurring: false,
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddDialogOpen(false);
    toast.success('Expense added successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Expense Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Input
                  id="description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Enter expense description"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-gray-300">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                  placeholder="0.00"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-300">Category</Label>
                <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value as ExpenseCategory})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="personnel">Personnel</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date" className="text-gray-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newExpense.recurring}
                  onChange={(e) => setNewExpense({...newExpense, recurring: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="recurring" className="text-gray-300">Recurring expense</Label>
              </div>
              {newExpense.recurring && (
                <div>
                  <Label htmlFor="frequency" className="text-gray-300">Frequency</Label>
                  <Select value={newExpense.frequency} onValueChange={(value) => setNewExpense({...newExpense, frequency: value as any})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleAddExpense} className="w-full bg-purple-600 hover:bg-purple-700">
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Expenses</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-sm text-gray-400 mt-2">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Monthly Recurring</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(monthlyRecurring)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-sm text-gray-400 mt-2">Fixed costs</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Largest Category</p>
                <p className="text-2xl font-bold text-white">
                  {Object.entries(expensesByCategory)
                    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {formatCurrency(Math.max(...Object.values(expensesByCategory)))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => {
              const IconComponent = categoryIcons[expense.category];
              return (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={categoryColors[expense.category]}>
                          {expense.category}
                        </Badge>
                        {expense.recurring && (
                          <Badge variant="outline" className="text-gray-300 border-gray-600">
                            {expense.frequency}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatCurrency(expense.amount)}</p>
                    <p className="text-gray-400 text-sm">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
