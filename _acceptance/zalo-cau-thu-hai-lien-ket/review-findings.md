# Review findings: zalo-cau-thu-hai-lien-ket (round 1)

## Trong hợp đồng

- **daGuiZalo đếm dồn theo chat: câu thứ hai, thứ ba được tính là đã gửi nhờ tin của câu trước**
  AC: AC-5
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts:231`
  severity: medium
  source: bugs
  detail: `daGuiZalo: guiCua(k.nguoi) >= k.thuTu` đếm mọi lệnh `sendMessage` tới chat đó trong cả lượt, rồi so với thứ tự câu. Một câu trả lời có thể tách thành tối đa `ZALO.hoi.toiDaTin` = 3 tin (`locTraLoi` trong zalo-tra-loi.ts:107 gửi từng phần, mỗi phần tối đa 2000 ký tự). Vì vậy chỉ cần câu 1 dài, tách đủ 3 tin, là `daGuiZalo` của câu 2 và câu 3 đã thành true dù hai câu đó không gửi tin nào. Tin báo lỗi (`dongVaBao` gửi `ZALO.loi.*`) và lệnh gửi bị máy chủ giả trả lỗi cũng được đếm. Kiểm `khongGui` trong so-do.ts:108 dựa hẳn vào cờ này, nên vế AC-5 «Zalo giả nhận một câu trả lời cho chat đó» với từng câu không thực sự được kiểm. Không ca phá nào trong `PHA` đụng tới `daGuiZalo`. Cách sửa: gắn tin gửi vào đúng câu (ví dụ chụp số lần gửi trước và sau từng câu trong eval), hoặc kiểm cả `ZaloHoi.ketQua`.

- **so-do không kiểm ZaloHoi.ketQua: câu kết thúc ở 'loi' hoặc 'gui-hong' vẫn đạt**
  AC: AC-5
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.ts:99`
  severity: medium
  source: bugs
  detail: `kiemKetQua` chỉ xét `tlhTrangThai`, `tlhZaloHoiId`, `daGuiZalo` và `loi`. Trường `ketQua` (trạng thái cuối của ZaloHoi) có được ghi vào ket-qua.jsonl nhưng không chỗ nào đọc. Eval coi câu là xong khi ZaloHoi rời `dang-hoi` (cau-thu-hai.eval.ts:90), tức là cả `loi` (agent gốc hỏng, `dongVaBao` gửi câu báo lỗi) và `gui-hong` (`guiZalo` ném, zalo-tra-loi.ts:113) cũng tính. Câu như vậy vẫn đạt nếu TaiLieuHoi đã TRA_LOI, vì `daGuiZalo` cũng đã true do đếm dồn (finding trên) hoặc do tin báo lỗi. Người hỏi thực tế nhận câu lỗi hoặc không nhận gì, mà thước vẫn báo DAT. Đây đúng là triệu chứng hồ sơ hứa đóng lại («người hỏi nhận câu lỗi»).

- **Mọi trường `loi` đều bị tính là 'lỗi model', được miễn kiểm hoàn tất và gửi Zalo**
  AC: AC-5
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.ts:67`
  severity: low
  source: bugs
  detail: `laLoi = k.loi !== null || k.tlhTrangThai === 'LOI'`. Eval đặt `loi` cả cho `webhook <status>`, `het-cho` (câu kẹt ở dang-hoi quá 4 phút) và `khong co hang zaloHoi`, không chỉ cho lỗi gọi model. Ngưỡng `loiModelToiDa` = 1 vì vậy cho lọt một câu webhook hỏng hoặc treo. Dòng bị tính là lỗi còn bỏ qua các kiểm chuaXong, lechCau, khongGui (dòng 100). AC-5 và Hỏi-2 chỉ chốt ngưỡng cho «câu lỗi gọi model», nhưng thước không phân biệt loại lỗi (ví dụ đối chiếu `tlhLyDo` = 'loi-model').

- **Hình 3 (assert có mặt/đếm thay cho QUAN HỆ): daGuiZalo đo bằng tổng số tin gửi tới người, không gắn tin với câu**
  AC: AC-5
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts:231`
  severity: medium
  source: measurement
  detail: Hợp đồng E5 hứa mỗi câu không lỗi có daGuiZalo = true, tức là CÂU ĐÓ đã được trả lời qua Zalo. Nhưng do.ts dòng 214-218 và 231 tính `daGuiZalo: guiCua(k.nguoi) >= k.thuTu`, trong đó guiCua đếm MỌI lệnh sendMessage tới chat_id của người đó trong cả lượt. traLoiVe (apps/agent/agent/lib/zalo-tra-loi.ts dòng 107-109) gửi mỗi phần của `locTraLoi(text)` thành một tin riêng, có thể tới ZALO.hoi.toiDaTin tin cho một câu. dongVaBao cũng gửi tin báo lỗi qua cùng đường sendMessage. Ví dụ: câu 1 trả lời thành 3 phần, câu 2 và câu 3 không gửi tin nào. Khi đó guiCua = 3 >= 2 và >= 3, nên cả ba dòng đều ghi daGuiZalo = true, và so-do.ts dòng 108 (`if (!k.daGuiZalo)`) vẫn xanh. Quan hệ «tin trả lời này thuộc câu này» không được đo. Phép đo chỉ đếm số tin của cả người.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E4: bài kiểm đóng câu đầu bằng LOI, còn evals.yaml và plan.md hứa đóng bằng TRA_LOI**
  Người dùng thấy gì: Bài kiểm đóng câu đầu bằng trạng thái lỗi thay vì trạng thái đã trả lời như hồ sơ mô tả. Người dùng hỏi Kho qua Zalo không thấy khác biệt nào, vì kết quả hôm nay giống hệt.
  Căn cứ: Nhẹ: hành vi người dùng thấy không đổi, chỉ lệch giữa mô tả bài kiểm và thứ bài kiểm chạy, và sửa sau rẻ nếu bộ nạp đổi cách lọc.
  file: `apps/agent/test/zch-cau-thu-hai.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **do.ts đọc bo-mau.json bằng ép kiểu `as`, không parse bằng Zod ở biên**
  Người dùng thấy gì: Công cụ đo đọc bộ câu hỏi mẫu mà không kiểm hình dạng dữ liệu. Nếu tệp mẫu đổi hình, phép đo có thể chạy sai mà không báo, nhưng người dùng cuối không bị ảnh hưởng.
  Căn cứ: Nhẹ: chỉ ảnh hưởng công cụ đo nội bộ, không chạm dữ liệu hay người dùng, và tệp mẫu hiếm khi đổi.
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts`
  severity: low
  Đề xuất: known-limits

- **do.ts viết thẳng `45 * 60_000` thay vì suy từ MINUTE_MS**
  Người dùng thấy gì: Một con số thời gian trong công cụ đo viết tay thay vì lấy từ một chỗ chung. Người dùng không thấy gì; chỉ có thể quên đổi đồng bộ hai chỗ khi chỉnh trần thời gian.
  Căn cứ: Rất nhẹ: chỉ là chuyện gọn mã trong công cụ đo nội bộ, không ảnh hưởng người dùng và sửa lúc nào cũng được.
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): phép kiểm «lech cau» tự đúng theo cách ghi, ca phá dựng trạng thái mà bên ghi không bao giờ tạo ra**
  Người dùng thấy gì: Một phép kiểm trong lượt đo thật chưa chứng minh được là bắt được việc trợ lý nhận nhầm câu của lượt trước. Việc đó vẫn được bài kiểm ở tầng dữ liệu bảo vệ, nên người dùng vẫn được trả lời đúng.
  Căn cứ: Nhẹ: lỗi thật nếu xảy ra vẫn bị bài kiểm khác bắt, và đây chỉ là lớp bảo hiểm thêm trong lượt đo tốn tiền.
  file: `apps/agent/evals/tro-ly-kho/cau-thu-hai.eval.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
