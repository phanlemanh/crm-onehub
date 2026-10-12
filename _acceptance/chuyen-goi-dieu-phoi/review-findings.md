# Review Findings: chuyen-goi-dieu-phoi

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở round 3.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ Cổng Bằng chứng và trang bằng chứng đã commit là bản dựng của round 2, nay lệch với hợp đồng và sổ quyết định ở HEAD**
  Người dùng thấy gì: Thẻ duyệt và trang bằng chứng đang lưu là bản dựng từ trước vòng sửa gần nhất, nên còn ghi hai quyết định đã bị thay và bỏ sót hai quyết định mới đổi hợp đồng. Nếu trình đúng thẻ này, người ký sẽ duyệt dựa trên thông tin cũ; cần dựng lại thẻ rồi mới trình.
  file: `_acceptance/chuyen-goi-dieu-phoi/card.html`
  severity: low
  Đề xuất: known-limits

- **E9: --diff-filter=M bỏ lặng evals.yaml bị xoá của hồ sơ đã ký ngoài bảng, nên E9 vẫn xanh (round 2 còn đỏ)**
  Người dùng thấy gì: Phép kiểm việc sửa hồ sơ cũ không phát hiện được trường hợp một tệp thước của hồ sơ đã ký bị xoá hẳn, nó vẫn báo xanh. Cây hiện tại không bị xoá tệp nào nên kết quả đang đúng, nhưng nếu sau này lỡ xoá thì phép kiểm sẽ không báo gì.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs`
  severity: medium
  Đề xuất: known-limits

- **E10: bản clone giữ origin là đường cục bộ, nên lệnh cần gh (gpct_luot_that, gpct_nen_gop) thoát 2 ở cả hai cây mà vẫn bị tính là «do san»**
  Người dùng thấy gì: Hai phép kiểm về luồng chạy tự động của kho không thực sự chạy được trong bàn đo, nên luôn bị tính là «đỏ sẵn» ở cả hai bản và phép đo hồi quy vẫn báo xanh. Nếu vòng này làm hỏng luồng đó thì có thể không ai thấy ngay, chỉ lộ muộn hơn khi các hồ sơ cũ được ghim lại và chạy thật.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/khong-do-them.mjs`
  severity: medium
  Đề xuất: new-contract

- **neoVong chạy lúc nạp chung.mjs; catch của laToTien nuốt lỗi «bad revision», nên thiếu origin/onehub thì mọi phép đo sập mã 1 (đỏ) thay vì mã 2**
  Người dùng thấy gì: Khi máy chạy kiểm thiếu bản tham chiếu của nhánh chính, cả mười phép đo báo đỏ như thể tính năng hỏng, thay vì báo «không đo được». Người đọc có thể hiểu nhầm là hỏng thật trong khi chỉ là máy đo thiếu đồ.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): E9 hứa «mỗi tệp evals.yaml cũ», nhưng miền kiểm lọc `--diff-filter=M` nên bỏ sót tệp bị xoá hay đổi tên**
  Người dùng thấy gì: Phép kiểm việc sửa hồ sơ cũ chỉ để ý các tệp thước bị sửa, nên một tệp của hồ sơ đã ký bị xoá hay đổi tên sẽ lọt qua mà vẫn báo xanh. Hiện không có tệp nào bị xoá hay đổi tên nên kết quả đúng, nhưng sau này sẽ không có cảnh báo.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca đỏ «mien-git-diff-rong» nhét thẳng `[]` vào `kiemMien` thay vì làm bước git diff trả rỗng, nên ca này không bao giờ hỏng**
  Người dùng thấy gì: Một ca thử cố ý làm hỏng của phép kiểm sửa hồ sơ cũ luôn tự báo đỏ theo cách dựng sẵn, nên nó không chứng minh được phép kiểm thật sự bắt lỗi ở bước đó. Hậu quả nhỏ vì phần còn lại của phép kiểm vẫn có ca thử thật.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): neo vòng khai hai trạng thái (nhánh mở / đã gộp), nhưng không phép đo nào chạy qua nhánh «đã gộp»**
  Người dùng thấy gì: Cách chọn mốc so sánh cho trường hợp hồ sơ đã được gộp vào nhánh chính chưa từng được chạy thử, vì mọi lượt kiểm hiện nay chạy khi nhánh còn mở. Sau khi gộp, nếu chọn nhầm mốc thì các phép đo kiểm chéo ban đêm sẽ so sai cặp bản mà không ai biết.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **E9 now builds its check list from a git diff against a fixed sha, so it breaks once onehub moves (r2 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi PR này gộp và nhánh chính có thêm hồ sơ mới, phép kiểm xác nhận các hồ sơ cũ chỉ bị sửa đúng chỗ có thể sập kèm thông báo khó hiểu hoặc báo lệch giả, thay vì nói rõ không đo được. Lượt kiểm chéo đêm có thể đỏ giả cho tới khi ai đó ghim lại thước đo.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs`
  severity: medium
  Đề xuất: known-limits

- **E9 mutation case passes its check list in by hand, so a broken git-diff step stays green (r2 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm xác nhận các hồ sơ cũ chỉ bị sửa đúng chỗ có một ca thử lỗi tự đưa danh sách vào bằng tay, nên nếu bước tự tìm hồ sơ bị sửa hỏng âm thầm thì phép kiểm vẫn báo xanh. Lỗ hổng chỉ lộ khi có người sửa nhầm một hồ sơ cũ ngoài bảng đã khai.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs`
  severity: low
  Đề xuất: known-limits

- **Fake live batch hardcodes the pid file name instead of using KIEM_CHEO.khoa.tepPid (r2)**
  Người dùng thấy gì: Bộ giả lập lượt chạy dùng để đo kiểm chéo ghi cứng một tên tệp thay vì lấy từ cấu hình chung. Nếu sau này tên đó đổi, phép đo báo hỏng ngay và rõ ràng, chỉ thêm một chỗ phải sửa; không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/goi-vang.mjs`
  severity: low
  Đề xuất: wont-fix

- **E9: không có ca đỏ nào cho miền kiểm rút từ git diff (bản sửa round 1); SLUG_DOI rỗng thì E9 vẫn xanh (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu bước tự tìm các hồ sơ cũ vừa bị sửa trả về rỗng, phép kiểm vẫn báo xanh mà không ai thấy. Khi đó một hồ sơ cũ bị sửa ngoài danh sách đã khai có thể lọt qua mà không bị bắt.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs`
  severity: medium
  Đề xuất: known-limits

- **goi-vang: khongDoDuoc gọi process.exit trong khối try nên finally không chạy; tiến trình ngủ và kho giả bị bỏ lại (r2)**
  Người dùng thấy gì: Khi máy không có gói điều phối, lần đo dừng giữa chừng có thể để lại vài tiến trình ngủ và thư mục tạm. Chúng tự hết sau khoảng mười phút hoặc khi hệ điều hành dọn, và không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/goi-vang.mjs`
  severity: low
  Đề xuất: wont-fix

- **thay-boi: SLUG_DOI gồm cả evals.yaml mới thêm hoặc đã xoá; docTai(MB) hoặc docEvals ném lỗi không bắt thay vì in DO hay khongDoDuoc (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này có hồ sơ cũ được thêm mới hoặc bị xoá tệp tiêu chí, phép kiểm sẽ sập kèm thông báo khó hiểu thay vì nói rõ hồ sơ nào lệch. Không ảnh hưởng người dùng sản phẩm, chỉ làm người bảo trì mất thời gian tìm nguyên nhân.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): chiều đỏ sua-ho-so-ngoai-bang nhét miền kiểm bằng tay, bỏ qua bước rút miền từ git diff (r2 · tệp đã đổi)**
  Người dùng thấy gì: Ca thử lỗi của phép kiểm hồ sơ cũ tự đưa sẵn danh sách hồ sơ cần soi vào, không đi qua bước tự tìm danh sách đó. Vì vậy bước tự tìm có thể hỏng hẳn mà phép kiểm vẫn xanh, và một hồ sơ cũ bị sửa nhầm ngoài bảng sẽ không bị phát hiện.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): ô loại trừ ${CLAUDE_PLUGIN_ROOT} không có ca đo, và nó miễn cả lệnh (r2 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm không còn lệnh tự chạy nào gọi mã của kho cũ sẽ bỏ qua cả dòng lệnh nếu nó có nhắc tới thư mục của gói. Nếu sau này ai thêm lệnh kiểu không có gói thì lùi về mã của kho, phép kiểm vẫn xanh dù kho vẫn bị gọi.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/hook.mjs`
  severity: low
  Đề xuất: known-limits

- **Package exports are not checked when the dieu-phoi package loads, so a missing export fails silently or with the wrong result (r1)**
  Người dùng thấy gì: Nếu một bản gói điều phối sau này đổi tên hoặc bỏ một chức năng, lượt kiểm chéo ban đêm sẽ không báo rõ là thiếu gói mà có thể chạy tiếp hoặc dừng với một lỗi khó hiểu. Với bản gói đang dùng thì chưa xảy ra.
  file: `scripts/kiem-cheo/goi-dieu-phoi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Two plugin lookups in kiem-cheo use the same config key giaiBang with different bases (r1)**
  Người dùng thấy gì: Hai chỗ trong cấu hình kiểm chéo dùng cùng một tên cho hai việc khác nhau, nên người sửa sau dễ chỉnh nhầm và làm lượt kiểm chéo ban đêm không chạy được. Hiện tại chưa gây lỗi nào.
  file: `scripts/kiem-cheo/cau-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

- **Kiểm chéo giữ khoá s4 trong đợt của kit chỉ chạm `nhip`, không ghi `song/`, nên bộ phát lịch của gói báo nhầm «khoa-khong-nhip» mỗi đêm (r1)**
  Người dùng thấy gì: Khi một đợt điều phối đang chạy, lượt kiểm chéo ban đêm giữ chỗ nhưng không báo «còn sống» theo cách bộ điều phối cần, nên sau khoảng 10 phút giám sát có thể nhận cảnh báo nhầm rằng người giữ chỗ đã chết. Làm theo cảnh báo đó sẽ cắt ngang lượt kiểm chéo đang chạy bình thường, và việc này lặp lại mỗi đêm.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: medium
  Đề xuất: new-contract

- **`napGoiDieuPhoi` không kiểm hàm của gói có tồn tại; thiếu `chamNhip` thì `catch {}` nuốt lỗi và khoá s4 mất nhịp mà không ai biết (r1)**
  Người dùng thấy gì: Nếu bản gói điều phối mới bỏ mất chức năng báo «còn sống», lượt kiểm chéo ban đêm vẫn chạy mà không ai hay, rồi có thể bị bộ điều phối thu hồi chỗ giữa chừng. Với bản gói đang dùng thì chưa xảy ra.
  file: `scripts/kiem-cheo/goi-dieu-phoi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E7 kiểm «khoá máy s4 đã nhả» nhưng fixture không bao giờ lấy khoá máy (r1)**
  Người dùng thấy gì: Phép kiểm «khoá máy đã được nhả sau khi đóng đợt» luôn ra xanh vì lúc kiểm khoá máy chưa từng được lấy, nên nếu khâu nhả khoá hỏng thì phép kiểm cũng không đỏ lên. Hành vi này do bộ điều phối của hãng giữ và hãng có phép đo riêng.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/luot-kho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E7 kiểm «chu.json không có moc» trên tệp mà bộ phát lịch ghép từ danh sách khoá cố định (r1)**
  Người dùng thấy gì: Phép kiểm «tệp chủ khoá không mang mốc» luôn xanh vì bộ điều phối của hãng không bao giờ ghi mốc vào đó, nên kết quả đúng nhưng không chứng minh thêm điều gì. Phần đơn xin khoá, nơi mốc thật sự có thể lọt vào, đã được kiểm ở phép đo khác.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/luot-kho.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): bài «goi dieu-phoi khong giai duoc» khẳng định khoá và cây vắng sau lượt, nhưng mọi đường đều dọn cả hai (r1)**
  Người dùng thấy gì: Một bài kiểm có hai câu khẳng định «không lấy khoá, không dựng cây làm việc» mà dù có lấy rồi dọn thì vẫn đúng. Câu khẳng định thật sự phân biệt được nằm ở lý do dừng và đã có, nên chỉ là bài kiểm trông chắc hơn thực tế.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
