# Số đếm và tổng đầu cột đổi ngay khi thả — thiết kế

Hồ sơ: `_acceptance/dem-dau-cot-khi-dang-luu/`. Nguồn: Known limits Ngoài-2 của
`_acceptance/keo-tha-thoa-thuan/contract.md`.

## Vấn đề

Trên bảng cột của màn Thoả thuận, thả một thẻ sang cột khác thì thẻ dời ngay,
nhưng đầu hai cột (số thoả thuận, tổng tiền, lời «N thoả thuận chưa quy đổi»)
đứng yên cho tới khi máy chủ lưu xong và bảng tải lại. Cột cũ còn hiện dòng
«còn 1 thẻ» không có thật, vì bảng tính số thẻ ẩn bằng `count − cards.length`:
thẻ đã rời cột nhưng `count` chưa giảm.

Gốc: `applyMoves` trong `use-deal-board-move.ts` dời `cards` giữa các cột nhưng
trả nguyên `count`, `valueCents`, `unconverted` của cột.

## Cách làm

**Đầu cột suy từ các lượt dời đang chờ, giống cách thẻ đã được suy.** `applyMoves`
nhận thêm việc chỉnh đầu cột cho mỗi thẻ THẬT SỰ được nó dời (thẻ nằm ở cột khác
cột đích trong dữ liệu gốc). Vì đầu cột là dẫn xuất chứ không phải trạng thái
riêng, lưu thất bại (`forget` trên `onError`) tự trả đầu cột về đúng số trước —
không có đường hoàn tác thứ hai để viết sai.

Thẻ đã nằm ở cột đích trong dữ liệu gốc (bảng đã tải lại sau khi lưu xong, lượt dời
chưa kịp xoá) thì KHÔNG chỉnh — nếu không, đầu cột bị cộng hai lần trong khoảnh
khắc giữa lúc tải lại xong và lúc `forget`.

Mỗi thẻ được dời chỉnh hai cột theo loại của nó:

| Loại thẻ (máy chủ nói) | Cột cũ | Cột mới |
|---|---|---|
| Được tính vào tổng | số −1, tổng −giá trị quy đổi, số thẻ-được-tính −1 | số +1, tổng +giá trị, số thẻ-được-tính +1 |
| Chưa quy đổi (có số tiền, không vào tổng) | số −1, «chưa quy đổi» −1 | số +1, «chưa quy đổi» +1, thêm mã tiền |
| Không có số tiền | số −1 | số +1 |

Tổng rỗng giữ đúng nghĩa của máy chủ: cột không còn thoả thuận nào được tính thì
`valueCents = null` (đầu cột bỏ phần tổng, không in 0); cột trước rỗng tổng nhận
một thẻ được tính thì tổng bằng giá trị thẻ.

Danh sách mã tiền chưa quy đổi của cột cũ: cột đang hiện đủ mọi thẻ (`count` bằng
số thẻ hiện) thì tính lại từ các thẻ chưa quy đổi còn trong cột — khớp máy chủ.
Cột bị cắt (hơn 50 thoả thuận) thì không biết các thẻ ẩn: giữ danh sách cũ, trừ
khi số chưa quy đổi về 0 thì danh sách rỗng. Chênh lệch này chỉ sống trong lúc lưu.

## Vì sao máy chủ phải nói thẻ nào được tính

Trình duyệt không suy được từ `baseAmountCents`: thoả thuận quy đổi theo tiền báo
cáo CŨ có `baseAmount` khác rỗng mà không vào tổng (`countedWhere` đòi
`baseCurrency` = tiền báo cáo hiện tại, `docs/currency.md`). Dữ liệu mẫu của bảng cột
có đúng ca đó: thẻ EUR mang 90000 xu quy đổi nhưng không nằm trong tổng 35000.

Nên `deals.board` thêm hai trường, tính bằng CHÍNH vị từ của `ConversionService`:

- mỗi thẻ: `counted: boolean` — thoả thuận khớp `countedWhere(base)`;
- mỗi cột: `countedCount: number` — số thoả thuận của cột khớp `countedWhere(base)`,
  kể cả phần vượt 50 thẻ (để biết khi nào tổng trở về rỗng).

Luật «trí khôn không nằm ở API» không bị chạm: đây là đọc lại vị từ tiền tệ đã có,
không phải suy luận mới. Trường thêm vào là cộng thêm; `deals.list` không đổi.

## Phương án bị loại

- **Trình duyệt đoán «được tính» từ `baseAmountCents !== null`** — sai đúng ca thẻ EUR
  của dữ liệu mẫu; tổng cột đích sẽ cộng tiền không được tính.
- **Trả thêm số chưa quy đổi theo từng mã tiền cho mỗi cột** để danh sách mã tiền
  luôn khớp — đụng kiểu `Unconverted` dùng chung với danh sách và bảng điều khiển;
  đắt hơn phần lợi (chênh lệch chỉ ở cột trên 50 thoả thuận, chỉ trong lúc lưu).
- **Giữ đầu cột là trạng thái riêng, cập nhật khi thả và hoàn tác khi lỗi** — thêm
  một đường hoàn tác có thể lệch với đường dời thẻ.

## Không đụng

Menu giai đoạn trên thẻ (đổi giai đoạn bằng bàn phím) không đi qua lượt dời lạc
quan; hành vi của nó giữ nguyên. Thả vào cột thua vẫn mở hộp lý do trước khi ghi.
