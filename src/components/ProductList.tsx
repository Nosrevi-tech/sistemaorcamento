import React from 'react';
import { Package, Edit, Trash2, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onAddProduct: () => void;
  onDeleteProduct: (productId: string) => void;
}

export default function ProductList({ products, onAddProduct, onDeleteProduct }: ProductListProps) {
  const categories = [...new Set(products.map(p => p.category))];

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
        <p className="text-gray-500 mb-4">Adicione produtos para começar a criar orçamentos</p>
        <button
          onClick={onAddProduct}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <Plus size={18} />
          Adicionar Primeiro Produto
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Produtos Cadastrados</h3>
        <button
          onClick={onAddProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {categories.map((category) => {
        const categoryProducts = products.filter(p => p.category === category);
        
        return (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4">{category}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProducts.map((product) => {
                const profitMargin = ((product.salePrice - product.costPrice) / product.salePrice) * 100;
                
                return (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-medium text-gray-800">{product.name}</h5>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Custo:</span>
                        <span className="text-red-600 font-medium">R$ {product.costPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Venda:</span>
                        <span className="text-blue-600 font-medium">R$ {product.salePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lucro:</span>
                        <span className="text-green-600 font-medium">R$ {(product.salePrice - product.costPrice).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Margem:</span>
                        <span className="text-green-600 font-medium">{profitMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}