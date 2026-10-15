# Bài app-rieng chạy cạnh apps/agent có trần chờ riêng — thiết kế

Hồ sơ `_acceptance/tran-cho-app-rieng/`, hạng T2, chỉ đổi tệp test và hằng cấu hình của test. Giám sát r2 giao 14/10.

## Bài toán

Bài `app-rieng > chạy cạnh apps/agent: hai tiến trình, hai cổng, /eve/v1/health cả hai xanh`
(`apps/agent-okr/test/app-rieng.integration.spec.ts`) dùng trần mặc định 5 000 ms của bun. Nhật ký làn ghim F24
(`repin-20261014T230428Z-37869/01-suite-4-7.log`, dòng 1224–1242): bài treo ở `Promise.all` gọi `/eve/v1/health` của
hai máy, hết 5 000 ms; bun in «killed 2 dangling processes» (giết eve dev con); dòng 91 gọi `/health` sau đó nhận
`ConnectionRefused`. Vậy `ConnectionRefused` là hệ quả của hết giờ; nguyên nhân là lần gọi `/eve/v1/health` đầu tiên
chậm hơn 5 s khi máy nặng. Chạy riêng thì xanh.

## Cách sửa

Trần riêng cho bài này: `KHOI_DONG.baiHaiMay.tranMs` = 30 s trong `test/support/khoi-dong.ts` (khu cấu hình của test,
cạnh `sanSang.choMs` 30 s đã có), truyền làm đối số thứ ba của `test`. Không đổi mã sản phẩm.

## Đo

`rang/cham-health.mjs` dùng một preload bọc `fetch`: mọi lời gọi tới `/eve/v1/health` chậm thêm 6 000 ms — giống máy
nặng, áp như nhau cho bản sửa và bản trước vòng, không cài nút thử vào bài kiểm. Bốn ô: sửa × {0, 6 000 ms} xanh;
trước vòng × {0 xanh, 6 000 ms đỏ với «timed out after 5000ms»}. `--pham-vi` kiểm diff ngoài hồ sơ chỉ có hai tệp test.

## Đặc tả UX

Không chạm màn nào.
