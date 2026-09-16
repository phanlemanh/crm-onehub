## Trong hợp đồng

### so-dang-ky.mjs còn khoá slug cũ "duong-proto" — răng chết ở sàn cứng (thoát 2), phép đo mồ côi không còn chạy
file: `_acceptance/duong-proto-cho-design-pass/rang/so-dang-ky.mjs:13`
severity: high
AC: AC-8
Commit dd6c062 đổi slug trong `apps/app/app/proto/catalog.ts` từ `"duong-proto"` sang `"duong-proto-cho-design-pass"` (vá lỗi 404 của design-pass), nhưng `so-dang-ky.mjs` vẫn dò slug cũ viết cứng:

    const mau = PROTO_CATALOG.find((m) => m.slug === "duong-proto");
    if (mau === undefined) thoat(2, "san cung: khong thay muc duong-proto");

Đã chạy trên HEAD: `bun _acceptance/duong-proto-cho-design-pass/rang/so-dang-ky.mjs` → in `rang: san cung: khong thay muc duong-proto`, EXIT=2. Nghĩa là toàn bộ phần thân răng (slug/tên/state không rỗng, state id duy nhất, và vế chính — không mục mồ côi giữa `catalog.ts` và `registry.ts` ở CẢ HAI CHIỀU) không còn được thực thi dòng nào. `_acceptance/config.yaml:357` (`dp_so_dang_ky`) vẫn trỏ vào nó, và `evidence-report.md` (dòng 106-109, round 2) còn ghi `OK so-dang-ky: 1 muc, 1 component` — bằng chứng đã ký giờ là bằng chứng cũ, mô tả một lượt chạy không lặp lại được.

Mọi răng khác trong cùng thư mục đã suy slug từ vị trí hồ sơ (`SLUG_HO_SO` trong `may-chu.mjs`) đúng như `docs/proto.md` bắt ("Slug của bản mẫu PHẢI bằng slug hồ sơ"); riêng file này không import `SLUG_HO_SO` mà viết tay tên — đúng lớp lỗi "bảng khai và mã nguồn trôi nhau" mà `khai-bao.mjs` dựng ra để chặn ở chỗ khác.

Rationale: Phép đo được khai cho AC-8 (dp_so_dang_ky) thoát ngay ở sàn cứng nên không một assert nào của AC-8 (khai sinh proto, đối chiếu catalog↔registry) còn chạy được. Fix đề xuất: thay literal bằng `SLUG_HO_SO` từ `./may-chu.mjs`, đúng như các răng anh em đã làm.

### Một bit cho sáu lời hứa: sáu eval khai chung đúng một lệnh `dp_duong_song`
file: `_acceptance/config.yaml:353`
severity: high
AC: AC-1, AC-2, AC-4, AC-5, AC-6, AC-7
`dp_duong_song: "bun _acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs tat-ca"` là lệnh DUY NHẤT được khai cho đường proto, và evals.yaml cho E1 (dòng 9), E2 (dòng 30), E4 (dòng 75), E5 (dòng 102), E6 (dòng 117), E7 (dòng 131) đều trỏ `cmd: config:executors.script.dp_duong_song`. Nhánh `tat-ca` (duong-proto.mjs:55-73) chạy cả sáu chặn rồi trả DUY NHẤT một mã thoát. Vì máy chấm dedupe theo cmd, sáu tiêu chí AC-1/2/4/5/6/7 nhận CÙNG một bit: một chặn đỏ bất kỳ nhuộm đỏ cả sáu mà báo cáo không nói được lời hứa nào gãy. Bằng chứng: run-log.jsonl round 2 ghi các lệnh per-chan (`duong-proto.mjs co-bat`, `... co-tat`, `... muc-luc`, `... slug-la`, `... state-chon-duoc`, `... state-la`) và evidence-report.md round 2 ghi các verifier `config:executors.script.dp_co_bat`, `dp_co_tat`, `dp_state_chon_duoc`, `dp_state_la`, `dp_slug_la`, `dp_muc_luc` — SÁU khoá này KHÔNG tồn tại trong config.yaml (grep đếm 0). Nghĩa là hồ sơ bằng chứng round trước trỏ tới những verifier không khai được, còn lệnh đã khai thì không tái lập được verdict từng eval.

Rationale: Đây là cách AC-1/2/4/5/6/7 được nối dây chung trong config nghiệm thu — vượt quá một AC đơn lẻ nên không dịch danh được thành một AC duy nhất, nhưng ảnh hưởng trực tiếp tới độ phân giải của sáu tiêu chí trong hợp đồng nên xếp "Trong hợp đồng" thay vì "Ngoài hợp đồng".

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **PROTO_DIST_DIR — biến môi trường mới đọc ở next.config.ts nhưng không khai ở .env.example, docs/environment.md hay turbo.json**
  Người dùng thấy gì: Một biến cấu hình mới dùng để đổi nơi lưu bản dựng của ứng dụng chưa được ghi chú lại ở nơi liệt kê các biến cấu hình của dự án, nên người sau có thể không biết nó tồn tại hoặc dùng sai mà không được cảnh báo trước.
  file: `apps/app/next.config.ts`
  severity: medium
  Đề xuất: known-limits

- **proto/page.tsx đè style của CardContent bằng className và dùng nó ngoài Card — chỗ duy nhất trong cả kho**
  Người dùng thấy gì: Một dòng trên trang danh sách bản mẫu thử nghiệm đang chỉnh sửa giao diện riêng thay vì dùng đúng khối giao diện dùng chung của sản phẩm; nếu bản mẫu này về sau được dùng làm gốc cho màn hình thật, chỗ lệch này sẽ bị chép theo.
  file: `apps/app/app/proto/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **searchParams của trang proto khai kiểu hẹp hơn thật, không theo nếp ConnectionQuery của kho**
  Người dùng thấy gì: Một tham số trên đường dẫn của trang thử nghiệm được xử lý lỏng hơn quy ước ở các trang khác của sản phẩm; nếu ai đó gõ tham số bất thường trên URL, trang sẽ báo không tìm thấy thay vì hoạt động đúng, dù hiện tại chưa thấy hỏng gì rõ rệt.
  file: `apps/app/app/proto/[slug]/page.tsx`
  severity: low
  Đề xuất: known-limits

- **docs/proto.md sends the developer to a test that does not check what it claims — an orphaned proto passes every documented gate**
  Người dùng thấy gì: Tài liệu hướng dẫn thêm bản mẫu mới chỉ người đọc chạy một phép kiểm không thực sự phát hiện được lỗi quên khai báo; làm đúng từng bước hướng dẫn vẫn có thể tạo ra bản mẫu thiếu sót mà không có cảnh báo nào bật lên.
  file: `docs/proto.md`
  severity: medium
  Đề xuất: known-limits

- **The spawned Next server is only killed on the happy path — one thrown fetch orphans a `next dev` that locks apps/app for every later run**
  Người dùng thấy gì: Khi quá trình đo tự động gặp sự cố giữa chừng, một tiến trình máy chủ thử nghiệm có thể bị bỏ quên chạy nền, khiến lần đo tiếp theo bị một máy chủ 'ma' chặn lại và cần can thiệp tay mới chạy tiếp được — không ảnh hưởng người dùng sản phẩm, chỉ ảnh hưởng người đo.
  file: `_acceptance/duong-proto-cho-design-pass/rang/may-chu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Chỉ dẫn thay vì đầu ra: evals.yaml và các bước ui-check vẫn ghim URL /proto/duong-proto đã 404**
  Người dùng thấy gì: Một số hướng dẫn đo và lệnh chụp màn hình mẫu trong hồ sơ nghiệm thu vẫn còn ghi địa chỉ trang cũ đã đổi tên; làm đúng theo hướng dẫn đó có thể chụp nhầm một trang báo lỗi thay vì trang bản mẫu thật.
  file: `_acceptance/duong-proto-cho-design-pass/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: quét cấm nhập không có đối chứng dương cho chính bộ dò**
  Người dùng thấy gì: Phép kiểm tự động đảm bảo bản mẫu không gọi thẳng vào phần lõi máy chủ chỉ báo động khi phát hiện vi phạm nhưng chưa tự kiểm xem chính nó còn hoạt động đúng hay không; nếu cách viết import đổi khác trong tương lai, phép kiểm có thể báo yên bình dù không còn dò được gì thật sự.
  file: `_acceptance/duong-proto-cho-design-pass/rang/khong-goi-server.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có mục nào)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).