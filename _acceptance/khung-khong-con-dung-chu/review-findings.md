# Review findings: khung-khong-con-dung-chu (round 1)

## Trong hợp đồng

- **E7 says it measures a just-deleted record, but ma-that.mjs only queries ids that never existed**
  file: `_acceptance/khung-khong-con-dung-chu/evals.yaml:88`
  severity: medium
  AC: AC-1
  source: bugs
  detail: E7's expected text (and gap_probe item 1 in card-plain.json/card.html) says klg_ma_that calls contacts.byId, companies.byId, deals.byId and onboarding.planById both with a just-deleted id and with an id that never existed, and that both return NOT_FOUND. The script actually run is _acceptance/khung-loi-ban-ghi-dung-ly-do/rang/ma-that.mjs. In step 1 it only builds idGia(...) ids: the real id with its suffix swapped for MA, so an id that never existed. It never deletes a record and never queries a deleted one. With --chieu-do it queries a live id. So E7 can only show that a bad link gives NOT_FOUND. It shows nothing about deleted records, and nothing at all about a normal Xoá, which the contract Context names as a cause of NOT_FOUND. The only deleted-record coverage is E6, and that covers just a permanently deleted contact, through the UI. E7 will still pass and the evidence will read as if AC-1's cross-layer premise ('API trả mã này cho bản ghi đã bị xoá và cho id chưa từng có') was measured on all four procedures, when the deleted half was not. Fix: either narrow E7's expected text and the gap_probe claim to never-existed ids, or add a step that deletes the records and queries them.

- **Hình dạng 1, đo chỉ dẫn thay vì đầu ra: AC-2 (câu tiếng Anh trên khung) không có phép đo nào đọc câu mô tả đã render**
  file: `_acceptance/khung-khong-con-dung-chu/evals.yaml:37`
  severity: medium
  AC: AC-2
  source: measurement
  detail: E3 (AC-2) ghi trong expected: «ContactSheet tieng Anh voi NOT_FOUND hien chu cua karaBanGhiMessages("en") — nay la «It may have been deleted, or the link is wrong.»». Lệnh của E3 là klg_en, chạy test `klg-en` trong apps/app/test/khung-loi-ban-ghi-dung-ly-do.dom.tsx (dòng 443-476). Với NOT_FOUND, test đó chỉ kiểm `chuKhung().includes(EN.khongCon.tieuDe)`, nút `EN.khongCon.dong`, và việc không có dấu tiếng Việt (`DAU_VIET`). Nó không đọc `EN.khongCon.moTa` trên màn. Phép đo duy nhất chạm câu tiếng Anh mới là E1 (`kkc-chu en: moTa`), mà E1 chỉ so giá trị của đối tượng messages (`karaBanGhiMessages("en").khung.khongCon.moTa`), tức là đo chỉ dẫn chứ không đo thứ khung hiện ra. Phía tiếng Việt thì có E2: test `klg-khong-con`, dòng 322, kiểm `chuKhung().includes(VI.khongCon.moTa)`. Phía tiếng Anh không có bài nào tương đương. Hậu quả: renderer có bỏ moTa ở nhánh en, hay lấy nhầm khoá khác, thì E1 và E3 vẫn xanh.

- **Hình dạng 5, tuyên quét lớp nhưng chỉ có điểm-case: E7 nói đo cả id vừa xoá lẫn id chưa từng có, nhưng ma-that.mjs chỉ gọi bằng id giả**
  file: `_acceptance/khung-khong-con-dung-chu/evals.yaml:92`
  severity: medium
  AC: AC-1
  source: measurement
  detail: Expected của E7 viết: «contacts.byId, companies.byId, deals.byId, onboarding.planById voi id vua xoa ... va id CHUA TUNG CO ... -> error.data.code === "NOT_FOUND"», và «Day la tien de cua cau moi: ca hai nguyen nhan cau nhac toi deu toi khung «không còn»». Lệnh của E7 (klg_ma_that) chạy _acceptance/khung-loi-ban-ghi-dung-ly-do/rang/ma-that.mjs, tệp này không đổi trong diff. Ở dòng 56-61, cả bốn thủ tục chỉ được gọi với `idGia(...)`, tức là một id bịa ra, chưa từng có. Script không xoá bản ghi nào rồi gọi lại byId. Riêng `--chieu-do` (dòng 57) dùng id còn sống, cũng không phải id đã xoá. Vậy lớp nguyên nhân thứ nhất mà AC-1 nêu (bản ghi đã bị xoá → NOT_FOUND) không được đo ở tầng API cho thủ tục nào trong bốn. Chỉ có E6 xoá vĩnh viễn một cá nhân qua màn hình, nên companies, deals và kế hoạch đều không có ca «vừa xoá». Ma trận 2 nguyên nhân × 4 thủ tục được tuyên trong expected, nhưng thực tế chỉ đo 1 nguyên nhân × 4 thủ tục.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The kkc_hoi_quy / kkc_canh_chu unchanged-test checks stop checking anything once HEAD is on onehub**
  Người dùng thấy gì: Sau khi gộp, phép kiểm «các bài kiểm cũ không bị sửa kỳ vọng» sẽ im lặng báo xanh dù có ai sửa kỳ vọng, nên về sau có thể lọt một thay đổi lẽ ra phải bị chặn. Hôm nay nó vẫn chạy đúng; rủi ro nằm ở các lượt kiểm sau này.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/khung-khong-con-dung-chu/evals.yaml, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
