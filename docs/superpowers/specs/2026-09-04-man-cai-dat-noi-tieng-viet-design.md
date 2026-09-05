# Việt hoá cụm màn Cài đặt — lát ③b, đợt đầu

## Vì sao làm

Đội OneHub sắp dùng CRM này hằng ngày. Ba vòng trước đã Việt hoá màn danh sách,
hồ sơ và cửa vào. Cài đặt là cụm còn lại mà một người quản trị phải mở trong
tuần đầu: đặt tên công ty, chọn model cho tác nhân, đặt hạn lưu trữ, cắm khoá
nghiên cứu, và — từ tuần này — xem mọi con số quy về đồng Việt Nam.

Màn Currencies vừa đổi sang VND. Người mở nó ra đọc "Reporting currency",
"No rates yet", "Rate saved." bằng tiếng Anh trong khi số tiền đã là tiếng Việt.

## Phạm vi

Mười file, hai cụm:

- `apps/app/app/(app)/[slug]/settings/` — 8 file (General)
- `apps/app/app/(app)/[slug]/settings/currencies/` — 2 file

74 chuỗi người đọc thấy: 54 trong JSX, 11 trong `toast.*()`, 9 tiêu đề tab và
nhãn thanh bên.

Ba mươi ba file còn lại (tracking, connections, api-keys, members, sso — 135
chuỗi trong JSX) đi vòng sau, chạy bằng thước vòng này dựng.

## Quét không gian tiêu chí

### Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub — nền tảng thị trường nhiều bên, giai đoạn đầu
  tập trung môi giới `[SUY-TỪ-REPO: CONTEXT.md]`. Người dùng là nhân viên
  OneHub, không bán ra ngoài.
- Chân ngành: không tra ngoài. Kho này đã có **ba vòng Việt hoá đã ký** trên
  cùng bài toán, và bộ đo của chúng là thước CE thật — mỗi phép đo trong đó là
  một chỗ rò của vòng trước đã bị bắt và đóng lại
  `[SUY-TỪ-REPO: _acceptance/config.yaml executors.script.rang3_*, rang_ngon_ngu_*, cua_vao_*]`.
  Chuẩn ngoài duy nhất dùng tới là Web Interface Guidelines của Vercel, cho
  phần chữ dài ra và `translate="no"`.

### Trục

- **Trục A — chữ sống ở đâu trong mã.** Quyết định thước nào nhìn thấy nó.
  `con trong JSX | thuộc tính JSX | toast | mảng metadata/thanh bên | thông điệp kiểm tra dữ liệu`
  [thước CE: bộ quét `chu-cung-jsx.mjs` + lần kiểm kê 74 chuỗi ngày 04/09]

- **Trục B — màn đang ở trạng thái nào.** Quyết định chuỗi có được vẽ ra không.
  `thường | không đủ quyền | đang gửi | rỗng/chưa cấu hình | lỗi`
  [thước CE: `cua_vao_trang_thai_tam`, `cua_vao_dang_gui`, `cua_vao_loi_mang` của
  vòng cửa vào; và `canManage` đọc được tại `currency-settings.tsx:126`,
  `workspace-form.tsx:155`]

- **Trục C — hạng của chữ.** Quyết định có được dịch hay không.
  `nhãn dịch được | tên thương hiệu | dữ liệu người nhập | định danh kỹ thuật`
  [thước CE: `rang_du_lieu_khong_dich`, `cua_vao_khong_dich`; luật
  `translate="no"` của CLAUDE.md và Web Interface Guidelines]

Ba trục, 5 × 5 × 4 = 100 ô. Quá 50 nên quét theo cặp, không dựng tích đầy đủ.

### Core

1. **A=con trong JSX × B=thường × C=nhãn** — thân của lát: 54 chuỗi. Đây là ô
   duy nhất thước cũ đã che.
2. **A=toast × B=thường/lỗi × C=nhãn** — 11 chuỗi. Thước cũ mù hoàn toàn.
3. **A=metadata/thanh bên × C=nhãn** — 9 chuỗi. Thước cũ mù hoàn toàn.
4. **B=không đủ quyền** — hai câu chỉ hiện với người không phải chủ hoặc quản
   trị. Phiên phát triển đăng nhập bằng chủ sở hữu nên **không màn hình nào vẽ
   ra chúng**; đo bằng trình duyệt sẽ xanh trong khi chữ còn tiếng Anh.
5. **B=rỗng/chưa cấu hình** — "No rates yet…", "No deals have an amount yet.",
   "No model matches that." Chỉ hiện trên workspace chưa có dữ liệu.
6. **C=tên thương hiệu ∧ C=dữ liệu người nhập** — phải mang `translate="no"`,
   và phải KHÔNG bị dịch.

### Later

- Trục A giá trị "thông điệp kiểm tra dữ liệu": lát này không có schema zod nào
  mang chữ người đọc thấy — kiểm lại ở vòng ③b đợt sau.
- 33 file còn lại của cụm Cài đặt.

### Never

- 39 lời gọi toast chuyển tiếp `error.message` từ API — câu chữ sinh ở
  `apps/api/src/{sso,api-keys,workspace,tracking,users}`, là `t3_paths`. Kéo vào
  là đổi hạng vòng và thêm một cổng. Khai thành giới hạn đã biết.
- Dịch tên thương hiệu (Google Workspace, Microsoft 365, Slack) và mã tiền tệ.

### Cross-cutting áp mọi ô Core

- Chữ tiếng Việt dài hơn tiếng Anh chừng một phần tư. Vùng chứa phải chịu được:
  `truncate`/`line-clamp`/`break-words`, và con của flex cần `min-w-0`.
- Cột số giữ `tabular-nums` — màn Currencies là cột số.
- Bề rộng hẹp nhất kho hỗ trợ: 360px. Phép đo bề rộng ghim đúng con số đó, và
  chạy lượt tiếng Anh làm đối chứng dương.
- Mọi giá trị tiếng Việt phải mang dấu. Một chuỗi "tiếng Việt" không dấu là
  chuỗi chưa dịch được chép nhầm.

## Cách làm

### Kho chuỗi

Một file mới `apps/app/lib/messages/settings.ts`, đúng khuôn năm anh em đã có:

```
const en = { … }
export type SettingsMessages = typeof en
const vi = { … } satisfies SettingsMessages
const BANG = { en, vi } satisfies Record<Locale, SettingsMessages>
export function settingsMessages(locale: Locale): SettingsMessages
```

Sáu file client đọc qua `settingsMessages(useLocale())`; bốn file server qua
`getLocale()` của `@/lib/locale/server`.

### Thước

Bộ quét `chu-cung-jsx.mjs` của vòng ③a chỉ đi qua cây JSX. Hai mươi trong bảy
mươi tư chuỗi của lát này nằm ngoài cây đó, nên thước cũ sẽ báo xanh trên một
màn còn tiếng Anh.

Vòng này dựng thêm **một chân đo cho chữ nằm ngoài JSX** —
`_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs` — đọc cùng cây
cú pháp TypeScript, bắt hai hình dạng: đối số chuỗi của `toast.*()`, và giá trị
`title:` trong `export const metadata` cùng trong mảng khai thanh bên.

Ba ràng buộc, mỗi cái đóng một chỗ rò đã có thật:

1. **Dân số sinh từ đĩa**, không gõ tay danh sách file. Vòng trước có một phép
   đo báo xanh suốt vì nó quét đúng cái file danh sách chứ không quét mã.
2. **Cặp hai chiều trên cùng một vật.** Bản lành → xanh. Cắm lại một câu tiếng
   Anh vào bản sao → đỏ, thông điệp ghim tên file và nguyên văn chuỗi. Một
   thước chưa từng đỏ không phân biệt được "sạch" với "chưa chạy".
3. **Đối chiếu số file đã đọc** giữa chân mới và chân ③a. Một bên chết lặng thì
   con số lệch, và phép đo từ chối cho điểm thay vì cho xanh.

Hai trạng thái Core màn hình không tự mở ra đi hai đường khác nhau, và sự khác
nhau đó phải nói thẳng:

- **Rỗng** — mở được thật. Tạo một workspace mới qua đúng luồng người dùng thì
  nó chưa có tỷ giá và chưa có deal nào, nên cả hai câu rỗng đều dựng ra được
  trên máy chủ thật. Bước gieo đó khai trong hợp đồng, không để tới S4 mới phát
  hiện là chưa có.
- **Không đủ quyền** — KHÔNG mở được. Kho chưa có hạ tầng dựng component trong
  test, và phiên phát triển đăng nhập bằng chủ sở hữu. Phép đo cho hai câu này
  là mức mã: chúng đọc từ kho chuỗi, và bản tiếng Việt có dấu. Chứng được chuỗi
  nằm đúng chỗ, KHÔNG chứng được màn hiện đúng. Giới hạn này khai ngay ở cổng,
  chứ không phát hiện ở vòng chấm — vòng cửa vào đã trả giá đúng chỗ này.

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên Cài đặt → chọn mục (General / Currencies) → sửa một ô →
  Lưu → toast xác nhận (điểm ra: ở lại màn đó)
- Biên: chưa có tỷ giá nào · chưa deal nào có số tiền · người không phải chủ
  hoặc quản trị mở màn
- Lỗi & quay lại: lưu hỏng → toast lỗi mang câu của API → ô giữ nguyên giá trị
  vừa gõ, người sửa rồi lưu lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| General | Khai công ty này là ai và tác nhân chạy bằng gì | thanh bên / ở lại |
| Currencies | Chọn đồng tiền báo cáo và trông tỷ giá | thanh bên / ở lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-chung-thuong | General | Biểu mẫu điền sẵn giá trị đang lưu | Sửa rồi Lưu |
| ST-chung-dang-gui | General | Nút chuyển sang "Đang lưu…", vô hiệu | Chờ |
| ST-chung-khong-du-quyen | General | Ô khoá + câu "Chỉ chủ sở hữu hoặc quản trị mới đổi được." | Không làm gì được |
| ST-tien-te-thuong | Currencies | Bảng tỷ giá, cột số căn phải | Sửa một dòng |
| ST-tien-te-rong | Currencies | "Chưa có tỷ giá nào. Làm mới để lấy về, hoặc tự nhập." | Bấm Làm mới |
| ST-tien-te-khong-deal | Currencies | "Chưa deal nào có số tiền." | Không làm gì |
| ST-tien-te-khong-du-quyen | Currencies | Câu "Chỉ chủ sở hữu hoặc quản trị mới đổi được cách quy đổi tiền." | Không làm gì được |
| ST-model-khong-khop | General | "Không model nào khớp." trong ô tìm | Gõ lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chữ tiếng Việt dài hơn: mọi vùng chứa nhãn phải `truncate` hoặc `break-words`;
  con của flex mang `min-w-0`.
- Cột số của bảng tỷ giá giữ `tabular-nums`.
- Tên thương hiệu, mã tiền tệ, và tên workspace người nhập mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| toàn bộ | dùng | Vòng này chỉ đổi chữ, không đổi một component nào |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: khuôn đã có sẵn trên màn — thanh bên Cài đặt toả sang bảy mục con. Vòng
này không đổi cấu trúc, chỉ đổi chữ, nên không có khuôn thứ hai để cân.

## Ngoài phạm vi

- 33 file còn lại của cụm Cài đặt (tracking, connections, api-keys, members, sso).
- Câu chữ lỗi do API sinh — nằm trong `t3_paths`.
- Đổi bố cục, đổi component, đổi luồng. Vòng này chỉ đổi chữ.
