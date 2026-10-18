# Chờ Tác nhân lâu — thiết kế

Hàng K7 của đợt r2 (dãy P7). Hồ sơ `_acceptance/cho-tac-nhan-lau/`. Câu giao của chủ kho: «Vậy trải nghiệm lớn hơn 200s
cần được thay đổi ux».

## Hiện trạng (đọc mã 16/10, onehub 7ebcb0242)

- Người dùng gửi yêu cầu ở `/chat`; màn `/chat/<id>` (`AgentBuilderChat`) hiện `BuildingAgentCard`: «Đang dựng tác
  nhân», bộ đếm «N trên 4», bốn bước (Phạm vi · Chỉ dẫn · Bản khai · Soát lại), «Đang ghi <tệp>», chân thẻ «Chạy
  ngầm» và nút «Dừng lại». Tiến độ đếm theo vật đã ghi, không theo thời gian.
- Không có thời gian đã trôi, không nói trước sẽ chờ bao lâu. «Chạy ngầm» không hứa gì về chuyện báo lại.
- Rời trang: chỉ thanh bên còn biểu tượng xoay/chấm chưa đọc. Hộp thông báo (`ThongBao`, chuông ở đầu trang) có
  sẵn nhưng mọi thông báo hiện đi qua đợt nhắc buổi sáng (`nguon: "nhac-buoi-sang"`); không có loại nào cho Tác nhân.
- Bộ dựng không có trần phút (`SESSION_LIMITS.builder`: hạn phiên một ngày). Đo 15/10: GLM 5.3 mất 201 s và 200 s,
  GLM 5.2 Fast mất 86–96 s.

## Ba đổi

1. **Thời gian và lời hứa trên thẻ.** Thẻ «Đang dựng» thêm dòng thời gian đã trôi (đếm từ lúc gửi, `phút:giây`, tự
   tăng mỗi giây). Chân thẻ thay «Chạy ngầm» bằng một câu nói thật điều sẽ xảy ra: người dùng rời trang được, Kara sẽ
   báo trong hộp thông báo khi xong. Câu này chỉ đúng khi đổi 3 có mặt, nên hai đổi đi cùng một vòng.
2. **Quá ngưỡng.** Khi thời gian đã trôi vượt ngưỡng (200 s, hằng ở một tệp cấu hình của khu), thẻ thêm một dòng
   «lâu hơn thường lệ» và vẫn giữ nút «Dừng lại». Không tự huỷ, không đổi model.
3. **Báo khi xong.** Khi bộ dựng kết thúc một lượt — có kết quả để duyệt, cần người dùng trả lời, hoặc hỏng — `apps/agent`
   ghi một `ThongBao` cho người mở cuộc trò chuyện, đường dẫn về `/chat/<id>`. Ba loại mới: `tac-nhan-xong`,
   `tac-nhan-can-tra-loi`, `tac-nhan-hong`. Một thông báo mỗi lượt (khoá theo lượt gửi). Mở cuộc trò chuyện thì đánh
   dấu đã đọc các thông báo của nó. Dừng tay (`turn.cancelled`) không báo.

## Đặc tả UX

<!-- khuôn ux-spec-template — điền ở S1, giữ marker -->
- Khuôn IA đã chọn + căn cứ: giữ khuôn «một thẻ tiến trình trong hội thoại» đang có (`BuildingAgentCard`); thêm hai
  dòng chữ phụ và đổi chân thẻ, không thêm màn mới. Báo khi xong dùng kênh có sẵn (chuông) — không toast trôi.
- Bảng trạng thái: đang dựng < ngưỡng · đang dựng > ngưỡng · cần trả lời · xong chờ duyệt · hỏng · đã dừng tay ·
  rời trang rồi quay lại (qua chuông, qua thanh bên) — ở 375 và 1280.
- Chữ: vi/en qua `lib/messages`; tên tác nhân trong thông báo là dữ liệu người dùng (`translate="no"`).

## Hỏi chủ kho (đi Cổng Phạm vi)

- Hỏi-1 — khi nào nói «có thể rời trang»: ngay từ đầu (khuyến nghị: người dùng biết sớm, không phải đợi) hay chỉ sau ngưỡng.
- Hỏi-2 — có in con số thời gian thường mất («thường 1–3 phút») không: khuyến nghị KHÔNG, vì số đổi theo model (MH3/MH4
  đang đo lại) — chỉ in thời gian đã trôi và dòng «lâu hơn thường lệ».
- Hỏi-3 — báo cả khi người dùng đang xem màn chờ: khuyến nghị CÓ ghi, và mở cuộc trò chuyện tự đánh dấu đã đọc, nên
  người đang xem không thấy số chưa đọc tăng.

## Ngoài phạm vi

- Gửi qua Zalo hay email (gửi ra ngoài CRM — mức xác nhận theo `docs/ai-ux.md` §4, cần quyết riêng).
- Rút ngắn thời gian dựng, đổi model (MH3, MH4 của P6).
- Màn chạy tác nhân đã triển khai (trần 20 phút riêng).
