## Trong hợp đồng

- **The local-only guard checks the URL hostname, but pg lets a `?host=` query parameter override it**
  file: `apps/api/scripts/okr-mau/chan.ts:42`
  severity: medium
  AC: AC-9
  kiemDuocNap reads only `new URL(url).hostname`. The connection goes through PrismaPg -> pg -> pg-connection-string 2.14.0. In index.js lines 40-56, that parser copies every searchParam into the config and sets `config.host` from the hostname only when no `host` query parameter exists. So `DATABASE_URL=postgresql://u:p@localhost:5432/crm?host=ep-x.neon.tech` passes the guard (hostname is `localhost`) while the connection opens against the remote host. docs/setup.md says the local-host check has no override, and CONTEXT.md says the sample set never exists on production. This is a hole in exactly that boundary check. The fix belongs in the guard: reject a `host` (or `hostaddr`) query parameter, or resolve the effective host the same way pg does before comparing it to OKR_MAU.mayCucBo. The okr-mau-chan.spec.ts table has no case for this.
  Vì sao thuộc AC-9: AC-9 đòi hỏi guard phải chặn mọi target không cục bộ trước khi mở kết nối, và nêu ALLOW_REMOTE_DB như một ví dụ về đường vòng phải vẫn bị chặn; một override `?host=` lọt được target không cục bộ qua guard chính là bảo đảm đó bị vỡ.

- **The local-only guard can be bypassed with a `?host=` query parameter**
  file: `apps/api/scripts/okr-mau/chan.ts:16`
  severity: medium
  AC: AC-9
  `kiemDuocNap` only checks `new URL(url).hostname`. But pg-connection-string, which pg and PrismaPg use to read `DATABASE_URL`, lets a `host` query parameter override the hostname: `if (!config.host) config.host = hostname`. Chạy thử trên code của nhánh này: `DATABASE_URL=postgresql://u:p@localhost:5432/crm?host=ep-x.us-east-1.aws.neon.tech` làm `kiemDuocNap` trả `{ cho: true, mayChu: "localhost" }`, trong khi `parse(u).host` của pg trả `ep-x.us-east-1.aws.neon.tech`. Bộ nạp khi đó sẽ ghi 40 người và OKR giả vào một database từ xa. Điều này phá lời hứa của bản thiết kế rằng không gì lọt qua được kiểm tra này. Fix: parse URL bằng đúng bộ phân tích pg-connection-string (hoặc chặn thêm mọi tham số `host`/`hostaddr` không cục bộ) và kiểm tra đúng host mà driver sẽ thực sự kết nối tới.
  Vì sao thuộc AC-9: cùng bảo đảm với finding trên — guard phải chặn mọi target database không cục bộ trước khi kết nối; một override qua query parameter lọt tới host từ xa chính là tiêu chí đó thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The sample-file schema accepts the ghi-danh-dat-bac metric without bac, which writes a CRM source the product's counter rejects**
    Người dùng thấy gì: Nếu sau này tệp công ty mẫu dùng chỉ số ghi danh mà không khai bậc, lệnh nạp có thể ghi dữ liệu mà sản phẩm sau đó từ chối đếm, gây lỗi khi tính điểm chỉ số đó.
    file: `apps/api/scripts/okr-mau/khuon.ts`
    severity: medium
    Đề xuất: known-limits

- **phamViDb hand-builds a Json shape owned by @crm/validation and types it as Prisma.InputJsonValue**
    Người dùng thấy gì: Không có tác động thấy được ngay với người dùng hiện tại; đây là một rủi ro kỹ thuật nội bộ nếu sau này hình dạng dữ liệu phạm vi thay đổi mà không ai để ý.
    file: `apps/api/scripts/okr-mau/nap.ts`
    severity: low
    Đề xuất: known-limits

- **Tunable constants live outside the area config module cau-hinh.ts, and raw ms numbers are not derived from PHUT_MS**
    Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại; các con số thời gian cấu hình nằm rải rác ở nhiều chỗ khiến việc chỉnh sửa sau này dễ sót.
    file: `apps/api/scripts/okr-mau/nap.ts`
    severity: low
    Đề xuất: known-limits

- **docBoOkrMau types the raw JSON.parse result as BoOkrMau before it is parsed**
    Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại; đây là một chỗ kiểm kiểu lỏng có thể để lọt lỗi dữ liệu tệp mẫu hỏng dưới một hình dạng khác trong tương lai.
    file: `apps/api/scripts/okr-mau/khuon.ts`
    severity: low
    Đề xuất: known-limits

- **--tep with no value silently falls back to the default company file**
    Người dùng thấy gì: Nếu gõ thiếu đường dẫn tệp sau cờ chọn tệp, lệnh sẽ âm thầm nạp bộ công ty mặc định và báo thành công, khiến người chạy lệnh tưởng nhầm đã nạp đúng tệp của mình.
    file: `apps/api/scripts/okr-mau/lenh.ts`
    severity: low
    Đề xuất: known-limits

- **A same-file mistake (two Q4 objectives carried from one Q3 objective) crashes with a raw Prisma error instead of exit 4**
    Người dùng thấy gì: Nếu tệp công ty mẫu có lỗi hiếm gặp (hai mục tiêu quý 4 cùng kế thừa từ một mục tiêu quý 3), lệnh nạp có thể dừng giữa chừng với thông báo lỗi khó hiểu thay vì báo rõ chỗ sai và thoát gọn gàng.
    file: `apps/api/scripts/okr-mau/khuon.ts`
    severity: low
    Đề xuất: known-limits

- **`--tep` with no value silently falls back to the default company file**
    Người dùng thấy gì: Nếu gõ thiếu đường dẫn tệp sau cờ chọn tệp, lệnh sẽ âm thầm nạp bộ công ty mặc định và báo thành công, khiến người chạy lệnh tưởng nhầm đã nạp đúng tệp của mình.
    file: `apps/api/scripts/okr-mau/lenh.ts`
    severity: low
    Đề xuất: known-limits

- **`docBoCaGopY` returns an empty list for an empty folder, so the real-case eval passes with nothing tested**
    Người dùng thấy gì: Nếu thư mục ca thật đang rỗng hoặc tên tệp đặt sai, phép đánh giá vẫn coi như đã chạy xong và báo đạt dù không kiểm tra ca nào thật sự.
    file: `apps/agent/evals/okr/ca-gop-y.ts`
    severity: low
    Đề xuất: known-limits

- **A CRM-sourced Q3 KR gets snapshots dated in the future, in Q4 weeks**
    Người dùng thấy gì: Nếu sau này ai đó thêm một KR nguồn CRM vào quý 3 của bộ mẫu, các bản ghi tiến độ tuần của KR đó có thể bị đóng dấu ngày sai quý và trễ hơn mốc thời gian cho phép.
    file: `apps/api/scripts/okr-mau/nap.ts`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính đứng một mình: chiều đỏ của E7 chỉ kiểm «có ném Error»**
    Người dùng thấy gì: Bài kiểm tra cho tình huống 'nạp mà quên bước xoá dữ liệu cũ' chỉ xác nhận có lỗi xảy ra chứ không xác nhận đúng loại lỗi, nên một trục trặc khác hẳn (ví dụ treo quá giờ) cũng có thể khiến bài kiểm tra báo đạt nhầm.
    file: `apps/api/test/okr-mau.spec.ts`
    severity: high
    Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp nhưng ma trận rút từ phía bị đo: «mỗi (người, tuần) đúng một phiên» chỉ thành «không quá một»**
    Người dùng thấy gì: Bài kiểm tra cho quy tắc 'mỗi người mỗi tuần chỉ một phiên cập nhật' chỉ phát hiện được trường hợp trùng phiên, không phát hiện được trường hợp thiếu phiên, nên một lỗi thiếu phiên có thể lọt qua mà không ai biết.
    file: `apps/api/test/okr-mau.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 5 — dấu vân tay «mọi bảng bộ mẫu» là danh sách chép tay, không rút từ hằng của bộ nạp**
    Người dùng thấy gì: Danh sách bảng dùng để đếm dữ liệu bộ mẫu được gõ tay và đã thiếu một bảng thật sự được ghi; nếu sau này bộ mẫu thêm người tham gia, lỗi ghi trùng ở bảng đó có thể không bị phát hiện.
    file: `apps/api/test/okr-mau-san.ts`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 2 — stub viết tay đúng khuôn hàm đọc thay cho lệnh thật: ca «kho không có workspace» của E1**
    Người dùng thấy gì: Bài kiểm tra cho tình huống 'kho chưa có workspace' không chạy qua đúng đường lệnh thật mà người dùng sẽ gõ, nên nếu đường lệnh thật bị hỏng ở chỗ này, bài kiểm tra vẫn có thể báo đạt.
    file: `apps/api/test/okr-mau.spec.ts`
    severity: medium
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).