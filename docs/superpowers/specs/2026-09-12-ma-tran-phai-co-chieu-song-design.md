# Ma trận phải có chiều sống — thiết kế

## Vấn đề

`apps/agent/test/quyen-luot.spec.ts` (khối `describe("suy-dien")`) dựng hai biến
thể `inputResponse`, ghim `expect(BIEN_THE).toHaveLength(2)`, rồi lặp — đúng
khuôn ma trận toàn phần mà hợp đồng `do-quyen-luot-bang-hanh-vi` đòi ở AC-1.

Nhưng chiều được biến thiên là chiều **chết**. `builderSessionAuthFromRow`
(`apps/agent/agent/lib/custom-agent-dispatch.ts`) chỉ đọc `row.commandType`,
`row.id`, `row.conversation.userId`, `row.conversation.title`. Nó không chạm
`row.message`. Hai vòng lặp vì thế tính ra **cùng một khối thuộc tính, từng
byte**: số assert bằng 2, số phần tử thật bằng 1.

Hai vectơ đỏ đã khai cho AC-1 cũng không cứu. `ternary-xuong-dong` suy quyền
bằng `JSON.stringify(row.message).includes("agent")` — chữ `agent` nằm ở
`message.text`, không nằm ở `inputResponse` — nên dưới đột biến, hai biến thể
vẫn hành xử y hệt nhau.

Người ký chọn **mở hợp đồng mới** cho mục này ở Cổng 2 vòng chấm 9 của hồ sơ
trước.

## Sản phẩm đang ĐÚNG

Vòng này không đổi một dòng mã sản phẩm. Cổng quyền chỉ được đọc `commandType`
của hàng; việc nó **không** đọc `inputResponse` chính là bất biến mà hồ sơ
trước dựng ra để giữ. Thứ sai là lời tuyên của phép đo, không phải hành vi.

## Đường đã chọn

**Giữ lời hứa lớp, và làm cho nó thật.**

Chiều xanh đổi từ «lặp hai lần rồi assert giống nhau ở mỗi lần» thành một **bất
biến đo được**: dựng khối thuộc tính từ hai hàng chỉ khác `inputResponse`, rồi
đòi hai khối ấy **bằng nhau từng byte**. Đây là một quan hệ metamorphic kiểu
bất biến — đổi một đầu vào, đầu ra phải không đổi. Chiều chết hiện nay là một
tai nạn im lặng; sau thay đổi, nó là thứ được chứng minh.

### Vì sao chiều đỏ cắm vào chỗ đó

Đột biến hiển nhiên nhất — cắm ternary đọc `inputResponse` ngay tại chỗ gọi —
**đã có sàn khác bắt**: AC-2 điều 3 của hồ sơ trước đòi initializer của
`commandType` tại mọi lời gọi phải là `<một định danh trần>.commandType`. Lấy
hình dạng ấy làm chiều đỏ cho bài hành vi thì bài hành vi chỉ lặp lại một sàn
đã có — đúng loại «hai đường tới cùng một sự thật» mà hồ sơ trước đã hai lần
cắt bớt.

Chỗ **chưa ai canh**: ma trận khoá chỉ theo dõi chữ `commandType`. Thêm một
thuộc tính phiên **mới** — khoá khác tên — rồi cho `builderTurnAuthorized` đọc
nó, thì không sàn AST nào đỏ. Khoá mới không phải `commandType`, và cổng vẫn
chỉ «đọc một thuộc tính». Chỉ một phép đo hành vi chạy hai biến thể mới thấy
hai kết quả tách nhau.

Nên chiều đỏ là một vectơ đột biến **hai tệp**:

| Tệp | Đột biến |
|---|---|
| `apps/agent/agent/lib/custom-agent-dispatch.ts` | thêm một thuộc tính phiên suy từ có mặt `optionId` |
| `apps/agent/agent/lib/session-purpose.ts` | cho `builderTurnAuthorized` đọc thuộc tính ấy |

Dưới đột biến: biến thể `text` giữ cổng đóng, biến thể `optionId` mở cổng. Hai
khối thuộc tính thôi bằng nhau, và bài cổng đỏ ở biến thể thứ hai — cả hai
assert cùng bắt.

## Đường đã loại

- **Bỏ lời hứa lớp, thu về một điểm.** Rẻ nhất và trung thực hơn hiện tại,
  nhưng hợp đồng mất hẳn một lời hứa về lớp: ai thêm biến thể thứ ba sau này
  không có chỗ nào bắt phải khai.
- **Quét cả trục «cách đúc ra quyền»** (năm giá trị của hợp đồng cũ). Phủ rộng
  nhất nhưng là một vòng to hơn hẳn, và hai giá trị trong đó hợp đồng cũ đã cố
  ý cắt với lý do còn đứng.
- **Đột biến một tệp tại chỗ gọi.** Rẻ, dễ đọc, nhưng trùng sàn AST nên không
  chứng minh được bài hành vi mua thứ gì sàn bỏ sót.

## Giới hạn đã biết

Bất biến «hai khối bằng nhau từng byte» bắt được mọi đường quyền chảy **qua
khối thuộc tính**. Một đường leo quyền không đi qua khối ấy — ví dụ agent tự
đọc hàng lần thứ hai ở chỗ khác — thì bài này không thấy. Đó là chỗ hai sàn AST
của hồ sơ trước canh, và vòng này không mở rộng chúng.
