---
schema_version: 1
feature: «Mã đối tác không khớp vẫn có người xử lý; kế hoạch rỗng thêm được bước; thẻ quá hạn báo còn sót»
slug: dieu-phoi-va
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, agent, ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-09T23:09:11Z
design_doc: docs/superpowers/specs/2026-10-10-dieu-phoi-va-design.md
---

# Acceptance Contract: dieu-phoi-va

## Context

Ba lỗi điều phối ở hàng E6 của `docs/plan/lo-trinh-okr.json` (khảo sát 04/10 mất, dò lại từ mã 09/10):
mã đối tác không khớp thành `AgentTask` `onboarding-identify` mà tác nhân không có trình xử lý, nên không ai
được báo; kế hoạch không còn bước hoặc bộ phận chưa có bước không thêm được bước từ màn; thẻ «Việc quá hạn» ở
Tổng quan đếm trên danh sách đã cắt 10. Anh chốt 09/10: lối 1A' (API giữ ghi `AgentTask`, tác nhân xử lý ở làn
trực tiếp không gọi mô hình), thẻ đếm số thật kèm «và N việc nữa», bỏ design-pass có tên.

Source input: `_acceptance/dieu-phoi-va/opportunity.md` (Cổng Đáng `build` 2026-10-07T13:13:50Z, luật 16);
`docs/superpowers/specs/2026-10-10-dieu-phoi-va-design.md`; Ngoài-1, Ngoài-5 của `ke-hoach-la-mot-ban-ghi`;
`_acceptance/dieu-phoi-30-ngay-dau/run-log.jsonl` dòng 129, 174.

## Criteria

- AC-1: (cross-layer) Given một kế hoạch mở có người cầm trịch và một lô từ nền tảng mang một hoặc nhiều mã `platformBrokerId` không khớp cá nhân nào, When API nhận lô rồi làn trực tiếp của tác nhân chạy, Then `onboarding-identify` nằm trong `TASK_KINDS` và `DIRECT_KINDS`, làn nghiên cứu không nhận hàng đó, và sau một lượt làn trực tiếp mỗi mã lệch có đúng một `Activity` loại `TASK` chưa xong với `createdById` là người cầm trịch kế hoạch, `planId` của kế hoạch, `companyId` của kế hoạch, `dueAt` là đầu ngày hôm nay giờ Việt Nam, `subject` chứa mã, `meta.platformBrokerId` bằng mã; hàng `AgentTask` đã đóng và không gọi mô hình nào.
- AC-2: Given việc mã lệch đã ghi ở AC-1, When tác nhân xử lý thêm một hàng `onboarding-identify` cùng kế hoạch và cùng mã trong lúc việc cũ chưa xong, Then không ghi việc thứ hai; khi việc cũ đã xong thì ghi việc mới; cùng mã ở một kế hoạch khác thành việc riêng của kế hoạch đó.
- AC-3: Given một hàng `onboarding-identify`, When lúc tác nhân chạy mã đã khớp một cá nhân, hoặc kế hoạch đã đóng hoặc không còn, hoặc `payload` không qua schema `onboardingIdentifyPayload`, Then không ghi việc nào, hàng `AgentTask` đóng ngay trong lượt đó với lý do đóng gọi đúng trường hợp (mã đã khớp · kế hoạch đã đóng hoặc không còn · payload hỏng kèm thông điệp parse), không chờ rút sau `MAX_ATTEMPTS`.
- AC-4: Given bản ghi một kế hoạch mở không còn bước nào, When người dùng bấm «Thêm bước», chọn một bộ phận đang dùng, gõ tên và lưu, Then bước được ghi với bộ phận đã chọn và hiện dưới tiêu đề của bộ phận đó; nút Lưu khoá khi tên trống hoặc chưa chọn bộ phận.
- AC-5: Given bản ghi một kế hoạch mở đã có bước, When người dùng mở «Thêm bước ở bộ phận khác», Then ô chọn chỉ liệt bộ phận đang dùng chưa có bước trong kế hoạch; lưu xong bước hiện dưới tiêu đề bộ phận mới; hết bộ phận chưa có bước thì nút không hiện; kế hoạch đã đóng thì không có nút thêm nào.
- AC-6: (cross-layer) Given `onboarding.addStep` với `departmentId` không có thật hoặc đã lưu trữ, When gọi, Then trả `BAD_REQUEST` với thông điệp đọc được nêu bộ phận, không trả 500, không ghi bước nào; và trên bản ghi kế hoạch, lưu bước vào bộ phận vừa bị lưu trữ thì thông điệp đó hiện ngay trong form, form không đóng, ô tên giữ chữ đã gõ.
- AC-7: (cross-layer) Given người dùng có 25 việc `TASK` quá hạn (chưa xong, `dueAt` trước đầu ngày hôm nay giờ Việt Nam) và 15 bước quá hạn được giao cho mình trong kế hoạch mở, When mở Tổng quan, Then `dashboard.summary` trả `quaHan.viec` = 25 và `quaHan.buoc` = 15 cho phạm vi «Của tôi»; ở «Tất cả» `quaHan.viec` đếm việc quá hạn của mọi người còn `quaHan.buoc` vẫn là bước quá hạn giao cho chính người đang mở Tổng quan (cùng nghĩa với danh sách «Bước của tôi», không đổi theo phạm vi); danh sách vẫn giữ trần 10; thẻ «Việc quá hạn» ghi «40 quá hạn» và một dòng «và N việc quá hạn nữa» với N = 40 trừ số dòng quá hạn đang hiện.
- AC-8: Given số việc và bước quá hạn không vượt số dòng đang hiện (0 hoặc ≤ trần), When mở Tổng quan, Then thẻ ghi đúng tổng và không có dòng «và … nữa».
- AC-9: (kiểm không hồi quy) Given các bài kiểm sẵn có của ba vùng (`dieu-phoi-diem-nhan.spec.ts`, `han-viec.spec.ts`, `ke-hoach-sheet.dom.tsx`, `moi-phia-ke-hoach.dom.tsx`, `han-viec.dom.tsx`), When chạy lại, Then thoát 0 mà không khẳng định `expect(` nào bị xoá hay sửa so với mốc `d0ccad984`; `bun run check-types` thoát 0.

## Coverage

- Trục A — Mã lệch: lô 1 mã | nhiều mã | gửi lại cùng mã | cùng mã ở hai kế hoạch × lúc tác nhân chạy: vẫn lệch | đã khớp | kế hoạch đã đóng | payload hỏng [thước CE: bốn ca `khong-khop-agenttask` của `dieu-phoi-diem-nhan.spec.ts` + năm nhánh của trình xử lý trong thiết kế]
- Trục B — Thêm bước: kế hoạch rỗng | có bước × bộ phận đã có bước | chưa có bước | đã lưu trữ | không có thật × kế hoạch mở | đã đóng [thước CE: `gomTheoBoPhan`, `onboarding.listDepartments`, `addStep`]
- Trục C — Đếm quá hạn: 0 | ≤ trần | > trần × việc | bước × «Của tôi» | «Tất cả» [thước CE: hai truy vấn của `DashboardService` (`take: 10`, `ONBOARDING.viecCuaToi.tran`), `buocQuaHan`]
- Core → AC: mã lệch thành việc (AC-1) · không trùng (AC-2) · nhánh đóng sớm (AC-3) · kế hoạch rỗng (AC-4) · bộ phận khác (AC-5) · bộ phận hỏng (AC-6) · đếm thật (AC-7) · không dư chữ (AC-8) · hồi quy (AC-9).
- Later: trang xem hết việc quá hạn; nhắc buổi sáng nêu việc mã lệch trong ngày.
- Never: API tự đoán cá nhân theo tên hay số điện thoại khi mã lệch.
- `[NGÀNH: HubSpot — hàng việc quá hạn đếm tổng thật, không theo trang]` — ứng viên cho trục C, chờ anh gạch.

## Đường đo

- Thước: mọi mã lệch của lô thật 7 ngày đầu thành việc mở của người cầm trịch, 0 hàng `onboarding-identify` rút vì hết lượt · số từ: truy vấn `AgentTask` và `Activity` trên production ở phiên nghiệm thu · bảo đảm bởi: AC-1, AC-3
- Thước: người thử thêm được bước đầu cho kế hoạch rỗng và bước cho bộ phận chưa có bước, 0 lần hỏi · số từ: phiên nghiệm thu (`uat-session`) · bảo đảm bởi: AC-4, AC-5
- Thước: số trên thẻ «Việc quá hạn» bằng số đếm thẳng trong cơ sở dữ liệu cho cùng người · số từ: phiên nghiệm thu, so màn với truy vấn · bảo đảm bởi: AC-7

## Out of scope

- Trang xem hết việc quá hạn — không có trang danh sách việc; dòng «và N việc nữa» không là liên kết.
- Đổi luật `docs/api.md` cho ingest, hay cho tác nhân dò cá nhân bằng mô hình (lối 1B).
- Dọn các hàng `onboarding-identify` cũ đã rút trên production.
- Đặt hạn lùi để việc mã lệch lên thẻ quá hạn ngay trong ngày — việc hiện ở dòng thời gian của kế hoạch trong ngày, lên thẻ quá hạn từ hôm sau nếu chưa xong.
- Bản mẫu bấm được (design-pass) — bỏ có tên ở sổ quyết định.

## Notes

- Phần dò cá nhân của tác nhân (vốn chưa từng chạy được vì loại việc không đăng ký) bị bỏ, không chuyển sang API: API vẫn chỉ ghi `AgentTask`, không đối khớp danh tính.
- Tệp ngoài ranh giới xin ở P3-76 (thay P3-74): `apps/agent/agent/lib/ma-lech.ts`, `packages/validation/src/onboarding-identify.ts` + subpath, ba tệp kiểm thử mới, khoá `dpv_` trong `_acceptance/config.yaml`.
- Đường nền xanh cả năm chân trên `3a8611756` (onehub `d0ccad984` + ô cơ hội), 2026-10-09T17:41:00Z.

Known limits — chấp nhận tại Cổng Bằng chứng 2026-10-10 (Phan Le Manh), từ S4 round 1–3 (luật 53):

- Ngoài-1: Khi người được đo không có việc quá hạn nhưng có bước sắp đến hạn trong vài ngày tới, phép đo màn Tổng quan có thể báo sai dù thẻ hiển thị đúng. Người dùng thật không bị ảnh hưởng; chỉ làm một lượt nghiệm thu có thể đỏ nhầm.
- Ngoài-2: Lời hứa rằng việc mã đối tác lệch được xử lý mà không gọi mô hình AI chỉ được kiểm bằng một dấu hiệu gián tiếp. Nếu sau này có người thêm lệnh gọi mô hình vào đường này, bài kiểm có thể vẫn xanh và không ai hay.
- Ngoài-3: Khi không có việc nào quá hạn, phép đo màn chỉ xác nhận thẻ không ghi «quá hạn», chưa xác nhận thẻ ghi đúng chữ thay thế. Nếu chữ ở thẻ đó bị trống hoặc sai, lượt đo vẫn có thể qua.
- Ngoài-4: Công cụ canh việc ai đó xoá hay sửa các điều kiện kiểm có sẵn tự thử mình khá lỏng, nên về lâu dài có thể bỏ sót một kiểu sửa lén. Rủi ro thấp và không ảnh hưởng người dùng sản phẩm.
- Ngoài-5: Hôm nay mã đối tác lệch vẫn thành việc cho người cầm trịch đúng như hứa. Nếu sau này ai đổi tên trường mã đối tác ở một nơi mà quên nơi kia, mọi mã, kể cả mã đã khớp, sẽ đều thành việc giao cho người cầm trịch.
- Ngoài-6: Chọn một bộ phận không tồn tại thì thêm bước và tạo kế hoạch từ mẫu báo hai kiểu lỗi, hai câu chữ khác nhau. Người dùng vẫn nhận được thông báo đọc được ở cả hai nơi.
- Ngoài-7: Nếu danh sách bộ phận không tải được, form thêm bước hiện ô chọn trống và nút Lưu không bấm được mà không nói lý do; với kế hoạch đã có bước thì nút thêm ở bộ phận khác biến mất như thể không còn bộ phận nào. Người dùng phải tải lại trang mới thử được.
- Ngoài-8: Người mở Tổng quan từ trình duyệt đặt múi giờ khác Việt Nam, trong vài giờ quanh nửa đêm, có thể thấy dòng «và N việc quá hạn nữa» cho những việc thực ra đã hiện trong danh sách, hoặc thấy thiếu một việc. Người dùng ở Việt Nam không gặp.
- Ngoài-9: Trong ca gửi lại cùng mã, bài kiểm chỉ xác nhận một trong bốn lượt xử lý được đóng sạch. Nếu một nhánh quên đóng việc thì có thể sót mà không ai thấy ngay.
- Ngoài-10: Nếu một ngày việc mã lệch bị cho vào nhầm làn nghiên cứu, bài kiểm vẫn báo đỏ nhưng nói nguyên nhân sai, nên người sửa mất thời gian hơn để tìm ra.
- Ngoài-11: Bài kiểm chuỗi từ lúc nhận lô tới lúc có việc chỉ xác nhận có hai mã khác nhau, chưa so với đúng mã đã nhận. Một lỗi làm việc mang nhầm mã nhưng vẫn khác nhau sẽ không bị bắt ở bài này.
