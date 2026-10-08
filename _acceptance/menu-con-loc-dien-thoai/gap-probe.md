---
slug: menu-con-loc-dien-thoai
at: 2026-10-08T01:36:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E7 đếm mọi tệp đổi ngoài packages/ui, chặt hơn lời hứa AC-7 | Ký Cổng 1 vẽ lại PRODUCT-MAP.md ở gốc, E7 đỏ dù không nơi gọi nào bị chạm | Đếm dòng thêm chạm DropdownMenuSubContent trong tệp dưới apps/, đối chứng dương sau commit ký | fixed: E7 chỉ xét tệp dưới apps/, đếm dòng thêm chạm DropdownMenuSubContent; đối chứng dương trên nhánh sau ký Cổng 1; chiều đỏ diff giả ở bulk-actions.tsx |
| P1 | evals | AC-1 hứa chạm trên điện thoại, E1 đo bằng chuột ở khung 375 | Radix mở menu con theo đường chuột và vùng đệm con trỏ; E1 xanh trong khi chạm thật hỏng | Viewport hasTouch, isMobile; touchscreen.tap; in pointerType | fixed: các ô 375 của E1 và E2 chạy hasTouch/isMobile, mở và chọn bằng touchscreen.tap, in pointerType; AC-1 nói rõ sự kiện chạm |
| P2 | evals | Ngưỡng right ≤ 367 không có dung sai làm tròn DPR | Cài đúng mà mép phải ra 367.5, ô 375 SAI oan, tốn một vòng S4 | left ≥ 7, right ≤ 368, in số thô | fixed: E1, E2 dùng [7, 368] và in số thô; chiều đỏ vẫn bắt (bản cũ right 567) |
| P2 | evals | E4 ở 768 không có chiều đỏ hay đối chứng trên bản gốc | Bản gốc đã đủ chỗ ở 768 nên E4 xanh dù không sửa gì, thẻ ghi như bằng chứng của phần sửa | Chạy ô 768 trên merge-base, ghi rõ là kiểm không hồi quy | fixed: AC-4 ghi «kiểm không hồi quy»; E4 chạy thêm ô trên bản merge-base và in số hai bản cạnh nhau |
| P2 | design, evals | Vế «nơi gọi ghi đè collisionPadding» của AC-5 không eval nào đo | Đặt mặc định sau props làm mất ghi đè mà mọi eval vẫn xanh | Bỏ vế ghi đè hoặc thêm ca đo | fixed: bỏ vế «ghi đè được» khỏi AC-5 và mục Kiểm của design; lề 8 px đo ở E1 |
