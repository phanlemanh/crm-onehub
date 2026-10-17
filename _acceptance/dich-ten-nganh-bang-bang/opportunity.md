---
schema_version: 1
slug: dich-ten-nganh-bang-bang
feature: Tra cứu thương hiệu Việt Nam hiện tên ngành tiếng Việt từ một bảng, không dịch máy từng lần
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VN1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VN1 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Lộ trình bước 2 — ngày dự kiến, tên ngành tiếng Việt, tiêu điểm sau xoá — 21/10/2026.

Tra cứu thương hiệu Việt Nam hiện tên ngành tiếng Việt từ một bảng, không dịch máy từng lần

**Ai gặp:** nhân viên kinh doanh dùng giao diện tiếng Việt, ở ba chỗ: dòng phụ đầu ngăn công ty, cột «Ngành» của bảng công ty, và bộ lọc theo ngành. Sau vòng `tra-cuu-thuong-hieu-viet-nam` (#462) mô tả công ty đã ra tiếng Việt, nhưng ngành và ngành phụ vẫn là chữ Anh — cùng một ngăn nửa Việt nửa Anh.

**Bằng chứng thực địa (17/10, đo trên production sau #462):** Đất Xanh Miền Bắc sau «Tra cứu lại» có mô tả tiếng Việt nhưng ngành «Real Estate & PropTech», ngành phụ «Real Estate Marketplaces» — nhà cung cấp không dịch dù đã xin tiếng Việt. Thư viện của nhà cung cấp (bản 2.10.0 đang ghim) khai ngành là danh sách cố định **24** giá trị và ngành phụ là danh sách cố định **220** giá trị, đều tiếng Anh.

**Gốc:** `_acceptance/tra-cuu-thuong-hieu-viet-nam/decisions.jsonl` dòng `d-20261016T053428Z-12` — vòng trước cố ý để ngành tiếng Anh «đợi đo trên production»; số đo đã về và trả lời: không dịch.

**Hướng đề xuất (chốt ở bước thiết kế, không phải ở cổng này):** dịch lúc HIỂN THỊ bằng một bảng trong mã theo đúng danh sách cố định — không gọi model, không đổi dữ liệu đã lưu, công ty đã tra từ trước cũng hiện tiếng Việt ngay mà không cần tra lại; giao diện tiếng Anh vẫn hiện nguyên chữ gốc; giá trị lạ ngoài danh sách (rep tự gõ, nhà cung cấp thêm giá trị mới) hiện nguyên văn.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Nhà cung cấp chỉ trả giá trị trong hai danh sách cố định | Có giá trị ngoài bảng → hiện chữ Anh nguyên văn (không vỡ màn) | Đếm giá trị ngành khác nhau đang có trong dữ liệu production, so với danh sách | Chưa thử |
| 2 | Dịch lúc hiển thị không làm hỏng bộ lọc theo ngành | Lọc theo tên Việt không khớp giá trị lưu → bộ lọc rỗng | Ca kiểm bộ lọc trên dữ liệu có ngành đã dịch | Chưa thử |
| 3 | Không chỗ nào khác (Kara, xuất dữ liệu) cần tên Việt trong vòng này | Kara vẫn nói tên ngành tiếng Anh với rep | Rà nơi đọc ngành ở bước thiết kế | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Trên production, rep dùng giao diện tiếng Việt còn thấy tên ngành / ngành phụ tiếng Anh thuộc danh sách cố định ở ba chỗ (dòng phụ ngăn, cột bảng, bộ lọc) không?
- Kết quả nào là SỐNG: [đề xuất] Đất Xanh Miền Bắc (đã tra 17/10) hiện ngành và ngành phụ tiếng Việt ở cả ba chỗ mà KHÔNG cần bấm tra lại; lọc theo ngành vẫn ra đúng số công ty như trước gộp.
- Kết quả nào là CHẾT: [đề xuất] Còn một giá trị thuộc danh sách cố định hiện chữ Anh ở giao diện tiếng Việt, hoặc bộ lọc theo ngành đổi số kết quả.
- Timebox: [đề xuất] ~2 giờ máy, xong trước mốc 21/10/2026; đọc ngưỡng trong ngày đầu sau khi bản lên production.

## Ngoài vòng — ghi lại, không gộp

- «Tra cứu lại» không bỏ bộ đệm 90 ngày của nhà cung cấp (`apps/agent/agent/lib/dispatch.ts:104` gọi tra thương hiệu không kèm cờ làm mới) → Known limits / hạt giống.
- Mỗi lần bấm «Tra cứu lại» tốn hơn 2 tín dụng vì Kara soạn thêm hồ sơ công ty (đo 17/10: thêm một lượt tra web 19,7 s) → Known limits / hạt giống.
