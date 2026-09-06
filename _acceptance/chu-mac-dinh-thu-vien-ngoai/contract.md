---
schema_version: 1
feature: Chữ mặc định của thư viện ngoài — dựng thước cho lớp chữ mà mọi bộ quét tĩnh đều mù, rồi vá cái nó tìm ra
slug: chu-mac-dinh-thu-vien-ngoai
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-06
design_doc: docs/superpowers/specs/2026-09-06-chu-mac-dinh-thu-vien-ngoai-design.md
---

# Acceptance Contract: chu-mac-dinh-thu-vien-ngoai

## Context

Lớp lỗi này lộ ra ở Cổng 2 vòng `cua-so-tro-chuyen-noi-tieng-viet`: nhãn
`aria-label="Messages"` là tiếng Anh và **không file nguồn nào của kho chứa nó** —
mặc định của `@shadcn/react/message-scroller`. Bốn vòng Việt hoá với năm bộ quét
tĩnh đều mù; chỉ một chân đo màn thật mới thấy.

Đo ngày 06/09: `packages/ui` có **76 component `.tsx`**, **37** vẽ ra một nguyên bản của thư
viện ngoài, **16** đọc kho chuỗi dùng chung sau khi vòng này vá `sonner` — nên **29 component bọc
thư viện mà không đọc kho chuỗi nào**. Trên năm màn quét được có 60 chuỗi tiếng Anh nhìn thấy
được, **4 chuỗi không có trong file nguồn nào**, trong đó **một cái là thật**:
nhãn vùng thông báo của `sonner`.

Vòng này **không phải** dịch một đống chữ. Nó dựng thước cho lớp lỗi, rồi vá đúng
số ít thước tìm ra.

## Criteria

- AC-1: Given bảng đóng ghim `(màn, số chuỗi nhìn thấy được tối thiểu)` neo từ số đo ngày 06/09, và **tập loại trừ ghim tên** cho phép thử nguồn — `node_modules` · `.next` · `dist` · `build` · file sinh tự động — When phép đo dựng từng màn trên máy chủ thật và gom mọi chuỗi NHÌN THẤY ĐƯỢC cộng bốn thuộc tính trợ năng `aria-label` · `title` · `placeholder` · `alt`, Then **số màn dựng được BẰNG số dòng bản khai** và số chuỗi mỗi màn KHÔNG THẤP HƠN neo của màn đó — lệch là thoát mã 2 gọi tên màn kèm hai con số; và chân phải IN số file đã quét khi hỏi nguồn. Với mỗi chuỗi, phép đo hỏi `apps/` và `packages/` **trừ tập loại trừ** có file nguồn nào chứa nó không; chuỗi KHÔNG có trong file nguồn nào mà cũng KHÔNG nằm trong bảng đóng **năm** lý do là ĐỎ gọi tên `màn:thuộc tính:nguyên văn`. Năm lý do: chỉ có ở bản dev · dữ liệu người dùng · định danh kỹ thuật · nội dung do model sinh · **sinh từ kho chuỗi qua hàm ghép hoặc phép định dạng** — dòng thuộc lý do thứ năm phải TRỎ một khoá CÓ THẬT trong kho chuỗi, khoá chết là ĐỎ gọi tên khoá.
- AC-1b: Given bảng đóng bốn lý do của AC-1, When phép đo chạy, Then mỗi dòng khai phải còn ĐỐI TƯỢNG THẬT — chuỗi khai trong bảng mà không màn nào vẽ ra là ĐỎ gọi tên dòng chết. Bảng rỗng là thoát mã 2.
- AC-2: Given ba con số đo từ đĩa và ghim làm neo — **76 component `.tsx` trong `packages/ui` · 37 bọc thư viện ngoài · 16 đọc kho chuỗi dùng chung**, When chân đo dựng lại ba danh sách từ đĩa, Then ba con số BẰNG neo; lệch là thoát mã 2 kèm diff tên file. Danh sách «bọc thư viện» sinh từ CÂY: một định danh nhập từ gói ngoài và được VẼ RA như một thẻ JSX — không gõ tay tên gói, và cũng không nhận mọi lệnh nhập (bộ tạo lớp CSS và bộ biểu tượng được gọi chứ không vẽ ra thì không tính là bọc).
- AC-3: Given **29 component bọc thư viện mà không đọc kho chuỗi**, kê thành bảng đóng ghim `(component, nguyên bản nó bọc)`, When phép đo đối chiếu với đĩa, Then mỗi dòng phải trỏ một component CÓ THẬT còn bọc đúng nguyên bản đã khai — trỏ vào component không còn bọc thư viện nào là ĐỎ gọi tên cả hai; và số dòng bảng BẰNG số component bọc-mà-không-đọc mà chân đếm ra, lệch là thoát mã 2 in cả hai danh sách.
- AC-4: Given nhãn vùng thông báo của `sonner` hiện ra tiếng Anh (`Notifications alt+T`), When vòng này đóng, Then nhãn đó đọc từ kho chuỗi dùng chung; **và bản khai màn phải chứa ít nhất một màn có dựng vùng thông báo**, còn phép đo phải IN RA nhãn nó đọc được ở trạng thái xanh — một khẳng định âm tính («không còn bắt được») một mình không phân biệt được «đã vá» với «chưa bao giờ nhìn tới». Chiều đỏ nằm trong bộ đột biến chứ không nằm trong văn xuôi: hình dạng *gỡ phép ghi đè nhãn vùng thông báo* phải có một vết, và chân bắt phải in thông điệp chứa NGUYÊN VĂN `Notifications`.
- AC-5: Given kho chuỗi dùng chung `packages/ui/src/lib/messages.ts`, When vòng này thêm khoá, Then trọn bộ canh kho chuỗi vẫn xanh: mọi giá trị `vi` có dấu trừ dòng khai có tên, không giá trị nào y hệt `en`, mọi hàm ghép biến có khẳng định ghim, không khoá chết.
- AC-6: Given bộ đột biến, When cắm một vết cho TỪNG hình dạng có đối tượng ở vòng này (chuỗi lạ trên màn · dòng khai chết · bản khai component lệch), Then bảng ĐÓNG ghim `(hình dạng, chân chuyên trách)` — mỗi vết phải bị đúng chân chuyên trách bắt với mã 1; mã 2 in riêng và KHÔNG tính là bắt được; cây lành thì mọi chân xanh; `git status` trước và sau bằng nhau. Hình dạng không có đối tượng phải khai ra thay vì bịa vết.
- AC-7: Given thư mục `rang/` của vòng này và của năm vòng trước, When so sánh, Then không thân hàm hay thân mô-đun nào trùng từ 12 dòng trở lên — dùng lại thước qua ổ cắm, KHÔNG chép; trùng là ĐỎ kèm tên hai file.
- AC-8: Given phép đo trên màn chỉ thấy thứ ĐANG HIỆN, và phần lớn 29 component chưa đọc kho là loại chỉ hiện sau khi bấm, When vòng này đóng, Then giới hạn đó phải được KHAI thành một bảng có tên — mỗi dòng là một component chỉ-hiện-sau-khi-bấm, kèm nguyên bản nó bọc — và bảng đó chịu chiều đỏ: dòng khai trỏ một component KHÔNG bọc thư viện nào là ĐỎ. **Và bảng phải ĐỦ, đo bằng số**: số dòng BẰNG số component bọc-thư-viện-mà-không-đọc-kho thuộc loại chỉ-hiện-sau-khi-bấm mà chân đếm được TỪ ĐĨA — lệch là thoát mã 2 in cả hai danh sách. Mỗi dòng phải chứng loại «chỉ hiện sau khi bấm» bằng một dấu hiệu ĐỌC ĐƯỢC TỪ MÃ (component bọc một nguyên bản có trạng thái mở/đóng), không bằng lời khai. Tuyệt đối không được để giới hạn này chỉ sống trong văn xuôi, và cũng không được để một bảng khai một dòng đi qua như một bảng đã kê hết.
- AC-9 (judgment): Given các chuỗi vòng này ghi đè, When người đọc như người quản trị OneHub, Then chúng đọc như tiếng Việt của người làm nghề: danh từ theo `CONTEXT.md`, thuật ngữ kỹ thuật giữ tên thật.

## Coverage

Quét bằng `morphological-scan`, preset test-matrix. Ba trục, thước CE là lỗ vừa
đo được thật ở Cổng 2 vòng trước cộng bốn vòng Việt hoá đã ký. Chân ngành vào làm
ứng viên: `[NGÀNH: pseudo-localization]` · `[NGÀNH: W3C i18n]` · `[NGÀNH: Radix UI]`.

- **Trục A — chữ đến từ đâu:** file nguồn của kho | mặc định thư viện ngoài | model sinh | người nhập. [thước CE: giá trị thứ hai là lỗ vừa đo được; ba giá trị kia đã có phép đo ở bốn vòng đã ký] → AC-1, AC-1b, AC-2, AC-3
- **Trục B — chữ nấp ở đâu trên màn:** nội dung phần tử | thuộc tính trợ năng | thông báo sống | nội dung giả. [thước CE: cả hai ca thật đã bắt được đều nằm ở `aria-label`; hai giá trị cuối CHƯA từng đo ở kho này] → AC-1
- **Trục C — điều kiện hiện ra:** có ngay khi mở màn | chỉ hiện sau khi bấm | nhất thời. [thước CE: 20 component chưa đọc kho phần lớn là loại bấm-mới-hiện — đây là trục quyết định độ phủ thật] → AC-3, AC-8
- **Cross-cutting:** dân số sinh từ đĩa và từ màn · cặp hai chiều cho mỗi phép đo mới · mọi dòng khai có đối tượng thật · không chép thước · mọi phép đo trả tập rỗng phải thoát mã 2 → AC-6, AC-7

Ô Core: 4 trên không gian 48 ô. Ô Later: nội dung giả `::before`/`::after` · thông
báo sống `aria-live` · lái từng component bấm-mới-hiện ra màn. Ô Never: dịch tại
chỗ trong `node_modules` · quét theo danh sách tên thư viện gõ tay.

## Out of scope

- **Dịch nốt 90 khoá của kho chuỗi dùng chung** — chúng đã có bản `vi`.
- **Hai lỗ đã có định đoạt mở-hợp-đồng-mới ở vòng trước** — gốc gom chữ của bộ thước màn, và trạng thái tác nhân vẽ ra tiếng Anh.
- **Nâng cấp thư viện để lấy bản có i18n** — đổi phụ thuộc, không phải việc của một vòng đổi chữ.
- **Lái từng component bấm-mới-hiện ra màn** — cần một chân lái riêng; vòng này khai giới hạn thay vì làm.

## Notes

### Known limits

- **known-limit (Ngoài-1, người chốt ở Cổng 2, 06/09):** bộ chấm bản vẽ của `packages/ui` đòi một ca cho mỗi component đọc bảng dịch — `packages/ui/test/render-diff.spec.tsx`. Ràng buộc ấy đúng và vòng này đã thoả (thêm ca cho `sonner`), nhưng nó chưa từng được nêu trong hợp đồng nào. Ghi lại để vòng sau biết trước: thêm một chỗ đọc kho chuỗi thì kéo theo một ca vẽ.
- **Phép thử nguồn có tập loại trừ ghim tên.** `node_modules` · `.next` · `dist` · `build`. Ở kho này `bun` gom `node_modules` lên gốc nên `apps/*/node_modules` gần như rỗng (4 file `.ts` ngày 06/09) — phép đo *tình cờ* đúng nếu không loại trừ, và đó là một sự may chứ không phải một bảo đảm. Ghim tập loại trừ để nó thôi phụ thuộc vào cách trình quản lý gói xếp thư mục.
- **Phép đo trên màn chỉ thấy thứ ĐANG HIỆN.** Component chỉ hiện sau khi bấm nằm ngoài tầm nó. Phép đo ở mức mã biết component ấy chưa đọc kho, nhưng KHÔNG biết nguyên bản có sinh chữ hay không. Hai phép đo cộng lại không thay được một chân lái; AC-8 bắt khai giới hạn này thành bảng có chiều đỏ chứ không để nó sống trong văn xuôi.
- **`grep` trong `apps/` và `packages/` là phép thử "chữ này có phải của kho không".** Nó nhận nhầm theo hướng an toàn: một chuỗi thư viện TÌNH CỜ trùng với một chuỗi trong mã của kho sẽ lọt. Đổi lại, nó không cần biết trước tên gói nào — và danh sách tên gói mới là thứ chắc chắn sẽ trôi.
