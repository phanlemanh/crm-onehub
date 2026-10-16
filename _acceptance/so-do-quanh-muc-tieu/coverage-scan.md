# Quét độ phủ — so-do-quanh-muc-tieu (15/10)

## Ngữ cảnh

- Sản phẩm: crm-onehub, khu Mục tiêu (OKR) — chân sản phẩm: đào kho (`packages/db/prisma/schema.prisma`
  `OkrAlignment`; `packages/validation/src/okr-muc-tieu.ts` `CAP_MUC_TIEU`; `apps/api/src/okr/okr.service.ts`
  `mucTieuCuaCay`; `apps/api/scripts/okr-mau/ca-so-do.ts`) · chân ngành: Tability Dependencies Map (lượt rà production
  14/10 của đợt, ghi ở hàng DH4/DH5 `docs/plan/lo-trinh-okr.json`).

## Trục

- **A — tâm đứng đâu trên chuỗi góp:** góp qua KR lên công ty | góp thẳng mục tiêu công ty | góp hai chỗ chung tổ
  tiên | là công ty | không góp vào đâu | đường lên qua mục tiêu không thấy | góp sang kỳ cha
  [thước CE: schema `OkrAlignment` (đích mục tiêu hoặc KR); `mucTieuCuaCay` gộp kỳ cha/con]
- **B — phía dưới:** không ai góp | góp vào tâm | góp vào KR của tâm | góp bậc hai | mục tiêu giới hạn góp vào | vòng
  góp  [thước CE: câu giao DH5 «ai góp vào nó»]
- **C — trạng thái màn:** mặc định | rê chuột | công ty | chưa lên | đang tải | lỗi | không thấy | hẹp | nút trong ngăn
  [thước CE: `docs/design.md` «Chờ tải và lỗi tải», «Danh sách»; trạng thái ST-sodo-quanh-muc-tieu của bản mẫu]
- **D — người xem:** thấy mọi mục tiêu | thiếu mục tiêu giới hạn | không thấy tâm  [thước CE: lọc quyền
  `mucTieuCuaCay`]

## Ô có nghĩa (A × D cắt theo lát A; B, C quét riêng)

| Ô | Nhãn | AC |
|---|---|---|
| A góp qua KR × thấy hết | Core | AC-1, AC-5, AC-11 |
| A góp hai chỗ × thấy hết | Core | AC-1, AC-11 |
| A là công ty | Core | AC-1, AC-5 |
| A không góp | Core | AC-1, AC-5 |
| A góp thẳng mục tiêu công ty | Core (trong ca góp hai chỗ) | AC-1 |
| A đường lên qua mục tiêu không thấy × thiếu giới hạn | Core | AC-3 |
| A góp sang kỳ cha | Later — `mucTieuCuaCay` đã gộp kỳ cha, không cần mã riêng; chưa có ca đo riêng | — |
| D không thấy tâm | Core | AC-3, AC-9 |
| B góp vào tâm / vào KR / bậc hai / vòng | Core | AC-2 |
| B mục tiêu giới hạn góp vào | Core | AC-3 |
| C đủ chín trạng thái | Core | AC-4–AC-9 |

## Later

- Lý do căn chỉnh trên đường nối.
- Đi xuống nhiều bậc.
- Lối vào từ sơ đồ đơn vị của DH4.
- Ca đo riêng cho góp sang kỳ cha.

## Never

- Sửa căn chỉnh từ sơ đồ — vòng chỉ đọc.
- Nhắc «có mục tiêu ẩn» ở chỗ đường bị cắt — lộ sự tồn tại của mục tiêu giới hạn.

## Cross-cutting

Khổ 1440 | 390 · `vi` | `en` · `translate="no"` · phím và tiêu điểm · sàn thiết kế tĩnh.
