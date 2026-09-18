---
schema_version: 1
feature: Hồ sơ khai đúng tiếng — giá trị tiếng Anh do máy ghi tự khai lang="en" trên tấm hồ sơ công ty và cá nhân
slug: ho-so-khai-dung-tieng
owner: manh@mstar.vn
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-19
amended_at: 2026-09-19
amended_reason: "AC-7 (b)(c) — MetaLine.parts thoi nhan chuoi tran, moi phan tu la mot the khai lang hay khong. Loi hua khong doi; hinh dang doi vi lint:slop cua kho cam typeof de phan nhanh union"
design_doc: docs/superpowers/specs/2026-09-18-ho-so-khai-dung-tieng-design.md
---

# Acceptance Contract: ho-so-khai-dung-tieng

## Context

Lỗ quan sát trên bản chạy thật `www.onehub.center` ngày 2026-09-18 tại
`ff3fb8bf`: trên tấm hồ sơ công ty, tab Tổng quan, đoạn giới thiệu tiếng Anh nằm
trong `<p>` không có `lang`, tổ tiên gần nhất khai `lang="vi"`. Trình đọc màn
hình đặt tiếng Việt đọc cả đoạn bằng bộ phát âm tiếng Việt.

Hồ sơ `nhan-ung-dung-noi-tieng-viet` đã hứa đúng điều này (AC-7, AC-14), đã đo,
đã đóng xanh. Chân đo của nó (`rang/khai-tieng.mjs`) mở đúng hai màn danh sách —
`xem("companies", …)` và `xem("deals", …)` — và **chưa bao giờ mở tấm hồ sơ**.
Hồ sơ đó đã đóng và lỗ đã ghi vào sổ quyết định của nó; **vòng này không mở lại
nó**, đây là hợp đồng riêng.

Chuẩn ngành: WCAG 2.2 SC 3.1.2 *Language of Parts*, Mức AA. Bản liệt kê ngoại lệ
của nó — *proper names, technical terms, words of indeterminate language* — là
căn cứ cho mọi chỗ loại trừ dưới đây.

Source input: quan sát bản chạy thật 18/09 · `docs/superpowers/specs/2026-09-18-ho-so-khai-dung-tieng-design.md`

## Criteria

- AC-1: Given nhân viên đang đọc tiếng Việt mở hồ sơ một công ty đã có đoạn giới thiệu từ enrichment, When tab Tổng quan vẽ, Then đoạn giới thiệu đó nằm trong một phần tử tự khai `lang="en"`; phép đo đọc giá trị giới thiệu từ máy chủ trong chính lượt chạy đó rồi tìm nó trên màn, chứ không tìm một chuỗi gõ sẵn.
- AC-2: Given nhân viên đang đọc tiếng Việt mở hồ sơ một cá nhân đã có tóm tắt do tác nhân sinh, When phần Bối cảnh vẽ, Then đoạn tóm tắt đó nằm trong một phần tử tự khai `lang="en"`.
- AC-3: Given nhân viên đang đọc tiếng Việt mở hồ sơ một công ty có trường ngành, When dòng meta dưới tiêu đề vẽ, Then giá trị ngành nằm trong một phần tử tự khai `lang="en"`, và phép đo gọi tên giá trị ngành nó đã tìm.
- AC-4: Given một thoả thuận đã đổi giai đoạn ít nhất một lần, When dòng thời gian trong hồ sơ vẽ mục đổi giai đoạn đó, Then cả nhãn giai đoạn cũ lẫn nhãn giai đoạn mới đều nằm trong phần tử tự khai `lang="en"`; phép đo gọi tên cả hai nhãn.
- AC-5: Given cùng tấm hồ sơ ở AC-1..AC-4, When màn vẽ, Then tên công ty, địa danh, và giá trị của ô người nhập được (chức danh cá nhân) **KHÔNG** nằm trong phần tử khai `lang="en"`; phép đo gọi tên từng giá trị nó đã kiểm và trả về 0 chỗ khai thừa. Đây là chiều chống-khai-thừa: thiếu nó thì "khai tất cả mọi thứ" cũng qua được AC-1..AC-4.
- AC-6: Given bản kiểm kê **chín** chỗ khai tiếng ghim ở mục "Chín chỗ" dưới đây, When phép đo đọc cây mã `apps/app`, Then nó tìm thấy **đúng chín** chỗ, gọi tên từng chỗ theo `file:dòng`, và cả chín đều đi qua `ForeignText` nhập từ `@crm/ui`; số khẳng định BẰNG chín, là hằng ghim trong tệp thước chứ không đếm được bao nhiêu khẳng định bấy nhiêu. Và: 0 chỗ nào trong `apps/app` còn mang `attribute` `lang` viết tay trên thẻ JSX ở chỗ gọi, xét MỌI tên thẻ (`span`, `p`, `div`, …) và MỌI dạng giá trị (chuỗi hằng lẫn biểu thức).
- AC-7: Given `ForeignText` và `MetaLine` sau vòng này, When bài kiểm vẽ chúng ra DOM thật, Then ba chiều cùng đạt trong CÙNG một bài kiểm: (a) `ForeignText` sinh `attribute` `lang` đúng giá trị được truyền, `"en"` ra `"en"` và `"vi"` ra `"vi"`; (b) một phần tử `parts` của `MetaLine` **không khai** `lang` thì sinh `<span>` **không mang** `attribute` `lang`, trong khi phần tử có khai thì sinh `<span lang>` đúng giá trị — không được khai hộ; (c) `MetaLine` nhận hai phần tử **mang cùng một chữ**, một có khai `lang` và một không, thì sinh ra **đúng một** phần tử mang chữ đó — khử trùng lặp chạy trên `text`, không trên phần tử thô.
- AC-8: Given một công ty chưa enrichment xong (không có giới thiệu, không có ngành), When hồ sơ vẽ, Then khối Giới thiệu không vẽ và không sinh phần tử rỗng nào khai `lang="en"`; bố cục phần còn lại giữ nguyên.
- AC-9: Given tấm hồ sơ sau vòng này, When trang vẽ, Then phần tử gốc vẫn khai `lang="vi"` và không phần tử tổ tiên nào của nội dung tiếng Việt bị đổi tiếng; phép đo khẳng định `document.documentElement.lang === "vi"` trước khi tin bất kỳ con số nào khác.
- AC-11: Given năm chỗ khai tiếng đã đúng từ trước vòng này — ngành ở bảng danh sách công ty, nhãn giai đoạn ở biểu đồ bảng điều khiển, và ba chỗ giai đoạn thoả thuận — When chúng đã chuyển sang `ForeignText`, Then chân đo NGUYÊN TRẠNG của vòng trước (`_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs`, cả hai chân `khai-tieng` và `giai-doan`) vẫn xanh và vẫn gọi tên từng giá trị nó tìm thấy. Chạy lại một cái thước cũ KHÔNG phải mở lại hợp đồng cũ: thước là vật, hợp đồng là lời hứa, và vòng này chỉ mượn vật.

- AC-10: Given bản tiếng Việt của tấm hồ sơ sau vòng này, When một nhân viên quan hệ đối tác dùng trình đọc màn hình đặt tiếng Việt nghe hết tab Tổng quan, Then các đoạn tiếng Anh được đọc bằng giọng tiếng Anh và các đoạn tiếng Việt vẫn bằng giọng tiếng Việt — không đoạn nào bị đọc sai giọng. (judgment)

## Chín chỗ

Bản kiểm kê ghim TRƯỚC khi chạm mã. AC-6 đếm đúng chín, và AC-6 đọc con số chín
từ chính mục này chứ không từ module bị đo.

Bốn chỗ **mới** trên tấm hồ sơ — hôm nay chưa khai:

1. `apps/app/components/crm/record-sheet/company-sheet.tsx:349` — giới thiệu công ty
2. `apps/app/components/crm/record-sheet/contact-sheet.tsx:487` — tóm tắt cá nhân
3. `apps/app/components/crm/record-sheet/record-parts.tsx` — ngành, nơi `MetaLine` vẽ phần tử ra (chỗ gọi khai `lang` là `company-sheet.tsx:248`)
4. `apps/app/components/crm/timeline/timeline-entry.tsx:82` — hai nhãn giai đoạn

Năm chỗ **cũ** đang khai đúng bằng `<span lang="en">` viết tay — chuyển cơ chế,
giữ nguyên lời hứa:

5. `apps/app/app/(app)/[slug]/companies/companies-table.tsx:90` — ngành, bảng danh sách
6. `apps/app/app/(app)/[slug]/sales-dashboard.tsx:202` — nhãn giai đoạn ở biểu đồ
7. `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx:198` — giai đoạn
8. `apps/app/components/crm/stage-stepper.tsx:65` — giai đoạn
9. `apps/app/components/crm/deal-stage.tsx:14` — giai đoạn

**Chín chỗ = chín TỆP mang phần tử khai tiếng, không phải chín phần tử.** Dòng
thời gian mang HAI phần tử trong một tệp (hai nhãn giai đoạn), và ngành được khai
ở `company-sheet` nhưng vẽ ra ở `record-parts`. Mục 3 sửa ngày 19/09 vì bản ký
ghi `company-sheet` hai lần và bỏ sót `record-parts` — đếm theo tệp thì danh
sách đúng là chín, đếm theo phần tử thì là mười.

**Ba chỗ chân đo KHÔNG được tính là chỗ viết tay**, vì chúng không khai tiếng cho
một phần nội dung: `<html lang>` ở `apps/app/app/layout.tsx` là tiếng của
chính trang; chuỗi `document.documentElement.lang=` trong script cùng tệp đặt
đúng cái đó; và `data-lang` ở `local-date-time.tsx` là thuộc tính dữ liệu, chỉ
trùng chữ. Chân đo nào bắt ba chỗ này là chân đo đỏ vĩnh viễn.

Số dòng là số dòng lúc ký, sẽ trôi khi mã đổi; **đường dẫn và mô tả là thứ ghim**,
không phải con số dòng. Chỗ thứ mười xuất hiện thì AC-6 đỏ và gọi tên nó — đó là
điều cần, không phải phiền toái.

## Coverage

Quét bằng skill `morphological-scan`, preset ma-trận-kiểm. Ba trục, 100 ô, quét
theo lát cắt của trục **B (nơi hiện ra)** — đúng trục mà chân đo vòng trước
không có một giá trị nào.

- Trục **nguồn giá trị**: văn xuôi máy sinh | tập enum tiếng Anh cố định | phân loại ngoài | danh từ riêng máy ghi | người nhập được [thước CE: `[NGÀNH: WCAG 2.2 SC 3.1.2]` — bản liệt kê ngoại lệ của chuẩn chia đúng năm giá trị này thành hai nhóm: ba giá trị đầu phải khai, hai giá trị cuối rơi vào ngoại lệ *proper names* và *words of indeterminate language*]
- Trục **nơi hiện ra trên hồ sơ**: dòng meta dưới tiêu đề | khối văn xuôi thân hồ sơ | hàng trường ở cột phải | dòng thời gian | bề mặt ẩn (tab khác, menu, hộp thoại) [thước CE: `[SUY-TỪ-REPO: _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs]` — chân đo đó chỉ gọi `xem("companies")` và `xem("deals")`, tức **không giá trị nào** của trục này từng được mở. Đây là lỗi thật, nội bộ, hai tuần tuổi]
- Trục **cách dựng phần tử**: viết tay tại chỗ gọi | qua component dùng chung | ghép trong template literal | truyền chuỗi vào prop của component chung [thước CE: `[SUY-TỪ-REPO: apps/app/components/crm/timeline/timeline-entry.tsx:82 · apps/app/components/crm/record-sheet/record-parts.tsx:151]` — hai giá trị cuối là hai chỗ *không có phần tử DOM nào* để mang `attribute`, nên vô hình với mọi máy quét chuỗi]

Cross-cutting áp mọi ô Core:

- `translate="no"` và `lang="en"` không thay được nhau — một nói với máy dịch,
  một nói với trình đọc màn hình. Phân theo *nguồn giá trị*, không theo cảm
  giác → AC-5.
- Mỗi phép đo mới khai cặp hai chiều trên cùng một vật, chiều đỏ có thông điệp
  ghim → AC-5, AC-7.
- Trường rỗng không sinh phần tử rỗng khai tiếng → AC-8.
- Tiếng của trang không đổi → AC-9.

Ô cắt sang Later, có tên để khỏi bàn lại: bề mặt ẩn của hồ sơ (tab Agent, menu
hành động, hộp thoại) · hồ sơ thoả thuận (`stage-stepper` và
`DealStageIndicator` đã khai đúng) · hàng trường ở cột phải của hồ sơ (các
`InlineField` hiện tại đều là ô người nhập được, rơi vào ngoại lệ).

## Out of scope

- **Bề mặt ẩn của hồ sơ.** Vòng này quét bề mặt thấy được khi mở hồ sơ và cuộn. Tab Agent, menu hành động, hộp thoại xác nhận là một lát riêng — trộn vào đây là trộn hai loại rủi ro.
- **Hồ sơ thoả thuận.** Giai đoạn ở đó đi qua `stage-stepper` và `DealStageIndicator`, cả hai đã khai đúng từ vòng trước; mô tả thoả thuận là ô người nhập được.
- **Không mở rộng tập giá trị được khai ở màn danh sách và bảng điều khiển.** Năm chỗ viết tay ở đó chuyển sang `ForeignText` (đổi cơ chế, giữ nguyên lời hứa), nhưng vòng này không đi tìm giá trị mới để khai ở những màn đó.
- **Không khai `lang` cho ô người nhập được.** `contact.title` là `InlineField` nhân viên gõ được. Khai cứng `lang="en"` lên đó là khai SAI: ai đó gõ "Giám đốc kinh doanh" thì trình đọc màn hình đọc tiếng Việt bằng bộ phát âm tiếng Anh — đúng cái lỗi đang vá, chỉ ngược chiều. Chuẩn gọi tên ca này: *words of indeterminate language*.
- **Không khai `lang` cho danh từ riêng.** Tên công ty và địa danh rơi vào ngoại lệ *proper names* của SC 3.1.2, và đã có `translate="no"`.
- **Không dịch giá trị từ cơ sở dữ liệu sang tiếng Việt.** `CONTEXT.md` khai bảy giai đoạn thoả thuận là CHƯA CHỐT NGHĨA.
- **Không thêm thư viện đa ngôn ngữ.**
- **Không mở lại hồ sơ `nhan-ung-dung-noi-tieng-viet`.**

## Notes

Hợp đồng viết TRƯỚC khi có mã.

**Vì sao AC-5 tồn tại dù nó không sửa gì.** AC-1..AC-4 đều là khẳng định *có
mặt*. Một bản cài đặt bọc `lang="en"` quanh toàn bộ tấm hồ sơ sẽ qua hết bốn
tiêu chí đó và làm tình hình tệ hơn hiện trạng. AC-5 là chiều duy nhất phân biệt
"khai đúng chỗ" với "khai bừa".

**Vì sao AC-6 đo cái cơ chế chứ không đo màn hình.** Lời hứa của vòng này không
phải "bốn chỗ này đã khai" mà là "chỗ gọi thứ sáu không quên được nữa". Lời hứa
sau chỉ đo được khi có một vật CÓ TÊN để đếm. Đổi lại, AC-6 kéo diff ra ngoài
tấm hồ sơ: năm chỗ viết tay hiện có phải chuyển sang `ForeignText`. Việc chuyển
là cơ học và không đổi DOM sinh ra, nhưng nó chạm 5 file ngoài phạm vi màn, và
người duyệt thấy dòng này trên thẻ Cổng 1.

**AC-7 (b)(c) sửa câu chữ sau khi ký — 2026-09-19.** Bản ký viết "phần tử kiểu
chuỗi trần"; mã không đi được đường đó. Bộ `lint:slop` của kho cấm dùng `typeof`
để phân nhánh (luật "phân tích ở biên, đừng truyền hình dạng chưa phân tích"), mà
một union `string | MetaPart` thì buộc phải `typeof` ở mọi chỗ dùng. Nên
`parts` nay nhận MỘT hình dạng duy nhất, `{ text, lang? }`, và chỗ gọi khai rõ
từng phần. **Lời hứa không đổi một chữ nào**: phần tử không khai tiếng thì không
được khai hộ, và khử trùng lặp vẫn chạy trên chữ. Thực ra hình dạng mới CHẶT hơn —
"phần này tiếng gì" thành một quyết định nhìn thấy được ở mọi chỗ gọi thay vì một
mặc định vô hình. Đổi lại: hai chỗ gọi `MetaLine` phải sửa hình dạng, gồm cả chỗ
ở hồ sơ cá nhân mà bản ký nói là "không phải sửa một chữ nào".

**Vì sao AC-7 đo hai chiều trong một bài kiểm.** `MetaLine.parts` đổi kiểu để
mang được ngôn ngữ theo từng phần. Một bản cài đặt lười có thể khai `lang` cho
MỌI phần tử — bài kiểm một chiều sẽ xanh. Chiều thứ hai (chuỗi trần KHÔNG sinh
`lang`) là thứ giữ cho hồ sơ cá nhân không bị khai sai, vì chỗ gọi ở đó truyền
`[contact.title, contact.company?.name]` và **không phải sửa một chữ nào**.

**Chân đo phải mở tấm hồ sơ.** Đây là điều kiện tiền đề, không phải chi tiết kỹ
thuật. Chân đo vòng trước xanh suốt một vòng đã ký vì nó đo đúng thứ nó mở. Phép
đo của vòng này phải in ra tên màn nó đã mở, và phải chứng minh được chiều đỏ
**trên chính tấm hồ sơ đó** — không phải trên màn danh sách.

**Khoảng trống dữ liệu thử đã biết trước.** AC-4 cần một thoả thuận đã đổi giai
đoạn ít nhất một lần, AC-2 cần một cá nhân đã có tóm tắt tác nhân, AC-8 cần một
công ty chưa enrichment xong. Vòng trước đã vấp đúng lớp này (máy chủ trả 0 trên
15 công ty thiếu người phụ trách). Dữ liệu thử phải dựng TRƯỚC khi tin bất kỳ
con số nào; tập rỗng là KHÔNG ĐO ĐƯỢC, không phải ĐẠT.

**Đối trọng chuẩn giao diện không có luật nào cho việc này.**
`_acceptance/config.yaml` khai `feature_loop.ui_standards_skill:
web-design-guidelines`, và bản luật ngoại nó trỏ tới (Vercel Web Interface
Guidelines) **không có một luật nào về `lang`** — nó chỉ có luật `translate="no"`,
thứ kho đã theo ở khoảng 60 chỗ. `.agents/skills/better-accessibility/` của kho
cũng không có. Cả hai chuẩn cùng mù đúng chỗ này; đó là lý do cơ chế trôi mà
không lưới nào đỡ. Chuẩn dùng cho vòng này lấy thẳng từ WCAG 2.2 SC 3.1.2.

**Đã đọc trước khi viết:** `AGENTS.md` (mục "UI in `apps/app` or
`packages/ui`" của bảng chỉ mục) · `CLAUDE.md` · `docs/design.md` ·
`.agents/skills/better-accessibility/` · `.agents/skills/web-design-guidelines/` ·
hồ sơ `nhan-ung-dung-noi-tieng-viet` (contract + `rang/khai-tieng.mjs`) ·
`packages/ui/test/lai-ra-man.spec.tsx` · `apps/app/test/messages-guard.spec.ts`.
