---
schema_version: 1
feature: Ma trận phải có chiều sống — đổi lời tuyên quét lớp của phép đo AC-1 cũ thành một bất biến đo được, và cắm chiều đỏ vào đúng chỗ hai sàn AST mù
slug: ma-tran-phai-co-chieu-song
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-09-12-ma-tran-phai-co-chieu-song-design.md
---

# Acceptance Contract: ma-tran-phai-co-chieu-song

## Bối cảnh

Khối `describe("suy-dien")` của `apps/agent/test/quyen-luot.spec.ts` dựng hai
biến thể `inputResponse`, ghim `expect(BIEN_THE).toHaveLength(2)` rồi lặp —
đúng khuôn ma trận toàn phần mà AC-1 của hồ sơ `do-quyen-luot-bang-hanh-vi`
đòi. Nhưng `builderSessionAuthFromRow` không đọc `row.message`, nên hai vòng
lặp tính ra **cùng một khối thuộc tính từng byte**: số assert bằng 2, số phần
tử thật bằng 1.

Người ký chọn **mở hợp đồng mới** cho mục này ở Cổng 2 vòng chấm 9 của hồ sơ
trước (12/09).

Vòng này **không đổi mã sản phẩm**. Cổng quyền chỉ đọc `commandType` của hàng,
và việc nó không đọc `inputResponse` chính là bất biến hồ sơ trước dựng ra để
giữ. Thứ sai là lời tuyên của phép đo.

## Coverage

Quét bằng `morphological-scan`. Preset `test-matrix` bị chất vấn và **thay cả
bốn trục**: trục của preset (surface · role × quyền · trạng thái dữ liệu ·
môi trường) là trục để thử một *tính năng*, còn vật của vòng này là một *phép
đo*.

- **Trục A — chỗ một quyền đúc ra mà KHÔNG viết ra khoá `commandType`**, tức
  chỗ hai sàn AST của hồ sơ trước mù: thuộc tính phiên mới mang khoá khác tên |
  cổng đọc thẳng một nguồn ngoài khối thuộc tính | ghi đè `commandType` sau khi
  hàm thật đã trả về | suy từ một thuộc tính đã có sẵn
  [thước CE: sự cố 2026-09-08 (`inputResponse`) + vòng chấm 8 của hồ sơ trước
  (phép gán lọt cả hai sàn, đã cấy thử) + `[NGÀNH: OWASP Top 10 for LLM
  Applications — Excessive Agency]`]
- **Trục B — cách một phép đo tuyên nhiều hơn nó phủ:** chiều biến thiên chết |
  assert âm tính một mình không đối chứng dương | fixture viết tay đúng khuôn
  bên đọc | đo chuỗi có mặt trong khi lời hứa là quan hệ | ghim số lượng mà
  không ghim khác biệt
  [thước CE: `review-findings.md` của sáu vòng chấm hồ sơ
  `do-quyen-luot-bang-hanh-vi` — mỗi lớp lỗi ở đây là một finding đã xác nhận]
- **Trục C — hình thức bằng chứng:** bất biến hành vi | vectơ đột biến | sàn
  đọc mã bằng AST | tài liệu
  [thước CE: `[NGÀNH: metamorphic testing — Chen et al.]` cho dạng bất biến,
  `[NGÀNH: mutation testing — DeMillo/Lipton]` cho vectơ — một phép đo chưa
  từng đỏ không phân biệt được vật lành với thước chưa chạy]

Cross-cutting áp mọi ô Core: cặp hai chiều trên cùng fixture kèm thông điệp
ghim; đường dẫn trong răng suy từ vị trí script; không viết chú thích trong
code.

Ô đã cắt:

- **Later** — A×C "cổng đọc thẳng nguồn ngoài khối thuộc tính": đường ấy chưa
  tồn tại trong mã, và bắt nó cần một sàn mới soi `session-purpose.ts`.
- **Later** — A×C "ghi đè `commandType` sau khi hàm thật trả về": AC-1 của hồ
  sơ trước đã **cấm bằng lời** nhưng chưa có vectơ; đáng làm, nhưng là một
  vectơ của hồ sơ ấy chứ không phải của vòng này.
- **Never** — quét cả năm giá trị trục B của hợp đồng cũ: hai trong số đó
  (`từ lịch sử hội thoại`, `grep theo dòng`) hợp đồng cũ đã cố ý cắt với lý do
  còn đứng.
- **Never** — đổi mã sản phẩm để `inputResponse` trở thành chiều sống thật:
  đó là dựng lại đúng lỗ mà hồ sơ trước vừa bịt.

## Criteria

**AC-1 — Đổi `inputResponse` thì khối thuộc tính của lượt không đổi một byte.**
Given hai hàng submission chỉ khác nhau ở `message.inputResponse` — một hàng
mang biến thể `{ requestId, text }`, hàng kia mang `{ requestId, optionId }`,
mọi trường còn lại giống hệt,
When mỗi hàng đi qua `builderSessionAuthFromRow(hàng, conversationId)`,
Then hai khối `attributes` trả về **bằng nhau sâu, từng khoá từng giá trị**, và
tập khoá của chúng bằng đúng tập đã ghim trong bài đo.
Đây là lời hứa thay cho vòng lặp cũ: bài đo thôi tuyên «đã chạy hai biến thể»
và chuyển sang tuyên «hình dạng tin nhắn không dịch được thành quyền» — một
quan hệ đo được, đỏ khi bị phá.
Assert bằng-nhau-sâu là bắt buộc; so từng trường bằng tay không tính, vì một
thuộc tính MỚI mọc thêm sẽ lọt qua phép so từng trường đã viết trước.

**AC-2 — Cổng vẫn đóng cho `CHAT` và mở cho `CREATE_AGENT`, trên cả hai biến thể.**
Given cùng hai hàng của AC-1,
When khối `attributes` ấy đi vào `builderTurnApproval(ctx)`,
Then hàng khai `commandType: "CHAT"` cho `{ type: "denied" }` với `reason` bằng
nguyên văn `BUILDER_DENIED_REASON`, và `requireBuilderAttribute(ctx, "conversationId")`
ném lỗi — ở **cả hai** biến thể.
Đối chứng dương trên cùng hàng: đổi đúng một trường `commandType` sang
`"CREATE_AGENT"` → `"not-applicable"` và `requireBuilderAttribute` trả về giá
trị — cũng ở cả hai biến thể.
AC này giữ nguyên lời hứa hành vi của hồ sơ trước; AC-1 là thứ mới.

**AC-3 — Chiều đỏ cắm vào đúng chỗ hai sàn AST mù.**
Given bản sao của cây đang xét,
When cấy một đột biến **hai tệp**: thêm vào `custom-agent-dispatch.ts` một
thuộc tính phiên mới suy từ **có mặt `optionId`**, và cho `builderTurnAuthorized`
ở `session-purpose.ts` đọc thuộc tính ấy,
Then bài đo của AC-1 và AC-2 phải **đỏ**, với thông điệp ghim gọi tên bài đỏ.
Và trên **cùng** bản sao đã đột biến: hai sàn AST của hồ sơ trước
(`dq_khong_cam_tin_nhan`, `dq_nguon_ghi`) vẫn **thoát 0** — đó là chứng minh
vòng này mua một thứ không ai bán, chứ không phải đường thứ hai tới một sự thật
đã có người giữ.
Sàn dân số: đột biến phải cắm được vào cả hai tệp; không tìm thấy mốc → mã 3.

**AC-4 — Hình dạng cũ không mọc lại.**
Given `apps/agent/test/quyen-luot.spec.ts`,
When soi bằng AST,
Then trong khối `describe("suy-dien")` **không** còn một `expect(...).toHaveLength(n)`
nào đứng ngay trước một vòng `for...of` trên cùng mảng ấy mà thân vòng không
chứa phép so sánh giữa hai lượt — đúng hình dạng «ghim số lượng mà không ghim
khác biệt» vòng này loại bỏ.
Vi phạm → mã 2, in `file:dòng`.
Khối `describe("suy-dien")` phải **còn tồn tại** với đúng tên: lệnh
`ql_khong_suy_dien` của hồ sơ cũ lọc theo tên này.

**AC-5 — Hồ sơ đã ký chạy lại vẫn thoát 0. (cross-layer)**
Given `recheck: strict` trong `_acceptance/config.yaml`,
When chạy lại **mọi** lệnh máy của hai hồ sơ đã ký mà `paths` của nó chạm
`apps/agent/test/quyen-luot.spec.ts` — `dq_cong_quyen`, `dq_khong_cam_tin_nhan`,
`dq_nguon_ghi`, `dq_bo_do_grep`, `dq_khai_sinh`, `dq_ho_so_cu_con_chay`,
`ql_quyen_ke_thua`, `ql_khong_suy_dien`, `ql_api_doc_ban_ghi` —
Then mỗi lệnh thoát **0**.
Sửa `quyen-luot.spec.ts` là chạm đúng tệp mà hồ sơ vừa ký đo. Không có AC này
thì vòng đỏ ở Cổng 2 vì một phép đo của vòng khác.
`ql_khong_suy_dien` phải nằm trong danh sách và phải gọi đích danh: hợp đồng
này **hai lần** viện chính nó làm lý do khối `describe("suy-dien")` giữ nguyên
tên, nên bỏ nó khỏi danh sách chạy lại là viện một phép đo mà không chạy nó.

**AC-6 — Tập biến thể của bài đo neo vào nơi máy chủ sinh ra chúng.**
Given `apps/api/src/conversations/conversations.service.ts`, nơi máy chủ dựng
`inputResponse` bằng một biểu thức điều kiện đúng hai nhánh — nhánh `optionId`
và nhánh `text`,
When đọc biểu thức ấy bằng AST và đếm số nhánh,
Then số nhánh phải **bằng đúng** số hàng mà bài đo của AC-1 dựng, và số ấy phải
bằng số đã ghim trong chính chân đo. Lệch → **mã 2**, in cả hai con số và
`file:dòng` của biểu thức.
Vì sao AC này tồn tại: không có nó, lời hứa LỚP của AC-1 đứng trên một tập
**viết tay**. Máy chủ thêm nhánh thứ ba thì bài đo vẫn dựng đúng hai hàng cũ,
hai khối vẫn bằng nhau, mọi eval vẫn xanh — và lời hứa lớp thành rỗng. Đây
chính là lớp lỗi vòng này tồn tại để vá, nên để nó tái phạm ở tập biến thể là
tự bác bỏ mình.
Đọc `apps/api/src` chứ **không sửa**: vòng này vẫn không đổi mã sản phẩm.

## Out of scope

- **Không** đổi mã sản phẩm. Cổng quyền, hàm dựng thuộc tính và đường giao tin
  nhắn giữ nguyên từng dòng.
- **Không** mở rộng hai sàn AST của hồ sơ trước để chúng bắt được thuộc tính
  mang khoá khác tên — đó là một vòng riêng, và trục A đã park nó.
- **Không** SỬA `apps/api`, `apps/app`, hay bất kỳ hồ sơ nghiệm thu đã ký nào
  ngoài việc chạy lại lệnh của chúng. AC-6 **đọc** `apps/api/src` — đọc không
  phải sửa.
- **Không** thêm biến thể `inputResponse` thứ ba: hai biến thể là tập thật mà
  `conversations.service.ts` sinh ra — và AC-6 là thứ giữ cho câu ấy đúng.
- **Không** phủ ô thứ tư của trục A — «cổng suy quyền từ một thuộc tính ĐÃ CÓ
  trong khối», ví dụ `hasTitle` hay `purpose`. Không bài nào của vòng này đỏ
  được cho ô ấy: hai biến thể mang các thuộc tính đó **giống hệt nhau**, nên
  khối vẫn bằng nhau và cổng vẫn đóng/mở như nhau. Ô này ra khỏi tầm bộ đo, và
  nó được khai ở Giới hạn đã biết chứ không im lặng.

## Notes

- Tier suy từ đường dẫn ra **T2**: đường đụng là `apps/agent/test/**` và
  `_acceptance/ma-tran-phai-co-chieu-song/**`, không khớp `t3_paths`.
- **Giới hạn đã khai — ô A4:** một đường leo quyền cho cổng đọc một thuộc tính
  **đã có sẵn** trong khối (`hasTitle`, `purpose`, `submissionId`) không bài nào
  của vòng này bắt được, vì hai biến thể mang các giá trị ấy giống hệt nhau.
  Người soi context sạch gọi tên ô này; nó được khai ra thay vì vá vội.
- Giới hạn đã khai: bất biến của AC-1 bắt được mọi đường quyền chảy **qua khối
  thuộc tính**. Một đường không đi qua khối ấy — ví dụ agent tự đọc hàng lần
  thứ hai ở chỗ khác — thì bài này không thấy; đó là chỗ hai sàn AST canh, và
  vòng này không mở rộng chúng.
