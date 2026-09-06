# Việt hoá Cài đặt còn lại — lát ③b, đợt hai, một vòng

## Vì sao một vòng, không cắt đôi

Đợt một cắt 10 file để dựng thước trước khi dịch. Thước dựng xong rồi — bốn bộ
quét lõi không có một dòng nào ghi cứng lát cũ, chúng đọc hết từ bản khai. Chi
phí thật của một vòng nay là **chi phí cố định của vòng lặp** (phản biện, ba
vòng chấm, thẻ, ký), tính theo vòng chứ không theo file. Nên đòn bẩy là ít vòng
hơn, mỗi vòng lớn hơn. Đợt này lấy trọn 33 file còn lại của cụm Cài đặt.

Quyết định này đi ngược đề xuất đầu của phiên (vòng giàn đo riêng trước). Đề
xuất đó bị chính tôi review và rút: ROI thổi lên 3–4 lần vì giàn đã tái dùng
được, và "một bất biến duy nhất" bỏ mất chân đọc mã — chân duy nhất thấy trạng
thái không dựng ra màn.

## Phạm vi

Ba mươi ba file, năm cụm, dưới `apps/app/app/(app)/[slug]/settings/`:

| Cụm | File | Chuỗi JSX |
|---|---:|---:|
| tracking | 8 | 62 |
| connections (gốc + slack + google + microsoft + intake) | 16 | 118 |
| api-keys | 4 | 24 |
| sso | 3 | 30 |
| members | 2 | 8 |

242 chuỗi JSX theo bộ quét ③a, cộng chừng 20 toast mang chữ (28 lượt khác chỉ
chuyển tiếp `error.message` — ngoài phạm vi, cùng lý do đợt một: câu chữ sinh ở
`apps/api`, là `t3_paths`), cộng 7 tiêu đề tab. Chân sinh-rồi-trừ của đợt một
tìm thêm 9 chuỗi trên 75; đợt này dân số gấp ba nên phải chờ nó chốt con số
thật, không tin số đếm sơ bộ.

21 file client, 12 file server. 7 file server mang `export const metadata` tĩnh
— phải sang `generateMetadata` như đợt một.

## Quét không gian tiêu chí

Ba trục giữ nguyên khuôn đợt một `[SUY-TỪ-REPO: _acceptance/man-cai-dat-noi-tieng-viet/contract.md]`.
Chân ngành là thước CE của bốn vòng đã ký cộng chính đợt một, và **mười hai phép
phá độc lập** vòng chấm ba của nó đã dựng — mỗi phép phá là một giá trị trục đã
được chứng bằng thí nghiệm.

- **Trục A — chữ sống ở đâu trong mã:** con JSX | thuộc tính JSX | toast | ô
  `title` | **chuỗi mẫu ghép câu** | thông điệp kiểm tra dữ liệu
  [thước CE: `moi-chuoi.mjs` của đợt một, đã chứng bắt cả sáu hình dạng]
  Giá trị mới so với đợt một: chuỗi mẫu ghép câu — đợt này có câu mang **hoà hợp
  số nhiều tiếng Anh** nướng vào template: `${connected.join(", ")} ${n === 1 ?
  "is" : "are"} already connected.` Tiếng Việt không chia số nên bản dịch đơn
  giản hơn, nhưng đây đúng lớp trật-tự-từ đã vỡ ở vòng ③a.
  Thông điệp kiểm tra dữ liệu: quét ra **0** — ô này lại rỗng, ghi Later như đợt một.

- **Trục B — màn đang ở trạng thái nào:** thường | không đủ quyền | đang gửi |
  rỗng | lỗi | **vòng đời OAuth: chưa cắm → đang cắm → đã cắm → cắm lại → đang gỡ**
  [thước CE: 9 file mang `canManage`; 16 file mang `isPending`; 6 câu rỗng có thật;
  `Connected` ×6 · `Not connected` ×2 · `Reconnect` · `Disconnecting…` · `Connect Slack`]
  Giá trị mới: vòng đời OAuth. Đợt một không có. Trạng thái nào dựng được trên
  máy chủ thật phụ thuộc vào kết nối nào đang cắm ở workspace `onehub` — khai ở S3
  sau khi đo, không hứa trước.

- **Trục C — hạng của chữ:** nhãn dịch được | tên thương hiệu | dữ liệu người nhập
  | định danh kỹ thuật | **đoạn mã người chép**
  [thước CE: `Slack` ×39, `Microsoft 365`, `Google Workspace`, `Outlook`, `Gmail`,
  `OAuth`; 6 file có vật chép — `tracking-script.tsx`, `created-api-key-dialog.tsx`,
  `add-sso-provider-sheet.tsx`, `sso-table.tsx`, `slack-channels.tsx`, `google-connection.tsx`;
  3 URL mẫu]
  Giá trị mới, và nặng nhất đợt này: **đoạn mã người chép**. Thẻ `<script>` theo
  dõi, khoá API vừa tạo, URL cấu hình SSO — người dùng chép chúng dán sang hệ
  thống khác. Dịch lệch **một ký tự** là vỡ site của họ. Lớp này phải có tiêu chí
  riêng: byte-giống-hệt giữa hai lượt tiếng và nằm trong `translate="no"`.

Ba trục, 6 × 6 × 5 = 180 ô, quét theo cặp.

### Core

1. A=JSX × B=thường × C=nhãn — 242 chuỗi, thân của lát.
2. A=toast · A=title · A=chuỗi-mẫu — lớp thước ③a mù, đợt một đã dựng chân.
3. **B=vòng đời OAuth** — trạng thái nào dựng được thì đo trên màn, còn lại đo mức mã và khai.
4. B=không đủ quyền — 9 file, đo mức mã như đợt một.
5. B=rỗng — 6 câu; đợt này nhiều câu **là trạng thái mặc định** của workspace chưa cắm gì (chưa có SSO, chưa có lượt xem, chưa có kênh Slack), nên dựng được thật, khác đợt một.
6. **C=đoạn mã người chép** — byte-giống-hệt hai lượt, `translate="no"`.
7. C=tên thương hiệu ∧ C=dữ liệu người nhập — bảng hai chiều như đợt một.

### Later

- Thông điệp kiểm tra dữ liệu: đợt hai vẫn quét ra 0.
- 28 lượt toast chuyển tiếp `error.message` — chờ vòng Việt hoá `apps/api`.

### Never

- Dịch tên thương hiệu, mã tiền tệ, đoạn mã người chép.
- Tên ứng dụng Slack "Comp AI" ở nơi nó **là** định danh ứng dụng đã đăng ký với
  Slack — quyết định đổi tên Slack app đã hoãn từ đầu phiên. Nhưng câu *"Comp AI
  reads the list from Slack after it connects"* là văn mô tả CRM, không phải tên
  đăng ký — nó là **mục cần người chốt ở Cổng Phạm vi**, không tự quyết.

### Cross-cutting

- Chữ dài ra: 360px, đối chứng lượt `en`, như đợt một.
- Mọi giá trị tiếng Việt mang dấu, trừ miễn trừ có tên trong bộ canh kho.
- **Một bộ thước, không hai bản chép.** Bốn bộ quét lõi của đợt một được **tham
  số hoá theo đường dẫn bản khai**, và thư mục `rang/` của đợt này chỉ chứa bản
  khai, vết đột biến, và các mũi gọi mỏng — không chép một dòng logic quét nào.
  Hai bản chép trôi nhau chính là lớp lỗi bảy lần của đợt một, ở một hình dạng khác.

## Cách làm

### Kho chuỗi

Nối vào **cùng** `apps/app/lib/messages/settings.ts` của đợt một, thêm nhóm theo
cụm: `theoDoi`, `ketNoi` (gốc + slack + google + microsoft + intake), `khoaApi`,
`sso`, `thanhVien`. Bộ canh kho chuỗi đã nhận `settings` — không cần đăng ký lại.

### Thước — tái dùng, không chép

Đợt một để lại bốn bộ quét đọc `./lat.mjs` tương đối. Đợt này đổi **một chỗ**:
mỗi bộ quét nhận `--lat <đường tới bản khai>` (mặc định vẫn là bản khai cạnh nó,
để đợt một không đổi hành vi). `rang/` của đợt này gồm:

- `lat-cai-dat-2.json` — **mười** thư mục (gốc năm cụm + bốn thư mục con của connections + `slack/people`), quét không đệ quy từng thư mục như đợt một; kèm bốn con số neo từ kiểm kê S0 để dân số sinh ra có thứ độc lập để so
- bản khai đóng: toast (file, khoá), tiêu đề (7), không-đủ-quyền, không-dịch,
  **đoạn-mã-người-chép**
- vết đột biến riêng cho lát này
- `man-that.mjs`: danh sách route **đọc từ thư mục** `settings/`, không gõ tay —
  đợt một gõ tay hai route, đợt này mười, gõ tay là sót
- các mũi gọi một dòng trỏ về bộ quét đợt một kèm `--lat`

### Cần gạt `khong_quet` — đóng trong vòng này

Đợt một để lại nợ: khai một dòng loại trừ có tên thì cả năm chân xanh, không
chân nào hỏi lý do. Đợt này thêm một luật: một file bị loại trừ **phải không
mang chuỗi tiếng Anh** — chân `dan-so` chạy `moi-chuoi` lên riêng các file loại
trừ, và một file loại trừ mà còn tiếng Anh là ĐỎ kèm tên file. Loại trừ chỉ hợp
lệ cho file thật sự không phải bề mặt của lát, không phải cho file "khó dịch".

### Trạng thái không dựng ra màn

Cùng luật đợt một: trạng thái nào máy chủ thật dựng được thì đo trên màn; không
dựng được thì đo mức mã, **khai ngay tại cổng**, không để tới vòng chấm mới lộ.
Đợt này có thêm vòng đời OAuth, và workspace `onehub` đang cắm gì thì chỉ S3
biết — nên tiêu chí về OAuth viết ở dạng "trạng thái mặc định đo trên màn, các
trạng thái khác đo mức mã và liệt kê tên".

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên Cài đặt → một trong năm mục → sửa/cắm/tạo → toast xác nhận (ở lại màn)
- Biên: chưa cắm kết nối nào · chưa có SSO · chưa có lượt xem · chưa có khoá API · người không đủ quyền
- Lỗi & quay lại: cắm OAuth hỏng → toast lỗi (câu của API, tiếng Anh, ngoài phạm vi) → nút Cắm lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Theo dõi | Cắm script theo dõi lên website và xem nó có chạy không | thanh bên / ở lại |
| Kết nối | Cắm và gỡ Google, Microsoft, Slack, hộp nhận | thanh bên / màn con |
| Khoá API | Tạo và thu hồi khoá cho hệ thống ngoài | thanh bên / ở lại |
| SSO | Khai nhà cung cấp danh tính | thanh bên / ở lại |
| Thành viên | Xem ai trong workspace và đổi vai | thanh bên / ở lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ketnoi-chua-cam | Kết nối | Mỗi nguồn một thẻ "Chưa cắm" + nút Cắm | Bấm Cắm |
| ST-ketnoi-da-cam | Kết nối | Thẻ "Đã cắm" + nút Gỡ | Không làm gì / Gỡ |
| ST-ketnoi-cam-lai | Kết nối | Thẻ "Cắm lại" khi token hỏng | Bấm Cắm lại |
| ST-ketnoi-dang-go | Kết nối | Nút "Đang gỡ…", vô hiệu | Chờ |
| ST-ketnoi-khong-du-quyen | Kết nối | "Chỉ chủ sở hữu hoặc quản trị mới gỡ được." | Không làm gì được |
| ST-slack-chua-kenh | Slack | "Chưa có kênh nào…" | Cắm Slack |
| ST-theodoi-chua-luot | Theo dõi | "Chưa có lượt xem nào" | Cắm script |
| ST-theodoi-script | Theo dõi | Thẻ `<script>` trong ô chép, `translate="no"` | Chép |
| ST-khoaapi-vua-tao | Khoá API | Khoá hiện MỘT LẦN trong ô chép, `translate="no"` | Chép ngay |
| ST-sso-chua-co | SSO | "Chưa có nhà cung cấp danh tính — mọi người vào bằng Google." | Thêm |
| ST-thanhvien-thuong | Thành viên | Bảng người + vai | Đổi vai |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Đoạn mã người chép: `translate="no"`, byte-giống-hệt hai lượt tiếng.
- Chữ dài ra: `truncate`/`break-words`, con của flex `min-w-0`, 360px.
- Tên thương hiệu, tên miền người nhập, tên nhà cung cấp SSO: `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| toàn bộ | dùng | chỉ đổi chữ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh. Căn cứ: có sẵn trên màn, vòng không đổi cấu trúc.

## Ngoài phạm vi

- 28 lượt toast chuyển tiếp `error.message` từ API — `t3_paths`.
- Đổi tên ứng dụng Slack đã đăng ký — quyết định hoãn từ đầu phiên.
- agent-builder (236 chuỗi) — vòng kế, cùng khuôn.
- Đổi bố cục, component, luồng.
