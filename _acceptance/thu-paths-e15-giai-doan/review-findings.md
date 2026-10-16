# Review findings: thu-paths-e15-giai-doan (round 1)

## Trong hợp đồng

- **pmc-truoc-sau does not enforce (a) 'every signed dossier in the list is in the before-set'**
  AC: AC-7
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs:91`
  severity: medium
  source: conventions
  detail: E8 expected (AC-7) says: '(a) mọi hồ sơ đã ký trong danh-sach.txt có trong tập trước và không có trong tập sau'. The code handles a signed dossier missing from `truoc.hoaCu` with only `console.log(`GHI_CHU ${s}: khong hoa cu ca truoc`)` and does not increment `hong`. So if no dossier in the list was stale on the merge-base, E8 still exits 0 as long as the total count drops for some other reason. The measurement does not prove that this round is what took the dossiers out of the stale set, which is what (a) promises. Either count this case as a failure, or reword expected/AC-7 to match the behaviour.
  rationale: AC-7 nói mọi hồ sơ đã ký trong danh sách 'rời khỏi' tập hoá cũ, tức phải có mặt ở tập trước; phép đo bỏ qua vế này nên không chứng minh được lời hứa.

- **The AC-6 case for da-cham-boi-thuc-te dossiers was added after Gate 1 but has no eval, no mutation, and the card was not updated**
  AC: AC-6
  file: `_acceptance/thu-paths-e15-giai-doan/evals.yaml:120`
  severity: medium
  source: conventions
  detail: Commit bc0f70821 (decisions d-...-13, 07:31Z, after the Gate 1 seal at 05:50:40Z) widened AC-6 in contract.md with a fourth case: an eval judgment belonging to a `da-cham-boi-thuc-te` dossier must not get paths and `--ke` must print `BO_QUA ...: <lý do>`. them-paths.mjs implements this as `ly_do: "khoa-thuoc-da-cham-thuc-te"`. E6 (config tpe_bo_qua) still checks only three reasons: input-vang, khong-co-inputs and khai-not-run. dot-bien.mjs has no mutation for the new branch. AC-6 in card-plain.json/card.html still lists only three cases ('khai không chạy, không có tệp đầu vào, tệp đầu vào đã mất'). The contract clause that CI enforced in #439 (the việc-thước lock) has no measurement, and the Cổng Bằng chứng card does not show it to the owner. Add a pair such as `cua-vao-noi-tieng-viet:<id>=khoa-thuoc` to tpe_bo_qua with a red direction, and regenerate the card.
  rationale: AC-6 liệt kê rõ trường hợp hồ sơ da-cham-boi-thuc-te nhưng E6 không đo trường hợp này, nên AC-6 không được chứng minh đủ.

- **Hình dạng 4 (assert âm tính một mình): E8 chỉ đo «không còn trong tập sau», còn vế dương «có trong tập trước» bị hạ xuống GHI_CHU**
  AC: AC-7
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs:90`
  severity: medium
  source: measurement
  detail: AC-7 và expected (a) của E8 (evals.yaml dòng 143) hứa rằng mọi hồ sơ đã ký trong danh-sach.txt «có trong tập trước và không có trong tập sau», tức là hồ sơ đó phải RỜI khỏi tập hoá cũ. Dòng 86-91 của pmc-truoc-sau.mjs chỉ tăng `hong` khi `sau.hoaCu.has(s)`. Nếu hồ sơ không có trong `truoc.hoaCu` thì lệnh chỉ in `GHI_CHU ${s}: khong hoa cu ca truoc` rồi bỏ qua, không đỏ. Vì vậy, khẳng định cho từng hồ sơ chỉ còn vế âm «vắng ở cây HEAD». Vế ấy đúng sẵn khi hồ sơ chưa từng hoá cũ, hoặc khi pre-merge-check không xét tới hồ sơ đó. Thiếu đối chứng dương rằng chính hồ sơ ấy từng in `evidence is stale` ở merge-base. Chỗ duy nhất còn bắt được là phép so số đếm tổng `sau < truoc` (vế (c)), mà phép so này không gắn với hồ sơ nào trong danh sách.
  rationale: Cùng gốc với mục đầu: AC-7 đòi hồ sơ 'rời khỏi' tập hoá cũ nhưng phép đo chỉ kiểm vế vắng ở cây sau.

- **Hình dạng 3 (quan hệ bị rút thành có mặt): tập «luật chọn» của E3 lấy chính danh-sach.txt làm nguồn, nên THUA_TRONG_DANH_SACH chỉ còn kiểm hồ sơ «sạch»**
  AC: AC-3
  file: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs:279`
  severity: medium
  source: measurement
  detail: AC-3(a) hứa một quan hệ: danh sách bằng đúng tập do luật chọn tính độc lập trên cây HEAD, không thừa, không thiếu. Ở `kiemDanhSach`, dòng 279-285 duyệt `chon` (chính danh sách đang bị kiểm) và thêm mọi slug có eval judgment `da-co`, không có `them` và `sach(s)` vào `luat`. Hệ quả: hồ sơ nào sạch, đã có paths, đặt vào danh sách thì tự thành «thuộc luật», nên không bao giờ sinh THUA_TRONG_DANH_SACH, dù vòng này không thêm paths cho nó và nó không thuộc nhóm «thiếu paths mà thêm được». Dòng 278 (`hoSoSuaTrongVong`) cũng suy luật từ diff do chính bên ghi tạo ra. Vì vậy, chiều THUA chỉ còn kiểm điều kiện «hồ sơ sạch». Đột biến đối chứng duy nhất của chiều này, `them-ho-so-con-cu` thêm khung-man-chung (dot-bien.mjs dòng 159-169), là một hồ sơ hoá cũ. Nó chỉ đi qua nhánh `!sach`, chưa bao giờ đi qua nhánh tự hợp thức hoá ở dòng 279-285.
  rationale: AC-3(a) đòi danh sách bằng đúng tập luật chọn tính độc lập, không thừa không thiếu; phép kiểm lấy chính danh sách làm nguồn luật nên không bắt được hồ sơ thừa.

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có điểm-case): E6 kiểm 3 trên 10 eval bị bỏ qua và bỏ hẳn lớp «da-cham-boi-thuc-te» mà AC-6 khai**
  AC: AC-6
  file: `_acceptance/thu-paths-e15-giai-doan/evals.yaml:123`
  severity: medium
  source: measurement
  detail: AC-6 nêu bốn lớp eval không được thêm paths: khai `not-run`, không có `inputs`, input trỏ tệp mất, và thuộc hồ sơ `da-cham-boi-thuc-te`. Lệnh của E6 (`tpe_bo_qua`) là danh sách gõ tay ba điểm: `okr-loai-hoc-tap:E14=input-vang`, `chu-mac-dinh-thu-vien-ngoai:E10=khong-co-inputs`, `dieu-phoi-hai-tang:E22=khai-not-run`, rồi in «3/3». Chạy `them-paths.mjs --ke` trên cây này ra 10 dòng BO_QUA: 1 input-vang, 4 khai-not-run, 3 khoa-thuoc-da-cham-thuc-te, 2 khong-co-inputs. Lớp thứ tư (nhánh `khoa`, dòng 69-76 của them-paths.mjs, gặp ở 7 hồ sơ có `status: da-cham-boi-thuc-te`) không có khẳng định nào, và không có đột biến nào trong dot-bien.mjs. Với các lớp còn lại, E6 cũng không lặp qua mọi phần tử: không có ma trận viết trước kiểu «số khẳng định bằng số eval bị bỏ qua».
  rationale: AC-6 khai bốn lớp eval không được thêm paths, E6 chỉ kiểm ba điểm và bỏ lớp da-cham-boi-thuc-te.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **globT1 only reads 3 of the ~22 t1_skip_globs, so the stale-file set does not match pre-merge-check's stale_files**
  Người dùng thấy gì: Công cụ kiểm tra nội bộ chỉ đọc một phần danh sách tệp được miễn, nên sau này có thể báo đỏ nhầm hoặc xanh nhầm cho một hồ sơ. Hôm nay kết quả vẫn đúng, người dùng chưa bị ảnh hưởng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs`
  severity: medium
  Đề xuất: known-limits

- **dot-bien.mjs keeps its own copy of the eval commands; E3's real command and its declared red direction are never mutation-tested**
  Người dùng thấy gì: Bài thử kiểm tra chính bộ kiểm tra chưa chạy đúng lệnh mà chủ kho đã ký cho hai hồ sơ được gọi tên. Bộ kiểm tra có thể sai mà bài thử vẫn báo là bắt được.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **pmc-truoc-sau: khongDo() gọi process.exit(2) bên trong try nên finally không chạy, worktree tạm bị bỏ lại**
  Người dùng thấy gì: Khi công cụ kiểm tra gặp lỗi giữa chừng, nó để lại một bản sao kho tạm trên máy. Chỉ tốn chỗ và gây rối nhẹ, không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs`
  severity: medium
  Đề xuất: known-limits

- **dot-bien: nhánh CHO_F23 bỏ qua cặp đột biến E2 mà không tính vào lot hay lech, nên thước vẫn trả 0**
  Người dùng thấy gì: Bài thử có thể báo xanh dù hai phép thử chưa chạy, nếu sau này một hồ sơ khác thay đổi. Hiện tại chưa xảy ra.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (không đối chiếu số cặp với danh sách khai): E7 hứa chạy «mỗi đột biến khai ở CHIỀU ĐỎ», nhưng CAP gõ tay, lệnh E3 khác lệnh khai, và cặp CHO_F23 đi qua mà không đo**
  Người dùng thấy gì: Bài thử kiểm tra chính bộ kiểm tra không phủ hết mọi trường hợp đã hứa và chạy một lệnh khác với lệnh đã ký. Bộ kiểm tra có thể bỏ sót lỗi mà vẫn báo là bắt được hết.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
