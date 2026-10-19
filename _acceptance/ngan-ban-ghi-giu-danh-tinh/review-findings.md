# Review findings: ngan-ban-ghi-giu-danh-tinh (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chieuDo tự viết trong man.mjs không đặt PHIEN_DO_TEN_CAY, nên phiên đo của bản sao mang tên cây «crm» dùng chung với các chiếu đỏ khác**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Chỉ người chạy nghiệm thu có thể thấy hai lượt đo cùng lúc ở hai nhánh tranh nhau một kho đo, làm một lượt chờ hoặc đỏ giả, chạy lại là xong.
  Căn cứ: Chỉ ảnh hưởng người chạy nghiệm thu, không mất dữ liệu, tự hết khi chạy lại, và không đụng tới thứ người dùng thấy.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **chieuDo tự viết lệch khuôn man-lib: không chuyển SIGINT/SIGTERM cho tien-de, không chép răng đang sửa vào bản sao, không kiểm `git worktree add`**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Người chạy nghiệm thu nếu ngắt giữa chừng có thể để lại phiên đo mồ côi trên máy, hoặc thấy lỗi dựng bản sao báo chậm và khó hiểu.
  Căn cứ: Hậu quả nhẹ và chỉ ở máy người chạy đo, dọn tay được, không liên quan hành vi giao cho người dùng.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **E3 khai khoá ngoài danh sách là users.me, nhưng bài kiểm dùng một khoá giả tự đặt**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Lời mô tả bài kiểm nói một khoá thật nhưng bài dùng khoá giả, nên người đọc hồ sơ có thể hiểu sai mức bao phủ.
  Căn cứ: Chỉ là lệch giữa lời mô tả và bài kiểm, kết luận về hành vi vẫn đúng, sửa lúc nào cũng được và rất rẻ.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **E5 (chieu-do.mjs) cho REJECT giả khi phép đo màn E6–E11 chạy cùng lúc, vì nó coi bằng chứng mà chính cổng ghi là "ghi cây"**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Khi các phép đo chạy cùng lúc, cổng có thể báo đỏ oan dù tính năng đúng, làm người ký mất công chạy lại.
  Căn cứ: Chỉ gây đỏ giả và tốn một lượt chạy lại, không che mất lỗi thật và không ảnh hưởng người dùng; sửa riêng là việc của bộ công cụ nghiệm thu.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **`process.exit(2)` nằm trong `try` nên bỏ qua `finally go(sao)`, để lại git worktree mồ côi**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Trên máy người chạy đo, khi bài đo thoát vì lỗi, có thể còn sót một bản sao tạm trong thư mục tạm.
  Căn cứ: Chỉ để lại rác nhỏ ở máy người chạy đo trong ca lỗi hiếm, dọn bằng một lệnh, nên không đáng mở việc sửa.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay thay cho rút từ nguồn): đột biến «bản cũ» là chuỗi chép tay, không lấy từ merge-base như evals khai**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Nếu tệp gốc đổi về sau, phép thử chứng minh lỗi cũ vẫn xanh trên một bản cũ không còn là bản gốc, nên người ký có thể tin quá mức.
  Căn cứ: Hôm nay hai bản trùng nhau nên kết quả đúng, rủi ro chỉ xuất hiện nếu tệp gốc đổi trước khi ghim lại, và có thể kiểm lại bằng một lần so sánh.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
