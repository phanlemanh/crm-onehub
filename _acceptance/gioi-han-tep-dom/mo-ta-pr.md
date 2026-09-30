## Trình chạy test DOM tự cắt tệp quá giờ và in thời lượng từng tệp

Job CI «check-types, lint, test» của #222 bị cắt ở trần 20 phút (run 36724007135, cả hai
lượt). Log cho thấy **không tệp DOM nào treo**:

- `bun run test` gọi `turbo run test --concurrency=1`: các gói chạy nối tiếp, mốc của mỗi nhóm
  log là giờ gói đó xong.
- Lượt xanh ngay trước (run 36721133755): bước test 15m17s, `app:test` là gói cuối và chạy 3m22s.
- Lượt bị cắt: `app:test` mới chạy khoảng 4 phút lúc job chạm trần; cả lượt chậm hơn 25–50%
  (`check-types` 2m35s so với 1m42s).
- Hai tệp nghi vấn chạy xanh trên Linux ở lượt xanh: `deals-giai-doan-hydrat.dom.tsx` 1,4 s,
  `okr-sua-an-chu-ky.dom.tsx` 4,0 s.

Nguyên nhân thật là tổng thời lượng: một lượt bình thường đã khoảng 19 trên 20 phút. PR này
**không** sửa chuyện đó (trần nằm ở `ci.yml` của hãng).

PR này làm trình chạy từng tệp (`packages/ui/test/chay-tung-tep-dom.ts`) tự khai:

- Mỗi tệp có giới hạn 1 phút (`CHAY_DOM.tep.tranMs` trong `packages/ui/test/chay-dom-config.ts`).
  Quá giờ thì cắt tiến trình, in tên tệp, thoát 124, để tên hiện trong log thay vì mất cùng job.
  1 phút là số lớn nhất còn lọt ngân sách của một lượt bình thường; ở máy chạy chậm thì không
  giới hạn nào cứu được.
- Mỗi tệp in thời lượng thật, tính cả khởi động tiến trình; cuối lượt in tổng và năm tệp chậm nhất.

### Làn thiết kế

Không có khối giao diện mới — PR chỉ chạm trình chạy test.

### Bằng chứng

Hồ sơ `_acceptance/gioi-han-tep-dom/`: hợp đồng, bộ đo, phản biện context sạch, báo cáo bằng chứng.
