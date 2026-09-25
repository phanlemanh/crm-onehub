# Khung trang Cài đặt — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi trang Cài đặt đứng trên một khung căn trái, tiêu đề và breadcrumb thống nhất, thanh bên bốn nhóm, Nhắc buổi sáng ra menu người dùng.

**Architecture:** `PageShell` nhận `width`; `PageShellHeader` nhận `breadcrumb`. Thanh bên đọc `NHOM_CAI_DAT` và dựng từ `NavItem`, `NavGroup`, `NavGroupLabel` mới trong `packages/ui`. Trang `/[slug]/reminders` ghép lại hai khối đang có; đường cũ `redirect()`.

**Tech Stack:** Next 16 App Router, React 19, Tailwind 4, bun test + happy-dom preload, puppeteer-core cho phép đo Chrome.

**Spec:** `docs/superpowers/specs/2026-09-25-khung-trang-cai-dat-design.md` · hợp đồng `_acceptance/khung-trang-cai-dat/contract.md` · bộ đo `_acceptance/khung-trang-cai-dat/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Mọi component giao diện mới hoặc biến thể mới sống trong `packages/ui`; không `className` đổi màu, góc, khoảng cách ở chỗ gọi (docs/design.md, «Vẽ tay là bậc cuối»).
- Cài shadcn vào `packages/ui` bằng `bun run ui:add <tên> --dry-run` trước, không bao giờ `--overwrite`; sửa bốn chỗ của `docs/reui.md` (import `cn` của kho, bỏ chú thích, biểu tượng Carbon, không màu/góc riêng).
- Không component `"use client"` nào import `@crm/db` hay `@crm/auth`.
- Không dời `settings/notifications/khoi-zalo.tsx`, `khoi-kenh.tsx` (ba bài kiểm đã ký import thẳng).
- `width` mặc định (không truyền) phải dựng ra đúng như trước vòng này.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: xanh trên vật lành, đỏ trên bản sao bị phá, với thông điệp ghim.

## Review Focus

- Trang con Slack › Người khi Slack chưa kết nối vẫn `redirect` về Slack — breadcrumb không được làm vỡ nhánh đó (Task 5 giữ `redirect` trước khi dựng khung).
- Dấu trang cũ `/settings/notifications?x=1` — chuyển hướng giữ đúng slug (Task 6, E12 hai slug).
- Thành viên thường mở Cài đặt — thanh bên vẫn đủ bốn nhóm, không ẩn mục (Task 3, test thanh bên không phụ thuộc vai).
- Tên kết nối bị trình duyệt tự dịch («Google» → chữ khác) — `translate="no"` trên `h1` (Task 5, E4).
- Khổ 375 với tên nhóm dài «Kết nối và dữ liệu» — nhãn nhóm ẩn dưới `md`, hàng cuộn ngang không tràn (Task 3, E8).

---

### Task 1: `packages/ui` — breadcrumb và biến thể thanh điều hướng

`independent: false` · phục vụ E5, E7, E17 (AC-5, AC-6, AC-13)

**Files:**
- Create: `packages/ui/src/components/breadcrumb.tsx` (qua `ui:add breadcrumb`)
- Modify: `packages/ui/src/components/nav-item.tsx`
- Test: `packages/ui/test/khung-trang-cai-dat-ui.dom.tsx`

**Interfaces — Produces:**
- `Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator` (shadcn, `BreadcrumbLink` có `asChild`).
- `NavItem` thêm prop `orientation?: "vertical" | "horizontal"` (mặc định `vertical` = như cũ; `horizontal` = `w-auto shrink-0`).
- `NavGroup({children})` → `<div data-slot="nav-group" role="group" aria-labelledby>`; `NavGroupLabel({id, children})` → `<p data-slot="nav-group-label">` chữ `text-xs font-medium text-muted-foreground px-3 pb-1`.

- [ ] Step 1: `cd packages/ui && bun run ui:add breadcrumb --dry-run`; đọc danh sách tệp; chỉ tạo mới `breadcrumb.tsx` (không đè tệp nào). Rồi chạy thật không `--overwrite`.
- [ ] Step 2: sửa `breadcrumb.tsx`: `import { cn } from "@crm/ui/lib/utils"`, bỏ chú thích, thay `ChevronRight`/`MoreHorizontal` của lucide bằng `@carbon/icons-react/es/ChevronRight` và `OverflowMenuHorizontal` qua `Icon`; gỡ gói `cn` khỏi `package.json` nếu CLI thêm.
- [ ] Step 3: test DOM đỏ trước: `NavItem orientation="horizontal"` có class `w-auto` và `shrink-0`, không có `w-full`; `NavGroupLabel` có `data-slot="nav-group-label"`; `NavGroup` có `role="group"` trỏ `aria-labelledby` đúng id nhãn.
- [ ] Step 4: sửa `nav-item.tsx` cho xanh.
- [ ] Step 5: verify `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-trang-cai-dat-ui.dom.tsx` xanh; bản sao bỏ `shrink-0` → đỏ «horizontal: thiếu shrink-0».
- [ ] Step 6: commit `feat(ui): breadcrumb của shadcn, nhãn nhóm và kiểu hàng ngang cho NavItem`.

### Task 2: khung trang — `width` và ô `breadcrumb`

`independent: false` · phục vụ E1, E5 (AC-1, AC-5)

**Files:**
- Modify: `apps/app/components/page-shell.tsx`
- Create: `apps/app/lib/cai-dat-breadcrumb.ts`, `apps/app/components/cai-dat-breadcrumb.tsx`
- Test: `apps/app/test/khung-trang-cai-dat.dom.tsx` (`-t be-rong`, `-t breadcrumb`)

**Interfaces — Produces:**
- `PageShell({ width?: "narrow" | "page" | "wide" | "full", contained?, className, ...div })`. Bảng lớp: `narrow: "max-w-(--container-narrow)"`, `page: "max-w-(--container-page)"`, `wide: "max-w-(--container-page-wide)"`, `full: ""` — bốn giá trị KHÔNG có `mx-auto`; vắng `width` → `"mx-auto max-w-7xl"` như cũ.
- `PageShellHeader({ breadcrumb?: ReactNode, ... })` — `breadcrumb` vẽ trước lưới tiêu đề, trong `<header>`; vắng thì DOM y như cũ.
- `duongCaiDat(pathname: string, locale: Locale): { nhan: string; href: string | null }[] | null` trong `lib/cai-dat-breadcrumb.ts` — trả chuỗi breadcrumb cho sáu trang con Kết nối, `null` cho mọi đường khác; `href` null là mục cuối.
- `CaiDatBreadcrumb({ cap })` client component dựng `Breadcrumb` của `@crm/ui` với `Link` của Next cho mục có `href`, `BreadcrumbPage` cho mục cuối.

- [ ] Step 1: test đỏ `be-rong`: ma trận 5 giá trị × [lớp max-w, có/không mx-auto] = 10; dựng cây đầu trang không width, không breadcrumb bằng bản hiện tại và bằng bản merge-base (`git show $(git merge-base HEAD origin/onehub):apps/app/components/page-shell.tsx > test/.tam/page-shell-goc.tsx` trong `beforeAll`, import động) → `outerHTML` bằng nhau.
- [ ] Step 2: test đỏ `breadcrumb`: 6 đường trang con × [chuỗi nhãn đúng, mục trước là `<a>` href đúng cha, mục cuối `aria-current="page"` không phải `<a>`] = 18; 10 đường mục → `duongCaiDat` trả `null` và header không có `nav[aria-label]` breadcrumb = 10.
- [ ] Step 3: cài đặt `page-shell.tsx`, `cai-dat-breadcrumb.ts`, `cai-dat-breadcrumb.tsx`; nhãn breadcrumb lấy từ `ketNoiMessages(locale)` (`danhSach.tieuDe`, `ten.*`, `tiepNhan.tieuDe`, nhãn «Người» của trang người khớp).
- [ ] Step 4: verify `bun run` của `ktcd_be_rong` và `ktcd_breadcrumb` xanh; hai bản sao phá (giữ `mx-auto` cho page; mục cuối là `<a>`) đỏ đúng thông điệp của evals.yaml.
- [ ] Step 5: commit `feat(app): PageShell nhận width và ô breadcrumb`.

### Task 3: thanh bên bốn nhóm và nhãn

`independent: false` · phục vụ E7, E9, E15 (AC-6, AC-7, AC-11)

**Files:**
- Modify: `apps/app/lib/cai-dat-dieu-huong.ts`, `apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx`, `apps/app/lib/messages/settings.ts`, `apps/app/test/cai-dat-dieu-huong.spec.ts`
- Test: `apps/app/test/khung-trang-cai-dat-thanh-ben.dom.tsx`, `apps/app/test/khung-trang-cai-dat.spec.ts` (`-t nhan`)

**Interfaces — Produces:**
- `NHOM_CAI_DAT: readonly { khoa: keyof SettingsMessages["nhomThanhBen"]; muc: readonly MucCaiDat[] }[]` theo đúng thứ tự của hợp đồng; `MUC_CAI_DAT = NHOM_CAI_DAT.flatMap((n) => n.muc)`; bỏ mục `thongBaoCuaBan`.
- Tin nhắn mới: `thanhBen.nhan` = «Cài đặt»/«Settings»; `nhomThanhBen.{khongGian, conNguoi, ketNoiDuLieu, baoMat}` = «Không gian làm việc»/«Workspace», «Con người»/«People», «Kết nối và dữ liệu»/«Connections & data», «Bảo mật»/«Security»; `chung`, `tieuDeTab.chung`, `chung.tieuDe` vi = «Chung»; `congTy.tieuDe` vi = «Không gian làm việc»; `chung.moTa` vi = «OneHub là ai, và tác nhân nghiên cứu nghĩ bằng model nào.»; xoá khoá `thanhBen.thongBaoCuaBan`.
- `SettingsSidebar` và `SettingsSidebarFallback` dựng cùng một hàm vẽ nhóm; desktop `NavGroup` + `NavGroupLabel` + `NavItem`; hẹp `NavItem orientation="horizontal"`.

- [ ] Step 1: sửa `cai-dat-dieu-huong.spec.ts` ca `loi-vao-dieu-phoi`: `MUC_CAI_DAT.at(-1)` → mục cuối của nhóm `conNguoi`; giữ tên bài và mọi khẳng định khác.
- [ ] Step 2: test đỏ thanh bên (mock `next/navigation` với `usePathname` đổi theo ca, `useParams` → `{slug:"ws"}`): 16 đường × [đúng một `aria-current`, đúng tên mục] = 32; bốn nhóm đúng tên, đúng thứ tự; mười mục đúng thứ tự; mọi mục `data-slot=nav-item`; vỏ tải cùng số nhóm và thứ tự mục; không có href `/ws/settings/notifications`.
- [ ] Step 3: test đỏ `nhan` theo E9 (19 khẳng định).
- [ ] Step 4: cài đặt; `mucCaiDatDangMo` giữ nguyên hành vi `startsWith` (trang con Kết nối sáng «Kết nối»).
- [ ] Step 5: verify `ktcd_thanh_ben`, `ktcd_nhan`, `lv30_loi_vao_cai_dat`, `lv30_nhan_hai_thu_tieng`, `bun test test/messages-guard.spec.ts` xanh; bản sao làm `mucCaiDatDangMo` khớp mọi đường → đỏ «2 muc aria-current».
- [ ] Step 6: commit `feat(app): thanh bên Cài đặt bốn nhóm, nhãn Cài đặt và Chung`.

### Task 4: mười trang mục dùng `width`

`independent: false` · phục vụ E2, E3 (AC-2, AC-3)

**Files — Modify:** `settings/page.tsx` (page), `tracking/page.tsx` (page), `currencies/page.tsx` (page), `fields/page.tsx` (wide), `members/page.tsx` (wide), `api-keys/page.tsx` (wide), `sso/page.tsx` (wide), `onboarding/page.tsx` (wide), `organization/page.tsx` (full), `connections/page.tsx` (page — xem Task 5).

- [ ] Step 1: mỗi tệp thêm `width` đúng bảng; bỏ lớp bọc `<div className="flex max-w-3xl flex-col gap-6">` thành `<div className="flex flex-col gap-6">` ở `page.tsx`, `currencies`, `tracking` (Thông báo đi Task 6).
- [ ] Step 2: verify `bun run check-types` và `bunx biome check` trên các tệp; E2 chạy sau Task 7.
- [ ] Step 3: commit `feat(app): mười trang Cài đặt chọn bề rộng qua PageShell`.

### Task 5: Kết nối — danh sách và sáu trang con

`independent: false` · phục vụ E2, E4, E6 (AC-2, AC-4, AC-5)

**Files — Modify:** `connections/page.tsx`, `connections/oauth-connection-page.tsx`, `connections/google/page.tsx`, `connections/microsoft/page.tsx`, `connections/google-connection.tsx`, `connections/microsoft-connection.tsx`, `connections/slack/page.tsx`, `connections/slack/people/page.tsx`, `connections/zalo/page.tsx`, `connections/zalo/ket-noi-zalo-than.tsx`, `connections/intake/page.tsx` · **Delete:** `connections/connection-page.tsx`.

- [ ] Step 1: danh sách: `<main>` → `PageShell width="page"`, `PageShellHeader` với tiêu đề/mô tả, nút «Thêm kết nối» vào `PageShellActions`; nhánh chưa có kết nối giữ nội dung, bỏ `h1` riêng (tiêu đề trang đã có); vỏ tải → `PageShellLoading` trong `PageShell`.
- [ ] Step 2: `OAuthConnectionPage` nhận `title` (tên đã dịch) và `pathname` để dựng `PageShell width="page"` + `PageShellHeader breadcrumb` + `PageShellTitle translate="no"`; vỏ tải dùng `PageShellLoading`.
- [ ] Step 3: `google-connection.tsx`, `microsoft-connection.tsx`: `CardTitle` của thẻ đã cắm chỉ còn `StatusIndicator` (bỏ `<span translate="no">{t.ten.*}</span>`); các thẻ chưa cắm/không có cấu hình cũng bỏ tên lặp.
- [ ] Step 4: Slack (cả hai nhánh), Slack › Người, Zalo, Intake: `ConnectionPage` → `PageShell width` (Intake `narrow`), `h1` tự vẽ → `PageShellTitle` trong `PageShellHeader` có `breadcrumb`; «Ngắt kết nối» vào `PageShellActions`; «Chưa cắm» xuống đầu thân trang; `ket-noi-zalo-than.tsx` bỏ `h1` riêng (tiêu đề ở trang). `redirect` của Slack › Người giữ trước khi dựng khung.
- [ ] Step 5: xoá `connection-page.tsx`; `git grep ConnectionPage` rỗng.
- [ ] Step 6: verify `check-types`, `biome`, các bài DOM đã ký của Zalo (`nqz_*`, `nzm_*`, `ltz_*`) xanh.
- [ ] Step 7: commit `feat(app): Kết nối dùng khung chung, tiêu đề và breadcrumb cho trang con`.

### Task 6: Nhắc buổi sáng ra menu người dùng

`independent: false` · phục vụ E10, E11, E12, E13, E14 (AC-8, AC-9, AC-10)

**Files:**
- Create: `apps/app/app/(app)/[slug]/reminders/page.tsx`
- Modify: `settings/notifications/page.tsx` (thành chuyển hướng), `apps/app/components/app-header.tsx`, `apps/app/lib/messages/khung-ung-dung.ts` (`header.nhacBuoiSang` = «Nhắc buổi sáng»/«Morning reminders»), `apps/app/lib/messages/nhac-qua-zalo.ts` (`tieuDe` = «Nhắc buổi sáng»/«Morning reminders»), `connections/zalo/page.tsx` (`hrefThongBao` → `/${slug}/reminders`), `CONTEXT.md` (mục Nối Zalo), `docs/settings.md` (bảng width thêm Điều phối và danh sách Kết nối).
- Test: `apps/app/test/khung-trang-cai-dat-menu.dom.tsx`, `apps/app/test/khung-trang-cai-dat.spec.ts` (`-t chuyen-huong`)

- [ ] Step 1: test đỏ menu (E10) và chuyển hướng (E12).
- [ ] Step 2: `reminders/page.tsx` = nội dung cũ của trang Thông báo trong `PageShell width="page"`, import `KhoiZalo`, `KhoiKenh` từ `../settings/notifications/…`; `generateMetadata` dùng `tieuDe` mới.
- [ ] Step 3: `settings/notifications/page.tsx` = `export default async function({params}) { const { slug } = await params; redirect(\`/${slug}/reminders\`) }`.
- [ ] Step 4: `app-header.tsx`: `DropdownMenuItem asChild` + `Link href={workspaceUrl("/reminders")}` + `Icon Alarm`, đặt ngay trước mục đổi giao diện.
- [ ] Step 5: sửa `CONTEXT.md`, `docs/settings.md`.
- [ ] Step 6: verify `ktcd_menu_nguoi_dung`, `ktcd_chuyen_huong`, bài DOM đã ký của Zalo xanh.
- [ ] Step 7: commit `feat(app): Nhắc buổi sáng ra menu người dùng, đường cũ chuyển hướng`.

### Task 7: răng đo và sửa E17 của nhac-qua-zalo

`independent: false` · phục vụ E2, E3, E4, E6, E8, E11, E13, E14, E16, E17 (AC-2, AC-3, AC-4, AC-5, AC-6, AC-8, AC-9, AC-10, AC-12, AC-13)

**Files — Create:** `_acceptance/khung-trang-cai-dat/rang/{cau-truc.mjs, tai-lieu.mjs, san-thiet-ke.mjs, khong-hoi-quy.mjs, man-chrome.mjs}` · **Modify:** `_acceptance/nhac-qua-zalo/evals.yaml` (E17 bước mở `/reminders`, dòng 5 → «menu người dùng có mục "Nhắc buổi sáng"»).

- [ ] Step 1: `cau-truc.mjs` — `BANG_BE_RONG` 17 đường; đọc `page.tsx` bằng bộ phân tích TS (`typescript` có sẵn trong kho) lấy thuộc tính `width` của phần tử `PageShell`; đếm 5 mẫu cấm trên cây `settings/`; đếm tệp phải bằng 17.
- [ ] Step 2: `tai-lieu.mjs` — tách mục in đậm của `CONTEXT.md`, đọc đúng mục **Nối Zalo**; đọc bảng width của `docs/settings.md`.
- [ ] Step 3: `san-thiet-ke.mjs` — danh sách tệp giao diện từ `git diff --name-only $(git merge-base HEAD origin/onehub)`; chạy `design-gate --mode static`; đọc JSX của `settings-sidebar.tsx` bằng bộ phân tích TS, cấm thuộc tính `className` trên `NavItem`, `NavGroupLabel`, `Button`; kiểm `breadcrumb.tsx`.
- [ ] Step 4: `khong-hoi-quy.mjs` — theo khuôn `to-chuc-danh-sach-chi-tiet/rang/khong-hoi-quy.mjs`: 11 hồ sơ, chạy eval test/script, so tên bài merge-base↔HEAD, cho phép đúng ca AC-11; tập ui-check bị đụng = {nhac-qua-zalo E17, noi-zalo-cho-nguoi-moi E19}.
- [ ] Step 5: `man-chrome.mjs` — theo khuôn `to-chuc-danh-sach-chi-tiet/rang/man-chi-tiet.mjs` (canhCay, dev:session quản trị, hai lần gieo), ma trận `KY_MONG` 124 + E4 38 + E6 12 + E8 4 + E11 5 + E13 1.
- [ ] Step 6: mỗi răng: chạy xanh trên HEAD, rồi chạy trên bản sao phá ở `.acceptance-runs/khung-trang-cai-dat/` (symlink `node_modules`) → đỏ đúng thông điệp ghim của evals.yaml.
- [ ] Step 7: commit `test(khung-trang-cai-dat): răng đo cấu trúc, tài liệu, sàn thiết kế, không hồi quy, màn Chrome`.
