## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC ở vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A malformed DATABASE_URL crashes the safety check instead of returning refusal code 2**
  Người dùng thấy gì: Nếu ai gõ nhầm địa chỉ cơ sở dữ liệu với một ký tự mã hoá bị hỏng, lệnh nạp dừng lại với một thông báo lỗi kỹ thuật khó hiểu thay vì lời từ chối rõ ràng — nhưng máy vẫn không kết nối tới cơ sở dữ liệu nào nên không có rủi ro mất hay lộ dữ liệu.
  file: `apps/api/scripts/okr-mau/chan.ts`
  severity: low
  Đề xuất: known-limits

- **A malformed percent-escape in DATABASE_URL crashes the block check instead of returning exit 2**
  Người dùng thấy gì: Nếu ai gõ nhầm địa chỉ cơ sở dữ liệu với một ký tự mã hoá bị hỏng, lệnh nạp dừng lại với một thông báo lỗi kỹ thuật khó hiểu thay vì lời từ chối rõ ràng — nhưng máy vẫn không kết nối tới cơ sở dữ liệu nào nên không có rủi ro mất hay lộ dữ liệu.
  file: `apps/api/scripts/okr-mau/chan.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên cả lớp «mọi ca từ chối kèm ALLOW_REMOTE_DB=1 vẫn từ chối» nhưng chỉ có một số ca lẻ; bốn ca từ chối mới thêm vòng này cũng không có cặp ALLOW_REMOTE_DB**
  Người dùng thấy gì: Bộ kiểm tra chưa thử hết mọi trường hợp bị từ chối cùng với cờ cho phép máy chủ ngoài, nên nếu sau này có thay đổi vô tình mở lại đường vòng đó, không phép thử nào báo động kịp.
  file: `apps/api/test/okr-mau-chan.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — bảng tham số host tự viết theo ngữ nghĩa libpq, không chạy qua bộ đọc thật của driver (pg-connection-string)**
  Người dùng thấy gì: Bảng kiểm tra các cách viết địa chỉ máy chủ dựa trên quy tắc tự đặt ra thay vì cách trình điều khiển cơ sở dữ liệu thật sự đọc chúng, nên phép thử này không chắc phản ánh đúng liệu máy chủ ngoài có thật sự bị chặn trong mọi trường hợp hay không.
  file: `apps/api/test/okr-mau-chan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **The sample-file schema accepts the ghi-danh-dat-bac metric without bac, which writes a CRM source the product's counter rejects (r1)**
  Người dùng thấy gì: Nếu sau này tệp công ty mẫu dùng chỉ số ghi danh mà không khai bậc, lệnh nạp có thể ghi dữ liệu mà sản phẩm sau đó từ chối đếm, gây lỗi khi tính điểm chỉ số đó.
  file: `apps/api/scripts/okr-mau/khuon.ts`
  severity: medium
  Đề xuất: known-limits

- **phamViDb hand-builds a Json shape owned by @crm/validation and types it as Prisma.InputJsonValue (r1)**
  Người dùng thấy gì: Không có tác động thấy được ngay với người dùng hiện tại; đây là một rủi ro kỹ thuật nội bộ nếu sau này hình dạng dữ liệu phạm vi thay đổi mà không ai để ý.
  file: `apps/api/scripts/okr-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **Tunable constants live outside the area config module cau-hinh.ts, and raw ms numbers are not derived from PHUT_MS (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại; các con số thời gian cấu hình nằm rải rác ở nhiều chỗ khiến việc chỉnh sửa sau này dễ sót.
  file: `apps/api/scripts/okr-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **docBoOkrMau types the raw JSON.parse result as BoOkrMau before it is parsed (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại; đây là một chỗ kiểm kiểu lỏng có thể để lọt lỗi dữ liệu tệp mẫu hỏng dưới một hình dạng khác trong tương lai.
  file: `apps/api/scripts/okr-mau/khuon.ts`
  severity: low
  Đề xuất: known-limits

- **--tep with no value silently falls back to the default company file (r1)**
  Người dùng thấy gì: Nếu gõ thiếu đường dẫn tệp sau cờ chọn tệp, lệnh sẽ âm thầm nạp bộ công ty mặc định và báo thành công, khiến người chạy lệnh tưởng nhầm đã nạp đúng tệp của mình.
  file: `apps/api/scripts/okr-mau/lenh.ts`
  severity: low
  Đề xuất: known-limits

- **A same-file mistake (two Q4 objectives carried from one Q3 objective) crashes with a raw Prisma error instead of exit 4 (r1)**
  Người dùng thấy gì: Nếu tệp công ty mẫu có lỗi hiếm gặp (hai mục tiêu quý 4 cùng kế thừa từ một mục tiêu quý 3), lệnh nạp có thể dừng giữa chừng với thông báo lỗi khó hiểu thay vì báo rõ chỗ sai và thoát gọn gàng.
  file: `apps/api/scripts/okr-mau/khuon.ts`
  severity: low
  Đề xuất: known-limits

- **`--tep` with no value silently falls back to the default company file (r1)**
  Người dùng thấy gì: Nếu gõ thiếu đường dẫn tệp sau cờ chọn tệp, lệnh sẽ âm thầm nạp bộ công ty mặc định và báo thành công, khiến người chạy lệnh tưởng nhầm đã nạp đúng tệp của mình.
  file: `apps/api/scripts/okr-mau/lenh.ts`
  severity: low
  Đề xuất: known-limits

- **`docBoCaGopY` returns an empty list for an empty folder, so the real-case eval passes with nothing tested (r1)**
  Người dùng thấy gì: Nếu thư mục ca thật đang rỗng hoặc tên tệp đặt sai, phép đánh giá vẫn coi như đã chạy xong và báo đạt dù không kiểm tra ca nào thật sự.
  file: `apps/agent/evals/okr/ca-gop-y.ts`
  severity: low
  Đề xuất: known-limits

- **A CRM-sourced Q3 KR gets snapshots dated in the future, in Q4 weeks (r1)**
  Người dùng thấy gì: Nếu sau này ai đó thêm một KR nguồn CRM vào quý 3 của bộ mẫu, các bản ghi tiến độ tuần của KR đó có thể bị đóng dấu ngày sai quý và trễ hơn mốc thời gian cho phép.
  file: `apps/api/scripts/okr-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính đứng một mình: chiều đỏ của E7 chỉ kiểm «có ném Error» (r1)**
  Người dùng thấy gì: Bài kiểm tra cho tình huống 'nạp mà quên bước xoá dữ liệu cũ' chỉ xác nhận có lỗi xảy ra chứ không xác nhận đúng loại lỗi, nên một trục trặc khác hẳn (ví dụ treo quá giờ) cũng có thể khiến bài kiểm tra báo đạt nhầm.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp nhưng ma trận rút từ phía bị đo: «mỗi (người, tuần) đúng một phiên» chỉ thành «không quá một» (r1)**
  Người dùng thấy gì: Bài kiểm tra cho quy tắc 'mỗi người mỗi tuần chỉ một phiên cập nhật' chỉ phát hiện được trường hợp trùng phiên, không phát hiện được trường hợp thiếu phiên, nên một lỗi thiếu phiên có thể lọt qua mà không ai biết.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — dấu vân tay «mọi bảng bộ mẫu» là danh sách chép tay, không rút từ hằng của bộ nạp (r1)**
  Người dùng thấy gì: Danh sách bảng dùng để đếm dữ liệu bộ mẫu được gõ tay và đã thiếu một bảng thật sự được ghi; nếu sau này bộ mẫu thêm người tham gia, lỗi ghi trùng ở bảng đó có thể không bị phát hiện.
  file: `apps/api/test/okr-mau-san.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — stub viết tay đúng khuôn hàm đọc thay cho lệnh thật: ca «kho không có workspace» của E1 (r1)**
  Người dùng thấy gì: Bài kiểm tra cho tình huống 'kho chưa có workspace' không chạy qua đúng đường lệnh thật mà người dùng sẽ gõ, nên nếu đường lệnh thật bị hỏng ở chỗ này, bài kiểm tra vẫn có thể báo đạt.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

_Không có mục nào ở vòng này._

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
