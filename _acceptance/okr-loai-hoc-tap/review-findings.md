# Review findings: okr-loai-hoc-tap (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The wrong-kind check in tao-hoc-tap passes even if kind is never validated**
  Người dùng thấy gì: Bai kiem tra chua chung minh duoc he thong tu choi mot loai muc tieu viet sai. Neu sau nay ai do noi long quy tac nay, bai kiem van bao xanh va nguoi dung co the tao muc tieu mang loai la ma khong ai hay.
  file: `apps/api/test/okr-hoc-tap.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **The 'lessons written' rule lives in two places and can drift**
  Người dùng thấy gì: Quy tac the nao la da ghi dieu hoc duoc dang nam o hai cho. Hom nay chung khop nhau, nhung neu chi sua mot cho thi man cham diem co the bao Da tra loi trong khi he thong van khong cho dong ky.
  file: `apps/api/src/okr/khep.ts`
  severity: low
  Đề xuất: known-limits

- **Close dialog's KR-count sentence ends with a colon but the learning-objective list comes next**
  Người dùng thấy gì: Trong hop thoai dong ky, cau Con n KR chua cham ket thuc bang dau hai cham nhung ngay duoi lai la danh sach muc tieu hoc tap, nen nguoi doc co the hieu nham danh sach nao thuoc ve cau do.
  file: `apps/app/app/(app)/[slug]/settings/okr/hop-thoai-dong-ky.tsx`
  severity: low
  Đề xuất: wont-fix

- **Clearing a learning objective's lesson can race with closing the cycle, so a cycle can close with an empty lesson**
  Người dùng thấy gì: Neu mot nguoi xoa trang dieu hoc duoc dung luc quan tri dong ky, ky co the van dong voi mot muc tieu hoc tap bo trong. Chi xay ra khi hai thao tac trung dung khoanh khac, rat hiem.
  file: `apps/api/src/okr/okr-khep.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): đối chứng mã sai của E2 có tới hai lỗi cùng lúc nên mã 400 không chứng minh enum kind đã từ chối**
  Người dùng thấy gì: Bai kiem tra viec tu choi loai muc tieu sai co the xanh vi mot ly do khac, nen chua chac he thong that su chan loai viet sai. Nguoi dung co the khong duoc bao ve nhu ky vong neu quy tac nay bi go.
  file: `apps/api/test/okr-hoc-tap.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim đường dẫn Zod): E15 chỉ kiểm success === false trên schema của một trường, không parse mẫu đầu ra**
  Người dùng thấy gì: Bai kiem tra phan soan OKR cua Kara chi thu mot truong don le, chua thu ca mot ban soan day du. Neu co quy tac o cap cao hon chan loai Hoc tap, bai kiem van khong phat hien va Kara co the soan loi ma khong ai thay.
  file: `packages/validation/test/okr-loai-hoc-tap.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): nửa tiếng Anh của E10 đọc từ điển nhãn chứ không đọc Select đã dựng**
  Người dùng thấy gì: Bai kiem tra cac lua chon Loai bang tieng Anh chi doc bang nhan chu khong mo hop chon that. Neu hop chon dung nham nhan hoac thieu lua chon o tieng Anh, bai kiem van xanh.
  file: `apps/app/test/okr-hoc-tap-chon.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): bước 4 của E11/E13 đo lúc đổi nhãn sau khi KR của H đã chấm, khác điều kiện Given 'KR chưa có điểm' của AC-7**
  Người dùng thấy gì: Phep do tren man cham diem kiem tra viec doi nhan Chua tra loi sang Da tra loi trong tinh huong KR da co diem, khac voi tinh huong KR chua co diem ma ta hua. Truong hop KR chua co diem chua duoc do truc tiep o buoc nay.
  file: `_acceptance/okr-loai-hoc-tap/rang/man-hoc-tap.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bước 2 của E11/E13 đếm thuộc tính data-* thay vì đọc chữ nhãn và chữ chú thích hiển thị**
  Người dùng thấy gì: Phep do man chi kiem tra cac dau danh an trong ma chu khong doc chu nguoi dung that su thay. Neu nhan hoac chu thich bat buoc truoc khi dong ky hien sai chu, phep do van bao dat.
  file: `_acceptance/okr-loai-hoc-tap/rang/man-hoc-tap.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim thông điệp): dòng cong-bo của E7 chỉ khẳng định mã 400, không gắn với lý do học tập**
  Người dùng thấy gì: Bai kiem viec chan dong ky khi muc tieu hoc tap da cong bo chua ghi bai hoc chi thay co bi tu choi, khong kiem tra ly do. Co the bi chan vi mot nguyen nhan khac ma bai kiem van bao dung.
  file: `apps/api/test/okr-hoc-tap.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
