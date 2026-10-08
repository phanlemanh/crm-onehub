# Review findings: dong-thoi-gian-loi-dung-luot (round 1)

## Trong hợp đồng

- **E4 không đo vế sau của AC-4 mà hợp đồng và thẻ vẫn hứa**
  AC: AC-4
  file: `_acceptance/dong-thoi-gian-loi-dung-luot/evals.yaml:61`
  severity: medium
  source: conventions
  detail: Vế sau của AC-4 trong contract.md hứa: khi quay lại tab cũ lúc truy vấn của nó còn lỗi trong bộ nhớ, «thông báo của tab đó hiện lại đúng loại». card-plain.json (will_do AC-4) cũng hứa «hiện lại đúng thông báo khi quay về một tab vẫn đang lỗi». Ô «quay lại» của E4 thì đo điều khác: lượt tải lại khi quay về được giải bằng dữ liệu thành công, rồi khẳng định KHÔNG còn [data-dtg-loi]. Không ô nào cho lượt tải lại khi quay về hỏng rồi kiểm thông báo hiện lại đúng loại. Quyết định d-20261008T171404Z-5 coi vế đó là không xảy ra được với TanStack 5.101, nhưng hợp đồng và thẻ chưa sửa theo. Kết quả là một lời hứa còn nằm trong AC mà không eval nào gọi tới (luật «đo phải chạm lời hứa»). Ở Cổng Bằng chứng, E4 xanh sẽ đọc như AC-4 đã được chứng minh trọn. Cần một trong hai: sửa AC-4 cùng card-plain.json cho khớp hành vi thật (quay về thì tải lại, không mang thông báo cũ khi đang tải, chỉ hiện nếu lượt tải lại hỏng), hoặc thêm vào E4 một ô cho lượt tải lại hỏng khi quay về.

- **Cảnh báo «Không làm mới được» biến mất im lặng khi đổi tab qua lại hoặc mở lại tấm hồ sơ, sau khi «Xem cũ hơn» đã thành công**
  AC: AC-3
  file: `apps/app/components/crm/timeline/timeline.tsx:194`
  severity: medium
  source: bugs
  detail: `useLoiTheoLuot` chỉ giữ cờ `lamMoi` trong state React, gắn với `khoa` của lần gắn hiện tại. TanStack không lưu lại rằng lượt làm mới cuối đã hỏng sau khi một lượt `fetchNextPage` thành công: status về `success`, `isError` là false, `dataUpdatedAt` mới. Khi `khoa` đổi (sang tab khác rồi quay lại) hoặc component gắn lại, `daThay` được đặt lại bằng `mocMoi(khoa)` với `du: 0`. Ở lượt settle đầu tiên, `trangKeDuoc = truoc.du !== 0 && ...` ra false nên hàm trả `KHONG_LOI`. Thời điểm đó dữ liệu còn mới hơn staleTime 30 s nên không có lượt tải lại nào chạy. Cách tái hiện: (1) ở tab Tất cả, làm mới lỗi, thông báo lam-moi hiện; (2) bấm «Xem cũ hơn», trang kế tải được, thông báo lam-moi vẫn hiện như AC-1 yêu cầu; (3) sang tab Ghi chú rồi quay lại Tất cả trong vòng 30 s. Thông báo lam-moi không hiện nữa, dù trang đầu chưa bao giờ làm mới thành công. Điều này trái AC-3: «thông báo chỉ biến mất khi lượt làm mới đó thành công; lượt «Xem cũ hơn» thành công không làm nó biến mất». Dòng thời gian vẫn hiện dữ liệu cũ mà người dùng không được báo. Tương tự, khi tab có cả hai lỗi (làm mới lỗi rồi «Xem cũ hơn» lỗi) và vừa quay lại, nhánh `isError` dựng cờ chỉ từ `isFetchNextPageError` của lỗi cuối. Vì `goc()` trả `KHONG_LOI` khi `khoa` lệch, cờ lam-moi bị bỏ nếu tab kia đã ghi state. E4 không phủ trường hợp này: các ô của E4 chỉ gây lỗi xem-cu trước khi đổi tab.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **paths của eval thiếu tệp mà bài kiểm phụ thuộc, nên ghim lại không biết khi tệp đó đổi**
  Người dùng thấy gì: Nếu sau này ai đó sửa một tệp phụ trợ của bài kiểm, hệ thống có thể không nhắc kiểm lại. Một lỗi trên dòng thời gian khi đó có thể lọt qua trong lúc mọi bài đo vẫn báo xanh.
  file: `_acceptance/dong-thoi-gian-loi-dung-luot/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): bộ đếm MutationObserver demChen chỉ được kiểm `=== 0`, chưa ca nào cho thấy nó đếm ra lớn hơn 0, và tác giả đã phá thử thấy nó mù**
  Người dùng thấy gì: Một phép đo phụ dùng để bắt thông báo nhấp nháy sai có thể không nhận ra một số lần nhấp nháy. Người dùng vẫn được bảo vệ bởi các phép đo khác, nhưng bằng chứng «không nhấp nháy» mạnh hơn mức thật sự đo được.
  file: `apps/app/test/dong-thoi-gian-loi-dung-luot.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dong-thoi-gian-loi-dung-luot/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
