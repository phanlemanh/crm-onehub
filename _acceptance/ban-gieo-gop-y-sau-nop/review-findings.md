# Review findings: ban-gieo-gop-y-sau-nop (round 1)

## Trong hợp đồng

- **ba-ban-do ignores git checkout/status failures yet reports evidence files as restored**
  AC: AC-3
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs:68`
  severity: low
  source: bugs
  detail: traBangChung() calls spawnSync("git", ["checkout", "--", ...sua]) and never reads r.status or r.error. It then returns sua.length + them.length, and the caller prints 'tra lai <n> tep bang chung' whether or not the checkout worked. trangThaiBangChung() also ignores git status failures: a failed status returns an empty Set, so the 'before' snapshot is empty and nothing is restored. Failure case: a parallel S4 lane or another git process holds .git/index.lock (the project memory notes lanes running side by side in one tree). git checkout then fails with 'Unable to create index.lock'. The evidence files that gy_man_that, r1a_man_chip or r1d_man_okr modified in gop-y-dung-cho, khung-okr-truoc-r1 and okr-to-chuc-va stay dirty. The script still prints 'tra lai N tep bang chung' and exits 0, so AC-3's promise to put the evidence back fails without any sign. Fix: check r.status after each git call and fail the run (or print a KHONG DO DUOC line) when it is non-zero.
  rationale: AC-3 hứa ảnh bằng chứng của ba hồ sơ kia không bị đổi sau lượt; khôi phục thất bại mà vẫn báo đã trả lại là vi phạm trực tiếp lời hứa đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **dot-bien xoá mọi bản sao .san-gop-y-vet-* lúc khởi động, kể cả bản sao của một lượt dot-bien khác đang chạy**
  Người dùng thấy gì: Nếu hai lượt phá thử chạy cùng lúc trên một cây, lượt này có thể xoá bản sao đang dùng của lượt kia. Kết quả là báo «không đo được» hoặc báo nhầm vết lọt. Chạy lại từng lượt một thì hết.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc (hình 2): ca 'loi' dùng outcome không tồn tại, việc giả chép tay khuôn select của nop()**
  Người dùng thấy gì: Một ca thử dùng giá trị kết cục mà hệ thống thật không bao giờ ghi ra. Phép thử vẫn chặn đúng việc đóng sai, nhưng nếu tên kết cục thật đổi thì ca này không báo kịp.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/kiem-nop.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): vết (c) chỉ đòi bộ phân loại nói 'khong qua', không đối chứng dương trong cùng lượt**
  Người dùng thấy gì: Nếu bộ phân loại hỏng theo kiểu luôn báo «không qua bước gieo», phép thử phá này vẫn xanh. Lỗi đó chỉ lộ ra ở một phép đo khác chứ không ở chính phép thử này.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
