# Review findings: dong-thoi-gian-giu-khi-loi (round 2)

## Trong hợp đồng

- **E7 rewritten mid-S4 to narrow signed AC-6 («ở 390 không có gì tràn ngang») and steer the judge away from the measured clipping**
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/evals.yaml:136`
  severity: medium
  AC: AC-6
  source: conventions
  detail: Contract AC-6 was approved at Gate 1 (approved_at 2026-10-08T10:15:22Z). It promises that at 390 nothing overflows horizontally («ở 390 không có gì tràn ngang»), with no exception for any area. In round 1, all three E7 judges returned UNCERTAIN on point (4) because the «Việc cần làm» row was clipped to «Vi…» and the «Đã xong» filter row was also clipped. Round 2 did not take that scope question back through Cổng Phạm vi. Instead it rewrote the E7 question so that it (a) redefines the scope of AC-6 as «trang và ngăn bản ghi», (b) tells the judge the two clipped rows are pre-existing and «người chấm xét dải lỗi và danh sách», and (c) gives the judge the measured number («trang 390/390») in the prompt instead of leaving it to be read from the evidence. In the same round, E6 «expected» (line 110) and man.mjs step 2 were changed to record the clipping in dtg-do-390.txt «chi ghi, khong tinh vao buoc». dtg-do-390.txt itself shows the two rows overflowing with no horizontal scroll (scrollWidth 438>348 and 459>390, «cuon ngang duoc false»). The question still asks (4) «ở 390 có chữ hay nút nào bị cắt hoặc tràn ngang không?» and then tells the judge to ignore the parts that are cut. So the eval no longer measures what the signed criterion promises (memory rule «luật đo phải chạm lời hứa»), and a PASS on E7 would read as AC-6 met when the measured screen breaks it as written. decisions.jsonl d-…-9 logs the narrowing as a «revisit», but changing the scope of a signed AC belongs at the gate, not in judge-prompt wording during S4. Fix: either keep the E7 question neutral and let the out-of-contract item go to Gate 2 as UNCERTAIN/REJECT, or have a person re-sign AC-6 with the narrowed scope before the eval relies on it.
  rationale: AC-6 hứa nguyên văn «ở 390 không có gì tràn ngang» cho ảnh tab Hoạt động, không có ngoại lệ nào trong Out of scope; finding nói hai hàng bị cắt ở 390 mà eval dặn người chấm bỏ qua, nên eval không đo đúng lời hứa đã ký.

- **E6 tooth measures a 390px horizontal overflow that AC-6 forbids, but logs it and still passes**
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs:315`
  severity: medium
  AC: AC-6
  source: bugs
  detail: AC-6 in the signed contract says nothing may overflow horizontally at 390. Step 2 now measures the composer row («Việc cần làm», scrollWidth 438 > 348) and the tab filter row («Đã xong», 459 > 390), and the screenshot dtg-xem-cu-loi-390.png shows both rows cut off. The script only writes these numbers to dtg-do-390.txt and prints "ghi so, khong tinh vao buoc". It never pushes them into `loi`, so d.dat(2, ...) passes. The E7 question in evals.yaml now also tells the judge that the "tràn ngang" scope is only the page and the sheet, and to grade just the error strip and the list. That narrows a signed criterion through eval wording, with no new Gate 1 approval. The overflow is real and pre-dates K6c (decision d-…-9), but as written E6 can go green and E7 can be steered to PASS while the evidence contradicts AC-6's literal text. Either amend AC-6 through the contract or list this as an open item outside the contract on the Gate 2 card. It should not be passed silently inside the tooth.
  rationale: Cùng gốc với mục trên: phép đo ở 390 thấy hai hàng tràn mà vẫn cho qua, trong khi AC-6 cấm tràn ngang ở 390 và Out of scope không loại trừ.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có ca lẻ): «ở 390 không có gì tràn ngang» chỉ đo hai hộp — trang và ngăn — trong khi chính bước 2 ghi được hai hàng bị cắt**
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs:148`
  severity: medium
  AC: AC-6
  source: measurement
  detail: AC-6 hứa cả một lớp: «ở 390 không có gì tràn ngang». Bước 2 của E6 chỉ khẳng định trên hai điểm. docMan (dòng 148-167) so documentElement.scrollWidth với clientWidth, so [data-slot=sheet-content|drawer-content].scrollWidth với clientWidth, rồi kiểm nút «Thử lại» trong khung (dòng 313-314). Phần tràn bị một hộp con overflow:hidden cắt mất thì không bao giờ nâng scrollWidth của trang hay của ngăn, nên phép đo không thấy nó. Bước 2 tự chứng minh chỗ hở này: phần đo mới (dòng 315-360) ghi vào dtg-do-390.txt hàng «Việc cần làm» scrollWidth 438 > clientWidth 348 và hàng «Đã xong» 459 > 390, cả hai «cuon ngang duoc false». Ảnh dtg-xem-cu-loi-390.png cũng thấy «Vi…» và «Đã xong» bị cắt. Vậy mà trang vẫn ghi 390/390 và bước vẫn «dat». Kết quả đo hai hàng này không đi vào loi[] (dòng 361-362, «khong tinh vao buoc»). evals.yaml E6 thu hẹp lời hứa thành «scrollWidth <= clientWidth cua trang va ngan». Câu hỏi E7 (evals.yaml dòng 135-139) bảo người chấm rằng phạm vi là trang và ngăn, rằng hai hàng bị cắt là hành vi có sẵn, và rằng «người chấm xét dải lỗi và danh sách». Như vậy cả phép đo máy lẫn phép chấm đều được dặn bỏ qua phần tử thuộc lớp đã hứa. Không có ma trận viết trước nào liệt kê các phần tử ở 390 cần kiểm (hàng soạn, hàng lọc, dải lỗi, danh sách, đầu ngăn). Vế 390 của AC-6 có được hẹp lại hay không là việc của triage; về hình dạng đo thì đây là lời hứa cho cả lớp mà chỉ có hai ca lẻ.
  rationale: AC-6 hứa cho cả lớp «không có gì tràn ngang» ở 390, còn phép đo máy chỉ khẳng định hai hộp (trang và ngăn) nên không phủ lời hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **dtg-do-390.txt «cuon ngang duoc» is always false and does not measure scrollability**
  Người dùng thấy gì: Ghi chú trong bằng chứng nói hai hàng bị cắt ở màn điện thoại là không cuộn ngang được, nhưng con số này luôn ra «không» nên chưa chứng minh được điều đó. Người xem có thể hiểu sai là đã kiểm chắc việc người dùng không chạm tới được chữ bị cắt.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): E6 bước 1 khai «dòng cuối (số 35) trong khung nhìn» nhưng chỉ đếm 35 dòng và một cận dưới, không khẳng định dòng cuối là số 35**
  Người dùng thấy gì: Sau khi bấm «Thử lại», máy chỉ đếm đủ số dòng chứ chưa kiểm dòng cuối đúng là hoạt động cũ nhất. Nếu trang cũ hơn bị nối nhầm lên đầu danh sách, phép đo tự động vẫn báo đạt và chỉ người nhìn ảnh mới phát hiện.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Cờ lỗi của TanStack giữ status "error" qua lượt tải sau, nên thông báo xem-cu / lam-moi bật sai lượt (báo lỗi khi request đang chạy, và tắt im lặng cảnh báo làm mới hỏng) (r1)**
  Người dùng thấy gì: Khi tab Hoạt động vừa báo lỗi làm mới rồi người dùng bấm «Xem cũ hơn» (hoặc ngược lại), thông báo lỗi có thể hiện sai lúc: báo «không tải được hoạt động cũ hơn» khi yêu cầu còn đang chạy, hoặc làm mất cảnh báo «không làm mới được» dù các hoạt động đầu danh sách chưa hề được làm mới.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): E1/E6 không đo thông báo xem-cũ nằm ở cuối danh sách (r1)**
  Người dùng thấy gì: Nếu thông báo «Không tải được hoạt động cũ hơn» bị đặt nhầm lên đầu danh sách thay vì ở cuối, các kiểm tra tự động vẫn xanh; chỉ người xem ảnh chụp màn hình mới phát hiện ra.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có ca lẻ): vế «Thử lại tắt khi đang tải» chỉ đo ở ô xem-cũ (r1)**
  Người dùng thấy gì: Nút «Thử lại» của thông báo «Không làm mới được hoạt động» có thể không bị tắt khi đang tải mà không có kiểm tra tự động nào bắt được, nên bấm liên tiếp có thể gửi chồng yêu cầu.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
