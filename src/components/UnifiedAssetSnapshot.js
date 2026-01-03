import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, Check, Building2, TrendingUp, Plus, X, Calendar } from 'lucide-react';

export default function UnifiedAssetSnapshot() {
  const [bankEntries, setBankEntries] = useState([{ id: Date.now(), name: '', amount: '' }]);
  const [stockEntries, setStockEntries] = useState([{ id: Date.now(), name: '', amount: '' }]);
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  // 銀行エントリ操作
  const addBankEntry = () => setBankEntries([...bankEntries, { id: Date.now(), name: '', amount: '' }]);
  const removeBankEntry = (id) => bankEntries.length > 1 && setBankEntries(bankEntries.filter(e => e.id !== id));
  const updateBankEntry = (id, field, value) => setBankEntries(bankEntries.map(e => e.id === id ? { ...e, [field]: value } : e));

  // 株式エントリ操作
  const addStockEntry = () => setStockEntries([...stockEntries, { id: Date.now(), name: '', amount: '' }]);
  const removeStockEntry = (id) => stockEntries.length > 1 && setStockEntries(stockEntries.filter(e => e.id !== id));
  const updateStockEntry = (id, field, value) => setStockEntries(stockEntries.map(e => e.id === id ? { ...e, [field]: value } : e));

  const totalBank = bankEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalStock = stockEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const grandTotal = totalBank + totalStock;

  // 保存処理 (ロジックのみ新しいテーブル形式に対応)
  const handleCreateSnapshot = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const insertData = [];

      bankEntries.forEach(bank => {
        if (bank.name.trim() && bank.amount) {
          insertData.push({
            snapshot_date: snapshotDate,
            asset_type: 'bank',
            asset_name: bank.name,
            amount: parseFloat(bank.amount),
            currency: 'JPY'
          });
        }
      });

      stockEntries.forEach(stock => {
        if (stock.name.trim() && stock.amount) {
          insertData.push({
            snapshot_date: snapshotDate,
            asset_type: 'stock',
            asset_name: stock.name,
            amount: parseFloat(stock.amount),
            currency: 'JPY'
          });
        }
      });

      if (insertData.length === 0) throw new Error('データが入力されていません');

      const { error } = await supabase.from('asset_snapshots').insert(insertData);
      if (error) throw error;

      alert('スナップショットを記録しました');
    } catch (err) {
      alert('エラー: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', borderRadius: '24px', background: 'var(--card-bg)' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', background: 'rgba(0, 122, 255, 0.1)', borderRadius: '12px' }}>
          <Camera size={22} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>資産スナップショット</h2>
      </div>

      {/* 日付選択 */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--divider)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <Calendar size={14} /> 基準日
        </div>
        <input 
          type="date" 
          value={snapshotDate}
          onChange={(e) => setSnapshotDate(e.target.value)}
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', outline: 'none' }}
        />
      </div>

      {/* 銀行セクション */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
            <Building2 size={18} color="var(--primary)" /> 銀行・現金
          </div>
          <button onClick={addBankEntry} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} />
          </button>
        </div>
        
        {bankEntries.map((entry) => (
          <div key={entry.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              placeholder="名称"
              value={entry.name}
              onChange={(e) => updateBankEntry(entry.id, 'name', e.target.value)}
              className="input-field"
              style={{ flex: 1, margin: 0, padding: '10px 14px' }}
            />
            <input 
              type="number"
              placeholder="金額"
              value={entry.amount}
              onChange={(e) => updateBankEntry(entry.id, 'amount', e.target.value)}
              className="input-field"
              style={{ width: '120px', margin: 0, padding: '10px 14px', textAlign: 'right', fontWeight: '600' }}
            />
            <button onClick={() => removeBankEntry(entry.id)} style={{ padding: '0 4px', border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* 株式セクション */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
            <TrendingUp size={18} color="#34C759" /> 株式・投資信託
          </div>
          <button onClick={addStockEntry} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#34C759', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} />
          </button>
        </div>

        {stockEntries.map((entry) => (
          <div key={entry.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              placeholder="銘柄名"
              value={entry.name}
              onChange={(e) => updateStockEntry(entry.id, 'name', e.target.value)}
              className="input-field"
              style={{ flex: 1, margin: 0, padding: '10px 14px' }}
            />
            <input 
              type="number"
              placeholder="評価額"
              value={entry.amount}
              onChange={(e) => updateStockEntry(entry.id, 'amount', e.target.value)}
              className="input-field"
              style={{ width: '120px', margin: 0, padding: '10px 14px', textAlign: 'right', fontWeight: '600' }}
            />
            <button onClick={() => removeStockEntry(entry.id)} style={{ padding: '0 4px', border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* 総資産グラデーションカード */}
      <div style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)', 
        borderRadius: '20px', 
        marginBottom: '24px', 
        boxShadow: '0 10px 30px rgba(0, 122, 255, 0.3)',
        color: 'white'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' }}>Total Assets</div>
        <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px' }}>
          <span style={{ fontSize: '20px', marginRight: '4px' }}>¥</span>
          {grandTotal.toLocaleString()}
        </div>
        <div style={{ display: 'flex', gap: '15px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}>
          <div>銀行: ¥{totalBank.toLocaleString()}</div>
          <div>株式: ¥{totalStock.toLocaleString()}</div>
        </div>
      </div>

      {/* 保存ボタン */}
      <button 
        onClick={handleCreateSnapshot} 
        disabled={isLoading || grandTotal === 0}
        style={{
          width: '100%',
          padding: '18px',
          borderRadius: '16px',
          border: 'none',
          background: 'var(--text-main)',
          color: 'white',
          fontWeight: '700',
          fontSize: '16px',
          cursor: (isLoading || grandTotal === 0) ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'transform 0.2s active'
        }}
      >
        {isLoading ? 'Saving...' : <><Check size={20} /> スナップショットを記録する</>}
      </button>
    </div>
  );
}