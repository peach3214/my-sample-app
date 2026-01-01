import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

export default function CalendarView({ transactions, currentDate }) {
  // 現在の月の日数と開始曜日を計算
  const { daysInMonth, firstDayOfWeek, year, month } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return {
      daysInMonth: lastDay.getDate(),
      firstDayOfWeek: firstDay.getDay(), // 0=日曜, 1=月曜, ...
      year,
      month
    };
  }, [currentDate]);

  // 日付ごとの収支を計算
  const dailyData = useMemo(() => {
    const data = {};
    transactions.forEach(t => {
      const day = parseInt(t.date.split('-')[2]);
      if (!data[day]) {
        data[day] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        data[day].income += t.amount;
      } else {
        data[day].expense += t.amount;
      }
    });
    return data;
  }, [transactions]);

  // カレンダーグリッドを生成
  const calendarDays = [];
  
  // 最初の空白セルを追加
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 日付セルを追加
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="card">
      <div className="card-title">
        <Calendar size={20} color="var(--primary)" />
        カレンダー
      </div>

      {/* 曜日ヘッダー */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        marginBottom: '8px'
      }}>
        {weekDays.map((day, idx) => (
          <div key={day} style={{
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: idx === 0 ? 'var(--expense)' : idx === 6 ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '8px 0'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px'
      }}>
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const data = dailyData[day] || { income: 0, expense: 0 };
          const balance = data.income - data.expense;
          const hasData = data.income > 0 || data.expense > 0;
          
          // 今日かどうか
          const today = new Date();
          const isToday = today.getDate() === day && 
                         today.getMonth() === month && 
                         today.getFullYear() === year;

          return (
            <div
              key={day}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                background: isToday 
                  ? 'var(--primary)' 
                  : hasData 
                    ? balance >= 0 
                      ? 'rgba(52, 199, 89, 0.1)' 
                      : 'rgba(255, 59, 48, 0.1)'
                    : 'transparent',
                border: isToday ? '2px solid var(--primary)' : hasData ? '1px solid ' + (balance >= 0 ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)') : '1px solid var(--divider)',
                cursor: hasData ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: isToday ? '700' : '600',
                color: isToday ? 'white' : 'var(--text-main)',
                marginBottom: hasData ? '2px' : '0'
              }}>
                {day}
              </div>
              
              {hasData && (
                <div style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  color: isToday 
                    ? 'white' 
                    : balance >= 0 
                      ? 'var(--income)' 
                      : 'var(--expense)',
                  letterSpacing: '-0.2px'
                }}>
                  {balance >= 0 ? '+' : ''}{(balance / 1000).toFixed(0)}k
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--divider)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '4px',
            background: 'rgba(52, 199, 89, 0.3)',
            border: '1px solid rgba(52, 199, 89, 0.5)'
          }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            黒字
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '4px',
            background: 'rgba(255, 59, 48, 0.3)',
            border: '1px solid rgba(255, 59, 48, 0.5)'
          }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            赤字
          </span>
        </div>
      </div>
    </div>
  );
}