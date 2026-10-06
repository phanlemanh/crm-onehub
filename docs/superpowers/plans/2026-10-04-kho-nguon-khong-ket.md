# Nguồn không kẹt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nguồn của Kho tài liệu không bao giờ kẹt mãi ở «đang đọc»; hộp chèn liên kết báo lỗi tìm thay vì «không trang nào khớp»; bài kiểm đo tiền tố workspace thật.

**Architecture:** `chaySoanTuNguon` bắt lỗi bị ném và đưa nguồn về `LOI`. Lưới `dongNguonMoCoi` (câu `UPDATE` ở `@crm/db`, gọi trên nhịp dispatch của agent) đưa nguồn `CHO_DOC` không còn việc mở về `LOI`. `NutLienKetTrang` giữ cờ lỗi theo lượt tìm mới nhất.

**Tech Stack:** Bun 1.3.12, Prisma 7 (Postgres), eve, React 19, happy-dom, Playwright (qua `mot-luot.sh`).

**Spec:** `docs/superpowers/specs/2026-10-04-kho-nguon-khong-ket-design.md` · hợp đồng `_acceptance/kho-nguon-khong-ket/contract.md` · evals `_acceptance/kho-nguon-khong-ket/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không migration, không chạm `packages/db/prisma/**` (giữ T2).
- Hằng có thể chỉnh nằm trong module cấu hình của vùng (`TAI_LIEU_AGENT` ở `apps/agent/agent/lib/tai-lieu-config.ts`).
- Hai câu lý do nguyên văn: `docLoi` = «Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.»; `moCoi` = «Máy soạn dừng giữa chừng — bấm Soạn lại để thử lần nữa.»
- Câu `loiTim`: vi «Chưa tìm được trang — thử gõ lại.», en «Couldn't search pages — try typing again.»
- Mọi `bun run test` ghi ra tệp, đọc bằng grep (ống ra của công cụ hay bị cắt).
- Không dựng máy chủ dev tay; đo màn chỉ qua `mot-luot.sh`.

## Review Focus

1. Nguồn đã soạn (`DA_SOAN`) và `CAN_GO_TAY` không bao giờ bị lưới lật về `LOI` — Task 2, ô E2.
2. Lỗi gốc của lưu trữ (URL ký, token) không lọt vào `lyDo` người đọc thấy — Task 1, ô (a).
3. Lượt tìm cũ bị từ chối về muộn không bật câu lỗi đè lên danh sách đúng — Task 3, ô (5).
4. Một việc vừa được claim (lease sống) không bị lưới tranh — Task 2, ô lease sống.
5. Gõ lùi dưới 2 chữ sau lỗi hiện «Gõ ít nhất hai chữ.» chứ không còn câu lỗi — Task 3, ô (6).

---

### Task 1: Bắt lỗi ở máy soạn (AC-1, E1) — `independent: true`

**Files:**
- Modify: `apps/agent/agent/lib/tai-lieu-config.ts` (`lyDo` thêm `docLoi`, `moCoi`)
- Modify: `apps/agent/agent/lib/tai-lieu-soan.ts:37-76`
- Test: `apps/agent/test/tai-lieu-soan.integration.spec.ts` (describe `kn-bat-loi`)

**Interfaces:**
- Produces: `TAI_LIEU_AGENT.lyDo.docLoi: string`, `TAI_LIEU_AGENT.lyDo.moCoi: string`; `chaySoanTuNguon(task, kho)` không bao giờ reject.

- [ ] **Step 1: Viết ca đỏ `kn-bat-loi`** — ma trận 7 ô viết trước, gieo bằng `gieoNguon`/`gieoViec` (xem dòng sổ `fix` S2), `KhoNguon` giả có `doc` ném/trả null/trả byte lệch:

```ts
const CAU_DOC_LOI = "Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.";
const O = [
	{ ten: "a-kho-nem", kho: khoNem(new Error("blob https://x/y?token=BIMAT")), muc: "LOI", lyDo: CAU_DOC_LOI },
	{ ten: "b-docchu-nem", byte: new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0xff]), docChuNem: true, muc: "LOI", lyDo: CAU_DOC_LOI },
	{ ten: "c-lanh", byte: docxTu(DOAN_QUYET_DINH), muc: "CHO_SOAN", lyDo: null },
	{ ten: "d-khong-tai", kho: khoTraNull(), muc: "LOI", lyDo: LY_DO.khongTai },
	{ ten: "e-bam-lech", bamKhai: "0".repeat(64), muc: "LOI", lyDo: LY_DO.bamLech },
	{ ten: "f-can-go-tay", byte: pdfQuet(), muc: "CAN_GO_TAY", lyDo: "tu-bo-boc-chu" },
	{ ten: "g-thieu-quy-tac", xoaQuyTac: true, muc: "LOI", lyDo: LY_DO.thieuQuyTac },
] as const;
```

Mỗi ô: `await expect(chaySoanTuNguon(task, kho)).resolves.toBeUndefined()`; đọc lại nguồn và việc; ô (a)/(b) kiểm `lyDo === CAU_DOC_LOI`, `!lyDo.includes("BIMAT")`, `!lyDo.includes("https://")`, `viec.finishedAt !== null`, `viec.outcome === lyDo`; ô (d)–(g) kiểm `lyDo !== CAU_DOC_LOI`. Thông điệp ghim khi sai: `kn-bat-loi: nguon van CHO_DOC sau khi doc tep nem`, `kn-bat-loi: lyDo lo thong diep loi goc`, `kn-bat-loi: nuot nhanh thieuQuyTac`, `kn-bat-loi: lyDo lech cau da hua`. Ô (b): nếu không có byte làm `docChu` ném thật thì dùng `spyOn` trên module `tai-lieu-doc-chu` để `docChu` ném.

- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd apps/agent && bun test test/tai-lieu-soan.integration.spec.ts -t kn-bat-loi" > /tmp/kn1.log 2>&1; grep -E '\(fail\)|kn-bat-loi' /tmp/kn1.log` → ô (a), (b) đỏ «nguon van CHO_DOC».

- [ ] **Step 3: Cài**

```ts
docLoi: "Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.",
moCoi: "Máy soạn dừng giữa chừng — bấm Soạn lại để thử lần nữa.",
```

`chaySoanTuNguon`: sau `update` đặt `CHO_DOC`, chuyển phần còn lại vào `docVaChuyen(task, nguon, kho)`; bọc lời gọi:

```ts
try {
	await docVaChuyen(task.id, nguon, kho);
} catch (loi) {
	console.error("soan-tu-nguon: doc nguon loi", { nguonId: nguon.id, loi });
	await ketThuc(task.id, nguon.id, "LOI", LY_DO.docLoi);
}
```

`docVaChuyen` giữ nguyên mọi `return ketThuc(...)` của các ca đã có.

- [ ] **Step 4: Chạy lại, xanh 7/7.** Phá-thử trong bản sao `.acceptance-runs/kho-nguon-khong-ket/sao-e1/` (symlink `node_modules`): bỏ `try` → đỏ đúng thông điệp ghim; `LY_DO.docLoi` → `String(loi)` → đỏ «lo thong diep»; sửa một chữ hằng → đỏ «lech cau da hua».
- [ ] **Step 5: Commit** `feat(agent): máy soạn đưa nguồn về LOI khi đọc tệp ném lỗi`.

### Task 2: Lưới nguồn mồ côi + Soạn lại (AC-2, AC-3; E2, E3) — `independent: false` (dùng hằng của Task 1)

**Files:**
- Create: `packages/db/src/tai-lieu-nguon-mo-coi.ts`; Modify: `packages/db/package.json` (subpath `./tai-lieu-nguon-mo-coi`, chỉ thêm)
- Modify: `apps/agent/agent/lib/tai-lieu-phien.ts` (bọc `dongNguonMoCoi()` truyền `LY_DO.moCoi`)
- Modify: `apps/agent/agent/schedules/dispatch.ts` (gọi cạnh `dongMaySoanQuaHan()`)
- Create: `_acceptance/kho-nguon-khong-ket/rang/dem-ket.ts` (chỉ hằng `MOC_KET_MS` ở task này; thân ở Task 5)
- Test: `apps/agent/test/tai-lieu-nguon-mo-coi.integration.spec.ts`; `apps/api/test/tai-lieu-nguon.spec.ts` (describe `kn-soan-lai`)

**Interfaces:**
- Consumes: `TAI_LIEU_AGENT.lyDo.moCoi`, `chaySoanTuNguon` (Task 1).
- Produces: `dongNguonMoCoi(client: PrismaClient | Tx, lyDo: string): Promise<number>` ở `@crm/db/tai-lieu-nguon-mo-coi`; agent `dongNguonMoCoi(): Promise<number>`; `MOC_KET_MS = 30 * 60_000`.

- [ ] **Step 1: Viết ca đỏ** — ma trận 10 ô của E2, đặt việc bằng `claimDue`, `retireExhausted`, `completeTask` thật; ô «chờ lượt» = `leasedUntil` quá khứ, `attempts` 1; ô «không có việc» = xoá hàng việc. Kỳ vọng viết trước:

```ts
const KY_VONG = {
	"CHO_DOC+lease": "CHO_DOC", "CHO_DOC+cho": "CHO_DOC", "CHO_DOC+nghi": "LOI",
	"CHO_DOC+dong": "LOI", "CHO_DOC+khong": "LOI", "CHO_SOAN": "CHO_SOAN",
	"DANG_SOAN": "DANG_SOAN", "LOI-cu": "LOI", "DA_SOAN": "DA_SOAN", "CAN_GO_TAY": "CAN_GO_TAY",
} as const;
```

Ba ô về `LOI` có `lyDo === "Máy soạn dừng giữa chừng — bấm Soạn lại để thử lần nữa."`; bốn ô giữ `lyDo` cũ; hàm trả 3; lượt hai trả 0. Ca nhịp thật: `dispatch.run({ receive: async () => ({}), waitUntil, appAuth: null })` rồi `Promise.allSettled` (mẫu ở `zalo-qua-webhook.integration.spec.ts:93-102`). Ca cận: `expect(DIRECT_KINDS).toContain("soan-tu-nguon")` và `DISPATCH.visible.leaseMs * MAX_ATTEMPTS + MAX_ATTEMPTS * 60_000 <= MOC_KET_MS`. Ca `kn-soan-lai` (agent): nguồn `LOI` do Task 1 (kho ném) → tạo việc mới bằng `{ nguonId }` đi qua `parseSoanTuNguonPayload` → `chaySoanTuNguon` với kho lành → `CHO_SOAN`.

Ca API `kn-soan-lai`: `taiLen` thật → đóng việc bằng `db.agentTask.updateMany` → `dongNguonMoCoi(db, CAU_MO_COI)` thật → nguồn `LOI` lyDo moCoi; ô thứ hai đặt `LOI` lyDo docLoi; với mỗi ô `goi("taiLieuNguon.soanLai", …, "tao")` → ok, `CHO_DOC`, `lyDo` null, đúng một việc mở có `payload.nguonId`. Thông điệp ghim: `kn-mo-coi: dong nguon co viec lease song`, `kn-mo-coi: doi trang thai CHO_SOAN`, `kn-mo-coi: doi trang thai nguon da soan`, `kn-mo-coi: lyDo lech cau da hua`, `kn-soan-lai: nguon LOI khong soan lai duoc`.

- [ ] **Step 2: Chạy, thấy đỏ** (module chưa có).
- [ ] **Step 3: Cài**

```ts
import type { PrismaClient } from "./generated/prisma/client";

export async function dongNguonMoCoi(
	client: Pick<PrismaClient, "$executeRaw">,
	lyDo: string,
): Promise<number> {
	return client.$executeRaw`
		UPDATE "taiLieuNguon" AS n
		SET "trangThai" = 'LOI', "lyDo" = ${lyDo}
		WHERE n."trangThai" = 'CHO_DOC'
			AND NOT EXISTS (
				SELECT 1 FROM "agentTask" AS t
				WHERE t.kind = 'soan-tu-nguon'
					AND t."finishedAt" IS NULL
					AND t.payload->>'nguonId' = n.id
			)
	`;
}
```

Agent: `export const dongNguonMoCoi = () => dongNguonMoCoiDb(db, LY_DO.moCoi);` — thêm vào danh sách `Promise.all` của `schedules/dispatch.ts` ngay sau `dongMaySoanQuaHan()`.

- [ ] **Step 4: Chạy lại, xanh.** Phá-thử trong bản sao: bỏ `NOT EXISTS` → đỏ «lease song»; bỏ lọc `CHO_DOC` → đỏ «CHO_SOAN»; đổi thành `NOT IN ('CHO_SOAN','DANG_SOAN','LOI')` → đỏ «nguon da soan»; sửa chữ hằng → đỏ «lech cau».
- [ ] **Step 5: Commit** `feat(agent): lưới đưa nguồn mồ côi CHO_DOC về LOI trên nhịp dispatch`.

### Task 3: Hộp chèn liên kết báo lỗi tìm + chữ (AC-4, AC-5; E4, E5) — `independent: true`

**Files:**
- Modify: `packages/ui/src/components/trinh-soan-lien-ket-trang.tsx` (cờ `loi`, trường `loiTim`)
- Modify: `apps/app/lib/messages/tai-lieu.ts` (`soan.lienKetTrang.loiTim` en/vi — chỉ thêm)
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/man-soan.tsx:267-272` (truyền `loiTim`)
- Test: `packages/ui/test/trinh-soan-lien-ket.dom.tsx` (describe `kn-loi-tim`); Create `apps/app/test/tai-lieu-chu-lien-ket.spec.ts`

**Interfaces:**
- Produces: `NhanLienKetTrang = { nut; tim; goThem; khongCo; loiTim }`.

- [ ] **Step 1: Viết ca đỏ** — `timTrang` điều khiển được: mỗi lượt trả một `Promise` kèm `giai(ds)`/`tuChoi()`. Bảy ô viết trước theo E4; đọc `textContent` của `[cmdk-empty]`, đếm `[data-goi-y-trang]`. Nhãn test: `loiTim: "Lỗi tìm (test)."` khác mọi trường khác. Ghim: `kn-loi-tim: loi tim hien 'khong co trang nao khop'`, `kn-loi-tim: luot cu ve muon bat cau loi`, `kn-loi-tim: cau loi de go them`. `tai-lieu-chu-lien-ket.spec.ts`: `taiLieuMessages("vi").soan.lienKetTrang.loiTim` và `("en")` bằng hai câu viết sẵn; tập khoá hai bên bằng nhau; ghim `kn-chu: thieu loiTim o en`.
- [ ] **Step 2: Chạy, thấy đỏ.**
- [ ] **Step 3: Cài**

```tsx
const [loi, setLoi] = useState(false);
const go = (chu: string) => {
	setQ(chu);
	setLoi(false);
	moiNhat.current = chu;
	if (chu.trim().length < TAI_LIEU.tim.toiThieu) {
		setDs([]);
		return;
	}
	void timTrang(chu).then(
		(ra) => {
			if (moiNhat.current === chu) setDs(ra);
		},
		() => {
			if (moiNhat.current !== chu) return;
			setDs([]);
			setLoi(true);
		},
	);
};
```

`CommandEmpty`: `q.trim().length < TAI_LIEU.tim.toiThieu ? nhan.goThem : loi ? nhan.loiTim : nhan.khongCo`. `doiMo(false)` đã gọi `go("")` nên cờ tắt khi đóng. Thêm `loiTim` vào `NHAN_LIEN_KET_TRANG` của test cũ.

- [ ] **Step 4: Chạy lại xanh** (`l4a_loi_tim`, `l4a_chu`, `messages-guard`). Phá-thử: bỏ `setLoi(true)` → đỏ «khong co trang nao khop»; bỏ `if (moiNhat.current !== chu) return;` → đỏ «luot cu»; xét `loi` trước độ dài → đỏ «de go them»; xoá `loiTim` en → đỏ «thieu loiTim o en».
- [ ] **Step 5: Commit** `feat(ui): hộp chèn liên kết báo lỗi tìm trang`.

### Task 4: Ca tiền tố workspace (AC-6, E6) — `independent: false` (sau Task 3)

**Files:** Test: `apps/app/test/tai-lieu-soan.dom.tsx` (describe `kn-tien-to`).

- [ ] **Step 1:** Đổi `useParams` của `mock.module("next/navigation")` thành đọc biến `let slugWs = "ws"`; ca mới đặt `slugWs = "kho-thu"`, thêm `taiLieu.tim.queryOptions` vào `trpc` giả trả `{ rows: [{ slug: "quy-dinh-moi", ten: "Quy định mới" }] }` (không có `duong`). Mở `ManSoan`, bấm nút liên kết, gõ «quy», chọn dòng, bấm lưu/gửi; đọc markdown gửi vào mutation. Kỳ vọng chứa `(/kho-thu/tai-lieu/quy-dinh-moi)` và không chứa `/ws/`; ghim `kn-tien-to: href thieu tien to /kho-thu/`. `afterEach` trả `slugWs = "ws"`.
- [ ] **Step 2:** Chạy xanh (code đã đúng); phá-thử trong bản sao: `duong: duongTrang(r.slug)` → đỏ đúng thông điệp ghim.
- [ ] **Step 3: Commit** `test(app): ca chèn liên kết đo tiền tố workspace thật`.

### Task 5: Thước `dem-ket` (AC-8, E8) — `independent: false` (sau Task 1, 2)

**Files:** `_acceptance/kho-nguon-khong-ket/rang/dem-ket.ts`, `_acceptance/kho-nguon-khong-ket/rang/dem-ket.spec.ts`.

**Interfaces:** `demKet(client, bayGio = new Date()): Promise<{ ket30: Partial<Record<"CHO_DOC"|"CHO_SOAN"|"DANG_SOAN", number>>; loi: Record<string, number> }>`; chạy như script (`import.meta.main`) in JSON.

- [ ] **Step 1:** Ca viết trước 10 nguồn của E8, so `toEqual`, ảnh chụp trước/sau bằng nhau. Ghim `kn-dem-ket: ket30 sai o CHO_DOC`, `kn-dem-ket: ket30 sai o DANG_SOAN`.
- [ ] **Step 2: Cài** — một `$queryRaw` chỉ `SELECT`: `CHO_DOC`/`CHO_SOAN` nối việc `soan-tu-nguon` mới nhất (`MAX("createdAt")` theo `payload->>'nguonId'`), `DANG_SOAN` theo `soanLuc`, so `bayGio - MOC_KET_MS`; `LOI` nhóm theo `lyDo` (khoá `docLoi`/`moCoi` theo hai câu; lý do khác giữ nguyên chữ). Import tương đối tới `packages/db/src` (rang không phụ thuộc gói).
- [ ] **Step 3:** Xanh; phá-thử đổi mốc 60 phút → đỏ ghim; tính `DANG_SOAN` theo việc → đỏ ghim.
- [ ] **Step 4: Commit** `test(acceptance): thước dem-ket cho ngưỡng nguồn kẹt`.

### Task 6: Đo màn hộp liên kết lỗi (AC-7, E7u) — `independent: false` (sau Task 3)

**Files:** `_acceptance/kho-nguon-khong-ket/rang/man-lien-ket-loi.mjs`.

- [ ] **Step 1:** Theo mẫu `_acceptance/tro-ly-doc-kho/rang/man-hoi.mjs` và thư viện `_acceptance/kho-tai-lieu/rang/man-lib.mjs` (`moDo`, `chay`, `cho`). Gieo một trang đã duyệt «Quy định nghỉ phép» qua đường duyệt thật; đăng nhập `dev:session`; bốn bước của E7u; `page.route("**/taiLieu.tim**", r => r.abort())` ở bước 2–3, `page.unroute` ở bước 4; chữ đọc bằng `innerText` của `[role=dialog]`/popover; khổ 390 kiểm `scrollWidth <= clientWidth`; ảnh vào `BANG_CHUNG`. `--chieu-do` bỏ chặn route ở bước 2 → in `buoc 2: khong thay cau loi`, mã 1.
- [ ] **Step 2:** Chạy `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/kho-nguon-khong-ket/rang/man-lien-ket-loi.mjs"` → 4 dòng `buoc N: dat`; chạy `--chieu-do` → mã 1 đúng thông điệp.
- [ ] **Step 3: Commit** `test(acceptance): đo màn hộp chèn liên kết khi tìm lỗi`.

### Task 7: Tài liệu + kiểm toàn kho — `independent: false` (cuối)

- [ ] `docs/agent.md` mục «Chỗ rẽ: Máy soạn của Kho tài liệu»: thêm hai gạch «Đọc tệp ném lỗi thì nguồn về `LOI` ngay (`docLoi`)» và «Lưới `dongNguonMoCoi` trên nhịp dispatch: nguồn `CHO_DOC` không còn việc mở về `LOI`; cận 3 × (6 + 1) phút».
- [ ] Chạy năm lệnh chứng (`test`, `check-types`, `lint`, `lint:slop`, `build`), mỗi lệnh ghi ra tệp.
- [ ] Đặt contract `status: implemented`, commit, vào S4.
