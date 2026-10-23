# Review findings: ho-so-do-kiem-cheo (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Sửa răng đổi khẳng định của các eval ui-check không có dòng danh sách, lời eval đã ký nay nói ngược với răng**
  Người dùng thấy gì: Mô tả các bước kiểm của vài màn Toàn cảnh OKR và Cập nhật tuần đã cũ so với phép đo đang chạy. Người chấm bằng mắt đọc theo lời cũ có thể chấm lệch.
  Căn cứ: Chỉ gây hiểu nhầm cho người chấm chứ không làm hỏng tính năng nào của người dùng, và sửa lời mô tả sau vẫn rẻ.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Dòng danh sách của cron-theo-ban-khai E7/E8 đã cũ, bảng trước/sau và hội đồng E6 đọc sai cách sửa thật**
  Người dùng thấy gì: Bảng so sánh trước/sau cho hai bài kiểm của lịch chạy theo bản khai mô tả cách sửa không còn đúng. Người duyệt đọc bảng này có thể hiểu sai điều đã thực sự được sửa.
  Căn cứ: Chỉ làm sai lời giải thích trong hồ sơ nội bộ, không ảnh hưởng người dùng, và sửa lại câu chữ sau vẫn rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/danh-sach.json`
  severity: medium
  Đề xuất: known-limits

- **Đo toan-canh-okr nay dựa vào nhật ký của cửa chặn thuộc hồ sơ khác, nhưng paths không khai tệp đó**
  Người dùng thấy gì: Nếu sau này ai đó sửa công cụ chặn dùng chung, phép đo màn Toàn cảnh OKR có thể không được chạy lại tự động. Một lỗi mới có thể lọt qua mà không ai thấy ngay.
  Căn cứ: Rủi ro nằm ở tương lai và chỉ ảnh hưởng công cụ kiểm, người dùng không mất dữ liệu, thêm một dòng khai báo sau là xong.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: low
  Đề xuất: known-limits

- **Cây tạm của cặp gộp cron mượn node_modules của HEAD qua symlink để đếm cảnh báo lint**
  Người dùng thấy gì: Con số cảnh báo kiểm tra mã có thể lệch nhẹ nếu phiên bản công cụ kiểm đổi, và đôi khi để lại một thư mục tạm trên máy. Người dùng cuối không thấy gì.
  Căn cứ: Hậu quả chỉ là một con số kiểm tra có thể lệch và một thư mục rác trên máy dev, tự dọn được, không đáng mở việc riêng.
  file: `_acceptance/cron-theo-ban-khai/rang/nam-lenh-chung.mjs`
  severity: low
  Đề xuất: wont-fix

- **cap-nhat-tuan-okr E14/E19 viết lệnh thẳng trong evals.yaml, chép lại giá trị của khoá config sẵn có**
  Người dùng thấy gì: Hai bài kiểm của Cập nhật tuần chép lệnh thẳng thay vì dùng chung khai báo. Về sau nếu sửa lệnh ở một nơi, hai nơi kia có thể bị lệch.
  Căn cứ: Chỉ là chuyện gọn gàng nội bộ, không ảnh hưởng người dùng, và nếu lệch thì bài kiểm sẽ tự đỏ để lộ ra.
  file: `_acceptance/cap-nhat-tuan-okr/evals.yaml`
  severity: low
  Đề xuất: wont-fix

- **Expected của chính hồ sơ ho-so-do-kiem-cheo lệch với răng đã viết**
  Người dùng thấy gì: Phần mô tả những gì các bài kiểm của đợt rà này chứng minh hơi khác với cách chúng thực sự chạy. Người ký đọc mô tả có thể tin rằng kiểm chặt hơn thực tế.
  Căn cứ: Chỉ làm lệch cách hiểu của người duyệt nội bộ, không ảnh hưởng người dùng sản phẩm, và chỉnh lại câu chữ về sau rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **chieu-do.mjs self-check never exercises DOT_BIEN_LOT or SAI_THONG_DIEP, though the E3 contract says it does**
  Người dùng thấy gì: Công cụ kiểm tra xem lỗi cố tình cài có bị bắt hay không chưa tự thử hai trường hợp quan trọng của chính nó. Nếu nó hỏng ở hai chỗ đó, nó vẫn báo xanh.
  Căn cứ: Rủi ro chỉ xảy ra nếu công cụ kiểm bị hỏng sau này, không ảnh hưởng người dùng sản phẩm, và bổ sung hai ca thử sau không đắt.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **khai-du.mjs 'commit khong nhan' self-check skips commitKhongNhan(): it puts a fake sha straight into the input**
  Người dùng thấy gì: Công cụ phát hiện thay đổi không có nhãn chưa tự thử khâu tìm thay đổi đó. Nếu khâu đó hỏng, một thay đổi lén vẫn có thể lọt mà công cụ báo bình thường.
  Căn cứ: Chỉ là độ chắc của công cụ nội bộ, người dùng không thấy, và hiện chưa có thay đổi lén nào bị bỏ sót được chứng minh.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/khai-du.mjs`
  severity: low
  Đề xuất: known-limits

- **loi-ra.mjs misses duplicate signal codes inside one hoan_lai entry**
  Người dùng thấy gì: Hai tín hiệu trùng mã trong cùng một hồ sơ hoàn lại có thể không bị báo. Hậu quả là sổ tín hiệu có hai dòng trùng mã.
  Căn cứ: Hiếm gặp, chỉ gây rối sổ nội bộ và dễ thấy bằng mắt khi đọc danh sách, nên không đáng sửa riêng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: low
  Đề xuất: wont-fix

- **do-lai.mjs drops the first argument when --log is not given**
  Người dùng thấy gì: Nếu chạy lại phép đo theo thứ tự khác với tài liệu, một hồ sơ có thể âm thầm bị bỏ khỏi lượt đo. Tổng kết vẫn trông bình thường.
  Căn cứ: Chỉ xảy ra khi gọi sai thứ tự, kết quả thiếu hồ sơ có thể phát hiện bằng cách đếm lại, và không ảnh hưởng người dùng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/do-lai.mjs`
  severity: low
  Đề xuất: known-limits

- **dungCayTam leaks the temporary worktree when bun install or db:generate fails**
  Người dùng thấy gì: Khi bước cài đặt của công cụ đo thất bại, một thư mục làm việc tạm bị bỏ lại trên máy dev. Không ảnh hưởng người dùng sản phẩm.
  Căn cứ: Chỉ để lại rác trên máy dev trong ca lỗi hiếm, xoá tay được bằng một lệnh, không đáng mở việc riêng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chung.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (chỉ kiểm chuỗi có mặt): CHUA_TRA chỉ đòi xu_ly và sua khác rỗng, không đòi tệp và đột biến như lời hứa**
  Người dùng thấy gì: Với các hồ sơ có lỗi sản phẩm được giao lại cho hàng sau, phần sửa gợi ý có thể thiếu chỉ dẫn tệp nào và cách chứng minh. Người làm hàng sau phải tự tra thêm.
  Căn cứ: Không làm hỏng gì cho người dùng, chỉ khiến việc sửa sau tốn thêm công tra cứu, và các lỗi sản phẩm vẫn được ghi đủ để theo dõi.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (lượt tự kiểm không ghim thông điệp): nhận DOT_BIEN_LOT hoặc BAN_VA_HONG, và không có cặp đối chứng SAI_THONG_DIEP**
  Người dùng thấy gì: Công cụ kiểm tra lỗi cài thử chưa tự thử đủ hai kiểu thất bại của chính nó. Nếu hai kiểu đó hỏng, công cụ vẫn báo xanh.
  Căn cứ: Chỉ giảm độ tin cậy của công cụ nội bộ, người dùng không thấy, và thêm ca thử sau không đắt.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): lượt tự kiểm COMMIT_KHONG_NHAN và CONFIG bơm thẳng giá trị vào kiemKhai, bỏ qua bộ dò bằng git**
  Người dùng thấy gì: Công cụ phát hiện thay đổi thiếu nhãn và đổi cấu hình lén chưa tự thử phần tìm kiếm thật của nó. Nếu phần đó hỏng, nó có thể bỏ sót mà vẫn báo ổn.
  Căn cứ: Rủi ro nội bộ của công cụ kiểm, người dùng không bị ảnh hưởng, và chưa có ca bỏ sót thực tế được chứng minh.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/khai-du.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): hai mục từ điển so với CONTEXT.md ở sha đóng băng, và đột biến chọn sửa phía opportunity.md**
  Người dùng thấy gì: Bài kiểm từ điển cho hai mục của Trợ lý OKR so với bản từ điển cũ cố định, nên nếu hai mục đó trong từ điển hiện tại bị sửa hỏng, bài kiểm vẫn xanh.
  Căn cứ: Chỉ để lọt lỗi chữ trong tài liệu nội bộ, không mất dữ liệu người dùng, và người đọc từ điển sẽ thấy được khi xem.
  file: `_acceptance/tro-ly-okr-nen/rang/tu-dien-luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): prisma migrate diff và phép kiểm liền khối chạy giữa hai blob git đóng băng**
  Người dùng thấy gì: Bài kiểm việc cập nhật cơ sở dữ liệu của Trợ lý OKR chỉ so hai bản cũ cố định, nên nếu cấu trúc dữ liệu hiện tại đổi theo hướng nguy hiểm, một phần bài kiểm sẽ không thấy.
  Căn cứ: Phần đọc tệp cập nhật thật vẫn được đo, rủi ro còn lại hẹp, và cấu trúc dữ liệu đã có các lớp kiểm khác khi đổi.
  file: `_acceptance/tro-ly-okr-nen/rang/migration-chi-them.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): số cảnh báo lint được ghim đo ở cây của cặp gộp lịch sử, đột biến chỉ sửa hằng số của răng**
  Người dùng thấy gì: Số cảnh báo kiểm tra mã của ứng dụng được đo trên bản lịch sử cố định, không phải bản đang làm. Cảnh báo mới ở bản hiện tại có thể không bị đếm.
  Căn cứ: Chủ kho đã chọn cách đo này có ý thức, cảnh báo mã không ảnh hưởng người dùng, và các lệnh kiểm chung khác vẫn chạy trên bản hiện tại.
  file: `_acceptance/cron-theo-ban-khai/rang/nam-lenh-chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): TIN_HIEU_VANG chỉ đọc tin_hieu khai trong danh-sach.json, không đọc cửa tín hiệu**
  Người dùng thấy gì: Công cụ chỉ kiểm tín hiệu báo lỗi sản phẩm theo đúng khuôn đã ghi, chứ không đối chiếu với tín hiệu đã thật sự gửi. Một mã bịa đúng khuôn vẫn qua được.
  Căn cứ: Nếu tín hiệu không đến nơi thì lỗi sản phẩm có thể bị quên, nhưng người ký đối chiếu được bằng mắt và giới hạn này đã được khai trước.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
