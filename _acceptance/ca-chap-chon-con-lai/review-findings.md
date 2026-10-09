# Review findings: ca-chap-chon-con-lai (round 1)

## Trong hợp đồng

- **pham-vi.mjs: luật gieo.ts chỉ soát dòng bỏ, dòng thêm ngoài ma() lọt qua**
  AC: AC-6
  file: `_acceptance/ca-chap-chon-con-lai/rang/pham-vi.mjs:56`
  severity: medium
  source: bugs
  detail: AC-6 cho gieo.ts đổi đúng hai thứ: khai báo `ma` và hàm mã hoá mà chỉ `ma` dùng. LUAT.gieo lại chỉ chạy `dongBo(diff).every((d) => DONG_MA.test(d))`, nghĩa là chỉ xem các dòng bắt đầu bằng '-'. Dòng '+' thì không kiểm gì. Ví dụ gây hỏng: thêm vào gieo.ts một `export const X = ...` mới, hoặc một câu đặt lại `dem`, mà không bỏ dòng nào khác dòng `ma` — luật vẫn trả null và lệnh in «PHAM VI: n tep, 0 ngoai ranh gioi». Đối chứng GIEO_HONG chỉ thử ca bỏ dòng TIEN_TO, nên không lộ ra lỗ này. Câu chữ của E6 («diff -U0 không bỏ dòng nào khác dòng khai báo ma») khớp với code, nhưng hẹp hơn AC-6 đã ký. Kết quả là phép đo báo xanh cho một diff mà AC-6 không cho phép.
  rationale: AC-6 giới hạn gieo.ts chỉ đổi khai báo ma và hàm mã hoá của ma; phép đo để lọt dòng thêm ngoài phạm vi đó nên báo xanh cho diff AC-6 cấm.

- **AC-2: ANALYZE chen trước lúc đọc reltuples trong staleStatistics cho lỗi khác, không có «ke hoach doi» và các trường thống kê**
  AC: AC-2
  file: `apps/agent/test/tasks.integration.spec.ts:345`
  severity: low
  source: bugs
  detail: AC-2 đòi: thống kê bị cập nhật «bất kể analyze rơi vào khe nào trước probe» thì ca phải ném lỗi có «ke hoach doi», kèm EXPLAIN và reltuples/relpages/so_trang/n_dead_tup/last_analyze/last_autoanalyze. Nhưng nếu ANALYZE rơi vào khe giữa vòng insert cuối và câu SELECT reltuples trong staleStatistics (dòng 336–346), ca ném `statistics drifted: reltuples=3`, không có EXPLAIN và không có trường nào khác. Hai cặp đột biến (a) và (b) đều chèn ANALYZE SAU khi staleStatistics trả về, nên không cặp nào đo khe này. Mức thấp vì autovacuum đã tắt trong khối, nên hiện không còn nguồn ANALYZE nào khác rơi được vào khe đó. Tuy vậy, lời hứa «bất kể khe nào» của AC-2 chưa đúng cho khe này, và chưa có phép đo nào phủ nó.
  rationale: AC-2 hứa lỗi gọi tên «ke hoach doi» kèm các trường thống kê bất kể analyze rơi vào khe nào; khe giữa vòng gieo và lúc đọc reltuples ném lỗi khác.

- **Hinh dang 3 (assert «chuoi co mat» trong khi loi hua la gia tri): cac truong thong ke chi kiem ten khoa, khong kiem gia tri**
  AC: AC-2
  file: `_acceptance/ca-chap-chon-con-lai/rang/dot-bien.mjs:113`
  severity: medium
  source: measurement
  detail: AC-2 hua dong loi mang reltuples, relpages, so trang, n_dead_tup, last_analyze, last_autoanalyze cua bang, doc SAU probe. dot-bien.mjs (dong 18-25 va 113-115) chi doi dong error: chua cac chuoi con «reltuples=», «relpages=», «so_trang=»… Thong diep o tasks.integration.spec.ts:372 dung `stats?.reltuples` va cac truong tuong tu. Neu phep JOIN pg_class voi pg_stat_user_tables khong tra hang nao, dong loi se la «reltuples=undefined relpages=undefined so_trang=undefined n_dead_tup=undefined last_analyze=null last_autoanalyze=null» va cap (a) van dat. Phep do khong buoc cac gia tri phai la so doc tu bang, cung khong buoc chung duoc doc sau probe.
  rationale: AC-2 đòi lỗi mang giá trị thống kê của bảng đọc sau probe; phép đo chỉ kiểm tên khoá nên chưa chứng minh được lời hứa.

- **Hinh dang 3 (assert co mat thay vi quan he bang nhau): ca «da tat tu truoc» kiem includes, khong so bang gia tri truoc khoi**
  AC: AC-1
  file: `apps/agent/test/tasks.integration.spec.ts:446`
  severity: low
  source: measurement
  detail: AC-1 hua: sau describe, reloptions bang dung gia tri doc duoc truoc describe, ke ca khi truoc do da co autovacuum_enabled=false. Ca «restoring keeps the earlier off flag» chi kiem `(await reloptions())?.includes(AUTOVACUUM_OFF)` (dong 446), khong so `reloptions()` voi `before`/`original` nhu ca «reloptions match what the block found» o nhanh khoa trong. Mot ban restore them hay bot khoa khac van qua, mien con chuoi autovacuum_enabled=false. Ca nay cung goi thang autovacuumOff/autovacuumRestore chu khong qua beforeAll/afterAll cua khoi. Vi vay neu afterAll goi `autovacuumRestore(null)`, ca nay van xanh, va ca «handed back» cung xanh tren kho moi (before = null).
  rationale: AC-1 đòi reloptions sau describe bằng đúng giá trị trước describe kể cả khi đã có cờ tắt; ca chỉ kiểm có chứa chuỗi chứ không so bằng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Probe SQL went from parameterised $queryRaw to a string-built $queryRawUnsafe**
  Người dùng thấy gì: Đây chỉ là chuyện cách viết bên trong một bài kiểm thử nội bộ. Người dùng sản phẩm không bị ảnh hưởng gì, và hiện chưa có đường nào để nó gây lỗi.
  file: `apps/agent/test/tasks.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **E1's expected text names describe blocks that do not exist; the drift is not in decisions.jsonl**
  Người dùng thấy gì: Lời mô tả của một phép kiểm tra ghi tên hơi khác tên thật trong mã. Phép kiểm tra vẫn chạy đúng, chỉ là người đọc hồ sơ có thể phải đoán thêm.
  file: `_acceptance/ca-chap-chon-con-lai/evals.yaml`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
