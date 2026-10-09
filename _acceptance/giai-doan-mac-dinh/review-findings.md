## Trong hợp đồng

- **E4 asserts schema.prisma and migrations are unchanged, but neither path is in its `paths`, so the evidence never goes stale**
  file: `_acceptance/giai-doan-mac-dinh/evals.yaml:43`
  severity: medium
  AC: AC-4
  source: conventions
  detail: `_acceptance/config.yaml` sets `stale_scope: paths` (around line 2268), so an eval only goes stale when a file listed in its `paths` changes. E4/AC-4 promises that this round does not touch `packages/db/prisma/schema.prisma` or `packages/db/prisma/migrations`. The `gmd_hoi_quy` command checks this with `git diff --name-only c1067c163..HEAD -- packages/db/prisma/schema.prisma packages/db/prisma/migrations`. But E4's `paths` lists only `apps/api/test/giai-doan.spec.ts` and `rang/khong-xoa-expect.mjs`. Scenario: after E4 has PASSed and been signed, a commit on the branch adds a migration or edits schema.prisma. E4 is not marked stale, pre-merge-check does not re-run it, and evidence saying the database model is unchanged stays valid while being false. Fix: add `packages/db/prisma/schema.prisma` and `packages/db/prisma/migrations/**` to E4's `paths`. E2 has the same problem in a lighter form: `giai-doan-seed.spec.ts` runs `prisma migrate deploy` on the throwaway database, but the migrations directory is not in E2's `paths`.
  rationale: AC-4 hứa rõ vòng này không chạm schema.prisma hay thư mục migration; finding nói bằng chứng của đúng lời hứa đó không bao giờ hết hạn nếu có commit chạm hai đường dẫn ấy, nên AC-4 có thể sai mà không bị bắt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Card still says the code scan was fixed (gap_probe_plain 0-1), but E3/AC-3 has been cut**
  Người dùng thấy gì: Thẻ quyết định vẫn ghi rằng việc quét mọi chỗ tạo thoả thuận đã được sửa xong, trong khi vòng này đã cắt việc đó. Người ký có thể tưởng thoả thuận tạo bằng đường khác ngoài API cũng đã được bảo vệ, dù thực tế chưa.
  file: `_acceptance/giai-doan-mac-dinh/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **The decision card still tells the reviewer the code scan is in place, but that scan was cut**
  Người dùng thấy gì: Thẻ quyết định tự mâu thuẫn: một chỗ nói phép quét mọi nơi tạo thoả thuận đã có, chỗ khác nói đã bỏ. Người duyệt có thể ký với niềm tin sai rằng bảo đảm này còn hiệu lực, trong khi nó đã được dời sang một đợt làm sau.
  file: `_acceptance/giai-doan-mac-dinh/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **(r2) The `chuoiTao` count includes nested keys outside any Prisma call, so the self-test's passing case fails the real-run inventory check**
  Người dùng thấy gì: Một bảng chữ hay thông điệp vô hại có dạng giống lệnh tạo thoả thuận có thể làm cổng kiểm tra báo đỏ nhầm, dù không có thoả thuận nào được tạo. Người làm sẽ phải gỡ tay mỗi lần gặp.
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs`
  severity: low
  Đề xuất: known-limits

- **(r2) Shape 4 (negative assertion with no paired control): the inventory and empty-scan rows have no --tu-thu control, and the green control tests a weaker predicate than the real gate**
  Người dùng thấy gì: Bài tự thử của cổng kiểm tra chưa chứng minh phần kiểm kê tự nó đỏ khi cần. Nếu phần này hỏng âm thầm thì sẽ không ai biết cho tới khi một đường tạo thoả thuận lọt qua.
  file: `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs`
  severity: medium
  Đề xuất: known-limits

- **(r1) Kho seed dùng-một-lần được tạo không có dấu lượt chạy nên lượt quét dọn không bao giờ thu hồi khi ca bị ngắt**
  Người dùng thấy gì: Nếu lượt kiểm thử bị ngắt giữa chừng, một cơ sở dữ liệu tạm có thể bị bỏ lại trên máy và không tự được dọn. Không ảnh hưởng người dùng, chỉ tốn chỗ trên máy kiểm thử cho tới khi có người xoá tay.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **(r1) seed.ts tự chép lại danh sách loại giai đoạn và vị từ «thua» thay vì dùng GIAI_DOAN.loai / laThua đã có**
  Người dùng thấy gì: Dữ liệu mẫu tự giữ một bản danh sách loại giai đoạn riêng. Nếu sau này thêm hay đổi loại giai đoạn mà quên sửa ở đây thì dữ liệu mẫu lệch âm thầm; chạy lại dữ liệu mẫu cũng có thể báo lỗi dù lẽ ra chỉ cần bỏ qua.
  file: `packages/db/prisma/seed.ts`
  severity: low
  Đề xuất: known-limits

- **(r1) Spec seed đọc JSON từ tiến trình con rồi ép kiểu `Record<string, string | null>` mà không parse**
  Người dùng thấy gì: Bài kiểm dữ liệu mẫu đọc kết quả truy vấn kém chặt, nên nếu ai đổi tên cột thì bài kiểm có thể không báo đỏ đúng lúc. Người dùng sản phẩm không bị ảnh hưởng.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **(r1) Seed now writes STAGE_CHANGE rows whose from and to are the same stage**
  Người dùng thấy gì: Trong dữ liệu mẫu, một số thoả thuận hiện dòng lịch sử đổi giai đoạn từ một giai đoạn sang chính nó (ví dụ từ Đủ điều kiện sang Đủ điều kiện). Chỉ thấy ở dữ liệu demo, nhưng xem hơi lạ.
  file: `packages/db/prisma/seed.ts`
  severity: medium
  Đề xuất: known-limits

- **(r1) The seed spec's throwaway DB is never marked as a run DB, so an interrupted run leaks it forever**
  Người dùng thấy gì: Nếu lượt kiểm thử dữ liệu mẫu bị ngắt giữa chừng, cơ sở dữ liệu tạm bị bỏ lại trên máy kiểm thử mà không cơ chế nào tự dọn. Không ảnh hưởng người dùng.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: known-limits

- **(r1) Hinh dang 4 (assertion am-tinh khong ghim thong diep): --tu-thu cua khong-xoa-expect.mjs chi dem so luong `sai`, khong ghim cau nao bi bat**
  Người dùng thấy gì: Công cụ canh việc không ai âm thầm sửa các khẳng định kiểm thử cũ có bài tự thử hơi lỏng, nên nếu công cụ hỏng theo một kiểu hiếm thì bài tự thử vẫn có thể báo xanh.
  file: `_acceptance/giai-doan-mac-dinh/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **(r1) Hinh dang 4 (thong diep ghim khong duy nhat): hai assert khac hang trong giai-doan-seed.spec.ts dung cung thong diep "seed vao giai doan da cat"**
  Người dùng thấy gì: Hai khẳng định khác nhau trong bài kiểm dữ liệu mẫu cùng in một thông điệp lỗi, nên khi đỏ khó biết khẳng định nào hỏng. Chỉ ảnh hưởng người bảo trì.
  file: `apps/api/test/giai-doan-seed.spec.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 3/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/giai-doan-mac-dinh/evals.yaml, _acceptance/giai-doan-mac-dinh/card-plain.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
