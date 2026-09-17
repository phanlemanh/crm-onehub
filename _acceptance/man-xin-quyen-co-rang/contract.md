---
schema_version: 1
feature: Màn xin quyền có răng — /grant-access được đo trên trình duyệt thật, không chỉ bằng quét cú pháp
slug: man-xin-quyen-co-rang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-17
design_doc: docs/superpowers/specs/2026-09-16-man-xin-quyen-co-rang-design.md
amended_at: 2026-09-17
amended_by: Phan Le Manh
amended_reason: "S4 vong 1: thu AC-9 — go nua san thiet ke. Nguoi cham thu BON duong chay san tren man nay va chung minh ca bon cho so 0 rong nghia (che do tinh khong thay duoc tuong phan tinh ra; che do DOM qua jsdom khong tinh noi color-mix/oklch/@layer/@container cua tep kieu). Do la lo nang luc cong cu, khong phai san pham hong. Nua be rong muoi lam khang dinh GIU NGUYEN, khong thu hep."
---

# Acceptance Contract: man-xin-quyen-co-rang

## Context

Hợp đồng `cua-vao-noi-tieng-viet` mở phạm vi sang màn thứ tư `/grant-access` ở
vòng 1 ngày 04/09. Lớp nguồn theo kịp — `rang/lat.mjs` quét đệ quy cả thư mục
nên AC-11 và AC-12 của hồ sơ đó đã gom màn này. Lớp chạy không theo kịp, và hợp
đồng gốc khai thẳng điều đó ở AC-8 và AC-10: màn thứ tư nằm ngoài mọi phép đo
trình duyệt, chỉ được bảo chứng bởi quét cú pháp.

Màn này thoát được phép đo vì nó không mở bằng một đường dẫn: `page.tsx` đòi một
phiên VÀ một tài khoản liên kết đang thiếu quyền hộp thư, không thì chuyển hướng
về `/`. Ba màn kia mở bằng cookie phiên trần nên có thước từ đầu.

Hồ sơ này trả đúng lỗ đó, và trả luôn mục nợ nặng về câu lỗi đăng xuất.

## Criteria

- AC-1: Given một người đọc tiếng Việt có tài khoản liên kết thiếu quyền cả hai nhà cung cấp, When `/grant-access` dựng xong ở trạng thái nghỉ trên máy chủ thật, Then mọi chuỗi người-đọc-thấy của thân màn — tiêu đề màn, mô tả, câu riêng tư, chữ trên nút cấp quyền, chữ trên nút đăng xuất — hiện bằng tiếng Việt có dấu; và cùng màn ở tiếng Anh hiện bản tiếng Anh đã ghim. Với TỪNG ô trong năm ô đó, khẳng định QUAN HỆ ba vế: chuỗi lượt `vi` KHÁC chuỗi lượt `en`, VÀ chuỗi lượt `vi` mang dấu tiếng Việt, VÀ chuỗi lượt `en` đúng bản tiếng Anh đã ghim. Số ô đo được phải BẰNG năm.
- AC-2: Given ba nhánh nội dung mà `mailboxGrantsNeeded` sinh ra — chỉ Google, chỉ Microsoft, cả hai — When phép đo gieo HAI trạng thái khác nhau và dựng màn thật cho từng trạng thái, Then với nhánh `[google]` câu mô tả dựng ra BẰNG câu của khoá `google` và KHÁC câu của khoá `both`; và với nhánh hai nhà cung cấp, câu dựng ra BẰNG câu của khoá `both`. Hai khẳng định đó đo trên MÀN THẬT, không đọc kho chuỗi. Nhánh chỉ-Microsoft chỉ được đo ở lớp kho chuỗi — ba câu khác nhau từng đôi một — và phép đo phải IN RA giới hạn đó chứ không im. Một nhánh dựng ra câu của nhánh khác là tiêu chí đỏ và gọi tên cả hai nhánh.
- AC-3: Given tên nhà cung cấp chèn vào chữ trên nút, When màn dựng ở tiếng Việt, Then tên đó hiện nguyên văn giống hệt lượt tiếng Anh, VÀ phần tử chứa nó mang `translate="no"`. Thiếu thuộc tính đó là tiêu chí đỏ và in nguyên văn phần tử.
- AC-4: Given chữ trên nút cấp quyền ở nhánh một nhà cung cấp, When nút dựng ra, Then chuỗi đó được GHÉP ĐỘNG từ động từ đã dịch với tên nguyên văn — kho chuỗi không được chứa sẵn một câu tiếng Anh trọn vẹn có tên nhà cung cấp trong đó.
- AC-5: Given nút cấp quyền ở trạng thái đang cấp, When phép đo MỞ được trạng thái đó bằng cách chặn lượt gọi ra nhà cung cấp, Then chữ trên nút ở trạng thái đó hiện đúng tiếng của người đọc, và nút bị khoá. Phép đo phải mở được trạng thái này chứ không suy từ mã.
- AC-6: Given người đọc tiếng Việt gặp lỗi khi bấm nút cấp quyền, When client tự dựng câu báo lỗi dự phòng, Then câu đó hiện tiếng Việt có dấu và khác câu tiếng Anh tương ứng.
- AC-7: Given người đọc tiếng Việt bấm đăng xuất ở màn này và lượt đăng xuất THẤT BẠI, When client dựng câu báo lỗi, Then câu đó hiện tiếng Việt có dấu chứ không phải một câu tiếng Anh cứng. Đây là mục nợ nặng đã ghi ở `_acceptance/NO-CAN-TRA.md`.
- AC-8: Given `/grant-access` là màn mà AC-8 của hồ sơ gốc khai loại trừ đích danh, When một người đọc tiếng Việt mở nó, Then tiêu đề tài liệu hiện tiếng Việt; và ở tiếng Anh hiện tiếng Anh. Tiêu đề tĩnh không đổi theo tiếng là tiêu chí đỏ.
- AC-9: Given NĂM ô ghim của AC-1 — tiêu đề màn, mô tả màn, câu riêng tư, chữ trên nút cấp quyền, chữ trên nút đăng xuất — When màn dựng ở tiếng Việt trên ba khổ màn 768px, 1024px và 1280px, Then số khẳng định bề rộng phải BẰNG mười lăm (ba khổ nhân năm ô), mỗi ô một khẳng định trên mỗi khổ; và không ô nào có bề rộng chữ thật vượt bề rộng ô chứa nó. Số ô là hằng năm khai ở đây, KHÔNG suy từ số phần tử bộ chọn bắt được lúc chạy — bắt được bốn ô là TỪ CHỐI ĐO, thoát mã 2, gọi tên ô thiếu. Và phép đo giữ lại HAI khung hình của màn — một tiếng Việt, một tiếng Anh — mỗi khung tự khẳng định nó chụp đúng `/grant-access` với tiêu đề tài liệu khớp bản khai. Sàn thiết kế KHÔNG còn nằm trong tiêu chí này — xem Known limits.
- AC-10: Given phép đo phải gieo được trạng thái thiếu quyền trước khi đo, When bước gieo không dựng được trạng thái đó, hoặc màn chuyển hướng về `/`, Then phép đo TỪ CHỐI ĐO — thoát mã 2 và gọi tên trạng thái thiếu. Một lượt không vào được màn không bao giờ là một lượt đạt.

## Coverage

Quét hình thái chạy ở S1, preset test-matrix. Bốn trục:

- **A — lớp bằng chứng:** chuỗi hiện ra · dấu `translate="no"` · tiêu đề tài liệu · sàn thiết kế  [thước CE: 14 AC đã chứng của hồ sơ `cua-vao-noi-tieng-viet`]
- **B — nhánh nhà cung cấp:** chỉ Google · chỉ Microsoft · cả hai  [thước CE: `packages/auth/src/scopes.ts` — `mailboxGrantsNeeded` trả mảng; ba khoá `google`/`microsoft`/`both` trong `apps/app/lib/messages/auth.ts`]
- **C — trạng thái:** nghỉ · đang cấp · lỗi nhà cung cấp · lỗi đăng xuất  [thước CE: AC-5 và AC-14 của hồ sơ gốc, cộng mục nợ nặng ở `NO-CAN-TRA.md`]
- **D — thứ tiếng:** vi · en  [thước CE: AC-1 của hồ sơ gốc]

96 ô, cắt theo cặp như preset dặn khi vượt 50. **Core 10 ô → AC-1…AC-10.** Ba ô
không có tiền lệ ở hồ sơ gốc đều nằm trong Core và có tiêu chí riêng: ba nhánh
nhà cung cấp (AC-2), câu lỗi đăng xuất (AC-7), và chính tiền đề gieo (AC-10).

Bảng CE là 14 AC của hồ sơ gốc, hỏi từng cái. Bảy cái áp được, ánh xạ sang hồ
sơ này: gốc AC-1 → AC-1 · gốc AC-5 → AC-5 · gốc AC-6 → AC-3 · gốc AC-7 → AC-4 ·
gốc AC-8 → AC-8 · gốc AC-10 → AC-9 · gốc AC-14 → AC-6. Bốn cái không áp (gốc
AC-9, AC-11, AC-12, AC-13), lý do ở Out of scope. Ba cái còn lại (gốc AC-2,
AC-3, AC-4) thuộc màn khác, không phải màn này. Bảy cộng bốn cộng ba bằng
mười bốn.

Hai dòng chân ngành chờ người gạch tại Cổng 1:

- `[NGÀNH: HTML Living Standard]` — `translate="no"` là cách chuẩn đánh dấu chuỗi không được dịch máy.
- `[NGÀNH: Google OAuth 2.0 incremental authorization]` — màn xin quyền tăng dần là khuôn có tên, không phải phát minh của kho này.

## Out of scope

- **AC-9 của hồ sơ gốc (năm cách chọn tiếng).** Đã đo ở `/sign-in` qua máy chủ thật; cơ chế chọn tiếng dùng chung cho mọi màn. Đo lại ở đây là chép một phép đo đã có.
- **AC-11, AC-12, AC-13 của hồ sơ gốc.** Lớp nguồn (`lat.mjs` quét đệ quy), kho chuỗi (`satisfies`), và khung chung `AuthShell` ĐÃ phủ màn này. Thêm thước là hai thước cùng đo một lời hứa, và một trong hai sẽ mục mà không ai biết.
- **Rút danh sách đường của `cua-vao.mjs` thành bản khai chung.** Vá được cả hai mục nợ và chặn trôi về sau, nhưng chạm thước của hồ sơ khác và làm 12 eval của nó phải chạy lại. Ghi thành nợ có tên, xem Known limits.
- **Nhánh chỉ-Microsoft render thật.** Cần gieo tài khoản Microsoft riêng, và kho này chạy Google là nhà cung cấp chính. Vòng này đo nhánh đó ở lớp kho chuỗi (AC-2), chưa render. Nhánh chỉ-Google THÌ CÓ render thật — đừng đọc dòng này thành «mọi nhánh một-nhà-cung-cấp đều chưa đo».
- **Suspense fallback của màn.** `instant = false`, chưa biết có trạng thái tạm quan sát được không. Chưa đo.

## Known limits

- **Nợ «browser check vẫn đếm ba» KHÔNG được vá ở vòng này.** `rang/cua-vao.mjs` của hồ sơ `cua-vao-noi-tieng-viet` vẫn liệt kê ba đường ở ba chỗ. Hồ sơ này dựng thước RIÊNG cho màn thứ tư, nên `/grant-access` từ nay có phép đo trình duyệt — nhưng hợp đồng gốc vẫn tự mâu thuẫn với chính nó cho tới khi ai đó hợp nhất hai thước. Đây là đánh đổi cố ý để không làm cũ bằng chứng đã ghim của hồ sơ gốc.
- **Chỉ nhánh chỉ-Microsoft là chưa render thật** — xem Out of scope. Hai nhánh kia (chỉ-Google, cả-hai) đều dựng màn thật ở AC-2.
- **Sàn thiết kế KHÔNG chứng được P0 trên màn này, và vòng này thôi tuyên là chứng được.** Ở S4 vòng 1, người chấm thử bốn đường và chứng minh cả bốn đều cho số 0 rỗng nghĩa: (A) nạp thẳng hai ảnh PNG — bộ tĩnh đọc tệp như HTML nên khớp con số không; (B) chế độ tĩnh trên tệp nguồn — chính công cụ khai nó không thấy được tương phản tính ra, mà cả năm luật P0 đều là luật tính-kiểu; (C) chế độ DOM qua jsdom — tệp kiểu không nạp được, và trang không có một thẻ `style` nội tuyến nào nên mọi luật chạy trên markup trần; (D) như C nhưng đã vá đường tệp kiểu — kết quả giống hệt C từng byte, và soi tệp kiểu thấy nó dùng `color-mix()` 200 lần, `oklch(from currentColor …)`, `@layer` và `@container`, những thứ jsdom không tính nổi. Đây là lỗ năng lực công cụ, không phải sản phẩm hỏng: đọc mắt trên hai ảnh không thấy khuyết tật hạng P0 nào. Cái còn lại và CÓ đo được là hai khung hình tự khẳng định danh tính, và đó là thứ AC-9 hứa từ vòng này.
- **AC-9 bắt CẮT TRẦN, không bắt TRÀN DÒNG.** Phép đo so bề rộng chữ dựng thật với bề rộng trong của ô. Một cụm từ dài ở ô biết xuống dòng thì chữ xuống dòng chứ không bị cắt, nên phép đo không đỏ — đúng, vì đó không phải lỗi. Ca cắt trần thật là một từ liền không khoảng trắng (URL, từ ghép dài), và chiều đỏ dùng đúng ca đó. Hệ quả cần biết: nếu một ngày ô nào đó đổi sang không-xuống-dòng, phép đo này mới bắt được cụm từ dài ở ô ấy.
- **Vòng này không sinh hay đổi giao diện nào.** Không có nghi thức design-pass, không có section Đặc tả UX, không gọi kỹ năng chuẩn giao diện nội. Ba mục đó ghi trong `decisions.jsonl`.

## Notes

Thước mới `import` lại `may-chu.mjs` của hồ sơ `cua-vao-noi-tieng-viet`. Đó là
phụ thuộc cố ý: `chotMayChu()` chứa phép khẳng định máy chủ đang phục vụ ĐÚNG
cây này, và chép nó ra bản thứ hai là gieo đúng thứ bệnh mà hồ sơ này đang chữa.
