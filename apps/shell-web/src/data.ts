export type ItemStatus = "active" | "paused" | "archived";

export interface Item {
  id: string;
  name: string;
  owner: string;
  status: ItemStatus;
  updated: string;
}

export const ITEMS: Item[] = [
  {
    id: "1",
    name: "Spring campaign",
    owner: "Dana",
    status: "active",
    updated: "2026-11-20",
  },
  {
    id: "2",
    name: "Developer docs",
    owner: "Lee",
    status: "active",
    updated: "2026-11-18",
  },
  {
    id: "3",
    name: "November newsletter",
    owner: "Dana",
    status: "paused",
    updated: "2026-11-12",
  },
  {
    id: "4",
    name: "Careers page",
    owner: "Ana",
    status: "archived",
    updated: "2026-10-30",
  },
  {
    id: "5",
    name: "Q4 webinar",
    owner: "Lee",
    status: "active",
    updated: "2026-10-21",
  },
];

export const STATUSES: ItemStatus[] = ["active", "paused", "archived"];
