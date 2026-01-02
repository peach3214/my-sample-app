import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

export default function NotificationSettings({ onClose }) {
  const [permission, setPermission] = useState(Notification.permission);
  const [settings, setSettings] = useState({
    transactionAdded: true,
    dailyReminder: false,
    monthEnd: true
  });

  useEffect(() => {
    // 保存された設定を読み込む
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知をサポートしていません');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      // テスト通知を表示
      new Notification('🎉 通知が有効になりました！', {
        body: '家計簿アプリからの通知を受け取れます',
        icon: '/icon-192.png'
      });
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: '428px',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideUp 0.3s ease',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--divider)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-elevated)',
          zIndex: 1
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Bell size={24} color="var(--primary)" />
            通知設定
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-color)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* コンテンツ */}
        <div style={{ padding: '24px' }}>
          {/* 通知許可状態 */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: permission === 'granted' 
              ? 'rgba(52, 199, 89, 0.1)' 
              : 'rgba(255, 59, 48, 0.1)',
            border: `1px solid ${permission === 'granted' ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`,
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {permission === 'granted' ? (
                <Bell size={24} color="var(--income)" />
              ) : (
                <BellOff size={24} color="var(--expense)" />
              )}
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>
                  {permission === 'granted' ? '通知が有効です' : '通知が無効です'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {permission === 'granted' 
                    ? '取引の記録や月末の集計を通知します' 
                    : '通知を有効にすると便利な情報を受け取れます'}
                </div>
              </div>
            </div>
            
            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                style={{
                  width: '100%',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                通知を有効にする
              </button>
            )}
          </div>

          {/* 通知の種類 */}
          {permission === 'granted' && (
            <div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '16px'
              }}>
                通知の種類
              </h3>

              {/* 取引追加通知 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid var(--divider)'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-main)' }}>
                    取引の記録
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    取引を追加したときに通知
                  </div>
                </div>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.transactionAdded}
                    onChange={(e) => handleSettingChange('transactionAdded', e.target.checked)}
                    style={{
                      width: '50px',
                      height: '30px',
                      cursor: 'pointer',
                      accentColor: 'var(--primary)'
                    }}
                  />
                </label>
              </div>

              {/* 月末集計通知 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid var(--divider)'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-main)' }}>
                    月末の集計
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    月末に収支をまとめて通知
                  </div>
                </div>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.monthEnd}
                    onChange={(e) => handleSettingChange('monthEnd', e.target.checked)}
                    style={{
                      width: '50px',
                      height: '30px',
                      cursor: 'pointer',
                      accentColor: 'var(--primary)'
                    }}
                  />
                </label>
              </div>

              {/* 入力リマインダー（将来実装用） */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                opacity: 0.5
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-main)' }}>
                    入力リマインダー
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    毎日の入力を促す通知（近日実装）
                  </div>
                </div>
                <label style={{ cursor: 'not-allowed' }}>
                  <input
                    type="checkbox"
                    checked={settings.dailyReminder}
                    disabled
                    style={{
                      width: '50px',
                      height: '30px',
                      cursor: 'not-allowed',
                      accentColor: 'var(--primary)'
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* 説明 */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--bg-color)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              💡 <strong>ヒント：</strong> 通知を有効にすると、取引を記録したときや月末の集計時に自動で通知が届きます。いつでも設定から変更できます。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
