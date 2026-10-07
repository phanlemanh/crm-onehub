# Review findings: dieu-phoi-gia-han-va-lenh-boc (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tra-loi shape check is written inline in phat-lich.mjs instead of a kiem* validator in hinh-dang.mjs, and the quarantine logic is duplicated**
  Người dùng thấy gì: Neu nguoi giam sat ghi tep tra loi gia han dung dang object nhung sai kieu o mot truong (vi du so phut viet thanh chuoi), bo dieu phoi se khong coi do la tep hong. No bao mot canh bao gia han khong ap dung voi ly do gay nham, va tep van nam lai o cho cu. Dot khong dung nhip, nhung nguoi giam sat phai doan nguyen nhan.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: known-limits

- **README for the dieu-phoi round does not document the tra-loi/hong + tra-loi-hong event or the env-prefix form of giu-nhip**
  Người dùng thấy gì: Khi nguoi giam sat gap canh bao tra loi bi hong, huong dan van hanh chua noi phai lam gi, va chua noi lenh giu nhip nay chap nhan bien moi truong dat truoc lenh. Chuc nang van chay dung, chi la nguoi van hanh phai tu suy ra cach xu ly.
  file: `scripts/dieu-phoi/README.md`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (presence instead of relation): bang.html is only checked for existence, and setup has already written it**
  Người dùng thấy gì: Phep kiem tu dong chi xac nhan bang theo doi da ton tai chu chua chung minh no duoc lam moi dung trong nhip do. Hanh vi that van dung, nen chua thay hau qua nao cho nguoi dung; rui ro chi la mot loi sau nay co the khong bi test bat.
  file: `scripts/dieu-phoi/test/gia-han-va-lenh-boc.test.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
