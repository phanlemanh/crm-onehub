# Hình tại điểm quyết định — tat-ban-preview (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 (d-20261016T013339Z-7): tắt hẳn Preview (lối A) hay giữ Preview và tách DB (lối B, C) | hai nhánh rẽ → cần hình | `preview-hom-nay-va-sau.html` |
| d-20261016T012943Z-5: khoá của api ở `vercel.json` gốc kho, không ở `apps/api/vercel.json` | gộp vào cùng hình (một bảng bốn dự án → tệp) | `preview-hom-nay-va-sau.html` |
| d-…-1, -2 (descope coverage-scan, đặc-tả-UX), -4 (deploymentEnabled thay Ignored Build Step), -6 (phép thử mới) | dưới ngưỡng: một lối, không rẽ | — |

## Đề bài hình `preview-hom-nay-va-sau`

- Loại: so sánh hai cột «Hôm nay» · «Sau vòng này», kèm một bảng nhỏ «dự án → tệp Vercel đọc».
- Hôm nay: đẩy nhánh → ba dự án (app, api, agent) dựng Preview → đọc biến đích preview (cùng DB production) → 840 bản/7 ngày, 0 request/24 h. agent-okr: đã tắt từ 04/10.
- Sau: đẩy nhánh → 0 Preview ở cả bốn; đẩy/gộp `onehub` → Production cả bốn (kiểm READY).
- Bảng tệp: app → `apps/app/vercel.json` · api (Root Directory trống) → `vercel.json` gốc kho · agent → `apps/agent/vercel.json` · agent-okr → `apps/agent-okr/vercel.json`; ghi chú bẫy: `apps/api/vercel.json` chỉ mang cron.
- AC liên quan: AC-1, AC-4, AC-5, AC-6.
