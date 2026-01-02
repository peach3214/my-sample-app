import React, { useState, useEffect } from 'react';
import { Target, TrendingDown, AlertCircle } from 'lucide-react';

export default function BudgetTracker({ transactions, currentDate }) {
  const [budget, setBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputBudget, setInputBudget] = useState('');

  // 予算をLocalStorageから読み込み
  useEffect(() => {
    const savedBudget = localStorage.getItem('monthlyBudget');
    if (savedBudget) {
      setBudget(parseInt(savedBudget));
    }
  }, []);

  // 今月の総支出を計算
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSaveBudget = () => {
    const amount = parseInt(inputBudget);
    if (amount > 0) {
      setBudget(amount);
      localStorage.setItem('monthlyBudget', amount.toString());
      setIsEditing(false);
      setInputBudget('');
    }
  };

  const percentage = budget ? Math.min((totalExpense / budget) * 100, 100) : 0;
  const remaining = budget ? budget - totalExpense : 0;
  const isOverBudget = remaining < 0;
  const isWarning = percentage >= 80 && percentage < 100;

  if (!budget && !isEditing) {
    return (
      <div className="card">
        <div className="card-title">
          <Target size={20} color="var(--primary)" />
          予算管理
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <div className="empty-state-text">今月の予算を設定しましょう</div>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              marginTop: '16px',
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            予算を設定
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="card">
        <div className="card-title">
          <Target size={20} color="var(--primary)" />
          予算管理
        </div>
        <div style={{ padding: '16px 0' }}>
          <label style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            月間予算
          </label>
          <input
            type="number"
            inputMode="numeric"
            className="input-field"
            placeholder="300000"
            value={inputBudget}
            onChange={(e) => setInputBudget(e.target.value)}
            style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'right', marginBottom: '16px' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setIsEditing(false);
                setInputBudget('');
              }}
              style={{
                flex: 1,
                padding: '14px',
                background: 'var(--bg-color)',
                border: '1px solid var(--divider)',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveBudget}
              disabled={!inputBudget || parseInt(inputBudget) <= 0}
              style={{
                flex: 1,
                padding: '14px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: !inputBudget || parseInt(inputBudget) <= 0 ? 'not-allowed' : 'pointer',
                opacity: !inputBudget || parseInt(inputBudget) <= 0 ? 0.5 : 1
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <Target size={20} color="var(--primary)" />
        予算管理
      </div>

      {/* 警告メッセージ */}
      {isOverBudget && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 59, 48, 0.1)',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          borderRadius: '10px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={20} color="var(--expense)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--expense)' }}>
              予算オーバー
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              ¥{Math.abs(remaining).toLocaleString()} 超過しています
            </div>
          </div>
        </div>
      )}

      {isWarning && !isOverBudget && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 149, 0, 0.1)',
          border: '1px solid rgba(255, 149, 0, 0.3)',
          borderRadius: '10px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={20} color="#FF9500" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#FF9500' }}>
              予算残りわずか
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              予算の{percentage.toFixed(0)}%を使用しています
            </div>
          </div>
        </div>
      )}

      {/* 予算情報 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>予算</div>
          <div style={{
            fontSize: '16px',
            fontWeight: '800',
            color: 'var(--text-main)'
          }}>
            ¥{budget.toLocaleString()}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>支出</div>
          <div style={{
            fontSize: '16px',
            fontWeight: '800',
            color: 'var(--expense)'
          }}>
            ¥{totalExpense.toLocaleString()}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>残り</div>
          <div style={{
            fontSize: '16px',
            fontWeight: '800',
            color: isOverBudget ? 'var(--expense)' : 'var(--income)'
          }}>
            {isOverBudget ? '-' : ''}¥{Math.abs(remaining).toLocaleString()}
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div style={{
        height: '12px',
        background: 'var(--bg-color)',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '12px'
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: isOverBudget 
            ? 'linear-gradient(90deg, var(--expense) 0%, #FF0000 100%)'
            : isWarning
              ? 'linear-gradient(90deg, #FF9500 0%, #FFCC00 100%)'
              : 'linear-gradient(90deg, var(--income) 0%, #00E5A0 100%)',
          transition: 'width 0.3s ease',
          borderRadius: '6px'
        }} />
      </div>

      {/* 使用率 */}
      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        marginBottom: '16px',
        fontWeight: '600'
      }}>
        {percentage.toFixed(1)}% 使用
      </div>

      {/* 編集ボタン */}
      <button
        onClick={() => {
          setInputBudget(budget.toString());
          setIsEditing(true);
        }}
        style={{
          width: '100%',
          padding: '12px',
          background: 'var(--bg-color)',
          border: '1px solid var(--divider)',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          color: 'var(--text-main)',
          transition: 'all 0.2s ease'
        }}
      >
        予算を変更
      </button>
    </div>
  );
}
