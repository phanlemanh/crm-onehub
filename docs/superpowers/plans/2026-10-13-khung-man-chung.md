# Khung màn chung — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi màn giữ tiêu đề và hiện khung xương cùng hình lúc tải, bốn khung lỗi + chiến dịch về `VungTaiLoi`, nút chính tắt có dòng lý do dưới tiêu đề (NM1, hồ sơ `_acceptance/khung-man-chung`).

**Architecture:** Thêm `KhungXuong` (năm hình) vào `packages/ui`, mở rộng `VungTaiLoi` (`data-*`) và `SectionHeading` (`level={2}`); sửa thứ tự đầu trang và thêm `PageShellNote` trong `apps/app/components/page-shell.tsx`, xoá `PageShellLoading`; rồi đổi từng màn theo bảng «Hình theo màn». Đo bằng một bài quét mã (TypeScript compiler API), một bài DOM, và bàn đo màn thật.

**Tech Stack:** Next 16 App Router (`cacheComponents` bật), React 19, TanStack Query + tRPC, bun test + jsdom, puppeteer-core/Playwright cho bàn đo.

**Spec:** `docs/superpowers/specs/2026-10-13-khung-man-chung-design.md` · hợp đồng `_acceptance/khung-man-chung/contract.md` (14 AC, duyệt 13/10) · `evals.yaml` (16 eval).

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- `packages/ui` là nguồn duy nhất của thành phần; không đè `className` lên thành phần `@crm/ui` ở chỗ gọi (docs/design.md).
- Client component không nhập `@crm/auth`, `@crm/db`; `packages/ui` chỉ nhập theo subpath.
- Tệp chữ dùng chung (`apps/app/lib/messages/*.ts`, `packages/ui/src/lib/messages.ts`, `_acceptance/config.yaml`) chỉ THÊM dòng (LUAT đợt, luật 7).
- `<Suspense>` ở trang Cài đặt nằm BÊN TRONG `PageShellContent`; nút đầu trang cần dữ liệu có ranh `Suspense` nhỏ riêng trong `PageShellActions`.
- Sửa `page-shell.tsx` thì sửa cùng thay đổi vào `apps/app/test/fixtures/page-shell-truoc-width.tsx.txt`.
- Chữ «Đang tải…» kết bằng dấu ba chấm `…` (Web Interface Guidelines).
- Cổng 3000/3001 là của chủ kho; đo màn qua `tien-de.mjs`/`do:man`. Không `pkill -f`/`killall`.
- `ranh_gioi` của hàng: chỉ ghi `_acceptance/khung-man-chung/**` trong `_acceptance/`.

## Review Focus

1. **Trang `cacheComponents`:** dời `PageShellHeader` vào `page.tsx` mà đọc `getLocale()` (cookie) ngoài `Suspense` → `next build` báo truy cập dữ liệu động ngoài ranh. Mỗi `page.tsx` đổi phải theo đúng mẫu của một trang đang build được (vd `contacts/page.tsx`: `export default async function` + `await getLocale()`), và `bun run build` chạy ở cuối Task 5.
2. **Tab OKR khi đổi thẻ:** năm `page.tsx` tự dựng tiêu đề thì chuyển thẻ (client navigation) phải đổi tiêu đề đúng thẻ, không giữ tiêu đề thẻ cũ. Bài DOM không phủ được (RSC); bàn đo E12 bước 1 mở Toàn cảnh trực tiếp, và Task 5 thêm một bước đo chuyển từ «OKR của tôi» sang «Toàn cảnh» trong `chup-man.mjs`.
3. **Trang Soạn OKR:** `okr/layout.tsx` thôi dựng đầu trang, trang Soạn không có `page.tsx` dựng đầu trang → vẫn không đầu trang (như nay). Bài quét E4 liệt kê đúng năm thẻ, không quét `okr/soan/**`.
4. **Bài đo đã ký đọc `data-trang-thai`/chữ nút:** đổi khung lỗi mà mất mã hay đổi chữ «Thử lại» là đỏ ở hồ sơ khác. Task 6 chạy `bun test` của các tệp đã biết ghim (`muc-tieu-va-kr.dom.tsx`, `khoi-kr-cua-toi.dom.tsx`, `onboarding-giong-deals.dom.tsx`, `bang-cot-loi-va-nhan.dom.tsx`) ngay sau đổi.
5. **Dòng lý do và `aria-describedby` khác cây React:** nút ở `PageShellActions`, dòng ở `PageShellHeading` — `useId` hai nơi khác nhau. Dùng id cố định theo màn (hằng trong tệp chữ của màn) và bài DOM khẳng định `getElementById(aria-describedby)` trả đúng dòng.

---

### Task 1: Thành phần chung trong `packages/ui`

**Files:**
- Create: `packages/ui/src/components/khung-xuong.tsx`
- Modify: `packages/ui/src/lib/messages.ts` (thêm nhóm `khungXuong.dangTai` cho `en` và `vi`)
- Modify: `packages/ui/src/components/vung-tai-loi.tsx` (chuyển `data-*` lên `Empty`)
- Modify: `packages/ui/src/components/section-heading.tsx` (`level` 2, `id` lên thẻ tiêu đề)
- Modify: `packages/ui/package.json` chỉ khi `exports` cần mục mới (kiểm mẫu `./components/*`)
- Test: `packages/ui/test/khung-xuong.dom.tsx`

**Interfaces — Produces:**
- `export type HinhKhungXuong = "bang" | "danh-sach" | "the" | "tong-quan" | "chi-tiet"`
- `export function KhungXuong({ hinh }: { hinh: HinhKhungXuong }): JSX.Element` — khối ngoài `data-khung-xuong={hinh}` `aria-busy="true"`; phần vẽ `aria-hidden="true"`; mỗi hàng mang `data-khung-hang` (`thanh-cong-cu` · `dau-bang` · `hang` · `dong` · `the` · `o-so` · `tieu-de` · `doan`); một `<span role="status" aria-live="polite" className="sr-only">` đọc `messages(locale).khungXuong.dangTai`.
- Số vạch: `bang` 1 thanh công cụ + 1 đầu bảng + 8 `hang`; `danh-sach` 6 `dong`; `the` 2 `the` × 3 `hang`; `tong-quan` 4 `o-so` + 5 `hang`; `chi-tiet` 1 `tieu-de` + 3 `doan`. Hằng số trong một đối tượng `KHUNG_XUONG` `as const` cùng tệp.
- `VungTaiLoiProps` thêm `Omit<React.ComponentProps<"div">, "children">` được rút gọn về `{[k: \`data-${string}\`]: string | undefined}`; truyền nguyên lên `Empty`.
- `SectionHeading` nhận `level?: 2 | 3 | 4`; `id` (nếu có) đặt lên thẻ `h2/h3/h4`, không lên `div` bọc.

- [ ] **Step 1: Viết bài DOM đỏ** — `packages/ui/test/khung-xuong.dom.tsx` theo khung `kara-trang-thai-ui.dom.tsx` (`ve`, `phai`). Ma trận năm hình viết trước:

```tsx
const MA_TRAN = [
	["bang", { "thanh-cong-cu": 1, "dau-bang": 1, hang: 8 }],
	["danh-sach", { dong: 6 }],
	["the", { the: 2, hang: 6 }],
	["tong-quan", { "o-so": 4, hang: 5 }],
	["chi-tiet", { "tieu-de": 1, doan: 3 }],
] as const;
```

Mỗi hình: `data-khung-xuong`, `aria-busy`, đúng một `[role=status]` có `textContent === VI.khungXuong.dangTai`, phần vẽ `aria-hidden`, đếm `[data-khung-hang=…]` đúng bảng, 0 phần tử tabbable; năm `innerHTML` đôi một khác. Thêm: `VungTaiLoi data-trang-thai="ST-x"` → `[data-vung-tai-loi][data-trang-thai=ST-x]`; `SectionHeading level={2} id="x"` → `h2#x`, `div[data-slot=section-heading]` không có `id`; level 3/4 vẫn ra `h3`/`h4`. Thông điệp ghim: `kmc-xuong: …`, `kmc-loi: … mat data-trang-thai`, `kmc-muc: id khong nam tren h2`.

- [ ] **Step 2: Chạy đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx` → FAIL (không tìm thấy module `khung-xuong`).
- [ ] **Step 3: Cài** — `khung-xuong.tsx` dựng bằng `Skeleton` và `Card`-shell? Không: dùng `div` bố cục + `Skeleton` (thành phần nền), hàng bảng cao `h-9`, ô số `h-20`, hàng tiêu đề `h-8 w-64` + mô tả `h-4 w-96`, tất cả `max-w-full`. Thêm chữ vào `messages.ts` (`en`: «Loading…», `vi`: «Đang tải…»). Sửa `vung-tai-loi.tsx`, `section-heading.tsx`.
- [ ] **Step 4: Chạy xanh + phá-thử** — lệnh Step 2 PASS; rồi trên bản sao tạm (`.acceptance-runs/khung-man-chung/pha/`) thêm `tabIndex={0}` vào một vạch → đỏ đúng thông điệp ghim; trả lại. `bun test ./test/messages-guard.spec.ts` (packages/ui) xanh.
- [ ] **Step 5: Commit** `feat(khung-man-chung): KhungXuong năm hình, VungTaiLoi chuyển data-*, SectionHeading h2`.

Verify: lệnh Step 2 · `cd packages/ui && bun test ./test/messages-guard.spec.ts`. Phục vụ E2, E6 (một phần), E11 (một phần). `independent: true`.

### Task 2: Đầu trang chung và xoá vòng quay

**Files:**
- Modify: `apps/app/components/page-shell.tsx` (thứ tự dưới `md`, thêm `PageShellNote`, bỏ export `PageShellLoading`)
- Delete: `apps/app/components/page-shell-loading.tsx`
- Modify: `apps/app/test/fixtures/page-shell-truoc-width.tsx.txt` (cùng thay đổi, theo ghi nhớ «bản gốc ghim»)
- Test: `apps/app/test/khung-man-chung.dom.tsx` (tạo, nhóm `dau-trang`)

**Interfaces — Produces:**
- `PageShellNote(props: React.ComponentProps<"p"> & { id: string })` — `data-slot="page-shell-note"`, cùng lớp thứ tự với mô tả (đứng sau mô tả, trước nút dưới `md`; dưới mô tả từ `md`), chữ `text-muted-foreground text-sm`. Đặt trong `PageShellHeading`.
- Lớp thứ tự: `PageShellDescription` → `order-1 basis-full md:order-last`; `PageShellNote` → `order-1 basis-full md:order-last`; `PageShellActions` → `order-2 md:order-none`. (Tiêu đề `order-0`.) Giữ `basis-full` cho mô tả ở mọi khổ.

- [ ] **Step 1: Bài DOM đỏ** — nhóm `dau-trang` trong `khung-man-chung.dom.tsx`: dựng `PageShellHeader` có tiêu đề, mô tả, `PageShellNote`, hai nút; khẳng định thứ tự DOM tiêu đề → mô tả → ghi chú → nút (`compareDocumentPosition`), mô tả mang `md:order-last` và không mang `order-last` trần, nút không đứng trước mô tả. Ghim: `kmc-dau-trang: mo ta dung sau nut duoi md`.
- [ ] **Step 2: Chạy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-man-chung.dom.tsx -t dau-trang` → FAIL.
- [ ] **Step 3: Cài** — đổi `page-shell.tsx`: render tiêu đề, `PageShellHeading` (contents) chứa mô tả và ghi chú theo đúng thứ tự DOM; xoá `PageShellLoading` khỏi nhập/xuất; xoá tệp. Sửa bản ghim `.tsx.txt` đúng các dòng đổi.
- [ ] **Step 4: Chạy xanh** — Step 2 PASS; `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat.dom.tsx` PASS (bản ghim). `check-types` sẽ đỏ tới hết Task 4 (37 chỗ còn nhập) — chấp nhận trong nhánh, không commit riêng Task 2: gộp commit với Task 4.

Verify: hai lệnh Step 2/4. Phục vụ E7, E1 (một phần). `independent: false` (Task 4 phụ thuộc).

### Task 3: Bảng hình máy sinh và bài quét mã (đỏ trước)

**Files:**
- Create: `_acceptance/khung-man-chung/rang/sinh-bang-hinh.mjs`
- Create: `apps/app/test/fixtures/khung-man-chung-hinh.json` (đầu ra của script, commit)
- Create: `apps/app/test/khung-man-chung.spec.ts`
- Create: `apps/app/test/lib/quet-jsx.ts` (hàm duyệt JSX bằng `typescript` compiler API, dùng chung cho các ca quét)

**Interfaces — Produces:**
- `sinh-bang-hinh.mjs`: suy gốc kho từ `import.meta.url`; `git grep -l PageShellLoading 3a2783409 -- apps/app` → bỏ hai tệp khung → cộng `apps/app/app/(app)/[slug]/tai-lieu/page.tsx` → gán `hinh` theo bảng hằng trong script (chép từ design doc, theo thư mục) → thiếu hình thì thoát 2 «sinh-bang-hinh: thieu hinh cho <tep>» → ghi JSON `[{ "tep": "<đường đầy đủ>", "hinh": "<hinh>" }]` sắp theo `tep`.
- `quet-jsx.ts`: `docJsx(tep: string): ts.SourceFile`; `timPhanTu(sf, ten: string): ts.JsxElement[]`; `toTienCo(node, ten: string): boolean` (có tổ tiên JSX tên `ten`); `thuocTinh(node, ten): string | null`.
- `khung-man-chung.spec.ts` các ca (tên `describe` = nhóm `-t`): `khong-vong-quay` (E1), `hinh-theo-man` (E3: tập fixture = tập git grep ở sha gốc − 2 + tai-lieu; mỗi tệp có `KhungXuong hinh` đúng; không `KhungXuong` ngoài bảng), `tieu-de-ngoai-suspense` (E4), `breadcrumb-chi-tiet` (E5), `nut-giu-cho` (E13), `muc-nhac` (E11: reminders không `<h2`, 2 `SectionHeading level={2}`, `aria-labelledby` khớp). Mỗi ca hàm quét nhận `goc` (gốc cây) làm tham số; ca chiều đỏ gọi CÙNG hàm trên bản sao tạm có chèn lỗi, khẳng định thông điệp ghim (danh sách thông điệp ở `evals.yaml`).

- [ ] **Step 1:** Viết `sinh-bang-hinh.mjs`, chạy, xem 38 dòng; commit fixture.
- [ ] **Step 2:** Viết `quet-jsx.ts` + `khung-man-chung.spec.ts` đủ sáu ca và các ca chiều đỏ.
- [ ] **Step 3: Chạy đỏ** — `cd apps/app && bun test ./test/khung-man-chung.spec.ts` → FAIL ở `khong-vong-quay`, `hinh-theo-man`, `tieu-de-ngoai-suspense`, `breadcrumb-chi-tiet`, `nut-giu-cho`, `muc-nhac` (mã chưa đổi) — chiều đỏ của các ca phá-thử phải XANH ngay (chúng khẳng định thông điệp).
- [ ] **Step 4: Commit** `test(khung-man-chung): bảng hình máy sinh và bài quét mã (đỏ)`.

Verify: lệnh Step 3. Phục vụ E1, E3, E4, E5, E11, E13. `independent: true`.

### Task 4: Đổi 37 chỗ vòng quay và sáu nút giữ chỗ

**Files:** 37 tệp của `apps/app/test/fixtures/khung-man-chung-hinh.json` (trừ `tai-lieu/page.tsx`, làm ở Task 5); sáu tệp `create-*-sheet.tsx`/`add-sso-provider-sheet.tsx`.

**Luật đổi (mỗi tệp):** thay `import { …, PageShellLoading, … } from "@/components/page-shell"` bằng nhập `KhungXuong` từ `@crm/ui/components/khung-xuong`; thay `<PageShellLoading />` bằng `<KhungXuong hinh="<hinh theo fixture>" />`. `campaign-detail.tsx:381` và `to-chuc.tsx:98-105` cũng đổi (nhánh lỗi của chiến dịch ở Task 6). Sáu nút giữ chỗ: `fallback={<AddButton disabled />}` → `fallback={<Skeleton className="h-8 w-28" />}` — cỡ khớp `Button size="sm"`/mặc định của nút đó (đọc `AddButton` trước khi chọn `h-8`/`h-9`).

- [ ] **Step 1:** Đổi theo luật, đọc từng tệp trước khi sửa.
- [ ] **Step 2:** `bun run check-types` xanh; `cd apps/app && bun test ./test/khung-man-chung.spec.ts -t "khong-vong-quay|hinh-theo-man|nut-giu-cho"` xanh.
- [ ] **Step 3:** Sửa các bài cũ ghim vòng quay: `apps/app/test/to-chuc-chi-tiet.dom.tsx:322,752` (chờ `[data-khung-xuong]` thay `page-shell-loading`). Chạy tệp đó xanh.
- [ ] **Step 4: Commit** (gộp Task 2) `feat(khung-man-chung): khung xương cùng hình thay vòng quay ở 37 màn`.

Verify: Step 2–3. Phục vụ E1, E3, E13. `independent: false`.

### Task 5: Tiêu đề ngoài `Suspense`, breadcrumb màn bản ghi, đầu trang Tài liệu

**Files:**
- `tai-lieu/page.tsx`, `tai-lieu/danh-sach.tsx`, `tai-lieu/hop-tai-nguon.tsx`, Create `tai-lieu/dau-trang-tai-lieu.tsx` (client: nút Tìm nhanh, `NutTaiNguon`, Trang mới; và `DongNguonTat` cho `PageShellNote`)
- `tai-lieu/moi/page.tsx`, `tai-lieu/[trang]/page.tsx`, `tai-lieu/[trang]/sua/page.tsx`, `tai-lieu/de-xuat/[id]/page.tsx` (+ bỏ đầu trang trùng trong `man-doc.tsx`, `man-soan.tsx`, `man-duyet.tsx` chỉ phần tiêu đề tĩnh; tiêu đề tên bản ghi ở lại trong mã khách dưới breadcrumb)
- `settings/giai-doan/page.tsx` + `giai-doan` client (dời header)
- `campaigns/[campaignId]/page.tsx` (breadcrumb)
- `okr/layout.tsx`, `okr/thanh-tab.tsx`, `okr/dau-trang-hoi-y.tsx`, Create `okr/dau-trang-okr.tsx` (máy chủ: tiêu đề + mô tả theo `tab` tĩnh, `Suspense` nhỏ bọc ô chọn chu kỳ + thanh thẻ), năm `okr/**/page.tsx`
- `apps/app/lib/messages/tai-lieu.ts`, `campaigns` (chữ breadcrumb, dòng «không đọc được trạng thái») — chỉ thêm dòng
- Test: `khung-man-chung.dom.tsx` nhóm `tai-lieu`

**Interfaces — Produces:** `DauTrangOkr({ tab }: { tab: TabOkr })` (máy chủ) dùng lại `m.tieuDe[tab]`, `m.moTa[tab]`; `ThanhTabOkr` giữ client. `ID_NGUON_TAT = "tai-lieu-nguon-tat"` trong `apps/app/lib/tai-lieu-man.ts` (cạnh `TAI_LIEU_MAN`).

- [ ] **Step 1: Bài DOM đỏ** nhóm `tai-lieu` (E10): ba ô `bat=false` / `null` / `true` dựng `DauTrangTaiLieu` + `DongNguonTat` trong `PageShellHeader` với tRPC giả; khẳng định dòng nằm trong `[data-slot=page-shell-header]` ngoài `[data-slot=page-shell-actions]`, `aria-describedby` trỏ đúng id, chữ ô `null` khác rỗng và khác chữ «Chưa bật».
- [ ] **Step 2:** Chạy đỏ (`-t tai-lieu`).
- [ ] **Step 3:** Cài Tài liệu; rồi năm thẻ OKR (đọc `node_modules/next/dist/docs/` mục cache components trước khi đổi `layout.tsx`/`page.tsx`); rồi giai-doan, Trang mới; rồi breadcrumb bốn màn bản ghi (`PageShellHeader breadcrumb={…}` dùng `Breadcrumb` của `@crm/ui`, như `settings/connections/slack/page.tsx`).
- [ ] **Step 4:** `cd apps/app && bun test ./test/khung-man-chung.spec.ts -t "tieu-de-ngoai-suspense|breadcrumb-chi-tiet"` xanh; `-t tai-lieu` xanh; `bun run check-types`; `bun run build` (Review Focus 1).
- [ ] **Step 5: Commit** `feat(khung-man-chung): tiêu đề dựng ở page.tsx, breadcrumb màn bản ghi`.

Verify: Step 4. Phục vụ E4, E5, E10. `independent: false`.

### Task 6: Bốn khung lỗi và nhánh lỗi chiến dịch về `VungTaiLoi`

**Files:** `onboarding/danh-muc-table.tsx` (`loiView`, khung `ST-bangcot-loi`), `okr/toan-canh/toan-canh.tsx` (`LoiXem`), `tai-lieu/loi-tai.tsx` (`LoiTai`, mã `ST-tailieu-loi`, giữ `data-loi-tai`), `okr/trang-thai-okr.tsx` (`Loi`), `campaigns/[campaignId]/campaign-detail.tsx` (nhánh `isError` → `VungTaiLoi data-trang-thai="ST-chiendich-loi"`), tệp chữ tương ứng (thêm `moTa`/`tieuDe` còn thiếu). Test: nhóm `loi` và `chi-tiet` của `khung-man-chung.dom.tsx`.

**Interfaces — Consumes:** `VungTaiLoi({ tieuDe, moTa, onThuLai, dangTai, "data-trang-thai" })` từ Task 1.

- [ ] **Step 1: Bài DOM đỏ** — ma trận năm khung (E6) dựng qua thành phần thật (`LoiXem`, `LoiTai`, `Loi` trực tiếp; `DanhMucTable` với `manDanhMuc` lỗi, `bangCot` lỗi qua tRPC giả kiểu `onboarding-giong-deals.dom.tsx`); E5: `CampaignDetail` với `campaign.get` treo / lỗi / có dữ liệu.
- [ ] **Step 2:** Chạy đỏ (`-t loi`, `-t chi-tiet`).
- [ ] **Step 3:** Cài; `dangTai` lấy từ `isFetching` của truy vấn.
- [ ] **Step 4:** Xanh; chạy các tệp đã ghim mã (Review Focus 4): `muc-tieu-va-kr.dom.tsx`, `khoi-kr-cua-toi.dom.tsx`, `onboarding-giong-deals.dom.tsx`, `bang-cot-loi-va-nhan.dom.tsx`, `to-chuc-chi-tiet.dom.tsx`; bài nào khẳng định biểu tượng (`empty-icon`) của khung đã đổi thì sửa bài theo hình mới, không nới phép đo khác.
- [ ] **Step 5: Commit** `feat(khung-man-chung): một hình lỗi tải có nút Thử lại`.

Verify: Step 4. Phục vụ E5, E6. `independent: false`.

### Task 7: Nút chính tắt có dòng lý do

**Files:** `onboarding/page.tsx`, `onboarding/tao-ke-hoach.tsx`, `components/onboarding/khung-tao.tsx`, `onboarding/danh-muc-table.tsx` (nút khung trống `outline`), `settings/organization/page.tsx` + `hanh-dong-dau-trang.tsx`, `settings/sso/page.tsx` + `add-sso-provider-sheet.tsx`, tệp chữ (thêm câu lý do). Test: nhóm `khoa`.

**Interfaces:** mỗi màn một client `Dong<Ly do>` đọc cùng truy vấn với nút, dựng `PageShellNote id={ID_…}` khi nút tắt; id là hằng của màn.

- [ ] **Step 1: Bài DOM đỏ** — Onboarding hai chiều (khuôn rỗng / một khuôn) + khung trống một nút tô; Tổ chức và SSO ma trận 4 ô (E8, E9).
- [ ] **Step 2:** Chạy đỏ (`-t khoa`).
- [ ] **Step 3:** Cài.
- [ ] **Step 4:** Xanh; `onboarding-giong-deals.dom.tsx` xanh (khẳng định nút khung trống nếu có thì sửa theo Hỏi-2 đã duyệt).
- [ ] **Step 5: Commit** `feat(khung-man-chung): nút chính tắt có dòng lý do dưới tiêu đề`.

Verify: Step 4. Phục vụ E8, E9. `independent: false` (chạm `danh-muc-table.tsx` cùng Task 6).

### Task 8: Nhắc buổi sáng dùng `SectionHeading level={2}`

**Files:** `reminders/page.tsx`. Test: nhóm `muc` của DOM + ca `muc-nhac` của bài quét.

- [ ] **Step 1:** Đổi hai `<h2>` sang `SectionHeading level={2} id="khoi-zalo"`/`id="khoi-kenh"`.
- [ ] **Step 2:** `cd apps/app && bun test ./test/khung-man-chung.spec.ts -t muc-nhac` và DOM `-t muc` xanh.
- [ ] **Step 3: Commit** `feat(khung-man-chung): tiêu đề mục chuẩn ở Nhắc buổi sáng`.

Phục vụ E11. `independent: true`.

### Task 9: Thước đếm khung lỗi còn lại

**Files:** Create `_acceptance/khung-man-chung/rang/dem-khung-loi.mjs`.

**Interfaces:** `node dem-khung-loi.mjs [--goc <thư mục>] [--tu-kiem]` — mặc định gốc suy từ vị trí script; in «khung lỗi tự dựng còn: N» + mỗi dòng `<tệp>:<dòng>`; `--tu-kiem` dựng worktree tạm ở 3a2783409 trong `.acceptance-runs/khung-man-chung/`, đếm `N_goc`, khẳng định năm chỗ của AC-5/AC-6 có trong danh sách gốc và vắng ở HEAD, rồi chạy trên bản sao có `loi-tai.tsx` cũ và khẳng định N tăng 1 (ghim «kmc-dem: loi-tai.tsx khong duoc dem»).

- [ ] Viết, chạy hai chế độ, ghi số N vào ghi chú cho gói Cổng Bằng chứng. Phục vụ E14. `independent: true`.

### Task 10: Bàn đo màn thật

**Files:** Create `_acceptance/khung-man-chung/rang/chup-man.mjs` (chế độ chụp và `--chi-do`, `--chieu-do`); Modify `_acceptance/config.yaml` (chỉ thêm khoá `executors.test.kmc_*`, `executors.script.kmc_man`, `kmc_man_do`, `kmc_dem_loi`).

**Interfaces:** dựa trên mẫu `_acceptance/tro-ly-doc-kho/rang/man-hoi.mjs` + `tien-de.mjs` (phiên đo riêng, cảnh cây); Playwright `page.route` giữ hoặc trả 500 cho đúng thủ tục tRPC (`/api/trpc/<thu-tuc>`), đo bằng `getBoundingClientRect`, chữ bằng `innerText`.

- [ ] Viết theo năm bước của E12, thêm bước chuyển thẻ OKR (Review Focus 2). Chạy `--chi-do` qua `bun run do:man` (cần khoá? Không — đo màn không phải S4; nhưng chạy nền dài thì qua lệnh bọc `giu-nhip` nếu đang giữ khoá). Phục vụ E12, E12m. `independent: false` (cần Task 2–7).

### Task 11: Năm lệnh cổng của kho

- [ ] `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` từ gốc; đỏ thì sửa trong task gây ra. Chạy `lint:slop` sớm sau Task 1 để bắt luật anti-slop về `className`.
- [ ] Đặt `status: implemented` trong hợp đồng, commit, sang S4.

## Tự soát

- Phủ đặc tả: KhungXuong (T1), PageShellLoading xoá + thứ tự đầu trang (T2, T4), bảng hình (T3, T4), tiêu đề/breadcrumb (T5), lỗi (T6), nút tắt (T7, T5 cho Tài liệu), mục h2 (T1, T8), thước đếm (T9), ảnh màn (T10). Không mục nào thiếu task.
- Tên dùng chéo: `KhungXuong`/`HinhKhungXuong` (T1→T4,T5,T6), `PageShellNote` (T2→T5,T7), `VungTaiLoi data-trang-thai` (T1→T6), `ID_NGUON_TAT` (T5).
