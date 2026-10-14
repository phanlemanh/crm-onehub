# Sửa sau chạy thật — thiết kế

Hàng `l5` của `docs/plan/lo-trinh-kho-tai-lieu.json`, dãy P6 đợt r2. Câu giao: «Danh sách góp ý đã gom được sửa trong
một lượt». Bước kế của hàng: «Sửa theo góp ý gom được tới lúc mở lượt; không chờ chạy thật xong — thiếu góp ý thì
dựng và đo trên bộ câu hỏi mẫu».

## Danh sách góp ý của lượt này

Chạy thật với các phòng ban chưa diễn ra (mốc ngoài 14/10), nên chưa có góp ý thật. Bộ 50 câu mẫu (`cb`) đạt 100%,
chỉ hai câu lỗi gọi model (m09, m27). Chủ kho chọn hướng A ngày 2026-10-14 (yêu cầu `P6-9` của đợt r2): danh sách
góp ý là **các hạn chế người dùng thấy còn mở** trong tám hồ sơ Kho đã ký (`kho-tai-lieu`, `may-soan-de-xuat`,
`tim-va-dieu-huong-kho`, `tro-ly-doc-kho`, `tro-ly-kho-dung-phien`, `kho-nguon-khong-ket`, `bo-cau-hoi-mau`,
`lich-su-va-luu-tru-trang`); bỏ các nợ về phép đo và hạ tầng; đo lại trên bộ câu mẫu sau khi sửa.

Kiểm trên `c4c8ab0ab` (đọc mã, 14/10): 87 hạn chế đã ghi, 17 mục người dùng thấy; ba mục đã được hàng sau sửa
(«dấu `|` trong ô bảng», «trần 25 đề xuất», «lệch múi giờ quá hạn xác minh»); một mục cần thêm cột nên là T3 và để
lượt sau («câu hỏi chờ hàng đợi còn ít hơn ba phút»). Còn mười hai mục, mỗi mục một tiêu chí:

| Mục | Hồ sơ gốc | Người dùng thấy gì hôm nay | Chỗ hỏng |
|---|---|---|---|
| G1 | `lich-su-va-luu-tru-trang` Ngoài-1, 4 | Tải nguồn lên trang đã lưu trữ, hay máy soạn nộp bản cho trang vừa lưu trữ, sinh đề xuất kẹt mãi trong Chờ duyệt | `tai-lieu-nguon.service.ts` `kiemDich`; `apps/agent/agent/lib/tai-lieu-nop.ts` `nopBanDeXuat` |
| G1b | phát hiện khi kiểm | `kiemDich` không lọc quyền xem trang | `kiemDich` dùng `findUnique({slug})` không kèm `dieuKienThay` |
| G2 | `lich-su-va-luu-tru-trang` Ngoài-3 | Trang có đề xuất lưu trữ hay khôi phục chờ: nút «Xem bản chờ» dẫn sang màn duyệt lưu trữ, số bản chờ đếm dư | `[trang]/page.tsx` lọc đề xuất chờ thiếu `loai` |
| G3 | `kho-tai-lieu` Ngoài-9 | Tải danh sách đề xuất lỗi thì màn đọc vẫn hiện «Có 1 bản chờ duyệt» và mất nút vào màn duyệt, không báo gì | `[trang]/page.tsx` `.catch(() => null)` |
| G4 | `lich-su-va-luu-tru-trang` Ngoài-5 | Phiên bản cũ chỉ khác tên trang: «Quay lại» báo «chưa có thay đổi» | `tai-lieu-lich-su.service.ts` `quayLai` chỉ so nội dung |
| G5 | `kho-tai-lieu` Ngoài-10 | Mục lục hiện thô `&amp;`, `\` khi tiêu đề có `&`, `<`, ký tự thoát; bấm mục lục không tới đúng tiêu đề | `markdown-reader.tsx` `readerHeadings` đọc markdown thô bằng regex |
| G6 | `kho-tai-lieu` Ngoài-11 | Liên kết `http://` nhận khi soạn và khi dán, mất khi đọc, không ai báo | `trinh-soan-thanh-cong-cu.tsx` `CO_GIAO_THUC`, `dan-tu-van-phong.ts` `HREF_AN_TOAN` nhận `http`; trình đọc `SAFE_LINK` chỉ nhận `https` (cố ý, `1aff8fb9f`) |
| G7 | `kho-tai-lieu` Ngoài-12 | Trang mới và bộ lọc: tải danh sách thành viên hay cây đơn vị lỗi thì thấy danh sách rỗng, không báo | `lua-chon-trang.ts` nuốt lỗi thành rỗng |
| G8 | `tim-va-dieu-huong-kho` Ngoài-11 | Hộp tìm nhanh: tìm công ty, người, thoả thuận lỗi thì nhóm biến mất hoặc báo «không có gì khớp» | `quick-switcher.tsx` `results.isError` → `hits = []` |
| G9 | `tro-ly-doc-kho` Ngoài-2 | Người dùng giao diện tiếng Anh thấy câu từ chối, câu lỗi, câu quá hạn của trợ lý bằng tiếng Việt | `tai-lieu-hoi.ts` `TAI_LIEU_HOI` hiện thẳng ở `hoi-tra-loi.tsx` |
| G10 | `kho-tai-lieu` Ngoài-2 | Duyệt đề xuất thêm hay bớt cột bảng: tiêu đề mới rơi vào thân bảng, bảng rối | `tai-lieu-diff.ts` `khacCot` xen kẽ hàng cũ/mới, `diff-trang.tsx` `gomNhom` gộp thành một bảng |
| G11 | `may-soan-de-xuat` Ngoài-4 (r5) | Đề xuất máy soạn đã cũ: thẻ vẫn ghi «so với bản đang dùng» trong khi so với bản gốc lúc soạn | `man-duyet.tsx` nhãn `soVoiBan` không đổi khi `cu` |
| G12 | `may-soan-de-xuat` Ngoài-4 | Loại tệp nhận (Word, PDF) khai hai nơi; lệch thì người tải chỉ thấy lỗi chung | `apps/app/lib/tai-lieu-man.ts` `chapNhan` và `packages/validation/src/tai-lieu-nguon.ts` `KIEU_NGUON` |

## Làm gì

- **G1, G1b.** `kiemDich` đọc trang qua `dieuKienThay(nguoi)` (không thấy → `NOT_FOUND` như `taiLieu.get`) và từ
  chối trang đã lưu trữ bằng câu `daLuuTru` có sẵn. `nopBanDeXuat` đọc lại trang trong giao dịch nộp: trang đã lưu trữ
  → nguồn sang `LOI` với lý do «Trang đã lưu trữ», không tạo đề xuất. Không đổi lược đồ.
- **G2, G3.** Lọc đề xuất chờ của trang rút thành một hàm thuần trong `apps/app/lib` (chỉ `NOI_DUNG`, chưa cũ, đúng
  trang). Tải danh sách đề xuất lỗi → màn đọc nhận cờ lỗi, hiện một dòng «Chưa tải được bản chờ duyệt» kèm «Thử lại»
  (làm mới trang), không hiện số bản chờ.
- **G4.** `quayLai` từ chối «chưa đổi» chỉ khi cả tên và nội dung trùng bản đang dùng, như `propose`.
- **G5.** `readerHeadings` dựng từ cây mdast (cùng bộ đọc với trình đọc), lấy chữ đã giải mã; id dùng `readerSlug`
  trên đúng chữ đó, nên neo mục lục và id tiêu đề do `rehypeReader` đặt trùng nhau.
- **G6.** Một hằng luật liên kết dùng chung trong `packages/ui/src/lib` cho trình đọc, trình soạn và bộ lọc dán: chỉ
  `https://`, `mailto:`, đường trong kho và neo `#`. Trình soạn gặp `http://` → báo «Chỉ nhận liên kết https» và không
  lưu liên kết; bộ lọc dán giữ chữ, bỏ liên kết `http://` và hiện một dòng «Đã bỏ N liên kết http — chỉ nhận https». Không nâng `http` thành `https` (đổi đích người không biết).
- **G7.** `lua-chon-trang.ts` trả kèm cờ lỗi; form trang mới và hộp tải nguồn hiện một dòng «Chưa tải được danh sách
  thành viên / đơn vị» kèm «Thử lại» thay cho danh sách rỗng.
- **G8.** Hộp tìm nhanh: nhóm CRM lỗi → một dòng báo lỗi như nhóm Tài liệu đã có, không rơi vào «không có gì khớp».
- **G9.** Câu từ chối, câu lỗi, câu quá hạn của trợ lý trên màn CRM đi qua `taiLieuMessages` (vi/en). Câu gửi qua Zalo
  giữ tiếng Việt.
- **G10.** Hàng bảng đổi số cột: diff vẽ bảng cũ (tô bỏ) và bảng mới (tô thêm) thành hai bảng riêng, mỗi bảng với tiêu
  đề của nó.
- **G11.** Đề xuất đã cũ: thẻ so sánh đổi nhãn thành «So với bản gốc lúc máy soạn», kèm câu nói bản đang dùng đã đổi.
- **G12.** `chapNhan` và kiểu MIME của hộp tải sinh từ `KIEU_NGUON`; câu sai loại nêu tên các loại nhận được.
- **Đo lại bộ câu mẫu** bằng `_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do` sau khi sửa: bảng đạt theo tầng và
  kiểu chữ không thấp hơn lượt đã ký của `cb`; câu lỗi gọi model vẫn được tách riêng như ở `cb`.

## Không làm

- «Câu hỏi chờ hàng đợi còn ít hơn ba phút» (`tro-ly-doc-kho` Ngoài-7): sửa đúng cần cột thời điểm gửi, tức
  `migration` — hạng T3, để lượt sau.
- Nợ phép đo và nợ hạ tầng trong tám hồ sơ (khoảng 70 mục: phép kiểm thiếu đối chứng dương, log vận hành, kho Blob
  private) — không phải điều người dùng thấy.
- Góp ý từ chạy thật với phòng ban: khi có thì vào một lượt sau.
- Nâng `http` thành `https` khi dán hay soạn.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Không có luồng mới. Mỗi mục sửa một trạng thái trên màn đang có: màn đọc trang (G2, G3), màn phiên bản cũ (G4),
  mục lục màn đọc (G5), trình soạn và dán (G6), trang mới và hộp tải nguồn (G7, G12), hộp tìm nhanh (G8), màn Hỏi
  (G9), màn duyệt (G10, G11).
- Lỗi & quay lại: mọi lỗi tải mới có dòng báo kèm «Thử lại»; không còn chỗ nào lỗi rồi im.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Màn đọc trang | đọc bản đang dùng, biết có bao nhiêu bản sửa chờ | danh sách / màn duyệt |
| Màn duyệt | quyết duyệt hay trả lại một đề xuất | Chờ duyệt / màn đọc |
| Hộp tìm nhanh | tới một bản ghi hay một trang | mọi màn / bản ghi |
| Màn Hỏi | hỏi kho bằng lời thường | Kho / trang được trích |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-doc-cho-chi-noi-dung | Màn đọc | huy hiệu và «Xem bản chờ» chỉ tính đề xuất sửa nội dung | mở bản chờ |
| ST-doc-cho-loi | Màn đọc | dòng «Chưa tải được bản chờ duyệt» + «Thử lại», không có số | thử lại |
| ST-muc-luc-ky-tu | Màn đọc | mục lục hiện đúng «Lương & thưởng», «A < B», bấm tới đúng tiêu đề | đọc |
| ST-soan-http | Trình soạn | ô liên kết báo «Chỉ nhận liên kết https», không lưu | sửa thành https |
| ST-chon-loi | Trang mới / hộp tải nguồn | dòng «Chưa tải được danh sách thành viên» + «Thử lại» | thử lại |
| ST-tim-loi-crm | Hộp tìm nhanh | dòng báo nhóm CRM chưa tìm được, không phải «không có gì khớp» | thử lại / đóng |
| ST-hoi-en | Màn Hỏi (tiếng Anh) | câu từ chối, câu lỗi, câu quá hạn bằng tiếng Anh | hỏi tiếp |
| ST-duyet-bang-doi-cot | Màn duyệt | bảng cũ và bảng mới tách riêng, mỗi bảng đúng tiêu đề | duyệt / trả lại |
| ST-duyet-may-cu | Màn duyệt | nhãn «So với bản gốc lúc máy soạn» | trả lại / soạn lại |
| ST-tai-sai-loai | Hộp tải nguồn | câu sai loại nêu «Word (.docx) hoặc PDF» | chọn tệp khác |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mọi dòng báo lỗi dùng `Alert` hay `VungTaiLoi` có sẵn; «Thử lại» gọi lại đúng truy vấn hỏng.
- Chữ người nhập (tên trang, tiêu đề) giữ `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `Alert`, `VungTaiLoi`, `DiffTrang`, `MarkdownReader` | dùng | màn đã có; chỉ đổi dữ liệu và nhãn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: giữ nguyên khuôn của từng màn. Căn cứ: lượt sửa lỗi, không thêm màn hay luồng.
<!-- UX-SPEC-TEMPLATE>>> -->
