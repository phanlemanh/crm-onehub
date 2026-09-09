# Đo quyền của lượt bằng hành vi

Ngày 2026-09-09 · slug `do-quyen-luot-bang-hanh-vi` · tier T2

## Vì sao có vòng này

Vòng `quyen-luot-mang-theo` để lại một phép đo tuyên quét cả lớp mà bộ dò chỉ
nhận đúng một hình dạng cú pháp. `apps/agent/test/quyen-luot.spec.ts` khoảng
dòng 81-112 nói *"đếm trên đĩa số chỗ suy quyền từ hình dạng tin nhắn phải bằng
0"*, rồi đo bằng một regex chạy trên `nguon.split("\n")`:

```
/\?\s*["']CREATE_AGENT["']\s*:/
```

Ba lỗ, hai đã ghi ở vòng chấm 7 của `chan-uy-thac-sai-luot`, một do owner soi
thêm:

1. **Bộ dò nhận một hình dạng, mệnh đề tuyên cả lớp.** Ternary xuống dòng —
   thứ Biome tự làm khi câu dài — là bộ dò mù hoàn toàn. `if (a && b) return
   "CREATE_AGENT";` cũng lọt. Gán `commandType = "CREATE_AGENT"` sau một điều
   kiện cũng lọt.
2. **Đối chứng dương vòng tròn.** Chuỗi `chung` ở dòng 88-90 do chính bài đo
   viết ra đúng khuôn regex. Nó chứng minh regex khớp cái nó được viết cho, và
   không chứng minh gì thêm.
3. **Dân số quét bỏ sót `apps/app`** — nơi `apps/app/lib/agent-builder.ts:30`
   vẫn suy `CREATE_AGENT` từ chữ trong tin nhắn.

## Quyết định gốc: client KHAI, máy chủ và agent không NÂNG

Lỗ thứ ba nói ra một câu hỏi thiết kế, không phải một lỗi đo: **quyền của lượt
đầu do ai khai?** Chuỗi thật hôm nay:

| Chỗ | Quyền đến từ đâu |
|---|---|
| `apps/app/lib/agent-builder.ts:30` | suy từ chữ trong tin nhắn (trình duyệt) |
| `apps/app/components/agent-builder/new-agent-dialog.tsx:92` | ghim `CREATE_AGENT` — nút Tạo tác nhân |
| `conversations.service.ts:424` (`createBuilder`) | `input.commandType` |
| `conversations.service.ts:478` (`submitBuilder`) | `input.commandType` |
| `conversations.service.ts:585` (`answerBuilderQuestion`) | `commandTypeFromAuthorization(...)` |
| `custom-agent-dispatch.ts:902` | `builderCommandType` — hàm đồng nhất |
| `subagents/agent_builder/lib/authorization.ts` | cổng thật: `builderTurnAuthorized(ctx)` |

Kẻ mà cổng này chặn **không phải trình duyệt, mà là chính mô hình**. Sự cố ngày
2026-09-08 là mô hình tự nâng quyền giữa hội thoại qua đường `ask_question` →
`inputResponse`; đường đó nay đã bịt phía máy chủ. Một người đã đăng nhập tự
khai `CREATE_AGENT` thì vốn cũng được bấm nút Tạo tác nhân, và theo `docs/agent.md`
biên duyệt của người là **lúc deploy**, không phải lúc lưu bản nháp.

Owner chốt ở phiên brainstorm ngày 2026-09-09: **đường B+**.

- `commandType` của lượt tạo và lượt submit là **lời khai của client**. Máy chủ
  nhận, parse ở biên, và không đối chứng — vì không có sự thật phía máy chủ nào
  để đối chứng: ý định tạo agent chỉ tồn tại ở phía người bấm.
- Thứ máy chủ **sở hữu** là phần **mang theo**: một câu trả lời kế thừa đúng
  quyền của lượt đã hỏi, suy từ câu hỏi treo đã lưu.
- Agent **không bao giờ suy lại**: nó đọc giá trị của hàng và chấm cổng.

Mệnh đề của AC-5 cũ (*"không chỗ nào còn suy quyền từ hình dạng tin nhắn"*) sai
ở phạm vi, không chỉ ở bộ dò. Mệnh đề đúng và giữ được:

> Không nơi nào ở `apps/api` và `apps/agent` **nâng** quyền từ hình dạng tin
> nhắn. Client chỉ **khai**, và lời khai đi qua đúng hai nguồn đã đặt tên.

Hệ quả: `apps/app/lib/agent-builder.ts` không phải lỗ. Nó là bộ dò ý định của ô
soạn — một tiện ích giao diện sinh ra lời khai. Lỗ thứ ba được đóng bằng **sửa
mệnh đề**, không phải bằng mở rộng dân số quét.

## Phương án đã loại

**A — tách điểm vào, máy chủ tự suy.** Bỏ trường `commandType` khỏi input tRPC,
tách `createBuilderAgent` (nút) và `createBuilderChat` (ô soạn), máy chủ suy
quyền từ đường được gọi. Loại vì nó đắt — đổi contract tRPC, đổi client, đổi
`src/generated/server.ts` — mà **không thêm một phép kiểm nào phía máy chủ**:
trình duyệt vẫn gọi thẳng được `createBuilderAgent`. Nó làm lời khai tường minh
hơn, không làm nó được đối chứng.

**C — cấm nâng quyền giữa hội thoại.** `submitBuilder` không được nâng lên
`CREATE_AGENT` nếu hội thoại chưa từng có lượt `CREATE_AGENT`. Có thêm một phép
kiểm thật, nhưng đập một luồng đang chạy: gõ *"build me an agent"* giữa một hội
thoại chat hiện đang được nhận qua `consumeBuilderIntent`.

## Sàn dân số: đổi mệnh đề, không chỉ đổi bộ dò

Sàn cũ chứng minh một **phủ định trên cả kho** — hình dạng bài toán không bao
giờ đo đủ, vì luôn còn một cách viết nữa. Sàn mới đo một **bất biến đếm được**:

> Mọi chỗ ghi `commandType` vào một `data` của Prisma trong `apps/api/src` phải
> lấy giá trị từ đúng một trong hai nguồn: `input.commandType` (lời khai đã
> parse ở biên) hoặc `commandTypeFromAuthorization(...)`.

Dân số nhỏ, liệt kê được, và fail-closed: một biến trung gian, một hàm mới, một
chuỗi ghim cứng — bất cứ thứ gì không phải hai biểu thức đã đặt tên — đều đỏ,
kèm `file:dòng`. Thêm một nguồn hợp lệ thứ ba là một hành động cố ý phải sửa
danh sách, không phải một thứ mọc lên im lặng.

Đọc bằng AST (`typescript` 5.9.2, đã có ở gốc kho — không thêm gói), không bằng
regex theo dòng. Phân biệt ghi với đọc bằng tổ tiên: một `commandType` nằm dưới
`select`, `where`, `orderBy` hay `include` là đọc, không vào dân số.

## Dọn thêm: agent thôi cầm tin nhắn ở chỗ quyết quyền

`builderCommandType(commandType, _value)` ở `custom-agent-dispatch.ts:902` nay
là hàm đồng nhất; `message` được luồn vào `builderSessionAttributes` để không
làm gì. Đây là giới hạn đã ghi ở vòng chấm 7.

Bỏ hàm, bỏ tham số `message` khỏi `builderSessionAttributes`. Lúc đó lời hứa
"agent không suy quyền từ tin nhắn" đúng **theo cấu trúc** — không suy được từ
một thứ không cầm — chứ không chỉ đúng theo một phép đo.

## Phép đo hành vi

Chuỗi sản phẩm chạy đúng một đường, và đo được không cần cơ sở dữ liệu:

```
hàng submission  (khuôn Prisma đọc ra ở custom-agent-dispatch.ts)
  → builderSessionAuthFromRow(hàng, conversationId)     ← hàm tách mới
      → builderSessionAttributes({ commandType, conversationId, userId, … })
  → thuộc tính phiên
  → builderTurnApproval(ctx) / requireBuilderAttribute(ctx, key)
```

**Vì sao fixture là HÀNG chứ không phải khối tham số.** Người phản biện context
sạch chỉ ra mũi tên đầu tiên — chỗ mã *rút* trường từ hàng để dựng tham số — sẽ
nằm ngoài đường đo nếu bài đo nạp thẳng vào `builderSessionAttributes`. Và đó
đúng là chỗ một suy diễn mới sẽ mọc: ai đó viết
`commandType: row.message.includes("build me an agent") ? … : row.commandType`
tại chỗ gọi thì chữ ký hàm không đổi, `builderCommandType` vẫn vắng, sàn AST của
`apps/api` không thấy — mọi tiêu chí xanh trong khi agent đã suy lại quyền.

Nên tách một hàm sản phẩm `builderSessionAuthFromRow(hàng, conversationId)` dựng
trọn khối `auth` mà dispatch giao cho eve, và đo qua nó. Đổi lại có thêm một hàm
sản phẩm sinh ra chỉ để một đầu nối trở nên đo được — nhận vào một cách cố ý,
vì chính đầu nối ấy là chỗ đáng canh. Kèm theo là một bất biến AST: tại **mọi**
chỗ gọi `builderSessionAttributes`, initializer của `commandType` phải là truy
cập thuộc tính trần, không được là biểu thức tính toán.

Phép đo thay cho E5: dựng một **hàng** khai `CHAT` mang tin nhắn **đúng khuôn
xin tạo agent** (`"Build me an agent that flags stalled deals"`) **và** mang
`inputResponse` đầy đủ (`requestId` + `text`, và biến thể `requestId` +
`optionId`), cho nó đi trọn đường trên bằng hàm sản phẩm thật, rồi hỏi cổng.
Kết quả phải là `denied` với đúng chuỗi `BUILDER_DENIED_REASON`. Chiều dương
trên cùng hàng: đổi đúng một trường `commandType` sang `CREATE_AGENT` →
`not-applicable`.

Không ghi đè fixture, không gọi hàm phụ, không dựng thuộc tính phiên bằng tay —
chính ba lối tắt ấy làm lỗ của vòng trước sống sót qua ba vòng chấm.

## Chiều đỏ

Mọi phép đo mới đi theo quy ước `rang/` đã có trong kho: mỗi răng là một `.mjs`
dựng bản sao cây, đột biến vật thật trong bản sao, chạy lại thước, và đòi **mã
thoát khác 0 kèm thông điệp ghim** nêu tên mốc. `GOC` suy từ vị trí script,
không ghim cứng đường gốc. Tiền lệ theo sát:
`_acceptance/cron-theo-ban-khai/rang/`.

**Cây sao dựng từ TRẠNG THÁI ĐANG XÉT, không từ `HEAD`.** Quy ước cũ trong kho
dùng `git worktree add --detach … HEAD`, mà S4 chạy trên cây làm việc: mã mới
có thể chưa commit, và khi ấy răng đo một cây khác cây đang xét rồi vẫn in ra
màu như thường — đúng vết *"đo trong cây chung là đo bẩn"*. Nên dựng cây sao
lên object của `git stash create` (hoặc chép theo `git ls-files` cộng thay đổi
chưa commit), và **trước mỗi vectơ** chạy một assert danh tính trên bản sao
chưa đột biến: `builderCommandType` phải vắng, `builderSessionAttributes` phải
không có tham số `message`, `builderSessionAuthFromRow` phải có. Không đạt là
mã 2 với đúng chữ *"cây sao không chứa mã đang xét"*, kèm đường tuyệt đối và sha.

`khai-sinh.json` liệt kê **từng vectơ**, không phải từng răng: mỗi dòng có `id`
eval, `vecto` (tên trùng nguyên văn tên trong `expected`), `chay`, `ghim`, `ma`.
`khai-sinh.mjs` đếm số vectơ khai trong `expected` của mỗi eval và đòi số dòng
khai bằng đúng số đó — *"ít nhất một dòng"* không đủ, vì vectơ bị bỏ quên
thường là vectơ nguy hiểm nhất.

## Hồ sơ cũ

Không viết lại lời hứa của `quyen-luot-mang-theo`: hồ sơ là vết của một thời
điểm, sửa chữ là làm lệch vết, và bằng chứng đã ghim `verified_commit` của nó
sẽ nói về một lời hứa khác với lời hứa nó đã chấm. Chỉ phụ vào `## Notes` một
dòng giới hạn đã biết trỏ sang vòng này. Bài đo grep trong mã thì **vẫn xoá** —
nó là mã, không phải hồ sơ.

**Nhưng đóng băng chữ thì kéo theo một ràng buộc thi hành.** `_acceptance/config.yaml`
khai `recheck: strict`, nên các lệnh máy của hồ sơ cũ vẫn được chạy lại. Lệnh
`ql_khong_suy_dien` lọc `-t suy-dien`, và bài **đầu** của khối ấy gọi
`builderCommandType` — đúng hàm vòng này xoá. Ba đường: chữa `expected` đã ghim
(bị chính quyết định trên cấm), xoá khối `describe` (làm lệnh cũ thất bại), hoặc
**giữ nguyên tên khối và thay ruột nó bằng phép đo hành vi mới**. Chọn đường ba.

Cái giá của đường ba nói thẳng ra: `expected` đã ghim của E5 cũ từ nay **không
còn mô tả thứ mà lệnh của nó chạy**. Đó là một lệch có thật, nên dòng giới hạn
phụ vào `## Notes` của hồ sơ cũ phải nói đúng câu ấy — không chỉ trỏ sang slug
mới. AC-8 khai tường minh vùng nào đóng băng (AC-5 và khối E5) và vùng nào được
động (`## Notes`), để hai tiêu chí không đá nhau.

## Ngoài phạm vi

- Không đổi hình dạng input tRPC, không tách điểm vào (phương án A).
- Không siết đường nâng quyền giữa hội thoại (phương án C).
- Không đụng `apps/app`: bộ dò ý định của ô soạn giữ nguyên.
- Không thêm phép đo tích hợp chạm cơ sở dữ liệu thật cho `answerBuilderQuestion` —
  fixture của AC-1 là một object hàng viết trong bộ nhớ, không đọc DB.
- Không đổi `t3_paths` của `_acceptance/config.yaml` (xem Rủi ro).

## Rủi ro đã biết

**Tier suy từ đường dẫn ra T2, nhưng việc này là chuỗi quyền.**
`_acceptance/config.yaml` liệt `apps/api/src/auth`, `api-keys`, `sso`, `users`,
`workspace`, `tracking`, `mailbox` vào `t3_paths` — không có
`apps/api/src/conversations/**`. Vòng này chỉ **đọc** `conversations` (sàn AST
không sửa mã ở đó), nên T2 là đúng theo luật. Nhưng bảng tier có thể đang thiếu
một dòng, và đó là việc của người quyết ở Cổng 1, không phải việc máy tự nâng.

**Sàn AST fail-closed sẽ đỏ khi có nguồn hợp lệ thứ ba.** Đó là ý định của
thiết kế, nhưng nó có giá: ai thêm một đường ghi `commandType` hợp lệ sẽ thấy
thước đỏ và phải sửa danh sách nguồn. Thông điệp đỏ phải nói được điều đó, chứ
không chỉ in `file:dòng`.

**Một AC là về tài liệu.** AC-6 đo `docs/agent.md` — chữ, không phải đầu ra của
mã. Đó là đúng thứ đường B+ giao, và tôi khai thẳng rằng nó được chấm bằng
`judgment`, không bằng máy.

## Phản biện context sạch

`_acceptance/do-quyen-luot-bang-hanh-vi/gap-probe.md` — hai P0, hai P1, một P2,
tất cả đã sửa vào artifact trước Cổng 1, không mục nào đẩy sang người ký. Hai P0
đổi hình dạng phép đo (fixture là hàng; cây sao mang mã đang xét). Một P1 sinh
ra AC-9. Một P1 nâng sàn AST của AC-3 từ cận dưới lên ma trận toàn phần. P2 nâng
bản khai sinh từ đếm theo răng lên đếm theo vectơ.
