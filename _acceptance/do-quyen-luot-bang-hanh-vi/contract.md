---
schema_version: 1
feature: Đo quyền của lượt bằng hành vi — thay bộ dò regex theo dòng của AC-5 cũ bằng phép đo đi trọn đường sản phẩm, siết mệnh đề về đúng thứ máy chủ và agent giữ được, và đổi sàn dân số sang bất biến nguồn ghi đọc bằng AST
slug: do-quyen-luot-bang-hanh-vi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent, api, docs]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-09-09-do-quyen-luot-bang-hanh-vi-design.md
---

# Acceptance Contract: do-quyen-luot-bang-hanh-vi

## Bối cảnh

`apps/agent/test/quyen-luot.spec.ts` (khoảng dòng 81-112) tuyên quét cả lớp —
*"đếm trên đĩa số chỗ suy quyền từ hình dạng tin nhắn phải bằng 0"* — nhưng đo
bằng một regex chạy theo từng dòng trên `nguon.split("\n")`. Bộ dò nhận đúng
một hình dạng cú pháp; ternary xuống dòng, `if`-`return`, và gán sau điều kiện
đều lọt. Đối chứng dương của nó là một chuỗi do chính bài đo viết theo đúng
khuôn regex. Dân số quét bỏ sót `apps/app`.

Owner chốt đường **B+** ở phiên brainstorm 2026-09-09: `commandType` của lượt
tạo và lượt submit là **lời khai của client**; máy chủ sở hữu phần **mang
theo**; `apps/agent` **không bao giờ suy lại**. Mệnh đề cũ sai ở phạm vi, nên
vòng này thay cả mệnh đề lẫn phép đo, không chỉ vá bộ dò.

Chi tiết phương án đã loại (A — tách điểm vào; C — cấm nâng quyền giữa hội
thoại) nằm ở design doc.

## Coverage

Quét bằng `morphological-scan`, preset `test-matrix` bị chất vấn và thay trục
(trục của preset là trục ma trận thử người dùng; bài này là *không gian nơi
quyền được quyết*).

- **Trục A — nơi quyền được quyết:** client khai | biên API parse lời khai | API
  ghi hàng (tạo/submit) | API tự suy (đường trả lời) | `apps/agent` đọc hàng
  thành thuộc tính phiên | `apps/agent` chấm cổng
  [thước CE: đọc thẳng chuỗi trên đĩa — `apps/app/lib/agent-builder.ts`,
  `conversations.contracts.ts:122`, `conversations.service.ts:424/478/585`,
  `custom-agent-dispatch.ts:894/902`, `subagents/agent_builder/lib/authorization.ts`]
- **Trục B — cách một quyền có thể bị đúc ra:** từ chữ trong tin nhắn | từ có
  mặt `inputResponse` | từ lịch sử hội thoại | từ giá trị ghim cứng | từ một
  nguồn thứ ba mới mọc (biến trung gian, hàm mới)
  [thước CE: sự cố 2026-09-08 (`inputResponse`) + vòng chấm 7 của
  `chan-uy-thac-sai-luot` (hình dạng cú pháp) + `[NGÀNH: OWASP Top 10 for LLM
  Applications — Excessive Agency]`, `[NGÀNH: confused deputy / capability
  security]`]
- **Trục C — hình thức phép đo:** hành vi qua hàm sản phẩm thật | sàn đọc mã
  bằng AST | tài liệu | tích hợp chạm DB | grep theo dòng
  [thước CE: `[NGÀNH: mutation testing — DeMillo/Lipton]` — một phép đo chưa
  từng đỏ không phân biệt được vật lành với thước chưa chạy]

Cross-cutting áp mọi ô Core: cặp hai chiều trên cùng fixture kèm thông điệp
ghim; đường dẫn trong răng suy từ vị trí script, không ghim cứng gốc kho; parse
ở biên, không truyền `Record<string, unknown>`.

Ô đã cắt:

- **Later** — A×C "tích hợp chạm DB thật cho `respondToQuestion`": chứng minh cả
  đường ghi chứ không chỉ hàm thuần, nhưng cần `crm_<id>_test` và chậm hơn.
- **Later** — "biên API parse lời khai": `zod` enum đã làm; đo lại là đo thư viện.
- **Never** — mọi ô ở cột "client khai": dưới B+ mọi thứ client làm đều là lời
  khai, đo nó không đo một biên quyền.
- **Never** — "từ lịch sử hội thoại": đường ấy không tồn tại trong mã, và
  phương án C đã bị loại nên nó sẽ không được dựng.
- **Never** — "grep theo dòng": chính thứ vòng này loại bỏ.

## Criteria

**AC-1 — Cổng của bộ dựng đóng khi HÀNG khai `CHAT`, dù tin nhắn đúng khuôn xin dựng tác nhân. (cross-layer)**
Given một **hàng submission** đúng khuôn Prisma đọc ra ở
`custom-agent-dispatch.ts` — có `id`, `commandType`, `message`, `attachments`,
`conversation.userId`, `conversation.title` — khai `commandType: "CHAT"` và
mang tin nhắn có chữ `"Build me an agent that flags stalled deals"` **và**
mang `inputResponse` đầy đủ (biến thể `requestId` + `text`, và biến thể
`requestId` + `optionId`),
When hàng ấy đi trọn đường sản phẩm bằng **hàm thật**: `builderSessionAuthFromRow(hàng, conversationId)`
dựng khối `auth` mà dispatch giao cho eve, rồi `builderTurnApproval(ctx)` chấm
trên đúng khối `attributes` ấy,
Then kết quả là `{ type: "denied" }` với `reason` **bằng nguyên văn**
`BUILDER_DENIED_REASON`, và `requireBuilderAttribute(ctx, "conversationId")` ném lỗi.
Đối chứng dương trên **cùng hàng**: đổi đúng một trường `commandType` của hàng
sang `"CREATE_AGENT"`, mọi trường khác giữ nguyên → `builderTurnApproval` trả
`"not-applicable"` và `requireBuilderAttribute` trả về giá trị.
Fixture là **hàng**, không phải khối tham số: chỗ mã rút trường từ hàng để dựng
tham số phải nằm TRONG đường đo, vì đó chính là chỗ một suy diễn mới sẽ mọc.
Cấm dựng thuộc tính phiên bằng tay, cấm ghi đè `commandType` sau khi hàm thật
đã trả về, cấm gọi hàm phụ thay cho cổng thật.

**AC-2 — `apps/agent` không cầm tin nhắn ở chỗ quyết quyền, và chỗ gọi không được tính toán.**
Given `apps/agent/agent`,
When soi bằng AST,
Then đủ **bốn** điều:
1. `builderSessionAttributes` không khai tham số `message`;
2. **không một thứ nào** trong dân số mang tên `builderCommandType` — không hàm,
   không biến, không lớp, không method, không thuộc tính, và không
   `export { x as builderCommandType }`;
3. tại **mọi** lời gọi `builderSessionAttributes(...)`, initializer của thuộc
   tính `commandType` là `<một định danh>.commandType` — truy cập **một tầng**
   trên một định danh trần;
4. **ma trận khoá**: mọi chỗ viết ra khoá `commandType` trong dân số — kể cả
   khoá viết bằng string literal hay computed key — khớp **có bội** danh sách đã
   ghim, mỗi phần tử xếp một loại (`doc` · `kieu` · `khai` · `khac`).
Vi phạm bất kỳ điều nào → **mã 2**, in `file:dòng`.
Ba chỗ siết ở vòng chấm 3, mỗi chỗ đều đã được dựng cây thử chứng minh là lọt
trước khi siết: điều 2 chỉ bắt `FunctionDeclaration` và `VariableDeclaration` nên
export đổi tên và method trùng tên đi qua; điều 3 chỉ đòi «là một truy cập thuộc
tính» nên `row.message.commandType` — đọc quyền thẳng từ JSON trình duyệt gửi —
đi qua; và không có điều 4 thì đường «tính trước một dòng rồi truyền
`row2.commandType`» đi qua cả điều 2 lẫn điều 3.

**AC-3 — Ma trận khoá `commandType` ở `apps/api/src` khớp đúng danh sách đã ghim.**
Given `apps/api/src`,
When đọc bằng AST và gom **mọi chỗ viết ra khoá `commandType`** — đi từ chính
chữ ấy, không đi từ hình dạng lời gọi Prisma, vì một đường ghi quyền buộc phải
viết khoá ấy ra ở đâu đó; **kể cả khi tên khoá viết bằng string literal
(`"commandType"`) hay computed key (`["commandType"]`)**,
Then tập tìm được phải **bằng đúng** danh sách đã ghim trong chân đo, **so sánh
có bội**: mỗi lần xuất hiện là một phần tử riêng, không khử trùng. Thừa hay
thiếu một phần tử đều là **mã 2**, in cả hai danh sách. Thêm một chỗ viết khoá
ấy là việc phải sửa danh sách ghim, không phải việc để thước đỏ oan.
Mỗi phần tử xếp đúng một loại, bằng luật máy: `doc` (nằm dưới `select` /
`where` / `orderBy` / `include`, kiểm bằng tổ tiên trong cây AST) · `khai`
(initializer là `<x>.commandType`) · `suy` (initializer là lời gọi
`commandTypeFromAuthorization(...)`) · `khac` (còn lại — khai báo kiểu, khuôn
`zod`).
Một phần tử `khac` nằm **ngoài** `conversations.contracts.ts` là một chỗ ghi
không lấy từ hai nguồn đã đặt tên → **mã 2**, in `file:dòng`.
Vì sao đi từ chữ chứ không từ hình dạng lời gọi: khung theo-hình-dạng bỏ sót
`upsert` (khuôn không có khoá `data`), `updateMany`, và `data` là một biến — ba
dạng mà vòng chấm 2 đã dựng cây thử và chứng minh là lọt, với `CREATE_AGENT`
ghim cứng.

**AC-4 — Đường mang theo vẫn là của máy chủ.**
Given một câu hỏi treo đã lưu,
When `commandTypeFromAuthorization` đọc nó,
Then khai không-được-phép → `"CHAT"`, khai được-phép → `"CREATE_AGENT"`, và mọi
bản ghi sai khuôn (`null`, thiếu khoá, khoá mang chuỗi thay vì boolean) → `"CHAT"`.
**Chiều đỏ của AC-4 sống trong bản khai sinh (AC-7)**, không có chân đo riêng:
dòng `mang-theo-luon-mo` đột biến `commandTypeFromAuthorization` thành hàm trả
thẳng `"CREATE_AGENT"` và đòi bài `ke-thua: doc duoc ca hai chieu tren cung khuon`
phải đỏ.
Vì sao bỏ chân đo riêng: hai vòng chấm đầu đều có một chân đo riêng cho chiều
đỏ này, và **cả hai lần nó báo một kết quả không phải kết quả thật của nó** —
vòng 1 chết bằng ngoại lệ chưa bắt khiến Node thoát mã trùng mã đã khai, vòng 2
thoát 0 trên máy nhưng làn chấm ghi 1. Chiều đỏ vẫn được chứng minh, trên đúng
vectơ ấy, bởi bản khai sinh; đường thứ hai tới cùng một sự thật thì bỏ.

**AC-5 — Bộ dò cũ không còn, và không có bộ dò regex-theo-dòng nào mọc lại.**
Given `apps/agent/test/quyen-luot.spec.ts`,
When soi bằng AST,
Then bài `"dem tren dia so cho suy quyen tu hinh dang tin nhan phai bang 0"`
không còn, và trong tệp không còn lời gọi `.split(...)` nào với đối số là
literal `"\n"` mà trong cùng một hàm lại có một literal biểu thức chính quy.
Khối `describe("suy-dien")` **giữ nguyên tên** và nay mang phép đo hành vi
của AC-1, vì lệnh `ql_khong_suy_dien` của hồ sơ cũ lọc theo đúng tên ấy.

**AC-6 — `docs/agent.md` khai rõ quyền của mỗi lượt đến từ đâu.**
Given mục `Team-agent builder and runner` của `docs/agent.md`,
When đọc nó,
Then nó nói đủ ba câu bằng chữ người đọc hiểu: `commandType` của lượt tạo và
lượt submit là lời khai của client mà máy chủ **không đối chứng**; máy chủ suy
quyền của lượt trả lời từ câu hỏi treo; `apps/agent` không bao giờ suy lại mà
chỉ đọc giá trị của hàng và chấm cổng.
Đây là AC về tài liệu, chấm bằng `judgment`, không bằng máy.

**AC-7 — Mỗi VECTƠ đột biến có một dòng khai sinh, và mỗi dòng chạy ra đỏ.**
Given `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.json`,
When chạy `khai-sinh.mjs`,
Then **số dòng khai mang `id` của một eval bằng đúng số vectơ mà `expected` của
eval ấy khai** — không phải "ít nhất một". Lệch là **mã 2**, in id eval và hai
con số. Mỗi dòng khai mang trường `vecto` trùng tên với tên vectơ trong
`expected`, để một vectơ đổi tên mà bản khai không đổi thì đỏ.
Và chạy từng dòng trên một bản sao mới: mã thoát bằng đúng `ma` đã khai, thông
điệp chứa nguyên văn chuỗi `ghim`. Một dòng khai ra **xanh** là ca đỏ nặng nhất.

**AC-8 — Hồ sơ cũ mang vết chỉnh, và lời hứa cũ không bị viết lại.**
Given `_acceptance/quyen-luot-mang-theo/contract.md` và `evals.yaml` của nó,
When đọc,
Then chữ của **AC-5** trong contract và của khối **eval id E5** trong evals.yaml
giữ nguyên **từng ký tự**, và `## Notes` của contract cũ có thêm đúng một dòng
giới hạn đã biết nêu tên slug `do-quyen-luot-bang-hanh-vi` **và nói rõ rằng
`expected` đã ghim của E5 không còn mô tả thứ lệnh của nó chạy**.
Vùng đóng băng là AC-5 và khối E5; vùng được động là `## Notes`. Hai vùng khai
tường minh để không đá nhau.

**AC-9 — Hồ sơ cũ chạy lại vẫn thoát 0. (cross-layer)**
Given `recheck: strict` trong `_acceptance/config.yaml`,
When chạy lại lệnh của từng eval máy trong `_acceptance/quyen-luot-mang-theo/evals.yaml`
mà đường đụng của vòng này chạm tới — `ql_quyen_ke_thua`, `ql_khong_suy_dien`,
`ql_con_biet_cua_ra`, `ql_cong_dong_that` —
Then mỗi lệnh thoát **0**.
Đây là hệ quả thi hành của AC-2 và AC-5: xoá `builderCommandType` làm bài đầu
của khối `suy-dien` gãy, và AC-8 cấm chữa `expected` đã ghim. Không có AC này
thì vòng đỏ ở Cổng 2 vì một phép đo của vòng khác, và đường sửa hiển nhiên nhất
lại bị AC-8 chặn.

## Out of scope

- Không đổi hình dạng input tRPC và không tách điểm vào (phương án A đã loại).
- Không cấm nâng quyền giữa hội thoại (phương án C đã loại) — gõ
  `build me an agent` giữa một hội thoại vẫn được nhận như hôm nay.
- Không đụng `apps/app`: bộ dò ý định của ô soạn giữ nguyên, vì dưới B+ nó sinh
  ra một lời khai chứ không cấp một quyền.
- Không thêm phép đo tích hợp chạm cơ sở dữ liệu thật.
- Không sửa `t3_paths` của `_acceptance/config.yaml`.

## Notes

- Tier suy từ đường dẫn ra **T2**: đường đụng dự kiến không khớp `t3_paths`, và
  `apps/api/src/conversations/**` không có trong danh sách đó. Vòng này chỉ
  **đọc** `conversations`. Bảng tier có thể đang thiếu một dòng — việc của người
  quyết ở Cổng 1, máy không tự nâng.
- Bản này là bản **duyệt lại lần hai**, sau ba vòng chấm REJECT. Vòng 3 siết
  thêm: AC-2 lên bốn điều (thêm ma trận khoá, và hai chỗ nhận diện quá hẹp), và
  AC-3 nhận cả khoá viết bằng string literal / computed key. Cả ba lỗ đều được
  người soi dựng cây thử chứng minh là lọt trước khi siết.
- Bản trước đó là bản **duyệt lại** sau hai vòng chấm REJECT. Hai chỗ đổi so với bản
  đã ký 2026-09-10: AC-3 đổi dân số từ "object `data` của lời gọi Prisma" sang
  "mọi chỗ viết ra khoá `commandType`" (khung cũ bỏ sót `upsert` · `updateMany` ·
  `data` là biến — đã chứng minh bằng cây thử); và AC-4 bỏ chân đo riêng cho
  chiều đỏ, giao việc ấy cho bản khai sinh.
- AC-6 là AC về tài liệu. Khai thẳng ở đây để nó không lẫn vào màu xanh của các
  phép đo máy.
