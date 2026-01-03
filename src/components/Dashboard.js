import React, { useMemo, useState } from 'react';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard({ transactions }) {
  const [expandedHistory, setExpandedHistory] = useState(false);

  // 月別にデータを集計（直近12ヶ月 + それ以前）
  const { monthlyData, historyData, historyTotal } = useMemo(() => {
    const grouped = {};
    
    transactions.forEach(t => {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!grouped[month]) {
        grouped[month] = { month, income: 0, expense: 0, balance: 0 };
      }
      if (t.type === 'income') {
        grouped[month].income += t.amount;
      } else {
        grouped[month].expense += t.amount;
      }
      grouped[month].balance = grouped[month].income - grouped[month].expense;
    });

    // 月でソート（降順）
    const sortedData = Object.values(grouped).sort((a, b) => 
      b.month.localeCompare(a.month)
    );

    // 直近12ヶ月とそれ以前に分ける
    const recent12Months = sortedData.slice(0, 12);
    const olderMonths = sortedData.slice(12);

    // それ以前の合計
    const historyTotalData = olderMonths.reduce((acc, m) => ({
      income: acc.income + m.income,
      expense: acc.expense + m.expense,
      balance: acc.balance + m.balance,
      count: acc.count + 1
    }), { income: 0, expense: 0, balance: 0, count: 0 });

    return {
      monthlyData: recent12Months,
      historyData: olderMonths,
      historyTotal: historyTotalData
    };
  }, [transactions]);

  // 総計
  const grandTotal = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      income: allIncome,
      expense: allExpense,
      balance: allIncome - allExpense
    };
  }, [transactions]);

  // グラフ用データ（直近12ヶ月のみ、古い順）
  const chartData = useMemo(() => {
    return [...monthlyData].reverse();
  }, [monthlyData]);

  return (
    <div className="card">
      <div className="card-title">
        <BarChart2 size={20} color="var(--primary)" />
        収支一覧
      </div>

      {/* 直近12ヶ月のテーブル */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ 
              borderBottom: '2px solid var(--divider)',
              background: 'var(--bg-color)'
            }}>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'left',
                fontWeight: '700',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>月</th>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'right',
                fontWeight: '700',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>収入</th>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'right',
                fontWeight: '700',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>支出</th>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'right',
                fontWeight: '700',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>残金</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((d, idx) => (
              <tr key={d.month} style={{
                borderBottom: idx === monthlyData.length - 1 ? 'none' : '1px solid var(--divider)'
              }}>
                <td style={{ 
                  padding: '14px 8px', 
                  fontWeight: '600' 
                }}>{d.month}</td>
                <td style={{ 
                  padding: '14px 8px', 
                  textAlign: 'right',
                  fontWeight: '700',
                  color: d.income > 0 ? 'var(--income)' : 'var(--text-tertiary)'
                }}>
                  {d.income > 0 ? `¥${d.income.toLocaleString()}` : '-'}
                </td>
                <td style={{ 
                  padding: '14px 8px', 
                  textAlign: 'right',
                  fontWeight: '700',
                  color: d.expense > 0 ? 'var(--expense)' : 'var(--text-tertiary)'
                }}>
                  {d.expense > 0 ? `¥${d.expense.toLocaleString()}` : '-'}
                </td>
                <td style={{ 
                  padding: '14px 8px', 
                  textAlign: 'right',
                  fontWeight: '800',
                  fontSize: '13px',
                  color: d.balance >= 0 ? 'var(--income)' : 'var(--expense)'
                }}>
                  ¥{Math.abs(d.balance).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* それ以前のサマリー行 */}
      {historyTotal.count > 0 && (
        <>
          <div style={{ borderTop: '2px solid var(--divider)', marginTop: '8px' }} />
          <div
            onClick={() => setExpandedHistory(!expandedHistory)}
            style={{
              padding: '14px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: expandedHistory ? 'var(--bg-color)' : 'transparent',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {expandedHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                それ以前 ({historyTotal.count}ヶ月)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
              <span style={{ fontWeight: '700', color: 'var(--income)' }}>
                ¥{historyTotal.income.toLocaleString()}
              </span>
              <span style={{ fontWeight: '700', color: 'var(--expense)' }}>
                ¥{historyTotal.expense.toLocaleString()}
              </span>
              <span style={{
                fontWeight: '800',
                color: historyTotal.balance >= 0 ? 'var(--income)' : 'var(--expense)'
              }}>
                {historyTotal.balance >= 0 ? '' : '-'}¥{Math.abs(historyTotal.balance).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 展開時の詳細 */}
          {expandedHistory && (
            <div style={{
              marginTop: '8px',
              padding: '12px',
              background: 'var(--bg-color)',
              borderRadius: '8px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <tbody>
                  {historyData.map((d, idx) => (
                    <tr key={d.month} style={{
                      borderBottom: idx === historyData.length - 1 ? 'none' : '1px solid var(--divider)'
                    }}>
                      <td style={{ padding: '10px 8px', fontWeight: '600' }}>
                        {d.month}
                      </td>
                      <td style={{ 
                        padding: '10px 8px', 
                        textAlign: 'right',
                        fontWeight: '600',
                        color: d.income > 0 ? 'var(--income)' : 'var(--text-tertiary)'
                      }}>
                        {d.income > 0 ? `¥${d.income.toLocaleString()}` : '-'}
                      </td>
                      <td style={{ 
                        padding: '10px 8px', 
                        textAlign: 'right',
                        fontWeight: '600',
                        color: d.expense > 0 ? 'var(--expense)' : 'var(--text-tertiary)'
                      }}>
                        {d.expense > 0 ? `¥${d.expense.toLocaleString()}` : '-'}
                      </td>
                      <td style={{ 
                        padding: '10px 8px', 
                        textAlign: 'right',
                        fontWeight: '700',
                        color: d.balance >= 0 ? 'var(--income)' : 'var(--expense)'
                      }}>
                        {d.balance >= 0 ? '' : '-'}¥{Math.abs(d.balance).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* 総計行 */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'linear-gradient(135deg, var(--bg-color) 0%, var(--bg-elevated) 100%)',
        borderRadius: '12px',
        border: '2px solid var(--divider)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          textAlign: 'center'
        }}>
          <div>
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
              ¥{grandTotal.income.toLocaleString()}
            </div>
          </div>
          <div>
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
              ¥{grandTotal.expense.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>総残金</div>
            <div style={{
              fontSize: '18px',
              fontWeight: '800',
              color: grandTotal.balance >= 0 ? 'var(--income)' : 'var(--expense)',
              letterSpacing: '-0.5px'
            }}>
              ¥{Math.abs(grandTotal.balance).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 収支グラフ */}
      {chartData.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '16px',
            color: 'var(--text-main)'
          }}>
            収支グラフ（直近12ヶ月）
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: 'var(--text-secondary)' }}
                  tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--divider)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  formatter={(value) => `¥${value.toLocaleString()}`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '14px', paddingTop: '16px' }}
                />
                <Bar dataKey="income" fill="#34C759" name="収入" />
                <Bar dataKey="expense" fill="#FF3B30" name="支出" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
