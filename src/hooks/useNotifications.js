import { useEffect } from 'react';

// ブラウザ通知の許可をリクエスト
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('このブラウザは通知をサポートしていません');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// 通知を表示
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    });

    // 通知をクリックしたらアプリにフォーカス
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 5秒後に自動で閉じる
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }
};

// 取引追加の通知を表示
export const notifyTransactionAdded = (transaction) => {
  const typeText = transaction.type === 'income' ? '収入' : '支出';
  const emoji = transaction.type === 'income' ? '💰' : '💸';
  
  showNotification(`${emoji} ${typeText}を記録しました`, {
    body: `${transaction.location} - ¥${transaction.amount.toLocaleString()}`,
    tag: 'transaction-added',
    requireInteraction: false
  });
};

// 月の締め日に通知（例：月末）
export const notifyMonthEnd = (totalIncome, totalExpense) => {
  const balance = totalIncome - totalExpense;
  const balanceText = balance >= 0 ? `+¥${balance.toLocaleString()}` : `-¥${Math.abs(balance).toLocaleString()}`;
  
  showNotification('📊 今月の集計', {
    body: `収入: ¥${totalIncome.toLocaleString()}\n支出: ¥${totalExpense.toLocaleString()}\n残金: ${balanceText}`,
    tag: 'month-summary',
    requireInteraction: true
  });
};

// カスタムフック: 通知の初期化
export const useNotifications = () => {
  useEffect(() => {
    // アプリ起動時に通知許可をリクエスト
    const initNotifications = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        console.log('通知が有効になりました');
      }
    };

    initNotifications();
  }, []);

  return {
    requestPermission: requestNotificationPermission,
    showNotification,
    notifyTransactionAdded,
    notifyMonthEnd
  };
};
