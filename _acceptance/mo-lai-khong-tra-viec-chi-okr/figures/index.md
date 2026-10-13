# Hình tại điểm quyết định — mo-lai-khong-tra-viec-chi-okr

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-…-1 mở lại đi qua điều kiện nhận việc | ba bước nối tiếp (người cầm trịch → bước chưa xong → lượt theo dõi) và hai nhánh rẽ mỗi bước | cần hình: `luong-mo-lai.html` |
| d-…-4 Hỏi-1 ai cầm trịch sau mở lại | hai nhánh rẽ (người bấm mở lại · chọn trong hộp thoại) | gộp vào `luong-mo-lai.html` (nhánh người cầm trịch) |
| d-…-2 bước về «chưa giao» | dưới ngưỡng: một bước, một nhánh | — |
| d-…-3 không chặn mở lại | dưới ngưỡng: một lối sống | — |
| d-…-5 người đã rời xử như «chỉ OKR» | dưới ngưỡng: một điều kiện | — |
| d-…-6 bỏ đặc tả UX | dưới ngưỡng | — |
| d-…-7 Hỏi-2 không báo trên màn | dưới ngưỡng: hai lối, không nối bước | — |

## Đề bài `luong-mo-lai`

- Loại hình: flowchart, trái sang phải.
- Nút: «Bấm Mở lại» → «Kế hoạch mở, vết mở lại» → «Người cầm trịch nhận được việc?» (có → giữ nguyên; không →
  «Người bấm nhận được việc?» → không: «Từ chối 400, mọi thứ lùi, kế hoạch vẫn đóng»; có: «Người bấm cầm trịch, vết
  đổi cầm trịch» — gắn nhãn Hỏi-1) → «Mỗi bước chưa xong: người được giao nhận được việc?» (không → «Bước chưa giao,
  vết giao») → «Mỗi lượt theo dõi: người theo dõi nhận được việc?» (không → «Gỡ lượt theo dõi») → «Xong — thước
  DA0a về 0».
- Nhãn bằng chữ: «nhận được việc» = thành viên và vai đọc được dữ liệu đối tác; vai «chỉ OKR» hay đã rời → không.
- Ghi chú cạnh nút «Người bấm cầm trịch»: lối khác của Hỏi-1 — hộp thoại chọn người cầm trịch.
- AC liên quan: AC-1, AC-3, AC-4, AC-7.
