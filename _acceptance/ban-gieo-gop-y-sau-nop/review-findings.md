# Review findings: ban-gieo-gop-y-sau-nop (round 2)

## Trong hợp đồng

- **E3 leaves already-modified evidence files overwritten without saying so; the check only compares git status lines**
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs:89`
  severity: medium
  AC: AC-3
  source: bugs
  detail: traBangChung only compares `git status --porcelain` line sets: `moi`/`con` are lines not present in `truoc`. Take a tracked evidence file that was already modified before the command. Its line is ` M path` before and after, so it is never restored. That part is intended ("tệp đã bẩn từ trước giữ nguyên"). But the post-restore check cannot see that the command changed the file's contents again. gy_man_that runs man-gop-y.mjs with no --do flag, so it calls `screenshot({path})` straight into _acceptance/gop-y-dung-cho/evidence (man-gop-y.mjs:55-61, 154, 329). Concrete case: a previous E3 run exits partway through via khongDo, for example when git checkout fails on command 2, and leaves gop-y-dung-cho/evidence/E23-*.png modified. On the next run those files are in `truoc`. They get overwritten with fresh screenshots and are never restored, yet the script prints 'tra lai 0 tep bang chung' and passes the check. The same happens to a person's uncommitted regenerated screenshots in that folder: they are silently replaced. E3's expected text promises that pre-dirty files are kept and that any file differing from its pre-command state ends in 'KHONG DO DUOC' with a stop code; with this status-line-only comparison neither promise holds. A related edge case: if the command deletes a file that was already modified, the new ` D` line lands in `sua`, and `git checkout --` restores the HEAD version, discarding the pre-existing changes while reporting success. Fix: snapshot the content hash (`git hash-object`) of every file already dirty or untracked in `truoc`, compare after the restore, and call khongDo on any difference.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Exit 2 leaves the previous run's passing lines in evidence/ba-ban-do.txt**
  Người dùng thấy gì: Nếu lượt đo bị dừng giữa chừng vì không trả lại được ảnh, tệp bằng chứng vẫn giữ dòng kết quả đạt của lần chạy trước. Ai chỉ mở tệp mà không xem kết quả chạy có thể tưởng lượt mới đạt.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs`
  severity: low
  Đề xuất: known-limits

- **dot-bien xoá mọi bản sao .san-gop-y-vet-* lúc khởi động, kể cả bản sao của một lượt dot-bien khác đang chạy (r1)**
  Người dùng thấy gì: Nếu hai lượt phá thử chạy cùng lúc trên một cây, lượt này có thể xoá bản sao đang dùng của lượt kia. Kết quả là báo «không đo được» hoặc báo nhầm vết lọt. Chạy lại từng lượt một thì hết.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc (hình 2): ca 'loi' dùng outcome không tồn tại, việc giả chép tay khuôn select của nop() (r1)**
  Người dùng thấy gì: Một ca thử dùng giá trị kết cục mà hệ thống thật không bao giờ ghi ra. Phép thử vẫn chặn đúng việc đóng sai, nhưng nếu tên kết cục thật đổi thì ca này không báo kịp.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/kiem-nop.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): vết (c) chỉ đòi bộ phân loại nói 'khong qua', không đối chứng dương trong cùng lượt (r1)**
  Người dùng thấy gì: Nếu bộ phân loại hỏng theo kiểu luôn báo «không qua bước gieo», phép thử phá này vẫn xanh. Lỗi đó chỉ lộ ra ở một phép đo khác chứ không ở chính phép thử này.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
