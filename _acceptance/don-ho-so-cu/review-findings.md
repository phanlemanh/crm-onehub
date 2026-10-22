# Review findings: don-ho-so-cu (vòng 3)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E7 paths are missing xu-ly.json and khuon-xu-ly.mjs, though its pass condition reads both**
  Người dùng thấy gì: Nếu sau này ai sửa sổ xử lý hoặc khuôn đọc sổ, kết quả cũ của phép đo tên gọi vẫn được coi là còn mới. Có thể có một kết quả xanh đã lỗi thời mà không ai biết.
  Căn cứ: Chỉ ảnh hưởng độ tươi của bằng chứng sau này, không mất dữ liệu và không sai kết quả hôm nay; khi gặp thì chạy lại phép đo là tự gỡ được.
  file: `_acceptance/don-ho-so-cu/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E9 paths are missing chung.mjs and acceptance.yml, which the rewritten cong-gop.mjs depends on**
  Người dùng thấy gì: Phép đo kiểm tra lưới gộp có thể vẫn báo xanh cũ dù công cụ dùng chung hoặc lệnh CI đã đổi. Người ký có thể tin một kết quả đã lỗi thời.
  Căn cứ: Hệ quả nhẹ và chỉ xuất hiện khi các tệp đó đổi sau này; không mất dữ liệu, chạy lại là thấy đúng.
  file: `_acceptance/don-ho-so-cu/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **pinXanh adds a second definition of a green pin that differs from the kit's rule**
  Người dùng thấy gì: Công cụ đối chiếu có thể coi một lượt ghim hợp lệ là đỏ, hoặc coi lượt ghim thiếu là xanh, nên báo sai về hồ sơ chưa xử lý. Hiện chưa hồ sơ nào bị ảnh hưởng.
  Căn cứ: Chưa gây sai lệch nào hôm nay và chỉ siết thêm chứ không nới; nếu sau này báo đỏ giả thì người xem thấy ngay và xử lý được.
  file: `_acceptance/don-ho-so-cu/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **E9 paths omit chung.mjs and acceptance.yml, which cong-gop.mjs now depends on, so E9 evidence will not go stale when they change**
  Người dùng thấy gì: Kết quả kiểm tra lưới gộp có thể vẫn được coi là còn mới dù công cụ nền hoặc lệnh CI đã đổi. Người ký có thể tin một kết quả đã cũ.
  Căn cứ: Chỉ là bằng chứng có thể cũ mà không báo, không làm mất hay sai dữ liệu người dùng; chạy lại phép đo là xong.
  file: `_acceptance/don-ho-so-cu/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E7 (and E6) paths omit xu-ly.json and khuon-xu-ly.mjs, though the verdict reads the record's ghim-luoi rows through that schema**
  Người dùng thấy gì: Nếu ai xoá hoặc sửa dòng ghim-lười trong sổ xử lý, kết quả đã ký của phép đo tên gọi và phép đo cây hồ sơ vẫn được coi là mới. Kết quả có thể đã sai mà không ai thấy.
  Căn cứ: Chỉ xảy ra khi sổ bị sửa sau này; không mất dữ liệu, và chạy lại phép đo là lộ ra ngay.
  file: `_acceptance/don-ho-so-cu/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **pinXanh treats any non-zero exit as red, ignoring a declared expected_exit, unlike the kit's own pin check**
  Người dùng thấy gì: Khi hồ sơ có phép đo vốn được phép kết thúc với mã khác 0, công cụ đối chiếu sẽ báo hồ sơ chưa xử lý trong khi lưới của kit chấp nhận. Người xem thấy đỏ giả.
  Căn cứ: Hiện bị che bởi dòng ghim-lười nên chưa ai gặp, và nếu gặp thì chỉ là đỏ giả, không mất dữ liệu.
  file: `_acceptance/don-ho-so-cu/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **go-them-tep-khac check can never fail, so E9 reports a self-test that tests nothing**
  Người dùng thấy gì: Một dòng tự kiểm báo đạt nhưng không thật sự thử được việc dọn hồ sơ có lỡ chạm thêm tệp khác. Nếu sau này bước dọn chạm nhầm tệp, dòng đó vẫn báo đạt.
  Căn cứ: Hôm nay bước dọn chỉ xoá đúng thư mục hồ sơ nên không có hại thật; rủi ro chỉ ở lần sửa sau, và khi đó lưới gộp vẫn còn chặn.
  file: `_acceptance/don-ho-so-cu/rang/cong-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (một ca âm tính đứng một mình, thiếu đối chứng dương): hai ca doi-loi-ac của E5 không chứng được rằng mẫu chưa sửa thì sạch**
  Người dùng thấy gì: Hai ca thử việc phát hiện lời tiêu chí bị sửa có thể báo đạt vì lý do khác, như lỗi lấy bản gốc, nên chưa chắc chứng minh được điều chúng nói.
  Căn cứ: Đã chạy tay và thấy mẫu chưa sửa sạch, sổ hiện chưa có dòng sửa thước nào; nếu hỏng thì chỉ mất một lớp kiểm chứng phụ.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (một ca âm tính đứng một mình): ca k6a-khong-ghim của E7 thay hẳn hàm cần đo bằng hằng false, nên không chạm điều kiện «mọi eval máy đạt» mới thêm vào lượt này**
  Người dùng thấy gì: Nếu lỡ bỏ điều kiện chỉ tính lượt ghim xanh, phép đo hai hồ sơ K6a vẫn báo đạt, nên có thể coi một lượt ghim đỏ là đã ghim.
  Căn cứ: Hôm nay điều kiện đang có hiệu lực nên kết quả đúng; chỉ mất lưới an toàn nếu ai đó sửa nhầm sau này, và người xem sẽ thấy khi đối chiếu.
  file: `_acceptance/don-ho-so-cu/rang/ca-goi-ten.mjs`
  severity: low
  Đề xuất: known-limits

- **Paths filter for E2 misses xu-ly.json and config.yaml, which kiem-lo actually reads, so evidence will not go stale when they change (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi sổ xử lý hoặc cấu hình đổi, bằng chứng của vòng dọn hồ sơ cũ không tự bị đánh dấu cũ, nên người đọc có thể tin một kết quả đã lệch với dữ liệu hiện tại.
  Căn cứ: Hậu quả chỉ là một kết quả xanh có thể đã lỗi thời mà không ai thấy, không mất dữ liệu, và gặp lại khi chạy đo lại thì tự lộ ra.
  file: `_acceptance/don-ho-so-cu/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **kiem-lo.mjs and lo.mjs read xu-ly.json raw instead of going through the schema module next to them (r1)**
  Người dùng thấy gì: Nếu một dòng trong sổ xử lý sai hình dạng, một số bài kiểm âm thầm tính ra kết quả sai thay vì báo lỗi rõ ràng.
  Căn cứ: Sổ xử lý do người trong nhóm sửa và các bài kiểm khác đã bắt lỗi hình dạng, nên rủi ro thấp và lộ ra khi chạy lại.
  file: `_acceptance/don-ho-so-cu/rang/kiem-lo.mjs`
  severity: medium
  Đề xuất: known-limits

- **The constant NHANH_VONG is declared twice, and the hồ sơ slug is hardcoded outside chung.mjs (r1 · tệp đã đổi)**
  Người dùng thấy gì: Tên nhánh của vòng dọn hồ sơ được viết ở nhiều chỗ, nên sau này đổi tên nhánh phải sửa đủ các chỗ hoặc sẽ lệch.
  Căn cứ: Người dùng không thấy gì, bộ công cụ này chỉ sống trong vòng dọn một lần, nên sửa không đáng công.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (chỉ có ca âm, không đối chứng dương): E5 chưa lần nào thấy một dòng sua-thuoc hợp lệ qua được kiemSuaThuoc (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm sửa thước mới chỉ thử các ca phải bị từ chối, nên có thể nó từ chối cả những bản sửa đúng mà vẫn báo xanh.
  Căn cứ: Hiện chưa có bản sửa thước nào trong sổ, nên chưa ai bị chặn oan, và gặp ca đầu tiên là lộ ngay.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): duong_tinh.ma và tiem_do.ma lấy từ chính sổ xử lý, không đọc từ nhật ký (r1 · tệp đã đổi)**
  Người dùng thấy gì: Kết quả lượt đối chứng của một bản sửa thước có thể do người ghi tay mà vẫn được chấp nhận, không được đối chiếu với nhật ký thật.
  Căn cứ: Chỉ chủ kho và nhóm tin cậy ghi sổ này, và người ký Cổng Bằng chứng còn xem lại, nên rủi ro cố ý lách thấp.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): ảnh chụp vong_ky_cho_gop không được dựng lại hay đối chiếu (r1 · tệp đã đổi)**
  Người dùng thấy gì: Danh sách các vòng đã ký đang chờ gộp được tin theo lời khai trong sổ, có thể ghi rỗng để bỏ qua bước hỏi làn chủ.
  Căn cứ: Hậu quả tối đa là một câu hỏi đáng ra phải gửi không được gửi, và làn chủ vẫn thấy khi PR của mình bị đụng.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì lệnh thật): lenhCi grep workflow rồi chạy một lệnh chép tay (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm cổng gộp chạy một lệnh viết sẵn, nên nếu cách CI chạy đổi trong tương lai thì bài kiểm vẫn báo như thể giống CI.
  Căn cứ: Hiện lệnh vẫn giống nhau, và nếu CI đổi thì lệch lộ ra ở lần gộp PR thật mà không mất dữ liệu.
  file: `_acceptance/don-ho-so-cu/rang/cong-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (ca âm không ghim thông điệp): năm ca tiêm của E4 nhận BẤT KỲ lỗi nào (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm sổ xử lý coi một ca là bị bắt khi có lỗi bất kỳ, nên có thể ca bị bắt vì lý do khác với điều tên ca nói.
  Căn cứ: Không ảnh hưởng người dùng và lỗi chỉ làm bài kiểm kém chặt, sổ vẫn bị kiểm bằng dòng mẫu đúng.
  file: `_acceptance/don-ho-so-cu/rang/so-xu-ly.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/9 lỗi rơi vào file không bộ đo nào phủ (_acceptance/don-ho-so-cu/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
