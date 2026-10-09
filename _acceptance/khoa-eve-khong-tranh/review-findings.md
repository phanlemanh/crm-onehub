# Review findings: khoa-eve-khong-tranh (round 2)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The child script in the spec reads chu.json raw: no zod parse and a hardcoded file name**
  Người dùng thấy gì: Chi anh huong cach viet bai thu: neu tep khoa doi dang, bai thu co the bao sai nguyen nhan that bai. Nguoi dung san pham khong thay gi; sua khong dang cong.
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **gianhKhoaCu: renaming back after a dau mismatch is unhandled, and the first rename swallows every error**
  Người dùng thấy gì: Khi ba lan chay bai thu cung tranh mot goc, bai thu co the dung lai voi loi he thong kho hieu va de sot mot thu muc khoa tam; hoac che mat nguyen nhan that khi may khong du quyen. Chi xay ra o bai thu chay song song, hiem.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: low
  Đề xuất: known-limits

- **moEve leaves the just-spawned eve dev running when ghiConVaoKhoa throws the new «da doi chu» error**
  Người dùng thấy gì: Khi mot bai thu phat hien khoa da bi doi chu, tien trinh eve no vua bat van chay mo coi va giu cong. Lan chay bai thu ke tiep tren cung thu muc se do 'dev server dang chay' va khong tu hoi phuc duoc cho toi khi nguoi xu ly tay.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: medium
  Đề xuất: new-contract

- **gianhKhoaCu puts the lock back with an unchecked renameSync: it overwrites an empty new lock or throws raw ENOTEMPTY and strands the live lock under .cu-**
  Người dùng thấy gì: Khi co luot chay thu ba chen vao dung luc luot cho tra khoa lai, hoac hai luot cung nghi minh giu khoa, hoac mot luot dung voi loi he thong kho hieu va khoa song con bi de ngoai cho cu. Chi xay ra khi ba bai thu tranh nhau trong khoang rat ngan.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: low
  Đề xuất: known-limits

- **While a waiting run has the lock renamed away, the live owner's traKhoaEve or exit cleanup does nothing, and the restored lock blocks the owner's own process**
  Người dùng thấy gì: Neu bai thu dang giu khoa ket thuc dung vao khoang rat ngan luot khac vua doi ten khoa cua no, khoa duoc tra lai khong co ai giu, va cac bai thu sau tren cung thu muc phai doi toi nam phut roi bao 'van bi giu'. Cua so rat hep.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): doi-chu chỉ kiểm 'khoá của B còn', không có đối chứng dương rằng chủ thật vẫn gỡ được khoá của chính mình**
  Người dùng thấy gì: Khong co bai thu nao kiem rang bai thu dang giu khoa van go duoc khoa cua chinh no khi xong. Neu viec go nay hong, thu muc khoa tam se bi de lai sau moi lan chay ma khong ai thay.
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): dòng (1) của ghi-tron không thể đỏ — xetKhoaCu false ở lần lấy khoá đầu là do thư mục vừa mkdir còn mới, không do ghi trọn**
  Người dùng thấy gì: Phep do lan lay khoa dau tien khong the bat duoc loi neu ai do doi cach ghi tep khoa ve kieu ghi de tai cho. Hanh vi hien tai van dung; chi mat mot lop canh bao som.
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm chuỗi có mặt thay cho quan hệ): hai-luot bước (5) chỉ dò pid của B như chuỗi con trong toàn bộ thông điệp lỗi**
  Người dùng thấy gì: Bai thu kiem 'loi co nhac so cua chu khoa' hoi long: neu sau nay loi nhac nham chu, bai thu van co the xanh do tinh co trung chuoi so. Khong anh huong nguoi dung hien tai.
  file: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): pham-vi.mjs kiểm 'config.yaml không có dòng bỏ' mà không có đối chứng dương**
  Người dùng thấy gì: Lenh kiem pham vi co the bo sot mot dong bi xoa trong tep cau hinh nghiem thu neu dong do co noi dung dac biet. Hiem va chi anh huong cong cu kiem, khong anh huong san pham.
  file: `_acceptance/khoa-eve-khong-tranh/rang/pham-vi.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
