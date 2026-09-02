# Bảng dịch — vòng ③a

Chốt TRƯỚC khi chạm mã. Hội đồng ở E14 chấm đúng bảng này, không chấm chữ chưa
ai khai. Luật vòng ② thừa kế nguyên.

Danh sách chuỗi do máy sinh: `node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/kiem-ke.mjs`
— **421 chuỗi khác nhau, 522 lần xuất hiện**, năm module.

## Luật áp cho từng dòng

1. **Nhãn mang phần ngữ cảnh chưa cấp** (`CONTEXT.md`). Phép thử: xoá một chữ mà
   người đứng ở màn đó vẫn hiểu đúng thì chữ đó thừa. Phép thử phải hỏi người
   thật, không hỏi mình — đó là bài học `Bổ sung` đã trả giá.
2. **Cấm tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật.** Giữ tên thật.
3. **Danh từ sản phẩm theo từ điển:** công ty · cá nhân · thoả thuận hợp tác.
   Cấm: `liên hệ`, `contact`, `deal`, `cơ hội`, `giao dịch`, `khách hàng`.
4. **Mọi giá trị mang ít nhất một dấu tiếng Việt.** Ngoại lệ phải có tên và lý do
   ở mục cuối file này.
5. **Bảy giai đoạn thoả thuận KHÔNG dịch** — AC-14. Chúng chưa ai định nghĩa.

## Ngoại lệ khỏi luật dấu tiếng Việt

Vòng ② nhắm tới danh sách RỖNG và đạt được, với 43 khoá. Ở 357 chuỗi thì không
sống được: tiếng Việt có từ vốn không mang dấu, và có chuỗi chỉ gồm biến. Luật vì
thế đổi hình — **không đòi danh sách rỗng, mà đòi mọi dòng trong danh sách có tên
và lý do**, đúng khuôn AC-6 của vòng ②. Máy đối chiếu hai bên: khoá nào không dấu
mà không có tên ở đây thì phép đo đỏ.

| Khoá | Giá trị | Loại | Vì sao |
| --- | --- | --- | --- |
| `headers.email` · `standard.email` · `timeline.tabs.emails` · `contact.emails` · `company.fields.email` · `company.contactColumns.email` · `timeline.type.email` · `contact.fields.email` · `deal.contactColumns.email` | `Email` | từ mượn | `CONTEXT.md` cấm đúc từ ghép cho thuật ngữ kỹ thuật; "thư điện tử" là từ người dùng không tự nói |
| `standard.website` · `company.fields.website` | `Website` | từ mượn | như trên |
| `standard.linkedin` · `contact.fields.linkedin` | `LinkedIn` | tên riêng | tên sản phẩm, không dịch |
| `contact.fields.x` | `X` | tên riêng | tên mạng xã hội, một chữ cái |
| `standard.github` · `contact.fields.github` | `GitHub` | tên riêng | tên sản phẩm, không dịch |
| `timeline.viaGmail` | `qua Gmail` | từ Việt không dấu + tên riêng | "qua" là từ tiếng Việt vốn không mang dấu |
| `timeline.composer.log` | `Ghi ${type}` | từ Việt không dấu | "Ghi" là từ tiếng Việt vốn không mang dấu |
| `timeline.stageChange` | `${a} → ${b}` | chỉ có biến | hai đầu là giai đoạn thoả thuận, không dịch |
| `deal.currencyEntry` | `${code} · ${name}` | chỉ có biến | mã và tên tiền tệ do máy chủ trả |
| `deal.candidateTitle` | ` · ${title}` | chỉ có biến | chức danh do người nhập |
| `deal.namePlaceholder` | `${name} — OneHub` | biến + tên riêng | ví dụ trong ô nhập; OneHub là tên công ty |
| `stage.*` (bảy khoá) | `Demo booked` … `Unqualified` | không dịch theo hợp đồng | AC-14 — bảy bước chưa ai định nghĩa nghĩa |

---

## companies — 11 chuỗi

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `bulk.reassigned` | `${n} reassigned.` | `Đã đổi người phụ trách cho ${n}.` | câu ghép biến; tiếng Việt đảo trật tự — chủ ngữ là hành động |
| `bulk.enriching` | `Looking up ${n} — the table will update.` | `Đang tra cứu ${n} — bảng sẽ tự cập nhật.` | |
| `bulk.archived` | `${n} archived.` | `Đã lưu trữ ${n}.` | |
| `bulk.restored` | `${n} restored.` | `Đã khôi phục ${n}.` | |
| `bulk.deleted` | `${n} deleted forever.` | `Đã xoá vĩnh viễn ${n}.` | |
| `bulk.confirmDelete` | `Delete ${n} forever?` | `Xoá vĩnh viễn ${n}?` | |
| `bulk.cannotUndo` | `This cannot be undone.` | `Việc này không hoàn tác được.` | |
| `bulk.nobody` | `Nobody` | `Không ai` | tuỳ chọn "gỡ người phụ trách" trong menu giao việc |
| `search` | `Search companies by name or domain…` | `Tìm công ty theo tên hoặc tên miền…` | **nợ vòng ①** |
| `created` | `${name} added.` | `Đã thêm ${name}.` | |
| `namePlaceholder` | `Stripe` | `Đất Xanh` | ví dụ trong ô nhập; đổi sang tên công ty Việt để người nhập hình dung đúng |

## contacts — 32 chuỗi

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `title` | `Contacts` | `Cá nhân` | tên màn; từ điển đã chốt |
| `description` | `Every person in the network.` | `Mọi cá nhân trong mạng lưới.` | |
| `headers.name` | `Name` | `Tên` | dòng đã là một người nên bỏ "người" |
| `headers.title` | `Title` | `Chức danh` | |
| `headers.email` | `Email` | `Email` | ngoại lệ dấu, xem mục trên |
| `headers.company` | `Company` | `Công ty` | |
| `headers.owner` | `Owner` | `Phụ trách` | cột không thể là vật nên bỏ "người" |
| `headers.created` | `Created` | `Ngày tạo` | |
| `headers.lastActivity` | `Last activity` | `Hoạt động gần nhất` | dùng lại đúng chữ vòng ① đã chốt — cùng một cột trên ba màn phải đọc giống nhau |
| `headers.archived` | `Archived` | `Ngày lưu trữ` | vòng ① đã chốt; ô dưới cột là một ngày |
| `labels.createdDate` | `Created date` | `Ngày tạo` | dạng dài trong menu |
| `labels.archivedDate` | `Archived date` | `Ngày lưu trữ` | |
| `empty` | `No contacts match this view.` | `Chưa có cá nhân nào khớp bộ lọc này.` | |
| `emptyArchived` | `No archived contacts.` | `Chưa có cá nhân nào đã lưu trữ.` | |
| `search` | `Search contacts by name or email…` | `Tìm cá nhân theo tên hoặc email…` | |
| `noCompany` | `No company` | `Chưa thuộc công ty nào` | ô trống, không phải nhãn phủ định |
| `facets.owner` | `Owner` | `Phụ trách` | |
| `facets.unassigned` | `Unassigned` | `Chưa giao` | |
| `facets.company` | `Company` | `Công ty` | |
| `facets.activity` | `Activity` | `Hoạt động` | |
| `bulk.reassigned` | `${n} reassigned.` | `Đã đổi người phụ trách cho ${n}.` | |
| `bulk.moved` | `${n} moved.` | `Đã chuyển ${n} sang công ty khác.` | "moved" một mình không nói chuyển đi đâu |
| `bulk.enriching` | `Looking up ${n} — the table will update.` | `Đang tra cứu ${n} — bảng sẽ tự cập nhật.` | |
| `bulk.archived` | `${n} archived.` | `Đã lưu trữ ${n}.` | |
| `bulk.restored` | `${n} restored.` | `Đã khôi phục ${n}.` | |
| `bulk.deleted` | `${n} deleted forever.` | `Đã xoá vĩnh viễn ${n}.` | |
| `bulk.confirmDelete` | `Delete ${n} forever?` | `Xoá vĩnh viễn ${n}?` | |
| `bulk.deleteWarning` | `Their email addresses are suppressed, so the inbox sync will not file them again. This cannot be undone.` | `Địa chỉ email của họ bị chặn, nên hộp thư sẽ không tự thêm lại. Việc này không hoàn tác được.` | |
| `bulk.nobody` | `Nobody` | `Không ai` | |
| `bulk.chooseCompany` | `Choose a company` | `Chọn công ty` | |
| `created` | `${name} added.` | `Đã thêm ${name}.` | |
| `namePlaceholder` | `Jane Cooper` | `Nguyễn Thị Lan` | ví dụ trong ô nhập |

## deals — 34 chuỗi

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `title` | `Deals` | `Thoả thuận` | màn đã nói "thoả thuận" nên bỏ "hợp tác" |
| `description` | `Every partnership in the network.` | `Mọi thoả thuận hợp tác trong mạng lưới.` | câu mô tả có chỗ nên nói đủ |
| `headers.name` | `Deal` | `Tên` | dòng đã là một thoả thuận |
| `headers.company` | `Company` | `Công ty` | |
| `headers.stage` | `Stage` | `Giai đoạn` | nhãn CỘT dịch; bảy GIÁ TRỊ trong cột thì không — AC-14 |
| `headers.amount` | `Amount` | `Giá trị` | "số tiền" nói sai loại: đây là giá trị thoả thuận |
| `headers.owner` | `Owner` | `Phụ trách` | |
| `headers.closeDate` | `Close date` | `Ngày chốt` | |
| `headers.created` | `Created` | `Ngày tạo` | |
| `headers.lastActivity` | `Last activity` | `Hoạt động gần nhất` | dùng lại đúng chữ vòng ① đã chốt — cùng một cột trên ba màn phải đọc giống nhau |
| `headers.archived` | `Archived` | `Ngày lưu trữ` | vòng ① đã chốt; ô dưới cột là một ngày |
| `labels.createdDate` | `Created date` | `Ngày tạo` | |
| `labels.archivedDate` | `Archived date` | `Ngày lưu trữ` | |
| `closing` | `Closing` | `Sắp chốt` | nhóm theo hạn chốt |
| `empty` | `No deals match this view.` | `Chưa có thoả thuận nào khớp bộ lọc này.` | |
| `emptyArchived` | `No archived deals.` | `Chưa có thoả thuận nào đã lưu trữ.` | |
| `search` | `Search deals by name or company…` | `Tìm thoả thuận theo tên hoặc công ty…` | |
| `tabs.all` | `All deals` | `Tất cả` | thanh tab đã đứng trên màn thoả thuận |
| `tabs.open` | `Open` | `Đang mở` | đúng ví dụ trong `CONTEXT.md` |
| `tabs.closed` | `Closed` | `Đã chốt` | |
| `bulk.reassigned` | `${n} reassigned.` | `Đã đổi người phụ trách cho ${n}.` | |
| `bulk.moved` | `${n} moved.` | `Đã chuyển ${n} sang công ty khác.` | |
| `bulk.archived` | `${n} archived.` | `Đã lưu trữ ${n}.` | |
| `bulk.restored` | `${n} restored.` | `Đã khôi phục ${n}.` | |
| `bulk.deleted` | `${n} deleted forever.` | `Đã xoá vĩnh viễn ${n}.` | |
| `bulk.confirmDelete` | `Delete ${n} forever?` | `Xoá vĩnh viễn ${n}?` | |
| `bulk.deleteWarning` | `Everything filed against them — activity, notes, the amounts in your pipeline — goes too. This cannot be undone.` | `Mọi thứ gắn với chúng — hoạt động, ghi chú, giá trị đang tính — mất theo. Việc này không hoàn tác được.` | |
| `bulk.closeLost` | `Close ${n} as lost` | `Chốt ${n} là không thành` | "thua" nói sai bản chất quan hệ hợp tác |
| `bulk.markUnqualified` | `Mark ${n} as unqualified` | `Đánh dấu ${n} là chưa phù hợp` | |
| `bulk.reasonPlaceholder` | `Budget pulled for the quarter` | `Đối tác hoãn sang quý sau` | ví dụ lý do; bản gốc nói chuyện ngân sách bán hàng |
| `bulk.nobody` | `Nobody` | `Không ai` | |
| `bulk.chooseOwner` | `Choose an owner` | `Chọn người phụ trách` | |
| `create.currency` | `Currency` | `Tiền tệ` | |
| `create.noDate` | `No date yet` | `Chưa có ngày` | **nợ vòng ②**, chuỗi mặc định đè được |
| `create.namePlaceholder` | `Stripe — Comp AI` | `Đất Xanh — OneHub` | ví dụ; bản gốc còn mang tên hãng cũ |

---

## Con số đã đổi trong vòng, và vì sao

Hợp đồng ký ở Cổng 1 khai **569 chuỗi**. Trong lúc lập bảng dịch, thước đếm được
siết bốn lần và mỗi lần bỏ đi một loại thứ **không ai đọc**: chuỗi lớp CSS, giá
trị thuộc tính `rel`, tên phím bàn phím, và chính kho chuỗi vòng ① (bị đếm cả
bản Anh lẫn bản Việt).

| Thước | Chuỗi khác nhau | Lần xuất hiện |
| --- | ---: | ---: |
| Lúc ký Cổng 1 | 426 | 569 |
| Sau khi siết | **357** | **436** |

Con số ở hợp đồng là con số lúc ký; con số đúng là 357 / 436. Đây là cùng khuôn
vòng ② đã đi — thước tốt lên trong vòng thì con số theo đó đổi, và cả hai được
ghi lại thay vì lặng lẽ thay số.

---

## crm — 170 chuỗi

### Bảy giai đoạn thoả thuận — KHÔNG DỊCH (AC-14)

`lib/deal-stage.ts`. `CONTEXT.md` khai chúng CHƯA CHỐT NGHĨA: dữ liệu đang mang
bảy bước của một phễu bán phần mềm thừa kế từ kho gốc, không mô tả quy trình hợp
tác của OneHub. Giữ nguyên, bọc trong phần tử khai `lang="en"`.

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `stage.DEMO_BOOKED` | `Demo booked` | `Demo booked` | KHÔNG dịch — AC-14 |
| `stage.QUALIFIED_TO_BUY` | `Qualified to buy` | `Qualified to buy` | KHÔNG dịch — AC-14 |
| `stage.DECISION_MAKER_IN` | `Decision maker in` | `Decision maker in` | KHÔNG dịch — AC-14 |
| `stage.CONTRACT_SENT` | `Contract sent` | `Contract sent` | KHÔNG dịch — AC-14 |
| `stage.CLOSED_WON` | `Closed won` | `Closed won` | KHÔNG dịch — AC-14 |
| `stage.CLOSED_LOST` | `Closed lost` | `Closed lost` | KHÔNG dịch — AC-14 |
| `stage.UNQUALIFIED` | `Unqualified` | `Unqualified` | KHÔNG dịch — AC-14 |

### Dòng thời gian — ô soạn

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `timeline.composer.placeholder` | `Log a note, call, email, meeting or task…` | `Ghi một ghi chú, cuộc gọi, email, cuộc họp hoặc việc cần làm…` | |
| `timeline.composer.call` | `What came out of the call?` | `Cuộc gọi đi tới đâu?` | |
| `timeline.composer.note` | `What was said?` | `Hai bên đã nói gì?` | |
| `timeline.composer.meeting` | `What came out of the meeting?` | `Cuộc họp đi tới đâu?` | |
| `timeline.composer.task` | `What needs doing?` | `Cần làm gì?` | |
| `timeline.composer.happened` | `What happened` | `Đã xảy ra chuyện gì` | |
| `timeline.composer.dueDate` | `Due date` | `Hạn hoàn thành` | |
| `timeline.composer.addTask` | `Add task` | `Thêm việc cần làm` | |
| `timeline.composer.log` | `Log ${type}` | `Ghi ${type}` | |

### Dòng thời gian — mục và bộ lọc

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `timeline.tabs.all` | `All` | `Tất cả` | |
| `timeline.tabs.notes` | `Notes` | `Ghi chú` | |
| `timeline.tabs.emails` | `Emails` | `Email` | ngoại lệ dấu, xem mục đầu |
| `timeline.tabs.meetings` | `Meetings` | `Cuộc họp` | |
| `timeline.tabs.upcoming` | `Upcoming` | `Sắp tới` | |
| `timeline.tabs.done` | `Done` | `Đã xong` | |
| `timeline.oneMessage` | `1 message` | `1 thư` | |
| `timeline.messages` | `${n} messages` | `${n} thư` | tiếng Việt không thêm đuôi số nhiều |
| `timeline.viaGmail` | `via Gmail` | `qua Gmail` | tên sản phẩm giữ nguyên |
| `timeline.viaCalendar` | `via Calendar` | `qua Lịch` | |
| `timeline.stageChange` | `${a} → ${b}` | `${a} → ${b}` | hai đầu là giai đoạn, không dịch |
| `timeline.markNotDone` | `Mark as not done` | `Đánh dấu chưa xong` | |
| `timeline.markDone` | `Mark as done` | `Đánh dấu đã xong` | |
| `timeline.due` | `Due` | `Hạn` | |
| `timeline.today` | `Today` | `Hôm nay` | |
| `timeline.yesterday` | `Yesterday` | `Hôm qua` | |
| `timeline.outstanding` | `Outstanding` | `Chưa xong` | |
| `timeline.type.note` | `Note` | `Ghi chú` | |
| `timeline.type.call` | `Call` | `Cuộc gọi` | |
| `timeline.type.meeting` | `Meeting` | `Cuộc họp` | |
| `timeline.type.task` | `Task` | `Việc cần làm` | |
| `timeline.type.stageChange` | `Stage change` | `Đổi giai đoạn` | |
| `timeline.type.enrichment` | `Enrichment` | `Bổ sung dữ liệu` | vòng ① đã chốt |

### Dòng thời gian — trạng thái rỗng

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `timeline.empty.allTitle` | `Nothing has happened yet` | `Chưa có gì xảy ra` | |
| `timeline.empty.allBody` | `Calls, notes, emails and meetings all land here. Log the first one above, or wait for Gmail and Calendar to sync.` | `Cuộc gọi, ghi chú, email và cuộc họp đều về đây. Ghi cái đầu tiên ở trên, hoặc chờ Gmail và Lịch đồng bộ.` | |
| `timeline.empty.notesTitle` | `No notes` | `Chưa có ghi chú` | |
| `timeline.empty.notesBody` | `Notes are what you write down for the next person to read — what they care about, who else is involved, what you promised.` | `Ghi chú là thứ bạn viết cho người sau đọc — họ quan tâm điều gì, còn ai liên quan, bạn đã hứa gì.` | |
| `timeline.empty.emailTitle` | `No email` | `Chưa có email` | |
| `timeline.empty.emailBody` | `Threads appear here as they are synced from Gmail. Nothing from before this mailbox was connected is imported.` | `Các luồng thư hiện ở đây khi Gmail đồng bộ về. Thư có trước lúc kết nối hộp thư này thì không được nạp.` | |
| `timeline.empty.meetingsTitle` | `No meetings` | `Chưa có cuộc họp` | |
| `timeline.empty.meetingsBody` | `Calendar events with someone from this record on them show up here, past and upcoming.` | `Sự kiện trên Lịch có người của hồ sơ này tham dự sẽ hiện ở đây, cả đã qua lẫn sắp tới.` | |
| `timeline.empty.upcomingTitle` | `Nothing outstanding` | `Không còn việc nào` | |
| `timeline.empty.upcomingBody` | `Tasks you have not finished appear here, and at the top of the All tab until they are done.` | `Việc bạn chưa làm xong hiện ở đây, và nằm trên đầu mục Tất cả cho tới khi xong.` | |
| `timeline.empty.doneTitle` | `Nothing finished yet` | `Chưa xong việc nào` | |
| `timeline.empty.doneBody` | `Tasks move here once you tick them off.` | `Việc chuyển về đây khi bạn đánh dấu đã xong.` | |

### Trạng thái bổ sung dữ liệu — nợ vòng ①

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `enrichment.pending` | `Not researched` | `Chưa tra cứu` | **nợ vòng ①**, hiện 15 lần |
| `enrichment.running` | `Researching` | `Đang tra cứu` | **nợ vòng ①** |
| `enrichment.complete` | `Enriched` | `Đã bổ sung` | **nợ vòng ①** |
| `enrichment.failed` | `Enrichment failed` | `Bổ sung dữ liệu hỏng` | **nợ vòng ①** |
| `enrichment.skipped` | `Nothing found` | `Không tìm thấy gì` | **nợ vòng ①** |
| `enrichment.queued` | `Queued` | `Đang chờ` | **nợ vòng ①** |
| `enrichment.lookingUp` | `Looking it up — this page will update when it finishes.` | `Đang tra cứu — trang sẽ tự cập nhật khi xong.` | |
| `enrichment.brief` | `Researching — the brief lands on the timeline when it finishes.` | `Đang tra cứu — bản tóm tắt sẽ về dòng thời gian khi xong.` | |
| `enrichment.already` | `Already researching.` | `Đang tra cứu rồi.` | |
| `enrichment.againRunning` | `Already running.` | `Đang chạy rồi.` | |
| `enrichment.again` | `Taking another look — this page will update when it finishes.` | `Đang tra cứu lại — trang sẽ tự cập nhật khi xong.` | |
| `enrichment.agentResearching` | `Agent is researching` | `Tác nhân đang tra cứu` | |
| `enrichment.notKnown` | `Not known yet` | `Chưa biết` | |

### Chữ thời gian tương đối — nợ vòng ①

Chỉ hiện khi có công ty hoạt động trong 30 ngày. Vòng ① không đo được vì dữ liệu
thử thiếu đúng trạng thái đó; Task 1 vòng này đã dựng.

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `time.justNow` | `just now` | `vừa xong` | **nợ vòng ①** |
| `time.minutes` | `${n}m` | `${n} phút` | hậu tố một chữ cái không đọc được trong tiếng Việt |
| `time.hours` | `${n}h` | `${n} giờ` | |
| `time.days` | `${n}d` | `${n} ngày` | |
| `time.in` | `in ${d}` | `sau ${d} nữa` | |
| `time.ago` | `${d} ago` | `${d} trước` | **nợ vòng ①** — chuỗi thứ năm |

### Lọc theo mức hoạt động

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `activity.7` | `Active within 7 days` | `Có hoạt động trong 7 ngày` | |
| `activity.30` | `Active within 30 days` | `Có hoạt động trong 30 ngày` | |
| `activity.90` | `Active within 90 days` | `Có hoạt động trong 90 ngày` | |

### Hạn chốt thoả thuận

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `closing.overdue` | `Overdue` | `Quá hạn` | |
| `closing.thisMonth` | `Closing this month` | `Chốt trong tháng này` | |
| `closing.nextMonth` | `Closing next month` | `Chốt tháng sau` | |
| `closing.later` | `Later` | `Muộn hơn` | |
| `closing.none` | `No close date` | `Chưa có ngày chốt` | |

### Đóng một thoả thuận

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `close.done` | `Deal closed.` | `Đã chốt thoả thuận.` | |
| `close.asLost` | `Close as lost` | `Chốt là không thành` | bản gốc nói thắng-thua; đây là quan hệ hợp tác |
| `close.unqualified` | `Mark as unqualified` | `Đánh dấu là chưa phù hợp` | |
| `close.lostReason` | `What did we lose it to? This is the only place that answer gets recorded.` | `Vì sao không thành? Đây là chỗ duy nhất câu trả lời được ghi lại.` | bản gốc giả định có đối thủ giành mất |
| `close.unqualifiedReason` | `Why is this not a fit? It goes on the timeline so nobody re-runs the same deal.` | `Vì sao chưa phù hợp? Câu này lên dòng thời gian để không ai làm lại từ đầu.` | |
| `close.reasonPlaceholder` | `Went with an incumbent vendor` | `Đối tác đã có bên hợp tác khác` | |
| `close.reason` | `Reason` | `Lý do` | |
| `close.stageUpdated` | `Stage updated.` | `Đã đổi giai đoạn.` | |

### Chọn công ty

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `companyPicker.search` | `Search companies…` | `Tìm công ty…` | |
| `companyPicker.searching` | `Searching…` | `Đang tìm…` | |
| `companyPicker.noMatch` | `No company matches.` | `Không công ty nào khớp.` | |
| `companyPicker.choose` | `Choose a company` | `Chọn công ty` | |
| `companyPicker.none` | `None` | `Không chọn` | |

### Người phụ trách

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `owner.label` | `Owner` | `Phụ trách` | |
| `owner.unassigned` | `Unassigned` | `Chưa giao` | |
| `owner.formerMember` | `Former member` | `Đã rời đội` | |

### Hoạt động trên website

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `web.title` | `Website activity` | `Hoạt động trên website` | |
| `web.pageViews` | `Page views` | `Lượt xem trang` | |
| `web.lastSeen` | ` · last seen ` | ` · lần cuối ` | |
| `web.originalSource` | `Original source` | `Nguồn đầu tiên` | |
| `web.topPage` | `Top page` | `Trang xem nhiều nhất` | |
| `web.latestSource` | `Latest source` | `Nguồn gần nhất` | |
| `web.firstSeen` | `First seen` | `Lần đầu thấy` | |
| `web.campaign` | `Campaign` | `Chiến dịch` | |
| `web.unknown` | `Unknown` | `Không rõ` | |

### Gợi ý của tác nhân

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `facts.added` | `Added to the record.` | `Đã thêm vào hồ sơ.` | |
| `facts.dismissed` | `Dismissed — it won't be suggested again.` | `Đã bỏ hẳn — sẽ không gợi ý lại.` | "bỏ qua" nói sai: bấm là vĩnh viễn |
| `facts.pricing` | `Pricing` | `Bảng giá` | |
| `facts.careers` | `Careers` | `Tuyển dụng` | |

### Trường tuỳ chỉnh

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `fields.filledOf` | `${entity} · ${a} of ${b} filled` | `${entity} · đã điền ${a}/${b}` | |
| `fields.filledOn` | `Filled on ${a} of ${b} ${noun}` | `Đã điền ở ${a}/${b} ${noun}` | |
| `fields.stillToGo` | `${n} still to go` | `Còn ${n} nữa` | |
| `fields.type.text` | `Text — a short line` | `Chữ — một dòng ngắn` | |
| `fields.type.longText` | `Long text — a paragraph` | `Chữ dài — một đoạn` | |
| `fields.type.number` | `Number` | `Số` | |
| `fields.type.date` | `Date` | `Ngày` | |
| `fields.type.checkbox` | `Checkbox — yes or no` | `Ô đánh dấu — có hoặc không` | |
| `fields.type.select` | `Select — one of a fixed list` | `Chọn — một trong danh sách cố định` | |
| `fields.type.user` | `User — someone in the workspace` | `Người — một người trong không gian làm việc` | |
| `fields.agentsPickUp` | `Your agents will pick this up.` | `Tác nhân của bạn sẽ dùng trường này.` | |
| `fields.shapesCompany` | `This shapes every company in your CRM.` | `Trường này áp cho mọi công ty trong CRM.` | |
| `fields.shapesContact` | `This shapes every contact in your CRM.` | `Trường này áp cho mọi cá nhân trong CRM.` | |
| `fields.shapesDeal` | `This shapes every deal in your CRM.` | `Trường này áp cho mọi thoả thuận trong CRM.` | |
| `fields.createHint` | `Create dynamic fields that your agents can research and pre-fill.` | `Tạo trường động để tác nhân tra cứu và điền sẵn.` | |
| `fields.retry` | `Your fields are still there. Try again in a moment, before you create anything new.` | `Trường của bạn vẫn còn. Thử lại sau một lát, trước khi tạo thêm gì mới.` | |
| `fields.keyHint` | `What the API and your agents call it. Set from the label, fixed once saved — renaming the label later never breaks a caller.` | `Tên mà API và tác nhân gọi. Sinh từ nhãn, cố định sau khi lưu — đổi nhãn về sau không làm hỏng chỗ gọi nào.` | |
| `fields.agentHint` | `They propose a value with a source, and never overwrite yours.` | `Tác nhân đề xuất giá trị kèm nguồn, và không bao giờ ghi đè giá trị của bạn.` | |
| `fields.emptyHint` | `Leave it empty and your agents work from the label and type alone.` | `Để trống thì tác nhân chỉ dựa vào nhãn và kiểu.` | |
| `fields.option` | `Option ${n}` | `Lựa chọn ${n}` | |
| `fields.optionCount` | `${n} options` | `${n} lựa chọn` | |
| `fields.showCompany` | `Show on the company sheet` | `Hiện trên hồ sơ công ty` | |
| `fields.showContact` | `Show on the contact sheet` | `Hiện trên hồ sơ cá nhân` | |
| `fields.showDeal` | `Show on the deal sheet` | `Hiện trên hồ sơ thoả thuận` | |
| `fields.columnCompany` | `Offer as a column on the Companies table` | `Cho chọn làm cột ở bảng Công ty` | |
| `fields.columnContact` | `Offer as a column on the Contacts table` | `Cho chọn làm cột ở bảng Cá nhân` | |
| `fields.columnDeal` | `Offer as a column on the Deals table` | `Cho chọn làm cột ở bảng Thoả thuận` | |
| `fields.filterCompany` | `Offer as a filter on the Companies table` | `Cho chọn làm bộ lọc ở bảng Công ty` | |
| `fields.filterContact` | `Offer as a filter on the Contacts table` | `Cho chọn làm bộ lọc ở bảng Cá nhân` | |
| `fields.filterDeal` | `Offer as a filter on the Deals table` | `Cho chọn làm bộ lọc ở bảng Thoả thuận` | |

### Trường sẵn có

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `standard.name` | `Name` | `Tên` | |
| `standard.domain` | `Domain` | `Tên miền` | |
| `standard.website` | `Website` | `Website` | tên thật, giữ nguyên; ngoại lệ dấu |
| `standard.industry` | `Industry` | `Ngành` | |
| `standard.city` | `City` | `Thành phố` | |
| `standard.country` | `Country` | `Quốc gia` | |
| `standard.firstName` | `First name` | `Tên` | |
| `standard.lastName` | `Last name` | `Họ` | tiếng Việt đảo thứ tự: họ đứng trước |
| `standard.title` | `Title` | `Chức danh` | |
| `standard.email` | `Email` | `Email` | ngoại lệ dấu |
| `standard.phone` | `Phone` | `Điện thoại` | |
| `standard.linkedin` | `LinkedIn` | `LinkedIn` | tên riêng; ngoại lệ dấu |
| `standard.github` | `GitHub` | `GitHub` | tên riêng; ngoại lệ dấu |
| `standard.company` | `Company` | `Công ty` | |
| `standard.owner` | `Owner` | `Phụ trách` | |
| `standard.amount` | `Amount` | `Giá trị` | |
| `standard.currency` | `Currency` | `Tiền tệ` | |
| `standard.closeDate` | `Close date` | `Ngày chốt` | |
| `standard.stage` | `Stage` | `Giai đoạn` | nhãn cột, không phải bảy giá trị |
| `standard.contacts` | `Contacts` | `Cá nhân` | |
| `standard.companies` | `Companies` | `Công ty` | |
| `standard.deals` | `Deals` | `Thoả thuận` | |

### Bảng lưu sẵn và linh tinh

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `views.saved` | `View saved.` | `Đã lưu bảng xem.` | |
| `views.deleted` | `View deleted.` | `Đã xoá bảng xem.` | |
| `misc.nothingChanged` | `Nothing changed.` | `Không có gì thay đổi.` | |
| `misc.yes` | `Yes` | `Có` | |
| `misc.no` | `No` | `Không` | |
| `misc.loading` | `Loading…` | `Đang tải…` | |

---

## record-sheet — 110 chuỗi

**Một nhận xét về chữ gốc.** Phần lớn câu ở đây viết bằng giọng BÁN HÀNG:
*"Nothing is being sold to X"*, *"the people you are selling to"*, *"Open
pipeline"*. `CONTEXT.md` chốt sản phẩm này là **quan hệ hợp tác**, và thoả thuận
"không phải một lần bán". Dịch sát chữ là bê nguyên khung sai vào tiếng Việt, nên
các dòng dưới dịch theo giọng hợp tác. Đây là chỗ hội đồng nên soi kỹ nhất.

### Mục và nhãn chung

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `tabs.overview` | `Overview` | `Tổng quan` | |
| `tabs.activity` | `Activity` | `Hoạt động` | |
| `tabs.agent` | `Agent` | `Tác nhân` | |
| `tabs.details` | `Details` | `Chi tiết` | |
| `section.about` | `About` | `Giới thiệu` | |
| `section.links` | `Links` | `Liên kết` | |
| `section.background` | `Background` | `Quá trình` | |
| `section.whereItStands` | `Where it stands` | `Đang tới đâu` | |
| `section.onIt` | `On it` | `Người tham gia` | nhãn mục phải là danh từ, không phải câu hỏi |
| `srLabel.primary` | `Primary` | `Đầu mối` | nhãn chỉ trình đọc màn hình nghe |
| `srLabel.socialLinks` | `social links` | `liên kết mạng xã hội` | |

### Hồ sơ công ty

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `company.openPipeline` | `Open pipeline` | `Giá trị đang mở` | bản gốc là từ bán hàng |
| `company.openDeals` | `Open deals` | `Thoả thuận đang mở` | vòng ① đã chốt |
| `company.nextClose` | `Next close` | `Lần chốt gần nhất` | |
| `company.primaryContact` | `Primary contact` | `Đầu mối chính` | |
| `company.makePrimary` | `Make primary` | `Đặt làm đầu mối chính` | |
| `company.primaryUpdated` | `Primary contact updated.` | `Đã đổi đầu mối chính.` | |
| `company.addContact` | `Add contact` | `Thêm cá nhân` | |
| `company.newDeal` | `New deal` | `Thoả thuận mới` | |
| `company.noContactsTitle` | `No contacts yet` | `Chưa có cá nhân nào` | |
| `company.noContactsBody` | `Everyone you talk to at ${name} lives here — add the first person and their calls, emails and notes hang off them.` | `Mọi người bạn trao đổi ở ${name} nằm ở đây — thêm người đầu tiên, rồi cuộc gọi, email và ghi chú của họ gắn theo.` | |
| `company.noDealsTitle` | `No deals yet` | `Chưa có thoả thuận nào` | |
| `company.noDealsBody` | `Nothing is being sold to ${name} right now. Open one and it joins the pipeline and the forecast.` | `Chưa có thoả thuận hợp tác nào với ${name}. Mở một thoả thuận thì nó vào phần đang theo dõi và vào dự báo.` | bản gốc nói "đang bán cho" |
| `company.deleteDeals` | `${n} and everything filed against the account go too.` | `${n} và mọi thứ gắn với công ty này mất theo.` | |
| `company.deleteNoDeals` | `Everything filed against the account goes too.` | `Mọi thứ gắn với công ty này mất theo.` | |
| `company.deleteContacts` | `${n} who work there stay in the CRM, without a company.` | `${n} làm việc ở đó vẫn ở lại CRM, nhưng không thuộc công ty nào.` | |
| `company.archived` | `${name} was archived.` | `Đã lưu trữ ${name}.` | |
| `company.restored` | `${name} was restored.` | `Đã khôi phục ${name}.` | |
| `company.purged` | `${name} was deleted forever.` | `Đã xoá vĩnh viễn ${name}.` | |

### Hồ sơ cá nhân

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `contact.primaryAt` | `Primary contact at ${company}` | `Đầu mối chính ở ${company}` | |
| `contact.noCompany` | `No company` | `Chưa thuộc công ty nào` | |
| `contact.currentRole` | `Current role` | `Vị trí hiện tại` | |
| `contact.tenure` | `Tenure` | `Thâm niên` | |
| `contact.seniority` | `Seniority` | `Cấp bậc` | |
| `contact.function` | `Function` | `Mảng phụ trách` | |
| `contact.based` | `Based` | `Làm việc tại` | |
| `contact.previously` | `Previously` | `Trước đây` | |
| `contact.oneRole` | `1 role` | `1 vị trí` | |
| `contact.roles` | `${n} roles` | `${n} vị trí` | không thêm đuôi số nhiều |
| `contact.weKnowThem` | `We know them` | `Mức thân quen` | bản gốc là câu, nhãn phải là danh từ |
| `contact.emails` | `Emails` | `Email` | ngoại lệ dấu |
| `contact.neverReplied` | `${first} has never replied` | `${first} chưa trả lời lần nào` | |
| `contact.meetings` | `Meetings` | `Cuộc họp` | |
| `contact.nextMeeting` | `Next meeting` | `Cuộc họp tới` | |
| `contact.alsoHere` | `Also here` | `Cùng tham dự` | |
| `contact.notOnDealsTitle` | `Not on any deals` | `Chưa gắn thoả thuận nào` | |
| `contact.notOnDealsBody` | `${name} is not attached to anything being sold yet. Deals are opened on the company, then people are added to them.` | `${name} chưa gắn với thoả thuận nào. Thoả thuận mở trên công ty trước, rồi mới thêm người vào.` | bản gốc nói "đang bán" |
| `contact.deleteWarning` | `Their notes, agent conversations and everything the agent found go too; emails and meetings stay filed against the company.` | `Ghi chú, hội thoại với tác nhân và mọi thứ tác nhân tìm được đều mất theo; email và cuộc họp vẫn gắn với công ty.` | |
| `contact.added` | `${name} added.` | `Đã thêm ${name}.` | |
| `contact.firstName` | `First name` | `Tên` | |
| `contact.lastName` | `Last name` | `Họ` | |
| `contact.rolePlaceholder` | `Head of Security` | `Trưởng phòng Kinh doanh` | ví dụ chức danh |

### Hồ sơ thoả thuận

| Khoá | Tiếng Anh | Tiếng Việt | Ghi chú |
| --- | --- | --- | --- |
| `deal.expectedClose` | `Expected close` | `Dự kiến chốt` | |
| `deal.inStage` | `In stage` | `Ở giai đoạn` | |
| `deal.inStageSince` | `In stage since` | `Ở giai đoạn này từ` | |
| `deal.opened` | `Opened` | `Ngày mở` | |
| `deal.inCurrency` | `In ${cur}` | `Quy đổi ${cur}` | |
| `deal.currencyGone` | `${cur} — no longer supported` | `${cur} — không còn hỗ trợ` | |
| `deal.currencyEntry` | `${code} · ${name}` | `${code} · ${name}` | chỉ có biến |
| `deal.descriptionHint` | `What ${name} is buying, why now, and what stands in the way.` | `${name} đang cần gì, vì sao là lúc này, và còn vướng gì.` | bản gốc nói "đang mua" |
| `deal.description` | `Description` | `Mô tả` | |
| `deal.role` | `Role` | `Vai trò` | |
| `deal.roleOnDeal` | `Role on this deal for ${name}` | `Vai trò của ${name} trong thoả thuận này` | |
| `deal.champion` | `Champion` | `Người ủng hộ` | |
| `deal.noContactsTitle` | `No contacts on this deal` | `Chưa có ai trong thoả thuận này` | |
| `deal.noContactsBody` | `Nobody from ${name} is attached yet. Bring the people you are selling to onto the deal and it says who to chase.` | `Chưa ai từ ${name} được gắn vào. Thêm những người bạn đang trao đổi vào thoả thuận thì biết cần theo ai.` | bản gốc nói "đang bán cho" |
| `deal.onDeal` | `${name} is on the deal.` | `${name} đã vào thoả thuận.` | |
| `deal.addedToDeal` | `Added to the deal.` | `Đã thêm vào thoả thuận.` | |
| `deal.everybodyOn` | `Everybody at ${name} is already on it` | `Mọi người ở ${name} đã ở trong rồi` | |
| `deal.chooseSomebody` | `Choose somebody` | `Chọn một người` | |
| `deal.addToDeal` | `Add to deal` | `Thêm vào thoả thuận` | |
| `deal.candidateTitle` | ` · ${title}` | ` · ${title}` | chỉ có biến |
| `deal.created` | `${name} created.` | `Đã tạo ${name}.` | |
| `deal.noOwner` | `Could not work out who should own this deal.` | `Không xác định được ai phụ trách thoả thuận này.` | |
| `deal.create` | `Create deal` | `Tạo thoả thuận` | |
| `deal.namePlaceholder` | `${name} — Comp AI` | `${name} — OneHub` | bản gốc còn mang tên hãng cũ |
| `deal.noDate` | `No date yet` | `Chưa có ngày` | **nợ vòng ②** |
| `deal.amountNotNumber` | `Amount has to be a number.` | `Giá trị phải là một con số.` | |
| `deal.remove` | `Remove` | `Gỡ` | |
| `deal.deleteWarning` | `Its stage history, notes and agent conversations go too. ${company} and the ${n} on it stay in the CRM.` | `Lịch sử giai đoạn, ghi chú và hội thoại với tác nhân đều mất theo. ${company} và ${n} trong đó vẫn ở lại CRM.` | |
| `deal.person` | `person` | `người` | dùng trong câu trên |
| `deal.people` | `people` | `người` | tiếng Việt không đổi dạng |
| `deal.closed` | `Closed` | `Đã chốt` | |
