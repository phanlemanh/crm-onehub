---
schema_version: 1
feature: Kéo thả thoả thuận giữa các giai đoạn trên màn Thoả thuận (cách xem bảng cột)
slug: keo-tha-thoa-thuan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
design_doc: docs/superpowers/specs/2026-09-23-keo-tha-thoa-thuan-design.md
approved_by: Manh Phan
approved_at: 2026-09-23
---

# Acceptance Contract: keo-tha-thoa-thuan

## Context

Màn Thoả thuận chỉ có dạng bảng; đổi giai đoạn phải mở menu trên từng dòng và
không có chỗ nhìn cả phễu. Vòng này thêm cách xem bảng cột: bảy cột theo giai
đoạn, kéo một thoả thuận sang cột khác là đổi giai đoạn của nó qua đường ghi
`deals.setStage` đã có. Bảng cột chạy bằng thành phần `kanban` miễn phí của ReUI,
cài vào `packages/ui` theo `docs/reui.md`, gắn vào `Board` sẵn có như một chế độ
tuỳ chọn.

Source input: prompt của chủ kho 2026-09-23 («đồng ý, làm đi» sau bản phân tích
dùng ReUI cho kho) + rà mã màn Thoả thuận, `deals.setStage`, `Board`.

## Criteria

- AC-1: Given màn Thoả thuận không ở chế độ lưu trữ, When chọn «Bảng cột» trên nút chuyển cách xem, Then đường dẫn mang `view=board`, trang hiện bảy cột theo thứ tự phễu của `deal-stage.ts`, ô tìm và bộ lọc vẫn hiện; When tải lại trang, Then vẫn ở bảng cột; When chọn «Bảng», Then về dạng bảng như cũ.
- AC-2: Given không gian có thoả thuận ở nhiều giai đoạn, trong đó có thoả thuận đã lưu trữ và hai loại tiền, When mở bảng cột, Then mỗi cột hiện số đếm bằng số thoả thuận KHÔNG lưu trữ ở giai đoạn đó, tổng giá trị quy về tiền báo cáo bằng tổng `baseAmount` của chính những thoả thuận đó, và thẻ của đúng những thoả thuận đó. (cross-layer)
- AC-3: Given một cột có hơn 50 thoả thuận, When mở bảng cột, Then cột hiện đúng 50 thẻ theo thứ tự sắp của bảng và dòng «+N nữa» với N = số đếm − 50; cột đúng 50 thoả thuận không có dòng đó. (cross-layer)
- AC-4: Given bộ lọc tìm kiếm, người phụ trách, hạn chốt hoặc trường tuỳ biến và thứ tự sắp đang đặt trên đường dẫn, When chuyển sang bảng cột, Then màn gửi đúng các bộ lọc đó cho bảng cột, và số đếm, tổng và thẻ của TỪNG cột chỉ tính thoả thuận khớp bộ lọc — bằng đúng những gì dạng bảng trả với cùng bộ lọc, gom theo giai đoạn. (cross-layer)
- AC-5: Given thẻ ở một cột giai đoạn mở, When kéo thả nó sang một cột giai đoạn mở khác — kể cả cột đang rỗng — hoặc «Closed won», Then thẻ nằm ở cột mới ngay khi thả, và khi lưu xong số đếm và tổng ở đầu hai cột đổi mà không cần tải lại; And máy chủ ghi giai đoạn mới, `stageChangedAt`, và một hoạt động đổi giai đoạn; And tải lại trang thì thẻ vẫn ở cột mới, số đếm hai cột đã đổi. (cross-layer)
- AC-6: Given thẻ bất kỳ, When thả nó vào «Closed lost» hoặc «Unqualified», Then hộp thoại lý do mở và chưa có gì được ghi; When điền lý do và Lưu, Then thoả thuận ở cột đó với lý do đã ghi; When huỷ hộp thoại, Then thẻ về cột cũ và máy chủ không nhận lệnh ghi nào. (cross-layer)
- AC-7: Given máy chủ từ chối lệnh đổi giai đoạn, When thả thẻ sang cột khác, Then thẻ về cột cũ và thông báo lỗi hiện đúng câu máy chủ trả.
- AC-8: Given thẻ bất kỳ, When thả nó vào chính cột của nó, hoặc ra ngoài mọi cột, hoặc nhấn Esc giữa chừng, Then không có lệnh ghi nào gửi đi và thẻ ở nguyên chỗ.
- AC-9: Given bảng cột, When dùng bàn phím mở menu giai đoạn trên một thẻ và chọn giai đoạn khác, Then thẻ dời sang cột đó theo đúng luồng của AC-5 và AC-6, không cần chuột; And tên thoả thuận và tên công ty trên thẻ mang `translate="no"`; And lời thông báo cho trình đọc màn hình khi nhấc, dời, thả thẻ nói bằng tiếng của màn (vi hoặc en).
- AC-10: Given bảng cột, When bấm vào thẻ mà không kéo, Then tấm thoả thuận của thẻ đó mở, như bấm dòng bảng.
- AC-11: Given chế độ lưu trữ đang bật, When nhìn màn Thoả thuận, Then nút chuyển cách xem bị khoá và trang ở dạng bảng, kể cả khi đường dẫn mang `view=board`.
- AC-12: Given màn 30 ngày đầu ở cách xem bảng cột, When nhìn và bấm thẻ, Then bảng cột không có tay kéo, không kéo được, và thẻ vẫn là đường dẫn tới kế hoạch như trước vòng này.
- AC-13: Given bảng cột có dữ liệu, ở khổ 320 · 375 · 768 · 1024 · 1440, tiếng Việt và tiếng Anh, When mở trang và kéo một thẻ bằng chuột, Then trang không tràn ngang (bảng cuộn trong khung của nó), đầu mỗi cột thấy tên, số đếm và tổng, và thẻ đã thả nằm ở cột mới.
- AC-14: Given tải bảng cột đang chạy hoặc bị hỏng, When nhìn trang, Then ô tìm, bộ lọc và nút chuyển vẫn hiện; lúc tải có dấu đang tải, lúc hỏng có lời báo lỗi và nút «Thử lại» trong vùng bảng, bấm thì bảng cột được gọi lại.
- AC-15: Given các tệp giao diện vòng này chạm và thành phần ReUI đã cài, When chạy cổng thiết kế tĩnh và phép soi thành phần ReUI, Then không có vi phạm; And thành phần ReUI không nhập từ gói `cn`, không có chú thích, không dùng icon Lucide, và `packages/ui/package.json` không có gói `cn`.

## Coverage

Chân sản phẩm: Product Context dựng từ repo — `CONTEXT.md` (thoả thuận là thực thể của mạng lưới, sản phẩm nội bộ OneHub) [SUY-TỪ-REPO: CONTEXT.md], phễu bảy giai đoạn và luật đóng thua [SUY-TỪ-REPO: apps/app/lib/deal-stage.ts, apps/api/src/deals/deals.service.ts]. Chân ngành: [NGÀNH: HubSpot deals board — cột theo giai đoạn, tổng giá trị đầu cột, kéo vào giai đoạn đóng thì bắt thuộc tính bắt buộc], [NGÀNH: Pipedrive pipeline view — kéo thẻ giữa giai đoạn, vùng thả Won/Lost].

- Trục đích thả: cột mở khác | Closed won | cột thua (Closed lost, Unqualified) | chính cột cũ | ngoài bảng / Esc [thước CE: bảy giai đoạn + luật LOSING của `deals.service.ts`; HubSpot/Pipedrive]
- Trục kết quả ghi: máy chủ nhận | máy chủ từ chối | huỷ trước khi ghi (hộp thoại lý do) [thước CE: ba nhánh của `setStage` + `CloseReasonDialog`]
- Trục cách thao tác: chuột kéo | chạm kéo | bàn phím (menu giai đoạn) | bấm không kéo [thước CE: quy tắc giao diện web — kéo phải có đường bàn phím và bấm thay thế]
- Trục trạng thái bảng: có dữ liệu | cột rỗng (AC-5) | cột quá 50 (AC-3) | đang lọc (AC-4) | đang tải, lỗi tải (AC-14) | chế độ lưu trữ (AC-11). Bảy cột đều rỗng khi bộ lọc không khớp là tổ hợp của cột rỗng × đang lọc, không AC riêng [thước CE: bảng trạng thái của design doc]
- Cross-cutting: khổ 320–1440 (AC-13) · vi/en (AC-9, AC-13) · `translate="no"` cho dữ liệu người nhập (AC-9) · không đổi hình màn 30 ngày đầu (AC-12).
- Core: AC-1 … AC-15. Chạm kéo (touch) chỉ đo gián tiếp: cùng đường ghi với chuột, và AC-9 là đường thay thế — [GIẢ ĐỊNH] cảm biến chạm của `kanban` đủ dùng trên điện thoại, chưa đo trên máy thật.
- Later/Never: xem Out of scope và sổ quyết định.

## Out of scope

- Sắp thứ tự thẻ trong một cột (không có trường thứ tự để lưu).
- Chọn nhiều thẻ và thao tác hàng loạt trên bảng cột.
- Tổng giá trị có trọng số theo xác suất giai đoạn (Pipedrive «weighted value»).
- Dịch nhãn bảy giai đoạn sang tiếng Việt (nhãn đang là tiếng Anh ở mọi màn).
- Tải thêm thẻ quá 50 ngay trong cột.
- Vùng thả Won/Lost nổi lên khi kéo kiểu Pipedrive.
- Bảng cột trong chế độ lưu trữ.

## Notes

- Không đụng quyền: bảng cột dùng đúng thủ tục `deals.setStage` mà menu giai đoạn đang dùng, nên ai đổi được giai đoạn ở dạng bảng thì đổi được ở bảng cột, không hơn không kém.
