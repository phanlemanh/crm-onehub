## Trong hợp đồng

### 1. E21 no longer prints pre-merge output verbatim; a pre-merge run that dies partway now passes with no trace
- file:line: `_acceptance/cap-nhat-tuan-okr/rang/ho-so-bi-cham.mjs:330`
- severity: medium
- source: bugs
- AC: AC-11
- detail: Commit aec732a5, made after round 3, replaced the verbatim dump of `scripts/pre-merge-check.sh --base origin/onehub` with a single count line plus the `VIOLATION [...]` lines of other profiles. E21's `expected` in evals.yaml still says to run it and print it verbatim ("in nguyên văn"), so the script and its own eval now disagree. That is the same kind of mismatch that got E21 marked "sai hợp đồng" in round 3.

  The practical cost is that the run can die halfway and E21 still passes, now with nothing in the output to show it. The only check that the net actually ran is `raTruocGop.includes("[cap-nhat-tuan-okr]")`. Profiles are visited alphabetically, and this profile's own line comes early (line 10 of 100+ in today's output). If pre-merge-check.sh stops after that line — for example a `set -u` error in a later profile's block, a failure mode its own header comments describe — the profiles after it are never checked for staleness. E21 would then report "0 ho so hoa cu" and exit 0. The line that proves the run finished (`pre-merge-check: rules ran=4 declared-off=0 expected=4`) is not checked, and after this change it is not printed either, so neither the grader nor a human can see that the run was cut short.

  How to see it: pass `--pre-merge-tu` a file that holds only `VIOLATION [cap-nhat-tuan-okr]: verdict=BLOCKED (must be PASS to merge)` and no `rules ran=` summary line. E21 exits 0.

  Fix: require the `rules ran=N declared-off=0 expected=N` line (with N equal on both sides) before trusting the output, and restore the verbatim print, or change the eval's `expected`, so the two agree.
- rationale: AC-11 requires that profiles the branch's pre-merge staleness check flags as stale have been re-pinned green ('hồ sơ nào lưới trước-gộp toàn kho báo hoá cũ thì đã được ghim lại xanh trên nhánh'); this finding shows the eval verifying that exact clause can pass even when the underlying pre-merge run was cut short, so the AC's claim is unproven.

### 2. Hình dạng 2 (danh sách 'khai' viết tay cho khớp bên đọc): HO_SO_BI_CHAM được sửa theo đầu ra của máy, không còn chép từ thiết kế mục 10, nên phép so bằng của E21 thành vòng tròn
- file:line: `_acceptance/cap-nhat-tuan-okr/rang/cau-hinh.mjs:40`
- severity: medium
- source: measurement
- AC: AC-11
- detail: E21 (evals.yaml dòng 214) hứa rằng danh sách được khai trong HO_SO_BI_CHAM "chép từ thiết kế mục 10", và phần 10 của docs/superpowers/specs/2026-09-25-cap-nhat-tuan-okr-design.md ghi danh sách "đã chép nguyên văn vào HO_SO_BI_CHAM; E21 đo khi hai bên lệch". Commit 0ea4485e chỉ thêm "khoa-api-ghi-thua" vào cau-hinh.mjs (dòng 40), sau khi ho-so-bi-cham.mjs đỏ vì thiếu tên đó. Phần 10 của thiết kế vẫn chỉ có 57 tên, không có khoa-api-ghi-thua; cau-hinh.mjs này có 58 tên. Chạy `bun .../ho-so-bi-cham.mjs --chi-tap` ở HEAD vẫn in "khớp: 58 hồ sơ bị chạm == HO_SO_BI_CHAM". Như vậy phép so "tập máy rút == danh sách khai" chỉ còn so đầu ra của máy với một bản chép lại đầu ra đó. Không có gì đối chiếu cau-hinh.mjs với phần 10 của thiết kế. Sổ quyết định cũng không có dòng nào giải thích vì sao hồ sơ này bị chạm: dòng d-34 thêm cùng commit chỉ nói về các round bị chặn. Vì vậy lần nào tên của một hồ sơ mới xuất hiện cũng sẽ được "sửa" bằng cách chép thêm vào danh sách, và E21 không thể bắt được một hồ sơ bị chạm ngoài dự kiến.
- rationale: AC-11 explicitly requires the machine-derived set of affected signed profiles to equal 'đúng danh sách khai ở thiết kế mục 10'; this finding shows the declared list was hand-edited to match the tool's own output rather than sourced independently from the design doc, making that equality check circular and unable to prove the AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (âm-tính-một-mình): chuyen-okr-khoa-rieng khẳng định không có cảnh báo «same key» nhưng không có ca đối chứng chứng minh bộ bắt console còn sống (r2)**
  Người dùng thấy gì: Bài kiểm tra cho một phần dữ liệu OKR hiện không có phép thử chứng minh việc phát hiện lỗi trùng khoá vẫn hoạt động, nên nếu thực sự phát sinh lỗi trùng dữ liệu sau này, bài kiểm tra có thể không bắt được và báo nhầm là ổn.
  file: `apps/app/test/chuyen-okr.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **The sheet works out who may send a weekly update itself instead of using canEditKr from the API (r1)**
  Người dùng thấy gì: Menu 'Cập nhật' hiện trên từng chỉ số có thể một ngày nào đó cho phép sai người bấm, hoặc chặn nhầm người phụ trách, nếu quy tắc ai được ghi hộ thay đổi mà không đồng bộ.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **guiCapNhatInput allows the same KR twice in one submit (r1)**
  Người dùng thấy gì: Một lần gửi có thể vô tình ghi hai bản cập nhật cho cùng một chỉ số thay vì báo lỗi, làm số liệu tỷ lệ cập nhật hằng tuần bị lệch nhẹ và không thể xoá bản ghi thừa sau đó.
  file: `packages/validation/src/okr-cap-nhat.ts`
  severity: medium
  Đề xuất: known-limits

- **okr-nhac reads OkrTrail.after with raw JSON helpers instead of the trail schema (r1)**
  Người dùng thấy gì: Nếu một dòng lịch sử bị lưu sai định dạng, hệ thống âm thầm coi như 'không có ai được giao việc' thay vì báo lỗi, khiến thẻ việc 'được giao' có thể bị bỏ sót mà không ai hay biết.
  file: `packages/db/src/okr-nhac.ts`
  severity: medium
  Đề xuất: known-limits

- **The OKR reminder item shape is defined by hand in four to five places (r1)**
  Người dùng thấy gì: Khi có người thêm một loại nhắc việc OKR mới trong tương lai, nó có thể bị rơi mất khỏi tin nhắn nhắc buổi sáng mà không có cảnh báo nào.
  file: `packages/db/src/okr-nhac.ts`
  severity: medium
  Đề xuất: known-limits

- **PHUT_MS is written a second time, and okr-nhac keeps loose constants beside its first use (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay bây giờ; là rủi ro rằng thời hạn nhắc việc bị sửa không đồng bộ giữa hai nơi trong tương lai.
  file: `packages/db/src/okr-nhac.ts`
  severity: low
  Đề xuất: known-limits

- **mucTieuOutput adds a theoDoi field that is a copy of following and that no product code reads (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng; một trường dữ liệu dư thừa trong phản hồi hệ thống không có màn nào sử dụng.
  file: `apps/api/src/okr/okr.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Event-based OKR reminders go out mid-day and are sent again the next morning (r1)**
  Người dùng thấy gì: Một người có thể nhận lại đúng thông báo 'được nhắc tên' hoặc 'được giao việc' hai buổi sáng liên tiếp, và một tin gửi vào giữa trưa vẫn mở đầu bằng câu chào 'sáng nay' dù không phải buổi sáng.
  file: `packages/db/src/okr-nhac.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: vết OKR gieo tay ở bài agent (E11), phần "ghim" ở E12 chỉ so với một hằng số viết tay khác, không đi vòng qua bộ gieo (r1)**
  Người dùng thấy gì: Bài kiểm chứng dữ liệu lịch sử ghi đè người phụ trách dùng dữ liệu tự dựng riêng thay vì dữ liệu do đúng luồng ghi thật sinh ra, nên có thể báo Đạt dù luồng ghi thật đang sai định dạng.
  file: `apps/agent/test/okr-nhac.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — Không ghim thông điệp: chiều đỏ của E4 dùng vị từ riêng và tự in nhãn, không chạy bộ kiểm xanh (r1)**
  Người dùng thấy gì: Bài kiểm bảo vệ ba con số đo lường (tỷ lệ cập nhật, thời gian trung bình, người chưa nhận tin) có thể báo 'đã bắt được lỗi' dù phép đo thật đã hỏng một phần, vì nó tự dựng phép so sánh riêng thay vì kiểm tra chính phép đo đang dùng thật.
  file: `_acceptance/cap-nhat-tuan-okr/rang/duong-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: chiều đỏ «packages/ui bị sửa» của E25 đưa thẳng danh sách tay vào hàm định dạng (r1)**
  Người dùng thấy gì: Bài kiểm 'không được sửa thành phần giao diện dùng chung có sẵn' luôn báo bắt được lỗi bất kể nội dung thật, nên nếu bộ quét thật ngừng hoạt động, không ai biết.
  file: `_acceptance/cap-nhat-tuan-okr/rang/san-thiet-ke.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — Đo chỉ dẫn thay vì đầu ra: tập thủ tục router (E1, E17) đọc từ chữ của tệp sinh src/generated/server.ts, không đọc router đang chạy (r1)**
  Người dùng thấy gì: Khẳng định 'không thể sửa hay xoá bản cập nhật/bình luận qua API' dựa trên một bản khai được sinh ra trước đó; nếu bản khai đó không được cập nhật lại sau khi có thay đổi, phép đo vẫn báo Đạt dù khả năng sửa/xoá đã thực sự bị mở ra.
  file: `apps/api/test/okr-cap-nhat.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên quét cả lớp nhưng ma trận thiếu phần tử: E24 «9 thủ tục mới» trong khi lượt này thêm 10 thủ tục okr.* (r1)**
  Người dùng thấy gì: Bảng kiểm quyền truy cập cho các chức năng OKR mới theo từng vai bỏ sót một chức năng (xem danh sách thành viên), nên nếu chức năng đó bị lộ sai quyền, phép đo hiện tại sẽ không phát hiện.
  file: `apps/api/test/okr-cap-nhat.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).