---
slug: khung-cho-don-vi-mot-hinh
at: 2026-10-20T09:14:02Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Chữ ký ở AC-1 chỉ có số dòng, chiều cao dòng và đầu bảng; AC-4 chỉ so hàng công cụ ở mẫu khung cuối. | Fallback vẽ vạch hàng công cụ 32 px, pha chờ danh sách có hàng thật 28 px: đầu bảng nhảy 4 px mà E1 vẫn ra một hình, E4 vẫn đạt. | Thêm chiều cao hàng công cụ và khoảng tới đỉnh đầu bảng vào chữ ký; E4 lấy lệch lớn nhất mọi mẫu; phá thử cong-cu-lech. | fixed: AC-1 và lời đầu evals.yaml thêm hai số vào chữ ký; AC-4, E4 so mọi mẫu; E1 thêm KCD_PHA=cong-cu-lech ghim «SAI AC-1: dinh dau bang lech». |
| P1 | evals | E1, E2 chỉ nhận mẫu khung qua [data-khung-hang]; khung khác hình không mang thuộc tính đó thì máy không thấy. | Điều hướng mềm đi qua PageShellFallback của một ranh tải: E2 in «khong co pha khung» rồi đạt trong khi người thấy hai khung. | Tính vạch hay aria-busy ngoài khung bang-hai-dong là mẫu lạ; phá thử khung-la. | fixed: lời đầu evals.yaml định nghĩa mẫu lạ; E1, E2 tính mẫu lạ là hình riêng; E2 thêm KCD_PHA=khung-la ghim «SAI AC-2: mau khung la». |
| P1 | contract | AC-5 cấm vẽ vạch dưới okr/theo-don-vi/ mà không nói khung riêng của kiểu xem khác ở đâu; E5 đo bằng chuỗi nhập. | Khung riêng của kiểu xem khác nằm dưới thư mục thì E5 đỏ trên mã ngoài phạm vi; div animate-pulse thoát lần quét. | Ghi danh sách tệp dùng Skeleton hôm nay; quét mọi đường nhập và lớp animate-pulse; phá thử bằng div animate-pulse. | fixed: đo trên b32a1495f chỉ hang-cong-cu.tsx dùng Skeleton (khung kiểu xem khác ở ../trang-thai-okr.tsx); AC-5 và E5 quét mọi đường nhập Skeleton và animate-pulse bằng bộ phân tích TypeScript; phá thử ve-tay là div animate-pulse. |
| P2 | evals | E8 không dựng fallback của page.tsx; AC-5 không đòi fallback là KhungDangTaiDonVi. | Fallback là KhungXuong trần không nhan: pha tải cứng đọc «Đang tải…», thiếu data-trang-thai, mà E5, E8 xanh. | Thêm ca fallback vào kcd-a11y; phá thử fallback-tran. | fixed: AC-5 đòi fallback chính là KhungDangTaiDonVi; AC-7 và E8 thêm ca fallback; E8 thêm KCD_PHA=fallback-tran. |
| P2 | evals | E3 chỉ kiểm ô chọn có mặt và không disabled, không kiểm cú bấm. | Khe bị inert hay bị phủ: ô chọn không disabled nên E3 đạt, người bấm không thấy gì. | elementFromPoint tại tâm ô chọn, bấm thật, đòi [role=listbox] hiện; phá thử khe-inert. | fixed: AC-3 hứa bấm mở được danh sách; E3 đo elementFromPoint, bấm và listbox; thêm KCD_PHA=khe-inert. |
