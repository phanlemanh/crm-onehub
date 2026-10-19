# Review findings: va-gantt-lich-bay-ngay (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **taoViecCon giờ khoá ngược thứ tự đã ghi cho khoá dự án (khoá việc cha trước, khoá duAn sau), có thể deadlock với lanDoi, khoaMot và doiDuAn**
  Người dùng thấy gì: Hiếm khi, nếu một người thêm việc con vào một dự án đúng lúc người khác kéo ngày hay sửa mốc của chính dự án đó, một trong hai thao tác có thể báo lỗi chung chung. Người đó chỉ cần làm lại là xong.
  Căn cứ: Chỉ xảy ra khi hai người thao tác trên cùng một dự án trong cùng một khoảnh khắc, không mất dữ liệu nào, và thử lại là qua.
  file: `packages/db/src/viec-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **taoCon now takes the duAn row lock after the parent viec row lock, the reverse of khoaDuAn/khoaMot, which can deadlock**
  Người dùng thấy gì: Hiếm khi, thêm việc con và sửa mốc hoặc dời ngày trong cùng một dự án vào cùng một lúc có thể làm một thao tác báo lỗi chung chung. Người dùng chỉ cần làm lại.
  Căn cứ: Tình huống hiếm, không mất hay lệch dữ liệu, người dùng tự khắc phục bằng cách thử lại, nên chưa đáng mở một việc sửa riêng.
  file: `packages/db/src/viec-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **The db test deletes the whole appSetting row and restores only two columns; other settings are lost silently and the run DB is shared with api/agent tests running in parallel**
  Người dùng thấy gì: Không ảnh hưởng người dùng thật. Khi chạy bộ kiểm, bài này có thể xoá cài đặt chung của kho thử và làm vài bài kiểm khác đỏ thất thường.
  Căn cứ: Chỉ chạm cơ sở dữ liệu thử, không chạm dữ liệu thật nào, nhưng có thể làm màu đỏ giả ở các lượt kiểm sau; sửa rẻ và rủi ro thấp.
  file: `packages/db/test/lich-bay-ngay.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo cây khác cây đang kiểm): răng đột biến E7 dựng bản sao từ HEAD đã commit, không phải từ `git stash create` như eval hứa**
  Người dùng thấy gì: Không ảnh hưởng người dùng thật. Phép kiểm bảy lỗi cố ý chỉ đo trên bản đã commit, nên nếu còn sửa chưa commit thì kết quả đó chưa phản ánh đúng.
  Căn cứ: Chỉ làm sai lệch độ tin của phép kiểm khi cây còn sửa dở, không mất dữ liệu nào, và chạy lại sau khi commit là đúng.
  file: `_acceptance/va-gantt-lich-bay-ngay/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
