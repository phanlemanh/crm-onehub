# Review findings: kiem-cheo-chay-quang-lang (round 1)

## Trong hợp đồng

- **Đường mã 4: phân loại eval lệch chỉ còn ≤10′ của trần ngoài; vượt trần thì cả đêm mất tiến độ, đúng lỗi 10/10**
  file: `scripts/kiem-cheo/dem.mjs:376`
  severity: high
  AC: AC-2
  source: bugs
  detail: `taoChay` đặt trần ngoài `KIEM_CHEO.luot.tranPhut` = 90′, tính từ trước `dungCay`. Làn tự dừng ở `repin_budget_min` = 80′, tính từ lúc làn khởi động (`lenhLan` không truyền `--tran-phut`). Sau khi làn thoát 4, `phanLoaiHet(lechDs)` chạy cùng đồng hồ `may`. Phần còn lại vì thế là 10′ trừ thời gian dựng cây. Mỗi eval lệch gọi `datCay` (checkout + `bun install --frozen-lockfile && bun run db:generate`) rồi chạy lại eval ở D, sau đó ở T hoặc chia đôi. Tôi chạy `docNhatKyDung` trên nhật ký thật `rang/mau/lan-2026-10-10.log` với 146 hồ sơ, rồi lọc bằng `lech` theo `evals.yaml` của cây hiện tại (xấp xỉ mã kỳ vọng ở D): 21 hồ sơ xong có 25 eval lệch, trong đó vài eval đo màn mất 135–137 s mỗi lần. Như vậy chắc chắn vượt 90′. Khi vượt, `may.chay` ném `VuotTran`, lượt rơi vào `catch` (dòng 419–425) và báo `khong-chay-duoc`. `ghiTienDo` (dòng 384) chưa kịp chạy nên tien-do.json không được ghi, và đêm sau đo lại từ đầu. AC-2 hứa điều ngược lại, trên chính đầu vào của đêm 10/10. Hướng sửa: ghi tiến độ (xong + eval lệch chưa phân loại) TRƯỚC khi phân loại; hoặc truyền `--tran-phut` cho làn thấp hơn hẳn trần ngoài, chừa ngân sách cho phân loại.
  rationale: AC-2 hứa khi làn thoát mã 4 thì lượt ghi tien-do.json; finding chỉ ra trên đầu vào thật đêm 10/10 bước phân loại vượt trần ngoài nên tiến độ không được ghi.

- **suiteDoTrongNhatKy không đọc dòng «suite i/n (chạy lại)», nên suite chập chờn đã xanh ở lần chạy lại bị coi là đỏ**
  file: `scripts/kiem-cheo/tien-do.mjs:66`
  severity: high
  AC: AC-2
  source: bugs
  detail: `DONG_SUITE = /^\[lane\] suite (\d+\/\d+): (.*) → exit/` đòi dấu `:` đứng ngay sau `i/n`. Với `repin_retry: 1`, suite cũng được chạy lại (`runSuites` gọi `chayLaiNeuCan`). `ghiLan` của repin-lane ghi lần chạy lại dưới dạng `[lane] suite 1/7 (chạy lại): &lt;lệnh&gt; → exit 0`, và regex không khớp dòng này. Tôi đã thử: với nhật ký `suite 1/2: … → exit 1` theo sau là `suite 1/2 (chạy lại): … → exit 0`, hàm trả `['1/2 (bun run test) ma 1']`. Hệ quả: đêm làn chạm trần (mã 4) mà có một suite chập chờn xanh ở lần hai, `dem.mjs:369` ném `suite do o D`, lượt báo `khong-chay-duoc` và không ghi tien-do.json. Mọi hồ sơ đã đo đêm đó bị bỏ. Đường thoát 0/1 không mắc lỗi này vì `docKetLan` đọc mã cuối từ JSON. `DONG_EVAL` đã xử lý biến thể `(chạy lại)`; `DONG_SUITE` cần thêm `(?: \(chạy lại\))?` để dòng sau thắng dòng trước như bên eval.
  rationale: Làn chạm trần (mã 4) mà suite xanh ở lần chạy lại bị coi là đỏ khiến lượt dừng và không ghi tien-do.json, trái AC-2 về việc lưu hồ sơ đã đo khi chạm trần.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đột biến M1b của dph_dot_bien mất mỏ neo ở lich.mjs nên E25 của hồ sơ đã ký dieu-phoi-hai-tang thoát 2**
  Người dùng thấy gì: Một phép thử an toàn của tính năng điều phối khác sẽ báo đỏ khi lượt kiểm chéo đêm chạy, dù thứ tự xếp hàng vẫn đúng. Cần một việc riêng để sửa lại phép thử đó.
  file: `scripts/dieu-phoi/lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **Eval lệch có dòng «(đã chạy)» được ghi loai khong-chay-duoc, nằm ngoài KIEM_CHEO.loaiDo, nên ket_qua bỏ qua và không ai được báo**
  Người dùng thấy gì: Nếu một số kiểm tra lệch không đọc lại được lệnh để chạy, đêm đó có thể được ghi là xanh và không ai được báo, dù có thể còn hồi quy chưa được xét.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: low
  Đề xuất: known-limits

- **Trường `moc` trong đơn kiem-cheo không còn nơi nào đọc, nhưng dem.mjs vẫn tính canMoc và ghi nó vào đơn**
  Người dùng thấy gì: Hệ thống vẫn tính và ghi một thông tin không còn ảnh hưởng thứ tự xếp, gây tốn chút công và dễ làm người đọc hiểu nhầm, nhưng không làm sai kết quả.
  file: `scripts/dieu-phoi/lich.mjs`
  severity: low
  Đề xuất: wont-fix

- **Kết quả chua-xong không nằm trong baoNguoi: do-moi tìm thấy đêm chưa xong không báo ai, và lượt kẹt ở chua-xong cũng im**
  Người dùng thấy gì: Nếu một hồi quy thật được tìm ra ở đêm đầu khi chưa đo hết, không ai được báo ngay mà phải đợi đo xong cả tập, có thể mất vài đêm.
  file: `scripts/kiem-cheo/cau-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng): E1 khai một bản sao đột biến bỏ phần tử kiem-cheo khỏi khoá xếp, nhưng lich.test.mjs không có bản sao nào**
  Người dùng thấy gì: Phép thử chứng minh quy tắc xếp kiểm chéo sau thợ được mô tả là có thử với một bản sai, nhưng thực tế chưa chạy bản sai đó, nên độ tin cậy của phép thử thấp hơn lời ghi.
  file: `_acceptance/kiem-cheo-chay-quang-lang/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng): E3 khai bản sao «ghi đè tien-do thay vì hợp» nhưng dem.test.mjs không có ca đột biến**
  Người dùng thấy gì: Phép thử việc chạy tiếp qua nhiều đêm được mô tả là có đối chứng với bản ghi đè sai, nhưng đối chứng đó chưa thật sự chạy.
  file: `_acceptance/kiem-cheo-chay-quang-lang/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1/2: noi-f9 tự đưa CON_TRO hằng vào chungThayBoi, thay vì đo đường kiểm lại thật (notRunConflicts đọc superseded_by từ evals.yaml)**
  Người dùng thấy gì: Việc kiểm xem hồ sơ cũ có nhận con trỏ thay thế được kiểm bằng đầu vào tự đưa vào, chưa chạy qua đúng bộ kiểm lại bằng chứng thật, nên chưa chắc chắn hoàn toàn.
  file: `_acceptance/kiem-cheo-chay-quang-lang/rang/noi-f9.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/9 lỗi rơi vào file không bộ đo nào phủ (scripts/kiem-cheo/cau-hinh.mjs, _acceptance/kiem-cheo-chay-quang-lang/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
