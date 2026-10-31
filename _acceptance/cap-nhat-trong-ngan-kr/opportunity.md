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

- Câu hỏi phép đo trả lời: Sau khi khối cập nhật nằm ngay trong ngăn KR, người phụ trách KR có mở cập nhật rồi gửi hết thường hơn và nhanh hơn so với hộp thoại cũ không?
- Kết quả nào là SỐNG: Trong 2 tuần sau khi bật, tỉ lệ phiên cập nhật đã mở mà có giờ gửi đạt ít nhất bằng 2 tuần trước khi bật và trung vị số giây của phiên đã gửi không tăng, đồng thời số KR có ít nhất một lần cập nhật mỗi tuần không giảm.
- Kết quả nào là CHẾT: Trong 2 tuần sau khi bật, tỉ lệ phiên mở mà gửi thấp hơn 2 tuần trước khi bật, hoặc số KR được cập nhật mỗi tuần giảm, hoặc gần như mọi phiên vẫn đến từ một lối duy nhất cho thấy các lối Họp tuần, bảng đơn vị, mục tiêu không được dùng.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
