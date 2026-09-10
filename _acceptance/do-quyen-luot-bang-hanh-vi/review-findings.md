## Trong hợp đồng

### nguon-ghi.mjs: ma trận "toàn phần" mù với khoá `commandType` viết bằng string literal hoặc computed key — chỗ ghi CREATE_AGENT ghim cứng vô hình, cổng vẫn thoát 0
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs:40`
- severity: high
- AC: AC-3
- source: bugs

`laKhoaCommandType()` chỉ nhận node khi `ts.isIdentifier(node.name)`. Prisma payload viết `"commandType": "CREATE_AGENT"` (StringLiteral key) hoặc `["commandType"]: "CREATE_AGENT"` (ComputedPropertyName) đều là chỗ GHI hợp lệ nhưng không rơi vào dân số, nên vừa không bị đếm vừa không làm lệch ma trận đã ghim.

Repro (đã chạy): chép `apps/api/src` sang cây thử, thêm `probe-leak.ts` với một `create({ data: { "commandType": "CREATE_AGENT" } })` và một `update({ data: { ["commandType"]: "CREATE_AGENT" } })`, rồi `node rang/nguon-ghi.mjs --goc <cây thử>` → in đúng 9 phần tử cũ, "khop dung danh sach da ghim", exit 0. Hai đường leo thang quyền không hiện ở đâu cả.

Đây đúng lớp lỗi mà review vòng 2 đã bắt (upsert/updateMany/data-là-biến) và vòng 3 tuyên đã đóng bằng cách "đi từ CHỮ commandType chứ không từ hình dạng lời gọi" — nhưng chữ ấy vẫn chỉ được nhận diện qua Identifier. Sáu vectơ đột biến của E4 đều đột biến bằng key dạng Identifier nên không vectơ nào chạm điểm mù này. Sửa: nhận cả `ts.isStringLiteral(node.name)`, `ts.isNoSubstitutionTemplateLiteral(node.name)`, và ComputedPropertyName có literal bên trong.

### khong-cam-tin-nhan.mjs: điều kiện "builderCommandType không còn tồn tại" bỏ sót export đổi tên và method — hàm suy diễn dựng lại được mà cổng vẫn xanh
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs:56`
- severity: medium
- AC: AC-2
- source: bugs

Chân đo chỉ bắt `FunctionDeclaration` và `VariableDeclaration` mang tên `builderCommandType`, trong khi E3 điểm 2 khai là "khong khai bao ham nao, khong binding duoc export nao mang ten do trong apps/agent/agent". `export { suy as builderCommandType }` và `class Bo { builderCommandType(...) {} }` đều lọt.

Repro (đã chạy): chép `apps/agent/agent` sang cây thử, thêm `lib/probe-suy.ts` chứa `const suy = (commandType, value) => JSON.stringify(value).includes("agent") ? "CREATE_AGENT" : commandType;` + `export { suy as builderCommandType };` + một method cùng tên → `node rang/khong-cam-tin-nhan.mjs --goc <cây thử>` in "sach", exit 0.

Điểm 3 (initializer tại chỗ gọi phải là PropertyAccessExpression trần) vẫn chặn đường dùng thẳng, nhưng không chặn đường tính trước một dòng: `const row2 = { ...row, commandType: suy(row.commandType, row.message) }` rồi truyền `row2.commandType` — vẫn là PropertyAccessExpression trần nên qua cả điểm 2 lẫn điểm 3.

### khai-sinh.mjs không ép `ma` khác 0 như bản khai tuyên, nên một dòng khai `"ma": 0` biến báo động "dòng khai ra xanh" thành một lượt qua
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs:32`
- severity: medium
- AC: AC-7
- source: bugs

E8 điểm 2 khai rõ: `ma` là "so mong doi khac 0 — moi vecto cua vong nay la mot chieu DO, khong co dong doi-chung-duong nao trong ban khai". `docKhai()` chỉ kiểm `dong[truong] === undefined`, không kiểm giá trị. `chayBanKhai()` (dòng 79) đọc `dong.ma === 0` là nhãn "doi chung duong" và so `r.ma !== dong.ma`.

Hệ quả: nếu một vectơ mất khả năng bắt đột biến, sửa `"ma": 2` thành `"ma": 0` trong `khai-sinh.json` làm E8 xanh trở lại, và nhánh cảnh báo nặng nhất (`dong.ma !== 0 && r.ma === 0` → "dong khai ra xanh") không bao giờ chạy nữa. Đúng thứ E8 sinh ra để chặn lại tự tắt được bằng dữ liệu khai. Sửa: thêm kiểm `typeof dong.ma === "number" && dong.ma !== 0` trong `docKhai()`.

### Hình dạng 5 — tuyên quét lớp "mọi chỗ viết khoá commandType" nhưng bộ dò chỉ nhận tên khoá là Identifier
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs:40`
- severity: high
- AC: AC-3
- source: measurement

AC-3/E4 tuyên "MA TRAN TOAN PHAN": gom MỌI chỗ viết ra khoá `commandType` ở apps/api/src rồi so có bội với DA_GHIM. Nhưng `laKhoaCommandType` (dòng 34-43) đòi `ts.isIdentifier(node.name)`, nên một PropertyAssignment có tên khoá là chuỗi hoặc ComputedPropertyName không bao giờ vào dân số. Đã chứng minh bằng cây thử: chép apps/api/src rồi thêm `apps/api/src/x/leo.ts` với

    const KHOA = "commandType" as const;
    db.agentConversationSubmission.create({ data: { id, [KHOA]: "CREATE_AGENT" } });

Chạy `node rang/nguon-ghi.mjs --goc <cây thử>` → vẫn in đúng 9 phần tử, "khop dung danh sach da ghim", thoát 0. Một chỗ ghi thẳng CREATE_AGENT ghim cứng không xuất hiện ở đâu cả. `bunx biome check` trên đúng tệp đó cũng im lặng (chỉ cảnh báo `any` của fixture thử), nên không có cổng thứ hai đỡ. Đây đúng cùng loại lỗ mà vòng chấm 2 đã bắt cho `upsert`/`updateMany`/`data` là biến — bịt theo hình dạng lời gọi thì mọc lại theo hình dạng tên khoá.

### Hình dạng 5 — AC-2 điểm 3 gọi tên "lời gọi hàm là mã 2" nhưng chỉ kiểm node ngoài cùng là PropertyAccessExpression
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs:86`
- severity: high
- AC: AC-2
- source: measurement

AC-2 điểm 3 (và E3 điểm 3) khai: tại MỌI lời gọi `builderSessionAttributes(...)`, initializer của `commandType` phải là truy cập thuộc tính TRẦN `<x>.commandType`; "Ternary, CallExpression, template, toán tử — bất cứ biểu thức tính toán nào — là mã 2". Chân đo chỉ chạy `if (!ts.isPropertyAccessExpression(thuocTinh.initializer))`, tức chỉ xét node NGOÀI CÙNG, không đòi `<x>` là một identifier trần. Đã chứng minh: trong cây thử, sửa `custom-agent-dispatch.ts` thành `commandType: doanQuyen(row).commandType,` với `doanQuyen` suy quyền từ `JSON.stringify(row.message).includes("agent")` — chạy `node rang/khong-cam-tin-nhan.mjs --goc <cây thử>` → "122 tep, 1 cho goi builderSessionAttributes — sach", thoát 0. Đây đúng cái lỗ mà điểm 3 được thêm vào để bịt (gap-probe P0 #1): suy diễn dọn sang một dòng khác mà lời hứa "không suy quyền" vẫn xanh. Vectơ `cho-goi-tinh-toan` chỉ cấy một ternary nên không chạm tới hình dạng này.

### Hình dạng 5 — AC-2 điểm 2 tuyên "không export nào mang tên builderCommandType" nhưng chỉ soi FunctionDeclaration và VariableDeclaration
- file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs:57`
- severity: medium
- AC: AC-2
- source: measurement

AC-2 điểm 2 và E3 điểm 2 khai phạm vi là cả lớp: "không khai báo hàm nào, không binding được export nào mang tên đó trong apps/agent/agent". Chân đo (dòng 56-63) chỉ bắt `ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)` có `node.name` là Identifier `builderCommandType`; ExportSpecifier (`export { x as builderCommandType }`), MethodDeclaration và PropertyAssignment cùng tên đều nằm ngoài. Đã chứng minh: thêm `apps/agent/agent/x/suy.ts` với `function suyTuTinNhan(...) { ... }` rồi `export { suyTuTinNhan as builderCommandType };` — chạy `node rang/khong-cam-tin-nhan.mjs --goc <cây thử>` → "123 tep ... sach", thoát 0, dù đúng cái tên AC-2 cấm đang được export và đúng luật suy diễn cũ đang sống trong thân hàm.

### Hình dạng 2 — fixture viết tay đúng khuôn kiểu bên đọc, không round-trip từ hàng Prisma thật
- file: `apps/agent/test/quyen-luot.spec.ts:65`
- severity: medium
- AC: AC-1
- source: measurement

AC-1/E1 đòi fixture là "một HÀNG submission đúng khuôn Prisma đọc ra ở custom-agent-dispatch.ts — có id, commandType, message, attachments, conversation.userId, conversation.title". `hangSubmission` được viết tay khớp đúng `BuilderAuthRow` — một type cũng viết tay ngay trong tệp bên đọc (custom-agent-dispatch.ts:874-879) — nên không gì buộc nó khớp `select` thật. Vết trôi thấy rõ ngay trong fixture: `attachments: []` nằm LỒNG TRONG `message`, trong khi `select` thật (custom-agent-dispatch.ts:131-153) và chỗ dùng thật (`submission.attachments` ở dòng ~167) đặt `attachments` ở cấp hàng; `conversation` của fixture chỉ có `{ userId, title }` còn select thật lấy `{ id, title, userId, kind }`. Trình biên dịch không bắt được vì `BuilderAuthRow` không nhắc tới hai trường đó. Hệ quả: `select` đổi tên/đổi tầng thì E1 vẫn xanh — mũi tên "giá trị thật sự được đặt ở đâu" vẫn chưa có phép đo nào đi qua, dù gap-probe P0 #1 đã đánh dấu là fixed.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Răng E3 vẫn cho phép lấy quyền từ tin nhắn: luật chỉ đòi "là truy cập thuộc tính", không đòi đúng cột commandType của hàng**
  Người dùng thấy gì: Một vài đường suy quyền tinh vi từ nội dung tin nhắn vẫn có thể lọt qua lớp bảo vệ hiện tại, dù cơ chế chặn chính đã hoạt động đúng cho các trường hợp thông thường.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs`
  severity: medium
  Đề xuất: known-limits

- **BuilderAuthRow bắt buộc trường `message` nhưng builderSessionAuthFromRow không bao giờ đọc nó**
  Người dùng thấy gì: Đây là một chi tiết kỹ thuật nội bộ, không ảnh hưởng gì đến trải nghiệm hay quyền hạn của người dùng.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: low
  Đề xuất: known-limits

- **Khoá cây sao tự phá theo hạn của tiến trình chờ, không theo tuổi của khoá**
  Người dùng thấy gì: Nếu có nhiều phiên làm việc chạy cùng lúc trên cùng một máy, có một nguy cơ nhỏ là hai tiến trình đo tranh nhau tài nguyên dùng chung, dẫn đến phải chạy lại bằng tay.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Mọi commit của loạt này mang trailer Co-Authored-By, AGENTS.md cấm tuyệt đối**
  Người dùng thấy gì: Toàn bộ các lần lưu thay đổi trong đợt này ghi thêm tên một trợ lý AI là đồng tác giả, trong khi quy tắc nội bộ của kho không cho phép việc này. Cần chọn một hướng: sửa lại quy tắc hoặc tắt việc ghi tên đó.
  file: `AGENTS.md`
  severity: low
  Đề xuất: new-contract

- **Ghi chú trong hồ sơ cũ vẫn mô tả builderCommandType như còn sống ở apps/agent**
  Người dùng thấy gì: Một ghi chú trong tài liệu cũ vẫn nhắc tới một cơ chế đã bị gỡ bỏ, có thể khiến người đọc sau này đi tìm nhầm một chức năng không còn tồn tại.
  file: `_acceptance/quyen-luot-mang-theo/contract.md`
  severity: low
  Đề xuất: known-limits

- **Import GOC không dùng trong hai răng**
  Người dùng thấy gì: Đây là một chi tiết kỹ thuật nội bộ trong công cụ kiểm tra, không ảnh hưởng đến người dùng.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs`
  severity: low
  Đề xuất: known-limits

- **tu-kiem-khung.mjs sửa tệp nguồn có theo dõi trong cây làm việc thật; bộ bắt tín hiệu gọi process.exit nên finally khôi phục không chạy**
  Người dùng thấy gì: Nếu quá trình kiểm tra tự động bị dừng đột ngột giữa chừng, một tệp mã nguồn dùng chung có thể bị bỏ lại ở trạng thái tạm sửa đổi, ảnh hưởng tới người khác đang dùng chung máy hoặc cây làm việc đó.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
  severity: medium
  Đề xuất: new-contract

- **giuKhoa() phá khoá của tiến trình còn sống sau 120s và chủ cũ xoá tiếp khoá của chủ mới — loại trừ lẫn nhau mất tác dụng**
  Người dùng thấy gì: Khi nhiều phiên làm việc chạy song song, cơ chế khoá bảo vệ có thể tự vô hiệu hoá, khiến hai quá trình cùng thao tác trên một cây làm việc dùng chung và có nguy cơ làm hỏng trạng thái của nó.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: medium
  Đề xuất: new-contract

- **don() nuốt lỗi `git worktree remove` — đăng ký worktree rác tích lại trong git dir dùng chung, không ai thấy**
  Người dùng thấy gì: Khi việc dọn dẹp sau kiểm tra thất bại âm thầm, rác có thể tích tụ dần trong hạ tầng dùng chung mà không ai được cảnh báo.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
