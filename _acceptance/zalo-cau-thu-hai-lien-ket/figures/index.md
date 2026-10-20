# Hình tại điểm quyết định — zalo-cau-thu-hai-lien-ket

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — vá hẹp hay vá rộng (d-20261019T152412Z-9) | hai nhánh rẽ, mỗi nhánh một chuỗi ba bước (tin Zalo → liên kết → phiên con tra câu) | cau-hai-hai-loi |
| Hỏi-2 — ngưỡng lỗi model và trần chi (d-20261019T152412Z-10) | dưới ngưỡng: một con số, hai lựa chọn không có bước nối | — |
| Giữ luật in dòng nhật ký của l6 (d-20261019T152412Z-8) | dưới ngưỡng: một quy tắc, không rẽ | — |
| Giữ hạng T3 (d-20261019T151959Z-3) | dưới ngưỡng: một nhãn | — |
| Ca câu trước còn mở để Out of scope (d-20261019T151959Z-7) | gộp vào hình cau-hai-hai-loi (nhánh vá hẹp để lại ca này) | cau-hai-hai-loi |

## Đề bài: cau-hai-hai-loi

- Loại hình: sequence (hai làn thời gian xếp chồng: câu một, câu hai trong cùng phiên gốc).
- Nút: tin Zalo → `hoiTacTu` (hàng ZaloHoi, cùng token phiên theo ngày) → `send` → `session.started` (chỉ câu một) /
  `turn.started` (mọi câu) → hook ghi `ZaloHoi.sessionId` → agent gốc gọi `tro_ly_kho` → bộ nạp chỉ dẫn `moHoi` tra
  8 × 250 ms → chỉ dẫn kho mang mã câu, hoặc chỉ dẫn dừng.
- Nhãn: «hôm nay: câu hai không có hook, chỉ moPhien ghi sau send — thua cuộc đua thì chỉ dẫn dừng»; «vá hẹp: hook ở
  turn.started ghi trước bước model đầu»; «vá rộng: moHoi đọc hoiId của lượt — đóng thêm ca câu trước còn mở, đổi hành vi
  l6».
- AC liên quan: AC-1, AC-4, AC-5; Out of scope gạch một.
