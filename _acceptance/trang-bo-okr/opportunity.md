---
schema_version: 1
slug: trang-bo-okr
feature: Trưởng đơn vị mở Bộ OKR, lọc Tôi dẫn, mở bộ OKR của đơn vị mình và đi giữa OKR · Họp tuần · Việc · Sơ đồ · Chấm điểm bằng thẻ con có đường dẫn riêng
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK3 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Trưởng đơn vị mở Bộ OKR, lọc Tôi dẫn, mở bộ OKR của đơn vị mình và đi giữa OKR · Họp tuần · Việc · Sơ đồ · Chấm điểm bằng thẻ con có đường dẫn riêng

Vì sao: Ô chọn đơn vị trên một màn chung thay cho trang riêng của từng bộ; cách xem và chip lọc trông giống hệt nhau. Mỗi bộ OKR một trang, như Plan của Tability.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Mỗi bộ OKR có đường dẫn riêng; đổi thẻ con không mất chu kỳ và bộ đang xem; bộ lọc Tất cả · Tôi dẫn · Đang theo dõi ghi trên đường dẫn» chưa?
- Kết quả nào là SỐNG: Mỗi bộ OKR có đường dẫn riêng; đổi thẻ con không mất chu kỳ và bộ đang xem; bộ lọc Tất cả · Tôi dẫn · Đang theo dõi ghi trên đường dẫn
- Kết quả nào là CHẾT: chưa đạt «Mỗi bộ OKR có đường dẫn riêng; đổi thẻ con không mất chu kỳ và bộ đang xem; bộ lọc Tất cả · Tôi dẫn · Đang theo dõi ghi trên đường dẫn» khi hết timebox
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp. Hạn cũ: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)

## Chủ kho chốt ở bước thiết kế (21/10)

Yêu cầu V1-17 của đợt vo-khu-muc-tieu, chủ kho trả lời nguyên văn: «V1-17: Hỏi-1 (a); Hỏi-2 (a); cho phép đổi chuỗi thước».

- Hỏi-1 (a): «Đang theo dõi» là các bộ OKR có ít nhất một mục tiêu người xem đang theo dõi; không thêm bảng theo dõi bộ, không đổi cơ sở dữ liệu.
- Hỏi-2 (a): đường dẫn của một bộ giữ dạng tham số `/okr/bo-okr?donOkr=<đơn vị>&xemOkr=<thẻ con>`; `/okr/bo-okr` không tham số là trang danh sách Bộ OKR; bộ của OneHub là `?donOkr=goc`.
- Cho phép đổi chuỗi thước: vòng này được đổi đúng chuỗi đường dẫn và bộ chọn ô chuyển kiểu xem trong thước của hồ sơ đã ký bị chạm, không đổi logic thước; mỗi hồ sơ đo hai chiều, dòng sổ fix mang decided_by chủ kho.
