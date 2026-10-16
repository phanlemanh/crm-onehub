# Hình tại điểm quyết định — so-do-can-chinh-don-vi (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — khung vẽ: React Flow + dagre hay SVG tự vẽ | hai nhánh rẽ → cần hình | `hoi-1-khung-ve` |
| Hỏi-2 — B5 làm trong vòng hay hoãn | hai nhánh rẽ → cần hình | `hoi-2-b5` |
| Định nghĩa «chưa nối lên» (đường liền, đứt, không dây) — dòng sổ máy quyết chờ seal | ba ô nối tiếp (góp cha · góp ra đơn vị khác · chỉ nội bộ) → cần hình | `so-do-duong-noi` |
| Các dòng sổ S1 khác (Bảng mặc định, nuqs, danh sách hẹp, tinhTrang, lý do trong thẻ mở) | dưới ngưỡng: một lựa chọn, không rẽ | — |

## Đề bài

- **hoi-1-khung-ve** — so sánh hai cột. Cột trái «React Flow + dagre (khuyên)»: +~61 KB và ~17 KB gzip, nạp lười chỉ ở cách xem Sơ đồ, MIT, luật «Block có phần máy» lên cùng PR, DH5 dùng lại. Cột phải «SVG tự vẽ»: 0 KB ngoài, +~4–6 giờ máy (xếp vị trí, đường uốn, lia/phóng, phím), DH5 có thể phải thêm thư viện sau. AC liên quan: AC-4, AC-11, AC-15.
- **hoi-2-b5** — hai nhánh. «Làm B5 (khuyên)»: trang đơn vị bỏ cách xem Cây, đường cũ ?xemOkr=cay → Toàn cảnh › Sơ đồ mở thẻ đơn vị; giá ~1 giờ máy ghim lại hoặc nghỉ eval đo cây của 2 hồ sơ đã ký và bài theo-don-vi-cay. «Hoãn tới sau phiên nghiệm thu»: cây hiện toàn công ty dù chọn đơn vị, tới chậm nhất 04/11. AC liên quan: AC-13, AC-14.
- **so-do-duong-noi** — sơ đồ nhỏ: thẻ Công ty trên cùng; Bộ phận A, Bộ phận B; phòng ban A1 (góp vào A → nét liền A→A1), A2 (góp chéo sang B → nét đứt B→A2), X chưa xếp (góp thẳng công ty → nét liền Công ty→X), B2 (chỉ góp nội bộ → không dây, nhãn «Chưa nối lên»). Chú giải ba dòng. AC liên quan: AC-1, AC-5.
