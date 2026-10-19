# Review findings: gieo-nguoi-chiu-song-song (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **dot-bien.mjs gọi dungBanSao ngoài khối try: lỗi hạ tầng thoát mã 1 thay vì 2 và để sót worktree**
  Người dùng thấy gì: Nếu việc dựng bản sao cây để đo thử bị hỏng vì máy, kết quả có thể bị đọc nhầm thành «sửa sai» thay vì «không đo được», và có thể để lại một thư mục tạm chưa dọn. Chỉ xảy ra khi máy đo gặp sự cố, không ảnh hưởng tới việc helper chạy đúng.
  file: `_acceptance/gieo-nguoi-chiu-song-song/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: AC-3 tuyên đo lớp «chỗ gọi song song», nhưng chỉ đo ba ca, sót loc-va-dem gọi hai gieoNguoi cùng lúc**
  Người dùng thấy gì: Bộ kiểm chỉ chạy lại ba chỗ gọi song song đã kể, chưa chạy riêng một chỗ khác cũng gọi hai lượt gieo người cùng lúc trong bài kiểm quản lý danh mục. Cuộc đua vẫn được kiểm trực tiếp bằng bài kiểm tổng hợp mới, nên rủi ro còn lại là một bài kiểm cũ có thể chập chờn mà vòng này chưa xác nhận riêng.
  file: `_acceptance/gieo-nguoi-chiu-song-song/evals.yaml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
