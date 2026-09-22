# Trang 30 ngày đầu theo khuôn danh sách — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa trang `/[slug]/onboarding` về đúng khuôn trang danh sách của deals (nút tạo ở đầu trang, tiêu đề không cắt, tải/lỗi trong bảng, sắp xếp mặc định hiện ra, ô và bộ lọc như deals).

**Architecture:** Chỉ sửa `apps/app` (trang onboarding, `KhungTao`, thông điệp) cộng một test API. Không thêm biến thể vào `packages/ui`. Test DOM mới dùng đúng bộ dựng của `noi-bon-nut.dom.tsx`: tRPC giả nhưng hàng dựng bằng hàm ghi thật `dungHang` + `manDanhMucTuHang` của API rồi `danhMucOutput.parse`.

**Tech Stack:** Next.js App Router, React 19, TanStack Query, nuqs, bun test + jsdom, NestJS service test trên CSDL thử.

**Spec:** `docs/superpowers/specs/2026-09-22-onboarding-giong-deals-design.md` · hợp đồng `_acceptance/onboarding-giong-deals/contract.md` · phép đo `_acceptance/onboarding-giong-deals/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không ghi đè style component bằng `className` ngoài khuôn sẵn có; không màu/bo góc tự chế (docs/design.md).
- Dữ liệu người nhập mang `translate="no"` (CLAUDE.md).
- Thông điệp mới có ở cả `en` và `vi`, kiểu `OnboardingMessages` cập nhật.
- Chữ «Đang tải…» (`m.loading`) phải còn trên màn khi tải lần đầu — năm tệp test của hồ sơ đã ký chờ nó biến mất.
- Mọi phép đo mới có cặp hai chiều: xanh trên mã mới, đỏ với thông điệp ghim khi phá thử (MEASURE-BIRTH-CLAUSE).
- Tệp test DOM mới phải vào danh sách `test:dom` của `apps/app/package.json`.

## Tệp

| Tệp | Việc |
|---|---|
| `apps/app/app/(app)/[slug]/onboarding/page.tsx` | Đặt nút tạo trong `PageShellActions` |
| `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx` | Cột, ô, tải/lỗi trong bảng, nhãn bộ lọc, bỏ nút khỏi thanh công cụ |
| `apps/app/app/(app)/[slug]/onboarding/onboarding-search-params.ts` | `defaultSort: "startedAt"`, `defaultDir: "asc"` |
| `apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx` | Prop `dauTrang`: icon, khoá khi không khuôn; toast + mở kế hoạch sau khi tạo |
| `apps/app/components/onboarding/khung-tao.tsx` | Prop `bieuTuong?: ReactNode` trên nút mở |
| `apps/app/lib/messages/onboarding.ts` | `cells.silentDays`, `tao.keHoach.created` |
| `apps/app/test/onboarding-giong-deals.dom.tsx` | E2 E3 E5 E6 E7 E8 E9 E10 E11 E12 E17 |
| `apps/app/test/noi-bon-nut.dom.tsx` | Viết lại `nut-tren-thanh-cong-cu` đo nút đầu trang |
| `apps/api/test/onboarding-giong-deals.spec.ts` | E13 `tao-tra-id`, E16 `sap-hai-chieu` |
| `apps/app/package.json` | Thêm tệp DOM mới vào `test:dom` |

---

### Task 1: Cột, ô và thông điệp (AC-3, AC-7, AC-8, AC-9)

independent: false · phục vụ E4, E8, E9, E10

**Files:** Modify `danh-muc-table.tsx` (`cotBang`), `lib/messages/onboarding.ts`; Test `apps/app/test/onboarding-giong-deals.dom.tsx`

- [ ] Viết test `o-trong-va-so`, `doi-tac-khong-an`, `o-chu-mot-dong` (ma trận viết trước như evals.yaml; hàng qua `dungHang` → `manDanhMucTuHang` → `danhMucOutput.parse`).
- [ ] Chạy: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/onboarding-giong-deals.dom.tsx -t "o-trong-va-so|doi-tac-khong-an|o-chu-mot-dong"` → ĐỎ với thông điệp ghim.
- [ ] Sửa `cotBang`:

```tsx
{ id: "companyName", header: m.columns.partner, sortable: true, hideable: false, width: "w-[27%]",
  cell: (hang) => <span className="truncate font-medium" translate="no">{hang.companyName}</span> },
{ id: "tacO", header: m.columns.stuckOn, width: "w-[27%]",
  cell: (hang) => hang.tacO ? <span className="truncate" translate="no">{hang.tacO}</span> : <EmptyCellValue /> },
{ id: "imNgay", header: m.columns.silent, sortable: true, align: "right", width: "w-[14%]",
  cell: (hang) => hang.imNgay === 0 ? <EmptyCellValue /> : <span className="tabular-nums">{m.cells.silentDays.replace("{n}", String(hang.imNgay))}</span> },
{ id: "buocXong", header: m.columns.steps, sortable: true, align: "right", width: "w-[10%]", hideBelow: "sm",
  cell: (hang) => <span className="tabular-nums">{`${hang.buocXong}/${hang.buocTong}`}</span> },
{ id: "startedAt", header: m.columns.days, sortable: true, align: "right", width: "w-[10%]", hideBelow: "sm",
  cell: (hang) => <span className="tabular-nums">{`${hang.ngayThu}/${hang.targetDays}`}</span> },
{ id: "boPhanTac", header: m.columns.department, width: "w-[12%]", hideBelow: "md",
  cell: (hang) => hang.boPhanTac ? <span className="truncate text-muted-foreground" translate="no">{hang.boPhanTac}</span> : <EmptyCellValue /> },
```

  Tỉ lệ cuối cùng chốt bằng lượt chạy `man-danh-muc.mjs` (E4) ở 5 khổ; nếu một khổ còn cắt thì chỉnh tỉ lệ, không đổi khuôn.
- [ ] Thông điệp: `cells: { silentDays: "{n}d" }` (en) / `cells: { silentDays: "{n} ngày" }` (vi); thêm `cells: { silentDays: string }` vào kiểu.
- [ ] Chạy lại lệnh trên → XANH. Phá thử từng thứ (trả `"—"`, bỏ `hideable:false`, trả `whitespace-normal`) → ĐỎ đúng thông điệp ghim, rồi hoàn nguyên.
- [ ] Commit `fix(onboarding): cot va o theo khuon danh sach`.

### Task 2: Sắp xếp mặc định (AC-4)

independent: false · phục vụ E5, E16

**Files:** Modify `onboarding-search-params.ts`; Test dom `sap-mac-dinh`; Create `apps/api/test/onboarding-giong-deals.spec.ts` (`sap-hai-chieu`)

- [ ] Test DOM `sap-mac-dinh` (3 khẳng định: aria-sort, đầu vào cuối, aria-checked trong menu Sắp xếp; `?dir=desc`) → ĐỎ.
- [ ] Test API `sap-hai-chieu`: gieo 3 kế hoạch qua `dichVu().createFromTemplate` với `startedAt` khác nhau, gọi `manDanhMuc` ba lượt (rỗng / asc / desc), lọc theo 3 id; (a)==(b)==tăng dần, (c)==đảo của (b).
- [ ] Sửa: `createListSearchParams<never, DanhMucBoLoc>({ defaultSort: "startedAt", defaultDir: "asc", facetIds: DANH_MUC_BO_LOC })`.
- [ ] Chạy: lệnh DOM với `-t sap-mac-dinh`; `bun run test -- "cd apps/api && bun test test/onboarding-giong-deals.spec.ts -t sap-hai-chieu"` → XANH. Phá thử: bỏ `defaultSort` → ĐỎ «sort mac dinh: ''».
- [ ] Commit `fix(onboarding): sap xep mac dinh hien tren man`.

### Task 3: Tải, lỗi và không khớp trong bảng (AC-5, AC-6, AC-14 phần không khớp)

independent: false · phục vụ E6, E7, E17

**Files:** Modify `danh-muc-table.tsx` (`DanhMucTable`)

- [ ] Test DOM `dang-tai` (7 khẳng định), `loi-giu-thanh-cong-cu` (2), phần (b) của `trang-thai-trong` → ĐỎ.
- [ ] Sửa: bỏ hai nhánh trả sớm `isPending`/`isError`. Chế độ bảng luôn vẽ `DataTable`:

```tsx
const dangTaiDau = danhMuc.isPending;
const data = danhMuc.data;
if (data?.trangThai === "ST-danhmuc-chuacokhuon") return <Empty>…</Empty>;
if (data?.trangThai === "ST-danhmuc-empty") return <Empty>…</Empty>;
const loiView = danhMuc.isError ? (
  <Empty data-trang-thai="ST-danhmuc-loi">…<Button onClick={() => danhMuc.refetch()} variant="outline">{m.error.action}</Button></Empty>
) : null;
<DataTable
  rows={data?.rows ?? []}
  total={data?.total ?? 0}
  facetCounts={data?.facetCounts}
  loading={danhMuc.isFetching}
  empty={loiView ?? (khongKhop ? khongKhopView : undefined)}
  meta={dangTaiDau ? <span aria-live="polite">{m.loading}</span> : undefined}
  …
/>
```

  Cách xem bảng cột giữ khung chờ riêng của nó nhưng thanh công cụ vẫn vẽ; `facetCounts` rỗng khi chưa có dữ liệu.
- [ ] Chạy ba test → XANH; chạy lại `bang-cot-loi-va-nhan.dom.tsx`, `danh-muc-quan-ly.dom.tsx`, `noi-bon-nut.dom.tsx`, `sua-luu-tru.dom.tsx`, `moi-phia-ke-hoach.dom.tsx`, `ke-hoach-sheet.dom.tsx` → XANH. Phá thử: trả lại khối skeleton trả sớm → ĐỎ «dang tai: o tim».
- [ ] Commit `fix(onboarding): tai va loi nam trong bang`.

### Task 4: Nhãn bộ lọc (AC-10)

independent: false · phục vụ E11

- [ ] Test `nhan-bo-loc` (3 bộ lọc × 2 ca) → ĐỎ.
- [ ] Sửa `tuyChonCoDem`: `return [{ value: muc.id, label: muc.name }]`.
- [ ] XANH; phá thử kèm « · số» → ĐỎ «nhan bo loc». Commit `fix(onboarding): nhan bo loc chi la ten`.

### Task 5: Nút tạo ở đầu trang và tạo xong mở kế hoạch (AC-1, AC-2, AC-11, AC-14 phần trống)

independent: false · phục vụ E1, E2, E3, E12, E13, E17

**Files:** Modify `page.tsx`, `tao-ke-hoach.tsx`, `khung-tao.tsx`, `danh-muc-table.tsx`, `lib/messages/onboarding.ts`, `apps/app/test/noi-bon-nut.dom.tsx`; test API `tao-tra-id`.

- [ ] Test DOM `nut-dau-trang`, `nut-mo-va-khoa`, `tao-xong-mo`, phần (a)(c) của `trang-thai-trong`; test API `tao-tra-id` → ĐỎ.
- [ ] `KhungTao`: thêm `bieuTuong?: ReactNode`, vẽ trong `Button` trước `nhanNut`.
- [ ] `TaoKeHoach`: thêm prop `dauTrang?: boolean`. Khi `dauTrang`: `bienThe="default"`, `bieuTuong={<Icon icon={Add} data-icon="inline-start" />}`, truy vấn `listTemplates` luôn bật và `khoaNut = dsKhuon.data?.length === 0`. `onSuccess: async (plan) => { …invalidate…; toast.success(m.tao.keHoach.created); openRecord({ kind: "plan", id: plan.id }); }`.
- [ ] Xuất `DanhMucHanhDong` (client) từ `tao-ke-hoach.tsx`: `<TaoKeHoach nhanNut={m.tao.keHoach.toolbar} dauTrang />`; `page.tsx` đặt nó trong `<PageShellActions>`.
- [ ] `DanhMucTable`: `actions` chỉ còn `<CachXemToggle …/>`; bảng cột cũng bỏ `TaoKeHoach` khỏi thanh công cụ.
- [ ] Thông điệp `tao.keHoach.created`: en "Plan created." / vi "Đã tạo kế hoạch.".
- [ ] `noi-bon-nut.dom.tsx` `nut-tren-thanh-cong-cu`: dựng `<><DanhMucHanhDong /><DanhMucTable /></>` ở hai cách xem, khẳng định nút mở hộp thoại có tiêu đề `m.tao.keHoach.title`.
- [ ] Chạy test DOM mới + `noi-bon-nut.dom.tsx` + `sua-luu-tru.dom.tsx`; test API `tao-tra-id` → XANH. Phá thử: bỏ `openRecord` → ĐỎ «tao xong: plan:<id>»; bỏ `khoaNut` → ĐỎ «khong khuon: nut khoa».
- [ ] Commit `fix(onboarding): nut ke hoach moi o dau trang nhu deals`.

### Task 6: Đưa vào cổng và đo màn thật

independent: false · phục vụ E1, E4, E15

- [ ] Thêm `./test/onboarding-giong-deals.dom.tsx` vào `test:dom` của `apps/app/package.json`.
- [ ] Chạy `bun _acceptance/onboarding-giong-deals/rang/man-danh-muc.mjs` trên máy chủ dev của cây này → `o=30 khang-dinh=80/80`, exit 0. Còn tiêu đề nào cắt → chỉnh tỉ lệ ở Task 1, chạy lại.
- [ ] Chạy cổng thiết kế tĩnh (`executors.test.ogd_san_thiet_ke`) → exit 0.
- [ ] Năm lệnh chứng: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- [ ] Commit `test(onboarding): dua tep dom vao test:dom`.
