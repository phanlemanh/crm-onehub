# Chín khiếm khuyết của vòng 8 — giờ ra sao

Đối chiếu từng cái với trạng thái sau khi vòng `thuoc-cua-lat-3a-co-rang` chạy.
Mỗi dòng "chiều đỏ" dưới đây là một lượt chạy THẬT đã lật, không phải lời khai.

## Tám cái cùng bệnh: xanh được mà không đỏ được

### 1. `khai-tieng.mjs` — bảy giá trị giai đoạn là hằng gõ tay (cao)

Trước: `GIAI_DOAN` là bảy chuỗi viết trong chính file đo; `MA_GIAI_DOAN` rút từ
máy chủ nhưng chỉ dùng để in một dòng đếm.

Sau: dân số là mã enum máy chủ trả về trong chính lượt chạy; nhãn hiển thị lấy
từ `dealStageLabel()` **của sản phẩm**, gọi qua một trình chạy thật. Hai vế của
khẳng định nay khác nguồn — đó là điều làm quan hệ có thể sai được.

Độ phủ nói thẳng: enum có 7 mã, dữ liệu thử phủ 6, `CLOSED_WON` khai là chưa phủ.

Chiều đỏ: lọc màn thoả thuận về rỗng → 6 dòng `GIAI DOAN KHONG THAY TREN MAN`,
mã 1.

### 2. `khai-tieng.mjs` — giá trị không hiện thì bỏ qua (cao)

Trước: `if (cho.length === 0) continue` — không quan sát được gì vẫn là đạt.

Sau: không hiện là một lỗi có tên; tập quan sát rỗng là **mã 2**, không phải 0.

### 3. `may-chu-ve.sh` — đo chuỗi có mặt, hứa một quan hệ (cao)

Trước: mảng `ANH[]` khai rồi không dùng dòng nào.

Sau: kiểm cả hai vế, và gom mọi lỗi của một màn thay vì dừng ở lỗi đầu.

Vùng đo trừ `<script>` (chữ máy — dữ liệu flight mang tên component
`CompaniesTable`) và `<nav aria-label="Primary">` (thanh điều hướng, thuộc vòng
①). Chân **nói ra vùng nó trừ ở mỗi lượt chạy**.

Chiều đỏ: `lang=en` → ghim `CON TIENG ANH /companies: Companies`, mã 1.
Phép thử phân biệt: gỡ riêng vế tiếng-Anh-vắng-mặt → cùng lượt `lang=en` cho
**0** dòng đó.

### 4. `no-vong-1.mjs` — vắng ở cả hai thứ tiếng là đã dịch (vừa)

Trước: 4 trong 10 chuỗi ở đúng trạng thái đó, tức 4 dòng đo không gì.

Sau: mỗi mục mang bản dịch tiếng Việt đã ghim, lấy từ kho chuỗi. Vắng ở cả hai
bản là **mã 2**.

Chiều đỏ: ghim sai bản dịch → mã 1 kèm `THIEU BAN DICH`; chuỗi vắng hai bên →
mã 2 kèm `vang o CA HAI thu tieng`.

### 5. `ban-ve.mjs` — thẻ `<time>` tự dựng (vừa)

Trước: `createElement("time")`, tự đặt thuộc tính đúng khuôn bên đọc, rồi đọc lại
chính nó.

Sau: đọc thẻ `<time>` trang vẽ ra, in số thẻ tìm thấy và mốc thời gian của thẻ đã
đọc.

Cặp hai chiều nằm trong chính chân: nó vốn bắt đầu ở tiếng Anh rồi đổi sang tiếng
Việt, nên đọc **cùng một thẻ** ở hai phía cú đổi — trước `"2d ago"`, sau
`"2 ngày trước"`, cùng `data-local-date-value`. Trang không vẽ thẻ nào → mã 2.

### 6. `ban-ve.mjs` — mẫu số bề mặt là chính bản khai (vừa)

Trước: `khai = BE_MAT[man].length`; gỡ một dòng khỏi bản khai thì mẫu số giảm
theo và lệch vẫn bằng 0.

Sau: đếm menu trang **thật sự mời ra**, so hai chiều với bản khai. Đếm theo LOẠI
(menu trên dòng gộp làm một, số thể hiện in kèm), và so menu với menu chứ không
so menu với toàn bộ bản khai.

Chiều đỏ: bề mặt khai mà không mở được → `BAN KHAI CO DONG CHET`; bản khai cắt
xuống dưới số trang mời → `BE MAT KHONG KHAI`.

### 7. `du-lieu-bien.mjs` — đếm hàng, hứa chữ trên màn (vừa)

Trước: chỉ gọi tRPC đếm hàng, không mở trình duyệt lần nào; chiều đỏ đã khai
không thể tới được.

Sau: mở màn lọc về đúng hàng của từng trạng thái và đọc chữ. Đếm hàng ở lại
nhưng là **tiền đề, mã 2**.

Mỗi trạng thái có dấu hiệu DƯƠNG, không chỉ cấm tiếng Anh: ký hiệu ô-trống dùng
chung (cột Phụ trách trống không có nhãn nào, nên khẳng định một chữ tiếng Việt ở
đó là sai), mẫu thời gian tương đối có hình dạng (không phải từ `trước` trần, vốn
khớp bừa), và tên pháp nhân 48 ký tự hiện nguyên vẹn.

Chiều đỏ: `lang=en` → ghim `"2d ago"`, mã 1. Gỡ mốc hoạt động → mã 2.

### 8. `messages-guard.spec.ts` — `song()` khớp lá và cha riêng rẽ (vừa, sắc nhất)

Trước: khớp trên khối mã toàn app nối chuỗi, nên một từ phổ thông ở đâu đó giữ
khoá "sống".

Sau: đọc cây cú pháp, thu chuỗi truy cập có gốc là **biến kho chuỗi**, lần theo
alias **theo phạm vi**, và ghi nhận cổng truy cập động. Khoá sống chỉ khi cha và
lá liền kề trong một chuỗi như thế.

Năm chiều đỏ đã lật, mỗi cái khôi phục bằng bản sao: bỏ khoá chết khỏi bản khai ·
khai một khoá còn sống · khai khoá không tồn tại · nới về khớp lá-và-cha · gỡ
phân giải theo phạm vi.

Cái cuối không lật ở lần đầu: bảng alias phẳng vẫn trả lời đúng khi thứ tự văn
bản thuận. Vật thử phải mang đúng ca gây sai — biến cùng tên khai trong callback
lồng, biến ngoài dùng sau đó.

**Siết chặt làm lộ 26 khoá mất chỗ gọi**, xem `khoa-chet-lo-ra.txt`.

## Cái thứ chín: khác bệnh

### 9. `dot-bien.mjs` — bán kính nổ (vừa)

Nó **đỏ được** và đã đỏ thật. Bệnh là nó ghi đè năm file mã sản phẩm trong cây
làm việc suốt ~10 phút mỗi lượt, rồi khôi phục ảnh chụp đầu lượt — nuốt mọi sửa
đổi song song.

Sau: dựng cây sao bằng `git worktree`, nối `node_modules` và `.env` vào, dựng máy
chủ riêng ở đó, đột biến chỉ trong bản sao. Mọi đường thoát gỡ cây sao và tắt máy
chủ.

Chiều đỏ (chân `khoanh-vung`, không cần máy chủ): giả lập người sửa một file mã
sản phẩm giữa lượt chạy. Bản mới → md5 không đổi. Khôi phục kiểu cũ →
`DOI THAY BI NUOT` kèm cả hai md5.

Chiều đỏ đó **không lật ở lần đầu**, và lỗi nằm ở mô phỏng: tôi chụp ảnh sau khi
giả lập người sửa, nên khôi phục giữ được bản sửa một cách tình cờ. Lượt thật
chụp lúc khởi động, trước khi có bản sửa nào.

## Hai lỗ tìm thêm, không nằm trong chín cái

- **Ba bản khai miễn trừ không có bánh cóc** — quét tìm ra, thành AC-9. Sáu dòng
  chết thật, kể cả `viet-tat.ts` trong chính chân vừa sửa ở `dc70600`.
- **`be-rong.sh` đọc mã thoát của `grep`**, không phải của chân đo. Nó chỉ đỏ
  được khi grep không tìm thấy dòng nào — chưa từng một lần đọc kết quả của
  chính mình.

## Hai lỗi sản phẩm mà giàn đo cũ mù

Cả hai KHÔNG sửa trong vòng này (ràng buộc: không đổi chuỗi sản phẩm).

1. **Bảng Trường hiện tiếng Anh.** `STANDARD_FIELDS` là mảng chuỗi viết cứng
   ("Name", "Domain", "First name", "Close date"…) trong khi 18 khoá
   `crm.standard.*` đã dịch nằm chết bên cạnh.
2. **Ba nhãn điều hướng chính còn tiếng Anh** cho trình đọc màn hình —
   `app-icon-rail.tsx:52`. Thuộc vòng ①, đang chờ chữ ký.
