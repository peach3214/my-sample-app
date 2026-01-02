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
import TagSummary from './components/TagSummary';
import TransactionFilter from './components/TransactionFilter';
import BudgetTracker from './components/BudgetTracker';
import { useNotifications } from './hooks/useNotifications';
import { Home, PlusCircle, BarChart2, List, ChevronLeft, ChevronRight, Bell, Tag, Settings } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // 表示中の月
  const [activeTab, setActiveTab] = useState('home'); // 現在のタブ (home, input, analysis, history, settings)
  const [editingTransaction, setEditingTransaction] = useState(null); // 編集中の取引
  const [showNotificationSettings, setShowNotificationSettings] = useState(false); // 通知設定モーダル
  const [showTagMaster, setShowTagMaster] = useState(false); // タグマスタモーダル
  const [filteredHistoryTransactions, setFilteredHistoryTransactions] = useState([]); // フィルター済み履歴
  
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

    // Supabaseのリアルタイム購読を設定
    const channel = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('新しい取引が追加されました:', payload);
          
          // payload.newが正しいフォーマットか確認
          if (payload.new && payload.new.id) {
            // 通知設定を確認
            const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{"transactionAdded": true}');
            
            // 通知を表示
            if (settings.transactionAdded && Notification.permission === 'granted') {
              notifyTransactionAdded(payload.new);
            }
          }
          
          // データを再取得
          fetchData();
        }
      )
      .subscribe();

    // クリーンアップ
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
            {/* 今月のサマリーカード - 改善版 */}
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
            
            {/* 予算トラッカー */}
            <BudgetTracker transactions={monthlyTransactions} currentDate={currentDate} />
            
            {/* カレンダービュー */}
            <CalendarView transactions={monthlyTransactions} currentDate={currentDate} />
            
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
        return (
          <>
            <Dashboard transactions={transactions} />
            <TagSummary transactions={monthlyTransactions} />
            <ExpenseBreakdown transactions={monthlyTransactions} />
          </>
        );

      case 'history':
        const displayTransactions = filteredHistoryTransactions.length > 0 || activeTab === 'history' 
          ? filteredHistoryTransactions 
          : monthlyTransactions;

        return (
          <>
            <div className="card">
              <div className="card-title"><List size={20} /> 今月の明細</div>
              
              {/* フィルター */}
              <TransactionFilter 
                transactions={monthlyTransactions}
                onFilteredTransactions={setFilteredHistoryTransactions}
              />
              
              <div>
                {displayTransactions.map(t => (
                  <div 
                    key={t.id} 
                    className="history-item"
                    onClick={() => setEditingTransaction(t)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="history-loc">{t.location}</div>
                      <div className="history-meta">{t.date} · {t.content}</div>
                      {/* タグ表示 */}
                      {t.tags && t.tags.length > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '4px', 
                          marginTop: '6px' 
                        }}>
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
                {displayTransactions.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">
                      {monthlyTransactions.length === 0 ? 'まだ取引がありません' : '条件に一致する取引がありません'}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 編集モーダル */}
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

      case 'settings':
        return (
          <div className="card">
            <div className="card-title">
              <Settings size={20} color="var(--primary)" />
              設定
            </div>
            
            {/* タグ管理ボタン */}
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

            {/* 通知設定ボタン */}
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
                <Bell size={24} color="var(--primary)" />
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
      {/* ヘッダー（月選択） - ホームと履歴でのみ表示 */}
      {(activeTab === 'home' || activeTab === 'history') && (
        <div className="month-selector">
          <button className="month-btn" onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button>
          <span className="current-month">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </span>
          <button className="month-btn" onClick={() => changeMonth(1)}><ChevronRight size={20}/></button>
        </div>
      )}

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

        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={24} />
          <span>設定</span>
        </button>
      </nav>

      {/* 通知設定モーダル */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}

      {/* タグマスタモーダル */}
      {showTagMaster && (
        <TagMaster onClose={() => setShowTagMaster(false)} />
      )}
    </div>
  );
}

export default App;