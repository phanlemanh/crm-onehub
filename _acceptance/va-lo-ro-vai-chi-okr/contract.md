---
schema_version: 1
feature: "Người vai «chỉ OKR» không được giao bước onboard, không cầm trịch hay theo dõi kế hoạch đối tác, và không nhận tên đối tác qua tin nhắc buổi sáng"
slug: va-lo-ro-vai-chi-okr
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-12T04:59:24Z
design_doc: docs/superpowers/specs/2026-10-12-va-lo-ro-vai-chi-okr-design.md
---

# Acceptance Contract: va-lo-ro-vai-chi-okr

## Context

Hàng DA0a của `docs/plan/lo-trinh-viec-du-an.json`, dãy P0 của đợt r2, hạn trước 14/10/2026. Vai `okr`
không đọc dữ liệu đối tác (`docDuocPhamVi`), nhưng kế hoạch 30 ngày để người vai đó giữ bước, cầm trịch,
theo dõi kế hoạch, và bộ gom nhắc gửi tên công ty của những việc đó qua Zalo/Slack. Năm đường rò và cách
vá ở design doc. Hạng T3 vì chạm `apps/api/src/workspace` (đổi vai).

Source input: hàng DA0a · lời giao của giám sát 12/10 · `docs/api.md` mục «tRPC is the data surface» ·
`docs/agent.md` mục «Nhắc buổi sáng» · design doc.

## Criteria

- AC-1: Given một kế hoạch đang mở có bước chưa giao, một người vai `okr` và một người vai `member`, When quản trị gọi `onboarding.assignStep` giao bước cho người vai `okr`, Then thủ tục trả 400 với lời nêu tên người đó và chữ «chỉ OKR», `assigneeId` của bước vẫn `null`, không có hàng `activity` mới của kế hoạch; và When giao cùng bước cho người vai `member`, Then thành công.
- AC-2: Given kế hoạch của AC-1, When quản trị gọi `onboarding.addStep` có `assigneeId` là người vai `okr`, Then trả 400 cùng lời đó và số bước của kế hoạch không đổi; When gọi `onboarding.setPlanOwner` sang người vai `okr`, Then trả 400 cùng lời đó và `ownerId` không đổi.
- AC-3: Given một khuôn kế hoạch đang dùng, When gọi `onboarding.createFromTemplate` với `ownerId` là người vai `okr`, Then trả 400 lời «chỉ OKR» và không kế hoạch nào được tạo; When `ownerId` là một người dùng không có hàng `member`, Then trả 400 lời «không phải thành viên» và không kế hoạch nào được tạo; When `ownerId` là người vai `member`, Then kế hoạch được tạo.
- AC-4: Given người A vai `member` cầm trịch một kế hoạch đang mở và làm một bước chưa xong, When quản trị gọi `onboarding.transferWork` từ A sang người vai `okr`, Then trả 400 lời «chỉ OKR» và không kế hoạch, bước nào đổi người; Given người B vai `okr` đang giữ một kế hoạch và một bước (dữ liệu cũ), When chuyển việc từ B sang người vai `member`, Then kế hoạch và bước sang người đó.
- AC-5: Given người A vai `member` đang cầm trịch kế hoạch mở hoặc làm bước chưa xong của kế hoạch mở (ba biến thể: chỉ kế hoạch, chỉ bước, 2 kế hoạch và 3 bước), When quản trị gọi `workspace.setMemberRole` đổi A sang `okr`, Then trả 409 với lời đúng nguyên văn hàm lời của cấu hình cho cặp (số kế hoạch, số bước) của biến thể và chỉ sang «Chuyển việc», vai của A vẫn `member`, lượt theo dõi của A không đổi; bước đã xong và kế hoạch đã đóng không tính vào hai số.
- AC-6: Given người A vai `member` không giữ kế hoạch hay bước mở nào nhưng theo dõi một kế hoạch mở và một kế hoạch đã đóng, When đổi A sang `okr`, Then vai của A là `okr` và A không còn lượt theo dõi nào; Given người C vai `okr` theo dõi một kế hoạch, When đổi C sang `member`, Then lượt theo dõi của C còn nguyên; Given người D đã mang vai `okr` từ trước (dữ liệu cũ) theo dõi một kế hoạch mở và không giữ việc, When quản trị lưu lại vai `okr` cho D qua `setMemberRole`, Then D không còn lượt theo dõi nào; và nếu D còn giữ một bước mở thì lần lưu đó trả 409 như AC-5.
- AC-7: Given người vai `okr` là người làm một bước sắp hạn, cầm trịch một kế hoạch im từ 7 ngày, theo dõi một kế hoạch đang ở mốc ngày, và có một việc OKR đến hạn, và một người vai `member` ở đúng ba vị trí đó, When gọi `viecCanNhac` với `cuaSo` `buoi-sang` rồi `truc-tiep`, Then danh sách của người vai `okr` không có mục nào thuộc bốn loại kế hoạch (`buoc-qua-han`, `buoc-sap-han`, `ke-hoach-im`, `moc-ngay`) và vẫn có mục OKR; danh sách của người vai `member` có đủ mục của ba vị trí; và thẻ «Việc của bạn» (`okr.viecCuaToi`) của người vai `okr` trên cùng kho không có mục kế hoạch, còn Tổng quan (`dashboard.*`) từ chối người vai `okr` ở cửa với `KHONG_TRONG_PHAM_VI`.
- AC-8 (cross-layer): Given kho của AC-7 lúc sau 08:30 giờ VN, When nhịp nhắc chạy (`lenLichNhac` rồi `chayNhac`) với Zalo giả và Slack giả theo đúng hợp đồng gửi tin thật, Then mỗi kênh gửi đúng một tin tới người vai `okr` (một người cho Zalo, một người khác cho Slack), tin có tên KR của họ và không chứa tên công ty của các kế hoạch, và `payload.daGui` của hàng đó không có mục kế hoạch; Given người vai `okr` có kênh Zalo nhưng chỉ giữ việc kế hoạch, và một người vai `member` cùng khuôn, When nhịp nhắc chạy, Then người vai `member` có hàng `nhac-ke-hoach` còn người vai `okr` không có hàng nào và không tin nào gửi tới họ.
- AC-9: Given người vai `owner`, `admin`, `member`, `okr` và một người dùng không có hàng `member`, When gọi `onboarding.nguoiNhanViec`, Then kết quả gồm đúng ba người đầu; When mở ô chọn người làm của một bước, ô chọn người cầm trịch khi tạo kế hoạch, và ô chọn người nhận ở hộp «Chuyển việc», Then mỗi ô chỉ liệt kê đúng ba người đó; Given một bước đã giao cho người vai `okr` từ trước, When mở ô chọn người làm của chính bước đó, Then ô vẫn hiện tên người đang giữ.
- AC-10: Given một kho thử có người vai `okr` giữ một bước mở, một kế hoạch mở, một lượt theo dõi kế hoạch mở, một hàng `nhac-ke-hoach` đã gửi tới họ có dòng kế hoạch, và bốn vật đã khép của chính người đó (bước đã xong, bước chưa xong của kế hoạch đã đóng, kế hoạch đã đóng, lượt theo dõi kế hoạch đã đóng), When chạy `rang/ro-vai-chi-okr.mjs` với `DATABASE_URL` của kho đó, Then thoát 1 và số của người đó ở `buocMo`, `keHoachMo`, `theoDoiMo`, `nhacDaMangKeHoach` đều đúng bằng 1; Given cờ `--trong <mã người>` giới hạn phép đếm vào những người của ca và họ không còn giữ việc mở, Then thoát 0; Given thiếu `DATABASE_URL`, Then thoát 2; và mọi hàng của những người trong ca giống hệt trước khi chạy.
- AC-11: Given tám bản sao phá vật thật — (a) bỏ kiểm vai ở hàm nhận việc của đường ghi, (b) bỏ kiểm người cầm trịch ở tạo từ khuôn, (c) bỏ chặn đổi vai khi còn việc, (d) bỏ xoá lượt theo dõi khi đổi vai, (e) bỏ lọc vai ở bộ gom nhắc — đo bằng cả phép đo bộ gom lẫn phép đo tin gửi, (f) để thủ tục danh sách trả mọi thành viên, (g) bỏ lọc trạng thái «đang mở» ở thước đếm, (h) bỏ qua kiểm khi vai không đổi — When chạy phép đo tương ứng trên bản sao, Then mỗi phép đo xanh trước khi phá và đỏ sau khi phá với đúng thông điệp ghim của nó, và tệp thật không đổi.
- AC-12 (judgment): Given `docs/api.md` và `docs/agent.md` sau vòng này, When người mới đọc, Then họ biết: đường ghi của kế hoạch 30 ngày (giao bước, thêm bước, cầm trịch, tạo từ khuôn, chuyển việc) từ chối người không đọc được dữ liệu đối tác; đổi sang vai «chỉ OKR» bị từ chối khi người đó còn giữ việc và xoá lượt theo dõi của họ khi không; bộ gom nhắc chỉ gom việc kế hoạch cho người đọc được dữ liệu đối tác; và cả ba đi qua một hàm `docDuocDoiTac`.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`). Trục: đường vào (giao bước · thêm bước · đổi cầm
trịch · tạo từ khuôn · chuyển việc · đổi vai · dữ liệu cũ · tự theo dõi/tự nhận) × vật (bước · kế hoạch ·
lượt theo dõi) × kênh lộ tên đối tác (tin nhắc Zalo · tin nhắc Slack · thẻ «Việc của bạn» · Tổng quan ·
ô chọn người · trả lời «xong n»). Thước CE: mọi chỗ ghi `assigneeId`, `ownerId`, `onboardingWatch` tìm
bằng grep trong `apps/api/src`, `apps/agent/agent`, `packages/db/src` [SUY-TỪ-REPO:
apps/api/src/onboarding/onboarding-ghi.ts, apps/api/src/onboarding/onboarding.service.ts,
apps/api/src/onboarding/onboarding-theo-doi.ts, apps/api/src/workspace/workspace.service.ts — `dashboard.service.ts` chỉ đọc `assigneeId` của chính người gọi, không ghi]; mọi chỗ gọi
`viecCanNhac` [SUY-TỪ-REPO: packages/db/src/onboarding-nhac.ts]. Chân ngành: OWASP ASVS 4.0 V4 (kiểm quyền
ở tầng dịch vụ tin cậy) và NIST SP 800-53 AC-2/AC-6 (đổi vai phải xét lại quyền đang giữ, đặc quyền tối
thiểu) [NGÀNH: OWASP ASVS V4, NIST SP 800-53]. Core → AC-1…AC-9 (AC-7 phủ cả thẻ «Việc của bạn» và Tổng quan); AC-10 là đường đo; AC-11 giữ phép đo
thật. Dữ liệu cũ trên production: chờ số đo, chủ kho quyết ở Cổng 1 (entry `revisit` trong sổ).

## Đường đo

- Không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR»: số từ `rang/ro-vai-chi-okr.mjs` chạy chỉ đọc trên production — `buocMo.tong + keHoachMo.tong + theoDoiMo.tong = 0`, thoát 0 · AC-10 bảo đảm thước đếm đúng, AC-1…AC-6 bảo đảm không sinh thêm.
- Không tin nhắc nào mang tên đối tác tới người vai «chỉ OKR»: cùng thước, `nhacDaMangKeHoach.tin` chỉ tăng ở các ngày trước khi gộp · AC-7, AC-8 bảo đảm.

## Out of scope

- Chủ sở hữu deal, công ty, liên hệ là người vai «chỉ OKR» — cùng lớp lỗi, thực thể khác; ô chọn của chúng đọc `users.list`.
- `users.list` liệt kê cả người đã rời workspace.
- Thu hồi tin nhắc đã gửi — Zalo và Slack không có đường thu hồi máy dùng được.
- Dọn dữ liệu cũ trên production bằng migration — chờ số đo, chủ kho quyết ở Cổng 1.

## Notes

- Luật 14 của đợt (`docs/vong-doi.md`) không áp: không loại bản ghi mới, không trạng thái kết thúc mới.
- Không ui-check: phần giao diện chỉ đổi nguồn danh sách của ba ô chọn có sẵn; đo bằng DOM test (entry `descope` «bỏ ui-observed»).
