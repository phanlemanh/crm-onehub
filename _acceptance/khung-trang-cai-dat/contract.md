---
schema_version: 1
feature: Khung trang Cài đặt — một khung căn trái cho mọi trang, đầu trang và breadcrumb thống nhất, thanh bên bốn nhóm, Nhắc buổi sáng dời ra menu người dùng
slug: khung-trang-cai-dat
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-09-25-khung-trang-cai-dat-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-25
---

# Acceptance Contract: khung-trang-cai-dat

## Context

Audit Cài đặt 25/09: mười một mục dựng theo ba khung trang, bốn bề rộng, ba cỡ tiêu đề; hai trang không có `h1`; chuyển tab làm mép trái nhảy khoảng 145px. Chủ kho chốt khuôn đích ở `docs/settings.md` (PR #131). Vòng này là đợt 1 của khuôn đó: khung trang, đầu trang, breadcrumb, thanh bên, và dời «Nhắc buổi sáng» ra menu người dùng. Nội dung bên trong thẻ để đợt 2–5.

Source input: yêu cầu chủ kho 2026-09-25, `docs/settings.md`, đặc tả `docs/superpowers/specs/2026-09-25-khung-trang-cai-dat-design.md`.

## Criteria

- AC-1: Given `PageShell`, When dựng với `width` là `narrow`, `page`, `wide` hoặc `full`, Then khối nội dung mang đúng bề rộng `--container-narrow`, `--container-page`, `--container-page-wide`, hoặc cả vùng nội dung; And cả bốn giá trị căn trái; And không truyền `width` thì đầu trang và khối nội dung dựng ra giống hệt bản trước vòng này, nên 23 trang ngoài Cài đặt không đổi.
- AC-2: Given mọi `page.tsx` dưới `settings/` và trang `reminders`, When đọc mã, Then mỗi trang dựng `PageShell` với `width` đúng bảng của đặc tả; And trong cây `settings/` không còn `ConnectionPage`, `ConnectionPageLoading`, thẻ `<main>`, `<h1>` tự vẽ, hay `max-w-3xl`.
- AC-3: Given quản trị mở lần lượt 16 trang Cài đặt (10 mục thanh bên và 6 trang con Kết nối), When đo trên trình duyệt thật của cây đang xét ở khổ 1920, 1440 và 768, Then mỗi trang có đúng một `h1`; And cạnh trái của `h1` trùng nhau trên cả 16 trang ở cùng khổ (lệch không quá 1px), kể cả Tổ chức ở khổ 1920; And cạnh trên của `h1` trùng nhau trong 10 trang mục, và trùng nhau trong 6 trang con (trang con thấp hơn đúng chiều cao dòng breadcrumb cộng khoảng cách đã khai); And ở khổ 375 không trang nào trong 16 trang và trang Nhắc buổi sáng tràn ngang.
- AC-4: Given sáu trang con Kết nối (Google, Microsoft, Slack đã và chưa kết nối, Slack › Người, Zalo, Intake), When mở, Then `h1` là tên trang con (tên kết nối, «Điểm nhận dữ liệu», «Người»), tên thương hiệu mang `translate="no"`; And tiêu đề thẻ của Google và Microsoft không lặp tên nhà cung cấp; And nút «Ngắt kết nối» của Slack và nút «Thêm» của danh sách Kết nối nằm trong vùng hành động đầu trang; And chữ «Chưa cắm» của Slack chưa kết nối nằm trong thân trang.
- AC-5: Given sáu trang con Kết nối, When mở, Then phía trên tiêu đề có breadcrumb «Kết nối › <tên>» («Kết nối › Slack › Người» cho trang người khớp); And mọi mục trước mục cuối là liên kết `<a>` tới đúng trang cha; And mục cuối là chữ mang `aria-current="page"`; And mười trang mục thanh bên không có breadcrumb.
- AC-6: Given thanh bên Cài đặt, When mở ở từng đường trong 16 trang, Then thanh bên có bốn nhóm theo thứ tự Không gian làm việc (Chung · Tiền tệ · Trường), Con người (Thành viên · Tổ chức · Điều phối 30 ngày), Kết nối và dữ liệu (Kết nối · Theo dõi & phân tích), Bảo mật (SSO · Khoá API); And đúng một mục mang `aria-current="page"` — «Kết nối» khi ở mọi trang con Kết nối; And mỗi mục là `NavItem`; And từ khổ 768 trở lên có nhãn nhóm, dưới 768 là một hàng cuộn ngang không nhãn nhóm; And vỏ tải có cùng số nhóm và cùng thứ tự mục; And không còn mục «Thông báo của bạn».
- AC-7: Given tiếng Việt và tiếng Anh, When đọc nhãn, Then nhãn của thanh là «Cài đặt» / «Settings»; And mục đầu, tiêu đề trang đầu và tên tab của nó là «Chung» / «General»; And thẻ đầu của trang Chung có tiêu đề «Không gian làm việc» (tiếng Anh giữ «Workspace») và mô tả trang tiếng Việt nói «OneHub», không nói «Công ty bạn»; And chữ «Tổng quan», «Cài đặt công ty» và tiêu đề thẻ «Công ty» không còn trong các tệp chữ của Cài đặt.
- AC-8: Given một thành viên bất kỳ, When mở menu người dùng, Then có mục «Nhắc buổi sáng» / «Morning reminders» nằm trên dòng đổi giao diện, là liên kết tới `/<slug>/reminders`, tới được bằng bàn phím; And trang đó có `h1` «Nhắc buổi sáng», hai khối nối Zalo và chọn kênh đang có, và không có thanh bên Cài đặt; And liên kết «Nối Zalo của tôi» ở Kết nối › Zalo trỏ tới trang đó.
- AC-9: Given đường cũ `/<slug>/settings/notifications`, When mở, Then trình duyệt được chuyển tới `/<slug>/reminders` với đúng slug, không vẽ trang nào trước đó.
- AC-10: Given `CONTEXT.md` và `docs/settings.md`, When đọc, Then mục **Nối Zalo** nói việc nối làm ở trang «Nhắc buổi sáng» trong menu người dùng, không còn «Thông báo của bạn trong Cài đặt»; And bảng bề rộng của `docs/settings.md` có Điều phối 30 ngày và danh sách Kết nối.
- AC-11: Given lời hứa đã ký của `loi-vao-dieu-phoi-30-ngay` «Điều phối 30 ngày đứng cuối thanh bên», When chạy lại bài kiểm của nó sau vòng này, Then bài kiểm đã sửa đo lời hứa mới «Điều phối 30 ngày đứng cuối nhóm Con người» và xanh; And phần còn lại của lời hứa (đường dẫn, mục sáng, nhãn hai thứ tiếng) giữ nguyên tên bài và xanh; And hồ sơ được ghim lại bằng làn máy.
- AC-12: Given các hồ sơ đã ký đo tệp vòng này chạm (`nhac-qua-zalo`, `noi-zalo-cho-nguoi-moi`, `loi-tac-tu-zalo-noi-dung-nguyen-nhan`, `loi-vao-dieu-phoi-30-ngay`, `cai-dat-con-lai-noi-tieng-viet`, `man-cai-dat-noi-tieng-viet`, `tong-quan-va-khung-noi-tieng-viet`, `onboarding-giong-deals`, `truong-tu-tao-o-cai-dat`, `to-chuc-danh-sach-chi-tiet`, `zalo-goi-thu-hong-hien-dung-bot`), When chạy lại mọi eval `test`/`script` của chúng, Then mọi eval xanh, trừ đúng bài AC-11 đổi có chủ đích; And eval nhìn-thấy E17 của `nhac-qua-zalo` được sửa theo lời hứa mới (menu người dùng có «Nhắc buổi sáng», mở `/reminders`); And tập eval nhìn-thấy có `paths` chạm diff của vòng này đúng bằng danh sách khai trong phép đo (10 eval ở 6 hồ sơ: `nhac-qua-zalo` E17, `noi-zalo-cho-nguoi-moi` E19, `tong-quan-va-khung-noi-tieng-viet` E18, `truong-tu-tao-o-cai-dat` E5 · E6 · E12 · E14 · E22, `to-chuc-danh-sach-chi-tiet` E17, `zalo-goi-thu-hong-hien-dung-bot` E8), trong đó chỉ E17 và E19 đổi lời hứa; sáu hồ sơ đó được ghi là phải đi một vòng chấm lại riêng.
- AC-13: Given các tệp giao diện vòng này chạm, When chạy cổng thiết kế tĩnh và quét mã, Then không có vi phạm; And `settings-sidebar.tsx` không truyền `className` lên `NavItem`, `Button` hay nhãn nhóm — nhãn nhóm và kiểu hàng ngang (khổ hẹp) là biến thể trong `packages/ui/src/components/nav-item.tsx`; And `packages/ui/src/components/breadcrumb.tsx` là bản shadcn đã sửa đủ bốn chỗ của `docs/reui.md` (import `cn` của kho, không chú thích, biểu tượng Carbon, không màu hay góc riêng).

## Coverage

Chân sản phẩm: khuôn đích [SUY-TỪ-REPO: docs/settings.md]; khung trang hiện có [SUY-TỪ-REPO: apps/app/components/page-shell.tsx], [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/settings/connections/connection-page.tsx]; thanh bên [SUY-TỪ-REPO: apps/app/lib/cai-dat-dieu-huong.ts]; từ điển [SUY-TỪ-REPO: CONTEXT.md]. Chân ngành: [NGÀNH: Twenty — thanh bên cài đặt chia nhóm User/Workspace/Other, breadcrumb «Workspace / Security» trên tiêu đề], [NGÀNH: v0 — nhóm Account/Workspace, cột nội dung căn trái cạnh thanh bên], [NGÀNH: Railway — cột nội dung một bề rộng cạnh thanh bên].

- Trục A — loại trang: mục thanh bên (10) | trang con Kết nối (6) | trang cá nhân (Nhắc buổi sáng) | đường cũ (chuyển hướng). [thước CE: cây `settings/**/page.tsx` + đặc tả]
- Trục B — phần khung: bề rộng và căn | đầu trang (h1, mô tả, hành động) | breadcrumb | thanh bên (nhóm, mục sáng) | điểm vào (menu người dùng, liên kết Zalo). [thước CE: năm mục của `docs/settings.md` đợt 1]
- Trục C — khổ: rộng ≥ 768 (thanh bên dọc) | hẹp < 768 (hàng ngang); đo ở 1920, 1440, 768, 375. [thước CE: breakpoint `md` của `settings-sidebar.tsx`]
- Trục D — tiếng: vi | en. [thước CE: `lib/messages/settings.ts`]
- Cross-cutting: vỏ tải cùng hình, bàn phím, `translate="no"`, không hồi quy mười một hồ sơ đã ký.
- Core: AC-1 … AC-13. Later/Never: xem Out of scope và sổ quyết định.
- [NGÀNH] Twenty và v0 giữ cài đặt cá nhân trong thanh bên (nhóm User/Account); chủ kho chọn menu người dùng — ghi để người duyệt thấy, không lật.
- [GIẢ ĐỊNH] Đường mới của Nhắc buổi sáng là `/<slug>/reminders` (đường tiếng Anh như mọi đường khác của app).
- [GIẢ ĐỊNH] Điều phối 30 ngày dùng `wide`, danh sách Kết nối dùng `page` — hai trang `docs/settings.md` chưa xếp.
- [GIẢ ĐỊNH] Trang Intake và Slack chưa kết nối (hôm nay căn giữa cả hai chiều) căn trái như mọi trang.
- [GIẢ ĐỊNH] Breadcrumb chỉ có ở trang con (hướng B của design-pass); trang mục không mang dòng «Cài đặt › …». Hướng A để ở bản mẫu `ST-phuong-an-a`.

## Out of scope

- Nội dung trong thẻ: dòng `Field`, hai luật lưu, danh sách `Item`, bốn trạng thái — đợt 2–4 của `docs/settings.md`.
- `ConnectionHeader` (logo + trạng thái trong đầu trang) và gộp Google/Microsoft — đợt 5.
- Chia nhóm danh sách Kết nối — xét lại khi có từ sáu kết nối.
- Dời `khoi-zalo.tsx`, `khoi-kenh.tsx` khỏi thư mục `settings/notifications` — ba bài kiểm đã ký import thẳng đường đó.
- Chấm lại 10 eval nhìn-thấy có `paths` chạm diff của vòng này (sáu hồ sơ, xem AC-12) — vòng riêng của từng hồ sơ.
- Chốt quyền ba thao tác của trang Chung — phiên riêng đã mở.

## Notes

- Không chạm đường T3: `packages/auth`, `packages/db/prisma`, và bảy module API bị khoá đều ngoài diff.
- Đường nền 25/09: suite `executors.test.api` đỏ ở lượt đầu, chạy lại trên cây sạch xanh 11/11 — đỏ chập chờn, không phải lỗi của vòng. Hai dòng «THIEU merge-base» là báo nhầm của bộ kit, chip đã mở sang `acceptance-gate-kit`.
