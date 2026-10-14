# Review findings: ba-ho-so-do-san (round 2)

## Trong hợp đồng

- **AC-8/E8 vừa viết lại vẫn hứa «không đạt với đúng thông điệp ghim», nhưng 7/9 đột biến không ghim thông điệp, kể cả đột biến bắt buộc của ld**
  AC: AC-8
  file: `_acceptance/ba-ho-so-do-san/evals.yaml:78`
  severity: high
  source: conventions
  detail: Vòng này AC-8 (contract.md:40) được ký lại và expected của E8 (evals.yaml:78) được viết lại. Cả hai vẫn hứa bản đột biến «phải không đạt với đúng thông điệp ghim». E8 còn gọi tên đột biến bắt buộc của ld là gỡ build khỏi .githooks/pre-push. Trong danh-sach.json, chỉ hai đột biến của khoa-con-bat-xa-tran:E4 có `thong_diep_may`. Bảy đột biến còn lại thì không có: soan-okr-song-lai:E12 tep-dich-vang, lenh-dung-do-khong-ai-thay:E5 bo-build-khoi-pre-push (chính đột biến bắt buộc), khoa:E3, khoa:E6, ld:E2, ld:E3, ld:E8. Răng chieu-do.mjs:143 không đổi: `const batDung = !kq.dotDat && (!db.thong_diep_may || kq.chuDot.includes(db.thong_diep_may));`. Dòng nào không khai thong_diep_may thì bản đột biến không đạt vì bất kỳ lý do nào cũng được tính là «đột biến bắt». Ví dụ: buildTrongPrePush ném lỗi, hay răng lenh-goc thoát 2 vì hạ tầng. Round 1 đã nêu phát hiện này trong hợp đồng. Quyết định d-20261014T032716Z-24 chỉ sửa phần ci.yml, nên lời hứa đã ký lại vẫn không được đo. Hướng sửa: ghim thong_diep_may cho mọi đột biến (ít nhất là ld:E5), hoặc viết lại AC-8/E8 cho khớp.
  Lý do vào hợp đồng: AC-8 hứa bản sao đột biến không đạt với đúng thông điệp ghim; 7/9 đột biến không ghim thông điệp nên lời hứa này không được đo.

- **bang-truoc-sau.md không được sinh lại sau khi sửa expected của soan-okr-song-lai E12: mục «Sau (HEAD)» vẫn in lời hứa cũ (man-soan.tsx, gray-on-color)**
  AC: AC-5
  file: `_acceptance/ba-ho-so-do-san/bang-truoc-sau.md:160`
  severity: medium
  source: bugs
  detail: Commit ce0a9d7c0 sửa trong cùng một lần hai thứ: expected E12 của _acceptance/soan-okr-song-lai/evals.yaml (blob ở HEAD là 91182a8ea, đã bỏ man-soan.tsx và lời hứa gray-on-color), và bang-truoc-sau.md. Nhưng bảng được sinh lúc evals.yaml còn bản cũ. Ở dòng 151–160, khối «Sau (HEAD)» vẫn ghi `expected: "exit 0; sàn thiết kế chế độ tĩnh trên nut-soan.tsx, man-soan.tsx, hoi-thoai-soan.tsx ... Chiều đỏ ghim: ... hit 'gray-on-color'."`. Khối «Diff» của evals.yaml thì in `index 753c69ab0..deacb1e87` chứ không tới 91182a8ea. Với ô này, «Sau (HEAD)» đang in sai HEAD. AC-5 gọi bảng là «máy sinh», và E5 dùng chính tệp này làm input. Panel round 1 (evidence-report.md:112) đòi đúng việc «expected của E12 phải bỏ lời hứa chiều đỏ gray-on-color», mà bảng vẫn cho hội đồng xem lời hứa cũ. Vòng phán xét sau vì thế sẽ thấy lại đúng lỗi đã sửa. Không bước nào kiểm bảng còn khớp HEAD: bang.mjs chỉ được chạy tay, không eval nào so lại. Cách sửa: chạy lại `bun _acceptance/ba-ho-so-do-san/rang/bang.mjs` ở tip rồi commit.
  Lý do vào hợp đồng: AC-5 dùng bang-truoc-sau.md làm đầu vào máy sinh với dòng trước/sau; bảng in sai HEAD khiến hội đồng xét chiều đỏ không có thật.

- **Lỗi trong hợp đồng của round 1 vẫn chưa sửa: chieu-do tính mọi lần bản đột biến «không đạt» là bắt đúng khi dòng không khai thong_diep_may, trong khi AC-8/E8 vừa viết lại vẫn hứa «đúng thông điệp ghim»**
  AC: AC-8
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs:143`
  severity: high
  source: bugs
  detail: Round 1 REJECT có phát hiện high trong hợp đồng ở AC-8 (Hình dạng 4): `const batDung = !kq.dotDat && (!db.thong_diep_may || kq.chuDot.includes(db.thong_diep_may));`. Quyết định d-20261014T032716Z-24 chỉ sửa phần ci.yml/dieu-ci. chieu-do.mjs không đổi kể từ 2f8798fd7, và danh-sach.json vẫn chỉ có 2 lần `thong_diep_may`, cả hai ở khoa-con-bat-xa-tran:E4. Sáu đột biến còn lại (soan E12 tep-dich-vang, ld E2/E3/E5/E8, khoa E3/E6) vẫn được in «that dat, dot bien bat» với bất kỳ mã khác 0 nào. Ví dụ với kiểu lenh-goc (ld:E2), răng thoát 2 vì `MA 2: ... khong thay ham xuat mac dinh`, lệch dân số, hay tar hỏng thì vẫn tính là bắt; chính bang-truoc-sau.md:1116 cho thấy răng này thoát 2 vì lý do hạ tầng trên cây HEAD. Với design-gate xoa_tep, mọi đỏ đều được tính. Vòng này vừa viết lại AC-8 («bản sao không đạt với đúng thông điệp ghim») và expected của E8 («trên bản đột biến → phải không đạt với đúng thông điệp ghim»), nên lời hứa mới vẫn không được đo, và E8 xanh trên một lời hứa chưa giữ. Cách sửa: đòi `thong_diep_may` ở mọi dot_bien (thiếu thì HONG), hoặc so `thong_diep` với chuDot.
  Lý do vào hợp đồng: Răng tính mọi lần không đạt là bắt đúng, nên lời hứa «đúng thông điệp ghim» của AC-8 không được giữ.

- **Hình dạng 6 (đo cây khác cây đang kiểm): bang-truoc-sau.md, đầu vào của hội đồng E5, lấy khối «Sau (HEAD)» từ commit HEAD cũ, nên hiện expected E12 đã bị thay**
  AC: AC-5
  file: `_acceptance/ba-ho-so-do-san/bang-truoc-sau.md:160`
  severity: medium
  source: measurement
  detail: bang.mjs dựng khối «Sau (HEAD)» bằng `khoiEval(docTai("HEAD", tep), id)`, tức `git show HEAD:<tệp>`. Nó đọc commit đã có, không đọc cây đang sửa. Bảng được sinh lại trong cùng commit ce0a9d7c0 với lần sửa `_acceptance/soan-okr-song-lai/evals.yaml`, nên khối «Sau (HEAD)» của soan-okr-song-lai:E12 (dòng 160–167) vẫn là expected CŨ: «nut-soan.tsx, man-soan.tsx, hoi-thoai-soan.tsx … Chiều đỏ ghim: … hit 'gray-on-color'». Ở HEAD thật, expected đã là «… trang-soan.tsx, khung-soan.tsx … chiều đỏ duy nhất còn lại của ô là tệp đích vắng; lời hứa chiều đỏ «gray-on-color» cũ không còn». Từ đó tới HEAD không commit nào sinh lại bảng (git log ce0a9d7c0..HEAD không chạm bang-truoc-sau.md). AC-5/E5 hỏi đúng câu «răng sau sửa còn chiều đỏ không», mà bảng lại cho hội đồng thấy một chiều đỏ gray-on-color không có thật ở cây đang kiểm. Không phép đo nào kiểm bảng có khớp HEAD hay không.
  Lý do vào hợp đồng: Cùng gốc với phát hiện bảng không sinh lại ở trên: bảng máy sinh không khớp HEAD nên đầu vào của phán xét AC-5 sai.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chieu-do không bắt buộc ld:E5 phải mang đột biến «gỡ build khỏi pre-push» mà E8 gọi là bắt buộc**
  Người dùng thấy gì: Phép kiểm hiện vẫn bắt đúng lỗi quan trọng nhất của kiểm tra trước khi đẩy mã. Nhưng nếu sau này ai đó đổi danh sách phép thử, không có gì buộc phép thử quan trọng ấy phải còn.
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **paths của E8 thiếu hai tệp thật mà chieu-do đọc ở HEAD, nên đổi chúng không làm bằng chứng E8 hết hạn**
  Người dùng thấy gì: Nếu hai tệp liên quan bị sửa sau này, kết quả kiểm cũ vẫn được coi là còn hiệu lực dù có thể đã sai. Người dùng có thể tin một kết quả xanh đã cũ.
  file: `_acceptance/ba-ho-so-do-san/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Căn cứ «luật F10» của ld:E8 trỏ dòng tiêu đề tính năng của hồ sơ khác, không phải luật hay quyết định đã ký**
  Người dùng thấy gì: Lý do hạ một phép kiểm dựa vào một dòng tiêu đề không nói rõ thành luật. Người duyệt có thể thấy lý do này chưa đủ thuyết phục và hỏi lại.
  file: `_acceptance/ba-ho-so-do-san/danh-sach.json`
  severity: low
  Đề xuất: known-limits

- **Hợp đồng và thẻ nói 7 hồ sơ hoàn lại mang 28 eval đỏ, danh sách thật có 29**
  Người dùng thấy gì: Thẻ duyệt ghi 28 phép kiểm đỏ còn thực tế là 29. Người ký có thể đọc lệch quy mô phần việc để lại, nhưng không đổi kết quả công việc.
  file: `_acceptance/ba-ho-so-do-san/contract.md`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên một luật bắt buộc nhưng răng không có ma trận viết trước để đối chiếu): E8 nói đột biến pre-push của ld là «bắt buộc», nhưng chieu-do.mjs không đòi nó**
  Người dùng thấy gì: Phép thử quan trọng của kiểm tra trước khi đẩy mã chỉ được giữ bằng dữ liệu do chính người viết khai. Nếu họ đổi hoặc bỏ nó, không có gì cảnh báo.
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs`
  severity: low
  Đề xuất: known-limits

- **soan-okr-song-lai E12 đổi cmd sang tệp kế nhiệm nhưng expected vẫn nêu man-soan.tsx và một chiều đỏ gray-on-color mà chính dòng danh sách thừa nhận là không có (r1 · tệp đã đổi)**
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

- **Hằng maxBuffer viết lặp lại ngay tại chỗ dùng ở nhiều răng thay vì đặt ở mô-đun chung (r1)**
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
