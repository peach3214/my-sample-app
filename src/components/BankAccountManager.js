import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';

export default function BankAccountManager() {
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bank_name: '',
    account_type: 'savings',
    balance: ''
  });
  const [balances, setBalances] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setAccounts(data);
      const initialBalances = {};
      data.forEach(acc => {
        initialBalances[acc.id] = acc.current_balance || 0;
      });
      setBalances(initialBalances);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.bank_name) return;

    if (editingAccount) {
      const { error } = await supabase
        .from('bank_accounts')
        .update({
          name: formData.name,
          bank_name: formData.bank_name,
          account_type: formData.account_type,
          current_balance: parseFloat(formData.balance) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAccount.id);

      if (!error) {
        fetchAccounts();
        handleCancel();
      }
    } else {
      const { error} = await supabase
        .from('bank_accounts')
        .insert([{
          name: formData.name,
          bank_name: formData.bank_name,
          account_type: formData.account_type,
          current_balance: parseFloat(formData.balance) || 0,
          display_order: accounts.length
        }]);

      if (!error) {
        fetchAccounts();
        handleCancel();
      }
    }
  };

  const handleBalanceUpdate = async (accountId, newBalance) => {
    const { error } = await supabase
      .from('bank_accounts')
      .update({
        current_balance: parseFloat(newBalance) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (!error) {
      setBalances({...balances, [accountId]: newBalance});
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      bank_name: account.bank_name,
      account_type: account.account_type,
      balance: account.current_balance || ''
    });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('この口座を削除しますか？')) return;

    const { error } = await supabase
      .from('bank_accounts')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      fetchAccounts();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingAccount(null);
    setFormData({ name: '', bank_name: '', account_type: 'savings', balance: '' });
  };

  const accountTypeLabels = {
    savings: '普通預金',
    checking: '当座預金',
    investment: '投資口座'
  };

  const totalBalance = accounts.reduce((sum, acc) => {
    return sum + (parseFloat(balances[acc.id]) || 0);
  }, 0);

  return (
    <div className="card">
      <div className="card-title">
        <Building2 size={20} color="var(--primary)" />
        銀行口座
      </div>

      {isAdding && (
        <div style={{
          padding: '16px',
          background: 'var(--bg-color)',
          borderRadius: '12px',
          border: '2px dashed var(--divider)',
          marginBottom: '16px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: 'block'
            }}>口座名</label>
            <input
              type="text"
              className="input-field"
              placeholder="例: メイン口座"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: 'block'
            }}>銀行名</label>
            <input
              type="text"
              className="input-field"
              placeholder="例: 三菱UFJ銀行"
              value={formData.bank_name}
              onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: 'block'
            }}>口座種別</label>
            <select
              className="input-field"
              value={formData.account_type}
              onChange={(e) => setFormData({...formData, account_type: e.target.value})}
            >
              <option value="savings">普通預金</option>
              <option value="checking">当座預金</option>
              <option value="investment">投資口座</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: 'block'
            }}>現在残高</label>
            <input
              type="number"
              inputMode="numeric"
              className="input-field"
              placeholder="0"
              value={formData.balance}
              onChange={(e) => setFormData({...formData, balance: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: '1px solid var(--divider)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.bank_name}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: !formData.name || !formData.bank_name ? 'not-allowed' : 'pointer',
                opacity: !formData.name || !formData.bank_name ? 0.5 : 1
              }}
            >
              {editingAccount ? '更新' : '追加'}
            </button>
          </div>
        </div>
      )}

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <Plus size={18} />
          口座を追加
        </button>
      )}

      {accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏦</div>
          <div className="empty-state-text">口座が登録されていません</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {accounts.map(account => (
              <div
                key={account.id}
                style={{
                  padding: '14px',
                  background: 'var(--bg-color)',
                  borderRadius: '12px',
                  border: '1px solid var(--divider)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <Building2 size={20} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '15px',
                      color: 'var(--text-main)',
                      marginBottom: '4px'
                    }}>
                      {account.name}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}>
                      {account.bank_name} · {accountTypeLabels[account.account_type]}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(account)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer',
                      color: 'var(--primary)'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer',
                      color: 'var(--expense)'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="input-field"
                    placeholder="残高を入力"
                    value={balances[account.id] || ''}
                    onChange={(e) => setBalances({...balances, [account.id]: e.target.value})}
                    onBlur={(e) => handleBalanceUpdate(account.id, e.target.value)}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    minWidth: '120px',
                    textAlign: 'right'
                  }}>
                    ¥{(parseFloat(balances[account.id]) || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)',
            borderRadius: '12px',
            border: '2px solid rgba(0, 122, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-main)'
            }}>
              預金合計
            </span>
            <span style={{
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--primary)',
              letterSpacing: '-0.5px'
            }}>
              ¥{totalBalance.toLocaleString()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
