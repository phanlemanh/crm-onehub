# Review Findings: doi-ten-onehub-center (round 1)

## Trong hợp đồng

- **chieu-do E2 mutation now copies the EN `both` string, so the "khong khac nhau tung doi mot" check can never fire**
  file: `_acceptance/man-xin-quyen-co-rang/rang/chieu-do.mjs:68`
  severity: medium
  source: bugs
  AC: AC-13
  detail: The regex was changed from /both: "(CRM[^"]*)"/ to /both: "(OneHub Center[^"]*)"/. In apps/app/lib/messages/auth.ts the EN block comes first. EN `both` (line 49) is now "OneHub Center reads your mail…", while at base it was "This CRM reads…" and did not match. So match() now picks the EN string, not the VI one (line 165). The mutation then puts English text into VI `microsoft`. The VI triple {google, microsoft, both} is still 3 distinct values, so lenhBaNhanh does not report `kho chuoi vi: ba nhanh khong khac nhau tung doi mot` and exits 0 instead of the expected 1. The chieu-do mutation run for this signed profile then goes red for E2 (a false red), and the mutation no longer tests what its pin claims. Fix: anchor the regex to the VI text, e.g. /both: "(OneHub Center đọc[^"]*)"/.
  rationale: Day la mot tep thuoc cua ho so da ky duoc vong nay sua, va thay doi lam no lech merge-base bang mot bien doi ngoai pham vi thay-ten cho phep (regex khop nham chuoi khac, lam mat kha nang bat loi that), vi pham dieu kien (i) cua AC-13.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Product name and old default workspace name are defined a second time in workspace-label.ts**
  Người dùng thấy gì: Neu sau nay ai do doi ten san pham hoac ten khong gian mac dinh ma chi sua mot cho, tieu de tren dau trang co the hien khac voi ten khong gian duoc tao, gay nham lan cho nguoi dung.
  file: `apps/app/lib/workspace-label.ts`
  severity: medium
  Đề xuất: known-limits

- **KhoiHuongDan drops the Card and hand-sizes a display headline on a <p> in apps/app**
  Người dùng thấy gì: Khoi gioi thieu o cot trai co the khong dong bo cach chinh co chu voi cac khoi khac trong san pham ve sau, nhung nguoi dung hom nay van thay dung nhu mo ta — khong co khung, chu lon.
  file: `apps/app/components/cua-vao/khoi-huong-dan.tsx`
  severity: low
  Đề xuất: known-limits

- **The proto keeps a hand-drawn copy of LuoiCham after it moved to packages/ui**
  Người dùng thấy gì: Trang mau noi bo (khong phai trang khach hang thay) co the trong khac dan so voi trang dang nhap that theo thoi gian, nhung day khong phai man hinh nguoi dung thuc su nhin thay.
  file: `apps/app/app/proto/_modules/doi-ten-onehub-center/index.tsx`
  severity: low
  Đề xuất: known-limits

- **The test for 'no file imports auth-shader' passes silently when git fails**
  Người dùng thấy gì: Mot bai kiem tra tu dong co the bao 'dat' du viec go bo nen cu chua thuc su duoc xac minh, khien nguoi sau lam tuong da an toan trong khi chua chac chan.
  file: `apps/app/test/onehub-center-nen.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **workspace-label.spec.ts needs origin/onehub when the file loads: it fails in shallow CI and loses its CRM case after merge**
  Người dùng thấy gì: Bai kiem tra tu dong ve ten khong gian cu co the bao loi gia tren may chu kiem tra tu dong, hoac mat kha nang phat hien loi anh xa ten cu sau khi nhanh nay duoc gop, du san pham that van hoat dong dung.
  file: `apps/app/test/workspace-label.spec.ts`
  severity: high
  Đề xuất: known-limits

- **thuoc-da-ky treats "base eval never ran" (-1) as "base red" and skips it silently, with no minimum on how many evals were compared**
  Người dùng thấy gì: Bao cao bang chung cuoi vong co the ghi 'khong sai cho nao' du tren thuc te mot so phep so sanh da bi bo qua am tham, khien nguoi ky duyet hieu nham muc do da duoc kiem chung.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **cua-vao-noi-tieng-viet o-ghim.json still pins the onboarding placeholder "CRM"/"crm"; DEFAULT_WORKSPACE_NAME change breaks cua_vao_khong_dich**
  Người dùng thấy gì: Trang dang ky/dung thu lan dau co the van goi y ten cong ty mau la ten cu o mot cho nho, va mot phep do khong lien quan toi vong nay co the bao loi khong an nhap.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/o-ghim.json`
  severity: medium
  Đề xuất: known-limits

- **nhapAuthShader swallows every git error as "no import", so the test passes vacuously**
  Người dùng thấy gì: Bai kiem tra tu dong co the luon bao xanh ngay ca khi viec ra soat khong chay duoc, nen khong ai biet khi no ngung hoat dong dung.
  file: `apps/app/test/onehub-center-nen.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): thuoc-da-ky.mjs chỉ nhận ra tệp thước ở lệnh bắt đầu bằng `cd X &&`, nên bỏ sót dạng `bun run test -- "cd <gói> && bun test test/..."`**
  Người dùng thấy gì: Hai bai kiem tra thuoc cac tinh nang da hoan tat truoc do co the khong duoc ra soat lai trong vong nay, nen mot thay doi ngoai y muon o do co the lot qua ma khong ai biet.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 (đo sai cây/ref thay vì cây đang kiểm): workspace-label.spec.ts rút «tên cũ» từ `merge-base HEAD origin/onehub` lúc chạy, nên đỏ trên mọi nhánh sau khi vòng này merge**
  Người dùng thấy gì: Sau khi gop nhanh nay, bai kiem tra ten khong gian cu co the tu bao do tren may chu kiem tra va mat kha nang phat hien loi anh xa ten cu, du san pham that van hoat dong dung.
  file: `apps/app/test/workspace-label.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): onehub-center-tieu-de.dom.tsx ghim dòng giới thiệu và mô tả khối hướng dẫn bằng kho messages, không đọc DOM đã vẽ**
  Người dùng thấy gì: Bai kiem tra dong gioi thieu tren trang dang nhap co the bao dat du trang that hien sai hoac thieu noi dung do, vi no khong thuc su nhin vao nhung gi hien len man hinh.
  file: `apps/app/test/onehub-center-tieu-de.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): ma trận 10 ca {vi,en} × 5 trang của onehub-center-tieu-de thực chất chỉ có 2 cây DOM khác nhau cho mỗi ngôn ngữ**
  Người dùng thấy gì: Bo kiem tra tuyen bo phu ca nam trang dang nhap/khoi phuc nhung thuc chat chi kiem mot kieu man hinh lap lai, nen loi rieng cua bon trang con lai co the khong bi phat hien.
  file: `apps/app/test/onehub-center-tieu-de.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): `nhapAuthShader` nuốt mọi lỗi của git grep thành chuỗi rỗng, nên «không tệp nào nhập auth-shader» xanh cả khi quét không chạy**
  Người dùng thấy gì: Bai kiem tra 'khong con nen cu' co the luon bao dat ngay ca khi viec ra soat bi loi ngam, khong the phan biet 'da kiem tra va sach' voi 'khong kiem tra duoc gi'.
  file: `apps/app/test/onehub-center-nen.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 + 5: vạch (b) «không chú thích mới» của soi-ma.mjs không có đối chứng dương trong script, và regex chỉ bắt chú thích đứng đầu dòng**
  Người dùng thấy gì: Cong cu kiem tra 'khong them chu thich moi trong ma' co the bo sot mot so kieu chu thich, nen chu thich moi lot qua o dang do se khong bi phat hien.
  file: `_acceptance/doi-ten-onehub-center/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): phần (a) của thuoc-da-ky.mjs loại im lặng mọi eval không đạt ở base, không có sàn số ca so được**
  Người dùng thấy gì: Bao cao cuoi vong co the ghi 'khong phat hien sai lech' du tren thuc te phan lon hoac toan bo so kiem tra so sanh da bi loai bo do moi truong loi, khien nguoi ky hieu nham muc do da duoc kiem chung.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): onehub-center-thu.spec.ts ghim tiêu đề thư đặt lại bằng hằng số và `appName` bằng grep mã nguồn**
  Người dùng thấy gì: Bai kiem tra tieu de thu dat lai mat khau co the bao dat du thu that duoc gui ra mang tieu de khac, vi no so voi mot gia tri dinh san thay vi thu thuc te duoc dung.
  file: `packages/auth/test/onehub-center-thu.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
