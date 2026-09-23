# Ngày gieo của test «bước của tôi» theo ngày giờ VN

Hồ sơ: `_acceptance/ngay-gieo-theo-gio-vn/`

## Vấn đề

Ca `viec-cua-toi` trong `apps/api/test/moi-phia-ke-hoach.spec.ts` đỏ mỗi khi chạy
trong khung 00:00–07:00 giờ Việt Nam và xanh ngoài khung đó. Đã tái hiện trên
`origin/onehub` 607fe361 lúc 06:44 VN ngày 23/09: thông điệp «scope me: tap va thu
tu; ke hoach da dong khong lot vao», bước `D+4` lọt vào danh sách. Đường nền của
vòng này cũng đỏ đúng một ca đó trong cả suite.

## Gốc

Hàm gieo `ngayCach(soNgay)` ở `apps/api/test/support/ke-hoach-gieo.ts` dựng hạn
theo ngày UTC: `Date.UTC(getUTCFullYear, getUTCMonth, getUTCDate() + soNgay)`.
Sau hồ sơ `han-viec-theo-ngay`, sản phẩm tính cửa sổ «bước của tôi» theo ngày giờ
VN: `dauNgayVN(now) + (cuaSoNgay + 1) ngày` (`apps/api/src/dashboard/dashboard.service.ts`,
`packages/db/src/onboarding-nhac.ts`). Từ 00:00 tới 07:00 VN, ngày VN đã sang còn
ngày UTC chưa, nên «D+4 theo UTC» rơi vào «trước nửa đêm VN của D+4».

Đặt `TZ=Asia/Ho_Chi_Minh` trong lệnh không chữa được: hàm dùng `getUTC*`, không
đọc múi giờ tiến trình.

## Cách sửa

Hạn gieo lấy ngày lịch VN hôm nay rồi cộng số ngày, lưu ở nửa đêm UTC của ngày
đó:

```ts
new Date(Date.parse(`${ngayVN(new Date())}T00:00:00Z`) + soNgay * DAY_MS)
```

`ngayVN` nhập từ `@crm/db/onboarding-nhac` (`packages/db/src/onboarding-nhac.ts`),
đúng hàm dịch vụ tổng quan dùng để in ngày của bước. Đây đúng là khuôn sản phẩm
lưu hạn bước: `ngayLich` trong
`onboarding.contracts.ts` biến `"YYYY-MM-DD"` thành `YYYY-MM-DDT00:00:00.000Z`,
và `startedAt + offsetDays` giữ nguyên khuôn đó. Hệ quả: `ngayVN(dueAt)` của sản
phẩm và `toISOString().slice(0, 10)` của test trả cùng một ngày, nên không khẳng
định nào phải nới.

## Ghim hành vi

Ca `viec-cua-toi` chạy hai lần dưới `setSystemTime`:

| Khung | Mốc UTC | Giờ VN | Ngày của D-1, D, D+3, D+4 |
| --- | --- | --- | --- |
| `khung-dem` | 2026-09-22T23:30:00Z | 06:30 23/09 (UTC còn 22/09) | 22/09, 23/09, 26/09, 27/09 |
| `khung-ngay` | 2026-09-22T13:54:00Z | 20:54 22/09 (cùng ngày UTC) | 21/09, 22/09, 25/09, 26/09 |

Ngày mong đợi là hằng viết trước, không suy lại từ hàm đang đo. Thêm ca
`ngay-gieo-theo-vn` đo thẳng hàm gieo ở hai mốc, so với chính `ngayLich` của sản
phẩm (ma trận 4 số ngày × 2 mốc).

## Chiều đỏ

Răng `_acceptance/ngay-gieo-theo-gio-vn/rang/dot-bien-utc.mjs` chép tệp test, bộ
gieo và fixture sang `apps/api/.sao-ngay-<pid>/` — thư mục ẩn, nên `bun test` quét
toàn gói không nhặt được, và S4 chạy song song không đụng. Lượt một: bản sao
nguyên vẹn, bốn ca phải xanh. Lượt hai: trả `ngayCach` về cách tính UTC trong bản
sao; hai ca `khung-dem` phải đỏ với thông điệp ghim, hai ca `khung-ngay` phải
xanh. Kết quả đọc từ tệp junit, từng ca theo tên.

Mỗi lượt đi qua `bun run test --`, nên có cơ sở dữ liệu riêng `crm_<id>_test`;
răng đọc tên đó từ đầu ra và đỏ nếu không thấy, hoặc thấy `crm_test` dùng chung.
Trước khi chép, răng tìm bản sao sót của lượt trước: tiến trình đã chết thì dọn,
còn sống thì thoát 2 và gọi tên thư mục.

## Ai khác dùng `ngayCach`

Trong `apps/api/test` chỉ `moi-phia-ke-hoach.spec.ts` gọi, và mọi lời gọi nằm
trong ca `viec-cua-toi`. `apps/agent/test/support/nhac-gui-gieo.ts` có một
`ngayCach(goc, soNgay)` khác: nhận mốc tường minh và cộng mili giây, không đọc
đồng hồ, không dính lỗi này.

## Không làm

- Không đổi mã sản phẩm. Sản phẩm đúng; phép đo sai.
- Không đụng `ngayCach` của `apps/agent`.
- Không quét mọi ca test ngày-lịch khác trong kho.
