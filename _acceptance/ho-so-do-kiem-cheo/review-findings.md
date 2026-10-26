# Review findings: ho-so-do-kiem-cheo (round 5)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The new 'handed to a separate lane' exception never reaches the human reviewers who are supposed to check it (r4)**
  Người dùng thấy gì: Hồ sơ được chủ kho giao cho làn riêng sẽ không hiện trong bảng trước/sau mà hội đồng và người ký đọc. Nếu dấu giao làn riêng bị dùng để né một lỗi sản phẩm thật thì không ai thấy lý do ghi kèm.
  Căn cứ: Chỉ có một hồ sơ dùng dấu này và quyết định của chủ kho đã ghi trong sổ, nên rủi ro thấp; nếu thiếu thì người ký vẫn mở sổ quyết định xem được, và sửa sau rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/bang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (một mình chiều âm): CHUA_TRA ở nhánh giao_lan_rieng không có ca tự kiểm nào chứng được nó báo đỏ (r4)**
  Người dùng thấy gì: Nếu bước kiểm hồ sơ giao làn riêng bị hỏng âm thầm, lượt chạy vẫn báo không có lỗi, nên có thể bỏ sót một hồ sơ thiếu phần sửa ghi sẵn. Người dùng cuối không bị ảnh hưởng trực tiếp, chỉ độ tin cậy của bộ kiểm giảm.
  Căn cứ: Đây là công cụ kiểm nội bộ, không làm mất dữ liệu của người dùng; chỉ một hồ sơ bị ảnh hưởng và thêm phép thử sau này rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm chuỗi có mặt trong khi lời hứa là quan hệ): «sửa ghi sẵn» của to-chuc E21 chỉ được kiểm là có hai chuỗi không rỗng (r4)**
  Người dùng thấy gì: Phần sửa ghi sẵn cho hồ sơ giao làn riêng có thể trỏ tới một bản vá không tồn tại mà bộ kiểm vẫn cho qua. Làn nhận việc sau có thể mở ra thấy phần sửa không dùng được.
  Căn cứ: Lỗi chỉ lộ ra khi làn riêng bắt tay vào sửa và họ tự phát hiện ngay, không mất dữ liệu hay ảnh hưởng người dùng cuối; sửa sau rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: medium
  Đề xuất: known-limits

- **AC-6/E6 still points the judging panel at the mutation results that the 24/10 scope cut called historical only (r3 · tệp đã đổi)**
  Người dùng thấy gì: Hội đồng nghiệm thu có thể đọc một bảng vẫn ghi kết quả kiểm tra cũ như thể mới, dù hồ sơ đã nói kết quả đó chỉ là lịch sử. Người ký có thể hiểu nhầm rằng bước kiểm tra đó vừa được xác nhận lại.
  Căn cứ: Chỉ làm người chấm đọc nhầm nguồn bằng chứng, không ảnh hưởng người dùng sản phẩm, không mất dữ liệu, và hợp đồng đã ghi rõ kết quả đó là sử liệu nên chỉ cần nhắc lại ở chỗ hội đồng đọc.
  file: `_acceptance/ho-so-do-kiem-cheo/contract.md`
  severity: medium
  Đề xuất: known-limits

- **The evidence report entries lack verified_at, which evals.yaml lists as required evidence (r3 · tệp đã đổi)**
  Người dùng thấy gì: Báo cáo bằng chứng hiện thiếu giờ xác nhận ở vài mục, nên người đọc khó biết kết quả được kiểm lúc nào. Không ảnh hưởng gì tới sản phẩm người dùng.
  Căn cứ: Là chi tiết ghi chép của bộ nghiệm thu, báo cáo sẽ được tạo lại ở vòng kế tiếp nên sửa riêng không đáng công và không ai bị ảnh hưởng.
  file: `_acceptance/ho-so-do-kiem-cheo/evidence-report.md`
  severity: low
  Đề xuất: wont-fix

- **The hsdk_chieu_do executor remains in config, but no eval uses it any more (r3 · tệp đã đổi)**
  Người dùng thấy gì: Còn sót một dòng cấu hình không còn eval nào dùng tới trong tệp cấu hình chung. Nó không làm gì và không ảnh hưởng người dùng.
  Căn cứ: Dòng thừa vô hại, không đổi hành vi nào, bỏ hay giữ đều không ai thấy; công sửa không xứng với lợi ích.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: wont-fix

- **Hội đồng E6 vẫn được đọc kết quả chiều đỏ cũ (38/38 bắt đúng), trái với lượt mới nhất và với Known limits vừa thêm (r3)**
  Người dùng thấy gì: Bảng trước/sau đưa cho hội đồng vẫn ghi một ô kiểm tra là bắt được lỗi, trong khi lượt đo mới nhất cho thấy ô đó đã bỏ sót. Hội đồng có thể tin vào một kiểm tra yếu hơn thực tế.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của một phần bằng chứng nội bộ, không động tới dữ liệu hay người dùng, và hợp đồng đã nêu hai ô sót nên người ký đã được báo.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/bang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (dữ liệu ghi sẵn, không đi vòng ghi rồi đọc): lời hỏi E6 bắt hội đồng đọc «đầu ra đột biến» lấy từ chieu-do-ket-qua.json cũ (38/38), trong khi lượt mới nhất cho 36/38 (r3)**
  Người dùng thấy gì: Câu hỏi giao cho hội đồng vẫn yêu cầu xem kết quả kiểm tra cũ, nên họ có thể dựa vào số liệu đã lỗi thời khi phán xét. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Là sai lệch nhỏ trong cách trình bằng chứng cho người chấm, tự phát hiện được vì hợp đồng đã ghi, không mất dữ liệu nào.
  file: `_acceptance/ho-so-do-kiem-cheo/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (dữ liệu ghi sẵn, không đi vòng ghi rồi đọc): bỏ --tai-lap thì E1 chỉ còn so hai tệp tự khai với nhau, và mốc nền chỉ dựa vào trường sha do chính tệp ghi (r3 · tệp đã đổi)**
  Người dùng thấy gì: Bước kiểm tra danh sách hồ sơ đỏ giờ chỉ so hai tệp do người viết hồ sơ ghi, không dựng lại phép đo từ đầu. Nếu tệp ghi sai thì kiểm tra này không phát hiện được.
  Căn cứ: Giới hạn này đã được chủ kho chấp nhận có chủ đích vì phép đo lại không ổn định, và không ảnh hưởng người dùng hay dữ liệu.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **«Đầu ra sau khi sửa» là chữ chép tay từ log ở scratchpad; ô cron E8 còn in đầu ra có trước một phần của bản sửa (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bảng so trước/sau cho người đọc có một khối «đầu ra sau khi sửa» do người dán tay, không phải máy chạy ra, dù đầu bảng nói là máy sinh. Riêng ô cron E8, khối này có thể là kết quả của bản cũ hơn bản đang giao, nên người đọc có thể tin một kết quả chưa đo lại.
  Căn cứ: Hậu quả nhẹ: chỉ làm bảng đọc lệch sự thật ở một vài ô, không mất dữ liệu và không đổi hành vi sản phẩm; người đọc tự kiểm lại được và đo lại sau rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/danh-sach.json`
  severity: medium
  Đề xuất: known-limits

- **Bản vá realpath cho khối chạy chính chỉ sửa do-lai.mjs; bảy tệp răng khác giữ phép so cũ, và khi so hỏng thì thoát 0 im lặng (r2)**
  Người dùng thấy gì: Một số lệnh kiểm của hồ sơ có thể báo xanh mà thực ra không kiểm gì nếu chạy qua đường dẫn có liên kết tượng trưng, như trong cây tạm trên máy này. Hiện chưa thấy lượt chấm nào bị ảnh hưởng.
  Căn cứ: Rủi ro chỉ xảy ra khi chạy trong cây tạm có liên kết tượng trưng và không mất dữ liệu; sửa sau rẻ và chưa có lượt chấm nào dính.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/danh-sach.mjs`
  severity: low
  Đề xuất: known-limits

- **Bảng trước/sau không có kết quả đột biến neo của cron E7 và E8 vì tệp kết quả chiều đỏ không được chạy lại (r2)**
  Người dùng thấy gì: Trong bảng so trước/sau, hai ô cron E7 và E8 không có số liệu thử phá bằng neo cố định như các ô khác, nên người duyệt chỉ thấy lời tự khai chứ không thấy kết quả máy chạy cho hai ô này.
  Căn cứ: Chỉ làm thiếu một con số bằng chứng ở hai ô trong tài liệu duyệt; chạy lại phép thử là xong và không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/ho-so-do-kiem-cheo/chieu-do-ket-qua.json`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): «Đầu ra sau khi sửa» và «Dòng lỗi trong log đầy đủ» trong bảng trước/sau được chép tay vào danh-sach.json, không rút ra từ lượt chạy nào (r2)**
  Người dùng thấy gì: Hội đồng chấm chỉ đọc bảng trước/sau, mà hai khối đầu ra trong đó do người gõ tay nên không có gì bảo đảm chúng đúng hay còn mới, dù đầu bảng ghi là máy sinh. Hội đồng có thể dựa vào số liệu cũ khi chấm.
  Căn cứ: Ảnh hưởng chỉ ở độ tin cậy của tài liệu chấm nội bộ, không mất dữ liệu và không đụng người dùng sản phẩm; ghi rõ là trích tay hoặc đo lại đều rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/bang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính đứng một mình, không ghim thông điệp): kiểm đột biến neo của hai dòng neo-co-dinh mới chỉ so mã thoát 2 (r2)**
  Người dùng thấy gì: Phép thử cho hai ô neo cố định chỉ kiểm mã thoát, mà mã đó cũng có thể do lỗi khác gây ra, nên về sau nếu thứ tự trong lệnh đổi thì phép thử có thể xanh vì lý do sai.
  Căn cứ: Hiện kết quả vẫn đúng và rủi ro chỉ xuất hiện nếu mã lệnh đổi về sau; không mất dữ liệu, không ảnh hưởng người dùng và sửa sau rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chieu-do.mjs`
  severity: low
  Đề xuất: known-limits

- **Sửa răng đổi khẳng định của các eval ui-check không có dòng danh sách, lời eval đã ký nay nói ngược với răng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Mô tả các bước kiểm của vài màn Toàn cảnh OKR và Cập nhật tuần đã cũ so với phép đo đang chạy. Người chấm bằng mắt đọc theo lời cũ có thể chấm lệch.
  Căn cứ: Chỉ gây hiểu nhầm cho người chấm chứ không làm hỏng tính năng nào của người dùng, và sửa lời mô tả sau vẫn rẻ.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Dòng danh sách của cron-theo-ban-khai E7/E8 đã cũ, bảng trước/sau và hội đồng E6 đọc sai cách sửa thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bảng so sánh trước/sau cho hai bài kiểm của lịch chạy theo bản khai mô tả cách sửa không còn đúng. Người duyệt đọc bảng này có thể hiểu sai điều đã thực sự được sửa.
  Căn cứ: Chỉ làm sai lời giải thích trong hồ sơ nội bộ, không ảnh hưởng người dùng, và sửa lại câu chữ sau vẫn rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/danh-sach.json`
  severity: medium
  Đề xuất: known-limits

- **Đo toan-canh-okr nay dựa vào nhật ký của cửa chặn thuộc hồ sơ khác, nhưng paths không khai tệp đó (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này ai đó sửa công cụ chặn dùng chung, phép đo màn Toàn cảnh OKR có thể không được chạy lại tự động. Một lỗi mới có thể lọt qua mà không ai thấy ngay.
  Căn cứ: Rủi ro nằm ở tương lai và chỉ ảnh hưởng công cụ kiểm, người dùng không mất dữ liệu, thêm một dòng khai báo sau là xong.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: low
  Đề xuất: known-limits

- **Cây tạm của cặp gộp cron mượn node_modules của HEAD qua symlink để đếm cảnh báo lint (r1)**
  Người dùng thấy gì: Con số cảnh báo kiểm tra mã có thể lệch nhẹ nếu phiên bản công cụ kiểm đổi, và đôi khi để lại một thư mục tạm trên máy. Người dùng cuối không thấy gì.
  Căn cứ: Hậu quả chỉ là một con số kiểm tra có thể lệch và một thư mục rác trên máy dev, tự dọn được, không đáng mở việc riêng.
  file: `_acceptance/cron-theo-ban-khai/rang/nam-lenh-chung.mjs`
  severity: low
  Đề xuất: wont-fix

- **cap-nhat-tuan-okr E14/E19 viết lệnh thẳng trong evals.yaml, chép lại giá trị của khoá config sẵn có (r1)**
  Người dùng thấy gì: Hai bài kiểm của Cập nhật tuần chép lệnh thẳng thay vì dùng chung khai báo. Về sau nếu sửa lệnh ở một nơi, hai nơi kia có thể bị lệch.
  Căn cứ: Chỉ là chuyện gọn gàng nội bộ, không ảnh hưởng người dùng, và nếu lệch thì bài kiểm sẽ tự đỏ để lộ ra.
  file: `_acceptance/cap-nhat-tuan-okr/evals.yaml`
  severity: low
  Đề xuất: wont-fix

- **Expected của chính hồ sơ ho-so-do-kiem-cheo lệch với răng đã viết (r1)**
  Người dùng thấy gì: Phần mô tả những gì các bài kiểm của đợt rà này chứng minh hơi khác với cách chúng thực sự chạy. Người ký đọc mô tả có thể tin rằng kiểm chặt hơn thực tế.
  Căn cứ: Chỉ làm lệch cách hiểu của người duyệt nội bộ, không ảnh hưởng người dùng sản phẩm, và chỉnh lại câu chữ về sau rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **chieu-do.mjs self-check never exercises DOT_BIEN_LOT or SAI_THONG_DIEP, though the E3 contract says it does (r1)**
  Người dùng thấy gì: Công cụ kiểm tra xem lỗi cố tình cài có bị bắt hay không chưa tự thử hai trường hợp quan trọng của chính nó. Nếu nó hỏng ở hai chỗ đó, nó vẫn báo xanh.
  Căn cứ: Rủi ro chỉ xảy ra nếu công cụ kiểm bị hỏng sau này, không ảnh hưởng người dùng sản phẩm, và bổ sung hai ca thử sau không đắt.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **khai-du.mjs 'commit khong nhan' self-check skips commitKhongNhan(): it puts a fake sha straight into the input (r1)**
  Người dùng thấy gì: Công cụ phát hiện thay đổi không có nhãn chưa tự thử khâu tìm thay đổi đó. Nếu khâu đó hỏng, một thay đổi lén vẫn có thể lọt mà công cụ báo bình thường.
  Căn cứ: Chỉ là độ chắc của công cụ nội bộ, người dùng không thấy, và hiện chưa có thay đổi lén nào bị bỏ sót được chứng minh.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/khai-du.mjs`
  severity: low
  Đề xuất: known-limits

- **loi-ra.mjs misses duplicate signal codes inside one hoan_lai entry (r1)**
  Người dùng thấy gì: Hai tín hiệu trùng mã trong cùng một hồ sơ hoàn lại có thể không bị báo. Hậu quả là sổ tín hiệu có hai dòng trùng mã.
  Căn cứ: Hiếm gặp, chỉ gây rối sổ nội bộ và dễ thấy bằng mắt khi đọc danh sách, nên không đáng sửa riêng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: low
  Đề xuất: wont-fix

- **do-lai.mjs drops the first argument when --log is not given (r1)**
  Người dùng thấy gì: Nếu chạy lại phép đo theo thứ tự khác với tài liệu, một hồ sơ có thể âm thầm bị bỏ khỏi lượt đo. Tổng kết vẫn trông bình thường.
  Căn cứ: Chỉ xảy ra khi gọi sai thứ tự, kết quả thiếu hồ sơ có thể phát hiện bằng cách đếm lại, và không ảnh hưởng người dùng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/do-lai.mjs`
  severity: low
  Đề xuất: known-limits

- **dungCayTam leaks the temporary worktree when bun install or db:generate fails (r1)**
  Người dùng thấy gì: Khi bước cài đặt của công cụ đo thất bại, một thư mục làm việc tạm bị bỏ lại trên máy dev. Không ảnh hưởng người dùng sản phẩm.
  Căn cứ: Chỉ để lại rác trên máy dev trong ca lỗi hiếm, xoá tay được bằng một lệnh, không đáng mở việc riêng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chung.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (chỉ kiểm chuỗi có mặt): CHUA_TRA chỉ đòi xu_ly và sua khác rỗng, không đòi tệp và đột biến như lời hứa (r1)**
  Người dùng thấy gì: Với các hồ sơ có lỗi sản phẩm được giao lại cho hàng sau, phần sửa gợi ý có thể thiếu chỉ dẫn tệp nào và cách chứng minh. Người làm hàng sau phải tự tra thêm.
  Căn cứ: Không làm hỏng gì cho người dùng, chỉ khiến việc sửa sau tốn thêm công tra cứu, và các lỗi sản phẩm vẫn được ghi đủ để theo dõi.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (lượt tự kiểm không ghim thông điệp): nhận DOT_BIEN_LOT hoặc BAN_VA_HONG, và không có cặp đối chứng SAI_THONG_DIEP (r1)**
  Người dùng thấy gì: Công cụ kiểm tra lỗi cài thử chưa tự thử đủ hai kiểu thất bại của chính nó. Nếu hai kiểu đó hỏng, công cụ vẫn báo xanh.
  Căn cứ: Chỉ giảm độ tin cậy của công cụ nội bộ, người dùng không thấy, và thêm ca thử sau không đắt.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): lượt tự kiểm COMMIT_KHONG_NHAN và CONFIG bơm thẳng giá trị vào kiemKhai, bỏ qua bộ dò bằng git (r1)**
  Người dùng thấy gì: Công cụ phát hiện thay đổi thiếu nhãn và đổi cấu hình lén chưa tự thử phần tìm kiếm thật của nó. Nếu phần đó hỏng, nó có thể bỏ sót mà vẫn báo ổn.
  Căn cứ: Rủi ro nội bộ của công cụ kiểm, người dùng không bị ảnh hưởng, và chưa có ca bỏ sót thực tế được chứng minh.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/khai-du.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): hai mục từ điển so với CONTEXT.md ở sha đóng băng, và đột biến chọn sửa phía opportunity.md (r1)**
  Người dùng thấy gì: Bài kiểm từ điển cho hai mục của Trợ lý OKR so với bản từ điển cũ cố định, nên nếu hai mục đó trong từ điển hiện tại bị sửa hỏng, bài kiểm vẫn xanh.
  Căn cứ: Chỉ để lọt lỗi chữ trong tài liệu nội bộ, không mất dữ liệu người dùng, và người đọc từ điển sẽ thấy được khi xem.
  file: `_acceptance/tro-ly-okr-nen/rang/tu-dien-luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): prisma migrate diff và phép kiểm liền khối chạy giữa hai blob git đóng băng (r1)**
  Người dùng thấy gì: Bài kiểm việc cập nhật cơ sở dữ liệu của Trợ lý OKR chỉ so hai bản cũ cố định, nên nếu cấu trúc dữ liệu hiện tại đổi theo hướng nguy hiểm, một phần bài kiểm sẽ không thấy.
  Căn cứ: Phần đọc tệp cập nhật thật vẫn được đo, rủi ro còn lại hẹp, và cấu trúc dữ liệu đã có các lớp kiểm khác khi đổi.
  file: `_acceptance/tro-ly-okr-nen/rang/migration-chi-them.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): số cảnh báo lint được ghim đo ở cây của cặp gộp lịch sử, đột biến chỉ sửa hằng số của răng (r1)**
  Người dùng thấy gì: Số cảnh báo kiểm tra mã của ứng dụng được đo trên bản lịch sử cố định, không phải bản đang làm. Cảnh báo mới ở bản hiện tại có thể không bị đếm.
  Căn cứ: Chủ kho đã chọn cách đo này có ý thức, cảnh báo mã không ảnh hưởng người dùng, và các lệnh kiểm chung khác vẫn chạy trên bản hiện tại.
  file: `_acceptance/cron-theo-ban-khai/rang/nam-lenh-chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): TIN_HIEU_VANG chỉ đọc tin_hieu khai trong danh-sach.json, không đọc cửa tín hiệu (r1)**
  Người dùng thấy gì: Công cụ chỉ kiểm tín hiệu báo lỗi sản phẩm theo đúng khuôn đã ghi, chứ không đối chiếu với tín hiệu đã thật sự gửi. Một mã bịa đúng khuôn vẫn qua được.
  Căn cứ: Nếu tín hiệu không đến nơi thì lỗi sản phẩm có thể bị quên, nhưng người ký đối chiếu được bằng mắt và giới hạn này đã được khai trước.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: low
  Đề xuất: known-limits

- **Khi trần thời lượng giết lượt tái lập bằng SIGKILL, tiến trình con do-lai vẫn chạy tiếp và cây tạm ở mốc nền bị bỏ lại (r2)**
  Người dùng thấy gì: Khi một lượt đo lại chạy quá giờ và bị ngắt cưỡng bức, nó để lại một bản sao làm việc tạm và có thể còn tiến trình chạy ngầm trong máy. Việc này chỉ tốn chỗ và tài nguyên máy, không làm sai kết quả nghiệm thu và không ảnh hưởng người dùng sản phẩm.
  Căn cứ: Hậu quả nhẹ, chỉ rác trên máy chạy nghiệm thu, không mất dữ liệu và người vận hành tự dọn được bằng tay, nên ghi vào han chế đã biết là đủ.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/danh-sach.mjs`
  severity: low
  Đề xuất: known-limits

- **Sửa răng đổi khẳng định của các eval ui-check không có dòng danh sách, lời eval đã ký nay nói ngược với răng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Mô tả các bước kiểm của vài màn Toàn cảnh OKR và Cập nhật tuần đã cũ so với phép đo đang chạy. Người chấm bằng mắt đọc theo lời cũ có thể chấm lệch.
  Căn cứ: Chỉ gây hiểu nhầm cho người chấm chứ không làm hỏng tính năng nào của người dùng, và sửa lời mô tả sau vẫn rẻ.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Dòng danh sách của cron-theo-ban-khai E7/E8 đã cũ, bảng trước/sau và hội đồng E6 đọc sai cách sửa thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bảng so sánh trước/sau cho hai bài kiểm của lịch chạy theo bản khai mô tả cách sửa không còn đúng. Người duyệt đọc bảng này có thể hiểu sai điều đã thực sự được sửa.
  Căn cứ: Chỉ làm sai lời giải thích trong hồ sơ nội bộ, không ảnh hưởng người dùng, và sửa lại câu chữ sau vẫn rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/danh-sach.json`
  severity: medium
  Đề xuất: known-limits

- **Đo toan-canh-okr nay dựa vào nhật ký của cửa chặn thuộc hồ sơ khác, nhưng paths không khai tệp đó (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này ai đó sửa công cụ chặn dùng chung, phép đo màn Toàn cảnh OKR có thể không được chạy lại tự động. Một lỗi mới có thể lọt qua mà không ai thấy ngay.
  Căn cứ: Rủi ro nằm ở tương lai và chỉ ảnh hưởng công cụ kiểm, người dùng không mất dữ liệu, thêm một dòng khai báo sau là xong.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: low
  Đề xuất: known-limits

- **Cây tạm của cặp gộp cron mượn node_modules của HEAD qua symlink để đếm cảnh báo lint (r1)**
  Người dùng thấy gì: Con số cảnh báo kiểm tra mã có thể lệch nhẹ nếu phiên bản công cụ kiểm đổi, và đôi khi để lại một thư mục tạm trên máy. Người dùng cuối không thấy gì.
  Căn cứ: Hậu quả chỉ là một con số kiểm tra có thể lệch và một thư mục rác trên máy dev, tự dọn được, không đáng mở việc riêng.
  file: `_acceptance/cron-theo-ban-khai/rang/nam-lenh-chung.mjs`
  severity: low
  Đề xuất: wont-fix

- **cap-nhat-tuan-okr E14/E19 viết lệnh thẳng trong evals.yaml, chép lại giá trị của khoá config sẵn có (r1)**
  Người dùng thấy gì: Hai bài kiểm của Cập nhật tuần chép lệnh thẳng thay vì dùng chung khai báo. Về sau nếu sửa lệnh ở một nơi, hai nơi kia có thể bị lệch.
  Căn cứ: Chỉ là chuyện gọn gàng nội bộ, không ảnh hưởng người dùng, và nếu lệch thì bài kiểm sẽ tự đỏ để lộ ra.
  file: `_acceptance/cap-nhat-tuan-okr/evals.yaml`
  severity: low
  Đề xuất: wont-fix

- **Expected của chính hồ sơ ho-so-do-kiem-cheo lệch với răng đã viết (r1)**
  Người dùng thấy gì: Phần mô tả những gì các bài kiểm của đợt rà này chứng minh hơi khác với cách chúng thực sự chạy. Người ký đọc mô tả có thể tin rằng kiểm chặt hơn thực tế.
  Căn cứ: Chỉ làm lệch cách hiểu của người duyệt nội bộ, không ảnh hưởng người dùng sản phẩm, và chỉnh lại câu chữ về sau rẻ.
  file: `_acceptance/ho-so-do-kiem-cheo/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **chieu-do.mjs self-check never exercises DOT_BIEN_LOT or SAI_THONG_DIEP, though the E3 contract says it does (r1)**
  Người dùng thấy gì: Công cụ kiểm tra xem lỗi cố tình cài có bị bắt hay không chưa tự thử hai trường hợp quan trọng của chính nó. Nếu nó hỏng ở hai chỗ đó, nó vẫn báo xanh.
  Căn cứ: Rủi ro chỉ xảy ra nếu công cụ kiểm bị hỏng sau này, không ảnh hưởng người dùng sản phẩm, và bổ sung hai ca thử sau không đắt.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **khai-du.mjs 'commit khong nhan' self-check skips commitKhongNhan(): it puts a fake sha straight into the input (r1)**
  Người dùng thấy gì: Công cụ phát hiện thay đổi không có nhãn chưa tự thử khâu tìm thay đổi đó. Nếu khâu đó hỏng, một thay đổi lén vẫn có thể lọt mà công cụ báo bình thường.
  Căn cứ: Chỉ là độ chắc của công cụ nội bộ, người dùng không thấy, và hiện chưa có thay đổi lén nào bị bỏ sót được chứng minh.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/khai-du.mjs`
  severity: low
  Đề xuất: known-limits

- **loi-ra.mjs misses duplicate signal codes inside one hoan_lai entry (r1)**
  Người dùng thấy gì: Hai tín hiệu trùng mã trong cùng một hồ sơ hoàn lại có thể không bị báo. Hậu quả là sổ tín hiệu có hai dòng trùng mã.
  Căn cứ: Hiếm gặp, chỉ gây rối sổ nội bộ và dễ thấy bằng mắt khi đọc danh sách, nên không đáng sửa riêng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: low
  Đề xuất: wont-fix

- **do-lai.mjs drops the first argument when --log is not given (r1)**
  Người dùng thấy gì: Nếu chạy lại phép đo theo thứ tự khác với tài liệu, một hồ sơ có thể âm thầm bị bỏ khỏi lượt đo. Tổng kết vẫn trông bình thường.
  Căn cứ: Chỉ xảy ra khi gọi sai thứ tự, kết quả thiếu hồ sơ có thể phát hiện bằng cách đếm lại, và không ảnh hưởng người dùng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/do-lai.mjs`
  severity: low
  Đề xuất: known-limits

- **dungCayTam leaks the temporary worktree when bun install or db:generate fails (r1)**
  Người dùng thấy gì: Khi bước cài đặt của công cụ đo thất bại, một thư mục làm việc tạm bị bỏ lại trên máy dev. Không ảnh hưởng người dùng sản phẩm.
  Căn cứ: Chỉ để lại rác trên máy dev trong ca lỗi hiếm, xoá tay được bằng một lệnh, không đáng mở việc riêng.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chung.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (chỉ kiểm chuỗi có mặt): CHUA_TRA chỉ đòi xu_ly và sua khác rỗng, không đòi tệp và đột biến như lời hứa (r1)**
  Người dùng thấy gì: Với các hồ sơ có lỗi sản phẩm được giao lại cho hàng sau, phần sửa gợi ý có thể thiếu chỉ dẫn tệp nào và cách chứng minh. Người làm hàng sau phải tự tra thêm.
  Căn cứ: Không làm hỏng gì cho người dùng, chỉ khiến việc sửa sau tốn thêm công tra cứu, và các lỗi sản phẩm vẫn được ghi đủ để theo dõi.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (lượt tự kiểm không ghim thông điệp): nhận DOT_BIEN_LOT hoặc BAN_VA_HONG, và không có cặp đối chứng SAI_THONG_DIEP (r1)**
  Người dùng thấy gì: Công cụ kiểm tra lỗi cài thử chưa tự thử đủ hai kiểu thất bại của chính nó. Nếu hai kiểu đó hỏng, công cụ vẫn báo xanh.
  Căn cứ: Chỉ giảm độ tin cậy của công cụ nội bộ, người dùng không thấy, và thêm ca thử sau không đắt.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): lượt tự kiểm COMMIT_KHONG_NHAN và CONFIG bơm thẳng giá trị vào kiemKhai, bỏ qua bộ dò bằng git (r1)**
  Người dùng thấy gì: Công cụ phát hiện thay đổi thiếu nhãn và đổi cấu hình lén chưa tự thử phần tìm kiếm thật của nó. Nếu phần đó hỏng, nó có thể bỏ sót mà vẫn báo ổn.
  Căn cứ: Rủi ro nội bộ của công cụ kiểm, người dùng không bị ảnh hưởng, và chưa có ca bỏ sót thực tế được chứng minh.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/khai-du.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): hai mục từ điển so với CONTEXT.md ở sha đóng băng, và đột biến chọn sửa phía opportunity.md (r1)**
  Người dùng thấy gì: Bài kiểm từ điển cho hai mục của Trợ lý OKR so với bản từ điển cũ cố định, nên nếu hai mục đó trong từ điển hiện tại bị sửa hỏng, bài kiểm vẫn xanh.
  Căn cứ: Chỉ để lọt lỗi chữ trong tài liệu nội bộ, không mất dữ liệu người dùng, và người đọc từ điển sẽ thấy được khi xem.
  file: `_acceptance/tro-ly-okr-nen/rang/tu-dien-luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): prisma migrate diff và phép kiểm liền khối chạy giữa hai blob git đóng băng (r1)**
  Người dùng thấy gì: Bài kiểm việc cập nhật cơ sở dữ liệu của Trợ lý OKR chỉ so hai bản cũ cố định, nên nếu cấu trúc dữ liệu hiện tại đổi theo hướng nguy hiểm, một phần bài kiểm sẽ không thấy.
  Căn cứ: Phần đọc tệp cập nhật thật vẫn được đo, rủi ro còn lại hẹp, và cấu trúc dữ liệu đã có các lớp kiểm khác khi đổi.
  file: `_acceptance/tro-ly-okr-nen/rang/migration-chi-them.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản cố định thay vì cây đang kiểm): số cảnh báo lint được ghim đo ở cây của cặp gộp lịch sử, đột biến chỉ sửa hằng số của răng (r1)**
  Người dùng thấy gì: Số cảnh báo kiểm tra mã của ứng dụng được đo trên bản lịch sử cố định, không phải bản đang làm. Cảnh báo mới ở bản hiện tại có thể không bị đếm.
  Căn cứ: Chủ kho đã chọn cách đo này có ý thức, cảnh báo mã không ảnh hưởng người dùng, và các lệnh kiểm chung khác vẫn chạy trên bản hiện tại.
  file: `_acceptance/cron-theo-ban-khai/rang/nam-lenh-chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): TIN_HIEU_VANG chỉ đọc tin_hieu khai trong danh-sach.json, không đọc cửa tín hiệu (r1)**
  Người dùng thấy gì: Công cụ chỉ kiểm tín hiệu báo lỗi sản phẩm theo đúng khuôn đã ghi, chứ không đối chiếu với tín hiệu đã thật sự gửi. Một mã bịa đúng khuôn vẫn qua được.
  Căn cứ: Nếu tín hiệu không đến nơi thì lỗi sản phẩm có thể bị quên, nhưng người ký đối chiếu được bằng mắt và giới hạn này đã được khai trước.
  file: `_acceptance/ho-so-do-kiem-cheo/rang/loi-ra.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
