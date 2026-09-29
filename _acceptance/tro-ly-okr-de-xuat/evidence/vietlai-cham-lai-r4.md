# kyVong.vietLai chấm lại ngoại tuyến trên bản ghi round 4

Round 4 lộ rằng `kiemCa` chưa bao giờ đọc `kyVong.vietLai` của ca mẫu. Để biết nếu đo thì
sao, tôi thêm tạm phép đo «mỗi trường trong vietLai có ≥ 1 dòng viet-lai trạng thái cho» và chạy
`eval-gop-y.mjs --cham-lai .acceptance-runs/tro-ly-okr-de-xuat/e22/tong-ket.jsonl` (không gọi
model, 31 bản ghi của round 4, HEAD 99410da8). Phép đo tạm đã gỡ khỏi thước; tệp này giữ con số.

Kết quả nếu đo vietLai: **25/30** (round 4 chốt 30/30 theo chữ E22 hiện hành).

| Ca | vietLai đòi | Model nộp ở round 4 | Nguyên nhân |
| --- | --- | --- | --- |
| gy-11 | whyNow | viet-lai title (judge 1) + hỏi whyNow + hỏi thieu-doi-trong | ô «vì sao lúc này» trống; ca mẫu đòi viết từ ô trống, model chọn hỏi |
| gy-21 | whyNow | hỏi thieu-doi-trong | như trên; câu «vì sao» có thể dựng từ start của KR (6 ngày) nhưng chỉ dẫn chưa nói |
| gy-16 | kr.title | hỏi khong-do-duoc | chỉ dẫn bảo «hỏi, đừng đoán số»; model không đề xuất tên KR đo được không số («Tỷ lệ nghỉ việc theo quý») |
| gy-24 | whyNow | viet-lai whyNow ĐÚNG nhưng bị loại tu-cam | câu «mất cơ hội hợp tác» dính từ cấm «cơ hội» (nghĩa thường, không phải cơ hội bán hàng) |
| gy-30 | title | hỏi trung-y bị loại tu-cam (lý do lặp «xếp hạng», «thưởng») + hỏi kr-la-viec | model không viết lại tên Mục tiêu đánh giá người; lý do của nó lặp từ cấm nên bị loại |

Ngoài ra gy-03 (`thieu-doi-trong` đã bị lớp 7 hỏi) không thể thoả bằng viết lại KR — đối trọng là
KR mới, không phải câu mới; miễn trừ lớp 7 vì thế là đúng và nay khai tường minh trong chữ E22.

Việc cho hợp đồng sau («đo kyVong.vietLai»): sửa hai ca mẫu ô «vì sao» trống hoặc dạy model dựng
câu «vì sao» từ số khởi điểm của KR; thu hẹp từ cấm «cơ hội» về nghĩa bán hàng; dạy model đề xuất tên
KR đo được không số khi «vì sao» đã nêu thước; dạy model không lặp từ cấm trong lý do.
