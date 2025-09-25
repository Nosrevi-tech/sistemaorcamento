import React, { useState } from 'react';
import { Calculator, Plus, Minus, Trash2, FileText, CreditCard as Edit, X, Users } from 'lucide-react';
import { Product, BudgetItem, Budget } from '../types';

interface BudgetFormProps {
  products: Product[];
  onSaveBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  editingBudget?: Budget | null;
  onCancelEdit?: () => void;
}

export default function BudgetForm({ products, onSaveBudget, editingBudget, onCancelEdit }: BudgetFormProps) {
  const [clientData, setClientData] = useState(() => {
    if (editingBudget) {
      return {
        clientName: editingBudget.clientName,
        clientEmail: editingBudget.clientEmail,
        clientPhone: editingBudget.clientPhone,
        eventDate: editingBudget.eventDate,
        eventType: editingBudget.eventType,
        notes: editingBudget.notes
      };
    }
    return {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      eventDate: '',
      eventType: '',
      notes: ''
    };
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    return editingBudget ? editingBudget.items : [];
  });

  const addItem = (product: Product) => {
    const existingItem = budgetItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.salePrice,
        costPrice: product.costPrice,
        total: product.salePrice,
        totalCost: product.costPrice
      };
      setBudgetItems([...budgetItems, newItem]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setBudgetItems(budgetItems.filter(item => item.id !== itemId));
    } else {
      setBudgetItems(budgetItems.map(item => 
        item.id === itemId 
          ? {
              ...item,
              quantity: newQuantity,
              total: item.unitPrice * newQuantity,
              totalCost: item.costPrice * newQuantity
            }
          : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== itemId));
  };

  const subtotal = budgetItems.reduce((sum, item) => sum + item.total, 0);
  const totalCost = budgetItems.reduce((sum, item) => sum + item.totalCost, 0);
  const profit = subtotal - totalCost;
  const profitMargin = subtotal > 0 ? (profit / subtotal) * 100 : 0;

  const handleSaveBudget = () => {
    if (!clientData.clientName || budgetItems.length === 0) {
      alert('Preencha o nome do cliente e adicione pelo menos um item');
      return;
    }

    const budget: Omit<Budget, 'id' | 'createdAt'> = {
      ...clientData,
      items: budgetItems,
      subtotal,
      totalCost,
      profit,
      profitMargin
    };

    onSaveBudget(budget);
    
    // Reset form only if not editing
    if (!editingBudget) {
      setClientData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        eventDate: '',
        eventType: '',
        notes: ''
      });
      setBudgetItems([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with edit indicator */}
      {editingBudget && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">
                  Editando Orçamento
                </h3>
                <p className="text-blue-600">
                  Cliente: {editingBudget.clientName}
                </p>
              </div>
            </div>
            {onCancelEdit && (
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Cancelar Edição
              </button>
            )}
          </div>
        </div>
      )}

      {/* Client Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} />
          Dados do Cliente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome do Cliente *"
            value={clientData.clientName}
            onChange={(e) => setClientData({ ...clientData, clientName: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={clientData.clientEmail}
            onChange={(e) => setClientData({ ...clientData, clientEmail: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={clientData.clientPhone}
            onChange={(e) => setClientData({ ...clientData, clientPhone: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            placeholder="Data do Evento"
            value={clientData.eventDate}
            onChange={(e) => setClientData({ ...clientData, eventDate: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Tipo de Evento"
            value={clientData.eventType}
            onChange={(e) => setClientData({ ...clientData, eventType: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Observações"
            value={clientData.notes}
            onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
          />
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Produtos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => addItem(product)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="font-medium text-gray-800">{product.name}</div>
              <div className="text-sm text-gray-600">{product.category}</div>
              <div className="text-lg font-semibold text-blue-600 mt-1">
                R$ {product.salePrice.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Items */}
      {budgetItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Itens do Orçamento</h3>
          <div className="space-y-3">
            {budgetItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{item.productName}</div>
                  <div className="text-sm text-gray-600">
                    R$ {item.unitPrice.toFixed(2)} cada
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="font-semibold text-gray-800">
                    R$ {item.total.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-xl font-bold text-gray-800">
                  R$ {subtotal.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Custo Total</div>
                <div className="text-xl font-bold text-red-600">
                  R$ {totalCost.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Lucro</div>
                <div className="text-xl font-bold text-green-600">
                  R$ {profit.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Margem</div>
                <div className="text-xl font-bold text-green-600">
                  {profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            {editingBudget && onCancelEdit && (
              <button
                onClick={onCancelEdit}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancelar
              </button>
            )}
            <button
              onClick={handleSaveBudget}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calculator size={20} />
              {editingBudget ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}