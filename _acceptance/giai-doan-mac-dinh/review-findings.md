# Review findings: giai-doan-mac-dinh (round 2)

## Trong hợp đồng

- **Phép đối chiếu chỉ so tổng số, nên một lời gọi qua bí danh che mất một chỗ tạo lồng không gán stage**
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:401`
  severity: medium
  AC: AC-3
  source: conventions
  detail: Phép đối chiếu chỉ so hai tổng của cả kho: `r.diem < r.chuoi`. Hai bên lại đếm hai tập khác nhau. `diem` có tính lời gọi qua bí danh (`const d = db.deal; d.create(...)`), dù chuỗi khớp không thấy lời gọi này. Ngược lại, `chuoiTao` đếm chỗ tạo lồng `ownedDeals: { create`/`deals: { create` nằm trong một biến dựng sẵn ngoài lời gọi Delegate. `trongDelegate` (dòng 183-195) trả false cho chỗ đó, nên nó không được tính vào `diem` và không bị `kiemKieu` xét. Hai sai lệch ngược chiều nhau triệt tiêu, và chỗ tạo không có stage lọt qua với mã thoát 0. Đã tái hiện trên một kho tạm dùng chính script và KIEU_GIA. Tệp gồm `const d = db.deal; d.create({ data: { name: "x", companyId: "c", stage: "s" } }); const data = { name: "u", ownedDeals: { create: { name: "x" } } }; db.user.create({ data });`. Kết quả in ra là `1 diem tao, 1 doi tuong tao thoa thuan, 0 lenh SQL, 1 lan khop chuoi`, thoát 0, không có dòng THIEU nào, dù thoả thuận lồng sẽ rơi vào giai đoạn mặc định đã lưu trữ. Đây đúng là lớp lỗi mà AC-3 phải chặn («các biến thể lồng qua quan hệ»). Cần đối chiếu theo từng vị trí (tệp:dòng của mỗi lần khớp chuỗi phải nằm trong tập điểm đã xét), không so tổng. Bộ --tu-thu chưa có ca nào trộn bí danh với tạo lồng qua biến.

- **Script vẫn lệch với cách đo đã khai ở E3: không dùng getContextualType, dòng in ra và phép đối chiếu khác lời hứa**
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:196`
  severity: medium
  AC: AC-3
  source: conventions
  detail: Bản viết lại ở vòng này vẫn không làm điều evals.yaml E3 (dòng 47-53, không đổi ở vòng này) hứa: «duyệt mọi object literal… lấy kiểu ngữ cảnh (checker.getContextualType) — tên kiểu khớp /^Deal(Unchecked)?Create(Many)?(Without\w+)?Input$/». Script không gọi getContextualType và không so tên kiểu `Deal*CreateInput` nào. Nó nhận diện theo hai điều: receiver có kiểu tên `DealDelegate` (dòng 203), hoặc tên thuộc tính trùng tên quan hệ đọc từ schema và phải nằm trong lời gọi một Delegate (dòng 211-215). Dòng in ra cũng khác: E3 mục 1 hứa "&lt;n&gt; object tao thoa thuan, &lt;m&gt; lenh SQL" với n >= số lần khớp chuỗi. Script in `X diem tao, Y doi tuong…, Z lenh SQL, W lan khop chuoi` (dòng 396) và so `diem`, không so số object `doiTuong` (dòng 401). Quyết định d-...-10 ghi lại việc đổi cách làm, nhưng evals.yaml không được sửa theo, nên eval đã ký mô tả một phép đo mà script không chạy. Theo nếp «eval phải đo đúng lời hứa», cần chọn một trong hai: sửa script cho đúng E3 (kiểu ngữ cảnh trên mọi object literal, cách này cũng bịt được kẽ «dựng trong biến» ở phát hiện trên), hoặc mở lại Cổng Phạm vi để đổi câu chữ E3. Đừng để chữ và mã lệch nhau.

- **A deal creation point is counted but never checked when `data` is not an inline object literal key**
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:162`
  severity: medium
  AC: AC-3
  source: bugs
  detail: `giaTri(doi, ten)` returns undefined unless `doi` is an ObjectLiteralExpression with a plain PropertyAssignment or shorthand named `data`/`create`. `motHayNhieu(undefined)` then returns without calling `kiemKieu`, so nothing is pushed to `thieu`. Meanwhile `diem += 1` (line 204) has already run, and the regex `chuoiTao` also matches `.deal.create(`, so the inventory check `diem < chuoi` stays satisfied. Result: exit 0 with the path unchecked. Reproduced on a scratch copy of the script by adding self-test cases. `const a = { data: { name: "x", companyId: "c" } }; db.deal.create(a);` reports `THIEU` as [] (missed). `db.deal.create({ ...a })` is also missed. A quoted key (`{ "data": {...} }`) misses for the same reason, because `p.name.getText()` keeps the quotes. Fix: when `data`/`create` cannot be found syntactically, read the type of the argument's `data`/`create` property through the checker (`kiem.getTypeAtLocation(doi).getProperty(...)`), or push THIEU "khong doc duoc data" rather than letting it pass.

- **Nested `upsert` on a Deal relation is not recognised as a creation path**
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:31`
  severity: low
  AC: AC-3
  source: bugs
  detail: `LONG = ["create", "createMany", "connectOrCreate"]` and `chuoiTao` only list those three nested keys. Prisma also creates a Deal through a nested `upsert`, for example `company.update({ data: { deals: { upsert: { where, update, create: {...} } } } })` or the to-one `deal: { upsert: { create, update } }`. Neither `diem` nor `chuoi` counts this, so the inventory check cannot flag it either. Reproduced on the scratch copy: `db.company.create({ data: { deals: { upsert: { where: { id: "1" }, update: {}, create: { name: "x" } } } } })` returns THIEU []. No such call exists in the repo today, so this is a gap in a guard meant to cover every creation path. Fix: add `upsert` to LONG and to the `chuoiTao` alternation, and check `giaTri(giaTri(long, "upsert"), "create")` (array or single).

- **Shape 5 (claims to scan a class but only covers listed cases): a Deal create whose args are a variable passes silently**
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:205`
  severity: high
  AC: AC-3
  source: measurement
  detail: AC-3 and E3 promise to check every object literal whose contextual type is a Deal create input (eval: checker.getContextualType). The code instead starts from the call site. At lines 205-208 it reads `giaTri(nut.arguments[0], "data")`, and giaTri (line 163) returns undefined when the argument is not an object literal. motHayNhieu(undefined) then returns without a check, but `diem += 1` still runs, so the inventory check `diem < chuoi` (line 401) is also satisfied. Chạy trên cây tạm dựng bằng banTuThu: `const args = { data: { name: "x", companyId: "c" } }; db.deal.create(args);` returns {diem:1, doiTuong:0, chuoi:1, thieu:[]}, so the scan stays green. `const a = { data: [{ name: "x" }] }; db.deal.createMany(a);` gives the same result. A nested relation built outside the Delegate call (`const data = { name: "c", deals: { create: [{ name: "x" }] } }; db.company.create({ data })`) gets no THIEU line naming file:line (thieu:[]); only the inventory mismatch (diem 0 < chuoi 1) fails, with no location. CA_DO has 14 hand-picked syntactic forms and none passes args through a variable, so --tu-thu 16/16 does not show the scan covers the class of create inputs that AC-3 claims.

- **Shape 5 (claims a type-based scan but gates it on a text prefilter): a file holding the DealDelegate as a parameter is never type-checked**
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:122`
  severity: medium
  AC: AC-3
  source: measurement
  detail: A file only enters the TypeScript program if it matches the regex `coThe` (lines 105-107): `\.deal\b | (ownedDeals|deals|deal)\s*: | insert\s+into`. A create call through a typed parameter contains none of these strings. Measured on a temp tree: `import type { DealDelegate } from "./kieu"; export function tao(kho: DealDelegate) { kho.create({ data: { name: "x", companyId: "c" } }); }` returns {diem:0, doiTuong:0, chuoi:0, thieu:[]}. Because chuoi is also 0 for that file, the inventory check `diem < chuoi` cannot catch it either. For the real Prisma type (`Prisma.DealDelegate`), `\.deal\b` does not match `.DealDelegate`, since `\b` needs a non-word character after `deal`. The check that claims to work by type therefore only reaches files that already pass a string match, and --tu-thu has no case for this.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The `chuoiTao` count includes nested keys outside any Prisma call, so the self-test's passing case fails the real-run inventory check**
  Người dùng thấy gì: Một bảng chữ hay thông điệp vô hại có dạng giống lệnh tạo thoả thuận có thể làm cổng kiểm tra báo đỏ nhầm, dù không có thoả thuận nào được tạo. Người làm sẽ phải gỡ tay mỗi lần gặp.
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no paired control): the inventory and empty-scan rows have no --tu-thu control, and the green control tests a weaker predicate than the real gate**
  Người dùng thấy gì: Bài tự thử của cổng kiểm tra chưa chứng minh phần kiểm kê tự nó đỏ khi cần. Nếu phần này hỏng âm thầm thì sẽ không ai biết cho tới khi một đường tạo thoả thuận lọt qua.
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs`
  severity: medium
  Đề xuất: known-limits

- **Kho seed dùng-một-lần được tạo không có dấu lượt chạy nên lượt quét dọn không bao giờ thu hồi khi ca bị ngắt** (r1)
  Người dùng thấy gì: Nếu lượt kiểm thử bị ngắt giữa chừng, một cơ sở dữ liệu tạm có thể bị bỏ lại trên máy và không tự được dọn. Không ảnh hưởng người dùng, chỉ tốn chỗ trên máy kiểm thử cho tới khi có người xoá tay.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **seed.ts tự chép lại danh sách loại giai đoạn và vị từ «thua» thay vì dùng GIAI_DOAN.loai / laThua đã có** (r1)
  Người dùng thấy gì: Dữ liệu mẫu tự giữ một bản danh sách loại giai đoạn riêng. Nếu sau này thêm hay đổi loại giai đoạn mà quên sửa ở đây thì dữ liệu mẫu lệch âm thầm; chạy lại dữ liệu mẫu cũng có thể báo lỗi dù lẽ ra chỉ cần bỏ qua.
  file: `packages/db/prisma/seed.ts`
  severity: low
  Đề xuất: known-limits

- **Spec seed đọc JSON từ tiến trình con rồi ép kiểu `Record<string, string | null>` mà không parse** (r1)
  Người dùng thấy gì: Bài kiểm dữ liệu mẫu đọc kết quả truy vấn kém chặt, nên nếu ai đổi tên cột thì bài kiểm có thể không báo đỏ đúng lúc. Người dùng sản phẩm không bị ảnh hưởng.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Seed now writes STAGE_CHANGE rows whose from and to are the same stage** (r1)
  Người dùng thấy gì: Trong dữ liệu mẫu, một số thoả thuận hiện dòng lịch sử đổi giai đoạn từ một giai đoạn sang chính nó (ví dụ từ Đủ điều kiện sang Đủ điều kiện). Chỉ thấy ở dữ liệu demo, nhưng xem hơi lạ.
  file: `packages/db/prisma/seed.ts`
  severity: medium
  Đề xuất: known-limits

- **The seed spec's throwaway DB is never marked as a run DB, so an interrupted run leaks it forever** (r1)
  Người dùng thấy gì: Nếu lượt kiểm thử dữ liệu mẫu bị ngắt giữa chừng, cơ sở dữ liệu tạm bị bỏ lại trên máy kiểm thử mà không cơ chế nào tự dọn. Không ảnh hưởng người dùng.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 4 (assertion am-tinh khong ghim thong diep): --tu-thu cua khong-xoa-expect.mjs chi dem so luong `sai`, khong ghim cau nao bi bat** (r1)
  Người dùng thấy gì: Công cụ canh việc không ai âm thầm sửa các khẳng định kiểm thử cũ có bài tự thử hơi lỏng, nên nếu công cụ hỏng theo một kiểu hiếm thì bài tự thử vẫn có thể báo xanh.
  file: `_acceptance/giai-doan-mac-dinh/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (thong diep ghim khong duy nhat): hai assert khac hang trong giai-doan-seed.spec.ts dung cung thong diep "seed vao giai doan da cat"** (r1)
  Người dùng thấy gì: Hai khẳng định khác nhau trong bài kiểm dữ liệu mẫu cùng in một thông điệp lỗi, nên khi đỏ khó biết khẳng định nào hỏng. Chỉ ảnh hưởng người bảo trì.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
