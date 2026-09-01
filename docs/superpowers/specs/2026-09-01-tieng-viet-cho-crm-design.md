# Tiếng Việt cho CRM — vòng ①: xương sống ngôn ngữ

Ngày: 2026-09-01 · Hồ sơ: `_acceptance/tieng-viet-cho-crm/` · Hạng: T2

## Vòng này làm gì cho người dùng

Nhân viên quan hệ đối tác mở CRM, chọn tiếng Việt một lần, và màn hình **công
ty** hiện trọn tiếng Việt — nhãn, ngày, số. Lựa chọn đó ở lại khi họ quay lại.

Đây là vòng ① trong năm vòng đã chốt ở `_acceptance/tieng-viet-cho-crm/opportunity.md`.
Bốn vòng sau lần lượt là: bộ dựng chung · nhãn toàn ứng dụng · câu từ máy chủ ·
chữ do tác nhân sinh ra.

## Vòng này KHÔNG làm gì

- Không dịch câu lỗi từ máy chủ. Bấm nhầm vẫn ra tiếng Anh — đó là vòng ④.
- Không đụng **chuỗi** trong bộ dựng chung `packages/ui/src/components/**`. Khuôn nhận-chuỗi-từ-ngoài là việc vòng ②, và chốt khuôn trước khi thử là thứ thứ tự năm vòng dựng ra để tránh.
- Không dịch màn thoả thuận hợp tác. Bảy giai đoạn của nó đang là phễu bán phần mềm thừa kế từ kho gốc và chưa ai quyết bảy bước thật — đó là quyết định nghiệp vụ, không phải việc của vòng ngôn ngữ.
- Không thêm ngôn ngữ thứ ba. Vòng này hỏi tiếng Việt có đứng được không.
- Không đổi tiền tệ hay múi giờ. Định dạng theo vùng khác với dịch chữ.

## Lối đã chọn, và lối đã bỏ

**Chọn: tự dựng mỏng.** Một cookie, một context, một module định dạng. Không thư
viện đa ngôn ngữ.

**Bỏ: `next-intl`.** Hai lý do. Nó mặc định muốn tiền tố `/vi/` trên mọi đường
dẫn — đổi toàn bộ URL là cái giá không tương xứng với vòng ①. Và giá trị lớn
nhất của nó là kho chuỗi cùng quy tắc số nhiều, tức bài toán của vòng ② và ③;
chốt thư viện ở vòng ① là chốt trước khi biết bộ dựng chung cần khuôn gì.

Rủi ro đã nhận: tới vòng ③ có thể phải lắp `next-intl` lên trên phần này. Bề mặt
của lối đã chọn đúng hai thứ — một cookie và một provider — nên lắp lên được,
không phải đập đi.

**Nếp có sẵn để đi theo:** giao diện sáng/tối của kho dùng `next-themes` — một
lựa chọn của người xem, mọi thành phần đọc, lưu trong trình duyệt, không cột cơ
sở dữ liệu. Ngôn ngữ đi cùng hình dạng đó.

## Cách nó chạy

### Ngôn ngữ tới màn hình

Cookie `lang` giữ lựa chọn. Trang gốc là thành phần máy chủ nên nó đọc cookie
ngay lúc dựng, đặt `<html lang={…}>` đúng từ lượt đầu, rồi truyền ngôn ngữ xuống
một provider phía trình duyệt.

Không nháy: người dùng không thấy tiếng Anh rồi mới thấy tiếng Việt. Không
middleware, không đổi đường dẫn.

**Cái giá đã biết:** trang gốc bọc cả trang đăng nhập. Đọc cookie ở đó làm trang
đăng nhập chuyển từ vẽ tĩnh sang vẽ động. Vùng sau đăng nhập đã động sẵn — nó
đọc phiên — nên chỉ trang đăng nhập chịu thay đổi này. Nhận cái giá đó vì
`<html lang>` chỉ khai được ở trang gốc, và đặt sai thẻ đó là nói dối trình đọc
màn hình về thứ tiếng của trang.

### Đổi tiếng

Nút đổi nằm cạnh nút sáng/tối trong thanh đầu trang. File đó đã nhập sẵn bộ menu
thả xuống dùng chung nên không thêm kiểu dáng nào mới — luật giao diện của kho
cấm dựng biến thể tại chỗ gọi.

Đổi tiếng thì ghi cookie rồi làm mới để phần máy chủ vẽ lại theo tiếng mới.

### Mười chín chỗ định dạng

**Ranh giới của vòng này: định dạng, không phải chuỗi.** Định dạng là một hàm
của (ngôn ngữ, giá trị) — đưa vào một ngày, trả ra một chuỗi. Chuỗi là một kho
bản dịch. Vòng ① sở hữu vế đầu; vòng ② sở hữu vế sau. Hai thứ khác nhau nên
chạm bộ dựng chung ở vế đầu KHÔNG phải chốt khuôn của vế sau.

19 chỗ nằm rải hai kho, không như tôi tưởng lúc đầu:

| Ở đâu | Bao nhiêu | Vòng ① có chạm không |
| --- | --- | --- |
| `apps/app/components/**` | 6 | Có |
| `packages/ui/src/lib/format.ts` | 3 | **Có** — đây đã là module định dạng dùng chung của kho |
| `packages/ui/src/components/ai-elements/context.tsx` | 10 | Không — bảng chi phí tác nhân, không nằm trên màn công ty |

**Kho đã có sẵn module định dạng dùng chung**: `formatCount`, `formatMoney`,
`formatMoneyCompact`, `formatPercent`, `formatDay`. Màn công ty đang dùng nó.
Nên vòng ① **mở rộng module đang có**, không dựng một cái mới trong `apps/app` —
dựng cái thứ hai là để lại hai nguồn sự thật cho cùng một việc.

`formatMoney` nằm trong đó, nên tôi đọc `docs/currency.md` trước. Tài liệu ấy
nói về **cột nào được phép cộng** và **tỉ giá đóng băng lúc nào** — không nói gì
về cách hiển thị. Thêm tham số ngôn ngữ vào một hàm hiển thị không chạm luật nào
trong đó.

Hôm nay chúng là **hằng ở mức module**:

```ts
const dueFormat = new Intl.DateTimeFormat("en-US", { … });
```

Chốt một lần lúc nạp file. Đổi cookie lúc chạy thì chúng không đổi theo. Nên
đây không phải việc tìm-và-thay chuỗi `"en-US"`; nó là chuyển 19 hằng thành hàm
đọc ngôn ngữ **lúc vẽ**.

Một module dùng chung nhận ngôn ngữ và giá trị, trả chuỗi. Bộ định dạng nhớ theo
cặp (ngôn ngữ, tuỳ chọn) để không dựng lại mỗi lần vẽ. Hàm thuần nên kiểm được
bằng bài kiểm đơn vị, không cần trình duyệt.

Đây là phần nặng nhất của vòng ①, và là phần dễ sót nhất: bỏ quên một chỗ thì
chỗ đó im lặng giữ tiếng Anh mà không báo lỗi gì.

### Một màn trọn tiếng Việt

Màn **công ty** (`companies`). Chuỗi nằm trong một object TypeScript theo ngôn
ngữ, nhập thẳng.

Chọn màn này chứ không phải màn thoả thuận vì thoả thuận mang bảy giai đoạn chưa
ai định nghĩa. Đổi lại: mất một phần ca khó của tiền tệ. Nhận đổi để vòng ①
không dừng chờ một quyết định nghiệp vụ.

Nhãn dùng đúng từ điển `CONTEXT.md`: **"Công ty"**, không phải "Công ty môi
giới" — tên khoá vào giai đoạn đầu bắt đổi tên toàn màn hình khi mạng lưới mở
lĩnh vực mới.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở CRM → thanh đầu trang → menu ngôn ngữ → chọn Tiếng Việt → trang vẽ lại, màn công ty hiện tiếng Việt (điểm ra: ở nguyên màn đang đứng)
- Biên: chưa từng chọn bao giờ → lấy theo ngôn ngữ trình duyệt khai; danh sách công ty rỗng → thông báo rỗng cũng phải là tiếng Việt
- Lỗi & quay lại: lựa chọn đã lưu mang giá trị không hợp lệ → rơi về tiếng Anh, không báo lỗi cho người; người đổi lại bằng chính menu đó

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Menu ngôn ngữ (thanh đầu trang) | Đổi thứ tiếng của toàn bộ giao diện | Từ mọi màn / ở nguyên màn đang đứng |
| Danh sách công ty | Xem và lọc các công ty trong mạng lưới | Từ thanh điều hướng / tới chi tiết một công ty |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-menu-ngon-ngu-dong | Menu ngôn ngữ | Nhãn thứ tiếng đang dùng, có tiêu điểm nhìn thấy được khi tới bằng bàn phím | Mở menu bằng chuột hoặc bàn phím |
| ST-menu-ngon-ngu-mo | Menu ngôn ngữ | Hai dòng: Tiếng Việt · English, dòng đang dùng có dấu | Chọn một dòng, hoặc Esc để đóng |
| ST-cong-ty-dang-tai | Danh sách công ty | Khung xương của bảng, không nháy chữ tiếng Anh trước | Chờ |
| ST-cong-ty-rong | Danh sách công ty | "Chưa có công ty nào khớp bộ lọc này" — bằng tiếng đang dùng | Đổi bộ lọc, hoặc thêm công ty |
| ST-cong-ty-co-du-lieu | Danh sách công ty | Nhãn cột tiếng Việt; tên công ty giữ nguyên như đã nhập, không cho trình duyệt tự dịch | Mở một công ty |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Đổi tiếng giữ nguyên màn đang đứng; vòng này KHÔNG hứa giữ vị trí cuộn và bộ lọc (đã xếp Later ở bản quét).
- Ô chứa chữ dài phải cắt hoặc xuống dòng; con của flex phải cho phép co lại. Chuỗi tiếng Việt dài hơn tiếng Anh 20–30%.
- Menu tới được bằng bàn phím, có tiêu điểm nhìn thấy được, đóng bằng Esc.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| Menu thả xuống dùng chung | dùng | Thanh đầu trang đã nhập sẵn cho nút sáng/tối; luật giao diện của kho cấm dựng biến thể tại chỗ gọi |
| Bảng dữ liệu dùng chung | dùng | Màn công ty đã dùng; vòng này chỉ đổi chữ đưa vào, không đổi component |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không tra mẫu. Màn công ty đã tồn tại và đã theo khuôn này (danh sách
`companies` → chi tiết `[companyId]`); vòng này không dựng màn mới, chỉ đổi thứ
tiếng của màn đang có. Chỉ một khuôn khả dĩ nên không có gì để cân.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo bằng gì

Bốn thứ phải đo được, mỗi thứ kèm chiều đỏ:

1. **Không cookie thì tiếng Anh.** Chiều đỏ: đặt cookie tiếng Việt mà trang vẫn khai `lang="en"` là đỏ.
2. **Cookie tiếng Việt thì trang gốc khai `lang="vi"` ngay lượt đầu.** Chiều đỏ: khai đúng nhưng sau một lượt vẽ mới đúng — tức có nháy — cũng là đỏ.
3. **Không còn chỗ định dạng nào khai cứng một vùng, trong phạm vi vòng ①.** Phạm vi đếm là `apps/app/**` và `packages/ui/src/lib/**` — KHÔNG gồm `packages/ui/src/components/**`. Đo bằng đếm, không bằng mắt: số chỗ còn khai cứng trong phạm vi đó phải bằng 0, và phép đo phải đỏ khi cố tình để lại một chỗ.
4. **Màn công ty không còn chuỗi tiếng Anh nào ở phần chữ của giao diện.** "Phần chữ của giao diện" là nhãn, tiêu đề cột, nút, thông báo rỗng — thứ sản phẩm tự viết. KHÔNG gồm dữ liệu người dùng nhập: tên công ty, ghi chú, nội dung thư giữ nguyên như đã nhập. Chiều đỏ: bỏ một nhãn khỏi kho chuỗi thì phép đo phải chỉ đúng tên nhãn đó.

Hàm định dạng là hàm thuần → bài kiểm đơn vị. Đường cookie → thẻ `lang` cần một
lượt vẽ thật → phép đo qua trình duyệt.

## Thứ đã biết là sẽ đau

- **Tiếng Việt dài hơn tiếng Anh chừng 20–30%.** Nút, cột bảng, nhãn có thể vỡ khung. Làn thiết kế của kho đang bật, nên chỗ vỡ sẽ hiện trên bản bấm được trước khi duyệt, không hiện lần đầu trong mã.
- **Sót một chỗ định dạng thì im lặng.** Không có lỗi nào nổ; chỗ đó chỉ giữ tiếng Anh. Vì thế phép đo thứ 3 phải đếm, không được nhìn.
- **Trang đăng nhập mất vẽ tĩnh.** Đã nêu ở trên, đã nhận.

## Ngưỡng nghiệm thu

Ngưỡng sống ở `_acceptance/tieng-viet-cho-crm/opportunity.md` và **vẫn mang tiền
tố `[đề xuất]`** — máy đề xuất, người chưa chốt. Ba nhân viên quan hệ đối tác
chạy trọn một luồng thật mà không gặp tiếng Anh ở bước bắt buộc.

Vòng ① một mình không đạt được ngưỡng đó: nó chỉ có một màn. Ngưỡng là của cả
năm vòng. Cái vòng ① trả lời sớm là câu hỏi nặng hơn — người dùng có thật sự
vướng vì tiếng Anh không, hay vướng vì luồng việc.
