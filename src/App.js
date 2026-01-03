import React, { useEffect, useState, useMemo } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import TransactionForm from './components/TransactionForm';
import MoneyFlow from './components/MoneyFlow';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import EditTransactionModal from './components/EditTransactionModal';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import NotificationSettings from './components/NotificationSettings';
import TagMaster from './components/TagMaster';
import BudgetTracker from './components/BudgetTracker';
import PeriodFilter from './components/PeriodFilter';
import TemplateManager from './components/TemplateManager';
import UnifiedAssetSnapshot from './components/UnifiedAssetSnapshot';
import AssetChart from './components/AssetChart';
import { useNotifications } from './hooks/useNotifications';
import { Home, PlusCircle, BarChart2, List, ChevronLeft, ChevronRight, Bookmark, Tag, Settings, Wallet } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // 表示中の月
  const [activeTab, setActiveTab] = useState('home'); // 現在のタブ
  const [editingTransaction, setEditingTransaction] = useState(null); // 編集中の取引
  const [showNotificationSettings, setShowNotificationSettings] = useState(false); // 通知設定モーダル
  const [showTagMaster, setShowTagMaster] = useState(false); // タグマスタモーダル
  const [showTemplateManager, setShowTemplateManager] = useState(false); // テンプレート管理モーダル
  const [filteredHistoryTransactions, setFilteredHistoryTransactions] = useState([]); // フィルター済み履歴
  const [historyPage, setHistoryPage] = useState(1); // 履歴ページ番号
  
  // 通知機能を初期化
  const { notifyTransactionAdded } = useNotifications();

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

    // Supabaseのリアルタイム購読
    const channel = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          if (payload.new && payload.new.id) {
            const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{"transactionAdded": true}');
            if (settings.transactionAdded && Notification.permission === 'granted') {
              notifyTransactionAdded(payload.new);
            }
          }
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notifyTransactionAdded]);

  // 月の切り替え操作
  const changeMonth = (diff) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + diff);
    setCurrentDate(newDate);
  };

  const currentMonthStr = currentDate.toISOString().slice(0, 7);

  // --- MEMOS (Moved to Top Level) ---

  // 1. 現在選択されている月のデータ
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonthStr));
  }, [transactions, currentMonthStr]);

  // 2. 履歴タブ用: 年月でのグループ化
  const groupedByYearMonth = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
      const yearMonth = t.date.slice(0, 7); // YYYY-MM
      if (!groups[yearMonth]) {
        groups[yearMonth] = [];
      }
      groups[yearMonth].push(t);
    });
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(ym => ({ yearMonth: ym, transactions: groups[ym] }));
  }, [transactions]);

  // 3. 履歴タブ用: フィルター適用後のグループ化
  const filteredGroups = useMemo(() => {
    if (filteredHistoryTransactions.length === 0) {
      // フィルターなし: 最新20件を使用
      const recent = transactions.slice(0, 20);
      const groups = {};
      recent.forEach(t => {
        const ym = t.date.slice(0, 7);
        if (!groups[ym]) groups[ym] = [];
        groups[ym].push(t);
      });
      return Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .map(ym => ({ yearMonth: ym, transactions: groups[ym] }));
    } else {
      // フィルター適用: 該当データをグループ化
      const groups = {};
      filteredHistoryTransactions.forEach(t => {
        const ym = t.date.slice(0, 7);
        if (!groups[ym]) groups[ym] = [];
        groups[ym].push(t);
      });
      return Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .map(ym => ({ yearMonth: ym, transactions: groups[ym] }));
    }
  }, [transactions, filteredHistoryTransactions]);

  // 今月の収支合計
  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, cur) => acc + cur.amount, 0);
  const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0);

  // --- 画面ごとのレンダリング ---
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <div className="card summary-card" style={{ margin: '0 16px 16px' }}>
              <div className="balance-label">今月の残高</div>
              <div className="balance-amount">
                ¥{(totalIncome - totalExpense).toLocaleString()}
              </div>
              <div className="balance-details">
                <div className="balance-detail-item">
                  <div className="balance-detail-label">収入</div>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>
                    ¥{totalIncome.toLocaleString()}
                  </div>
                </div>
                <div className="balance-detail-item">
                  <div className="balance-detail-label">支出</div>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>
                    ¥{totalExpense.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            <BudgetTracker transactions={monthlyTransactions} currentDate={currentDate} />
            <CalendarView transactions={monthlyTransactions} currentDate={currentDate} />
            <MoneyFlow transactions={monthlyTransactions} />
          </>
        );

      case 'input':
        return (
          <TransactionForm 
            onAdded={() => fetchData()} 
            existingTransactions={transactions} 
          />
        );

      case 'analysis':
        return (
          <>
            <Dashboard transactions={transactions} />
            <ExpenseBreakdown transactions={transactions} />
          </>
        );

      case 'history':
        // ページネーション計算 (HookではないのでここでOK)
        const itemsPerPage = 3; 
        const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
        const startIndex = (historyPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

        return (
          <>
            <div className="card">
              <div className="card-title"><List size={20} /> 取引履歴</div>
              
              <PeriodFilter 
                transactions={transactions}
                onFilteredTransactions={(filtered) => {
                  setFilteredHistoryTransactions(filtered);
                  setHistoryPage(1);
                }}
                showSearchText={false}
              />

              {filteredGroups.length > itemsPerPage && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--bg-color)',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <button
                    onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                    disabled={historyPage === 1}
                    style={{
                      padding: '8px 16px',
                      background: historyPage === 1 ? 'var(--bg-elevated)' : 'var(--primary)',
                      color: historyPage === 1 ? 'var(--text-tertiary)' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: historyPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ◀ 前へ
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {historyPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setHistoryPage(Math.min(totalPages, historyPage + 1))}
                    disabled={historyPage === totalPages}
                    style={{
                      padding: '8px 16px',
                      background: historyPage === totalPages ? 'var(--bg-elevated)' : 'var(--primary)',
                      color: historyPage === totalPages ? 'var(--text-tertiary)' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: historyPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    次へ ▶
                  </button>
                </div>
              )}
              
              {paginatedGroups.map(group => (
                <div key={group.yearMonth} style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: 'var(--text-main)', 
                    marginBottom: '12px',
                    padding: '8px 12px',
                    background: 'var(--bg-color)',
                    borderRadius: '8px'
                  }}>
                    {group.yearMonth.slice(0, 4)}年{group.yearMonth.slice(5, 7)}月
                  </div>
                  <div>
                    {group.transactions.map(t => (
                      <div 
                        key={t.id} 
                        className="history-item"
                        onClick={() => setEditingTransaction(t)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="history-loc">{t.location}</div>
                          <div className="history-meta">{t.date} · {t.content}</div>
                          {t.tags && t.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                              {t.tags.map(tag => (
                                <span
                                  key={tag.id}
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: tag.color,
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={t.type === 'income' ? 'amount-plus' : 'amount-minus'}>
                          {t.type === 'income' ? '+' : '-'} ¥{t.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {editingTransaction && (
              <EditTransactionModal
                transaction={editingTransaction}
                onClose={() => setEditingTransaction(null)}
                onUpdate={() => {
                  fetchData();
                  setEditingTransaction(null);
                }}
              />
            )}
          </>
        );

      case 'assets':
        return (
          <>
            <AssetChart />
            <UnifiedAssetSnapshot />
          </>
        );

      case 'settings':
        return (
          <div className="card">
            <div className="card-title">
              <Settings size={20} color="var(--primary)" />
              設定
            </div>
            
            <button
              onClick={() => setShowTemplateManager(true)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--bg-color)',
                border: '1px solid var(--divider)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bookmark size={24} color="var(--primary)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>
                    テンプレート管理
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    よく使う取引を登録
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '24px', color: 'var(--text-tertiary)' }}>›</span>
            </button>

            <button
              onClick={() => setShowTagMaster(true)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--bg-color)',
                border: '1px solid var(--divider)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Tag size={24} color="var(--primary)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>
                    タグ管理
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    取引に付けるタグを管理
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '24px', color: 'var(--text-tertiary)' }}>›</span>
            </button>

            <button
              onClick={() => setShowNotificationSettings(true)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--bg-color)',
                border: '1px solid var(--divider)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Settings size={24} color="var(--primary)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>
                    通知設定
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    通知のオン/オフを切り替え
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '24px', color: 'var(--text-tertiary)' }}>›</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      {activeTab === 'home' && (
        <div className="month-selector">
          <button className="month-btn" onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button>
          <span className="current-month">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </span>
          <button className="month-btn" onClick={() => changeMonth(1)}><ChevronRight size={20}/></button>
        </div>
      )}

      <div className="content-area">
        {renderContent()}
      </div>

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

        <button 
          className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} 
          onClick={() => setActiveTab('assets')}
        >
          <Wallet size={24} />
          <span>資産</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={24} />
          <span>設定</span>
        </button>
      </nav>

      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}

      {showTagMaster && (
        <TagMaster onClose={() => setShowTagMaster(false)} />
      )}

      {showTemplateManager && (
        <TemplateManager onClose={() => setShowTemplateManager(false)} />
      )}
    </div>
  );
}

export default App;