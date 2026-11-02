---
schema_version: 1
slug: bang-chung-kr-mot-loi
feature: Người phụ trách KR ghim một đường dẫn bằng chứng ngay trong ngăn KR, ở một chỗ duy nhất, và thấy nó trong danh sách bằng chứng của KR
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: SV10
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng SV10 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/vong-tin-hieu-1410.md#bd4284d162e34f4bda36aa1d253212ad6d660d42` — chưa có trang: trang nền, trang đợt okr-ghi-trong-ngan-3010
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Người phụ trách KR ghim một đường dẫn bằng chứng ngay trong ngăn KR, ở một chỗ duy nhất, và thấy nó trong danh sách bằng chứng của KR

Vì sao: Bản soát 30/10: bằng chứng của KR vào bằng hai lối — Dialog ở apps/app/components/crm/record-sheet/kr-bang-chung.tsx:105 và ô URL trong hộp cập nhật (okr/hop-thoai-cap-nhat-kr.tsx:318-346) cho KR mốc. Luật mới: một việc một chỗ ghi, không Dialog để ghi một dòng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Ghim một đường dẫn từ ngăn KR: không Dialog nào mở, bằng chứng hiện ngay trong danh sách; khối cập nhật của KR mốc dùng cùng ô đó» chưa?
- Kết quả nào là SỐNG: [đề xuất] Ghim một đường dẫn từ ngăn KR: không Dialog nào mở, bằng chứng hiện ngay trong danh sách; khối cập nhật của KR mốc dùng cùng ô đó
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Ghim một đường dẫn từ ngăn KR: không Dialog nào mở, bằng chứng hiện ngay trong danh sách; khối cập nhật của KR mốc dùng cùng ô đó» khi hết timebox
- Timebox: …
