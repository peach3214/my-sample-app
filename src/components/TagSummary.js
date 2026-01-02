import React, { useMemo } from 'react';
import { Tag as TagIcon } from 'lucide-react';

export default function TagSummary({ transactions }) {
  // タグごとの集計（支出のみ）
  const tagSummary = useMemo(() => {
    const summary = {};
    
    transactions.forEach(t => {
      if (t.type === 'expense' && t.tags && Array.isArray(t.tags)) {
        t.tags.forEach(tag => {
          if (!summary[tag.id]) {
            summary[tag.id] = {
              tag: tag,
              expense: 0
            };
          }
          summary[tag.id].expense += t.amount;
        });
      }
    });
    
    // 配列に変換して支出額でソート
    return Object.values(summary).sort((a, b) => b.expense - a.expense);
  }, [transactions]);

  const totalExpense = tagSummary.reduce((sum, item) => sum + item.expense, 0);

  if (tagSummary.length === 0) {
    return (
      <div className="card">
        <div className="card-title">
          <TagIcon size={20} color="var(--primary)" />
          タグ別支出
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🏷️</div>
          <div className="empty-state-text">タグが設定された支出がありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <TagIcon size={20} color="var(--primary)" />
        タグ別支出
      </div>

      {/* タグリスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tagSummary.map((item) => {
          const percentage = ((item.expense / totalExpense) * 100).toFixed(1);
          return (
            <div
              key={item.tag.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'var(--bg-color)',
                borderRadius: '12px',
                border: '1px solid var(--divider)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: item.tag.color,
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>
                    {item.tag.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {percentage}%
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--expense)',
                letterSpacing: '-0.5px'
              }}>
                ¥{item.expense.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* 合計 */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 59, 48, 0.05) 100%)',
        borderRadius: '12px',
        border: '2px solid rgba(255, 59, 48, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>合計支出</div>
        <div style={{
          fontSize: '24px',
          fontWeight: '800',
          color: 'var(--expense)',
          letterSpacing: '-0.5px'
        }}>
          ¥{totalExpense.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
