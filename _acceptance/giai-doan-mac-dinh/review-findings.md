# Review findings: giai-doan-mac-dinh (vòng 1)

## Trong hợp đồng

- **duong-tao.mjs không dùng kiểu ngữ cảnh như evals.yaml/plan.md hứa; tạo lồng qua quan hệ khác `deals` lọt quét**
  AC: AC-3
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:118`
  severity: medium
  source: conventions
  detail: Ở E3 (evals.yaml:49) và plan.md:33, phép quét được hứa là lấy `checker.getContextualType` rồi khớp tên kiểu `/^Deal(Unchecked)?Create(Many)?(Without\w+)?Input$/`. AC-3 hứa phủ «các biến thể lồng qua quan hệ». Script thật thì không gọi getContextualType chỗ nào. Nó nhận diện theo cú pháp: receiver có kiểu `DealDelegate` (dòng 110-116), hoặc thuộc tính tên đúng `deals` (dòng 118-129). Schema có thêm các quan hệ trỏ tới Deal: `User.ownedDeals Deal[]` (schema.prisma:28), cùng `deal Deal?` ở nhiều model (608, 1079, 1161, 1277). Vì vậy `db.user.create({ data: { ownedDeals: { create: { name, companyId } } } })` và `db.activity.create({ data: { deal: { create: {...} } } })` đều lọt mà không có dòng THIEU. Kiểm kê đối chứng CHUOI_TAO chỉ đếm `.deal.create(`/`.deal.upsert(` nên cũng không bắt được hai dạng này. Thêm một kẽ nữa: gọi qua bí danh mà `data` là biến chứ không phải object literal thì kiemDoiTuong bỏ qua, và dòng đó cũng không khớp chuỗi `.deal.create(`. Bộ tự thử (--tu-thu) chỉ có ca lồng qua `deals`, nên khoảng trống giữa lời hứa và cách đo không lộ ra. Lệch này trái với nếp «eval phải đo đúng lời hứa của tiêu chí».

- **duong-tao SQL check passes a column list that has no stage, as long as a column like stageChangedAt is there**
  AC: AC-3
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:76`
  severity: medium
  source: bugs
  detail: The check is `/"?stage"?/i.test(k[1])`. It has no word boundary and no quote anchor, so it matches any column whose name contains 'stage'. Example: `INSERT INTO "deal" ("id","name","companyId","stageChangedAt") VALUES ...` passes even though it has no stage column, and the row falls back to the DB default DEMO_BOOKED. That is exactly the case AC-3 is meant to block, and the scanner exits 0. stageChangedAt is a real column on deal and is written next to stage in both product creation paths, so this is likely. The --tu-thu cases do not cover it. Fix: split the column list on commas, strip quotes and whitespace, and compare each name to 'stage' exactly.

- **duong-tao never scans product files outside each tsconfig's include, and its inventory check cannot see the gap**
  AC: AC-3
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:56`
  severity: medium
  source: bugs
  detail: The file set comes from `doc.fileNames` of each apps/*/tsconfig.json and packages/*/tsconfig.json. apps/api's include is src/api/test, so apps/api/scripts/** is never scanned. That covers okr-mau/nap.ts, nap-canh-kr.ts, dev-session.ts and others, all of which already write Prisma rows with tx.*.createMany. packages/db/scripts/** (prepare-dev.ts) is also outside packages/db's include. Checked: none of these files appears in fileNames. The guard 'n >= so lan khop chuoi' counts `.deal.create(` in the same filtered set, so it cannot catch this. A `tx.deal.createMany({ data: [{ name, companyId }] })` added to apps/api/scripts/okr-mau/nap.ts would land in DEMO_BOOKED, and the scanner would still print 0 THIEU and exit 0. The contract (AC-3) scope is `apps/**`, `packages/**`. Fix: take roots from a git ls-files glob of apps/** and packages/**, and use the tsconfig only for compilerOptions.

- **duong-tao does not read the contextual type, so non-literal data is skipped and the inventory check can hide it**
  AC: AC-3
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:82`
  severity: low
  source: bugs
  detail: evals.yaml E3 says it uses checker.getContextualType on every object literal. The script does not: it inspects only literals written directly at `data:` or `create:` of a DealDelegate call or `deals:` relation. `const data: Prisma.DealUncheckedCreateInput = { name, companyId }; tx.deal.create({ data })` makes kiemDoiTuong return early with no THIEU and no count. The only backstop is `doiTuong < chuoi`, and elements of createMany and nested-relation arrays add to doiTuong while counting only one or zero toward chuoi. One literal createMany with two stage-bearing elements next to one skipped variable-data create gives 2 >= 2, so it exits 0 and the missing stage is never reported. The --tu-thu step also accepts any THIEU line for ca.ts without checking the line number, though E3 says 'goi dung tep:dong'.

- **Hinh dang 5 (tuyen quet LOP nhung chi co diem-case): duong-tao.mjs bat tao long qua quan he bang TEN thuoc tinh "deals", khong theo kieu ngu canh**
  AC: AC-3
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:118`
  severity: high
  source: measurement
  detail: AC-3 va E3 hua quet MOI object literal co kieu ngu canh la DealCreate*Input ("lay kieu ngu canh (checker.getContextualType) — ten kieu khop /^Deal(Unchecked)?Create(Many)?(Without\w+)?Input$/"), ke ca "cac bien the long qua quan he". Code khong goi getContextualType va khong so ten kieu nao. No chi bat hai diem: (a) loi goi tren receiver co kieu ten DealDelegate (dong 111), (b) PropertyAssignment co ten dung bang `deals` (dong 118-129: `nut.name.getText() === "deals"`). Bo loc truoc CO_THE (dong 32) cung chi nhan tep co `.deal`, `deals:` hoac insert into deal. Schema that co hai quan he khac tao duoc Deal long: `ownedDeals Deal[]` tren User (schema.prisma:28) va `deal Deal?` so it tren cac model o schema.prisma:608, 1161, 1277. Vi vay `db.user.create({ data: { ownedDeals: { create: { name } } } })` hay `db.activity.create({ data: { deal: { create: { name, companyId } } } })` khong co stage van cho quet xanh. Kiem ke doi chung `doiTuong >= chuoi` (dong 272) chi dem chuoi `.deal.create(`/`.deal.upsert(`, nen cung khong thay hai dang nay. Mot object duoc dung san trong bien roi truyen qua bi danh (`const data = {...}; d.create({ data })`) cung lot: `thuoc` chi doc PropertyAssignment, bo qua ShorthandPropertyAssignment, va kiemDoiTuong im lang bo qua gia tri khong phai literal. Phep do tuyen quet ca lop, nhung that ra chi co cac diem-case da liet ke trong tu-thu.

- **Hinh dang 3 (assert "chuoi co mat" thay vi quan he): kiem cot stage cua SQL bang chuoi con, `stageChangedAt` cung qua**
  AC: AC-3
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs:76`
  severity: medium
  source: measurement
  detail: AC-3 hua "moi lenh SQL co cot `stage`", tuc la phai co cot mang dung ten stage trong danh sach cot. Dong 76 lai kiem `/"?stage"?/i.test(k[1])` tren ca chuoi danh sach cot, khong co ranh gioi tu. Bang deal co cot `stageChangedAt` (schema.prisma:1024), nen `INSERT INTO deal ("id","name","stageChangedAt") ...` duoc tinh la co stage va van roi vao mac dinh DEMO_BOOKED. gap-probe muc 1 ghi da sua van de "co chu stage chua chac da gan giai doan", nhung sua do moi ap cho object; nhanh SQL van chi kiem chuoi co mat, va tu-thu khong co ca doi chung nao cho cot gan ten. Ngoai ra SQL_CHEN (dong 29-30) bat buoc phai co `(cot...)` sau ten bang, nen `INSERT INTO deal SELECT ...` va `INSERT INTO deal VALUES (...)` khong duoc dem, khong bi bao loi va khong co kiem ke nao. Trong khi do evals E3 muc 3 hua kiem "moi chuoi khop /insert\s+into\s+("?public"?\.)?"?deal"?\b/i".

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kho seed dùng-một-lần được tạo không có dấu lượt chạy nên lượt quét dọn không bao giờ thu hồi khi ca bị ngắt**
  Người dùng thấy gì: Nếu lượt kiểm thử bị ngắt giữa chừng, một cơ sở dữ liệu tạm có thể bị bỏ lại trên máy và không tự được dọn. Không ảnh hưởng người dùng, chỉ tốn chỗ trên máy kiểm thử cho tới khi có người xoá tay.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **seed.ts tự chép lại danh sách loại giai đoạn và vị từ «thua» thay vì dùng GIAI_DOAN.loai / laThua đã có**
  Người dùng thấy gì: Dữ liệu mẫu tự giữ một bản danh sách loại giai đoạn riêng. Nếu sau này thêm hay đổi loại giai đoạn mà quên sửa ở đây thì dữ liệu mẫu lệch âm thầm; chạy lại dữ liệu mẫu cũng có thể báo lỗi dù lẽ ra chỉ cần bỏ qua.
  file: `packages/db/prisma/seed.ts`
  severity: low
  Đề xuất: known-limits

- **Spec seed đọc JSON từ tiến trình con rồi ép kiểu `Record<string, string | null>` mà không parse**
  Người dùng thấy gì: Bài kiểm dữ liệu mẫu đọc kết quả truy vấn kém chặt, nên nếu ai đổi tên cột thì bài kiểm có thể không báo đỏ đúng lúc. Người dùng sản phẩm không bị ảnh hưởng.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Seed now writes STAGE_CHANGE rows whose from and to are the same stage**
  Người dùng thấy gì: Trong dữ liệu mẫu, một số thoả thuận hiện dòng lịch sử đổi giai đoạn từ một giai đoạn sang chính nó (ví dụ từ Đủ điều kiện sang Đủ điều kiện). Chỉ thấy ở dữ liệu demo, nhưng xem hơi lạ.
  file: `packages/db/prisma/seed.ts`
  severity: medium
  Đề xuất: known-limits

- **The seed spec's throwaway DB is never marked as a run DB, so an interrupted run leaks it forever**
  Người dùng thấy gì: Nếu lượt kiểm thử dữ liệu mẫu bị ngắt giữa chừng, cơ sở dữ liệu tạm bị bỏ lại trên máy kiểm thử mà không cơ chế nào tự dọn. Không ảnh hưởng người dùng.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 2 (fixture VIET TAY dung khuon ben doc): KIEU_GIA cua --tu-thu duoc dung tay khop dung hai ten ma scanner doc**
  Người dùng thấy gì: Bài tự thử của công cụ kiểm dùng kiểu dữ liệu giả do tác giả tự viết, nên màu xanh chưa chứng minh công cụ chạy đúng trên cấu trúc dữ liệu thật của sản phẩm.
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (assertion am-tinh khong ghim thong diep): --tu-thu cua khong-xoa-expect.mjs chi dem so luong `sai`, khong ghim cau nao bi bat**
  Người dùng thấy gì: Công cụ canh việc không ai âm thầm sửa các khẳng định kiểm thử cũ có bài tự thử hơi lỏng, nên nếu công cụ hỏng theo một kiểu hiếm thì bài tự thử vẫn có thể báo xanh.
  file: `_acceptance/giai-doan-mac-dinh/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (khong ghim thong diep): --tu-thu cua duong-tao.mjs chi kiem tien to ten tep, khong kiem dong hay dang vi pham**
  Người dùng thấy gì: Bài tự thử của công cụ quét chỉ kiểm có báo đúng tệp, không kiểm báo đúng dòng hay đúng lý do, nên một ca có thể đỏ vì lý do khác mà không ai thấy.
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 4 (thong diep ghim khong duy nhat): hai assert khac hang trong giai-doan-seed.spec.ts dung cung thong diep "seed vao giai doan da cat"**
  Người dùng thấy gì: Hai khẳng định khác nhau trong bài kiểm dữ liệu mẫu cùng in một thông điệp lỗi, nên khi đỏ khó biết khẳng định nào hỏng. Chỉ ảnh hưởng người bảo trì.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
