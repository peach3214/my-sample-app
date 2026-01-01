import React, { useEffect, useState, useMemo } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import TransactionForm from './components/TransactionForm';
import MoneyFlow from './components/MoneyFlow';
import Dashboard from './components/Dashboard';
import { Home, PlusCircle, BarChart2, List, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // 表示中の月
  const [activeTab, setActiveTab] = useState('home'); // 現在のタブ (home, input, analysis, history)

  // データ取得
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) console.error(error);
    if (data) setTransactions(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 月の切り替え操作
  const changeMonth = (diff) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + diff);
    setCurrentDate(newDate);
  };

  // 表示用に「YYYY-MM」形式の文字列を作る
  const currentMonthStr = currentDate.toISOString().slice(0, 7); // 例: "2026-01"

  // 現在選択されている月のデータだけでフィルタリング
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonthStr));
  }, [transactions, currentMonthStr]);

  // 今月の収支合計
  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, cur) => acc + cur.amount, 0);
  const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0);

  // --- 画面ごとのレンダリング ---
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* 今月のサマリーカード */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>今月の残高</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: (totalIncome - totalExpense) >= 0 ? '#333' : '#ff6b6b' }}>
                ¥{(totalIncome - totalExpense).toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '14px' }}>
                <span style={{ color: 'var(--income)' }}>収入 ¥{totalIncome.toLocaleString()}</span>
                <span style={{ color: 'var(--expense)' }}>支出 ¥{totalExpense.toLocaleString()}</span>
              </div>
            </div>
            {/* まる見えフロー */}
            <MoneyFlow transactions={monthlyTransactions} />
          </>
        );

      case 'input':
        return (
          <TransactionForm 
            onAdded={() => {
              fetchData();
              setActiveTab('home'); // 追加したらホームに戻る
            }} 
            existingTransactions={transactions} 
          />
        );

      case 'analysis':
        // ダッシュボードには「全期間のデータ」を渡して、推移が見れるようにする
        return <Dashboard transactions={transactions} />;

      case 'history':
        return (
          <div className="card">
            <div className="card-title"><List size={20} /> 今月の明細</div>
            <div>
              {monthlyTransactions.map(t => (
                <div key={t.id} className="history-item">
                  <div>
                    <div className="history-loc">{t.location}</div>
                    <div className="history-meta">{t.date} · {t.content}</div>
                  </div>
                  <div className={t.type === 'income' ? 'amount-plus' : 'amount-minus'}>
                    {t.type === 'income' ? '+' : '-'} ¥{t.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              {monthlyTransactions.length === 0 && <p style={{textAlign:'center', color:'#ccc', padding:'20px'}}>データがありません</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      {/* ヘッダー（月選択） */}
      <div className="month-selector">
        <button className="month-btn" onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button>
        <span className="current-month">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </span>
        <button className="month-btn" onClick={() => changeMonth(1)}><ChevronRight size={20}/></button>
      </div>

      {/* メインコンテンツ表示エリア */}
      <div className="content-area">
        {renderContent()}
      </div>

      {/* ボトムナビゲーション */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} />
          <span>ホーム</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'input' ? 'active' : ''}`} 
          onClick={() => setActiveTab('input')}
        >
          <PlusCircle size={24} />
          <span>入力</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`} 
          onClick={() => setActiveTab('analysis')}
        >
          <BarChart2 size={24} />
          <span>分析</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} 
          onClick={() => setActiveTab('history')}
        >
          <List size={24} />
          <span>履歴</span>
        </button>
      </nav>
    </div>
  );
}

export default App;