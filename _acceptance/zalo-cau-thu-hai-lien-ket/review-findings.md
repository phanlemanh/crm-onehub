# Review findings — zalo-cau-thu-hai-lien-ket (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **do.ts đọc bo-mau.json bằng ép kiểu `as`, bỏ qua khuôn `khuonBoMau` đã có cho đúng tệp này**
  Người dùng thấy gì: Công cụ đo đọc bộ câu hỏi mẫu mà không kiểm hình dạng dữ liệu. Nếu ai đó đổi tên trường trong bộ mẫu thì lượt đo vẫn chạy và có thể gửi tin Zalo rỗng thay vì báo lỗi rõ ràng.
  Căn cứ: Chỉ ảnh hưởng công cụ đo nội bộ, không chạm người dùng thật; bộ mẫu có băm kiểm nên khó đổi nhầm, và nếu lỡ sai thì chạy lại là thấy ngay.
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts`
  severity: low
  Đề xuất: known-limits

- **Ca loi-db (E3) gọi thẳng lienKetPhienGoc, không đi qua events["turn.started"] như hợp đồng hứa**
  Người dùng thấy gì: Bài kiểm lỗi cơ sở dữ liệu không đi đúng cửa mà lượt hỏi thật đi qua. Hôm nay hành vi vẫn đúng, nhưng nếu sau này thêm bước dễ lỗi ở cửa đó thì bài kiểm vẫn xanh và lượt hỏi của người dùng có thể hỏng mà không ai biết.
  Căn cứ: Hành vi hiện tại đúng nên người dùng chưa gặp gì; rủi ro chỉ xuất hiện khi có thay đổi sau này, và vá bài kiểm sau này rẻ.
  file: `apps/agent/test/zch-cau-thu-hai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): ca phá «lech cau» và phép kiểm tlhZaloHoiId tạo ra một trạng thái mà writer không bao giờ sinh được**
  Người dùng thấy gì: Một ca thử phá dùng để chứng minh phép đo bắt được lỗi trợ lý kho nhận nhầm câu thực ra không thể xảy ra trên dữ liệu thật, nên nó chưa chứng minh được gì. Việc nhận nhầm câu vẫn được bắt bằng cách đối chiếu tin trả lời với câu trả lời của chính câu đó.
  Căn cứ: Không có lỗi nào lộ ra cho người dùng, và lưới đối chiếu tin trả lời vẫn đứng; chỉ là một bằng chứng phụ yếu hơn vẻ ngoài.
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP mà chỉ liệt kê tay): bảng bang-khong-doi thiếu purpose «okr-soan» của SESSION_PURPOSES**
  Người dùng thấy gì: Bài kiểm khẳng định các loại phiên khác không bị đụng tới nhưng bỏ sót một loại và không tự cập nhật khi có loại mới. Nếu một loại phiên bị liên kết nhầm thì bài kiểm vẫn xanh.
  Căn cứ: Chưa có bằng chứng loại phiên bị bỏ sót hành xử sai, người dùng không thấy gì; thêm dòng vào bảng sau này rẻ.
  file: `apps/agent/test/zch-cau-thu-hai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **E4: bài kiểm đóng câu đầu bằng LOI, còn evals.yaml và plan.md hứa đóng bằng TRA_LOI (r1)**
  Người dùng thấy gì: Bài kiểm đóng câu đầu bằng trạng thái lỗi thay vì trạng thái đã trả lời như hồ sơ mô tả. Người dùng hỏi Kho qua Zalo không thấy khác biệt nào, vì kết quả hôm nay giống hệt.
  Căn cứ: Nhẹ: hành vi người dùng thấy không đổi, chỉ lệch giữa mô tả bài kiểm và thứ bài kiểm chạy, và sửa sau rẻ nếu bộ nạp đổi cách lọc.
  file: `apps/agent/test/zch-cau-thu-hai.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **do.ts đọc bo-mau.json bằng ép kiểu `as`, không parse bằng Zod ở biên (r1 · tệp đã đổi)**
  Người dùng thấy gì: Công cụ đo đọc bộ câu hỏi mẫu mà không kiểm hình dạng dữ liệu. Nếu tệp mẫu đổi hình, phép đo có thể chạy sai mà không báo, nhưng người dùng cuối không bị ảnh hưởng.
  Căn cứ: Nhẹ: chỉ ảnh hưởng công cụ đo nội bộ, không chạm dữ liệu hay người dùng, và tệp mẫu hiếm khi đổi.
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts`
  severity: low
  Đề xuất: known-limits

- **do.ts viết thẳng `45 * 60_000` thay vì suy từ MINUTE_MS (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một con số thời gian trong công cụ đo viết tay thay vì lấy từ một chỗ chung. Người dùng không thấy gì; chỉ có thể quên đổi đồng bộ hai chỗ khi chỉnh trần thời gian.
  Căn cứ: Rất nhẹ: chỉ là chuyện gọn mã trong công cụ đo nội bộ, không ảnh hưởng người dùng và sửa lúc nào cũng được.
  file: `_acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): phép kiểm «lech cau» tự đúng theo cách ghi, ca phá dựng trạng thái mà bên ghi không bao giờ tạo ra (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một phép kiểm trong lượt đo thật chưa chứng minh được là bắt được việc trợ lý nhận nhầm câu của lượt trước. Việc đó vẫn được bài kiểm ở tầng dữ liệu bảo vệ, nên người dùng vẫn được trả lời đúng.
  Căn cứ: Nhẹ: lỗi thật nếu xảy ra vẫn bị bài kiểm khác bắt, và đây chỉ là lớp bảo hiểm thêm trong lượt đo tốn tiền.
  file: `apps/agent/evals/tro-ly-kho/cau-thu-hai.eval.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
