# Review findings: ngan-ban-ghi-giu-danh-tinh (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **man.mjs --chieu-do nói theo khuôn chieuDo của man-lib.mjs nhưng bỏ phần xử lý tín hiệu và PHIEN_DO_TEN_CAY**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Khi người chạy nghiệm thu huỷ giữa chừng, máy có thể còn sót bản sao tạm của kho, và hai vòng nghiệm thu chạy cùng lúc có thể phải chờ nhau.
  Căn cứ: Chỉ làm rác trên máy người chạy nghiệm thu, không mất dữ liệu và không chạm người dùng; dọn tay được, còn ngăn bản ghi vẫn mở đóng đúng.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **E5/E12 khai đột biến lấy «tệp của merge-base với origin/onehub» nhưng răng dùng một chuỗi viết cứng**
  Người dùng thấy gì: Người dùng cuối không thấy gì. Người ký thẻ nghiệm thu có thể hiểu nhầm rằng phép so sánh với bản cũ luôn bám bản mới nhất của nhánh chính, trong khi nó dùng một bản chụp cố định.
  Căn cứ: Chỉ sai một câu mô tả trong hồ sơ, không đổi hành vi sản phẩm hay kết quả đo; sửa sau rẻ và không gấp.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **E3 khai khoá ngoài là users.me nhưng bài DOM dùng khoá giả «khoa-ngoai-danh-sach»**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Hồ sơ nói bài kiểm thử bằng một dữ liệu thật của người dùng hiện tại, nhưng thực ra bài dùng một khoá mẫu tự đặt.
  Căn cứ: Chỉ là lời khai trong hồ sơ nói rộng hơn bài kiểm; hành vi nạp sẵn không đổi và việc sửa chữ rất rẻ.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **chieu-do.mjs gọi process.exit(2) trong try nên khối finally không chạy: worktree tạm bị bỏ lại và bước kiểm cây bị bỏ qua**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Khi phép đo báo lệch neo và dừng, máy người chạy có thể còn lại bản sao tạm của kho và bước kiểm cây sạch bị bỏ qua.
  Căn cứ: Chỉ để lại rác tạm trên máy chạy nghiệm thu khi phép đo vốn đã dừng báo lỗi; không mất dữ liệu, dọn tay được.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs`
  severity: low
  Đề xuất: known-limits

- **chieuDo trong man.mjs nuốt mọi ngoại lệ: finally gọi process.exit nên lỗi thật thành «chua chay», và trạng thái git worktree add không được kiểm**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Khi phép đo hỏng ở bước dựng, người chạy chỉ thấy câu «chưa chạy» mà không biết nguyên nhân thật, nên mất thêm thời gian tìm.
  Căn cứ: Chỉ làm khó chẩn đoán cho người chạy nghiệm thu khi đo hỏng; phép đo vẫn báo là chưa chạy chứ không báo xanh giả, và không chạm người dùng.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Ảnh bằng chứng cũ được chép vào hồ sơ dù lượt chụp hiện tại hỏng**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Nếu một lượt chụp màn hỏng giữa chừng, hồ sơ có thể mang ảnh của lượt trước cạnh nhật ký mới mà không có dấu nào cho biết.
  Căn cứ: Chỉ xảy ra khi lượt chụp hỏng, và khi đó nhật ký vẫn ghi lỗi; lượt chạy lại sẽ ghi đè ảnh đúng, không chạm người dùng.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **E3 khai khoá ngoài là users.me nhưng bài kiểm dùng một khoá tự đặt không phải khoá tRPC**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Bài kiểm chưa chứng minh riêng cho khoá thật của người dùng hiện tại, dù hồ sơ khai như vậy.
  Căn cứ: Khoảng hở kiểm thử nhỏ ở phần lọc khoá do bản trước đã giao; không có dấu hiệu dữ liệu lọt và sửa sau rẻ.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính một mình: kiểm «khoá ngoài danh sách» không bao giờ đỏ được vì phần đang đo**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Một vế kiểm «không có dữ liệu ngoài danh sách trong bộ đệm» của bài thử không thể đỏ khi ngăn bị sửa hỏng, nên vế đó chưa bảo vệ gì thêm.
  Căn cứ: Chỉ là một vế kiểm yếu, các vế còn lại vẫn bắt được lỗi nạp sẵn; phần lọc khoá do bản trước giữ và không thấy dữ liệu lọt.
  file: `apps/app/test/ngan-ban-ghi-giu-danh-tinh.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Bản sửa SLUG trong man.mjs bỏ luôn lớp chặn tiền đề của suySlug: API không với tới hay phiên hỏng giờ ra mã 1 (đỏ như lỗi tính năng, hoặc «LOT» ở chiều đỏ) thay vì mã 2 KHONG DO DUOC (r2)**
  Người dùng thấy gì: Hành vi của ngăn bản ghi mà người dùng thấy không đổi. Chỉ khi môi trường đo nghiệm thu hỏng, phép đo có thể báo «tính năng hỏng» thay vì «không đo được», làm người duyệt hiểu nhầm nguyên nhân.
  Căn cứ: Chỉ ảnh hưởng công cụ kiểm của nhóm khi môi trường đo hỏng, không mất dữ liệu và không đụng người dùng cuối; chạy lại sau khi sửa môi trường là gỡ được, nên ghi lại làm giới hạn đã biết là đủ.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **chieuDo tự viết trong man.mjs không đặt PHIEN_DO_TEN_CAY, nên phiên đo của bản sao mang tên cây «crm» dùng chung với các chiếu đỏ khác (r1)**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Chỉ người chạy nghiệm thu có thể thấy hai lượt đo cùng lúc ở hai nhánh tranh nhau một kho đo, làm một lượt chờ hoặc đỏ giả, chạy lại là xong.
  Căn cứ: Chỉ ảnh hưởng người chạy nghiệm thu, không mất dữ liệu, tự hết khi chạy lại, và không đụng tới thứ người dùng thấy.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **chieuDo tự viết lệch khuôn man-lib: không chuyển SIGINT/SIGTERM cho tien-de, không chép răng đang sửa vào bản sao, không kiểm `git worktree add` (r1)**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Người chạy nghiệm thu nếu ngắt giữa chừng có thể để lại phiên đo mồ côi trên máy, hoặc thấy lỗi dựng bản sao báo chậm và khó hiểu.
  Căn cứ: Hậu quả nhẹ và chỉ ở máy người chạy đo, dọn tay được, không liên quan hành vi giao cho người dùng.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **E3 khai khoá ngoài danh sách là users.me, nhưng bài kiểm dùng một khoá giả tự đặt (r1)**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Lời mô tả bài kiểm nói một khoá thật nhưng bài dùng khoá giả, nên người đọc hồ sơ có thể hiểu sai mức bao phủ.
  Căn cứ: Chỉ là lệch giữa lời mô tả và bài kiểm, kết luận về hành vi vẫn đúng, sửa lúc nào cũng được và rất rẻ.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **E5 (chieu-do.mjs) cho REJECT giả khi phép đo màn E6–E11 chạy cùng lúc, vì nó coi bằng chứng mà chính cổng ghi là "ghi cây" (r1)**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Khi các phép đo chạy cùng lúc, cổng có thể báo đỏ oan dù tính năng đúng, làm người ký mất công chạy lại.
  Căn cứ: Chỉ gây đỏ giả và tốn một lượt chạy lại, không che mất lỗi thật và không ảnh hưởng người dùng; sửa riêng là việc của bộ công cụ nghiệm thu.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **`process.exit(2)` nằm trong `try` nên bỏ qua `finally go(sao)`, để lại git worktree mồ côi (r1)**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Trên máy người chạy đo, khi bài đo thoát vì lỗi, có thể còn sót một bản sao tạm trong thư mục tạm.
  Căn cứ: Chỉ để lại rác nhỏ ở máy người chạy đo trong ca lỗi hiếm, dọn bằng một lệnh, nên không đáng mở việc sửa.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay thay cho rút từ nguồn): đột biến «bản cũ» là chuỗi chép tay, không lấy từ merge-base như evals khai (r1)**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Nếu tệp gốc đổi về sau, phép thử chứng minh lỗi cũ vẫn xanh trên một bản cũ không còn là bản gốc, nên người ký có thể tin quá mức.
  Căn cứ: Hôm nay hai bản trùng nhau nên kết quả đúng, rủi ro chỉ xuất hiện nếu tệp gốc đổi trước khi ghim lại, và có thể kiểm lại bằng một lần so sánh.
  file: `_acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ngan-ban-ghi-giu-danh-tinh/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
