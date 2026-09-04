# Cửa vào nói tiếng Việt

Ngày 2026-09-04 · slug `cua-vao-noi-tieng-viet` · T2

## Vấn đề

Màn đăng nhập và màn khai báo là hai màn **đầu tiên** một nhân viên OneHub nhìn
thấy, và cả hai vẫn tiếng Anh hoàn toàn. Chúng nằm ngoài mọi lát đã khoanh của
kế hoạch tiếng Việt — vòng ③a khoanh 96 file của ba luồng bên trong ứng dụng,
không đụng `(landing)`.

Triển khai nội bộ mà cửa vào còn tiếng Anh thì công dịch bên trong mất một nửa ý
nghĩa: người mới gặp tiếng Anh trước khi gặp bất cứ thứ gì đã dịch.

## Điều đã có sẵn, và điều còn thiếu

Cơ chế ngôn ngữ **đã chạy** cho hai màn này. `apps/app/app/layout.tsx` là layout
gốc; nó gọi `resolveLocale(cookie, accept-language)` và đặt `<html lang>`. Hai
màn `(landing)` nằm dưới layout đó nên đã nhận đúng tiếng người đọc.

Thiếu đúng một thứ: **kho chuỗi**. Cả 8 file viết chữ thẳng vào JSX.

## Ba quyết định của người, ngày 04/09

| Chỗ | Chọn | Vì sao |
| --- | --- | --- |
| `DEFAULT_LOCALE` | `"en"` → `"vi"` | Công cụ nội bộ của đội Việt Nam thì tiếng Việt là mặc định đúng. `Accept-Language` vẫn được tôn trọng trước, nên máy khai tiếng Anh vẫn ra tiếng Anh |
| Dòng chân "Made with love by Comp AI" | Bỏ hẳn | MIT chỉ đòi giữ thông báo bản quyền trong mã nguồn (`LICENSE`), không đòi hiện trên giao diện. Một đường dẫn ra ngoài ở màn đăng nhập nội bộ là nhiễu |
| Tiêu đề "Every customer, one place." | Dịch sát, giữ ý | Giữ đúng vai của câu, không biến việc dịch thành việc viết lại thương hiệu |

## Ba thứ KHÔNG dịch, và vì sao

- **`DEFAULT_WORKSPACE_NAME = "CRM"`** (`packages/auth/src/organization.ts:6`) —
  nó vừa là gợi ý trong ô nhập, vừa là **tên và slug thật** của workspace lúc tự
  tạo (`:49-50`). Dịch nó là đổi slug. Nhờ không đụng, việc này giữ hạng T2.
- **Tên biến môi trường** trong màn "chưa có cách vào nào" —
  `GOOGLE_CLIENT_ID` và ba cái còn lại là thứ người đọc phải gõ y nguyên.
- **Tên riêng** — Google, Microsoft, Context, và `provider.name` của SSO (thứ
  người quản trị tự gõ).

Cả ba nhóm mang `translate="no"`, theo đúng luật `CLAUDE.md` và trùng khuyến nghị
của Vercel Web Interface Guidelines.

## Lớp lỗi vòng này phải chặn

Vòng ③a đạt **16/16 tiêu chí máy** mà vẫn còn **18 chỗ tiếng Anh** trên màn. Lý
do: bốn chân đo chỉ thấy bề mặt chúng tự mở, còn chặn khoá-chết chỉ đọc kho chuỗi.

Ở đây ba bề mặt có cùng hình dạng nguy hiểm ấy, và cả ba đều thành tiêu chí:

1. **Nhánh "chưa có cách vào nào"** — chỉ hiện khi không cấu hình OAuth nào.
2. **Suspense fallback** của màn đăng nhập — chỉ hiện thoáng qua khi đang tải.
3. **Trạng thái đang gửi** của ba nút — chỉ hiện trong lúc chờ máy chủ.

Phép đo phải MỞ được ba trạng thái đó, không chỉ chụp trạng thái thường.

## Giới hạn đã biết, khai trước

**Chuỗi lỗi do máy chủ đúc sẵn không dịch được ở vòng này.** Bốn chỗ gọi
`toast.error(error.message)` nhận câu tiếng Anh Better Auth và tRPC tự dựng. Nó
không đi theo người đọc được vì máy chủ không biết tiếng của người gọi. Sửa đúng
là gửi MÃ lỗi cho client tra — một vòng riêng, chạm hợp đồng tRPC. Vòng này chỉ
dịch câu dự phòng của client (`"Could not reach the sign-in service."`) và ghi
phần còn lại thành giới hạn.

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: `/sign-in` → chọn Google/Microsoft/SSO → `/onboarding` (tên công ty +
  địa chỉ workspace + website) → `/onboarding/research` (khoá Context) → `/`
- Biên: chưa cấu hình cách đăng nhập nào → màn "chưa có cách vào nào", không có
  đường đi tiếp; đã có phiên → `/sign-in` chuyển thẳng về `/`
- Lỗi & quay lại: nhà cung cấp từ chối hoặc mạng hỏng → toast lỗi, nút trở lại
  bấm được, người ở nguyên màn và thử lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đăng nhập | Chọn một cách để vào | Từ mọi đường chưa có phiên / tới `/` hoặc `/onboarding` |
| Khai báo công ty | Đặt tên và địa chỉ cho workspace | Từ đăng nhập lần đầu / tới màn khoá nghiên cứu |
| Khoá nghiên cứu | Dán khoá Context để tác nhân tra được công ty | Từ khai báo công ty / tới `/` |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dangnhap-dangtai | Đăng nhập | Tiêu đề dự phòng "Mừng bạn quay lại" + mô tả, chưa có nút | Chờ |
| ST-dangnhap-thuong | Đăng nhập | Một nút cho mỗi cách vào đã cấu hình | Bấm một nút |
| ST-dangnhap-chicoso | Đăng nhập | Chỉ các nút SSO của tổ chức | Bấm một nút |
| ST-dangnhap-khongcoduong | Đăng nhập | "Chưa có cách nào để vào" + hướng dẫn đặt biến môi trường | Không có đường đi tiếp; sửa `.env` rồi khởi động lại |
| ST-dangnhap-danggui | Đăng nhập | Nút chuyển sang con quay, mọi nút khoá | Chờ |
| ST-dangnhap-loi | Đăng nhập | Toast lỗi, nút bấm lại được | Thử lại |
| ST-khaibao-thuong | Khai báo công ty | Ba trường, nút Tiếp tục | Nhập rồi gửi |
| ST-khaibao-dangluu | Khai báo công ty | Con quay trong nút, nút khoá | Chờ |
| ST-khoa-thuong | Khoá nghiên cứu | Ô dán khoá + đường đăng ký Context | Dán khoá rồi gửi |
| ST-khoa-dangluu | Khoá nghiên cứu | Con quay trong nút, nút khoá | Chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ba trường của màn khai báo đều bắt buộc; địa chỉ workspace tự suy từ tên công
  ty cho tới khi người tự sửa nó
- Ô khoá Context là `type="password"`, tắt gợi ý và tắt soát chính tả
- Tiêu đề lớn của khung chung nằm trong ô `max-w-[14ch]` — tiếng Việt dài hơn
  tiếng Anh nên phải đo lại bề rộng thật, không đoán
- Tiêu đề tài liệu (thẻ tab trình duyệt) hiện là hằng tĩnh; phải chuyển sang
  `generateMetadata` để đọc được tiếng của người

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `AuthShell`, `AuthHeading` | mở rộng | Nhận chuỗi từ kho thay vì tự chứa; bỏ dòng chân |
| `Button`, `Input`, `Field`, `InputGroup`, `Spinner` | dùng | Đã ở `packages/ui`, không đụng |
| Kho chuỗi `messages/auth.ts` | tạo | File thứ sáu, cùng khuôn `satisfies` với năm file anh em |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: wizard
Căn cứ: luồng đã là wizard tuyến tính có sẵn trong mã (đăng nhập → khai báo →
khoá → ứng dụng), mỗi bước một việc và không có đường rẽ. Không có khuôn thứ hai
khả dĩ nên không tra mẫu thị trường.
<!-- UX-SPEC-TEMPLATE>>> -->

## Cách làm

1. Thêm `apps/app/lib/messages/auth.ts` — cùng khuôn `satisfies` với năm kho
   chuỗi anh em, để khoá thiếu bị bắt lúc biên dịch.
2. Nối 8 file vào kho chuỗi đó. Không chuỗi người-đọc-thấy nào còn trong JSX.
3. Đánh `translate="no"` ở ba nhóm không dịch.
4. Bỏ dòng chân Comp AI.
5. Đổi `DEFAULT_LOCALE` sang `"vi"`.
6. Chuyển ba `metadata` tĩnh sang `generateMetadata`.

## Cách chứng minh

Dùng lại giàn đo của vòng ③a — nó vừa được vòng `thuoc-cua-lat-3a-co-rang` làm
cho có răng, và mỗi chân nay tự chứng minh cả hai chiều mỗi lượt chạy. Thêm một
chân mới cho hai màn `(landing)`, theo cùng luật: dựng vật thật hai lần, hai thứ
tiếng, rồi so chữ người đọc thấy — **không dùng máy quét mã để chứng minh sự vắng
mặt của tiếng Anh**.
