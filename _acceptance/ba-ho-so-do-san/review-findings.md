# Review findings: ba-ho-so-do-san (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **bang.mjs: khối «Sau» đọc cây đang xét, nhưng khối Diff và nhãn «ở HEAD» vẫn neo HEAD/index**
  Người dùng thấy gì: Bảng so sánh trước/sau dùng để hội đồng duyệt có thể ghép số liệu từ hai nguồn khác nhau nếu ai đó sinh nó khi còn sửa dở chưa commit. Bảng hiện nộp vẫn đúng vì sinh trên bản sạch.
  file: `_acceptance/ba-ho-so-do-san/rang/bang.mjs`
  severity: low
  Đề xuất: known-limits

- **bang.mjs: khối «Sau» nay đọc cây đang xét, nhưng khối «Diff» và «Vật của mục» vẫn đọc HEAD/index, nên một bảng trộn hai nguồn**
  Người dùng thấy gì: Nếu bảng trước/sau được sinh khi còn thay đổi chưa commit thì hai phần của cùng một dòng có thể nói hai điều khác nhau, làm hội đồng khó đọc. Bảng đang nộp không bị ảnh hưởng.
  file: `_acceptance/ba-ho-so-do-san/rang/bang.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm-tính-một-mình, ghim thông điệp không phân biệt): ghim của đột biến bắt buộc ld:E5 là chuỗi con của chính đầu ra lúc đạt**
  Người dùng thấy gì: Kiểm tra rằng việc bỏ bước build khỏi hook đẩy mã bị bắt chỉ dựa vào kết quả đạt hay không, còn câu thông báo đối chiếu thì giống hệt cả khi đạt. Hook đẩy mã vẫn bị bắt khi mất bước build, nhưng đối chiếu thông báo không thêm được độ tin cậy.
  file: `_acceptance/ba-ho-so-do-san/danh-sach.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình, không đối chứng dương): ghim «ENOENT» của soan-okr-song-lai:E12 là dấu vết crash của Node, không phải phán quyết của design-gate**
  Người dùng thấy gì: Ô kiểm thiết kế của màn Soạn OKR chỉ chứng minh được rằng nó báo lỗi khi tệp biến mất, chưa chứng minh nó từng bắt được lỗi thiết kế thật. Nó vẫn đỏ khi tệp bị xoá, nhưng độ tin cậy về chất lượng thiết kế còn thấp.
  file: `_acceptance/ba-ho-so-do-san/danh-sach.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo bản khác cây đang kiểm): bang.mjs chỉ chuyển khối «Sau» sang cây làm việc, khối Diff và «Vật ở HEAD» vẫn đọc commit HEAD và index**
  Người dùng thấy gì: Bảng trước/sau vẫn có thể lấy một phần từ bản đã commit và một phần từ bản đang sửa, nên hội đồng có thể thấy hai khối mâu thuẫn nếu bảng sinh lúc còn sửa dở. Với bảng hiện nộp thì không có vấn đề.
  file: `_acceptance/ba-ho-so-do-san/rang/bang.mjs`
  severity: low
  Đề xuất: known-limits

- **chieu-do không bắt buộc ld:E5 phải mang đột biến «gỡ build khỏi pre-push» mà E8 gọi là bắt buộc (r2 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm hiện vẫn bắt đúng lỗi quan trọng nhất của kiểm tra trước khi đẩy mã. Nhưng nếu sau này ai đó đổi danh sách phép thử, không có gì buộc phép thử quan trọng ấy phải còn.
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **paths của E8 thiếu hai tệp thật mà chieu-do đọc ở HEAD, nên đổi chúng không làm bằng chứng E8 hết hạn (r2)**
  Người dùng thấy gì: Nếu hai tệp liên quan bị sửa sau này, kết quả kiểm cũ vẫn được coi là còn hiệu lực dù có thể đã sai. Người dùng có thể tin một kết quả xanh đã cũ.
  file: `_acceptance/ba-ho-so-do-san/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Căn cứ «luật F10» của ld:E8 trỏ dòng tiêu đề tính năng của hồ sơ khác, không phải luật hay quyết định đã ký (r2 · tệp đã đổi)**
  Người dùng thấy gì: Lý do hạ một phép kiểm dựa vào một dòng tiêu đề không nói rõ thành luật. Người duyệt có thể thấy lý do này chưa đủ thuyết phục và hỏi lại.
  file: `_acceptance/ba-ho-so-do-san/danh-sach.json`
  severity: low
  Đề xuất: known-limits

- **Hợp đồng và thẻ nói 7 hồ sơ hoàn lại mang 28 eval đỏ, danh sách thật có 29 (r2)**
  Người dùng thấy gì: Thẻ duyệt ghi 28 phép kiểm đỏ còn thực tế là 29. Người ký có thể đọc lệch quy mô phần việc để lại, nhưng không đổi kết quả công việc.
  file: `_acceptance/ba-ho-so-do-san/contract.md`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên một luật bắt buộc nhưng răng không có ma trận viết trước để đối chiếu): E8 nói đột biến pre-push của ld là «bắt buộc», nhưng chieu-do.mjs không đòi nó (r2 · tệp đã đổi)**
  Người dùng thấy gì: Phép thử quan trọng của kiểm tra trước khi đẩy mã chỉ được giữ bằng dữ liệu do chính người viết khai. Nếu họ đổi hoặc bỏ nó, không có gì cảnh báo.
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs`
  severity: low
  Đề xuất: known-limits

- **soan-okr-song-lai E12 đổi cmd sang tệp kế nhiệm nhưng expected vẫn nêu man-soan.tsx và một chiều đỏ gray-on-color mà chính dòng danh sách thừa nhận là không có (r1)**
  Người dùng thấy gì: Mô tả kỳ vọng của một ô kiểm tra màn soạn OKR vẫn nhắc tệp cũ và một ca lỗi không còn tồn tại. Ô vẫn chạy và vẫn bắt được lỗi mất tệp, nhưng người đọc hồ sơ có thể hiểu sai nó đang kiểm gì.
  file: `_acceptance/soan-okr-song-lai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Cả tám dòng tro-duong-moi đều có moi: null: đường bị xoá chứ không trỏ sang đường mới; soan-okr-song-lai E3 mất theo dõi tệp kế nhiệm mà bài DOM đang dùng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một số ô kiểm tra màn soạn OKR không còn theo dõi các tệp màn soạn mới. Khi màn đó đổi, bằng chứng cũ có thể không bị coi là hết hạn và vẫn hiện là còn đạt.
  file: `_acceptance/ba-ho-so-do-san/danh-sach.json`
  severity: medium
  Đề xuất: known-limits

- **mucChetCua nuốt lỗi parse evals.yaml thành mảng rỗng, trái luật «Parse at the boundary» của AGENTS.md (r1)**
  Người dùng thấy gì: Nếu một hồ sơ nghiệm thu bị hỏng định dạng, công cụ kiểm tra có thể lặng lẽ bỏ qua hồ sơ đó thay vì báo lỗi. Hiện chưa có hồ sơ nào bị vậy.
  file: `_acceptance/ba-ho-so-do-san/rang/chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hợp đồng đã ký của khoa-con-bat-xa-tran (AC-4) và lenh-dung-do-khong-ai-thay vẫn giữ lời hứa cũ trong khi eval đã được nới (r1)**
  Người dùng thấy gì: Hợp đồng đã ký của hai hồ sơ cũ vẫn ghi lời hứa chặt hơn so với những gì bài kiểm tra hiện đo. Người đọc hợp đồng sẽ thấy lời hứa mà thực tế không còn được kiểm.
  file: `_acceptance/khoa-con-bat-xa-tran/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hằng maxBuffer viết lặp lại ngay tại chỗ dùng ở nhiều răng thay vì đặt ở mô-đun chung (r1 · tệp đã đổi)**
  Người dùng thấy gì: Vài con số giới hạn bộ nhớ được viết lặp ở nhiều tệp công cụ kiểm tra. Không ảnh hưởng người dùng; chỉ làm việc chỉnh sau này rườm hơn.
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **Đối chứng CONFIG_DOI_GIA_TRI của khai-du chạy trên một nhánh mã mà lượt thật không bao giờ dùng (r1)**
  Người dùng thấy gì: Phép kiểm xem ai có đổi giá trị cấu hình cũ hay không chưa được thử cho thấy nó thật sự bắt được lỗi. Nếu phép kiểm này hỏng, nó vẫn báo xanh.
  file: `_acceptance/ba-ho-so-do-san/rang/khai-du.mjs`
  severity: medium
  Đề xuất: known-limits

- **khai-du cho qua mọi thay đổi paths khi các dòng của eval không phải toàn tro-duong-moi (r1)**
  Người dùng thấy gì: Với một số ô kiểm tra, việc thêm hoặc bớt tệp theo dõi có thể lọt qua mà không bị đối chiếu. Bằng chứng cũ có thể không bị đánh dấu hết hạn đúng lúc.
  file: `_acceptance/ba-ho-so-do-san/rang/khai-du.mjs`
  severity: medium
  Đề xuất: known-limits

- **lap-danh-sach.mjs ghi lại danh-sach.json làm mất mục hoan_lai và năm dòng DO_KHI_GHIM (r1)**
  Người dùng thấy gì: Nếu ai chạy lại công cụ lập danh sách, nó sẽ xoá các khai báo đã nhập tay mà không báo. Lỗi chỉ lộ ra về sau khi một phép kiểm đỏ.
  file: `_acceptance/ba-ho-so-do-san/rang/lap-danh-sach.mjs`
  severity: low
  Đề xuất: known-limits

- **mucChetCua nuốt lỗi parse evals.yaml và trả về «không mục chết» (r1)**
  Người dùng thấy gì: Một hồ sơ nghiệm thu đọc không được có thể bị coi như không có gì đỏ, nên phép kiểm xanh sai. Hiện chưa có hồ sơ nào bị vậy.
  file: `_acceptance/ba-ho-so-do-san/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): «thật đạt» của ld:E8 chạy trên chuỗi JSON viết tay, không trên đầu ra thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một phép kiểm chạy trên dữ liệu viết tay giống đầu ra thật chứ không phải đầu ra thật. Lỗi ở khâu sinh dữ liệu thật có thể không bị phát hiện.
  file: `_acceptance/ba-ho-so-do-san/danh-sach.json`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng không chạm assertion thật): tự kiểm CONFIG_DOI_GIA_TRI đánh vào nhánh kiemKhai, trong khi lượt thật chỉ chạy vòng loiConfig (r1)**
  Người dùng thấy gì: Phép kiểm chống đổi giá trị cấu hình cũ chưa có thử nghiệm chứng minh nó đỏ khi cần. Nếu nó hỏng, người ta vẫn thấy kết quả xanh.
  file: `_acceptance/ba-ho-so-do-san/rang/khai-du.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): đối chứng GHIM_CU của ghim-xanh giả quan hệ tổ tiên bằng hàm stub, không đặt sha repin về mốc nền như đã hứa (r1)**
  Người dùng thấy gì: Phép kiểm phát hiện ghim bằng chứng cũ được thử bằng dữ liệu giả, chưa thử trên lịch sử git thật. Một lỗi ở đó có thể tắt phép kiểm mà không ai biết.
  file: `_acceptance/ba-ho-so-do-san/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo cây khác cây đang kiểm): răng ld E2/E3 sau sửa mặc định đo cây archive của sha cố định eeb6ea30, không đo cây đang xét (r1)**
  Người dùng thấy gì: Hai ô kiểm tra đo một ảnh chụp cố định của mã cũ chứ không đo cây hiện tại, nên chúng không đỏ khi mã hiện tại đổi theo hướng xấu. Điều này đã được ghi rõ trong hồ sơ.
  file: `_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
