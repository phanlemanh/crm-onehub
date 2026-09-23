---
schema_version: 1
feature: Bộ dựng chung nhận chuỗi từ ngoài — một component hiện đúng tiếng người đọc mà chỗ gọi không phải truyền gì
slug: bo-dung-chung-nhan-chuoi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-01
signed_off_by: Manh Phan
signed_off_at: 2026-09-01
design_doc:
---

# Acceptance Contract: bo-dung-chung-nhan-chuoi

## Context

Đây là vòng ② trong năm vòng ở `_acceptance/tieng-viet-cho-crm/opportunity.md`.
Người đảo thứ tự ngày 2026-09-01 và đưa nó lên trước vòng ①.

Vòng ① dựng xong đường ngôn ngữ rồi dừng ở S4: hai phép đo trượt vì bảng dùng
chung khoá cứng chữ tiếng Anh và chém tiêu đề cột dài không dấu ba chấm. Chỗ gọi
không truyền vào được. Vòng này mở đường đó.

Bảng thứ tự cũ nói vòng ② ràng buộc vòng ③. Vòng chấm chứng minh nó ràng buộc cả
vòng ①.

Source input: `_acceptance/tieng-viet-cho-crm/opportunity.md` · giả định #3

## Hai loại chuỗi, và vòng này chỉ lấy một

Vòng này phân biệt hai loại chuỗi, và ranh giới đó là **toàn bộ phạm vi** của
vòng:

- **Khoá cứng (33 chuỗi)** — component tự chứa, chỗ gọi không có đường truyền
  vào. `Filters` ở `data-table.tsx:394` là loại này. **Vòng ② lấy hết.**
- **Mặc định đè được (20 chuỗi)** — component khai một giá trị dự phòng, chỗ gọi
  đè được và phần lớn đã đè rồi. `date-picker.tsx:22` khai `"Select a date"`,
  nhưng cả hai chỗ gọi đều truyền `"No date yet"` từ `apps/app`. **Vòng ② KHÔNG
  lấy.** Dịch một giá trị không màn nào vẽ ra là công vô ích, và chữ thật nằm ở
  `apps/app` — đó là vòng ③.

Hệ quả phải nói trước: **sau vòng ②, ô ngày vẫn đọc "No date yet" và ô gợi ý
công ty vẫn đọc "Search companies…".** Chúng đóng ở vòng ③, không ở đây.

## Criteria

- AC-1: Given nhân viên đang đọc tiếng Việt, When họ mở một màn có bảng dùng chung, Then mọi chuỗi bảng đang khoá cứng hiện tiếng Việt. Danh sách do phép đo bản vẽ liệt kê, không do hợp đồng liệt kê.
- AC-2: Given nhân viên đang đọc tiếng Việt, When họ mở một màn có BẤT KỲ component dùng chung nào khác, Then chữ khoá cứng của nó là tiếng Việt. Hợp đồng không kể tên component nào ở đây — máy quét kể, và AC-5 là chỗ đếm.
- AC-3: Given một component dùng chung dựng ở nơi KHÔNG có nhà cung cấp ngôn ngữ, When nó vẽ, Then nó hiện tiếng Anh và không lỗi nào nổ.
- AC-4: Given `packages/ui` sau vòng này, When tìm chỗ nó nhập từ `apps/app`, Then không có chỗ nào, và kiểu `Locale` chỉ còn MỘT định nghĩa trong cả kho.
- AC-5: Given mỗi component dùng chung được DỰNG THẬT hai lần, một lần tiếng Anh một lần tiếng Việt, When so chữ người đọc thấy trong hai bản vẽ, Then không chữ nào giống nhau ở cả hai — trừ danh sách trung tính khai trong hồ sơ (tên riêng, dữ liệu thử).
- AC-6: Given phép đo của AC-5, When trả TỪNG khoá của bảng dịch tiếng Việt về đúng chuỗi tiếng Anh của nó, một khoá một lượt, Then phép đo đỏ, và MỌI khoá nó không bắt được phải có tên cùng lý do trong hồ sơ.
- AC-7: Given một tiêu đề cột dài hơn bề rộng cột, When màn hiện ở 768px, Then chữ bị cắt mang dấu ba chấm, và tiêu đề đầy đủ nằm trong một thuộc tính trình đọc màn hình đọc được.
- AC-8: Given phân trang hiện tổng số dòng, When trang vẽ từ máy chủ rồi trình duyệt nhận, Then số hiện giống nhau ở hai bên và theo quy ước tiếng Việt.
- AC-9: Given nhân viên đổi tiếng, When màn vẽ lại, Then chữ trong bảng dùng chung đổi theo mà không cần tải lại trang, KỂ CẢ khi component không được máy chủ vẽ lại.
- AC-10: Given bảng dịch của vòng này đã chốt trong hồ sơ TRƯỚC khi chấm, When một nhân viên quan hệ đối tác đọc nó, Then chữ đọc như tiếng Việt của người trong nghề. Hội đồng chấm đúng bảng đã chốt, không chấm chữ chưa ai khai. (judgment)

## Coverage

Ba trục, quét theo lát cắt của trục "loại chữ".

- Trục **loại chữ**: chữ trên nút | chữ trong menu thả xuống | chữ khi rỗng | nhãn chỉ trình đọc màn hình nghe thấy | chuỗi ghép biến vào câu [thước CE: WCAG 2.2 SC 1.3.1 và SC 4.1.2 — nhãn cho trình đọc màn hình là chữ thật, `[NGÀNH: WCAG 2.2]`]
- Trục **chỗ gọi**: chỗ gọi đè được | chỗ gọi không đè được | dựng ngoài nhà cung cấp ngôn ngữ [thước CE: `[SUY-TỪ-REPO: AGENTS.md]` — luật "thứ người tự dựng máy chủ có thể thiếu thì phải im lặng bỏ khả năng, không được nổ"]
- Trục **thời điểm**: lượt vẽ đầu từ máy chủ | ngay sau khi người đổi tiếng, không tải lại trang [thước CE: `[SUY-TỪ-REPO: apps/app/components/app-header.tsx` gọi `router.refresh()`, nên chuỗi vẽ từ máy chủ đổi kể cả khi provider không phản ứng — trục này tồn tại để phân biệt hai thứ đó`]`]

Cross-cutting: chuỗi tiếng Việt dài hơn tiếng Anh 20–30% (AC-7), và chuỗi ghép
biến phải đảo được trật tự từ.

## Out of scope

- **Không chạm 20 chuỗi mặc định mà chỗ gọi đè được.** Lý do ở mục "Hai loại chuỗi". Đó là vòng ③.
- **Không chạm `packages/ui/src/components/ai-elements/**`.** Máy quét đếm riêng: 23 file, ~40 chuỗi. Bảng tác nhân, có tài liệu riêng `docs/agent-panel.md`, đi cùng vòng ⑤.
- **Không chạm `calendar.tsx`.** Tên thứ và tháng ở đó không phải chuỗi trong mã — chúng do `react-day-picker` sinh, qua một đối tượng `Locale` kiểu date-fns (`calendar.tsx:22,44,190`). Đổi chúng là chọn một nguồn dịch thứ hai, và dòng dưới cấm việc đó.
- **Không đổi `aria-label="Comp AI Logo"` trong `logo.tsx`.** Tên hãng cũ sót lại trong bản rẽ, không phải việc dịch. AC-5 trừ nó ra bằng câu chữ của chính nó.
- **Không thêm thư viện đa ngôn ngữ.** Ba mươi ba chuỗi không đủ căn cứ chọn; chọn bây giờ là chọn trước khi có bằng chứng của vòng ③. Khuôn vòng này phải để vòng ③ đổi nguồn chuỗi mà không đổi chỗ gọi.
- Không dịch nhãn của ứng dụng — vòng ③. Không dịch câu máy chủ trả về — vòng ④.
- Không thêm ngôn ngữ thứ ba.

## Notes

Hợp đồng viết TRƯỚC khi có mã.

**Con số ở đây do máy đếm, không do tay gõ.** Chạy
`bash _acceptance/bo-dung-chung-nhan-chuoi/rang-quet.sh --chan dem`.

| Máy quét trả | Số |
| --- | --- |
| File ở tầng đầu `packages/ui/src/components/` | 75 |
| File mang chữ người đọc thấy | 18 |
| Chuỗi tổng | 53 |
| **Khoá cứng — phạm vi vòng này** | **33** |
| Mặc định đè được — vòng ③ | 20 |
| Chỗ gọi `DataTable` | 6 |

**Thước tốt lên hai lần TRONG vòng, và con số theo đó đổi.** Lúc ký, thước nói
33 chuỗi khoá cứng. Trong lúc đi dây tôi tìm bằng tay hai chỗ nó không nhìn: một
chuỗi ghép biến kết thúc bằng dấu (`Search …`), và chuỗi trần nằm trong nhánh
của một biểu thức ba ngôi (`No results`, `Select row`, `Scroll to end`). Thước
được sửa từ **liệt kê chỗ được phép nhìn** sang **nhìn mọi chuỗi rồi trừ những
chỗ chắc chắn không ai đọc** — hướng an toàn hơn cho một phép đo dám nói "0".
Chạy lại thước mới trên mã trước vòng: **39 chuỗi khoá cứng, không phải 33.**
Con số ở bảng dưới là con số lúc ký; con số đúng là 39. Cả hai chim mồi mới đã
được gieo vào `--chan canary`, nên lỗ đó không mở lại được lặng lẽ.

**Vì sao có AC-6, một tiêu chí về chính cái thước.** Bản nháp trước của hợp đồng
này khai 9 file / 25 chuỗi. Số thật là 18 / 53, chưa kể `logo.tsx` — hụt hơn một nửa. Tôi đếm bằng
`grep` viết vội rồi gõ kết quả vào hợp đồng như một sự thật. Vòng ① hỏng theo
đúng lối đó, ở một danh sách ngoại lệ viết tay thiếu năm chuỗi. Hai lần cùng một
lối: **con số do máy sinh mà không ai kiểm cái máy.**

Nên vòng này không sửa bằng cách đếm cẩn thận hơn. Nó sửa bằng cách **bắt cái
thước phải chịu một phép đo**: trả TỪNG khoá của bảng dịch tiếng Việt về đúng
chuỗi tiếng Anh của nó, một khoá một lượt, rồi xem phép đo có đỏ không.

| Bộ kiểm | Bắt được |
| --- | --- |
| Trước đường B | 14 / 34 |
| Đường B, lúc vòng chấm 1 | 32 / 39 |
| Đường B, sau vòng chấm 2 | 44 / 45 |
| Sau vòng chấm 3 | 44 / 44 |
| Sau vòng chấm 4 | **43 / 43** |

**Con số 39/39 tôi công bố ở vòng chấm 1 là SAI, và sai theo đúng lối đã hỏng
hai lần trước.** Kịch bản quét của tôi thay chuỗi ở nửa sau của file — nửa không
chứa bảng tiếng Việt — nên gần hết đột biến là đột biến rỗng, và tôi không kiểm
rằng đột biến có thật sự đổi file. Bộ đo cũ `rang-quet.sh` đã có đúng phép kiểm
đó (`DIFF_N -ne 2` → "RĂNG CÙN: đột biến lệch 0 dòng"); tôi đánh rơi nó khi
chuyển sang đường B. Hai người chấm độc lập đo lại được 32/39.

**Hai lỗ vòng chấm 2 tìm ra trong chính phép đo, đã bịt.**

Phép đo so hai bản vẽ, nên nó chỉ bắt được chuỗi **giống hệt từng byte**. Dịch
một khoá thành một chuỗi tiếng Anh KHÁC — `sortBy: "Order by"` — thì hai tập chữ
khác nhau và nó xanh. Người chấm làm hai mươi khoá thành tiếng Anh trơn mà bộ
kiểm không đỏ một bài.

Và danh sách trung tính không ai canh: thêm một dòng vào đó là tắt vĩnh viễn một
chuỗi tiếng Anh, mà dòng đó nằm trong chính file phép đo.

Hai luật mới đóng cả hai:

- **Mỗi giá trị tiếng Việt phải mang ít nhất một dấu tiếng Việt.** `"Order by"`
  không có dấu nào nên nó đỏ, dù nó khác chuỗi gốc. Đúng một khoá được miễn —
  `pagination.next = "Sau"` — và danh sách miễn có phép đo đếm độ dài riêng.
- **Danh sách trung tính thôi viết tay.** Nó sinh ra từ một khối dữ liệu thử,
  và có hai phép đo: không mục nào được trùng một chuỗi của giao diện, và số mục
  chỉ đổi khi có người thêm dữ liệu thử.

**Sau vòng chấm 3, không khoá nào lọt.** Danh sách miễn dấu tiếng Việt cũng rỗng
— khoá cuối cùng trong đó, `pagination.next = "Sau"`, đổi thành "Tiếp" theo hội
đồng, nên luật "mọi giá trị mang dấu tiếng Việt" nay không có ngoại lệ nào.

**Nhà cung cấp ngôn ngữ ở gói nào, và vì sao (AC-4).** `apps/app` phụ thuộc
`@crm/ui`; chiều ngược lại không tồn tại. Nên `packages/ui` không dùng được
`useLocale` mà vòng ① dựng ở `apps/app/lib/locale/`. Vòng này chuyển gốc ngôn
ngữ **vào `packages/ui`**, và `apps/app` dùng lại từ đó. Kho hiện có hai định
nghĩa trùng của cùng một kiểu — `apps/app/lib/locale/locale.ts` (`Locale`) và
`packages/ui/src/lib/format.ts` (`FormatLocale`), cả hai là `"vi" | "en"`. AC-4
đo rằng sau vòng này chỉ còn một.

**Chỗ đặt file, và vì sao không tự do chọn.** `.oxlintrc.json` bỏ qua
`packages/ui/src/components/**` nhưng **có soi** `packages/ui/src/lib/**` — cùng
một bảng chuỗi đặt ở hai nơi cho hai kết quả `lint:slop` khác nhau. Và bản đồ
`exports` của gói mở `./lib/*` sang `.ts`, `./components/*` sang `.tsx`, nên một
nhà cung cấp có JSX **không đặt được** trong `lib/`.

**AC-8 đến từ một lỗi có sẵn.** `table-pagination.tsx:9` khai
`new Intl.NumberFormat()` — không vùng, ở tầng module, tạo một lần. Máy chủ Node
in `1,234`, trình duyệt tiếng Việt in `1.234`. Đó là lệch hydrat, có từ trước
vòng này, và nó nằm đúng trong file vòng này sửa. Chân `dinh-dang` của vòng ①
không bắt được vì nó chỉ quét `Intl.*("en-US"`, mà đây là ngoặc rỗng.

**AC-9 và cái bẫy xanh rỗng.** `app-header.tsx:129` đã gọi `router.refresh()`
khi người đổi tiếng, nên chuỗi vẽ từ máy chủ đổi theo **kể cả khi nhà cung cấp
mới không làm gì**. Phép đo của AC-9 phải dựng một component KHÔNG được máy chủ
vẽ lại; nếu không nó xanh mà chẳng chứng minh gì.

**Năm trong ba mươi ba chuỗi nằm sau menu thả xuống.** `Sort by` · `Ascending`
· `Descending` · `Toggle columns` · `Detail` sống trong `DropdownMenu`
(`data-table.tsx:501,525,528,550`). Báo cáo bằng chứng vòng ① ghi rằng menu đó
không mở được trong Chrome không giao diện. Phép đo cho chúng phải là bài kiểm
dựng component, không phải ảnh chụp — và `packages/ui` **chưa có lệnh `test`**
(xem Issues), nên dựng giàn kiểm là việc đầu tiên của vòng, không phải việc cuối.

**Phí bản rẽ.** 17 trong 18 file sắp sửa là file của hãng. Khuôn phải là thứ gửi
ngược lên hãng được: một component nhận chuỗi qua nhà cung cấp và có sẵn mặc
định tiếng Anh chạy y nguyên trong kho của hãng, nơi không ai dựng nhà cung cấp
đó. AC-3 là phép đo của chính điều này.

**Chuỗi ghép biến, năm chỗ.** `data-table.tsx:172,203,357,703` và
`table-pagination.tsx:38`. Tiếng Việt đảo trật tự từ, nên bảng tra phẳng
`Record<khoá, chuỗi>` không tả nổi chúng. Vòng ① đã có khuôn đúng ở
`apps/app/lib/messages/companies.ts:31` — `showing` là một **hàm**
`(from,to,total) => string`. Vòng này dùng lại dạng đó.

**Đã đọc trước khi viết:** `AGENTS.md`, `docs/design.md`, `CONTEXT.md`,
`.oxlintrc.json`, `packages/ui/package.json`,
`_acceptance/tieng-viet-cho-crm/{opportunity,contract,decisions}.md`, và ba bản
phản biện ngữ cảnh sạch chạy 2026-09-01.
