---
slug: du-an-gantt
preset: entity-feature
at: 2026-10-16
---

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục «Việc», «Việc con», «Dự án», «Phạm vi
  dữ liệu»; `docs/api.md` mục «Việc»; `docs/vong-doi.md`; `docs/settings.md`; `packages/db/src/viec.ts`,
  `viec-ghi.ts`; hồ sơ `_acceptance/viec-chung/`, `kanban-viec/`, `ke-hoach-sinh-viec/`) · chân ngành: khảo sát 29
  nền tảng trong kho (`docs/plan/viec-du-an-nghien-cuu/04-quan-ly-cong-viec.md` — Asana, monday, Notion, ClickUp,
  Smartsheet, Jira; `06-thi-truong-viet.md` — Base, 1Office, MISA AMIS), và chuẩn giao diện kho đã khai
  `web-design-guidelines` (bản tải 16/10).

## Trục

Preset entity-feature có bốn trục. «Vào–ra» co thành bề mặt thao tác, vì việc vào và ra đã do DA1 phủ; «thời gian»
ở lượt này chính là lịch, nên thành trục riêng.

- **A. Thao tác trên dự án:** tạo và sửa dự án · gom việc (tạo trong dự án, đưa việc có sẵn vào hay ra) · đặt ngày
  bắt đầu và hạn · kéo thanh trên Gantt · tạo và gỡ phụ thuộc · tự dời · mốc và việc chờ mốc · đóng, mở lại, xoá
  [thước CE: câu giao và `vi_sao` của hàng DA4; mẫu «Gantt mức đủ = E1 + E2 + E3» của
  `04-quan-ly-cong-viec.md` `[NGÀNH: Asana, monday, Notion — dời theo phụ thuộc; Smartsheet — lịch làm việc]`;
  ba câu của `docs/vong-doi.md` `[SUY-TỪ-REPO: docs/vong-doi.md]`]
- **B. Người × phạm vi:** người tạo dự án · người giao của việc · người thực hiện · thành viên khác đọc được phạm vi
  đối tác · quản trị · vai «chỉ OKR»
  [thước CE: luật sửa việc `suaViec` và bảng chuyển trạng thái `docs/api.md` mục «Việc»; «Phạm vi dữ liệu» của
  `CONTEXT.md` `[SUY-TỪ-REPO: packages/db/src/viec-ghi.ts]`]
- **C. Lịch:** ngày làm việc thường · Thứ Bảy, Chủ nhật · ngày lễ quản trị thêm · lịch đổi sau khi đã xếp · khoảng
  qua tuần, qua tháng, qua năm
  [thước CE: quyết định Cổng Đáng (`opportunity.md` mục «Nguồn quyết định») · `[NGÀNH: Smartsheet, Notion —
  ngày tự tính theo lịch làm việc, tuỳ chọn tránh cuối tuần]`]
- **D. Bề mặt và lỗi:** chuột ở 1280 · bàn phím · 375 · lối bấm qua khung việc · máy chủ từ chối · tải hỏng · hai
  người cùng dời một chuỗi
  [thước CE: `docs/design.md` «Chờ tải và lỗi tải»; `web-design-guidelines` «mọi cử chỉ kéo có lối bấm và lối phím»;
  AC 1280/375 của DA1, DA2]

## Core (≤20%)

1. A·tạo dự án × B·thành viên đối tác × D·1280/375 — một nơi «Việc», ô Phạm vi (Của tôi · Tất cả dự án · một
   dự án), tạo dự án từ ô đó, «Của tôi» không đổi khi không tham số (chủ kho chọn B ở Cổng Phạm vi). → AC-1
2. A·gom việc × B·người giao/thực hiện — tạo trong dự án, đưa vào, đưa ra, việc con mang dự án của cha; việc riêng
   vào dự án thành thấy được. → AC-2
3. A·đặt ngày × B·người sửa được việc — ô Bắt đầu, luật bắt đầu không sau hạn, vết. → AC-3
4. A·xem Gantt × D·1280/375 — thanh, mốc, mũi tên, ngày nghỉ tô, nhóm «Chưa có lịch», trạng thái màn. → AC-4
5. A·kéo thanh × D·chuột/phím × B·có và không có quyền — lần kéo ghi hai ngày một lần, nguồn `gantt`. → AC-5
6. A·phụ thuộc × B·người sửa được việc sau — tạo, gỡ, chặn vòng, chặn khác dự án, chặn thiếu ngày. → AC-6
7. A·tự dời × C·mọi giá trị — lan theo chuỗi, bỏ ngày nghỉ, giữ thời lượng, không kéo lùi, một vết mỗi ngày đổi. → AC-7
8. A·đặt ngày tay sớm hơn việc phải chờ × D·từ chối — 400 có tên việc trước; D·hai người cùng dời một chuỗi — kết
   quả cuối đúng ràng buộc. → AC-7
9. A·mốc × C·việc chờ dời qua mốc — mốc giữ ngày, hiện «Trễ». → AC-8
10. C·ngày lễ, T7/CN × B·quản trị/thành viên — trang Lịch làm việc, «Không đủ quyền». → AC-9
11. C·mọi giá trị — hàm ngày làm việc thuần, ma trận viết trước. → AC-10
12. B·mọi vai × A·mọi lệnh ghi — ma trận quyền ở máy chủ, vai «chỉ OKR» 403. → AC-11
13. A·đóng, mở lại, xoá — ba câu vòng đời, hỏi lại khi còn việc mở, không đổi việc. → AC-12
14. Đường đo của Cổng Đáng — thước chỉ đọc trên dữ liệu mẫu. → AC-13
15. Lớp nhìn thấy — chụp các trạng thái chính ở 1280 và 375. → AC-14
16. Tài liệu — `CONTEXT.md`, `docs/api.md`. → AC-15

Core 16 trên 84 ô có nghĩa (A 8 × B 6 = 48 ô thao tác-người, cộng 5 ô lịch × 4 thao tác có ngày = 20, cộng 16 ô
bề mặt) ≈ 19%.

## Later

- Báo người thực hiện khi việc của họ bị tự dời (cần đường ghi qua tác tử).
- Dời «giữ khoảng cách» và «không dời» (Asana, monday, Notion có cả ba).
- Kéo nối phụ thuộc trực tiếp trên Gantt; kéo mốc; kéo thanh tự bám ngày làm việc.
- Dự án gắn công ty đối tác; khuôn dự án; nhân bản dự án.
- Đếm dự án trong `install_daily`.
- Gantt ở phạm vi «Của tôi» hay «Tất cả dự án»; lọc «Của tôi» theo dự án.
- Ngày bắt đầu trong khuôn kế hoạch 30 ngày và trên màn kế hoạch.
- Độ trễ, đường găng, baseline, tải từng người — DA6.

## Never

- Loại việc riêng cho dự án — `da_bac` x2.
- Tự đóng hay xoá việc khi đóng hay xoá dự án — `da_bac` x4.
- Một việc trong nhiều dự án — dự án là chỗ chứa; hai lịch cho một việc thì Gantt mâu thuẫn.
- Nạp sẵn lịch lễ Việt Nam theo âm lịch — chủ kho chọn quản trị thêm tay (Cổng Đáng 16/10).
- Vai «chỉ OKR» xem dự án — «Việc» của `CONTEXT.md`: lượt này vai đó chưa dùng Việc.

## Cross-cutting áp mọi ô Core

- Một chỗ ghi (`@crm/db`), một giao dịch, một vết mỗi thay đổi; dữ liệu người nhập `translate="no"`.
- Chờ tải, lỗi tải, rỗng; giới hạn số lượng (`DU_AN`); làm mới qua `useCrmCache()`.
- Không dữ liệu cá nhân mới ngoài tên người đã có trong Việc.
