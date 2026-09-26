## Trong hợp đồng

- **thuoc-da-ky: an eval that never ran on base is quietly counted as "failed at base" and left out of the result**
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs:332`
  severity: high
  AC: AC-13
  chayTrenCay bỏ qua trạng thái exit của `bun run do:man` (spawnSync dòng 319). Nó chỉ throw khi ma.txt không tồn tại. Nếu phiên đo ở base chết giữa chừng (signal, timeout, hoặc server crash sau N lệnh), ma.txt chỉ còn N dòng đầu. Mọi eval khác sau đó nhận `ma.get(i) ?? -1` (dòng 332). Trong soEval, dòng 364 coi `maBase[i] !== 0` là "base khong dat, khong tinh", nên -1 (chưa từng chạy) bị gộp chung với một lỗi thật ở base. Các eval đó chỉ in một dòng `GHI CHU` và không bị ghi là SAI. `GHI CHU` không khớp bộ đọc `grep -E '^(SAI|KET|EXIT|KHONG)'` của quy trình, nên AC-13(a) có thể in EXIT 0 dù phần lớn eval đã ký chưa từng được so sánh thật. Cần sửa: coi -1 ở base là lỗi hạ tầng (SAI hoặc KHONG DO DUOC), và kiểm tra trạng thái của do:man cùng số dòng trong ma.txt.
  (source: bugs)

- **bang-the.json is only ever written, never read: the E13 red-direction mutation cannot turn red**
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs:268`
  severity: medium
  AC: AC-13
  evals.yaml E13 (b)/(c) và kế hoạch mô tả bang-the.json là bảng các phép thế tên được phép: áp ngược nó rồi mới kiểm từng cặp. Chiều đỏ của E13 là thêm cặp `{"toBe(2)": "toBe(3)"}` vào bang-the.json và kỳ vọng "SAI bang the". Nhưng script không bao giờ đọc bang-the.json (grep chỉ thấy writeFileSync ở dòng 268). Các cặp được rút ra từ chính diff, và mỗi lần chạy ghi đè toàn bộ file, kể cả các cặp đã fail capHopLe. Thêm một cặp bằng tay sẽ bị xoá ở lần chạy kế tiếp và không thể tạo ra SAI. bang-the.json đã commit (một artifact của round, nằm trong `paths` của E13) là một bản dump, không phải một hợp đồng — nó có thể liệt kê các cặp không hợp lệ (ví dụ "CRM" -> "Center") mà không ai kiểm. Cần đọc và áp dụng bang-the.json đúng như đặc tả, hoặc viết lại expected/CHIEU DO của E13 để mô tả đúng cơ chế thật.
  (source: bugs)

- **Hình dạng 3 (assert có mặt thay vì QUAN HỆ): bang-the.json do chính thước ghi đè từ diff rồi mới "kiểm", nên quan hệ «mọi chỗ lệch ⊆ bảng thế đã khai» không bao giờ được đo, và CHIEU DO của E13 là bất khả**
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs:268`
  severity: medium
  AC: AC-13
  AC-13 (contract.md:55) hứa các tệp thước đã ký «chỉ lệch merge-base bởi (i) các cặp trong `rang/bang-the.json`» — một quan hệ giữa diff và một bảng khai sẵn. Nhưng thuoc-da-ky.mjs không đọc bang-the.json ở đâu cả (chỉ `writeFileSync` dòng 268-275). Các cặp được rút từ chính hunk của diff (dòng 235-242), chấm bằng capHopLe, rồi ghi đè ra bảng — nên «nằm trong bảng đã khai» đúng theo định nghĩa. Hệ quả: CHIEU DO khai ở evals.yaml E13 (pha-thu thêm cặp `{"toBe(2)": "toBe(3)"}` -> "SAI bang the") không thể đỏ; cặp chèn tay bị bỏ qua lúc đọc và bị xoá khi script ghi lại bảng. Chiều đỏ thật hiện chỉ đến từ đối chứng tổng hợp trong doiChung, không phải từ con đường mà hồ sơ khai. bang-the.json nằm trong `paths` của E13 cũng không có tác dụng đo.
  (source: measurement)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **workspace-label.spec.ts leaves a double blank line where the deleted test was, so biome format fails and `bun run lint` goes red**
  Người dùng thấy gì: Việc đẩy code lên hoặc kiểm tra tự động ở khâu định dạng có thể bị chặn, nhưng người dùng cuối trên sản phẩm không thấy ảnh hưởng gì từ việc này.
  file: `apps/app/test/workspace-label.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **E13 CHIEU DO (b) pins the message "SAI the: <tep>", but a one-line edit prints "SAI bang the"**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng sản phẩm; chỉ là một dòng chữ mô tả trong bộ đo nội bộ không khớp với chữ thật máy in ra, có thể khiến người chấm đọc nhầm kết quả.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: low
  Đề xuất: known-limits

- **workspace-label.spec.ts fails biome check (two blank lines): `bun run lint` goes red**
  Người dùng thấy gì: Việc đẩy code lên hoặc kiểm tra tự động ở khâu định dạng có thể bị chặn, nhưng người dùng cuối trên sản phẩm không thấy ảnh hưởng gì từ việc này.
  file: `apps/app/test/workspace-label.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): bản vá tepTrongLenh chỉ có một đối chứng cho `cd` lồng trong chuỗi, trong khi config vẫn có dạng `cd` nối tiếp bằng đường tương đối mà hàm không bắt được**
  Người dùng thấy gì: Hiện tại chưa có ảnh hưởng gì tới đợt này, nhưng nếu một đợt sau sửa đúng vài tệp kiểm thử cũ đó, công cụ đo có thể báo "vẫn ổn" dù thật ra một phần thay đổi chưa được kiểm tra.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Product name and old default workspace name are defined a second time in workspace-label.ts (r1)**
  Người dùng thấy gì: Neu sau nay ai do doi ten san pham hoac ten khong gian mac dinh ma chi sua mot cho, tieu de tren dau trang co the hien khac voi ten khong gian duoc tao, gay nham lan cho nguoi dung.
  file: `apps/app/lib/workspace-label.ts`
  severity: medium
  Đề xuất: known-limits

- **KhoiHuongDan drops the Card and hand-sizes a display headline on a <p> in apps/app (r1)**
  Người dùng thấy gì: Khoi gioi thieu o cot trai co the khong dong bo cach chinh co chu voi cac khoi khac trong san pham ve sau, nhung nguoi dung hom nay van thay dung nhu mo ta — khong co khung, chu lon.
  file: `apps/app/components/cua-vao/khoi-huong-dan.tsx`
  severity: low
  Đề xuất: known-limits

- **The proto keeps a hand-drawn copy of LuoiCham after it moved to packages/ui (r1)**
  Người dùng thấy gì: Trang mau noi bo (khong phai trang khach hang thay) co the trong khac dan so voi trang dang nhap that theo thoi gian, nhung day khong phai man hinh nguoi dung thuc su nhin thay.
  file: `apps/app/app/proto/_modules/doi-ten-onehub-center/index.tsx`
  severity: low
  Đề xuất: known-limits

- **cua-vao-noi-tieng-viet o-ghim.json still pins the onboarding placeholder "CRM"/"crm"; DEFAULT_WORKSPACE_NAME change breaks cua_vao_khong_dich (r1)**
  Người dùng thấy gì: Trang dang ky/dung thu lan dau co the van goi y ten cong ty mau la ten cu o mot cho nho, va mot phep do khong lien quan toi vong nay co the bao loi khong an nhap.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/o-ghim.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): onehub-center-tieu-de.dom.tsx ghim dòng giới thiệu và mô tả khối hướng dẫn bằng kho messages, không đọc DOM đã vẽ (r1)**
  Người dùng thấy gì: Bai kiem tra dong gioi thieu tren trang dang nhap co the bao dat du trang that hien sai hoac thieu noi dung do, vi no khong thuc su nhin vao nhung gi hien len man hinh.
  file: `apps/app/test/onehub-center-tieu-de.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): ma trận 10 ca {vi,en} × 5 trang của onehub-center-tieu-de thực chất chỉ có 2 cây DOM khác nhau cho mỗi ngôn ngữ (r1)**
  Người dùng thấy gì: Bo kiem tra tuyen bo phu ca nam trang dang nhap/khoi phuc nhung thuc chat chi kiem mot kieu man hinh lap lai, nen loi rieng cua bon trang con lai co the khong bi phat hien.
  file: `apps/app/test/onehub-center-tieu-de.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 + 5: vạch (b) «không chú thích mới» của soi-ma.mjs không có đối chứng dương trong script, và regex chỉ bắt chú thích đứng đầu dòng (r1)**
  Người dùng thấy gì: Cong cu kiem tra 'khong them chu thich moi trong ma' co the bo sot mot so kieu chu thich, nen chu thich moi lot qua o dang do se khong bi phat hien.
  file: `_acceptance/doi-ten-onehub-center/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): onehub-center-thu.spec.ts ghim tiêu đề thư đặt lại bằng hằng số và `appName` bằng grep mã nguồn (r1)**
  Người dùng thấy gì: Bai kiem tra tieu de thu dat lai mat khau co the bao dat du thu that duoc gui ra mang tieu de khac, vi no so voi mot gia tri dinh san thay vi thu thuc te duoc dung.
  file: `packages/auth/test/onehub-center-thu.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).