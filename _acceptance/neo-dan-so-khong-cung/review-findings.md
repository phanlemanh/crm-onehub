# Review Findings: neo-dan-so-khong-cung

## Trong hợp đồng

(không có finding nào map được vào AC — rỗng)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The pointer line added to the signed chan-lai dossier's decision log carries a made-up time and names the human for a Gate 2 decision that had not happened yet**
  Người dùng thấy gì: Một dòng trong sổ quyết định có thể ghi sai thời điểm và ghi tên người đã duyệt cho một bước duyệt thật ra chưa diễn ra, khiến ai tra lại lịch sử dễ hiểu nhầm ai đã quyết gì và khi nào.
  file: `_acceptance/chan-lai-component-ra-man/decisions.jsonl`
  severity: medium
  Đề xuất: known-limits

- **The measurement config repeats moi-mac-dinh's list of root folders instead of importing it**
  Người dùng thấy gì: Nếu sau này ai đó thêm một thư mục mới vào danh sách gốc ở một chỗ mà quên cập nhật chỗ kia, phép đo có thể báo lỗi sai chỗ, khiến người xem mất công tìm nhầm nguyên nhân.
  file: `_acceptance/neo-dan-so-khong-cung/rang/cau-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Shell pipelines without pipefail hide a failed git archive and blame it on the original version going red**
  Người dùng thấy gì: Nếu việc dựng bản để so sánh bị lỗi âm thầm bên trong, người xem báo cáo có thể tưởng nhầm là mã nguồn thật sự có vấn đề, trong khi thực ra là công cụ đo bị trục trặc.
  file: `_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs`
  severity: low
  Đề xuất: known-limits

- **docGit: git ls-files is outside the try, so a git failure after rev-parse exits 1 (red) instead of 2 (KHONG DO DUOC)**
  Người dùng thấy gì: Nếu dữ liệu git bị hỏng theo một cách hiếm gặp, công cụ có thể báo đây là lỗi của sản phẩm thay vì báo đúng là 'không đo được', khiến người xem hiểu nhầm mức độ nghiêm trọng.
  file: `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs`
  severity: low
  Đề xuất: known-limits

- **cay-lech ignores a failed `git worktree remove`, leaving the temporary worktree registered in the main repo**
  Người dùng thấy gì: Trong một số tình huống hiếm khi hai lượt đo chạy cùng lúc, một bản sao tạm có thể không được dọn sạch hoàn toàn, để lại rác kỹ thuật trong kho mà không ai được báo.
  file: `_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs`
  severity: low
  Đề xuất: known-limits

- **Each temporary copy leaks a $TMPDIR/chan-lai-component-ra-man-<hash> folder that donBanSao never deletes**
  Người dùng thấy gì: Mỗi lần chạy phép đo để lại một thư mục tạm không được xoá, và theo thời gian những thư mục này có thể tích tụ và chiếm dung lượng ổ đĩa của máy chạy đo.
  file: `_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: ma trận Coverage khai ô «dòng bảng cũ — giữ» nhưng không có ca nào đo, dù đoạn mã so neo đã bị dời**
  Người dùng thấy gì: Hồ sơ nghiệm thu ghi rằng một tiêu chí cũ vẫn được giữ nguyên, nhưng thực ra không có phép đo nào kiểm tra lại điều đó sau khi mã liên quan bị dời chỗ, nên nếu tiêu chí đó vô tình hỏng trong tương lai sẽ không ai được cảnh báo.
  file: `_acceptance/neo-dan-so-khong-cung/contract.md`
  severity: low
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
