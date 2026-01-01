import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import TransactionForm from './components/TransactionForm';
import MoneyFlow from './components/MoneyFlow';
import Dashboard from './components/Dashboard';

function App() {
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) setTransactions(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      <h1>マネーフロー・ビジュアライザー</h1>
      <TransactionForm onAdded={fetchData} existingTransactions={transactions} />
      <MoneyFlow transactions={transactions} />
      <Dashboard transactions={transactions} />
    </div>
  );
}

export default App;