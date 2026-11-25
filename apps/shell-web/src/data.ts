export type ItemStatus = 'active' | 'paused' | 'archived'

export interface Item {
  id: string
  name: string
  owner: string
  status: ItemStatus
  updated: string
  email: string
  region: string
  plan: string
  /** Where it came from and when (a two-line cell). */
  source: string
  imported: number
  created: string
}

export const STATUSES: ItemStatus[] = ['active', 'paused', 'archived']

const NAMED: Pick<Item, 'name' | 'owner' | 'status' | 'updated'>[] = [
  {
    name: 'Spring campaign',
    owner: 'Dana',
    status: 'active',
    updated: '2026-11-20',
  },
  {
    name: 'Developer docs',
    owner: 'Lee',
    status: 'active',
    updated: '2026-11-18',
  },
  {
    name: 'November newsletter',
    owner: 'Dana',
    status: 'paused',
    updated: '2026-11-12',
  },
  {
    name: 'Careers page',
    owner: 'Ana',
    status: 'archived',
    updated: '2026-10-30',
  },
  { name: 'Q4 webinar', owner: 'Lee', status: 'active', updated: '2026-10-21' },
]
const TOPICS = [
  'Launch',
  'Survey',
  'Landing page',
  'Release notes',
  'Workshop',
  'Case study',
]
const OWNERS = ['Dana', 'Lee', 'Ana', 'Sam']

function day(offset: number): string {
  return new Date(Date.UTC(2026, 9, 20) - offset * 86_400_000)
    .toISOString()
    .slice(0, 10)
}

const REGIONS = ['eastus', 'westeurope', 'japaneast', 'australiaeast']
const PLANS = ['Free', 'Team', 'Business']
const SOURCES = ['Imported', 'Created', 'Synced']

/** 500 items: five named ones, then generated filler for the paging demo. */
export const ITEMS: Item[] = [
  ...NAMED,
  ...Array.from({ length: 495 }, (_, i) => ({
    name: `${TOPICS[i % TOPICS.length]} ${i + 6}`,
    owner: OWNERS[i % OWNERS.length] as string,
    status: STATUSES[i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0] as ItemStatus,
    updated: day(Math.floor(i / 3)),
  })),
].map((item, i) => ({
  ...item,
  id: String(i + 1),
  // The first one carries an 80-character address to show clipping.
  email:
    i === 0
      ? 'spring.campaign.marketing.team.shared.inbox@subscriptions.example-enterprise.com'
      : `${item.owner.toLowerCase()}.${i + 1}@example.com`,
  region: REGIONS[i % REGIONS.length] as string,
  plan: PLANS[i % PLANS.length] as string,
  source: SOURCES[i % SOURCES.length] as string,
  imported: (i % 30) + 1,
  created: day(Math.floor(i / 2) + 40),
}))

/** A fake paged endpoint: one page of `ITEMS` after a short delay. */
export async function fetchItemsPage(
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<{ rows: Item[]; total: number }> {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 400)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
  const start = (page - 1) * pageSize
  return { rows: ITEMS.slice(start, start + pageSize), total: ITEMS.length }
}
