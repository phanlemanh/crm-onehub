# Điểm quyết định ở Cổng 1 — vòng ③a

Kê từ artifact cuối S1. Ngưỡng: từ ba bước nối tiếp hoặc từ hai nhánh rẽ trở lên
thì bắt buộc kèm hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Cắt vòng ③ làm ba lát, lấy lát đầu theo ngưỡng nghiệm thu | 3 lát nối tiếp + khoản nợ thừa kế từ ① | **cần hình** — `ban-do-vong.html` |
| Bảy giai đoạn thoả thuận: dịch hay khai tiếng | 2 nhánh rẽ | **cần hình** — `giai-doan-thoa-thuan.html` |
| Đường A (kho chuỗi) so với đường B (thư viện) | 2 nhánh, ĐÃ chốt ở phiên brainstorm | dưới ngưỡng cho cổng này: quyết định đã chốt, bảng so trong thẻ là đủ |
| AC-10 viết lại lời hứa mâu thuẫn giữa vòng ① và ② | 2 ngưỡng bề rộng, không phải nhánh rẽ | dưới ngưỡng: 2 — ma trận ảnh chụp thật đã đính kèm |

## Đề bài hình 1 — `ban-do-vong.html`

- Loại: sơ đồ luồng ngang, năm vòng của việc tiếng Việt.
- Nút: ② Bộ dựng chung (đã ký) · ① Xương sống (chờ chữ ký) · **③a Ba luồng của
  ngưỡng (vòng này)** · ③b Cài đặt · ③c Trang khác · ④ Câu máy chủ · ⑤ Chữ tác nhân.
- Mũi tên khoản nợ: từ ① sang ③a, nhãn "5 chuỗi + chữ thời gian tương đối".
- Mũi tên phạm vi hoãn: từ ③a sang ③b và ③c.
- Ghi số chuỗi trên mỗi nút: ② 43 · ① 44 · ③a 569 · ③b 308 · ③c 319 · ⑤ 327.
- Đánh dấu ③a là vòng đang duyệt.
- AC liên quan: AC-1, AC-4.

## Đề bài hình 2 — `giai-doan-thoa-thuan.html`

- Loại: sơ đồ hai nhánh, một câu hỏi ở đầu.
- Câu hỏi: "Bảy giai đoạn thoả thuận — đặt tên tiếng Việt bây giờ, hay để nguyên
  và khai đúng tiếng của chúng?"
- Nhánh trái "Đặt tên bây giờ": cần người định nghĩa bảy bước hợp tác thật của
  OneHub → dịch → nhân viên đọc được ở bước cuối của luồng ngưỡng.
  Rủi ro: `CONTEXT.md` khai bảy bước hiện tại là phễu bán phần mềm thừa kế, không
  mô tả quy trình OneHub — dịch một bước không xảy ra là in cái sai bằng tiếng Việt.
- Nhánh phải "Khai tiếng, chưa dịch" (AC-14 đang viết theo nhánh này): giữ nguyên
  `DEMO_BOOKED`… trong phần tử `lang="en"` → trình đọc màn hình đọc đúng giọng,
  nhưng nhân viên vẫn gặp tiếng Anh ở bước bắt buộc cuối.
  Hệ quả đo được: ngưỡng UAT "không ai gặp một câu tiếng Anh nào ở bước bắt buộc"
  sẽ TRƯỢT ở bước này, và trượt một cách đã biết trước.
- AC liên quan: AC-14, và ngưỡng nghiệm thu ở `opportunity.md`.
