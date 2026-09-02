---
schema_version: 1
feature: Nhãn ứng dụng nói tiếng Việt trên ba luồng của ngưỡng — thêm công ty, ghi hoạt động, cập nhật thoả thuận
slug: nhan-ung-dung-noi-tieng-viet
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Manh Phan
approved_at: 2026-09-02
design_doc: docs/superpowers/specs/2026-09-02-nhan-ung-dung-noi-tieng-viet-design.md
---

# Acceptance Contract: nhan-ung-dung-noi-tieng-viet

## Context

Vòng ③ trong năm vòng của `_acceptance/tieng-viet-cho-crm/opportunity.md`, **lát
đầu**. Vòng ① dựng đường ngôn ngữ, vòng ② mở cho bộ dựng chung nhận chuỗi từ
ngoài. Cả hai xong rồi mà hai người lạ lái thử vẫn nói cùng một câu: *"chỉ có
trang Công ty được dịch"*.

Vòng ③ đầy đủ là 1103 chuỗi trên 143 file — không vừa timebox hai ngày hồ sơ cơ
hội tự khai. Lát này lấy theo **chính ngưỡng nghiệm thu đã viết ở đó**: ba luồng
*thêm một công ty · ghi hoạt động · cập nhật một thoả thuận hợp tác*. Đây là lát
duy nhất làm ngưỡng ấy đo được.

Lát khoanh bằng **đồ thị nhập** từ ba luồng, không bằng thư mục: **92 file, 62
file mang chữ, 569 chuỗi**. Số do máy đếm — `rang/lat.mjs` và `rang/phan-loai.mjs`.

**Vòng này nhận lại năm chuỗi vòng ① đo được rồi định tuyến sang đây** ngày
2026-09-02 (`tieng-viet-cho-crm/decisions.jsonl`, `d-2026-09-02T10:40:00Z-cong2v1`):
`Search companies by name or domain…` · `Archived` · `Views` · `New company` ·
và năm nhãn trạng thái ở `lib/enrichment-status.ts` mà `Not researched` hiện 15
lần. AC-4 là biên nhận của khoản nợ đó.

Source input: prompt · `_acceptance/tieng-viet-cho-crm/opportunity.md`

## Criteria

- AC-1: Given nhân viên đang đọc tiếng Việt, When họ mở màn danh sách công ty, danh sách cá nhân, hoặc danh sách thoả thuận, Then mọi chữ giao diện trên ba màn đó là tiếng Việt, kể cả chữ chỉ hiện ra sau khi mở một menu hay hộp thoại. Dữ liệu người nhập và giá trị từ cơ sở dữ liệu giữ nguyên.
- AC-2: Given nhân viên đang đọc tiếng Việt, When họ mở hồ sơ một bản ghi, cuộn hết các phần và mở hết các tab của nó, Then mọi chữ giao diện trong hồ sơ đó là tiếng Việt.
- AC-3: Given nhân viên đang đọc tiếng Việt, When họ mở dòng thời gian và ghi một hoạt động, Then mọi chữ trình duyệt tự sinh trên đường đi đó là tiếng Việt — nhãn, nút, câu báo lưu xong, câu báo hỏng do trình duyệt sinh. Câu do MÁY CHỦ trả về thuộc vòng ④ và vẫn tiếng Anh; phép đo ép một lỗi thật từ máy chủ rồi GHI LẠI chữ hiện ra, để chỗ đứt nằm trong hồ sơ chứ không bị giấu.
- AC-4: Given năm chuỗi vòng ① định tuyến sang vòng này, When đo lại trên màn công ty, Then cả năm hiện tiếng Việt, và phép đo gọi tên từng chuỗi kèm bản dịch thay thế của nó.
- AC-5: Given 42 chuỗi chỉ trình đọc màn hình nghe được, When đọc cây trợ năng của ba màn, Then chúng là tiếng Việt.
- AC-6: Given 76 chuỗi ghép biến, When số lượng trong câu đổi từ 1 sang nhiều, Then câu tiếng Việt giữ đúng trật tự từ và giữ nguyên danh từ — tiếng Việt không biến hình số nhiều.
- AC-7: Given một trang khai `lang="vi"` có chứa giá trị tiếng Anh từ cơ sở dữ liệu (ví dụ ngành `Software`), When trang vẽ, Then phần tử chứa giá trị đó tự khai `lang="en"`.
- AC-8: Given nhân viên đổi tiếng, When màn vẽ lại, Then chữ trong lát này đổi theo ngay tại chỗ, kể cả ở component mà máy chủ không vẽ lại — trang giữ nguyên, không tải lại.
- AC-9: Given lượt trả về ĐẦU TIÊN của máy chủ, When chưa có JavaScript nào chạy, Then chữ đã là tiếng Việt ngay trong lượt đó — nhân viên thấy tiếng Việt từ khung hình đầu.
- AC-10: Given tiêu đề cột của ba bảng, When màn hiện ở 1024px trở lên, Then không tiêu đề nào bị cắt; When màn hiện ở 768px, Then chỗ nào bị cắt cũng mang dấu ba chấm VÀ chữ đầy đủ tới được trình đọc màn hình.
- AC-11: Given ba trạng thái dữ liệu biên — công ty không có người phụ trách, công ty vừa có hoạt động trong 30 ngày, tên pháp nhân 40–60 ký tự — When màn hiện, Then chữ vẫn tiếng Việt và mọi ô giữ nguyên bố cục.
- AC-12: Given kho chuỗi của vòng này, When trình biên dịch và bộ kiểm chạy, Then một khoá tiếng Việt thiếu làm hỏng bản dựng, và mọi giá trị tiếng Việt mang ít nhất một dấu tiếng Việt.
- AC-14: Given bảy giá trị giai đoạn thoả thuận mà `CONTEXT.md` khai là CHƯA CHỐT NGHĨA, When màn thoả thuận và hồ sơ thoả thuận hiện chúng, Then chúng KHÔNG bị dịch, và mỗi chỗ hiện chúng nằm trong một phần tử tự khai `lang="en"`; phép đo gọi tên đủ bảy giá trị, không trả một con số.
- AC-13: Given bản tiếng Việt của ba luồng, When một nhân viên quan hệ đối tác đọc nó, Then chữ đọc như tiếng Việt của người trong nghề, không phải như một bản dịch máy. (judgment)

## Coverage

Quét bằng skill `morphological-scan`, preset ma-trận-kiểm. Bốn trục, 450 ô, quét
theo lát cắt của trục "nguồn chuỗi"; không gian > 50 ca nên theo preset dùng
**pairwise**, không tích Descartes đầy đủ.

**Thước CE của vòng này là thứ preset đòi và vòng trước để lại: lịch sử lỗi.**
Mỗi lỗi vòng ① và ② tìm ra là một giá trị trục đã bị sót lần trước, nay đưa
ngược vào trục. Đây là thước nội bộ, thật, và mới hai ngày.

- Trục **nguồn chuỗi**: khoá cứng tại chỗ gọi | mặc định của component dùng chung mà chỗ gọi đè được | chuỗi do thư viện ngoài đặt | giá trị dữ liệu từ cơ sở dữ liệu, phải KHÔNG dịch | câu máy chủ trả về (ngoài phạm vi) [thước CE: `[SUY-TỪ-REPO: _acceptance/bo-dung-chung-nhan-chuoi/evidence-report.md]` — vòng ② tìm ra `aria-roledescription` của `dnd-kit` và `aria-label` của `cmdk`, thứ không máy quét mã nào thấy được]
- Trục **nơi hiện ra**: chữ nhìn thấy trên màn | chữ chỉ trình đọc màn hình nghe | chữ trong thông báo nổi | chữ phải mở menu hoặc hộp thoại mới thấy | ngày và số (định dạng, không phải chuỗi) [thước CE: WCAG 2.2 SC 1.3.1 và SC 4.1.2 `[NGÀNH: WCAG 2.2]` · `[SUY-TỪ-REPO: _acceptance/tieng-viet-cho-crm/evidence-report.md]` — vòng ① bỏ sót đúng nhánh "phải mở menu mới thấy" và nhánh "định dạng"]
- Trục **trạng thái dữ liệu và quyền**: rỗng | điển hình | thiếu trường (không người phụ trách, không hoạt động) | biên độ dài (tên 40–60 ký tự) | khối lượng lớn, phân trang | quyền bị từ chối [thước CE: preset ma-trận-kiểm đòi nhánh quyền-bị-từ-chối · `[SUY-TỪ-REPO: _acceptance/tieng-viet-cho-crm/evidence-report.md]` — hai khoá của vòng ① không có phép đo nào vì dữ liệu thử thiếu đúng hai trạng thái này]
- Trục **thời điểm vẽ**: lượt vẽ đầu từ máy chủ | sau khi trình duyệt tiếp quản | ngay sau khi người đổi tiếng, không tải lại trang [thước CE: `[SUY-TỪ-REPO: packages/ui/src/components/table-pagination.tsx]` — vòng ② tìm ra lệch hydrat vì `new Intl.NumberFormat()` ngoặc rỗng, đúng ranh giữa hai giá trị đầu]

Cross-cutting áp mọi ô Core:

- Chuỗi tiếng Việt dài hơn tiếng Anh 20–30% → AC-10.
- Mọi giá trị tiếng Việt mang ít nhất một dấu tiếng Việt → AC-12.
- Một trang một tiếng: chữ khác tiếng phải tự khai tiếng của nó → AC-7,
  WCAG 2.2 SC 3.1.2 `[NGÀNH: WCAG 2.2]`. **Đây là ô Core đến từ chân ngành chứ
  không từ đề bài** — vòng ① và ② đều không có, và nó là lỗ duy nhất chân ngành
  tìm ra mà lịch sử lỗi nội bộ không tìm ra.

Ô cắt sang Later, có tên để khỏi bàn lại: khối lượng lớn và phân trang (vòng ①
đã đo số phân trang khớp hai bên, không có dấu hiệu lỗi mới) · quyền bị từ chối
ở màn danh sách (chỉ hồ sơ bản ghi mới có ô chỉ-đọc).

## Đường đo

Hồ sơ cơ hội của lát này khai bốn dòng ngưỡng. Mỗi thước một dòng: số từ đâu, và
tiêu chí nào bảo đảm nó.

- Nhân viên chạy trọn một luồng mà không phải quay về tiếng Anh · số từ đâu: phiên nghiệm thu với người thật sau khi giao, không phải phép đo máy · bảo đảm bởi AC-1, AC-2, AC-3 phủ ba luồng, và AC-14 gọi tên chỗ ngưỡng SẼ trượt.
- Không gặp một câu tiếng Anh nào ở bước bắt buộc · số từ đâu: chân đo `rang3_*` đếm số lần chuỗi còn lại trên từng màn, số 0 là đạt · bảo đảm bởi AC-1, AC-2, AC-3, AC-4.
- Bản tiếng Việt có đọc gượng hơn bản tiếng Anh không · số từ đâu: hội đồng chấm chữ ở E14, cộng vòng người lạ lái thử sau khi giao · bảo đảm bởi AC-13.
- Timebox hai ngày · số từ đâu: người đối chiếu ngày mở và ngày ký · KHÔNG tiêu chí nào bảo đảm — đây là thước quản trị, không phải thước sản phẩm.

**Ngưỡng vẫn mang tiền tố `[đề xuất]`, tức người chưa chốt.** Máy không gỡ tiền
tố đó. Nếu người muốn ngưỡng thành lời của mình thì gỡ ở `opportunity.md` của
lát này trước khi ký Cổng 1.

## Out of scope

- **Cài đặt** — 308 chuỗi, 36 file. Lát ③b. Người dùng ít, phần lớn là quản trị.
- **Trang khác** — 319 chuỗi, 59 file. Lát ③c.
- **Chữ tác nhân và khung trò chuyện** — 327 chuỗi, vòng ⑤. `docs/agent-panel.md` và bản bàn giao đều gọi đây là vùng rủi ro cao nhất; động vào nó trong một vòng dịch chữ là trộn hai loại rủi ro.
- **Câu lỗi máy chủ trả về** — vòng ④. 107 chỗ đổ nguyên văn câu tiếng Anh của máy chủ lên thông báo nổi. AC-3 vì thế chỉ hứa nhánh trình duyệt, và E3 phải ép một lỗi thật từ máy chủ để chỗ đứt hiện ra trong hồ sơ.
- **Không đặt tên tiếng Việt cho bảy giai đoạn thoả thuận.** `CONTEXT.md` khai chúng CHƯA CHỐT NGHĨA: dữ liệu đang mang bảy bước của một phễu bán phần mềm thừa kế từ kho gốc, không mô tả quy trình hợp tác của OneHub. Dịch một bước không xảy ra là in cái sai ra màn hình bằng thứ tiếng người đọc hiểu được. AC-14 bắt chúng khai đúng tiếng của mình thay vì dịch.
- **Trang giới thiệu công khai của hãng** — 105 chuỗi. Đề nghị bỏ hẳn khỏi cả năm vòng: CRM này là sản phẩm nội bộ không bán ra ngoài.
- **Không thêm thư viện đa ngôn ngữ.** Căn cứ ở design doc, mục "Đường đã chọn".
- **Không dịch dữ liệu người nhập, không thêm ngôn ngữ thứ ba, không đổi tiền tệ, không đổi múi giờ.**

## Notes

Hợp đồng viết TRƯỚC khi có mã.

**Con số ở đây do máy đếm, không do tay gõ.** Chạy
`node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/phan-loai.mjs`. Đây là máy
quét dùng để ĐẾM PHẠM VI. Nó **không được** dùng làm phép đo nghiệm thu — vòng ②
đã giết một máy quét vì một danh sách hình dạng chuỗi không chứng minh được sự
vắng mặt.

**Thước đếm tốt lên bốn lần TRONG vòng, và con số theo đó đổi.** Lúc ký Cổng 1
thước nói 569 chuỗi. Trong lúc lập bảng dịch, mỗi lần siết bỏ đi một loại thứ
**không ai đọc**: chuỗi lớp CSS, giá trị thuộc tính `rel`, tên phím bàn phím, và
chính kho chuỗi vòng ① bị đếm cả bản Anh lẫn bản Việt.

| Thước | Chuỗi khác nhau | Lần xuất hiện |
| --- | ---: | ---: |
| Lúc ký Cổng 1 | 426 | 569 |
| Sau khi siết | **357** | **436** |

Con số ở mục Context là con số lúc ký; con số đúng là 357 / 436. Cả hai được ghi
lại thay vì lặng lẽ thay số — cùng khuôn vòng ② đã đi. Phạm vi KHÔNG đổi: cùng
92 file, cùng ba luồng.

**AC-10 viết lại lời hứa mà vòng ① và ② mâu thuẫn nhau.** AC-9 của vòng ① cấm
tiêu đề cột bị cắt; AC-7 của vòng ② lại quy định tiêu đề bị cắt phải cắt thế nào.
Hai lời hứa nghịch nhau và không ai gỡ. AC-10 gộp cả hai vế thành một tiêu chí
theo bề rộng: **≥1024px thì không được cắt, 768px thì cắt phải có ba chấm và chữ
đầy đủ tới trình đọc màn hình.** Viết trước khi có mã, để người duyệt ở Cổng 1
chứ không phải chữa sau khi thấy kết quả.

**AC-14 là chỗ ngưỡng nghiệm thu suýt chết mà không ai thấy.** Ngưỡng ở hồ sơ cơ
hội đòi *"không ai gặp một câu tiếng Anh nào ở bước bắt buộc"*, và luồng thứ ba
kết bằng đổi giai đoạn thoả thuận. Bảy giá trị giai đoạn là enum từ cơ sở dữ
liệu, nên phép đo sẽ TRỪ chúng ra như dữ liệu và báo xanh, trong khi nhân viên
đứng ở bước cuối nhìn thấy `DEMO_BOOKED`. Người phản biện ngữ cảnh sạch bắt được
chỗ này; xem `gap-probe.md`.

**Vì sao AC-4 tồn tại dù AC-1 đã bao nó.** Vòng ① đóng với AC-6 KHÔNG ĐẠT và
người ký với giới hạn đã khai. Một khoản nợ chuyển vòng mà không có biên nhận thì
biến mất. AC-4 là biên nhận, và nó đòi phép đo **gọi tên từng chuỗi** chứ không
trả một con số — vì một con số không phân biệt được "đã dịch" với "phép đo không
còn nhìn thấy chúng".

**Vì sao AC-12 đo cái thước chứ không đo sản phẩm.** Ba vòng liên tiếp có một
phép đo xanh mà chưa từng chứng minh nó đỏ được. AC-12 bắt kho chuỗi chịu hai
phép đo mà vòng ② đã dựng: trình biên dịch bắt thiếu khoá, và bài kiểm bắt giá
trị tiếng Việt không mang dấu.

**Ba lối đọc và vì sao không có lối thứ tư.** 130 chuỗi nằm trong file `.ts`
thuần nơi hook React không sống được. Vòng ① đã có tiền lệ: hai helper nhận vùng
làm tham số thay vì gọi hook, *"vì chúng là hàm thuần gọi từ hàm thuần khác, và
một hook ở đó sẽ hỏng lúc chạy trong khi vẫn qua trình kiểm kiểu"*.

**Khoảng trống dữ liệu thử đã biết trước.** Máy chủ trả: 0 trên 15 công ty thiếu
người phụ trách, 0 công ty có hoạt động. AC-11 vì thế đòi dựng thêm dữ liệu thử
TRƯỚC khi tin bất kỳ con số nào — nếu không, hai giá trị trục ấy lại không có
phép đo nào che, đúng như vòng ①.

**Đối trọng chuẩn giao diện KHÔNG có.** `_acceptance/config.yaml` khai
`feature_loop.ui_standards_skill: web-design-guidelines` và `design_pass.ds_skill`
cùng giá trị, nhưng **skill đó không tồn tại trên máy này**. Vòng ① và ② cũng đã
chạy S1 mà thiếu đúng cái đối trọng ấy, và không hồ sơ nào ghi lại. Chuẩn giao
diện của vòng này lấy từ `docs/design.md` của kho.

**Đã đọc trước khi viết:** `AGENTS.md` · `CLAUDE.md` · `CONTEXT.md` ·
`docs/design.md` · `docs/api.md` · hồ sơ đầy đủ của vòng ① và vòng ② ·
`packages/ui/src/lib/messages.ts` · `packages/ui/test/messages-guard.spec.ts`.
