# Phân loại đỏ của kiểm chéo sau gộp lần 1

Hàng F25 `phan-loai-do-kiem-cheo`, đợt `sau-14-10`, làn P2. Viết ngày 10/10/2026.

## Kết luận

Lượt kiểm chéo chạy trên `10f2c7fb..d0ccad98`. Nó dừng ở trần 80 phút (mã 4), sau 22 trên 146 hồ sơ. Trong 22 hồ sơ đó, 12 hồ sơ đỏ hoặc không đo được.

**Không bài nào là hồi quy thật mà người dùng sẽ gặp.** Cả 12 hồ sơ đều thuộc loại (a): thước chết, thước lệch vật mới, hoặc môi trường. Vì vậy hàng này không gửi đơn `hang-moi` nào.

Bảy bộ kiểm của lượt đó đều xanh. Ví dụ đã biết cho loại (b) là bom giờ H5 (cuối trang). H5 xảy ra sau lượt này nên không có trong danh sách.

## Nguồn và giới hạn

- Log chính: `.acceptance-runs/kiem-cheo/lan-2026-10-10.log` (997 dòng). Mỗi bài đỏ có một đoạn trích, và mọi bài đỏ được chạy lại một lần.
- Nhật ký trọn của từng bài (`repin-20261009T224716Z-97557/…`) **không còn**. Chúng nằm trong cây kiểm chéo, và `scripts/kiem-cheo/dem.mjs:376` gỡ cây đó khi xong lượt. Bảng dưới chỉ dựa trên đoạn trích trong log chính.
- Mỗi kết luận được đối chiếu với mã ở onehub `3f36c4c2`.
- Còn 124 hồ sơ chưa được đo. Bảng này không nói gì về chúng.

## Ba loại (a)

- **(a1) Thước chết.** Thứ thước bám vào không còn, ví dụ chuỗi mốc vắng hay tệp không còn được chép. Hoặc thước neo vào một nhánh đã gộp (`merge-base` nay trùng HEAD, nên diff rỗng).
- **(a2) Thước lệch vật mới.** Thước còn sống, nhưng bảng khai hoặc số neo ghim trạng thái cũ. Vật đổi sau đó vì những vòng đã ký khác. Thứ thước bắt được không phải lỗi người dùng gặp.
- **(a3) Môi trường hay chập chờn.** Ví dụ HTTP 403 từ Vercel, không có máy chủ ở cổng mặc định, hoặc bài đỏ một lần rồi xanh khi chạy lại.

## Bảng phân loại

| Hồ sơ | Eval | Loại | Dòng log nguyên văn | Căn cứ |
|---|---|---|---|---|
| `bo-dung-chung-nhan-chuoi` | E4 | a2 | `RĂNG ĐỎ: có 2 chỗ khai kiểu ngôn ngữ, chờ đúng 1` · `apps/app/test/bang-crm-loc-ro.dom.tsx:102:type Locale = "vi" \| "en";` | Chỗ thứ hai nằm trong một tệp kiểm DOM, không phải mã sản phẩm. Thước quét cả `test/`. Các bài DOM mới (vd `hoan-tac-loat-dung-id.dom.tsx`) cũng khai kiểu cục bộ như vậy. |
| `bo-dung-khong-ket` | E9 | a1 | `merge-base truot 0 dieu: khong dieu nao (sai)` | Thước neo `merge-base` của nhánh. Nhánh đã gộp nên diff rỗng. Năm vế HEAD còn lại đều «dat». |
| `bo-xuong-kara` | E10 | a1 + a2 | `SAI so-lech-chuan.mjs ma 1: BƯỚC THIẾU VẬT: không bước nào nêu "bun run test:dieu-phoi"` · `SAI MO COI: artifact.tsx` · `SAI MO COI: task.tsx` | `test:dieu-phoi` là lệnh cổng mới khai ở `.githooks/gate-shape.json`, sau khi hồ sơ ký. «Mồ côi» là sai: `packages/ui/src/components/kara/artifact.tsx` và `kara/steps.tsx` vẫn nhập hai tệp đó. |
| `ca-chap-chon-cach-ly` | E5, E7 | a1 | `moc trong apps/agent-okr/test/support/khoi-dong.ts xuat hien 0 lan, can 1` | Mốc đột biến `await dungMoCoi(khoa);` không còn trong tệp. Tệp được viết lại ở `khoa-eve-khong-tranh` (a362b47a1, 21658d4f9, f47a7002b ngày 09/10). |
| `ca-chap-chon-con-lai` | E6 | a1 | `diff rong` | `pham-vi.mjs` neo `merge-base` của nhánh đã gộp. |
| `cai-dat-con-lai-noi-tieng-viet` | E1 | a1 + a2 | `TU CHOI DO — /settings/notifications … xin /onehub-center/settings/notifications nhung dung o /onehub-center/reminders.` · `VE 3 HONG: chuoi luot vi khong mang dau — "Chung"` · `VE 2 HONG: "onehub.center, onehub.vn" giong het o hai luot` | `/settings/notifications` đã chuyển sang `/reminders`. «Chung» là chữ Việt đúng, không có dấu, thước chỉ thiếu dòng miễn. Ô ví dụ tên miền giống nhau ở hai ngôn ngữ là đúng ý. Hồ sơ này đã ghi là trôi thước từ 27/09. |
| `cai-dat-con-lai-noi-tieng-viet` | E3, E11, E12, E17 | a2 | `KHONG DO DUOC: bang khai 26 loi goi toast mang chu, chan do nhan ra 31; thieu 1, thua 6.` · `LECH: chu-ngoai-jsx.mjs --chan tieu-de cho o nhan "9" nhung nhan "18".` | Ở `settings/members` có thêm tệp mới (`cho-phep-dia-chi.tsx`, `chuyen-okr-dialog.tsx`, `chuyen-viec-dialog.tsx`, `phat-chia-dialog.tsx`, `ten-mien-noi-bo.tsx`), nên bảng khai và số neo của lát cũ lệch. |
| `cai-dat-con-lai-noi-tieng-viet` | E6 | a2 | `DO: khong ai khop bo loc thanh vien — … man khong hien cau rong "Không ai khớp với bộ lọc này."` | Khi đang lọc, `DataTable` nay hiện câu rỗng-vì-lọc dùng chung, kèm nút «Bỏ lọc» (fb486420a, bcad1554d). Người dùng vẫn đọc được một câu tiếng Việt. Thước ghim chữ riêng cũ `t.bang.trong`. |
| `cai-dat-con-lai-noi-tieng-viet` | E8 | a2 | `THUA MOT GIA TRI: man that co "Closed won" ma bang khong khai` (20 giá trị) · `MIEN TRU CHET: "Names and email addresses, so it can match a Slack account to a CRM record."` | 16 giá trị là dữ liệu người nhập hoặc dữ liệu gieo: tên giai đoạn, nhãn trường tự tạo, «Zalo», tên miền. Theo luật kho, dữ liệu người nhập không dịch. «Kết nối» và «Điểm nhận dữ liệu» là chữ Việt mới, chưa có trong bảng khai. Câu phạm vi Slack đổi chữ («record in OneHub Center»), nên dòng miễn cũ chết. «breadcrumb» là nhãn trợ năng tiếng Anh của `packages/ui/src/components/breadcrumb.tsx:11`. Nhãn này có ở Cài đặt › Kết nối từ 25/09 (6695c57b0), trước mốc của lượt, nên không phải hồi quy. Xem mục «Đáng ghi tồn đọng». |
| `cai-dat-con-lai-noi-tieng-viet` | E10 | a2 | `KHONG DO DUOC: chua pha gi ma 1 chan da khong xanh: moi-chuoi(1).` | Chiều đỏ không chạy được vì chân `moi-chuoi` (E15) đã đỏ trước. Nguyên nhân là E15. |
| `cai-dat-con-lai-noi-tieng-viet` | E13 | a2 | `TRAN CA HAI LUOT: "Chọn — một trong danh sách cố định" — vi 165/70px · en 144/70px` · `vi tran ma en vua=0` | Lời hứa «tiếng Việt không tràn hơn tiếng Anh» vẫn giữ (`vi tran ma en vua=0`). Sáu ô ở `/settings/fields` khổ 360 tràn ở cả hai ngôn ngữ. Màn đó không đổi từ 22/09 (57619889e). Đây là giới hạn bố cục có sẵn, không phải hồi quy của lượt gộp. |
| `cai-dat-con-lai-noi-tieng-viet` | E14 | a3 | `KHONG DO DUOC: khong noi duoc http://localhost:3000 dang phuc vu cay nao.` | Thước này đột biến cây tại chỗ rồi đọc màn ở cổng 3000. Cây kiểm chéo không có máy chủ ở 3000. |
| `cai-dat-con-lai-noi-tieng-viet` | E15 | a2 | `DO: 8 chuoi con la tieng Anh.` (`"px-3 py-2.5 align-middle"`, `"khung-1"`, `[thuoc:aria-haspopup] "dialog"`, `[thuoc:layout] "content"`, `"ten-mien-noi-bo"`) | Cả tám là chuỗi kỹ thuật: lớp CSS, khoá nội bộ, giá trị thuộc tính ARIA. Chúng nằm trong tệp mới, thước nhận nhầm là chữ người đọc. |
| `cap-nhat-tuan-okr` | E7 | a3 | `HONG: E13 buoc 5: URL record=objective:cmv1lcrpq0010u0tyw3pgbdco, thay null` | Lần chạy lại xanh (`→ exit 0 (93.5s)`), và log tổng kết ghi `chập chờn: 1`. Thước đọc URL ngay khi ngăn mục tiêu hiện, chưa chờ `nuqs` ghi tham số `record`. `useOpenRecord` vẫn ghi `record` (`record-stack.ts`, `SEARCH_PARAM.record.stack = "record"`). |
| `chan-lai-component-ra-man` | E1, E2, E7 | a2 | `DO: neo mac_dinh ghim 129 nhung do duoc 131` · `nhom chu-nguoi-doc: 0` | Có hai component mới mang giá trị mặc định là chuỗi, cả hai thuộc nhóm kỹ thuật. Nhóm chữ người đọc vẫn là 0, nên không có chữ mặc định mới hiện ra màn. |
| `chan-trung-khoa-ban-nhap` | E3, E4 | a1 | `error: Cannot find module './okr-muc-tieu' from '…/sao-xanh-28675/okr-cuoc-soan.ts'` | `pha-thu.mjs` chép riêng `okr-cuoc-soan.ts` vào bản sao. Tệp đó nay nhập `./okr-muc-tieu`, mà tệp này không được chép theo. |
| `chu-cuoi-cung-tien-de` | E5 | a1 | `diff 058bb75f...HEAD: 8438 tep, ngoai pham vi: 1928` | Thước so phạm vi với gốc cố định `058bb75f` của vòng cũ, nên từ khi gộp đã kéo theo cả kho. |
| `chu-mac-dinh-thu-vien-ngoai` | E3, E4 | a2 | `LECH: component — do duoc 111, neo ghim 76` · `THIEU: markdown-reader.tsx … radio-group.tsx … trinh-soan.tsx` | Số neo và bảng bọc thư viện ghim lúc ký. `packages/ui` có thêm component sau đó (vd `radio-group` cài theo bậc 2 của `docs/design.md`). |
| `cron-theo-ban-khai` | E8 | a3 | `MA 2: khong doc duoc danh sach ban trien khai — HTTP 403` | Lời gọi Vercel API trả 403 (xem `docs/production.md`, mục Vercel MCP 403). |

## Việc kế cho các thước (không làm ở hàng này)

Hàng này không sửa gì; mỗi thước ở trên là việc của chính hồ sơ của nó. Luật 53 đã chuyển F24 (sửa thước chết) sang `hoan-sau-21-10.json`.

Đề nghị giám sát thêm vào `ton_dong`:
- **a1:** `bo-dung-khong-ket` E9, `ca-chap-chon-con-lai` E6, `chu-cuoi-cung-tien-de` E5. Neo «vòng này» theo cặp sha gộp thay vì `merge-base`.
- **a1:** `ca-chap-chon-cach-ly` E5/E7 — đổi mốc đột biến sang `khoi-dong.ts` mới. `chan-trung-khoa-ban-nhap` E3/E4 — chép thêm `okr-muc-tieu.ts` vào bản sao.
- **a2:** `cai-dat-con-lai-noi-tieng-viet` — dựng lại lát cho `settings/members`. Thêm miễn cho «Chung», dữ liệu người nhập, chuỗi kỹ thuật. Cập nhật câu Slack. Bỏ route `/settings/notifications`.
- **a2:** `chan-lai-component-ra-man`, `chu-mac-dinh-thu-vien-ngoai`, `bo-dung-chung-nhan-chuoi`, `bo-xuong-kara` — ghim lại số neo, hoặc đổi thước sang đếm theo nghĩa.
- **a3:** `cap-nhat-tuan-okr` E13 bước 5 — chờ tham số `record` thay vì đọc ngay. `cai-dat-con-lai-noi-tieng-viet` E14 — chạy qua phiên đo (`tien-de.mjs --chay`) như các răng màn khác.
- **Lượt kiểm chéo sau:** giữ lại nhật ký trọn của bài đỏ ngoài cây kiểm chéo, trước khi gỡ cây. Lần này chúng mất, nên bảng chỉ dựa trên đoạn trích.

### Đáng ghi tồn đọng (không phải hồi quy, nhưng người dùng có gặp)

- Nhãn trợ năng `aria-label="breadcrumb"` của `packages/ui/src/components/breadcrumb.tsx:11` là tiếng Anh. Người dùng trình đọc màn hình nghe chữ này ở mọi trang có breadcrumb, kể cả giao diện tiếng Việt.
- Ở `/settings/fields` khổ 360, mô tả kiểu trường («Chọn — một trong danh sách cố định», «Người — một người trong không gian làm việc») tràn ô 70px ở cả hai ngôn ngữ.

Cả hai có từ trước mốc `10f2c7fb`. Theo luật 53 (chỉ mở hàng cho lỗi người dùng thật báo hoặc việc chặn 14/10), chúng vào `ton_dong`, không mở hàng.

## Ví dụ đã biết cho loại (b): bom giờ H5

- **Gì:** `apps/agent/test/zalo-qua-webhook.integration.spec.ts:31` ghim cứng `const GOC = new Date("2026-10-10T02:00:00Z");`, mã sống 15 phút (commit 2b0f15b45 ngày 24/09).
- **Dòng log (S4 vòng 1 của `hoan-tac-loat-dung-id`, 10/10 02:30Z):** `agent:test: (fail) giao-khi-mo > giao-khi-mo: vong tay bat duoc tin den o giay 30` và `agent:test: (fail) kenh-route > kenh-route: kenh mount dung mot route POST /zalo/webhook va route do chay`.
- **Vì sao là (b):** từ 02:15Z hai bài đỏ tất định trên mọi cây. `pre-push` của mọi làn và CI của onehub bị chặn. Đây là hồi quy của bộ kiểm chặn đường giao hàng, không phải thước của một hồ sơ.
- **Xử lý:** mở hàng H5 `zalo-bom-gio` (ưu tiên 0, ngoại lệ luật 53), gộp ở #351 → onehub `fbad5961a`.
