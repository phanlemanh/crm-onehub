---
schema_version: 1
feature: «Trưởng phòng ban mở trang Lộ trình trong CRM, thấy việc của nhóm mình đang ở đâu mà không phải hỏi»
slug: trang-lo-trinh-trong-crm
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-09T01:59:28Z
design_doc: docs/superpowers/specs/2026-10-09-trang-lo-trinh-trong-crm-design.md
---

# Acceptance Contract: trang-lo-trinh-trong-crm

## Context

Người không dùng git — trưởng phòng ban, đội sản phẩm — mở «Lộ trình» trong CRM và thấy mỗi việc đang ở đâu,
hẹn mốc nào, còn bao lâu hay đã trễ, mà không phải hỏi. Trang theo đúng khung danh sách của Thoả thuận và
Onboarding (chủ kho chốt 09/10, sau ba lượt bản mẫu): một danh sách việc cho mọi lộ trình của kho, thẻ vòng đời,
lộ trình / nhóm / mốc là ba bộ lọc riêng, «Bảng | Bảng cột | Mốc», ngăn hồ sơ khi bấm. Trang chỉ đọc khối dữ
liệu `lo-trinh-du-lieu` mà bộ vẽ của kit đặt trong `LO-TRINH.html` ở gốc kho (từ kit 2.26); nó không ghi gì và
không tự tính trạng thái — việc duy nhất tự làm là so ngày mốc với hôm nay.

Source input: `_acceptance/trang-lo-trinh-trong-crm/opportunity.md` (Cổng Đáng `build` 2026-10-08, hàng LT1 của
`docs/plan/lo-trinh-okr.json`); đặc tả khối: `skills/acceptance/references/lo-trinh-du-lieu.md` của bộ kit
(nhánh `vong/xuat-du-lieu-lo-trinh`, phanlemanh/acceptance-gate-kit#285); bản mẫu đã duyệt:
`/proto/trang-lo-trinh-trong-crm` (`design-pass.md`).

## Criteria

- AC-1: Given `LO-TRINH.html` ở gốc kho mang khối dữ liệu phiên bản 1, When một thành viên mở «Lộ trình» và chọn thẻ «Tất cả», Then danh sách (qua mọi trang) có đúng một dòng cho mỗi hàng của mọi lộ trình trong khối — không thừa không thiếu — và mỗi dòng mang đúng mã, câu giao, nhóm, tên lộ trình của hàng đó; nhãn trạng thái chính là nhóm trạng thái của hàng (Chưa bắt đầu / Đang làm / Đã giao / Khác) và chữ trạng thái của khối hiện thành dòng phụ khi nó khác các chữ cùng nghĩa.
- AC-2: Given trang vừa mở, When không chọn gì, Then thẻ vòng đời «Chưa xong» đang chọn và danh sách chỉ gồm việc ở nhóm Chưa bắt đầu hoặc Đang làm, xếp theo ngày mốc gần nhất (việc chưa hẹn mốc xuống cuối); When chọn «Đã giao», «Xếp lại sau» hay «Tất cả», Then danh sách đổi đúng theo nhóm trạng thái, số đếm của từng thẻ bằng số việc tương ứng, và đường dẫn mang thẻ đã chọn.
- AC-3: Given danh sách, When chọn trong «Lọc» một hay nhiều giá trị của Lộ trình, Nhóm, Mốc (Mốc gồm «Trễ mốc», từng mốc có việc, «Chưa hẹn mốc»), Then chỉ còn việc thoả cùng lúc mọi chiều đã chọn, số đếm cạnh mỗi lựa chọn đúng với các chiều còn lại, đường dẫn mang bộ lọc và mở lại ra cùng danh sách; When gõ vào ô tìm, Then chỉ còn việc có câu giao hoặc mã chứa chữ đã gõ; giá trị lạ trên đường dẫn bị bỏ qua.
- AC-4: Given hôm nay theo máy người xem là D, When trang hiện việc chưa giao có mốc, Then dưới ngày mốc ghi «còn n ngày» (n = số ngày từ D tới mốc), «hôm nay» khi đúng ngày, hoặc nhãn «Trễ n ngày» khi việc nằm trong danh sách việc trễ mà luật ngày của khối trả về cho D; việc đã giao không có dòng này; n của «Trễ n ngày» là số ngày từ ngày mốc tới D, và không việc chưa giao nào hiện số ngày âm; When có ít nhất một việc trễ trong phạm vi đang lọc theo ô tìm, Lộ trình và Nhóm (không tính thẻ vòng đời và chiều Mốc) và chưa lọc «Trễ mốc», Then trên bảng có khung «n việc đã qua mốc mà chưa giao» với n là số việc trễ trong phạm vi đó, và bấm «Xem việc trễ» đặt Mốc = «Trễ mốc», thẻ = «Tất cả», giữ nguyên ô tìm, Lộ trình, Nhóm — danh sách sau khi bấm có đúng n việc; đúng ở cả giờ Việt Nam lẫn UTC quanh nửa đêm, và phần phụ thuộc ngày không có trong lần dựng ở máy chủ.
- AC-5: Given danh sách đã lọc, When chọn «Bảng cột», Then việc xếp thành cột theo «Chia cột theo» (Trạng thái mặc định, Nhóm, Lộ trình), mỗi cột đếm đúng số việc của nó và không kéo-thả được; When chọn «Mốc», Then trang hiện dòng thời gian các mốc có ít nhất một việc khớp bộ lọc, theo ngày tăng dần, mỗi mốc liệt đúng các việc gắn với nó, mốc đã qua được đánh dấu đã qua, và cuối là mục «Chưa hẹn mốc» thu gọn với số đếm đúng.
- AC-6: Given bất kỳ cách xem nào, When bấm một việc (dòng, thẻ, hay việc trong dòng thời gian), Then ngăn hồ sơ bên phải mở với câu giao, mã, lộ trình, nhóm; dải bốn ô Trạng thái · Mốc · Lộ trình · Nhóm; «Coi là thành công khi» và «Vì sao» khi có; ghi chú khi trạng thái lấy từ lời ghi; cờ lệch nguyên văn; «Cần xong trước» và «Việc đang chờ việc này» — bấm một việc trong đó thì ngăn chuyển sang việc ấy; ngăn không hiện dòng lệnh mở việc.
- AC-7: Given khối có việc đã bác, When bật «Đã bác», Then trang hiện danh sách việc đã bác của mọi lộ trình kèm lý do và tên lộ trình, và tắt thì về đúng danh sách trước đó.
- AC-8: Given `LO-TRINH.html` vắng khỏi bản đang chạy, hoặc không mang khối, hoặc khối không phải JSON, hoặc mang khuôn khác, hoặc có một khoá sai kiểu, When một thành viên mở «Lộ trình», Then trang hiện một khung trống riêng cho từng ca bằng câu thường cho người xem, câu của bộ đọc (ca sai kiểu kèm đường khoá) nằm trong phần gập «Chi tiết cho đội sản phẩm», không có danh sách nào và trang không vỡ; Given khối thiếu một khoá, Then trang coi khoá đó là rỗng đúng như đặc tả khối; Given khối mang phiên bản mới hơn bộ đọc, Then danh sách vẫn hiện kèm một khung cảnh báo; Given một lộ trình mang `loi`, Then trên bảng có khung báo lộ trình đó không tải được (câu lỗi trong phần gập) và việc của các lộ trình khác vẫn hiện.
- AC-9: Given mã của trang, When soát nguồn, Then hàm đọc khối là bản chép nguyên văn hàm `docDuLieu` của bộ kit, khuôn Zod có đúng bộ khoá của bảng khoá phiên bản 1 (không thiếu, không thừa), và không tệp nào của trang đọc hồ sơ `_acceptance/` hay tệp kế hoạch `docs/plan/` — trạng thái chỉ đến từ khối.
- AC-10: Given một người mang vai chỉ OKR, When họ đăng nhập, Then thanh điều hướng có mục «Lộ trình» và mở được trang (không bị chuyển sang trang ngoài phạm vi); Given thành viên đủ quyền, Then họ cũng thấy và mở được; Given người chưa đăng nhập mở đường dẫn trang, Then họ được đưa về trang đăng nhập.
- AC-11: Given bản dựng production của ứng dụng, When dựng xong, Then danh sách tệp mà đường «Lộ trình» mang theo có `LO-TRINH.html` của chính commit được dựng, và hàm đọc tệp của trang, chạy trong một thư mục chỉ gồm đúng các tệp đường đó mang theo (không có gốc kho bên cạnh), vẫn đọc ra khối dữ liệu.
- AC-12: Given trang đã hiện ở mọi cách xem, When người xem dùng nó, Then ô nhập duy nhất là ô tìm; không có nút lưu, nút sửa hay lời gọi ghi nào; thẻ của bảng cột không có tay kéo; mọi nút thuộc thanh công cụ, phân trang, khung báo việc trễ, ngăn hồ sơ hay mục gập.
- AC-13: Given vai chỉ OKR mở trang trên máy tính (1280px) và điện thoại (375px), When nhìn trang thật, Then thanh công cụ dùng đúng các điều khiển và thứ tự của màn Thoả thuận tại commit được đo (tìm · thẻ vòng đời · cách xem · Lọc · Sắp xếp · Cột · Đã bác) và nằm một hàng ở 1280px; ở 375px thẻ vòng đời gộp vào «Lọc (n)», cột Lộ trình và Trạng thái ẩn, trạng thái hiện dưới câu mô tả trong ô Việc, và thanh công cụ không tràn khung; danh sách, bảng cột, dòng thời gian và ngăn hồ sơ đều hiện ở cả hai khổ, trang không cuộn ngang, và chữ của tệp kế hoạch mang dấu không dịch.
- AC-14: Given chữ trên trang (tiêu đề, mô tả, nhãn thanh công cụ, nhãn bộ lọc, khung việc trễ, ngăn hồ sơ, các câu khi không có dữ liệu), When một trưởng phòng ban không dùng git đọc, Then mọi nhãn đến từ tệp lời của trang (vi và en đủ khoá, không chữ viết thẳng trong mã), và họ hiểu trang cho biết gì, rằng trang chỉ đọc, và khi không có dữ liệu thì nên báo ai — không gặp tên tệp, tên lệnh hay chữ nội bộ của bộ công cụ. Câu máy của bộ đọc chỉ nằm trong phần gập «Chi tiết cho đội sản phẩm» và không thuộc phạm vi tiêu chí này. (judgment)

## Coverage

- Trục A — Người xem: thành viên đủ quyền | vai chỉ OKR | chưa đăng nhập [thước CE: ba lối của bộ chặn đường trong `apps/app/lib/pham-vi-man.ts`] → AC-10, AC-13
- Trục B — Nguồn dữ liệu: khối đủ | không có khối | không phải JSON | khuôn lạ | phiên bản mới hơn | thiếu khoá | sai kiểu | lộ trình mang lỗi | tệp vắng khỏi bản dựng [thước CE: bảng «Đọc khoan dung» của đặc tả khối (năm ca) + hai ca của kho] → AC-1, AC-8, AC-9, AC-11
- Trục C — Câu người xem hỏi: việc nào chưa xong | việc của nhóm / lộ trình tôi | bao giờ xong, còn bao lâu | việc nào trễ | vì sao, thành công khi nào, cần gì trước | trạng thái có đáng tin không | việc nào đã bác [thước CE: mục «Những gì bản chiếu thường cần» của đặc tả khối; NGÀNH: Productboard Portal, Jira Product Discovery, Linear] → AC-1 đến AC-7
- Trục D — Ngày xem so với mốc: trước | đúng ngày | sau còn việc | sau hết việc, theo giờ máy người xem [thước CE: khối luật ngày của đặc tả] → AC-4, AC-5
- Trục E — Cách xem (khung Thoả thuận / Onboarding): bảng | bảng cột theo trạng thái / nhóm / lộ trình | mốc | ngăn hồ sơ | đã bác [thước CE: `deals-table.tsx`, `onboarding/danh-muc-table.tsx`] → AC-2, AC-5, AC-6, AC-7, AC-13
- Cắt ngang: hai khổ màn, hai ngôn ngữ giao diện, chữ người nhập không dịch, chỉ đọc → AC-12, AC-13, AC-14
- Quét đầy đủ (Core / Later / Never): `_acceptance/trang-lo-trinh-trong-crm/coverage-scan.md`

## Đường đo

- Thước: ít nhất 3 trưởng phòng ban trả lời đúng «việc này đang ở đâu, bao giờ xong» từ trang trong một phút · số từ: phiên nghiệm thu (bảng chấm kín của nghi thức nghiệm thu) · bảo đảm bởi: đã có sẵn: nghi thức phiên nghiệm thu; trang phải trả lời được câu đó — AC-1, AC-3, AC-4, AC-6
- Thước: trang khớp `LO-TRINH.html` cùng lượt vẽ, không lệch mà không ai biết (vế CHẾT) · số từ: E1 so từng việc với khối và E11 đọc tệp trong bản dựng, chạy lại ở mỗi lượt ghim lại trên commit sẽ lên production · bảo đảm bởi: AC-1, AC-11
- bỏ đường-đo — vế phụ «tin hỏi tiến độ của chủ kho dưới nửa nền 23/48»: kho chưa có cách đếm nền, đếm lại bằng tay ở phiên nghiệm thu (entry d-20261008T171757Z-4)

## Out of scope

- Ghi ý định, trạng thái hay chữ ký từ CRM — nguồn ý định là git.
- Lọc theo phòng ban thật — «nhóm» là luồng việc như tệp kế hoạch ghi; phòng ban cần bộ kit thêm một khoá riêng.
- Dòng «vẽ lúc …», hạn của việc, tên ngắn, người phụ trách, tên hiển thị của nhóm — khối chưa chở; đã đề xuất sang kho kit.
- Ô số tổng quan, «Việc kế tiếp», «Chỗ cần sửa trong kế hoạch» — thứ của đội sản phẩm, đã có ở `LO-TRINH.html`; Thoả thuận không có ô số.
- Chia bảng cột theo mốc — thay bằng cách xem «Mốc».
- Biểu đồ gantt, bảng `data-grid` và bộ lọc `filters` của ReUI — trái `docs/reui.md` (Base UI, hệ bảng thứ hai).
- Hiện dòng lệnh mở việc trong Claude Code, hiện hồ sơ nghiệm thu của việc.
- Gộp lộ trình của kho khác vào trang này.
- Tự suy trạng thái khi trang chưa mang khối.

## Notes

- Phụ thuộc: crm nhận bộ kit ≥ 2.26 (bộ vẽ đặt khối vào `LO-TRINH.html`, `scripts/lo-trinh.mjs` mang hàm `docDuLieu`) và phanlemanh/crm-onehub#313 (hàng LT1). Trước đó các phép đo đọc tệp gốc của kho dừng với câu ghim «LO-TRINH.html chưa mang khối».
- Nếp chung đang được thống nhất ở phiên riêng «Thống nhất khuôn trang giữa các màn OneHub» (09/10): lọc vòng đời, vị trí nút cách xem, kiểu số đếm trong chip, khung lỗi, khung chờ. Vòng này viết mã sau phiên đó; nếp nào được chốt ở đó thì trang theo nếp ấy — AC-13 đo «đúng các điều khiển và thứ tự của màn Thoả thuận tại commit được đo», không đo một bản chụp cố định.
- Tệp mẫu cho các ca khoan dung được dẫn từ khối thật của bộ vẽ (bỏ khối, làm hỏng JSON, đổi khuôn, tăng phiên bản, bỏ khoá, đổi kiểu) — không dựng khối bằng tay.
- Chủ kho ràng buộc 08/10: vòng không chen vào trước 14/10, không cài bản kit chưa phát hành vào crm.
- Thanh ngày bên trái của cách xem «Mốc» là biến thể mới của `Timeline` trong `packages/ui` (design-pass, Nhóm 2), không đặt lớp vị trí ở chỗ gọi.
