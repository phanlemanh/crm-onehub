---
schema_version: 1
slug: ngan-kr-mot-cho
feature: Trưởng đơn vị bấm một KR ở bất kỳ đâu và mở cùng một ngăn KR, bấm Cập nhật ở đầu ngăn hay ngay trên dòng KR, thấy điểm mới nằm đâu so với đích, rồi sang KR kế mà không đóng ngăn
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK7
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK7 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Trưởng đơn vị bấm một KR ở bất kỳ đâu và mở cùng một ngăn KR, bấm Cập nhật ở đầu ngăn hay ngay trên dòng KR, thấy điểm mới nằm đâu so với đích, rồi sang KR kế mà không đóng ngăn

Vì sao: Hôm nay một KR có ba ngăn và một hộp, bấm ở bốn chỗ ra bốn nơi; cập nhật một KR mất 5–6 bấm qua menu «…». Tability: một ngăn KR, «Create check-in» ở đầu, ‹ › sang KR kế — 3 bấm.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Cập nhật một KR từ trang bộ OKR trong 3 bấm; mọi lối bấm vào KR mở cùng một ngăn» chưa?
- Kết quả nào là SỐNG: Cập nhật một KR từ trang bộ OKR trong 3 bấm; mọi lối bấm vào KR mở cùng một ngăn
- Kết quả nào là CHẾT: chưa đạt «Cập nhật một KR từ trang bộ OKR trong 3 bấm; mọi lối bấm vào KR mở cùng một ngăn» khi hết timebox
- Timebox: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
