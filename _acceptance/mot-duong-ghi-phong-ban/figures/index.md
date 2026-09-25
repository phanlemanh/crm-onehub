# Hình tại điểm quyết định — mot-duong-ghi-phong-ban (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 gỡ hẳn sáu thủ tục cũ (không lối chuyển tiếp) | hai nhánh rẽ (trước / sau) | `duong-ghi.html` |
| d-…-2 một hàm «xoá được» cho ba nơi đọc | ba nơi đọc từ một nguồn | `duong-ghi.html` (chung hình) |
| d-…-3 hai câu từ chối đổi theo chữ của cây | dưới ngưỡng: 1 bước | — |
| d-…-4 + d-…-10 sửa bài kiểm của bảy hồ sơ rồi ghim lại bằng một làn | bốn bước nối tiếp | `ghim-lai.html` |
| d-…-5, 6, 7 bỏ design-pass, đặc tả UX, ui-observed | dưới ngưỡng: 1 bước mỗi dòng | — |
| d-…-8, 9 để ngoài vòng: luật tên của nhập, đường đọc của Điều phối | dưới ngưỡng: 1 bước mỗi dòng | — |

## Đề bài `duong-ghi.html`

- Loại: hai cột «Trước» và «Sau», mỗi cột là sơ đồ luồng từ nơi gọi tới bảng phòng ban.
- Trước: màn Tổ chức → `org.*` (tạo, đổi tên, chuyển) và → `onboarding.*` (lưu trữ, khôi phục, xoá hẳn); gọi thẳng tRPC/REST → `onboarding.*` (tạo, đổi tên, sắp — không chặn trùng, ≤120). Điều kiện «xoá được» ở ba hộp riêng: cây, lệnh xoá, danh sách onboarding (thiếu vế người — tô cờ).
- Sau: mọi nơi gọi → `org.*` (sáu thao tác, một bộ luật) → bảng phòng ban; `onboarding` chỉ còn đọc danh sách. Một hộp «luật xoá được» với ba mũi tên tới: cây, lệnh xoá, danh sách onboarding.
- Nhãn bằng chữ thường, tiếng Việt; tên thủ tục giữ nguyên trong ngoặc.
- AC liên quan: AC-1, AC-4, AC-6.

## Đề bài `ghim-lai.html`

- Loại: sơ đồ bốn bước nối tiếp, trái sang phải.
- Bước 1: máy rút tập hồ sơ đã ký có eval chạy tệp kiểm bị sửa → bảy hồ sơ (liệt kê tên).
- Bước 2: mỗi hồ sơ một dòng `revisit` trong sổ quyết định của nó, rồi sửa tệp kiểm — chỉ đường gieo, đường gọi, tên gieo, hai câu từ chối.
- Bước 3: một lượt làn máy ghim lại cả bảy tại HEAD — chạy mọi eval máy của từng hồ sơ; một eval đỏ thì dừng, không ghi gì.
- Bước 4: kiểm tra trước khi gộp của cả kho sạch; người soi ở Cổng Bằng chứng rằng không khẳng định nào bị nới (E9).
- AC liên quan: AC-7, AC-8.
