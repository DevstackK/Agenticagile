import { useEffect, useState } from 'react'
import { getStorageStatus, onStorageStatusChange } from '../lib/storage'

export function StorageWarningBanner() {
  const [available, setAvailable] = useState(() => getStorageStatus().available)

  useEffect(() => {
    return onStorageStatusChange((status) => setAvailable(status.available))
  }, [])

  if (available) return null

  return (
    <div className="storage-warning-banner" role="alert">
      Your browser storage is unavailable or full. Your answers are still active in this tab, but won't be
      auto-saved — use "Export Session for Sharing" to save your work to a file before closing this tab.
    </div>
  )
}
