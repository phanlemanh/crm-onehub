---
schema_version: 1
feature: Lát dựng tác nhân nói tiếng Việt — đợt một: khung điều hướng, cụm Tác nhân của đội, và bảng kết quả/mã đọc đúng tiếng của người quản trị
slug: agent-builder-noi-tieng-viet
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Manh Phan
approved_at: 2026-09-06
design_doc: docs/superpowers/specs/2026-09-05-agent-builder-noi-tieng-viet-design.md
---

# Acceptance Contract: agent-builder-noi-tieng-viet

## Context

Lát thứ tư của chuỗi Việt hoá, sau cửa vào · nhãn ứng dụng · hai đợt Cài đặt.

Dân số đo bằng máy: `moi-chuoi.mjs` ra **517 chuỗi tiếng Anh trên 22 file**. Chủ
kho chốt cắt đôi ngày 05/09. **Đợt này: 237 chuỗi ứng viên trên 20 file quét** (26 file `.tsx` trên đĩa, trừ sáu file hoãn) — khung điều
hướng, cụm Tác nhân của đội, bảng kết quả và mã. Cửa sổ trò chuyện (291 chuỗi,
6 file) để đợt sau.

Khung bọc cả `/agents` lẫn `/chat`, nên trong lúc chờ đợt hai, màn `/chat` có
khung tiếng Việt quanh nội dung tiếng Anh. Đây là lựa chọn có chủ ý, khai bằng
tên sáu file — khác hẳn ca vòng trước, nơi một màn lẫn tiếng vì file nằm ngoài
dân số quét nên không thước nào thấy.

## Criteria

- AC-1: Given mọi route của lát — danh sách SINH TỪ THƯ MỤC `(agent-builder)`, không gõ tay — dựng trên máy chủ thật hai lượt `vi`/`en`, When phép đo đọc chữ người đọc thấy từng lượt, Then trên từng route: số chuỗi hai lượt BẰNG nhau; mỗi cặp cùng vị trí KHÁC nhau trừ bảng không-dịch AC-6; mọi chuỗi lượt `vi` mang dấu trừ dòng `mien_dau` khai có tên. **Phép đo GIEO một tác nhân qua `agents.save` — chính thủ tục ghi của sản phẩm — rồi đo trên bản ghi đó**, nên `route_khong_dung_duoc` phải RỖNG cho `/agents/[agentId]`; khai route đó là không-dùng-được mà nó mở được là ĐỎ. Vật gieo phải được dọn sau khi đo, và lệnh dọn thất bại là thoát mã 2. Tập rỗng trên một route là thoát mã 2.
- AC-1b: Given dân số 20 file quét của lát sinh từ đĩa, When bộ quét đọc cây cú pháp, Then 0 chuỗi người đọc thấy viết thẳng trong JSX ngoài các dòng miễn trừ có tên; mỗi dòng miễn trừ phải còn đối tượng thật trong mã — miễn trừ chết là ĐỎ.
- AC-2: Given mọi lời gọi toast của lát, kê thành bảng đóng ghim `(file, khoá kho chuỗi)`, When phép đo đối chiếu, Then bảng khớp mã theo CẢ HAI CHIỀU — thiếu hay thừa một mục đều thoát mã 2 in cả hai danh sách. Lượt chuyển tiếp `error.message` từ API đếm riêng, không tính là chưa dịch.
- AC-3: Given bốn tiêu đề tài liệu của lát đang là `export const metadata`, When trang dựng, Then cả bốn thành `generateMetadata` đọc từ kho chuỗi; phép đo đếm Ô tiêu đề chứ không đếm chuỗi, và số ô nhận ra phải BẰNG bốn.
- AC-4: Given kiểm kê đếm **57 chuỗi nằm trong thuộc tính JSX**, When phép đo đọc cây cú pháp, Then **danh sách tên thuộc tính SINH TỪ CÂY, không kê tay**: lấy mọi tên thuộc tính mang chuỗi rồi TRỪ theo danh sách kỹ thuật khai có tên; một tên thuộc tính mang chữ người đọc mà không nằm trong danh sách kỹ thuật và cũng không đọc từ kho chuỗi là ĐỎ gọi tên `file:dòng:tên-thuộc-tính`. Số thuộc tính mang chữ bắt được phải BẰNG con số neo 57; lệch là thoát mã 2 kèm diff. Mỗi dòng miễn trừ kỹ thuật phải còn đối tượng thật.
- AC-5: Given tám trạng thái đã kê ở bảng `ST-*` của design, When phép đo dựng trên máy chủ thật, Then trạng thái nào dựng được thì đọc chữ người đọc thấy và đòi tiếng Việt có dấu; trạng thái nào KHÔNG dựng được thì GỌI TÊN kèm lý do dưới nhãn *GIỚI HẠN ĐÃ KHAI* và mang sang cổng ký — tuyệt đối không hạ xuống đọc mã rồi ghi đạt. Vì phép đo gieo một tác nhân thật, **ít nhất SÁU trong tám trạng thái phải dựng được**; dưới sáu là thoát mã 2 kèm danh sách ô hụt. Không dựng được ô nào cũng là thoát mã 2.
- AC-6: Given các giá trị không được dịch — tên thương hiệu, định danh kỹ thuật, URL mẫu — When màn dựng hai thứ tiếng, Then tập ứng viên SINH TỪ MÀN bằng bảng khai theo CẢ HAI CHIỀU; hai lượt phải ra cùng số phần tử có chữ trên mỗi route, lệch là ĐỎ gọi tên route. **Và mỗi dòng của bảng được so GIÁ TRỊ giữa hai lượt: chuỗi phải Y HỆT nhau** — số dòng so được BẰNG số dòng bảng, và một giá trị khác nhau giữa `vi` và `en` là ĐỎ gọi tên phần tử và route. Đếm số phần tử là điều kiện cần, không phải phép đo của lớp này.
- AC-6b: Given dữ liệu người nhập hiện trên các màn này — tên tác nhân, tiêu đề hội thoại, tên kênh Slack — kê thành bảng đóng `(file, trường)`, When phép đo chạy, Then phần tử JSX bọc biểu thức của trường đó mang `translate="no"`, đọc ở mức cây cú pháp; và mọi ô đo được trên VẬT SẴN CÓ của workspace đo phải hiện đúng giá trị đó trên màn kèm thuộc tính.
- AC-7: Given bộ đột biến, When cắm một vết cho TỪNG hình dạng của trục A (văn bản JSX · thuộc tính · tiêu đề · toast · khoá object · component dùng chung), Then bảng ĐÓNG ghim `(hình dạng, chân chuyên trách)` — mỗi vết phải bị đúng CHÂN CHUYÊN TRÁCH của hình dạng đó bắt với mã 1, không nhận «một chân nào đó bắt được»; vết của hình dạng *component dùng chung* phải cắm ở file NGOÀI `components/agent-builder`, khai đường dẫn nguyên văn; mã 2 in riêng và KHÔNG tính là bắt được; cây lành thì mọi chân xanh; `git status` trước và sau bằng nhau.
- AC-8: Given ba nguồn đếm độc lập (bản khai lát · bộ quét JSX · bộ quét ngoài JSX) và bản khai lát liệt đủ thư mục của lát cộng `them` cho component dùng chung, và ghim **năm con số neo đo bằng chính bản khai này ngày 06/09, độc lập với luật quét — 26 file trên đĩa · 20 file quét · 237 chuỗi ứng viên · 180 văn bản · 57 thuộc tính**, When chân đo dựng danh sách, Then ba con số file BẰNG nhau, số vật (toast, ô tiêu đề) khớp bảng khai theo TẬP chứ không theo tổng, và số quét ra BẰNG số neo — lệch là thoát mã 2 kèm diff tên file. **Sáu file hoãn sang đợt hai phải nằm trong `khong_quet` kèm lý do**, số dòng `khong_quet` BẰNG sáu — thừa hay thiếu một dòng là thoát mã 2 gọi tên file. Cần gạt đó đo bằng QUAN HỆ, không bằng «còn tiếng Anh» (sáu file đó còn tiếng Anh là đúng thiết kế): một file bị loại trừ mà mang chuỗi TRÙNG với một giá trị của ba kho chuỗi mới là ĐỎ — nghĩa là chữ của đợt này đã rò sang vùng hoãn. Thí nghiệm thả một file `.tsx` mang chữ tiếng Anh vào thư mục lát phải chạy NỀN trước, và chân trả mã 2 khi có vết là *chưa đo được*, không tính là đã bắt.
- AC-9: Given bản `vi` dài hơn bản `en`, When mọi route dựng được của lát dựng ở 360px hai lượt, Then với mọi phần tử NHÌN THẤY ĐƯỢC mang nhãn dịch được, `scrollWidth ≤ clientWidth`; lượt `en` là đối chứng dương. **Giới hạn kế thừa:** mù với vùng chứa cho xuống dòng.
- AC-10: Given MỌI chuỗi trong 20 file quét (không riêng JSX), When bộ quét lấy hết rồi trừ theo luật có tên với hai danh sách tách biệt (thuộc tính JSX / khoá object), Then 0 chuỗi người đọc thấy còn tiếng Anh, in `file:dòng:bối cảnh:nguyên văn` khi đỏ; 0 chuỗi quét ra là thoát mã 2; dòng giữ-nguyên chết là ĐỎ.
- AC-11: Given thư mục `rang/` của lát này và của ba lát trước, When so sánh, Then không thân hàm hay thân mô-đun nào trùng từ 12 dòng trở lên — lát này dùng lại thước qua `--lat` và ổ cắm, KHÔNG chép; trùng là ĐỎ kèm tên hai file.
- AC-12: Given `CONTEXT.md` chưa có mục nào cho danh từ trung tâm của lát, When vòng này đóng, Then từ điển có mục **Tác nhân** (và các từ đi kèm mà lát này dùng lặp), và ba kho chuỗi mới qua trọn bộ canh kho chuỗi: mọi giá trị `vi` có dấu trừ miễn trừ có tên, không giá trị nào y hệt `en`, mọi hàm ghép biến có khẳng định ghim, không khoá chết.
- AC-13 (judgment): Given ba kho chuỗi mới, When người đọc như người quản trị OneHub, Then bản dịch đọc như tiếng Việt của người làm nghề: danh từ theo `CONTEXT.md`, thuật ngữ kỹ thuật giữ tên thật, không còn dấu vết dịch máy.

## Coverage

Quét bằng `morphological-scan`, preset test-matrix. Ba trục, thước CE là **lịch
sử lỗi thật của bốn vòng Việt hoá đã ký trong chính kho này** — mạnh hơn chuẩn
ngoài vì đo đúng sản phẩm này.

- **Trục A — chữ nấp ở đâu:** văn bản JSX | thuộc tính JSX | toast | tiêu đề tài liệu | khoá object và mảng lựa chọn | hàm ghép câu | component dùng chung ngoài thư mục lát. [thước CE: mỗi giá trị là một chỗ đã sót thật — toast và tiêu đề ở ③a, thuộc tính ở ③b vòng 1, component dùng chung ở ③b vòng 5] → AC-1b, AC-2, AC-3, AC-4, AC-10
- **Trục B — điều kiện hiện ra:** mặc định | rỗng | đang tải/đang ghi | lỗi hoặc bị chặn | nhất thời. [thước CE: ③b có AC riêng cho trạng thái rỗng, đo được 3/6 và khai ba ô còn lại] → AC-5, AC-1
- **Trục C — thứ không được dịch:** tên thương hiệu | định danh kỹ thuật | dữ liệu người nhập | đoạn mã người chép. [thước CE: ③b AC-6, AC-6b, AC-12 đều tìm ra lỗi sản phẩm thật] → AC-6, AC-6b
- **Cross-cutting mọi ô Core:** dân số sinh từ đĩa · cặp hai chiều cho mỗi phép đo mới · miễn trừ có đối tượng thật · không chép thước → AC-7, AC-8, AC-11

Ô Core: 7. Ô Later: trạng thái rỗng cần gieo dữ liệu thật · hàm ghép số nhiều ·
bề rộng 360px (dùng lại thước cũ). Ô Never: cửa sổ trò chuyện (đợt hai, khai
bằng tên sáu file) · dịch định danh kỹ thuật · dựng luồng OAuth thật.

Không dòng `[GIẢ ĐỊNH]` nào: mọi giá trị trục truy được về mã đang chạy hoặc về
một vòng đã ký.

## Out of scope

- **Cửa sổ trò chuyện** — `agent-builder-chat`, `agent-composer`, `agent-history`, `share-chat-dialog`, `chat-chips`, `delete-chat-action`: 291 chuỗi, đợt hai. Khai bằng tên file trong `khong_quet` của bản khai lát.
- **Tách `channel-picker` ra kho chuỗi riêng** — component dùng chung nay đọc kho của khu vực Cài đặt. Vòng này dịch chữ quanh nó, không đụng kiến trúc kho.
- **Dựng luồng OAuth thật** để mở trạng thái Slack đã cắm — như ba vòng trước.
- **Chuỗi sinh từ API** (`error.message` chuyển tiếp) — câu chữ sống ở `apps/api`, là `t3_paths`.
- **Đổi bố cục, component, luồng** — vòng này chỉ đổi chữ, trừ chỗ nhãn tiếng Việt tràn ở 360px thì nới trong giới hạn thang có sẵn.

## Notes

### Known limits

- **Bộ quét dùng chung ghi MỘT khoá cho mỗi lời gọi toast** (khoá `t.x.y` đầu tiên trong lời gọi). Một câu dựng từ biểu thức ba ngôi vì thế chỉ góp nhánh đầu vào bảng đóng: ở lát này là `toast.success(result.cancelled ? chiTiet.daDung : chiTiet.daXongTruocDo)`. Nhánh thứ hai do chân MỌI CHUỖI (AC-10) canh, không phải bảng toast. **Không sửa bộ quét trong vòng này**: hai hồ sơ đã ký dựa vào đúng hành vi đó — ba lời gọi nhiều khoá ở `slack-channels.tsx` và `tracking-script.tsx` — nên đổi nó là làm đỏ bằng chứng đã ký. Sửa cho đúng là một việc riêng, đụng cả ba hồ sơ.
- **Bảng không-đủ-quyền của lát này RỖNG có chủ ý.** Mọi chỗ gác quyền trong cụm dựng tác nhân đều ẩn nút thay vì đổi chữ, nên không có câu nào thuộc lớp đó. Chiều THỪA sinh từ cây cú pháp sẽ đỏ nếu sau này xuất hiện một câu như vậy mà bảng không khai.
