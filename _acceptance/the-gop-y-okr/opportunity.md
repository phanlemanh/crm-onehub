---
schema_version: 1
slug: the-gop-y-okr
feature: Thẻ góp ý của Trợ lý OKR — thẻ xếp dọc trải hết bề ngang, nút ở chân, một nút chính, hộp sửa rộng hơn khi cột mở
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-29T11:43:00Z
---

## Vấn đề & ai gặp

Lượt 9b đưa Trợ lý OKR vào hộp sửa Mục tiêu và KR. Lái thử trên màn thật 29/09 và bản rà soát
UX cùng ngày cho thấy cột góp ý chật: câu đề xuất còn khoảng 135 px vì ba nút xếp cạnh chữ,
cỡ 12 px, ba nút cùng trọng lượng nên không có hành động chính. Chủ kho thấy «chưa phải UX
thị trường dùng hiện nay».

**Người gặp:** trưởng đơn vị và người phụ trách KR sửa OKR trong mùa đặt OKR năm và quý 1.

## Giả định chốt sinh tử

- Người đọc cần thấy câu mới liền một mạch và biết ngay nút nào là «đồng ý», nếu không họ bỏ qua góp ý.
- Đổi bố cục không cần đổi dữ liệu hay tác tử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người lạ có quyết được ba đề xuất mà không lúng túng không?
- Kết quả nào là SỐNG: người lạ quyết đủ ba đề xuất trong một lượt lái thử mà không hỏi «bấm nút nào», 0 lần hộp đóng ngoài ý.
- Kết quả nào là CHẾT: người lạ bấm nhầm «Bác» thay «Nhận», hoặc hộp đóng ngoài ý ≥ 1 lần.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)

## Nguồn ngoài & phạm vi kế thừa

- Bản rà soát UX 29/09: `.acceptance-runs/tro-ly-okr-de-xuat/ux-ra-soat-2026-09-29/index.html`.
- Chủ kho trả lời «Đồng ý phương án đề xuất» cho câu «Làm phương án A cho Trợ lý OKR ngay không?» (29/09, trong phiên).

## Cổng 0

Quyết `build` 29/09: phương án A, chỉ giao diện, lượt đầu của lộ trình ba lượt (thẻ góp ý OKR → từ vựng tác tử → tác tử xin duyệt).

## Thước đo thành công → ứng viên criterion

- Câu đề xuất ≥ 320 px ở 1440 px; không tràn ngang ở 390 px.
- Đúng một nút chính mỗi thẻ cần quyết (viết lại, căn chỉnh, thông tin); thẻ câu hỏi không có nút tô màu; hàng nút ở chân.
- Hộp không đóng khi bấm trong cột.

## Out of scope từ khám phá

- Hội thoại hỏi lại Trợ lý (phương án B), góp ý dưới ô (phương án C), «Nhận tất cả», chip nguồn.
