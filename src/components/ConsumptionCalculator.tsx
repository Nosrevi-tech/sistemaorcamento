import React, { useState } from 'react';
import { Calculator, Users, Plus, Minus, Trash2, Save, Eye, X, Download, FileText } from 'lucide-react';
import { Product, ConsumptionCalculation, ConsumptionProduct, EventSummary } from '../types';

interface ConsumptionCalculatorProps {
  products: Product[];
  calculations: ConsumptionCalculation[];
  onSaveCalculation: (calculation: Omit<ConsumptionCalculation, 'id' | 'createdAt'>) => void;
  onDeleteCalculation: (id: string) => void;
}

export default function ConsumptionCalculator({ 
  products, 
  calculations, 
  onSaveCalculation, 
  onDeleteCalculation 
}: ConsumptionCalculatorProps) {
  const [eventName, setEventName] = useState('');
  const [calculationName, setCalculationName] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<ConsumptionProduct[]>([]);
  const [showCalculations, setShowCalculations] = useState(false);
  const [showEventSummary, setShowEventSummary] = useState<string | null>(null);

  const addProduct = (product: Product) => {
    const existingProduct = selectedProducts.find(p => p.productId === product.id);
    
    if (existingProduct) {
      alert('Produto já adicionado. Ajuste o consumo per capita se necessário.');
      return;
    }

    const newProduct: ConsumptionProduct = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      costPrice: product.costPrice,
      consumptionPerPerson: 0,
      unit: 'kg',
      totalNeeded: 0,
      totalCost: 0
    };

    setSelectedProducts([...selectedProducts, newProduct]);
  };

  const updateProduct = (productId: string, field: keyof ConsumptionProduct, value: any) => {
    setSelectedProducts(selectedProducts.map(product => {
      if (product.id === productId) {
        const updatedProduct = { ...product, [field]: value };
        
        if (field === 'consumptionPerPerson' || field === 'unit') {
          updatedProduct.totalNeeded = updatedProduct.consumptionPerPerson * numberOfPeople;
          updatedProduct.totalCost = updatedProduct.totalNeeded * updatedProduct.costPrice;
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  React.useEffect(() => {
    setSelectedProducts(selectedProducts.map(product => ({
      ...product,
      totalNeeded: product.consumptionPerPerson * numberOfPeople,
      totalCost: product.consumptionPerPerson * numberOfPeople * product.costPrice
    })));
  }, [numberOfPeople]);

  const totalCost = selectedProducts.reduce((sum, product) => sum + product.totalCost, 0);
  const costPerPerson = numberOfPeople > 0 ? totalCost / numberOfPeople : 0;

  const handleSave = () => {
    if (!eventName || !calculationName || numberOfPeople <= 0 || selectedProducts.length === 0) {
      alert('Preencha o nome do evento, nome do cálculo, número de pessoas e adicione pelo menos um produto');
      return;
    }

    const calculation: Omit<ConsumptionCalculation, 'id' | 'createdAt'> = {
      eventName,
      calculationName,
      numberOfPeople,
      products: selectedProducts,
      totalCost
    };

    onSaveCalculation(calculation);
    
    // Reset form
    setCalculationName('');
    setNumberOfPeople(0);
    setSelectedProducts([]);
  };

  // Group calculations by event
  const eventGroups = calculations.reduce((groups, calc) => {
    if (!groups[calc.eventName]) {
      groups[calc.eventName] = [];
    }
    groups[calc.eventName].push(calc);
    return groups;
  }, {} as Record<string, ConsumptionCalculation[]>);

  const generateEventSummary = (eventName: string): EventSummary => {
    const eventCalculations = eventGroups[eventName] || [];
    const totalCost = eventCalculations.reduce((sum, calc) => sum + calc.totalCost, 0);
    const avgPeople = eventCalculations.length > 0 
      ? eventCalculations.reduce((sum, calc) => sum + calc.numberOfPeople, 0) / eventCalculations.length 
      : 0;

    return {
      eventName,
      calculations: eventCalculations,
      totalCost,
      costPerPerson: avgPeople > 0 ? totalCost / avgPeople : 0,
      numberOfPeople: Math.round(avgPeople)
    };
  };

  const downloadEventReport = (eventName: string) => {
    const eventSummary = generateEventSummary(eventName);
    const htmlContent = generateEventReportHTML(eventSummary);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-evento-${eventName.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showEventSummary) {
    const eventSummary = generateEventSummary(showEventSummary);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Resumo do Evento: {showEventSummary}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => downloadEventReport(showEventSummary)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Baixar Relatório
            </button>
            <button
              onClick={() => setShowEventSummary(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <X size={18} />
              Voltar
            </button>
          </div>
        </div>

        <EventSummaryView eventSummary={eventSummary} />
      </div>
    );
  }

  if (showCalculations) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Cálculos por Evento</h3>
          <button
            onClick={() => setShowCalculations(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Novo Cálculo
          </button>
        </div>

        {Object.keys(eventGroups).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Calculator size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cálculo salvo</h3>
            <p className="text-gray-500">Crie seu primeiro cálculo de consumo</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(eventGroups).map(([eventName, eventCalculations]) => {
              const eventTotal = eventCalculations.reduce((sum, calc) => sum + calc.totalCost, 0);
              
              return (
                <div key={eventName} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{eventName}</h4>
                      <p className="text-gray-600">{eventCalculations.length} cálculo(s)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {eventTotal.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Total do Evento</div>
                      </div>
                      <button
                        onClick={() => setShowEventSummary(eventName)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <FileText size={18} />
                        Ver Resumo
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {eventCalculations.map((calculation) => (
                      <div key={calculation.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-800">{calculation.calculationName}</h5>
                            <p className="text-sm text-gray-600">
                              {calculation.numberOfPeople} pessoas • {calculation.products.length} produtos
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-bold text-green-600">R$ {calculation.totalCost.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                R$ {(calculation.totalCost / calculation.numberOfPeople).toFixed(2)}/pessoa
                              </div>
                            </div>
                            <button
                              onClick={() => onDeleteCalculation(calculation.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Calculadora de Consumo</h3>
        <button
          onClick={() => setShowCalculations(true)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Eye size={18} />
          Ver Cálculos por Evento
        </button>
      </div>

      {/* Event Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} />
          Informações do Cálculo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome do Evento"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Nome do Cálculo (ex: Bebidas, Frutas, etc.)"
            value={calculationName}
            onChange={(e) => setCalculationName(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Número de Pessoas"
            value={numberOfPeople || ''}
            onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 0)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
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
              onClick={() => addProduct(product)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="font-medium text-gray-800">{product.name}</div>
              <div className="text-sm text-gray-600">{product.category}</div>
              <div className="text-lg font-semibold text-red-600 mt-1">
                Custo: R$ {product.costPrice.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Products Configuration */}
      {selectedProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurar Consumo</h3>
          <div className="space-y-4">
            {selectedProducts.map((product) => (
              <div key={product.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">{product.productName}</h4>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consumo por Pessoa
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.consumptionPerPerson || ''}
                      onChange={(e) => updateProduct(product.id, 'consumptionPerPerson', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidade
                    </label>
                    <select
                      value={product.unit}
                      onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="kg">Kg</option>
                      <option value="litros">Litros</option>
                      <option value="unidades">Unidades</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Necessário
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                      {product.totalNeeded.toFixed(2)} {product.unit}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custo Total
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-green-600 font-semibold">
                      R$ {product.totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Pessoas</div>
                <div className="text-2xl font-bold text-gray-800">{numberOfPeople}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Custo Total</div>
                <div className="text-2xl font-bold text-red-600">R$ {totalCost.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Custo por Pessoa</div>
                <div className="text-2xl font-bold text-green-600">R$ {costPerPerson.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Salvar Cálculo
          </button>
        </div>
      )}
    </div>
  );
}

function EventSummaryView({ eventSummary }: { eventSummary: EventSummary }) {
  return (
    <div id="event-summary-print" className="space-y-6">
      {/* Event Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{eventSummary.eventName}</h2>
          <p className="text-gray-600">Relatório de Custos do Evento</p>
          <p className="text-sm text-gray-500">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">R$ {eventSummary.totalCost.toFixed(2)}</div>
            <div className="text-gray-600">Custo Total do Evento</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">R$ {eventSummary.costPerPerson.toFixed(2)}</div>
            <div className="text-gray-600">Custo por Pessoa</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-800">{eventSummary.calculations.length}</div>
            <div className="text-gray-600">Cálculos Realizados</div>
          </div>
        </div>
      </div>

      {/* Calculations Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhamento por Categoria</h3>
        <div className="space-y-4">
          {eventSummary.calculations.map((calculation) => (
            <div key={calculation.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">{calculation.calculationName}</h4>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">R$ {calculation.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">{calculation.numberOfPeople} pessoas</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2">Produto</th>
                      <th className="text-center p-2">Consumo/Pessoa</th>
                      <th className="text-center p-2">Total Necessário</th>
                      <th className="text-right p-2">Custo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculation.products.map((product) => (
                      <tr key={product.id} className="border-t">
                        <td className="p-2">{product.productName}</td>
                        <td className="text-center p-2">{product.consumptionPerPerson} {product.unit}</td>
                        <td className="text-center p-2">{product.totalNeeded.toFixed(2)} {product.unit}</td>
                        <td className="text-right p-2 font-semibold">R$ {product.totalCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo Financeiro</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3">Categoria</th>
                <th className="text-right p-3">Custo Total</th>
                <th className="text-right p-3">% do Total</th>
                <th className="text-right p-3">Custo/Pessoa</th>
              </tr>
            </thead>
            <tbody>
              {eventSummary.calculations.map((calculation) => {
                const percentage = (calculation.totalCost / eventSummary.totalCost) * 100;
                const costPerPerson = calculation.totalCost / calculation.numberOfPeople;
                
                return (
                  <tr key={calculation.id} className="border-t">
                    <td className="p-3 font-medium">{calculation.calculationName}</td>
                    <td className="text-right p-3 font-semibold">R$ {calculation.totalCost.toFixed(2)}</td>
                    <td className="text-right p-3">{percentage.toFixed(1)}%</td>
                    <td className="text-right p-3">R$ {costPerPerson.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-50">
                <td className="p-3 font-bold">TOTAL GERAL</td>
                <td className="text-right p-3 font-bold text-green-600">R$ {eventSummary.totalCost.toFixed(2)}</td>
                <td className="text-right p-3 font-bold">100%</td>
                <td className="text-right p-3 font-bold">R$ {eventSummary.costPerPerson.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function generateEventReportHTML(eventSummary: EventSummary): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Custos - ${eventSummary.eventName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1f2937; margin: 0; font-size: 28px; }
        .header p { color: #6b7280; margin: 5px 0; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { padding: 20px; border-radius: 8px; text-align: center; }
        .card-blue { background-color: #eff6ff; border: 2px solid #2563EB; }
        .card-green { background-color: #f0fdf4; border: 2px solid #10b981; }
        .card-gray { background-color: #f9fafb; border: 2px solid #6b7280; }
        .card-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .card-blue .card-value { color: #2563EB; }
        .card-green .card-value { color: #10b981; }
        .card-gray .card-value { color: #1f2937; }
        .card-label { color: #6b7280; font-size: 14px; }
        .section { margin-bottom: 30px; }
        .section h3 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .calculation { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .calculation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .calculation-title { font-size: 18px; font-weight: bold; color: #1f2937; }
        .calculation-cost { font-size: 20px; font-weight: bold; color: #10b981; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: bold; color: #374151; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .summary-table { background-color: #f9fafb; border-radius: 8px; padding: 20px; }
        .total-row { background-color: #e5e7eb; font-weight: bold; }
        .total-row td { border-top: 2px solid #9ca3af; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${eventSummary.eventName}</h1>
          <p>Relatório de Custos do Evento</p>
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="summary-cards">
          <div class="card card-blue">
            <div class="card-value">R$ ${eventSummary.totalCost.toFixed(2)}</div>
            <div class="card-label">Custo Total do Evento</div>
          </div>
          <div class="card card-green">
            <div class="card-value">R$ ${eventSummary.costPerPerson.toFixed(2)}</div>
            <div class="card-label">Custo por Pessoa</div>
          </div>
          <div class="card card-gray">
            <div class="card-value">${eventSummary.calculations.length}</div>
            <div class="card-label">Cálculos Realizados</div>
          </div>
        </div>

        <div class="section">
          <h3>Detalhamento por Categoria</h3>
          ${eventSummary.calculations.map(calculation => `
            <div class="calculation">
              <div class="calculation-header">
                <div class="calculation-title">${calculation.calculationName}</div>
                <div>
                  <div class="calculation-cost">R$ ${calculation.totalCost.toFixed(2)}</div>
                  <div style="font-size: 14px; color: #6b7280;">${calculation.numberOfPeople} pessoas</div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th class="text-center">Consumo/Pessoa</th>
                    <th class="text-center">Total Necessário</th>
                    <th class="text-right">Custo Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${calculation.products.map(product => `
                    <tr>
                      <td>${product.productName}</td>
                      <td class="text-center">${product.consumptionPerPerson} ${product.unit}</td>
                      <td class="text-center">${product.totalNeeded.toFixed(2)} ${product.unit}</td>
                      <td class="text-right">R$ ${product.totalCost.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h3>Resumo Financeiro</h3>
          <div class="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th class="text-right">Custo Total</th>
                  <th class="text-right">% do Total</th>
                  <th class="text-right">Custo/Pessoa</th>
                </tr>
              </thead>
              <tbody>
                ${eventSummary.calculations.map(calculation => {
                  const percentage = (calculation.totalCost / eventSummary.totalCost) * 100;
                  const costPerPerson = calculation.totalCost / calculation.numberOfPeople;
                  return `
                    <tr>
                      <td>${calculation.calculationName}</td>
                      <td class="text-right">R$ ${calculation.totalCost.toFixed(2)}</td>
                      <td class="text-right">${percentage.toFixed(1)}%</td>
                      <td class="text-right">R$ ${costPerPerson.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td><strong>TOTAL GERAL</strong></td>
                  <td class="text-right"><strong>R$ ${eventSummary.totalCost.toFixed(2)}</strong></td>
                  <td class="text-right"><strong>100%</strong></td>
                  <td class="text-right"><strong>R$ ${eventSummary.costPerPerson.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="footer">
          <p>Este relatório foi gerado automaticamente pelo Sistema de Orçamentos para Vendas de Drinks</p>
          <p>Para dúvidas ou esclarecimentos, entre em contato conosco</p>
        </div>
      </div>
    </body>
    </html>
  `;
}