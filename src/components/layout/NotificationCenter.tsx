import React from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { Bell, Check, ChevronRight, X, AlertTriangle, Info, Sparkles } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab, setSelectedRecipeId } = useKitchen();

  if (!isOpen) return null;

  const handleAction = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    if (notif.recipeId) {
      setSelectedRecipeId(notif.recipeId);
    }
    if (notif.actionRoute) {
      setActiveTab(notif.actionRoute);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full sm:max-w-md bg-white sm:rounded-3xl shadow-float border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden sm:mt-14 sm:mr-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Actionable Kitchen Alerts</h3>
              <p className="text-xs text-slate-500">Zero-waste alerts requiring attention</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-slate-500 hover:text-emerald-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No new alerts right now.</p>
              <p className="text-xs text-slate-400">Everything is under control in your kitchen!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-2xl transition-all ${
                  notif.read ? 'bg-white opacity-70' : 'bg-emerald-50/40 border border-emerald-100/70'
                } hover:bg-slate-50 my-1`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {notif.type === 'urgent' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                    {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                    {notif.type === 'tip' && <Sparkles className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-sm text-slate-800 truncate">{notif.title}</h4>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                    {notif.actionLabel && (
                      <button
                        onClick={() => handleAction(notif)}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl shadow-sm transition-all"
                      >
                        <span>{notif.actionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
