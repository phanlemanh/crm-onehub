# Chữ mặc định của thư viện ngoài — thiết kế

Lớp lỗi này lộ ra ở Cổng 2 của vòng `cua-so-tro-chuyen-noi-tieng-viet`: nhãn
`aria-label="Messages"` trên vùng tin nhắn là **tiếng Anh**, và **không file nguồn
nào của kho chứa nó** — nó là mặc định của `@shadcn/react/message-scroller`. Bốn
vòng Việt hoá với năm bộ quét tĩnh đều mù với nó; chỉ một chân đo màn thật, tình
cờ nhìn đúng chỗ, mới thấy.

## Quét không gian tiêu chí (morphological-scan, preset test-matrix)

### Ngữ cảnh

**Chân sản phẩm** — `packages/ui` là nguồn duy nhất của giao diện, và
`packages/ui/src/lib/messages.ts` là kho chuỗi dùng chung của nó
`[SUY-TỪ-REPO: packages/ui/src/lib/messages.ts]`. **Chân ngành** — thực hành
**pseudo-localization** `[NGÀNH: pseudo-localization]` dựng đúng để lộ chuỗi chưa
dịch trước khi có bản dịch; **W3C Internationalization Best Practices**
`[NGÀNH: W3C i18n]` gọi tên lớp "chuỗi không nằm trong luồng dịch"; và các thư
viện giao diện có tên đều khai mặc định tiếng Anh cho nhãn trợ năng
`[NGÀNH: Radix UI]`.

### Số đo, không phải ước lượng

| | |
|---|---|
| Component trong `packages/ui` | **79** |
| Bọc một thư viện ngoài | **35** |
| Trong 35 đó, đọc kho chuỗi dùng chung | **15** |
| **Bọc thư viện mà không đọc kho chuỗi nào** | **20** |
| Khoá trong kho chuỗi dùng chung | 90 |
| Chuỗi tiếng Anh nhìn thấy được trên 5 màn | 60 |
| Trong đó **không có trong file nguồn nào** | **4** — 2 tên người dùng, 1 nút devtools, **1 thật** (`sonner`) |

### Trục

- **Trục A — chữ đến từ đâu:** file nguồn của kho | mặc định của thư viện ngoài |
  model sinh ra | người nhập.
  [thước CE: giá trị thứ hai là lỗ vừa đo được thật ở Cổng 2 vòng trước; ba giá
  trị kia đã có phép đo ở bốn vòng đã ký] → AC-1, AC-2
- **Trục B — chữ nấp ở đâu trên màn:** nội dung phần tử | thuộc tính trợ năng
  (`aria-label` · `title` · `placeholder` · `alt`) | thông báo sống (`aria-live`) |
  nội dung giả (`::before` / `::after`).
  [thước CE: nhãn vừa bắt được nằm ở `aria-label`; `sonner` cũng ở `aria-label`.
  Hai giá trị cuối chưa từng đo ở kho này — ghi ra để không tưởng là đã phủ] → AC-1
- **Trục C — điều kiện hiện ra:** có ngay khi mở màn | chỉ hiện sau khi bấm
  (hộp thoại · menu · ngăn kéo · popover) | nhất thời (toast).
  [thước CE: 20 component chưa đọc kho phần lớn là loại bấm-mới-hiện, nên đây là
  trục quyết định độ phủ thật của vòng] → AC-3, AC-8

Không gian 4 × 4 × 3 = 48 ô — dưới ngưỡng, nhưng phần lớn ô vô nghĩa (chữ người
nhập không có ở `::before`), nên quét theo lát cắt của trục A.

### Core

1. **A=thư viện × B=mọi nơi × C=có ngay** — phép đo trung tâm, dân số sinh từ màn.
2. **A=thư viện × C=bấm-mới-hiện** — 20 component chưa đọc kho, đối chiếu ở mức mã.
3. **Vá thật cái đã tìm ra** — nhãn vùng thông báo của `sonner`.
4. **Cross-cutting** — bộ đột biến, khai sinh, không chép thước, bộ canh kho chuỗi.

### Later

Nội dung giả `::before`/`::after` · thông báo sống `aria-live` · lái từng component
bấm-mới-hiện ra màn để đo trực tiếp (cần một chân lái riêng, đắt).

### Never

- **Dịch chữ của thư viện tại chỗ trong `node_modules`** — bản vá sẽ bay mất ở lần
  cài kế tiếp. Đường đúng là ghi đè từ chỗ gọi.
- **Liệt kê tên thư viện rồi quét theo danh sách** — danh sách sẽ trôi, và đúng cái
  thư viện quên khai là cái sót. Phép đo phải tự định nghĩa: *chuỗi trên màn mà
  không file nguồn nào chứa*.

## Hai phép đo

### 1 · Trên màn: chuỗi không thuộc về ai

Dựng nhiều màn thật, gom mọi chuỗi **nhìn thấy được** cộng bốn thuộc tính trợ
năng, rồi hỏi từng chuỗi: `grep` trong `apps/` và `packages/` có ra file nào
không? Không ra → nó không phải chữ của kho. Mỗi chuỗi như vậy phải **hoặc** được
ghi đè từ kho chuỗi dùng chung, **hoặc** khai có tên kèm lý do.

Bốn lý do hợp lệ, khai thành bảng đóng: chỉ có ở bản dev · dữ liệu người dùng ·
định danh kỹ thuật · nội dung do model sinh. Dòng khai chết là ĐỎ.

### 2 · Ở mức mã: component bọc thư viện

Đếm ba con số từ đĩa: component trong `packages/ui`, component bọc thư viện
ngoài, component đọc kho chuỗi dùng chung. Mỗi component bọc-mà-không-đọc phải
khai một dòng: *"nguyên bản này không sinh chữ nào cho người đọc"* kèm tên nguyên
bản. **Chiều đỏ:** dòng khai trỏ một component không còn bọc thư viện nào là ĐỎ.

## Giới hạn phải khai từ hợp đồng

Phép đo 1 chỉ thấy thứ **đang hiện** trên màn được mở. Component chỉ hiện sau khi
bấm nằm ngoài tầm nó, và phép đo 2 chỉ đối chiếu ở mức mã — nó biết component ấy
chưa đọc kho, nhưng không biết nguyên bản có sinh chữ hay không. Hai phép đo cộng
lại **không** thay được một chân lái từng component ra màn; điều đó phải nói trong
hợp đồng chứ không để tới cổng ký.

## Ngoài phạm vi

- **Dịch nốt 90 khoá kho chuỗi dùng chung** — chúng đã có bản `vi`.
- **Hai lỗ đã có định đoạt mở-hợp-đồng-mới ở vòng trước**: gốc gom chữ của bộ
  thước màn, và trạng thái tác nhân vẽ ra tiếng Anh.
- **Nâng cấp thư viện để lấy bản có i18n** — đổi phụ thuộc, không phải việc của
  vòng đổi chữ.
