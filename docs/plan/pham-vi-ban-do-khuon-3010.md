# Bản phạm vi — bản đồ khuôn: màn mới đi qua khung của màn cũ (30/10)

Chủ kho 30/10 nêu: màn chi tiết deal đã có giao diện riêng, nhưng các màn OKR mới lại dựng một giao diện chi tiết khác.
Đo trên onehub `16604ce3f`:
- Ngăn KR (`kr-sheet.tsx`) và ngăn Số KR (`so-kr-sheet.tsx`) không dùng `RecordSheetFrame`, trong khi ngăn deal, liên
  hệ, công ty, kế hoạch và mục tiêu đều dùng. Hai ngăn này tự dựng đầu ngăn, chờ tải, báo lỗi và «không thấy».
- Khu OKR có khoảng ba chục thành phần rỗng, tải, lỗi đặt riêng.
- Luật «Nếp màn trong app» của `docs/design.md` có, và `AGENTS.md` nạp nó. Nhưng răng máy chỉ có ở màu trạng thái và
  khung trang. Phần «hình theo màn» của `khung-man-chung.spec.ts` lại neo vào một bảng tệp ở một commit gốc, nên trang
  sinh sau không bị soát.
- Tầng token sạch: lệch nằm ở khung và trạng thái, không ở màu hay khoảng cách.

Hướng đã chốt là **bản đồ khuôn**. Kho khai mỗi nhóm màn một tệp: đối tượng nào thuộc nhóm, khuôn nào, màn mẫu nào,
khe bắt buộc, khối dựng cấm dùng ngoài khuôn, ngoại lệ có lý do. Răng đi từ rẻ tới đắt: khe bắt buộc qua kiểu → lint
cấm nhập theo vùng → bài quét cho phần còn lại.

Thứ tự đã chốt: crm chạy thử như việc của kho trước; kho thứ hai khai cùng hình dạng để đo; kit rút cơ chế chung sau, ở
một vòng riêng. Lời chủ kho nguyên văn: «Tôi đồng ý với cách giải» và «Viết lại thành tất cả tài liệu cũng như quyết
định sau đó mới thực hiện vòng thử ở CRM. Để khi thực hiện chúng ta không mất bối cảnh?». Nghiên cứu, hình, kiến trúc
và trích phiên nằm ở kho tri thức (dòng `nguon`).

Chủ kho duyệt bản phạm vi này ngày 30/10: «Duyệt và đẩy».

<!-- <<<PHAM-VI-MA -->
```
dot: ban-do-khuon-3010
dang: chuoi
nguon: crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md#c9d74eaf0b846ddf5f3c2d50c9bf729045eec214

- `BK1` — mọi ngăn bản ghi (deal, liên hệ, công ty, kế hoạch, mục tiêu, KR, số KR) mở trong cùng một khung: cùng đầu ngăn, chờ tải bằng khung xương, lỗi nói đúng lý do
- `BK2` — ngăn bản ghi mới tự đi vào khung chung: dựng ngăn ngoài khung thì bài kiểm của kho đỏ và gọi đúng tên tệp
- `BK3` — trang mới sinh sau ngày dựng bài kiểm khung trang cũng bị soát, không chỉ các trang có từ trước
- `BK4` — bản mẫu của vòng chạm ngăn bản ghi chụp ngăn mới cạnh ngăn deal, cùng khổ và cùng trạng thái
```
<!-- PHAM-VI-MA>>> -->

## Chi tiết cho người cắt lượt và vòng mở sau

- **BK1 — khung và bản đồ.**
  - Thêm `design/patterns/ngan-ban-ghi.md`. Frontmatter gồm: `nhom`, `doi_tuong` (deal, lien-he, cong-ty, ke-hoach,
    muc-tieu, kr, so-kr), `khuon` (`RecordSheetFrame` và đường nhập), `nhan_dien`, `mau_dang_chay` (ngăn deal),
    `khe_bat_buoc`, `cam_ngoai_khuon`, `ngoai_le`. Thân tệp là luật cho người và tác tử.
  - Thư mục `design/patterns/` cũng là chỗ thang dùng lại của nền thiết kế kit nhận «mẫu màn».
  - Mở `RecordSheetFrame` thêm đúng các khe ngăn KR và Số KR cần (hành động riêng ở đầu, thân nhận thẻ con, lỗi «không
    thấy»), rồi đưa hai ngăn vào khung. Sửa khung, không thoát khung.
  - Chờ tải trong ngăn dùng khung xương: kéo luật trang 09/10 xuống tầng ngăn. Đây là máy quyết, chủ kho đảo được.
  - Lỗi tải trong ngăn dùng một thành phần duy nhất, ghi vào `docs/design.md`.
- **BK2 — răng.**
  - Thêm luật oxlint (`tools/oxlint/onehub`, ghi đè theo glob của `.oxlintrc.json`) cấm nhập `DetailSheetHeader`,
    `Skeleton`, `Spinner`, `VungTaiLoi` trong `components/crm/record-sheet/`, trừ tệp khung.
  - Thêm bài kiểm trên `apps/app/test/lib/quet-jsx.ts`: mọi loại bản ghi mà `record-sheet-host.tsx` đăng ký phải dựng
    khung ở gốc.
  - Hai chiều bắt buộc. Chiều đỏ: tiêm một ngăn gọi thẳng `DetailSheetHeader` thì đỏ, gọi đúng tên tệp. Chiều im: chỉ sửa
    `docs/` hay `_acceptance/` thì im. Thêm đối chứng dương: mọi ngăn hiện có xanh sau BK1.
- **BK3 — mở răng khung trang.** Phần «hình theo màn» của `apps/app/test/khung-man-chung.spec.ts` chuyển sang quét
  mọi `page.tsx`, có bảng ngoại lệ kèm lý do. Gần hàng NM1 «Khung màn chung» (chưa mở) — người cắt lượt xét gộp.
- **BK4 — màn mẫu.** Thêm một dòng «màn mẫu» trong `docs/proto.md`, để `design-pass` chụp ngăn mới cạnh ngăn deal ở
  Cổng Phạm vi. Người phản ứng lúc rảnh; không thêm lượt gọi người.

**Đụng tệp và thứ tự:** bản phạm vi `okr-ghi-trong-ngan-3010` (N1, N2) cũng chạm `kr-sheet.tsx` và
`objective-sheet.tsx`. Không chạy song song hai vòng sửa cùng tệp ngăn; người cắt lượt xếp thứ tự (máy khuyến nghị
N1 và N2 trước, BK1 sau, để khung mở khe theo hình dạng mới của ngăn).

**Ngoài phạm vi:**
- Cơ chế chung trong kit: lệnh khuôn, khối thẻ, dò khuôn từ mã. Thuộc kho kit, sau khi kho thứ hai khai cùng hình dạng.
- Trạng thái rỗng và tải theo từng khu ngoài ngăn bản ghi.
- Nhóm khuôn khác (trang danh sách, ngăn tạo).

**Đọc lại bối cảnh:**
1. Trang tri thức ở dòng `nguon` trên.
2. Finding của kit `docs/findings/2026-10-30-ui-dong-nhat-giua-cac-man.md` (§0 · §5.1 · §10.3 · §11 · §13). Hiện ở
   nhánh `claude/thao-luan-ui-dong-nhat-b528d4` của kho kit; bản sao bất biến nằm trong kho tri thức.
3. Hình kiến trúc duyệt cuối, trong bản thô `2026-10-30-kien-truc-ban-do-khuon.html` của kho tri thức.

Ra khỏi kho: không có việc vận hành.
