---
schema_version: 1
feature: "Tạo kế hoạch onboard từ khuôn là có sẵn việc cho từng phòng ban; deal thắng thì máy gợi ý mở kế hoạch"
slug: ke-hoach-sinh-viec
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: signed-off
approved_by: manh
approved_at: 2026-10-14T23:27:41Z
design_doc: docs/superpowers/specs/2026-10-14-ke-hoach-sinh-viec-design.md
---

# Acceptance Contract: ke-hoach-sinh-viec

## Context

Hàng DA3 của `docs/plan/lo-trinh-viec-du-an.json`; chủ kho mở ở Cổng Đáng 14/10/2026 (build, ngưỡng theo đề xuất
máy). Hôm nay tạo kế hoạch 30 ngày từ khuôn sinh ra các bước không ai làm (`assigneeId` trống), bước không phải
Việc nên không vào Việc của tôi, Kanban hay Gantt; deal thắng không dẫn tới gì. Lượt này: mỗi bước sinh từ khuôn
(và mỗi bước thêm tay) mang đúng một **Việc** — người làm chọn lúc tạo cho từng phòng ban, mặc định trưởng phòng;
Việc là nguồn sự thật, bước là bản chiếu của nó. Vế «deal thắng thì máy gợi ý mở kế hoạch» tách sang hàng DA3b
(hồ sơ `goi-y-mo-ke-hoach`) theo luật cỡ hợp đồng (15 tiêu chí ≥ 13 phải tách; sổ d-20261014T061219Z-15). Hạng T3 vì thêm cột ở
`packages/db/prisma`.

Source input: hàng DA3 · `opportunity.md` (ngưỡng đã ký) · `docs/plan/viec-du-an-nghien-cuu.md` mục 3 · hồ sơ
`viec-chung` (DA1) và `dieu-phoi-va` (E6) · design doc.

## Criteria

- AC-1 (cross-layer): Given khuôn có ba bước ở hai phòng ban — phòng A có trưởng phòng H, phòng B không có trưởng phòng — và người cầm trịch O, When tạo kế hoạch từ khuôn đó qua ô tạo kế hoạch mà không đổi người nào, Then cơ sở dữ liệu có ba bước và ba Việc, mỗi bước trỏ đúng một Việc khác nhau; Việc của phòng A có người thực hiện H, của phòng B có người thực hiện O, người giao là người tạo; hạn của mỗi Việc bằng ngày bắt đầu cộng số ngày lệch của bước, tính theo ngày giờ Việt Nam; mỗi Việc gắn kế hoạch và có đúng một vết «tao» nguồn `khuon`; cột người làm, hạn, tên của mỗi bước bằng đúng của Việc nó trỏ; When gọi REST `POST /onboarding/plans` không có trường chọn người, Then kết quả y như trên.
- AC-2 (cross-layer): Given khuôn của AC-1 và người U vai `member`, When người tạo đổi người phòng B sang U, Then Việc của phòng B có người thực hiện U; Given trưởng phòng H đã sang vai `okr`, When tạo không đổi người, Then Việc của phòng A có người thực hiện O; When gửi người vai `okr` cho một phòng ban, Then trả 400 với lời có tên người, tên phòng ban và chữ «chỉ OKR», và số kế hoạch, bước, Việc, vết trong cơ sở dữ liệu không đổi.
- AC-3: Given ô tạo kế hoạch dựng trong bài kiểm giao diện với dữ liệu giả, When chọn một khuôn có hai phòng ban, Then thấy một hàng mỗi phòng ban có ô chọn người điền sẵn trưởng phòng (hay người cầm trịch khi phòng không có trưởng), danh sách chọn không có người vai «chỉ OKR», và lệnh tạo chỉ gửi phòng người đã đổi; khi khuôn hay danh sách phòng ban đang tải, tải hỏng hay khuôn không có bước, ô hiện trạng thái chờ, lỗi có «Thử lại», và rỗng; các tệp giao diện mới hay sửa qua sàn thiết kế.
- AC-4: Given một kế hoạch tạo từ khuôn sau lượt này, When chạy từng lệnh trong bảng viết trước của design doc mục 5 — sáu lệnh phía bước (`assignStep`, `setStepDone` đánh và bỏ đánh, `rescheduleStep`, «xong n» trỏ bước, `transferWork` chuyển việc của người làm sang người khác) và bốn lệnh phía Việc (`doiTrangThai` sang Đang làm, Chờ đánh giá, Xong, rồi mở lại; `suaViec` hạn và tiêu đề; `doiNguoiThucHien`) — Then sau MỖI lệnh, đọc lại từ cơ sở dữ liệu, bốn cột người làm · hạn · tên · thời điểm xong của bước bằng đúng bản chiếu của Việc nó trỏ (xong ⟺ Việc ở Xong, thời điểm xong = `khepLuc`); mỗi lệnh để đúng một vết trên Việc; người được giao đóng được bước của mình; chiều đỏ: một bản sao bỏ lời gọi chiếu ở một lệnh làm bảng đỏ gọi đúng tên lệnh đó; Given thêm một Việc thường không trỏ bởi bước nào, When chuyển Việc của bước sang Huỷ, xoá nó hay gỡ gắn kế hoạch, Then mỗi lệnh trả 400 với lời ghim «gỡ bước ở kế hoạch» và Việc, bước không đổi, còn ba lệnh đó trên Việc thường vẫn thành công như trước lượt này (đối chứng dương).
- AC-5 (cross-layer): Given kế hoạch của AC-1, When người cầm trịch gỡ một bước ở thẻ Bước, Then bước mất, Việc của nó còn ở trạng thái Huỷ với vết «doi-trang-thai» kèm lý do gỡ bước, không còn bước nào trỏ nó, và danh mục hiện «Bước 0/2» thay vì «0/3»; Given một kế hoạch còn hai bước dở và một bước xong, When người cầm trịch đóng kế hoạch, Then hộp đóng hỏi «Huỷ 2 việc còn mở của kế hoạch?» đánh dấu sẵn; khi giữ dấu, hai Việc sang Huỷ với vết nguồn `dong-ke-hoach`, Việc đã Xong giữ nguyên, bản chiếu của ba bước đúng, và nhịp nhắc sau đó không có `viec-qua-han` cho hai Việc đó; khi bỏ dấu, hai Việc giữ nguyên trạng thái; When mở lại kế hoạch, Then Việc đã Huỷ lúc đóng không tự hồi.
- AC-6 (cross-layer): Given một kế hoạch rỗng và một kế hoạch tạo từ khuôn, When thêm một bước tay có chọn người và một bước tay không chọn người, Then mỗi bước mang một Việc mới — người thực hiện là người được chọn, hay theo luật mặc định của AC-1 khi không chọn; các AC-4, AC-5, AC-6 của hồ sơ `dieu-phoi-va` vẫn xanh nguyên tên bài.
- AC-7 (cross-layer): Given một kế hoạch tạo trước lượt này (bước không trỏ Việc nào) và một kế hoạch tạo sau, mỗi kế hoạch có một bước quá hạn giao cho B, When giao, đánh xong, đổi hạn, gỡ bước ở kế hoạch cũ, Then hành vi y như trước lượt này và không Việc nào được tạo; When nhịp nhắc chạy sau 08:30 giờ VN, Then bộ gom của B có `buoc-qua-han` cho bước cũ và `viec-qua-han` cho Việc của bước mới, không có `buoc-qua-han` cho bước mới — mỗi việc nhắc đúng một lần.
- AC-8: Given kho mẫu có đáp án biết trước — Việc sinh từ khuôn được người thực hiện chuyển đúng hạn, đúng ngày hạn lúc 23:00, trễ hạn, chưa chuyển; Việc khuôn hạn sau `--den` còn «Chưa làm» (không tính); Việc khuôn bị Huỷ do gỡ bước (không tính); Việc tạo tay (không tính), When chạy thước `rang/do-nguong.mjs --tu --den` trên kho đó, Then JSON in đúng tổng, số đúng hạn và tỉ lệ vế (a); thoát 2 khi tỉ lệ dưới 0,7; thước chạy trong giao dịch chỉ đọc.
- AC-9 (judgment): Given `CONTEXT.md`, `docs/api.md` và `docs/plan/lo-trinh-viec-du-an.json` sau vòng này, When người mới đọc, Then biết: bước của kế hoạch tạo sau DA3 là bản chiếu của một Việc (Việc là nguồn sự thật, ba thao tác bị chặn trên Việc của bước); trường chọn người theo phòng ban của `createFromTemplate`; đóng kế hoạch hỏi huỷ việc còn mở; hàng DA3 ghi trạng thái mới, có hàng DA3b cho gợi ý mở kế hoạch khi deal thắng, và `chay_khi` của DA4 ghi điều kiện ngày bắt đầu đã thoả (chủ kho 14/10).
- AC-10: Given bộ kiểm hiện có của kho, When chạy các suite của `feature_loop.suite_keys` sau lượt này, Then mọi suite thoát 0, không `expect` nào bị xoá ở các tệp kiểm đã có, và `check-types` thoát 0.

## Coverage

Quét bằng `morphological-scan` (`morphological-scan.md`), preset `entity-feature`. Trục: vòng đời kế hoạch tạo
từ khuôn (tạo · Việc sinh ra · sửa · xong/huỷ/mở lại · thêm tay · đóng/mở · chuyển việc) × nguồn kích hoạt (danh
mục · sheet công ty · `setStage` · `bulkSetStage` · tạo thẳng ở thắng · lưu trữ giai đoạn · Tác nhân) × người và
quyền (người tạo · người làm · trưởng phòng · phòng không trưởng · vai «chỉ OKR» · người phụ trách deal · quản
trị) × thời gian (hạn từ ngày mốc · nhắc việc · nhắc gợi ý · quá 3 ngày · cửa sổ đo). Thước CE: mọi nơi gọi
`chuyenGiaiDoanTrongTx` và nhánh tạo deal [SUY-TỪ-REPO: apps/api/src/deals/deals.service.ts]; sáu lệnh ghi bước
[SUY-TỪ-REPO: apps/api/src/onboarding/onboarding.router.ts]; mẫu ngành Odoo activity plan, Salesforce Action
Plans, Pipedrive [NGÀNH: docs/plan/viec-du-an-nghien-cuu.md mục 3]. Core 1–4 → AC-1…AC-7; Core 5–7 (gợi ý khi deal thắng) dời sang DA3b `goi-y-mo-ke-hoach`; AC-8 là
đường đo; AC-9 tài liệu; AC-10 hồi quy. Later/Never ở Out of scope.

## Đường đo

- (a) ≥70% Việc sinh từ khuôn được người thực hiện chuyển khỏi «Chưa làm» trước hoặc trong ngày hạn (14 ngày đầu
  sau gộp; mẫu số: Việc nguồn `khuon` tạo trong cửa sổ, hạn ≤ ngày đọc, không Huỷ): số từ `rang/do-nguong.mjs`
  chạy chỉ đọc trên production — `viecKhuon.tiLe` · AC-1 bảo đảm vết nguồn `khuon`, AC-8 bảo đảm phép đếm.
- (b) Gợi ý khi deal thắng: dời sang hồ sơ `goi-y-mo-ke-hoach` (hàng DA3b) cùng ngưỡng đã ký — thước và AC đo nó
  sống ở hồ sơ đó (sổ d-20261014T061219Z-15).

## Out of scope

- Gợi ý mở kế hoạch khi deal thắng (vế (b) của ngưỡng) — hàng DA3b `goi-y-mo-ke-hoach`, tách theo cỡ hợp đồng.
- Ngày bắt đầu cho bước hay cho Việc sinh từ khuôn — DA4 (Hỏi-2 ở Cổng Phạm vi).
- Chép bước của kế hoạch tạo trước lượt này sang Việc — hàng riêng, cổng riêng như DA1b.
- Gắn kế hoạch với deal để dự án đọc tệp và ghi chú của deal; khuôn theo loại deal; khuôn tự chọn theo loại đối tác.
- Bản bàn giao do AI viết khi deal thắng — thuộc tác tử (ghi chú hàng DA3).
- Việc con và Kanban (DA2); dự án và Gantt (DA4).
- Bằng chứng trên bản chạy thật cho ô tạo kế hoạch và thẻ Bước (eval E3b cũ: mở từ danh mục và từ sheet công ty ở khổ 1280 và 375, không cuộn ngang ở 375, thẻ Bước hiện người làm) — hạn chế đã biết, owner thu phạm vi 15/10 sau hai lượt S4 chưa đạt: ở khổ 1280 sheet công ty tràn mép phải nên ảnh không thấy ô tạo, trang công ty báo lỗi hydration trên console, thẻ Bước bị cắt mất cột người làm. Ảnh lượt 2 của lối danh mục (1280, 375) khớp kỳ vọng nhưng không còn là bằng chứng của hợp đồng; thước `rang/man.mjs` giữ lại, chưa sửa.

## Notes

- Hỏi-1 (Cổng Phạm vi): bước là bản chiếu của Việc (khuyến nghị) hay Việc thay bước cho kế hoạch mới.
- Hỏi-2: ngày bắt đầu để DA4 (khuyến nghị) hay đưa vào DA3.
- Hỏi-3: đóng kế hoạch khi còn việc dở — hộp đóng hỏi, đánh dấu sẵn «Huỷ N việc còn mở» (khuyến nghị) hay để trống.
- Hỏi-4: bỏ design-pass, duyệt UI trên ảnh S4 (khuyến nghị) hay dựng bản mẫu trước Cổng Phạm vi.
- Câu hỏi nơi hiện gợi ý dời sang DA3b cùng vế (b).
- Thu phạm vi 15/10 (dừng-vá sau S4 lượt 2): owner chọn «Hướng a» — vế bản chạy thật của AC-3 ra Out of scope; Hỏi-4 (duyệt UI trên ảnh S4) vì thế không còn ảnh nào được duyệt trong vòng này.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-15:
  - Ngoài-5: Bài kiểm tự khai báo lại hình dạng dữ liệu tạo kế hoạch thay vì dùng bản gốc.
  - Ngoài-6: Chưa có bài kiểm nào chứng minh việc bỏ hạn trên Việc thường vẫn dùng được như cũ, vì bài kiểm đang thử trên một Việc vốn không có hạn.
  - Ngoài-7: Công cụ kiểm tra việc không ai xoá bài kiểm cũ chưa được thử trên trường hợp tệp bị xoá hoặc đổi tên thật.
  - Ngoài-8: Công cụ kiểm tra bài kiểm cũ không bị xoá bỏ sót một tệp phụ trợ.
  - Ngoài-9: Trong một số trường hợp hiếm, như phòng ban của bước đã bị lưu trữ, màn hình có thể hiện một người nhận việc nhưng hệ thống lại giao cho người khác.
  - Ngoài-10: Mã mới có nhiều dòng ghi chú trái quy ước của đội.
  - Ngoài-11: Danh sách trạng thái công việc bị chép tay thêm một bản.
  - Ngoài-12: Định nghĩa «việc còn mở» được viết ở ba nơi.
  - Ngoài-15: Luật «ai được nhận việc» bị viết lặp thêm một bản.
  - Ngoài-16: Khi chuyển việc hay từ chối đổi vai, một việc có thể được đếm thành «N bước, N việc», nên con số hiển thị lớn hơn thực tế.
  - Ngoài-17: Nếu một việc của bước được gắn thêm một kế hoạch khác, người dùng sẽ không gỡ được gắn kết đó và bị báo lỗi dù việc gỡ là vô hại.
  - Ngoài-18: Phép thử chặn người không thuộc tổ chức khá lỏng: nếu chặn này hỏng thì người dùng có thể gặp lỗi hệ thống thay vì lời báo rõ, mà bài thử vẫn xanh.
  - Ngoài-19: Hai bộ thử cũ về vai chỉ OKR giờ chỉ thử kế hoạch kiểu cũ, nên việc giao hay chuyển việc cho người chỉ OKR trên kế hoạch mới có thể không được kiểm.
  - Ngoài-20: Phép kiểm «đã chạy đủ các lệnh» không bắt được việc ai đó xoá bớt một dòng khỏi bảng thử, nên độ phủ có thể giảm mà không báo.
  - Ngoài-21: Phép kiểm giao diện chỉ quét ba màn đã biết, nên màn mới thêm trong tương lai có thể lọt khỏi kiểm tra mà không ai hay.
  - Ngoài-22: Một phép thử nói rằng kế hoạch cũ không sinh việc thực ra không chạm đến phần mã mới, nên nó không chứng minh được điều đó.
