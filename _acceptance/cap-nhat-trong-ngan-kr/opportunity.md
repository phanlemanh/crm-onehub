---
schema_version: 1
slug: cap-nhat-trong-ngan-kr
feature: Người phụ trách KR mở chi tiết KR, ghi giá trị mới, mức tự tin và ghi chú ngay trong ngăn, thấy điểm mới trên Lịch sử và sang KR kế mà không mở hộp thoại nào
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-30T03:11:43Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: SV8
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng SV8 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Người phụ trách KR mở chi tiết KR, ghi giá trị mới, mức tự tin và ghi chú ngay trong ngăn, thấy điểm mới trên Lịch sử và sang KR kế mà không mở hộp thoại nào

Vì sao: Production 30/10: bấm «Cập nhật» ở đầu ngăn KR mở hộp thoại giữa màn (HopThoaiCapNhatKr, apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx) che mất ngăn; hộp lặp biểu đồ (gom theo tuần, okr.dienBien) trong khi Lịch sử của ngăn vẽ từng lần (okr.lichSuKr); mọi ngăn bản ghi khác ghi tại chỗ (ActivityComposer của Deal, Trao đổi của mục tiêu). Soát ở phiên giám sát vk 30/10; luật mới ở docs/design.md mục «Ghi vào bản ghi: ngay trong ngăn».

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng» khi hết timebox
- Timebox: …
