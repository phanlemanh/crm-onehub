---
schema_version: 1
feature: Cài đặt còn lại nói tiếng Việt — năm cụm Theo dõi, Kết nối, Khoá API, SSO, Thành viên đọc đúng tiếng của người quản trị, và mọi đoạn mã người chép giữ nguyên từng byte
slug: cai-dat-con-lai-noi-tieng-viet
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-05T07:18:41Z
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

- AC-1: Given mọi route dưới `settings/` NGOÀI hai route đợt một — danh sách route SINH TỪ THƯ MỤC, không gõ tay — dựng trên máy chủ thật hai lượt `vi`/`en`, When phép đo đọc chữ NGƯỜI ĐỌC THẤY từng lượt, Then ba vế cùng đúng trên từng route: số chuỗi hai lượt BẰNG nhau; mỗi cặp cùng vị trí KHÁC nhau trừ bảng không-dịch AC-6; mọi chuỗi lượt `vi` mang dấu, trừ các dòng `mien_dau` khai có tên (từ mượn mà tiếng Việt không thêm dấu — vế dấu là phép đo gần đúng). Chuỗi thuộc khối `ngoai_lat` khai có tên — nguồn nằm ngoài lát và ngoài phạm vi vòng — được trừ khỏi phép đối chiếu, nhưng chúng là GIỚI HẠN ĐÃ KHAI, không phải đã dịch, và phải hiện trong gói Cổng Bằng chứng. Route nào trả 3xx hoặc tập rỗng là TỪ CHỐI ĐO có tên route, không phải đạt. Số route đo được phải BẰNG số route thư mục sinh ra trừ các route khai không-dựng-được có lý do.
- AC-1b: Given 33 file của lát, When phép đo đọc mã, Then không còn chuỗi người-đọc-thấy viết thẳng trong JSX ngoài miễn trừ có tên, và mọi miễn trừ còn đối tượng thật.
- AC-2: Given BẢNG ĐÓNG các lời gọi `toast.*()` mang chữ — ghim `(file, khoá kho chuỗi)` — When phép đo đọc mã, Then tập nhận ra BẰNG tập bảng theo CẢ HAI CHIỀU; lệch một mục là thoát mã 2 gọi tên mục. Lượt chỉ chuyển tiếp `error.message` không nằm trong bảng và phép đo in số lượt bỏ qua.
- AC-3: Given bảy ô `title` của lát (`generateMetadata` của bảy trang), When phép đo đọc mã, Then số ô nhận ra BẰNG bảy — đếm Ô, không đếm chuỗi — và cả bảy đọc từ kho chuỗi, bản `vi` có dấu.
- AC-4: Given các câu chỉ hiện với người không phải chủ sở hữu và không phải quản trị — kê thành bảng đóng `(file, khoá)` ở S3 sau khi thước AST đếm — When phép đo đọc CÂY CÚ PHÁP, Then mỗi ô còn MỘT NÚT đọc đúng khoá đã khai, bản `vi` có dấu; xoá hẳn khối điều kiện đi làm chân ĐỎ. **Giới hạn khai trước:** đo mức mã, không dựng ra màn — cùng lý do đợt một.
- AC-5: Given sáu câu trạng thái rỗng của lát, When từng trạng thái được dựng trên máy chủ thật, Then câu hiện bằng tiếng Việt có dấu. Trạng thái nào KHÔNG dựng được thì phép đo TỪ CHỐI ĐO có tên (thoát mã 2), không hạ xuống đọc mã rồi ghi đạt; danh sách trạng thái dựng được và không dựng được khai ở S3 và mang sang cổng ký.
- AC-5b: Given vòng đời OAuth — MA TRẬN ĐÓNG bốn nguồn (Google · Microsoft · Slack · hộp nhận) × năm trạng thái (chưa cắm · đang cắm · đã cắm · cắm lại · đang gỡ) = 20 ô, kê ở S3, mỗi ô là một khoá kho chuỗi, hoặc "dùng chung với ô X", hoặc "không tồn tại trong mã" kèm lý do — When phép đo chạy, Then số ô quan sát trên màn (trạng thái đang hiện của `onehub`) + số ô đo mức mã (mỗi khoá còn đúng một nút cây cú pháp đọc nó, bản `vi` có dấu) + số ô khai không-tồn-tại = **20**. Thiếu một ô là thoát mã 2 gọi tên ô. Ma trận in ra output và mang sang cổng ký. Không tự dựng luồng OAuth thật.
- AC-6: Given các giá trị không được dịch — tên thương hiệu và URL mẫu — When màn dựng hai thứ tiếng, Then tập ứng viên SINH TỪ MÀN (`translate="no"` ∪ chuỗi giống hệt hai lượt) BẰNG bảng khai theo CẢ HAI CHIỀU; thiếu hay thừa đều thoát mã 2 gọi tên. **Hai lượt phải ra cùng số phần tử có chữ trên mỗi route** — lệch là ĐỎ gọi tên route, vì tập ứng viên khi đó không còn đối xứng và chiều *thừa* sẽ mù với phần đuôi (đúng khúc mà một nhãn mới chưa dịch tạo ra).
- AC-6b: Given dữ liệu người nhập trên các màn này — tên khoá API, tên miền được phép, tên nhà cung cấp SSO, tên kênh Slack — kê thành bảng đóng `(file, trường dữ liệu)` ở S3, When phép đo chạy, Then HAI chân: chân mã đọc cây cú pháp — phần tử JSX bọc biểu thức của trường đó mang `translate="no"`, khai thẳng là mức mã; chân màn chỉ cho thứ gieo được qua API thật KHÔNG cần OAuth (tạo một khoá API, thêm một tên miền) và in rõ danh sách gieo được / không gieo được mang sang cổng ký. Workspace `onehub` mặc định không có khoá API, không có SSO, không có kênh Slack — nên một chân màn đơn độc sẽ thoát mã 2 vĩnh viễn, và đó là lý do phải tách.
- AC-7: Given mọi chân đo của lát, When một câu tiếng Anh được cắm lại vào TỪNG hình dạng của lát — JSX · title · thuộc tính · từ đơn · mảng lựa chọn · toast (đổi khoá, và giữ khoá thêm chuỗi) · câu không-đủ-quyền bị xoá · **đoạn mã người chép bị dịch một ký tự** — Then ít nhất một chân ĐỎ bằng mã 1 vì nó; mã 2 KHÔNG tính là bắt được. Cây lành thì mọi chân xanh, và cây trả nguyên trạng.
- AC-8: Given chân đo mã và chân ③a cùng chạy, When cả hai báo, Then hai hàng cùng khớp: hàng FILE — số file mỗi chân THẬT SỰ mở BẰNG dân số từ đĩa; hàng VẬT — tập toast nhận ra BẰNG tập bảng theo TẬP, số ô `title` BẰNG bảy. **Giới hạn kế thừa:** chân ③a vọng lại danh sách đầu vào, nên ô của nó trong hàng FILE không thể lệch — nợ có tên, không sửa ở đây vì chạm thước của hồ sơ đã ký.
- AC-9: Given dân số file của lát — bản khai liệt ĐỦ MƯỜI thư mục (gốc năm cụm cộng bốn thư mục con của connections cộng `slack/people`), quét không đệ quy từng thư mục — và bản khai ghim **bốn con số neo lấy từ kiểm kê S0, độc lập với luật quét**: 33 file · 10 route · **5** file có vật chép · 9 file mang `canManage` (mẫu nhận diện khai trong bản khai, không gõ trong thước), When chân đo dựng danh sách, Then số quét ra BẰNG số neo, lệch là thoát mã 2 kèm diff tên file; danh sách sinh từ quét thư mục, KHÔNG gõ tay — thêm một file `.tsx` mang chữ tiếng Anh vào thư mục thì dân số đổi VÀ hai chân đỏ. **Thí nghiệm đó phải chạy NỀN trước khi cắm vết**: cả hai chân xanh trên cây lành, nếu không thì thoát mã 2 — chiều xanh gãy thì chiều đỏ không nói lên điều gì. Chân trả mã 2 khi có vết là *chưa đo được* (mã 2), KHÔNG được tính là đã bắt. **Và cần gạt `khong_quet` bị khoá:** một file bị khai loại trừ mà còn mang chuỗi tiếng Anh làm chân ĐỎ kèm tên file — loại trừ chỉ hợp lệ cho file không phải bề mặt của lát, không cho file "khó dịch".
- AC-10: Given bản `vi` dài hơn bản `en`, When mọi route của lát dựng ở 360px hai lượt, Then với mọi phần tử mang nhãn dịch được `scrollWidth ≤ clientWidth`; lượt `en` là đối chứng dương; không miễn trừ `truncate`. **Giới hạn kế thừa:** mù với vùng chứa cho xuống dòng — chứng được "không chỗ nào bị cắt", không chứng "mọi nhãn vừa mắt".
- AC-10b: Given chân bề rộng, When một nhãn `vi` dài được cắm vào một phần tử không xuống dòng, Then chân ĐỎ đúng chiều "vi tràn mà en vừa" kèm hai cặp số, và cây trả nguyên trạng.
- AC-11: Given 33 file, When phép đo lấy MỌI chuỗi rồi TRỪ theo luật có tên — với danh sách thuộc tính JSX kỹ thuật và danh sách khoá object kỹ thuật TÁCH BIỆT — Then không chuỗi nào còn là tiếng Anh. Quét ra 0 chuỗi là từ chối đo. Dòng giữ-nguyên nào không còn đối tượng làm chân ĐỎ.
- AC-12: Given mọi đoạn mã người chép của lát — kê thành bảng đóng ở S3, số file riêng trong bảng BẰNG con số neo `file_vat_chep` của AC-9 (**năm**: `tracking-script`, `created-api-key-dialog`, `add-sso-provider-sheet`, `sso-table`, `slack-channels`; `google-connection` KHÔNG có vật chép nào, danh sách sáu file ở design là đếm sai) — When màn dựng ở TỪNG lượt tiếng, Then mỗi đoạn được so với **nguồn chân lý NGOÀI màn**, không so `vi` với `en` (hai lượt dựng từ cùng một template nên luôn bằng nhau, kể cả khi template sai): thẻ `<script>` so với `tracking.settings` mà chính máy chủ trả về — màn xuống dòng cho dễ đọc nên hai bên cùng gom khoảng trắng **trang trí** trước khi so, mọi ký tự khác so từng byte · khoá API so với giá trị API trả về **trong cùng lượt tạo** (mỗi lần tạo ra một giá trị khác, nên so hai lượt tiếng là bất khả thi theo cấu tạo) · URL và giá trị SSO so với cấu hình. Lệch một byte so với nguồn là ĐỎ kèm tên đoạn và vị trí byte. **Đối chiếu hai chiều, TRONG TẦM VỚI của máy đo này:** (a) mỗi dòng của bảng phải hoặc ĐƯỢC ĐO, hoặc có một dòng khai lý do không đo được — dòng không rơi vào đâu cả là thoát mã 2 gọi tên; (b) mỗi khối `<pre>`/`<code>` sinh từ DOM trên mọi route đã khai phải khớp một nguồn đã so — khối lạ trên màn mà bảng không có dòng nào là ĐỎ. **Giới hạn đã khai:** ba dòng cần vai chủ sở hữu hoặc Slack đã cắm không dựng được trên máy này, nên chiều (a) với chúng chỉ chứng *đã khai lý do*, không chứng *đã đo*. Mỗi đoạn nằm trong phần tử mang `translate="no"`.
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

- 25 lượt toast chuyển tiếp `error.message` từ API — câu chữ sinh ở `apps/api/src/{sso,api-keys,tracking,users,workspace}`, là `t3_paths`.
- Đổi tên ứng dụng Slack đã đăng ký với Slack — quyết định hoãn từ đầu phiên.
- Dựng luồng OAuth thật để mở các trạng thái cắm/gỡ — chỉ đo trạng thái mặc định trên màn.
- agent-builder — 236 chuỗi, vòng kế.
- Sửa chân ③a vọng lại đầu vào — chạm thước của hồ sơ đã ký.
- Đổi bố cục, component, luồng.

## Notes

### Known limits

Đo được ở S3, khai trước khi trình cổng — không để vòng chấm mới lộ.

- **Tám câu quyền Slack vẫn tiếng Anh trên `/settings/connections/slack`.** Nguồn là `packages/auth/src/slack-scopes.ts`; `packages/auth/**` là `t3_paths` nên kéo vào là đổi hạng vòng và thêm một cổng duyệt kế hoạch. Chân đo khai có tên và **in riêng con số 8** ở dòng kết quả — đây là giới hạn, không phải đã dịch.
- **Ba trong sáu trạng thái rỗng không dựng được**, và lý do là **vai trò của tài khoản đo**: `manh.phan@onemount.com` là thành viên, nên `tracking.addDomain`, `tracking.removeDomain` và `tracking.sources` trả 403; trạng thái *chưa có kênh Slack* thì cần Slack đã cắm. Đo được 3/6 (khoá API rỗng · SSO rỗng · lọc thành viên không khớp). Phép đo **từ chối đo** và gọi tên ba ô, không hạ xuống đọc mã.
- **Bảng không-đủ-quyền (AC-4) có chiều thừa từ 05/09**: ứng viên sinh từ cây cú pháp — mọi khoá kho chuỗi nằm ở nhánh sai của đúng điều kiện đã khai — rồi đối chiếu với bảng; khoá có trong mã mà bảng không có là ĐỎ. Chính chiều này tìm ra ô thứ tư `kenh.chepVaDanhDau`, bị sót khi kê tay. Điều kiện phải viết theo khuôn `<biểu thức> === false`; khác khuôn là thoát mã 2.
- **Chân màn của AC-6b đo cả VẬT SẴN CÓ, không chỉ vật gieo được**: bản khai trỏ `nguon_san` tới nơi lấy giá trị thật trong cùng lượt gọi (tên miền `onehub.vn`, bốn email thành viên), mở đúng route rồi đòi `translate="no"`. Sáu phép so thay cho một. Ô khai `do_san_duoc` mà nguồn rỗng, hoặc giá trị không hiện trên màn, đều là đỏ.
- **Nguồn chân lý của AC-12 là `tracking.settings` của chính máy chủ**, không phải bản gõ tay trong phép đo. Màn xuống dòng cho dễ đọc nên hai bên cùng gom khoảng trắng **trang trí** trước khi so; mọi ký tự khác so từng byte. Đột biến `trackingSnippet` trong `packages/db` (writer thật) nay nằm trong bộ vết và làm chân đỏ đúng byte.
- **Bộ đột biến phân biệt *chưa đo được* với *đo mà không bắt*.** Vết mà mọi chân đều thoát mã 2 là tiền đề thiếu (mã 2), không còn bị kết luận là "thước mù". Vết nằm trong mã máy chủ chạy khai `cho_ms` để chờ nạp lại — thiếu nó thì lượt đo rơi vào cửa sổ biên dịch.
- **Ba trong sáu vật khách chép không đo được** vì cùng lý do: URI chuyển hướng ở hộp thêm SSO (nút khoá với vai trò member), URI trên dòng bảng SSO (bảng rỗng), lệnh mời bot Slack (Slack chưa cắm). Bốn lượt đo được đều **khớp từng byte** với nguồn ngoài màn.
- **Một route không dựng được**: `/settings/connections/slack/people` `redirect()` về màn cha khi Slack chưa cắm. Khai có lý do; route đo được 9/9 sau khi trừ.
- **Vế dấu của AC-1 là phép đo gần đúng.** Từ mượn mà tiếng Việt không thêm dấu (`Cookie`) phải khai miễn có tên, nếu không nó báo oan.
- **Chân bề rộng bỏ qua chữ nằm trong hộp ≤1px** (chữ chỉ dành cho trình đọc màn hình). Đến 05/09 nó vẫn đếm ba ô *"Hành động"* loại này là tràn — thước đo đứng sai chỗ, vì không mắt nào nhìn thấy chúng. Vế hai-tiếng KHÔNG bỏ chúng: chúng vẫn phải được dịch. Sau khi sửa, 146 nhãn đo được thay cho 156.
- **Nới một cột**: `/settings/members` cột Vai trò 14%→18% (lấy từ cột Tên 34%→30%) để nhãn tiếng Việt không bị cắt. Đây là đổi bố cục, ngoài lời hứa chỉ-đổi-chữ của vòng.
- **Đổi bố cục thứ hai**: hàng nút cắm Slack trên `/settings/connections/slack` được phép xuống dòng ở 360px. Nút *"Slack chưa cấu hình"* tràn ở CẢ bản Anh (98/67px) — lỗi có sẵn trước vòng, nhưng nó chặn đường về 0 của phép đo bề rộng nên sửa trong vòng.
- **Kéo thêm hai chỗ ngoài lát**: nhãn hạn cookie (`packages/db/src/tracking.ts`, T2) và hai nút cùng một `aria-label` của `components/slack/channel-picker.tsx` — chúng hiện trên màn của lát nên bỏ qua thì AC-1 đỏ.
- **Hai chân đột biến (AC-7, AC-10b) sửa cây tại chỗ và đo qua máy chủ dev đang chạy**, nên chúng không được chạy cùng lúc với chân quan sát nào. Vòng chấm 05/09 lộ điều đó: bộ chạy fan-out của kit cho mọi lệnh chạy song song, E1 đỏ 14 cặp, E13 tràn, và giám khảo E19 đọc đúng nhãn đang bị cắm. Từ 05/09 mọi chân dùng chung một **khoá cây** (`khoa-cay.mjs`): chân đột biến chờ chân quan sát xong rồi giữ cây, chân quan sát chờ đột biến trả nguyên trạng; chờ quá 15 phút là thoát mã 2. Khoá **không** phủ bốn bộ kiểm của kho (`bun run test`, kiểu, lint) — chúng vẫn có thể đọc cây giữa lúc đột biến.
- **AC-5 và AC-12 thoát 0 khi có ít nhất một ô đo được và không ô nào đỏ**; phần không dựng được gọi tên dưới nhãn *GIỚI HẠN ĐÃ KHAI* và đi thẳng sang cổng ký. Bản trước đòi mã 2 khi *có* ô không dựng được — trên máy này (thành viên, Slack chưa cắm) hai eval đó không bao giờ có đường về 0, và kit coi mã 2 là trượt. Chỉ 0 ô đo được mới là mã 2.
- **Chân một-bộ-thước chỉ nói lên điều gì khi thư mục `rang/` đã đủ file.** Nó tự chốt tiền đề bằng cách đòi mọi script mà ổ cắm `cd2_*` trỏ tới phải có mặt; thiếu thì thoát mã 2.

### Nợ có tên — trả trước khi mở đợt agent-builder

Vòng chấm một ra 16 phát hiện. Bảy chỗ đã đóng (bốn chỗ hồ sơ sai, ba chiều đỏ
mù). Chín chỗ còn lại ghi thành nợ, vì chúng **không giấu một lỗi sản phẩm nào
hôm nay** nhưng sẽ giấu khi dân số lớn hơn:

- ~~`chapNhan` là cửa thoát vĩnh viễn cho AC-7~~ — **đã đóng 05/09**: gỡ hẳn cửa; chân nào thoát mã 2 trên cây lành thì chính nó khai tiền đề thiếu, không cần ai viết lý do hộ, và mã 1 trên cây lành vẫn là "chiều xanh gãy". Lý do cũ (`mien_tru` rỗng) quả là sai: chân đó xanh trên cây lành.
- ~~Ba trong bốn con số neo của AC-9 không ai đọc~~ — **đã đóng 05/09**: `route` đếm `page.tsx` trên đĩa, `file_quyen` đếm file khớp mẫu `quyen_mau` khai trong bản khai, `file_vat_chep` so với số file riêng trong bảng đoạn mã chép (kiểm tự-nhất-quán giữa hai bản khai tay, nói rõ là vậy). Đặt hai số thành 999 thì thoát mã 2 kèm tên file.
- **Cần gạt `khong_quet` chưa từng được gạt trong vòng này** — bản khai để rỗng nên thân kiểm không chạy. Nó CÓ răng (thử tay thì đỏ), nhưng vòng này không chứng gì về nó.
- **Ô *chưa có tên miền được phép* khẳng định một lý do không ai đo** — nó chỉ kiểm `domains.length === 0`, không bao giờ gọi `tracking.removeDomain`, mà vẫn in nguyên văn *"tracking.removeDomain từ chối vai trò..."* như bằng chứng.
- **AC-4 mượn lại một lý do chính vòng này đã bác.** Kết luận (đo mức mã) vẫn đúng; căn cứ thì sai — lý do thật là Slack chưa cắm, không phải vai trò tài khoản.
- **Giới hạn ba trạng thái rỗng khai NẶNG hơn sự thật.** Workspace có sẵn một chủ sở hữu và giàn đo hỗ trợ `NGUOI=`; đo bằng chủ sở hữu thì dựng được 4/6 và mở thêm một vật chép.
- **Năm chỗ giữ nguyên chữ "workspace"** trong bản dịch — ba chỗ nói về workspace của Slack (có lý), hai chỗ mơ hồ. Máy không thấy được vì từ nằm trong câu có dấu.


### Vòng chấm bốn — điều khoản dừng-vá đã kích

Vòng bốn (05/09): **18/19 phép đo máy xanh**. E2 đỏ vì một cuộc đua trong chính
khoá cây tôi viết ở vòng ba — chân đọc một tệp khoá vừa bị chân khác xoá; đã vá
và chứng bằng sáu lượt đọc chạy song song với một lượt đột biến. Giám khảo
E19 ra 1 đạt · 1 chưa chắc · 1 không đạt, và **cả hai phiếu không-xanh chỉ vào
cùng một lỗi sản phẩm thật**: chữ *workspace* giữ nguyên ở bốn chỗ nhưng dịch
thành *"công ty này"* ở một chỗ, trong khi `CONTEXT.md` khoá **Công ty** là một
doanh nghiệp trong mạng lưới, không phải nơi làm việc của chính CRM. Đã sửa cho
nhất quán.

**Ba phát hiện đo lường còn lại — vòng thứ tư liên tiếp cùng một lớp lỗi**, nên
điều khoản dừng-vá của bộ kit đã kích. Người chọn **đường thu phạm vi** ngày
05/09: vá hai chỗ rẻ, cho AC-12 chiều hai thật **trong tầm với**, rồi viết lại
ba lời hứa cho khớp thứ thước thật làm và quay lại Cổng Phạm vi. Đã làm:

- **AC-6 không còn cắt cụt bằng `Math.min`.** Hai lượt lệch số phần tử là ĐỎ gọi
  tên route; tập ứng viên duyệt hết lượt `vi`.
- **AC-9 chạy nền trước khi cắm vết**, và mã 2 khi có vết là *chưa đo được*, không
  còn rơi vào nhánh "đã bắt". Bản sinh đôi của bản vá vòng ba, nay đã đồng bộ.
- **AC-12 có chiều hai thật**: mỗi dòng bảng phải *đã đo* hoặc *đã khai lý do
  không đo được* — dòng không rơi vào đâu cả là mã 2 (chứng bằng một dòng bịa:
  đỏ, gọi đúng tên); mỗi khối `<pre>`/`<code>` trên màn phải khớp một nguồn đã
  so. Mảng **năm tên file gõ cứng trong thước đã bỏ**; số file riêng của bảng nay
  đối chiếu với con số neo của AC-9.

Ba lời hứa trong hợp đồng đã viết hẹp lại đúng bằng đó, kèm giới hạn: ba dòng
cần vai chủ sở hữu hoặc Slack đã cắm chỉ chứng *đã khai lý do*, không chứng *đã
đo*. **Vì hợp đồng đổi, vòng phải qua lại Cổng Phạm vi trước khi chấm tiếp.**

Bản ghi cũ của ba nợ, giữ lại để đọc lịch sử:

- **AC-12 hứa đối chiếu hai chiều DOM ↔ bảng, mã không làm.** `ungVien` dựng từ
  DOM nhưng không bao giờ so với `bang.doan`; thứ đóng vai đối chiếu là một mảng
  **năm tên file gõ cứng trong chính script** — bảng khai tay so với bảng khai
  tay. Thêm một dòng khai cho đoạn mã đã biến mất, hoặc để lọt một khối
  `<pre>`/`<code>` mới không khai, đều không làm chân đỏ. Giá: khoảng 40 phút.
- **`chanDanSo` (AC-9) không chạy nền trước khi cắm vết, và tính mã 2 là bắt
  được.** Chân đỏ sẵn vì lý do khác thì thí nghiệm vẫn "đạt". Đây đúng là chỗ
  `dot-bien-lib.mjs` đã sửa ở vòng ba mà bản sinh đôi của nó thì chưa. ~15 phút.
- **`chanKhongDich` (AC-6) cắt cụt tập ứng viên bằng `Math.min`** và không kiểm
  hai độ dài có bằng nhau, nên chiều *thừa* mù với phần đuôi — đúng khúc mà một
  nhãn mới chưa dịch tạo ra. ~5 phút.

### Vòng chấm ba — ba chỗ đo lường đã vá, một chỗ thành nợ

Vòng chấm ba (05/09) trả REJECT với bốn phát hiện đo lường trong hợp đồng. **Ba
chỗ đã đóng**, mỗi chỗ có cặp hai chiều chạy được trên cây này (xem Known
limits): bảng không-đủ-quyền có chiều thừa · chân màn AC-6b đo vật sẵn có ·
nguồn chân lý AC-12 lấy từ máy chủ. Hai phát hiện hạ tầng của vòng cũng đã sửa:
khoá cây không cho chân đột biến chen vào chân đang giữ, và chân gieo dữ liệu
giữ cây trong lúc gieo.

**Một chỗ còn lại là nợ có tên:**

- **Bốn chân màn chưa có đối chứng dương trong bộ đột biến**: `hai-tieng` ·
  `oauth` · `khong-dich` · `du-lieu-nguoi-nhap`. `evals.yaml` mô tả chiều đỏ cho
  từng chân, và ba trong bốn đã được chứng **bằng tay** trong phiên 05/09 (ghim
  `settingsMessages("vi")`; bịa một route vào `route_khong_dung_duoc`; gỡ
  `translate="no"` khỏi một phần tử) — nhưng không lần nào nằm trong `dot-bien`,
  nên vòng sau không tự chạy lại. Giá: mỗi vết cần một lượt chờ máy chủ nạp lại,
  nên bộ đột biến dài thêm khoảng một phút. Trả ở đợt agent-builder.

### Vòng chấm hai — ba chiều đỏ mù đã vá, phần còn lại thành nợ

Vòng chấm hai ra thêm mười một chỗ. **Năm chỗ đã đóng**, mỗi chỗ có cặp hai
chiều chạy được trên cây này:

- **Cửa thoát `route_khong_dung_duoc` giờ có răng.** Trước: thêm một route vào
  danh sách kèm lý do bịa thì chân vẫn xanh — cửa do chính tôi mở, không ai
  kiểm. Nay mỗi dòng khai bị **mở thật bằng trình duyệt**; mở được và đứng đúng
  chỗ là ĐỎ. Xanh 0 với bản khai thật · đỏ 1 khi bịa `/settings/members`.
  Bài học đắt: bản vá đầu dùng mã HTTP, và nó **mù hai lần** — cookie là đối
  tượng nên mọi lượt gọi đều 307 (chưa đăng nhập), rồi khi sửa xong thì hoá ra
  `redirect()` của Next trả **200** kèm lệnh chuyển hướng phía trình duyệt, nên
  mã trạng thái không bao giờ nói lên "vào được hay không". Chân nay có thêm
  một **neo**: route đầu của lát phải mở được, không thì thoát mã 2 — để không
  bao giờ xanh vì mọi thứ đều hỏng.
- **Ma trận OAuth không còn im lặng nuốt một màn.** Trước: màn nào không mở được
  thì in `TU CHOI DO` rồi đi tiếp; ô lẽ ra *quan sát trên màn* tụt xuống *đọc
  mã*, tổng vẫn bằng 20, chân thoát 0. Nay một màn từ chối là **tiền đề thiếu →
  mã 2**; tập chữ gom rỗng cũng mã 2. Xanh 0 hôm nay · đỏ 2 khi ép một màn
  chuyển hướng.
- **Tập ứng viên đoạn mã chép sinh từ MỌI route đã khai**, không còn hai route
  gõ tay. Bốn route, hai lượt tiếng.
- **Chân nói ra tầm với của chính nó.** Trong 16 khối tìm được, chỉ **2 khối
  `<pre>`/`<code>` là chứng cứ** — bỏ thuộc tính bọc chúng thì chân đỏ (đã thử).
  14 khối còn lại được **tìm thấy bằng chính `translate="no"`**, nên chúng không
  khai được gì về việc thiếu thuộc tính. Dòng này in ra mỗi lượt chạy.
- **`.sh` giờ được so bằng bộ tách thân của chính nó.** `khoiSh()` viết ra mà
  chưa từng gọi; `.sh` lọt vào dân số nhưng thân do bộ phân tích TypeScript đọc
  hộ. Nay chép `be-rong-do-lib.sh` sang lát này thì chân đỏ, gọi đúng tên hai
  file và dải dòng 2–61.
- `neo.file_vat_chep` sửa **6 → 5** cho khớp AC-12; mảng `canCo` bỏ phần tử rỗng.

**Sáu chỗ còn lại là nợ có tên** — không chỗ nào giấu một lỗi sản phẩm hôm nay:

- ~~E16 không có đường nào thoát 0 trên máy này~~ — **đổi cách khai 05/09**, xem
  Known limits: ba vật cần vai chủ sở hữu hoặc Slack là *giới hạn đã khai* in
  ra mỗi lượt; sáu vật gieo được khớp từng byte. Nợ còn lại: đo lại bằng chủ sở
  hữu để dựng thêm hai vật.
- **Chân trạng thái rỗng chưa có lưới "tập rỗng không bao giờ là đạt"** ở vế màn.
- **Sáu dòng `decisions.jsonl` trùng `id`** với dòng khác: bộ sinh `id` va nhau
  trong cùng giây. Sổ là append-only nên không sửa lùi; lần sau đổi bộ sinh.
- **Chữ "workspace" giữ nguyên ở BẢY chuỗi `vi`, không phải năm** như nợ vòng
  một ghi. Đếm bằng cách nạp kho chuỗi rồi duyệt mọi giá trị, ngày 05/09.
- **Người đã chốt 05/09: "OneHub" ở cả hai tiếng.** 13 chuỗi `en` đổi từ "Comp
  AI" sang "OneHub" cho khớp bản Việt — câu mô tả nói về sản phẩm này, và kho là
  bản riêng của OneHub. Còn lại một nợ khác loại: **lệnh mời bot `/invite @Comp
  AI` gõ cứng trong mã** (`slack-channels.tsx`). Tên đó phải bằng tên ứng dụng
  Slack đã đăng ký thật ở workspace đang dùng — là cấu hình, không phải bản
  dịch; gõ cứng tên nào cũng sai ở một workspace nào đó. Trả ở đợt sau: đọc từ
  cấu hình hoặc từ Slack trả về sau khi cắm.
