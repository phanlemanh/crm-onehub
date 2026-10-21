---
schema_version: 1
feature: Ban lãnh đạo mở Báo cáo › Sơ đồ, thấy sơ đồ góp vào chiếm trọn vùng nội dung, bấm Toàn màn hình để thu thanh bên, và mở sơ đồ lấy tâm một mục tiêu từ ngăn của nó
slug: so-do-toan-vung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-21
design_doc: docs/superpowers/specs/2026-10-19-so-do-toan-vung-design.md
---

# Acceptance Contract: so-do-toan-vung

## Context

Hàng VK6 của `docs/plan/lo-trinh-okr.json` (mã V3 của `docs/plan/pham-vi-okr-vo-khu-1810.md`), đợt chạy
`vo-khu-muc-tieu`, dãy V3. Cổng Đáng ký `build` 19/10 11:09Z, ngưỡng: «Sơ đồ không còn bề rộng tối đa của trang; một
màn Sơ đồ thay cho Cây căn chỉnh và trang Sơ đồ quanh mục tiêu; Esc thoát toàn màn hình», hạn 26/10.

Source input: `opportunity.md`, design doc ở frontmatter, bản mẫu `/proto/vo-khu-muc-tieu?state=ST-vkm-so-do` và
`ST-vkm-toan-man` (nhánh `feat/vo-khu-muc-tieu`, `2790552ac`, chỉ đọc). Dựng trên vỏ khu của VK2 `vo-khu-muc-tieu` và
hai sơ đồ đã ký: DH4 `so-do-can-chinh-don-vi` (cả công ty theo đơn vị) và DH5 `so-do-quanh-muc-tieu` (quanh một mục
tiêu).

Soạn trước khi VK2 gộp (19/10), **đối chiếu với VK2 thật ngày 21/10** sau #516 (`6f9b770fb`) — bảng đối chiếu ở
design doc. VK2 đã đặt: mục Sơ đồ ở `/okr/so-do` (nội dung tạm là Cây căn chỉnh), tâm là đoạn đường
`/okr/so-do/muc-tieu/<id>` (chuyển từ `/okr/quanh-muc-tieu/<id>`, rewrite về thư mục cũ), Toàn cảnh thành Sức khoẻ
`/okr/suc-khoe` còn cách xem Sơ đồ, khung `KhungTrangOkr` bọc trang trong `PageShell` mặc định.

Từ ngữ: «Sơ đồ» = mục trong nhóm Báo cáo của thanh bên khu (`CONTEXT.md`). «Vùng nội dung» = phần của vỏ khu nằm phải
thanh bên khu và dưới đầu ứng dụng. «Toàn màn hình» = trạng thái của vỏ khu mà thanh bên khu (`AreaSidebar` của VK1, `w-56` từ
`md`) thu lại; thanh biểu tượng và đầu ứng dụng giữ nguyên. Dưới `md` thanh bên khu là hàng cuộn ngang và Sơ đồ không
có nút Toàn màn hình (AC-7), nên toàn màn hình chỉ có từ `md`. «Tâm» = mục tiêu mà sơ đồ đang xem quanh.

## Criteria

- AC-1: Given người xem có quyền đọc OKR và kỳ có OKR, When mở Báo cáo › Sơ đồ (`/okr/so-do`) ở khổ 1440 px, Then khung vẽ chiếm trọn
  vùng nội dung — bề rộng khung vẽ bằng bề rộng vùng nội dung trừ tối đa lề của dải công cụ, không có bề rộng tối đa
  của `PageShell`; khung vẽ cao hết phần còn lại của khung nhìn (đáy khung vẽ chạm đáy vùng nội dung); tài liệu không
  cuộn dọc hay ngang; And trên khung vẽ chỉ có một dải công cụ một dòng gồm đường mảnh «Báo cáo › Sơ đồ góp
  vào», bộ lọc «Mọi đơn vị · Cần chú ý» và nút «Toàn màn hình», không `PageShellDescription`, và `docs/design.md` có
  dòng ngoại lệ «màn toàn vùng» ở mục «Khung trang».
- AC-2: Given Sơ đồ đang ở khung thường, When bấm «Toàn màn hình», Then thanh bên khu (`[data-slot=area-sidebar]`) không còn trong cây truy cập, khung
  vẽ rộng thêm đúng bề rộng của thanh bên, nút đổi thành «Thoát toàn màn hình» với `aria-pressed="true"`, tiêu điểm ở
  lại trên nút; trạng thái toàn màn hình sống trong vỏ khu suốt lúc đi giữa các kiểu xem của Sơ đồ, mất khi tải lại và
  không đi theo đường dẫn; When nhấn Esc khi không ngăn, hộp thoại, menu hay thẻ đơn vị nào đang mở, Then
  thoát toàn màn hình, thanh bên khu hiện lại; And khi một lớp đang mở trên sơ đồ ở toàn màn hình — ngăn chi tiết, hộp
  thoại, menu, hay thẻ đơn vị mở ra (`moDonVi`) — nhấn Esc lần đầu chỉ đóng lớp ấy (vẫn toàn màn hình), lần hai mới
  thoát.
- AC-3: Given đường `/okr/so-do/muc-tieu/<M>` với M là id mục tiêu người xem thấy, When trang dựng, Then khung vẽ
  hiện sơ đồ quanh M theo đúng đầu ra `okr.quanhMucTieu({ objectiveId: M })` — mỗi nút một thẻ, thẻ M đang chọn, dòng
  «Đang xem quanh: <tên M>» và dòng góp lên công ty của DH5 — trong cùng khung toàn vùng của AC-1, đường mảnh thành
  «Báo cáo › Sơ đồ › <tên M>», bộ lọc đơn vị không hiện, có liên kết «Về sơ đồ cả công ty» trỏ `/okr/so-do`; rê chuột
  và bấm thẻ mở ngăn hành xử như AC-6, AC-7 của DH5; And ở `/okr/so-do` khung vẽ là sơ đồ cả công ty theo đầu ra `okr.soDoDonVi` với thẻ, lọc, mở thẻ đơn
  vị (`moDonVi`) như AC-4–AC-8 của DH4 trừ phần Bảng/Sơ đồ; And đổi qua lại hai kiểu xem — bằng «Về sơ đồ cả công
  ty», hay bằng thẻ › ngăn › «Xem trên sơ đồ» — giữ trạng thái toàn màn hình.
- AC-4: Given ngăn chi tiết một mục tiêu đọc được, When ngăn dựng xong, Then hàng hành động có nút chữ «Xem trên sơ
  đồ» (thay «Xem quanh mục tiêu») là một liên kết (`<a href>`) tới `/<slug>/okr/so-do/muc-tieu/<id mục tiêu ấy>` và
  không mang khoá truy vấn nào; bấm nó mở Sơ đồ lấy tâm ấy, giữ khung đang có (thường hay toàn màn hình); khu «Góp vào
  đâu» và tab «Góp vào» của ngăn không đổi.
- AC-5: Given đường dẫn cũ đã lưu, When mở `/<slug>/okr/quanh-muc-tieu/<id>`, Then dừng ở `/okr/so-do/muc-tieu/<id>`
  và trang ấy là màn Sơ đồ lấy tâm của AC-3 — thư mục đích rewrite `okr/quanh-muc-tieu/[objectiveId]` không còn dựng
  `PageShell` hay trang riêng nào ngoài màn Sơ đồ chung; When mở Sức khoẻ (`/okr/suc-khoe`, hay `/okr/toan-canh` qua
  chuyển của VK2) với `?xemToanCanh=so-do` (kèm hay không kèm `moDonVi`, `locSoDo`), Then tới `/okr/so-do` mang theo
  `moDonVi`, `locSoDo`; And Sức khoẻ không còn cách xem Sơ đồ; And `redirects()` và `rewrites()` của `next.config.ts`
  không đổi so với `onehub` lúc cắt nhánh.
- AC-6: Given đường dẫn cũ `/okr/bo-okr?xemOkr=cay` (kèm `donOkr`), When mở, Then tới `/okr/so-do` mở sẵn thẻ của đơn
  vị đang chọn (`moDonVi`); `cay` không còn là giá trị của `CACH_XEM_OKR`; không màn nào — kể cả `/okr/so-do` mà VK2
  tạm đặt Cây — còn dựng `CayCanChinh` (`role="tree"` của cây căn chỉnh); lý do góp vào vẫn đọc được trên thẻ đơn vị
  mở ra.
- AC-7: Given khổ dưới `md`, When mở Sơ đồ (cả công ty hay lấy tâm), Then không dựng khung vẽ và không có nút «Toàn màn
  hình»; cùng dữ liệu hiện thành danh sách `Item` của DH4 (cả công ty) hay bốn nhóm của DH5 (lấy tâm); trang không cuộn
  ngang.
- AC-8: Given truy vấn đang chạy / hỏng / trả `NOT_FOUND` cho tâm / kỳ chưa có OKR, Then dải công cụ với đường mảnh luôn
  hiện, và lần lượt: khung xương cùng hình với «Đang tải sơ đồ…» cho trình đọc; `VungTaiLoi` «Không tải được sơ đồ» có
  nút thử lại gọi lại truy vấn; câu «Không tìm thấy mục tiêu này, hoặc bạn không có quyền xem.» kèm «Về sơ đồ cả công
  ty»; câu rỗng của DH4 — không khung vẽ trống câm, không vòng quay toàn trang.
- AC-9: Given chữ mới của màn (nút toàn màn hình, đường mảnh, «Về sơ đồ cả công ty», nút trong ngăn), Then chữ đến từ
  tệp chữ của khu có đủ `vi`, `en` khác nhau; tên mục tiêu, KR, đơn vị mang `translate="no"`; nút có vòng
  `focus-visible`; nhãn trên màn là «Góp vào», không còn «căn chỉnh», «cây căn chỉnh» ở màn Sơ đồ.
- AC-10: Given bộ OKR mẫu với ca sơ đồ của DH4 đã nạp, When ở 1440 px mở Báo cáo › Sơ đồ, bấm «Toàn màn hình», nhấn Esc,
  rồi mở ngăn của mục tiêu phòng ban góp qua bộ phận lên KR công ty và bấm «Xem trên sơ đồ», rồi mở cùng hai đường ở 390
  px, Then có ảnh từng bước: khung vẽ bằng bề rộng vùng nội dung ở khung thường; rộng thêm và không có thanh bên ở toàn
  màn hình; thanh bên trở lại sau Esc; sơ đồ quanh mục tiêu với dòng góp lên công ty gọi đúng KR mà tệp gieo khai; danh
  sách ở 390 và trang không cuộn ngang; And đang toàn màn hình, mở ngăn bằng cách bấm thẻ rồi bấm «Xem trên sơ đồ», rồi
  «Về sơ đồ cả công ty» — không tải lại trang, thanh bên vẫn vắng sau cả hai lần đổi; And mọi eval của hồ sơ đã ký mà
  `paths` khớp một tệp vòng này sửa, hoặc mà bước hay lệnh nhắc tới đường, khoá hay bộ chọn vòng này bỏ
  (`/okr/quanh-muc-tieu`, `xemToanCanh=so-do`, `xemOkr=cay`, `role="tree"` của Cây, `CayCanChinh`) thì hoặc thoát đúng mã
  kỳ vọng (eval `test`/`script`), hoặc đã khai nghỉ có `superseded_by` theo khuôn luật 21 chủ kho đã cho, hoặc (eval
  `ui-check`/`judgment`) có dòng giữ nêu vì sao nó vẫn đúng trên màn mới.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature + test-matrix), 19/10; bảng ở `coverage-scan.md`. Chân sản phẩm:
`docs/plan/lo-trinh-okr.json` (VK2, VK6), `CONTEXT.md` (Báo cáo, Sơ đồ, Căn chỉnh), bản mẫu `vo-khu-muc-tieu`
`2790552ac`, hai hồ sơ đã ký DH4, DH5; chân ngành: Tability Strategy map (trọn vùng, Full screen) qua lượt rà 18/10.

- **Trục A — lối vào:** thanh bên khu | ngăn mục tiêu | `/okr/quanh-muc-tieu/<id>` | `?xemOkr=cay` | `?xemToanCanh=so-do`
  | tải lại hay gửi đường dẫn.
  - Thước CE: câu giao, `bat_khi` của VK6 và VK2 [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json]; nếp nuqs [SUY-TỪ-REPO:
  docs/design.md].
- **Trục B — kiểu xem:** cả công ty | quanh một mục tiêu | lọc Cần chú ý.
  - Thước CE: [SUY-TỪ-REPO: _acceptance/so-do-can-chinh-don-vi/contract.md], [SUY-TỪ-REPO:
  _acceptance/so-do-quanh-muc-tieu/contract.md].
- **Trục C — khung:** thường | toàn màn hình | dưới `md`.
  - Thước CE: `KhungKhu anThanhBen` [SUY-TỪ-REPO: apps/app/app/proto/_modules/vo-khu-muc-tieu/khung.tsx @2790552ac];
  thanh dọc từ `md`, hàng ngang dưới `md` [SUY-TỪ-REPO: packages/ui/src/components/area-sidebar.tsx] — đối chiếu VK1
  19/10 sau gộp `42060835e`: bản mẫu đổi ở `lg`, thành phần thật đổi ở `md`, nên ô `md`–`lg` không còn.
- **Trục D — dữ liệu:** đang tải | lỗi | tâm không thấy | kỳ rỗng | có dữ liệu.
  - Thước CE: nếp «Chờ tải và lỗi tải» [SUY-TỪ-REPO: docs/design.md].
- **Cross-cutting:** 1440 | 390; `vi` | `en`; `translate="no"`; phím, Esc theo tầng; không cuộn tài liệu; hồ sơ đã ký.
- **Ô Core:** khung toàn vùng (AC-1) · toàn màn hình và Esc (AC-2) · hai kiểu xem, tâm (AC-3) · lối vào từ ngăn (AC-4) ·
  đường cũ (AC-5) · bỏ Cây (AC-6) · hẹp (AC-7) · trạng thái (AC-8) · chữ, phím, sàn (AC-9) · màn thật và hồ sơ đã ký
  (AC-10).
- **Đối chiếu ngành:** [NGÀNH: Tability Strategy map — bản đồ trong vỏ, trọn vùng, nút Full screen].
- **Later:** thẻ Sơ đồ trong trang một bộ OKR (VK3); Fullscreen API của trình duyệt; giấu cả thanh biểu tượng; lối vào
  từ ngăn KR (VK7); in, xuất ảnh.
- **Never:** sửa căn chỉnh từ sơ đồ; đổi đầu ra `okr.soDoDonVi`, `okr.quanhMucTieu`, `okr.cayCanChinh`.

## Đường đo

- Vế «không còn bề rộng tối đa»: bề rộng khung vẽ so với vùng nội dung, đo trên màn thật (AC-1, AC-10).
- Vế «một màn Sơ đồ thay cho Cây căn chỉnh và trang Sơ đồ quanh mục tiêu»: hai đường cũ tới Sơ đồ, trang cũ và cây
  không còn dựng (AC-5, AC-6).
- Vế «Esc thoát toàn màn hình»: AC-2. Không có code đo mới; số đọc ở Cổng Bằng chứng.

## Out of scope

- Vỏ khu, thanh bên khu, ô chu kỳ, bảng chuyển hướng chung (VK2); thẻ Sơ đồ trong trang một bộ OKR (VK3).
- Đổi `FlowMap`, `flow-layout`, đầu ra `okr.soDoDonVi`, `okr.quanhMucTieu`, `okr.cayCanChinh`; thêm thủ tục API.
- Khu «Góp vào đâu», tab «Góp vào» của ngăn mục tiêu, đếm «góp vào N chỗ», đề xuất góp vào của Kara.
- Toàn màn hình của trình duyệt; giấu thanh biểu tượng hay đầu ứng dụng.

## Notes

- Ranh giới dự kiến (đối chiếu VK2 21/10; S2 chốt):
  `apps/app/app/(app)/[slug]/okr/**` (`so-do/**`, `quanh-muc-tieu/**` — đích rewrite, `toan-canh/**` — đích rewrite của
  Sức khoẻ, `theo-don-vi/**` — đích rewrite của Bộ OKR, `soan/khung-trang-okr.tsx`, `cay-can-chinh.tsx`,
  `okr-search-params.ts`, `layout.tsx`), `apps/app/components/crm/record-sheet/objective-sheet.tsx` (chỉ khoá chữ của
  nút), `apps/app/lib/messages/okr*.ts` (chỉ thêm, luật 7), `apps/app/lib/search-param-keys.ts` (chỉ thêm),
  `packages/validation/src/okr-tham-so.ts`, `docs/design.md` (một dòng ngoại lệ, Hỏi-2). Thu thanh bên chờ Hỏi-5:
  lối khuyên là `okr/layout.tsx` thôi dựng `AreaSidebar` (không chạm `packages/ui`); lối khác thêm prop thu vào
  `packages/ui/src/components/area-sidebar.tsx` — tệp hồ sơ đã ký `thanh-ben-khu-dung-chung` đo, eval của nó phải giữ
  xanh, sửa thước thì gửi giám sát trước. Cả hai lối thoả AC-2 như đang viết.
  `apps/app/test/okr-so-do-toan-vung.dom.tsx` (mới), `_acceptance/config.yaml` (chỉ thêm khoá `vk6_*`),
  `_acceptance/so-do-toan-vung/**`. Không chạm `next.config.ts` (AC-5). Khung toàn vùng dùng
  `PageShell width="full" contained` đã có, không dựng khung mới trong `packages/ui`.
- Vùng chung (luật 19): thanh bên khu và `apps/app/lib/messages/okr*.ts` là của làn Mac Studio; `objective-sheet.tsx`
  nằm dưới `apps/app/components/crm/record-sheet/**` — **vùng của làn M5** → gửi `cham-tep` trước S3.
- Vùng tạm né của đợt (`LUAT.md` của `vo-khu-muc-tieu`): `apps/app/components/crm/record-sheet/**` và
  `apps/app/app/(app)/[slug]/okr/**` chỉ được sửa sau khi #525 (VK7) gộp — S3 bắt đầu sau mốc đó.
- Hồ sơ VK2 `vo-khu-muc-tieu` (ký 21/10) có hai chỗ đo Cây: E4 «`/okr/so-do`: sơ đồ góp vào (CayCanChinh) có ít nhất
  một nút» và AC-3 kể «cây» trong kiểu xem `xemOkr`. Cả hai thuộc «cách xem Cây» của Hỏi-3 (sổ d-…-14) và đi khuôn
  luật 21 như DH4, DH5, L3.
- Hỏi-5 (thu thanh bên bằng cách nào) trả lời ở Cổng Phạm vi 21/10: vỏ khu thôi dựng `AreaSidebar`, không chạm
  `packages/ui` (sổ d-20261021T074335Z-25).
- Bốn câu chỉ người có ở design doc đã được chủ kho trả lời trước Cổng Phạm vi (19/10, «Theo khuyến nghị cả bốn»; sổ
  d-…-12 tới d-…-16): bỏ Cây ở VK6 (AC-6); dải công cụ thay `PageShellHeader` và thêm ngoại lệ «màn toàn vùng» (AC-1);
  cho chuyển thước hồ sơ đã ký theo khuôn luật 21 (AC-4, AC-5, AC-10, E11); toàn màn hình là chế độ tạm của vỏ (AC-2).
  Đối chiếu VK2 xong 21/10; hợp đồng trình Cổng Phạm vi.
- Known limit đã khai từ S1: sàn thiết kế tĩnh của kit trả KHONG-DO-DUOC cho `.tsx` (đo 15/10 ở DH5 E11), nên vòng này
  không có eval sàn tĩnh; vế nhìn-thấy của luật thiết kế do E10 (ui-check) và mắt người ở Cổng Bằng chứng gánh.
- Đọc trước khi chạm (bảng chỉ mục của `AGENTS.md`): `docs/design.md`; trước S3 thêm `docs/reui.md` (bậc 3–4 cho khung
  trang toàn vùng).
- Hạng T2 (máy suy theo `t3_paths`: không chạm đường T3).
