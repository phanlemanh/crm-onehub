---
schema_version: 1
feature: Cài đặt còn lại nói tiếng Việt — năm cụm Theo dõi, Kết nối, Khoá API, SSO, Thành viên đọc đúng tiếng của người quản trị, và mọi đoạn mã người chép giữ nguyên từng byte
slug: cai-dat-con-lai-noi-tieng-viet
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-04T14:02:57Z
design_doc: docs/superpowers/specs/2026-09-04-cai-dat-con-lai-noi-tieng-viet-design.md
---

# Acceptance Contract: cai-dat-con-lai-noi-tieng-viet

## Context

Đợt một của lát ③b dịch mười file và dựng thước. Đợt này lấy trọn 33 file còn
lại trong **một vòng** — chi phí thật của vòng lặp là cố định theo vòng, không
theo file, nên cắt đôi là trả chi phí đó hai lần.

**Dân số chốt bằng thước ở S3, không bằng grep: 465 chuỗi dịch thật** — connections
245 · tracking 121 · api-keys 41 · sso 38 · members 20. Đếm sơ bộ ở S0 ra 269
(242 JSX + ~20 toast + 7 tiêu đề); chân sinh-rồi-trừ thấy 514, trừ 47 dòng kỹ
thuật khai có tên và đọc trong ngữ cảnh còn 465. Bộ quét JSX xác nhận đúng 242
phần của nó; toast ra 23 chứ không phải 20; tiêu đề đúng 7.

Chênh 1,7 lần là **lớp chữ nằm ngoài tầm bộ quét JSX** — 449 chuỗi bối cảnh
`khac` và 56 thuộc tính không kỹ thuật. Đợt một chân này tìm thêm 9 trên 75; ở
dân số gấp ba nó tìm thêm ~196.

**Ba lớp mới so với đợt một, mỗi lớp một tiêu chí riêng:**

- **Đoạn mã người chép** — thẻ `<script>` theo dõi, khoá API vừa tạo, URL cấu
  hình SSO. Người dùng chép chúng dán sang hệ thống khác; dịch lệch một ký tự là
  vỡ site của họ. Sáu file mang vật chép.
- **Vòng đời OAuth** — chưa cắm / đang cắm / đã cắm / cắm lại / đang gỡ. Trạng
  thái nào dựng được trên máy chủ thật phụ thuộc workspace `onehub` đang cắm gì;
  chỉ S3 biết.
- **Câu mẫu mang hoà hợp số nhiều tiếng Anh** — `${n === 1 ? "is" : "are"}` nướng
  vào template. Tiếng Việt không chia số, nên bản dịch đơn giản đi, nhưng đúng
  lớp trật-tự-từ đã vỡ ở vòng ③a.

**Một nợ đợt một đóng trong vòng này:** cần gạt `khong_quet` — khai một dòng loại
trừ có tên thì mọi chân xanh mà không ai hỏi lý do.

**Thước không chép.** Bốn bộ quét đợt một nhận đường dẫn bản khai; thư mục `rang/`
đợt này không chứa logic quét. Hai bản chép trôi nhau là lớp lỗi bảy lần của đợt
một, ở hình dạng khác.

Source input: quyết định chủ kho 04/09 ("bỏ vòng giàn đo, ② ngay") ·
`_acceptance/man-cai-dat-noi-tieng-viet/` (hợp đồng, bằng chứng, 12 phép phá) ·
kiểm kê S0 ngày 04/09

## Criteria

- AC-1: Given mọi route dưới `settings/` NGOÀI hai route đợt một — danh sách route SINH TỪ THƯ MỤC, không gõ tay — dựng trên máy chủ thật hai lượt `vi`/`en`, When phép đo đọc chữ NGƯỜI ĐỌC THẤY từng lượt, Then ba vế cùng đúng trên từng route: số chuỗi hai lượt BẰNG nhau; mỗi cặp cùng vị trí KHÁC nhau trừ bảng không-dịch AC-6; mọi chuỗi lượt `vi` mang dấu. Route nào trả 3xx hoặc tập rỗng là TỪ CHỐI ĐO có tên route, không phải đạt. Số route đo được phải BẰNG số route thư mục sinh ra trừ các route khai không-dựng-được có lý do.
- AC-1b: Given 33 file của lát, When phép đo đọc mã, Then không còn chuỗi người-đọc-thấy viết thẳng trong JSX ngoài miễn trừ có tên, và mọi miễn trừ còn đối tượng thật.
- AC-2: Given BẢNG ĐÓNG các lời gọi `toast.*()` mang chữ — ghim `(file, khoá kho chuỗi)` — When phép đo đọc mã, Then tập nhận ra BẰNG tập bảng theo CẢ HAI CHIỀU; lệch một mục là thoát mã 2 gọi tên mục. Lượt chỉ chuyển tiếp `error.message` không nằm trong bảng và phép đo in số lượt bỏ qua.
- AC-3: Given bảy ô `title` của lát (`generateMetadata` của bảy trang), When phép đo đọc mã, Then số ô nhận ra BẰNG bảy — đếm Ô, không đếm chuỗi — và cả bảy đọc từ kho chuỗi, bản `vi` có dấu.
- AC-4: Given các câu chỉ hiện với người không phải chủ sở hữu và không phải quản trị — kê thành bảng đóng `(file, khoá)` ở S3 sau khi thước AST đếm — When phép đo đọc CÂY CÚ PHÁP, Then mỗi ô còn MỘT NÚT đọc đúng khoá đã khai, bản `vi` có dấu; xoá hẳn khối điều kiện đi làm chân ĐỎ. **Giới hạn khai trước:** đo mức mã, không dựng ra màn — cùng lý do đợt một.
- AC-5: Given sáu câu trạng thái rỗng của lát, When từng trạng thái được dựng trên máy chủ thật, Then câu hiện bằng tiếng Việt có dấu. Trạng thái nào KHÔNG dựng được thì phép đo TỪ CHỐI ĐO có tên (thoát mã 2), không hạ xuống đọc mã rồi ghi đạt; danh sách trạng thái dựng được và không dựng được khai ở S3 và mang sang cổng ký.
- AC-5b: Given vòng đời OAuth — MA TRẬN ĐÓNG bốn nguồn (Google · Microsoft · Slack · hộp nhận) × năm trạng thái (chưa cắm · đang cắm · đã cắm · cắm lại · đang gỡ) = 20 ô, kê ở S3, mỗi ô là một khoá kho chuỗi, hoặc "dùng chung với ô X", hoặc "không tồn tại trong mã" kèm lý do — When phép đo chạy, Then số ô quan sát trên màn (trạng thái đang hiện của `onehub`) + số ô đo mức mã (mỗi khoá còn đúng một nút cây cú pháp đọc nó, bản `vi` có dấu) + số ô khai không-tồn-tại = **20**. Thiếu một ô là thoát mã 2 gọi tên ô. Ma trận in ra output và mang sang cổng ký. Không tự dựng luồng OAuth thật.
- AC-6: Given các giá trị không được dịch — tên thương hiệu và URL mẫu — When màn dựng hai thứ tiếng, Then tập ứng viên SINH TỪ MÀN (`translate="no"` ∪ chuỗi giống hệt hai lượt) BẰNG bảng khai theo CẢ HAI CHIỀU; thiếu hay thừa đều thoát mã 2 gọi tên.
- AC-6b: Given dữ liệu người nhập trên các màn này — tên khoá API, tên miền được phép, tên nhà cung cấp SSO, tên kênh Slack — kê thành bảng đóng `(file, trường dữ liệu)` ở S3, When phép đo chạy, Then HAI chân: chân mã đọc cây cú pháp — phần tử JSX bọc biểu thức của trường đó mang `translate="no"`, khai thẳng là mức mã; chân màn chỉ cho thứ gieo được qua API thật KHÔNG cần OAuth (tạo một khoá API, thêm một tên miền) và in rõ danh sách gieo được / không gieo được mang sang cổng ký. Workspace `onehub` mặc định không có khoá API, không có SSO, không có kênh Slack — nên một chân màn đơn độc sẽ thoát mã 2 vĩnh viễn, và đó là lý do phải tách.
- AC-7: Given mọi chân đo của lát, When một câu tiếng Anh được cắm lại vào TỪNG hình dạng của lát — JSX · title · thuộc tính · từ đơn · mảng lựa chọn · toast (đổi khoá, và giữ khoá thêm chuỗi) · câu không-đủ-quyền bị xoá · **đoạn mã người chép bị dịch một ký tự** — Then ít nhất một chân ĐỎ bằng mã 1 vì nó; mã 2 KHÔNG tính là bắt được. Cây lành thì mọi chân xanh, và cây trả nguyên trạng.
- AC-8: Given chân đo mã và chân ③a cùng chạy, When cả hai báo, Then hai hàng cùng khớp: hàng FILE — số file mỗi chân THẬT SỰ mở BẰNG dân số từ đĩa; hàng VẬT — tập toast nhận ra BẰNG tập bảng theo TẬP, số ô `title` BẰNG bảy. **Giới hạn kế thừa:** chân ③a vọng lại danh sách đầu vào, nên ô của nó trong hàng FILE không thể lệch — nợ có tên, không sửa ở đây vì chạm thước của hồ sơ đã ký.
- AC-9: Given dân số file của lát — bản khai liệt ĐỦ MƯỜI thư mục (gốc năm cụm cộng bốn thư mục con của connections cộng `slack/people`), quét không đệ quy từng thư mục — và bản khai ghim **bốn con số neo lấy từ kiểm kê S0, độc lập với luật quét**: 33 file · 10 route · 6 file có vật chép · 9 file mang `canManage`, When chân đo dựng danh sách, Then số quét ra BẰNG số neo, lệch là thoát mã 2 kèm diff tên file; danh sách sinh từ quét thư mục, KHÔNG gõ tay — thêm một file `.tsx` mang chữ tiếng Anh vào thư mục thì dân số đổi VÀ hai chân đỏ. **Và cần gạt `khong_quet` bị khoá:** một file bị khai loại trừ mà còn mang chuỗi tiếng Anh làm chân ĐỎ kèm tên file — loại trừ chỉ hợp lệ cho file không phải bề mặt của lát, không cho file "khó dịch".
- AC-10: Given bản `vi` dài hơn bản `en`, When mọi route của lát dựng ở 360px hai lượt, Then với mọi phần tử mang nhãn dịch được `scrollWidth ≤ clientWidth`; lượt `en` là đối chứng dương; không miễn trừ `truncate`. **Giới hạn kế thừa:** mù với vùng chứa cho xuống dòng — chứng được "không chỗ nào bị cắt", không chứng "mọi nhãn vừa mắt".
- AC-10b: Given chân bề rộng, When một nhãn `vi` dài được cắm vào một phần tử không xuống dòng, Then chân ĐỎ đúng chiều "vi tràn mà en vừa" kèm hai cặp số, và cây trả nguyên trạng.
- AC-11: Given 33 file, When phép đo lấy MỌI chuỗi rồi TRỪ theo luật có tên — với danh sách thuộc tính JSX kỹ thuật và danh sách khoá object kỹ thuật TÁCH BIỆT — Then không chuỗi nào còn là tiếng Anh. Quét ra 0 chuỗi là từ chối đo. Dòng giữ-nguyên nào không còn đối tượng làm chân ĐỎ.
- AC-12: Given mọi đoạn mã người chép của lát — kê thành bảng đóng ở S3, bảng PHẢI có ít nhất một dòng cho mỗi trong sáu file design nêu (`tracking-script`, `created-api-key-dialog`, `add-sso-provider-sheet`, `sso-table`, `slack-channels`, `google-connection`) — When màn dựng ở TỪNG lượt tiếng, Then mỗi đoạn được so với **nguồn chân lý NGOÀI màn**, không so `vi` với `en` (hai lượt dựng từ cùng một template nên luôn bằng nhau, kể cả khi template sai): thẻ `<script>` so với template dựng từ token workspace đọc trong DB · khoá API so với giá trị API trả về **trong cùng lượt tạo** (mỗi lần tạo ra một giá trị khác, nên so hai lượt tiếng là bất khả thi theo cấu tạo) · URL và giá trị SSO so với cấu hình. Lệch một byte so với nguồn là ĐỎ kèm tên đoạn và vị trí byte. Tập ứng viên SINH TỪ DOM trên MỌI route (phần tử có nút chép, hoặc `code`/`pre` trong `translate="no"`) đối chiếu hai chiều với bảng. Mỗi đoạn nằm trong phần tử mang `translate="no"`.
- AC-13: Given thư mục `rang/` của lát này và của đợt một, When so sánh, Then HAI vế: (1) không thân hàm nào trùng từ 12 dòng trở lên giữa hai thư mục — kể cả các chân chạy trên DOM (`be-rong`, `hai-tieng`) chứ không chỉ chân AST; trùng là ĐỎ kèm tên hai file; (2) các mũi gọi của đợt một chạy lại **không tham số** vẫn thoát 0 và cho đúng con số ghi trong `evidence-report.md` đã ký của đợt một (10 file · 12 toast · 9 ô title) — tức `--lat` mặc định phân giải theo thư mục script, không theo `cwd`, và bằng chứng đã ký tái lập được.

## Coverage

Ba trục giữ khuôn đợt một, mỗi trục thêm một giá trị mới có vật thật trong lát:

- **Trục A — chữ sống ở đâu:** con JSX | thuộc tính | toast | `title` | **chuỗi mẫu ghép câu** | thông điệp kiểm tra dữ liệu (quét ra 0 → Later)
  [thước CE: `moi-chuoi.mjs` đợt một, đã chứng bắt sáu hình dạng bằng đột biến]
- **Trục B — trạng thái màn:** thường | không đủ quyền | đang gửi | rỗng | lỗi | **vòng đời OAuth**
  [thước CE: `canManage` ở 9 file · `isPending` ở 16 file · 6 câu rỗng · `Connected`/`Not connected`/`Reconnect`/`Disconnecting…` đọc được trong mã]
- **Trục C — hạng của chữ:** nhãn | thương hiệu | dữ liệu người nhập | định danh | **đoạn mã người chép**
  [thước CE: 6 file có vật chép; `Slack` ×39 và bốn thương hiệu khác; 3 URL mẫu]

Ô Core → AC: A=JSX → AC-1, AC-1b, AC-11 · A=toast/title → AC-2, AC-3 · B=không đủ
quyền → AC-4 · B=rỗng → AC-5 · **B=OAuth → AC-5b** · C=không dịch → AC-6, AC-6b ·
**C=đoạn mã → AC-12**. Cross-cutting: thước có răng → AC-7, AC-8, AC-9 · chữ dài
→ AC-10, AC-10b · một bộ thước → AC-13.

Không dòng `[GIẢ ĐỊNH]`. Một mục chờ người ở Cổng Phạm vi: câu *"Comp AI reads the
list from Slack after it connects"* — "Comp AI" ở đây là tên ứng dụng Slack đã
đăng ký (giữ, theo quyết định hoãn đổi tên) hay là văn mô tả CRM (đổi thành
OneHub)? Máy không tự quyết.

## Out of scope

- 28 lượt toast chuyển tiếp `error.message` từ API — câu chữ sinh ở `apps/api/src/{sso,api-keys,tracking,users,workspace}`, là `t3_paths`.
- Đổi tên ứng dụng Slack đã đăng ký với Slack — quyết định hoãn từ đầu phiên.
- Dựng luồng OAuth thật để mở các trạng thái cắm/gỡ — chỉ đo trạng thái mặc định trên màn.
- agent-builder — 236 chuỗi, vòng kế.
- Sửa chân ③a vọng lại đầu vào — chạm thước của hồ sơ đã ký.
- Đổi bố cục, component, luồng.

## Notes
