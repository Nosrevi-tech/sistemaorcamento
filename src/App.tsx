import React, { useState } from 'react';
import { BarChart3, Package, FileText, Calculator, Menu, X } from 'lucide-react';
import { Product, Budget } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import BudgetForm from './components/BudgetForm';
import BudgetList from './components/BudgetList';
import BudgetPreview from './components/BudgetPreview';
import ConsumptionCalculator from './components/ConsumptionCalculator';

type Tab = 'dashboard' | 'products' | 'budgets' | 'new-budget' | 'consumption';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBudgetPreview, setShowBudgetPreview] = useState<Budget | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [products, setProducts] = useLocalStorage<Product[]>('drinks-products', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('drinks-budgets', []);
  const [consumptionCalculations, setConsumptionCalculations] = useLocalStorage<ConsumptionCalculation[]>('consumption-calculations', []);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData
    };
    setProducts([...products, newProduct]);
  };

  const deleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const saveBudget = (budgetData: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget: Budget = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...budgetData
    };
    setBudgets([...budgets, newBudget]);
    setActiveTab('budgets');
  };

  const updateBudget = (budgetData: Omit<Budget, 'id' | 'createdAt'>) => {
    if (editingBudget) {
      const updatedBudget: Budget = {
        ...editingBudget,
        ...budgetData
      };
      setBudgets(budgets.map(b => b.id === editingBudget.id ? updatedBudget : b));
      setEditingBudget(null);
      setActiveTab('budgets');
    }
  };
  const deleteBudget = (budgetId: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      setBudgets(budgets.filter(b => b.id !== budgetId));
    }
  };

  const editBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setActiveTab('new-budget');
  };
  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'products' as Tab, label: 'Produtos', icon: Package },
    { id: 'new-budget' as Tab, label: 'Novo Orçamento', icon: Calculator },
    { id: 'budgets' as Tab, label: 'Orçamentos', icon: FileText },
    { id: 'consumption' as Tab, label: 'Cálculo de Consumo', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Drinks & Orçamentos</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'new-budget') {
                    setEditingBudget(null);
                  }
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                  ${activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} />
                {tab.id === 'new-budget' && editingBudget ? 'Editar Orçamento' : tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {activeTab === 'new-budget' && editingBudget 
              ? 'Editar Orçamento' 
              : tabs.find(t => t.id === activeTab)?.label
            }
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          {activeTab === 'dashboard' && <Dashboard budgets={budgets} />}
          
          {activeTab === 'products' && (
            <ProductList 
              products={products}
              onAddProduct={() => setShowProductForm(true)}
              onDeleteProduct={deleteProduct}
            />
          )}
          
          {activeTab === 'new-budget' && (
            <BudgetForm 
              products={products}
              onSaveBudget={editingBudget ? updateBudget : saveBudget}
              editingBudget={editingBudget}
              onCancelEdit={() => {
                setEditingBudget(null);
                setActiveTab('budgets');
              }}
            />
          )}
          
          {activeTab === 'budgets' && (
            <BudgetList 
              budgets={budgets}
              onViewBudget={setShowBudgetPreview}
              onDeleteBudget={deleteBudget}
              onEditBudget={editBudget}
            />
          )}
          
          {activeTab === 'consumption' && (
            <ConsumptionCalculator 
              products={products}
              calculations={consumptionCalculations}
              onSaveCalculation={(calculation) => {
                const newCalculation = {
                  id: Date.now().toString(),
                  createdAt: new Date().toISOString(),
                  ...calculation
                };
                setConsumptionCalculations([...consumptionCalculations, newCalculation]);
              }}
              onDeleteCalculation={(id) => {
                if (confirm('Tem certeza que deseja excluir este cálculo?')) {
                  setConsumptionCalculations(consumptionCalculations.filter(c => c.id !== id));
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showProductForm && (
        <ProductForm 
          onAddProduct={addProduct}
          onClose={() => setShowProductForm(false)}
        />
      )}
      
      {showBudgetPreview && (
        <BudgetPreview 
          budget={showBudgetPreview}
          onClose={() => setShowBudgetPreview(null)}
        />
      )}
    </div>
  );
}

export default App;