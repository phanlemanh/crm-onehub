---
schema_version: 1
feature: "Màn nào đang tải cũng giữ tiêu đề, lỗi tải ở đâu cũng một hình có nút thử lại, và đầu trang không có nút chính tắt mà không nói vì sao"
slug: khung-man-chung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-13T01:06:41Z
design_doc: docs/superpowers/specs/2026-10-13-khung-man-chung-design.md
---

# Acceptance Contract: khung-man-chung

## Context

Hàng NM1 của `docs/plan/lo-trinh-okr.json`, dãy P4 của đợt r2, mốc 31/10/2026. Đích đã ghi ở `docs/design.md`
mục «Nếp màn trong app» (khung trang · chờ tải và lỗi tải) và `docs/settings.md` mục «Trạng thái». Kiểm kê
13/10: 37 chỗ quay `PageShellLoading`, bảy màn mất tiêu đề khi tải, năm thẻ OKR chờ bốn truy vấn mới hiện
tiêu đề, bốn khung lỗi bốn hình, chi tiết chiến dịch quay mãi khi lỗi, ba nút chính tắt không lý do, đầu
trang dưới 768 px đặt nút trên câu mô tả. Hạng T2: chỉ chạm `apps/app` và `packages/ui`.

Source input: hàng NM1 (`cau_giao`, `ghi_chu`) · `opportunity.md` (Cổng Đáng ký build 12/10) · `docs/design.md`
· `docs/settings.md` · design doc.

## Criteria

- AC-1: Given mã nguồn `apps/app` và `packages/ui`, When quét mọi tệp `.tsx`, Then không tệp nào nhập hay định nghĩa `PageShellLoading`, tệp `apps/app/components/page-shell-loading.tsx` không còn, và không fallback `Suspense` nào trong `apps/app/app/**/page.tsx` là một `Spinner`.
- AC-2: Given `KhungXuong` trong `packages/ui` với mỗi `hinh` ∈ {`bang`, `danh-sach`, `the`, `tong-quan`, `chi-tiet`}, When dựng, Then khối ngoài mang `aria-busy="true"` và `data-khung-xuong="<hinh>"`, phần vẽ mang `aria-hidden="true"`, có đúng một phần tử `role="status"` đọc «Đang tải…», và năm hình cho năm cây DOM khác nhau với số vạch đúng bảng ở design doc (`bang`: 1 thanh công cụ + 1 hàng đầu + 8 hàng; `danh-sach`: 6 dòng; `the`: 2 thẻ × 3 hàng; `tong-quan`: 4 ô số + 5 hàng; `chi-tiet`: 1 hàng tiêu đề + 3 đoạn); và không phần tử nào trong khung nhận được tiêu điểm bàn phím (0 phần tử có thể Tab tới), nên người dùng bàn phím không dừng trên vạch xám.
- AC-3: Given tập chỗ cần đổi là mọi tệp `apps/app` chứa `PageShellLoading` ở `onehub` 3a2783409 (`git grep -l`, 39 tệp) trừ hai tệp định nghĩa nó (`page-shell.tsx`, `page-shell-loading.tsx`), cộng `tai-lieu/page.tsx` — 38 tệp, mỗi tệp một hình theo bảng «Hình theo màn» của design doc — When quét mã, Then tập tệp của bảng hình bằng đúng tập đó, mỗi tệp có fallback là `KhungXuong` với đúng `hinh` của bảng, và không tệp nào ngoài bảng dùng `KhungXuong`.
- AC-4: Given các màn có tiêu đề tĩnh — mọi `page.tsx` trong bảng «Hình theo màn» trừ bốn màn `chi-tiet` có tiêu đề theo dữ liệu (chiến dịch, Đọc trang, Sửa trang, Duyệt đề xuất) — When quét mã, Then `page.tsx` của màn đó dựng `PageShellTitle` và `PageShellDescription` (trực tiếp hay qua một thành phần máy chủ cùng thư mục không nằm trong `Suspense`), và không `PageShellTitle` nào của màn đó nằm trong cây con của một `Suspense`; `okr/layout.tsx` không còn dựng `PageShellTitle`.
- AC-5: Given bốn màn bản ghi có tiêu đề theo dữ liệu (chi tiết chiến dịch, Đọc trang, Sửa trang, Duyệt đề xuất), When truy vấn bản ghi đang chạy, Then `page.tsx` của màn đã dựng ngoài mọi `Suspense` một `breadcrumb` có chữ trỏ về danh sách cha («Chiến dịch», «Tài liệu»), và dưới nó là `KhungXuong hinh="chi-tiet"` có hàng tiêu đề giữ chỗ; When truy vấn chi tiết chiến dịch trả lỗi, Then breadcrumb vẫn đứng, màn dựng `VungTaiLoi` mang `data-trang-thai="ST-chiendich-loi"` thay vì quay mãi, và bấm «Thử lại» gọi lại truy vấn đó.
- AC-6: Given `VungTaiLoi` nhận thuộc tính `data-trang-thai`, When bốn khung lỗi của hàng (`loiView` và `ST-bangcot-loi` của Onboarding, `LoiXem` của Toàn cảnh OKR, `LoiTai` của Tài liệu, `Loi` của `trang-thai-okr.tsx`) gặp truy vấn lỗi, Then mỗi khung dựng `[data-vung-tai-loi]` có tiêu đề, một câu mô tả và nút «Thử lại»; mã `data-trang-thai` cũ của khung được giữ nguyên (`ST-danhmuc-loi`, `ST-bangcot-loi`, mã do người gọi `LoiXem` truyền, `ST-donvi-loi`) và `LoiTai` mang `ST-tailieu-loi`; bấm «Thử lại» gọi đúng hàm `refetch` của truy vấn đó một lần.
- AC-7: Given `PageShellHeader` có tiêu đề, mô tả và nút, When dựng, Then thứ tự DOM trong hàng đầu trang là tiêu đề → mô tả → nút; When khổ dưới 768 px (đo ở 375 và ở đúng 767), Then nhìn thấy theo đúng thứ tự đó từ trên xuống, căn trái, và nút KHÔNG đứng cùng hàng với tiêu đề; When khổ từ 768 px (đo ở đúng 768 và ở 1280), Then tiêu đề và nút cùng một hàng, mô tả nằm dưới.
- AC-8: Given Onboarding khi danh sách khuôn kế hoạch rỗng, When đầu trang dựng, Then «Kế hoạch mới» tắt, một dòng dưới tiêu đề nói vì sao và có liên kết tới Cài đặt › Khuôn, nút mang `aria-describedby` trỏ dòng đó; When có ít nhất một khuôn, Then nút bật và không có dòng lý do; và When khung trống `ST-danhmuc-empty` dựng, Then nút «Tạo kế hoạch từ khuôn» của nó là `outline`, màn có đúng một nút tô.
- AC-9: Given Tổ chức với người không có quyền sửa, và SSO với người không được cấu hình, When đầu trang dựng, Then nút chính («Thêm bộ phận», «Thêm nhà cung cấp») tắt, một dòng dưới tiêu đề nói vì sao, nút mang `aria-describedby` trỏ dòng đó; When có quyền, Then nút bật và không có dòng lý do.
- AC-10: Given danh sách Tài liệu, When lưu tệp nguồn tắt, Then dòng «Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình.» nằm dưới tiêu đề, ngoài `PageShellActions`, và nút «Tải nguồn lên» trỏ `aria-describedby` tới nó; When không đọc được trạng thái lưu tệp, Then nút tắt kèm một dòng nói chưa đọc được trạng thái; When lưu tệp bật, Then nút bật và không có dòng nào.
- AC-11: Given `SectionHeading level={2}` có `id`, When dựng, Then phần tử tiêu đề là `<h2>` mang chính `id` đó; và When Nhắc buổi sáng dựng, Then hai mục «Zalo» và «Kênh» dùng `SectionHeading level={2}`, `aria-labelledby` của mỗi `section` trỏ tới `<h2>` đó, và `reminders/page.tsx` không còn `<h2` thô.
- AC-12 (judgment): Given bản dựng thật của cây chạy bằng `do:man`, When chụp ở 1280 và 375 — đang tải (truy vấn bị giữ) rồi tải xong ở Liên hệ (`bang`), Kết nối (`danh-sach`), Cài đặt › Chung (`the`), OKR › Toàn cảnh (`tong-quan`), chi tiết chiến dịch (`chi-tiet`), danh sách Tài liệu; tải lỗi (truy vấn trả lỗi) ở chi tiết chiến dịch và Onboarding; Onboarding chưa có khuôn; Tài liệu với lưu tệp tắt — Then máy đo được: ở mọi ảnh đang tải tiêu đề hoặc breadcrumb có chữ; mỗi cặp đang tải/tải xong lệch không quá 4 px ở `y` và chiều cao hàng tiêu đề, không quá 8 px ở `y` vùng nội dung; ở 1280 tâm `y` của tiêu đề và nút đầu tiên lệch không quá 8 px và mô tả nằm dưới tiêu đề; ở 375 mô tả nằm trên nút đầu tiên; và người xem thấy khung xương cùng hình với nội dung màn đó khi xong, cùng một hình lỗi có nút «Thử lại», dòng lý do ngay dưới tiêu đề cạnh nút tắt.
- AC-13: Given sáu đầu trang có nút «Thêm…» chờ dữ liệu trong `Suspense` (Liên hệ, Thoả thuận, Công ty, Chiến dịch, Khoá API, SSO), When đầu trang đang chờ, Then fallback là một vạch `Skeleton` cỡ nút, không phải một `Button` mang `disabled`; và không fallback `Suspense` nào trong `PageShellActions` dưới `apps/app/app` chứa `disabled`.
- AC-14: Given mã `apps/app`, When chạy thước đếm khung lỗi tự dựng, Then nó in một dòng «khung lỗi tự dựng còn: N» và danh sách `tệp:dòng` của mọi phần tử `Empty` hay `Alert` có nút mà `onClick` gọi `refetch` hoặc một prop thử lại (`thuLai`, `onThuLai`, `onRetry`) và không phải `VungTaiLoi`; năm chỗ của AC-5 và AC-6 không nằm trong danh sách; và N được ghi vào gói Cổng Bằng chứng.

## Coverage

Quét bằng `morphological-scan` (preset `test-matrix`). Trục: trạng thái (đang tải · lỗi tải · nút chính
tắt · đã tải xong) × hình nội dung (bảng · danh sách dòng · thẻ+form · tổng quan · chi tiết bản ghi) ×
nguồn tiêu đề (tĩnh · theo dữ liệu) × khổ (1280 · 375). Thước CE: mọi chỗ gọi `PageShellLoading` và mọi
`Suspense` fallback dưới `apps/app/app` tìm bằng grep [SUY-TỪ-REPO: apps/app/components/page-shell.tsx,
apps/app/components/page-shell-loading.tsx]; bốn khung lỗi và ghi chú phạm vi của hàng [SUY-TỪ-REPO:
docs/plan/lo-trinh-okr.json#NM1]; đích [SUY-TỪ-REPO: docs/design.md, docs/settings.md]. Chân ngành: mẫu
«Loading» của IBM Carbon Design System — khung xương cho trang và mục, vòng quay cho thao tác ngắn — và
luật tiêu đề theo bậc, lời lỗi có bước tiếp, cập nhật bất đồng bộ qua `aria-live` của Vercel Web Interface
Guidelines [NGÀNH: IBM Carbon Design System «Loading», Vercel Web Interface Guidelines]. Core → AC-1…AC-14;
«đã tải xong» là đối chứng: các bộ suite và bài đo đã ký giữ xanh. Lỗi tải ở khoảng 30 khung tự dựng khác
là Later (NM1b), có thước đếm AC-14.

## Out of scope

- Khoảng 30 khung lỗi tự dựng ngoài bốn khung hàng nêu tên (Cài đặt OKR, Tổ chức, Hỏi ý, Cập nhật tuần, khối bản ghi, Tác tử) — hàng NM1b đứng sau NM1 ở dãy P4 (Hỏi-1, chủ kho duyệt khuyến nghị 13/10); AC-14 đếm số còn lại.
- Vòng quay cấp mục trong nội dung đã tải (`dashboard-summary`, `campaigns-table`, `fields-list`, record sheet, timeline) và vòng quay của `DataTable` khi bảng rỗng đang tải.
- `<h2>` thô ở Kết nối, Zalo, Slack, chi tiết chiến dịch.
- Lọc và kiểu xem (NM2), màu trạng thái (NM3).

## Notes

- Đường đo: ô cơ hội không khai ngưỡng (hàng dựng); đo trên người dùng thật là việc sau khi gộp — xem sổ quyết định.
- Đổi khung chung (`page-shell.tsx`, `VungTaiLoi`, các khung lỗi có mã `ST-…`) chạm mã mà bài đo của nhiều hồ sơ đã ký đọc; những hồ sơ đó cần ghim lại sau S4.
