---
schema_version: 1
feature: Khung OKR trước R1 — khung Mục tiêu và thanh Theo đơn vị hết chín lỗi trình bày, liên kết chéo hỏi lại trước khi bỏ thay đổi
slug: khung-okr-truoc-r1
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-04T06:18:06Z
design_doc: docs/superpowers/specs/2026-10-04-khung-okr-truoc-r1-design.md
---

# Acceptance Contract: khung-okr-truoc-r1

## Context

Mọi phòng ban dùng OKR thật từ 14/10. Khảo sát 04/10 (62 màn thật và lái thử production) thấy
chín lỗi trình bày ở khung Mục tiêu, ở hàng Mục tiêu và ở thanh «Theo đơn vị»: KH1–KH5, G2, G3,
R1m-2, R1m-3, R1m-5. Thêm một liên kết trong hộp «Mức hiển thị» bỏ thay đổi chưa lưu mà không
hỏi. Vòng này sửa đúng mười chỗ đó. Không đổi API, dữ liệu hay quyền.

Source input: hàng R1a của `docs/plan/lo-trinh-okr.json` + `de-xuat-lo-trinh.md` mục A1 +
`lai-thu-prod-0410/bao-cao.md` mục 2 (ảnh trước: `evidence/truoc/`).

## Criteria

- AC-1: Given khung Mục tiêu đang mở ở 1440 px, 390 px và 375 px, When xem tab KR (có ≥ 1 KR), tab Căn
  chỉnh (có ≥ 1 nơi góp) và tab Vết (có ≥ 1 dòng), Then khung của mỗi bảng cách mép trái và mép
  phải vùng nội dung của khung đúng bằng lề của khu «Vì sao lúc này» (20 px), không chạm mép khung,
  và góc phải của bảng không bị cắt.
- AC-2: Given quản trị mở «Theo đơn vị» ở 1440 px trên một đơn vị ở pha lập kế hoạch, When trang
  vẽ lần đầu và sau khi dữ liệu nút soạn về, ở từng dạng soạn — đang tải, mở được, có cuộc đang
  soạn, chế độ ẩn, hết cuộc, tạm nghỉ, chưa có khoá, chưa cấu hình — Then mọi nút của thanh nằm
  trên cùng một hàng (cùng `top`); chiều cao thanh và vị trí đầu danh sách Mục tiêu không đổi
  giữa lần vẽ đầu và sau khi dữ liệu về; nhóm nút soạn là phần tử cuối của thanh.
- AC-3: Given nút soạn ở từng dạng có chữ phụ, When người bấm nút «i» cạnh nút soạn (chuột, hoặc
  Enter/Space khi nút có focus), Then một popover mở và chứa đúng chữ phụ của dạng đó như hôm nay
  vẫn in dưới nút (ngày mở, số lượt và dòng chưa quyết của cuộc đang soạn; «N/3 cuộc»; «chế độ ẩn»
  và câu giải thích; câu hết cuộc, tạm nghỉ, chưa có khoá); «N/3 cuộc» trong popover mở danh sách
  cuộc như nút cũ; Esc đóng popover và trả focus về nút «i»; ngoài popover không còn chữ phụ nào
  của nút soạn trên thanh.
- AC-4: Given máy chủ chưa cấu hình soạn nháp (`cauNoi` sai) và đơn vị ở pha lập kế hoạch, When
  quản trị mở «Theo đơn vị», Then thấy nút soạn khoá và nút «i» mà popover nói tính năng chưa
  được bật trên máy chủ này; When một người sửa được đơn vị nhưng không phải quản trị mở cùng màn,
  Then không có nút soạn nào và không có câu «chưa được bật».
- AC-5: Given khung Mục tiêu, When đọc nhãn năm tab ở giao diện tiếng Việt và tiếng Anh, Then
  trong mỗi ngôn ngữ không có hai tab cùng nhãn; tab Vết tiếng Anh là «Changes», tab Diễn biến
  tiếng Anh là «History»; nhãn tiếng Việt giữ như hôm nay. Nhãn mới đi qua khoá mới; khoá cũ
  của `lib/messages` giữ nguyên (luật điều phối: chỉ thêm khoá).
- AC-6: Given một Mục tiêu có đúng 1 KR và một Mục tiêu có 2 KR, When xem dòng tiến độ dưới
  bảng KR ở giao diện tiếng Anh, Then hai dòng là «Objective progress X% from 1 KR.» và
  «Objective progress Y% from 2 KRs.»; giao diện tiếng Việt giữ «Tiến độ mục tiêu X% tính từ N KR.».
- AC-7: Given khung Mục tiêu mở ở 375 px và 390 px (ngăn kéo dưới) với một Mục tiêu có ≥ 3 KR, When người
  cuộn nội dung khung xuống ≥ 300 px bằng con lăn, Then tên Mục tiêu, nhãn và ba ô số cuộn ra
  khỏi khung nhìn cùng nội dung, còn thanh tab dính ở mép trên vùng cuộn và vẫn bấm được; When cuộn
  về đầu, Then đầu khung hiện lại đủ. Khung thoả thuận mở ở 375 px giữ cấu trúc cũ: đầu khung đứng
  yên, chỉ thân tab cuộn.
- AC-8: Given khung Mục tiêu ở 375 px và 390 px có tiến độ kèm kỳ vọng («35% · lẽ ra 40%») và người phụ
  trách tên dài ≥ 20 ký tự, When khung vẽ, Then chữ trong ô Tiến độ và ô Phụ trách hiện trọn, xuống bao nhiêu dòng
  cũng được: phần tử chữ không bị cắt ngang hay dọc (`scrollWidth ≤ clientWidth`, `scrollHeight ≤ clientHeight`), chữ nhìn thấy (`innerText`) chứa đủ số kỳ vọng
  và tên đầy đủ.
- AC-9: Given ở 375 px và 390 px một khung chi tiết bất kỳ (Mục tiêu, thoả thuận), When đầu khung vẽ, Then
  tên bản ghi căn trái (`text-align` tính ra là `left` hoặc `start`), mép trái của tên nằm ngay sau
  ảnh đại diện; ở 1440 px đầu khung không đổi so với hôm nay.
- AC-10: Given một Mục tiêu có góp ý Kara đang chờ, When xem hàng của nó ở «Của tôi» và «Theo đơn
  vị», Then chip «Kara · N góp ý» là một `Badge` bấm được (`data-slot="badge"`, phần tử `button`)
  cùng chiều cao, cùng bo góc, cùng cỡ chữ với nhãn loại bên cạnh; rê chuột và focus bàn phím đều
  có trạng thái nhìn thấy; Enter/Space trên chip mở khung tới vùng Kara như bấm chuột, và không
  làm hàng thu hay mở.
- AC-11: Given Mục tiêu có nhãn loại, nhãn trạng thái và chip Kara, When xem hàng ở «Của tôi» và
  «Theo đơn vị», ở 1440 px và 375 px, Then chip là phần tử cuối của nhóm nhãn và cùng hàng với
  nhãn loại (`top` chênh ≤ 2 px), ở cả bốn ô; nhóm nhãn không bao giờ tách thành hai hàng chỉ để
  chip đứng riêng.
- AC-12: Given hộp «Mức hiển thị» đang mở, người đã chọn «Giới hạn» và thêm người xem, máy chủ từ
  chối vì Mục tiêu có căn chỉnh, When người bấm «Mở tab Căn chỉnh», Then hộp hỏi «Bỏ thay đổi?»
  trước khi đóng; chọn ở lại → hộp vẫn mở với lựa chọn và người xem như trước, tab của khung không
  đổi; chọn bỏ → hộp đóng và khung chuyển sang tab Căn chỉnh. Khi hộp không có thay đổi chưa lưu,
  bấm nút đi thẳng sang tab Căn chỉnh như hôm nay.
- AC-13: Given bốn vai (quản trị, trưởng phòng, nhân viên, chỉ OKR) ở 375 px, 390 px và 1440 px, When mở
  «Của tôi», «Theo đơn vị» và khung Mục tiêu sau khi vòng này gộp, Then không màn nào tràn ngang
  (`scrollWidth == innerWidth`) và không có lỗi console mới.
- AC-14: Given ảnh trước (`evidence/truoc/`) và ảnh sau của khung Mục tiêu ở 1440 px và 375 px và
  của thanh «Theo đơn vị», When một người chưa đọc mã nhìn, Then họ thấy bảng KR có lề như các khu
  khác, đọc được tiến độ và người phụ trách trên điện thoại mà không phải đoán chữ bị cắt, và thanh
  nút là một hàng gọn. (judgment)

## Coverage

- Trục A — chỗ lỗi: thanh Theo đơn vị | hàng Mục tiêu (Của tôi, Theo đơn vị) | đầu khung | thân
  khung (bảng, dòng tiến độ, tab) | hộp Mức hiển thị [thước CE: mười mục của A1 —
  SUY-TỪ-REPO: `.acceptance-runs/dieu-phoi-1410/nguon/khao-sat-lo-trinh/de-xuat-lo-trinh.md`
  (ngoài git, chép vào design doc), `lai-thu-prod-0410/bao-cao.md` mục 2]
- Trục B — khổ: 1440 | 390 | 375 [thước CE: khảo sát 04/10 đo 390 và 1440; `~/.claude/rules/web/testing.md`]
- Trục C — vai: quản trị | trưởng phòng | nhân viên | chỉ OKR [thước CE: bốn vai của khảo sát R1]
- Trục D — dạng dữ liệu: tám dạng nút soạn (`HINH_NUT_TAT` + mở/tiếp/ẩn/đang tải trong
  `soan/nut-soan.tsx`) | 1 KR / ≥ 2 KR | có/không góp ý | tên dài [thước CE: SUY-TỪ-REPO
  `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`]
- Lớp cắt ngang: tiếng Việt và tiếng Anh (AC-5, AC-6) · bàn phím (AC-3, AC-10) · không hồi quy
  ở các khung khác (AC-7, AC-9) · không tràn ngang (AC-13).
- [NGÀNH: Material Design 3 — top app bar thu lại khi cuộn] và [NGÀNH: Apple HIG — large title
  thu lại khi cuộn]: đầu màn cuộn đi, thanh điều hướng ở lại — ứng viên đã nhận (AC-7).
- [NGÀNH: Google Web Vitals — Cumulative Layout Shift]: khối nạp muộn không đẩy nội dung —
  ứng viên đã nhận (AC-2).
- [GIẢ ĐỊNH] khổ 768 (máy tính bảng) đi theo nhánh máy tính (`md`), không đo riêng.
- Later: theme tối chụp đủ mọi ô (vòng này chụp sáng; AC-13 đo cả hai không tràn); chữ chip tiếng
  Anh số ít (G1).
- Never: khổ 768 có bố cục riêng — sản phẩm không có nhánh máy tính bảng.

## Đường đo

Ngưỡng của `opportunity.md`, từng vế:

- «0/9 lỗi còn tái hiện, 4 vai × 390/1440 trên bản đã gộp» · số từ `rang/man-khung.mjs` (bốn
  phần `le`, `thanh`, `dien-thoai`, `chip`) và `rang/bon-vai.mjs` chạy lại trên sha đã gộp vào
  `onehub`, ở 375, 390 và 1440 · AC-1, AC-2, AC-7, AC-8, AC-9, AC-10, AC-11, AC-13 bảo đảm phép đo
  tồn tại; mỗi lỗi KH1–KH5, G2, G3, R1m-2, R1m-3, R1m-5 có một dòng in («le ok», «thanh ok»,
  «dien thoai ok», «o so ok», «can trai ok», «chip ok», «cung hang ok»; KH3 và KH5 từ bài DOM E6, E7).
- «0 màn mới tràn ngang hay lỗi console» · `rang/bon-vai.mjs` trên sha đã gộp · AC-13.
- «lái thử người lạ không vấp ở khung Mục tiêu» · nghi thức tay của Cổng Giá trị
  (`/acceptance-gate:uat-session` §0, nhật ký vấp ghi tên người và ngày) · không AC nào; đây là
  việc người.
- «gộp trước 08/10» · ngày merge của PR · không AC.

## Out of scope

- Chữ chip Kara tiếng Anh «1 suggestions» (G1) và các lỗi chữ, focus, ngày của vùng Kara (G4–G7):
  lượt Kara lượt 2 và K6a.
- Đổi tên «Trợ lý» sang Kara ở nút soạn: lượt K6a (chủ kho chốt câu chữ đi sau).
- Hồi ý, Cập nhật tuần, Toàn cảnh (R1m-1, R1m-4, R1m-6, R1m-7): hàng R1c của phiên P2.
- Sáu lỗi tổ chức và dựng cây (#11 #13 #16 #17 #18 #30): hàng R1d, đi sau vòng này.
- Cho các khung chi tiết khác (thoả thuận, cá nhân, công ty, kế hoạch) cuộn cả khung trên điện
  thoại: tab Tác nhân của chúng có ô soạn ghim đáy.
- Đo lại các eval máy của mọi hồ sơ đã ký: không chạy lại từng eval của hồ sơ khác; lưới là bộ
  suite của kho (AC-13 cộng `suite_keys`).

## Notes

- Hướng của từng lỗi và hướng đã bỏ: design doc mục «Hướng, từng lỗi» và «Đã cân».
- Thang «Vẽ tay là bậc cuối»: popover nút soạn dùng `Popover` (bậc 1); chip dùng `Badge` mở rộng
  trạng thái `button` (bậc 1, mở rộng trong `packages/ui`); căn trái đầu ngăn kéo là tuỳ chọn mới
  của `DrawerHeader` (bậc 1, mở rộng). ReUI: tra «badge button clickable», «split button info
  popover» — ghi kết quả vào mô tả PR.
- Tệp ngoài danh sách P1 của `LUAT.md` mà vòng này cần: `record-parts.tsx`, `bang-vet.tsx`,
  `packages/ui/src/components/badge.tsx`, `drawer.tsx` (chỉ thêm), `lib/messages/okr.ts`,
  `okr-soan.ts` (chỉ thêm khoá, ghim ở `messages-guard`). Điều phối duyệt 04/10 13:00 (Nhật ký `LUAT.md`).
- **Known limits (chủ kho ghi ở Cổng Bằng chứng 2026-10-04):**
  - AC-10 trên điện thoại — bấm chip «Kara · N góp ý» của một Mục tiêu đã có sẵn dữ liệu thì khung mở ở
    đầu, không cuộn tới vùng Kara: lần cuộn chạy trong bố cục máy tính của lần vẽ đầu rồi tự tắt, sau đó
    khung đổi sang bố cục điện thoại và vùng cuộn về đầu. Sửa trong hàng R1d (`okr-to-chuc-va`).
  - Ngoài-1 — bài kiểm «nút bật thường không có nhãn chế độ ẩn» không mở «i», nên không bắt được nhãn
    hiện nhầm trong hộp thông tin của nút đang bật.
  - Ngoài-3, Ngoài-12, Ngoài-15 — truy vấn khả năng soạn lỗi (mất mạng, máy chủ lỗi) thì nút «Soạn OKR cùng
    Trợ lý» khoá mãi như đang tải, không thông báo, không thử lại cho tới khi tải lại trang.
  - Ngoài-4 — bài kiểm nút «Mở tab Căn chỉnh» khi máy chủ từ chối dùng lỗi giả dựng tay.
  - Ngoài-5 — bài kiểm Esc trả focus về «i» tự đặt focus sẵn, nên không bắt được popover thôi trả focus.
  - Ngoài-6 — bài kiểm người không quản trị không thấy câu «chưa được bật» luôn xanh vì câu ấy nằm trong
    popover đóng.
  - Ngoài-7 — phép đo bảng thẳng hàng với «Vì sao lúc này» bỏ qua im lặng khi khu ấy vắng.
  - Ngoài-8 — dạng nút có cuộc đang soạn chưa có ca riêng đo chữ phụ không còn trên thanh.
  - Ngoài-9 — báo cáo đo in sẵn số dạng, số ca thay vì đếm thật.
  - Ngoài-10 — E15 có thể chấm đạt trên khung báo lỗi thay vì khung Mục tiêu thật.
  - Ngoài-14 — chuỗi hiếm: «Mở tab Căn chỉnh» → chọn tiếp tục sửa → đóng hộp bằng X và xác nhận bỏ thì
    khung chuyển sang tab Căn chỉnh.
- **Hợp đồng mới (Ngoài-2):** chọn «ở lại» ở câu hỏi «Bỏ thay đổi?» rồi bấm X đóng hộp «Mức hiển thị» thì
  khung nhảy sang tab Căn chỉnh thay vì chỉ đóng hộp — tách thành việc riêng.
