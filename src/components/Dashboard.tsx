import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Target } from 'lucide-react';
import { Budget } from '../types';

interface DashboardProps {
  budgets: Budget[];
}

export default function Dashboard({ budgets }: DashboardProps) {
  const totalBudgets = budgets.length;
  const totalRevenue = budgets.reduce((sum, budget) => sum + budget.subtotal, 0);
  const totalCosts = budgets.reduce((sum, budget) => sum + budget.totalCost, 0);
  const totalProfit = totalRevenue - totalCosts;
  const averageMargin = budgets.length > 0 
    ? budgets.reduce((sum, budget) => sum + budget.profitMargin, 0) / budgets.length 
    : 0;

  const topProducts = budgets
    .flatMap(budget => budget.items)
    .reduce((acc, item) => {
      const existing = acc.find(p => p.name === item.productName);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.total;
      } else {
        acc.push({
          name: item.productName,
          quantity: item.quantity,
          revenue: item.total
        });
      }
      return acc;
    }, [] as Array<{ name: string; quantity: number; revenue: number }>)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const recentBudgets = [...budgets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orçamentos</p>
              <p className="text-3xl font-bold text-gray-800">{totalBudgets}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-3xl font-bold text-blue-600">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lucro Total</p>
              <p className="text-3xl font-bold text-green-600">R$ {totalProfit.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Margem Média</p>
              <p className="text-3xl font-bold text-green-600">{averageMargin.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.quantity} vendidos</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">R$ {product.revenue.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum produto vendido ainda</p>
          )}
        </div>

        {/* Recent Budgets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orçamentos Recentes</h3>
          {recentBudgets.length > 0 ? (
            <div className="space-y-3">
              {recentBudgets.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{budget.clientName}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">R$ {budget.subtotal.toFixed(2)}</div>
                    <div className="text-xs text-green-600">{budget.profitMargin.toFixed(1)}% margem</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum orçamento criado ainda</p>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo Financeiro</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">R$ {totalRevenue.toFixed(2)}</div>
            <div className="text-gray-600">Receita Bruta</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">R$ {totalCosts.toFixed(2)}</div>
            <div className="text-gray-600">Custos Totais</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">R$ {totalProfit.toFixed(2)}</div>
            <div className="text-gray-600">Lucro Líquido</div>
          </div>
        </div>
        
        {totalRevenue > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Margem de Lucro Geral:</span>
              <span className="text-xl font-bold text-green-600">
                {((totalProfit / totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}