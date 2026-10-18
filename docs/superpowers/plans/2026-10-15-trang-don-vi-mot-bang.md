# Trang đơn vị một bảng (DH2) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (phiên chính tự làm, tuần tự). Steps dùng `- [ ]`.

**Goal:** Trang «Theo đơn vị» thành một `DataTable` như Thoả thuận: ô chọn đơn vị có tìm kiếm thay cột cây, mục tiêu
mở ra KR, một hàng công cụ đứng yên khi đổi cách xem, lọc nhanh «Cần bàn»/«Chưa góp vào đâu», sắp xếp, chân bảng và
đơn vị trực thuộc.

**Architecture:** Logic thuần (lọc nhanh, sắp xếp, lựa chọn đơn vị + gấp dấu, con trực tiếp) tách vào
`theo-don-vi/bang-don-vi.ts` để kiểm không cần DOM. Giao diện: `HangCongCuDonVi` (ô chọn + cách xem) dùng chung cho
`DataTable` (qua `search`) và ba cách xem kia (qua khung cùng lớp). `DataTable` sửa đúng ô mũi tên thành nút (Hỏi-4).

**Tech Stack:** Next.js app router, React 19, TanStack Query + tRPC, nuqs, bun test (DOM qua `setup-dom.ts`), oxlint
anti-slop, biome.

**Spec:** `docs/superpowers/specs/2026-10-15-trang-don-vi-mot-bang-design.md` · hợp đồng
`_acceptance/trang-don-vi-mot-bang/contract.md` (14 AC, đã ký Cổng Phạm vi 102744d12) · evals `evals.yaml` (18).

## Global Constraints

- Chỉ giao diện: KHÔNG đổi thủ tục API (`okr.danhSach`, `okr.countByUnit`), luật quyền, ngăn chi tiết.
- `packages/ui`: chỉ đổi ô mũi tên của dòng mở rộng trong `data-table.tsx` (+ chữ mặc định trong messages của ui nếu
  cần); NM2 đang sửa dòng 40–620 cùng tệp — không chạm vùng đó.
- Không cài data-grid của ReUI; không tự ghép `ToggleGroup` cho cách xem (dùng `ViewSwitch`); chữ vi/en lấy từ
  messages, không viết cứng; term theo `CONTEXT.md` (tránh mục `_Avoid_`).
- Lint: `bun run lint:slop` 0 lỗi (không `Record<string,…>` annotation trên hằng biết trước — dùng `satisfies`/`Map`
  suy kiểu; không `typeof` lặt vặt), `bunx biome check` sạch, `bun run check-types` xanh.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (MEASURE-BIRTH-CLAUSE): đột biến `DVB_PHA=<tên>` áp trong
  WORKTREE TẠM (theo `_acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs`), không bao giờ đột biến tại chỗ.
- Đường dẫn trong mọi `rang/*.mjs` suy từ vị trí script.
- Không sửa tệp hồ sơ đã ký ngoài phạm vi AC-14 (tám hồ sơ) + dòng Notes của DH1 (AC-13).

## Review Focus

1. Đơn vị trên đường dẫn không còn trong cây (đã xoá) → «không thấy đơn vị» + lối về công ty, ô chọn không vỡ (Task 5, ca `don-khong-thay`).
2. Gõ tìm có dấu/không dấu/hoa thường trên tên có dấu («Phòng Kế toán») → khớp (Task 1, ma trận 6 chuỗi).
3. Sắp xếp tình trạng khi `expected` null (chưa có kỳ vọng) và mốc (`kind: "moc"`) → đứng cuối, không ném lỗi (Task 1).
4. Ô lọc «Chưa góp vào đâu» ở cấp công ty → luôn 0, không tính mục tiêu công ty (Task 1).
5. `xemOkr=cham` ngoài pha chấm điểm, cả khi tới từ liên kết thẻ → rơi về Danh sách (Task 6).

---

### Task 1: Logic thuần của bảng đơn vị — phục vụ E8, E9, E1 (gấp dấu), E10 (con trực tiếp)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi.ts`
- Test: `apps/app/test/okr-trang-don-vi.dom.tsx` (tạo tệp; nhóm `dvb-loc-nhanh` phần thuần, `dvb-sap-xep` phần thuần)

**Interfaces — Produces:**
```ts
export const LOC_NHANH = ["can-ban", "chua-gop"] as const;
export type LocNhanh = (typeof LOC_NHANH)[number];
export function canBan(mt: MucTieu): boolean;          // ≥1 KR có nhipCua(...) ∈ {"cham-nhip","truot"}
export function chuaGop(mt: MucTieu): boolean;         // mt.level !== "onehub" && mt.alignments.length === 0
export function locNhanh(ds: MucTieu[], loc: LocNhanh | null): MucTieu[];
export function demLocNhanh(ds: MucTieu[]): Record<LocNhanh, number>;
export const COT_SAP = ["tien-do", "tinh-trang"] as const;
export type CotSap = (typeof COT_SAP)[number];
export function sapXep(ds: MucTieu[], cot: CotSap | null, chieu: "asc" | "desc"): MucTieu[]; // ổn định
export function gapDau(s: string): string;             // NFD, bỏ dấu, đ→d, lower
export type LuaChonDonVi = { khoa: string; ten: string; goiY: string; tuKhoa: string[] };
export function luaChonDonVi(cay: CayDuLieu, tenGoc: string, dem: Record<string, number> | undefined, nguoi: { id: string; ten: string } | null, m: { caCongTy: string; thuoc: (duong: string) => string; demMucTieu: (n: number) => string }): LuaChonDonVi[];
export function khopTim(lc: LuaChonDonVi, chuoi: string): boolean; // gapDau(chuoi) ⊂ gapDau(ten | tuKhoa…)
export type DonViCon = { khoa: string; ten: string; coTruong: boolean };
export function conTrucTiep(cay: CayDuLieu, don: DonChonOkr): DonViCon[]; // goc → bp + chuaXep; bp → pb; pb/nguoi → []
```

- [ ] **Step 1: Viết bài thất bại** — trong `okr-trang-don-vi.dom.tsx` (khung mock trpc/nuqs chép theo `okr-theo-don-vi.dom.tsx` dòng 1–330, fixture cây sinh bằng hàm `cayMau()` có tên CÓ DẤU: «Phòng Kế toán», «Dịch vụ khách hàng», «Kinh doanh»):
```ts
describe("dvb-loc-nhanh", () => {
  test("ma trận 5 nhịp KR × có/không nơi góp + một mục tiêu công ty", () => {
    const NHIP = [["dung", 60, 50], ["cham", 30, 50], ["truot", 10, 50], ["ky-vong-null", 40, null], ["moc", 0, 50]] as const;
    const ds = NHIP.flatMap(([ten, p, e]) => [true, false].map((gop) => mucTieuNhip(`${ten}-${gop}`, p, e, gop, ten === "moc")));
    ds.push({ ...mucTieuNhip("cty", 10, 50, false, false), level: "onehub" });
    for (const mt of ds) {
      const kv = mt.keyResults.some((k) => ["cham-nhip", "truot"].includes(nhipCua(k.progress, mt.expected, mt.kind, k.kind === "moc")));
      expect(canBan(mt)).toBe(kv);
      expect(chuaGop(mt)).toBe(mt.level !== "onehub" && mt.alignments.length === 0);
    }
    expect(demLocNhanh(ds)["chua-gop"]).toBe(locNhanh(ds, "chua-gop").length);
    if (process.env.DVB_PHA === "chua-gop-tinh-cong-ty" && locNhanh(ds, "chua-gop").some((x) => x.level === "onehub"))
      throw new Error("dvb-loc-nhanh: muc tieu cong ty nam trong Chưa góp vào đâu");
  });
});
describe("dvb-sap-xep", () => { /* 5 ô: (tien-do,tinh-trang)×(asc,desc)+null; so dãy id với sắp tham chiếu trong bài */ });
```
  Ghi chú: thông điệp ghim của mỗi chiều đỏ đi qua `expect(..., "<thông điệp>")`-tương đương: dùng `if (!ok) throw new Error("<thông điệp ghim>")` để đầu ra chứa đúng chuỗi trong `evals.yaml`.
- [ ] **Step 2: Chạy, xác nhận đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-loc-nhanh` → FAIL «Cannot find module …bang-don-vi».
- [ ] **Step 3: Viết `bang-don-vi.ts`** (dùng `nhipCua` của `../tien-do-kr`, `tinhTrang`/`TINH_TRANG` của `@crm/validation/okr-muc-tieu`; bậc tình trạng `{truot:0,"cham-nhip":1,"dung-nhip":2,"chua-co-ky-vong":3}` suy từ `TINH_TRANG` qua `satisfies`; `sapXep` dùng `toSorted` ổn định).
- [ ] **Step 4: Xanh** — cùng lệnh, thêm `-t dvb-sap-xep`.
- [ ] **Step 5: Commit** `feat(okr): logic thuần của bảng đơn vị — lọc nhanh, sắp xếp, tìm gấp dấu, con trực tiếp`.

### Task 2: Ô mũi tên của `DataTable` thành nút (Hỏi-4) — phục vụ E18

**Files:**
- Modify: `packages/ui/src/components/data-table.tsx` (ô `anyExpandable` ~dòng 899–910; KHÔNG chạm 40–620)
- Modify: `packages/ui/src/lib/messages.ts` (thêm `table.expandRow(label)` / `table.collapseRow(label)` vi+en)
- Test: `packages/ui/test/data-table-mo-rong.spec.tsx` (mới)

**Interfaces — Produces:** `expandable.rowLabel?: (row) => string` (tuỳ chọn; vắng → «dòng»). Ô mũi tên:
```tsx
{canExpand && (
  <Button type="button" size="icon-sm" variant="ghost" aria-expanded={isOpen}
    aria-label={isOpen ? msg.table.collapseRow(label) : msg.table.expandRow(label)}
    data-mo-dong={id}
    onClick={(e) => { e.stopPropagation(); handleClick(); }}>
    <ChevronRight size={12} className={cn("inline-block transition-transform motion-reduce:transition-none", isOpen && "rotate-90")} />
  </Button>
)}
```
- [ ] **Step 1:** Bài 11 assert (3 dòng × có/không nút + 2 dòng × Enter/Space/bấm nút/bấm ô trống), đối chứng dương bảng không expandable không có cột mũi tên; chiều đỏ: `if (process.env.DVB_PHA==="mui-ten-tran" …)` không cần — chiều đỏ do `hai-chieu.mjs` thay đoạn nút bằng `<ChevronRight …/>` trần; thông điệp ghim «data-table-mo-rong: dong r1 khong co button[aria-expanded] trong o mui ten».
- [ ] **Step 2:** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-mo-rong.spec.tsx` → đỏ.
- [ ] **Step 3:** Sửa ô như trên; Enter/Space là hành vi gốc của `button`.
- [ ] **Step 4:** Xanh + `bun run test -- --filter=@crm/ui` xanh (render-diff.spec còn đúng).
- [ ] **Step 5: Commit** `feat(ui): dòng mở rộng của DataTable có nút aria-expanded, mở bằng bàn phím`.

### Task 3: Chữ vi/en + ô chọn đơn vị + hàng công cụ — phục vụ E1, E7

**Files:**
- Modify: `apps/app/lib/messages/okr.ts` (khối `donViBang`: `chonDonVi`, `timDonVi`, `khongKhopDonVi`, `caCongTy`, `thuoc(duong)`, `locNhanh: {tatCa, "can-ban", "chua-gop"}`, `khongKhopLoc`, `boLoc`, `truong`, `chuaCoTruong`, `demMtKr(n,m)`, `donViTrucThuoc`, `chuaDatOkr`, `demMucTieuCon(n)`; en: «Needs discussion», «Not aligned», …)
- Create: `apps/app/app/(app)/[slug]/okr/theo-don-vi/chon-don-vi.tsx` (`ChonDonVi`), `hang-cong-cu.tsx` (`HangCongCuDonVi`, `KhungHangCongCu`, `KhungXuongHangCongCu`)
- Test: nhóm `dvb-chon-don-vi`, `dvb-hang-cong-cu`

**Interfaces — Produces:**
```ts
export function ChonDonVi(p: { cay: CayDuLieu; tenGoc: string; dem: Record<string, number> | undefined; don: DonChonOkr; nguoi: { id: string; ten: string } | null; chonDon: (d: DonChonOkr) => void }): JSX.Element; // Combobox, data-chon-don-vi, filter dùng khopTim
export function HangCongCuDonVi(p: { chon: ReactNode; xem: CachXem; coCham: boolean; doiXem: (x: CachXem) => void }): JSX.Element; // <div data-hang-cong-cu-don-vi class="flex flex-col gap-2 sm:flex-row sm:items-center">{chon}<ViewSwitch …/></div>
export const LOP_HANG_CONG_CU = "flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between"; // chép từ data-table.tsx; bài dvb-hang-cong-cu so lớp này với DOM thật của DataTable
export function KhungHangCongCu({ children }: { children: ReactNode }): JSX.Element; // div LOP_HANG_CONG_CU — cho Họp tuần/Chấm điểm/Cây
```
  `Combobox` không gấp dấu sẵn (cmdk): truyền `keywords` = `[gapDau(ten), ...tuKhoa.map(gapDau)]` và lọc phía `search`/`onSearchChange` bằng `khopTim` nếu `keywords` không đủ — bài `dvb-chon-don-vi` (c) quyết.
- [ ] Step 1 bài đỏ (ma trận 8 lựa chọn, 6 chuỗi tìm, chọn P2 → URL + đối số `danhSach`, `nguoi:U1`); Step 2 đỏ; Step 3 viết; Step 4 xanh; Step 5 commit `feat(okr): ô chọn đơn vị có tìm kiếm và hàng công cụ dùng chung`.

### Task 4: Bảng đơn vị, chân bảng, trực thuộc, trạng thái — viết lại `theo-don-vi.tsx` — phục vụ E6, E8, E9, E10, E11

**Files:**
- Create: `theo-don-vi/bang-don-vi.tsx` (`BangDonVi`: cột Mục tiêu/Tiến độ/Tình trạng/Phụ trách, `expandable` + `rowLabel`, `onSubRowClick` → `openRecord({kind:"kr"})`, tên mục tiêu là `<button data-mo-muc-tieu>` gọi `openRecord({kind:"objective"})` + `stopPropagation`, `tabs` id `locNhanh`, `facets` từ `LocOkr`, `meta` = `<ChanBang/>`, `filteredEmpty` = `KhongKhop`), `theo-don-vi/chan-bang.tsx` (`ChanBang`, `data-dong-don-vi`), `theo-don-vi/don-vi-con.tsx` (`DonViCon`, `data-don-vi-con`, `Item` link giữ `kyOkr`)
- Modify: `theo-don-vi/theo-don-vi.tsx` (bỏ `CayDonVi`, `Card` đơn vị, `data-hang-nut`; hàng công cụ ở mọi cách xem; `KhoiKrCuaToi` dưới bảng; `NhomDaBo` dưới bảng), `theo-don-vi/page.tsx` (fallback = khung xương có hàng công cụ + dòng bảng, không `tong-quan`), `okr/loc-okr.tsx` (xuất `matLocOkr(...)`: `DataTableFacet[]` + `chuanLoc` để `BangDonVi` truyền vào `facets`), `okr-search-params.ts` + `lib/search-param-keys.ts` (khoá `locNhanhOkr`, `sapOkr`, `chieuOkr` — hoặc dùng `useTableQuery` của `apps/app/components/data-table/use-table-query.ts` nếu nó nhận tên khoá; chọn lối không đụng khoá của trang khác)
- Test: `dvb-dong-mo`, `dvb-loc-nhanh` (phần UI), `dvb-sap-xep` (UI: URL mang sort/dir), `dvb-chan-bang`, `dvb-trang-thai`

- [ ] Step 1 bài đỏ theo `evals.yaml` E6/E8/E9/E10/E11 (ma trận viết trước, thông điệp ghim); Step 2 đỏ; Step 3 viết; Step 4 xanh cả năm nhóm + `bun run check-types`; Step 5 commit `feat(okr): trang đơn vị một bảng trên DataTable`.
- Xoá `okr/cay-don-vi.tsx` CHỈ khi `git grep CayDonVi apps/app` sau lượt rỗng (Toàn cảnh có thể còn dùng `useKhoHep`).

### Task 5: Đổi thẻ giữ cách xem + Notes DH1 — phục vụ E15

**Files:** Modify `okr/thanh-tab.tsx` (`giu` thêm `xemOkr` khi có), `_acceptance/dieu-huong-khu-muc-tieu/contract.md` (một dòng Notes «AC-6 nới thêm `xemOkr` — trang-don-vi-mot-bang AC-13»), `apps/app/test/okr-dau-trang-khu.dom.tsx` (ma trận `dhk-giu-don`: tập kỳ vọng thành giao với `{kyOkr, donOkr, xemOkr}`). Test: nhóm `dvb-giu-xem`.
- [ ] Bài đỏ → sửa `toi()` → xanh `dvb-giu-xem` + `dhk-giu-don` → commit `feat(okr): đổi thẻ giữ cách xem (B4, phần DH1 giao lại)`.

### Task 6: Bài kiểm cũ theo trang mới + `rang/ho-so-da-ky.mjs` — phục vụ E12

**Files:** sửa điều khẳng định (không xoá ca, không `.skip`) ở `okr-theo-don-vi.dom.tsx`, `muc-tieu-va-kr.dom.tsx`, `okr-to-chuc-va.dom.tsx`, `khung-okr-truoc-r1.dom.tsx`, `okr-da-bo.dom.tsx`, `khung-man-chung.dom.tsx` và tệp nào `bun run test -- --filter=app` báo đỏ; tạo `_acceptance/trang-don-vi-mot-bang/rang/ho-so-da-ky.mjs` (chép khuôn DH1, thêm hai dòng đếm XOA/SKIP).
- [ ] `bun run test -- --filter=app` xanh → `bun _acceptance/trang-don-vi-mot-bang/rang/ho-so-da-ky.mjs` «DUNG AC-10» → commit.

### Task 7: Bản mẫu chốt + `rang/proto-don-vi.mjs` — phục vụ E13

**Files:** gỡ state `ST-dvb-hoi-2-nut-chi-tiet` và hai dòng `data-ghim-hoi` khỏi `proto/catalog.ts` + module; tạo `rang/proto-don-vi.mjs` (khuôn `dieu-huong-khu-muc-tieu/rang/proto-khu.mjs`, rút id từ `UX-STATE-TABLE`).
- [ ] script mã 0 + `bun test test/proto-catalog.spec.ts` → commit.

### Task 8: Đo trên trình duyệt thật — `rang/man-don-vi.mjs` — phục vụ E2, E3, E4, E5, E17, ảnh cho E14

**Files:** Create `_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs` theo khuôn `dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs` (chạy qua `bun scripts/lan-do/tien-de.mjs --chay`, nhánh theo `EVAL=E2|E3|E4|E5|E17`, Prisma đọc kho đo, ảnh vào `evidence/`).
- [ ] Chạy từng EVAL (làn trình duyệt — không phải làn nặng, nhưng `nice -n 10`, cổng riêng của phiên đo) → các dòng «DUNG AC-…» → commit.

### Task 9: Bộ hai chiều `rang/hai-chieu.mjs` + khoá config — mọi eval máy

**Files:** Create `_acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs` (chép khuôn DH1: worktree tạm, băm cây thật trước/sau, mã 0/1/2) với bảng `DOT_BIEN` cho mọi tên `DVB_PHA` khai trong `evals.yaml` (cay-cu, the-don-vi, cach-xem-trong-loc, chon-khong-doi, khoa-dem-sai, mo-san, chua-gop-tinh-cong-ty, sap-chu, con-sai-cap, loi-che-hang, ho-so, xoa-ca, thieu-state, bo-xem, bo-notes-dh1, bo-go-dau, mui-ten-tran, ghim-cu); nối `&& bun …/hai-chieu.mjs <nhom>` vào khoá `dvb_*` tương ứng trong `_acceptance/config.yaml`.
- [ ] `bun …/hai-chieu.mjs <nhom>` mã 0 cho từng nhóm → commit.

### Task 10: Sửa phép đo tám hồ sơ đã ký + `rang/ghim-nam.mjs` + ghim lại — phục vụ E16 (Hỏi-3)

**Files:** `rang/` của `dat-okr-trong-crm`, `khung-okr-truoc-r1` (cả `bon-vai.mjs`, `man-khung.mjs`), `muc-tieu-va-kr`, `okr-to-chuc-va` (cả `chup-proto.mjs`), `toan-canh-okr`, `okr-soat-anh-luot-3/do-man.mjs`, `soan-okr-trong-khung/man-dua-vao.mjs`, `dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs` (neo đột biến `data-hang-nut` của `theo-don-vi.tsx` → neo mới); Notes trong `muc-tieu-va-kr/contract.md`. Create `rang/ghim-nam.mjs`.
- Luật sửa: chỉ đổi cách tới trạng thái (chọn đơn vị bằng `donOkr` trên URL hoặc ô chọn; thu/mở bằng `expand`; nút ở `[data-hang-hanh-dong]` đầu trang thay `[data-hang-nut]`), không bỏ điều khẳng định khác.
- Lưu ý Điều phối M5 (15/10): `dieu-huong-khu-muc-tieu/rang/ho-so-da-ky.mjs` (DH1) vẫn tiêm `throw` TẠI CHỖ trong cây
  (mục ngoài hợp đồng ở Gate 2 của DH1) → khi ghim lại, eval của DH1 chạy TUẦN TỰ, không song song với eval khác trên
  cùng cây (`repin_parallel_suites` chỉ song song suite; kiểm làn không chạy eval song song, nếu có thì ghim DH1 một
  lượt riêng). Ưu tiên sửa thước đó sang tiêm trong worktree tạm (khuôn `hai-chieu.mjs`) trong PR này — sửa thì ghi
  một dòng sổ `fix` và báo M5.
- [ ] Sửa → XIN LƯỢT `ghim-lai` ở Điều phối M5 → `nice -n 10 node <feature-loop 2.30.0>/scripts/repin-lane.mjs --root . --slug <8 slug> --reason "DH2 trang đơn vị một bảng — phép đo trang mới" --write` (nền) → nhả lượt → `rang/ghim-nam.mjs` «DUNG AC-14: 8/8» → commit.

### Task 11: Đóng S3

- [ ] `bun run test -- --filter=app --filter=@crm/ui`, `bun run lint:slop`, `bun run check-types` xanh; `contract.md` `status: implemented`; commit; vào S4 (xin lượt `s4`).

## Thứ tự và độc lập

Mọi task `independent: false` (cùng quanh `theo-don-vi.tsx`, `okr-trang-don-vi.dom.tsx`, `config.yaml`), trừ Task 2
(`packages/ui`, `independent: true` so với Task 1) — hai task này nhỏ, làm tuần tự trong phiên chính, không fan-out.
Thứ tự: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 9 → 8 → 10 → 11 (8 sau 9 để răng hai chiều có trước lượt đo dài).
