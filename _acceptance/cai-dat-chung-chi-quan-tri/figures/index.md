# Hình tại điểm quyết định — cai-dat-chung-chi-quan-tri (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 Cờ canManage đi cùng ba query (không query access riêng) | 2 bước (API trả → card/proxy đọc), 0 nhánh — dưới ngưỡng | — |
| d-…-2 Cổng /onboarding/research chỉ đẩy người có canManage | 4 bước nối tiếp (đăng nhập → cổng đặt tên → cổng khoá → ứng dụng) + 2 nhánh (có/không canManage; có/không khoá) — cần hình | cong-nghien-cuu |
| d-…-3 Kiểm quyền là dòng đầu của ba mutation | 5 bước nối tiếp (requireManager → verify/catalog → ghi DB → backfill → trả lời) + 1 nhánh (403) — cần hình | thu-tu-kiem-quyen |
| d-…-4 bỏ design-pass | 0 bước — dưới ngưỡng | — |
| d-…-5 không áp router khác, không sửa workspace-form | 0 bước — dưới ngưỡng | — |
| [GIẢ ĐỊNH] vai trò của chủ kho trên prod | 0 bước — dưới ngưỡng | — |

## Đề bài

### cong-nghien-cuu
- Loại: flowchart (luồng cổng proxy khi đăng nhập).
- Nút: «Có phiên» → «Workspace đã đặt tên?» (không + canRename → /onboarding) → «Đã có khoá nghiên cứu?» (có → ứng dụng) → «canManage?» (true → /onboarding/research; false hoặc thiếu → ứng dụng, MỚI).
- Nhấn mạnh nhánh mới: thành viên thường không bị đẩy; gõ thẳng /onboarding/research khi đã settled → về trang chính.
- Nguồn cờ: trả lời thật của settings.researchKey, đọc bằng congNghienCuu (@crm/validation/cong-nghien-cuu).
- AC liên quan: AC-6, AC-8.

### thu-tu-kiem-quyen
- Loại: sequence/flow một mutation (ví dụ setResearchKey).
- Nút: lời gọi (tRPC / khoá API / REST) → AuthMiddleware (có phiên) → requireManager (canManageWorkspaceSettings) → [không đủ quyền: 403, dừng, không gọi gì] → researchKeys.verify (agent → Context.dev) → ghi DB → backfill.run("companies") → trả lời kèm canManage: true.
- Nhấn mạnh: 403 xảy ra TRƯỚC mọi lời gọi ra ngoài; bộ đếm của E2 đo đúng điều này.
- AC liên quan: AC-2, AC-3.
