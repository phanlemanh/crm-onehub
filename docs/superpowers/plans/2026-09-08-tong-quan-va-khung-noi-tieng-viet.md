# Màn Tổng quan và khung điều hướng nói tiếng Việt — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Màn `/` và khung bao quanh mọi màn (rail, thanh đầu, ngăn kéo di động, ⌘K, hàng đợi làm giàu) đọc chữ từ kho chuỗi theo tiếng nhân viên chọn, và bộ thước màn nhìn thấy cả khung.

**Architecture:** Hai kho chuỗi mới (`tong-quan.ts`, `khung-ung-dung.ts`) theo đúng khuôn `{ en, vi, satisfies, BANG, xxxMessages(locale) }` của mười chín kho đang có. Nhãn rail tách khỏi khoá điều khiển bằng module thuần `khung-dieu-huong.ts`. Thước: bốn mũi AST của ③b dùng lại qua `--lat`; `GOM`/`DO_RONG` của thư viện thước nhận tham số `toanMan` (mặc định gốc cũ); một `man-that.mjs` mới cho lát.

**Tech Stack:** Next.js App Router, React, bun test, puppeteer-core + Chrome, TypeScript compiler API (thước AST).

**Spec:** `docs/superpowers/specs/2026-09-08-tong-quan-va-khung-noi-tieng-viet-design.md` · hợp đồng `_acceptance/tong-quan-va-khung-noi-tieng-viet/contract.md` · eval `_acceptance/tong-quan-va-khung-noi-tieng-viet/evals.yaml`

## Global Constraints

- Không chú thích trong code (AGENTS.md, CLAUDE.md).
- Kho chuỗi: một hàm xuất duy nhất `xxxMessages(locale)`; bản `vi` có dấu; không giá trị `vi` y hệt `en`; mỗi hàm ghép biến có khẳng định ghim trong `apps/app/test/messages-guard.spec.ts` (bảng `GHIM`, khoá dạng `<kho>:<đường.khoá>`).
- Danh từ theo `CONTEXT.md`: công ty · cá nhân · thoả thuận · hội thoại · chiến dịch · tác nhân. Thẻ số nói giọng đối tác: *chốt được · đang mở · tỷ lệ chốt · không thành* — không *thắng/thua/pipeline*.
- Bảy nhãn giai đoạn thoả thuận GIỮ tiếng Anh, `lang="en"` (không đổi `lib/deal-stage.ts`).
- Dữ liệu người nhập mang `translate="no"` ở nơi chạm màn.
- Không đổi bố cục, component nền, luồng, phím tắt, breakpoint.
- Mọi `rang/*.mjs` suy gốc kho từ `import.meta.url`; không chép thân hàm ≥12 dòng từ `rang/` của ③a, ③b, lát tác nhân.
- Mỗi phép đo mới chỉ tính XONG khi có cặp hai chiều trên cùng fixture (khoản `MEASURE-BIRTH-CLAUSE`).
- Lệnh chứng của kho: `bun run test` · `check-types` · `lint` · `lint:slop` · `build`. Cần `bun` trên PATH (`/opt/homebrew/bin/bun`).

---

### Task 0: Dựng môi trường dev trên máy này

**Files:**
- Create: `.env` (không vào git)

Máy Mac mini mới: đã có `bun` 1.4.2 (Homebrew), Docker daemon chạy, chưa có `.env`, chưa có DB.

- [ ] **Step 1: Postgres**

```bash
docker compose up -d postgres && docker ps --filter name=crm-postgres --format '{{.Status}}'
```
Expected: `Up … (healthy)`.

- [ ] **Step 2: `.env` từ mẫu**

```bash
cp .env.example .env
S=$(openssl rand -base64 32)
sed -i '' "s|^BETTER_AUTH_SECRET=\"\"|BETTER_AUTH_SECRET=\"$S\"|; s|^ALLOWED_SIGN_IN=\"\"|ALLOWED_SIGN_IN=\"dev@localhost\"|" .env
grep -n "BETTER_AUTH_SECRET\|ALLOWED_SIGN_IN\|DATABASE_URL" .env
```

- [ ] **Step 3: Cài, migrate, seed**

```bash
bun install --frozen-lockfile && bun run db:migrate && bun run db:seed
```
Expected: exit 0; seed in số công ty/cá nhân/thoả thuận.

- [ ] **Step 4: Chạy hai máy chủ nền (không TTY nên chạy từng app)**

```bash
(cd apps/api && nohup bun run dev > /tmp/crm-api.log 2>&1 &)
(cd apps/app && nohup bun run dev > /tmp/crm-app.log 2>&1 &)
sleep 20; curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/sign-in
```
Expected: `200`.

- [ ] **Step 5: Phiên đăng nhập**

```bash
cd apps/api && bun run dev:session dev@localhost | tail -1
```
Expected: một dòng `cookie=giá-trị`. Thước gọi lại lệnh này qua `phien()` với `NGUOI=dev@localhost`.

---

### Task 1: Kho chuỗi khung ứng dụng

**Files:**
- Create: `apps/app/lib/messages/khung-ung-dung.ts`
- Modify: `apps/app/test/messages-guard.spec.ts` (bảng `GHIM`, thêm ba dòng)
- Test: `apps/app/test/messages-guard.spec.ts` (tự đọc thư mục, không cần khai)

**Interfaces:**
- Produces: `khungUngDungMessages(locale: Locale): KhungUngDungMessages` với nhánh `rail.{overview,chat,companies,contacts,deals,campaigns,settings}` · `nav.{primary,mobile,mobileChat,title,titleChat,close,open}` · `header.{homepage,accountMenu,lightMode,darkMode,signOut,signOutFailed,loading,otherLocale}` · `switcher.{title,description,placeholder,typeMore,noMatch,groups.{company,contact,deal}}` · `enrichment.{enriching,enrichingCount(n),hide,show,bookedOne,bookedMany(n)}`.

- [ ] **Step 1: Viết bài kiểm ghim cho ba hàm ghép biến** — thêm vào `GHIM` trong `messages-guard.spec.ts`:

```ts
"khung-ung-dung:enrichment.enrichingCount": ["Đang tra cứu 1", "Đang tra cứu 12"],
"khung-ung-dung:enrichment.bookedMany": ["12 bản ghi hẹn tra cứu sau", "12 bản ghi hẹn tra cứu sau"],
```
(hàm `bookedMany` nhận một đối số; bài kiểm gọi với "1" và "12" — ghim đúng chuỗi trả về cho từng đối số.)

- [ ] **Step 2: Chạy để thấy đỏ** — `cd apps/app && bun test test/messages-guard.spec.ts` → đỏ vì kho chưa tồn tại ("số hàm bằng số khẳng định" lệch).

- [ ] **Step 3: Viết kho**

```ts
import type { Locale } from "@crm/ui/lib/locale";

const en = {
	rail: {
		overview: "Overview",
		chat: "Chat",
		companies: "Companies",
		contacts: "Contacts",
		deals: "Deals",
		campaigns: "Campaigns",
		settings: "Settings",
	},
	nav: {
		primary: "Primary",
		mobile: "Mobile navigation",
		mobileChat: "Navigation and agent chats",
		title: "Navigation",
		close: "Close navigation",
		open: "Open navigation",
	},
	header: {
		homepage: "Homepage",
		accountMenu: "Account menu",
		lightMode: "Light mode",
		darkMode: "Dark mode",
		signOut: "Sign out",
		signOutFailed: "Could not sign out.",
		loading: "Loading workspace header…",
		otherLocale: "Tiếng Việt",
	},
	switcher: {
		title: "Search",
		description: "Jump to a company, contact or deal",
		placeholder: "Search companies, contacts and deals…",
		typeMore: "Type at least two characters.",
		noMatch: "Nothing matches.",
		groups: { company: "Companies", contact: "Contacts", deal: "Deals" },
	},
	enrichment: {
		enriching: "Enriching",
		enrichingCount: (n: string) => `Enriching ${n}`,
		hide: "Hide",
		show: "Show",
		bookedOne: "1 record is booked for a later look",
		bookedMany: (n: string) => `${n} records are booked for a later look`,
	},
};

export type KhungUngDungMessages = typeof en;

const vi = {
	rail: {
		overview: "Tổng quan",
		chat: "Hội thoại",
		companies: "Công ty",
		contacts: "Cá nhân",
		deals: "Thoả thuận",
		campaigns: "Chiến dịch",
		settings: "Cài đặt",
	},
	nav: {
		primary: "Điều hướng chính",
		mobile: "Điều hướng trên máy nhỏ",
		mobileChat: "Điều hướng và hội thoại",
		title: "Điều hướng",
		close: "Đóng điều hướng",
		open: "Mở điều hướng",
	},
	header: {
		homepage: "Trang chủ",
		accountMenu: "Menu tài khoản",
		lightMode: "Nền sáng",
		darkMode: "Nền tối",
		signOut: "Đăng xuất",
		signOutFailed: "Chưa đăng xuất được.",
		loading: "Đang tải thanh đầu…",
		otherLocale: "English",
	},
	switcher: {
		title: "Tìm nhanh",
		description: "Nhảy tới một công ty, cá nhân hay thoả thuận",
		placeholder: "Tìm công ty, cá nhân, thoả thuận…",
		typeMore: "Gõ ít nhất hai ký tự.",
		noMatch: "Không có gì khớp.",
		groups: { company: "Công ty", contact: "Cá nhân", deal: "Thoả thuận" },
	},
	enrichment: {
		enriching: "Đang tra cứu",
		enrichingCount: (n: string) => `Đang tra cứu ${n}`,
		hide: "Ẩn",
		show: "Hiện",
		bookedOne: "1 bản ghi hẹn tra cứu sau",
		bookedMany: (n: string) => `${n} bản ghi hẹn tra cứu sau`,
	},
} satisfies KhungUngDungMessages;

const BANG = { en, vi } satisfies Record<Locale, KhungUngDungMessages>;

export function khungUngDungMessages(locale: Locale): KhungUngDungMessages {
	return BANG[locale];
}
```

Lưu ý `header.otherLocale`: nhãn nút đổi tiếng là tên của tiếng KIA — bản `en` ghi "Tiếng Việt", bản `vi` ghi "English"; hai giá trị khác nhau nên qua bộ canh; khoá `header.otherLocale` phải vào `KHONG_DAU` (bản `vi` là "English", không dấu).

- [ ] **Step 4: Thêm `"header.otherLocale"` vào `KHONG_DAU`** trong `messages-guard.spec.ts`.

- [ ] **Step 5: Chạy xanh** — `cd apps/app && bun test test/messages-guard.spec.ts` → PASS.

- [ ] **Step 6: Commit** — `git add apps/app/lib/messages/khung-ung-dung.ts apps/app/test/messages-guard.spec.ts && git commit -m "feat(app): kho chuỗi khung ứng dụng — rail, thanh đầu, ⌘K, hàng đợi làm giàu"`

---

### Task 2: Kho chuỗi màn Tổng quan

**Files:**
- Create: `apps/app/lib/messages/tong-quan.ts`
- Modify: `apps/app/test/messages-guard.spec.ts` (`GHIM`)

**Interfaces:**
- Produces: `tongQuanMessages(locale)` với `title` · `greeting.{title,me,everyone}` · `scope.{label,me,everyone}` · `stats.{closedWon,vsLastMonth,closedWonDesc(n,money),openPipeline,openPipelineDesc(n,money),winRate(days),nothingClosed,wonLost(w,l),avgDeal(days),noWins,avgCycle(days)}` · `unconverted.{sentence(n,currencies,reporting),setOne}` · `trend.{title,description,won,created,empty}` · `byStage.{title,description,center,empty}` · `open.{title,description,button,empty,cols.{deal,stage,share,value}}` · `tasks.{title,allDone,pastDue(n),empty,markDone,noDueDate,cols.{done,task,overdue}}` · `activity.{titleMine,title,descMine,desc,button,empty,cols.{activity,company,deal,who,when}}`.

- [ ] **Step 1: Ghim hàm ghép biến** — thêm vào `GHIM`:

```ts
"tong-quan:stats.closedWonDesc": ["1 thoả thuận · Y tháng trước", "12 thoả thuận · Y tháng trước"],
"tong-quan:stats.openPipelineDesc": ["1 thoả thuận đang mở · Y hạn chốt tháng này", "12 thoả thuận đang mở · Y hạn chốt tháng này"],
"tong-quan:stats.winRate": ["Tỷ lệ chốt (1 ngày)", "Tỷ lệ chốt (12 ngày)"],
"tong-quan:stats.wonLost": ["1 chốt được · Y không thành", "12 chốt được · Y không thành"],
"tong-quan:stats.avgDeal": ["Trung bình mỗi thoả thuận (1 ngày)", "Trung bình mỗi thoả thuận (12 ngày)"],
"tong-quan:stats.avgCycle": ["Chu kỳ trung bình 1 ngày", "Chu kỳ trung bình 12 ngày"],
"tong-quan:unconverted.sentence": [
	"Mọi con số trên đây tính bằng Z. 1 thoả thuận bằng Y không được tính vì chưa có tỷ giá để quy đổi.",
	"Mọi con số trên đây tính bằng Z. 12 thoả thuận bằng Y không được tính vì chưa có tỷ giá để quy đổi.",
],
"tong-quan:tasks.pastDue": ["1 việc quá hạn", "12 việc quá hạn"],
```

- [ ] **Step 2: Chạy để thấy đỏ** — `bun test test/messages-guard.spec.ts`.

- [ ] **Step 3: Viết kho** — bản `en` chép NGUYÊN VĂN chữ đang có trong `dashboard-summary.tsx` / `sales-dashboard.tsx` / `overview-greeting.tsx` / `overview-scope.tsx` (để màn tiếng Anh không đổi một ký tự), bản `vi` theo bảng từ vựng của design doc:

```ts
import type { Locale } from "@crm/ui/lib/locale";

const en = {
	title: "Overview",
	greeting: {
		title: "Welcome back",
		me: "What you have closed, what is still in play, and what needs you today.",
		everyone: "What the team has closed, what is still in play, and what needs you today.",
	},
	scope: { label: "Whose numbers to show", me: "Me", everyone: "Everyone" },
	stats: {
		closedWon: "Closed won this month",
		vsLastMonth: "vs. last month",
		closedWonDesc: (n: string, money: string) => `${n} · ${money} last month`,
		openPipeline: "Open pipeline",
		openPipelineDesc: (n: string, money: string) => `${n} in progress · ${money} due this month`,
		winRate: (days: string) => `Win rate (${days}d)`,
		nothingClosed: "Nothing has closed yet",
		wonLost: (w: string, l: string) => `${w} won · ${l} lost`,
		avgDeal: (days: string) => `Average deal (${days}d)`,
		noWins: "No wins to measure",
		avgCycle: (days: string) => `${days}-day average cycle`,
		dealNoun: "deal",
	},
	unconverted: {
		sentence: (n: string, currencies: string, reporting: string) =>
			`Every figure above is in ${reporting}. ${n} in ${currencies} not included — there is no rate to convert with.`,
		setOne: "Set one",
	},
	trend: {
		title: "Closed won vs. new pipeline",
		description: "Last six months, by the month a deal closed or was created",
		won: "Closed won",
		created: "New pipeline",
		empty: "No deals closed or created yet",
	},
	byStage: {
		title: "Open pipeline by stage",
		description: "Where the value sits right now",
		center: "open",
		empty: "Nothing open",
	},
	open: {
		title: "Deals in progress",
		description: "The largest open deals, and how long each has sat in its stage",
		button: "Open deals",
		empty: "Nothing open. Time to fill the pipeline.",
		cols: { deal: "Deal", stage: "Stage", share: "Share of the largest", value: "Value" },
	},
	tasks: {
		title: "Overdue tasks",
		allDone: "Every task you have logged is either done or still to come",
		pastDue: (n: string) => `${n} past due`,
		empty: "Nothing overdue. Good.",
		markDone: "Mark as done",
		noDueDate: "No due date",
		cols: { done: "Done", task: "Task", overdue: "Overdue" },
	},
	activity: {
		titleMine: "Your recent activity",
		title: "Recent activity",
		descMine: "Every note, task and stage change you have logged",
		desc: "Every note, task and stage change across the workspace",
		button: "All companies",
		empty: "Nothing has happened yet.",
		cols: { activity: "Activity", company: "Company", deal: "Deal", who: "Who", when: "When" },
	},
};

export type TongQuanMessages = typeof en;

const vi = {
	title: "Tổng quan",
	greeting: {
		title: "Chào bạn",
		me: "Bạn đã chốt được gì, còn gì đang mở, và hôm nay cần bạn ở đâu.",
		everyone: "Đội đã chốt được gì, còn gì đang mở, và hôm nay cần bạn ở đâu.",
	},
	scope: { label: "Xem số của ai", me: "Tôi", everyone: "Cả đội" },
	stats: {
		closedWon: "Chốt được tháng này",
		vsLastMonth: "so với tháng trước",
		closedWonDesc: (n: string, money: string) => `${n} · ${money} tháng trước`,
		openPipeline: "Đang mở",
		openPipelineDesc: (n: string, money: string) => `${n} đang mở · ${money} hạn chốt tháng này`,
		winRate: (days: string) => `Tỷ lệ chốt (${days} ngày)`,
		nothingClosed: "Chưa chốt thoả thuận nào",
		wonLost: (w: string, l: string) => `${w} chốt được · ${l} không thành`,
		avgDeal: (days: string) => `Trung bình mỗi thoả thuận (${days} ngày)`,
		noWins: "Chưa có thoả thuận chốt được để tính",
		avgCycle: (days: string) => `Chu kỳ trung bình ${days} ngày`,
		dealNoun: "thoả thuận",
	},
	unconverted: {
		sentence: (n: string, currencies: string, reporting: string) =>
			`Mọi con số trên đây tính bằng ${reporting}. ${n} bằng ${currencies} không được tính vì chưa có tỷ giá để quy đổi.`,
		setOne: "Đặt tỷ giá",
	},
	trend: {
		title: "Đã chốt so với mới mở",
		description: "Sáu tháng gần nhất, theo tháng thoả thuận chốt hoặc được mở",
		won: "Đã chốt",
		created: "Mới mở",
		empty: "Chưa có thoả thuận nào chốt hay mở",
	},
	byStage: {
		title: "Đang mở theo giai đoạn",
		description: "Giá trị đang nằm ở đâu",
		center: "đang mở",
		empty: "Chưa có thoả thuận nào mở",
	},
	open: {
		title: "Thoả thuận đang mở",
		description: "Những thoả thuận mở lớn nhất, và mỗi cái đã ở giai đoạn hiện tại bao lâu",
		button: "Mở danh sách",
		empty: "Chưa có thoả thuận nào mở.",
		cols: { deal: "Thoả thuận", stage: "Giai đoạn", share: "Tỷ lệ so với cái lớn nhất", value: "Giá trị" },
	},
	tasks: {
		title: "Việc quá hạn",
		allDone: "Mọi việc bạn ghi đều đã xong hoặc chưa tới hạn",
		pastDue: (n: string) => `${n} việc quá hạn`,
		empty: "Không có việc quá hạn.",
		markDone: "Đánh dấu đã xong",
		noDueDate: "Chưa có hạn",
		cols: { done: "Xong", task: "Việc", overdue: "Quá hạn" },
	},
	activity: {
		titleMine: "Hoạt động gần đây của bạn",
		title: "Hoạt động gần đây",
		descMine: "Mọi ghi chú, việc và đổi giai đoạn bạn đã ghi",
		desc: "Mọi ghi chú, việc và đổi giai đoạn trong công ty",
		button: "Mọi công ty",
		empty: "Chưa có hoạt động nào.",
		cols: { activity: "Hoạt động", company: "Công ty", deal: "Thoả thuận", who: "Ai", when: "Khi nào" },
	},
} satisfies TongQuanMessages;

const BANG = { en, vi } satisfies Record<Locale, TongQuanMessages>;

export function tongQuanMessages(locale: Locale): TongQuanMessages {
	return BANG[locale];
}
```

`closedWonDesc(n, money)`: chỗ gọi truyền `n = formatCount(count, m.stats.dealNoun, locale)` — bản `vi` cho "3 thoả thuận", bản `en` cho "3 deals". Hàm ghép của `en` nhận "1" và "12" ở bài kiểm ghim nên bản `vi` ghim ở `GHIM` là `"1 thoả thuận · Y tháng trước"`? KHÔNG — `hienRa` gọi `v("X","Y","Z")` cho vế có-dấu, còn `GHIM` gọi với "1"/"12" cho đối số đầu và "Y"/"Z" cho các đối số sau, nên chuỗi ghim của `closedWonDesc` là `"1 · Y tháng trước"` và `"12 · Y tháng trước"`; sửa hai dòng `GHIM` ở Step 1 cho đúng dạng này trước khi chạy. Tương tự `openPipelineDesc` → `"1 đang mở · Y hạn chốt tháng này"`, `unconverted.sentence` → `"Mọi con số trên đây tính bằng Z. 1 bằng Y không được tính vì chưa có tỷ giá để quy đổi."`.

- [ ] **Step 4: Chạy xanh** — `bun test test/messages-guard.spec.ts`.

- [ ] **Step 5: Commit** — `git commit -m "feat(app): kho chuỗi màn Tổng quan"`.

---

### Task 3: Tách nhãn rail khỏi khoá điều khiển

**Files:**
- Create: `apps/app/lib/khung-dieu-huong.ts`
- Test: `apps/app/test/khung-dieu-huong.spec.ts`

**Interfaces:**
- Produces: `MUC_RAIL: readonly MucRail[]` với `{ key: "overview"|"chat"|"companies"|"contacts"|"deals"|"campaigns"|"settings"; href; match; related? }` (không icon — icon ở component); `laMucHoiThoai(m: MucRail): boolean`; `mucDangMo(m: MucRail, pathname: string, workspaceUrl: (p: string) => string): boolean`; `nhanRail(m: MucRail, locale: Locale): string`.

- [ ] **Step 1: Bài kiểm đỏ**

```ts
import { describe, expect, it } from "bun:test";
import { laMucHoiThoai, MUC_RAIL, mucDangMo, nhanRail } from "@/lib/khung-dieu-huong";

const wu = (p: string) => `/onehub${p === "/" ? "" : p}`;

describe("khung điều hướng", () => {
	it("mục hội thoại nhận ra bằng khoá, không bằng nhãn", () => {
		const chat = MUC_RAIL.find((m) => m.key === "chat");
		expect(chat && laMucHoiThoai(chat)).toBe(true);
		expect(MUC_RAIL.filter(laMucHoiThoai)).toHaveLength(1);
	});
	it("nhãn lượt vi có dấu và khác lượt en cho cả bảy mục", () => {
		for (const m of MUC_RAIL) {
			expect(nhanRail(m, "vi")).not.toBe(nhanRail(m, "en"));
			expect(/[ăâđêôơưàảãáạ]/i.test(nhanRail(m, "vi")) || m.key === "chat").toBe(true);
		}
	});
	it("mục đang mở theo pathname", () => {
		const by = (k: string) => MUC_RAIL.find((m) => m.key === k)!;
		expect(mucDangMo(by("overview"), "/onehub", wu)).toBe(true);
		expect(mucDangMo(by("overview"), "/onehub/deals", wu)).toBe(false);
		expect(mucDangMo(by("chat"), "/onehub/agents/x", wu)).toBe(true);
		expect(mucDangMo(by("companies"), "/onehub/companies/y", wu)).toBe(true);
	});
});
```

- [ ] **Step 2: Chạy đỏ** — `cd apps/app && bun test test/khung-dieu-huong.spec.ts` → module không tồn tại.

- [ ] **Step 3: Viết module**

```ts
import type { Locale } from "@crm/ui/lib/locale";
import { khungUngDungMessages } from "@/lib/messages/khung-ung-dung";

export type MucRailKey = "overview" | "chat" | "companies" | "contacts" | "deals" | "campaigns" | "settings";

export type MucRail = {
	key: MucRailKey;
	href: string;
	match: "exact" | "prefix";
	related?: readonly string[];
};

export const MUC_RAIL: readonly MucRail[] = [
	{ key: "overview", href: "/", match: "exact" },
	{ key: "chat", href: "/chat", match: "prefix", related: ["/agents"] },
	{ key: "companies", href: "/companies", match: "prefix" },
	{ key: "contacts", href: "/contacts", match: "prefix" },
	{ key: "deals", href: "/deals", match: "prefix" },
	{ key: "campaigns", href: "/campaigns", match: "prefix" },
	{ key: "settings", href: "/settings", match: "prefix" },
];

export function laMucHoiThoai(m: MucRail): boolean {
	return m.key === "chat";
}

export function mucDangMo(m: MucRail, pathname: string, workspaceUrl: (p: string) => string): boolean {
	const href = workspaceUrl(m.href);
	return (
		pathname === href ||
		(m.match === "prefix" && pathname.startsWith(href)) ||
		Boolean(m.related?.some((p) => pathname.startsWith(workspaceUrl(p))))
	);
}

export function nhanRail(m: MucRail, locale: Locale): string {
	return khungUngDungMessages(locale).rail[m.key];
}
```

- [ ] **Step 4: Chạy xanh**; đảo `laMucHoiThoai` thành `nhanRail(m, "en") === "Chat"` để thấy bài kiểm 1 vẫn xanh nhưng thêm ca: `expect(laMucHoiThoai({ ...chat, key: "chat" })).toBe(true)` giữ nguyên; chiều đỏ của AC-16 là đổi về so sánh nhãn `vi`: `nhanRail(m,"vi") === "Chat"` → đỏ. Ghi lại lượt đỏ này trong evidence.

- [ ] **Step 5: Commit** — `git commit -m "feat(app): mục rail có khoá riêng, nhãn đọc từ kho"`.

---

### Task 4: Câu lỗi đăng xuất đi qua tham số

**Files:**
- Modify: `apps/app/lib/sign-out.ts`
- Test: `apps/app/test/sign-out.spec.ts`

**Interfaces:**
- Produces: `signOutAndRedirect(loiMacDinh: string): Promise<void>`.

- [ ] **Step 1: Bài kiểm đỏ**

```ts
import { beforeEach, describe, expect, it, mock } from "bun:test";

const signOut = mock(async () => ({ error: null as null | { message?: string } }));
const toastError = mock((_: string) => {});
mock.module("@crm/auth/client", () => ({ signOut }));
mock.module("sonner", () => ({ toast: { error: toastError } }));

const { signOutAndRedirect } = await import("@/lib/sign-out");

describe("đăng xuất", () => {
	beforeEach(() => {
		signOut.mockReset();
		toastError.mockReset();
		(globalThis as { window?: unknown }).window = { location: { assign: mock(() => {}) } };
	});
	it("bị từ chối → toast đúng câu truyền vào, không chuyển hướng", async () => {
		signOut.mockResolvedValue({ error: {} });
		await signOutAndRedirect("Chưa đăng xuất được.");
		expect(toastError).toHaveBeenCalledTimes(1);
		expect(toastError).toHaveBeenCalledWith("Chưa đăng xuất được.");
		expect((globalThis as { window: { location: { assign: ReturnType<typeof mock> } } }).window.location.assign).not.toHaveBeenCalled();
	});
	it("thành công → chuyển hướng, không toast", async () => {
		signOut.mockResolvedValue({ error: null });
		await signOutAndRedirect("Chưa đăng xuất được.");
		expect(toastError).not.toHaveBeenCalled();
		expect((globalThis as { window: { location: { assign: ReturnType<typeof mock> } } }).window.location.assign).toHaveBeenCalledWith("/sign-in");
	});
});
```

- [ ] **Step 2: Chạy đỏ** — `bun test test/sign-out.spec.ts` → sai chữ ký / toast nhận "Could not sign out.".

- [ ] **Step 3: Sửa `sign-out.ts`**

```ts
"use client";

import { signOut } from "@crm/auth/client";
import { toast } from "sonner";

export async function signOutAndRedirect(loiMacDinh: string) {
	const { error } = await signOut();
	if (error) {
		toast.error(error.message ?? loiMacDinh);
		return;
	}
	window.location.assign("/sign-in");
}
```
(`error.message` là câu máy chủ — chuyển tiếp, không dịch, đúng vòng ④.)

- [ ] **Step 4: Chạy xanh. Commit** — `git commit -m "feat(app): câu lỗi đăng xuất đi từ kho chuỗi qua tham số"`.

---

### Task 5: Rail, thanh đầu, ngăn kéo, ⌘K, hàng đợi làm giàu đọc kho

**Files:**
- Modify: `apps/app/components/app-icon-rail.tsx`, `apps/app/components/app-header.tsx`, `apps/app/components/crm/quick-switcher.tsx`, `apps/app/components/enrichment-queue.tsx`

- [ ] **Step 1: `app-icon-rail.tsx`** — bỏ `ITEMS` và `RailItem`; giữ bảng icon riêng:

```ts
const ICON: Record<MucRailKey, { icon: CarbonIcon; className?: string }> = {
	overview: { icon: Dashboard },
	chat: { icon: Bot, className: "size-5" },
	companies: { icon: Building },
	contacts: { icon: UserMultiple },
	deals: { icon: Partnership },
	campaigns: { icon: Bullhorn },
	settings: { icon: Settings },
};
```
Trong `AppIconRail`: `const locale = useLocale(); const m = khungUngDungMessages(locale);` — `items = MUC_RAIL.map((muc) => ({ muc, title: m.rail[muc.key], href: workspaceUrl(muc.href), section: muc.href, ...ICON[muc.key] }))`; `active = mucDangMo(muc, pathname, workspaceUrl)`; `inChat = items.some((i) => laMucHoiThoai(i.muc) && active(i))`; `transitionTypes={[laMucHoiThoai(item.muc) ? "nav-forward" : "nav-lateral"]}`. Ba `aria-label="Primary"` → `m.nav.primary` cho rail, `m.nav.mobile` cho ngăn kéo thường, `m.nav.mobileChat` cho ngăn kéo hội thoại (ba tên truy cập KHÁC nhau — AC-2). `SheetTitle` → `m.nav.title` / `m.nav.mobileChat`; nút đóng `aria-label={m.nav.close}`. `AppIconRailFallback` cũng đọc `useLocale()` (client component) cho `sr-only`.

- [ ] **Step 2: `app-header.tsx`** — `const m = khungUngDungMessages(useLocale())` trong `AppHeader`, `AppHeaderFallback` và `UserMenu`; thay `"Open navigation"`, `"Homepage"`, `"Loading workspace header…"`, `"Account menu"`, `"Light mode"/"Dark mode"`, `"Sign out"`; `onSignOut={() => { signOutAndRedirect(m.header.signOutFailed).catch(() => toast.error(m.header.signOutFailed)); }}`; bỏ `OTHER_LOCALE`, nút đổi tiếng hiện `m.header.otherLocale`, `chooseLocale(locale === "vi" ? "en" : "vi")`. Bọc `translate="no"` quanh `{label}` (tên workspace) và `{user.email}`.

- [ ] **Step 3: `quick-switcher.tsx`** — `const m = khungUngDungMessages(useLocale()).switcher`; `GROUP_LABEL` → `m.groups[kind]`; `title`, `description`, `placeholder`, hai câu rỗng; phần tử hiện tên kết quả (tên công ty/cá nhân/thoả thuận) bọc `translate="no"`.

- [ ] **Step 4: `enrichment-queue.tsx`** — `m.enrichment.*` cho "Enriching", "Hide/Show", hai câu hẹn tra cứu (`total === 1 ? bookedOne : bookedMany(String(total))`).

- [ ] **Step 5: Kiểm** — `bun run check-types && bun run lint` từ gốc; `cd apps/app && bun test` (guard + hai bài kiểm mới).

- [ ] **Step 6: Commit** — `git commit -m "feat(app): thanh bên, thanh đầu, ngăn kéo, ⌘K và hàng đợi làm giàu nói tiếng Việt"`.

---

### Task 6: Màn Tổng quan đọc kho, dữ liệu người nhập mang translate="no", tiêu đề tab

**Files:**
- Modify: `apps/app/app/(app)/[slug]/page.tsx`, `overview-greeting.tsx`, `overview-scope.tsx`, `sales-dashboard.tsx`, `dashboard-summary.tsx`

- [ ] **Step 1: `page.tsx`** — thêm:

```ts
import type { Metadata } from "next";
import { getLocale } from "@/lib/locale/server";
import { tongQuanMessages } from "@/lib/messages/tong-quan";

export async function generateMetadata(): Promise<Metadata> {
	return { title: tongQuanMessages(await getLocale()).title };
}
```

- [ ] **Step 2: `overview-greeting.tsx`, `overview-scope.tsx`** — `const m = tongQuanMessages(useLocale())`; `LABELS` → `m.scope[value]`; `aria-label={m.scope.label}`; hai fallback cũng đọc kho.

- [ ] **Step 3: `sales-dashboard.tsx`** — `const m = tongQuanMessages(locale)`; `TREND_CONFIG` dựng trong component từ `m.trend.won/created`; bốn `StatCard` đọc `m.stats.*`; `formatCount(x, m.stats.dealNoun, locale)` thay cho `"deal", "en"`; câu tiền tệ: `m.unconverted.sentence(formatCount(unconverted.count, m.stats.dealNoun, locale), unconverted.currencies.join(", "), reportingCurrency)` + `<Link>{m.unconverted.setOne}</Link>`; hai `ChartPanel` và hai `EmptyChart` đọc `m.trend.*`, `m.byStage.*`; `centerLabel={m.byStage.center}`. Nhãn giai đoạn giữ `dealStageLabel`, bọc `<span lang="en">` ở danh sách slice.

- [ ] **Step 4: `dashboard-summary.tsx`** — ba mảng cột dựng bằng hàm `cot(m)` trong component (không hằng module); tiêu đề/mô tả/nút/câu rỗng đọc `m.open.*`, `m.tasks.*`, `m.activity.*`; `formatCount(overdueTasks.length, "task", "en")` → `m.tasks.pastDue(String(overdueTasks.length))`; `aria-label={m.tasks.markDone}`; `"No due date"` → `m.tasks.noDueDate`. `translate="no"` bọc: `{name}` và `{company.name}` trong `DealCell`, `{task.subject}`, `{entry.subject ?? activityLabel(...)}` chỉ khi `entry.subject` (nếu là nhãn thì không bọc — dùng hai nhánh), `{entry.createdBy.name}`, `{task.deal.name}`/`{task.company.name}` trong `RecordLink` (bọc bằng `<span translate="no">`).

- [ ] **Step 5: Kiểm** — `bun run check-types && bun run lint && bun run lint:slop`; mở `http://localhost:3000/onehub` với cookie `lang=vi` bằng mắt (curl + grep "Chốt được").

- [ ] **Step 6: Commit** — `git commit -m "feat(app): màn Tổng quan nói tiếng Việt, dữ liệu người nhập không dịch"`.

---

### Task 7: Thước dùng chung nhận tham số gốc

**Files:**
- Modify: `_acceptance/man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs` (`GOM`, `DO_RONG`)

- [ ] **Step 1:** đổi hai hàm thành `(toanMan) => { const goc = toanMan === true ? document.body : (…cũ…); … }` — mọi phần còn lại giữ nguyên; `gomTrang(trang, toanMan)` và `doRongTrang(trang, toanMan)` truyền `trang.evaluate(GOM, toanMan === true)` (puppeteer serialise tham số). Mũi gọi cũ không truyền → `undefined` → gốc cũ.

- [ ] **Step 2: Chiều xanh của hồ sơ đã ký** — chạy `node _acceptance/man-cai-dat-noi-tieng-viet/rang/man-that.mjs hai-tieng` (máy chủ đang chạy): exit 0 và số chuỗi trên `/settings`, `/settings/currencies` bằng số trong `_acceptance/man-cai-dat-noi-tieng-viet/evidence-report.md`. Ghi hai con số này vào `rang/goc-thuoc.json` của lát (`{ "hoso": "man-cai-dat-noi-tieng-viet", "route": {"/settings": N1, "/settings/currencies": N2} }`) — nguồn cho E15(2).

- [ ] **Step 3: Commit** — `git commit -m "test(acceptance): GOM và DO_RONG nhận tham số toanMan, mặc định giữ gốc cũ"`.

---

### Task 8: Bốn bản khai của lát và bốn mũi AST

**Files:**
- Create: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/{toast-cua-lat.json,tieu-de-cua-lat.json,khong-phai-chu-nguoi-doc.json,khong-dich-cua-lat.json,du-lieu-nguoi-nhap.json}`

- [ ] **Step 1:** chạy `node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --lat $PWD/_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json --chan toast` với `toast-cua-lat.json` rỗng `{"lat":"…","loi_goi":[]}` → mã 2 in THỪA từng lời gọi mang chữ — đó là bảng nháp. Điền `loi_goi` từ output (dự kiến: `app-header.tsx` → `header.signOutFailed`; `dashboard-summary.tsx` chuyển tiếp `error.message` → bỏ qua).
- [ ] **Step 2:** `tieu-de-cua-lat.json`: `{"lat":"…","so_o":1,"giu_nguyen":[],"co_thanh_ben":false}`.
- [ ] **Step 3:** `khong-phai-chu-nguoi-doc.json`: `ham_ky_thuat: ["cn","clsx","twMerge","require","import"]`, `giu_nguyen`: `"nav-forward"`, `"nav-lateral"` (tên view transition), `"page"` (`aria-current`), `"k"` (phím tắt), `"USD"` nếu có. Chạy `moi-chuoi.mjs --lat …` tới khi 0 chuỗi tiếng Anh; mỗi dòng giữ-nguyên đọc trong ngữ cảnh.
- [ ] **Step 4:** `khong-dich-cua-lat.json`:

```json
{
	"lat": "tong-quan-va-khung-noi-tieng-viet",
	"luat": [
		{ "ten": "so-thuan", "vi_sao": "so, dau cau, ky hieu tien" },
		{ "ten": "du-lieu-nguoi-nhap", "vi_sao": "translate=no — do o AC-8" },
		{ "ten": "lang-en", "vi_sao": "phan tu mang lang=en la nhan giu tieng Anh co chu y" }
	],
	"dong": [
		{ "gia_tri": "OneHub", "vi_sao": "thuong hieu", "dieu_kien": "luon-hien" },
		{ "gia_tri": "USD", "vi_sao": "ma tien te bao cao", "dieu_kien": "luon-hien" },
		{ "nguon": "lib/deal-stage.ts", "vi_sao": "bay nhan giai doan — CONTEXT.md chua chot nghia", "dieu_kien": "can-thoa-thuan-o-giai-doan" }
	]
}
```
Chân `khong-dich` đọc bảy nhãn qua `import("apps/app/lib/deal-stage.ts")` không được (file TS) → đọc bằng AST: lấy các `label:` trong `PRESENTATION` — đó là round-trip từ writer thật, không chép tay.
- [ ] **Step 5:** `du-lieu-nguoi-nhap.json` — 8 ô `(file, bieu_thuc)`: `dashboard-summary.tsx` × `name` · `company.name` · `task.subject` · `entry.subject` · `entry.createdBy.name`; `app-header.tsx` × `label` · `user.email`; `quick-switcher.tsx` × tên kết quả; mỗi ô `do_san_duoc`/`nguon_san` (`workspace.get.name`, phiên `dev@localhost`, `dashboard.summary.biggestOpen[0].name`) hoặc `vi_sao_san`.
- [ ] **Step 6:** chạy đủ `tq_chu_cung_jsx`, `tq_moi_chuoi`, `tq_toast`, `tq_tieu_de`, `tq_khai_sinh`, `tq_dan_so_tu_dia` qua `bash -c "$(yq …)"` hoặc chép lệnh từ `config.yaml` — tất cả exit 0. Commit.

---

### Task 9: `man-that.mjs` của lát — bảy chân màn

**Files:**
- Create: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`

Import từ `../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs` (`phien`, `suySlug`, `datTrinhDuyet`, `moManMem`, `gomTrang`, `doRongTrang`, `soCap`, `goiApi`, `docKhai`, `khongDo`, `ket`, `DAU_VIET`, `CHI_SO`, `HEP`, `RONG`, `CAO`, `CHROME`) và `giuDoc` từ `khoa-cay.mjs`; `HERE = dirname(fileURLToPath(import.meta.url))`; `MAN = "/"`; `KHAI = docKhai(\`${HERE}/lat-tong-quan.json\`)`. Bộ chân `BO_CHAN` = `hai-tieng` · `sau-bam` · `trang-thai-rong` · `khong-dich` · `du-lieu-nguoi-nhap` · `be-rong` · `goc-thuoc`; dispatcher cuối file y hệt ③b (tên chân sai → mã 2 liệt danh sách).

- [ ] **`hai-tieng`**: `docHaiLuot(cookie, slug, "/", RONG, true)` — như ③b nhưng `gomTrang(trang, true)`; thêm `document.title` hai lượt (khác nhau, `vi` có dấu); `soCap` với `boi = (chu, g) => CHI_SO.test(chu) || g.khongDich || mtKhongDich.has(chu) ? "boi" : null`; bảng không-dịch đọc từ `khong-dich-cua-lat.json` + bảy nhãn AST; `mien_dau` từ `lat-tong-quan.json`. 0 cặp → mã 2; hỏng → mã 1.
- [ ] **`sau-bam`**: ba hàm lái: `menu` = `trang.click('[aria-label="…accountMenu…"]')` → gom `[data-slot="dropdown-menu-content"]`; `ck` = `trang.keyboard.down("Meta"); press("k"); up("Meta")` rồi `type("zzqx")` → gom `[role="dialog"]`; `nganKeo` = viewport 360, click nút `m.nav.open` → gom `[data-slot="sheet-content"]`, hai lần: trên `/` và trên `/chat` (ở `/chat` chỉ gom `nav` đầu tiên trong sheet, in `da tru: <n> chuoi cua cua-so-tro-chuyen-noi-tieng-viet`). Gom bằng `trang.evaluate((sel) => GOM_TRONG(sel), sel)` — viết `GOM_TRONG` trong file này là bản `GOM` nhận selector gốc (KHÔNG chép 12 dòng: gọi `GOM` sau khi tạm đổi `document.querySelector` không được, nên `GOM_TRONG(sel) = () => { const goc = document.querySelector(sel); … }` với thân dùng chung qua `GOM.toString()` thay thế biểu thức gốc — hoặc đơn giản hơn: thêm vào `man-that-lib.mjs` một hàm `GOM_CHON(sel)` ở Task 7 và dùng nó; chọn cách này). Mỗi bề mặt: vế 1–3 của `hai-tieng` + vế `aria-label` các `nav` khác nhau. Bề mặt không lái ra được → mã 2 gọi tên.
- [ ] **`trang-thai-rong`**: `goiApi(cookie, "dashboard.summary", { scope: "me" })` → `biggestOpen`, `overdueTasks`, `recentActivity` đều rỗng, không thì mã 2 gọi tên điều kiện; dựng `/?scope=me` hai lượt gom toàn màn; ba vế; cộng ba câu `open.empty`, `tasks.empty`, `activity.empty` (đọc từ kho qua AST của `tong-quan.ts`) có mặt; hai câu biểu đồ: nếu `pipeline.stages` rỗng thì đo trên màn, không thì in *do o muc ma* (AST: prop `label={m.trend.empty}`).
- [ ] **`khong-dich`**: trước khi gom, `goiApi(cookie, "dashboard.summary", { scope: "everyone" })` → tập giai đoạn có trong `pipeline.stages` với `valueCents > 0` và `biggestOpen[].stage`; dòng `can-thoa-thuan-o-giai-doan` của giai đoạn vắng → danh sách *khong do duoc tren man* (đo mã: AST `lang="en"` quanh `dealStageLabel`); `unconverted.count === 0` → dòng mã tiền tệ chưa quy đổi đo mã. Rồi ứng viên từ màn = `translate=no` ∪ giống hệt hai lượt trừ ba luật; đối chiếu hai chiều với phần bảng đạt điều kiện; hai lượt lệch số phần tử → đỏ.
- [ ] **`du-lieu-nguoi-nhap`**: chân mã AST theo bảng (dùng `timBocJsx` — viết lại ngắn ≤11 dòng hoặc import nếu ③b xuất; ③b không xuất → viết bản riêng dưới 12 dòng); chân màn: mở `/` `vi`, với mỗi ô `do_san_duoc` lấy giá trị thật từ `nguon_san` rồi tìm text node bằng giá trị đó và đòi `closest('[translate="no"]')`; in đo được / không đo được; tổng = số dòng bảng.
- [ ] **`be-rong`**: như ③b với `doRongTrang(trang, true)` ở 360px; thêm lượt ngăn kéo mở.
- [ ] **`goc-thuoc`**: mở `/` `vi` một lần; `a = evaluate(GOM)`, `b = evaluate(GOM, false)`, `c = evaluate(GOM, true)`; cùng cho `DO_RONG`; bảy nhãn = `khungUngDungMessages("vi").rail` đọc bằng AST từ `khung-ung-dung.ts`; kiểm `a ≡ b` (so JSON), `a` không chứa nhãn nào, `c` chứa đủ bảy; sai chiều nào in tên hàm + chiều, mã 1.

Mỗi chân: chạy xanh trên cây lành, rồi cắm vết tương ứng (ở Task 10) để thấy đỏ.

---

### Task 10: Đột biến, bề rộng đỏ, một bộ thước

**Files:**
- Create: `rang/dot-bien.mjs`, `rang/be-rong-do.sh`, `rang/mot-bo-thuoc.mjs`

- [ ] **`dot-bien.mjs`**: `chayDotBien({ HERE, CHAN, VET })` từ `dot-bien-lib.mjs`; `CHAN` = năm mũi AST (`moi-chuoi`, `chu-cung-jsx`, `toast`, `tieu-de` với `--lat KHAI`) + `hai-tieng` (`man-that.mjs hai-tieng`, `cho_ms: 12000`); `VET` bảy hàng: JSX (`overview-greeting.tsx`: `{m.greeting.title}` → `{"Welcome back"}`) · thuộc tính (`overview-scope.tsx`: `aria-label={m.scope.label}` → `aria-label="Whose numbers to show"`) · toast (`app-header.tsx`: `m.header.signOutFailed` → `"Could not sign out."`) · tiêu đề (`page.tsx`: `tongQuanMessages(await getLocale()).title` → `"Overview"`) · khoá object (`sales-dashboard.tsx`: thêm `const X = { label: "Closed won" };`) · hàm ghép (`dashboard-summary.tsx`: `m.tasks.pastDue(...)` → `` `${overdueTasks.length} past due` ``) · **nhãn rail** (`khung-ung-dung.ts`: `deals: "Thoả thuận"` → `deals: "Deals"`, `chan: ["hai-tieng"]`, `cho_ms: 12000`). Bảng `(hình dạng, chân chuyên trách)` in ra; vết chỉ tính bắt khi ĐÚNG chân đó mã 1.
- [ ] **`be-rong-do.sh`**: giữ khoá cây (`node -e` gọi `giuViet`) — chép khuôn của `cai-dat-con-lai/rang/be-rong-do.sh` nhưng vết là `openPipeline: "Đang mở"` → `"Đang mở và còn dài thêm một đoạn cho tràn hẳn ở bề rộng hẹp"`; chạy `man-that.mjs be-rong`; đòi output có dòng `TRAN:` và mã 1; trả file nguyên trạng bằng `git checkout -- apps/app/lib/messages/tong-quan.ts` chỉ sau khi đã `git diff --quiet` xác nhận không có thay đổi khác trong file.
- [ ] **`mot-bo-thuoc.mjs`**: (1) so thân hàm ≥12 dòng giữa `rang/` của lát và ba `rang/` kia — dùng lại thuật toán của ③b qua import nếu nó xuất hàm, không thì viết bản riêng; (2) grep `rang/*.mjs` của lát không chứa `/Users/`; (3) chạy hai mũi ③b không tham số (`chu-cung-lat.mjs`, `chu-ngoai-jsx.mjs --chan toast`) đòi `10 file` và `12/12`; (4) AST đếm mọi `GOM(`/`DO_RONG(` ngoài `rang/` của lát có đối số → đỏ `file:dòng`.

- [ ] Commit: `git commit -m "test(acceptance): bộ thước của lát Tổng quan và khung — bảy chân màn, đột biến bảy hình dạng, gốc thước có cặp"`.

---

### Task 11: Bản dịch, `KHONG_DAU`, contract `status: implemented`

**Files:**
- Create: `_acceptance/tong-quan-va-khung-noi-tieng-viet/ban-dich.md` (bảng khoá → en → vi, sinh bằng script nhỏ đọc hai kho qua `bun -e`)
- Modify: `_acceptance/tong-quan-va-khung-noi-tieng-viet/contract.md` (`status: implemented`)

- [ ] Sinh `ban-dich.md`; chạy trọn năm lệnh chứng của kho: `bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build`.
- [ ] Set `status: implemented`, commit `chore(acceptance): tong-quan-va-khung — implemented, bản dịch`.

---

## Bảng tóm tắt cho người

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Màn đầu tiên sau đăng nhập đọc trọn tiếng Việt, thẻ số nói giọng đối tác | `tong-quan.ts`, bốn file màn `/` | AC-1 (màn thật hai tiếng), AC-17 (chất tiếng Việt) |
| Thanh bên hết lẫn tiếng, bảy nhãn đúng từ điển | `khung-ung-dung.ts`, `app-icon-rail.tsx` | AC-1, AC-4 (mã không còn chữ cứng) |
| Menu tài khoản, hộp ⌘K, ngăn kéo di động nói tiếng Việt | `app-header.tsx`, `quick-switcher.tsx` | AC-2 (bề mặt sau bấm) |
| Workspace mới thấy câu rỗng tiếng Việt, không chữ mặc định thư viện | `dashboard-summary.tsx` | AC-3 (trạng thái rỗng) |
| Đăng xuất hỏng thấy câu tiếng Việt thay vì im lặng | `sign-out.ts` | AC-5 (câu lỗi đi qua tham số) |
| Tab trình duyệt ghi "Tổng quan" | `page.tsx` | AC-6 (tiêu đề tài liệu) |
| Tên thoả thuận, công ty, người, email không bị trình duyệt tự dịch | `dashboard-summary.tsx`, `app-header.tsx` | AC-8 (dữ liệu người nhập) |
| Chuyển sang tiếng Việt không làm gãy điều hướng di động | `khung-dieu-huong.ts` | AC-16 (khoá tách khỏi nhãn) |
| Thước màn nhìn thấy thanh bên và thanh đầu, năm hồ sơ đã ký không đổi số | `man-that-lib.mjs` | AC-13 (gốc thước), AC-14 (một bộ thước) |

Thứ tự: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11. Task 1–4 và 7 độc lập về mã nhưng chạy tuần tự trên cùng một máy chủ dev và một `node_modules` — chia worktree tốn một lượt `bun install` mỗi cây, không đáng (entry sổ quyết định).
