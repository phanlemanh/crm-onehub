## Trong hợp đồng

- **AC-8/E8 vẫn hứa răng ld bắt đột biến trên ci.yml qua dieu-ci.mjs, nhưng điều 2 đã bị bỏ và chieu-do không đo ci.yml**
  AC: AC-8
  file: `_acceptance/ba-ho-so-do-san/contract.md:41`
  severity: high
  source: conventions
  detail: AC-8 viết: «với ld_ba_noi_deu_chay, bỏ bước bun run build khỏi ci.yml hay gắn if: lên bước đó thì răng bắt». E8 (evals.yaml:78) cũng ghi «mô-đun dieu-ci.mjs mà ba-noi-deu-chay.mjs cũng nhập» và «Với ld: đột biến bắt buộc là bỏ bước chạy bun run build khỏi ci.yml, và một đột biến thứ hai gắn if: lên bước đó». paths của E8 vẫn có .github/workflows/ci.yml. Mã thật thì khác. Quyết định d-20261013T024336Z-21 (P7-7) bỏ hẳn điều 2. ba-noi-deu-chay.mjs không còn đọc ci.yml. Không có tệp dieu-ci.mjs nào; mô-đun tách ra là dieu-prepush.mjs. Dòng sua-rang của lenh-dung-do-khong-ai-thay E5 trong danh-sach.json chỉ khai một đột biến trên .githooks/pre-push (bo-build-khoi-pre-push). chieu-do.mjs cũng không cưỡng chế hai đột biến bắt buộc trên ci.yml. Hệ quả: E8 xanh mà lời hứa nêu đích danh trong AC-8 không được đo. Hợp đồng và evals đã được sửa lại sau quyết định đó (dd20c0236, 14:03 ngày 13/10) mà không cập nhật chỗ này. Theo luật kho «eval đo đúng lời hứa», AC-8 và E8 cần viết lại cho khớp quyết định P7-7, hoặc răng phải đo lại ci.yml.

- **AC-8/E8 hứa ld bắt lỗi khi gỡ bước build khỏi ci.yml hay gắn if: lên bước đó, nhưng không có răng nào làm việc này; chieu-do vẫn thoát 0**
  AC: AC-8
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs:131`
  severity: high
  source: bugs
  detail: Theo contract AC-8, E8 expected («Với ld: đột biến bắt buộc là bỏ bước chạy bun run build khỏi ci.yml, và một đột biến thứ hai gắn if: lên bước đó», qua mô-đun dieu-ci.mjs) và thẻ card-plain.json («với ci.yml, gỡ bước build là răng đỏ»), răng ld phải đỏ trong hai ca đó. Thực tế đã khác. Ở S3, quyết định d-20261013T024336Z-21 bỏ hẳn điều 2 của ba-noi-deu-chay.mjs. Kho không có dieu-ci.mjs, và .github/workflows/ci.yml không còn bước `bun run build` nào (chỉ còn check-types, lint, lint:slop, test). Dòng sua-rang của lenh-dung-do-khong-ai-thay:E5 trong danh-sach.json chỉ khai một đột biến trên .githooks/pre-push (bo-build-khoi-pre-push). chieu-do.mjs không kiểm đột biến bắt buộc nào của ld, nên E8 thoát 0 trong khi lời hứa của AC-8 không được đo và cũng không còn đúng. Thứ phải sửa là hợp đồng, evals và thẻ, chứ không chỉ lời của răng.

- **chieu-do coi mọi mã khác 0 của bản đột biến là «đột biến bắt» khi dòng không khai thong_diep_may**
  AC: AC-8
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs:143`
  severity: medium
  source: bugs
  detail: `batDung = !kq.dotDat && (!db.thong_diep_may || kq.chuDot.includes(db.thong_diep_may))`: không khai thong_diep_may thì không kiểm thông điệp. Chỉ hai đột biến của khoa-con-bat-xa-tran:E4 có thong_diep_may; sáu đột biến còn lại (soan-okr-song-lai:E12, lenh-dung-do E2/E3/E5/E8, khoa-con-bat E3/E6) qua chỉ cần bản đột biến không đạt, vì bất cứ lý do gì. Ví dụ ở kiểu lenh-goc (ld:E2), răng chạy với `--goc` mà thoát 2 vì hạ tầng (lệch NEO, tar hỏng, typescript không nạp được) vẫn được in «that dat, dot bien bat». Ở kiểu design-gate với xoa_tep, design-gate đỏ vì không thấy tệp, với bất kỳ thông điệp nào. E8 expected và AC-8 đòi «không đạt với đúng thông điệp ghim».

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): E8 hứa đột biến bắt buộc cho ld trên ci.yml, nhưng không phép đo nào áp hay đòi đột biến đó**
  AC: AC-8
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs:131`
  severity: high
  source: measurement
  detail: evals.yaml E8 (và AC-8) viết: «Với ld: đột biến bắt buộc là bỏ bước chạy bun run build khỏi ci.yml, và một đột biến thứ hai gắn if: lên bước đó», kèm «mô-đun dieu-ci.mjs mà ba-noi-deu-chay.mjs cũng nhập». E8 cũng khai `.github/workflows/ci.yml` trong paths. Thực tế: (1) Không có tệp `dieu-ci.mjs`. `ba-noi-deu-chay.mjs` chỉ nhập `dieu-prepush.mjs`, và sau khi bỏ điều 2 thì không răng nào còn đọc ci.yml. (2) Dòng `lenh-dung-do-khong-ai-thay:E5` trong danh-sach.json chỉ khai một đột biến, `bo-build-khoi-pre-push`, đánh vào `.githooks/pre-push`. (3) chieu-do.mjs chỉ duyệt những `r.dot_bien` mà dòng tự khai (dòng 131 trở đi). Nó không đặt trước ma trận đột biến bắt buộc cho ld, nên không thể bắt được việc thiếu hai đột biến ci.yml. Kết quả: E8 xanh dù lời hứa «bỏ build khỏi ci.yml / gắn if: thì răng bắt» không được đo. Thật ra không răng nào bắt ca đó cả.

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): chieu-do coi mọi lần «không đạt» là bắt đúng khi dòng không khai thong_diep_may**
  AC: AC-8
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs:146`
  severity: high
  source: measurement
  detail: Dòng `const batDung = !kq.dotDat && (!db.thong_diep_may || kq.chuDot.includes(db.thong_diep_may));`: thiếu `thong_diep_may` thì chỉ cần bản đột biến không đạt là đủ. Trường `thong_diep` chỉ được in ra, không đem so. Trong danh-sach.json, chỉ hai đột biến của khoa-con-bat-xa-tran:E4 có `thong_diep_may`. Sáu đột biến còn lại không ghim thông điệp: soan-okr-song-lai:E12 tep-dich-vang, ld:E5 bo-build-khoi-pre-push, khoa:E3/E6, ld:E2 bo-suspense-o-layout, ld:E3, ld:E8. Như vậy bản đột biến hỏng vì bất kỳ lý do nào cũng được tính là «đột biến bắt». Ví dụ ld:E2 chạy `node khong-doc-ngoai-suspense.mjs --goc` và nhận mọi mã khác 0, kể cả mã 2 vì lỗi đọc. Trong khi đó E8/AC-8 hứa «không đạt với đúng thông điệp ghim».

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **soan-okr-song-lai E12 đổi cmd sang tệp kế nhiệm nhưng expected vẫn nêu man-soan.tsx và một chiều đỏ gray-on-color mà chính dòng danh sách thừa nhận là không có**
  Người dùng thấy gì: Mô tả kỳ vọng của một ô kiểm tra màn soạn OKR vẫn nhắc tệp cũ và một ca lỗi không còn tồn tại. Ô vẫn chạy và vẫn bắt được lỗi mất tệp, nhưng người đọc hồ sơ có thể hiểu sai nó đang kiểm gì.
  file: `_acceptance/soan-okr-song-lai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Cả tám dòng tro-duong-moi đều có moi: null: đường bị xoá chứ không trỏ sang đường mới; soan-okr-song-lai E3 mất theo dõi tệp kế nhiệm mà bài DOM đang dùng**
  Người dùng thấy gì: Một số ô kiểm tra màn soạn OKR không còn theo dõi các tệp màn soạn mới. Khi màn đó đổi, bằng chứng cũ có thể không bị coi là hết hạn và vẫn hiện là còn đạt.
  file: `_acceptance/ba-ho-so-do-san/danh-sach.json`
  severity: medium
  Đề xuất: known-limits

- **mucChetCua nuốt lỗi parse evals.yaml thành mảng rỗng, trái luật «Parse at the boundary» của AGENTS.md**
  Người dùng thấy gì: Nếu một hồ sơ nghiệm thu bị hỏng định dạng, công cụ kiểm tra có thể lặng lẽ bỏ qua hồ sơ đó thay vì báo lỗi. Hiện chưa có hồ sơ nào bị vậy.
  file: `_acceptance/ba-ho-so-do-san/rang/chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hợp đồng đã ký của khoa-con-bat-xa-tran (AC-4) và lenh-dung-do-khong-ai-thay vẫn giữ lời hứa cũ trong khi eval đã được nới**
  Người dùng thấy gì: Hợp đồng đã ký của hai hồ sơ cũ vẫn ghi lời hứa chặt hơn so với những gì bài kiểm tra hiện đo. Người đọc hợp đồng sẽ thấy lời hứa mà thực tế không còn được kiểm.
  file: `_acceptance/khoa-con-bat-xa-tran/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hằng maxBuffer viết lặp lại ngay tại chỗ dùng ở nhiều răng thay vì đặt ở mô-đun chung**
  Người dùng thấy gì: Vài con số giới hạn bộ nhớ được viết lặp ở nhiều tệp công cụ kiểm tra. Không ảnh hưởng người dùng; chỉ làm việc chỉnh sau này rườm hơn.
  file: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **Đối chứng CONFIG_DOI_GIA_TRI của khai-du chạy trên một nhánh mã mà lượt thật không bao giờ dùng**
  Người dùng thấy gì: Phép kiểm xem ai có đổi giá trị cấu hình cũ hay không chưa được thử cho thấy nó thật sự bắt được lỗi. Nếu phép kiểm này hỏng, nó vẫn báo xanh.
  file: `_acceptance/ba-ho-so-do-san/rang/khai-du.mjs`
  severity: medium
  Đề xuất: known-limits

- **khai-du cho qua mọi thay đổi paths khi các dòng của eval không phải toàn tro-duong-moi**
  Người dùng thấy gì: Với một số ô kiểm tra, việc thêm hoặc bớt tệp theo dõi có thể lọt qua mà không bị đối chiếu. Bằng chứng cũ có thể không bị đánh dấu hết hạn đúng lúc.
  file: `_acceptance/ba-ho-so-do-san/rang/khai-du.mjs`
  severity: medium
  Đề xuất: known-limits

- **lap-danh-sach.mjs ghi lại danh-sach.json làm mất mục hoan_lai và năm dòng DO_KHI_GHIM**
  Người dùng thấy gì: Nếu ai chạy lại công cụ lập danh sách, nó sẽ xoá các khai báo đã nhập tay mà không báo. Lỗi chỉ lộ ra về sau khi một phép kiểm đỏ.
  file: `_acceptance/ba-ho-so-do-san/rang/lap-danh-sach.mjs`
  severity: low
  Đề xuất: known-limits

- **mucChetCua nuốt lỗi parse evals.yaml và trả về «không mục chết»**
  Người dùng thấy gì: Một hồ sơ nghiệm thu đọc không được có thể bị coi như không có gì đỏ, nên phép kiểm xanh sai. Hiện chưa có hồ sơ nào bị vậy.
  file: `_acceptance/ba-ho-so-do-san/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): «thật đạt» của ld:E8 chạy trên chuỗi JSON viết tay, không trên đầu ra thật**
  Người dùng thấy gì: Một phép kiểm chạy trên dữ liệu viết tay giống đầu ra thật chứ không phải đầu ra thật. Lỗi ở khâu sinh dữ liệu thật có thể không bị phát hiện.
  file: `_acceptance/ba-ho-so-do-san/danh-sach.json`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng không chạm assertion thật): tự kiểm CONFIG_DOI_GIA_TRI đánh vào nhánh kiemKhai, trong khi lượt thật chỉ chạy vòng loiConfig**
  Người dùng thấy gì: Phép kiểm chống đổi giá trị cấu hình cũ chưa có thử nghiệm chứng minh nó đỏ khi cần. Nếu nó hỏng, người ta vẫn thấy kết quả xanh.
  file: `_acceptance/ba-ho-so-do-san/rang/khai-du.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): đối chứng GHIM_CU của ghim-xanh giả quan hệ tổ tiên bằng hàm stub, không đặt sha repin về mốc nền như đã hứa**
  Người dùng thấy gì: Phép kiểm phát hiện ghim bằng chứng cũ được thử bằng dữ liệu giả, chưa thử trên lịch sử git thật. Một lỗi ở đó có thể tắt phép kiểm mà không ai biết.
  file: `_acceptance/ba-ho-so-do-san/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo cây khác cây đang kiểm): răng ld E2/E3 sau sửa mặc định đo cây archive của sha cố định eeb6ea30, không đo cây đang xét**
  Người dùng thấy gì: Hai ô kiểm tra đo một ảnh chụp cố định của mã cũ chứ không đo cây hiện tại, nên chúng không đỏ khi mã hiện tại đổi theo hướng xấu. Điều này đã được ghi rõ trong hồ sơ.
  file: `_acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
