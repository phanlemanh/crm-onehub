---
schema_version: 1
slug: tro-ly-kho-dung-phien
feature: «Trợ lý kho chỉ được mời ở tab Hỏi và Zalo, hết lỗi và hết tốn tiền vô ích»
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-04T12:55:41Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: l4b
lo_trinh_tep: docs/plan/lo-trinh-kho-tai-lieu.json
---

## Vấn đề & ai gặp

Mở từ hàng l4b của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`): Ngoài-4 của
`tro-ly-doc-kho` (sổ `d-20261001T231031Z-75`, chủ kho chọn «mở hợp đồng mới» 01/10) cộng ZDR
cho phiên gốc «kho». Mốc 13/10 «Hỏi được»; 14/10 khởi động nhỏ.

- **Trợ lý kho được mời ở mọi phiên gốc.** eve mời mọi subagent trong `apps/agent/agent/subagents/`
  vào phiên gốc, nên `tro_ly_kho` có mặt cả trong khung chat CRM, lượt Tác nhân, hội thoại dựng
  Tác nhân. Mô tả của nó («luật, chính sách, quy trình, biểu mẫu») mời model gọi nó khi nhân viên hỏi
  quy định ngay trong chat CRM. Phiên con mở ra thì `moHoi` (`lib/tai-lieu-hoi.ts:86-94`) không thấy
  câu kho nào đang mở và ném `KHONG_PHAI_HOI`: phiên hỏng sau vài giây, đã tốn token, người hỏi không
  có câu trả lời. Hỏi quy định chỉ chạy đúng ở tab «Hỏi» và ở Zalo.
- **Câu hỏi kho đi qua model gốc không ZDR.** `guiHoiKho` (`lib/tai-lieu-hoi-phien.ts:100-118`) gửi
  nguyên văn câu hỏi vào phiên gốc purpose `kho`; model phiên gốc là `modelChoPhienGoc`
  (`lib/model.ts:41`), không ghim zero-data-retention. Phiên con `tro_ly_kho` có ZDR
  (`modelTaiLieu("hoi")`), nhưng câu hỏi về chính sách nội bộ đã đi qua model gốc trước đó.

**Người gặp:** nhân viên hỏi quy định trong chat CRM (không được trả lời, không biết vì sao) · chủ
kho (trả tiền cho phiên hỏng; câu hỏi nội bộ đi qua nhà cung cấp không cam kết xoá dữ liệu).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: trong đợt chạy thật, có phiên `tro_ly_kho` nào mở ngoài tab Hỏi và Zalo, và có câu hỏi kho nào đi qua model không ZDR không?
- Kết quả nào là SỐNG: 0 phiên `tro_ly_kho` hỏng vì `KHONG_PHAI_HOI` trên production trong timebox, và mọi lời gọi model của phiên gốc purpose `kho` mang ZDR.
- Kết quả nào là CHẾT: ≥ 1 phiên `tro_ly_kho` mở từ chat CRM, lượt Tác nhân hay dựng Tác nhân; hoặc ≥ 1 câu hỏi kho đi qua model gốc không ZDR.
- Timebox: đo cùng chạy thật mọi phòng ban 2026-10-26 → 2026-11-09, đọc số 2026-11-10 (đếm `AgentEvent`/`AiChiPhi` theo phiên con `tro_ly_kho` và purpose phiên gốc).
