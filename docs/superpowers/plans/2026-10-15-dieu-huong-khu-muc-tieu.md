# Điều hướng khu Mục tiêu (DH1) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (phiên chính tự làm, tuần tự). Steps dùng checkbox.

**Goal:** Một đầu trang «Mục tiêu» dùng chung cho khu OKR — hàng hành động góc phải, đổi thẻ giữ đơn vị + chu kỳ, Sức
khoẻ chương trình khớp tên, nút tạo khoá kèm lý do.

**Architecture:** Đầu trang khu dựng lại trên `PageShellHeader` + `PageShellActions` như Thoả thuận; một hàm thuần
`donDich()` chọn đơn vị đích; quyền đọc từ `okr.danhSach.canCreate` của đơn vị đích (máy chủ dùng cùng `nhapDuoc` cho
tạo và nhập). Ba nút rời thân Theo đơn vị; ngăn tạo và hộp nhập vẫn sống ở Theo đơn vị, mở bằng khoá đường dẫn.

**Tech Stack:** Next.js app router, nuqs, tRPC + react-query, bun test + happy-dom (`packages/ui/test/setup-dom.ts`).

**Spec:** `docs/superpowers/specs/2026-10-15-dieu-huong-khu-muc-tieu-design.md` · hợp đồng
`_acceptance/dieu-huong-khu-muc-tieu/contract.md` (duyệt 15/10: Hỏi-1 nút soạn viền, Hỏi-2 đơn vị mình dẫn trước).

## Global Constraints

- Không đổi API, DB, `packages/ui`, `bun.lock`; không đổi luật quyền.
- Giữ năm thẻ (A3 ở DH3); nhãn «Soạn OKR cùng Kara» (luật một tên, `docs/ai-ux.md` §1).
- Hàng hành động giữ chỗ cho `NutHoiKara` của `hoi-dap-okr` khi nó lên `onehub`.
- Chữ qua `apps/app/lib/messages/*` (vi + en), không viết cứng.
- Mọi phép đo mới có cặp hai chiều cùng fixture + thông điệp ghim (MEASURE-BIRTH-CLAUSE).

## Review Focus

- Người dẫn đơn vị đang ở URL có `donOkr` của đơn vị khác → nút ở thẻ khác Theo đơn vị nhắm đơn vị mình dẫn (E4, E5).
- Chu kỳ chưa có (`currentId === null`) → hàng hành động ẩn như ô chu kỳ hôm nay (thân trang tự hiện «Chưa có chu kỳ»); đầu trang không gọi `danhSach` (test ở T3).
- Trang soạn (`laTrangSoan`) không có đầu trang khu — giữ (test cũ khung-soan-okr).
- `don` loại `nguoi` ở Theo đơn vị → nút soạn không hiện (`donViSoanCua` trả null), nút tạo theo `canCreate`.
- en: không còn «Programme».

## Bản đồ tệp

| Tệp | Việc |
|---|---|
| `okr/don-dich.ts` (mới) | `donDich(tab, donUrl, headOf)` → `{ don, nguon }` |
| `okr/hanh-dong-khu.tsx` (mới) | hàng hành động: ô chu kỳ · «…» Nhập · `NutSoan` · «Thêm mục tiêu»; dòng lý do |
| `okr/luoi-dau-trang.tsx` | đổi thành khung `PageShellHeader` + Actions + thanh thẻ |
| `okr/thanh-tab.tsx` | tiêu đề khu = `rail.okr`; liên kết thẻ giữ `kyOkr` + `donOkr` |
| `okr/dau-trang-okr.tsx`, `dau-trang-hoi-y.tsx` | truyền `cauNoi`, khung chờ cùng hình |
| `okr/soan/nut-soan.tsx` | thêm `khoaVi?: string` (khoá vì quyền, `aria-describedby`) |
| `okr/theo-don-vi/theo-don-vi.tsx` | gỡ ba nút; hộp nhập mở bằng khoá `nhapOkr` |
| `okr/toan-canh/suc-khoe/suc-khoe.tsx` | liên kết về giữ `donOkr` |
| 6 `page.tsx` | `generateMetadata` = «<tên thẻ> · Mục tiêu» |
| `lib/messages/okr.ts`, `okr-toan-canh.ts` | câu lý do khoá, lỗi quyền; «Program health» |
| `lib/search-param-keys.ts` | `okr.nhap: "nhapOkr"` |
| `test/okr-dau-trang-khu.dom.tsx` (mới) | ca `dhk-*` |
| test cũ (AC-9) | đổi điều khẳng định cũ |
| `_acceptance/dieu-huong-khu-muc-tieu/rang/*` | `hai-chieu.mjs`, `man-dau-trang.mjs`, `ho-so-da-ky.mjs`, `proto-khu.mjs` |
| `_acceptance/config.yaml` | khoá `executors.*.dhk_*` |
| `proto/_modules/dieu-huong-khu-muc-tieu/*`, `catalog.ts` | gỡ state `ST-dhk-hoi-1-gom` |

## Tasks (tuần tự — mọi task `independent: false`: cùng xoay quanh đầu trang khu)

### Task 1: Hàm giải đơn vị đích — phục vụ E4
**Files:** Create `okr/don-dich.ts`; Test `test/okr-dau-trang-khu.dom.tsx` (`dhk-don-dich`).
```ts
export type NguonDich = "chon" | "dan" | "url" | "goc";
export function donDich(tab: TabOkr, donUrl: DonChonOkr | null,
  headOf: { divisions: string[]; departments: string[] } | undefined): { don: DonChonOkr; nguon: NguonDich } {
  if (tab === "theo-don-vi") return { don: donUrl ?? GOC, nguon: "chon" };
  const bp = headOf?.divisions[0]; if (bp) return { don: { loai: "bp", id: bp }, nguon: "dan" };
  const pb = headOf?.departments[0]; if (pb) return { don: { loai: "pb", id: pb }, nguon: "dan" };
  if (donUrl) return { don: donUrl, nguon: "url" };
  return { don: GOC, nguon: "goc" };
}
```
- [ ] Ma trận 30 ô (6 nguồn × 5 người xem) viết trước, chạy đỏ (chưa có tệp) → viết hàm → xanh. Verify: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-dau-trang-khu.dom.tsx -t dhk-don-dich`.

### Task 2: Chữ + tiêu đề trình duyệt — phục vụ E1, E9 (en)
**Files:** `lib/messages/okr.ts` (thêm `khoa.khongSua(ten)`, `khoa.chuaDan`, `khoa.loiQuyen`, bỏ `tieuDe`), `okr-toan-canh.ts` (Programme → Program), 6 `page.tsx`.
- [ ] Test `dhk-tieu-de` (24 ô h1 + 5 mô tả khác nhau + 6 metadata) đỏ → sửa → xanh.

### Task 3: Đầu trang khu + hàng hành động — phục vụ E3, E6, E7, E10
**Files:** `luoi-dau-trang.tsx`, `thanh-tab.tsx`, `hanh-dong-khu.tsx`, `dau-trang-okr.tsx`, `dau-trang-hoi-y.tsx`, `soan/nut-soan.tsx`.
- `HanhDongKhu` đọc `okr.access`, `useChuKy`, URL; `dich = donDich(...)`; `danhSach({cycleId, unit: dich.don, loc: locOkr(url)})` (cùng khoá với trang Theo đơn vị); `duoc = canCreate === true`.
- Theo đơn vị: «Thêm mục tiêu» đặt `dialog.create`, «Nhập» đặt `nhapOkr`. Thẻ khác: `Link` sang `/okr/theo-don-vi?kyOkr&donOkr=<dich>&<khoá>=true`.
- Không quyền → `disabled` + `aria-describedby="okr-khong-them-duoc"`; `PageShellNote` câu theo nguồn (`goc` & không quản trị → `chuaDan`; còn lại `khongSua(ten)`). Lỗi truy vấn → `loiQuyen`. Đang tải → `Skeleton` cùng bề rộng.
- [ ] Test `dhk-hanh-dong`, `dhk-menu-soan`, `dhk-khoa-ly-do`, `dhk-dang-tai` đỏ → làm → xanh.

### Task 4: Thân Theo đơn vị — phục vụ E3, E6
**Files:** `theo-don-vi/theo-don-vi.tsx`, `lib/search-param-keys.ts`, `okr-search-params.ts`.
- [ ] Gỡ ba nút khỏi `[data-hang-nut]`; `nhapMo` → `useQueryState(nhap, parseAsBoolean)`; không quyền mà URL có `nhapOkr` → xoá khoá.

### Task 5: Đổi thẻ giữ đơn vị + Sức khoẻ — phục vụ E8, E9
**Files:** `thanh-tab.tsx` (`toi()` giữ `kyOkr`, `donOkr`), `suc-khoe.tsx`.
- [ ] Test `dhk-giu-don` (25 liên kết + vòng đi-về), `dhk-suc-khoe`.

### Task 6: Bài kiểm cũ (AC-9) + `ho-so-da-ky.mjs` — phục vụ E11
- [ ] Sửa điều khẳng định ở `okr-thanh-tab.dom.tsx`, `okr-theo-don-vi.dom.tsx`, `okr-to-chuc-va.dom.tsx`, `khung-okr-truoc-r1.dom.tsx`, `soan-okr.dom.tsx` (chỉ đổi sang lời hứa mới); viết `rang/ho-so-da-ky.mjs`. Verify: `bun run test` ở `apps/app` + script.

### Task 7: Bản mẫu + `proto-khu.mjs` — phục vụ E12
- [ ] Gỡ `ST-dhk-hoi-1-gom` và nhánh gom; `rang/proto-khu.mjs` rút id từ UX-STATE-TABLE, so `PROTO_CATALOG`, đỏ khi thêm `ST-dhk-gia`.

### Task 8: Đo trên trình duyệt thật — phục vụ E2, E5, E15, E16, E13 (ảnh)
- [ ] `rang/man-dau-trang.mjs` theo khuôn `canh-kr-okr/rang/man-canh-kr.mjs` (phiên đo riêng, máy chủ cây đang xét, đăng nhập dev, dọn theo id).

### Task 9: Cấu hình + hai chiều — mọi eval máy
- [ ] `rang/hai-chieu.mjs <nhóm>`: chạy ca xanh trên vật lành, áp từng đột biến `DHK_PHA` của nhóm vào tệp tại chỗ, đòi đỏ + thông điệp ghim, hoàn nguyên trong `finally`. Khoá `executors.test.dhk_*` gọi script này; `executors.script.dhk_man|dhk_ho_so_da_ky|dhk_proto|dhk_san_thiet_ke`.
- [ ] Chạy trọn các khoá dhk_* + `suite_app_ui` trước khi đặt `status: implemented`.
