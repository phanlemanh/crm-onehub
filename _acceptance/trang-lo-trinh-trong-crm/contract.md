---
schema_version: 1
feature: «Trưởng phòng ban mở trang Lộ trình trong CRM, thấy việc của nhóm mình đang ở đâu mà không phải hỏi»
slug: trang-lo-trinh-trong-crm
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-09-trang-lo-trinh-trong-crm-design.md
---

# Acceptance Contract: trang-lo-trinh-trong-crm

## Context

Người không dùng git — trưởng phòng ban, đội sản phẩm — mở trang «Lộ trình» trong CRM, chọn luồng việc, và
thấy mỗi việc đang ở đâu, gắn mốc nào, mốc đã qua chưa. Trang chỉ đọc khối dữ liệu `lo-trinh-du-lieu` mà bộ
vẽ của kit đặt trong `LO-TRINH.html` ở gốc kho (từ kit 2.27); nó không ghi gì và không tự tính trạng thái.

Source input: `_acceptance/trang-lo-trinh-trong-crm/opportunity.md` (Cổng Đáng `build` 2026-10-08, hàng LT1 của
`docs/plan/lo-trinh-okr.json`); đặc tả khối: `skills/acceptance/references/lo-trinh-du-lieu.md` của bộ kit
(nhánh `vong/xuat-du-lieu-lo-trinh`, phanlemanh/acceptance-gate-kit#285).

## Criteria

- AC-1: Given `LO-TRINH.html` ở gốc kho mang khối dữ liệu phiên bản 1, When một thành viên mở «Lộ trình», Then trang có đúng một thẻ cho mỗi phần tử của `lo_trinh` theo đúng thứ tự, thẻ đầu đang chọn, và thẻ đang chọn hiện bốn con số tiến độ bằng `tien_do` cùng mọi việc của lộ trình đó — mỗi việc mang đúng mã, câu giao, nhóm và chữ trạng thái của hàng tương ứng trong khối, không thừa không thiếu.
- AC-2: Given thẻ của một lộ trình có ít nhất hai nhóm, When chọn một nhóm trong bộ lọc, Then danh sách chỉ còn các việc có `nhom` bằng nhóm đó (số dòng bằng số hàng của nhóm), đường dẫn mang nhóm đã chọn, và mở lại đúng đường dẫn đó ra cùng danh sách; When lộ trình có việc không nhóm, Then bộ lọc có thêm «Không nhóm»; When đường dẫn mang một nhóm không có trong lộ trình, Then trang hiện mọi việc.
- AC-3: Given hôm nay theo máy người xem là D, When trang hiện mốc, Then một mốc được đánh dấu «đã qua — còn việc chưa giao» đúng khi ngày mốc đứng trước D và `con_viec` là đúng (đúng ngày D thì chưa qua), và khung việc trễ liệt đúng các mã mà luật ngày của khối trả về cho D, theo thứ tự mốc — đúng ở cả giờ Việt Nam lẫn UTC quanh nửa đêm.
- AC-4: Given khối có việc kế, việc mang cờ, chỗ cần sửa và việc đã bác, When trang hiện, Then việc kế tiếp hiện mã và câu giao nhưng không có dòng lệnh mở việc; cờ của từng việc hiện nguyên văn dưới việc đó; «Chỗ cần sửa trong kế hoạch (n)» và «Việc đã bác (n)» thu gọn mặc định với n bằng độ dài mảng tương ứng.
- AC-5: Given `LO-TRINH.html` vắng khỏi bản đang chạy, hoặc không mang khối, hoặc khối không phải JSON, hoặc mang khuôn khác, When một thành viên mở «Lộ trình», Then trang hiện một khung trống riêng cho từng ca kèm câu của bộ đọc, không có danh sách việc nào và trang không vỡ; Given khối mang phiên bản mới hơn bộ đọc, Then trang vẫn hiện dữ liệu và thêm một khung cảnh báo; Given một lộ trình mang `loi`, Then thẻ của nó hiện câu lỗi đó và các thẻ khác vẫn đầy đủ.
- AC-6: Given mã của trang, When soát nguồn, Then hàm đọc khối là bản chép nguyên văn hàm `docDuLieu` của bộ kit, khuôn Zod có đúng bộ khoá của bảng khoá phiên bản 1 (không thiếu, không thừa), và không tệp nào của trang đọc hồ sơ `_acceptance/` hay tệp kế hoạch `docs/plan/` — trạng thái chỉ đến từ khối.
- AC-7: Given một người mang vai chỉ OKR, When họ đăng nhập, Then thanh điều hướng có mục «Lộ trình» và mở được trang (không bị chuyển sang trang ngoài phạm vi); Given thành viên đủ quyền, Then họ cũng thấy và mở được; Given người chưa đăng nhập mở đường dẫn trang, Then họ được đưa về trang đăng nhập.
- AC-8: Given bản dựng production của ứng dụng, When dựng xong, Then danh sách tệp mà đường «Lộ trình» mang theo có `LO-TRINH.html` của chính commit được dựng, và máy chủ chạy từ bản dựng đó trả trang với dữ liệu đọc từ tệp ấy.
- AC-9: Given trang đã hiện, When người xem dùng nó, Then không có ô nhập, nút lưu hay lời gọi ghi nào; chỉ có chọn thẻ, chọn nhóm và mở/thu các mục gập.
- AC-10: Given vai chỉ OKR mở trang trên máy tính (1440px) và điện thoại (375px), When nhìn trang thật, Then tiến độ, bộ lọc, danh sách việc và mốc đều hiện, không cuộn ngang, và chữ của tệp kế hoạch mang dấu không dịch.
- AC-11: Given chữ trên trang (tiêu đề, mô tả, nhãn tiến độ, nhãn bộ lọc, các câu khi không có dữ liệu), When một trưởng phòng ban không dùng git đọc, Then họ hiểu trang cho biết gì, rằng trang chỉ đọc, và khi không có dữ liệu thì nên báo ai — không gặp tên tệp, tên lệnh hay chữ nội bộ của bộ công cụ. (judgment)

## Coverage

- Trục A — Người xem: thành viên đủ quyền | vai chỉ OKR | chưa đăng nhập [thước CE: ba lối của bộ chặn đường trong `apps/app/lib/pham-vi-man.ts`] → AC-7, AC-10
- Trục B — Nguồn dữ liệu: khối đủ | không có khối | không phải JSON | khuôn lạ | phiên bản mới hơn | thiếu khoá | lộ trình mang lỗi | tệp vắng khỏi bản dựng [thước CE: bảng «Đọc khoan dung» của đặc tả khối (năm ca) + hai ca của kho] → AC-1, AC-5, AC-6, AC-8
- Trục C — Câu người xem hỏi: cả lộ trình tới đâu | việc của luồng tôi | bao giờ xong | việc nào trễ | việc nào kế | trạng thái có đáng tin không | việc nào đã bác [thước CE: mục «Những gì bản chiếu thường cần» của đặc tả khối; NGÀNH: Productboard Portal, Jira Product Discovery, Linear] → AC-1, AC-2, AC-3, AC-4
- Trục D — Ngày xem so với mốc: trước | đúng ngày | sau còn việc | sau hết việc, theo giờ máy người xem [thước CE: khối luật ngày của đặc tả] → AC-3
- Cắt ngang: hai khổ màn, hai ngôn ngữ giao diện, chữ người nhập không dịch, chỉ đọc → AC-9, AC-10, AC-11
- Quét đầy đủ (Core / Later / Never): `_acceptance/trang-lo-trinh-trong-crm/coverage-scan.md`

## Đường đo

- Thước: ít nhất 3 trưởng phòng ban trả lời đúng «việc này đang ở đâu, bao giờ xong» từ trang trong một phút · số từ: phiên nghiệm thu (bảng chấm kín của nghi thức nghiệm thu) · bảo đảm bởi: đã có sẵn: nghi thức phiên nghiệm thu; trang phải trả lời được câu đó — AC-1, AC-2, AC-3
- bỏ đường-đo — vế phụ «tin hỏi tiến độ của chủ kho dưới nửa nền 23/48»: kho chưa có cách đếm nền, đếm lại bằng tay ở phiên nghiệm thu (entry d-20261008T171757Z-4)

## Out of scope

- Ghi ý định, trạng thái hay chữ ký từ CRM — nguồn ý định là git.
- Lọc theo phòng ban thật — «nhóm» là luồng việc như tệp kế hoạch ghi; phòng ban cần bộ kit thêm một khoá riêng.
- Dòng «vẽ lúc …» — khối chưa mang thời điểm vẽ.
- Tìm việc theo chữ.
- Hiện dòng lệnh mở việc trong Claude Code, hiện hồ sơ nghiệm thu của việc.
- Gộp lộ trình của kho khác vào trang này.
- Tự suy trạng thái khi trang chưa mang khối.

## Notes

- Phụ thuộc: crm nhận bộ kit 2.27 (bộ vẽ đặt khối vào `LO-TRINH.html`, `scripts/lo-trinh.mjs` mang hàm `docDuLieu`) và phanlemanh/crm-onehub#313 (hàng LT1). Trước đó các phép đo đọc tệp gốc của kho dừng với câu ghim «LO-TRINH.html chưa mang khối».
- Tệp mẫu cho các ca khoan dung được dẫn từ khối thật của bộ vẽ (bỏ khối, làm hỏng JSON, đổi khuôn, tăng phiên bản, bỏ khoá) — không dựng khối bằng tay.
- Chủ kho ràng buộc 08/10: vòng không chen vào trước 14/10, không cài bản kit chưa phát hành vào crm.
