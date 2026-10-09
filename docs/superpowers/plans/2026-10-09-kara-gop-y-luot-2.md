# Kara góp ý OKR lượt 2 (K3) — Kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vùng Kara trong khung Mục tiêu dùng khung chung và khối Kara chung, không biến mất khi lỗi, không chờ mãi, Căn chỉnh có Hoàn tác, người phụ trách nhiều KR nhờ được Kara, chữ đếm tiếng Anh đúng số và ngày giờ năm chỗ cùng một khuôn.

**Architecture:** Mọi trạng thái vùng Kara suy ra trong một hook (`useGopYMucTieu`, `gop-y-kara.ts`) rồi vẽ bằng `KaraState` / `KaraProposal` / `KaraBusyProvider` của `packages/ui` trong `nhom-kara.tsx`; khung Mục tiêu (`objective-sheet.tsx`) chỉ bọc vùng bằng `DetailSheetSection` và lo neo. API chỉ đổi một cổng quyền (`assertSuaDich`) trong `tro-ly.service.ts`. Ngày giờ đi qua một hàm mới `formatNgayGio` trong `packages/ui/src/lib/format.ts`.

**Tech Stack:** Next.js (apps/app, client component), TanStack Query v5, nuqs, tRPC v11 (`httpBatchLink`, không transformer), NestJS (apps/api), Prisma/Postgres, Bun 1.3.12 test + DOM preload `packages/ui/test/setup-dom.ts`, Zod 4, puppeteer-core cho bàn đo màn.

**Spec:** `docs/superpowers/specs/2026-10-09-kara-gop-y-luot-2-design.md` · hợp đồng đã duyệt `_acceptance/kara-gop-y-luot-2/contract.md` (AC-1…AC-15) · `evals.yaml` (E1…E15c) · `decisions.jsonl` (Q1–Q4 + Căn chỉnh ở client) · `gap-probe.md`.

**Đã đọc trước khi soạn:** `AGENTS.md` (không chú thích, `packages/ui` là nguồn UI, parse ở biên bằng Zod, hằng số theo vùng), `docs/design.md` (bảng «Vẽ tay»), `docs/ai-ux.md` §2, §3, §5–7, `docs/api.md` §OKR dòng 1027–1060 (cổng quyền của `troLySanSang`/`troLyDeXuat`), `.oxlintrc.json` + `tools/oxlint/anti-slop` (cấm tham số `unknown` trừ tên `cause`, cấm `typeof` lúc chạy), skill `.agents/skills/no-use-effect` (không thêm `useEffect` mới). Người thi công đọc thêm `.agents/skills/nuqs` trước Task 15 và `.agents/skills/nestjs-trpc` trước Task 11.

## Global Constraints

- Không viết chú thích trong code, kể cả code sửa lại (AGENTS.md).
- Mọi chữ trên màn đi qua `apps/app/lib/messages/okr-gop-y.ts` (hoặc `@crm/ui/lib/messages` cho `KaraState`/`KaraRetry`); không chữ cứng trong tệp giao diện; không «Trợ lý OKR», không mã thô, không câu tiếng Anh của trình duyệt (`docs/ai-ux.md` §1, §7).
- Mỗi hàm chuỗi mới trong `okr-gop-y.ts` có ghim trong `apps/app/test/messages-guard.spec.ts` (`GHIM_OKR_GOP_Y`, hai giá trị cho đối số `"1"` và `"12"`); khoá không còn ai gọi thì xoá khỏi `okr-gop-y.ts` (bộ «khoa chet» không quét `/test`).
- Client không nhập barrel `@crm/db` (Next build đỏ vì `dns`); trần chờ đọc `TRO_LY_OKR_TRAN.tranChoMs` và nhịp `TRO_LY_OKR_TRAN.hoiLaiMs` lấy từ `@crm/validation/okr-tro-ly`, như `gop-y-kara.ts` đang làm. Không chép số `30_000`.
- Không thêm `useEffect` mới (skill `no-use-effect`); trạng thái theo dữ liệu thì suy ra lúc vẽ hoặc đặt lại trong lúc vẽ có điều kiện; việc sau một cú bấm đi trong handler. Được phép mở rộng `useEffect` neo đang có ở `objective-sheet.tsx:593`.
- Lỗi từ tRPC giải mã bằng một schema Zod tại chỗ bắt (`loiCoMa` trong `gop-y-kara.ts`); tham số kiểu `unknown` phải tên `cause` (lint `anti-slop/no-unknown-parameters`); không `typeof` lúc chạy.
- `packages/ui/src/components/kara/state.tsx` chỉ thêm prop tuỳ chọn (`action` cho `empty`, `describedBy` cho `off`); dòng cũ duy nhất được đổi là hai dòng khai kiểu của hai kind đó; phần vẽ thêm bằng nhánh `if` mới, không sửa dòng cũ; có bài ghim DOM mặc định (P1-35).
- `packages/ui/src/lib/format.ts` chỉ thêm đúng một hàm `formatNgayGio` (P1-36); ba tệp `soan/` chỉ đổi lời gọi định dạng ngày giờ (kèm đúng phần cần để có `locale` kiểu `Locale` ở chỗ gọi).
- `_acceptance/config.yaml` chỉ thêm — các khoá `k3_*` đã có sẵn ở dòng 1308–1321 và 2114–2117; kế hoạch này không thêm khoá nào.
- Bài DOM chỉ so giá trị nguyên thuỷ (chuỗi, số, boolean, `null`), không `toEqual` phần tử DOM. Đồng hồ giả (`setSystemTime`) luôn trả lại trong `finally`/`afterEach`.
- Lượt đầu của tệp DOM mới chạy dưới trần thời gian và đo RSS: `/usr/bin/time -l perl -e 'alarm 180; exec @ARGV' …` (máy không có lệnh `timeout`).
- Không đổi schema `troLyDichInput`, `troLyDanhSach`, `troLyQuyetOutput`; không chạm `okr.contracts.ts`, `packages/db/src/okr-tro-ly.ts`, `apps/agent` (contract «Out of scope», sổ quyết định d-…-3, d-…-4, d-…-7).
- Chữ đếm vẫn là «góp ý chờ»; màn góp ý dùng `KaraProposal` từng dòng, không `KaraProposalGroup` (Q4).

## Cần xin chạm tệp thêm

Bốn tệp ngoài ranh giới hàng K3 và ngoài `cham-tep` P1-35/P1-36 mà vòng này cần. Chưa được duyệt thì task sở hữu dừng ở bước đó và báo, không âm thầm sửa; `ranh-gioi.mjs` (Task 19) đã liệt chúng sẵn trong `CHAM_TEP_XIN` để chỉ cần bật khi được duyệt.

| Tệp | Đổi gì | Vì sao | Task |
|---|---|---|---|
| `apps/app/lib/search-param-keys.ts` | Chỉ thêm một dòng `neoGopYKr: "neoGopYKr",` sau `neoGopY` (dòng 74) | `cham-tep` P1-35 ghi «`apps/app/lib/okr-search-params.ts` (một khoá)», nhưng tệp đó không tồn tại. Bộ đọc tham số thật là `apps/app/app/(app)/[slug]/okr/okr-search-params.ts` (cũng ngoài ranh giới), còn tên khoá URL sống ở `search-param-keys.ts`. Kế hoạch chỉ cần tên khoá; bộ đọc dùng thẳng `parseAsString` của `nuqs`, nên không chạm `okr-search-params.ts`. Xin sửa dòng `cham-tep` thành tệp này. | 15 |
| `apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts` | Tách bảng `SUA_DUOC` (dòng 61–65) thành hai bảng: `NHO_DUOC` cho `troLySanSang`/`troLyDeXuat` (thêm `"phu-trach-kr"` vào `"muc-tieu-phong-ban"`) và `SUA_DUOC` giữ nguyên cho `troLyQuyet` | Ma trận quyền đang ghim «người phụ trách KR1 (`do-minh-khoa`) nhờ cả Mục tiêu `q4-kd-bac-1` → 403». Q2 đổi đúng luật đó, nên ô này đỏ ngay khi Task 11 xong; `bun run test` và `pre-push` đều chặn. | 11 |
| `docs/api.md` | Sửa đoạn dòng 1031–1034 («đòi `assertSuaMucTieu` hoặc `assertSuaKr` trên đúng đích được truyền — toàn hay không…») cho đúng luật mới | Tài liệu là luật của khu API; để chữ cũ thì tài liệu nói ngược mã. | 11 |
| `apps/app/components/detail-sheet.tsx` | **Không xin.** Ghi ở đây để Cổng 2 thấy: `DetailSheetSection` không có `data-slot`, nên E1 đo «cùng khung» bằng `closest("section")` và so `className` với vùng «Vì sao lúc này» bên cạnh (xem bảng bộ chọn dưới). | — | 2 |

### Bộ chọn trong chữ eval và dấu DOM thật

Chữ của `evals.yaml` dùng vài bộ chọn không có trong DOM hiện tại. Kế hoạch đo đúng ý của eval bằng dấu có thật, không thêm `data-*` vào `packages/ui` (sẽ phá bài ghim DOM mặc định của P1-35). Người chấm S4 đọc bảng này cạnh E1–E8.

| Chữ eval | Dấu thật dùng trong bài | Nguồn |
|---|---|---|
| `[data-slot=kara-state][data-kind=X]` | `[data-kara-state=X]` | `state.tsx:59,80,128` |
| `[data-slot=kara-proposal]` | `[data-slot=kara-khoa] > [data-slot=proposed-change]` | `proposal.tsx:29`, `proposed-change.tsx:441` |
| `closest('[data-slot=detail-sheet-section]')` | `closest("section")` và `className` trùng `[data-khu=vi-sao] section` | `detail-sheet.tsx:306` |
| «số `[data-slot=kara-mark]` (tia sáng) trong vùng» | `demTiaSang(vung)` = số `[data-slot=kara-mark]` + số `[data-slot=proposed-change] > [data-slot=item-media]` (icon tia sáng từng dòng khi `media` bật) | `kara.tsx:25`, `proposed-change.tsx:447-452` |
| «textContent của `[data-kara-state=error]` === câu» | `[data-kara-state=error] [data-slot=empty-title]` === `ui.karaKhung.chuaDuoc(<việc>)`, `[data-slot=empty-description]` === câu mô tả | `state.tsx:108-117` |
| «hoàn tác … về chờ» (AC-7, AC-8, E8) | `data-trang-thai="da-hoan-tac"` trên dòng: máy chủ giữ dòng đề xuất ở `nhan` sau khi hoàn tác, nên «về chờ» trên màn là biên nhận «Đã hoàn tác …» không còn nút; ô «chưa sẵn sàng» của cột Hoàn tác trong E6 dựng bằng `LoiTrpc("BAD_REQUEST", …)` vì thủ tục sửa không trả `ok: false` | `tro-ly.service.ts:599-610` |

## Review Focus

Năm loại đầu vào mà spec ngụ ý nhưng chưa eval nào đo, xếp theo khả năng cắn người dùng:

1. **Hỏi lại danh sách lỗi khi đã có góp ý trên màn** (mạng chập chờn lúc đang hỏi lại 1,5 giây một lần, hay sau một lần quyết) — người dùng mong góp ý đang hiện vẫn còn, không bị thay bằng khối lỗi. Bài: Task 3, `k3-tai-loi giu gop y khi hoi lai loi`.
2. **`troLySanSang` lỗi hay chưa về khi vùng đang ở trạng thái lỗi** — bấm «Thử lại» phải làm một việc thấy được (đọc lại độ sẵn sàng), không im lặng như nút cũ bị xám. Bài: Task 6, `k3-tat thu lai khi chua biet san sang`.
3. **Sau lần nhận «Căn chỉnh» có hai liên kết mới cùng đích** (người khác gắn tay cùng đích đúng lúc đó, hay hai tab cùng nhận) — không đoán liên kết nào là của lần nhận này; biên nhận không có Hoàn tác thay vì có thể gỡ liên kết của người khác. Bài: Task 9, `k3-can-chinh hai lien ket moi cung dich`.
4. **URL neo trỏ tới KR không còn góp ý** (đã quyết hết ở tab khác, hay id lạ dán tay) — khung vẫn cuộn tới vùng Kara như neo cũ, xoá cả hai khoá URL, không làm nổi dòng nào, không ném. Bài: Task 15, `k3-neo-kr id la`.
5. **Kara đọc xong sau khi vùng đã sang «quá hạn»** — vùng phải bỏ khối lỗi và hiện góp ý khi danh sách về, không kẹt lỗi tới lúc người bấm Thử lại (bấm là tốn một lượt). Bài: Task 5, `k3-qua-han doc xong muon`.

---

## Bản đồ tệp

| Tệp | Vai | Task |
|---|---|---|
| `packages/ui/src/components/kara/state.tsx` | `KaraState`: thêm `action?` cho `empty`, `describedBy?` cho `off` | 1 |
| `apps/app/test/khung-gop-y-dung-cho.tsx` | Khung bài chung: thêm `locale` cho `dung`, `kho.rieng`, kiểu `{ ok: false }` | 1 |
| `apps/app/test/khung-gop-y-luot-2.tsx` (mới) | Đồ dùng riêng của lượt 2: `vungKara`, `trangThaiKara`, `demTiaSang`, `KHUNG`, `choLau`, `lienKet` | 1 |
| `apps/app/test/gop-y-dung-cho-luot-2.dom.tsx` (mới) | Cửa vào bài DOM; nhập các tệp con | 1 |
| `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx` (mới) | `k3-khung`, `k3-tai-loi`, `k3-nho-loi`, `k3-qua-han`, `k3-tat` | 1–6 |
| `apps/app/test/gop-y-dung-cho-luot-2-dong.tsx` (mới) | `k3-loi-dong`, `k3-hai-hoan`, `k3-can-chinh`, `k3-chip` | 7–10 |
| `apps/app/test/gop-y-dung-cho-luot-2-dan.tsx` (mới) | `k3-nhieu-kr`, `k3-cau-dan`, `k3-neo-kr` | 12, 14, 15 |
| `apps/app/test/gop-y-dung-cho-luot-2-ngay-gio.tsx` (mới) | `k3-ngay-gio` (bảy bề mặt × hai tiếng) | 16 |
| `apps/app/test/gop-y-dung-cho-luot-2.spec.ts` (mới) | `k3-so-nhieu` (không DOM) | 13 |
| `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` | Hook: trạng thái vùng, lỗi, quá hạn, hoàn tác từng dòng, Căn chỉnh, hỏi lại sau khi đóng khung | 2–12, 15 |
| `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx` | Vẽ vùng: `KaraState`, `KaraProposal`, `KhoiTat`, biên nhận | 2–9, 15, 16 |
| `apps/app/components/crm/record-sheet/objective-sheet.tsx` | `DetailSheetSection` + `KaraBusyProvider` quanh vùng; neo tới góp ý của KR | 2, 15 |
| `apps/app/lib/messages/okr-gop-y.ts` | Chữ mới, số ít/số nhiều tiếng Anh, câu dẫn | 3–9, 13, 14 |
| `apps/app/test/messages-guard.spec.ts` | Ghim hàm chuỗi mới | 9 |
| `apps/app/test/gop-y-dung-cho-khung.tsx`, `gop-y-dung-cho-ra-soat.tsx` | Sửa ba bài cũ ghim `m.vung.loi`, `m.vung.thuLai` và câu thô của CONFLICT | 5, 7 |
| `apps/api/src/okr/tro-ly.service.ts` | `assertSuaDich` cho nhờ cả Mục tiêu khi sửa được ≥1 KR | 11 |
| `apps/api/test/kara-gop-y-luot-2.spec.ts` (mới) | E10 trên CSDL kiểm | 11 |
| `apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx`, `hop-thoai-kr.tsx`, `hop-thoai-muc-tieu.tsx` | Dòng dẫn mang mã KR; câu dẫn trung tính | 14, 15 |
| `packages/ui/src/lib/format.ts` | `formatNgayGio` | 16 |
| `bang-vet.tsx`, `soan/nut-soan.tsx`, `soan/danh-sach-cuoc.tsx`, `soan/bang-nhap.tsx` | Gọi `formatNgayGio` | 16 |
| `_acceptance/kara-gop-y-luot-2/rang/*.mjs`, `*.json` (mới) | Răng E14, E15, E15b, E15c và mẫu | 1, 16–20 |

---

### Task 1: Khung bài lượt 2 và `KaraState` thêm `action`/`describedBy` (chỉ thêm, có ghim)

`independent: true` · Evals: E1 (phần ghim mặc định của P1-35)

**Files:**
- Modify: `packages/ui/src/components/kara/state.tsx:41,48` (hai dòng khai kiểu) và thêm hai nhánh `if` ở đầu `case "empty"` (sau dòng 100) và `case "off"` (sau dòng 126)
- Modify: `apps/app/test/khung-gop-y-dung-cho.tsx:319-347` (`Kho`, `khoMoi`), `:349-350` (`docThuTuc`), `:392-396` (`KetQuaGhi`), `:525,544` (`dung` nhận `locale`)
- Create: `apps/app/test/khung-gop-y-luot-2.tsx`
- Create: `apps/app/test/gop-y-dung-cho-luot-2.dom.tsx`
- Create: `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`
- Create: `_acceptance/kara-gop-y-luot-2/rang/kara-state-goc.json`

**Interfaces:**
- Consumes: không.
- Produces:
  - `KaraStateProps` thêm `{ kind: "empty"; title: ReactNode; description: ReactNode; action?: ReactNode }` và `{ kind: "off"; reason: ReactNode; action?: ReactNode; describedBy?: string }`.
  - `dung(man: ReactElement, thamSo?: string, locale?: Locale): Promise<San>` (mặc định `"vi"`); `San` thêm `client: QueryClient`.
  - `kho.rieng: Map<string, (vao: DauVao) => object>` — đường đọc riêng cho thủ tục ngoài bảng `docThuTuc`.
  - `KetQuaGhi` thêm `{ ok: false; lyDo: string }`.
  - Trong `khung-gop-y-luot-2.tsx`: `vungKara(): HTMLElement | null`, `trangThaiKara(): string | null`, `demTiaSang(vung: ParentNode): number`, `KHUNG(): ReactElement`, `choLau(xong: () => boolean, moTa: string, ms?: number): Promise<void>`, `lienKet(id: string, targetKeyResultId: string | null): NoiGop`, `datDongHo(ms: number): void`, `MOC_GIO: string`.

- [ ] **Step 1: Chép DOM gốc của `KaraState` khi `state.tsx` còn đúng bản `c1067c16`**

Run: `git diff --quiet c1067c16 HEAD -- packages/ui/src/components/kara/state.tsx && echo nguyen-ban`
Expected: `nguyen-ban`. Không in ra thì dừng: tệp đã bị sửa, mẫu chép lúc này không còn là bản trước vòng.

- [ ] **Step 2: Mở rộng khung bài chung**

Trong `apps/app/test/khung-gop-y-dung-cho.tsx`:

```tsx
type Kho = {
	mine: ReturnType<typeof mineOutput.parse>;
	danhSach: (vao: DauVao) => DanhSach;
	chiTiet: () => ObjectiveOutput;
	troLy: (vao: DauVao) => TroLyDs | Promise<TroLyDs>;
	sanSang: SanSang;
	daDoc: Goi[];
	daGhi: Goi[];
	daLamMoi: string[];
	ghiRieng: Map<string, (vao: DauVao) => Promise<KetQuaGhi>>;
	rieng: Map<string, (vao: DauVao) => object>;
};

const khoMoi = (): Kho => ({
	mine: mineOutput.parse({ dangTheoDoi: [], objectives: [], daBo: [] }),
	danhSach: () => danhSachTu([]),
	chiTiet: () => chiTietTu(mtSheet()),
	troLy: () => dsTroLy([]),
	sanSang: SAN_SANG,
	daDoc: [],
	daGhi: [],
	daLamMoi: [],
	ghiRieng: new Map(),
	rieng: new Map(),
});
```

```tsx
export function docThuTuc(duong: string, vao: DauVao): object | null {
	const rieng = kho.rieng.get(duong);
	if (rieng) return rieng(vao);
	switch (duong) {
```

```tsx
export type KetQuaGhi =
	| { ok: true }
	| { ok: false; lyDo: string }
	| { bat: true; taskId: string; dungLai: boolean }
	| { sessionId: string }
	| { id: string; canhBao: null };
```

```tsx
export async function dung(
	man: ReactElement,
	thamSo = "",
	locale: Locale = "vi",
): Promise<San> {
```

và trong `ve`: `<LocaleProvider locale={locale}>`. Thêm `import type { Locale } from "@crm/ui/lib/locale";`. Kiểu `San` thêm `client: QueryClient;` và đối tượng `san` trả về thêm `client,` để bài gọi `san.client.invalidateQueries(...)` khi cần một lần đọc lại không qua cú bấm.

- [ ] **Step 3: Viết đồ dùng của lượt 2**

`apps/app/test/khung-gop-y-luot-2.tsx`:

```tsx
import { setSystemTime } from "bun:test";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import {
	DetailSheet,
	MT_ID,
	nhip,
	ObjectiveSheet,
	qs,
	qsa,
} from "./khung-gop-y-dung-cho";

export type NoiGop = ObjectiveOutput["alignments"][number];

export const MOC_GIO = "2026-10-01T15:56:00.000Z";

export const vungKara = () => qs("[data-vung-kara]");

export const trangThaiKara = () =>
	vungKara()?.querySelector("[data-kara-state]")?.getAttribute(
		"data-kara-state",
	) ?? null;

export function demTiaSang(vung: ParentNode): number {
	return (
		qsa("[data-slot=kara-mark]", vung).length +
		qsa("[data-slot=proposed-change] > [data-slot=item-media]", vung).length
	);
}

export const KHUNG = () => (
	<DetailSheet onOpenChange={() => {}} open>
		<ObjectiveSheet objectiveId={MT_ID} />
	</DetailSheet>
);

export async function choLau(
	xong: () => boolean,
	moTa: string,
	ms = 6000,
): Promise<void> {
	const het = performance.now() + ms;
	while (performance.now() < het) {
		if (xong()) return;
		await nhip(1);
		await new Promise((r) => setTimeout(r, 40));
	}
	throw new Error(`khong toi: ${moTa}`);
}

export function lienKet(
	id: string,
	targetKeyResultId: string | null,
): NoiGop {
	return {
		alignmentId: id,
		targetObjectiveId: "mt-goc",
		targetKeyResultId,
		unitName: "OneHub",
		objectiveTitle: "Mục tiêu OneHub",
		keyResultTitle: targetKeyResultId === null ? null : `KR ${targetKeyResultId}`,
	};
}

export function datDongHo(ms: number): void {
	setSystemTime(new Date(ms));
}
```

Cửa vào `apps/app/test/gop-y-dung-cho-luot-2.dom.tsx`:

```tsx
import { afterEach, beforeEach, setSystemTime } from "bun:test";
import { datLai, thaoHet } from "./khung-gop-y-dung-cho";

beforeEach(datLai);
afterEach(async () => {
	setSystemTime();
	await thaoHet();
});

await import("./gop-y-dung-cho-luot-2-khung");
```

(Task 7, 12, 16 thêm dòng `await import("./gop-y-dung-cho-luot-2-dong")`, `"-dan"`, `"-ngay-gio"` khi tạo tệp con.)

- [ ] **Step 4: Viết bài đỏ cho prop mới và bài ghim mặc định**

`apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`:

```tsx
import { describe, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { KaraState } from "@crm/ui/components/kara/state";
import { dung, kiemCa, qs } from "./khung-gop-y-dung-cho";

const MAU_KARA_STATE = join(
	import.meta.dir,
	"../../../_acceptance/kara-gop-y-luot-2/rang/kara-state-goc.json",
);

describe("k3-khung", () => {
	test("k3-khung ghim mac dinh: empty khong action va off khong describedBy giu nguyen DOM cua c1067c16", async () => {
		await dung(
			<div data-ghim="empty">
				<KaraState kind="empty" title="Tiêu đề" description="Mô tả" />
			</div>,
		);
		await dung(
			<div data-ghim="off">
				<KaraState
					kind="off"
					reason="Lý do"
					action={<button type="button">Nút</button>}
				/>
			</div>,
		);
		const thuc = {
			empty: qs("[data-ghim=empty]")?.innerHTML ?? "",
			off: qs("[data-ghim=off]")?.innerHTML ?? "",
		};
		if (!existsSync(MAU_KARA_STATE))
			throw new Error(`chua co mau kara-state-goc.json: ${JSON.stringify(thuc)}`);
		const goc = JSON.parse(readFileSync(MAU_KARA_STATE, "utf8")) as Record<
			"empty" | "off",
			string
		>;
		kiemCa(thuc, goc, (k) => `kara-state ${k} doi DOM khi khong truyen prop moi`);
	});

	test("k3-khung prop moi: empty co action ve trong EmptyContent, off co describedBy gan id cho cau ly do", async () => {
		await dung(
			<div data-ca="empty">
				<KaraState
					kind="empty"
					title="Tiêu đề"
					description="Mô tả"
					action={<button type="button">Đọc lại</button>}
				/>
			</div>,
		);
		await dung(
			<div data-ca="off">
				<KaraState kind="off" reason="Lý do" describedBy="ly-do-tat" />
			</div>,
		);
		kiemCa(
			{
				nutEmpty:
					qs("[data-ca=empty] [data-slot=empty-content] button")?.textContent ??
					null,
				idOff:
					qs("[data-ca=off] [data-slot=field-description]")?.getAttribute(
						"id",
					) ?? null,
			},
			{ nutEmpty: "Đọc lại", idOff: "ly-do-tat" },
			(k) => `kara-state prop moi sai: ${k}`,
		);
	});
});
```

- [ ] **Step 5: Chạy lần đầu dưới trần thời gian, đo RSS, lấy DOM gốc**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh /usr/bin/time -l perl -e 'alarm 180; exec @ARGV' bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-khung`
Expected: FAIL hai bài — bài ghim in `chua co mau kara-state-goc.json: {"empty":"…","off":"…"}`; bài prop mới in `kara-state prop moi sai: nutEmpty`. Dòng `maximum resident set size` có mặt; ghi số đó vào mô tả commit. Hết 180 giây mà chưa xong thì `perl` giết tiến trình — dừng và báo, đừng nới trần.

- [ ] **Step 6: Ghi mẫu gốc**

Chép đúng hai chuỗi in ở Step 5 vào `_acceptance/kara-gop-y-luot-2/rang/kara-state-goc.json`:

```json
{
	"empty": "<chuỗi empty in ở Step 5, nguyên văn>",
	"off": "<chuỗi off in ở Step 5, nguyên văn>"
}
```

Chạy lại lệnh Step 5 (bỏ `/usr/bin/time …`): bài ghim PASS, bài prop mới vẫn FAIL `nutEmpty`.

- [ ] **Step 7: Thêm prop vào `state.tsx` (chỉ thêm)**

Đổi đúng hai dòng khai kiểu:

```tsx
	| {
			kind: "empty";
			title: ReactNode;
			description: ReactNode;
			action?: ReactNode;
	  }
```

```tsx
	| { kind: "off"; reason: ReactNode; action?: ReactNode; describedBy?: string }
```

Thêm nhánh mới ở đầu hai `case`, không sửa dòng nào bên dưới:

```tsx
		case "empty":
			if (props.action)
				return (
					<KhungTrong
						kind="empty"
						title={props.title}
						description={props.description}
					>
						{props.action}
					</KhungTrong>
				);
			return (
```

```tsx
		case "off":
			if (props.describedBy)
				return (
					<div data-kara-state="off" className="grid gap-2">
						{props.action}
						<FieldDescription id={props.describedBy}>
							{props.reason}
						</FieldDescription>
					</div>
				);
			return (
```

- [ ] **Step 8: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-khung`
Expected: PASS 2/2.
Run: `git diff c1067c16 -- packages/ui/src/components/kara/state.tsx | grep '^-[^-]'`
Expected: đúng hai dòng `-` là hai dòng khai kiểu `| { kind: "empty"; …` và `| { kind: "off"; …`.
Run: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/nen-kara.dom.tsx`
Expected: PASS (bài cũ của `packages/ui` dùng `KaraState` không đổi).

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/components/kara/state.tsx apps/app/test/khung-gop-y-dung-cho.tsx apps/app/test/khung-gop-y-luot-2.tsx apps/app/test/gop-y-dung-cho-luot-2.dom.tsx apps/app/test/gop-y-dung-cho-luot-2-khung.tsx _acceptance/kara-gop-y-luot-2/rang/kara-state-goc.json
git commit -m "feat(kara): KaraState thêm action cho empty, describedBy cho off; khung bài lượt 2" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Vùng Kara có khung như vùng bên cạnh, một tia sáng, tự khoá khi Kara bận (AC-1, G7)

`independent: false` (cần Task 1) · Evals: E1

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx:22-27` (nhập), `:206-224` (`DeXuatNeo` trả `KaraProposal`)
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:1-20` (nhập), `:323-346` (trả `ban`)
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx:607-626` (bọc `KaraBusyProvider`, vùng thành `DetailSheetSection`)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`

**Interfaces:**
- Consumes: `KaraProposal` (`@crm/ui/components/kara/proposal`), `KaraBusyProvider`, `type KaraBusyState` (`@crm/ui/components/kara/busy`), `DetailSheetSection` (`@/components/detail-sheet`).
- Produces: `GopYMucTieu.ban: KaraBusyState` (`{ label: string } | null`) — khác `null` khi `dangSoan && !quaHan` hoặc `deXuat.isPending`.

- [ ] **Step 1: Viết bài đỏ**

Thêm vào `describe("k3-khung")` của `gop-y-dung-cho-luot-2-khung.tsx` (nhập thêm `D_CAN, D_DOI_TRONG, D_TEN, dsTroLy, dungSheet, dungSheetCoGopY, kho, qsa, chiTietTu, mtSheet, nhom, cho` từ khung chung và `demTiaSang, vungKara` từ khung lượt 2):

```tsx
	test("k3-khung vung la DetailSheetSection nhu vung ben canh, mot tia sang, ba KaraProposal, Kara ban thi nut quyet khoa", async () => {
		await dungSheetCoGopY([D_DOI_TRONG, D_CAN, D_TEN]);
		const vung = vungKara();
		if (!vung) throw new Error("khong co [data-vung-kara]");
		const khung = vung.closest("section");
		const benCanh = qs("[data-khu=vi-sao] section");
		const tia = demTiaSang(vung);
		if (tia !== 1) throw new Error(`tia sang trong vung: ${tia}, mong 1`);
		kiemCa(
			{
				coKhung: khung !== null,
				cungKhung: khung?.className === benCanh?.className,
				soDeXuat: qsa(
					"[data-slot=kara-khoa] > [data-slot=proposed-change]",
					vung,
				).length,
			},
			{ coKhung: true, cungKhung: true, soDeXuat: 3 },
			(k) => `vung kara sai: ${k}`,
		);
		await thaoHet();

		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 3 }));
		kho.troLy = () =>
			dsTroLy([D_DOI_TRONG, D_CAN, D_TEN], { dangSoan: true, maKetThuc: null });
		await dungSheet();
		await cho(() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y", "co gop y khi ban");
		const nutQuyet = qsa("[data-hanh-dong]", vungKara() ?? document.body);
		const mo = nutQuyet.filter((b) => !(b as HTMLButtonElement).disabled).length;
		kiemCa(
			{ soNut: nutQuyet.length > 0, nutMo: mo },
			{ soNut: true, nutMo: 0 },
			(k) => `kara ban ma nut quyet khong khoa: ${k}`,
		);
	});
```

(`thaoHet` nhập từ khung chung.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-khung`
Expected: FAIL `tia sang trong vung: 4, mong 1`.

- [ ] **Step 3: `DeXuatNeo` vẽ `KaraProposal` không icon riêng**

Trong `nhom-kara.tsx` đổi nhập:

```tsx
import { KaraProposal } from "@crm/ui/components/kara/proposal";
import type {
	ProposedChangeAction,
	ProposedChangeDecided,
	ProposedChangeKind,
} from "@crm/ui/components/proposed-change";
```

và khối trả về của `DeXuatNeo`:

```tsx
	return (
		<KaraProposal
			actions={actions.map((a) => ({ ...a, disabled: khoa || a.disabled }))}
			before={d.loai === "viet-lai" ? (d.truoc ?? "") : undefined}
			data-gop-y={d.id}
			decided={decided}
			editing={
				sua === null
					? undefined
					: { value: sua, onChange: setSua, onCancel: () => setSua(null) }
			}
			error={gopY.loiDong[d.id]}
			kind={kind}
			lockedReason={gopY.ghiDuoc ? undefined : m.de.khoaSua}
			media={false}
			pending={gopY.dangQuyet === d.id}
			rationale={rationale}
			value={value}
		/>
	);
```

- [ ] **Step 4: Hook trả `ban`**

Trong `gop-y-kara.ts` thêm nhập:

```ts
import type { KaraBusyState } from "@crm/ui/components/kara/busy";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
```

trong thân hook sau `const mTroLy = …`:

```ts
	const mGopY = okrGopYMessages(useLocale());
```

trước `return`:

```ts
	const ban: KaraBusyState =
		(dangSoan && !quaHan) || deXuat.isPending
			? { label: mGopY.vung.dangDoc }
			: null;
```

và thêm `ban,` vào đối tượng trả về.

- [ ] **Step 5: Khung Mục tiêu bọc vùng**

Trong `objective-sheet.tsx` nhập `KaraBusyProvider` từ `@crm/ui/components/kara/busy`. Thay khối `return (<DetailSheetBody> … </DetailSheetBody>)` của `TabKr` bằng cùng nội dung nhưng bọc con trong `KaraBusyProvider`, và thay `div` vùng cũ:

```tsx
	return (
		<DetailSheetBody>
			<KaraBusyProvider busy={gopY.ban}>
				<KhuViSao mt={mt} />
				{gopY.nhom.viSao.length > 0 ? (
					<div className="flex flex-col gap-1 px-5 pb-3">
						{gopY.nhom.viSao.map((d) => (
							<DeXuatNeo d={d} gopY={gopY} key={d.id} moKr={moKr} />
						))}
					</div>
				) : null}
				<KhuGopVao mt={mt} />
				{coVungKara ? (
					<DetailSheetSection>
						<div className="scroll-mt-4" data-vung-kara ref={vung}>
							<VungKara gopY={gopY} moKr={moKr} soKr={mt.keyResults.length} />
						</div>
					</DetailSheetSection>
				) : null}
				<DetailSheetTable>
```

(phần còn lại của thân giữ nguyên, đóng `</KaraBusyProvider>` ngay trước `</DetailSheetBody>`).

- [ ] **Step 6: Chạy lại bài mới và bài cũ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-khung`
Expected: PASS 3/3.
Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx ./test/the-gop-y-okr.dom.tsx ./test/okr-sheet.dom.tsx`
Expected: PASS. Bài cũ nào đỏ vì đếm icon từng dòng hay vì `div.px-5` thì sửa bài đó (đều trong ranh giới) và ghi tên bài vào commit.

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" apps/app/components/crm/record-sheet/objective-sheet.tsx apps/app/test/gop-y-dung-cho-luot-2-khung.tsx
git commit -m "feat(okr): vùng Kara dùng DetailSheetSection, KaraProposal không icon riêng, khoá khi Kara bận" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Danh sách tải lỗi không làm vùng biến mất (AC-2, Ngoài-14) + Review Focus 1

`independent: false` (cần Task 2) · Evals: E2

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:25-31` (`NoiDungKara`), `:214-224` (`noiDung`), trả `taiLai`
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx:312-365` (thêm `case "tai-loi"`)
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (`vung.viecTai`, `vung.taiLoiMoTa` ở cả `vi` và `en`)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`

**Interfaces:**
- Consumes: `KaraState` (Task 1), `GopYMucTieu.ban` (Task 2).
- Produces: `NoiDungKara` thêm `"tai-loi"`; `GopYMucTieu.taiLai: () => void` (chỉ `danhSach.refetch()`); `OkrGopYMessages.vung.viecTai: string`, `vung.taiLoiMoTa: string`.

- [ ] **Step 1: Viết bài đỏ (E2 + Review Focus 1)**

```tsx
describe("k3-tai-loi", () => {
	const MA_TRAN = [
		{ ten: "may-chu", loi: () => new LoiTrpc("INTERNAL_SERVER_ERROR", "boom") },
		{ ten: "mat-mang", loi: () => new TypeError("Failed to fetch") },
	] as const;

	test("k3-tai-loi vung con, KaraState loi voi cau tai loi, Thu lai chi tai lai danh sach", async () => {
		for (const ca of MA_TRAN) {
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
			kho.troLy = () => {
				throw ca.loi();
			};
			await dungSheet();
			await cho(() => docCua("okr.troLyDanhSach").length > 0, `${ca.ten} doc danh sach`);
			await nhip(6);
			if (vungKara() === null) throw new Error("vung kara bien mat khi tai loi");
			const loi = vungKara()?.querySelector("[data-kara-state=error]") ?? null;
			kiemCa(
				{
					tieuDe: loi?.querySelector("[data-slot=empty-title]")?.textContent ?? null,
					moTa: loi?.querySelector("[data-slot=empty-description]")?.textContent ?? null,
				},
				{
					tieuDe: ui.karaKhung.chuaDuoc(m.vung.viecTai),
					moTa: m.vung.taiLoiMoTa,
				},
				(k) => `${ca.ten} cau tai loi sai: ${k}`,
			);
			const docTruoc = docCua("okr.troLyDanhSach").length;
			await bamChuot(qs("[data-slot=kara-retry]", vungKara() ?? document.body) ?? document.body);
			await cho(() => docCua("okr.troLyDanhSach").length === docTruoc + 1, `${ca.ten} tai lai`);
			kiemCa(
				{ nho: goiCua("okr.troLyDeXuat").length },
				{ nho: 0 },
				(k) => `${ca.ten} Thu lai goi nham Kara: ${k}`,
			);
			await thaoHet();
			kho.daDoc = [];
			kho.daGhi = [];
		}
	});

	test("k3-tai-loi giu gop y khi hoi lai loi: da co danh sach thi lan hoi lai hong khong xoa gop y", async () => {
		let hong = false;
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
		kho.troLy = () => {
			if (hong) throw new TypeError("Failed to fetch");
			return dsTroLy([D_DOI_TRONG, D_CAN]);
		};
		await dungSheet();
		await cho(() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y", "co gop y");
		hong = true;
		await bamChuot(nut(m.de.boQua, deXuat(D_DOI_TRONG.id) ?? document.body));
		await cho(() => goiCua("okr.troLyQuyet").length === 1, "da quyet");
		await nhip(10);
		kiemCa(
			{
				nhom: nhom()?.getAttribute("data-nhom-kara") ?? null,
				conCan: deXuat(D_CAN.id) !== null,
			},
			{ nhom: "co-gop-y", conCan: true },
			(k) => `hoi lai loi xoa gop y dang hien: ${k}`,
		);
	});
});
```

(nhập thêm `LoiTrpc, docCua, goiCua, bamChuot, deXuat, nut, ui, m` từ khung chung.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-tai-loi`
Expected: FAIL `vung kara bien mat khi tai loi`.

- [ ] **Step 3: Chữ mới**

Trong `okr-gop-y.ts`, nhánh `vung` của `vi` thêm:

```ts
		viecTai: "tải góp ý",
		taiLoiMoTa: "Góp ý không mất. Tải lại để xem tiếp.",
```

và của `en`:

```ts
		viecTai: "load suggestions",
		taiLoiMoTa: "Nothing was lost. Reload to see the suggestions.",
```

- [ ] **Step 4: Hook suy ra `tai-loi` và trả `taiLai`**

```ts
export type NoiDungKara =
	| "tat"
	| "chua-goi"
	| "dang-doc"
	| "rong"
	| "loi"
	| "tai-loi"
	| "co-gop-y";
```

```ts
	const noiDung: NoiDungKara = (() => {
		if (!nhoDuoc) return "tat";
		if (danhSach.isError && ds === undefined) return "tai-loi";
		if (ds === undefined || ds.lyDo !== null) return "tat";
		if (tatCa.length > 0) return "co-gop-y";
		if (!ghiDuoc) return "tat";
		if (dangSoan && !quaHan) return "dang-doc";
		if (quaHan || (maKetThuc !== null && maKetThuc !== DA_NOP)) return "loi";
		if (maKetThuc === DA_NOP) return "rong";
		return "chua-goi";
	})();
```

Thêm vào đối tượng trả về: `taiLai: () => void danhSach.refetch(),`.

- [ ] **Step 5: Vẽ `tai-loi`**

Trong `VungKara` của `nhom-kara.tsx` nhập `KaraState` từ `@crm/ui/components/kara/state` và thêm:

```tsx
		case "tai-loi":
			return (
				<div data-nhom-kara="tai-loi">
					<KaraState
						kind="error"
						what={m.vung.viecTai}
						description={m.vung.taiLoiMoTa}
						onRetry={gopY.taiLai}
					/>
				</div>
			);
```

- [ ] **Step 6: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-tai-loi`
Expected: PASS 2/2.
Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx && bun test ./test/messages-guard.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" apps/app/lib/messages/okr-gop-y.ts apps/app/test/gop-y-dung-cho-luot-2-khung.tsx
git commit -m "fix(okr): danh sách góp ý tải lỗi thì vùng Kara báo lỗi có Thử lại thay vì biến mất" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 4: «Nhờ Kara góp ý» lỗi thì vùng nói lỗi có Thử lại (AC-3, Ngoài-15)

`independent: false` (cần Task 3) · Evals: E3

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` (nhập `z`, thêm `LoaiLoiNho`, `loiCoMa`, `maLoi`, `loaiLoiNho`; `NoiDungKara`/`DocLaiKara` thêm `"nho-loi"`; trả `loiNho`, `thuLai`)
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx` (thêm `KhoiLoiKara`, `case "nho-loi"`, nhánh `"nho-loi"` trong `SauKhiQuyetHet`)
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (`vung.viecDoc`, `vung.nhoLoi`)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`

**Interfaces:**
- Consumes: `KaraState` (Task 1), `NoiDungKara` (Task 3).
- Produces:
  - `export type LoaiLoiNho = "khong-quyen" | "mat-mang" | "khac";`
  - `export function loaiLoiNho(cause: unknown): LoaiLoiNho` — `FORBIDDEN` → `"khong-quyen"`; có `data.code` khác → `"khac"`; không có mã → `"mat-mang"`.
  - `function maLoi(cause: unknown): string | null` (nội bộ, Task 7 dùng lại).
  - `GopYMucTieu.loiNho: LoaiLoiNho | null`, `GopYMucTieu.thuLai: () => void` (Task 4: gọi `nho`; Task 6 mở rộng).
  - `OkrGopYMessages.vung.viecDoc: string`, `vung.nhoLoi: Record<LoaiLoiNho, string>`.
  - `KhoiLoiKara({ gopY, moTa }: { gopY: GopYMucTieu; moTa: string })` trong `nhom-kara.tsx` (Task 5, 6 dùng lại).

- [ ] **Step 1: Viết bài đỏ**

```tsx
describe("k3-nho-loi", () => {
	const MA_TRAN = [
		{ ten: "403", loai: "khong-quyen", nem: () => new LoiTrpc("FORBIDDEN", "Forbidden resource") },
		{ ten: "400", loai: "khac", nem: () => new LoiTrpc("BAD_REQUEST", "krKhacMucTieu") },
		{ ten: "mat-mang", loai: "mat-mang", nem: () => new TypeError("Failed to fetch") },
	] as const;

	test("k3-nho-loi Nho Kara bi tu choi hay loi thi vung hien KaraState loi voi cau san pham va Thu lai", async () => {
		for (const ca of MA_TRAN) {
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
			kho.troLy = () => dsTroLy([], { maKetThuc: null, docLuc: null });
			kho.ghiRieng.set("okr.troLyDeXuat", async () => {
				throw ca.nem();
			});
			await dungSheet();
			await cho(() => qs("[data-nut=nho-kara]") !== null, `${ca.ten} nut nho`);
			await bamChuot(qs("[data-nut=nho-kara]") ?? document.body);
			await cho(() => goiCua("okr.troLyDeXuat").length === 1, `${ca.ten} da goi`);
			await nhip(6);
			const loi = qsa("[data-kara-state=error]", vungKara() ?? document.body);
			if (loi.length !== 1) throw new Error("nho kara loi ma khong co cau");
			const chu = loi[0]?.textContent ?? "";
			kiemCa(
				{
					tieuDe: loi[0]?.querySelector("[data-slot=empty-title]")?.textContent ?? null,
					moTa: loi[0]?.querySelector("[data-slot=empty-description]")?.textContent ?? null,
					coThuLai: loi[0]?.querySelector("[data-slot=kara-retry]") !== null,
					loCauTho: chu.includes(ca.nem().message),
				},
				{
					tieuDe: ui.karaKhung.chuaDuoc(m.vung.viecDoc),
					moTa: m.vung.nhoLoi[ca.loai],
					coThuLai: true,
					loCauTho: false,
				},
				(k) => `${ca.ten} sai: ${k}`,
			);
			await thaoHet();
			kho.daGhi = [];
		}
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-nho-loi`
Expected: FAIL `nho kara loi ma khong co cau`.

- [ ] **Step 3: Chữ mới**

`vi.vung`:

```ts
		viecDoc: "đọc Mục tiêu này",
		nhoLoi: {
			"khong-quyen":
				"Bạn không sửa được Mục tiêu hay KR nào ở đây nên chưa nhờ Kara được.",
			"mat-mang": "Mất kết nối nên lời nhờ chưa tới Kara. Chưa trừ lượt nào.",
			khac: "Lời nhờ chưa tới Kara. Chưa có gì bị ghi vào Mục tiêu.",
		},
```

`en.vung`:

```ts
		viecDoc: "read this objective",
		nhoLoi: {
			"khong-quyen":
				"You can't edit this objective or any of its KRs, so Kara can't be asked here.",
			"mat-mang":
				"The connection dropped before the request reached Kara. No request was used.",
			khac: "The request didn't reach Kara. Nothing was written to the objective.",
		},
```

- [ ] **Step 4: Phân loại lỗi và trạng thái `nho-loi`**

Trong `gop-y-kara.ts`:

```ts
import { z } from "zod";
```

```ts
export type NoiDungKara =
	| "tat"
	| "chua-goi"
	| "dang-doc"
	| "rong"
	| "loi"
	| "tai-loi"
	| "nho-loi"
	| "co-gop-y";

export type DocLaiKara = "yen" | "dang-doc" | "loi" | "nho-loi";

export type LoaiLoiNho = "khong-quyen" | "mat-mang" | "khac";

const loiCoMa = z.object({ data: z.object({ code: z.string() }) });

function maLoi(cause: unknown): string | null {
	const doc = loiCoMa.safeParse(cause);
	return doc.success ? doc.data.data.code : null;
}

export function loaiLoiNho(cause: unknown): LoaiLoiNho {
	const ma = maLoi(cause);
	if (ma === null) return "mat-mang";
	return ma === "FORBIDDEN" ? "khong-quyen" : "khac";
}
```

Trong hook, sau khai báo `deXuat`:

```ts
	const loiNho: LoaiLoiNho | null = deXuat.isError
		? loaiLoiNho(deXuat.error)
		: null;
```

`noiDung` chèn `if (loiNho !== null) return "nho-loi";` ngay sau `if (!ghiDuoc) return "tat";`. `docLai` chèn `if (loiNho !== null) return "nho-loi";` làm dòng đầu. Sau hàm `nho` thêm `const thuLai = () => nho();` và trả `loiNho, thuLai,`.

- [ ] **Step 5: Vẽ `nho-loi`**

Trong `nhom-kara.tsx`:

```tsx
function KhoiLoiKara({ gopY, moTa }: { gopY: GopYMucTieu; moTa: string }) {
	const m = okrGopYMessages(useLocale());
	return (
		<KaraState
			kind="error"
			what={m.vung.viecDoc}
			description={moTa}
			onRetry={gopY.thuLai}
		/>
	);
}
```

`VungKara`:

```tsx
		case "nho-loi":
			return (
				<div data-nhom-kara="nho-loi">
					<KhoiLoiKara gopY={gopY} moTa={m.vung.nhoLoi[gopY.loiNho ?? "khac"]} />
				</div>
			);
```

`SauKhiQuyetHet`, trước nhánh `"loi"`:

```tsx
	if (gopY.docLai === "nho-loi")
		return <KhoiLoiKara gopY={gopY} moTa={m.vung.nhoLoi[gopY.loiNho ?? "khac"]} />;
```

- [ ] **Step 6: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-nho-loi && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" apps/app/lib/messages/okr-gop-y.ts apps/app/test/gop-y-dung-cho-luot-2-khung.tsx
git commit -m "fix(okr): Nhờ Kara bị từ chối hay lỗi thì vùng báo lỗi có Thử lại" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Không chờ mãi khi khung mở lúc Kara đang đọc (AC-4, Ngoài-13) + Review Focus 5

`independent: false` (cần Task 4) · Evals: E4

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:85-89` (`nhipHoiLai` xuất ra, không còn trả `false`), `:150` (thêm `thayDocLuc`), `:163-171` (`refetchInterval`), `:208-211` (`quaHan`), `:241-253` (`nho` đặt lại mốc)
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx:261-298` (xoá `KhoiLoi`, `case "loi"` và `SauKhiQuyetHet` dùng `KhoiLoiKara`)
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (xoá `vung.loi`, `vung.thuLai` ở cả hai tiếng — hết chỗ gọi)
- Modify: `apps/app/test/gop-y-dung-cho-khung.tsx:591`, `apps/app/test/gop-y-dung-cho-ra-soat.tsx:233,285,289` (thay `m.vung.loi` bằng `ui.karaKhung.chuaDuoc(m.vung.viecDoc)`, `m.vung.thuLai` bằng `ui.karaKhung.thuLai`)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`

**Interfaces:**
- Consumes: `KhoiLoiKara` (Task 4), `datDongHo`, `KHUNG`, `trangThaiKara` (Task 1), `San.client` (Task 1).
- Produces: `export function nhipHoiLai(tu: number, bayGio: number): number` — `hoiLaiMs` khi dưới trần, `tranChoMs` khi đã quá (vẫn hỏi lại, chậm). State nội bộ `thayDocLuc: number | null` — mốc lúc khung thấy `dangSoan` lần đầu.

- [ ] **Step 1: Viết bài đỏ (E4 + Review Focus 5)**

```tsx
const { nhipHoiLai } = await import("@/app/(app)/[slug]/okr/gop-y-kara");

describe("k3-qua-han", () => {
	const T0 = Date.parse("2026-10-09T03:00:00.000Z");
	const DANG_DOC = () =>
		dsTroLy([], { dangSoan: true, maKetThuc: null, docLuc: null });
	const MA_TRAN = [
		{ ten: "duoi-tran", lech: TRO_LY_OKR_TRAN.tranChoMs - 1000, mong: "working" },
		{ ten: "qua-tran", lech: TRO_LY_OKR_TRAN.tranChoMs + 1000, mong: "error" },
	] as const;

	test("k3-qua-han khung mo luc Kara dang doc va khong bam Nho: duoi tran con dang doc, qua tran sang loi co Thu lai", async () => {
		for (const ca of MA_TRAN) {
			try {
				datDongHo(T0);
				kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
				kho.troLy = DANG_DOC;
				const san = await dungSheet();
				await cho(() => trangThaiKara() === "working", `${ca.ten} dang doc`);
				datDongHo(T0 + ca.lech);
				await san.veLai(KHUNG());
				await nhip(4);
				const thuc = trangThaiKara();
				if (ca.mong === "error" && thuc === "working")
					throw new Error("cho mai khi khung mo luc kara dang doc");
				kiemCa(
					{
						trangThai: thuc,
						coThuLai:
							qs("[data-slot=kara-retry]", vungKara() ?? document.body) !== null,
						daNho: goiCua("okr.troLyDeXuat").length,
					},
					{ trangThai: ca.mong, coThuLai: ca.mong === "error", daNho: 0 },
					(k) => `${ca.ten} sai: ${k}`,
				);
			} finally {
				setSystemTime();
				await thaoHet();
			}
		}
	});

	test("k3-qua-han doc xong muon: qua tran van hoi lai cham, Kara doc xong thi bo loi va hien gop y", async () => {
		kiemCa(
			{
				duoi: nhipHoiLai(0, TRO_LY_OKR_TRAN.tranChoMs - 1),
				qua: nhipHoiLai(0, TRO_LY_OKR_TRAN.tranChoMs + 1),
			},
			{ duoi: TRO_LY_OKR_TRAN.hoiLaiMs, qua: TRO_LY_OKR_TRAN.tranChoMs },
			(k) => `nhip hoi lai sau qua han sai: ${k}`,
		);
		let xong = false;
		try {
			datDongHo(T0);
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
			kho.troLy = () => (xong ? dsTroLy([D_DOI_TRONG]) : DANG_DOC());
			const san = await dungSheet();
			await cho(() => trangThaiKara() === "working", "dang doc");
			datDongHo(T0 + TRO_LY_OKR_TRAN.tranChoMs + 1000);
			await san.veLai(KHUNG());
			await cho(() => trangThaiKara() === "error", "qua han");
			xong = true;
			await act(async () => {
				await san.client.invalidateQueries({ queryKey: ["okr.troLyDanhSach"] });
			});
			await cho(
				() => nhom()?.getAttribute("data-nhom-kara") === "co-gop-y",
				"doc xong muon van ket loi",
			);
		} finally {
			setSystemTime();
		}
	});
});
```

(nhập `setSystemTime` từ `bun:test`, `act` từ `react`, `TRO_LY_OKR_TRAN` từ `@crm/validation/okr-tro-ly`, `datDongHo, KHUNG, trangThaiKara` từ khung lượt 2.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-qua-han`
Expected: FAIL `cho mai khi khung mo luc kara dang doc` (mốc cũ chỉ đặt khi chính người này bấm Nhờ) và `nhip hoi lai sau qua han sai: qua` (hàm cũ trả `false`).

- [ ] **Step 3: Mốc chờ tính từ lúc khung thấy Kara đang đọc**

```ts
export function nhipHoiLai(tu: number, bayGio: number): number {
	return bayGio - tu < TRO_LY_OKR_TRAN.tranChoMs
		? TRO_LY_OKR_TRAN.hoiLaiMs
		: TRO_LY_OKR_TRAN.tranChoMs;
}
```

Trong hook:

```ts
	const [thayDocLuc, setThayDocLuc] = useState<number | null>(null);
```

```ts
	const danhSach = useQuery({
		...trpc.okr.troLyDanhSach.queryOptions({ objectiveId: objectiveId ?? "" }),
		enabled: coDich && nhoDuoc,
		retry: false,
		refetchInterval: (q) =>
			q.state.data?.dangSoan === true
				? nhipHoiLai(thayDocLuc ?? Date.now(), Date.now())
				: false,
	});
```

Ngay sau `const dangSoan = ds?.dangSoan === true;`:

```ts
	if (dangSoan && thayDocLuc === null) setThayDocLuc(Date.now());
	if (!dangSoan && thayDocLuc !== null) setThayDocLuc(null);
```

```ts
	const quaHan =
		dangSoan &&
		thayDocLuc !== null &&
		Math.max(Date.now(), danhSach.dataUpdatedAt) - thayDocLuc >=
			TRO_LY_OKR_TRAN.tranChoMs;
```

Trong `nho` (`onSuccess`, nhánh `kq.bat`): thay `setBatDau(Date.now());` bằng

```ts
				const luc = Date.now();
				setBatDau(luc);
				setThayDocLuc(luc);
```

- [ ] **Step 4: `loi` dùng khối Kara chung; gỡ khối và chữ cũ**

Xoá hàm `KhoiLoi` trong `nhom-kara.tsx`. `VungKara`:

```tsx
		case "loi":
			return (
				<div data-nhom-kara="loi">
					<KhoiLoiKara gopY={gopY} moTa={m.vung.loiMoTa} />
				</div>
			);
```

`SauKhiQuyetHet`: `if (gopY.docLai === "loi") return <KhoiLoiKara gopY={gopY} moTa={m.vung.loiMoTa} />;`. Xoá `loi` và `thuLai` khỏi `vung` của `vi` và `en` trong `okr-gop-y.ts`. Ba bài cũ:

```tsx
			chu: ui.karaKhung.chuaDuoc(m.vung.viecDoc),
```

(`gop-y-dung-cho-khung.tsx:591`, nhập thêm `ui` nếu chưa có), và trong `gop-y-dung-cho-ra-soat.tsx`:

```tsx
			const thuLai = nut(ui.karaKhung.thuLai, nhom() ?? document);
```

```tsx
			() =>
				nhom()?.textContent?.includes(ui.karaKhung.chuaDuoc(m.vung.viecDoc)) ===
				true,
```

```tsx
			(nut(ui.karaKhung.thuLai, nhom() ?? document) as HTMLButtonElement).disabled,
```

- [ ] **Step 5: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-qua-han && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx && bun test ./test/messages-guard.spec.ts`
Expected: PASS (bài cũ «doc qua han thi Thu lai mo duoc va nho lai Kara» vẫn xanh vì mốc mới được đặt lúc thấy `dangSoan`).

- [ ] **Step 6: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" apps/app/lib/messages/okr-gop-y.ts apps/app/test/gop-y-dung-cho-khung.tsx apps/app/test/gop-y-dung-cho-ra-soat.tsx apps/app/test/gop-y-dung-cho-luot-2-khung.tsx
git commit -m "fix(okr): Kara đọc quá trần thì vùng sang lỗi có Thử lại, tính từ lúc khung thấy Kara đang đọc" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Nút Kara khoá hay ẩn thì vùng nói vì sao, không «Thử lại» xám (AC-5, KL Ngoài-4) + Review Focus 2

`independent: false` (cần Task 5) · Evals: E5

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:54-63` (`KHOA_KHI_CHUA_SAN_SANG` thành `TAT_KHI_CHUA_SAN_SANG`), `:233-239` (`nut`), thêm `tat`, đổi `thuLai`
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx` (`cauTat`, `KhoiTat`, `KhoiLoiKara` nhường cho `KhoiTat`, `case "rong"` dùng `KaraState empty` có `action`)
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (`vung.chuaBat`, `vung.tamTat`)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`

**Interfaces:**
- Consumes: `KaraState` `action`/`describedBy` (Task 1), `KhoiLoiKara` (Task 4).
- Produces:
  - `export type LyDoTat = "het-luot" | "tam-nghi" | "chua-bat" | "tam-tat";`
  - `GopYMucTieu.tat: LyDoTat | null` — lý do khi `troLySanSang` trả `bat: false`.
  - `GopYMucTieu.thuLai`: nút mở thì gọi `nho`, không thì đọc lại `troLySanSang`.
  - `NutKara` giữ nguyên kiểu; chỉ `het-luot`/`tam-nghi` thành `khoa`, lý do khác vẫn `an` ở trạng thái «chưa gọi» như trước.

- [ ] **Step 1: Viết bài đỏ (E5 + Review Focus 2)**

```tsx
const { dauThangSau, homNayVn } = await import("@/lib/okr-chu-ky-nhan");

describe("k3-tat", () => {
	const LY_DO = [
		{ ma: "het-luot", lyDo: "het-tran-ngay", cau: () => m.vung.hetLuot },
		{
			ma: "tam-nghi",
			lyDo: "het-tran-thang",
			cau: () => m.vung.tamNghi(dauThangSau(homNayVn(new Date()))),
		},
		{ ma: "chua-bat", lyDo: "don-vi-chua-bat", cau: () => m.vung.chuaBat },
	] as const;
	const VUNG = [
		{ ten: "loi", ds: () => dsTroLy([], { maKetThuc: "loi" }) },
		{ ten: "rong", ds: () => dsTroLy([]) },
	] as const;

	test("k3-tat 3 ly do x 2 trang thai vung: KaraState off noi ly do, khong Thu lai xam, nut tro toi cau ly do", async () => {
		let soCa = 0;
		for (const ld of LY_DO)
			for (const v of VUNG) {
				kho.sanSang = troLySanSangOutput.parse({ bat: false, lyDo: ld.lyDo });
				kho.troLy = v.ds;
				kho.chiTiet = () => chiTietTu(mtSheet());
				await dungSheet();
				await cho(
					() => (vungKara()?.querySelector("[data-kara-state=off]") ?? null) !== null,
					`${ld.ma}/${v.ten} off`,
				);
				const vung = vungKara() ?? document.body;
				const xam = qsa("button[disabled]", vung).filter(
					(b) => b.textContent?.trim() === ui.karaKhung.thuLai,
				).length;
				if (xam > 0) throw new Error("thu lai xam khong ly do");
				const moTa = qs("[data-kara-state=off] [data-slot=field-description]", vung);
				const nutVung = qs("[data-kara-state=off] button", vung);
				kiemCa(
					{
						cau: moTa?.textContent ?? null,
						coId: (moTa?.getAttribute("id") ?? "") !== "",
						troToi: nutVung?.getAttribute("aria-describedby") === moTa?.getAttribute("id"),
					},
					{ cau: ld.cau(), coId: true, troToi: true },
					(k) => `${ld.ma}/${v.ten} sai: ${k}`,
				);
				soCa += 1;
				await thaoHet();
			}
		expect(soCa).toBe(6);
	});

	test("k3-tat thu lai khi chua biet san sang: doc san sang loi thi Thu lai doc lai san sang, khong im lang", async () => {
		kho.rieng.set("okr.troLySanSang", () => {
			throw new TypeError("Failed to fetch");
		});
		kho.troLy = () => dsTroLy([], { maKetThuc: "loi" });
		kho.chiTiet = () => chiTietTu(mtSheet());
		await dungSheet();
		await cho(() => trangThaiKara() === "error", "loi doc");
		const truoc = docCua("okr.troLySanSang").length;
		await bamChuot(
			qs("[data-slot=kara-retry]", vungKara() ?? document.body) ?? document.body,
		);
		await cho(
			() => docCua("okr.troLySanSang").length === truoc + 1,
			"Thu lai im lang khi chua biet san sang",
		);
		expect(goiCua("okr.troLyDeXuat").length).toBe(0);
	});
});
```

(nhập `troLySanSangOutput` từ `../../api/src/okr/okr.contracts`.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-tat`
Expected: FAIL `khong toi: het-luot/loi off` (vùng hiện lỗi có Thử lại) và `khong toi: Thu lai im lang khi chua biet san sang`.

- [ ] **Step 3: Chữ mới**

`vi.vung`:

```ts
		chuaBat:
			"Đơn vị này chưa bật Kara góp ý. Mở lại khi quản trị bật trong Cài đặt OKR.",
		tamTat:
			"Kara đang tạm tắt ở đây. Mở lại khi quản trị bật lại trong Cài đặt OKR.",
```

`en.vung`:

```ts
		chuaBat:
			"Kara feedback is off for this unit. It reopens when an admin turns it on in OKR settings.",
		tamTat:
			"Kara is turned off here for now. It reopens when an admin turns it back on in OKR settings.",
```

- [ ] **Step 4: Hook trả `tat`, `thuLai` không im lặng**

```ts
export type LyDoTat = "het-luot" | "tam-nghi" | "chua-bat" | "tam-tat";

const TAT_KHI_CHUA_SAN_SANG = {
	tat: "tam-tat",
	"viec-tat": "tam-tat",
	"don-vi-chua-bat": "chua-bat",
	"het-tran-thang": "tam-nghi",
	"het-tran-ngay": "het-luot",
	"chua-noi-tac-tu": "tam-tat",
	"chua-co-khoa-mo-hinh": "tam-tat",
	"het-tran-gateway": "tam-tat",
} as const satisfies Record<LyDoKhongSanSang, LyDoTat>;
```

```ts
	const tat: LyDoTat | null =
		sanSang.data && !sanSang.data.bat
			? TAT_KHI_CHUA_SAN_SANG[sanSang.data.lyDo]
			: null;

	const nut: NutKara = (() => {
		const s = sanSang.data;
		if (!s || (dangSoan && !quaHan) || !ghiDuoc) return { loai: "an" };
		if (s.bat) return { loai: "mo" };
		return tat === "het-luot" || tat === "tam-nghi"
			? { loai: "khoa", vi: tat }
			: { loai: "an" };
	})();
```

```ts
	const thuLai = () => {
		if (nut.loai === "mo") nho();
		else void sanSang.refetch();
	};
```

Trả thêm `tat,`.

- [ ] **Step 5: Vẽ `KhoiTat`**

Trong `nhom-kara.tsx` (nhập `type LyDoTat` từ `./gop-y-kara`):

```tsx
function cauTat(vi: LyDoTat, m: OkrGopYMessages): string {
	switch (vi) {
		case "het-luot":
			return m.vung.hetLuot;
		case "tam-nghi":
			return m.vung.tamNghi(dauThangSau(homNayVn(new Date())));
		case "chua-bat":
			return m.vung.chuaBat;
		case "tam-tat":
			return m.vung.tamTat;
	}
}

function KhoiTat({ vi, nhan }: { vi: LyDoTat; nhan: string }) {
	const m = okrGopYMessages(useLocale());
	const id = useId();
	return (
		<KaraState
			kind="off"
			describedBy={id}
			reason={cauTat(vi, m)}
			action={
				<div>
					<Button
						aria-describedby={id}
						data-nut="nho-kara"
						disabled
						size="sm"
						type="button"
						variant="outline"
					>
						<Icon data-icon="inline-start" icon={AiGenerate} />
						{nhan}
					</Button>
				</div>
			}
		/>
	);
}
```

`KhoiLoiKara` nhường chỗ:

```tsx
function KhoiLoiKara({ gopY, moTa }: { gopY: GopYMucTieu; moTa: string }) {
	const m = okrGopYMessages(useLocale());
	if (gopY.tat !== null) return <KhoiTat nhan={m.vung.docLai} vi={gopY.tat} />;
	return (
		<KaraState
			kind="error"
			what={m.vung.viecDoc}
			description={moTa}
			onRetry={gopY.thuLai}
		/>
	);
}
```

`case "rong"`:

```tsx
		case "rong":
			return (
				<div data-nhom-kara="rong">
					<KaraState
						kind="empty"
						title={m.vung.rong}
						description={m.vung.rongMoTa(docLuc ?? "")}
						action={
							gopY.tat !== null ? (
								<KhoiTat nhan={m.vung.docLai} vi={gopY.tat} />
							) : (
								<NutNhoKara gopY={gopY} nhan={m.vung.docLai} />
							)
						}
					/>
				</div>
			);
```

Bỏ nhập `Empty*` nếu không còn chỗ dùng.

- [ ] **Step 6: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-tat && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx && bun test ./test/messages-guard.spec.ts`
Expected: PASS (bảy ca của «bay trang thai cua nhom Kara» giữ `data-nhom-kara` và `data-nut-kara` như cũ).

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" apps/app/lib/messages/okr-gop-y.ts apps/app/test/gop-y-dung-cho-luot-2-khung.tsx
git commit -m "fix(okr): Kara khoá hay tắt thì vùng nói vì sao và khi nào mở lại, bỏ Thử lại xám" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Lỗi khi quyết một góp ý thành câu sản phẩm (AC-6, C4e)

`independent: false` (cần Task 6) · Evals: E6

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` (`LoaiLoiDong`, `loaiLoiDong`, `cauLoiDong`, `baoLoi`, `xoaLoi`; `quyet` dùng `mutateAsync`; `hoanTac` báo lỗi qua `baoLoi`; bỏ `troLyOkrMessages`)
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (`loiDong` ở cả hai tiếng)
- Modify: `apps/app/test/gop-y-dung-cho-khung.tsx:456-507` (bài «CONFLICT doc lai danh sach, loi khac hien dung cho» đòi câu `m.loiDong["chua-san-sang"]` thay cho câu thô «Mất kết nối»)
- Create: `apps/app/test/gop-y-dung-cho-luot-2-dong.tsx`; Modify: `apps/app/test/gop-y-dung-cho-luot-2.dom.tsx` (thêm `await import("./gop-y-dung-cho-luot-2-dong");`)

**Interfaces:**
- Consumes: `maLoi` (Task 4).
- Produces:
  - `export type LoaiLoiDong = "khong-con" | "da-cu" | "chua-san-sang" | "mat-mang";`
  - `export function loaiLoiDong(cause: unknown): LoaiLoiDong` — `NOT_FOUND` → `khong-con`, `CONFLICT` → `da-cu`, mã khác → `chua-san-sang`, không mã → `mat-mang`.
  - `export function cauLoiDong(cause: unknown, m: OkrGopYMessages): string`.
  - `OkrGopYMessages.loiDong: Record<LoaiLoiDong, string>`.
  - Trong hook: `baoLoi(id: string, cause: unknown): void`, `xoaLoi(id: string): void` (Task 8, 9 dùng).

- [ ] **Step 1: Viết bài đỏ — ma trận 4 × 4 viết trước**

`apps/app/test/gop-y-dung-cho-luot-2-dong.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_KR1,
	deXuat,
	dsTroLy,
	dungSheet,
	goChu,
	kho,
	kiemCa,
	KR_1,
	LoiTrpc,
	m,
	mtSheet,
	nhip,
	nut,
	qs,
	thaoHet,
	ui,
} from "./khung-gop-y-dung-cho";

describe("k3-loi-dong", () => {
	const LOI = [
		{ loai: "khong-con", nem: () => new LoiTrpc("NOT_FOUND", "Không có đề xuất clx9k2m1q0000abcd") },
		{ loai: "da-cu", nem: () => new LoiTrpc("CONFLICT", "Đề xuất đã cũ") },
		{ loai: "chua-san-sang", nem: () => new LoiTrpc("BAD_REQUEST", "Chưa sẵn sàng — Mục tiêu đang chờ duyệt") },
		{ loai: "mat-mang", nem: () => new TypeError("Failed to fetch") },
	] as const;
	const HANH_DONG = ["nhan", "sua", "bac", "hoan-tac"] as const;
	const CAM = ["clx", "Trợ lý OKR", "Failed to fetch", "Chưa sẵn sàng"];

	async function lam(hd: (typeof HANH_DONG)[number]) {
		const dong = () => deXuat(D_KR1.id) ?? document.body;
		if (hd === "nhan" || hd === "hoan-tac") await bamChuot(nut(m.de.doiTenKr, dong()));
		if (hd === "bac") await bamChuot(nut(m.de.boQua, dong()));
		if (hd === "sua") {
			await bamChuot(nut(m.de.sua, dong()));
			await goChu(qs("textarea", dong()) ?? document.body, " trong quý");
			await bamChuot(nut(m.de.doiTenKr, dong()));
		}
		if (hd === "hoan-tac") {
			await cho(() => qs("[data-slot=proposed-change-receipt]", dong()) !== null, "bien nhan");
			await bamChuot(nut(ui.proposedChange.undo, dong()));
		}
	}

	test("k3-loi-dong 4 hanh dong x 4 loai loi: cau san pham duoi gop y, khong ma tho", async () => {
		let soO = 0;
		for (const hd of HANH_DONG)
			for (const loi of LOI) {
				kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 1 }));
				kho.troLy = () => dsTroLy([D_KR1]);
				if (hd === "hoan-tac")
					kho.ghiRieng.set("okr.updateKeyResult", async () => {
						throw loi.nem();
					});
				else if (loi.loai === "chua-san-sang")
					kho.ghiRieng.set("okr.troLyQuyet", async () => ({ ok: false, lyDo: "het-tran-ngay" }));
				else
					kho.ghiRieng.set("okr.troLyQuyet", async () => {
						throw loi.nem();
					});
				await dungSheet();
				await cho(() => deXuat(D_KR1.id) !== null, `${hd}/${loi.loai} gop y`);
				await lam(hd);
				await cho(
					() => qs("[data-slot=field-error]", deXuat(D_KR1.id) ?? document.body) !== null,
					`${hd}/${loi.loai} cau loi`,
				);
				await nhip(4);
				const chu = qs("[data-slot=field-error]", deXuat(D_KR1.id) ?? document.body)?.textContent ?? "";
				const lo = CAM.find((c) => chu.includes(c));
				if (lo) throw new Error(`lo cau tho: ${lo} (${hd}/${loi.loai})`);
				kiemCa({ chu }, { chu: m.loiDong[loi.loai] }, () => `${hd}/${loi.loai} cau sai`);
				soO += 1;
				await thaoHet();
				kho.ghiRieng.clear();
			}
		expect(soO).toBe(16);
	});
});
```

Nối vào cửa vào: `await import("./gop-y-dung-cho-luot-2-dong");`.

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-loi-dong`
Expected: FAIL `lo cau tho: clx (nhan/khong-con)`.

- [ ] **Step 3: Chữ mới**

```ts
	loiDong: {
		"khong-con": "Góp ý này không còn — có thể đã được quyết ở nơi khác.",
		"da-cu": "Góp ý này đã cũ vì Mục tiêu vừa đổi. Danh sách đã tải lại.",
		"chua-san-sang": "Chưa quyết được góp ý này lúc này. Thử lại sau ít phút.",
		"mat-mang": "Mất kết nối nên chưa ghi được. Thử lại khi có mạng.",
	},
```

```ts
	loiDong: {
		"khong-con": "This suggestion is gone — it may have been decided elsewhere.",
		"da-cu":
			"This suggestion is out of date because the objective just changed. The list has been reloaded.",
		"chua-san-sang":
			"This suggestion can't be decided right now. Try again in a few minutes.",
		"mat-mang":
			"The connection dropped, so nothing was saved. Try again when you're back online.",
	},
```

(khoá cấp cao nhất, cạnh `vet`, ở cả `vi` và `en`).

- [ ] **Step 4: Phân loại và gắn câu theo dòng**

```ts
export type LoaiLoiDong = "khong-con" | "da-cu" | "chua-san-sang" | "mat-mang";

export function loaiLoiDong(cause: unknown): LoaiLoiDong {
	const ma = maLoi(cause);
	if (ma === null) return "mat-mang";
	if (ma === "NOT_FOUND") return "khong-con";
	if (ma === "CONFLICT") return "da-cu";
	return "chua-san-sang";
}

export function cauLoiDong(cause: unknown, m: OkrGopYMessages): string {
	return m.loiDong[loaiLoiDong(cause)];
}
```

Trong hook (bỏ `const mTroLy = …` và nhập `troLyOkrMessages`; nhập `type OkrGopYMessages`):

```ts
	const baoLoi = (id: string, cause: unknown) =>
		setLoiDong((cu) => ({ ...cu, [id]: cauLoiDong(cause, mGopY) }));
	const xoaLoi = (id: string) => setLoiDong(({ [id]: _bo, ...cu }) => cu);

	const quyet = (d: DongHien, cach: CachQuyet, giaTri?: string) => {
		if (dangQuyet !== null || !ghiDuoc) return;
		const thuTuNay = tatCa.map((x) => x.id);
		setDangQuyet(d.id);
		xoaLoi(d.id);
		void quyetDong
			.mutateAsync({ deXuatId: d.id, cach, giaTri })
			.then(
				(kq) => {
					if (!kq.ok) {
						void sanSang.refetch();
						setLoiDong((cu) => ({ ...cu, [d.id]: mGopY.loiDong["chua-san-sang"] }));
						return;
					}
					setThuTu(thuTuNay);
					setDaQuyet((cu) => [...cu.filter((x) => x.id !== d.id), d]);
					setKetCua((cu) => ({
						...cu,
						[d.id]: {
							ket: KET_CUA_CACH[cach],
							giaTri: giaTri ?? d.sau,
							daHoanTac: false,
						},
					}));
					if (objectiveId) void cache.okr(objectiveId);
				},
				(cause: unknown) => {
					if (loaiLoiDong(cause) === "da-cu") void danhSach.refetch();
					baoLoi(d.id, cause);
				},
			)
			.finally(() => setDangQuyet(null));
	};
```

Trong `hoanTac` thay `onError: (e: { message: string }) => setLoiDong(…e.message…)` bằng `onError: (cause: unknown) => baoLoi(d.id, cause),`.

- [ ] **Step 5: Sửa bài cũ ghim câu thô**

Trong `gop-y-dung-cho-khung.tsx` bài «CONFLICT doc lai danh sach, loi khac hien dung cho» thay khối `expect(qs("[data-slot=field-error]", can)?.textContent).toContain("Mất kết nối")` bằng:

```tsx
		expect(qs("[data-slot=field-error]", can)?.textContent).toBe(
			m.loiDong["chua-san-sang"],
		);
```

- [ ] **Step 6: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-loi-dong && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx && bun test ./test/messages-guard.spec.ts`
Expected: PASS; dòng cuối của `k3-loi-dong` không in lỗi, `soO` = 16.

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" apps/app/lib/messages/okr-gop-y.ts apps/app/test/gop-y-dung-cho-khung.tsx apps/app/test/gop-y-dung-cho-luot-2-dong.tsx apps/app/test/gop-y-dung-cho-luot-2.dom.tsx
git commit -m "fix(okr): lỗi khi quyết góp ý hiện câu sản phẩm theo loại lỗi, không mã thô" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Hai Hoàn tác chồng nhau không đua (AC-8, KL Ngoài-16)

`independent: false` (cần Task 7) · Evals: E8

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` (`TrangThaiDong`, `dangHoan`, `coHoanTac`, `chayHoanTac`, `hoanTac` bất đồng bộ theo từng mã, `trangThai`)
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx:127-136` (`onUndo` dùng `gopY.coHoanTac`), `DeXuatNeo` thêm `data-trang-thai`
- Test: `apps/app/test/gop-y-dung-cho-luot-2-dong.tsx`

**Interfaces:**
- Consumes: `baoLoi`, `xoaLoi` (Task 7).
- Produces:
  - `export type TrangThaiDong = "cho" | "dang-quyet" | "da-quyet" | "dang-hoan-tac" | "da-hoan-tac";`
  - `GopYMucTieu.trangThai: (id: string) => TrangThaiDong`, `GopYMucTieu.coHoanTac: (d: DongHien) => boolean`, `GopYMucTieu.hoanTac: (d: DongHien) => Promise<void>`.
  - Dấu DOM `data-trang-thai` trên mỗi dòng góp ý.

- [ ] **Step 1: Viết bài đỏ**

```tsx
describe("k3-hai-hoan", () => {
	test("k3-hai-hoan hoan tac KR1 roi KR2 truoc khi lan dau xong: moi KR ve dung luc lan cua no xong, loi nam duoi dung KR", async () => {
		let hongLanMot: (e: Error) => void = () => {};
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
		kho.troLy = () => dsTroLy([D_KR1, D_KR2]);
		kho.ghiRieng.set("okr.updateKeyResult", (vao) =>
			vao?.id === KR_1.id
				? new Promise<KetQuaGhi>((_, hong) => {
						hongLanMot = hong;
					})
				: Promise.resolve({ id: String(vao?.id), canhBao: null }),
		);
		await dungSheet();
		const tt = (id: string) => deXuat(id)?.getAttribute("data-trang-thai") ?? null;
		const dong = (id: string) => deXuat(id) ?? document.body;
		await cho(() => deXuat(D_KR1.id) !== null && deXuat(D_KR2.id) !== null, "hai kr");
		await bamChuot(nut(m.de.doiTenKr, dong(D_KR1.id)));
		await cho(() => tt(D_KR1.id) === "da-quyet", "kr1 da nhan");
		await bamChuot(nut(m.de.doiTenKr, dong(D_KR2.id)));
		await cho(() => tt(D_KR2.id) === "da-quyet", "kr2 da nhan");
		await bamChuot(nut(ui.proposedChange.undo, dong(D_KR1.id)));
		await cho(() => tt(D_KR1.id) === "dang-hoan-tac", "kr1 dang hoan tac");
		await bamChuot(nut(ui.proposedChange.undo, dong(D_KR2.id)));
		await nhip(6);
		if (tt(D_KR2.id) !== "da-hoan-tac") throw new Error(`kr2 khong ve cho: ${tt(D_KR2.id)}`);
		if (tt(D_KR1.id) !== "dang-hoan-tac") throw new Error(`kr1 khong con dang lam: ${tt(D_KR1.id)}`);
		await act(async () => hongLanMot(new LoiTrpc("CONFLICT", "Tên KR đã đổi")));
		await nhip(6);
		const loiCua = (id: string) =>
			qs("[data-slot=field-error]", dong(id))?.textContent ?? null;
		if (loiCua(D_KR2.id) !== null) throw new Error("loi lan mot roi vao kr2");
		if (tt(D_KR1.id) !== "da-quyet") throw new Error(`kr1 khong ve cho: ${tt(D_KR1.id)}`);
		kiemCa(
			{ loiKr1: loiCua(D_KR1.id), kr2: tt(D_KR2.id) },
			{ loiKr1: m.loiDong["da-cu"], kr2: "da-hoan-tac" },
			(k) => `hai hoan tac sai: ${k}`,
		);
	});
});
```

(nhập thêm `D_KR2`, `type KetQuaGhi` từ khung chung, `act` từ `react`.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-hai-hoan`
Expected: FAIL `khong toi: kr1 da nhan` (chưa có `data-trang-thai`).

- [ ] **Step 3: Hoàn tác giữ trạng thái theo mã góp ý**

```ts
export type TrangThaiDong =
	| "cho"
	| "dang-quyet"
	| "da-quyet"
	| "dang-hoan-tac"
	| "da-hoan-tac";
```

Trong hook:

```ts
	const [dangHoan, setDangHoan] = useState<Readonly<Record<string, boolean>>>({});
	const datDangHoan = (id: string, dang: boolean) =>
		setDangHoan((cu) => ({ ...cu, [id]: dang }));

	const coHoanTac = (d: DongHien): boolean => {
		const k = ketCua[d.id];
		if (!k || k.ket !== "accepted" || k.daHoanTac) return false;
		return d.loai === "viet-lai" && d.truong !== null && d.truoc !== null;
	};

	const chayHoanTac = async (d: DongHien) => {
		const truoc = d.truoc ?? "";
		if (d.truong === "kr.title" && d.keyResultId) {
			await suaKr.mutateAsync({ id: d.keyResultId, title: truoc });
			return;
		}
		await suaMucTieu.mutateAsync(
			d.truong === "title"
				? { id: d.objectiveId, title: truoc }
				: { id: d.objectiveId, whyNow: truoc },
		);
	};

	const hoanTac = async (d: DongHien) => {
		if (!coHoanTac(d) || dangHoan[d.id]) return;
		datDangHoan(d.id, true);
		xoaLoi(d.id);
		try {
			await chayHoanTac(d);
			setKetCua((cu) => {
				const k = cu[d.id];
				return k ? { ...cu, [d.id]: { ...k, daHoanTac: true } } : cu;
			});
			if (objectiveId) void cache.okr(objectiveId);
		} catch (cause) {
			baoLoi(d.id, cause);
		} finally {
			datDangHoan(d.id, false);
		}
	};

	const trangThai = (id: string): TrangThaiDong => {
		if (dangHoan[id]) return "dang-hoan-tac";
		const k = ketCua[id];
		if (k?.daHoanTac) return "da-hoan-tac";
		if (k) return "da-quyet";
		return dangQuyet === id ? "dang-quyet" : "cho";
	};
```

Trả thêm `coHoanTac, trangThai,` (thay `hoanTac` cũ bằng bản trên).

- [ ] **Step 4: Dòng góp ý dùng trạng thái mới**

Trong `DeXuatNeo`:

```tsx
				onUndo: gopY.coHoanTac(d) ? () => void gopY.hoanTac(d) : undefined,
```

và thêm thuộc tính `data-trang-thai={gopY.trangThai(d.id)}` cho `KaraProposal`.

- [ ] **Step 5: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t "k3-hai-hoan|k3-loi-dong" && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx`
Expected: PASS (bài cũ «nhan, sua roi nhan, hoan tac va dau theo Kara» vẫn xanh).

- [ ] **Step 6: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" apps/app/test/gop-y-dung-cho-luot-2-dong.tsx
git commit -m "fix(okr): mỗi lần hoàn tác giữ trạng thái và lỗi theo đúng góp ý của nó" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: «Căn chỉnh» có Hoàn tác, gỡ đúng liên kết vừa tạo (AC-7, Ngoài-11) + Review Focus 3

`independent: false` (cần Task 8) · Evals: E7

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:40-44` (`KetDong.canChinhId`), thêm `NoiGop`, `khopDich`, `lienKetVuaTao`, `lienKetHienCo`; `quyet` chụp liên kết trước khi nhận Căn chỉnh; `coHoanTac`/`chayHoanTac` thêm nhánh Căn chỉnh; `goCanChinh` (`removeAlignment`)
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx:79-83` (`chuBienNhan` có câu hoàn tác Căn chỉnh)
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (`bienNhan.hoanTacCanChinh`)
- Modify: `apps/app/test/messages-guard.spec.ts:244` (ghim `okr-gop-y:bienNhan.hoanTacCanChinh`)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-dong.tsx`

**Interfaces:**
- Consumes: `hoanTac`, `coHoanTac`, `trangThai` (Task 8), `lienKet` (Task 1).
- Produces:
  - `KetDong = { ket: "accepted" | "skipped"; giaTri: string | null; daHoanTac: boolean; canChinhId: string | null }`.
  - `export function lienKetVuaTao(truoc: readonly NoiGop[], sau: readonly NoiGop[], d: DongHien): string | null` — liên kết có trong `sau`, không có trong `truoc`, khớp đích của `d`; đúng một cái thì trả id, không thì `null`.
  - `OkrGopYMessages.bienNhan.hoanTacCanChinh: (ten: string) => string`.

- [ ] **Step 1: Viết bài đỏ (E7 + Review Focus 3)**

```tsx
describe("k3-can-chinh", () => {
	const X = "kr-goc";
	const MA_TRAN = [
		{ ten: "khac-dich", truoc: [lienKet("y-cu", "kr-khac")], sau: [lienKet("y-cu", "kr-khac"), lienKet("x-moi", X)], go: "x-moi" },
		{ ten: "cung-dich", truoc: [lienKet("x-cu", X)], sau: [lienKet("x-cu", X), lienKet("x-moi", X)], go: "x-moi" },
		{ ten: "khong-tao-moi", truoc: [lienKet("x-cu", X)], sau: [lienKet("x-cu", X)], go: null },
		{ ten: "hai-lien-ket-moi-cung-dich", truoc: [], sau: [lienKet("x-moi-1", X), lienKet("x-moi-2", X)], go: null },
	] as const;

	async function nhanCanChinh(
		ca: { truoc: readonly NoiGop[]; sau: readonly NoiGop[] },
		goDi: string[],
		goLoi: Error | null,
	) {
		let daNhan = false;
		kho.chiTiet = () =>
			chiTietTu(mtSheet({ soGopYCho: 1, alignments: [...(daNhan ? ca.sau : ca.truoc)] }));
		kho.troLy = () => dsTroLy([D_CAN]);
		kho.ghiRieng.set("okr.troLyQuyet", async () => {
			daNhan = true;
			return { ok: true };
		});
		kho.ghiRieng.set("okr.removeAlignment", async (vao) => {
			goDi.push(String(vao?.id));
			if (goLoi) throw goLoi;
			return { ok: true };
		});
		await dungSheet();
		await cho(() => deXuat(D_CAN.id) !== null, "gop y can chinh");
		await bamChuot(nut(m.dong.canChinh, deXuat(D_CAN.id) ?? document.body));
		await cho(
			() => qs("[data-slot=proposed-change-receipt]", deXuat(D_CAN.id) ?? document.body) !== null,
			"bien nhan can chinh",
		);
		await nhip(6);
	}

	test("k3-can-chinh nhan -> lam moi -> Hoan tac: go dung lien ket vua tao, khong bao gio go lien ket co tu truoc", async () => {
		for (const ca of MA_TRAN) {
			const goDi: string[] = [];
			await nhanCanChinh(ca, goDi, null);
			const dong = deXuat(D_CAN.id) ?? document.body;
			const nutHoan = nutCo(ui.proposedChange.undo, dong);
			if (ca.go === null) {
				kiemCa({ coHoanTac: nutHoan !== null }, { coHoanTac: false }, () => `${ca.ten}: co Hoan tac du khong biet lien ket nao vua tao`);
				await thaoHet();
				continue;
			}
			if (!nutHoan) throw new Error(`${ca.ten}: bien nhan khong co Hoan tac`);
			await bamChuot(nutHoan);
			await cho(() => goDi.length > 0, `${ca.ten} goi go lien ket`);
			if (goDi.some((id) => id !== ca.go)) throw new Error(`go nham lien ket: ${goDi.join(",")}`);
			await cho(() => deXuat(D_CAN.id)?.getAttribute("data-trang-thai") === "da-hoan-tac", `${ca.ten} ve cho`);
			kiemCa(
				{
					soLan: goDi.length,
					chu: qs("[data-slot=proposed-change-decided]", deXuat(D_CAN.id) ?? document.body)?.textContent ?? null,
				},
				{ soLan: 1, chu: m.bienNhan.hoanTacCanChinh(D_CAN.tenDich ?? "") },
				(k) => `${ca.ten} sai: ${k}`,
			);
			await thaoHet();
		}
	});

	test("k3-can-chinh Hoan tac loi thi cau loi duoi bien nhan, bien nhan con", async () => {
		const goDi: string[] = [];
		await nhanCanChinh(MA_TRAN[1], goDi, new LoiTrpc("NOT_FOUND", "Không có căn chỉnh clx77"));
		await bamChuot(nut(ui.proposedChange.undo, deXuat(D_CAN.id) ?? document.body));
		await cho(() => qs("[data-slot=field-error]", deXuat(D_CAN.id) ?? document.body) !== null, "loi hoan tac");
		kiemCa(
			{
				loi: qs("[data-slot=field-error]", deXuat(D_CAN.id) ?? document.body)?.textContent ?? null,
				trangThai: deXuat(D_CAN.id)?.getAttribute("data-trang-thai") ?? null,
			},
			{ loi: m.loiDong["khong-con"], trangThai: "da-quyet" },
			(k) => `hoan tac loi sai: ${k}`,
		);
	});
});
```

(nhập `D_CAN`, `nutCo` từ khung chung; `lienKet`, `type NoiGop` từ khung lượt 2.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-can-chinh`
Expected: FAIL `khac-dich: bien nhan khong co Hoan tac`.

- [ ] **Step 3: Chữ mới và ghim**

`vi.bienNhan`: `hoanTacCanChinh: (ten: string) => \`Đã hoàn tác — bỏ góp vào «${ten}»\`,`
`en.bienNhan`: `hoanTacCanChinh: (ten: string) => \`Undone — no longer contributes to “${ten}”\`,`
`messages-guard.spec.ts`, trong `GHIM_OKR_GOP_Y`:

```ts
	"okr-gop-y:bienNhan.hoanTacCanChinh": [
		"Đã hoàn tác — bỏ góp vào «1»",
		"Đã hoàn tác — bỏ góp vào «12»",
	],
```

- [ ] **Step 4: Tìm liên kết vừa tạo và gỡ đúng nó**

```ts
type NoiGop = RouterOutputs["okr"]["objective"]["alignments"][number];

export type KetDong = {
	ket: "accepted" | "skipped";
	giaTri: string | null;
	daHoanTac: boolean;
	canChinhId: string | null;
};

function khopDich(g: NoiGop, d: DongHien): boolean {
	return d.targetKeyResultId !== null
		? g.targetKeyResultId === d.targetKeyResultId
		: g.targetKeyResultId === null && g.targetObjectiveId === d.targetObjectiveId;
}

export function lienKetVuaTao(
	truoc: readonly NoiGop[],
	sau: readonly NoiGop[],
	d: DongHien,
): string | null {
	const cu = new Set(truoc.map((g) => g.alignmentId));
	const moi = sau.filter((g) => khopDich(g, d) && !cu.has(g.alignmentId));
	return moi.length === 1 ? (moi[0]?.alignmentId ?? null) : null;
}
```

Trong hook:

```ts
	const goCanChinh = useMutation(trpc.okr.removeAlignment.mutationOptions());
	const lienKetHienCo = (): readonly NoiGop[] | null =>
		objectiveId
			? (qc.getQueryData<RouterOutputs["okr"]["objective"]>(
					trpc.okr.objective.queryKey({ id: objectiveId }),
				)?.alignments ?? null)
			: null;
	const lienKetSauKhiNhan = async (
		truoc: readonly NoiGop[] | null,
		d: DongHien,
	): Promise<string | null> => {
		if (truoc === null || !objectiveId) return null;
		await cache.okr(objectiveId);
		return lienKetVuaTao(truoc, lienKetHienCo() ?? [], d);
	};
```

`quyet`: trước `setDangQuyet(d.id);` thêm

```ts
		const truocLienKet =
			d.loai === "can-chinh" && cach === "nhan" ? lienKetHienCo() : null;
```

nhánh thành công đổi thành `async (kq) => { … }` và thay khối `setThuTu … if (objectiveId) void cache.okr(objectiveId);` bằng:

```ts
					const canChinhId = await lienKetSauKhiNhan(truocLienKet, d);
					setThuTu(thuTuNay);
					setDaQuyet((cu) => [...cu.filter((x) => x.id !== d.id), d]);
					setKetCua((cu) => ({
						...cu,
						[d.id]: {
							ket: KET_CUA_CACH[cach],
							giaTri: giaTri ?? d.sau,
							daHoanTac: false,
							canChinhId,
						},
					}));
					if (objectiveId && truocLienKet === null) void cache.okr(objectiveId);
```

`coHoanTac`:

```ts
	const coHoanTac = (d: DongHien): boolean => {
		const k = ketCua[d.id];
		if (!k || k.ket !== "accepted" || k.daHoanTac) return false;
		if (d.loai === "can-chinh") return k.canChinhId !== null;
		return d.loai === "viet-lai" && d.truong !== null && d.truoc !== null;
	};
```

`chayHoanTac` thêm nhánh đầu:

```ts
		const canChinhId = ketCua[d.id]?.canChinhId ?? null;
		if (d.loai === "can-chinh") {
			if (canChinhId !== null) await goCanChinh.mutateAsync({ id: canChinhId });
			return;
		}
```

- [ ] **Step 5: Biên nhận nói đã bỏ góp vào**

`chuBienNhan`, đầu khối `if (k.daHoanTac) {`:

```tsx
		if (d.loai === "can-chinh")
			return m.bienNhan.hoanTacCanChinh(d.tenDich ?? "");
```

- [ ] **Step 6: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t "k3-can-chinh|k3-hai-hoan|k3-loi-dong" && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx && bun test ./test/messages-guard.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" apps/app/lib/messages/okr-gop-y.ts apps/app/test/messages-guard.spec.ts apps/app/test/gop-y-dung-cho-luot-2-dong.tsx
git commit -m "feat(okr): nhận Căn chỉnh theo Kara có Hoàn tác, chỉ gỡ liên kết vừa tạo" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Chip không đứng số cũ khi đóng khung trước lúc Kara đọc xong (AC-9, KL Ngoài-1)

`independent: false` (cần Task 9) · Evals: E9

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` (hàm mức mô-đun `theoDenXong`; `nho` dùng `mutateAsync` và gọi `theoDenXong`)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-dong.tsx`

**Interfaces:**
- Consumes: `nhipHoiLai` (Task 5), `useCrmCache().okr(id): Promise<void>`.
- Produces: `function theoDenXong(qc: QueryClient, objectiveId: string, batDau: number, hoi: () => Promise<RouterOutputs["okr"]["troLyDanhSach"]>, xong: () => Promise<void>): void` — hỏi lại ở mức `QueryClient`, không phụ thuộc hook còn gắn; mỗi `QueryClient` × Mục tiêu chỉ một vòng.

- [ ] **Step 1: Viết bài đỏ**

```tsx
describe("k3-chip", () => {
	test("k3-chip nho Kara roi dong khung khi Kara con doc: chip danh sach va Cua toi doi so moi khong tai lai trang", async () => {
		for (const dongKhung of [true, false]) {
			let pha: "chua" | "soan" | "xong" = "chua";
			const mt = () => mtSheet({ soGopYCho: pha === "xong" ? 2 : 0 });
			const datMine = () => {
				kho.mine = mineOutput.parse({ dangTheoDoi: [], objectives: [mt()], daBo: [] });
			};
			kho.danhSach = () => danhSachTu([mt()], pha === "xong" ? 1 : 0);
			kho.chiTiet = () => chiTietTu(mt());
			kho.troLy = () => {
				if (pha === "xong") return dsTroLy([D_TEN, D_KR1]);
				if (pha === "soan") return dsTroLy([], { dangSoan: true, maKetThuc: null });
				return dsTroLy([], { maKetThuc: null, docLuc: null });
			};
			kho.ghiRieng.set("okr.troLyDeXuat", async () => {
				pha = "soan";
				return { bat: true, taskId: "t-chip", dungLai: false };
			});
			datMine();
			const DS = () => (
				<>
					<CuaToi />
					<TheoDonVi />
				</>
			);
			const san = await dung(
				<>
					{DS()}
					{KHUNG()}
				</>,
			);
			await cho(() => qs("[data-nut=nho-kara]") !== null, "nut nho");
			await bamChuot(qs("[data-nut=nho-kara]") ?? document.body);
			await cho(() => goiCua("okr.troLyDeXuat").length === 1, "da nho");
			if (dongKhung) await san.veLai(DS());
			pha = "xong";
			datMine();
			const chip = () =>
				qsa("[data-chip-gop-y]").map((c) => c.textContent?.replace(/\s+/g, " ").trim() ?? "");
			await choLau(
				() => chip().length === 2 && chip().every((c) => c === `Kara · ${m.chip("2")}`),
				"chip",
				TRO_LY_OKR_TRAN.hoiLaiMs * 4,
			).catch(() => {
				throw new Error(`chip dung so cu sau khi dong khung (dongKhung=${dongKhung}): ${chip().join(" | ")}`);
			});
			await thaoHet();
			kho.daGhi = [];
		}
	}, 30_000);
});
```

(nhập `CuaToi, TheoDonVi, danhSachTu, D_TEN, dung, goiCua, qsa` từ khung chung, `mineOutput` từ `../../api/src/okr/okr.contracts`, `choLau, KHUNG` từ khung lượt 2, `TRO_LY_OKR_TRAN` từ `@crm/validation/okr-tro-ly`.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-chip`
Expected: FAIL `chip dung so cu sau khi dong khung (dongKhung=true): ` (ca đối chứng `dongKhung=false` không chạy tới vì vòng đầu đã ném).

- [ ] **Step 3: Hỏi lại ở mức `QueryClient`**

Trong `gop-y-kara.ts` (mức mô-đun):

```ts
const DANG_THEO = new WeakMap<QueryClient, Set<string>>();

function theoDenXong(
	qc: QueryClient,
	objectiveId: string,
	batDau: number,
	hoi: () => Promise<RouterOutputs["okr"]["troLyDanhSach"]>,
	xong: () => Promise<void>,
): void {
	const dang = DANG_THEO.get(qc) ?? new Set<string>();
	DANG_THEO.set(qc, dang);
	if (dang.has(objectiveId)) return;
	dang.add(objectiveId);
	const vong = async () => {
		const ds = await hoi().catch(() => null);
		if (ds?.dangSoan === true) {
			setTimeout(() => void vong(), nhipHoiLai(batDau, Date.now()));
			return;
		}
		dang.delete(objectiveId);
		if (ds !== null) await xong();
	};
	setTimeout(() => void vong(), TRO_LY_OKR_TRAN.hoiLaiMs);
}
```

`nho` dùng `mutateAsync` (lời hứa vẫn về khi khung đã đóng, khác callback của `mutate`):

```ts
	const nho = () => {
		if (!coDich || nut.loai !== "mo" || deXuat.isPending) return;
		const muc = objectiveId ?? "";
		void deXuat.mutateAsync(dich).then(
			(kq) => {
				if (!kq.bat) {
					void sanSang.refetch();
					return;
				}
				const luc = Date.now();
				setBatDau(luc);
				setThayDocLuc(luc);
				void danhSach.refetch();
				theoDenXong(
					qc,
					muc,
					luc,
					() =>
						qc.fetchQuery({
							...trpc.okr.troLyDanhSach.queryOptions({ objectiveId: muc }),
							staleTime: 0,
						}),
					() => cache.okr(muc),
				);
			},
			() => void sanSang.refetch(),
		);
	};
```

- [ ] **Step 4: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t "k3-chip|k3-nho-loi|k3-qua-han" && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx`
Expected: PASS (bài cũ «Kara doc xong trong khung thi chip danh sach … lam moi» vẫn xanh).

- [ ] **Step 5: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" apps/app/test/gop-y-dung-cho-luot-2-dong.tsx
git commit -m "fix(okr): đóng khung trước khi Kara đọc xong thì chip vẫn đổi sang số mới" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 11: Máy chủ cho người phụ trách KR nhờ Kara cả Mục tiêu (AC-10 phía API, #5)

`independent: true` (chỉ chạm API; chạy song song được với Task 2–10) · Evals: E10 · **Cần duyệt trước:** hai dòng `tro-ly-okr-de-xuat-quyen.spec.ts` và `docs/api.md` ở mục «Cần xin chạm tệp thêm». Chưa duyệt thì làm tới Step 5 rồi dừng, báo `pre-push` sẽ đỏ ở ma trận quyền.

**Files:**
- Modify: `apps/api/src/okr/tro-ly.service.ts:228-244` (`assertSuaDich`), thêm `coKrSuaDuoc` ngay sau
- Create: `apps/api/test/kara-gop-y-luot-2.spec.ts`
- Modify (cần duyệt): `apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts:61-81`
- Modify (cần duyệt): `docs/api.md:1031-1034`

**Interfaces:**
- Consumes: `OkrAccessService.assertXemMucTieu(userId, objectiveId): { q, nc, mt }`, `OkrAccessService.suaDuocDonVi(q, userId, mt): boolean`, `OKR.thongDiep.khongSuaDuocDonVi`.
- Produces: `troLySanSang`/`troLyDeXuat` không kèm `keyResultId` nhận người sửa được đơn vị **hoặc** là chủ ít nhất một KR của Mục tiêu; `private async coKrSuaDuoc(userId: string, objectiveId: string): Promise<boolean>`. `troLyDanhSach`, `troLyQuyet` không đổi.

- [ ] **Step 1: Viết bài đỏ trên CSDL kiểm**

`apps/api/test/kara-gop-y-luot-2.spec.ts`:

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
	batDauMau,
	CHO_DB,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoDong,
	goi,
	ketThucMau,
	kr,
	mt,
	NAC_CAU_HINH,
	nguoi,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const M1 = mt("q4-kd-bac-1");
const K1 = kr("q4-kd-bac-1-k1");
const K2 = kr("q4-kd-bac-1-k2");
const K3 = kr("q4-kd-bac-1-k3");

const NGUOI = {
	"hai-kr": "hoang-yen-nhi",
	"mot-kr": "do-minh-khoa",
	"khong-kr": "bui-quang-huy",
	"sua-muc-tieu": "nguyen-thi-lan",
	"quan-tri": "le-hai-dang",
} as const;
type Nguoi = keyof typeof NGUOI;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const id = { capBo: "", k1: "", k2: "", k3: "" };

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	for (const k of Object.keys(NGUOI) as Nguoi[])
		cookie[k] = await phienMau(NGUOI[k]);
	await ghiCauHinh(app, cookie["quan-tri"], NAC_CAU_HINH.bat);
	await db.okrKeyResult.update({
		where: { id: K3 },
		data: { ownerUserId: nguoi(NGUOI["hai-kr"]) },
	});
	const m1 = await db.okrObjective.findUniqueOrThrow({
		where: { id: M1 },
		select: { title: true, keyResults: { select: { id: true, title: true } } },
	});
	const ten = (k: string) => m1.keyResults.find((x) => x.id === k)?.title ?? "";
	[id.capBo, id.k1, id.k2, id.k3] = (await gieoDong(M1, null, [
		dongMau({ loai: "viet-lai", objectiveId: M1, truong: "title", truoc: m1.title, sau: "Bán lẻ miền Bắc lớn đều qua từng tháng" }),
		dongMau({ loai: "viet-lai", objectiveId: M1, keyResultId: K1, truong: "kr.title", truoc: ten(K1), sau: `${ten(K1)} trong quý` }),
		dongMau({ loai: "viet-lai", objectiveId: M1, keyResultId: K2, truong: "kr.title", truoc: ten(K2), sau: `${ten(K2)}, rõ từng tuần` }),
		dongMau({ loai: "viet-lai", objectiveId: M1, keyResultId: K3, truong: "kr.title", truoc: ten(K3), sau: `${ten(K3)} của đối tác mới` }),
	])) as [string, string, string, string];
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

async function dongViecDangChay(): Promise<void> {
	await db.agentTask.updateMany({
		where: { kind: "okr-de-xuat", finishedAt: null },
		data: { finishedAt: new Date(), outcome: "loi" },
	});
}

async function viecMoiNhatCua(ai: Nguoi) {
	const viec = await db.agentTask.findFirst({
		where: {
			kind: "okr-de-xuat",
			payload: { path: ["nguoiYeuCau"], equals: nguoi(NGUOI[ai]) },
		},
		orderBy: { createdAt: "desc" },
		select: { payload: true },
	});
	const doc = okrTroLyViec.safeParse(viec?.payload);
	if (!doc.success || doc.data.viec !== "de-xuat")
		throw new Error(`viec cua ${ai} khong doc duoc: ${doc.error?.message ?? doc.data?.viec}`);
	return doc.data;
}

describe("k3-nhieu-kr", () => {
	test("k3-nhieu-kr nho ca Muc tieu: hai KR va mot KR duoc nhan, khong KR nao bi 403, viec moi khong gan KR", async () => {
		const MA_TRAN = [
			{ ai: "hai-kr", mong: 200 },
			{ ai: "mot-kr", mong: 200 },
			{ ai: "khong-kr", mong: 403 },
		] as const;
		for (const ca of MA_TRAN) {
			await dongViecDangChay();
			tienDongHo();
			const tra = await goi(app, "okr.troLyDeXuat", "mutation", { objectiveId: M1 }, cookie[ca.ai]);
			if (ca.ai === "hai-kr" && tra.status === 403)
				throw new Error("nguoi phu trach hai kr bi tu choi");
			expect(`${ca.ai}: ${tra.status}`).toBe(`${ca.ai}: ${ca.mong}`);
			if (ca.mong !== 200) continue;
			expect(`${ca.ai} bat=${(tra.data as { bat: boolean }).bat}`).toBe(`${ca.ai} bat=true`);
			const viec = await viecMoiNhatCua(ca.ai);
			expect(`${ca.ai} keyResultId=${viec.keyResultId}`).toBe(`${ca.ai} keyResultId=null`);
		}
		await dongViecDangChay();
	}, CHO_DB);

	test("k3-nhieu-kr danh sach cua nguoi hai KR chi gom gop y cua hai KR do; quyet gop y cap Muc tieu bi 403; nguoi sua Muc tieu thay va nhan duoc", async () => {
		const ds = ok<{ dong: { id: string }[] }>(
			await goi(app, "okr.troLyDanhSach", "query", { objectiveId: M1 }, cookie["hai-kr"]),
			"danh sach hai-kr",
		);
		expect(ds.dong.map((d) => d.id).sort()).toEqual([id.k2, id.k3].sort());
		tienDongHo();
		const quyet = await goi(app, "okr.troLyQuyet", "mutation", { deXuatId: id.capBo, cach: "nhan" }, cookie["hai-kr"]);
		expect(`quyet cap muc tieu: ${quyet.status}`).toBe("quyet cap muc tieu: 403");
		const dsTruong = ok<{ dong: { id: string }[] }>(
			await goi(app, "okr.troLyDanhSach", "query", { objectiveId: M1 }, cookie["sua-muc-tieu"]),
			"danh sach sua-muc-tieu",
		);
		expect(dsTruong.dong.map((d) => d.id)).toContain(id.capBo);
		tienDongHo();
		ok(
			await goi(app, "okr.troLyQuyet", "mutation", { deXuatId: id.capBo, cach: "nhan" }, cookie["sua-muc-tieu"]),
			"sua-muc-tieu nhan gop y cap Muc tieu",
		);
	}, CHO_DB);
});
```

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `bun run test -- "cd apps/api && bun test test/kara-gop-y-luot-2.spec.ts"`
Expected: FAIL `nguoi phu trach hai kr bi tu choi`. Bài thứ hai PASS ngay (danh sách đã lọc theo KR sửa được — đúng như sổ quyết định d-…-3 nói).

- [ ] **Step 3: Đổi cổng quyền**

```ts
	private async assertSuaDich(
		userId: string,
		dich: TroLyDichInput,
	): Promise<{ cycleId: string }> {
		const { q, mt } = await this.quyenOkr.assertXemMucTieu(
			userId,
			dich.objectiveId,
		);
		if (!dich.keyResultId) {
			if (this.quyenOkr.suaDuocDonVi(q, userId, mt))
				return { cycleId: mt.cycleId };
			if (await this.coKrSuaDuoc(userId, dich.objectiveId))
				return { cycleId: mt.cycleId };
			throw new ForbiddenException(T.khongSuaDuocDonVi);
		}
		const kr = await this.quyenOkr.assertSuaKr(userId, dich.keyResultId);
		if (kr.objectiveId !== dich.objectiveId)
			throw new BadRequestException(T.troLy.krKhacMucTieu);
		return { cycleId: mt.cycleId };
	}

	private async coKrSuaDuoc(
		userId: string,
		objectiveId: string,
	): Promise<boolean> {
		const dem = await this.db.okrKeyResult.count({
			where: { objectiveId, ownerUserId: userId },
		});
		return dem > 0;
	}
```

(`ghiDuocKr` = chủ KR hoặc sửa được đơn vị; nhánh sửa được đơn vị đã thoát ở trên, nên còn lại đúng «là chủ ít nhất một KR».)

- [ ] **Step 4: Chạy lại**

Run: `bun run test -- "cd apps/api && bun test test/kara-gop-y-luot-2.spec.ts"`
Expected: PASS 2/2.

- [ ] **Step 5: Ma trận quyền cũ đỏ đúng chỗ dự kiến**

Run: `bun run test -- "cd apps/api && bun test test/tro-ly-okr-de-xuat-quyen.spec.ts"`
Expected: FAIL đúng các ô `phu-trach-kr × muc-tieu-phong-ban × {troLySanSang, troLyDeXuat}` (kỳ vọng `403`, thực tế `bat`). Ô khác đỏ thì dừng: Q2 đang mở rộng hơn đã duyệt.

- [ ] **Step 6: (cần duyệt) Sửa ma trận và tài liệu**

`tro-ly-okr-de-xuat-quyen.spec.ts`:

```ts
const NHO_DUOC = {
	"muc-tieu-onehub": ["quan-tri"],
	"muc-tieu-phong-ban": ["truong-phong-ban", "phu-trach-kr"],
	"kr-phong-ban": ["truong-phong-ban"],
} satisfies Record<Dich, readonly Nguoi[]>;
```

```ts
function kyVong(nguoi: Nguoi, dich: Dich, nac: Nac, thuTuc: ThuTuc): KyVong {
	const duoc: readonly Nguoi[] =
		thuTuc === "troLyDanhSach"
			? DOC_DANH_SACH[dich]
			: thuTuc === "troLySanSang" || thuTuc === "troLyDeXuat"
				? NHO_DUOC[dich]
				: SUA_DUOC[dich];
	if (!duoc.includes(nguoi)) return "403";
	return nac === "bat" ? "bat" : { lyDo: LY_DO_NAC[nac] };
}
```

`docs/api.md` dòng 1031–1034, thay câu «`troLyDeXuat` (`POST .../assistant/run`) đòi `assertSuaMucTieu` hoặc `assertSuaKr` trên đúng đích được truyền — toàn hay không, không có tập con: không sửa được đích thì `ForbiddenException` luôn, không có KR nào để lọc xuống.» bằng:

```md
  `troLyDeXuat` (`POST .../assistant/run`) kiểm quyền trên đích được truyền
  (`assertSuaDich`): kèm `keyResultId` thì `assertSuaKr` trên đúng KR đó; cho cả
  Mục tiêu thì người gọi phải sửa được đơn vị (`suaDuocDonVi`) hoặc là chủ ít nhất
  một KR của Mục tiêu (lượt `kara-gop-y-luot-2`, Q2) — Kara đọc cả Mục tiêu, còn
  `troLyDanhSach` lọc góp ý xuống tập KR người đó sửa được. Không thoả thì
  `ForbiddenException(khongSuaDuocDonVi)`.
```

- [ ] **Step 7: Chạy lại cả hai bài API**

Run: `bun run test -- "cd apps/api && bun test test/kara-gop-y-luot-2.spec.ts test/tro-ly-okr-de-xuat-quyen.spec.ts test/gop-y-dung-cho.spec.ts"`
Expected: PASS. Ma trận quyền đỏ ở ô khác vì việc `phu-trach-kr` vừa xếp làm ô sau thấy `dungLai`/hết lượt thì đóng việc đó trong nhánh dọn của ô (như `dongViecDangChay` ở Step 1) và ghi lý do vào commit.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/okr/tro-ly.service.ts apps/api/test/kara-gop-y-luot-2.spec.ts apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts docs/api.md
git commit -m "feat(okr-api): người phụ trách ít nhất một KR nhờ được Kara cho cả Mục tiêu" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Client nhờ Kara cho cả Mục tiêu thay vì KR đầu tiên (AC-10 phía màn, #5)

`independent: false` (cần Task 11 ở máy chủ thật; bài DOM chạy độc lập) · Evals: E10b

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:146-148` (`dich`)
- Create: `apps/app/test/gop-y-dung-cho-luot-2-dan.tsx`; Modify: `apps/app/test/gop-y-dung-cho-luot-2.dom.tsx` (thêm `await import("./gop-y-dung-cho-luot-2-dan");`)

**Interfaces:**
- Consumes: `useGopYMucTieu` (Task 2–10).
- Produces: `troLySanSang` và `troLyDeXuat` luôn nhận `{ objectiveId }`, không còn `keyResultId: krSuaDuoc[0]`.

- [ ] **Step 1: Viết bài đỏ**

`apps/app/test/gop-y-dung-cho-luot-2-dan.tsx`:

```tsx
import { describe, test } from "bun:test";
import {
	bamChuot,
	chiTietTu,
	cho,
	docCua,
	dsTroLy,
	dungSheet,
	goiCua,
	kho,
	kiemCa,
	KR_1,
	KR_2,
	MT_ID,
	mtSheet,
	qs,
} from "./khung-gop-y-dung-cho";

describe("k3-nhieu-kr", () => {
	test("k3-nhieu-kr nguoi sua duoc hai KR, khong sua duoc Muc tieu: nut Nho hien, Nho gui ca Muc tieu khong kem keyResultId", async () => {
		kho.chiTiet = () =>
			chiTietTu(mtSheet({ canEdit: false, soGopYCho: 0 }), {
				canEditKr: [KR_1.id, KR_2.id],
			});
		kho.troLy = () => dsTroLy([], { maKetThuc: null, docLuc: null });
		await dungSheet();
		await cho(() => qs("[data-nut=nho-kara]") !== null, "nut nho cho nguoi hai KR");
		await bamChuot(qs("[data-nut=nho-kara]") ?? document.body);
		await cho(() => goiCua("okr.troLyDeXuat").length === 1, "da nho");
		const vao = JSON.stringify(goiCua("okr.troLyDeXuat")[0]?.vao ?? null);
		if (vao === JSON.stringify({ objectiveId: MT_ID, keyResultId: KR_1.id }))
			throw new Error("chi nho cho kr dau");
		kiemCa(
			{ vao, sanSang: JSON.stringify(docCua("okr.troLySanSang")[0]?.vao ?? null) },
			{
				vao: JSON.stringify({ objectiveId: MT_ID }),
				sanSang: JSON.stringify({ objectiveId: MT_ID }),
			},
			(k) => `nho nhieu kr sai: ${k}`,
		);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-nhieu-kr`
Expected: FAIL `chi nho cho kr dau`.

- [ ] **Step 3: Đích luôn là cả Mục tiêu**

```ts
	const dich = { objectiveId: objectiveId ?? "" };
```

(`canEdit` vẫn dùng cho `nhoDuoc`.)

- [ ] **Step 4: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-nhieu-kr && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx ./test/sheet-quyen-cap-nhat.dom.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" apps/app/test/gop-y-dung-cho-luot-2-dan.tsx apps/app/test/gop-y-dung-cho-luot-2.dom.tsx
git commit -m "fix(okr): nhờ Kara cho cả Mục tiêu khi người dùng chỉ phụ trách KR" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Năm câu đếm tiếng Anh tách số ít, số nhiều (AC-11, G1)

`independent: true` · Evals: E11

**Files:**
- Modify: `apps/app/lib/messages/okr-gop-y.ts:106,108-109,159-161,169` (nhánh `en`)
- Create: `apps/app/test/gop-y-dung-cho-luot-2.spec.ts`

**Interfaces:**
- Consumes: `okrGopYMessages`, `type OkrGopYMessages`.
- Produces: `en.vung.soCho`, `en.vung.lyDo`, `en.chip`, `en.chipAria`, `en.loc.coCho` trả số ít khi đối số là `"1"`.

- [ ] **Step 1: Viết bài đỏ**

```ts
import { describe, expect, test } from "bun:test";
import { type OkrGopYMessages, okrGopYMessages } from "@/lib/messages/okr-gop-y";

type Cau = (m: OkrGopYMessages, n: string) => string;

const NAM_CAU = {
	soCho: (m, n) => m.vung.soCho(n),
	lyDo: (m, n) => m.vung.lyDo(n),
	chip: (m, n) => m.chip(n),
	chipAria: (m, n) => m.chipAria(n, "Giữ chân khách miền Bắc"),
	coCho: (m, n) => m.loc.coCho(n),
} satisfies Record<string, Cau>;
type Khoa = keyof typeof NAM_CAU;
const KHOA = Object.keys(NAM_CAU) as Khoa[];

const TU_SO_NHIEU = {
	soCho: "suggestions",
	lyDo: "KRs",
	chip: "suggestions",
	chipAria: "suggestions",
	coCho: "suggestions",
} satisfies Record<Khoa, string>;

const VI_C1067C16 = {
	soCho: ["1 góp ý chờ", "2 góp ý chờ"],
	lyDo: [
		"Kara đọc tên, «vì sao lúc này» và 1 KR của Mục tiêu này. Kara chỉ đọc dữ liệu OKR.",
		"Kara đọc tên, «vì sao lúc này» và 2 KR của Mục tiêu này. Kara chỉ đọc dữ liệu OKR.",
	],
	chip: ["1 góp ý", "2 góp ý"],
	chipAria: [
		"Kara có 1 góp ý chờ cho «Giữ chân khách miền Bắc», mở khung chi tiết",
		"Kara có 2 góp ý chờ cho «Giữ chân khách miền Bắc», mở khung chi tiết",
	],
	coCho: ["Có góp ý chờ · 1", "Có góp ý chờ · 2"],
} satisfies Record<Khoa, [string, string]>;

function soNhieuSai(m: OkrGopYMessages): string | null {
	for (const khoa of KHOA) {
		const tu = new RegExp(`\\b${TU_SO_NHIEU[khoa]}\\b`);
		if (tu.test(NAM_CAU[khoa](m, "1")) || !tu.test(NAM_CAU[khoa](m, "2")))
			return `so nhieu sai: ${khoa}`;
	}
	return null;
}

const EN = okrGopYMessages("en");
const EN_CU: OkrGopYMessages = {
	...EN,
	vung: {
		...EN.vung,
		soCho: (n) => `${n} suggestions waiting`,
		lyDo: (soKr) =>
			`Kara read the title, “why now” and ${soKr} KRs of this objective. Kara reads OKR data only.`,
	},
	chip: (n) => `${n} suggestions`,
	chipAria: (n, ten) => `Kara has ${n} suggestions waiting for “${ten}”, open details`,
	loc: { ...EN.loc, coCho: (n) => `Has suggestions waiting · ${n}` },
};

describe("k3-so-nhieu", () => {
	test("k3-so-nhieu 5 cau x 2 so o en: so it khi 1, so nhieu khi 2", () => {
		expect(KHOA.length * 2).toBe(10);
		expect(soNhieuSai(EN)).toBeNull();
	});

	test("k3-so-nhieu ban vi cua 5 cau voi 1 va 2 giu nguyen nhu c1067c16", () => {
		const vi = okrGopYMessages("vi");
		for (const khoa of KHOA)
			expect([NAM_CAU[khoa](vi, "1"), NAM_CAU[khoa](vi, "2")]).toEqual(VI_C1067C16[khoa]);
	});

	test("k3-so-nhieu chieu do: ban en cu khong tach so it bi bat", () => {
		expect(soNhieuSai(EN_CU)).toBe("so nhieu sai: soCho");
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && bun test ./test/gop-y-dung-cho-luot-2.spec.ts -t k3-so-nhieu`
Expected: FAIL ở bài đầu: `Expected: null, Received: "so nhieu sai: soCho"`.

- [ ] **Step 3: Tách số ít trong nhánh `en`**

```ts
		soCho: (n: string) =>
			n === "1" ? "1 suggestion waiting" : `${n} suggestions waiting`,
```

```ts
		lyDo: (soKr: string) =>
			soKr === "1"
				? "Kara read the title, “why now” and 1 KR of this objective. Kara reads OKR data only."
				: `Kara read the title, “why now” and ${soKr} KRs of this objective. Kara reads OKR data only.`,
```

```ts
	chip: (n: string) => (n === "1" ? "1 suggestion" : `${n} suggestions`),
	chipAria: (n: string, ten: string) =>
		n === "1"
			? `Kara has 1 suggestion waiting for “${ten}”, open details`
			: `Kara has ${n} suggestions waiting for “${ten}”, open details`,
```

```ts
		coCho: (n: string) =>
			n === "1" ? "Has a suggestion waiting · 1" : `Has suggestions waiting · ${n}`,
```

- [ ] **Step 4: Chạy lại**

Run: `cd apps/app && bun test ./test/gop-y-dung-cho-luot-2.spec.ts -t k3-so-nhieu && bun test ./test/messages-guard.spec.ts`
Expected: PASS (ghim tiếng Việt không đổi).

- [ ] **Step 5: Commit**

```bash
git add apps/app/lib/messages/okr-gop-y.ts apps/app/test/gop-y-dung-cho-luot-2.spec.ts
git commit -m "fix(okr): chữ đếm góp ý tiếng Anh dùng số ít khi là 1" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Câu dẫn của hộp Sửa Mục tiêu đúng mọi trường hợp (AC-12, G5)

`independent: true` · Evals: E12

**Files:**
- Modify: `apps/app/lib/messages/okr-gop-y.ts:60,163` (`danSang.moTaMucTieu` ở hai tiếng)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-dan.tsx`

**Interfaces:**
- Consumes: `dung(…, locale)` (Task 1), `HopThoaiMucTieu`.
- Produces: `danSang.moTaMucTieu` vi «Góp ý nằm trong vùng Kara của Mục tiêu này.», en «Suggestions are in the Kara section of this objective.»

- [ ] **Step 1: Viết bài đỏ**

```tsx
describe("k3-cau-dan", () => {
	const CA = [
		{ ten: "gop-y-duoi-kr", ds: [D_KR1, D_KR2] },
		{ ten: "cau-hoi-ca-bo", ds: [D_DOI_TRONG] },
	] as const;

	test("k3-cau-dan hop Sua Muc tieu: cau dan dung khi gop y nam duoi KR lan khi la cau hoi cho ca bo KR, vi va en", async () => {
		for (const locale of ["vi", "en"] as const)
			for (const ca of CA) {
				const mL = okrGopYMessages(locale);
				kho.troLy = () => dsTroLy([...ca.ds]);
				await dung(
					<HopThoaiMucTieu
						dong={() => {}}
						yeuCau={{ loai: "sua", mucTieu: mtSheet({ soGopYCho: ca.ds.length }) }}
					/>,
					"",
					locale,
				);
				await cho(() => qs("[data-dan-sang]") !== null, `${locale}/${ca.ten} dong dan`);
				const cau = qs("[data-dan-sang] [data-slot=item-description]")?.textContent ?? "";
				if (ca.ten === "cau-hoi-ca-bo" && (cau.includes("dưới từng KR") || cau.includes("under each KR")))
					throw new Error("cau dan sai cho cau hoi ca bo");
				kiemCa({ cau }, { cau: mL.danSang.moTaMucTieu }, () => `${locale}/${ca.ten} cau dan sai`);
				await thaoHet();
			}
	});
});
```

(nhập thêm `D_DOI_TRONG, D_KR1, D_KR2, dung, HopThoaiMucTieu, okrGopYMessages, thaoHet` từ khung chung.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-cau-dan`
Expected: FAIL `cau dan sai cho cau hoi ca bo`.

- [ ] **Step 3: Câu trung tính**

`vi.danSang.moTaMucTieu: "Góp ý nằm trong vùng Kara của Mục tiêu này.",`
`en.danSang.moTaMucTieu: "Suggestions are in the Kara section of this objective.",`

- [ ] **Step 4: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-cau-dan && bun test ./test/messages-guard.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/app/lib/messages/okr-gop-y.ts apps/app/test/gop-y-dung-cho-luot-2-dan.tsx
git commit -m "fix(okr): câu dẫn hộp Sửa Mục tiêu đúng cả khi góp ý là câu hỏi cho cả bộ KR" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Dòng dẫn từ hộp Sửa KR focus đúng góp ý của KR đó (AC-13, G4) + Review Focus 4

`independent: false` (cần Task 8 cho `data-trang-thai`, Task 12 cho tệp `-dan`) · Evals: E13 · **Cần duyệt trước:** `apps/app/lib/search-param-keys.ts`.

**Files:**
- Modify (cần duyệt): `apps/app/lib/search-param-keys.ts:74` (thêm `neoGopYKr: "neoGopYKr",`)
- Modify: `apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx:20-47` (prop `keyResultId?`, ghi khoá URL)
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx:406-410` (truyền `keyResultId={n.krId}`)
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` (state `noi`, trả `noi`, `datNoi`)
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx` (`DeXuatNeo` thêm `data-kara-proposal-kr`, `data-highlighted`, `highlighted`, `tabIndex={-1}`)
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx:589-605` (neo tới góp ý của KR)
- Test: `apps/app/test/gop-y-dung-cho-luot-2-dan.tsx`

**Interfaces:**
- Consumes: `SEARCH_PARAM.okr.neoGopY`, `parseAsNeoGopY`, `parseAsString` (`nuqs`), `KaraProposal.highlighted`.
- Produces: `SEARCH_PARAM.okr.neoGopYKr = "neoGopYKr"`; `DongDanGopY` prop `keyResultId?: string`; `GopYMucTieu.noi: string | null`, `GopYMucTieu.datNoi: (id: string | null) => void`; dấu DOM `data-kara-proposal-kr`, `data-highlighted="true"`.

- [ ] **Step 1: Viết bài đỏ (E13 + Review Focus 4)**

```tsx
describe("k3-neo-kr", () => {
	const cuonGoc = Element.prototype.scrollIntoView;

	test("k3-neo-kr Xem gop y tu hop Sua KR dua ma KR len URL", async () => {
		for (const [kr, d] of [[KR_2, D_KR2], [KR_1, D_KR1]] as const) {
			kho.troLy = (vao) => dsTroLy(vao?.keyResultId === kr.id ? [d] : []);
			const san = await dung(
				<HopThoaiKr
					chuMacDinh={HUNG.id}
					dong={() => {}}
					kr={kr}
					mucTieu={mtSheet({ soGopYCho: 2 })}
					objectiveId={MT_ID}
					suaDuocCot
				/>,
			);
			await cho(() => qs("[data-dan-sang]") !== null, `${kr.id} dong dan`);
			await bamChuot(nut(m.danSang.xem, qs("[data-dan-sang]") ?? document.body));
			await cho(() => san.url().get("record") !== null, `${kr.id} mo khung`);
			kiemCa(
				{ record: san.url().get("record"), neo: san.url().get("neoGopY"), neoKr: san.url().get("neoGopYKr") },
				{ record: `objective:${MT_ID}`, neo: "true", neoKr: kr.id },
				(k) => `${kr.id} url sai: ${k}`,
			);
			await thaoHet();
		}
	});

	test("k3-neo-kr khung mo tu URL neo KR: focus va lam noi gop y dau tien cua dung KR", async () => {
		Element.prototype.scrollIntoView = () => {};
		try {
			for (const [kr, d] of [[KR_2, D_KR2], [KR_1, D_KR1]] as const) {
				kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
				kho.troLy = () => dsTroLy([D_KR1, D_KR2]);
				const san = await dungSheet({
					thamSo: `?record=objective:${MT_ID}&neoGopY=true&neoGopYKr=${kr.id}`,
				});
				await cho(() => san.url().get("neoGopYKr") === null, `${kr.id} bo khoa neo`);
				await nhip(4);
				const dang = document.activeElement;
				if (dang === null || dang === document.body) throw new Error("focus roi ve body");
				const o = dang.closest("[data-kara-proposal-kr]");
				kiemCa(
					{
						kr: o?.getAttribute("data-kara-proposal-kr") ?? null,
						gopY: o?.getAttribute("data-gop-y") ?? null,
						noi: o?.getAttribute("data-highlighted") ?? null,
					},
					{ kr: kr.id, gopY: d.id, noi: "true" },
					(k) => `${kr.id} neo sai: ${k}`,
				);
				await thaoHet();
			}
		} finally {
			Element.prototype.scrollIntoView = cuonGoc;
		}
	});

	test("k3-neo-kr id la: khong co gop y cua KR do thi cuon toi vung Kara, bo ca hai khoa, khong lam noi dong nao", async () => {
		const daCuon: string[] = [];
		Element.prototype.scrollIntoView = function (this: Element) {
			daCuon.push(this.hasAttribute("data-vung-kara") ? "vung" : "khac");
		};
		try {
			kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 2 }));
			kho.troLy = () => dsTroLy([D_DOI_TRONG, D_KR1]);
			const san = await dungSheet({
				thamSo: `?record=objective:${MT_ID}&neoGopY=true&neoGopYKr=kr-khong-co`,
			});
			await cho(() => san.url().get("neoGopY") === null, "bo khoa neo");
			kiemCa(
				{ neoKr: san.url().get("neoGopYKr"), noi: qs("[data-highlighted=true]") !== null, cuon: daCuon.join(",") },
				{ neoKr: null, noi: false, cuon: "vung" },
				(k) => `neo id la sai: ${k}`,
			);
		} finally {
			Element.prototype.scrollIntoView = cuonGoc;
		}
	});
});
```

(nhập thêm `HopThoaiKr, HUNG, nut, m, nhip, dung, D_DOI_TRONG` từ khung chung.)

- [ ] **Step 2: Chạy, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-neo-kr`
Expected: FAIL `kr-2 url sai: neoKr`.

- [ ] **Step 3: (cần duyệt) Khoá URL mới**

`apps/app/lib/search-param-keys.ts`, ngay sau `neoGopY: "neoGopY",`:

```ts
		neoGopYKr: "neoGopYKr",
```

- [ ] **Step 4: Dòng dẫn mang mã KR**

```tsx
import { parseAsString, useQueryState } from "nuqs";
```

```tsx
export function DongDanGopY({
	so,
	moTa,
	objectiveId,
	keyResultId,
}: {
	so: number;
	moTa: string;
	objectiveId: string;
	keyResultId?: string;
}) {
	const m = okrGopYMessages(useLocale());
	const openRecord = useOpenRecord();
	const giu = useGiuNoiDung();
	const [, setNeo] = useQueryState(SEARCH_PARAM.okr.neoGopY, parseAsNeoGopY);
	const [, setNeoKr] = useQueryState(SEARCH_PARAM.okr.neoGopYKr, parseAsString);
	if (so <= 0) return null;
```

và trong `onClick`, sau `void setNeo(true);`: `void setNeoKr(keyResultId ?? null);`. `hop-thoai-kr.tsx`: thêm `keyResultId={n.krId}` vào `<DongDanGopY … />`.

- [ ] **Step 5: Hook giữ dòng được làm nổi; dòng mang dấu neo**

`gop-y-kara.ts`: `const [noi, setNoi] = useState<string | null>(null);`, trả `noi, datNoi: setNoi,`.

`DeXuatNeo` (giữ thứ tự thuộc tính theo bảng chữ cái như đang có):

```tsx
			data-gop-y={d.id}
			data-highlighted={gopY.noi === d.id ? "true" : undefined}
			data-kara-proposal-kr={d.keyResultId ?? undefined}
			data-trang-thai={gopY.trangThai(d.id)}
			decided={decided}
```

```tsx
			error={gopY.loiDong[d.id]}
			highlighted={gopY.noi === d.id}
			kind={kind}
```

```tsx
			rationale={rationale}
			tabIndex={-1}
			value={value}
```

- [ ] **Step 6: Khung Mục tiêu neo tới góp ý của KR**

`objective-sheet.tsx` (nhập `parseAsString` từ `nuqs`), thay khối `const [neo, setNeo] …` tới hết `useEffect` neo:

```tsx
	const [neo, setNeo] = useQueryState(SEARCH_PARAM.okr.neoGopY, parseAsNeoGopY);
	const [neoKr, setNeoKr] = useQueryState(
		SEARCH_PARAM.okr.neoGopYKr,
		parseAsString,
	);
	const coVungKara = gopY.noiDung !== "tat";
	const khoKhung = useContext(CuonCaKhungContext);
	const datNoi = gopY.datNoi;
	useEffect(() => {
		if (!neo || !gopY.daTai || khoKhung === "chua-biet") return;
		const giam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const cach: ScrollIntoViewOptions = {
			block: "start",
			behavior: giam ? "auto" : "smooth",
		};
		const goc = vung.current?.closest("[data-okr-sheet]") ?? document;
		const noiDen = neoKr
			? ([...goc.querySelectorAll<HTMLElement>("[data-kara-proposal-kr]")].find(
					(o) => o.getAttribute("data-kara-proposal-kr") === neoKr,
				) ?? null)
			: null;
		if (noiDen) {
			noiDen.scrollIntoView({ ...cach, block: "center" });
			noiDen.focus({ preventScroll: true });
			datNoi(noiDen.getAttribute("data-gop-y"));
		} else if (coVungKara) vung.current?.scrollIntoView(cach);
		void setNeo(null);
		void setNeoKr(null);
	}, [neo, neoKr, gopY.daTai, coVungKara, setNeo, setNeoKr, khoKhung, datNoi]);
```

- [ ] **Step 7: Chạy lại**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-neo-kr && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx ./test/okr-to-chuc-va.dom.tsx ./test/khung-okr-truoc-r1.dom.tsx`
Expected: PASS (bài neo cũ «co neoGopY thi cuon toi vung Kara …» và «neo-kara: du lieu co san …» vẫn xanh vì đường không có `neoGopYKr` giữ nguyên hành vi).

- [ ] **Step 8: Commit**

```bash
git add apps/app/lib/search-param-keys.ts "apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx" "apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx" "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" apps/app/components/crm/record-sheet/objective-sheet.tsx apps/app/test/gop-y-dung-cho-luot-2-dan.tsx
git commit -m "feat(okr): Xem góp ý từ hộp Sửa KR mở khung và focus góp ý của đúng KR đó" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 16: Một hàm ngày giờ cho năm chỗ (AC-14, G6) — phần mã và bài DOM

`independent: false` (cần Task 6 vì sửa cùng `nhom-kara.tsx`; với ba tệp `soan/` thì độc lập) · Evals: E14 vế (3)

**Files:**
- Modify: `packages/ui/src/lib/format.ts` (chỉ thêm `formatNgayGio` ở cuối tệp)
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx:29,44-57,311` (bỏ `DINH_DANG_GIO`/`gioDoc`, gọi hàm chung)
- Modify: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx:12,169-173` (`luc` gọi hàm chung; kéo theo tab Ghi nhận và Trao đổi)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx:21,145,267` (P1-36: chỉ lời gọi; nâng `useLocale()` thành biến để có `locale`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/danh-sach-cuoc.tsx:37,94,96-101,106` (P1-36: chỉ lời gọi; kiểu `locale` của `DanhSachDong` thành `Locale`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx:159-166` (P1-36: chỉ lời gọi trong `gioNop`)
- Create: `_acceptance/kara-gop-y-luot-2/rang/ngay-gio-mau.json`
- Create: `apps/app/test/gop-y-dung-cho-luot-2-ngay-gio.tsx`; Modify: `apps/app/test/gop-y-dung-cho-luot-2.dom.tsx` (thêm `await import("./gop-y-dung-cho-luot-2-ngay-gio");`)

**Interfaces:**
- Consumes: `dateFormat(locale, options)` có sẵn trong `format.ts`, `OKR_CHU_KY.muiGio` (`@/lib/okr-chu-ky-nhan`).
- Produces: `export function formatNgayGio(at: string | number | Date, locale: Locale, cach: { timeZone: string; phan: "ngay-gio" | "ngay" | "ngay-thang" | "gio" }): string` — dựng từ `formatToParts` theo khuôn cố định: vi `HH:mm dd/MM/yyyy`, en `MM/dd/yyyy, HH:mm`; `ngay` = `dd/MM/yyyy` (vi) / `MM/dd/yyyy` (en); `ngay-thang` bỏ năm; `gio` = `HH:mm` (h23); đầu vào hỏng trả `"—"` như `formatDay`. Khuôn không phụ thuộc ICU của từng trình duyệt (Bun và Chrome in `vi` khác nhau ở dấu phân cách).

Mỗi chỗ giữ phần nó đang hiện: giờ Kara đọc, tab Vết/Ghi nhận/Trao đổi → `ngay-gio`; nút soạn → `ngay-thang`; danh sách cuộc → `ngay`; «sửa lúc» của bản nháp → `gio`. Bản `vi` của ba chỗ `soan/` ra đúng chuỗi cũ («01/12», «01/12/2026», «10:42»), nên các bài ngoài ranh giới đang ghim chúng (`soan-okr.dom.tsx:399,714,1083`, `soan-okr-trang.dom.tsx:367`, `khung-okr-truoc-r1.dom.tsx:355`) giữ xanh.

- [ ] **Step 1: Ghi mẫu viết trước**

`_acceptance/kara-gop-y-luot-2/rang/ngay-gio-mau.json`:

```json
{
	"moc": "2026-10-01T15:56:00.000Z",
	"vi": {
		"ngay-gio": "22:56 01/10/2026",
		"ngay": "01/10/2026",
		"ngay-thang": "01/10",
		"gio": "22:56"
	},
	"en": {
		"ngay-gio": "10/01/2026, 22:56",
		"ngay": "10/01/2026",
		"ngay-thang": "10/01",
		"gio": "22:56"
	},
	"be-mat": {
		"nhom-kara": "ngay-gio",
		"bang-vet": "ngay-gio",
		"ghi-nhan": "ngay-gio",
		"trao-doi": "ngay-gio",
		"nut-soan": "ngay-thang",
		"danh-sach-cuoc": "ngay",
		"bang-nhap": "gio"
	}
}
```

- [ ] **Step 2: Viết bài đỏ — bảy bề mặt × hai tiếng**

`apps/app/test/gop-y-dung-cho-luot-2-ngay-gio.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "@crm/ui/lib/locale";
import { chuanHoa } from "@crm/validation/okr-kiem";
import type { CuocDangSoan } from "@/app/(app)/[slug]/okr/soan/dung-cuoc-soan";
import {
	commentsOutput,
	type CuocSoanOutput,
	type DongSoanOutput,
	soanSanSangOutput,
	vetOutput,
} from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	chiTietTu,
	cho,
	dsTroLy,
	dung,
	HUNG,
	kho,
	kiemCa,
	MT_ID,
	mtSheet,
	okrGopYMessages,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";
import { KHUNG, MOC_GIO } from "./khung-gop-y-luot-2";

const { BangVet } = await import("@/app/(app)/[slug]/okr/bang-vet");
const { DongGhiNhan } = await import("@/components/crm/record-sheet/objective-ghi-nhan");
const { DongThoiGian } = await import("@/components/crm/record-sheet/objective-trao-doi");
const { NutSoan } = await import("@/app/(app)/[slug]/okr/soan/nut-soan");
const { DanhSachCuoc } = await import("@/app/(app)/[slug]/okr/soan/danh-sach-cuoc");
const { BanNhap } = await import("@/app/(app)/[slug]/okr/soan/bang-nhap");
const { cayNhap, demDong } = await import("@/app/(app)/[slug]/okr/soan/luat-ban-nhap");
const { okrSoanMessages } = await import("@/lib/messages/okr-soan");

type Phan = "ngay-gio" | "ngay" | "ngay-thang" | "gio";
type BeMat = "nhom-kara" | "bang-vet" | "ghi-nhan" | "trao-doi" | "nut-soan" | "danh-sach-cuoc" | "bang-nhap";
const MAU = JSON.parse(
	readFileSync(join(import.meta.dir, "../../../_acceptance/kara-gop-y-luot-2/rang/ngay-gio-mau.json"), "utf8"),
) as { vi: Record<Phan, string>; en: Record<Phan, string>; "be-mat": Record<BeMat, Phan> };

const CUOC_SOAN: CuocSoanOutput = {
	id: "cuoc-1",
	cycleId: "q1",
	level: "phong-ban",
	divisionId: null,
	departmentId: "pb-1",
	tenDonVi: "Kinh doanh miền Bắc",
	tenChuKy: "Quý 1 · 2027",
	nguoiMo: { id: "hai", name: "Trần Minh Hải" },
	sessionId: "phien-1",
	nac: "bat",
	trangThai: "dang",
	soLuot: 2,
	tranLuot: 12,
	moLuc: MOC_GIO,
	duaVaoLuc: null,
	soDongNhan: 2,
	soDongTong: 5,
};
const DV_SOAN = { cycleId: "q1", level: "phong-ban", divisionId: null, departmentId: "pb-1" } as const;
const DONG_MT: DongSoanOutput = {
	viSao: "Vì kỳ trước hụt.",
	maLoai: null,
	giaTriCuoi: null,
	taoRaId: null,
	id: "1",
	khoa: "m1",
	khoaDong: `muc-tieu-moi:${chuanHoa("Giữ khách lớn miền Bắc")}`,
	loai: "muc-tieu-moi",
	ten: "Giữ khách lớn miền Bắc",
	viSaoLucNay: "Đầu quý là mùa ký lại.",
	loaiMucTieu: "cam-ket",
	trangThai: "cho",
};
const S_GIA = {
	cay: cayNhap([DONG_MT]),
	gioNopCuoi: Date.parse(MOC_GIO),
	dangTraLoi: false,
	so: new Map(),
	thieu: [],
	nhan: new Map(),
	truocTen: new Map(),
	dongNoi: null,
	nhomDaNhan: new Map(),
	dem: { soMucTieu: 1, soKr: 0 },
	quyet: { isPending: false, variables: undefined, mutate: () => {} },
	duaVao: { isPending: false, data: undefined, error: null, mutate: () => {} },
	datSo: () => {},
	guiDuaVao: () => {},
	themQuyetBang: () => {},
	noiDong: () => {},
	ghiNhom: () => {},
	cuonToiDong: () => {},
	datHoiVeDong: () => {},
} as unknown as CuocDangSoan;

const chuCua = (sel: string) => qs(sel)?.textContent ?? "";
const coChua = (chu: string, mong: string) => (chu.includes(mong) ? mong : chu);

const DUNG: Record<BeMat, (locale: Locale, mau: string) => Promise<[string, string]>> = {
	"nhom-kara": async (locale, mau) => {
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
		kho.troLy = () => dsTroLy([], { docLuc: MOC_GIO });
		await dung(KHUNG(), `?record=objective:${MT_ID}`, locale);
		await cho(() => qs("[data-nhom-kara=rong]") !== null, "vung rong");
		return [chuCua("[data-nhom-kara=rong] [data-slot=empty-description]"), okrGopYMessages(locale).vung.rongMoTa(mau)];
	},
	"bang-vet": async (locale, mau) => {
		const vet = vetOutput.parse({ id: "v1", at: MOC_GIO, actor: HUNG, action: "tao", keyResultId: null, before: null, after: null, note: null });
		await dung(<BangVet alignments={[]} keyResults={[]} trail={[vet]} />, "", locale);
		await cho(() => qsa("td").length > 0, "bang vet");
		const o = qsa("td").map((td) => td.textContent ?? "");
		return [o.includes(mau) ? mau : o.join(" | "), mau];
	},
	"ghi-nhan": async (locale, mau) => {
		await dung(
			<DongGhiNhan
				ghiNhan={{ loai: "ghi-nhan", id: "g1", createdAt: MOC_GIO, nguoiGui: HUNG, nguoiNhan: [HUNG], keyResultId: null, keyResultTitle: null, loiNhan: "Cảm ơn", goDuoc: false }}
				onGo={() => {}}
			/>,
			"",
			locale,
		);
		return [chuCua("[data-ghi-nhan] [data-slot=item-description]"), mau];
	},
	"trao-doi": async (locale, mau) => {
		const duLieu = commentsOutput.parse({
			comments: [{ id: "c1", author: HUNG, keyResultId: null, keyResultTitle: null, body: "Ổn", createdAt: MOC_GIO, mentions: [] }],
			dong: [{ loai: "binh-luan", id: "c1", createdAt: MOC_GIO }],
		});
		await dung(<DongThoiGian duLieu={duLieu} onGoGhiNhan={async () => {}} />, "", locale);
		return [chuCua("[data-binh-luan] [data-slot=item-description]"), mau];
	},
	"nut-soan": async (locale, mau) => {
		kho.rieng.set("okr.soanSanSang", () =>
			soanSanSangOutput.parse({ bat: true, nac: "bat", cuocDang: CUOC_SOAN, soCuocDaDung: 1, tranCuoc: 3, thieuBoiCanh: false }),
		);
		await dung(<NutSoan canEdit cauNoi={false} cycleId="q1" don={{ loai: "pb", id: "pb-1" }} phaKy="lap-ke-hoach" quanTri={false} />, "", locale);
		await cho(() => qs('[data-nut="thong-tin-soan"]') !== null, "nut thong tin soan");
		await bamChuot(qs('[data-nut="thong-tin-soan"]') ?? document.body);
		await cho(() => qs("[data-thong-tin-soan]") !== null, "thong tin soan");
		const mong = okrSoanMessages(locale).nut.tiepMoTa(mau, "2", "3");
		return [coChua(chuCua("[data-thong-tin-soan]"), mong), mong];
	},
	"danh-sach-cuoc": async (locale, mau) => {
		kho.rieng.set("okr.soanDanhSachCuoc", () => ({ cuoc: [CUOC_SOAN], soCuocDaDung: 1, tranCuoc: 3 }));
		await dung(<DanhSachCuoc donVi={DV_SOAN} dong={() => {}} mo={() => {}} />, "", locale);
		await cho(() => qs("[data-cuoc-id]") !== null, "danh sach cuoc");
		return [chuCua("[data-cuoc-id] [data-slot=item-title]"), mau];
	},
	"bang-nhap": async (locale, mau) => {
		await dung(<BanNhap cuoc={{ ...CUOC_SOAN, trangThai: "bo" }} hoi={() => {}} s={S_GIA} veMoc={() => {}} />, "", locale);
		await cho(() => qs('[data-slot="kara-artifact-header"]') !== null, "dau ban nhap");
		const mong = okrSoanMessages(locale).dong.meta(String(demDong(S_GIA.cay)), mau);
		return [coChua(chuCua('[data-slot="kara-artifact-header"]'), mong), mong];
	},
};

describe("k3-ngay-gio", () => {
	test("k3-ngay-gio bay be mat x hai tieng cung mot khuon ngay gio, gio Viet Nam", async () => {
		let soO = 0;
		for (const locale of ["vi", "en"] as const)
			for (const beMat of Object.keys(DUNG) as BeMat[]) {
				const mau = MAU[locale][MAU["be-mat"][beMat]];
				const [thuc, mong] = await DUNG[beMat](locale, mau);
				kiemCa({ chu: thuc }, { chu: mong }, () => `${beMat}/${locale} lech khuon ngay gio`);
				soO += 1;
				await thaoHet();
				kho.rieng.clear();
			}
		expect(soO).toBe(14);
		console.log(`k3-ngay-gio: ${soO}/14 o`);
	}, 60_000);
});
```

- [ ] **Step 3: Chạy lần đầu, đo RSS, thấy đỏ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh /usr/bin/time -l perl -e 'alarm 180; exec @ARGV' bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-ngay-gio`
Expected: FAIL `nhom-kara/vi lech khuon ngay gio` (bản cũ in «22:56 01-10»). Ghi RSS. Nếu lỗi là nhập mô-đun (`eve/react`, `eve/client` khi nạp `bang-nhap.tsx`) chứ không phải lệch khuôn: thêm vào đầu tệp con, trước các `await import`, `mock.module("eve/react", () => ({ useEveAgent: () => ({}) }));` và `mock.module("@/lib/agent-session", () => ({}));`, rồi chạy lại. Nếu `BanNhap` ném `TypeError` ở một trường của `s`, thêm đúng trường đó vào `S_GIA` theo kiểu trả về của `useCuocSoan` (`soan/dung-cuoc-soan.ts:395-470`). Nếu `commentsOutput.parse` báo thiếu trường, điền theo schema `okr.contracts.ts:588`.

- [ ] **Step 4: Thêm hàm chung (chỉ thêm, cuối `format.ts`)**

```ts
export function formatNgayGio(
	at: string | number | Date,
	locale: Locale,
	cach: { timeZone: string; phan: "ngay-gio" | "ngay" | "ngay-thang" | "gio" },
): string {
	const luc = new Date(at);
	if (Number.isNaN(luc.getTime())) return "—";
	const phan = new Map(
		dateFormat(locale, {
			timeZone: cach.timeZone,
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23",
		})
			.formatToParts(luc)
			.map((p) => [p.type, p.value]),
	);
	const ngayThang =
		locale === "vi"
			? `${phan.get("day")}/${phan.get("month")}`
			: `${phan.get("month")}/${phan.get("day")}`;
	const ngay = `${ngayThang}/${phan.get("year")}`;
	const gio = `${phan.get("hour")}:${phan.get("minute")}`;
	switch (cach.phan) {
		case "ngay-thang":
			return ngayThang;
		case "ngay":
			return ngay;
		case "gio":
			return gio;
		case "ngay-gio":
			return locale === "vi" ? `${gio} ${ngay}` : `${ngay}, ${gio}`;
	}
}
```

- [ ] **Step 5: Năm chỗ gọi hàm chung**

`nhom-kara.tsx`: xoá `DINH_DANG_GIO`, `gioDoc`, nhập `type Locale` nếu không còn dùng; thêm `import { formatNgayGio } from "@crm/ui/lib/format";`, nhập `OKR_CHU_KY` (đã có); trong `VungKara`:

```tsx
	const docLuc = gopY.docLuc
		? formatNgayGio(gopY.docLuc, locale, {
				timeZone: OKR_CHU_KY.muiGio,
				phan: "ngay-gio",
			})
		: undefined;
```

`bang-vet.tsx`: nhập `import { formatDay, formatNgayGio } from "@crm/ui/lib/format";` và `import { OKR_CHU_KY } from "@/lib/okr-chu-ky-nhan";`

```tsx
export function luc(at: string, locale: Locale): string {
	return formatNgayGio(at, locale, {
		timeZone: OKR_CHU_KY.muiGio,
		phan: "ngay-gio",
	});
}
```

`soan/nut-soan.tsx`: nhập `formatNgayGio`; dòng 21 thành `import { dauThangSau, homNayVn, OKR_CHU_KY } from "@/lib/okr-chu-ky-nhan";`; dòng 145 thành `const locale = useLocale();` và `const m = okrSoanMessages(locale);`; dòng 267:

```tsx
									formatNgayGio(cuocDang.moLuc, locale, {
										timeZone: OKR_CHU_KY.muiGio,
										phan: "ngay-thang",
									}),
```

`soan/danh-sach-cuoc.tsx`: nhập `formatNgayGio` và `import type { Locale } from "@crm/ui/lib/locale";`; `DanhSachDong` khai `locale: Locale;`; xoá khối `const ngay = new Intl.DateTimeFormat(…)`; dòng 106:

```tsx
				const moLuc = formatNgayGio(c.moLuc, locale, {
					timeZone: OKR_CHU_KY.muiGio,
					phan: "ngay",
				});
```

`soan/bang-nhap.tsx`: nhập `formatNgayGio`, `type Locale`, `OKR_CHU_KY`;

```tsx
function gioNop(locale: Locale, at: number | null): string | null {
	if (at === null) return null;
	return formatNgayGio(at, locale, {
		timeZone: OKR_CHU_KY.muiGio,
		phan: "gio",
	});
}
```

- [ ] **Step 6: Chạy lại bài mới và bài ngoài ranh giới đang ghim khuôn cũ**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-ngay-gio`
Expected: PASS, in `k3-ngay-gio: 14/14 o`.
Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/soan-okr.dom.tsx ./test/soan-okr-trang.dom.tsx ./test/khung-okr-truoc-r1.dom.tsx ./test/okr-sheet.dom.tsx ./test/gop-y-dung-cho.dom.tsx`
Expected: PASS. Bài nào trong số đó đỏ vì khuôn ngày giờ thì **dừng** — tệp đó ngoài ranh giới; báo tên bài và dòng, xin `cham-tep`, không sửa.
Run: `git diff c1067c16 -- packages/ui/src/lib/format.ts | grep -c '^-[^-]'`
Expected: `0`.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/lib/format.ts "apps/app/app/(app)/[slug]/okr/nhom-kara.tsx" "apps/app/app/(app)/[slug]/okr/bang-vet.tsx" "apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx" "apps/app/app/(app)/[slug]/okr/soan/danh-sach-cuoc.tsx" "apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx" _acceptance/kara-gop-y-luot-2/rang/ngay-gio-mau.json apps/app/test/gop-y-dung-cho-luot-2-ngay-gio.tsx apps/app/test/gop-y-dung-cho-luot-2.dom.tsx
git commit -m "feat(okr): một hàm formatNgayGio cho năm chỗ ghi thời gian, giờ Việt Nam ở cả hai tiếng" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Răng E14 — `ngay-gio.mjs`

`independent: false` (cần Task 16) · Evals: E14

**Files:**
- Create: `_acceptance/kara-gop-y-luot-2/rang/ngay-gio.mjs` (khoá `executors.script.k3_ngay_gio` đã có ở `config.yaml:2114`)

**Interfaces:**
- Consumes: `formatNgayGio` (Task 16), `OKR_CHU_KY` (`apps/app/lib/okr-chu-ky-nhan.ts`), `ngay-gio-mau.json`, bài DOM `-t k3-ngay-gio`.
- Produces: lệnh in `ngay-gio: 5/5 cho goi ham chung` và thoát 0; `--ban-sao them-cu` thoát 1 với `khuon rieng con: <tệp>`.

- [ ] **Step 1: Viết răng**

```js
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OKR_CHU_KY } from "../../../apps/app/lib/okr-chu-ky-nhan.ts";
import { formatNgayGio } from "../../../packages/ui/src/lib/format.ts";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const MAU = JSON.parse(readFileSync(join(GOC, "_acceptance/kara-gop-y-luot-2/rang/ngay-gio-mau.json"), "utf8"));
const OKR = "apps/app/app/(app)/[slug]/okr";
const NAM_CHO = [
	`${OKR}/nhom-kara.tsx`,
	`${OKR}/bang-vet.tsx`,
	`${OKR}/soan/nut-soan.tsx`,
	`${OKR}/soan/danh-sach-cuoc.tsx`,
	`${OKR}/soan/bang-nhap.tsx`,
];
const KHUON_RIENG = [
	/new Intl\.DateTimeFormat\b/,
	/\.toLocale(?:Date|Time)?String\(/,
	/\bdateFormat\(/,
	/\bngayThangVn\(/,
	/\bget(?:Hours|Minutes|Date|Month|FullYear)\(/,
];
const PHAN = ["ngay-gio", "ngay", "ngay-thang", "gio"];
const BAI_DOM =
	"cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-ngay-gio";

function quet(thuMuc) {
	const sai = [];
	for (const tep of NAM_CHO) {
		const chu = readFileSync(join(thuMuc, tep), "utf8");
		if (!chu.includes("formatNgayGio(") || !chu.includes('from "@crm/ui/lib/format"'))
			sai.push(`chua goi ham chung: ${tep}`);
		if (!chu.includes("timeZone: OKR_CHU_KY.muiGio")) sai.push(`khong theo gio Viet Nam: ${tep}`);
		if (KHUON_RIENG.some((r) => r.test(chu))) sai.push(`khuon rieng con: ${tep}`);
	}
	return sai;
}

const co = process.argv.slice(2);
if (co[0] === "--ban-sao" && co[1] === "them-cu") {
	const tam = mkdtempSync(join(tmpdir(), "k3-ngay-gio-"));
	for (const tep of NAM_CHO) {
		mkdirSync(dirname(join(tam, tep)), { recursive: true });
		cpSync(join(GOC, tep), join(tam, tep));
	}
	appendFileSync(join(tam, NAM_CHO[0]), "\nexport const cu = new Date().toLocaleString();\n");
	const sai = quet(tam);
	rmSync(tam, { recursive: true, force: true });
	for (const s of sai) console.log(s);
	const bat = sai.includes(`khuon rieng con: ${NAM_CHO[0]}`);
	if (!bat) console.log("CHIEU DO HONG: ban sao co toLocaleString ma quet khong bat");
	process.exit(bat ? 1 : 3);
}

const lech = [];
for (const locale of ["vi", "en"])
	for (const phan of PHAN) {
		const thuc = formatNgayGio(MAU.moc, locale, { timeZone: OKR_CHU_KY.muiGio, phan });
		if (thuc !== MAU[locale][phan]) lech.push(`ham chung lech mau: ${locale}/${phan} «${thuc}» != «${MAU[locale][phan]}»`);
	}
if (lech.length) {
	for (const l of lech) console.log(l);
	process.exit(1);
}
console.log(`ngay-gio: ham chung khop mau ${PHAN.length * 2}/${PHAN.length * 2}`);

const sai = quet(GOC);
if (sai.length) {
	for (const s of sai) console.log(s);
	process.exit(1);
}
console.log(`ngay-gio: ${NAM_CHO.length}/${NAM_CHO.length} cho goi ham chung`);

const dom = spawnSync("bash", ["-c", BAI_DOM], { cwd: GOC, encoding: "utf8", maxBuffer: 64 << 20 });
const ra = `${dom.stdout}${dom.stderr}`;
if (dom.status !== 0 || !ra.includes("k3-ngay-gio: 14/14 o")) {
	console.log(ra.split("\n").slice(-30).join("\n"));
	console.log(`ngay-gio: man dung lech (bai DOM thoat ${dom.status})`);
	process.exit(1);
}
console.log("ngay-gio: man dung 14/14 o khop mau");
```

- [ ] **Step 2: Chiều đỏ trước**

Run: `bun _acceptance/kara-gop-y-luot-2/rang/ngay-gio.mjs --ban-sao them-cu; echo "ma=$?"`
Expected: in `khuon rieng con: apps/app/app/(app)/[slug]/okr/nhom-kara.tsx`, `ma=1`.

- [ ] **Step 3: Chiều xanh**

Run: `bun _acceptance/kara-gop-y-luot-2/rang/ngay-gio.mjs; echo "ma=$?"`
Expected: ba dòng `ngay-gio: …` (khớp mẫu 8/8, `5/5 cho goi ham chung`, màn 14/14), `ma=0`.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/kara-gop-y-luot-2/rang/ngay-gio.mjs
git commit -m "test(acceptance): răng E14 — một khuôn ngày giờ ở năm chỗ" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: Răng E15 — `dot-bien.mjs` (tám vết)

`independent: false` (cần Task 1–15) · Evals: E15 · Chạy một mình: răng sửa tạm tệp trong cây, không chạy song song với làn khác hay với `ranh-gioi.mjs`.

**Files:**
- Create: `_acceptance/kara-gop-y-luot-2/rang/chung.mjs`
- Create: `_acceptance/kara-gop-y-luot-2/rang/dot-bien.mjs` (khoá `k3_dot_bien` đã có)

**Interfaces:**
- Consumes: khoá `executors.test.k3_*` trong `_acceptance/config.yaml`; các chuỗi vết đúng như code ở Task 2, 3, 5, 7, 8, 9, 11, 15.
- Produces: `chung.mjs` xuất `ROOT`, `RA`, `bam(tep)`, `chayVo(lenh)`, `ghiRa(ten, text)`, `lenhCauHinh(khoa)`; `dot-bien.mjs` in `dot-bien: 8/8 vet bi bat, tep tra lai nguyen`.

- [ ] **Step 1: Đồ dùng chung**

```js
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const RA = path.join(ROOT, ".acceptance-runs/kara-gop-y-luot-2");

function moiTruongSach() {
	const env = { ...process.env };
	for (const k of Object.keys(env)) if (k.startsWith("GIT_")) delete env[k];
	return env;
}

export const chayVo = (lenh) =>
	spawnSync("bash", ["-c", lenh], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20, env: moiTruongSach() });

export const bam = (tep) => createHash("sha256").update(fs.readFileSync(path.join(ROOT, tep))).digest("hex");

export function lenhCauHinh(khoa) {
	const cfg = Bun.YAML.parse(fs.readFileSync(path.join(ROOT, "_acceptance/config.yaml"), "utf8"));
	const lenh = cfg.executors?.test?.[khoa] ?? cfg.executors?.script?.[khoa];
	if (!lenh) throw new Error(`thieu executors.*.${khoa} trong _acceptance/config.yaml`);
	return lenh;
}

export function ghiRa(ten, text) {
	fs.mkdirSync(RA, { recursive: true });
	const p = path.join(RA, ten);
	fs.writeFileSync(p, text);
	return p;
}
```

- [ ] **Step 2: Tám vết**

```js
import fs from "node:fs";
import path from "node:path";
import { ROOT, bam, chayVo, ghiRa, lenhCauHinh } from "./chung.mjs";

const OKR = "apps/app/app/(app)/[slug]/okr";
const CHAN = [
	"k3_khung", "k3_tai_loi", "k3_nho_loi", "k3_qua_han", "k3_tat", "k3_loi_dong",
	"k3_can_chinh", "k3_hai_hoan", "k3_chip", "k3_nhieu_kr", "k3_nhieu_kr_ui", "k3_neo_kr",
];

const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1) throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};
const noi = (...buoc) => (s) => buoc.reduce((x, f) => f(x), s);

const VET = [
	{ ten: "(a) bo media={false}", tep: `${OKR}/nhom-kara.tsx`, cam: thay("media={false}", "media"), doi: [["k3_khung", "tia sang trong vung"]] },
	{ ten: "(b) tai loi tra tat", tep: `${OKR}/gop-y-kara.ts`, cam: thay('if (danhSach.isError && ds === undefined) return "tai-loi";', 'if (danhSach.isError && ds === undefined) return "tat";'), doi: [["k3_tai_loi", "vung kara bien mat khi tai loi"]] },
	{ ten: "(c) quaHan doi batDau", tep: `${OKR}/gop-y-kara.ts`, cam: thay("thayDocLuc !== null &&", "batDau !== null &&\n\t\tthayDocLuc !== null &&"), doi: [["k3_qua_han", "cho mai"]] },
	{ ten: "(d) in e.message", tep: `${OKR}/gop-y-kara.ts`, cam: thay("cauLoiDong(cause, mGopY)", "cause instanceof Error ? cause.message : String(cause)"), doi: [["k3_loi_dong", "lo cau tho: clx"]] },
	{ ten: "(e) callback chung cua mutation", tep: `${OKR}/gop-y-kara.ts`, cam: thay("await suaKr.mutateAsync({ id: d.keyResultId, title: truoc });", 'await new Promise<void>((xong, hong) => suaKr.mutate({ id: d.keyResultId ?? "", title: truoc }, { onSuccess: () => xong(), onError: hong }));'), doi: [["k3_hai_hoan", "kr1 khong ve cho"]] },
	{ ten: "(f) assertSuaDich luat cu", tep: "apps/api/src/okr/tro-ly.service.ts", cam: thay("await this.coKrSuaDuoc(userId, dich.objectiveId)", "false"), doi: [["k3_nhieu_kr", "nguoi phu trach hai kr bi tu choi"]] },
	{ ten: "(g) chi cuon toi vung", tep: "apps/app/components/crm/record-sheet/objective-sheet.tsx", cam: thay("noiDen.focus({ preventScroll: true });", ""), doi: [["k3_neo_kr", "focus roi ve body"]] },
	{ ten: "(h) chon lien ket dau danh sach khop dich", tep: `${OKR}/gop-y-kara.ts`, cam: noi(thay(" && !cu.has(g.alignmentId)", ""), thay("moi.length === 1", "moi.length > 0")), doi: [["k3_can_chinh", "go nham lien ket"]] },
];

const chay = (khoa) => {
	const r = chayVo(lenhCauHinh(khoa));
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};

const nen = CHAN.map((k) => ({ k, ...chay(k) }));
const chuaXanh = nen.filter((x) => x.ma !== 0);
if (chuaXanh.length) {
	console.log(`KHONG DO DUOC: chua pha gi ma ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")} da khong xanh`);
	process.exit(2);
}
console.log(`chieu xanh: ${CHAN.length}/${CHAN.length} chan xanh tren cay lanh`);

let bat = 0;
for (const v of VET) {
	const duong = path.join(ROOT, v.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	const ket = [];
	try {
		fs.writeFileSync(duong, v.cam(truoc));
		for (const [k, thongDiep] of v.doi) {
			const r = chay(k);
			ghiRa(`dot-bien-${v.ten.slice(1, 2)}-${k}.txt`, r.ra);
			ket.push({ k, do: r.ma !== 0, ghim: r.ra.includes(thongDiep), thongDiep });
		}
	} finally {
		fs.writeFileSync(duong, truoc);
	}
	if (bam(v.tep) !== bamTruoc) {
		console.log(`TEP KHONG TRA LAI: ${v.tep}`);
		process.exit(3);
	}
	const duBat = ket.every((x) => x.do && x.ghim);
	if (duBat) bat++;
	console.log(`${duBat ? "bat" : "MU"} ${v.ten}: ${ket.map((x) => `${x.k} ${x.do ? "do" : "XANH"}${x.ghim ? "" : ` (thieu «${x.thongDiep}»)`}`).join(" · ")}`);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
```

- [ ] **Step 3: Chạy**

Run: `bun _acceptance/kara-gop-y-luot-2/rang/dot-bien.mjs; echo "ma=$?"`
Expected: `chieu xanh: 12/12 …`, tám dòng `bat (…)`, `dot-bien: 8/8 vet bi bat, tep tra lai nguyen`, `ma=0`, và `git status --short` không có tệp nguồn nào đổi. Một vết báo `vet khong cam duoc` nghĩa là chuỗi trong mã đã khác chuỗi ở task sở hữu — sửa răng cho khớp mã, không sửa mã cho khớp răng. Một vết `MU` thì đọc `.acceptance-runs/kara-gop-y-luot-2/dot-bien-<chữ>-<khoá>.txt`.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/kara-gop-y-luot-2/rang/chung.mjs _acceptance/kara-gop-y-luot-2/rang/dot-bien.mjs
git commit -m "test(acceptance): răng E15 — tám vết đột biến của K3" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: Răng E15b — `ranh-gioi.mjs`

`independent: true` (đọc `git diff`, không chạm mã) · Evals: E15b

**Files:**
- Create: `_acceptance/kara-gop-y-luot-2/rang/ranh-gioi.mjs` (khoá `k3_ranh_gioi` đã có; khuôn `git show feat/ly-do-tu-choi-nop-theo-locale:_acceptance/ly-do-tu-choi-nop-theo-locale/rang/ranh-gioi.mjs`)

**Interfaces:**
- Consumes: `docs/plan/dot-sau-14-10/hang-viec.json` (hàng `K3`) hay `<git-common-dir>/../.acceptance-runs/dieu-phoi-sau-14-10/hang-viec.json`; `origin/onehub`.
- Produces: in `ranh-gioi: <n> tep, 0 ngoai (neo <kieu>)`; `--them <tệp>` thoát 1 với `ngoai-ranh-gioi:<tệp>`.

- [ ] **Step 1: Viết răng**

```js
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "kara-gop-y-luot-2";
const MA_HANG = "K3";
const NHANH_CHINH = "origin/onehub";
const NGUON_HANG = [
	"docs/plan/dot-sau-14-10/hang-viec.json",
	".acceptance-runs/dieu-phoi-sau-14-10/hang-viec.json",
];

const RANH_GIOI_CHEP = [
	"apps/app/app/(app)/[slug]/okr/gop-y-kara.ts",
	"apps/app/app/(app)/[slug]/okr/chip-gop-y.tsx",
	"apps/app/app/(app)/[slug]/okr/nhom-kara.tsx",
	"apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx",
	"apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts",
	"apps/app/app/(app)/[slug]/okr/diem-cam.ts",
	"apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
	"apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx",
	"apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx",
	"apps/app/app/(app)/[slug]/okr/cua-toi.tsx",
	"apps/app/app/(app)/[slug]/okr/bang-vet.tsx",
	"apps/app/app/(app)/[slug]/okr/bang-muc-tieu.tsx",
	"apps/app/components/crm/record-sheet/objective-sheet.tsx",
	"apps/app/components/crm/record-sheet/kr-sheet.tsx",
	"apps/app/lib/messages/okr-gop-y.ts",
	"apps/app/lib/messages/tro-ly-okr.ts",
	"apps/api/src/okr/dem-gop-y.ts",
	"apps/api/src/okr/tro-ly.service.ts",
	"apps/api/src/okr/tro-ly-so-do.ts",
	"packages/validation/src/okr-tro-ly.ts",
	"packages/validation/src/okr-ca-gop-y.ts",
	"packages/db/src/okr-tro-ly-danh-muc.ts",
	"packages/ui/src/components/proposed-change.tsx",
	"apps/app/test/gop-y-dung-cho*",
	"apps/app/test/khung-gop-y*",
	"apps/app/test/the-gop-y-okr.dom.tsx",
	"apps/app/test/hop-thoai-kr-sau-thu.dom.tsx",
	"apps/app/test/okr-sheet.dom.tsx",
	`_acceptance/${SLUG}/**`,
	"apps/api/src/okr/okr-config.ts",
	"packages/ui/src/components/kara/transcript.tsx",
	"packages/ui/src/components/kara/steps.tsx",
];

const CHAM_TEP = [
	"packages/ui/src/components/kara/state.tsx",
	"apps/app/lib/okr-search-params.ts",
	"apps/app/test/messages-guard.spec.ts",
	"packages/ui/src/lib/format.ts",
	"apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx",
	"apps/app/app/(app)/[slug]/okr/soan/danh-sach-cuoc.tsx",
	"apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx",
	"apps/api/test/kara-gop-y-luot-2.spec.ts",
	"_acceptance/config.yaml",
	`docs/superpowers/specs/2026-10-09-${SLUG}-design.md`,
	`docs/superpowers/plans/2026-10-09-${SLUG}.md`,
	"PRODUCT-MAP.md",
];

const CHAM_TEP_XIN = [
	"apps/app/lib/search-param-keys.ts",
	"apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts",
	"docs/api.md",
];

const CHI_THEM = [
	"packages/ui/src/lib/format.ts",
	"_acceptance/config.yaml",
	"apps/app/lib/search-param-keys.ts",
	"apps/api/src/okr/okr-config.ts",
	"packages/ui/src/components/kara/transcript.tsx",
	"packages/ui/src/components/kara/steps.tsx",
];
const STATE = "packages/ui/src/components/kara/state.tsx";
const DONG_KIEU_DUOC_DOI = /^\| \{ kind: "(empty|off)";/;

function git(...thamSo) {
	return execFileSync("git", thamSo, { cwd: GOC, encoding: "utf8", maxBuffer: 64 << 20 });
}

function boCuoc(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function mauRegex(mau) {
	let r = "";
	for (let i = 0; i < mau.length; i++) {
		const c = mau[i];
		if (c === "*" && mau[i + 1] === "*") {
			r += ".*";
			i++;
		} else if (c === "*") r += "[^/]*";
		else r += c.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
	}
	return new RegExp(`^${r}$`);
}

function docDot() {
	const chung = git("rev-parse", "--path-format=absolute", "--git-common-dir").trim();
	for (const p of [join(GOC, NGUON_HANG[0]), join(dirname(chung), NGUON_HANG[1])]) {
		if (!existsSync(p)) continue;
		const viec = JSON.parse(readFileSync(p, "utf8"));
		const h = (viec.hang ?? []).find((x) => x.ma === MA_HANG);
		if (h) return { nguon: p.startsWith(GOC) ? NGUON_HANG[0] : NGUON_HANG[1], tep: [...h.ranh_gioi, ...(h.chung_chi_them ?? [])] };
	}
	return null;
}

function chonNeo() {
	try {
		git("rev-parse", "--verify", NHANH_CHINH);
	} catch {
		boCuoc(`khong co ref ${NHANH_CHINH} — chay git fetch origin onehub`);
	}
	const them = git("log", "--diff-filter=A", "--format=%H", "--", `_acceptance/${SLUG}/contract.md`).trim().split("\n").filter(Boolean);
	const dau = them.at(-1);
	if (!dau) boCuoc(`khong tim thay commit dau them _acceptance/${SLUG}/contract.md`);
	let daLen = true;
	try {
		git("merge-base", "--is-ancestor", dau, NHANH_CHINH);
	} catch {
		daLen = false;
	}
	if (!daLen) return { kieu: "nhanh-mo", tu: git("merge-base", "HEAD", NHANH_CHINH).trim(), toi: "HEAD" };
	const chuoi = git("rev-list", "--first-parent", "--ancestry-path", `${dau}..${NHANH_CHINH}`).trim().split("\n").filter(Boolean);
	const m = chuoi.at(-1);
	if (!m) boCuoc("khong tim thay merge dua ho so len onehub");
	const toi = git("rev-parse", `${m}^2`).trim();
	return { kieu: `merge ${m.slice(0, 9)}`, tu: git("merge-base", `${m}^1`, toi).trim(), toi };
}

function dongDoi(tu, toi, tep) {
	return git("diff", "-U0", tu, toi, "--", tep)
		.split("\n")
		.filter((d) => /^[+-]/.test(d) && !/^(\+\+\+|---) /.test(d))
		.map((d) => ({ dau: d[0], noi: d.slice(1).trim() }));
}

const argv = process.argv.slice(2);
const lay = (ten) => {
	const i = argv.indexOf(ten);
	return i < 0 ? null : (argv[i + 1] ?? null);
};

const dot = docDot();
const ranhGioi = dot?.tep ?? RANH_GIOI_CHEP;
const mau = [...ranhGioi, ...CHAM_TEP, ...CHAM_TEP_XIN].map(mauRegex);
const neo = chonNeo();
const tep = git("diff", "--name-only", neo.tu, neo.toi).split("\n").filter(Boolean);
if (lay("--them")) tep.push(lay("--them"));
console.log(`neo ${neo.kieu}: ${neo.tu.slice(0, 9)}..${neo.toi === "HEAD" ? "HEAD" : neo.toi.slice(0, 9)} · ${tep.length} tep · ranh gioi ${dot ? dot.nguon : "chep"}`);

const loi = [];
for (const t of tep) if (!mau.some((r) => r.test(t))) loi.push(`ngoai-ranh-gioi:${t}`);
for (const t of CHI_THEM)
	if (tep.includes(t) && dongDoi(neo.tu, neo.toi, t).some((d) => d.dau === "-" && d.noi !== ""))
		loi.push(`xoa dong o tep chi them: ${t}`);
if (tep.includes(STATE))
	for (const d of dongDoi(neo.tu, neo.toi, STATE))
		if (d.dau === "-" && d.noi !== "" && !DONG_KIEU_DUOC_DOI.test(d.noi))
			loi.push(`state.tsx doi dong ngoai khai kieu: -${d.noi}`);

if (loi.length) {
	for (const l of loi) console.log(`   ${l}`);
	console.log(`DO: ${loi.length} vi pham ranh gioi`);
	process.exit(1);
}
console.log(`ranh-gioi: ${tep.length} tep, 0 ngoai (neo ${neo.kieu})`);
```

Ba tệp trong `CHAM_TEP_XIN` chỉ để lại khi đã được duyệt (mục «Cần xin chạm tệp thêm»); tệp nào bị từ chối thì xoá khỏi mảng, và task sở hữu không chạm tệp đó.

- [ ] **Step 2: Chiều đỏ trước**

Run: `node _acceptance/kara-gop-y-luot-2/rang/ranh-gioi.mjs --them apps/app/lib/x.ts; echo "ma=$?"`
Expected: dòng `ngoai-ranh-gioi:apps/app/lib/x.ts`, `ma=1`.

- [ ] **Step 3: Chiều xanh**

Run: `git fetch origin onehub && node _acceptance/kara-gop-y-luot-2/rang/ranh-gioi.mjs; echo "ma=$?"`
Expected: `ranh-gioi: <n> tep, 0 ngoai (neo nhanh-mo)`, `ma=0`.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/kara-gop-y-luot-2/rang/ranh-gioi.mjs
git commit -m "test(acceptance): răng E15b — ranh giới hàng K3 tự chọn neo" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 20: Răng E15c — bàn đo màn `man.mjs` (mười trạng thái × hai khổ)

`independent: false` (cần Task 1–16) · Evals: E15c · Lệnh: `config:executors.script.k3_man` (`bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/kara-gop-y-luot-2/rang/man.mjs"`) — phiên đo riêng, kho `crm_<cây>_do`, cảnh cây trước màn đầu. Chờ trần thật (`TRO_LY_OKR_TRAN.tranChoMs`), không biến môi trường mới. Nhập lại `san-gop-y.mjs` và `phien-tro-ly.mjs`, không sửa.

**Files:**
- Create: `_acceptance/kara-gop-y-luot-2/rang/man.mjs`

**Interfaces:**
- Consumes: `gieoGopY`, `datLaiGopY`, `dongKho`, `SAN` (`_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs`); `idMau`, `laKhoDo`, `napBoMau`, `phienCookie`, `thuMau`, `tre`, `trpc` (`_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs`); `canhCay` (`_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`); dấu DOM của Task 1–15.
- Produces: 20 ảnh `_acceptance/kara-gop-y-luot-2/evidence/<trạng-thái>-<khổ>.png`, mỗi trạng thái dòng `DUNG …`, thoát 0.

Cách chặn: tRPC của app dùng `httpBatchLink`, nên một yêu cầu có thể gộp nhiều thủ tục. `traLoi` chỉ thay phần tử của thủ tục bị chặn; thủ tục khác trong cùng lô được gọi thật qua `${APP}/api/trpc/<thủ tục>?batch=1` bằng cookie của trang, rồi ghép lại thành mảng đúng thứ tự. Lỗi giả mang đúng hình lỗi tRPC (`data.code`, `httpStatus`), để màn phân loại như lỗi thật.

- [ ] **Step 1: Viết bàn đo**

```js
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { nopDeXuatVao } from "../../../apps/agent/agent/lib/okr/nop-de-xuat.ts";
import { completeTask, noteSession } from "../../../apps/agent/agent/lib/tasks.ts";
import { okrGopYMessages } from "../../../apps/app/lib/messages/okr-gop-y.ts";
import { VIEC_OKR } from "../../../packages/db/src/agent-tasks.ts";
import { db } from "../../../packages/db/src/index.ts";
import { xepViecTroLy } from "../../../packages/db/src/okr-tro-ly.ts";
import { TRO_LY_OKR_TRAN } from "../../../packages/validation/src/okr-tro-ly.ts";
import { datLaiGopY, dongKho, gieoGopY, SAN } from "../../gop-y-dung-cho/rang/san-gop-y.mjs";
import { idMau, laKhoDo, napBoMau, phienCookie, thuMau, tre, trpc } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ANH = join(GOC, "_acceptance/kara-gop-y-luot-2/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: [
		{ ten: "1440", rong: 1440, cao: 1000 },
		{ ten: "390", rong: 390, cao: 844 },
	],
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500, hienMs: 1200, quaHanMs: TRO_LY_OKR_TRAN.tranChoMs + 5 * GIAY_MS },
	nguoiHaiKr: "hoang-yen-nhi",
	maJsonRpc: { FORBIDDEN: -32003, NOT_FOUND: -32004, INTERNAL_SERVER_ERROR: -32603 },
	chanBoi: "chan boi kara-gop-y-luot-2/man.mjs",
	soAnh: 20,
};
const m = okrGopYMessages("vi");

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await dongKho().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}
async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}
function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
	return dat;
}
const ghi = (cau) => dong.push(`GHI ${cau}`);

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` } });
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	return dau && !["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x)) ? dau : null;
}

async function trang(cookie, kho) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: kho.rong, height: kho.cao, deviceScaleFactor: 1 });
	p.setDefaultNavigationTimeout(MAN.cho.manMs);
	p.setDefaultTimeout(MAN.cho.manMs);
	const loiConsole = [];
	p.on("console", (msg) => {
		if (msg.type() === "error") loiConsole.push(msg.text());
	});
	return { ctx, p, kho: kho.ten, cookie, loiConsole };
}

async function moKhung(t, c, id, them = "") {
	await t.p.goto(`${APP}/${c.slug}/okr/theo-don-vi?donOkr=pb:${c.g.phongBan}&record=objective:${id}${them}`, { waitUntil: "load" });
	await t.p.waitForSelector(`[data-okr-sheet="${id}"]`);
	await t.p.evaluate(() => document.fonts.ready);
}

async function chup(t, ten) {
	await tre(MAN.cho.yenMs);
	await t.p.evaluate(() => {
		for (const s of ["nextjs-portal", ".tsqd-parent-container", ".tsqd-open-btn-container"])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
	const tep = join(ANH, `${ten}-${t.kho}.png`);
	await t.p.screenshot({ path: tep });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
}

function kiemConsole(t, ten, maChan) {
	const la = t.loiConsole.filter((x) => !maChan.some((s) => x.includes(`status of ${s}`)));
	kiem(`${ten} ${t.kho}: console khong loi ngoai yeu cau bi chan (${la.length})${la.length ? ` — ${la[0]}` : ""}`, la.length === 0);
}

const loiTrpc = (duong, ma, http) => () => ({
	error: { message: MAN.chanBoi, code: MAN.maJsonRpc[ma], data: { code: ma, httpStatus: http, path: duong } },
});
const traVe = (data) => () => ({ result: { data } });

async function traLoi(t, r, thay) {
	if (r.isInterceptResolutionHandled()) return;
	const u = new URL(r.url());
	if (!u.pathname.startsWith("/api/trpc/")) return r.continue();
	const duong = decodeURIComponent(u.pathname.slice("/api/trpc/".length)).split(",");
	if (!duong.some((d) => d in thay)) return r.continue();
	if (r.method() !== "GET" && !duong.every((d) => d in thay)) {
		ghi(`lo POST tron khong chan duoc: ${duong.join(",")}`);
		return r.continue();
	}
	const vao = JSON.parse((r.method() === "GET" ? u.searchParams.get("input") : r.postData()) ?? "{}");
	const ra = await Promise.all(
		duong.map(async (d, i) => {
			if (d in thay) return thay[d](vao[String(i)]);
			const res = await fetch(`${APP}/api/trpc/${d}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: vao[String(i)] }))}`, {
				headers: { cookie: `${t.cookie.ten}=${t.cookie.gia}; lang=vi` },
			});
			return (await res.json())[0];
		}),
	);
	const loi = ra.filter((x) => x.error);
	const status = loi.length === 0 ? 200 : loi.length === ra.length ? loi[0].error.data.httpStatus : 207;
	return r.respond({ status, contentType: "application/json", body: JSON.stringify(ra) });
}

async function chan(t, thay) {
	await t.p.setRequestInterception(true);
	t.p.on("request", (r) => void traLoi(t, r, thay));
}

function nguCanhCon(phienGoc) {
	return {
		agent: { name: "tro_ly_okr" },
		channel: { kind: "subagent", continuationToken: `subagent:${phienGoc}:goi-tro-ly` },
		session: { id: `${phienGoc}-con`, parent: { sessionId: phienGoc, rootSessionId: phienGoc } },
	};
}

async function nopThem(objectiveId, nguoiYeuCau, dongMoi) {
	const xep = await xepViecTroLy(db, { viec: "de-xuat", objectiveId, keyResultId: null, nguoiYeuCau, nac: "bat" });
	if (!xep.bat || xep.dungLai) throw new Error(`xep viec ${objectiveId}: ${xep.lyDo ?? "dung lai viec cu"}`);
	await db.agentTask.update({
		where: { id: xep.taskId },
		data: { attempts: { increment: 1 }, startedAt: new Date(), leasedUntil: new Date(Date.now() + VIEC_OKR.leaseMs) },
	});
	const phienGoc = `kara-gop-y-luot-2-man-${xep.taskId}`;
	await noteSession(xep.taskId, phienGoc);
	await nopDeXuatVao({ dong: dongMoi }, nguCanhCon(phienGoc));
	if (!(await completeTask(xep.taskId, "da-nop"))) throw new Error(`viec ${xep.taskId} da dong truoc khi nop xong`);
	const hang = await db.okrDeXuat.findMany({ where: { taskId: xep.taskId }, select: { id: true, trangThai: true } });
	if (hang.length !== dongMoi.length || hang.some((h) => h.trangThai !== "cho"))
		throw new Error(`nop ${objectiveId}: ${hang.length}/${dongMoi.length} dong cho`);
	return hang.map((h) => h.id);
}

const dongViec = (objectiveId, ketQua) =>
	db.agentTask.updateMany({
		where: { kind: "okr-de-xuat", finishedAt: null, payload: { path: ["objectiveId"], equals: objectiveId } },
		data: { finishedAt: new Date(), outcome: ketQua },
	});
const datVeCho = (ids) =>
	db.okrDeXuat.updateMany({ where: { id: { in: ids } }, data: { trangThai: "cho", quyetLuc: null, nguoiQuyet: null, giaTriCuoi: null } });
const lienKetCua = async (c, id) =>
	(await trpc(API, c.tr).hoi("okr.objective", { id })).alignments.map((g) => g.alignmentId);

async function chuanBi() {
	const nap = napBoMau();
	if (nap.ma !== 0) throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	ghi(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	const qt = phienCookie(thuMau(SAN.nguoi.quanTri));
	const tr = phienCookie(thuMau(SAN.nguoi.truong));
	const hy = phienCookie(thuMau(MAN.nguoiHaiKr));
	const slug = await suySlug(tr);
	if (!slug) throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	const g = await gieoGopY({ api: API, quanTri: qt, truong: tr });
	const truongId = idMau("nguoi", SAN.nguoi.truong);
	const mtA = await trpc(API, tr).hoi("okr.objective", { id: g.a });
	const daGan = new Set(mtA.alignments.map((x) => `${x.targetObjectiveId}:${x.targetKeyResultId}`));
	const { targets } = await trpc(API, tr).hoi("okr.alignmentTargets", { objectiveId: g.a });
	const dich = targets.find((x) => !daGan.has(`${x.objectiveId}:${x.keyResultId}`));
	if (!dich) throw new Error(`${g.a} khong con dich can chinh nao chua gan`);
	const [can] = await nopThem(g.a, truongId, [
		{
			keyResultId: null,
			truong: null,
			truoc: null,
			sau: null,
			maVanDe: null,
			loai: "can-chinh",
			objectiveId: g.a,
			targetObjectiveId: dich.keyResultId === null ? dich.objectiveId : null,
			targetKeyResultId: dich.keyResultId,
			lyDo: "Mục tiêu này góp thẳng vào đích của OneHub.",
		},
	]);
	const kr3 = await db.okrKeyResult.findUniqueOrThrow({ where: { id: g.kr3 }, select: { ownerUserId: true } });
	ghi(`GIEO A ${g.a} (3 dong + can chinh ${can}), B ${g.b} luot rong`);
	return { qt, tr, hy, slug, g, can, truongId, chuKr3: kr3.ownerUserId };
}

async function coKhung(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await moKhung(t, c, c.g.a);
		await t.p.waitForSelector("[data-vung-kara] [data-nhom-kara=co-gop-y]");
		const o = await t.p.evaluate(() => {
			const vung = document.querySelector("[data-vung-kara]");
			const ben = document.querySelector("[data-khu=vi-sao] section");
			return {
				cungKhung: (vung?.closest("section")?.className ?? "x") === (ben?.className ?? "y"),
				tia:
					(vung?.querySelectorAll("[data-slot=kara-mark]").length ?? 0) +
					(vung?.querySelectorAll("[data-slot=proposed-change] > [data-slot=item-media]").length ?? 0),
			};
		});
		kiem(`co-khung ${t.kho}: vung cung khung vung ben canh`, o.cungKhung);
		kiem(`co-khung ${t.kho}: mot tia sang (${o.tia})`, o.tia === 1);
		await chup(t, "co-khung");
		kiemConsole(t, "co-khung", []);
	} finally {
		await t.ctx.close();
	}
}

async function neoKr(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await moKhung(t, c, c.g.a, `&neoGopY=true&neoGopYKr=${c.g.kr3}`);
		await t.p.waitForFunction(
			(kr) => document.activeElement?.closest("[data-kara-proposal-kr]")?.getAttribute("data-kara-proposal-kr") === kr,
			{},
			c.g.kr3,
		);
		const noi = await t.p.evaluate(() => document.activeElement?.closest("[data-kara-proposal-kr]")?.getAttribute("data-highlighted"));
		kiem(`neo-kr ${t.kho}: focus va lam noi gop y cua KR3`, noi === "true");
		await chup(t, "neo-kr");
		kiemConsole(t, "neo-kr", []);
	} finally {
		await t.ctx.close();
	}
}

async function loiDong(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await chan(t, { "okr.troLyQuyet": loiTrpc("okr.troLyQuyet", "NOT_FOUND", 404) });
		await moKhung(t, c, c.g.a);
		const sel = `[data-gop-y="${c.g.dong.vietLaiKr1}"]`;
		await t.p.waitForSelector(`${sel} [data-hanh-dong="nhan"]`);
		await t.p.click(`${sel} [data-hanh-dong="nhan"]`);
		await t.p.waitForSelector(`${sel} [data-slot=field-error]`);
		const chu = await t.p.$eval(`${sel} [data-slot=field-error]`, (e) => e.textContent ?? "");
		kiem(`loi-dong ${t.kho}: cau san pham khong con, khong ma tho («${chu}»)`, chu === m.loiDong["khong-con"] && !chu.includes(MAN.chanBoi));
		await chup(t, "loi-dong");
		kiemConsole(t, "loi-dong", [404]);
	} finally {
		await t.ctx.close();
	}
}

async function canChinh(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		const truoc = await lienKetCua(c, c.g.a);
		await moKhung(t, c, c.g.a);
		const sel = `[data-gop-y="${c.can}"]`;
		await t.p.waitForSelector(`${sel} [data-hanh-dong="can-chinh"]`);
		await t.p.click(`${sel} [data-hanh-dong="can-chinh"]`);
		await t.p.waitForSelector(`${sel} [data-slot=proposed-change-receipt] button`);
		const sauNhan = await lienKetCua(c, c.g.a);
		kiem(`can-chinh ${t.kho}: nhan tao dung mot lien ket moi (${truoc.length} -> ${sauNhan.length})`, sauNhan.length === truoc.length + 1);
		await chup(t, "can-chinh-hoan");
		await t.p.click(`${sel} [data-slot=proposed-change-receipt] button`);
		await t.p.waitForSelector(`${sel}[data-trang-thai="da-hoan-tac"]`);
		const sauHoan = await lienKetCua(c, c.g.a);
		kiem(
			`can-chinh ${t.kho}: Hoan tac ve so cu, lien ket co san con nguyen (${sauHoan.length})`,
			sauHoan.length === truoc.length && truoc.every((id) => sauHoan.includes(id)),
		);
		kiemConsole(t, "can-chinh", []);
	} finally {
		await t.ctx.close();
	}
}

async function taiLoi(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await chan(t, { "okr.troLyDanhSach": loiTrpc("okr.troLyDanhSach", "INTERNAL_SERVER_ERROR", 500) });
		await moKhung(t, c, c.g.a);
		await t.p.waitForSelector("[data-nhom-kara=tai-loi] [data-kara-state=error] [data-slot=kara-retry]");
		kiem(`tai-loi ${t.kho}: vung con, KaraState loi co Thu lai`, true);
		await chup(t, "tai-loi");
		kiemConsole(t, "tai-loi", [500, 207]);
	} finally {
		await t.ctx.close();
	}
}

async function haiKr(c, kho) {
	await db.okrKeyResult.update({ where: { id: c.g.kr3 }, data: { ownerUserId: idMau("nguoi", MAN.nguoiHaiKr) } });
	const t = await trang(c.hy, kho);
	const biChan = [];
	t.p.on("response", (res) => {
		if (res.url().includes("okr.troLyDeXuat") && res.status() !== 200) biChan.push(res.status());
	});
	try {
		await moKhung(t, c, c.g.a);
		await t.p.waitForSelector("[data-okr-sheet] [data-gop-y]");
		const thay = await t.p.evaluate(() =>
			[...document.querySelectorAll("[data-okr-sheet] [data-gop-y]")].map((o) => o.getAttribute("data-gop-y")).sort(),
		);
		kiem(`hai-kr ${t.kho}: chi thay gop y cua KR minh (${thay.join(",")})`, JSON.stringify(thay) === JSON.stringify([c.g.dong.hoiKr3]));
		await t.p.click(`[data-gop-y="${c.g.dong.hoiKr3}"] [data-hanh-dong="bo-qua"]`);
		await t.p.waitForSelector("[data-vung-kara] [data-nut=nho-kara]:not([disabled])");
		await t.p.click("[data-vung-kara] [data-nut=nho-kara]");
		await t.p.waitForSelector("[data-vung-kara] [data-kara-state=working]");
		kiem(`hai-kr ${t.kho}: Nho Kara cho ca Muc tieu khong bi tu choi (${biChan.join(",")})`, biChan.length === 0);
		await tre(MAN.cho.hienMs);
		await chup(t, "hai-kr");
		kiemConsole(t, "hai-kr", []);
	} finally {
		await t.ctx.close();
		await dongViec(c.g.a, "loi");
		await db.okrKeyResult.update({ where: { id: c.g.kr3 }, data: { ownerUserId: c.chuKr3 } });
	}
}

async function dangDocQuaHan(c, kho) {
	const viec = await xepViecTroLy(db, { viec: "de-xuat", objectiveId: c.g.b, keyResultId: null, nguoiYeuCau: c.truongId, nac: "bat" });
	if (!viec.bat) throw new Error(`khong xep duoc viec treo cho B: ${viec.lyDo}`);
	const t = await trang(c.tr, kho);
	try {
		await moKhung(t, c, c.g.b);
		await t.p.waitForSelector("[data-vung-kara] [data-kara-state=working]");
		await tre(MAN.cho.hienMs);
		kiem(`dang-doc ${t.kho}: Kara dang doc`, true);
		await chup(t, "dang-doc");
		await t.p.waitForSelector("[data-vung-kara] [data-kara-state=error] [data-slot=kara-retry]", { timeout: MAN.cho.quaHanMs + MAN.cho.manMs });
		kiem(`qua-han ${t.kho}: qua tran that thi sang loi co Thu lai`, true);
		await chup(t, "qua-han");
		kiemConsole(t, "dang-doc+qua-han", []);
	} finally {
		await t.ctx.close();
		await dongViec(c.g.b, "loi");
	}
}

async function nhoLoi(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await chan(t, { "okr.troLyDeXuat": loiTrpc("okr.troLyDeXuat", "FORBIDDEN", 403) });
		await moKhung(t, c, c.g.b);
		await t.p.waitForSelector("[data-nhom-kara=loi] [data-slot=kara-retry]");
		await t.p.click("[data-nhom-kara=loi] [data-slot=kara-retry]");
		await t.p.waitForSelector("[data-nhom-kara=nho-loi] [data-kara-state=error]");
		const moTa = await t.p.$eval("[data-nhom-kara=nho-loi] [data-slot=empty-description]", (e) => e.textContent ?? "");
		kiem(`nho-loi ${t.kho}: cau san pham cua 403 («${moTa}»)`, moTa === m.vung.nhoLoi["khong-quyen"]);
		await chup(t, "nho-loi");
		kiemConsole(t, "nho-loi", [403]);
	} finally {
		await t.ctx.close();
	}
}

async function hetLuot(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await chan(t, { "okr.troLySanSang": traVe({ bat: false, lyDo: "het-tran-ngay" }) });
		await moKhung(t, c, c.g.b);
		await t.p.waitForSelector("[data-vung-kara] [data-kara-state=off]");
		const o = await t.p.evaluate((thuLai) => {
			const vung = document.querySelector("[data-vung-kara]");
			return {
				lyDo: vung?.querySelector("[data-kara-state=off] [data-slot=field-description]")?.textContent ?? "",
				xam: [...(vung?.querySelectorAll("button[disabled]") ?? [])].filter((b) => b.textContent?.trim() === thuLai).length,
			};
		}, "Thử lại");
		kiem(`het-luot ${t.kho}: noi vi sao va khi nao mo lai, khong Thu lai xam (${o.xam})`, o.lyDo === m.vung.hetLuot && o.xam === 0);
		await chup(t, "het-luot");
		kiemConsole(t, "het-luot", []);
	} finally {
		await t.ctx.close();
	}
}

const TRANG_THAI = [
	["co-khung", coKhung],
	["neo-kr", neoKr],
	["loi-dong", loiDong],
	["can-chinh-hoan", canChinh],
	["tai-loi", taiLoi],
	["hai-kr", haiKr],
	["dang-doc+qua-han", dangDocQuaHan],
	["nho-loi", nhoLoi],
	["het-luot", hetLuot],
];

mkdirSync(ANH, { recursive: true });
const { canhCay } = await import("../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs");
const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
if (!laKhoDo()) await khongDo("DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.k3_man");

let c;
try {
	c = await chuanBi();
} catch (loi) {
	await khongDo(`chuan bi: ${loi?.message ?? loi}`);
}

trinhDuyet = await puppeteer.launch({ executablePath: MAN.chrome, headless: true });
let buoc = "";
try {
	for (const kho of MAN.kho) {
		await datLaiGopY(c.g, { api: API, truong: c.tr });
		await datVeCho([c.can]);
		for (const [ten, lam] of TRANG_THAI) {
			buoc = `${ten} ${kho.ten}`;
			await lam(c, kho);
		}
	}
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}
const soAnh = dong.filter((d) => d.startsWith("ANH")).length;
kiem(`du ${MAN.soAnh} anh (${soAnh})`, soAnh === MAN.soAnh);
await ket(sai === 0 ? 0 : 1);
```

- [ ] **Step 2: Chạy trên phiên đo**

Run: `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/kara-gop-y-luot-2/rang/man.mjs"; echo "ma=$?"`
Expected: mỗi trạng thái một hay hai dòng `DUNG`, `DUNG du 20 anh (20)`, `KET LUAN: … 0 SAI — ma thoat 0`, `ma=0`. Mất khoảng hai lần trần chờ (hai khổ × 30 giây) cộng thời dựng phiên. `KHONG DO DUOC: … lo POST tron` hay sheet không mở khi chặn `troLyDanhSach` (lô gộp cả `okr.objective`) là lỗi của bàn đo, không phải của sản phẩm — sửa `traLoi`, không nới kỳ vọng.

- [ ] **Step 3: Commit răng (ảnh để S4 ghi)**

```bash
git add _acceptance/kara-gop-y-luot-2/rang/man.mjs
git commit -m "test(acceptance): răng E15c — mười trạng thái vùng Kara ở 1440 và 390 trên phiên đo" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 21: Cổng cuối trước S4

`independent: false` (cần Task 1–20) · Evals: tất cả, chạy lại theo khoá

**Files:** không tạo, không sửa.

- [ ] **Step 1: Mười bốn khoá `k3_*` dạng bài**

Run:

```bash
for k in k3_khung k3_tai_loi k3_nho_loi k3_qua_han k3_tat k3_loi_dong k3_can_chinh k3_hai_hoan k3_chip k3_nhieu_kr_ui k3_cau_dan k3_neo_kr k3_so_nhieu k3_nhieu_kr; do
  lenh=$(bun -e "console.log(Bun.YAML.parse(await Bun.file('_acceptance/config.yaml').text()).executors.test['$k'])")
  bash -c "$lenh" >/dev/null 2>&1 && echo "$k xanh" || echo "$k DO"
done
```

Expected: 14 dòng `… xanh`.

- [ ] **Step 2: Bài cũ quanh vùng sửa**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho.dom.tsx ./test/the-gop-y-okr.dom.tsx ./test/okr-sheet.dom.tsx ./test/hop-thoai-kr-sau-thu.dom.tsx ./test/soan-okr.dom.tsx ./test/soan-okr-trang.dom.tsx ./test/khung-okr-truoc-r1.dom.tsx ./test/okr-to-chuc-va.dom.tsx && bun test ./test/messages-guard.spec.ts && cd ../../packages/ui && bun test --preload ./test/setup-dom.ts ./test/nen-kara.dom.tsx`
Expected: PASS.

- [ ] **Step 3: Năm lệnh của kho**

Run (từ gốc kho, lần lượt): `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`
Expected: cả năm thoát 0. `lint:slop` đỏ ở tham số `unknown` không tên `cause` hay ở `typeof` thì sửa theo Global Constraints, không tắt luật.

- [ ] **Step 4: Bốn răng kịch bản**

Run: `bun _acceptance/kara-gop-y-luot-2/rang/ngay-gio.mjs && bun _acceptance/kara-gop-y-luot-2/rang/dot-bien.mjs && node _acceptance/kara-gop-y-luot-2/rang/ranh-gioi.mjs && bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/kara-gop-y-luot-2/rang/man.mjs"`
Expected: `ngay-gio: … 14/14 …`, `dot-bien: 8/8 vet bi bat, tep tra lai nguyen`, `ranh-gioi: <n> tep, 0 ngoai (neo nhanh-mo)`, `KET LUAN: … 0 SAI — ma thoat 0`.

- [ ] **Step 5: Cây sạch**

Run: `git status --short`
Expected: chỉ có ảnh mới trong `_acceptance/kara-gop-y-luot-2/evidence/` (S4 ghi vào hồ sơ); không tệp nguồn nào đổi sau `dot-bien.mjs`.

---

## Bản đồ AC → Task → Eval

| AC | Mục lộ trình | Task | Eval |
|---|---|---|---|
| AC-1 | khung chung + G7 | 1, 2 | E1 |
| AC-2 | Ngoài-14 | 3 | E2 |
| AC-3 | Ngoài-15 | 4 | E3 |
| AC-4 | Ngoài-13 | 5 | E4 |
| AC-5 | KL Ngoài-4 | 6 | E5 |
| AC-6 | C4e | 7 | E6 |
| AC-7 | Ngoài-11 | 9 | E7 |
| AC-8 | KL Ngoài-16 | 8 | E8 |
| AC-9 | KL Ngoài-1 | 10 | E9 |
| AC-10 | #5 | 11, 12 | E10, E10b |
| AC-11 | G1 | 13 | E11 |
| AC-12 | G5 | 14 | E12 |
| AC-13 | G4 | 15 | E13 |
| AC-14 | G6 | 16, 17 | E14 |
| AC-15 | ranh giới + màn thật | 18, 19, 20, 21 | E15, E15b, E15c |

## Tự soát

- **Phủ spec:** mười bốn bước «Cách sửa» của design doc đều có task (bảng trên); bảng UX-STATE-TABLE chín trạng thái + «người phụ trách hai KR» là mười trạng thái của Task 20; Q1–Q4 và «Căn chỉnh ở client» của sổ quyết định nằm ở Task 16, 11–12, 5, 2, 9.
- **Không chỗ trống:** mỗi bước code có code; ba bước có nhánh «nếu … thì» (Task 11 Step 7, Task 16 Step 3, Task 20 Step 2) đều nói đúng việc làm và ranh giới được chạm.
- **Tên khớp nhau:** `loiCoMa`/`maLoi` (Task 4) được Task 7 dùng lại; `baoLoi`/`xoaLoi` (Task 7) được Task 8, 9 dùng; `coHoanTac`/`trangThai`/`hoanTac` (Task 8) được Task 9 mở rộng; `thayDocLuc`/`nhipHoiLai` (Task 5) được Task 10 dùng; `KhoiLoiKara` (Task 4) được Task 5, 6 dùng; chuỗi của tám vết ở Task 18 chép từ code của Task 2, 3, 5, 7, 8, 9, 11, 15.
- **Review Focus:** năm dòng, mỗi dòng có bài ở task sở hữu (Task 3, 6, 9, 15, 5).
