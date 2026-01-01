// types.ts
export type Transaction = {
  id: number;
  type: 'income' | 'expense';
  category_type: 'fixed' | 'variable';
  location: string;
  content: string;
  amount: number;
  date: string;
};