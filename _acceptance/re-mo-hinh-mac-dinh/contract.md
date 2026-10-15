---
schema_version: 1
feature: Model mặc định của tác tử, máy soạn và trợ lý Kho tài liệu chuyển từ GLM 5.2 Fast sang Gemini 3.8 Flash, giữ ZDR, ghi giá mới vào sổ chi phí, không đổi model chấm, rồi đo lại bộ câu hỏi mẫu cạnh ngưỡng cũ
slug: re-mo-hinh-mac-dinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [config]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-15
design_doc: _acceptance/re-mo-hinh-mac-dinh/design.md
---

# Acceptance Contract: re-mo-hinh-mac-dinh

## Context

Hàng phát sinh của dãy P6, đợt r2. Cổng Đáng ký `build` (chủ kho, khoảng 10:40Z 15/10, nguyên văn «Đồng ý theo đề
xuất trên», ghi ở `opportunity.md`). Hiện trạng và việc làm ở `design.md`.

## Criteria

- AC-1: Given workspace chưa chọn model ở Cài đặt → Chung, When một lượt tác tử dựng hay chạy bắt đầu, Then model của lượt là `google/gemini-3.8-flash` với cửa sổ 1.000.000 token, và cài đặt đọc ra đúng model đó kèm cờ «mặc định»; And workspace đã chọn một model không còn trong danh mục Gateway thì lượt lùi về `google/gemini-3.8-flash`.
- AC-2: Given workspace đã chọn một model khác ở Cài đặt → Chung, When lượt tác tử bắt đầu, Then lượt dùng đúng model đã chọn, không bị đổi sang Gemini.
- AC-3: Given máy soạn đề xuất và trợ lý đọc kho của Kho tài liệu, When mỗi bên dựng model cho một lượt theo đúng định nghĩa subagent của mình, Then model là `google/gemini-3.8-flash` và tham số mỗi lời gọi mang `zeroDataRetention: true`.
- AC-4: Given sổ chi phí của máy soạn, When một phiên soạn trên Gemini 3.8 Flash ghi token vào và ra, Then chi phí tính theo giá chủ kho đã duyệt (0,75 USD mỗi triệu token vào, 3,75 USD mỗi triệu token ra), khớp ảnh chụp danh mục Gateway ngày 15/10; And GLM 5.2 Fast vẫn tính theo giá GLM; And model không có trong bảng giá vẫn ghi chi phí rỗng như cũ.
- AC-5: Given trợ lý OKR, When hệ thống chọn model chấm, Then model chấm vẫn là `zai/glm-5.2-fast` ở cả hai nơi khai.
- AC-6: Given bộ 50 câu hỏi mẫu và ngưỡng cũ của bộ chấm, When đo lại trợ lý kho trên Gemini 3.8 Flash ở cây của lượt này, Then bốn chỉ số (đúng trang, từ chối đúng, chuyển quy định, chuyển nhầm) đặt cạnh ngưỡng cũ và đều đạt theo kết luận của bộ chấm; câu lỗi gọi model không nhiều hơn lượt đã ký của `bo-cau-hoi-mau`; bằng chứng neo vào mã trợ lý của cây đang xét, mà cấu hình của cây ấy chọn `google/gemini-3.8-flash` cho trợ lý kho.

## Coverage

Không quét không gian: phạm vi là bốn mục chủ kho đã duyệt ở Cổng Đáng — danh sách đóng, không phải không gian cần
liệt kê; xem entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`. Đối chiếu đủ: mục (1) → AC-1, AC-2; (2) →
AC-3, AC-4; (3) → AC-5; (4) → AC-6.

## Đường đo

- Bốn chỉ số của bộ chấm trên 50 câu mẫu (đúng trang, từ chối đúng, chuyển quy định, chuyển nhầm) cạnh ngưỡng cũ ·
  số từ `evidence/do-bo-mau.md` của hồ sơ, chấm lại bằng `rang/so-nguong.ts` · AC-6 bảo đảm.
- Câu lỗi gọi model lượt một so với lượt đã ký của `bo-cau-hoi-mau` · cùng nguồn · AC-6 bảo đảm.

## Out of scope

- Model chấm `MO_HINH_JUDGE` của trợ lý OKR.
- Trợ lý OKR (đã chạy Gemini 3.8 Flash từ trước).
- Ghi đè lựa chọn model của workspace đã chọn ở Cài đặt → Chung.
- Sửa tài liệu kế hoạch hay bằng chứng đã ký còn nhắc GLM.

## Notes

- AC-6 gọi model thật qua AI Gateway một lượt (khoảng 96 lượt hỏi, ước $1–2 trên giá Gemini).
- Lượt đo của bộ chấm không ghi mã model mà Gateway trả về; AC-6 neo vào cấu hình model của cây được đo (giới hạn đã
  biết, xem dòng sổ revisit).
- Nếu một chỉ số tụt dưới ngưỡng cũ: bằng chứng đặt số cạnh ngưỡng, chủ kho quyết giữ Gemini hay quay lại GLM ở Cổng
  Bằng chứng (ô cơ hội: «CHẾT»).
