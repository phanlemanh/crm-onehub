---
schema_version: 1
slug: re-mo-hinh-mac-dinh
feature: Model mặc định của trợ lý và máy soạn chuyển sang Gemini 3.8 Flash
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-15T10:40:00Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

Trợ lý và máy soạn của CRM đang chạy mặc định trên `zai/glm-5.2-fast`. Giám sát đợt r2 đề xuất chuyển sang
`google/gemini-3.8-flash` (có ZDR) cho model mặc định của tác tử, máy soạn và trợ lý Kho tài liệu; giữ nguyên model
chấm (`MO_HINH_JUDGE`).

Căn cứ Cổng Đáng: chủ kho duyệt ở phiên giám sát khoảng 10:40Z ngày 15/10, nguyên văn «Đồng ý theo đề xuất trên»
(giám sát chuyển cho dãy P6). Phạm vi đã duyệt:

1. `DEFAULT_AGENT_MODEL` (`packages/db/src/settings.ts`): `zai/glm-5.2-fast` → `google/gemini-3.8-flash`.
2. `TAI_LIEU_AGENT.soan.maModel` và `hoi.maModel` (`apps/agent/agent/lib/tai-lieu-config.ts`) → `google/gemini-3.8-flash`,
   giữ `zeroDataRetention`; thêm giá Gemini 3.8 Flash vào `bangGia`: vào 0,75, ra 3,75 USD mỗi triệu token (theo
   `/v1/models` của Gateway lúc 15/10).
3. KHÔNG đổi model chấm (`MO_HINH_JUDGE`).
4. Đo lại bộ câu mẫu Kho tài liệu trên model mới bằng `do-bo-mau.ts`, đọc cột lỗi, đặt số cạnh ngưỡng cũ.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: trợ lý kho trên Gemini 3.8 Flash có giữ được kết quả của bộ 50 câu mẫu như lượt đã ký trên GLM không?
- Kết quả nào là SỐNG: mỗi ô theo tầng và kiểu chữ đạt ít nhất ngưỡng cũ của bộ chấm, câu lỗi model không nhiều hơn lượt đã ký.
- Kết quả nào là CHẾT: một ô tụt dưới ngưỡng cũ — đặt số cạnh ngưỡng, chủ kho quyết giữ hay quay lại GLM.
- Timebox: trong ngày 15/10.
