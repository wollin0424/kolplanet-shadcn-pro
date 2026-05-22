# Lucide icon catalog

Import icon **components by Lucide name** from [`icons.ts`](./icons.ts):

```tsx
import { Settings, RefreshCcw, Truck } from "@/lib/icons";

<Settings size={13} className="text-gray-500" />
```

- **Export name** = **Lucide name** = **`data-icon`** on the inner SVG (e.g. `Settings`)
- **React component tree** (DevTools / Cursor Components): parent node **`Settings`**, then `span[data-slot=Settings]` → `svg`
- **DOM-only tree** (Design/CSS inspector): still shows `svg` → `path` — HTML has no Settings tag; check `data-icon` on the svg or select the **`Settings`** React parent one level up

Do not import from `lucide-react` in feature code — add the icon to `icons.ts` via `createIcon` if missing.

## All exports

| Import | Typical use |
|--------|-------------|
| `AlertCircle` | Pipeline stage alert |
| `Bell` | Top bar notifications |
| `BookOpen` | Campaign guide |
| `Building2` | Settings → organization page |
| `Calendar` | Payment table date filter |
| `Check` | Step done, collab status selected |
| `CheckCircle2` | Pipeline stage complete |
| `CheckSquare` | Campaign detail checklist |
| `ChevronDown` | Selects, dropdowns |
| `ChevronLeft` | Back, pagination prev |
| `ChevronRight` | Hub go, pagination next |
| `CircleDashed` | Pipeline stage pending |
| `Clapperboard` | Hub script cell |
| `Clock` | Scheduled step |
| `Columns3` | Column picker |
| `Copy` | Copy tracking / text |
| `CreditCard` | Hub payment, sidebar, payout action |
| `Download` | Export / template download |
| `ExternalLink` | Campaign header links |
| `FileLock` | Commercial scope lock |
| `FileText` | Contract files, settings contracts |
| `FolderKanban` | Sidebar projects |
| `Hammer` | Page under construction |
| `Hourglass` | Step in progress |
| `Info` | Hints, hub info |
| `Link` | Influencer link field |
| `List` | Hub list sections |
| `Mail` | Email contact channel |
| `MoreHorizontal` | Row overflow menu |
| `MoreVertical` | Payment row menu |
| `Pencil` | Edit fields |
| `Plus` | Add actions |
| `Receipt` | Client payments page |
| `RefreshCcw` | Table refresh |
| `RotateCcw` | Payout undo |
| `ScrollText` | Hub contract cell |
| `Search` | Search inputs |
| `Send` | Hub posting, outreach page |
| `Settings` | Sidebar, plan settings |
| `ShieldCheck` | Roles settings page |
| `SlidersHorizontal` | Table filters |
| `Sparkles` | AI fill in payout sheet |
| `Stamp` | Hub content cell |
| `Tag` | KOL identity type |
| `Trash2` | Delete in quotes matrix |
| `Truck` | Hub logistics, view full log |
| `Upload` | File upload zones |
| `UserRound` | KOL manager |
| `Users` | Sidebar influencers |
| `UsersRound` | Team settings page |
| `Wallet` | Influencer payments page |
| `X` | Close / clear |

## shadcn UI (`src/components/ui/*`)

Keep Lucide `*Icon` imports in primitives only (`CheckIcon`, `XIcon`, …).

## Non-Lucide

`PlatformIcon.tsx` — custom SVG per platform (IG, TT, YT, FB).
