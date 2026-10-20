---
schema_version: 1
feature: Trưởng đơn vị bấm một KR ở bất kỳ đâu và mở cùng một ngăn KR, bấm Cập nhật ở đầu ngăn hay ngay trên dòng KR, thấy điểm mới nằm đâu so với đích, rồi sang KR kế mà không đóng ngăn
slug: ngan-kr-mot-cho
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-20-ngan-kr-mot-cho-design.md
---

# Acceptance Contract: ngan-kr-mot-cho

## Context

Hàng VK7 của `docs/plan/lo-trinh-okr.json` (mã B1 và B1b của `docs/plan/pham-vi-okr-vo-khu-1810.md`), đợt chạy
`vo-khu-muc-tieu`, dãy V3. Cổng Đáng ký `build` 19/10 11:09Z, ngưỡng: «Cập nhật một KR từ trang bộ OKR trong 3 bấm; mọi
lối bấm vào KR mở cùng một ngăn», hạn 26/10.

Source input: `opportunity.md`, design doc ở frontmatter, bản mẫu `/proto/vo-khu-muc-tieu?state=ST-vkm-ngan-kr` (nhánh
`feat/vo-khu-muc-tieu`, `2790552ac`, chỉ đọc). Dựng trên chồng ngăn bản ghi (`useRecordStack`, `RecordSheetHost` — hồ sơ
VS8 `ngan-ban-ghi-giu-danh-tinh` đã ký) và hộp cập nhật của `cap-nhat-tuan-okr` đã ký.

Từ ngữ: «Ngăn KR» = ngăn bản ghi `{ kind: "kr", id }` (`KrSheet`). «Hộp cập nhật» = `HopThoaiCapNhatKr`. «Trang đơn
vị» = `/okr/theo-don-vi` hôm nay, sẽ thành trang bộ OKR khi VK3 xong. «Được cập nhật» = KR nằm trong `canEditKr` của
mục tiêu và có `hienTaiQuaCapNhat` — cùng cổng với mục «…» → Cập nhật hôm nay. «Bấm» = một lần bấm chuột hay chạm; gõ
phím không tính.

## Criteria

- AC-1: Given một KR K của mục tiêu M, When bấm vào K ở mỗi lối — dòng KR ở trang đơn vị, nút «Việc» và con số của K
  trong bảng KR của ngăn M, thẻ K trên sơ đồ quanh mục tiêu, khối KR ở Tổng quan, Của tôi và họp tuần — Then mỗi lối gọi
  đúng một lần mở ngăn `{ kind: "kr", id: K }`, không lối nào mở `so-kr` hay tab «Diễn biến» của ngăn M; lối con số mở
  ngăn KR ở mục «Số và nguồn»; không còn chỗ nào trong `apps/app` mở loại ngăn `so-kr`.
- AC-2: Given ngăn KR của K mở, When ngăn dựng xong, Then đầu ngăn có: tên M là liên kết mở ngăn M; tên K; đếm «n/N»
  (vị trí của K trong các KR của M theo `position`, N = số KR của M); nút «KR trước», «KR kế»; và nút «Cập nhật» kiểu
  `primary` khi người xem được cập nhật K — không được thì không có nút; mục tiêu chỉ một KR thì không có đếm và ‹ ›.
- AC-3: Given ngăn KR của K, Then thân ngăn có theo thứ tự: ô số «Hiện tại» kèm đích và «Tiến độ» kèm kỳ vọng
  (`StatGroup`), thanh tiến độ có vạch kỳ vọng, mục «Lịch sử cập nhật» với đồ thị `TargetLineChart` (đường đích, mỗi lần
  cập nhật một điểm) và danh sách lần cập nhật mới nhất trước, mục «Việc và bằng chứng» (hai tab của ngăn KR hôm nay),
  mục «Số và nguồn» (nội dung ngăn số hôm nay), mục «Chi tiết» (phụ trách, hạn, kiểu KR); các tab và đếm của ngăn KR
  hôm nay vẫn hoạt động.
- AC-4: Given ngăn KR của K là KR thứ n của M, When bấm «KR kế» (hay «KR trước»), Then chồng ngăn thay đỉnh bằng KR thứ
  n+1 (n−1) của M — ngăn M nằm dưới giữ nguyên, số ngăn trong chồng không đổi, `RecordSheetHost` không bị gỡ, ngăn
  không đóng — đếm thành «n+1/N», tiêu điểm ở lại trên nút vừa bấm; ở KR đầu nút «KR trước» bị tắt, ở KR cuối nút «KR
  kế» bị tắt.
- AC-5: Given ngăn KR của K và người xem được cập nhật K, When bấm «Cập nhật» ở đầu ngăn, Then hộp cập nhật của K mở với
  tiêu điểm ở ô giá trị; When gửi một lần cập nhật hợp lệ, Then hộp đóng, ngăn KR vẫn mở trên K, ô «Hiện tại», lịch sử
  và đồ thị hiện giá trị vừa gửi mà không tải lại trang.
- AC-6: Given trang đơn vị đang mở M với các KR, When trang dựng, Then mỗi dòng KR mà người xem được cập nhật có nút
  «Cập nhật» hiện sẵn (không nằm trong menu), dòng không được thì không có; bấm nút mở hộp cập nhật của đúng KR ấy; And
  mục «…» → Cập nhật trong bảng KR của ngăn M vẫn còn và mở cùng hộp ấy.
- AC-7 (cross-layer): Given trang đơn vị với KR K được cập nhật, When bấm «Cập nhật» trên dòng K (bấm 1), gõ giá trị
  vào ô đã có tiêu điểm, chọn một mức tự tin (bấm 2) và bấm «Gửi cập nhật» (bấm 3), Then đúng một lần cập nhật được
  ghi cho K qua `okr.guiCapNhat` với giá trị và mức tự tin đã chọn, đọc lại được từ máy chủ, và không cần bấm thêm lần
  nào; And mức tự tin vẫn bắt buộc — gửi khi chưa chọn thì không ghi gì; And KR mốc đi cùng đường với một
  bấm chọn «Xong», tức 4 bấm.
- AC-8: Given hộp cập nhật của KR số K mở, When gõ một giá trị hợp lệ, Then đồ thị xem trước trong hộp có các điểm lịch
  sử, đường đích và một điểm mới mang giá trị vừa gõ, cùng dòng tiến độ mới tính bằng `tienDoKr` của
  `packages/validation`; When đổi giá trị, Then điểm và dòng đổi theo; When giá trị sai, Then không có điểm mới và có lỗi
  chữ như hôm nay; And KR mốc thì hộp hiện «Xong» / «Chưa xong» cạnh đích, không có đồ thị số.
- AC-9: Given khổ dưới `md`, When mở ngăn KR và trang đơn vị, Then ngăn KR là `Drawer` với cùng đầu ngăn (đếm, ‹ ›,
  Cập nhật) và cùng các mục; nút «Cập nhật» trên dòng KR có trong danh sách của trang; trang không cuộn ngang.
- AC-10: Given truy vấn ngăn KR đang chạy / hỏng / KR không thấy hay không có quyền / KR đã bỏ hay chu kỳ đã khép, Then
  lần lượt: khung xương cùng hình; `VungTaiLoi` «Không tải được KR» có thử lại gọi lại truy vấn; câu «Không tìm thấy KR
  này, hoặc bạn không có quyền xem.»; ngăn đọc được nhưng không có nút «Cập nhật» ở đầu ngăn và trên dòng; And chữ mới
  đến từ tệp chữ của khu có `vi`, `en` khác nhau, tên KR, mục tiêu, người mang `translate="no"`, nút có vòng
  `focus-visible`.
- AC-11: Given bộ OKR mẫu đã nạp, When ở 1440 px từ trang đơn vị cập nhật một KR bằng nút trên dòng, rồi mở ngăn KR từ
  dòng ấy, bấm «Cập nhật» ở đầu ngăn, gửi, bấm «KR kế», rồi mở ngăn KR từ thẻ sơ đồ và từ khối Của tôi, rồi lặp đường
  trên dòng ở 390 px, Then có ảnh từng bước; số bấm thật từ trang đơn vị tới lần cập nhật đã ghi (đọc lại từ máy chủ)
  bằng 3; mọi lối đã thử mở cùng một ngăn KR (đường dẫn `record=kr:<id>`); And các eval `test`/`script` của hồ sơ đã ký
  mà `paths` ghi đích danh một tệp vòng này sửa thoát đúng mã kỳ vọng, hoặc đã khai nghỉ có `superseded_by` theo khuôn luật 21 chủ kho đã cho.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature + test-matrix), 20/10; bảng ở `coverage-scan.md`. Chân sản phẩm:
`record-stack.ts`, `kr-sheet.tsx`, `so-kr-sheet.tsx`, `objective-sheet.tsx`, `hop-thoai-cap-nhat-kr.tsx`,
`packages/validation/src/okr-cap-nhat.ts`, `okr-kr.ts`, `schema.prisma` (`OkrKeyResult.position`), bản mẫu `NganKr`;
chân ngành: Tability — một ngăn KR, «Create check-in» ở đầu, ‹ › sang KR kế, 3 bấm, qua lượt rà 18/10.

- **Trục A — lối vào KR:** dòng KR trang đơn vị | nút Việc trong bảng KR | con số KR | thẻ KR trên sơ đồ | khối KR Tổng
  quan, Của tôi, họp tuần | ‹ › từ ngăn KR khác.
  - Thước CE: bảng lối hôm nay [SUY-TỪ-REPO: apps/app/components/crm/record-sheet/record-stack.ts]; `vi_sao` «bấm ở bốn
  chỗ ra bốn nơi» [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json].
- **Trục B — người xem và KR:** được cập nhật | chỉ đọc | KR mốc | KR số | KR đã bỏ, chu kỳ khép.
  - Thước CE: cổng `canEditKr` và `hienTaiQuaCapNhat` [SUY-TỪ-REPO:
  apps/app/components/crm/record-sheet/objective-sheet.tsx]; `tienDoKr` theo kiểu [SUY-TỪ-REPO:
  packages/validation/src/okr-kr.ts].
- **Trục C — vị trí KR trong mục tiêu:** đầu | giữa | cuối | mục tiêu một KR.
  - Thước CE: `position` [SUY-TỪ-REPO: packages/db/prisma/schema.prisma].
- **Trục D — trạng thái hộp và ngăn:** đang tải | lỗi | không thấy | giá trị hợp lệ | giá trị sai | chưa chọn tự tin |
  gửi hỏng.
  - Thước CE: nếp «Chờ tải và lỗi tải» [SUY-TỪ-REPO: docs/design.md]; hộp hôm nay [SUY-TỪ-REPO:
  apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx].
- **Cross-cutting:** 1440 | 390 (Sheet | Drawer); `vi` | `en`; `translate="no"`; phím và tiêu điểm; chồng ngăn của VS8;
  hồ sơ đã ký.
- **Ô Core:** mọi lối một ngăn (AC-1) · đầu ngăn (AC-2) · thân ngăn (AC-3) · ‹ › (AC-4) · Cập nhật đầu ngăn (AC-5) · Cập
  nhật trên dòng (AC-6) · 3 bấm ghi thật (AC-7) · xem trước (AC-8) · hẹp (AC-9) · trạng thái, chữ (AC-10) · màn thật và
  hồ sơ đã ký (AC-11).
- **Đối chiếu ngành:** [NGÀNH: Tability — KR drawer với Create check-in ở đầu, ‹ › giữa các KR].
- **Later:** ‹ › qua cả bộ OKR (chủ kho chọn trong một mục tiêu, 20/10); cập nhật hàng loạt trong ngăn; lối KR từ thông báo và
  tin nhắc (`record=kr:` chưa có ở tin nhắc); Kara gợi ý giá trị trong hộp.
- **Never:** sửa tại chỗ trong thân ngăn — hai nơi cập nhật; bỏ bắt buộc mức tự tin — cập nhật mất tín hiệu tự tin.

## Đường đo

- Vế «3 bấm»: số bấm thật trên màn từ trang đơn vị tới lần cập nhật đọc lại được từ máy chủ (AC-7, AC-11).
- Vế «mọi lối mở cùng một ngăn»: ma trận lối → `{ kind: "kr" }` (AC-1) và đường dẫn trên màn thật (AC-11). Không có code
  đo mới; số đọc ở Cổng Bằng chứng.

## Out of scope

- Đổi `RecordSheetHost`, `record-stack.ts`, `nap-san-khi-mo-ngan.tsx` (hồ sơ VS8 đã ký).
- Đổi thủ tục API hay lược đồ `okr.moCapNhat` / `okr.guiCapNhat`; cập nhật tuần hàng loạt (`CapNhatTuan`).
- Trang bộ OKR (VK3), vỏ khu (VK2); tab «Diễn biến» của ngăn mục tiêu giữ nguyên.
- Lối KR trong tin nhắc buổi sáng và thông báo.

## Notes

- Ranh giới dự kiến (S2 chốt; đăng crm #375 trước Cổng Phạm vi):
  `apps/app/components/crm/record-sheet/kr-sheet.tsx`, `objective-sheet.tsx`, `so-kr-sheet.tsx`, `dien-bien-kr.ts`
  (**vùng làn M5**, luật 19 — `cham-tep` V3-2: M5 đồng ý trên #375 20/10 02:41Z cho bốn tệp này; ngoài `record-sheet-host.tsx`, `record-stack.ts`, `nap-san-khi-mo-ngan.tsx`),
  `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx`, `okr/cap-nhat-tuan/cap-nhat-tuan.tsx` (`OGiaTri`, chỉ thêm
  ô xem trước và tiêu điểm), `okr/bang-kr.tsx`, `okr/theo-don-vi/bang.tsx`, `okr/khoi-tom-tat.tsx`,
  `okr/khoi-kr-cua-toi.tsx`, `okr/hop-tuan.tsx`, `apps/app/lib/messages/okr*.ts` (chỉ thêm, luật 7),
  `apps/app/test/ngan-kr-mot-cho.dom.tsx` (mới), `_acceptance/config.yaml` (chỉ thêm), `_acceptance/ngan-kr-mot-cho/**`.
- Bốn câu chỉ người có ở design doc đã được chủ kho trả lời trước Cổng Phạm vi (20/10, «Theo khuyến nghị cả bốn»; sổ
  dòng `gate1` cuối sổ): gộp cả lối con số và lối diễn biến, cho chuyển thước hồ sơ đã ký theo khuôn luật 21 (AC-1, AC-3,
  AC-11); ‹ › trong một mục tiêu (AC-4); 3 bấm cho KR số, KR mốc 4 bấm (AC-7); đo trên trang đơn vị hôm nay (AC-6,
  AC-7, AC-11). Hợp đồng vẫn là bản nháp tới khi người duyệt Cổng Phạm vi.
- Ràng buộc chuyển cho VK3 `trang-bo-okr`: bảng KR của trang bộ OKR mang nút «Cập nhật» trên dòng mở đúng hộp này; E8 và
  E12 khai `paths` trên `apps/app/app/(app)/[slug]/okr/**` nên VK3 chạm trang thì lưới giữ hồ sơ đã ký chạy lại hai
  thước ấy.
- Hồ sơ đã ký đo tệp vòng này sửa (E13 canh): `cap-nhat-tuan-okr` (E18 đi đường «…» → hộp — giữ), `no-sau-luot-4-okr`
  E8 (ma trận mục «…» Cập nhật — giữ), `canh-kr-okr` (ngăn KR), `okr-to-chuc-va`, `so-okr-tu-chay` (ngăn số),
  `trang-don-vi-mot-bang` E6, `so-do-quanh-muc-tieu` E5/E7, `muc-tieu-va-kr`, `toan-canh-okr` (Diễn biến, `Progress`,
  `TargetLineChart`), `cua-toi-ba-phan`, `hop-thoai-giu-cho-dang-nhap` E9 (danh sách tệp có `SheetContent`),
  `ngan-ban-ghi-giu-danh-tinh` và `ve-sinh-do-san-onehub` (không chạm tệp của chúng).
- Đọc trước khi chạm (bảng chỉ mục của `AGENTS.md`): `docs/design.md`; trước S3 thêm `docs/ai-ux.md` nếu chạm lối Kara.
- Hạng T2 (máy suy theo `t3_paths`: không chạm đường T3).
