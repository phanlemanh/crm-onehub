# Bộ phận còn trong khuôn thì không xoá vĩnh viễn được — thiết kế

Hồ sơ: `_acceptance/khuon-mat-bo-phan` (T2). Nguồn: mục Ngoài-3 và Ngoài-5 ở Cổng
Bằng chứng của `sua-luu-tru-dieu-phoi`, chủ kho chọn «mở hợp đồng mới» và quyết
`build` ngày 2026-09-22.

## Lỗi

Bước của khuôn kế hoạch lưu `departmentId` trong cột JSON `onboardingTemplate.steps`,
không có khoá ngoại. Bước của kế hoạch (`onboardingStep`) có khoá ngoại `Restrict`,
nên `purgeDepartment` đếm `_count.steps` và chặn được bộ phận đã dùng trong kế
hoạch — nhưng không thấy khuôn nào nhắc tới bộ phận. Hệ quả:

1. Lưu trữ khuôn K (bước giao cho bộ phận B), rồi lưu trữ B.
2. B không có bước kế hoạch nào → `purgeable: true` → xoá vĩnh viễn B thành công.
3. Khôi phục K → `kiemBoPhanDangDung` gặp mã B không còn → 404
   «Không có bộ phận nào mang mã <cuid>». K kẹt ở «Đã lưu trữ» mãi mãi.

## Hướng đã chọn — chặn xoá

Hai hướng khả dĩ, đã so:

| | Chặn xoá bộ phận còn trong khuôn | Cho khôi phục khuôn, bỏ bước mồ côi |
|---|---|---|
| Dữ liệu | Không mất gì | Khuôn mất bước, người phải soạn lại |
| Thay đổi | Một điều kiện ở máy chủ | Đổi luật khôi phục + báo bước rơi trên màn |
| Khớp luật vòng trước | Mở rộng đúng câu «chỉ xoá vĩnh viễn thứ chưa từng dùng» | Thêm một ngoại lệ mới |
| Chuẩn ngành | SQL `ON DELETE RESTRICT` | SQL `ON DELETE SET NULL` trên dữ liệu người soạn |

Chọn **chặn xoá**. «Đã dùng» của một bộ phận nay gồm: có bước kế hoạch trỏ tới,
**hoặc** có khuôn bất kỳ (kể cả đã lưu trữ) nhắc tới nó trong các bước.

Khuôn đang dùng không thể nhắc tới bộ phận đã lưu trữ (lưu trữ bộ phận bị chặn khi
khuôn đang dùng còn nhắc; soạn, sửa và khôi phục khuôn đều từ chối bộ phận đã lưu
trữ), nên trong thực tế người chỉ gặp ca khuôn đã lưu trữ. Máy chủ vẫn quét mọi khuôn
để không phụ thuộc vào bất biến đó.

## Thay đổi

Chỉ `apps/api/src/onboarding/`:

- `onboarding.service.ts`
  - Một hàm riêng quét mọi khuôn một lượt, trả bản đồ `departmentId → danh sách
    khuôn` (tên + cờ đã lưu trữ); một bộ phận có thể nằm trong nhiều khuôn, và
    thông điệp nêu hết. `khuonDungBoPhan` (chặn lưu trữ, chỉ khuôn đang dùng)
    dùng lại nó.
  - `boPhanRa` nhận thêm tập bộ phận đang bị khuôn nhắc tới; `purgeable` =
    đã lưu trữ ∧ không bước kế hoạch ∧ không khuôn nào nhắc.
  - Mọi thủ tục trả một bộ phận (`listDepartments`, `createDepartment`,
    `updateDepartment`, `archiveDepartment`, `restoreDepartment`,
    `reorderDepartments`) tính `purgeable` cùng một cách.
  - `purgeDepartment`: sau hai kiểm tra cũ (chưa lưu trữ, đã có bước kế hoạch), còn
    khuôn nhắc tới → 400 với thông điệp nêu tên khuôn.
- `onboarding-config.ts`: thông điệp mới
  `boPhanConTrongKhuon(khuon[])` — «Bộ phận này còn nằm trong khuôn X — xoá vĩnh
  viễn khuôn đó hoặc bỏ bộ phận khỏi khuôn trước.»

Màn hình không đổi mã: `da-luu-tru.tsx` đã chỉ hiện «Xoá vĩnh viễn» khi
`purgeable`, và `useLamMoiDieuPhoi` làm mới cả hai danh sách sau mọi lần xoá — nên
xoá vĩnh viễn khuôn xong, nút của bộ phận hiện ra ngay.

## Kiểm

Tệp mới `apps/api/test/khuon-mat-bo-phan.spec.ts`, supertest qua `AppModule` với
phiên thật từ `test/phien-thu.ts`, bốn khối `describe` ứng với bốn phép đo máy. Ma
trận chính so **quan hệ**: với mọi ca, `purgeable` trong danh sách đúng bằng việc
`purgeDepartment` thành công. Có ca một bộ phận nằm trong hai khuôn, và cả hai lối
dọn mà thông điệp chỉ (xoá khuôn trước; sửa khuôn bỏ bộ phận). Hai bài kiểm cũ của
`sua-luu-tru.spec.ts` (`-t api-xoa-vinh-vien`, `-t api-chan-luu-tru`) chạy lại làm hồi
quy, vì hàm chặn lưu trữ dùng lại hàm quét mới.

## Ngoài phạm vi

- Khuôn đã mồ côi từ trước khi sửa (nếu prod đã có ca xoá như trên) — không dò,
  không vá dữ liệu; `restoreTemplate` vẫn báo 404 với mã bộ phận.
- Cho biết lý do nút «Xoá vĩnh viễn» không hiện — đồng nhất với ca «đã dùng» hôm
  nay, cũng không có lý do trên màn.
- Cấu trúc hai cấp bộ phận/phòng ban — ô `cau-truc-to-chuc`.
