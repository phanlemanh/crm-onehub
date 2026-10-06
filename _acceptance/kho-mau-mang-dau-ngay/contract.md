---
schema_version: 1
feature: Kho mẫu crm_<cây>__mau_do mang dấu phiên đo ngay sau CREATE DATABASE, trước migrate deploy và seed, để lượt --tao bị giết giữa chừng để lại kho mà db:do --quet gom được
slug: kho-mau-mang-dau-ngay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: draft
design_doc: docs/superpowers/specs/2026-10-07-kho-mau-mang-dau-ngay-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-06T22:54:48Z
---

# Acceptance Contract: kho-mau-mang-dau-ngay

## Context

`createMeasureDatabase` (`packages/db/scripts/measure-db.ts`) tạo kho mẫu `crm_<cây>__mau_do`,
chạy `migrate deploy` và seed (khoảng 30–60 giây), rồi mới ghi `COMMENT` phiên đo. Lượt bị
giết trong khoảng đó để lại kho mẫu không dấu, mà `bun run db:do --quet` chỉ xoá kho có dấu.
Đo 07/10/2026 trên `crm-postgres`: 7 kho `crm_thu*__mau_do` của bài kiểm
`measure-database.spec.ts` sống như vậy từ 28/09; tái hiện bằng SIGKILL 6 giây sau `--tao`
cho đúng kết quả đó (`swept 0`).

Nguồn: yêu cầu của chủ kho trong phiên 07/10/2026. Thiết kế: `design_doc`.

Từ ngữ trong hợp đồng này:

- **Dấu phiên đo**: `COMMENT ON DATABASE` bắt đầu bằng `crm phien do `, đọc bằng
  `parseMeasureComment` của `packages/db/src/measure-database.ts`. Ba loại: `session` (kho đo),
  `template` (kho mẫu dựng xong, mang dấu nguồn), `building` (kho mẫu đang dựng — mới).
- **Lượt bị giết giữa chừng**: CLI `bun scripts/measure-db.ts --tao --ten <cây>` bị SIGKILL cả
  nhóm tiến trình ở một trong hai điểm: **trong migrate** — kho mẫu đã có ít nhất một hàng
  trong `_prisma_migrations`; **trong seed** — mọi migration của `packages/db/prisma/migrations`
  đã hoàn tất mà bảng `deal` chưa có hàng nào. Kho mẫu sau khi bị giết chưa có deal
  `seed-deal-wise-1` (bảng `deal` vắng, theo `to_regclass`, cũng tính là chưa có).
- **Lượt quét**: `sweepMeasureDatabases` — chính hàm mà `--quet` và đầu mỗi `--tao` gọi —
  chạy với đồng hồ tua tới, giới hạn vào tiền tố tên của lượt kiểm.

## Criteria

- AC-1: Given một mốc giờ `t`, When ghi chuỗi dấu đang dựng bằng hàm của module rồi đọc lại bằng `parseMeasureComment`, Then kết quả là `{ kind: "building", createdAt: t }` và `lastTouched` của nó bằng `t`; When chuỗi đang dựng mang giờ không đọc được, Then `parseMeasureComment` trả `null`.
- AC-2: Given máy chủ Postgres cục bộ và một cây thử chưa có kho mẫu, When một lượt `--tao` của cây đó bị giết giữa chừng — ở mỗi điểm trong hai điểm, trong migrate và trong seed — Then kho mẫu của cây còn tồn tại, mang dấu phiên đo loại `building` với giờ tạo trong 10 phút gần đây, và kho đo `_do` của cây không tồn tại.
- AC-3: Given kho mẫu do một lượt bị giết giữa chừng để lại và không còn kết nối nào vào nó, When lượt quét chạy với đồng hồ sớm hơn giờ tạo cộng `MEASURE_DATABASE.maxAgeMs`, Then kho mẫu còn nguyên; When lượt quét chạy với đồng hồ muộn hơn giờ tạo cộng `maxAgeMs` một phút, Then kho mẫu nằm trong danh sách lượt quét trả về và không còn trong `pg_database`.
- AC-4: Given kho mẫu do một lượt bị giết giữa chừng để lại — ở mỗi điểm trong hai điểm, trong migrate và trong seed — When `createMeasureDatabase` chạy lại cho cùng cây với dấu nguồn thật, Then kho mẫu được dựng lại (dấu thành loại `template`, giờ tạo muộn hơn giờ tạo của dấu `building`), và kho đo được tạo ra có đủ mọi migration của `packages/db/prisma/migrations` ở trạng thái hoàn tất cùng deal `seed-deal-wise-1`.
- AC-5: Given bản sửa của vòng này, When chạy bốn nhóm ca có sẵn của `packages/db/test/measure-database.spec.ts` — `tao`, `kho-mau`, `xoa`, `quet-mo-coi` — Then cả bốn thoát 0 với kỳ vọng không đổi: kho đo vẫn mang dấu `session`, kho mẫu dựng xong vẫn mang dấu `template` và được dùng lại khi dấu nguồn khớp, `--xoa` vẫn từ chối kho `_do` không dấu, lượt quét vẫn giữ kho `_do` không dấu.
- AC-6: Given `docs/setup.md` sau vòng này, When đọc mục «Screen measurements get a database of their own», Then mục đó nói kho mẫu mang dấu ngay khi được tạo, trước `migrate deploy` và seed; nói lượt `--tao` bị giết giữa chừng để lại kho mẫu có dấu mà `--quet` xoá sau 12 giờ và `--tao` kế của cây dựng lại; và nói kho mẫu không dấu do lượt bị giết trước bản sửa này vẫn phải xoá bằng tay. (judgment)

## Coverage

Quét bằng morphological-scan (trục tự dựng, không preset nào khớp trọn). Chân sản phẩm
`[SUY-TỪ-REPO: packages/db/scripts/measure-db.ts]`; chân ngành `[NGÀNH: Testcontainers Ryuk]` —
container được gắn nhãn phiên ngay lúc tạo để bộ dọn gom được rác của lượt chết.

- Trục A — lúc bị giết: k0 trước CREATE | k1 giữa CREATE và COMMENT | k2 trong migrate | k3
  trong seed | k4 sau dấu mẫu, trước clone | k5 giữa clone và dấu phiên | k6 sau dấu phiên
  [thước CE: chuỗi câu lệnh của `createMeasureDatabase` và `buildTemplate`, `measure-db.ts:195-288`]
- Trục B — tác nhân kế tiếp: `--tao` cùng cây | lượt quét trước hạn 12 giờ | lượt quét sau hạn
  | `--xoa --kho` [thước CE: các nhánh của `main()` trong `measure-db.ts`]
- Trục C — kiểu giết: cả nhóm tiến trình | chỉ tiến trình cha (con `prisma`/seed mồ côi chạy
  tiếp) [thước CE: 7 kho cũ có `deal` = 0 khớp kiểu cả nhóm; lượt tái hiện 07/10 khớp kiểu chỉ cha]
- Core: {k2, k3} × {mang dấu → AC-2 · `--tao` cùng cây dựng lại → AC-4}, k2 × {quét trước
  hạn, quét sau hạn → AC-3}, kiểu cả nhóm; dấu đọc được → AC-1; hồi quy k4/k6 → AC-5.
  Luật quét không phân biệt k2 với k3 (cùng một dấu), nên AC-3 đo ở k2.
- Later: `--xoa --kho` trên kho mẫu đang dựng (nhận theo luật parse sẵn có, không đo riêng) ·
  giết chỉ tiến trình cha (luật `backends > 0` sẵn có giữ kho đang bị con mồ côi ghi).
- Never: k1, k5 — Postgres 16 từ chối `CREATE DATABASE` trong khối giao dịch (đo 07/10), xem
  Out of scope · k0, k4, k6 — không có kho không dấu nào sinh ra.

## Out of scope

- Cửa sổ giữa lúc `CREATE DATABASE` trả về và lúc `COMMENT` tới máy chủ (một lượt khứ hồi trên
  cùng kết nối): SIGKILL rơi đúng vào đó vẫn để lại kho không dấu. Postgres không cho gộp hai
  lệnh thành một bước nguyên tử. Kho đo `_do` mang cùng giới hạn từ trước.
- Tự gom kho không dấu: `--quet` không nhận nuôi kho `__mau_do` không dấu. 7 kho cũ và kho tái
  hiện `crm_thudieutra26552__mau_do` do chủ kho xoá tay sau khi bản sửa có bằng chứng.
- Đổi luật tuổi 12 giờ hay cho kho đang dựng một hạn riêng ngắn hơn.
- Đổi cách `afterAll` của bài kiểm dọn kho, hay bắt tín hiệu trong `measure-db.ts` để tự dọn khi
  bị ngắt: SIGKILL không bắt được, và dấu là lưới cho mọi kiểu chết.

## Notes

- Không có `opportunity.md` — việc hạ tầng đo, không có ngưỡng nghiệm thu, nên không có mục
  Đường đo.
- Không xoá tay 7 kho bằng chứng trước khi tái hiện xong (yêu cầu của chủ kho). Danh sách:
  `crm_thumulbigj3ide9mau__mau_do`, `crm_thumulwpvxl243rmau__mau_do`,
  `crm_thumuq5gvf5m98utao__mau_do`, `crm_thumuqvgxfoqxevmau__mau_do`,
  `crm_thumuqxabs3mau__mau_do`, `crm_thumuthaqevdz0cmau__mau_do`,
  `crm_thumuuz4g8ycr8btao__mau_do`.
- Vòng này chạm `paths` của hồ sơ đã ký `do-man-tren-kho-rieng`; ghim lại hồ sơ đó ở đỉnh
  nhánh trước khi mở PR.
