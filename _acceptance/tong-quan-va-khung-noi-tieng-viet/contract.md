---
schema_version: 1
feature: Màn Tổng quan và khung điều hướng nói tiếng Việt — màn đầu tiên sau đăng nhập, thanh bên, thanh đầu, hộp tìm nhanh đọc đúng tiếng nhân viên chọn; và bộ thước màn nhìn thấy cả khung chứ không chỉ khung nội dung
slug: tong-quan-va-khung-noi-tieng-viet
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by: Manh Phan
approved_at: 2026-09-07T22:56:40Z
design_doc: docs/superpowers/specs/2026-09-08-tong-quan-va-khung-noi-tieng-viet-design.md
---

# Acceptance Contract: tong-quan-va-khung-noi-tieng-viet

## Context

Lát đầu của vòng ③c. Sau tám vòng Việt hoá đã ký, màn đầu tiên nhân viên thấy sau
khi đăng nhập (`/`, Tổng quan) và khung bao quanh mọi màn (thanh bên, thanh đầu,
ngăn kéo di động, hộp ⌘K, hàng đợi làm giàu) vẫn tiếng Anh — thanh bên còn lẫn
một nhãn tiếng Việt viết cứng giữa sáu nhãn tiếng Anh.

Không thước nào thấy vì **gốc gom chữ của bộ thước màn là phần tử cha của
`main`** — mục nặng nhất trong `_acceptance/NO-CAN-TRA.md`, chủ kho đã định đoạt
"mở hợp đồng mới". Lát này là hợp đồng đó: nới gốc thước bằng tham số (mặc định
cũ giữ nguyên cho năm hồ sơ đã ký), và dùng gốc mới để đo chính khung vừa dịch.

Dân số: 6 file `.tsx` ở thư mục `apps/app/app/(app)/[slug]` (không đệ quy) cộng 7
file khung khai bằng `them`. Đếm thô 106 chuỗi ứng viên; dân số thật chốt bằng
thước ở S3.

Một lớp mới so với các vòng trước: **chuỗi vừa là nhãn vừa là khoá điều khiển** —
`app-icon-rail.tsx` so `item.title === "Chat"` ở hai chỗ để chọn biến thể ngăn kéo
di động. Dịch nhãn mà không tách khoá là gãy điều hướng trong khi mọi thước chữ
xanh. Tiêu chí riêng.

Source input: lượt audit 08/09 (`docs/superpowers/specs/2026-09-08-tong-quan-va-khung-noi-tieng-viet-design.md`)
· `_acceptance/NO-CAN-TRA.md` mục "Bộ thước màn chỉ nhìn thấy khung nội dung" ·
`_acceptance/tieng-viet-cho-crm/opportunity.md` (vòng ③, lát ③c)

## Criteria

- AC-1: Given màn `/` dựng trên máy chủ thật hai lượt `vi`/`en` ở 1440px với **gốc gom chữ là toàn màn** (`body`), When phép đo đọc chữ người đọc thấy — kể cả thanh bên và thanh đầu — Then ba vế cùng đúng: số chuỗi hai lượt BẰNG nhau; mỗi cặp cùng vị trí KHÁC nhau trừ bảng không-dịch AC-7; mọi chuỗi lượt `vi` mang dấu trừ dòng `mien_dau` khai có tên. Tập rỗng hoặc trang bị chuyển hướng là TỪ CHỐI ĐO (mã 2), không phải đạt.
- AC-2: Given ba bề mặt chỉ hiện sau một cú bấm — menu tài khoản (bấm avatar) · hộp ⌘K (phím tắt, rồi gõ một chuỗi ≥2 ký tự không khớp gì để câu *không khớp* hiện ra) · ngăn kéo di động (nút ☰ ở 360px) — When phép đo lái từng bề mặt ra trên máy chủ thật hai lượt tiếng rồi gom chữ của riêng bề mặt đó, Then cùng ba vế của AC-1 trên từng bề mặt; bề mặt nào không lái ra được là mã 2 gọi tên bề mặt, không hạ xuống đọc mã. Ngăn kéo đo cả hai biến thể: ngoài Hội thoại và trong Hội thoại (`/chat`); **ở biến thể `/chat` chỉ gom `nav` rail trong ngăn kéo theo selector ghim** — thanh bên hội thoại là chữ của hồ sơ `cua-so-tro-chuyen-noi-tieng-viet`, phép đo in số chuỗi đã trừ kèm tên hồ sơ chủ. Thêm một vế trên mỗi bề mặt gom: tên truy cập (`aria-label`) của các `nav` cùng hiện phải KHÁC nhau.
- AC-3: Given màn `/` dựng ở trạng thái RỖNG — `?scope=me` cho tài khoản đo không sở hữu thoả thuận, việc, hoạt động nào (khai qua `nguon_san`, kiểm trước khi gom; không dựng được là mã 2 gọi tên điều kiện) — When phép đo gom toàn màn hai lượt tiếng, Then ba vế của AC-1 CỘNG năm khẳng định = năm câu rỗng của kho (ba bảng, hai biểu đồ) có mặt đúng vị trí; câu rỗng nào không dựng được vì số liệu là của cả workspace thì đo ở mức mã (prop câu rỗng đọc từ kho) và gọi tên. Chiều đỏ: xoá prop câu rỗng của một bảng thì chân ĐỎ gọi tên bảng.
- AC-4: Given 13 file của lát (dân số sinh từ đĩa: 6 từ thư mục + 7 khai `them`), When bộ quét đọc cây cú pháp, Then 0 chuỗi người-đọc-thấy viết thẳng trong JSX ngoài miễn trừ có tên, và mọi miễn trừ còn đối tượng thật; và khi phép đo lấy MỌI chuỗi rồi trừ theo luật có tên (danh sách thuộc tính kỹ thuật và khoá object kỹ thuật tách biệt), không chuỗi nào còn là tiếng Anh. Quét ra 0 chuỗi là từ chối đo.
- AC-5: Given bảng đóng các lời gọi `toast.*()` mang chữ của lát — ghim `(file, khoá kho chuỗi)`, kê ở S3 — When phép đo đọc mã, Then tập nhận ra BẰNG tập bảng theo cả hai chiều; lượt chỉ chuyển tiếp `error.message` không nằm trong bảng và phép đo in số lượt bỏ qua. Câu lỗi đăng xuất đi từ kho qua tham số của `signOutAndRedirect` — đo bằng QUAN HỆ, không bằng vắng mặt chuỗi: (a) chân mã — một literal tiếng Anh bên trong `toast.*()` ở bất kỳ file nào của lát là ĐỎ mã 1 kèm `file:dòng`; bảng lệch mà không có literal là mã 2; chân quan hệ đọc cây cú pháp: `app-header.tsx` truyền một khoá kho vào `signOutAndRedirect`, và `sign-out.ts` truyền đúng tham số ấy vào `toast.error`; (b) đối chứng dương — bài kiểm đơn vị của `sign-out.ts`: đăng xuất bị từ chối → `toast.error` được gọi với đúng chuỗi truyền vào và KHÔNG chuyển hướng; đăng xuất thành công → chuyển hướng, không toast.
- AC-6: Given màn `/` hiện chưa có `generateMetadata`, When vòng đóng, Then có đúng MỘT ô tiêu đề tài liệu; phép đo đếm Ô và đo QUAN HỆ — giá trị `title` trả về từ hàm gọi `tongQuanMessages(getLocale())`, không đo bằng sự có mặt của một `import`; và trên màn thật `document.title` hai lượt KHÁC nhau, lượt `vi` có dấu.
- AC-7: Given các giá trị không được dịch trên màn `/` và khung — bảy nhãn giai đoạn thoả thuận (`lang="en"`, `CONTEXT.md` chưa chốt nghĩa; giá trị đọc THẬT từ `lib/deal-stage.ts` qua `import`, không chép tay) · mã tiền tệ · thương hiệu `OneHub` — kê thành bảng đóng, **mỗi dòng khai `dieu_kien`** (luôn hiện · cần một thoả thuận ở giai đoạn X hiện trên `/` · cần một thoả thuận bằng tiền tệ chưa có tỷ giá), When màn dựng hai lượt tiếng, Then phép đo KIỂM ĐIỀU KIỆN trước khi gom (qua `nguon_san`; điều kiện không đạt là mã 2 gọi tên điều kiện, không phải bảng sai); tập ứng viên SINH TỪ MÀN (`translate="no"` ∪ chuỗi giống hệt hai lượt, trừ ba luật có tên: số thuần · dữ liệu người nhập · nhãn mang `lang="en"`) BẰNG phần bảng có điều kiện đạt theo cả hai chiều; dòng có điều kiện không đạt đo ở mức mã (phần tử render mang `lang="en"`) và in vào danh sách *không đo được trên màn* mang sang cổng ký. Hai lượt phải ra cùng số phần tử có chữ, lệch là ĐỎ.
- AC-8: Given dữ liệu người nhập hiện trên lát — tên thoả thuận · tên công ty · chủ đề việc · chủ đề hoạt động · tên người ghi (bảng Tổng quan) · tên workspace · email người dùng (thanh đầu) · tên kết quả ⌘K — kê thành bảng đóng `(file, biểu thức)`, When phép đo chạy, Then HAI chân: chân mã đọc cây cú pháp — phần tử JSX bọc đúng biểu thức đó mang `translate="no"`, thiếu là ĐỎ `file:dòng`, biểu thức không còn là mã 2; chân màn đo trên vật SẴN CÓ (workspace, người đăng nhập, thoả thuận và việc của DB thử) qua `nguon_san`, in danh sách đo được / không đo được, và **số đo được + số không đo được phải BẰNG số dòng bảng** — dòng không rơi vào đâu là mã 2 gọi tên.
- AC-9: Given bản khai lát ghim hai con số neo lấy từ kiểm kê 08/09, độc lập với luật quét — **6 file** trong thư mục · **1 route** — When chân đo dựng danh sách, Then số quét ra BẰNG số neo, lệch là mã 2 kèm diff tên file; danh sách sinh từ quét thư mục cộng `them`, không gõ tay; thêm một file `.tsx` mang chữ tiếng Anh vào thư mục thì dân số đổi VÀ hai chân đỏ (thí nghiệm chạy NỀN trước khi cắm vết; mã 2 khi có vết là *chưa đo được*). `khong_quet` rỗng ở lát này — mọi file trong thư mục đều là bề mặt của lát.
- AC-10: Given bộ đột biến, When một câu tiếng Anh được cắm lại vào TỪNG hình dạng của trục A — văn bản JSX · thuộc tính · toast · tiêu đề · khoá object/mảng lựa chọn · hàm ghép câu · **nhãn rail** — Then bảng ĐÓNG `(hình dạng, chân chuyên trách)`: mỗi vết bị đúng chân của hình dạng đó bắt với mã 1; mã 2 không tính là bắt; cây lành thì mọi chân xanh; `git status` trước và sau bằng nhau.
- AC-11: Given bản `vi` dài hơn bản `en`, When `/` dựng ở 360px hai lượt (rail ẩn, thanh đầu, thẻ số, bảng) và ngăn kéo di động mở, Then với mọi phần tử NHÌN THẤY mang nhãn dịch được `scrollWidth ≤ clientWidth`; lượt `en` là đối chứng dương. Giới hạn kế thừa: mù với vùng chứa cho xuống dòng.
- AC-12: Given chân bề rộng, When một nhãn `vi` dài được cắm vào một phần tử không xuống dòng của lát, Then chân ĐỎ đúng chiều "vi tràn mà en vừa" kèm hai cặp số, và cây trả nguyên trạng.
- AC-13: Given `GOM` và `DO_RONG` của bộ thước dùng chung nhận tham số `toanMan` với mặc định là gốc cũ, When phép đo gom chữ trên CÙNG một trang `/` hai cách, Then cặp hai chiều cho CẢ HAI hàm, mốc là THANH ĐẦU (đo 08/09: rail là anh em của `main` trong cùng khung nên gốc cũ vốn thấy rail; thứ gốc cũ không thấy là thanh đầu): gốc mới CHỨA nhãn trang chủ và menu tài khoản (đọc từ kho chuỗi, `GOM`) và tên workspace (`DO_RONG`), gốc cũ vắng cả ba; mũi gọi không tham số cho ra tập BẰNG gốc cũ (`GOM()` ≡ `GOM(false)`, `DO_RONG()` ≡ `DO_RONG(false)`). Một chiều gãy là ĐỎ gọi tên hàm và chiều.
- AC-14: Given thư mục `rang/` của lát này và của ③a, ③b, lát dựng tác nhân, When so sánh, Then ba vế: (1) mọi thân hàm và thân mô-đun là riêng — trùng từ 12 dòng trở lên là ĐỎ kèm tên hai file; lát dùng lại thước qua `--lat` và ổ cắm — và mọi `rang/*.mjs` của lát suy gốc kho từ `import.meta.url`, không ghim đường tuyệt đối; (2) **phép đo MÀN của một hồ sơ đã ký** (`man-cai-dat-noi-tieng-viet/rang/man-that.mjs hai-tieng`, gọi không tham số) chạy lại trên máy chủ thật vẫn thoát 0 và số chuỗi gom được trên hai route của nó BẰNG con số đo bằng thư viện TRƯỚC KHI SỬA trên cùng dữ liệu (ghim trong `rang/goc-thuoc.json`; đo 08/09: số đã ký 42/118 phụ thuộc dữ liệu máy cũ — tỷ giá, tên workspace — nên không phải neo hợp lệ giữa hai máy) — phép đo của hồ sơ đã ký tái lập được sau khi sửa `man-that-lib.mjs`; (3) chân cây cú pháp đếm mọi mũi gọi `GOM(` và `DO_RONG(` ngoài `rang/` của lát này: tất cả KHÔNG truyền tham số, đếm khác 0 là ĐỎ kèm `file:dòng`.
- AC-15: Given hai kho chuỗi mới, When bộ canh kho chuỗi của `apps/app` chạy, Then mọi giá trị `vi` có dấu trừ miễn trừ có tên, không giá trị nào y hệt `en`, mọi hàm ghép biến có khẳng định ghim, không khoá chết; và không còn chỗ nào trong lát ghim `"en"` vào `formatCount`.
- AC-16: Given nhãn rail đã tách khỏi khoá điều khiển (`lib/khung-dieu-huong.ts`), When bài kiểm đơn vị chạy với lượt `vi`, Then mục Hội thoại vẫn được nhận ra là mục hội thoại (`laMucHoiThoai`) và mục đang mở vẫn đúng theo `pathname`; đảo về so sánh bằng nhãn là bài kiểm ĐỎ.
- AC-17 (judgment): Given hai kho chuỗi mới, When người đọc như một nhân viên quan hệ đối tác của OneHub mở màn đầu tiên, Then bản dịch đọc như tiếng Việt của người làm nghề: danh từ theo `CONTEXT.md` (công ty · cá nhân · thoả thuận · hội thoại · chiến dịch), thẻ số nói giọng đối tác chứ không giọng phễu bán hàng (`chốt` thay cho thắng/thua), thuật ngữ kỹ thuật giữ tên thật, không dấu vết dịch máy.

## Coverage

Bốn trục, quét pairwise (420 ô) — xem design doc mục "Quét không gian tiêu chí":

- **Trục A — chữ nấp ở đâu:** văn bản JSX | thuộc tính | toast | tiêu đề | khoá object và mảng lựa chọn | hàm ghép câu | **nhãn kiêm khoá điều khiển** [thước CE: sáu hình dạng đầu là chỗ đã sót thật ở ③a/③b/lát dựng tác nhân; hình dạng thứ bảy đo được ở `app-icon-rail.tsx` hai chỗ so `title === "Chat"`]
- **Trục B — bề mặt hiện khi nào:** luôn hiện | sau một cú bấm | rỗng | đang tải | cần dữ liệu thật [thước CE: bảng nợ mục "component chỉ hiện sau khi bấm"; hồ sơ `chan-lai-component-ra-man`; gap-probe 08/09 F3 — giá trị *rỗng* từng không có AC]
- **Trục C — hạng chữ:** nhãn | dữ liệu người nhập | định danh (`lang="en"`, mã tiền tệ) | thương hiệu [thước CE: `CONTEXT.md` luật dữ liệu người nhập; sổ bàn giao ghi tên thoả thuận/cá nhân chưa mang `translate="no"`]
- **Trục D — gốc của thước:** gốc cũ | gốc toàn màn | mũi gọi cũ [thước CE: đo 06/09 trong `NO-CAN-TRA.md`]

Ô Core → AC: A×B=luôn-hiện → AC-1 · A×B=sau-bấm → AC-2 · **A×B=rỗng → AC-3** ·
B=đang-tải → đo mức mã trong AC-4 (fallback của rail, thanh đầu, lời chào đọc kho) ·
B=cần-dữ-liệu-thật → điều kiện `dieu_kien`/`nguon_san` của AC-7, AC-8 ·
A=khoá-điều-khiển → AC-16 · A mức mã → AC-4, AC-5, AC-6 · C=dữ liệu người nhập → AC-8 ·
C=định danh → AC-7 · D → AC-13, AC-14 · cross-cutting: thước có răng → AC-9, AC-10 ·
bề rộng → AC-11, AC-12 · kho chuỗi → AC-15, AC-17.

Không dòng `[GIẢ ĐỊNH]`. **Một mục chờ người ở Cổng Phạm vi:** bảng từ vựng thẻ
số của màn Tổng quan (design doc mục "Từ vựng") — *Closed won / Win rate / Open
pipeline* dịch theo giọng đối tác với từ `chốt`, hay giữ nguyên tiếng Anh cho tới
khi bảy giai đoạn thoả thuận được chốt nghĩa? Máy khuyên dịch, ghi `revisit`.

## Out of scope

- Bảy nhãn giai đoạn thoả thuận — `CONTEXT.md` chưa chốt nghĩa; giữ `lang="en"`, vào bảng không-dịch AC-7.
- Câu lỗi máy chủ chuyển tiếp qua `toast.error(error.message)` — vòng ④.
- Lớp tác nhân trong hồ sơ (`lib/agent-*.ts`, `agent-panel`, `agent-conversations`, trạng thái tác nhân `draft/live/paused`) — lát ③c-2.
- Trang landing `/` của hãng, "Comp AI" ở `agent-handoff.ts` và lệnh mời Slack, ghim `"en"` ngoài lát (`currency-settings.tsx`) — đợt việc nhỏ riêng.
- Nới gốc thước thành mặc định và re-pin năm hồ sơ đã ký — sự kiện re-pin riêng sau lát này.
- Trạng thái *đang làm giàu* của hàng đợi và *có kết quả* của ⌘K trên màn thật — đo ở mức mã (Later).
- Đổi bố cục, component nền, luồng; nhãn tràn ở 360px thì nới trong thang có sẵn và khai.

## Notes

### Known limits

Khai trước ở S1; S3 bổ sung khi thước đo được.

- Máy viết hợp đồng này chưa có `bun`, `.env`, Postgres — S3 và S4 chạy ở máy có môi trường dev đầy đủ.
- Chân màn của AC-8 đo trên vật sẵn có của DB thử (seed của kho: 18 công ty, 27 thoả thuận); workspace trống thì bảng Tổng quan rỗng và chân chỉ chứng được tên workspace và email.
- Tiêu chí AC-13 chứng gốc mới THẤY thanh đầu; nó không chứng khung đã dịch — vế đó là AC-1.

### Đo được ở S3 — bốn chỗ hợp đồng nói chưa đúng vật thật, và ba chỗ kéo thêm ngoài lát

- **Gốc cũ của thước VỐN ĐÃ thấy thanh bên.** Thiết kế đoán rail nằm ngoài gốc cũ; chân `goc-thuoc` chạy lần đầu trả ĐỎ với *"goc cu thay 7/7 nhan rail"*. Rail là anh em của `main` trong cùng khung nên gốc cũ (cha của `main`) chứa nó. Thứ gốc cũ thật sự không thấy là **thanh đầu**. Mốc của AC-13 đổi sang nhãn trang chủ, menu tài khoản và tên workspace; đo lại: gốc cũ 0/2, gốc mới 2/2 (`GOM`), và 0/1 → 1/1 (`DO_RONG`); số phần tử 42→51 và 31→34.
- **Neo của AC-14 không dùng được con số đã ký.** Bằng chứng của `man-cai-dat` ghi 42/118 chuỗi, đo trên máy cũ với dữ liệu khác. Trên máy này cùng bộ dữ liệu, thư viện **trước** và **sau** khi sửa cùng ra 41/86 — đó mới là neo chứng được điều hợp đồng hứa. Cả hai số ghim ở `rang/goc-thuoc.json`.
- **Nhãn tháng của biểu đồ do máy chủ đúc bằng `en-US`.** `apps/api/src/dashboard/dashboard.service.ts` ghim `Intl.DateTimeFormat("en-US", { month: "short" })`, nên trục X đọc *May · Jun · Jul* ở cả hai lượt tiếng. Đã sửa: máy chủ trả tháng dạng trung tính `2026-05`, khách định dạng theo tiếng qua `formatMonth` mới trong `packages/ui/src/lib/format.ts`. Đây là **kéo thêm chỗ ngoài lát** — cùng lý do ③b kéo nhãn hạn cookie và `channel-picker` vào vòng: chúng hiện trên màn của lát nên bỏ qua thì AC-1 đỏ. `apps/api/src/dashboard` không nằm trong `t3_paths`.
- **Ba chỗ đổi bố cục, ngoài lời hứa chỉ-đổi-chữ.** Nhãn thẻ số chỉ cắt cụt từ ngưỡng bốn cột (`packages/ui/src/components/stat-card.tsx`, một lớp Tailwind) — ở 360px nó cho xuống dòng thay vì tràn; **bản tiếng Anh cũng đã tràn 150/131px trước vòng này**. Hai ô tiền nới `w-14`→`w-16` và cột giá trị `w-20`→`w-24` vì số tiền tiếng Việt (`120,5 N CA$`) rộng hơn bản Anh.
- **Thư viện cắm vết dùng chung nhận thêm tham số thụt.** `be-rong-do-lib.sh` ghim hai tầng thụt; nhãn cần cắm của lát này nằm ở ba tầng. Thêm biến `THUT`, mặc định giữ hai tầng nên bốn hồ sơ cũ không đổi.

### Chiều đỏ của chân bề rộng — CÓ đối tượng, và điều đó được ĐO

Chân `be-rong-tien-de` (ổ cắm `tq_be_rong_tien_de`) đếm hộp chặt cứng trên hai bề mặt ở 360px, rồi **nối chữ ngay trên DOM** để hỏi hộp nào thật sự tràn được — `nowrap` một mình không đủ, hộp tự nong ra thì không bao giờ tràn. Đo 08/09: **17 trên 82** hộp chặt cứng mang nhãn của lát, và **đúng 1** trong số đó tràn được: tiêu đề cột `Thoả thuận`. Vết của `be-rong-do.sh` cắm vào đúng nhãn đó, và chân đỏ đúng chiều: `vi 375/230px · en 230/230px vừa`.

### Bảy hình dạng, bảy chân chuyên trách — đo 08/09

Bộ đột biến chứng cả bảy: văn bản JSX → `chu-cung-jsx` · thuộc tính → `moi-chuoi` · toast → `toast` · tiêu đề → `tieu-de` · khoá object → `moi-chuoi` · hàm ghép câu → `moi-chuoi` · **nhãn rail → `hai-tieng`** (vết cắm vào kho chuỗi, chờ 12 giây cho máy chủ nạp lại, chân màn bắt). Sáu chân xanh trên cây lành; cây trả nguyên trạng.

### Giới hạn còn lại

- **Sáu trên mười ba ô dữ liệu người nhập không đo được trên màn**, gọi tên trong output: bảng việc quá hạn rỗng trên bộ dữ liệu mẫu (ba ô), hoạt động đầu bảng là đổi giai đoạn nên không gắn công ty hay thoả thuận riêng (hai ô), và kết quả ⌘K cần API tìm kiếm khớp (một ô). Bảy ô còn lại đo được trên vật sẵn có; chân mã phủ cả mười ba.
- **Bốn dòng bảng không-dịch không dựng được trên màn**: ba giai đoạn đóng (`Closed won` · `Closed lost` · `Unqualified`) không có chỗ trên màn Tổng quan vì nó chỉ vẽ thoả thuận đang mở, và mã tiền tệ chỉ hiện khi có thoả thuận chưa quy đổi. Cả bốn đo ở mức mã và gọi tên.
- **Chân bề rộng mù với vùng chứa cho xuống dòng** — giới hạn kế thừa từ ③b.

### Vòng chấm ba (08/09) — điều khoản dừng-vá đã kích, và cả ba cái đỏ là một nguyên nhân

Ba lượt chấm, ba verdict: REJECT · BLOCKED · REJECT. Nhưng **lớp lỗi của vòng ba
trùng lớp lỗi của vòng một**, nên điều khoản dừng-vá của bộ kit kích và vòng
dừng ở đây chờ người chọn đường — không tự tung vòng bốn.

**Ba cái đỏ của vòng ba, một nguyên nhân: bộ chạy fan-out cho lệnh cắm-vết và
lệnh quan-sát chạy cùng lúc.**

| Cái đỏ | Vật đo được |
|---|---|
| Hội đồng chấm AC-17 **FAIL** | Cả hai người chấm trượt trích cùng một chuỗi: `Thoả thuận của người dùng trong công ty và toàn bộ quyền đi kèm`. Chuỗi ấy **chưa từng nằm trong commit nào** (`git log -S` trả 0) và trên đĩa hai khoá đó là `"Thoả thuận"`. Nó do `be-rong-do-lib.sh:31` sinh ra và sống trên cây khoảng 15 giây — chính cửa sổ mà E13 mở. Người chấm đọc file đúng lúc đó |
| E11 bộ đột biến **mã 2** | Bắt đủ **bảy trên bảy** vết, rồi trượt ở bước cuối: *"cây làm việc khác trước khi chạy"*. Thủ phạm là script sàn thiết kế của chính vòng này — nó ghi `evidence/E18-*.png` và `.html` vào cây trong lúc bộ đột biến so `git status` |
| `bun run test` **mã 1** | Suite đọc cây giữa lúc bộ đột biến cắm vết. Khoá cây của ③b xếp hàng các *chân đo* với nhau nhưng không phủ bốn bộ kiểm của kho |

**Chạy tuần tự, cả ba đều XANH** — đo lại 08/09 ngay sau vòng chấm: `dot-bien`
xanh với bảy vết, `bun run test` xanh, `be-rong-do` xanh đúng chiều.

**Đây đúng là lớp lỗi ③b đã gọi tên rồi hoãn.** Hợp đồng `cai-dat-con-lai` mục
*Vòng chấm sáu* ghi: ba giám khảo chấm trượt oan vì đọc file trong cửa sổ vết của
`be-rong-do.sh`; ③b giảm nhẹ bằng cách làm vết thành cụm tiếng Việt đọc được,
rồi viết thẳng: *"Cửa sổ vẫn còn... Khử hẳn thì phải cắm vết trên một bản sao cây
và trỏ máy chủ dev sang đó — việc của đợt sau"*. Vòng này là đợt sau, và nó vấp
đúng chỗ đó — lần này nặng hơn vì vết dài của lát rơi vào một **tiêu đề cột**,
đọc ra thành câu lạc đề nên người chấm kết luận bản dịch sai.

### Vòng chấm một (08/09) — hai cái đỏ oan và một sàn không chạy được

- **E6 đỏ oan.** Phiên chấm chạy mũi tiêu đề với đường dẫn gõ nhầm — `tong-quan-va-khieu-noi-tieng-viet` thiếu ba chữ so với thư mục thật — rồi đọc `ENOENT` thành *"input data missing from the codebase"*. Tệp có thật; chạy đúng đường dẫn thì xanh. Không có gì để sửa trong sản phẩm.
- **`bun run test` đỏ oan.** Bộ chạy fan-out cho mọi lệnh chạy song song, nên suite đọc cây đúng lúc bộ đột biến (E11) đang cắm vết. Khoá cây của ③b xếp hàng các CHÂN ĐO với nhau nhưng **không phủ bốn bộ kiểm của kho** — giới hạn kế thừa, ③b đã khai. Chạy lại một mình: xanh.
- **Sàn thiết kế của bộ kit không đo được màu của sản phẩm này.** Chế độ dom cần `jsdom` (có sẵn ở gốc kho, chỉ thiếu cờ `--jsdom`), và ngay cả khi chạy được thì nó **không giải được `oklch()` và `var()`** của hệ token: nó đọc mọi màu về `#ffffff` rồi báo trắng-trên-trắng — hai P0 giả trên cả ba khung hình. Vòng hai thay bằng một lệnh của kho (`rang/san-thiet-ke.mjs`): tự đăng nhập, dựng ba khung, nội tuyến CSS, chạy sàn của kit cho **mọi luật còn lại**, và đo **tương phản thật trong trình duyệt** cho tầng P0 — nơi màu đã tính xong. Đo 08/09: 0 chỗ dưới ngưỡng trên 85 · 85 · 94 phần tử mang chữ. Chiều đỏ có eval riêng (E22).
- `ban-dich.md` do S3 sinh từ hai kho chuỗi (như ③a), là đầu vào PHỤ của E19; hai kho thật là chính. Bốn bản khai `rang/*.json` (toast · không-dịch · dữ liệu người nhập · lát) viết ở S3 sau khi thước AST đếm, trừ `lat-tong-quan.json` viết ở S1 với hai con số neo.
- Trạng thái rỗng (AC-3) dựng bằng `?scope=me` của tài khoản không sở hữu gì; những ô số liệu tính trên cả workspace (thẻ số, biểu đồ) không rỗng theo cách đó — câu rỗng của hai biểu đồ đo ở mức mã và gọi tên.
