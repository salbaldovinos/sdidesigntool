import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { Wifi, WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        isOnline
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700'
      }`}
      title={isOnline ? 'Connected to internet' : 'Working offline - changes saved locally'}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  )
}
