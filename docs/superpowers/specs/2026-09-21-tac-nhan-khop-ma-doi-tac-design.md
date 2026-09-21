# Tác nhân khớp mã đối tác

Hồ sơ cơ hội: `_acceptance/tac-nhan-khop-ma-doi-tac/opportunity.md` (Cổng Đáng
ký «build» 2026-09-21). Chủ kho duyệt bốn điểm thiết kế dưới đây cùng ngày, trả
lời «a, đồng ý cả bốn điểm».

## Vấn đề

Điểm nhận dữ liệu từ nền tảng OneHub khớp môi giới với Cá nhân CHỈ bằng mã nền
tảng, lưu trong trường tự tạo `ma_moi_gioi_nen_tang`. Mục không khớp thì API ghi
việc `onboarding-identify` cho tác nhân rồi quên. Ba chỗ đứt:

1. Mục trong lô chỉ mang mã và bốn mốc ngày. Không có gì để tra.
2. Bốn mốc ngày của mục không khớp bị bỏ, không lưu ở đâu.
3. Tác nhân không biết loại việc này; nó rơi vào nhánh mặc định.

## Bốn điểm chủ kho đã duyệt

1. **Lô nền tảng mang thêm tên, số điện thoại, email của môi giới** — cả ba không
   bắt buộc. Đây là đổi khuôn dữ liệu đội nền tảng phải gửi; chưa có bên gửi nên
   đổi bây giờ rẻ nhất.
2. **Mục không khớp được giữ lại trọn** — danh tính cộng bốn mốc — trong một bảng
   mới `OnboardingPendingMatch`, và việc cho tác nhân chỉ mang mã của hàng đó.
3. **Tác nhân tự ghép CHỈ khi email hoặc số điện thoại khớp đúng MỘT Cá nhân.**
   Khi đó nó ghi ghi danh với bốn mốc và ghi mã nền tảng vào Cá nhân, nên lô sau
   khớp thẳng ở API mà không cần tác nhân.
4. **Còn lại thì đề xuất cho người.** Khớp chỉ bằng tên, hoặc khớp nhiều Cá nhân,
   hoặc Cá nhân đã mang một mã nền tảng KHÁC, hoặc email và số điện thoại chỉ về hai Cá nhân khác nhau: không ghi gì, lưu danh sách ứng
   viên, và hồ sơ kế hoạch hiện khối «Chờ ghép» để người xác nhận hoặc bác.

## Cách làm

- **Làn thẳng, không mô hình.** `docs/agent.md`: việc không có gì phải quyết đi
  làn thẳng. Khớp đúng email hoặc số điện thoại không có gì phải quyết, nên
  `onboarding-identify` vào `DIRECT_KINDS` cạnh `slack-people-match` — tiền lệ
  ghép người bằng email chính xác và lưu vào bảng riêng. Không mô hình nào được
  hỏi «có phải người này không».
- **Trí khôn ở tác nhân.** API chỉ LƯU mục không khớp và ghi việc; nó không tra
  Cá nhân. Khi NGƯỜI bấm xác nhận một ứng viên, API ghi ghi danh — đó là quyết
  định của người, không phải API đoán.
- **So khớp không gần đúng.** Email so sau khi cắt khoảng trắng và hạ chữ thường.
  Số điện thoại so sau khi chuẩn hoá về một dạng: bỏ ký tự không phải số, đổi
  tiền tố `84` thành `0`. Tên so sau khi cắt khoảng trắng thừa, hạ chữ thường, và
  GIỮ dấu — «Nguyễn Văn An» khác «Nguyen Van An», vì bỏ dấu là so gần đúng.
- **Không bao giờ ghi đè người.** Cá nhân đã có mã nền tảng khác → đề xuất,
  không ghi. Người bấm xác nhận một ứng viên như thế cũng bị từ chối, kèm lỗi
  nêu mã cũ: người phải tự sửa trường trước. Máy chọn cách này để không bao giờ
  có đường ghi đè; chủ kho duyệt tại Cổng Phạm vi.
- **Khuôn ở biên.** Payload việc (`{pendingMatchId}`) và danh sách ứng viên có
  khuôn ở `packages/validation/src/onboarding-identify.ts`, phân tích một lần khi
  đọc. Payload hỏng → việc thất bại với lỗi có tên, không lặng lẽ xong.
- **Chống trùng giữ nguyên.** Cặp `planId` + `platformBrokerId` là khoá duy nhất
  của bảng mới; lô gửi lại cập nhật hàng cũ thay vì sinh hàng thứ hai.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: hồ sơ kế hoạch → khối «Chờ ghép» liệt kê môi giới nền tảng gửi mà chưa ghép được → người bấm «Đúng người này» ở một ứng viên → môi giới vào danh sách ghi danh với bốn mốc, khối bớt một dòng (điểm ra: vẫn ở hồ sơ kế hoạch)
- Biên: không có ca chờ nào → khối không hiện; ca không có ứng viên nào → dòng nói rõ «không tìm thấy ai», chỉ có nút Bác
- Lỗi & quay lại: xác nhận hoặc bác thất bại → thông báo lỗi tại dòng, dòng giữ nguyên để bấm lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ kế hoạch — khối Chờ ghép | Cho người quyết môi giới nền tảng gửi là Cá nhân nào | Danh mục 30 ngày / ở lại hồ sơ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-choghep-an | Hồ sơ kế hoạch | Không có khối — không có ca chờ nào | Không có gì |
| ST-choghep-coungvien | Hồ sơ kế hoạch | Một dòng mỗi môi giới: mã, tên, email, số điện thoại nền tảng gửi; dưới là từng ứng viên với lý do («cùng email», «cùng tên») và nút «Đúng người này» | Chọn một ứng viên hoặc Bác |
| ST-choghep-khongthay | Hồ sơ kế hoạch | Dòng môi giới với câu «không tìm thấy ai trong CRM khớp» | Bác, hoặc tạo Cá nhân rồi chờ lô sau |
| ST-choghep-dangcho | Hồ sơ kế hoạch | Dòng môi giới với câu «đang chờ tác nhân tra» hoặc «tác nhân không xử lý được» | Chờ, hoặc Bác |
| ST-choghep-loi | Hồ sơ kế hoạch | Thông báo lỗi ngay tại dòng vừa bấm | Bấm lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bác là xoá khỏi danh sách chờ, có bước xác nhận vì không đảo được từ màn.
- Dữ liệu nền tảng gửi (tên, email, số điện thoại) đánh dấu không dịch.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Card, Button, Badge, ConfirmDialog | dùng | Có sẵn ở `@crm/ui` và đang dùng trên chính hồ sơ kế hoạch |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: khối nằm trong hồ sơ một kế hoạch sẵn có, là danh sách việc cần quyết cạnh danh sách ghi danh; luồng hiển nhiên nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
