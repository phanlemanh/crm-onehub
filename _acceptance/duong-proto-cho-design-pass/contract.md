---
schema_version: 1
feature: Đường proto cho nghi thức design-pass — route /proto sau cờ dev, sổ đăng ký có khai state, proto mẫu ghép từ @crm/ui, và ba khoá design_pass trong config
slug: duong-proto-cho-design-pass
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
design_doc: docs/superpowers/specs/2026-09-16-duong-proto-cho-design-pass-design.md
status: verified
approved_by: Mạnh
approved_at: 2026-09-16
---

# Acceptance Contract: duong-proto-cho-design-pass

## Context

Skill `design-pass` dừng ở preflight khi `_acceptance/config.yaml` thiếu
`design_pass.proto_route`, và luật của nó cấm đoán route mặc định lẫn tự dựng
proto trong phiên thẩm mỹ. Kho chỉ khai `ds_skill`. Hệ quả đo được ngày
16/09/2026: mọi vòng feature chạm UI phải bỏ bước S1-D, và Cổng 1 duyệt giao
diện bằng chữ.

Vết gần nhất: `_acceptance/cho-phep-ai-vao-o-man-hinh/decisions.jsonl` entry
`d-20260916T021648Z-6`, `revisit` ghi đúng một dòng — "khi kho wire
`design_pass.proto_route`".

Vòng này dựng đường ống đó: một nhánh route `/proto` sau cờ `PROTO_ROUTE`, một sổ
đăng ký buộc mỗi proto khai state, một proto mẫu ghép từ `@crm/ui`, và ba khoá
`design_pass` trỏ vào vật có thật.

## Acceptance Criteria

**AC-1 (cross-layer)** — Bản bấm được mở được ở dev khi cờ bật
Given `PROTO_ROUTE=1` và dev server của `apps/app` đang chạy ở cổng 3000
When mở `http://localhost:3000/proto/duong-proto`
Then trang trả mã 200 và render proto mẫu bằng component thật của `@crm/ui`
(không phải HTML tự vẽ), với thanh chuyển state hiện đủ tên năm state.

**AC-2 (cross-layer)** — Cờ tắt thì cả nhánh biến mất
Given `PROTO_ROUTE` không đặt (hoặc đặt giá trị khác `1`), và KHÔNG có cookie
phiên — tức proxy đã cho `/proto` đi qua vì nó nằm trong `ANONYMOUS`
When mở `/proto` và `/proto/duong-proto`
Then cả hai trả mã 404. Cờ là lớp chặn duy nhất còn lại sau khi proxy thôi canh
nhánh này, nên phép đo phải chạy ở đúng điều kiện không-phiên đó — đo khi đang
đăng nhập thì không phân biệt được "cờ chặn" với "proxy chặn".

**AC-3** — Bản dựng cho chạy thật không mang đường proto
Given `bun run build` chạy với `PROTO_ROUTE` không đặt
When khởi động bản đã dựng và gọi `/proto`
Then trả 404, và bản dựng không phát sinh lỗi vì nhánh proto.

**AC-4** — State chọn được qua URL
Given proto mẫu khai năm state trong sổ đăng ký
When mở `/proto/duong-proto?state=<id>` lần lượt với từng id đã khai
Then mỗi lần trả 200 và nội dung khác nhau giữa các state; state đang bật được
đánh dấu `aria-current` trên thanh chuyển.

**AC-5** — State lạ không rơi về mặc định
Given proto mẫu không khai state `khong-ton-tai`
When mở `/proto/duong-proto?state=khong-ton-tai`
Then trả 404 — KHÔNG render state đầu tiên. Một lỗi gõ sai phải lộ ra thành lỗi,
không thành một ô ma trận chụp giả.

**AC-6** — Slug lạ trả 404
Given sổ đăng ký không có slug `khong-ton-tai`
When mở `/proto/khong-ton-tai`
Then trả 404, không phải trang trắng hay lỗi 500.

**AC-7** — Mục lục khớp sổ đăng ký
Given sổ đăng ký có N proto
When mở `/proto` với cờ bật
Then mục lục liệt kê đúng N proto đó — không sót, không thừa — mỗi dòng có tên,
slug và số state, và liên kết của mỗi dòng mở đúng trang proto tương ứng.

**AC-8** — Thêm proto mà quên khai state thì bị chặn
Given sổ đăng ký tách hai: `catalog.ts` giữ dữ liệu thuần (slug, tên, states),
`registry.ts` ghép slug → Component
When chạy phép đo — phép đo **nạp `catalog.ts` bằng import, đúng đường mã thật
dùng**, không bóc văn bản bằng biểu thức chuỗi
Then mọi mục có slug và tên khác rỗng, `states` có ít nhất một phần tử với id
duy nhất; mọi slug trong `catalog` có Component trong `registry` và ngược lại;
một mục `states` rỗng làm phép đo đỏ với thông điệp gọi **đích danh** slug thiếu.
Phép đo phải có sàn cứng (`catalog` dài ≥ 1, `duong-proto` đúng 5 state) trước
mọi vòng lặp — "mọi mục đều hợp lệ" trên một tập rỗng là một câu đúng vô nghĩa.

**AC-9** — Ba khoá config trỏ vào vật có thật
Given `_acceptance/config.yaml`
When đọc khối `design_pass`
Then có đủ `proto_route`, `dev_cmd`, `host_embed`; `proto_route` chứa chuỗi
`{slug}` và phần đường dẫn của nó khớp nhánh route có thật trong `apps/app`;
`dev_cmd` mang biến `PROTO_ROUTE=1`; `host_embed.guide` và `host_embed.route` trỏ
tới file tồn tại trên đĩa; `host_embed.dev_flag` đúng tên biến mà mã đọc.

**AC-10** — Biến và tài liệu khai đúng nếp kho
Given luật một `.env` duy nhất ở gốc của AGENTS.md
When đọc `.env.example`, `docs/proto.md` và bảng chỉ mục của `AGENTS.md`
Then `.env.example` có `PROTO_ROUTE` kèm chú giải nói nó làm gì; `docs/proto.md`
tồn tại và mô tả được cách thêm một proto module; bảng của `AGENTS.md` có một
dòng trỏ tới `docs/proto.md`. Không có `.env` theo gói, và biến không khai vào
`apps/api/src/config/env.validation.ts` vì API không đọc nó.

**AC-11** — Proto không kéo gói server vào trình duyệt
Given luật client-không-import-gói-server của AGENTS.md
When quét mọi file dưới `apps/app/app/proto/`
Then không file nào nhập `@crm/db`, `@crm/auth` hay barrel `@crm/ui`; mọi lần
nhập `@crm/ui` đều theo subpath (`@crm/ui/components/<tên>`).

**AC-13** — Proxy chỉ mở đúng nhánh proto
Given `apps/app/proxy.ts` được thêm `/proto` vào danh sách `ANONYMOUS`
When gọi không cookie phiên tới một đường thuộc phần được canh (ví dụ
`/settings`, `/contacts`, `/` khi không phải bản tiếp thị)
Then vẫn bị đá về `/sign-in` như trước. Danh sách `ANONYMOUS` dài thêm đúng một
mục, và `/protoXYZ` (tiền tố giống nhưng khác đoạn) KHÔNG được coi là ẩn danh.

**AC-12** — Ma trận chụp được thật
Given proto mẫu đang chạy ở dev với cờ bật
When chụp từng ô state × khổ (375, 1280) × theme (light, dark)
Then mỗi ô cho một ảnh khác biệt thấy được, không ô nào trắng hay trùng khít ô
khác; ảnh nằm dưới `_acceptance/duong-proto-cho-design-pass/evidence/design-pass/`
theo khuôn tên `<state>--<breakpoint>--<theme>.png`.

**AC-15 (cross-layer)** — Lệnh trong tài liệu thật sự truyền được cờ
Given `docs/environment.md` khai một biến có **ba** nhà: `.env.example`,
`env.validation.ts` khi API đọc, và `globalPassThroughEnv` của `turbo.json`
When chạy đúng lệnh khai ở `design_pass.dev_cmd` (đi qua turbo, chế độ `strict`)
Then cờ tới được tiến trình con và `/proto` mở được. Phép đo phải đọc **nhà thứ
ba**, không chỉ kiểm chuỗi `PROTO_ROUTE=1` có mặt trong lệnh — kiểm chuỗi là đo
lời khai, không đo hành vi.

**AC-16** — Slug hồ sơ giải được thành một bản mẫu
Given `design_pass` điền `{slug}` bằng slug **hồ sơ nghiệm thu** (tên thư mục
dưới `_acceptance/`), không phải slug do sổ proto tự đặt
When mở `proto_route` đã điền slug của hồ sơ đang xét
Then trang trả 200. Phép đo phải thử giải **một slug hồ sơ có thật**, không dừng
ở mức "nhánh `/proto` tồn tại trên đĩa". Luật kèm theo: slug trong sổ proto phải
bằng slug hồ sơ nó phục vụ, và `docs/proto.md` phải nói ra luật đó.

**AC-14** — Phòng trưng bày không thối trong im lặng
Given proto mẫu ghép từ component thật của `@crm/ui`, và proto ở lại vĩnh viễn
When một export mà proto đang dùng bị gỡ, hoặc kiểu `ProtoState` đổi
Then `bun run build` và `bun run check-types` đỏ, và thông điệp trỏ vào file
dưới `apps/app/app/proto/`. Đây là lưới drift thay cho một máy dọn riêng — và là
lý do kỹ thuật để bắt bậc `real-components` chứ không phải lý do thẩm mỹ.

## Coverage

Quét bằng `morphological-scan`, bác preset `entity-feature` (bốn trục của nó sinh
từ một danh từ có PII và người dùng cuối; proto module là vật của thợ, dữ liệu
giả, không role). Trục tự dựng theo B1:

| Trục | Giá trị | Thước CE | AC phủ |
|---|---|---|---|
| A — vòng đời proto | khai sinh · mở & duyệt · sống chung bản thật · gỡ/đổi tên | Storybook CSF; `design-pass/SKILL.md` mục 5 | AC-8 (khai sinh), AC-12 (mở & duyệt), AC-14 (sống chung bản thật); gỡ/đổi tên → Out of scope |
| B — bề mặt phơi ra | mục lục · trang proto · `?state=` · slug lạ · state lạ | `design-pass/SKILL.md` mục 1+3; Storybook `?path=` | AC-7, AC-1, AC-4, AC-6, AC-5 |
| C — bản khai khớp vật thật | `proto_route` · `dev_cmd` · `host_embed` · `.env.example` · `docs/proto.md` | bảng khoá mục 1 SKILL.md; luật một `.env` của AGENTS.md | AC-9, AC-10 |
| D — môi trường × cờ | dev+bật · dev+tắt · prod+tắt · prod+bật | `apps/app/next.config.ts`; luật "không lộ ở bản chạy thật" | AC-1, AC-2, AC-3; prod+bật → Out of scope (đường preview, chưa có bản triển khai nào bật) |
| E — lớp canh đường | proxy · cờ dev · sổ đăng ký | `apps/app/proxy.ts`; luật client-không-import-gói-server | AC-13, AC-2, AC-6 |
| C' — nhà thứ ba của biến (nâng phạm vi S4-r2) | `.env.example` · `env.validation.ts` · `globalPassThroughEnv` | `docs/environment.md` | AC-15 |
| B' — slug giải được (nâng phạm vi S4-r2) | slug hồ sơ ↔ slug sổ proto | hợp đồng của skill `design-pass` mục 1 | AC-16 |

Chân ngành đối chiếu (bậc a, tên thật): Storybook, Chromatic, Ladle, Histoire.

Chân sản phẩm dựng ở nấc (b) — kho chưa có mục `## Product Context`. Mọi dòng
truy được về vật có thật: `[SUY-TỪ-REPO: AGENTS.md]`,
`[SUY-TỪ-REPO: docs/design.md]`, `[SUY-TỪ-REPO: apps/app/next.config.ts]`,
`[SUY-TỪ-REPO: _acceptance/config.yaml]`. Không dòng nào `[GIẢ ĐỊNH]`.

Cross-cutting áp mọi ô Core: khổ 375/1280 × theme light/dark (AC-12) · chỉ nhập
`@crm/ui` theo subpath (AC-11) · không chú thích trong code · bán kính/màu theo
`docs/design.md`.

## Out of scope

- **Gỡ / đổi tên proto.** Phòng trưng bày vừa mở, chưa có vật nào cần gỡ; dựng
  luật dọn cho một kho rỗng là dựng máy không có việc.
- **Lưới drift riêng cho proto cũ.** `check-types` và `build` đã canh vì proto
  nằm trong đồ thị của chúng; lưới thứ hai đo cùng một thứ là thêm chỗ hỏng.
- **Tìm kiếm / lọc trong mục lục.** Một proto thì danh sách là danh sách.
- **`design_pass.capture_cmd`.** `scripts/ui-capture.mjs` là bản tham chiếu
  một-URL→một-file, không khớp quy ước đặt tên ma trận của design-pass. Khai một
  lệnh không khớp tệ hơn để trống.
- **Ánh xạ nhiều-proto-cho-một-hồ-sơ.** AC-16 chốt luật một-đối-một (slug sổ =
  slug hồ sơ). Một hồ sơ cần nhiều bản mẫu là việc của vòng sau.
- **Wire `executors.design.static`.** Bảng CT1 của feature-loop trỏ
  `config:executors.design.static`; kho chỉ có `.gate` và `.ui_check`, con trỏ đó
  đang chết. Làn static, không phải làn proto.
- **Xác thực cho `/proto`.** Sau cờ dev, dữ liệu giả — thêm cửa mà không thêm một
  phần an toàn nào.
- **Đường ghi / tRPC trong proto.** Ràng buộc cứng của design-pass cấm tường
  minh.
- **Bật proto trên một bản triển khai preview.** Cơ chế cho phép (biến môi
  trường), nhưng vòng này không dựng và không đo đường đó.

## Notes

Đổi `apps/app/proxy.ts` là chỗ nặng nhất của vòng này. File không nằm trong
`t3_paths` nên hạng vẫn T2, nhưng nó cạnh xác thực: sau thay đổi, `/proto` không
còn được proxy canh và cờ `PROTO_ROUTE` là lớp chặn duy nhất. AC-2 đo đúng điều
kiện không-phiên để phân biệt được cờ-chặn với proxy-chặn; AC-13 đo rằng danh
sách chỉ dài thêm đúng một mục.

Nút mồi: vòng này tự nó chạm UI nên theo luật S1-D phải chạy design-pass trước
Cổng 1 — mà design-pass cần chính `proto_route` vòng này đang dựng. Bỏ S1-D ở
vòng này là entry `descope` có tên trong sổ quyết định; từ vòng sau không còn cớ
đó.
