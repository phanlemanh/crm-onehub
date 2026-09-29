# Tìm và điều hướng kho tài liệu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lượt 3 của Kho tài liệu — tìm ⌘K có dấu hay không dấu, «Trang nhắc tới trang này» kèm câu, lọc theo đơn vị/loại/chủ, tab Sức khoẻ, dòng «N bản đề xuất chờ bạn duyệt» trong nhắc sáng, chèn liên kết tới trang, và sửa hai hạn chế lượt 1 (`|` trong ô bảng, trần 25 dòng).

**Architecture:** Không migration. Tìm đọc cột `timKiem` đã ghi lúc duyệt bằng `to_tsquery('simple', unaccent(…))`; «Trang nhắc tới» và Sức khoẻ đọc `taiLieuLienKet` (thay trọn lúc duyệt) và bản đang dùng. Luật «ai duyệt được» chuyển sang `packages/db` để tab «Chờ duyệt», nhắc sáng và Tổng quan đếm bằng một hàm. Giao diện ghép từ `@crm/ui` có sẵn.

**Tech Stack:** Bun 1.3.12, NestJS + nestjs-trpc, Prisma 7 + Postgres (`unaccent`), Next.js App Router, Tiptap 3 + `@tiptap/markdown`, nuqs, eve (`apps/agent`).

**Spec:** `docs/superpowers/specs/2026-09-29-tim-va-dieu-huong-kho-design.md` · hợp đồng `_acceptance/tim-va-dieu-huong-kho/contract.md` · evals `_acceptance/tim-va-dieu-huong-kho/evals.yaml`.

## Global Constraints

- Không chú thích trong mã, không `console.log` (AGENTS.md).
- Không chạm `packages/db/prisma` — chạm là lượt thành T3 và phải dừng trình người.
- Hằng tinh chỉnh được vào `apps/api/src/tai-lieu/tai-lieu-config.ts` (`TAI_LIEU_API`) hoặc `TAI_LIEU` ở `packages/validation/src/tai-lieu.ts`; không số thần.
- Giao diện chỉ từ `@crm/ui` theo subpath; không `className` đổi màu/góc; `<table>`, `ul divide-y`, chấm màu tự dựng bị cấm (`docs/design.md`).
- Chữ trên màn sống ở `apps/app/lib/messages/*.ts` (vi + en); khoá mới qua `apps/app/test/messages-guard.spec.ts` (hàm ghim ở `GHIM`, chữ không dấu ở `KHONG_DAU`).
- Dữ liệu người nhập (tên trang, câu trích) mang `translate="no"`.
- Trần: tìm 20 dòng, «trang nhắc tới» 100 dòng, mỗi danh sách Sức khoẻ 200 dòng, trang đề xuất 25 dòng, truy vấn 2–200 ký tự.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, bản sao phá đỏ với thông điệp ghim (MEASURE-BIRTH-CLAUSE).
- Test API chạy qua `bun run test -- "cd apps/api && bun test <tệp> -t <tên>"` (kho riêng mỗi lượt); test agent thêm `TZ=Asia/Ho_Chi_Minh`; `setSystemTime` luôn có `afterEach(() => setSystemTime())`.
- Tên `describe` là slug kebab, mọi `test` mở đầu `<slug>:` để `-t` lọc được.
- `apps/api/src/generated/server.ts` sinh lại bằng `cd apps/api && bun run trpc:generate` sau mỗi thay đổi thủ tục, và commit.

## Review Focus

1. Truy vấn có chữ Việt NFD (dán từ Word cũ) — người mong ra cùng kết quả như NFC → Task 4 chuẩn NFC truy vấn trước khi tách từ, có ca NFD trong `tim-ma-tran`.
2. Truy vấn mang ký tự đặc biệt của tsquery (`&`, `|`, `!`, `:`, `(`) — người mong không lỗi 500 → Task 1 `dungTruyVan` chỉ giữ `[\p{L}\p{N}]+`, có ca «a & b | c:*» trong test đơn vị.
3. Trang nguồn nhắc đích bằng liên kết nằm trong ô bảng hay tiêu đề — người mong câu ngữ cảnh là chữ ô hay chữ tiêu đề, không phải cả bảng → Task 1 `cauChuaLienKet` lấy khối gần nhất chứa liên kết (ô, mục, đoạn, tiêu đề), có ca ô bảng.
4. Quản trị đổi vai thành thành viên giữa hai lần nhắc — người mong số sáng hôm sau chỉ còn trang mình làm chủ → Task 3 hàm đếm đọc vai lúc chạy, có ca đổi vai trong `nhac-sang`.
5. Kho chưa có trang nào đã duyệt — người mong ⌘K không hiện nhóm «Tài liệu», Sức khoẻ ghi «Không có trang nào.» từng khối, không lỗi → Task 6 ca kho rỗng, Task 10 ca `rows` rỗng.

---

## Bản đồ tệp

| Tệp | Việc |
| --- | --- |
| `packages/validation/src/tai-lieu-tim.ts` (mới) | `dungTruyVan`, `boDauTungKyTu`, `doanTrich` — thuần, không DB |
| `packages/validation/src/tai-lieu-markdown.ts` | `chuThuong`, `cauChuaLienKet`; bảng thoát `|` |
| `packages/db/src/tai-lieu-quyen.ts` (mới) | điều kiện thấy/duyệt, `demChoDuyet` |
| `packages/db/src/tai-lieu-nhac.ts` (mới) | `viecTaiLieuCanNhac` |
| `packages/db/src/onboarding-nhac.ts` | gộp loại `tai-lieu-cho-duyet` |
| `packages/validation/src/nhac-ke-hoach.ts` | nhánh `mucNhac` mới |
| `apps/api/src/tai-lieu/tai-lieu-tim.service.ts` (mới) | `tim`, `nhacToi`, `sucKhoe`, `boLoc` |
| `apps/api/src/tai-lieu/tai-lieu.{service,router,contracts}.ts`, `quyen.ts`, `tai-lieu-config.ts` | lọc, phân trang, thủ tục mới, gọi luật chung |
| `apps/api/src/dashboard/*` | dòng Kho tài liệu trên Tổng quan |
| `apps/agent/agent/lib/{tin-nhac,nhac-ke-hoach}.ts` | dòng tin, đường mở |
| `packages/ui/src/components/trinh-soan*.tsx` | nút «Liên kết tới trang» |
| `apps/app/components/crm/quick-switcher.tsx`, `app/(app)/[slug]/layout.tsx` | nhóm «Tài liệu», gắn cho vai okr |
| `apps/app/app/(app)/[slug]/tai-lieu/**` | lọc, Chờ duyệt phân trang, tab Sức khoẻ, khối nhắc tới, chèn liên kết |
| `_acceptance/tim-va-dieu-huong-kho/rang/man-tim.mjs`, `man-suc-khoe.mjs` | hai phép đo màn |

S3 chạy **tuần tự trong vòng chính**: Task 4–7 cùng sửa `tai-lieu.service.ts`/`contracts.ts`, Task 10–13 cùng sửa màn Kho. Không task nào `independent: true` với nhau theo nghĩa chạy song song an toàn, trừ Task 1 và Task 2.

---

### Task 1: Hàm thuần cho tìm và câu ngữ cảnh

`independent: true` · phục vụ E1, E5 (nền)

**Files:**
- Create: `packages/validation/src/tai-lieu-tim.ts`
- Modify: `packages/validation/src/tai-lieu-markdown.ts` (thêm `chuThuong`, `cauChuaLienKet`)
- Modify: `packages/validation/package.json` (export `./tai-lieu-tim`)
- Test: `packages/validation/test/tai-lieu-tim.spec.ts`

**Interfaces:**
- Produces:
  - `dungTruyVan(q: string): { tsquery: string; tu: string[] } | null` — NFC, lower, tách `[\p{L}\p{N}]+`; < 2 ký tự chữ-số tổng → `null`; `tsquery` = `tu.join(" & ")` + `:*` ở từ cuối.
  - `boDauTungKyTu(s: string): string` — mỗi ký tự NFC → đúng một ký tự (bỏ dấu, `đ→d`, `Đ→D`, lower); độ dài bằng `s`.
  - `doanTrich(chu: string, tu: readonly string[], ben: number): { truoc: string; khop: string; sau: string } | null` — tìm lần khớp đầu tiên của một từ (từ cuối theo tiền tố) trên `boDauTungKyTu(chu)`, cắt `ben` ký tự hai bên theo ranh giới từ, trả chữ gốc có dấu.
  - `chuThuong(md: string): string` — markdown → chữ thường, khối cách nhau `\n`.
  - `cauChuaLienKet(md: string, denSlug: string): { cau: string; vanBan: string; soLan: number } | null` — khối gần nhất (ô bảng, mục danh sách, đoạn, tiêu đề) chứa lần đầu liên kết tới `denSlug`, cắt quanh `vanBan` còn ≤ `TAI_LIEU.tim.cauToiDa` (160) ký tự.
- `TAI_LIEU` thêm `tim: { toiThieu: 2, toiDa: 200, soDong: 20, benTrich: 60, cauToiDa: 160, nhacToiToiDa: 100, sucKhoeToiDa: 200 }`.

- [ ] **Step 1: Test hỏng trước**

```ts
import { describe, expect, test } from "bun:test";
import { cauChuaLienKet, chuThuong } from "../src/tai-lieu-markdown";
import { boDauTungKyTu, doanTrich, dungTruyVan } from "../src/tai-lieu-tim";

describe("tai-lieu-tim", () => {
	test("tai-lieu-tim: truy van", () => {
		expect(dungTruyVan("Quy Định")?.tsquery).toBe("quy & định:*");
		expect(dungTruyVan("a & b | c:*")?.tsquery).toBe("a & b & c:*");
		expect(dungTruyVan("q")).toBeNull();
		expect(dungTruyVan("!!!")).toBeNull();
		expect(dungTruyVan("Quy Định".normalize("NFD"))?.tsquery).toBe("quy & định:*");
	});
	test("tai-lieu-tim: bo dau giu vi tri", () => {
		const s = "Điều 3 — Hoa hồng";
		expect(boDauTungKyTu(s)).toBe("dieu 3 — hoa hong");
		expect(boDauTungKyTu(s).length).toBe(s.length);
	});
	test("tai-lieu-tim: doan trich khop tu", () => {
		const d = doanTrich("Chính sách hoa hồng cho đối tác", ["hoa", "ho"], 60);
		expect(d?.khop).toBe("hoa");
		expect(`${d?.truoc}${d?.khop}${d?.sau}`).toBe("Chính sách hoa hồng cho đối tác");
	});
	test("tai-lieu-tim: cau chua lien ket o bang", () => {
		const md = "| A | B |\n| --- | --- |\n| xem [quy định](/ws/tai-lieu/d) | y |\n";
		expect(cauChuaLienKet(md, "d")).toEqual({ cau: "xem quy định", vanBan: "quy định", soLan: 1 });
		expect(chuThuong("## Tiêu đề\n\nĐoạn **đậm**.")).toBe("Tiêu đề\nĐoạn đậm.");
	});
});
```

- [ ] **Step 2:** `cd packages/validation && bun test test/tai-lieu-tim.spec.ts` → FAIL «Cannot find module ../src/tai-lieu-tim».
- [ ] **Step 3: Cài**

```ts
import { chuanNfc, TAI_LIEU } from "./tai-lieu";

const TU = /[\p{L}\p{N}]+/gu;

export function boDauTungKyTu(s: string): string {
	return Array.from(s, (c) =>
		c.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().slice(0, 1) || c,
	).join("");
}

export function dungTruyVan(q: string): { tsquery: string; tu: string[] } | null {
	const tu = (chuanNfc(q).toLowerCase().slice(0, TAI_LIEU.tim.toiDa).match(TU) ?? []);
	if (tu.join("").length < TAI_LIEU.tim.toiThieu) return null;
	return { tsquery: `${tu.join(" & ")}:*`, tu };
}
```

`doanTrich`: duyệt `boDauTungKyTu(chu)` tìm `boDauTungKyTu(tu[i])` với ranh giới đầu từ (`\p{L}\p{N}` không đứng trước); từ không phải cuối phải có ranh giới sau; lùi/tiến tới khoảng trắng gần nhất trong `ben`. `Array.from` giữ chỉ số theo code point — mọi phép cắt dùng mảng code point, không dùng `String.slice` trên UTF-16.
`chuThuong` / `cauChuaLienKet`: đi cây `nap(md)`; khối là nút có `type` ∈ {`paragraph`, `heading`, `tableCell`, `tableHeader`, `listItem`}; chữ khối = nối `text`; liên kết so `slugTuDuongDan(href) === denSlug`.
- [ ] **Step 4:** chạy lại → PASS. Chiều đỏ: sửa tạm `doanTrich` cộng 1 vào chỉ số → test «doan trich khop tu» đỏ; hoàn lại.
- [ ] **Step 5:** `git add packages/validation && git commit -m "feat(kho-tai-lieu): hàm tìm, đoạn trích, câu chứa liên kết"`

### Task 2: Dấu `|` trong ô bảng

`independent: true` · phục vụ E10, E10d (AC-10)

**Files:**
- Modify: `packages/validation/src/tai-lieu-markdown.ts` (bảng)
- Test: `packages/ui/test/trinh-soan-khu-hoi.dom.tsx` (thêm `describe("ong-dung")`), `packages/ui/test/ong-dung-doc.dom.tsx` (mới), `packages/ui/test/fixtures/tai-lieu/ong-dung-*.md`

**Interfaces:** Produces: markdown ô bảng có `\|`; không đổi API.

- [ ] **Step 1: Test hỏng** — sáu mẫu viết trước, mỗi mẫu đi `quaTrinhSoan` (editor thật) hai lần:

```ts
const MAU_ONG = [
	{ ten: "giua", md: "| A | B |\n| --- | --- |\n| a\\|b | x |\n", o: [["A", "B"], ["a|b", "x"]] },
	{ ten: "dau", md: "| A | B |\n| --- | --- |\n| \\|x | y |\n", o: [["A", "B"], ["|x", "y"]] },
	{ ten: "cuoi", md: "| A | B |\n| --- | --- |\n| x\\| | y |\n", o: [["A", "B"], ["x|", "y"]] },
	{ ten: "go-nguyen-van", md: "| A | B |\n| --- | --- |\n| \\\\\\| | y |\n", o: [["A", "B"], ["\\|", "y"]] },
	{ ten: "dam", md: "| A | B |\n| --- | --- |\n| **a\\|b** | y |\n", o: [["A", "B"], ["a|b", "y"]] },
	{ ten: "doan-van", md: "a | b\n", o: null },
] as const;
```

Mỗi mẫu 3 khẳng định: lần 2 === lần 1; số ô mỗi dòng; chữ từng ô đọc từ JSON editor sau nạp lại. Tổng 18. Mẫu gõ trong editor (không nạp markdown): chèn bảng 2×2, gõ «a|b» vào ô → md lưu chứa `a\|b`.
- [ ] **Step 2:** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/trinh-soan-khu-hoi.dom.tsx -t ong-dung` → FAIL «ong-dung: o 'a|b' tach thanh 2 o».
- [ ] **Step 3: Cài** — thay `TableKit` trong `PHAN_MO_RONG`:

```ts
import { renderTableToMarkdown, Table, TableKit } from "@tiptap/extension-table";

const BangThoatOng = Table.extend({
	renderMarkdown: (node, h) =>
		renderTableToMarkdown(node, {
			...h,
			renderChildren: (...thamSo: Parameters<typeof h.renderChildren>) =>
				h.renderChildren(...thamSo).replace(/\|/g, "\\|"),
		}),
});

TableKit.configure({ table: false }),
BangThoatOng,
```

- [ ] **Step 4:** chạy lại → 18/18 PASS; `ong-dung-doc.dom.tsx`: markdown mẫu «giua» và «go-nguyen-van» qua `MarkdownReader` và `DiffTrang` → `td` textContent `a|b`, `\|`; chiều đỏ tắt `replace` → đỏ ghim. Chạy toàn `trinh-soan-khu-hoi.dom.tsx` (12 mẫu cũ vẫn xanh).
- [ ] **Step 5:** commit `fix(kho-tai-lieu): giữ dấu | trong ô bảng khi lưu`.

### Task 3: Luật quyền chung và hàm đếm chờ duyệt

phục vụ E9b (nền của Task 6, 9)

**Files:**
- Create: `packages/db/src/tai-lieu-quyen.ts`; Modify `packages/db/package.json` (`"./tai-lieu-quyen"`)
- Modify: `apps/api/src/tai-lieu/quyen.ts` (gọi lại)
- Test: `packages/db/test/tai-lieu-quyen.spec.ts`

**Interfaces:**
- Produces (`@crm/db/tai-lieu-quyen`):
  - `type NguoiXem = { id: string; role: "owner" | "admin" | "member" | "okr" | null }`
  - `dieuKienThayDeXuat(n): Prisma.TaiLieuDeXuatWhereInput`, `dieuKienDuyetDuoc(n)`, `dieuKienThay(n): Prisma.TaiLieuTrangWhereInput` — thân chép nguyên từ `quyen.ts` hiện tại, quản trị = `owner|admin`.
  - `demChoDuyet(db: Db, n: NguoiXem): Promise<number>` — `taiLieuDeXuat.count({ where: { AND: [dieuKienDuyetDuoc(n), { trangThai: "CHO_DUYET" }] } })`.
- `apps/api/src/tai-lieu/quyen.ts` giữ `duyetDuoc`, `thayDeXuat`, `thayTrang` (thuần, không Prisma) và re-export ba hàm điều kiện từ `@crm/db/tai-lieu-quyen`; `tai-lieu.service.ts` `choToiDuyet` gọi `demChoDuyet`.

- [ ] Step 1: test `tai-lieu-quyen` gieo 1 trang chủ X, 2 CHO_DUYET, 1 TRA_LAI, 1 CU → `demChoDuyet` X = 2, admin = 2, member khác = 0. Chiều đỏ: bỏ lọc `CHO_DUYET` → «tai-lieu-quyen: X nhan 4 thay vi 2».
- [ ] Step 2: FAIL (module chưa có). Step 3: cài + sửa `quyen.ts`. Step 4: `bun run test -- "cd packages/db && bun test test/tai-lieu-quyen.spec.ts"` PASS; `bun run test -- "cd apps/api && bun test test/tai-lieu-quyen.spec.ts test/tai-lieu-khong-ro.spec.ts"` vẫn PASS.
- [ ] Step 5: commit `refactor(kho-tai-lieu): luật duyệt sang packages/db`.

### Task 4: `taiLieu.tim` và `taiLieu.nhacToi`

phục vụ E1, E3, E4b, E5

**Files:**
- Create: `apps/api/src/tai-lieu/tai-lieu-tim.service.ts` (`TaiLieuTimService`)
- Modify: `tai-lieu.contracts.ts`, `tai-lieu.router.ts`, `tai-lieu.module.ts`, `tai-lieu-config.ts`, `src/generated/server.ts`
- Test: `apps/api/test/tai-lieu-tim.spec.ts` (`tim-ma-tran`, `vai-okr`), `apps/api/test/tai-lieu-nhac-toi.spec.ts` (`nhac-toi-ma-tran`, `chen-lien-ket`)

**Interfaces:**
- Consumes: `dungTruyVan`, `doanTrich`, `chuThuong`, `cauChuaLienKet` (Task 1); `dieuKienThay` (Task 3).
- Produces (contracts):

```ts
export const taiLieuTimInput = z.object({ q: z.string().max(TAI_LIEU.tim.toiDa * 3) });
export const taiLieuTimOutput = z.object({
	rows: z.array(z.object({
		slug: z.string(), ten: z.string(), loai: z.enum(LOAI_TRANG),
		chuTrang: nguoiOutput, phienBan: z.number().int(),
		doanTrich: z.object({ truoc: z.string(), khop: z.string(), sau: z.string() }),
	})),
});
export const taiLieuNhacToiOutput = z.object({
	rows: z.array(z.object({ slug: z.string(), ten: z.string(), cau: z.string(), vanBan: z.string(), soLan: z.number().int() })),
});
```

- SQL của `tim` (Prisma `$queryRaw`, tham số hoá):

```sql
SELECT t.id, t.slug, t.ten, t.loai, t."chuTrangId", p.so, p."noiDung",
  ts_rank_cd(t."timKiem", q) AS hang,
  (to_tsvector('simple', unaccent(t.ten)) @@ q) AS trungTen
FROM "taiLieuTrang" t
JOIN "taiLieuPhienBan" p ON p.id = t."banDangDungId",
  to_tsquery('simple', unaccent(${tsquery})) q
WHERE t."timKiem" @@ q
ORDER BY trungTen DESC, hang DESC, t.ten ASC
LIMIT ${TAI_LIEU.tim.soDong}
```

- `nhacToi(nguoi, slug)`: kiểm đích qua `get` hiện có (NOT_FOUND giống hệt); `taiLieuLienKet.findMany({ where: { denSlug: slug, tuTrang: { banDangDungId: { not: null }, slug: { not: slug } } }, distinct: ["tuTrangId"] })` → đọc nội dung bản đang dùng của nguồn → `cauChuaLienKet` → xếp theo `ten`, trần 100.

- [ ] Step 1: `tim-ma-tran` theo E1 (4 trang gieo qua `taoTrang` + `duyet`, 14 truy vấn + ca NFD, 7 cặp, 3 khẳng định quan hệ mỗi dòng — dùng bảng `MA_TRAN` viết trước và đếm `expect.assertions`). `vai-okr`: `hoi("taiLieu.tim", {q:"quy dinh"}, "okr")` 200; `hoi("taiLieu.nhacToi"|"taiLieu.sucKhoe"|"taiLieu.boLoc", …, "okr")` 200 (hai thủ tục sau tới ở Task 5, 6 — ca đó thêm vào đây khi chúng có); `hoi("search.quick", {q:"ab"}, "okr")` 403 `KHONG_TRONG_PHAM_VI`. `nhac-toi-ma-tran` theo E5 (A đoạn, B mục, C ô, E tiêu đề, F hai lần chữ khác, D tự nhắc, G bản chưa duyệt; `cau` so `===` chuỗi viết trước).
- [ ] Step 2: chạy → FAIL (thủ tục chưa có). Step 3: cài service, contracts, router (`@Query` + `restMeta("GET", "/tai-lieu/tim", ["Documents"])`, `/tai-lieu/trang/{slug}/nhac-toi`), `cd apps/api && bun run trpc:generate`.
- [ ] Step 4: `bun run test -- "cd apps/api && bun test test/tai-lieu-tim.spec.ts test/tai-lieu-nhac-toi.spec.ts"` PASS. Chiều đỏ trên bản sao: bỏ `unaccent` phía truy vấn → «tim-ma-tran: 'quy dinh' không ra…»; bỏ `:*`; bỏ lọc `slug not` → «nhac-toi: trang tu nhac chinh no co dong».
- [ ] Step 5: commit `feat(kho-tai-lieu): tìm và trang nhắc tới`.

### Task 5: Lọc danh sách và `taiLieu.boLoc`

phục vụ E6 (AC-6)

**Files:** `tai-lieu.contracts.ts` (`taiLieuListInput` thêm `donViId?: ma`, `chuTrangId?: ma`), `tai-lieu.service.ts` `list`, `tai-lieu-tim.service.ts` `boLoc`, router, generated; test `apps/api/test/tai-lieu-loc.spec.ts`.

**Interfaces:** `taiLieuBoLocOutput = { donVi: {id,ten,so}[], chuTrang: {id,ten,so}[] }` — nhóm trên `dieuKienThay(nguoi)`; `facetCounts` tính trên `AND[thay, donVi?, chu?]`.

- [ ] Step 1: ma trận 8 tổ hợp × tập slug + 8 `facetCounts` (E6); `boLoc` của member khác không có đơn vị/chủ chỉ có trang chưa duyệt. Step 2 FAIL. Step 3 cài. Step 4 PASS + chiều đỏ «loc: facetCounts khong theo don vi da chon». Thêm `boLoc` vào ca `vai-okr` của Task 4. Step 5 commit `feat(kho-tai-lieu): lọc theo đơn vị và chủ trang`.

### Task 6: `taiLieu.sucKhoe`

phục vụ E7, E8 (AC-7, AC-8)

**Files:** `tai-lieu-tim.service.ts` `sucKhoe`, contracts, router, generated; `packages/db/src/onboarding-nhac.ts` dùng lại `dauNgayVN`; test `apps/api/test/tai-lieu-suc-khoe.spec.ts` (`lien-ket`, `trang-thai`).

**Interfaces:**

```ts
const dongTrang = z.object({ slug: z.string(), ten: z.string(), chuTrang: nguoiOutput });
export const taiLieuSucKhoeOutput = z.object({
	quaHan: z.object({ rows: z.array(dongTrang.extend({ xacMinhDen: z.string() })), total: z.number().int() }),
	choDuyet: z.object({ rows: z.array(dongTrang.extend({ soBan: z.number().int() })), total: z.number().int() }),
	gay: z.object({ rows: z.array(dongTrang.extend({ lienKet: z.array(z.object({ denSlug: z.string(), vanBan: z.string() })) })), total: z.number().int() }),
	chuaCo: z.object({ rows: z.array(z.object({ denSlug: z.string(), vanBan: z.string(), soTrang: z.number().int() })), total: z.number().int() }),
	moCoi: z.object({ rows: z.array(dongTrang.extend({ duyetLuc: z.string() })), total: z.number().int() }),
});
```

Tập A = trang có `banDangDungId`. Mồ côi: A không có dòng liên kết từ trang khác trong A. Gãy/Chưa có: dòng liên kết từ trang trong A có `denSlug` ∉ slug(A). Chờ duyệt: `taiLieuDeXuat` `CHO_DUYET` AND `dieuKienThayDeXuat(n)` nhóm theo trang. Quá hạn: A với `xacMinhDen < dauNgayVN(now)`.

- [ ] Step 1: `lien-ket` theo đồ thị E7 (P1..P6, N1, chua-co-a/b; so tập; người tạo N1 và member khác cùng kết quả); `trang-thai` theo E8 (đồng hồ giả 2026-10-15T23:30:00Z, bốn ngày xác minh, choDuyet chủ X và admin, mọi dòng có `chuTrang.name`); ca kho rỗng: năm danh sách `total 0`. Step 2 FAIL. Step 3 cài. Step 4 PASS + hai chiều đỏ ghim. Thêm `sucKhoe` vào `vai-okr`. Step 5 commit `feat(kho-tai-lieu): sức khoẻ kho`.

### Task 7: Phân trang đề xuất

phục vụ E11 (AC-11)

**Files:** contracts (`taiLieuProposalsInput = z.object({ nhom: z.enum(["cho","da-xu-ly"]).default("cho"), page: z.number().int().min(1).default(1), slug: z.string().optional() }).optional()`; output thêm `total`), service `proposals`, router, generated; `apps/app/app/(app)/[slug]/tai-lieu/[trang]/page.tsx` gọi `{ nhom: "cho", slug }`; test thêm `describe("de-xuat-phan-trang")` vào `apps/api/test/tai-lieu.spec.ts`.

`nhom: "cho"` → `trangThai: "CHO_DUYET"`; `"da-xu-ly"` → `{ in: ["TRA_LAI","CU"] }`; `skip/take` 25; `total` cùng `where`; `choToiDuyet` = `demChoDuyet`.

- [ ] Step 1: gieo 30 CHO_DUYET + 6 TRA_LAI (qua `traLai`) + 4 CU (duyệt bản khác cùng gốc) theo E11; Step 2 FAIL; Step 3 cài; Step 4 PASS, chiều đỏ «phan-trang: trang 2 lap lai trang 1», «nhom cho co ban CU»; chạy lại `tai-lieu-khong-ro.spec.ts` (dùng `proposals`). Step 5 commit `feat(kho-tai-lieu): phân trang bản đề xuất`.

### Task 8: Ma trận không rò

phục vụ E2 (AC-2)

**Files:** test `apps/api/test/tai-lieu-tim-khong-ro.spec.ts` (mới, dùng `tai-lieu-san.ts`).

- [ ] Step 1: bảng 72 ô viết trước theo E2 (S1–S4, D, A; kỳ vọng từng ô; đối chứng dương `tulapdung`, `rows = {A}`, `moCoi ∋ S4`). Step 2: chạy trên mã Task 4–7 → phải PASS ngay; nếu đỏ là lỗi của Task 4–7, sửa ở đó. Step 3: ba chiều đỏ (a)(b)(c) của E2 trên bản sao, ghi thông điệp. Step 4 commit `test(kho-tai-lieu): ma trận không rò bản chưa duyệt`.

### Task 9: Dòng nhắc sáng và Tổng quan

phục vụ E9, E9b (AC-9)

**Files:**
- Create: `packages/db/src/tai-lieu-nhac.ts` (+ export); Modify `packages/db/src/onboarding-nhac.ts` (`ViecNhac`, `THU_TU_NHAC` thêm `"tai-lieu-cho-duyet"` sau `"okr-theo-doi"`, `gop` thêm map thứ tư, `viecCanNhac` gọi `viecTaiLieuCanNhac`)
- Modify: `packages/validation/src/nhac-ke-hoach.ts` (`z.object({ loai: z.literal("tai-lieu-cho-duyet"), so: z.number().int().positive() }).strict()`)
- Modify: `apps/agent/agent/lib/tin-nhac.ts` (`TIEU_DE["tai-lieu-cho-duyet"] = "Kho tài liệu"`, `dongTaiLieu`: Zalo `${so}. ${n} bản đề xuất chờ bạn duyệt${url ? " — " + url : ""}`, Slack `• ${n} bản đề xuất chờ bạn duyệt — <${url}|mở tab Chờ duyệt>`; nhánh trong `dong`), `nhac-ke-hoach.ts` (`maViec`, `duongMo` → `${appUrl}/${slug}/tai-lieu?tabTaiLieu=cho-duyet`)
- Modify: `apps/agent/test/muc-nhac-okr.spec.ts` (`MAU` thêm loại mới)
- Modify: `apps/api/src/dashboard/dashboard.{service,contracts}.ts` (`taiLieuChoDuyet: z.number().int().nullable()` từ `viecCanNhac(…"truc-tiep")`), `apps/app/app/(app)/[slug]/dashboard-summary.tsx` (một `Item` «N bản đề xuất chờ bạn duyệt» dẫn tab), `apps/app/lib/messages/tong-quan.ts`
- Test: `apps/agent/test/tai-lieu-nhac.integration.spec.ts` (`nhac-sang`), `apps/api/test/tai-lieu-nhac-bang-tab.spec.ts`

**Interfaces:**
- `type ViecTaiLieu = { loai: "tai-lieu-cho-duyet"; so: number }`
- `viecTaiLieuCanNhac(db: Db, chon: { now: Date; userId?: string }): Promise<Map<string, ViecTaiLieu[]>>` — thành viên `WORKSPACE_ID` (lọc `userId`), mỗi người `demChoDuyet(db, { id, role })`; `so > 0` mới có mục.

Đường mở dùng khoá nuqs thật của tab: `SEARCH_PARAM.taiLieu.tab = "tabTaiLieu"` → `?tabTaiLieu=cho-duyet` (thiết kế viết `?tab=cho-duyet` — sửa theo khoá thật; E9 so chuỗi đường này).

- [ ] Step 1: `nhac-sang` theo E9 (X: 2 CHO_DUYET + 1 CU + 1 TRA_LAI tạo qua `tai-lieu-san`-tương đương trong agent — gieo bằng `taoDeXuatTaiLieu` của `packages/db` và cập nhật trạng thái qua cùng đường ghi của API không có sẵn ở agent: dùng `@crm/db` Prisma trực tiếp nhưng qua hàm gieo dùng chung mới `packages/db/test/tai-lieu-gieo.ts` mà Task 3 cũng dùng; admin = 3; member không duyệt được → không hàng AgentTask; Y chỉ có 1 → tin Zalo giả có dòng và đường mở; `daGui` chứa `{loai, so}`; «xong N» bị từ chối, đếm hàng trước/sau; ca đổi vai admin→member giữa hai ngày). `tai-lieu-nhac-bang-tab`: 4 người × 4 số (tab qua tRPC, `viecCanNhac` buổi sáng, `dashboard.summary.taiLieuChoDuyet`, N viết trước); quét AST `quyen.ts` không định nghĩa `where` duyệt.
- [ ] Step 2 FAIL. Step 3 cài. Step 4: `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tai-lieu-nhac.integration.spec.ts test/muc-nhac-okr.spec.ts test/ai-bao-tran.integration.spec.ts test/tra-loi-tin-nhac.integration.spec.ts"` và `bun run test -- "cd apps/api && bun test test/tai-lieu-nhac-bang-tab.spec.ts"` PASS; chiều đỏ «nhac-sang: X nhan 4 thay vi 2», «nhac-bang-tab: tab khac nhac o chu trang X».
- [ ] Step 5: commit `feat(kho-tai-lieu): dòng bản chờ duyệt trong nhắc sáng`.

Ghi chú: E9 khai tệp `apps/agent/test/tai-lieu-nhac.spec.ts`; tệp tích hợp của agent theo nếp `*.integration.spec.ts`. Giữ tên `tai-lieu-nhac.spec.ts` để khớp `config.yaml`, không đổi evals.

### Task 10: ⌘K nhóm «Tài liệu»

phục vụ E3d, E3u (AC-3)

**Files:** `apps/app/components/crm/quick-switcher.tsx` (prop `coDoiTac: boolean`; truy vấn `taiLieu.tim` song song; nhóm «Tài liệu» với `Icon Book`, tên + dòng phụ `truoc<strong>khop</strong>sau`; chọn → `router.push(url(duongTrang(slug)))`; lỗi → `CommandItem disabled` «Không tìm được lúc này. Thử lại.»; lỗi `search.quick` → ẩn nhóm đối tác), `apps/app/app/(app)/[slug]/layout.tsx` (`TimNhanhTheoVai` luôn gắn, `coDoiTac={!chiOkr(role)}`), `danh-sach.tsx` (nút «Tìm nhanh ⌘K» đặt `dialog.switcher`), `lib/messages/khung-ung-dung.ts`; test `apps/app/test/tai-lieu-cmdk.dom.tsx`.

- [ ] Step 1: ba ca E3d (member, okr `coDoiTac=false` — `search.quick` không được gọi, không `role=alert`; `taiLieu.tim` lỗi). Step 2 FAIL. Step 3 cài. Step 4 PASS + chiều đỏ «cmdk: loi tim hien thanh khong-khop». Step 5 commit `feat(kho-tai-lieu): nhóm Tài liệu trong ⌘K`.

### Task 11: Khối «Trang nhắc tới trang này»

phục vụ E5d, E5u (AC-5)

**Files:** `apps/app/app/(app)/[slug]/tai-lieu/[trang]/nhac-toi.tsx` (mới, client, `useQuery(trpc.taiLieu.nhacToi)`; `Card` + `CardTitle` «Trang nhắc tới trang này (N)»; mỗi dòng `Item asChild` → `Link` với `ItemTitle` tên và `ItemDescription` câu có `<strong>` bọc `vanBan`; rỗng → câu rỗng; lỗi → `Alert` + `Button` «Thử lại» gọi `refetch`), `man-doc.tsx` (gắn cuối `<article>`), `[trang]/page.tsx` (prefetch), `lib/messages/tai-lieu.ts` (`doc.nhacToi.*`); test `apps/app/test/tai-lieu-nhac-toi.dom.tsx`.

- [ ] Step 1: ba ca E5d. Step 2 FAIL. Step 3 cài. Step 4 PASS + chiều đỏ «man-nhac-toi: loi hien thanh rong». Step 5 commit.

### Task 12: Bộ lọc và tab «Chờ duyệt» phân trang

phục vụ E6d, E11d (AC-6, AC-11)

**Files:** `tai-lieu-search-params.ts` (thêm `donVi`, `chu` vào `SEARCH_PARAM.taiLieu` ở `lib/search-param-keys.ts`, và `pageChoDuyet`), `page.tsx` (truyền, prefetch `boLoc`), `danh-sach.tsx` (`Combobox` đơn vị, `Combobox` chủ, `ToggleGroup` loại giữ nguyên; `thamSo` giữ ba lọc, đổi lọc → `page: 1`; «Bỏ lọc»; `boLoc` lỗi → `Alert` + «Thử lại»; rỗng có lọc → `Empty` «Không có trang nào khớp bộ lọc» + «Bỏ lọc»; `ChoDuyet` gọi `proposals({ nhom: "cho", page })` + `TablePagination`), `lib/messages/tai-lieu.ts`; test `apps/app/test/tai-lieu-loc.dom.tsx`, `apps/app/test/tai-lieu-cho-duyet.dom.tsx`.

- [ ] Step 1: ca E6d (URL đổi, page về 1, «Bỏ lọc» xoá ba tham số, lỗi `boLoc`) và E11d (total 30 → `TablePagination`, trang 2 gọi `page: 2`). Step 2 FAIL. Step 3 cài. Step 4 PASS + chiều đỏ «man-loc: doi loc khong ve trang 1», «man-loc: loi bo loc hien thanh rong», «man-cho-duyet: khong co phan trang khi total > 25». Chạy `tai-lieu-nguon.dom.tsx` (gắn `DanhSach`). Step 5 commit.

### Task 13: Tab «Sức khoẻ»

phục vụ E8d, E8u (AC-7, AC-8)

**Files:** `apps/lib/tai-lieu-man.ts` `TAB_TAI_LIEU` thêm `"suc-khoe"`; `tai-lieu/suc-khoe.tsx` (mới, client: năm `Card`, `CardTitle` + `Badge` số, dòng `Item` → `Link` màn đọc, `ItemDescription` chủ trang + chi tiết; khối rỗng «Không có trang nào.»; lỗi → `Alert` «Không tải được sức khoẻ kho.» + «Thử lại»), `danh-sach.tsx` (tab mới), `page.tsx` (prefetch khi tab), messages; test `apps/app/test/tai-lieu-suc-khoe.dom.tsx`.

- [ ] Step 1: hai ca E8d. Step 2 FAIL. Step 3 cài. Step 4 PASS + chiều đỏ «man-suc-khoe: loi hien thanh rong». Step 5 commit.

### Task 14: Chèn liên kết tới trang

phục vụ E4, E4b, E4u (AC-4)

**Files:** `packages/ui/src/components/trinh-soan.tsx` (prop `timTrang?: (q: string) => Promise<readonly TrangGoiY[]>`, `export type TrangGoiY = { slug: string; ten: string; duong: string }`), `trinh-soan-thanh-cong-cu.tsx` (nút `lienKetTrang` chỉ khi có `timTrang`: `Popover` + `Command`, gõ gọi `timTrang`, Enter → có chọn chữ thì `setLink({ href: duong })`, không thì `insertContent` chữ `ten` mang mark link; Esc đóng và `editor.commands.focus()`), `NhanNutTrinhSoan` thêm khoá tuỳ chọn; `man-soan.tsx` truyền `timTrang` gọi `trpc.taiLieu.tim` qua `queryClient.fetchQuery`, `duong = url(duongTrang(slug))`; test `packages/ui/test/trinh-soan-lien-ket.dom.tsx`; sửa `trinh-soan.dom.tsx` (bộ nút viết trước: 10 khi không có `timTrang`, 11 khi có) và `trinh-soan-vat.tsx`. Ca `chen-lien-ket` ở `tai-lieu-nhac-toi.spec.ts`: markdown lấy từ hàm `dungLienKetTrang(ten, duong)` xuất ở `packages/ui/src/components/trinh-soan-lien-ket.ts` (dùng chung cho editor và test, không viết tay chuỗi).

- [ ] Step 1: bốn ca E4 + `chen-lien-ket` E4b. Step 2 FAIL. Step 3 cài. Step 4 PASS + chiều đỏ «chen-lien-ket: href khong phai /<ws>/tai-lieu/<slug>», «chen-lien-ket: dich khong thay trang nguon sau duyet». Step 5 commit.

### Task 15: Hai phép đo màn

phục vụ E3u, E4u, E5u, E8u

**Files:** `_acceptance/tim-va-dieu-huong-kho/rang/man-tim.mjs`, `man-suc-khoe.mjs` — theo khuôn `_acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs` (gốc kho suy từ vị trí tệp; `canh-cay`; phiên đo riêng `tien-de.mjs`; gieo qua đường ghi thật; đăng nhập `dev:session`; chữ đọc bằng `innerText`; ảnh vào `.acceptance-runs/tim-va-dieu-huong-kho/evidence/`; `--chieu-do` dựng bản sao phá ở `.acceptance-runs/` với thông điệp ghim; cuộn ngang đo bằng `scrollWidth > clientWidth` ở 390).

- [ ] Step 1: viết `man-tim.mjs` bảy bước (E3u 1–3, E4u 4, E5u 5–7), `man-suc-khoe.mjs` bốn bước (E8u). Step 2: chạy qua lệnh `config.yaml` (`bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun …"`) → exit 0, in «buoc N: dat». Step 3: `--chieu-do` → ma 1, thông điệp ghim. Step 4: xem ảnh bằng mắt, ghi phát hiện. Step 5 commit.

### Task 16: Tài liệu và năm lệnh

**Files:** `docs/api.md` (mục «Kho tài liệu: tìm, nhắc tới, sức khoẻ»: phạm vi chung, chỉ bản đang dùng, `unaccent` phía truy vấn, câu tính lúc đọc, luật đếm chung), `docs/agent.md` (mục Nhắc buổi sáng: dòng `tai-lieu-cho-duyet`), `CONTEXT.md` nếu cần mục «Sức khoẻ kho» (kiểm W6 trước).

- [ ] Step 1: viết. Step 2: từ gốc kho, PATH Bun 1.3.12: `bun run check-types && bun run lint && bun run lint:slop && bun run test && bun run build` — năm lệnh xanh. Step 3: `node scripts/product-map.mjs --root . --check`. Step 4: commit `docs(kho-tai-lieu): tìm, nhắc tới, sức khoẻ, nhắc sáng`.

---

## Tự soát

- Phủ thiết kế: mục 1 → T1, T4; 2 → T10; 3 → T14; 4 → T1, T4, T11; 5 → T5, T12; 6 → T6, T13; 7 → T3, T9; 8 → T2, T7, T12; xử lý lỗi → T10–T13; kiểm → T15.
- Phủ evals: E1 T4 · E2 T8 · E3 T4 · E3d T10 · E3u T15 · E4 T14 · E4b T14 · E4u T15 · E5 T4 · E5d T11 · E5u T15 · E6 T5 · E6d T12 · E7 T6 · E8 T6 · E8d T13 · E8u T15 · E9 T9 · E9b T9 · E10 T2 · E10d T2 · E11 T7 · E11d T12 · E0s mọi task giao diện (chạy `tdk_san_thiet_ke` cuối T13 và T14) · E12j S4.
- Lệch đã ghi sổ: thẻ Tổng quan thay «Việc của bạn» (d-9), ⌘K gắn cho vai okr (d-10), `proposals` có `slug` (d-11). Đường mở `?tabTaiLieu=cho-duyet` theo khoá thật — ghi thêm một dòng `fix` khi làm T9.
- `config.yaml` `tdk_tim_vai_okr` chạy `vai-chi-okr.spec.ts` với `-t vai-okr` sẽ lọc hết ca của tệp đó; sửa lệnh thành `bun test test/tai-lieu-tim.spec.ts -t vai-okr && bun test test/vai-chi-okr.spec.ts` ở T4 và ghi dòng `fix`.
