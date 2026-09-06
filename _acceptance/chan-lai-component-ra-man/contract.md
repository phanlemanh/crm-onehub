---
schema_version: 1
feature: Chân lái từng component ra màn — đo lớp chữ tiếng Anh nằm ở giá trị mặc định của tham số, và giải toả bảng mười dòng của vòng trước bằng đo thay vì khai
slug: chan-lai-component-ra-man
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by: Manh Phan
approved_at: 2026-09-06
design_doc: docs/superpowers/specs/2026-09-06-chan-lai-component-ra-man-design.md
---

# Acceptance Contract: chan-lai-component-ra-man

## Bối cảnh

Định đoạt **Ngoài-2 (P1)** người chốt ở Cổng 2 ngày 06/09 của hồ sơ
`chu-mac-dinh-thu-vien-ngoai`: bốn màn trong bản khai không với tới mười component
chỉ hiện sau khi bấm; vòng ấy khai giới hạn thành bảng đếm được, và người quyết
**khai không thay được đo**.

Phép đo thử ngày 06/09 (mount chín trên mười ở trạng thái MỞ) trả lời câu hỏi ấy và
đồng thời mở ra một lớp khác — chi tiết ở design doc.

## Acceptance Criteria

### AC-1 — Dân số sinh từ đĩa, không gõ tay

**Given** cây nguồn của kho
**When** chân dân số chạy
**Then** nó tự đi cây `packages/ui/src` · `apps/app/components` · `apps/app/lib` ·
`apps/app/app`, loại trừ tập ghim tên (`node_modules` · `.next` · `dist` · `build`),
và in ra các con số neo: **389 file** `.ts`/`.tsx` · **119 giá trị mặc định là chuỗi
có chữ cái** · **10 dòng** trong bảng giới hạn của vòng trước · số phần tử của TỪNG
nhóm sau khi phân (chữ-người-đọc và kỹ thuật), không chỉ tổng.
**Đỏ khi** một neo lệch — kể cả lệch vì kho đổi thật.

Neo **10** là neo ĐỘC LẬP, ghim ở đây chứ không rút từ chính
`gioi-han-bam-moi-hien.json`; nếu rút từ đó thì AC-4 sẽ tự so với chính mình.

### AC-2 — Ranh giới chữ-người-đọc / kỹ thuật do BẢN VẼ quyết, không do tên prop

**Given** 119 giá trị mặc định
**When** chân lái mount component sở hữu từng giá trị **ở CẢ HAI trạng thái** — đóng,
và mở với mọi component có trạng thái mở
**Then** giá trị nào **có mặt** trong tập chữ-người-đọc của một trong hai bản vẽ thì
xếp nhóm *chữ người đọc*; không có mặt ở bản nào thì xếp nhóm *kỹ thuật*. Tập
chữ-người-đọc dùng lại nguyên `DOC_NGHE_DUOC` của
`packages/ui/test/render-diff.spec.tsx` cộng text node.

**Ma trận tối thiểu, viết TRƯỚC khi chân chạy** — năm dòng này phải rơi vào nhóm
*chữ người đọc*, sai một dòng là đỏ:

| file | tham số | giá trị |
| --- | --- | --- |
| `combobox.tsx` | `placeholder` | `Select an option` |
| `combobox.tsx` | `empty` | `Nothing matches.` |
| `date-picker.tsx` | `placeholder` | `Select a date` |
| `command.tsx` | `title` | `Command Palette` |
| `async-action.tsx` | `errorLabel` | `Try again` |

**Đỏ khi** một trong năm dòng ấy rơi vào nhóm kỹ thuật — đó chính là ca hỏng mà phép
mount-một-trạng-thái sinh ra: component đóng thì vẽ rỗng, chuỗi không có mặt, và cả
hai bảng vẫn cộng đủ 119.

### AC-3 — Hai chiều của phép phân biệt, trên cùng một vật

**Given** một component có mặc định kỹ thuật (`variant = "ghost"`)
**When** đổi giá trị ấy thành một chuỗi thật sự vẽ ra màn trong bản sao
**Then** chân phải chuyển nó sang nhóm *chữ người đọc* và thoát mã 1, nêu đúng
`file:dòng`.
**Và ngược lại** trên vật lành thì nó ở nhóm kỹ thuật, chân thoát mã 0.

### AC-4 — Bảng mười dòng của vòng trước được giải toả bằng ĐO

**Given** `_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/gioi-han-bam-moi-hien.json`
**When** chân mở-nguyên-bản mount cả mười dòng ở trạng thái MỞ
**Then** với từng dòng nó in ra tập chữ nguyên bản tự sinh, khai rõ dòng nào rỗng dòng
nào có, và ghi kết quả ra tạo phẩm `evidence/mo-nguyen-ban.json`. Số dòng mount được
phải bằng **neo 10 của AC-1** — không phải bằng số dòng đọc từ chính file bảng.
**Đỏ khi** một dòng không mount được, hoặc số dòng đọc được lệch neo 10 (khi đó nêu
tên dòng đã mất).

### AC-5 — Bản khai của vòng trước đổi từ «chưa đo được» sang «đã đo»

**Given** bảng mười dòng ấy đang mang ghi chú *phép đo trên màn KHÔNG với tới*
**When** vòng này đo xong
**Then** ghi chú đổi thành kết quả đo có số, và chân đối chiếu ghi chú ấy với **tạo
phẩm `evidence/mo-nguyen-ban.json` do AC-4 sinh**, từng dòng một: tên dòng và trạng
thái rỗng-hay-có trong ghi chú phải khớp đúng đầu ra máy.
**Đỏ khi** một dòng lệch — nêu tên dòng lệch. **Mã 2 khi** vắng tạo phẩm; đối chiếu
với một tạo phẩm không tồn tại thì không được xanh.

Vế này có răng vì lời hứa của AC-5 là một QUAN HỆ (ghi chú khớp đầu ra), không phải
sự vắng mặt của một cụm chữ: gõ tay «9 trên 10 rỗng» trong khi máy đo 7 thì phải đỏ.

### AC-6 — Mọi mặc định chữ-người-đọc tìm ra đều có định đoạt

**Given** bảng nhóm *chữ người đọc* mà chân sinh ra
**When** vòng kết thúc
**Then** mỗi dòng ở một trong hai trạng thái: **đã vá** (đưa về kho chuỗi dùng chung
theo khuôn `useMessages()`) hoặc **đã khai** trong bảng hoãn có lý do đọc được.
**Đỏ khi** một dòng không ở trạng thái nào.

### AC-7 — Chuỗi đã vá thật sự đến màn bằng tiếng Việt

**Given** bảng nhóm *chữ người đọc* với các dòng ở trạng thái **đã vá**
**When** bộ ca chạy
**Then** **số ca bằng đúng số dòng «đã vá»**, con số lấy từ tạo phẩm của AC-6 chứ
không gõ tay; mỗi ca mount component ở trạng thái mặc định với `locale` là `vi` và
chuỗi vẽ ra là bản tiếng Việt, còn với `en` vẫn là bản tiếng Anh.
**Đỏ khi** bản vẽ còn chuỗi tiếng Anh cũ, hoặc số ca lệch số dòng đã vá — khi đó nêu
tên component thiếu ca. **Mã 2 khi** tập ca rỗng.

### AC-8 — Bộ canh kho chuỗi của `packages/ui` còn xanh

**Given** vòng này thêm khoá vào `packages/ui/src/lib/messages.ts`
**When** `bun test test/messages-guard.spec.ts` chạy trong `packages/ui`
**Then** mọi giá trị `vi` có dấu (trừ dòng khai trong `KHONG_DAU`), không giá trị nào
y hệt `en`, mọi hàm ghép biến có khẳng định `GHIM`, không khoá chết.
**Và** mọi component mới đọc kho chuỗi có một ca trong `render-diff.spec.tsx` — chính
là ràng buộc Ngoài-1 vòng trước đã ghi vào Known limits.

### AC-9 — Không chép thước

**Given** bộ thước dùng chung của bốn hồ sơ trước
**When** chân của vòng này chạy
**Then** chúng dùng lại qua ổ cắm và tham số, không chép thân hàm.
**Đỏ khi** một khối từ 12 dòng trở lên trùng với một chân đã có.

### AC-11 — Chân lái không được đọc một danh sách tên prop gõ tay

**Given** chân lái và các file nó nạp
**When** chân tự soi mình
**Then** không có hằng nào là danh sách chuỗi tên tham số dùng để phân nhóm — phân
nhóm phải đến từ bản vẽ, không từ tên.
**Đỏ khi** thêm một allowlist tên prop vào bản sao: chân phải thoát mã 1, nêu đúng
`file:dòng`. **Và ngược lại** trên vật lành thì mã 0.

Tiêu chí này tách riêng vì Ô Never của Coverage cấm đúng điều này, mà chân
`mot-bo-thuoc` (AC-9) đo việc khác hẳn — khối trùng từ 12 dòng. Một allowlist ngắn
lọt qua cả hai nếu không có chân riêng.

### AC-10 — Chữ Việt đọc được như tiếng người làm nghề (judgment)

**Given** các chuỗi vòng này ghi đè
**When** người đọc chúng trên màn
**Then** chúng theo `CONTEXT.md`, giữ nguyên tên thật của thuật ngữ kỹ thuật, không
còn dấu vết dịch máy.

## Coverage

Quét không gian bằng preset **test-matrix**. Chân sản phẩm: `CONTEXT.md` +
`docs/design.md` + năm hồ sơ Việt hoá đã ký `[SUY-TỪ-REPO: _acceptance/]`. Chân ngành:
`[NGÀNH: W3C i18n]` · `[NGÀNH: react-i18next default-value pattern]`.

- **Trục A — chữ nấp ở đâu trong mã:** nội dung thẻ JSX | thuộc tính JSX | **giá trị
  mặc định của tham số** | chuỗi do thư viện ngoài sinh. [thước CE: ba giá trị đầu đã
  có phép đo ở năm vòng đã ký; giá trị thứ ba là lỗ vừa đo được — 119 chỗ trên đĩa] →
  AC-1, AC-2, AC-3
- **Trục B — điều kiện hiện ra:** hiện ngay khi mount | **chỉ hiện khi người gọi bỏ
  trống prop** | chỉ hiện sau khi bấm | nhất thời. [thước CE: giá trị thứ hai là điều
  kiện sinh ra cả lớp lỗi này; giá trị thứ ba là bảng mười dòng vòng trước đã khai] →
  AC-2, AC-4
- **Trục C — chữ có đến được mắt người không:** thành text node | thành thuộc tính
  người-đọc | thành tên lớp CSS hay thuộc tính dữ liệu | không bao giờ vẽ. [thước CE:
  đây là trục PHÂN BIỆT, và phép đo để chính bản vẽ trả lời thay vì đoán theo tên] →
  AC-2, AC-3
- **Cross-cutting:** dân số sinh từ đĩa · cặp hai chiều cho mỗi phép đo mới · tập rỗng
  phải thoát mã 2 chứ không xanh · không chép thước → AC-1, AC-3, AC-9

Ô Core: 4 trên không gian 64 ô. Ô Later: chữ bị cắt/tràn khi có CSS thật · nội dung
giả trong CSS · thông báo sống `aria-live`. Ô Never: dịch tại chỗ trong `node_modules`
· phân nhóm theo danh sách tên prop gõ tay.

## Out of scope

- **Lái component ra trình duyệt thật.** DOM giả đủ trả lời câu hỏi «chuỗi này có đến
  mắt người không». Đổi lại, thứ chỉ sai khi có CSS thật nằm ngoài tầm.
- **Dịch nốt các chuỗi tiếng Anh khác của `packages/ui`.** Vòng này chỉ vá lớp nó tìm
  ra.
- **Nội dung giả trong CSS và thông báo sống `aria-live`** — vẫn hoãn như vòng trước.
- **Nâng cấp thư viện để lấy bản có i18n** — đổi phụ thuộc, không phải việc của một
  vòng đổi chữ.

## Notes

### Known limits

- **Chín trên mười nguyên bản của bảng vòng trước không mang chữ.** Đã đo ngày 06/09.
  Nghĩa là bảng ấy, dù khai đúng là *chưa đo*, hoá ra phần lớn rỗng — công của vòng
  này ở lớp mặc-định-tham-số nhiều hơn ở mười dòng đó.
