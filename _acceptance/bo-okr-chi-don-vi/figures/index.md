# Hình tại điểm quyết định — bo-okr-chi-don-vi

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — người dẫn cả khối lẫn phòng mở Họp tuần không kèm đơn vị | 2 nhánh rẽ | cau-hoi.html |
| Hỏi-2 — nút Đã bỏ khi bộ chưa bỏ mục tiêu nào | 2 nhánh rẽ | cau-hoi.html |
| Hỏi-3 — thước «sang bộ phòng qua menu» trên production | 2 nhánh rẽ | cau-hoi.html |
| Luồng chính — trưởng khối sang bộ một phòng | 3 bước nối tiếp | luong-menu.html |
| Nhóm 2 design-pass (BreadcrumbMenu, ds_skill, 0/0, đệm câu rỗng) | dưới ngưỡng: mỗi mục 1 ngả | — |

## Đề bài cau-hoi.html

Ba cây quyết định nhỏ đặt cạnh nhau, mỗi cây một câu: nút gốc là câu hỏi; hai nhánh «máy khuyên» (tô nhấn) và «lối
khác», mỗi nhánh một dòng hệ quả. Hỏi-1: giữ bộ phận (Họp tuần mở khối, khối rỗng thì câu rỗng chỉ sang menu) · đổi
sang phòng ban khi khối không có KR riêng (thêm nhánh vào boHopTuan, dòng sổ fix HT1 AC-2). Hỏi-2: ẩn nút khi 0 ·
hiện «Đã bỏ (0)» như Đã lưu trữ của Thoả thuận. Hỏi-3: bỏ thước production, đọc giá trị ở phiên nghiệm thu · thêm bộ
đếm vào install_daily (đụng gói telemetry, khoảng nửa vòng máy). AC liên quan: AC-8, AC-6, «Đường đo».

## Đề bài luong-menu.html

Luồng bốn nút: Bộ OKR › Tôi dẫn → bộ Khối Kinh doanh (chỉ 2 mục tiêu riêng, bốn ô số riêng) → bấm «Khối Kinh doanh ▾»
→ menu ba nhóm Thuộc (OneHub) · Cùng cấp (Khối Vận hành, Khối Hỗ trợ) · Trực thuộc (bốn phòng, kèm số mục tiêu) →
bộ Kinh doanh miền Bắc, cùng thẻ con. Nhánh phụ: Họp tuần OneHub rỗng → câu chỉ sang menu → Họp tuần của khối. Ghi
chú «Toàn cảnh vẫn cộng dồn» cạnh nút khối. AC liên quan: AC-1, AC-4, AC-5, AC-8.
