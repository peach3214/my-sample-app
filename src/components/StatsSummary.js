import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Repeat } from 'lucide-react';

export default function StatsSummary({ transactions }) {
  const stats = useMemo(() => {
    // 収入・支出の統計
    const income = transactions.filter(t => t.type === 'income');
    const expense = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // 平均値
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
    const avgExpense = expense.length > 0 ? totalExpense / expense.length : 0;

    // 最大・最小
    const maxExpense = expense.length > 0 
      ? Math.max(...expense.map(t => t.amount))
      : 0;
    const minExpense = expense.length > 0 
      ? Math.min(...expense.map(t => t.amount))
      : 0;

    // 最頻出の場所
    const locationFreq = {};
    expense.forEach(t => {
      locationFreq[t.location] = (locationFreq[t.location] || 0) + 1;
    });
    const topLocation = Object.entries(locationFreq).length > 0
      ? Object.entries(locationFreq).sort((a, b) => b[1] - a[1])[0]
      : null;

    // 期間
    const dates = transactions.map(t => new Date(t.date));
    const startDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
    const endDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
    const dayCount = startDate && endDate 
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      incomeCount: income.length,
      expenseCount: expense.length,
      avgIncome,
      avgExpense,
      maxExpense,
      minExpense,
      topLocation,
      dayCount,
      avgDailyExpense: dayCount > 0 ? totalExpense / dayCount : 0
    };
  }, [transactions]);

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-title">
        <TrendingUp size={20} color="var(--primary)" />
        統計サマリー
      </div>

      {/* メイン統計 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(52, 199, 89, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>総収入</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '800',
            color: 'var(--income)',
            letterSpacing: '-0.5px'
          }}>
            ¥{stats.totalIncome.toLocaleString()}
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            marginTop: '4px'
          }}>
            {stats.incomeCount}件
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 59, 48, 0.05) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>総支出</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '800',
            color: 'var(--expense)',
            letterSpacing: '-0.5px'
          }}>
            ¥{stats.totalExpense.toLocaleString()}
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            marginTop: '4px'
          }}>
            {stats.expenseCount}件
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: stats.balance >= 0
            ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(255, 149, 0, 0.05) 100%)',
          borderRadius: '12px',
          border: `1px solid ${stats.balance >= 0 ? 'rgba(0, 122, 255, 0.3)' : 'rgba(255, 149, 0, 0.3)'}`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>差額</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '800',
            color: stats.balance >= 0 ? 'var(--primary)' : '#FF9500',
            letterSpacing: '-0.5px'
          }}>
            {stats.balance >= 0 ? '' : '-'}¥{Math.abs(stats.balance).toLocaleString()}
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            marginTop: '4px'
          }}>
            {stats.balance >= 0 ? '黒字' : '赤字'}
          </div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {/* 平均支出 */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-color)',
          borderRadius: '10px',
          border: '1px solid var(--divider)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <DollarSign size={16} color="var(--text-secondary)" />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>平均支出</span>
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text-main)'
          }}>
            ¥{Math.round(stats.avgExpense).toLocaleString()}
          </div>
        </div>

        {/* 1日あたり */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-color)',
          borderRadius: '10px',
          border: '1px solid var(--divider)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Calendar size={16} color="var(--text-secondary)" />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>1日平均</span>
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text-main)'
          }}>
            ¥{Math.round(stats.avgDailyExpense).toLocaleString()}
          </div>
        </div>

        {/* 最大支出 */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-color)',
          borderRadius: '10px',
          border: '1px solid var(--divider)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <TrendingUp size={16} color="var(--text-secondary)" />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>最大支出</span>
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--expense)'
          }}>
            ¥{stats.maxExpense.toLocaleString()}
          </div>
        </div>

        {/* 最頻出場所 */}
        <div style={{
          padding: '14px',
          background: 'var(--bg-color)',
          borderRadius: '10px',
          border: '1px solid var(--divider)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Repeat size={16} color="var(--text-secondary)" />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>よく使う場所</span>
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--text-main)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {stats.topLocation ? `${stats.topLocation[0]} (${stats.topLocation[1]}回)` : '-'}
          </div>
        </div>
      </div>

      {/* 期間情報 */}
      {stats.dayCount > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'var(--bg-color)',
          borderRadius: '10px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          集計期間: {stats.dayCount}日間
        </div>
      )}
    </div>
  );
}
