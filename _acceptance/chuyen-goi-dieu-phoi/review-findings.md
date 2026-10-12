# Review Findings: chuyen-goi-dieu-phoi

## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình): E6 kiểm «không có tệp xin/» ở thư mục không đường mã nào ghi tới**
  AC: AC-6
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/goi-vang.mjs:70`
  severity: medium
  detail: Dòng 70 đọc `join(thuMuc, "xin")` với `thuMuc = <kho giả>/.acceptance-runs/kiem-cheo`, rồi dòng 82 (`DO co-don-xin` ở ca vắng gói) và dòng 94 (ca da-cai-khong-dot) khẳng định nó rỗng. Đơn xin chỉ được ghi ở `quaBoPhatLich`, đường là `join(dot, "xin", TEN_DON)` (scripts/kiem-cheo/khoa.mjs:47). Đường đó chỉ tới khi có đợt sống, mà `dungKho()` không dựng `.acceptance-runs/dieu-phoi-hien-tai`. Vậy thư mục được kiểm không bao giờ có tệp, dù mã có ghi đơn hay không. Không ca đột biến nào ra «DO co-don-xin», nên vế «lượt không ghi đơn xin khoá» của AC-6 không đỏ được. Vế «lượt lấy khoá tay» ở ca (c) cũng không có phép đo nào: làn giả không đọc `khoa/s4/chu.json`.
  lý do vào hợp đồng: AC-6 đòi lượt không ghi đơn xin khoá khi gói vắng, đây là chỗ nối do crm sở hữu, và phép đo đọc một thư mục mà không đường mã nào ghi tới nên không thể đỏ dù mã có ghi đơn.
  source: measurement

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): E9 chỉ xét «không đổi ngoài bảng» trên các slug lấy từ chính bảng**
  AC: AC-9
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/thay-boi.mjs:55`
  severity: low
  detail: Vòng `for (const slug of new Set(bang.map((r) => r.slug)))` ở dòng 55 lấy miền «mỗi tệp evals.yaml cũ chỉ đổi đúng các dòng đó» (AC-9; design mục 5: «Không sửa dòng nào khác của hồ sơ đã ký») từ chính bảng thay bởi, không rút từ `git diff --name-only <merge-base> -- '_acceptance/*/evals.yaml'`. Một sửa đổi vào evals.yaml của một hồ sơ đã ký nằm ngoài bảng sẽ không được tệp nào so với merge-base, và E9 vẫn ra mã 0. Phép đo tự xác nhận vòng tròn: bảng vừa là thứ được kiểm, vừa là miền kiểm. Hiện các tệp đổi đều có trong bảng, nên đây là lỗ hổng ẩn của thước, chưa có tệp nào lọt.
  lý do vào hợp đồng: AC-9 đòi mỗi tệp evals.yaml cũ chỉ đổi đúng các dòng của bảng, mà phép đo lấy miền kiểm từ chính bảng nên một tệp hồ sơ cũ bị sửa ngoài bảng vẫn qua.
  source: measurement

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): E3 khẳng định «không lệnh hook nào gọi scripts/ của kho» bằng đúng một cách viết đường**
  AC: AC-3
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/hook.mjs:9`
  severity: low
  detail: `DUONG_KHO = /\$CLAUDE_PROJECT_DIR\/scripts\/([^"\s;]+)/` là thước duy nhất cho vế «HEAD không còn lệnh hook nào gọi tệp dưới scripts/ của kho» (AC-3; dòng 30-31 `boHook(moi, DUONG_KHO)`). Ba cách viết sau đều gọi scripts/ của kho mà lọt qua với «hook goi kho: 0»: `${CLAUDE_PROJECT_DIR}/scripts/x.mjs`, `"$CLAUDE_PROJECT_DIR"/scripts/x.mjs`, và lệnh tương đối `node scripts/x.mjs`. Ca đột biến «settings-giu-pretooluse» chép lại đúng khối cũ có cùng cách viết với regex, nên chỉ xác nhận lại chính regex, không phủ cả lớp. Contract đã báo trước rằng bước cài gói sẽ đổi `.claude/settings.json` và kéo theo một lượt ghim lại.
  lý do vào hợp đồng: AC-3 đòi HEAD không còn lệnh hook nào gọi tệp dưới scripts/ của kho (khẳng định cả lớp), mà phép đo chỉ bắt một cách viết đường nên ba cách viết khác lọt qua.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Package exports are not checked when the dieu-phoi package loads, so a missing export fails silently or with the wrong result**
  Người dùng thấy gì: Nếu một bản gói điều phối sau này đổi tên hoặc bỏ một chức năng, lượt kiểm chéo ban đêm sẽ không báo rõ là thiếu gói mà có thể chạy tiếp hoặc dừng với một lỗi khó hiểu. Với bản gói đang dùng thì chưa xảy ra.
  file: `scripts/kiem-cheo/goi-dieu-phoi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Two plugin lookups in kiem-cheo use the same config key giaiBang with different bases**
  Người dùng thấy gì: Hai chỗ trong cấu hình kiểm chéo dùng cùng một tên cho hai việc khác nhau, nên người sửa sau dễ chỉnh nhầm và làm lượt kiểm chéo ban đêm không chạy được. Hiện tại chưa gây lỗi nào.
  file: `scripts/kiem-cheo/cau-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

- **Kiểm chéo giữ khoá s4 trong đợt của kit chỉ chạm `nhip`, không ghi `song/`, nên bộ phát lịch của gói báo nhầm «khoa-khong-nhip» mỗi đêm**
  Người dùng thấy gì: Khi một đợt điều phối đang chạy, lượt kiểm chéo ban đêm giữ chỗ nhưng không báo «còn sống» theo cách bộ điều phối cần, nên sau khoảng 10 phút giám sát có thể nhận cảnh báo nhầm rằng người giữ chỗ đã chết. Làm theo cảnh báo đó sẽ cắt ngang lượt kiểm chéo đang chạy bình thường, và việc này lặp lại mỗi đêm.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: medium
  Đề xuất: new-contract

- **`napGoiDieuPhoi` không kiểm hàm của gói có tồn tại; thiếu `chamNhip` thì `catch {}` nuốt lỗi và khoá s4 mất nhịp mà không ai biết**
  Người dùng thấy gì: Nếu bản gói điều phối mới bỏ mất chức năng báo «còn sống», lượt kiểm chéo ban đêm vẫn chạy mà không ai hay, rồi có thể bị bộ điều phối thu hồi chỗ giữa chừng. Với bản gói đang dùng thì chưa xảy ra.
  file: `scripts/kiem-cheo/goi-dieu-phoi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E7 kiểm «khoá máy s4 đã nhả» nhưng fixture không bao giờ lấy khoá máy**
  Người dùng thấy gì: Phép kiểm «khoá máy đã được nhả sau khi đóng đợt» luôn ra xanh vì lúc kiểm khoá máy chưa từng được lấy, nên nếu khâu nhả khoá hỏng thì phép kiểm cũng không đỏ lên. Hành vi này do bộ điều phối của hãng giữ và hãng có phép đo riêng.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/luot-kho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E7 kiểm «chu.json không có moc» trên tệp mà bộ phát lịch ghép từ danh sách khoá cố định**
  Người dùng thấy gì: Phép kiểm «tệp chủ khoá không mang mốc» luôn xanh vì bộ điều phối của hãng không bao giờ ghi mốc vào đó, nên kết quả đúng nhưng không chứng minh thêm điều gì. Phần đơn xin khoá, nơi mốc thật sự có thể lọt vào, đã được kiểm ở phép đo khác.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/luot-kho.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): bài «goi dieu-phoi khong giai duoc» khẳng định khoá và cây vắng sau lượt, nhưng mọi đường đều dọn cả hai**
  Người dùng thấy gì: Một bài kiểm có hai câu khẳng định «không lấy khoá, không dựng cây làm việc» mà dù có lấy rồi dọn thì vẫn đúng. Câu khẳng định thật sự phân biệt được nằm ở lý do dừng và đã có, nên chỉ là bài kiểm trông chắc hơn thực tế.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
