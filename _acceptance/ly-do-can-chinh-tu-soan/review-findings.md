# Review findings: ly-do-can-chinh-tu-soan (round 2)

## Trong hợp đồng

- **migration.mjs (E8) accepts a migration with zero UPDATE statements, but AC-7/E8 require exactly one**
  AC: AC-7
  file: `_acceptance/ly-do-can-chinh-tu-soan/rang/migration.mjs:36`
  severity: low
  source: bugs
  detail: kiemMigration fails only when there is more than one UPDATE (`cau.filter(...).length > 1`). A migration made only of the three ALTER TABLE ... ADD COLUMN statements returns ma 0 with «MIGRATION: 3 cau, chi them». AC-7 and E8 say the migration runs exactly one backfill UPDATE. Failure scenario: someone drops the UPDATE line and E8 still passes. E6 would catch it indirectly through «khong thay migration ly do», but E8's own promise of exactly one UPDATE is not enforced, and its counter-checks have no zero-UPDATE case.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E11 (do-nguong) never seeds a whitespace-only or A–D row, so the viSao filter in do-nguong.sql is untested, and the claimed red direction for E11 never runs**
  Người dùng thấy gì: Con số đo trên production (có bao nhiêu căn chỉnh mất lý do) có thể vẫn báo 0 dù ai đó làm hỏng cách nó bỏ qua lý do toàn khoảng trắng, vì phép thử chưa gieo trường hợp đó. Lý do tạo ra từ Soạn OKR vẫn được giữ đúng; chỉ là bộ đo kém nhạy với một kiểu lỗi.
  file: `apps/api/test/okr-ly-do-can-chinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): E11 nói đo trên dữ liệu E1, E2 và E6, nhưng lệnh chỉ gieo một ca E1**
  Người dùng thấy gì: Phép thử của con số đo trên production mới thử một ca thật và một ca đối chứng, chưa thử lý do toàn khoảng trắng hay căn chỉnh cũ đã điền lại. Nếu có người sửa nhầm câu đếm, con số vẫn có thể hiện xanh giả.
  file: `apps/api/test/okr-ly-do-can-chinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): E2 kiểm «bộ ghi dongSoan từ chối viSao rỗng» chỉ bằng safeParse thất bại, không có đối chứng dương, không ghim đường lỗi viSao**
  Người dùng thấy gì: Hôm nay hệ thống vẫn từ chối đúng câu «vì sao» rỗng. Nhưng nếu sau này luật nhập dòng soạn đổi, phép thử có thể vẫn xanh vì lý do khác dù luật chặn câu rỗng đã bị gỡ.
  file: `apps/api/test/okr-ly-do-can-chinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (luật cho cả lớp, đo một điểm): luật «chỉ thêm bốn trường» khai cho năm tệp dữ liệu giả, pham-vi.mjs chỉ đo okr-can-chinh.spec.ts**
  Người dùng thấy gì: Một số tệp thử của giao diện được phép chỉ thêm bốn trường dữ liệu giả, nhưng bộ đo chỉ canh một tệp; một dòng đã bị đổi chứ không chỉ thêm mà không ai thấy. Không ảnh hưởng người dùng, chỉ là chỗ đổi ngoài ý định có thể lọt qua.
  file: `_acceptance/ly-do-can-chinh-tu-soan/rang/pham-vi.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
