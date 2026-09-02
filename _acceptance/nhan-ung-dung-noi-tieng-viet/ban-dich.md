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

| Giá trị | Vì sao |
| --- | --- |
| `Email` | Từ mượn đã vào tiếng Việt đời thường; `CONTEXT.md` cấm đúc từ ghép cho thuật ngữ kỹ thuật, và "thư điện tử" là đúc lại một từ người dùng không tự nói. Đây là ngoại lệ DUY NHẤT của cả bảng. |

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
| `headers.lastActivity` | `Last activity` | `Hoạt động cuối` | |
| `headers.archived` | `Archived` | `Lưu trữ` | |
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
| `headers.lastActivity` | `Last activity` | `Hoạt động cuối` | |
| `headers.archived` | `Archived` | `Lưu trữ` | |
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

## crm và record-sheet

344 chuỗi còn lại. Viết tiếp trong cùng file này theo đúng khuôn trên, trước khi
Task 5 dựng kho chuỗi.
