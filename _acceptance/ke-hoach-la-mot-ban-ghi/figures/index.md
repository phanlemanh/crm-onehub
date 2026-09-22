# Hình tại điểm quyết định — ke-hoach-la-mot-ban-ghi (Cổng Phạm vi)

Ngưỡng N5: điểm nào có từ ba bước nối tiếp hoặc từ hai nhánh rẽ thì cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 mọi người đánh dấu được bước xong | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-…-2 vết nào hiện ở dòng thời gian công ty | cần hình: 2 nhánh (chỉ planId / planId + companyId), 4 bước | F1-vet-di-dau |
| d-…-3 kế hoạch là loại bản ghi thứ tư, menu riêng | cần hình: 4 bước nối tiếp (danh mục → openRecord → sheet → sheet công ty chồng) + nhánh đường cũ chuyển hướng | F2-loi-vao-sheet |
| d-…-4 PLAN_CHANGE thay vì TASK / STAGE_CHANGE | gộp vào F1 (cùng đường ghi) | F1-vet-di-dau |
| d-…-5 mỗi thủ tục một việc một vết | gộp vào F1 | F1-vet-di-dau |
| d-…-6 bỏ sửa nhãn bước | dưới ngưỡng: 1 bước | — |
| d-…-7 bỏ sửa số ngày mục tiêu | dưới ngưỡng: 1 bước | — |
| d-…-8 không có tab Agent | dưới ngưỡng: 1 bước | — |
| d-…-9 Lên/Xuống thay kéo thả | dưới ngưỡng: 1 bước | — |
| d-…-10 thu hẹp AC-10 | dưới ngưỡng: 2 bước | — |
| d-…-11 gộp AC-4, AC-5 mới là phần nối màn | gộp vào F2 (phần nối màn → thủ tục) | F2-loi-vao-sheet |
| design-pass Nhóm 2: «Cầm trịch» hay «Phụ trách» | dưới ngưỡng: 2 lựa chọn, 0 bước | — |
| design-pass Nhóm 2: bảng môi giới ở khổ 375 | dưới ngưỡng: 2 lựa chọn, 0 bước | — |

## Đề bài F1-vet-di-dau

- Loại hình: luồng dữ liệu (data flow) có một chỗ rẽ.
- Nút: người bấm (tab Bước) → thủ tục ghi (assignStep · setStepDone · rescheduleStep · addStep · removeStep · setPlanOwner · closePlan/reopenPlan) → MỘT transaction: OnboardingStep (+ updatedAt) và Activity PLAN_CHANGE (meta theo kind, createdById = người bấm) → rẽ: vết buoc.* chỉ mang planId → chỉ dòng thời gian kế hoạch · vết keHoach.* và ghi chú NOTE mang planId + companyId → dòng thời gian kế hoạch VÀ dòng thời gian công ty → danh mục đọc updatedAt → cột Im lặng.
- Nhãn bằng chữ: «một transaction», «chỉ planId», «planId + companyId», «Im lặng sống lại».
- AC liên quan: AC-1, AC-2, AC-6, AC-7, AC-9, AC-14.

## Đề bài F2-loi-vao-sheet

- Loại hình: wireflow / luồng màn có nhánh.
- Nút: danh mục 30 ngày (bảng) → bấm hàng → `?record=plan:<id>` → sheet kế hoạch trượt ra, bảng còn phía sau → «Hồ sơ công ty» → sheet công ty chồng lên (nút quay lại) · nhánh: link cũ `/onboarding/<id>` → chuyển hướng về `?record=plan:<id>` · trong sheet: dòng bước → ô tích / người / hạn → thủ tục với stepId của chính dòng đó → làm mới danh mục và sheet.
- Nhãn bằng chữ: «giống thoả thuận», «đường cũ vẫn mở», «đúng dòng», «làm mới».
- AC liên quan: AC-5, AC-11, AC-12, AC-15.
