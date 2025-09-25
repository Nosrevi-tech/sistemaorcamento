import React from 'react';
import { FileText, Eye, Trash2, Calendar, User, DollarSign, Edit } from 'lucide-react';
import { Budget } from '../types';

interface BudgetListProps {
  budgets: Budget[];
  onViewBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: string) => void;
  onEditBudget: (budget: Budget) => void;
}

export default function BudgetList({ budgets, onViewBudget, onDeleteBudget, onEditBudget }: BudgetListProps) {
  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento criado</h3>
        <p className="text-gray-500">Crie seu primeiro orçamento na aba "Novo Orçamento"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Orçamentos Salvos</h3>
      
      <div className="grid gap-4">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{budget.clientName}</h4>
                    {budget.eventType && (
                      <p className="text-sm text-gray-600">{budget.eventType}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  {budget.eventDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      {new Date(budget.eventDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText size={16} />
                    {budget.items.length} itens
                  </div>
                  
                  <div className="flex items-center gap-2 text-green-600">
                    <DollarSign size={16} />
                    R$ {budget.subtotal.toFixed(2)}
                  </div>
                  
                  <div className="text-green-600 font-medium">
                    Margem: {budget.profitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEditBudget(budget)}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Editar orçamento"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onViewBudget(budget)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Visualizar orçamento"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onDeleteBudget(budget.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir orçamento"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Receita</div>
                  <div className="font-semibold text-blue-600">R$ {budget.subtotal.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Custo</div>
                  <div className="font-semibold text-red-600">R$ {budget.totalCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Lucro</div>
                  <div className="font-semibold text-green-600">R$ {budget.profit.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}