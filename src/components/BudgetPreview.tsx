import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Budget } from '../types';

interface BudgetPreviewProps {
  budget: Budget;
  onClose: () => void;
}

export default function BudgetPreview({ budget, onClose }: BudgetPreviewProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('budget-print-area');
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleDownload = () => {
    const content = generateBudgetHTML(budget);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamento-${budget.clientName.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">
            Orçamento - {budget.clientName}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Printer size={18} />
              Imprimir
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div id="budget-print-area" className="p-8">
            <BudgetDocument budget={budget} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetDocument({ budget }: { budget: Budget }) {
  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="text-center mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ORÇAMENTO</h1>
        <p className="text-gray-600">Drinks & Eventos</p>
        <div className="text-sm text-gray-500 mt-2">
          Data: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Dados do Cliente</h3>
          <div className="space-y-2">
            <div><span className="font-medium">Nome:</span> {budget.clientName}</div>
            {budget.clientEmail && (
              <div><span className="font-medium">E-mail:</span> {budget.clientEmail}</div>
            )}
            {budget.clientPhone && (
              <div><span className="font-medium">Telefone:</span> {budget.clientPhone}</div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Dados do Evento</h3>
          <div className="space-y-2">
            {budget.eventType && (
              <div><span className="font-medium">Tipo:</span> {budget.eventType}</div>
            )}
            {budget.eventDate && (
              <div><span className="font-medium">Data:</span> {new Date(budget.eventDate).toLocaleDateString('pt-BR')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Itens do Orçamento</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left">Produto</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Qtd</th>
                <th className="border border-gray-300 px-4 py-3 text-right">Valor Unit.</th>
                <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {budget.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3">{item.productName}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    R$ {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                    R$ {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                Total: R$ {budget.subtotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {budget.notes && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Observações</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{budget.notes}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-6 text-center text-sm text-gray-600">
        <p>Este orçamento tem validade de 30 dias.</p>
        <p>Entre em contato para esclarecer dúvidas ou fechar o pedido.</p>
      </div>
    </div>
  );
}

function generateBudgetHTML(budget: Budget): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Orçamento - ${budget.clientName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .client-info { display: flex; gap: 50px; margin-bottom: 30px; }
        .client-info div { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; }
        .total { text-align: right; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
        .footer { text-align: center; border-top: 1px solid #ddd; padding-top: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ORÇAMENTO</h1>
          <p>Drinks & Eventos</p>
          <small>Data: ${new Date().toLocaleDateString('pt-BR')}</small>
        </div>
        
        <div class="client-info">
          <div>
            <h3>Dados do Cliente</h3>
            <p><strong>Nome:</strong> ${budget.clientName}</p>
            ${budget.clientEmail ? `<p><strong>E-mail:</strong> ${budget.clientEmail}</p>` : ''}
            ${budget.clientPhone ? `<p><strong>Telefone:</strong> ${budget.clientPhone}</p>` : ''}
          </div>
          <div>
            <h3>Dados do Evento</h3>
            ${budget.eventType ? `<p><strong>Tipo:</strong> ${budget.eventType}</p>` : ''}
            ${budget.eventDate ? `<p><strong>Data:</strong> ${new Date(budget.eventDate).toLocaleDateString('pt-BR')}</p>` : ''}
            ${budget.numberOfPeople ? `<p><strong>Pessoas:</strong> ${budget.numberOfPeople}</p>` : ''}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              ${budget.numberOfPeople ? '<th>Consumo/Pessoa</th>' : ''}
              <th>Qtd</th>
              <th>Valor Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${budget.items.map(item => `
              <tr>
                <td>
                  ${item.productName}
                  ${item.isCalculatedFromConsumption ? '<br><small style="color: #10b981;">📊 Calculado por consumo</small>' : ''}
                </td>
                ${budget.numberOfPeople ? `<td>${item.isCalculatedFromConsumption && item.consumptionPerPerson ? `${item.consumptionPerPerson} ${item.unit}` : '-'}</td>` : ''}
                <td>${item.isCalculatedFromConsumption ? `${item.quantity.toFixed(2)} ${item.unit}` : item.quantity}</td>
                <td>R$ ${item.unitPrice.toFixed(2)}</td>
                <td>R$ ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${budget.numberOfPeople && budget.items.some(item => item.isCalculatedFromConsumption) ? `
          <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px;">
            <h3>Resumo de Consumo</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${budget.numberOfPeople}</div>
                <div style="color: #6b7280;">Pessoas no Evento</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #2563EB;">R$ ${(budget.subtotal / budget.numberOfPeople).toFixed(2)}</div>
                <div style="color: #6b7280;">Custo por Pessoa</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${budget.items.filter(item => item.isCalculatedFromConsumption).length}</div>
                <div style="color: #6b7280;">Itens Calculados</div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <div class="total">
          Total: R$ ${budget.subtotal.toFixed(2)}
          ${budget.numberOfPeople ? `<br><small>R$ ${(budget.subtotal / budget.numberOfPeople).toFixed(2)} por pessoa</small>` : ''}
        </div>
        
        ${budget.notes ? `
          <div>
            <h3>Observações</h3>
            <p>${budget.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Este orçamento tem validade de 30 dias.</p>
          <p>Entre em contato para esclarecer dúvidas ou fechar o pedido.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}