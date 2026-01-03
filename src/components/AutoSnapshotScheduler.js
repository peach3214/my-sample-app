import React, { useState, useEffect } from 'react';
import { Clock, Check, X } from 'lucide-react';

export default function AutoSnapshotScheduler() {
  const [enabled, setEnabled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [lastSnapshot, setLastSnapshot] = useState(null);

  useEffect(() => {
    // 設定を読み込む
    const savedEnabled = localStorage.getItem('autoSnapshotEnabled') === 'true';
    const savedTime = localStorage.getItem('autoSnapshotTime') || '19:00';
    const savedLast = localStorage.getItem('lastAutoSnapshot');

    setEnabled(savedEnabled);
    setScheduledTime(savedTime);
    if (savedLast) {
      setLastSnapshot(savedLast);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // 毎分チェック
    const interval = setInterval(() => {
      checkAndRunSnapshot();
    }, 60000); // 1分ごと

    // 初回即座にチェック
    checkAndRunSnapshot();

    return () => clearInterval(interval);
  }, [enabled, scheduledTime]);

  const checkAndRunSnapshot = async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    // 今日既に実行済みかチェック
    if (lastSnapshot === today) {
      return;
    }

    // 設定時刻と一致するかチェック
    if (currentTime === scheduledTime) {
      await createAutoSnapshot();
      setLastSnapshot(today);
      localStorage.setItem('lastAutoSnapshot', today);
    }
  };

  const createAutoSnapshot = async () => {
    try {
      // スナップショット作成のイベントを発火
      const event = new CustomEvent('autoSnapshotTriggered');
      window.dispatchEvent(event);

      // 通知を表示
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('資産スナップショット', {
          body: '自動スナップショットを作成しました',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('自動スナップショット作成エラー:', error);
    }
  };

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    localStorage.setItem('autoSnapshotEnabled', String(newEnabled));

    // 通知権限をリクエスト
    if (newEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setScheduledTime(newTime);
    localStorage.setItem('autoSnapshotTime', newTime);
  };

  return (
    <div className="card">
      <div className="card-title">
        <Clock size={20} color="var(--primary)" />
        自動スナップショット
      </div>

      <div style={{
        padding: '16px',
        background: 'var(--bg-color)',
        borderRadius: '12px',
        border: '1px solid var(--divider)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{
              fontWeight: '700',
              fontSize: '15px',
              color: 'var(--text-main)',
              marginBottom: '4px'
            }}>
              定時スナップショット
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              毎日指定時刻に自動作成
            </div>
          </div>
          <button
            onClick={handleToggle}
            style={{
              padding: '8px 16px',
              background: enabled ? 'var(--income)' : 'var(--bg-elevated)',
              color: enabled ? 'white' : 'var(--text-main)',
              border: enabled ? 'none' : '1px solid var(--divider)',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {enabled ? (
              <>
                <Check size={16} />
                有効
              </>
            ) : (
              <>
                <X size={16} />
                無効
              </>
            )}
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            display: 'block'
          }}>実行時刻</label>
          <input
            type="time"
            className="input-field"
            value={scheduledTime}
            onChange={handleTimeChange}
            disabled={!enabled}
            style={{
              opacity: enabled ? 1 : 0.5
            }}
          />
        </div>

        {lastSnapshot && (
          <div style={{
            padding: '12px',
            background: 'rgba(52, 199, 89, 0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            最終実行: {lastSnapshot}
          </div>
        )}

        {enabled && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(0, 122, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--text-main)'
          }}>
            💡 ヒント: ブラウザを開いている必要があります
          </div>
        )}
      </div>
    </div>
  );
}
