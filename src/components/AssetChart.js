import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

export default function AssetChart() {
  const [snapshots, setSnapshots] = useState([]);
  const [period, setPeriod] = useState('3months'); // 1month, 3months, 6months, 1year, all

  useEffect(() => {
    fetchSnapshots();

    // リアルタイム更新
    const channel = supabase
      .channel('asset_snapshots_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'asset_snapshots' },
        () => {
          fetchSnapshots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSnapshots = async () => {
    const { data, error } = await supabase
      .from('asset_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: true });

    if (!error && data) {
      setSnapshots(data);
    }
  };

  // 期間フィルター
  const filteredSnapshots = useMemo(() => {
    if (period === 'all') return snapshots;

    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case '1month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    return snapshots.filter(s => s.snapshot_date >= startDateStr);
  }, [snapshots, period]);

  // 日付ごとに集計
  const chartData = useMemo(() => {
    const grouped = {};

    filteredSnapshots.forEach(s => {
      if (!grouped[s.snapshot_date]) {
        grouped[s.snapshot_date] = {
          date: s.snapshot_date,
          bank: 0,
          stock: 0,
          total: 0
        };
      }

      if (s.asset_type === 'bank') {
        grouped[s.snapshot_date].bank += s.amount;
      } else if (s.asset_type === 'stock') {
        grouped[s.snapshot_date].stock += s.amount;
      }

      grouped[s.snapshot_date].total = grouped[s.snapshot_date].bank + grouped[s.snapshot_date].stock;
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSnapshots]);

  // 最新の資産状況
  const latestAsset = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  }, [chartData]);

  // 変化率計算
  const changeInfo = useMemo(() => {
    if (chartData.length < 2) return null;

    const oldest = chartData[0];
    const latest = chartData[chartData.length - 1];
    const change = latest.total - oldest.total;
    const changePercent = (change / oldest.total) * 100;

    return {
      change,
      changePercent,
      isPositive: change >= 0
    };
  }, [chartData]);

  if (snapshots.length === 0) {
    return (
      <div className="card">
        <div className="card-title">
          <TrendingUp size={20} color="var(--primary)" />
          資産推移
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">
            スナップショットがまだありません<br />
            資産データを記録してください
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <TrendingUp size={20} color="var(--primary)" />
        資産推移
      </div>

      {/* 期間選択 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {[
          { value: '1month', label: '1ヶ月' },
          { value: '3months', label: '3ヶ月' },
          { value: '6months', label: '6ヶ月' },
          { value: '1year', label: '1年' },
          { value: 'all', label: 'すべて' }
        ].map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            style={{
              padding: '10px 8px',
              background: period === p.value ? 'var(--primary)' : 'var(--bg-color)',
              color: period === p.value ? 'white' : 'var(--text-main)',
              border: '1px solid var(--divider)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 現在の資産 */}
      {latestAsset && (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, var(--primary) 0%, #0051D5 100%)',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0, 122, 255, 0.3)'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '8px'
          }}>
            現在の総資産
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '12px',
            letterSpacing: '-1px'
          }}>
            ¥{latestAsset.total.toLocaleString()}
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <div>
              <span style={{ opacity: 0.8 }}>預金: </span>
              <span style={{ fontWeight: '700' }}>¥{latestAsset.bank.toLocaleString()}</span>
            </div>
            <div>
              <span style={{ opacity: 0.8 }}>株式: </span>
              <span style={{ fontWeight: '700' }}>¥{latestAsset.stock.toLocaleString()}</span>
            </div>
          </div>
          {changeInfo && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white'
            }}>
              {changeInfo.isPositive ? '▲' : '▼'} {changeInfo.isPositive ? '+' : ''}{changeInfo.change.toLocaleString()}円 
              ({changeInfo.isPositive ? '+' : ''}{changeInfo.changePercent.toFixed(2)}%)
            </div>
          )}
        </div>
      )}

      {/* グラフ */}
      <div style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--text-secondary)"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'var(--text-secondary)' }}
              tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
            />
            <Tooltip 
              contentStyle={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--divider)',
                borderRadius: '8px',
                fontSize: '13px'
              }}
              formatter={(value) => `¥${value.toLocaleString()}`}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="var(--primary)" 
              strokeWidth={3}
              fill="url(#colorTotal)" 
              name="総資産"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 内訳グラフ */}
      <div style={{ width: '100%', height: '250px' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34C759" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--text-secondary)"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              style={{ fontSize: '11px' }}
              tick={{ fill: 'var(--text-secondary)' }}
              tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
            />
            <Tooltip 
              contentStyle={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--divider)',
                borderRadius: '8px',
                fontSize: '13px'
              }}
              formatter={(value) => `¥${value.toLocaleString()}`}
            />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
            <Area 
              type="monotone" 
              dataKey="bank" 
              stackId="1"
              stroke="#007AFF" 
              strokeWidth={2}
              fill="url(#colorBank)" 
              name="預金"
            />
            <Area 
              type="monotone" 
              dataKey="stock" 
              stackId="1"
              stroke="#34C759" 
              strokeWidth={2}
              fill="url(#colorStock)" 
              name="株式"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
