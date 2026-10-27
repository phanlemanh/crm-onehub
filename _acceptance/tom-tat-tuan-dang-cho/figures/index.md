# Hình tại điểm quyết định — tom-tat-tuan-dang-cho

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-10 (thay d-…-9, d-…-1): một luật giờ xếp dùng chung cho tác tử và đường đọc (Hỏi-2) | 4 nhánh rẽ (toi-luc · dang-xep · tam-dung · không khoá) sau 5 bước lọc nối tiếp | `luong-khoi-tom-tat` |
| d-…-2: khoá `choBan` tuỳ chọn | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-…-3: chỉ «bản đầu tiên» | dưới ngưỡng: 1 nhánh rẽ (đã có / chưa có bản) | gộp vào `luong-khoi-tom-tat` |
| d-…-4: chữ tạm nghỉ | dưới ngưỡng: 2 lá của một nhánh | gộp vào `luong-khoi-tom-tat` |
| d-…-5: dòng trong CardContent | dưới ngưỡng: 0 nhánh | — |
| d-…-11 (thay d-…-6): tự hỏi lại ở dang-xep và ở luc | dưới ngưỡng: 2 lá của nhánh đã vẽ | gộp vào `luong-khoi-tom-tat` |
| d-…-7: bỏ design-pass (Hỏi-1) | dưới ngưỡng: 2 lối, không chuỗi bước | — |
| d-…-8: không chạy đường nền ở phiên S1 | dưới ngưỡng: 0 nhánh | — |

## Đề bài hình `luong-khoi-tom-tat`

- Loại: flowchart dọc, rẽ nhánh (decision diamonds), nhãn tiếng Việt.
- Nút theo thứ tự: «Mở Họp tuần của phòng» → ◇ «Nấc của phòng là bật?» (không → lá «Không hiện gì — như trước») →
  ◇ «Có bản tuần mới nhất / đang soạn / chưa cập nhật?» (có → lá «Trạng thái cũ: bản · đang soạn · chưa cập nhật»)
  → ◇ «Chu kỳ đang chạy và phòng chưa từng có bản nấc bật?» (không → lá «Không hiện gì — như trước») →
  ◇ «Kara sẵn sàng (trần tháng, khoá mô hình)?» (hết trần, lần xếp kế cùng tháng → lá «Tạm nghỉ tới 01/<tháng sau>»;
  chưa có khoá → lá «Chưa nối mô hình AI») → ◇ «Giờ xếp hôm nay đã qua và lượt xếp chưa xong?» (có → lá «Đang xếp,
  vài phút») → lá «Bản đầu tiên tới khoảng 06:00 <thứ>, <ngày> (lần xếp kế)».
- Tô khác màu ba lá mới của vòng (toi-luc, dang-xep, tam-dung) so với lá «như trước».
- AC liên quan: AC-1, AC-4, AC-5, AC-6.
