# Review findings: dieu-phoi-hai-tang (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A cham-tep request whose 'tep' is a string, not an array, gets approved by the machine, even for a protected file**
  Người dùng thấy gì: Nếu một phiên thợ gửi yêu cầu xin sửa tệp mà ghi sai kiểu (một chuỗi thay vì danh sách), máy vẫn tự duyệt, kể cả với tệp thuộc danh sách bảo vệ hoặc tệp của thợ khác. Hậu quả là người giám sát không được báo và hai thợ có thể sửa đè lên nhau.
  file: `scripts/dieu-phoi/yeu-cau.mjs`
  severity: high
  Đề xuất: new-contract

- **A xin/ request with a worktree path that does not exist locks its resource indefinitely and blocks every valid request**
  Người dùng thấy gì: Một đơn xin lượt ghi sai đường dẫn thư mục làm việc sẽ làm kẹt tài nguyên đó mỗi phút, các phiên khác đang chờ không bao giờ tới lượt, và bảng theo dõi ngừng cập nhật. Người giám sát chỉ nhận được một cảnh báo đầu tiên rồi im lặng.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: high
  Đề xuất: new-contract

- **Two timing values are still written inline, outside cau-hinh.mjs**
  Người dùng thấy gì: Nếu sau này chỉnh ngưỡng khoá trống, thông báo hiển thị cho người giám sát vẫn ghi con số cũ là 60 giây. Chu kỳ tự làm mới của bảng theo dõi cũng không chỉnh được ở một chỗ chung.
  file: `scripts/dieu-phoi/bang.mjs`
  severity: low
  Đề xuất: known-limits

- **ranh-gioi-them.json is written but never read, so the machine approves the same file for two different workers**
  Người dùng thấy gì: Hai phiên thợ lần lượt xin sửa cùng một tệp đều được máy tự duyệt, nên cả hai cùng sửa một tệp mà người giám sát không được báo. Xung đột chỉ lộ ra khi một bên đã đẩy nhánh lên.
  file: `scripts/dieu-phoi/yeu-cau.mjs`
  severity: high
  Đề xuất: new-contract

- **trongWorktree prefix match: a lock held by the main checkout is matched by every session in the nested .claude/worktrees**
  Người dùng thấy gì: Khi khoá S4 đang do kho chính giữ, mọi phiên thợ làm việc trong các thư mục con của kho đó cũng được coi là chủ khoá. Nhiều lượt kiểm chứng có thể chạy cùng lúc, và hạn thuê khoá bị gia hạn mãi dù người giữ thật đã đi.
  file: `scripts/dieu-phoi/dot.mjs`
  severity: high
  Đề xuất: new-contract

- **A xin request whose worktree path does not exist aborts every tick and jams the resource**
  Người dùng thấy gì: Một đơn xin lượt trỏ tới thư mục đã bị xoá hoặc gõ sai làm hỏng mỗi nhịp của bộ phát lịch, người giám sát bị đánh thức mỗi phút và các phiên khác chờ mãi không được cấp lượt.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **xin requests with a missing worktree or unknown loai are silently ignored forever, and the idle hook hides the stuck worker**
  Người dùng thấy gì: Một đơn xin ghi sai loại tài nguyên hoặc thiếu thư mục làm việc bị bỏ qua hoàn toàn, không có thông báo nào. Phiên thợ chờ mãi và người giám sát không hề biết nó đang kẹt.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 — khẳng định âm tính đứng một mình: E11 chỉ đo 'thoát 0' cho PostToolUse, Notification, UserPromptSubmit**
  Người dùng thấy gì: Nếu tệp cấu hình hook trỏ nhầm sang tệp khác cho ba hook phụ, phép kiểm tra vẫn báo xanh. Lỗi đó chỉ lộ khi chạy đợt thật.
  file: `_acceptance/dieu-phoi-hai-tang/rang/hook-that.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay theo khuôn của bên đọc: chu.json và tệp nhip không bao giờ đi vòng writer→reader**
  Người dùng thấy gì: Các phép kiểm tra tự dựng dữ liệu khoá thay vì lấy từ bộ phát lịch thật. Nếu sau này đổi cách ghi khoá ở một phía, kiểm tra vẫn xanh trong khi chặn S4 thật có thể sai.
  file: `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên lớp 'lệnh S4' nhưng thiếu phần tử s4-args trong ma trận phanLoai**
  Người dùng thấy gì: Không có phép kiểm tra nào cho lệnh chuẩn bị tham số S4. Nếu ai đó vô tình bỏ nó khỏi danh sách lệnh bị chặn, lệnh đó sẽ chạy mà không cần giữ khoá và không ai thấy.
  file: `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — ca giảm tải tuyên chặn 's4, ghim-lai, duong-nen' nhưng không có đơn ghim-lai**
  Người dùng thấy gì: Khi máy quá tải, việc ghim lại có bị hoãn đúng như hứa hay không chưa có phép kiểm tra riêng. Nếu hỏng, ghim lại vẫn chạy lúc máy đang yếu.
  file: `scripts/dieu-phoi/test/lich.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — AC-12 tuyên {xin, yeu-cau} × {JSON hỏng, thiếu phien/loai} nhưng chỉ đo một ô**
  Người dùng thấy gì: Chỉ một trong bốn kiểu tệp hỏng (đơn xin hỏng) được thử. Với yêu cầu hỏng hoặc tệp thiếu trường bắt buộc, việc chuyển vào thư mục lỗi và báo người giám sát chưa được kiểm chứng.
  file: `scripts/dieu-phoi/test/phat-lich.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — AC-3 có bốn nhánh ở mức nhịp, sự kiện gia-han không được khẳng định ở đâu**
  Người dùng thấy gì: Việc gia hạn lượt cho phiên còn đang làm việc và ghi lại sự kiện chưa có phép kiểm tra ở mức một nhịp đầy đủ. Nếu hỏng, phiên đang làm có thể bị thu hồi lượt hoặc không được gia hạn.
  file: `scripts/dieu-phoi/test/phat-lich.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — chỉ đo 'chuỗi có mặt' trong khi lời hứa là vị trí 'ở đầu trang'**
  Người dùng thấy gì: Cảnh báo giảm tải và dòng cần người có xuất hiện trên bảng, nhưng chưa có kiểm tra rằng chúng nằm ở đầu trang. Nếu bị dời xuống cuối, người giám sát có thể bỏ lỡ.
  file: `scripts/dieu-phoi/test/bang.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên 'đủ các khối' và 'escape mọi chuỗi' nhưng chỉ đo điểm-case**
  Người dùng thấy gì: Phần khoá đang giữ trên bảng chưa có phép kiểm tra nội dung, và việc chống chèn mã mới được thử ở một trường. Một trường khác thiếu bước làm sạch sẽ không bị phát hiện.
  file: `scripts/dieu-phoi/test/bang.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — ca 'khoá thuộc phiên khác → exit 2' không khẳng định mã thoát và regex không neo đầu**
  Người dùng thấy gì: Phép kiểm tra chỉ xác nhận thông báo từ chối có xuất hiện, không xác nhận lệnh thực sự bị chặn. Rủi ro thấp vì ca khác trong bộ kiểm tra đã đo mã thoát.
  file: `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 — đo nhãn trả về thay vì đầu ra: 'cho-luot'/'cho-tra-loi' không kiểm 'không ghi tệp'**
  Người dùng thấy gì: Khi phiên thợ đang chờ lượt hoặc chờ trả lời, hệ thống hứa không ghi gì vào danh sách chờ người, nhưng phép kiểm tra chỉ xem nhãn trả về. Nếu có ghi nhầm, người giám sát có thể thấy một mục chờ thừa.
  file: `scripts/dieu-phoi/test/hook-nhip-cho-nguoi.test.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
