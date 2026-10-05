---
schema_version: 1
slug: okr-to-chuc-va
feature: "«Dựng cây và đặt OKR không vấp: mục tiêu thu gọn giữ nguyên, KR từ mẫu báo người phụ trách, khôi phục phòng ban đúng chỗ»"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-04T12:53:39Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: R1d
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng R1d của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Dựng cây và đặt OKR không vấp: mục tiêu thu gọn giữ nguyên, KR từ mẫu báo người phụ trách, khôi phục phòng ban đúng chỗ»

Ai gặp: quản trị và trưởng phòng dựng cây tổ chức, đặt OKR quý đầu tiên trước 14/10 (mọi phòng ban dùng
thật). Nguồn: khảo sát 04/10, `de-xuat-lo-trinh.md` mục A3 (62 màn thật). Tám lỗi, đều trên đường dựng cây
và đặt OKR:

- #11 — mục tiêu đã thu gọn tự mở lại.
- #13 — nút số KR trên điện thoại chưa có móc đo.
- #16 — người được giao KR từ mẫu không nhận được thông báo (`okr-mau.service.ts:317-350`; Ngoài-1 của
  `canh-kr-okr`).
- #17 — kho chưa có khoá research thì thành viên bị đẩy vào màn nhập khoá (`apps/app/proxy.ts:81`).
- #18 — câu chặn lưu trữ phòng ban hiện sai ngôn ngữ.
- #30 — khôi phục phòng ban rơi vào bộ phận đã lưu trữ, có thể sinh hai phòng cùng tên
  (`to-chuc.service.ts:409-416`).
- R1m-7 — quản trị chỉ nhập được cả bộ mục tiêu, không thêm được một mục tiêu lẻ (chủ kho chốt là lỗi
  04/10; điều phối giao vào R1d, sửa ở `theo-don-vi/**` và `apps/api/src/okr/okr-access.service.ts`).
- AC-10 điện thoại của R1a — chip «Kara · N góp ý» không cuộn tới vùng Kara khi Mục tiêu đã có sẵn dữ liệu
  (Known limits chủ kho ghi ở Cổng Bằng chứng R1a, «sửa trong R1d»).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: một quản trị mới dựng được cây tổ chức và đặt OKR quý cho một phòng
  ban, trên máy tính và điện thoại, mà không vấp tám lỗi trên?
- Kết quả nào là SỐNG: lái-thử người-lạ đi trọn đường dựng cây → thêm một mục tiêu lẻ → giao KR
  từ mẫu → khôi phục một phòng ban, 0 lần vấp thuộc tám lỗi; người được giao KR thấy thông báo.
- Kết quả nào là CHẾT: còn bất kỳ lỗi nào trong tám lỗi tái hiện được trên production sau
  14/10, hoặc khôi phục phòng ban sinh dữ liệu sai (trùng tên, rơi vào bộ phận đã lưu trữ).
- Timebox: hạn R1d 11/10 (lộ trình); hai ngày công máy.
