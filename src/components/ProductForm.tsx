import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onClose: () => void;
}

export default function ProductForm({ onAddProduct, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    costPrice: '',
    salePrice: '',
    category: 'Bebidas Alcoólicas'
  });

  const categories = [
    'Bebidas Alcoólicas',
    'Bebidas Não Alcoólicas',
    'Energéticos',
    'Águas e Sucos',
    'Acessórios',
    'Serviços'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.costPrice && formData.salePrice) {
      onAddProduct({
        name: formData.name,
        costPrice: parseFloat(formData.costPrice),
        salePrice: parseFloat(formData.salePrice),
        category: formData.category
      });
      setFormData({ name: '', costPrice: '', salePrice: '', category: 'Bebidas Alcoólicas' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Novo Produto</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Produto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Cerveja Heineken 600ml"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Custo
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Venda
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {formData.costPrice && formData.salePrice && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                Margem de Lucro: <span className="font-semibold text-green-600">
                  {((parseFloat(formData.salePrice) - parseFloat(formData.costPrice)) / parseFloat(formData.salePrice) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Lucro Unitário: <span className="font-semibold text-green-600">
                  R$ {(parseFloat(formData.salePrice) - parseFloat(formData.costPrice)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}