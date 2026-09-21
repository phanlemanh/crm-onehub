## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **startedAt uses z.coerce.date() at the API boundary instead of the repo's strict date parse**
  Người dùng thấy gì: Neu du lieu ngay bat dau bi loi hoac thieu, he thong co the van tao ke hoach voi ngay sai (vi du nam 1970) thay vi bao loi ro rang cho nguoi dung.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **KhungTao keeps the sheet's open state in useState, unlike every other create sheet in the app**
  Người dùng thấy gì: Khong the gui lien ket mo san cac hop thoai tao moi nay cho dong nghiep, va neu nguoi dung lo tai lai trang khi dang mo hop thoai thi hop thoai se dong lai.
  file: `apps/app/components/onboarding/khung-tao.tsx`
  severity: medium
  Đề xuất: known-limits

- **Step row in the template editor adds its own bordered surface with the wrong radius**
  Người dùng thấy gì: Khung quanh moi buoc trong man soan khuon co goc bo hoi khac voi cac khung khac trong san pham — mot chi tiet nho ve mat hinh anh.
  file: `apps/app/app/(app)/[slug]/settings/onboarding/soan-khuon.tsx`
  severity: low
  Đề xuất: known-limits

- **Tunable values sit inline, and the client's day limit disagrees with the server's**
  Người dùng thấy gì: Neu ai do nhap so ngay rat lon (vi du 400) cho mot buoc, nut Luu van bam duoc nhung khi luu se hien mot thong bao loi ky thuat kho hieu thay vi loi nhac ro rang la ngay vuot gioi han.
  file: `apps/app/app/(app)/[slug]/settings/onboarding/soan-khuon.tsx`
  severity: low
  Đề xuất: known-limits

- **Eval paths leave out the shared dialog shell (khung-tao.tsx), so edits to it will not mark E11/E14 evidence stale**
  Người dùng thấy gì: Neu sau nay ai do sua lai hop thoai dung chung hoac doi nhan loi, he thong nghiem thu tu dong co the khong nhan ra va van bao moi thu da qua kiem.
  file: `_acceptance/noi-bon-nut-dieu-phoi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **The Add broker button silently overwrites the source of an existing enrollment from nen-tang to tay**
  Người dùng thấy gì: Neu chon them mot nguoi vao ke hoach ma nguoi do da co mat trong pheu (duoc dong bo tu dong tu truoc), nguon ghi danh cua ho se am tham doi thanh 'them tay' ma khong co canh bao nao.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/them-moi-gioi.tsx`
  severity: medium
  Đề xuất: known-limits

- **Lookup queries in the new dialogs show a failed load as an empty result**
  Người dùng thấy gì: Neu viec tai danh sach cong ty, khuon hoac chu so huu bi loi mang, nguoi dung chi thay o chon trong nhu khong co ket qua, khong co thong bao la da xay ra loi.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/them-moi-gioi.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion without a pinned message): the E9 and E8 failing directions do not fail with the case name the eval promises**
  Người dùng thấy gì: Neu ve sau nut bi an sai cho, bo kiem tu dong co the chi bao loi chung chung thay vi chi dung nguyen nhan, khien nguoi xem kho biet cho nao hong.
  file: `apps/app/test/noi-bon-nut.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (string presence instead of a relation): ngay den han = startedAt + offsetDays is only checked on the step with offsetDays = 0**
  Người dùng thấy gì: Bai kiem tu dong hien chi chac chan ngay den han dung cho buoc khong co do tre; neu cach tinh ngay den han cho cac buoc co do tre bi sai, bo kiem co the khong phat hien ra.
  file: `apps/api/test/noi-bon-nut.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims a class but checks only some cases): luu-hong promises 'tung o da nhap giu gia tri' but giu() samples only one or two fields per dialog**
  Người dùng thấy gì: Bo kiem tu dong hien chi xac nhan mot hoac hai o duoc giu lai sau khi luu hong; neu mot o khac trong cung hop thoai bi mat gia tri khi luu hong, nguoi dung co the gap loi ma khong co bai kiem nao bat duoc.
  file: `apps/app/test/noi-bon-nut.dom.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/10 lỗi rơi vào file không bộ đo nào phủ (apps/app/components/onboarding/khung-tao.tsx, _acceptance/noi-bon-nut-dieu-phoi/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
