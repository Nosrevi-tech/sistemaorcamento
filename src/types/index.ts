export interface Product {
  id: string;
  name: string;
  costPrice: number;
  salePrice: number;
  category: string;
}

export interface BudgetItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  total: number;
  totalCost: number;
  consumptionPerPerson?: number;
  unit?: 'kg' | 'litros' | 'unidades';
  isCalculatedFromConsumption?: boolean;
}

export interface Budget {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventType: string;
  numberOfPeople?: number;
  items: BudgetItem[];
  subtotal: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  createdAt: string;
  notes: string;
}

export interface ConsumptionCalculation {
  id: string;
  eventName: string;
  calculationName: string;
  numberOfPeople: number;
  products: ConsumptionProduct[];
  totalCost: number;
  createdAt: string;
}

export interface EventSummary {
  eventName: string;
  calculations: ConsumptionCalculation[];
  totalCost: number;
  costPerPerson: number;
  numberOfPeople: number;
}

export interface ConsumptionProduct {
  id: string;
  productId: string;
  productName: string;
  costPrice: number;
  consumptionPerPerson: number; // quantidade que uma pessoa consome
  unit: 'kg' | 'litros' | 'unidades'; // unidade de medida
  totalNeeded: number; // quantidade total necessária
  totalCost: number; // custo total para este produto
}