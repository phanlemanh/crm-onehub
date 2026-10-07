# Kho mẫu mang dấu ngay khi tạo — design

Hồ sơ: `_acceptance/kho-mau-mang-dau-ngay/` · hạng T2 · 07/10/2026

## Vấn đề

`bun run db:do --quet` (và lượt quét đầu mỗi `--tao`) chỉ xoá kho mang dấu phiên đo
(`COMMENT ON DATABASE … IS 'crm phien do …'`). Kho không dấu được coi là không phải của phép
đo, và bất biến đó được hai ca kiểm của hồ sơ đã ký `do-man-tren-kho-rieng` giữ (`--xoa` từ
chối kho không dấu; `quet-mo-coi` giữ kho `_do` không dấu).

`buildTemplate` trong `packages/db/scripts/measure-db.ts` chạy theo thứ tự:

1. `DROP DATABASE IF EXISTS` kho mẫu
2. `CREATE DATABASE "crm_<cây>__mau_do"`
3. `prisma migrate deploy` (vài giây) rồi `prisma/seed.ts` (khoảng 30 giây), cả hai qua `spawnSync`
4. `markTemplate` — lúc này kho mẫu mới có dấu

Một lượt bị giết trong bước 3 để lại một kho mẫu **không dấu**, và không lệnh nào gom được nó.
Kho `_do` của lượt đó không biến mất: nó chưa từng được clone, vì việc clone đến sau bước 4.

## Bằng chứng (07/10/2026, Postgres 16.14 trong container `crm-postgres`)

- 7 kho `crm_thu<id>{mau,tao}__mau_do` do `packages/db/test/measure-database.spec.ts` tạo
  (khuôn `tree()`), tạo từ 28/09 đến 05/10, đều không có COMMENT. Cả 7 có `deal` = 0, tức seed
  chưa bao giờ xong. 6 kho đã chạy đủ migration của thời điểm đó; `crm_thumuqvgxfoqxevmau__mau_do`
  dừng giữa migrate (4 xong, 1 dở). Đúng khuôn «bị giết cả nhóm tiến trình trong bước 3»: một
  lượt `bun run test` bị ngắt chạy `afterAll` không tới.
- Tái hiện: `bun scripts/measure-db.ts --tao --ten thudieutra26552`, SIGKILL tiến trình cha sau
  6 giây. Kết quả: `crm_thudieutra26552__mau_do` không có COMMENT, `--quet` báo `swept 0`. Tiến
  trình con `prisma`/seed mồ côi vẫn chạy tiếp tới xong (82 migration, 27 deal), nhưng kho
  vẫn không có dấu.
- `CREATE DATABASE x; COMMENT ON DATABASE x IS '…'` gửi trong một thông điệp bị Postgres từ
  chối (`CREATE DATABASE cannot run inside a transaction block`). Không có cách tạo kho và ghi
  dấu trong một bước nguyên tử.

## Thiết kế

Dấu phiên đo có thêm loại thứ ba, **đang dựng**:

```
crm phien do template-building created <ISO>
```

- `packages/db/src/measure-database.ts`: thêm `templateBuildingComment(createdAt)`; `MeasureComment`
  có thêm nhánh `{ kind: "building"; createdAt }`; `parseMeasureComment` đọc được nó;
  `lastTouched` của nó là `createdAt`.
- `packages/db/scripts/measure-db.ts`: thêm `markTemplateBuilding(client, name, createdAt)`, và
  `buildTemplate` gọi nó ngay câu lệnh kế sau `CREATE DATABASE`, trước `migrate deploy`. Dựng
  xong thì `markTemplate` ghi đè bằng dấu `template` như hiện nay.

Hệ quả, không cần thêm luật:

- `sweepMeasureDatabases` đã nhận mọi dấu parse được, nên kho mẫu đang dựng bị gom khi quá
  `MEASURE_DATABASE.maxAgeMs` (12 giờ) và không còn kết nối, đúng luật tuổi hiện có.
- `createMeasureDatabase` chỉ dùng lại kho mẫu khi dấu là `template` có `fingerprint` khớp.
  Dấu `building` không bao giờ khớp, nên `--tao` kế của cùng cây dựng lại kho mẫu, không clone
  một kho dở.
- `dropMeasureDatabase` (`--xoa --kho`) nhận kho mẫu đang dựng vì nó mang dấu.

### Phương án đã loại

- **Ghi luôn dấu `template` với `fingerprint` thật ngay sau CREATE.** Lượt bị giết sẽ để lại
  kho dở trông như kho tươi; `--tao` kế clone nó và phép đo chạy trên kho thiếu seed. Dấu sai
  còn tệ hơn không dấu.
- **Cho `--quet` nhận nuôi kho `__mau_do` không dấu.** Phá bất biến «không dấu = không phải của
  phép đo» mà `--xoa` và `quet-mo-coi` bảo vệ; một kho người tự tạo trùng khuôn tên sẽ bị xoá.
  7 kho cũ do chủ kho xoá tay.
- **Dựng dưới tên tạm rồi `ALTER DATABASE … RENAME`.** Tên tạm cũng phải được tạo rồi mới ghi
  dấu, nên cửa sổ không nhỏ hơn mà mã thì dài hơn.

### Giới hạn còn lại

Giữa lúc `CREATE DATABASE` trả về và lúc `COMMENT` tới máy chủ còn đúng một lượt khứ hồi trên
cùng kết nối. SIGKILL rơi đúng vào khoảng đó vẫn để lại kho không dấu. Cửa sổ thu từ khoảng
30–60 giây xuống cỡ mili giây; đóng hẳn thì Postgres không cho (đã đo ở trên). Kho đo `_do`
vốn đã ghi dấu ngay sau lệnh clone, nên mang cùng giới hạn này từ trước.

## Đo

Một nhóm ca mới `giet-giua-chung` trong `packages/db/test/measure-database.spec.ts`. Mỗi ca
chạy CLI thật (`bun scripts/measure-db.ts --tao --ten <cây thử>`) trong một nhóm tiến trình
riêng, hỏi Postgres tới điểm giết rồi SIGKILL cả nhóm. Phép chờ là vòng hỏi có trần, không phải
ngủ cố định. Hai điểm giết:

- **trong migrate** — kho mẫu đã có hàng đầu tiên trong `_prisma_migrations`;
- **trong seed** — mọi migration đã hoàn tất, bảng `deal` chưa có hàng. Điểm này bắt bản cài
  ghi dấu `template` giữa migrate và seed (một nửa của phương án đã loại số 1).

Kết quả phải đo:

- Kho mẫu của lượt bị giết (cả hai điểm) mang dấu `building` có giờ tạo gần đây, và chưa có deal
  seed — bằng chứng lượt bị giết giữa chừng chứ không phải đã xong. Đếm deal qua `to_regclass`,
  không nuốt lỗi; đối chứng dương là kho đo dựng trọn (bằng 1).
- Lượt quét với đồng hồ ở `createdAt + maxAgeMs - 1 phút` giữ kho; ở `+ 1 phút` xoá nó.
- `createMeasureDatabase` kế tiếp của cùng cây dựng lại kho mẫu (dấu thành `template`, giờ tạo
  mới hơn), và kho đo clone ra có đủ migration lẫn deal seed — ở cả hai điểm giết.
- Chuỗi dấu `building` đi một vòng ghi → đọc qua chính các hàm của module.

Tên ca mới không chứa mẫu `-t` của bốn lệnh cũ (`tao`, `kho-mau`, `xoa`, `quet-mo-coi`), và
mỗi lệnh ghim số ca chạy, để bốn ca cũ (giữ nguyên, phải xanh) vẫn là đúng tập đã ký.

## Ảnh hưởng ngoài vòng

`packages/db/scripts/measure-db.ts` và `packages/db/src/measure-database.ts` nằm trong
`paths` của nhiều eval thuộc hồ sơ đã ký `do-man-tren-kho-rieng`. Bằng chứng của hồ sơ đó sẽ
hoá cũ; chạy làn ghim lại cho nó ở đỉnh nhánh, sau khi vòng này xong, trước khi mở PR.
