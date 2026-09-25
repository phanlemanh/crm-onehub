---
schema_version: 1
feature: Phép đo màn thật chạy trên kho riêng của chính cây (crm_<cây>_do) với máy chủ app/api của chính cây, tự dựng và tự dọn; kho dev chung crm không bao giờ bị phép đo ghi nữa
slug: do-man-tren-kho-rieng
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: draft
design_doc: docs/superpowers/specs/2026-09-26-do-man-tren-kho-rieng-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T21:04:03Z
---

# Acceptance Contract: do-man-tren-kho-rieng

## Context

Mọi phép đo màn thật chạy qua `scripts/lan-do/tien-de.mjs` và mọi máy chủ dev của mọi cây
dùng chung kho `crm` (tên lấy từ `DATABASE_URL` của `.env` gốc). Đo 26/09: `crm` giữ ba chu
kỳ OKR thử của lượt 4, nên thước đã ký `dat-okr-trong-crm/rang/man-okr.mjs` (đòi 0 chu kỳ)
thoát mã 2 và làn ghim lại của `okr-soat-anh-luot-3` không chạy được.

Từ ngữ trong hợp đồng này:

- **Kho chung**: kho mà `DATABASE_URL` của `.env` trỏ tới (`crm`), kho người dùng làm việc.
- **Kho đo** của một cây: `crm_<cây>_do`, `<cây>` = `PHIEN_DO_TEN_CAY` nếu đặt, không thì
  tên thư mục gốc của cây; hạ chữ thường, ký tự ngoài `[a-z0-9]` thành `_`. **Kho mẫu**:
  `crm_<cây>_mau_do`.
- **Kho dùng-một-lần**: tên kết thúc bằng `_do` mà không phải kho mẫu (`_mau_do`), hoặc
  kết thúc bằng `_gieo` (kho nháp của `scripts/lan-do/kho-nhap.mjs`).
- **Phiên đo**: một lần chạy `bun run do:man --chay "<lệnh>"` — dựng kho đo, khởi API và
  app của chính cây trên hai cổng tự do, tạo phiên đăng nhập, chạy lệnh, dọn.
- **Dấu vân tay** của một kho: với mỗi bảng của schema `public`, số dòng và `md5` của mọi
  dòng (dạng chữ, sắp xếp). Hai dấu bằng nhau = kho không đổi.
- **Không đo được**: mã thoát 2 kèm câu gọi tên thứ hỏng — hạ tầng chưa sẵn, không phải sản
  phẩm sai.

## Criteria

- AC-1: Given một cây có thư mục gốc tên `<t>` (kể cả tên có chữ hoa, gạch ngang, dấu chấm, và tên dài hơn 63 ký tự), When tính tên kho đo và kho mẫu, Then kho đo là `crm_<t'>_do` và kho mẫu `crm_<t'>_mau_do` với `<t'>` chỉ gồm `[a-z0-9_]`, mỗi tên ≤ 63 ký tự và giữ nguyên hậu tố; không tên nào trùng `crm`, `crm_test` hay kết thúc bằng `_test`; và hai cây tên khác nhau cho hai tên kho khác nhau.
- AC-2: Given máy chủ Postgres cục bộ và kho chung có dữ liệu, When `bun run db:do --tao` chạy cho một cây, Then kho đo của cây tồn tại, bảng `_prisma_migrations` có đủ mọi migration trong `packages/db/prisma/migrations` ở trạng thái hoàn tất, kho có dữ liệu seed (workspace đã onboard, deal `seed-deal-wise-1`), kho mang `COMMENT` bắt đầu bằng `crm phien do` kèm giờ tạo, dòng cuối stdout là URL của kho đo; và dấu vân tay kho chung trước và sau bằng nhau.
- AC-3: Given kho mẫu của cây đã dựng và dấu của nó (tên migration + `schema.prisma` + `seed.ts`) còn khớp, When `--tao` chạy lần nữa, Then kho mẫu không bị dựng lại (giờ tạo trong `COMMENT` của mẫu không đổi) và kho đo được tạo lại từ mẫu (giờ tạo của kho đo mới hơn); Given dấu không khớp, Then kho mẫu được dựng lại.
- AC-4: Given kho đo của cây đang tồn tại và đang có kết nối, When `bun run db:do --xoa` chạy cho cây đó, Then kho đo không còn; When `--xoa` được trỏ vào một tên không kết thúc bằng `_do` hoặc một kho `_do` không mang `COMMENT` phiên đo, Then lệnh thoát 2 và kho đó còn nguyên.
- AC-5: Given năm kho trên máy chủ — một kho đo mang `COMMENT` phiên đo với giờ tạo cũ hơn `maxAgeMs` và không kết nối, một kho đo mang `COMMENT` còn non tuổi, một kho tên `_do` không mang `COMMENT`, một kho mẫu tạo đã lâu nhưng giờ dùng còn non, một kho mẫu có cả giờ tạo lẫn giờ dùng cũ hơn `maxAgeMs` — When `bun run db:do --quet` (hoặc `--tao` của một cây khác) chạy, Then đúng hai kho bị xoá: kho đo quá tuổi và kho mẫu không dùng quá tuổi; ba kho kia còn nguyên.
- AC-6: Given kho chung có dữ liệu và không có máy chủ nào của cây đang chạy, When `bun run do:man --chay "<lệnh dò>"` chạy, Then bên trong lệnh dò: `DATABASE_URL` trỏ kho đo của cây; `APP_URL` và `API_URL` là hai cổng trong dải cấu hình; `canh-cay.mjs` gọi qua `APP_URL` báo máy chủ phục vụ đúng cây; `API_URL/health` trả 200; người `NGUOI` có trong kho đo; mã thoát của phiên bằng mã của lệnh dò; và sau phiên: hai cổng không còn tiến trình nghe, kho đo không còn, dấu vân tay kho chung bằng lúc trước.
- AC-7: Given một phiên đo đang chạy lệnh dò, When lệnh dò thoát 1, hoặc phiên nhận SIGINT, hoặc SIGTERM, Then phiên thoát lần lượt 1, 130, 143 và dọn đủ như AC-6 (cổng trống, kho đo không còn, không còn tiến trình máy chủ của phiên); Given phiên bị SIGKILL, When phiên kế trên cùng cây chạy, Then các tiến trình máy chủ của phiên bị giết không còn trước khi phiên kế chạy lệnh, và phiên kế chạy trên kho đo dựng lại từ mẫu.
- AC-8: Given một phiên đo của cây A đang chạy, When phiên thứ hai của cây A bắt đầu, Then phiên thứ hai in dòng chờ và chỉ chạy lệnh sau khi phiên thứ nhất đã dọn xong (hai khoảng chạy lệnh không chồng nhau); When phiên đo của một cây khác tên (`PHIEN_DO_TEN_CAY` khác, cùng checkout) bắt đầu cùng lúc, Then nó không chờ, không giết máy chủ nào của phiên thứ nhất, và phiên thứ nhất vẫn thoát 0.
- AC-9: Given `DATABASE_URL` trỏ kho chung (không phải kho dùng-một-lần) và `APP_URL` đặt sẵn một cổng bất kỳ, When `bun scripts/lan-do/tien-de.mjs --chay "<lệnh dò>"` chạy, Then lệnh dò chạy trong một phiên đo (thấy `DATABASE_URL` của kho đo, `APP_URL` của phiên, khoá nghiên cứu đã đặt trong kho đo), và dấu vân tay kho chung trước và sau bằng nhau; Given lệnh `tien-de` chạy bên trong một phiên đo, Then nó không dựng phiên thứ hai (không chờ khoá, cùng `APP_URL` với phiên ngoài); Given `DATABASE_URL` trỏ kho mẫu `_mau_do`, Then `tien-de` vẫn dựng phiên và dấu vân tay kho mẫu trước và sau bằng nhau.
- AC-10: Given kho chung có ít nhất một chu kỳ OKR mà seed không tạo (kho thật `crm` lúc đo, hoặc một kho chung giả do răng dựng và gieo), When chạy nguyên văn lệnh eval `dok_man_chrome` của hồ sơ đã ký `dat-okr-trong-crm` lấy từ `_acceptance/config.yaml`, Then lệnh thoát 0 và dấu vân tay kho chung trước và sau bằng nhau. (cross-layer)
- AC-11: Given `diff` của vòng này so với `merge-base` với `origin/onehub`, When soi danh sách tệp đổi, Then không tệp nào dưới `_acceptance/<hồ sơ khác>/`, không dòng `executors` nào có sẵn của `_acceptance/config.yaml` bị sửa hay xoá, và `canh-cay.mjs` không đổi.
- AC-12: Given `docs/setup.md`, `CLAUDE.md` và `.env.example` sau vòng này, When đọc, Then `docs/setup.md` có mục mô tả `bun run db:do` (ba cờ), `bun run do:man`, kho mẫu, luật dọn theo tuổi và việc `tien-de` tự dựng phiên; mục «Cách chứng minh nó chạy» của `CLAUDE.md` nói phép đo màn không còn cần máy chủ dev dựng tay và không ghi kho chung; `.env.example` ghi `PHIEN_DO` là biến phiên đo tự đặt, không đặt tay.
- AC-13: Given cây ở HEAD của vòng này (cộng hồ sơ của chính vòng), When chạy kiểm tra trước khi gộp của bộ kit trên toàn kho — không `--slug`, `--base origin/onehub` — Then không có vi phạm nào thuộc một hồ sơ khác `do-man-tren-kho-rieng`.

Trong AC-6, AC-9, AC-10, «kho chung» là kho mà `DATABASE_URL` trỏ tới lúc chạy: răng dựng
một kho chung giả (tên không `_do`, không `_gieo`) có dữ liệu lạ và trỏ vào đó, vì kho `crm`
thật được máy chủ dev của người và tác tử ghi bất cứ lúc nào. Kho `crm` thật chỉ được soi
thêm (chỉ đọc) ở AC-10 khi không có kết nối nào khác vào nó.

## Coverage

Bỏ quét — xem entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`: không gian AC
theo vòng đời một phiên (tạo · chạy · dọn · bị giết · chồng · lồng) cộng hai lớp an toàn
(không ghi kho chung, không nới thước) đã liệt đủ theo thiết kế; không có trục người/vai/màn.

## Out of scope

- Lệnh eval khai cổng cứng (`ccq_chup_hai_vai` 3500, `lgo_chup` 3300 của hồ sơ đã ký): cổng
  cứng đè cổng phiên. Chạy chúng trên kho riêng cần sửa lệnh của hồ sơ đã ký — không làm.
- `quet.mjs` và `trang-thai-rong.mjs` giữ đường kho nháp `_gieo` như cũ (chúng không chạm
  `crm`).
- Dọn ba chu kỳ OKR lạ đang nằm trong kho `crm` của người dùng — kho chung là của người; vòng
  này chỉ bảo đảm phép đo không đọc hay ghi nó.
- Máy chủ dev người dùng chạy tay (`.claude/launch.json`, cổng 3000/3001, 3810/3811) vẫn
  dùng kho chung — đó là kho làm việc của người.
- Ghim lại `okr-soat-anh-luot-3` (PR #146) — việc của nhánh đó, làm sau khi vòng này gộp.

## Notes

- Không có `opportunity.md` — việc hạ tầng đo, không có ngưỡng nghiệm thu, nên không có mục
  Đường đo.
- Đường nền 26/09 đỏ ở `build_khong_cache` vì `bash -lc` của máy này nhận Node 22
  (`/usr/local/bin/node`) trong khi `eve build` đòi Node ≥ 24 — đỏ môi trường, có từ trước,
  không phải lỗi của vòng. Hai khoá `zqw_giu_nqz`, `nzm_giu_da_ky` thiếu `merge-base` trong
  bản sao đường nền.
