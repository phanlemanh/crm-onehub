# LT1d · Chặt đường đẩy bản chụp — thiết kế

Hồ sơ: `_acceptance/chat-duong-day-ban-chup/` · hàng lộ trình LT1d · đứng trên LT1c
(`lo-trinh-doc-ban-chup`). Gốc: hai mục ngoài hợp đồng ở Cổng Bằng chứng LT1c ngày 15/10/2026 —
Ngoài-8 và Ngoài-11 — chủ kho chọn «mở hợp đồng mới».

## Vì sao

LT1c thêm một đường nhận dữ liệu: GitHub Actions đẩy khối lộ trình (~216 KB) lên CRM qua
`POST /rest/lo-trinh/ban-chup`. Để khối đó lọt qua, LT1c nâng trần thân của **cả cầu REST**
từ 100 KB (mặc định của `trpc-to-openapi` 3.3.0) lên 2 MB — mọi thủ tục POST qua `/rest` nay
đọc tới 2 MB, kể cả từ người chưa đăng nhập, vì thân được đọc trước khi thủ tục kiểm quyền
(Ngoài-8).

Workflow `ban-chup-lo-trinh.yml` có `workflow_dispatch` mà không chặn nhánh: bấm «Run workflow»
trên một nhánh tính năng sẽ đẩy `LO-TRINH.html` của nhánh đó lên production; commit của nhánh
mới hơn nên CRM ghi, rồi các lượt đẩy đúng từ onehub (commit cũ hơn) bị trả «cũ hơn» mà lượt
vẫn xanh (Ngoài-11).

## Phần 1 — trần thân theo đường

**Chọn: hai cầu REST, chọn theo đường chính xác.** `createApp` dựng hai middleware
`createOpenApiExpressMiddleware` trên cùng router:

- cầu bản chụp: `maxBodySize` = `BAN_CHUP_LO_TRINH.tranThanByte` (2 MB);
- cầu chung: `maxBodySize` = trần mặc định của cầu REST, 100 000 byte — đúng con số thư viện
  dùng trước LT1c, khai thành hằng cấu hình cạnh `REST_BRIDGE_PATH` thay vì dựa vào mặc định ngầm.

Middleware ở `REST_BRIDGE_PATH` chọn cầu bản chụp khi và chỉ khi `req.path` bằng đúng
`BAN_CHUP_LO_TRINH.duongRest` (`/lo-trinh/ban-chup`); mọi yêu cầu khác đi cầu chung. Không kiểm
thêm phương thức: thư viện chỉ đọc thân sau khi khớp được thủ tục, và đường đó chỉ có một thủ tục POST. So khớp chính xác là hướng an toàn: một đường «gần giống» chỉ có thể rơi về 100 KB,
không bao giờ được 2 MB.

`duongRest` là hằng mới trong `BAN_CHUP_LO_TRINH`; router (`restMeta`), `createApp` và
`scripts/ban-chup-lo-trinh/day.ts` (`DUONG_DAY`) đều đọc từ đó — một chỗ khai đường.

**Đã loại:**

- *Đọc thân trước bằng `json({ limit })` ở riêng đường bản chụp (mẫu `LISTING_INGEST` cùng tệp).*
  Thư viện dùng `req.body` có sẵn nên chạy được, nhưng lỗi 413 của đường đó đổi sang lỗi Nest
  (khác khuôn lỗi tRPC mà `day.ts` và bài `ldbc-hong h5` đang đọc), và luật đọc thân đổi theo
  `body-parser` (nhận cả `application/json; charset=…`, thư viện thì không) — hai đường REST
  hành xử khác nhau ở thứ không ai yêu cầu.
- *Một cầu với trần là hàm theo đường* — thư viện chỉ nhận một số.

## Phần 2 — chỉ onehub đẩy được

**Chọn: kịch bản đẩy từ chối khi chạy trong Actions mà ref không phải `refs/heads/onehub`.**
`day()` đọc `GITHUB_ACTIONS` và `GITHUB_REF` từ `env` nó được trao (không đọc `process.env`
trực tiếp — để bài kiểm trao env tường minh). Khi `GITHUB_ACTIONS === "true"` và `GITHUB_REF`
khác `BAN_CHUP_LO_TRINH.refDay` (`refs/heads/onehub`) — kể cả thiếu ref — `day()`:

- in một dòng `::error title=ban-chup-lo-trinh::…` và một dòng lỗi nêu ref đã chạy và nhánh được
  phép;
- trả mã 1, **trước** mọi bước khác: trước kiểm khoá, trước đọc `LO-TRINH.html`, trước mọi lời
  gọi mạng.

Ngoài Actions (người chạy tay trên máy mình) giữ hành vi cũ.

Bước chặn đứng TRƯỚC bước «chưa cài khoá»: nếu đứng sau, một lượt từ nhánh ở kho chưa cài khoá
vẫn xanh «chua-cai», trái câu «bị từ chối có lý do».

Workflow không đổi. Bài kiểm đọc workflow (đã có từ LT1c) thêm một quan hệ: nhánh của trigger
`push` chính là nhánh mà `refDay` cho phép, và bước đẩy không tự đặt `GITHUB_REF`.

**Đã loại:**

- *Thêm `github.ref == 'refs/heads/onehub'` vào `if` của job.* Lượt từ nhánh khác thành
  «skipped» màu xám, không có lý do; và chỉ đo được bằng cách đọc chữ trong YAML.
- *`actions/checkout` với `ref: onehub`.* Lượt bấm trên nhánh lặng lẽ đẩy onehub — không ai bị
  từ chối, người bấm tưởng đã đẩy nhánh mình.
- *Môi trường GitHub có luật nhánh triển khai (`environment` chỉ cho onehub, hai bí mật dời vào
  đó).* Mạnh nhất — bí mật không tới tay nhánh khác kể cả khi ai sửa workflow trên nhánh — nhưng
  là thay đổi cài đặt GitHub ngoài kho, chủ kho làm tay, không đo được bằng bài kiểm trong kho.
  Trình ở Cổng Phạm vi như một câu hỏi; máy khuyên để vòng sau.

## Bẫy đã thấy khi đọc mã

Bài `chay-that` của LT1c chạy `day.ts` thành tiến trình con và kế thừa env. Trên CI (Actions,
PR) env có `GITHUB_ACTIONS=true` và `GITHUB_REF=refs/pull/<n>/merge` — bước chặn mới sẽ từ chối
và bài đỏ trên CI dù xanh ở máy. Bài đó phải đặt hai biến tường minh. Mọi bài mới trao env tường
minh, không đọc env của máy đang chạy.

## Kiểm

- `apps/api/test/tran-than-rest.spec.ts` (mới): ma trận viết trước đường × cỡ thân qua `createApp`
  thật — bản chụp {khối thật > 100 KB, 1,5 MB, 2 MB + 1} → {nhận, nhận, 413}; đường khác
  (`POST /rest/org/divisions`, chưa đăng nhập) {90 000, 100 000, 100 001, 150 000, 2 MB + 1} →
  {401, 401, 413, 413, 413}; có phiên + 150 000 → 413; 413 của hai đường cùng khuôn.
- `_acceptance/chat-duong-day-ban-chup/rang/mot-cho-khai.mjs`: đường `/lo-trinh/ban-chup` chỉ được gõ
  trong tệp cấu hình; `maxBodySize` trong `createApp` chỉ nhận tên hằng.
- Toàn bộ bài `scripts/ban-chup-lo-trinh/test` chạy thêm một lượt với env giống CI của PR.
- `scripts/ban-chup-lo-trinh/test/day.test.ts`: ma trận nơi chạy × ref — Actions + onehub →
  đẩy; Actions + nhánh khác / thẻ / thiếu ref → mã 1, 0 lời gọi mạng, câu báo nêu ref; ngoài
  Actions → như cũ. Thêm quan hệ workflow ↔ `refDay`.
- `docs/api.md` mục «Bản chụp lộ trình» thêm hai gạch đầu dòng.

## Đặc tả UX

Không có màn nào đổi — bỏ, có dòng sổ.
