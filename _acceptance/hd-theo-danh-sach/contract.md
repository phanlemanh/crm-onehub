---
schema_version: 1
feature: Tham số hd của Google phải theo hình dạng danh sách cho phép, không theo domain đầu tiên — để vế «cộng một người ngoài» mà tài liệu và test đã công bố chạy được thật
slug: hd-theo-danh-sach
owner: manh.phan@onemount.com
risk_tier: T3
surfaces: [auth]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-07
design_doc: docs/superpowers/specs/2026-09-07-hd-theo-danh-sach-design.md
---

# Acceptance Contract: hd-theo-danh-sach

## Bối cảnh

`ALLOWED_SIGN_IN="onemount.com,phanlemanh@gmail.com"` là dạng `.env.example` công bố
và `apps/api/test/workspace.spec.ts` khẳng định bằng một ca đang XANH. `isWorkspaceEmail`
làm đúng. Nhưng `packages/auth/src/auth.ts:49` đặt `google.hd` vô điều kiện theo domain
đầu tiên, nên Google chặn địa chỉ lẻ trước khi CRM kịp xét. Chi tiết ở design doc.

## Acceptance Criteria

### AC-1 — `hd` chỉ đặt khi danh sách có ĐÚNG MỘT domain và không địa chỉ lẻ

**Given** một hàm thuần đọc `ALLOWED_SIGN_IN`
**When** gọi nó với từng hình dạng danh sách
**Then** kết quả đúng bảng viết TRƯỚC này — **sáu dòng**, và chân phải in đủ sáu:

| # | `ALLOWED_SIGN_IN` | `hd` | `isWorkspaceEmail("ai@onemount.com")` |
| --- | --- | --- | --- |
| 1 | `onemount.com` | `"onemount.com"` | `true` |
| 2 | `onemount.com,phanlemanh@gmail.com` | `undefined` | `true` |
| 3 | `phanlemanh@gmail.com` | `undefined` | `false` |
| 4 | `onemount.com,partner.com` | `undefined` | `true` |
| 5 | *(biến chưa đặt)* | `undefined` | `false` |
| 6 | `""` | `undefined` | `false` |

**Luật rút ra:** đặt `hd` **chỉ khi danh sách có ĐÚNG MỘT domain và không địa chỉ lẻ
nào.** Không phải «không có địa chỉ lẻ» — dòng 4 là ca hỏng mà luật hẹp hơn ấy bỏ sót:
`hd` chỉ nhận một domain, nên đặt nó bằng domain đầu tiên sẽ khoá `partner.com` ngay ở
màn chọn — **cùng lớp lỗi vòng này tuyên là đã sửa, chỉ đổi hình dạng đầu vào.**

Hai dòng cuối có mặt vì trục A khai giá trị «rỗng» mà bảng thiếu nó: nếu ai đó xoá
`ALLOWED_SIGN_IN` lúc triển khai, tiêu chí phải nói được cả `hd` lẫn kết quả phân
quyền — và phân quyền phải **fail closed**.

**Đỏ khi** một dòng sai — nêu đầu vào, giá trị mong đợi, giá trị nhận được.
**Mã 2 khi** hàm không tồn tại, không xuất ra được, hoặc số dòng chạy khác 6.

### AC-2 — Quyết định là hàm THUẦN, không nằm trong thân dựng provider

**Given** thân dựng `socialProviders` chạy đúng một lần lúc nạp module
**When** phép đo cần thử sáu hình dạng danh sách
**Then** nó gọi được hàm ấy trực tiếp, không phải nạp lại module hay dựng lại provider.
**Đỏ khi** logic `hd` nằm trong thân dựng — khi đó không đo được sáu dòng của AC-1 trong
một lượt chạy.

Tiêu chí này có mặt vì nếu để nguyên chỗ cũ thì phép đo phải nạp lại module với env
khác nhau, và một phép đo phải dùng mẹo để chạy được là một phép đo sẽ mục.

### AC-3 — Phân quyền KHÔNG đổi, chứng bằng test cũ còn nguyên vẹn

**Given** `apps/api/test/workspace.spec.ts` — bộ test của `isWorkspaceEmail`, cửa phân
quyền thật
**When** vòng này đóng
**Then** ba điều, cả ba đo được:
1. file ấy **không đổi một ký tự**, so bằng `git diff` với **sha cố định `5ac85ef9f1a811afb4d101c832904fd5a691cfca`** — ghim
   một sha chứ không phải tên nhánh;
2. bộ test ấy **chạy thật** và chân in ra **số ca xanh**;
3. **đối chứng hành vi**: chạy lại chính các hình dạng danh sách của bộ ca cũ và so
   kết quả từng ca — byte không đổi mà hành vi đổi vẫn là đỏ.

**Đỏ khi** file bị sửa, hoặc một ca cũ đổi kết quả, hoặc số ca xanh giảm.
**Mã 2 khi** không đọc được sha ghim, hoặc bộ test không chạy được.

Mốc phải là sha cố định vì «gốc nhánh» là mốc **di động**: sau khi nhánh merge nó hoá
thành HEAD, diff rỗng vô điều kiện, và tiêu chí quan trọng nhất của vòng xanh vĩnh
viễn dưới `recheck: strict`. So byte thân hàm cũng không đủ: vòng này thêm một hàm đọc
CÙNG danh sách vào CÙNG file, nên một hàm tách chuỗi dùng chung bị sửa sẽ đổi hành vi
mà thân `isWorkspaceEmail` vẫn nguyên byte.

Đây là tiêu chí quan trọng nhất của vòng: nếu phải sửa test của cửa phân quyền để vòng
này xanh, thì phân quyền đã đổi, và cái giá không còn là «trải nghiệm bị từ chối xấu
hơn» nữa.

### AC-4 — Câu từ chối giữ nguyên

**Given** `auth.ts` từ chối bằng `APIError("FORBIDDEN")` với hai câu tuỳ có domain hay
không
**When** vòng này đóng
**Then** đo **QUAN HỆ**, không đo chuỗi có mặt: gọi thật đường từ chối với hai hình
dạng danh sách và khẳng định thông điệp nhận được khớp bảng hai dòng ghim trước:

| `ALLOWED_SIGN_IN` | người bị từ chối nhận |
| --- | --- |
| `onemount.com` | câu nêu domain — «Sign in with your @onemount.com account.» |
| `onemount.com,phanlemanh@gmail.com` | câu nêu domain — **giữ nguyên** |
| `phanlemanh@gmail.com` | câu allow-list — «That address is not on the allow-list.» |

**Đính chính sau khi duyệt (phép đo buộc):** bảng ban đầu ghi danh sách trộn nhận câu
allow-list. Đó là **kỳ vọng tôi chép từ đề xuất của bên phản biện mà không đo**. Đo thật
thì `primaryWorkspaceDomain()` trả domain bất kể có địa chỉ lẻ, nên ca trộn vẫn nhận câu
nêu domain — và với **người lạ**, đó là chỉ dẫn đúng và hữu ích hơn. Câu allow-list chỉ
xuất hiện khi danh sách **không có domain nào**, nên bảng nay có dòng thứ ba cho đúng ca
ấy. Người mà vòng này mở đường cho — `phanlemanh@gmail.com` — **được cho vào**, nên không
bao giờ đi đường từ chối; kịch bản «nhận chỉ dẫn sai» không thành hiện thực.
Sổ quyết định: `d-20260907T170500Z-a012`.

**Đỏ khi** một dòng nhận sai câu.
**Mã 2 khi** không gọi được đường từ chối.

Đo quan hệ vì đo chuỗi hỏng đúng ca đáng lo nhất: nhánh chọn câu bị đảo hay thành mã
chết thì cả hai chuỗi vẫn nằm nguyên trong file và thước vẫn xanh, trong khi
`phanlemanh@gmail.com` — chính người vòng này mở đường cho — nhận một chỉ dẫn sai.

### AC-5 — Cấu hình thật của OneHub chạy đúng đầu-cuối

**Given** `ALLOWED_SIGN_IN="onemount.com,phanlemanh@gmail.com"`
**When** phép đo chạy
**Then** `hd` **không** được đặt, **và** `isWorkspaceEmail` cho `true` với cả
`ai-do@onemount.com` lẫn `phanlemanh@gmail.com`, `false` với `nguoi-la@gmail.com`.
**Đỏ khi** một trong bốn khẳng định sai.

Đây là ca thật của lộ trình triển khai, không phải ca tổng quát.

### AC-8 — Một lượt bị từ chối KHÔNG để lại hàng nào (cross-layer)

**Given** bỏ `hd` nghĩa là **mọi tài khoản Google trên internet** đi tới được callback,
thay vì bị Google chặn từ màn chọn
**When** một địa chỉ ngoài danh sách đi trọn đường callback với `ALLOWED_SIGN_IN` trộn
**Then** đếm số hàng `user`, `account`, `session`, `verification` **trước và sau** —
bốn cặp phải bằng nhau; và chân phải ghim rằng phép kiểm nằm ở
`databaseHooks.user.create.**before**`, tức trước khi ghi.
**Đỏ khi** một bảng tăng hàng.
**Mã 2 khi** không dựng được lượt callback để đếm.

Đây là tiêu chí đo **cái thật sự đổi**. Ba tiêu chí kia đo rằng ta không gửi `hd`;
tiêu chí này đo hệ quả của việc không gửi. Không có nó, câu «phân quyền không yếu đi
một chút nào» chỉ là lời khai với bằng chứng duy nhất là hai file không đổi byte —
trong khi đường tạo tài khoản vừa mở ra cho cả internet thay vì cho một domain.

### AC-6 — Không chép thước

**Given** thư mục `rang/` của tám hồ sơ trước
**When** so sánh
**Then** không khối nào từ 12 dòng trở lên trùng.

### AC-7 — Đánh đổi trải nghiệm bị từ chối có chấp nhận được không (judgment)

**Given** bỏ `hd` nghĩa là người ngoài bị từ chối SAU khi đã chọn tài khoản Google,
thay vì không thấy nút
**When** người đọc câu từ chối họ sẽ nhận
**Then** người quyết đánh đổi ấy có đáng để mở đường cho một địa chỉ ngoài domain không.

## Coverage

Quét bằng preset **test-matrix**. Chân sản phẩm: `.env.example` + `apps/api/test/workspace.spec.ts`
+ `packages/auth/src/workspace.ts` `[SUY-TỪ-REPO]`. Chân ngành:
`[NGÀNH: Google OAuth 2.0 — hd parameter]` · `[NGÀNH: OWASP — server-side authorization]`.

- **Trục A — hình dạng danh sách cho phép:** một domain | **nhiều domain** | chỉ địa
  chỉ | trộn domain với địa chỉ | rỗng. [thước CE: bốn giá trị đã có ca trong bộ test
  hiện hữu của `isWorkspaceEmail`; giá trị «nhiều domain» là ca hỏng bên phản biện tìm
  ra, và bảng AC-1 nay có dòng cho nó] → AC-1, AC-5
- **Trục B — ai chặn ở đâu:** Google chặn ở màn chọn (`hd`) | CRM chặn ở callback
  (`isWorkspaceEmail`) | không ai chặn. [thước CE: giá trị thứ ba là ca phải không bao
  giờ xảy ra, và AC-3 canh đúng điều đó] → AC-3, AC-4
- **Trục C — phép đo đứng ở đâu:** hàm thuần | thân dựng provider | chỉ đo qua trình
  duyệt thật. [thước CE: giá trị thứ hai là chỗ mã đang nằm, và nó không đo được trong
  một lượt chạy] → AC-2
- **Trục D — cái gì bị đo:** tham số ta GỬI ĐI (`hd`) | hệ quả trong CƠ SỞ DỮ LIỆU sau
  một lượt bị từ chối | hành vi thật của Google. [thước CE: giá trị thứ hai là thứ vòng
  này suýt không đo, và nó mới là cái thật sự đổi; giá trị thứ ba nằm ngoài tầm và đã
  khai ở Known limits] → AC-8
- **Cross-cutting:** bảng viết trước có đủ dòng · cặp hai chiều · không chép thước ·
  không đụng cửa phân quyền · tiêu chí xuyên lớp có phép đo ở lớp cơ sở dữ liệu →
  AC-1, AC-3, AC-6, AC-8

Ô Core: 4 trên không gian 45 ô. Ô Later: đo `hd` qua một lượt OAuth thật · làm điều
tương tự cho Microsoft nếu nhà cung cấp ấy có tham số tương đương. Ô Never: nới
`isWorkspaceEmail` · bỏ hẳn `hd` kể cả khi danh sách chỉ có domain.

## Out of scope

- **Đụng `isWorkspaceEmail`** — cửa phân quyền không nằm trong phạm vi, và AC-3 canh
  đúng điều đó.
- **Đổi câu từ chối** — nó đã đúng cho cả hai ca.
- **Thêm cách đăng nhập** (Microsoft, SSO) — việc khác.
- **Đo bằng một lượt OAuth thật với Google** — cần client production và một tài khoản
  ngoài domain; vòng này đo hàm thuần và để lượt thật cho giai đoạn triển khai.

## Notes

### Known limits

- **Vòng này không chứng hành vi thật của Google.** Nó chứng rằng ta *không gửi* `hd`
  khi danh sách trộn. Việc Google thật sự cho một tài khoản gmail đi qua khi không có
  `hd` là hành vi của Google, không phải của mã này — sẽ thấy ở lượt đăng nhập thật
  trong giai đoạn triển khai.
