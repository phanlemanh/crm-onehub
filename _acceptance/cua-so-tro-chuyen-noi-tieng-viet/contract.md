---
schema_version: 1
feature: Cửa sổ trò chuyện của lát dựng tác nhân nói tiếng Việt — đợt hai, và tháo ba mối nối với hồ sơ đợt một đã ký
slug: cua-so-tro-chuyen-noi-tieng-viet
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-09-06-cua-so-tro-chuyen-noi-tieng-viet-design.md
---

# Acceptance Contract: cua-so-tro-chuyen-noi-tieng-viet

## Context

Lát thứ năm của chuỗi Việt hoá, và là đợt HAI của lát dựng tác nhân.

Dân số đo bằng máy ngày 06/09: **276 chuỗi tiếng Anh trên 6 file** —
`agent-builder-chat` 113 · `agent-composer` 65 · `agent-history` 45 ·
`share-chat-dialog` 26 · `chat-chips` 15 · `delete-chat-action` 12. Tách thành
**183 văn bản + 93 thuộc tính**, cộng **14 lời gọi toast** và **0 ô tiêu đề tài
liệu**. Thư mục có 21 file `.tsx`; 15 file kia đã dịch ở đợt một.

Đợt một để lại ba mối nối có răng: sáu file này đang khai `hoan` trong bản khai
của nó, khối `ngoai_lat` của nó khai 8 chuỗi sinh từ `agent-composer.tsx`, và năm
con số neo của nó phải còn đúng sau vòng này. Vòng này tháo cả ba mà không mở lại
hợp đồng đã ký.

Gieo vật đo đã CHỨNG trong lúc thiết kế: một lời gọi `conversations.createBuilder`
dựng được `/chat/[chatId]`, và `conversations.remove` dọn sạch.

## Criteria

- AC-1: Given MỌI chuỗi trong 6 file của lát — dân số SINH TỪ ĐĨA, không gõ tay — When bộ quét lấy hết rồi trừ theo luật có tên với hai danh sách tách biệt (thuộc tính JSX / khoá object), Then 0 chuỗi người đọc thấy còn tiếng Anh, in `file:dòng:bối cảnh:nguyên văn` khi đỏ; 0 chuỗi quét ra là thoát mã 2; mỗi dòng giữ-nguyên phải còn đối tượng thật — dòng chết là ĐỎ.
- AC-1b: Given dân số 6 file sinh từ đĩa, When bộ quét đọc cây cú pháp, Then 0 chuỗi người đọc thấy viết thẳng trong JSX ngoài các dòng miễn trừ có tên; mỗi dòng miễn trừ phải còn đối tượng thật.
- AC-2: Given kiểm kê đếm **93 chuỗi nằm trong thuộc tính JSX**, When phép đo đọc cây cú pháp, Then danh sách tên thuộc tính SINH TỪ CÂY rồi TRỪ theo danh sách kỹ thuật khai có tên; một tên thuộc tính mang chữ người đọc mà không nằm trong danh sách và cũng không đọc từ kho chuỗi là ĐỎ gọi tên `file:dòng:tên-thuộc-tính`. Mỗi dòng kỹ thuật phải còn đối tượng thật — dòng chết là ĐỎ.
- AC-3: Given **14 lời gọi toast** của lát, kê thành bảng đóng ghim `(file, khoá kho chuỗi)`, When phép đo đối chiếu, Then bảng khớp mã theo CẢ HAI CHIỀU — thiếu hay thừa một mục đều thoát mã 2 in cả hai danh sách.
- AC-4: Given lát này KHÔNG sở hữu `page.tsx` nào nên phép đo tiêu đề tài liệu **KHÔNG CÓ ĐỐI TƯỢNG**, When bộ đo chạy, Then nó phải THOÁT MÃ 2 gọi tên «không có đối tượng», tuyệt đối KHÔNG được trả xanh trên tập rỗng; và bản khai phải nói ra điều đó. **Và phải có ĐỐI CHỨNG DƯƠNG trong cùng một lượt**: chạy chính chân tiêu đề ấy lần thứ hai trên một thư mục CÓ `page.tsx` mang tiêu đề thật, khai tên trong bảng đóng, và đòi mã 0 kèm số đếm lớn hơn 0. Thiếu vế thứ hai là thoát mã 2 — vì một chân chết vì lý do khác (đổi tên, đổi giao diện dòng lệnh, sai tham số) cũng thoát mã 2, và khi đó vế thứ nhất một mình sẽ xanh trong khi không đo gì. Thông điệp «không có đối tượng» phải ghim NGUYÊN VĂN, không chỉ ghim mã thoát.
- AC-5 (cross-layer): Given hai route của cửa sổ trò chuyện — `/chat` và `/chat/[chatId]` — và một hội thoại GIEO qua `conversations.createBuilder`, When phép đo dựng trên máy chủ thật hai lượt `vi`/`en`, Then trên từng route: số chuỗi hai lượt BẰNG nhau; mỗi cặp cùng vị trí KHÁC nhau trừ bảng không-dịch AC-7; mọi chuỗi lượt `vi` mang dấu trừ dòng `mien_dau` khai có tên. **Vật gieo do MỘT chân gieo-và-dọn riêng dựng, chạy TRƯỚC mọi chân màn**, và nó ghi định danh hội thoại ra một tạo phẩm bằng chứng có tên; mọi chân màn ĐỌC định danh đó và thoát mã 2 nếu vắng — tuyệt đối không chân nào tự gieo. Tổng số lời gọi `createBuilder` trong một lượt verify phải BẰNG MỘT và con số đó phải in ra bằng chứng; lớn hơn một là ĐỎ. Vật gieo phải được dọn **kể cả khi đo hỏng**, và lệnh dọn thất bại là thoát mã 2. Tập rỗng trên một route là thoát mã 2. **Tiền kiểm chạy TRƯỚC mọi chân màn**: khẳng định máy chủ API trả lời, cơ sở dữ liệu đo đọc được, và một phiên đăng nhập đang sống — hỏng vế nào là thoát mã 2 GỌI TÊN nguyên nhân, không bỏ qua lặng. Vì một lượt đo rỗng về tới cổng ký sẽ không đỏ mà TRỐNG, và người duyệt không thấy màu đỏ nào để dừng lại.
- AC-6: Given ba trạng thái nhất thời của ô soạn — đang gửi · đã gửi · gửi hỏng — kê thành bảng đóng trỏ ĐƯỜNG vào kho chuỗi (không gõ tay chữ mong đợi), When phép đo chạy, Then đường chết là thoát mã 2; ô khai *dựng được* mà chữ không vẽ ra là ĐỎ; ô khai *không dựng được* mà chữ VẼ RA là ĐỎ. Ít nhất MỘT ô phải dựng được; không ô nào dựng được là thoát mã 2.
- AC-7: Given các giá trị KHÔNG được dịch — tên thương hiệu, định danh kỹ thuật, dữ liệu người nhập, **và nội dung do tác nhân sinh ra** — kê thành bảng đóng, When màn dựng hai lượt tiếng, Then mỗi giá trị được so **theo VỊ TRÍ trong cây DOM**: chỗ nào lượt `vi` vẽ ra giá trị đó thì lượt `en` ở đúng vị trí ấy phải vẽ ra Y HỆT — khác nhau là ĐỎ gọi tên route, vị trí và chuỗi bên kia. Dòng khai mà không vị trí nào vẽ ra là thoát mã 2, trừ dòng khai rõ đối tượng nằm ngoài màn đo được kèm lý do. Không vị trí nào đối chiếu được là thoát mã 2.
- AC-7b: Given dữ liệu người nhập hiện trên các màn này — tiêu đề hội thoại, nội dung người gõ, tên tệp đính kèm — kê thành bảng đóng ghim `(file, biểu thức)`, When phép đo đọc CÂY CÚ PHÁP, Then phần tử JSX bọc đúng biểu thức đó mang `translate="no"`; thiếu thuộc tính là ĐỎ gọi tên `file:dòng` và thẻ; biểu thức không còn trong file là thoát mã 2. Bảng rỗng là thoát mã 2.
- AC-8: Given bản `vi` dài hơn bản `en`, When hai route dựng được của lát dựng ở 360px hai lượt, Then với mọi phần tử NHÌN THẤY ĐƯỢC mang nhãn dịch được, `scrollWidth ≤ clientWidth`; lượt `en` là đối chứng dương. **Chiều đỏ phải neo vào đúng thứ phép đo xuôi nhìn thấy**: khoá mốc được cắm phải GHIM TÊN trong bản khai, và phải nằm trong tập phần tử mà phép đo xuôi đếm được trên một route CÓ TÊN — khoá mốc không nằm trong tập đó là thoát mã 2 gọi tên khoá, KHÔNG phải xanh và cũng không phải đỏ. Nằm trong tập rồi mà cắm nhãn dài vẫn không tràn thì mới là thước mù, và đó là ĐỎ. Phép đo xuôi phải in số phần tử nhìn thấy được mang nhãn dịch được cho TỪNG route; 0 là thoát mã 2.
- AC-9: Given hai bản khai lát chạm nhau, When bộ đo đọc cả hai, Then mỗi dòng loại trừ khai `chuyen_giao: "<slug>"` phải trỏ một hồ sơ CÓ THẬT mà bản khai của nó THẬT SỰ chứa file đó — trỏ vào hồ sơ không tồn tại, hoặc vào hồ sơ không quét file đó, đều là ĐỎ gọi tên cả hai bên. Và sau vòng này **năm con số neo của hồ sơ đợt một phải còn ĐÚNG** (26 file trên đĩa · 20 file quét · 237 chuỗi · 180 văn bản · 57 thuộc tính) cùng ràng buộc *số dòng `khong_quet` bằng sáu* — lệch một con số là ĐỎ. **Và năm con số đó phải ĐO LẠI TRÊN ĐĨA**, đúng như lát này tự đo: chạy chân khai sinh của hồ sơ đợt một và đòi ba nguồn đếm độc lập bằng nhau rồi mới bằng số neo. So bản khai với hằng số gõ tay trong hợp đồng là điều kiện THÊM, không thay thế — chỉ so hai chuỗi ký tự do người viết là thoát mã 2. **Và neo của CHÍNH lát này**: ba nguồn đếm độc lập phải bằng nhau và bằng năm con số đo ngày 06/09 — **21 file trên đĩa · 6 file quét · 276 chuỗi ứng viên · 183 văn bản · 93 thuộc tính**; lệch là thoát mã 2 kèm diff tên file. Thí nghiệm thả một file `.tsx` mang chữ tiếng Anh vào thư mục lát phải chạy NỀN trước, và chân trả mã 2 khi có vết là *chưa đo được*, không tính là đã bắt.
- AC-10: Given khối `ngoai_lat` của hồ sơ đợt một khai 8 chuỗi sinh từ `agent-composer.tsx` như *giới hạn đã khai*, When vòng này đóng, Then khối đó phải **HIỆN DIỆN-và-rỗng** trong bản khai đợt một (vắng mặt hẳn là đường sạch-giả, và cũng là ĐỎ), và chân màn của đợt một phải chạy xanh với `ngoai lat=0` — tức màn `/chat` không còn lẫn hai thứ tiếng.
- AC-11: Given bộ đột biến, When cắm một vết cho TỪNG hình dạng của trục A có đối tượng ở lát này (văn bản JSX · thuộc tính · toast · khoá object · trạng thái trên màn · bàn giao), Then bảng ĐÓNG ghim `(hình dạng, chân chuyên trách)` — mỗi vết phải bị đúng CHÂN CHUYÊN TRÁCH bắt với mã 1, không nhận «một chân nào đó bắt được»; mã 2 in riêng và KHÔNG tính là bắt được; cây lành thì mọi chân xanh; `git status` trước và sau bằng nhau. Hình dạng không có đối tượng ở lát này phải khai ra thay vì bịa một vết giả.
- AC-12: Given thư mục `rang/` của lát này và của bốn lát trước, When so sánh, Then không thân hàm hay thân mô-đun nào trùng từ 12 dòng trở lên — lát này dùng lại thước qua `--lat` và ổ cắm, KHÔNG chép; trùng là ĐỎ kèm tên hai file. Và ba kho chuỗi mới qua trọn bộ canh kho chuỗi: mọi giá trị `vi` có dấu trừ miễn trừ có tên, không giá trị nào y hệt `en`, mọi hàm ghép biến có khẳng định ghim, không khoá chết; `CONTEXT.md` có mục cho danh từ trung tâm của lát.
- AC-13 (judgment): Given ba kho chuỗi mới, When người đọc như người quản trị OneHub, Then bản dịch đọc như tiếng Việt của người làm nghề: danh từ theo `CONTEXT.md`, thuật ngữ kỹ thuật giữ tên thật, không còn dấu vết dịch máy.

## Coverage

Quét bằng `morphological-scan`, preset test-matrix. **Bốn trục**, thước CE là lịch
sử lỗi thật của bốn vòng Việt hoá đã ký trong chính kho này — mạnh hơn chuẩn ngoài
vì đo đúng sản phẩm này. Chân ngành vào làm ứng viên: `[NGÀNH: WHATWG HTML —
translate]` · `[NGÀNH: W3C i18n]` · `[NGÀNH: pseudo-localization]`.

- **Trục A — chữ nấp ở đâu:** văn bản JSX | thuộc tính | toast | khoá object và mảng | hàm ghép câu | tiêu đề tài liệu | chuỗi sinh từ enum. [thước CE: mỗi giá trị là một chỗ đã sót thật ở bốn vòng trước; vòng này đo 183 · 93 · 14 · **0 tiêu đề**] → AC-1, AC-1b, AC-2, AC-3, AC-4
- **Trục B — điều kiện hiện ra:** mặc định | rỗng | đang tải | nhất thời | lỗi/bị chặn | cần vật gieo. [thước CE: ③b đo 3/6 và khai ba; đợt một đo 2/9 và khai bảy; giá trị *nhất thời* mới của lát này nằm ngay trong khối `ngoai_lat` đợt một đã khai] → AC-5, AC-6
- **Trục C — thứ không được dịch:** tên thương hiệu | định danh kỹ thuật | dữ liệu người nhập | **nội dung tác nhân sinh ra**. [thước CE: ③b AC-6/6b tìm ra lỗi sản phẩm thật; giá trị thứ tư đo được trong phiên thiết kế — tác nhân trả lời tiếng Việt trên màn gieo] → AC-7, AC-7b
- **Trục D — mối nối giữa hai hồ sơ:** bản khai bàn giao | khối `ngoai_lat` chết | năm con số neo của hồ sơ kia | vế *trùng chuỗi* đỏ oan. [thước CE: cả bốn đo được trong phiên thiết kế] → AC-9, AC-10
- **Cross-cutting mọi ô Core:** dân số sinh từ đĩa · cặp hai chiều cho mỗi phép đo mới · miễn trừ có đối tượng thật · không chép thước · **và mọi phép đo trả tập rỗng phải thoát mã 2, không được xanh** → AC-8, AC-11, AC-12

Ô Core: 7 trên không gian 672 ô, quét theo pairwise đúng như preset dạy. Ô Later:
nhiều hội thoại cùng lúc · mất mạng giữa chừng · màn chia sẻ đo với người thứ hai.
Ô Never: dịch nội dung tác nhân sinh ra (nó là thứ KHÔNG được dịch, đã vào trục C)
· hai lỗ đã có định đoạt mở-hợp-đồng-mới ở Cổng 2 đợt một.

## Out of scope

- **Route `/agents/[agentId]` và cụm Tác nhân của đội** — thuộc đợt một, đã ký.
- **Gốc gom chữ của bộ thước màn** và **trạng thái tác nhân vẽ ra tiếng Anh** — người đã định đoạt *mở hợp đồng mới* ở Cổng 2 đợt một; kéo lại là lật một quyết định đã ký.
- **Chuỗi sinh từ API** (`error.message` chuyển tiếp) — câu chữ sống ở `apps/api`, là `t3_paths`.
- **Đo màn chia sẻ hội thoại với người thứ hai** — cần thêm một tài khoản; vòng này chỉ đo cụm đó ở mức mã.
- **Đổi bố cục, component, luồng** — vòng này chỉ đổi chữ, trừ chỗ nhãn tiếng Việt tràn ở 360px thì nới trong giới hạn thang có sẵn.

## Notes

### Known limits

- **Gieo tốn token thật.** `commandType: "CHAT"` làm tác nhân trả lời, và khoá AI Gateway của kho có trần $5 trọn đời. Chân gieo vì thế gieo MỘT lần cho cả lượt đo và dọn kể cả khi đo hỏng — không gieo lại cho từng chân.
- **Bộ thước màn dùng chung không đo được màn này.** Nó chờ `networkidle0`; cửa sổ trò chuyện giữ một kết nối sống nên không bao giờ lặng (đã đo: hết giờ). Chân của lát này dùng `domcontentloaded` + lặng có kỳ hạn, viết mới chứ không bê thân hàm cũ.
- **Vế *trùng chuỗi* của AC-8 đợt một chỉ còn áp cho dòng khai `hoan`, không áp cho dòng khai `chuyen_giao`.** Lý lẽ: "rò sang vùng hoãn" là lỗi vì vùng hoãn chưa được dịch; vùng đã bàn giao thì đã có hồ sơ khác quét, nên từ dùng chung (*Huỷ · Lưu · Đóng*) là bình thường. Sửa ở điều kiện của cờ, không đụng chữ trong hợp đồng đã ký.
