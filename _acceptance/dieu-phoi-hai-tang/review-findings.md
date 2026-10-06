# Review findings: dieu-phoi-hai-tang (round 2)

## Trong hợp đồng

- **Every viec-phu request is machine-merged into itself and never reaches the supervisor**
  file: `scripts/dieu-phoi/phat-lich.mjs:135`
  severity: high
  AC: AC-9
  source: bugs
  detail: `yeuCauGanDay` is built from the raw entries of `docThuMucJson`. Those entries carry `_ten` but no `id`. In yeu-cau.mjs:54 the duplicate check `c.id !== yc.id` therefore compares `undefined !== '<ten>'`, which is always true, so the request being judged matches itself: same `kho`, same `tieu_de`, and `luc - luc = 0` is under one day. I reproduced this through `motNhip` with one `yeu-cau/P1-1.json` = {loai:'viec-phu', noi_dung:{kho:'crm', tieu_de:'...'}, luc:<now-1m>}. The scheduler wrote `tra-loi/P1-1.json` = {ket_qua:'gop', boi:'may', ly_do:'trùng yêu cầu undefined'}. It emitted no `can_phan` event. Any viec-phu that has `luc` (LUAT.md requires it) is silently closed as a duplicate, so the supervisor never sees it. A real match against an earlier request also reports `voi: undefined`. The unit test misses this because it passes a hand-built `yeuCauGanDay` that has `id` set. Fix: map entries to `{...y, id: y._ten}` when building `yeuCauGanDay`.

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): ca 'ba ca đỏ' của cham-tep khớp cả câu DUYỆT, nên kiểm danh sách bảo vệ không được đo**
  file: `scripts/dieu-phoi/test/yeu-cau.test.mjs:23`
  severity: high
  AC: AC-9
  source: measurement
  detail: Dòng 23-24 chỉ assert `.ly_do` khớp /danh sách bảo vệ/, không kiểm `ket_qua`. Nhưng câu lý do khi duyệt ở yeu-cau.mjs:43 là 'không ai giữ, không nhánh mở nào chạm, không thuộc danh sách bảo vệ', và câu đó cũng khớp regex này. Lời hứa của AC-9 là một quan hệ: tệp thuộc `bao_ve` hoặc `chung_chi_them` thì ra `ket_qua: can_phan` kèm đúng lý do. Đã chạy thử: gỡ hẳn dòng `if (khopMot(baoVe, t)) return { ket_qua: 'can_phan', … }` ở yeu-cau.mjs:35 thì cả 54/54 ca của `node --test scripts/dieu-phoi/test/*.test.mjs` vẫn xanh. Vậy cả hai ca bảo vệ mà E13 nêu (migrations/** và chung_chi_them messages/*.ts) đều không được đo. Không đột biến M nào trong dot-bien.mjs nhắm vào nhánh này.

- **Hình dạng 3 (lời hứa là quan hệ, test chỉ so hằng số): chu.json không kiểm cap_luc, cũng không kiểm han_thue_den = cap_luc + 90′**
  file: `scripts/dieu-phoi/test/phat-lich.test.mjs:60`
  severity: medium
  AC: AC-1
  source: measurement
  detail: AC-1 hứa chu.json có đủ `phien, slug, loai, worktree, cap_luc, han_thue_den`. Expected của E2 ghi rõ 'han_thue_den = cap_luc + 90 phút'. Thế nhưng dòng 60 chỉ deepEqual năm giá trị [phien, slug, loai, worktree, han_thue_den], với han_thue_den so với hằng '2026-10-05T13:30:00.000Z'. Test không đọc `cap_luc`. Đã chạy thử: xoá dòng `cap_luc: new Date(nowMs).toISOString(),` ở phat-lich.mjs:94 thì cả bộ 54/54 vẫn xanh. Trường bắt buộc vắng mặt mà không có ca nào đỏ, và quan hệ giữa hai mốc thời gian mà eval tuyên bố thì chưa được khẳng định.

- **Hình dạng 4 (đối chứng giả, không chạy luật cũ): nửa 'luật cũ không cấp ai' của ca phát lại 04/10 là hằng đúng**
  file: `scripts/dieu-phoi/test/lich.test.mjs:61`
  severity: medium
  AC: AC-2
  source: measurement
  detail: Test tính `luatCu` bằng `Object.keys(thayDiTruoc).filter((p) => thayDiTruoc[p] === null)` (dòng 61) trên một map viết tay mà không giá trị nào là null. Vì vậy `assert.equal(luatCu.length, 0, 'luật cũ phải tái hiện quãng kẹt')` luôn đúng, và không có mã luật cũ nào chạy trên cùng `donXin`. AC-2 và E3 hứa so sánh 'luật cũ cấp 0, capLuot cấp đúng 1' trên cùng một ca. Thực tế chỉ có vế `kq.length === 1` được đo, còn vế đối chứng không đỏ được dưới bất kỳ thay đổi nào. Thêm nữa, bốn đơn cùng slug 'a' và cùng loại s4 nên `kq.length === 1` chỉ khẳng định lại luật một lượt cho mỗi tài nguyên, mà ca 'capLuot: mỗi tài nguyên một lượt' đã đo rồi; tình huống kẹt chéo không được dựng thành đầu vào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **nhanhMo fails open: a gh/git failure becomes an empty map, and cham-tep is then approved by the machine**
  Người dùng thấy gì: Khi máy mất mạng hoặc chưa đăng nhập GitHub, hệ thống vẫn tự duyệt cho thợ sửa một tệp dù có nhánh khác đang sửa chính tệp đó, và không để lại dấu nào cho người giám sát biết việc kiểm tra chưa chạy.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: high
  Đề xuất: new-contract

- **dieu-phoi.config.json and hang-viec.json are read raw with no boundary check, and a wrong key fails silently or crashes the scheduler every tick**
  Người dùng thấy gì: Người giám sát gõ sai hoặc thiếu một khoá trong cấu hình hay danh sách việc thì bộ phát lịch có thể lặp lỗi mãi không cấp được lượt chạy kiểm, hoặc giao lại một việc đã gộp, mà không có thông báo nào nói rõ chỗ sai.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **hook-nhip and hook-cho-nguoi swallow every error with an empty catch, so a broken heartbeat inside a batch gets the lease reclaimed with no trace**
  Người dùng thấy gì: Nếu tín hiệu còn sống của một phiên thợ bị hỏng giữa đợt, khoá của phiên đó bị thu hồi mà người giám sát không thấy lý do nào được ghi lại.
  file: `scripts/dieu-phoi/hook-nhip.mjs`
  severity: medium
  Đề xuất: known-limits

- **The test:dieu-phoi suite is outside every gate (bun run test, pre-push, CI) even though the hook it covers runs on every tool call in the repo**
  Người dùng thấy gì: Một lần sửa sau này làm hỏng bộ chặn chạy kiểm vẫn có thể đi qua kiểm tra trước khi đẩy và CI, rồi chỉ lộ ra khi mở đợt thật: chặn nhầm mọi lệnh hoặc để hai lượt kiểm chạy chồng nhau.
  file: `package.json`
  severity: medium
  Đề xuất: new-contract

- **Open-branch conflict check fails open: gh/git errors are swallowed, so cham-tep gets machine-approved**
  Người dùng thấy gì: Khi không lấy được danh sách nhánh đang mở, hệ thống vẫn coi như không nhánh nào đụng tới tệp và tự duyệt cho thợ sửa, không báo cho ai biết việc kiểm tra đã không chạy.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **A signed but unmerged item falls back to 'chua' once the worker switches branch, and the scheduler hands it out again**
  Người dùng thấy gì: Khi thợ chuyển sang việc kế tiếp trong khi việc trước đã ký mà chưa gộp, hệ thống có thể bảo thợ làm lại việc trước và chưa báo được là đã hết việc.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: known-limits

- **Supporting finding (no severity): the scheduler wrongly reports the requesting session's own open branch as another session's edit**
  Người dùng thấy gì: Thợ đã có nhánh riêng đang sửa một tệp, khi xin sửa tiếp tệp đó vẫn bị chuyển cho người giám sát xét dù không cần.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (đếm theo loai thay cho quan hệ loai + can_phan): sự kiện giam-tai mất can_phan mà test vẫn xanh**
  Người dùng thấy gì: Khi máy quá tải và bộ phát lịch chuyển sang giảm tải, phiên giám sát phải được đánh thức một lần. Hiện tại việc đó vẫn đúng. Nhưng nếu sau này ai đó làm mất dấu đánh thức, bộ kiểm tra vẫn báo xanh, nên phiên giám sát có thể ngủ quên mà không ai hay.
  file: `scripts/dieu-phoi/test/phat-lich.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
