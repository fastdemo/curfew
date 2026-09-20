import { useState } from 'react'
import { RangeTabs } from './RangeTabs'
import { UsageDonut } from './UsageDonut'
import { UsageList } from './UsageList'
import { useUsageRows, type UsageRange } from './useUsage'

// Back-compat wrapper: range tabs + donut + list wired to one shared rows
// value. BlockView composes the pieces directly instead (tabs always
// visible, list inside the expandable region).
export function UsageBreakdown({ highlightDomain }: { highlightDomain?: string }) {
  const [range, setRange] = useState<UsageRange>('today')
  const rows = useUsageRows(range)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
      <RangeTabs range={range} onChange={setRange} />
      <UsageDonut rows={rows} highlightDomain={highlightDomain} />
      <UsageList rows={rows} highlightDomain={highlightDomain} />
    </div>
  )
}
