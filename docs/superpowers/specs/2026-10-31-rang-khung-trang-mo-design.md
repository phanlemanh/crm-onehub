# Răng khung trang mở — thiết kế (BK3, 31/10/2026)

Hàng BK3 `rang-khung-trang-mo` của `docs/plan/lo-trinh-okr.json`, đợt `ban-do-khuon-3010`, dãy L. Ô cơ hội ký
`build` ngày 31/10 (Phan Le Manh). Bản phạm vi `docs/plan/pham-vi-ban-do-khuon-3010.md`; trang tri thức
`crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md`.

## Vấn đề, đo trên cây

Bài `apps/app/test/khung-man-chung.spec.ts` (hồ sơ `khung-man-chung`, đã ký 13/10) chỉ soát các tệp có tên trong
`apps/app/test/fixtures/khung-man-chung-hinh.json`. Bảng đó máy sinh từ `git grep -l PageShellLoading 3a2783409`, nên
nó chỉ chứa 39 tệp có từ trước 13/10. Ca tiêu đề lúc tải (`quetTieuDeKhiTai`) chỉ chạy trên `page.tsx` của chính bảng
ấy. Một trang sinh sau ngày đó không nằm trong bảng, nên không ca nào đọc nó.

Đo ở đỉnh `0da1ee9c9` (onehub `6ca59691a` gộp vào nhánh):

| Nhóm | Số trang | Ghi chú |
| --- | --- | --- |
| `page.tsx` dưới `apps/app/app` | 71 | `git ls-files` |
| tới đủ `PageShellHeader`, `PageShellTitle`, `PageShellDescription` lúc tải | 44 | trong đó 12 trang ngoài bảng hình, không bài nào soát |
| không có JSX (chỉ chuyển hướng hay `notFound`) | 6 | |
| có `PageShellHeader` lúc tải, tiêu đề theo dữ liệu | 3 | chiến dịch, Đọc trang, Duyệt đề xuất — đã soát ở `breadcrumb-chi-tiet` |
| không tới `PageShellHeader` lúc tải | 18 | 8 trang `(landing)`, 2 `proto`, Sơ đồ, Quanh mục tiêu, Soạn (chuyển hướng sau tải), Lịch sử trang ×2, chi tiết tác nhân, Hội thoại ×2 |

Năm trang cuối của nhóm sau cùng là nợ thật của luật «Khung trang» (`docs/design.md`). Lịch sử trang, phiên bản cũ
của trang, và chi tiết tác nhân dựng tiêu đề theo dữ liệu trong một thành phần khách nằm trong `Suspense`, nên lúc
chờ không có đầu trang. Đó là đúng lỗi NM1 đã sửa cho bốn màn bản ghi (AC-5, AC-16 của `khung-man-chung`), sinh lại
ở trang mới. Hai màn Hội thoại không dựng đầu trang nào.

## Cách làm

Một bài kiểm mới `apps/app/test/khung-trang-mo.spec.ts`. Lối quét để ở `apps/app/test/support/khung-trang.ts`
để BK6 `rang-hang-cong-cu` nhập lại mà không chạm `apps/app/test/lib/**` (vùng BK2). Bảng ngoại lệ nằm ở
`apps/app/test/fixtures/khung-trang-ngoai-le.json`.

1. **Tập trang là cây thật.** Danh sách trang lấy bằng `git ls-files` mọi `page.tsx` dưới `apps/app/app/`, đọc ở mỗi
   lượt chạy. Không có bảng tệp, không có commit gốc, nên trang thêm ngày mai vào thẳng tập quét.
2. **Ba nhóm, mỗi trang đúng một nhóm.**
   - `khung` — hàm mặc định của `page.tsx` tới được `PageShellHeader`, `PageShellTitle` và `PageShellDescription`
     lúc tải: không đi qua phần thân của một `Suspense` (đi vào `fallback` thì được). Lối đi theo nhập cục bộ và hàm
     cùng tệp, sâu tối đa ba bậc, như `laThanhPhan` của `khung-man-chung.spec.ts`. Thêm: không `<h1>` nào tới được
     lúc tải, vì `<h1>` riêng là một đầu trang tự dựng.
   - `chuyen-huong` — tệp không có phần tử JSX nào. Máy suy, không cần dòng.
   - `ngoai-le` — có dòng trong bảng ngoại lệ.
   Trang không thuộc nhóm nào là trang lệch. Bài đỏ, mỗi trang lệch một dòng gọi tên tệp và chỗ thiếu.
3. **Bảng ngoại lệ có răng.** Mỗi dòng `{ tep, loai, ly_do }`. `loai` thuộc tập đóng `ngoai-app` · `ban-mau` ·
   `toan-vung` · `chuyen-huong-sau-tai` · `tieu-de-theo-du-lieu` · `no`; `ly_do` không rỗng. Dòng đỏ khi tệp không
   còn trong tập trang, khi trùng, khi `loai` lạ hay `ly_do` rỗng. Dòng **thừa** cũng đỏ: trang đã thành `khung`
   mà vẫn mang dòng. Nhờ vậy dọn xong một nợ là phải gỡ dòng của nó, và bảng luôn bằng đúng tập lệch hiện có.
   Dòng `tieu-de-theo-du-lieu` còn phải tới `PageShellHeader` lúc tải (breadcrumb), thiếu thì đỏ.
4. **Bảng ngày dựng.** 21 dòng: 8 `ngoai-app`, 2 `ban-mau`, 2 `toan-vung` (Sơ đồ và Quanh mục tiêu, ngoại lệ
   «màn toàn vùng» có tên trong `docs/design.md`), 1 `chuyen-huong-sau-tai` (Soạn), 3 `tieu-de-theo-du-lieu` và
   5 `no`. Mỗi dòng `no` ghi đích sửa.

## Vì sao không sửa bài của `khung-man-chung`

`khung-man-chung` đã ký. AC-3 của nó viết thành lời rằng tập tệp của bảng hình bằng đúng tập `git grep` ở
`3a2783409`, và không tệp nào ngoài bảng dùng `KhungXuong`. Mở ca đó cho trang mới là đổi lời một tiêu chí đã ký;
theo luật tạm 18/10 «không tự sửa thước hồ sơ đã ký», máy không làm. Tệp mới đứng riêng, nên hồ sơ `khung-man-chung`
không bị kéo vào lưới ghim lại.

Hệ quả, đo được ở cây: vì AC-3 đó, trang mới không dùng được `KhungXuong` mà không làm bài `khung-man-chung` đỏ. Năm
trang sau 13/10 (Tín hiệu, Tất cả tín hiệu, Thông báo, Lộ trình, Slack) đã tự dựng khung chờ riêng (`KhungCho…`).
Đây là lớp hình lúc tải, không phải đầu trang. Trang tri thức chốt BK3 «chỉ soát đầu trang», nhưng câu giao ghi «hình theo màn», nên đây là câu hỏi cho chủ kho ở
Cổng Phạm vi (Hỏi-1). Máy khuyên để hình lúc tải cho hàng riêng `bang-hinh-khung-mo` (yêu cầu `L-2`), nơi chủ kho
ký lại AC-3 và AC-17 của `khung-man-chung`.

## Không làm

- Hình khung xương lúc tải của trang mới (xem mục trên).
- Hàng công cụ và lọc (BK6, đứng sau BK3, dùng lại lối quét).
- Sửa năm trang nợ: bảng chặn nợ mới, không dọn nợ cũ — cùng luật với BK5 (luật 40 của đợt).
- `<h2>` thô ở Kết nối và Slack: tiêu đề mục, không phải đầu trang; thuộc bảng «Dấu hiệu vẽ tay» (BK5).
- Trang ngoài `apps/app/app`.

## Đặc tả UX

Bỏ: vòng chỉ thêm bài kiểm của kho, không đổi màn nào (sổ quyết định, dòng «bỏ đặc-tả-UX»).
