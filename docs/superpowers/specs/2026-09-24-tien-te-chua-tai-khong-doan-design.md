# Đồng tiền chưa tải thì không đoán — design

Ngày: 2026-09-24 · Hồ sơ: `_acceptance/tien-te-chua-tai-khong-doan/` · Hạng: T2 · Xếp chồng lên PR #114 (`o-so-tien-doc-theo-tieng`)

## Vấn đề

Cổng Bằng chứng của `o-so-tien-doc-theo-tieng` tách ra ba mục (Ngoài-1, Ngoài-4, Ngoài-5) cùng một gốc: hai ô số tiền cần biết đồng tiền để đọc số, và khi thiết lập tiền tệ của không gian làm việc (`currency.settings`) chưa về hoặc tải lỗi thì:

- **Tấm tạo thoả thuận** đoán `"USD"` (`currency || workspaceCurrency || "USD"`), đọc số theo luật USD và gửi `currency: "USD"` lên máy chủ. Một không gian làm việc dùng VND có thể có thoả thuận USD mà không ai chọn. Trước PR #114 máy khách gửi `undefined` và máy chủ tự lấy đồng tiền báo cáo (`deals.service.ts`, `create`).
- **Thêm nhanh ở tấm công ty** khoá nút Tạo tới khi thiết lập về; tải lỗi thì khoá mãi, không lời nào.

Kèm theo: bài kiểm «nút Tạo bị khoá khi chưa tải» chỉ đo chiều khoá (Known limit Ngoài-6 của hồ sơ trước).

## Hướng

**Đồng tiền chưa biết là một trạng thái có tên, không phải một giá trị đoán.**

1. `MoneyInput` nhận `currency: string | null`. `null` = chưa biết. Khi đó ô không đọc số (không có `cents`, không `aria-invalid`), và dòng dưới ô nói vì sao — câu do chỗ gọi truyền vào (`missingCurrency`), vì chỉ chỗ gọi biết đang tải hay tải lỗi và người làm gì tiếp được. Chuỗi rỗng thì không có dòng như cũ.
2. **Số tiền rỗng không cần đồng tiền.** Ở cả hai chỗ, thoả thuận không có số tiền được tạo bình thường. Nó mang đồng tiền đã biết (đồng người chọn, không thì đồng của không gian làm việc) như mọi lệnh khác; chỉ khi chưa biết đồng nào thì `currency` không gửi đi, để máy chủ tự lấy đồng tiền báo cáo như trước PR #114.
3. **Có số tiền mà chưa biết đồng tiền thì không gửi.** Đồng tiền dùng để đọc số và đồng tiền gửi đi luôn là MỘT giá trị: đồng người chọn, không thì đồng của không gian làm việc, không thì không gửi gì.

### Tấm tạo thoả thuận

- `knownCurrency = currency (người chọn) || workspaceCurrency || null`. Bỏ hằng `"USD"`.
- Ô chọn đồng tiền khi chưa biết: hiện chữ gợi ý «Tiền tệ»/«Currency», không hiện USD.
- Đang tải, người đã gõ số: dòng dưới ô «Đang tải đồng tiền mặc định…».
- Tải lỗi, người đã gõ số: «Không tải được đồng tiền mặc định — chọn đồng tiền bên cạnh để nhập số tiền.»
- Bấm Tạo khi có số mà chưa biết đồng tiền: không gửi, focus về ô chọn đồng tiền. Nút Tạo không khoá vì chuyện này (giữ AC-6 của hồ sơ trước).
- Chọn đồng tiền → đọc số ngay theo đồng đó → Tạo gửi đúng đồng đó.

### Thêm nhanh

- Đang tải: nút Tạo khoá như cũ (giữ AC-8 của hồ sơ trước — thường chỉ vài trăm mili giây).
- Tải lỗi: nút Tạo mở lại. Dòng dưới ô số tiền (khi có chữ) «Không tải được đồng tiền báo cáo, nên chưa lưu được số tiền. Bỏ trống số tiền để tạo thoả thuận, hoặc thử lại.», và một nút «Thử lại» cạnh ô gọi lại truy vấn thiết lập.
- Tạo khi có số mà tải lỗi: không gửi, focus về ô số tiền. Tạo khi số trống mà tải lỗi: gửi, không kèm `currency`.
- Thử lại thành công: ô đọc số theo đồng tiền báo cáo, Tạo gửi kèm đồng đó.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thiết lập tiền tệ về trước khi người gõ → mọi thứ như PR #114.
- Biên: người gõ số trước khi thiết lập về → dòng «Đang tải…» → thiết lập về → dòng đổi thành «Đọc là …» không cần gõ lại.
- Lỗi & quay lại: thiết lập tải lỗi → tấm tạo: chọn đồng tiền bên cạnh rồi Tạo; thêm nhanh: bấm «Thử lại», hoặc bỏ trống số tiền rồi Tạo.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tấm tạo thoả thuận | tạo một thoả thuận | nút Thêm ở màn Thoả thuận / tấm thoả thuận mới |
| Tấm công ty — thêm nhanh thoả thuận | thêm thoả thuận cho công ty đang xem | mục thoả thuận của công ty / danh sách thoả thuận của công ty |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tao-dang-tai-tien-te | tấm tạo | ô chọn đồng tiền hiện «Tiền tệ»; có chữ số thì dòng «Đang tải đồng tiền mặc định…» | chờ, hoặc tự chọn đồng tiền |
| ST-tao-loi-tien-te | tấm tạo | có chữ số thì dòng «Không tải được đồng tiền mặc định — chọn đồng tiền bên cạnh để nhập số tiền.» | chọn đồng tiền |
| ST-tao-gui-thieu-tien-te | tấm tạo | không gửi, focus về ô chọn đồng tiền | chọn đồng tiền rồi Tạo lại |
| ST-nhanh-dang-tai-tien-te | thêm nhanh | nút Tạo khoá | chờ |
| ST-nhanh-loi-tien-te | thêm nhanh | nút Tạo mở; nút «Thử lại» cạnh ô số tiền; có chữ số thì dòng «Không tải được đồng tiền báo cáo…» | Thử lại, hoặc bỏ trống số tiền |
| ST-nhanh-gui-thieu-tien-te | thêm nhanh | không gửi, focus về ô số tiền | xoá số hoặc Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dòng thiếu đồng tiền dùng màu chữ phụ, không `aria-invalid` — chuỗi người gõ không sai, chỉ chưa đọc được.
- Dòng vẫn `aria-live="polite"`, nên khi thiết lập về và dòng đổi thành «Đọc là …» trình đọc màn hình đọc lên.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `MoneyInput` | mở rộng | thêm trạng thái «chưa biết đồng tiền» ở chính ô dùng chung, không vá ở chỗ gọi |
| `Button` | dùng | nút «Thử lại» là nút phụ (`outline`) như mọi nút thử lại khác |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên, không tra — chỉ thêm trạng thái cho một ô trong hai biểu mẫu một cột đã có.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- DOM (`apps/app/test/tien-te-chua-tai.dom.tsx`): tRPC giả cho `currency.settings` ba chế độ — về ngay, treo, lỗi (có đếm số lần gọi để đo «Thử lại»).
- Ma trận quan hệ «đồng tiền gửi đi = đồng tiền đã đọc số» cho tấm tạo, viết trước: 3 trạng thái thiết lập × 2 lựa chọn của người × 2 trạng thái số tiền.
- Màn thật: script Chrome thay phần `currency.settings` trong lô yêu cầu tRPC bằng một lỗi, đi luồng lỗi của tấm tạo (chọn một đồng khác cả USD lẫn đồng báo cáo) và của thêm nhanh (Thử lại sau khi bỏ chặn), rồi đọc bản ghi máy chủ. Script đọc đồng báo cáo trước màn đầu tiên và thoát mã 2 nếu đó là USD — khi đó không phân biệt được với bản cũ.
