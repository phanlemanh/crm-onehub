---
schema_version: 1
feature: Trưởng đơn vị bấm Soạn OKR và viết cả bộ như một tài liệu — mục tiêu, KR liền mạch — với góp ý của Kara và điểm chất lượng ở cột bên, rồi công bố
slug: che-do-soan-bo-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-22T03:08:40Z
design_doc: docs/superpowers/specs/2026-10-22-che-do-soan-bo-okr-design.md
---

# Acceptance Contract: che-do-soan-bo-okr

## Context

Hôm nay tạo một mục tiêu có ba KR mất khoảng mười bấm qua ngăn tạo rồi từng hộp KR; cuộc soạn cùng Kara chỉ cho người
nhận hay bác dòng Kara viết, không tự gõ được; và khối Kara chiếm phần lớn ngăn theo dõi. Vòng này thêm chế độ Soạn:
một khung bản ghi cho một bộ OKR — tài liệu bên trái ghi thẳng mục tiêu và KR nháp qua thủ tục có sẵn, cột bên phải có
khối Chất lượng (máy chấm) và khối góp ý Kara — rồi công bố từ chính khung. Ngăn theo dõi chỉ còn một chip góp ý.
Không thủ tục API mới, không migration.

Source input: hàng VK10 `docs/plan/lo-trinh-okr.json`; ô cơ hội `_acceptance/che-do-soan-bo-okr/opportunity.md`; bản
mẫu `/proto/che-do-soan-bo-okr` (sổ `design-pass.md`). Đứng trên VK3 `trang-bo-okr` và hộp «Thêm mục tiêu» của VK9.

«Người soạn» là người sửa được bộ (trưởng đơn vị của bộ, quản trị chương trình). «Đủ chữ»: mục tiêu có tên ≥3 ký tự;
KR có tên ≥3 ký tự, khởi điểm và đích là số (hay KR mốc). Đo trên phiên đo riêng của cây (`tien-de.mjs`), bộ OKR mẫu
(`bun run okr:mau`), tiếng Việt; khổ 1280×800 và 375×812.

## Criteria

- AC-1 (cross-layer): Given người soạn mở trang một bộ OKR (VK3) của đơn vị mình ở chu kỳ còn nhận ghi, When chọn «Soạn
  cả bộ» trong hộp «Thêm mục tiêu», hoặc bấm «Soạn bộ OKR» trong câu rỗng khi bộ chưa có mục tiêu, Then khung bản ghi
  cỡ `kara` mở với tiêu đề «Soạn bộ OKR» và tên bộ (đơn vị · chu kỳ), URL mang khoá của bộ nên tải lại vẫn mở đúng bộ;
  tài liệu bên trái liệt đúng các mục tiêu chưa bỏ của bộ — khớp `okr` của đơn vị và chu kỳ ấy — theo thứ tự màn theo
  dõi, mỗi mục tiêu kèm đủ KR; cột bên phải có khối «Chất lượng» và khối góp ý Kara.
- AC-2 (cross-layer): Given chế độ Soạn của một bộ, When người soạn gõ tên mục tiêu, Enter, rồi với mỗi KR gõ tên, Tab,
  khởi điểm, Tab, đích, Tab, đơn vị, Enter — không dùng chuột — cho ba KR, Then mục tiêu được tạo qua
  `okr.createObjective` (đúng đơn vị và chu kỳ của bộ, loại Cam kết, trạng thái nháp, người phụ trách là trưởng đơn vị
  của bộ — bộ không có trưởng thì người soạn, theo Hỏi-8) và mỗi KR qua `okr.createKeyResult` (cùng người phụ trách mặc
  định, kiểu tăng khi đích lớn hơn khởi điểm, giảm khi nhỏ hơn); khi quản trị chương trình soạn bộ của một phòng ban,
  người phụ trách mặc định vẫn là trưởng phòng ban ấy; sau khi tải lại, cả bốn dòng còn đúng chữ và số; một KR thiếu đích
  hiện «Chưa lưu — thiếu đích» và không có lần gọi `createKeyResult` nào cho nó.
- AC-3 (cross-layer): Given tài liệu có một mục tiêu nháp, một mục tiêu đã công bố và một mục tiêu chờ duyệt, When người
  soạn sửa chữ một dòng rồi rời ô, xoá một dòng KR trống bằng Backspace ở đầu dòng, và chọn «Xoá» cho một mục tiêu nháp
  chưa có lịch sử, Then sửa chữ gọi `okr.updateObjective` hay `okr.updateKeyResult` đúng một lần; xoá KR gọi
  `okr.removeKeyResult`; xoá mục tiêu hỏi lại bằng `ConfirmDialog` rồi gọi `okr.xoaMucTieu`; ở mục tiêu đã công bố, chữ
  sửa được còn mọi ô số khoá kèm câu «Số của mục tiêu đã công bố sửa ở ngăn KR»; mục tiêu chờ duyệt khoá cả dòng; mục
  tiêu đã bỏ không có trong tài liệu.
- AC-4: Given chế độ Soạn, When người soạn gõ hay sửa bất kỳ dòng nào, Then khối «Chất lượng» (không mang dấu Kara) hiện
  «N trên M điểm đạt» và thanh tiến, với N và M bằng kết quả hàm chấm bộ của `packages/validation` cho đúng nội dung đang
  hiện trong tài liệu, cập nhật ngay sau lần gõ mà không gọi máy chủ. M là tổng điểm xét: mỗi mục tiêu xét hai luật mức
  mục tiêu («có 2–5 KR» ở mọi mục tiêu; «có KR đối trọng» ở mục tiêu có từ 2 KR, vi phạm đúng khi `kiemOkr` trả
  `thieu-doi-trong`), mỗi KR xét các luật mức KR áp cho kiểu của nó theo bảng `OKR_KIEM` («không là việc», «có khởi điểm»,
  «đích khác khởi điểm») cộng «có người phụ trách»; N = M trừ số điểm vi phạm. Ví dụ: một mục tiêu với hai KR tăng tới và
  một KR giữ trên, không lỗi nào, là «12 trên 12» (mục tiêu 2; mỗi KR tăng tới 3 vì kiểu này không xét «đích khác khởi
  điểm»; KR giữ trên 4); mỗi điểm chưa đạt là một dòng nêu luật và tên dòng vi phạm; «Đến dòng» đưa focus vào đúng ô ấy;
  điểm thấp không khoá nút công bố.
- AC-5 (cross-layer): Given Kara bật cho đơn vị, When người soạn bấm «Nhờ Kara đọc bộ» rồi nhận một góp ý và bấm «Hoàn
  tác», Then `okr.troLyDeXuat` được gọi cho từng mục tiêu của bộ; trong lúc đọc cột bên hiện «Kara đang đọc bộ OKR này…»;
  góp ý chờ hiện ở cột bên dạng thẻ trong một nhóm mang nhãn Kara một lần; nhận gọi `okr.troLyQuyet`, dòng trong tài liệu
  đổi ngay sang chữ mới kèm dấu «đổi theo Kara», thẻ thu thành biên nhận có «Hoàn tác»; Hoàn tác trả dòng về chữ cũ (cơ
  sở dữ liệu cũng về chữ cũ). Khi Kara tắt, hết lượt hay lỗi, cột bên hiện trạng thái tương ứng của `KaraState` và khối
  Chất lượng vẫn chấm.
- AC-6 (cross-layer): Given bộ có hai mục tiêu nháp đủ KR (một do người soạn vừa gõ, một có sẵn từ trước), và một mục tiêu
  nháp chưa có KR, When người soạn bấm nút chính «Công bố N mục tiêu», bỏ tích một mục tiêu trong hộp rồi xác nhận, Then N
  đếm đúng các mục tiêu nháp có ít nhất một KR đã lưu; hộp hỏi lại liệt N mục tiêu, mỗi mục một ô tích mặc định đã tích
  (theo Hỏi-7), câu «Khởi điểm của mọi KR sẽ bị khoá…», và nút xác nhận đếm số mục đang tích; xác nhận gọi
  `okr.publishObjective` cho đúng các mục được tích — mục bỏ tích ở lại Nháp — và sau đó chúng ở trạng thái công bố trong
  cơ sở dữ liệu; mục tiêu chưa có KR ở lại Nháp và được gọi tên; khi chương trình bật
  «Công bố cần duyệt» và người bấm không duyệt được, nút đọc «Gửi duyệt N mục tiêu» và gọi `okr.guiDuyet`; một mục tiêu
  công bố lỗi không làm mất kết quả của mục tiêu khác, tên mục tiêu lỗi hiện kèm Thử lại; xong thì tài liệu hiện biên
  nhận «Đã công bố N mục tiêu» và «Về màn theo dõi».
- AC-7: Given khung chi tiết của một mục tiêu có góp ý Kara chờ, When mở thẻ KR, Then khung không còn vùng Kara
  (`[data-vung-kara]`) và không còn góp ý neo dưới KR nào; ở đầu khung có đúng một chip «Kara · N góp ý» với N bằng số góp
  ý chờ của mục tiêu; không có chip khi N bằng 0; bấm chip mở chế độ Soạn của bộ chứa mục tiêu, cuộn tới mục tiêu ấy, và
  góp ý của nó ở cột bên.
- AC-8: Given người không sửa được bộ (thành viên thường), và người soạn ở một chu kỳ đã đóng, When mở trang một bộ hoặc mở
  thẳng URL của chế độ Soạn, Then không có lối vào chế độ Soạn trên trang; URL mở tài liệu chỉ xem — mọi ô khoá, không nút
  công bố, không cột bên, một câu nói vì sao — và không thủ tục ghi nào được gọi. Với người soạn đang có dòng chưa lưu,
  bấm ra ngoài khung không đóng khung, còn Esc hay nút đóng hỏi «Bỏ dòng chưa lưu?» trước khi đóng.
- AC-9: Given chế độ Soạn, When bộ đang tải, khi tải lỗi, và khi lưu một dòng lỗi, Then lúc tải hiện khung xương với tiêu
  đề và tên bộ còn nguyên; lỗi tải hiện «Chưa mở được bộ OKR», một câu và nút Thử lại gọi lại thủ tục đọc; lưu lỗi giữ
  nguyên chữ đã gõ trong dòng, hiện câu lỗi theo kiểu ô (ví dụ «Ô này nhận số, ví dụ 1.234,5») và lưu lại khi rời ô.
- AC-10: Given khổ 1280×800 và 375×812, sáng và tối, When người ký nhìn ảnh chế độ Soạn có góp ý, bộ trống, hỏi công bố,
  và ngăn theo dõi một chip, Then ở 1280 tài liệu bên trái và cột bên phải chia bằng một đường kẻ; ở 375 khung phủ toàn màn
  với hai thẻ «Bộ OKR · Chất lượng và Kara» và trang không cuộn ngang (`scrollWidth` của tài liệu ≤ bề rộng khung nhìn); bố
  cục khớp bản mẫu `/proto/che-do-soan-bo-okr`, chỉ lệch ở những chỗ mục «Chỗ lệch bản mẫu» của Notes liệt; không chữ hay
  viền chìm vào nền. (judgment)
- AC-11: Given vòng này đã làm, When chạy eval máy của các hồ sơ đã ký có thước chạm khối Kara của khung chi tiết mục tiêu
  hay lối Soạn — đúng danh sách viết trước: `gop-y-dung-cho`, `kara-gop-y-luot-2`, `gan-tay-va-kara-co-ly-do`, `nen-kara`,
  `muc-tieu-va-kr`, `okr-to-chuc-va`, `soan-okr-cung-tro-ly`, `soan-okr-song-lai`, `soan-okr-trong-khung`,
  `khung-soan-chan-lien-ket`, `mot-nut-tao-muc-tieu`, `trang-bo-okr`, `dieu-huong-khu-muc-tieu`, `khung-okr-truoc-r1`,
  `okr-soat-anh-luot-3`, `trang-don-vi-mot-bang`, `quyet-gop-y-noi-dung-ly-do` — và lệnh quét của eval không thấy hồ sơ đã ký nào
  khác khớp mẫu, Then mọi mục không xấu hơn trên nền `origin/onehub` (mục đỏ sẵn trên nền in «đỏ sẵn
  trên nền»); ô đo khối Kara cũ được thay khai `superseded_by: che-do-soan-bo-okr#AC-7` (ô đo lối soạn cũ của hộp,
  `mot-nut-tao-muc-tieu/E13`, trỏ `che-do-soan-bo-okr#AC-1`); mọi thay đổi trong thước của các hồ sơ ấy là đổi bộ chọn
  hay chuỗi, hoặc thuộc năm lớp chủ kho duyệt (V1-41): (1) xoá trọn một ca mà mọi eval chạy nó đã nghỉ, (2) gỡ mục đột
  biến trỏ đoạn mã đã gỡ hay chỉ eval đã nghỉ bắt được, (3) đổi dữ liệu mẫu đã kê, (4) lật khẳng định và đổi đối chứng
  dương đã kê của `mot-nut-tao-muc-tieu`, (5) eval thước theo vòng loại khỏi lượt chạy có lý do; mỗi hồ sơ một dòng sổ
  `fix` mang `decided_by` chủ kho, nêu tệp và ca, và cặp đo hai chiều.

## Coverage

Quét bằng morphological-scan (preset entity-feature, thực thể «một lần soạn bộ OKR»):

- Trục vai: người soạn (trưởng đơn vị · quản trị chương trình) | thành viên không sửa được [thước CE: `quyen` của Bộ OKR,
  `useQuyenKhu` — SUY-TỪ-REPO]
- Trục trạng thái mục tiêu: nháp | chờ duyệt | công bố | đã bỏ [thước CE: `TRANG_THAI_MUC_TIEU` của
  `packages/validation/src/okr-muc-tieu.ts` — SUY-TỪ-REPO]
- Trục thao tác trên dòng: gõ mới | sửa | xoá | nhận góp ý | hoàn tác | công bố [thước CE: thủ tục ghi OKR có sẵn —
  SUY-TỪ-REPO]
- Trục Kara: bật | đang đọc | có góp ý | không có gì | tắt | hết lượt | lỗi [thước CE: `docs/ai-ux.md` mục 7 — SUY-TỪ-REPO]
- Trục chương trình: «Công bố cần duyệt» bật | tắt; chu kỳ còn nhận ghi | đã đóng [thước CE: `OkrProgramConfig.duyetCongBo`,
  pha chu kỳ — SUY-TỪ-REPO]
- Trục trạng thái màn: đang tải | lỗi tải | rỗng | có dữ liệu | lưu lỗi [thước CE: `docs/design.md` «Chờ tải và lỗi tải» —
  SUY-TỪ-REPO]
- Trục khổ × màu: 1280 | 375 × sáng | tối [thước CE: `docs/ai-ux.md` mục 11 — SUY-TỪ-REPO]
- Trục đường vào: hộp Thêm mục tiêu | câu rỗng của bộ | chip ngăn theo dõi | URL thẳng [thước CE: hàng VK9, bản mẫu —
  SUY-TỪ-REPO]

Thước CE: vai → AC-1, AC-8; trạng thái mục tiêu → AC-3 (đã bỏ: không hiện), AC-6; thao tác → AC-2, AC-3, AC-5, AC-6; Kara →
AC-5; chương trình → AC-6, AC-8; trạng thái màn → AC-9 (rỗng: AC-1); khổ × màu → AC-10; đường vào → AC-1, AC-7, AC-8. Ngăn
theo dõi → AC-7; hồ sơ đã ký → AC-11.

Later (ngoài vòng, có dòng sổ `descope`): Kara viết nháp ngay trong cột bên; sửa số mục tiêu đã công bố trong tài liệu;
kéo thả; dán nhiều dòng; căn chỉnh trên dòng tài liệu; điểm chất lượng ở màn khác.

## Đường đo

Ngưỡng của `opportunity.md`: «Tạo một mục tiêu có ba KR và công bố trong khoảng 3 bấm cộng phần gõ; ngăn theo dõi chỉ còn
một chip góp ý».

- Số bấm từ Bộ OKR trống tới khi một mục tiêu ba KR ở trạng thái công bố: bàn đo màn của vòng
  (`_acceptance/che-do-soan-bo-okr/rang/man-soan.mjs`) đếm mọi lần bấm chuột trên đường đi, in `BAM <n>` (kỳ vọng 3: «Soạn
  bộ OKR» · «Công bố 1 mục tiêu» · xác nhận) và đọc trạng thái qua API — AC-1, AC-2, AC-6 bảo đảm.
- Số khối Kara trên ngăn theo dõi: cùng bàn đo đếm `[data-vung-kara]`, góp ý neo và chip ở thẻ KR, in `NGAN vung <a> neo <b>
  chip <c>` (kỳ vọng 0 · 0 · 1) — AC-7 bảo đảm.

## Out of scope

- Kara viết nháp ngay trong cột bên của chế độ Soạn — cuộc soạn cũ còn là lối «Nhờ Kara soạn nháp» khi bộ trống (Hỏi-2).
- Sửa khởi điểm, đích hay số hiện tại của mục tiêu đã công bố trong tài liệu (vẫn sửa ở ngăn KR).
- Kéo thả đổi thứ tự, dán nhiều dòng một lần, căn chỉnh («Góp vào») trên dòng tài liệu.
- Điểm chất lượng ở Bộ OKR, Sức khoẻ hay ngăn theo dõi.
- Đổi lời dặn Kara (Hỏi-5 khuyên không đổi).

## Notes

- Không loại bản ghi mới, không trạng thái kết thúc mới: xoá dùng `okr.xoaMucTieu` (mục tiêu chưa có lịch sử) và
  `okr.removeKeyResult` có sẵn, theo `docs/vong-doi.md` — ba câu của mục «Tính năng mới phải trả lời ba câu» không áp.
- Chỗ lệch bản mẫu (danh sách đóng, ui-check E17 đọc mục này): (1) chế độ Soạn — tên mục tiêu lớn hơn dòng KR (ô «dòng tài
  liệu» mới của `packages/ui`); (2) chế độ Soạn — dòng đầu khung tài liệu dựng bằng ô vật phẩm không nhãn Kara mới, nên chữ
  «Không có / N mục tiêu nháp» đứng ngay sau tên bộ theo cách ô vật phẩm xếp, không dạt về góc phải như bản mẫu; (3) cột
  bên — nhãn nhóm góp ý đọc «Kara · N đề xuất» và «Vì sao?» (bản mẫu hiện tiếng Anh «N suggestions», «Why?» vì vỏ `/proto`
  không đặt ngôn ngữ); (4) hộp hỏi công bố — liệt các mục tiêu với ô tích; (5) số «N trên M» theo công thức của AC-4 (số trên
  bản mẫu chỉ minh hoạ); (6) chân tài liệu — câu đọc «Mục tiêu còn thiếu KR ở lại Nháp», theo AC-5 (KR thiếu đích không được
  lưu, nên mục tiêu chỉ có KR thiếu đích là mục tiêu chưa có KR), không «thiếu KR hay thiếu đích» như bản mẫu; (7) chế độ Theo
  dõi — thân ngăn là khung mục tiêu đầy đủ đang chạy, bản mẫu chỉ vẽ bản rút gọn; AC-7 chỉ đòi đúng một chip góp ý và không
  khối Kara.
- Chạm `apps/app/components/crm/record-sheet/**` (làn M5, luật 19) — S3 xin `cham-tep` qua phiên giám sát.
- Câu hỏi cho Cổng Phạm vi: Hỏi-1…Hỏi-8 ở design doc; AC-2 (Hỏi-8), AC-4 (Hỏi-1), AC-5 (Hỏi-5), AC-6 (Hỏi-7), AC-7 (Hỏi-4)
  và AC-11 (Hỏi-6) viết theo khuyến nghị.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-28:
  - Ngoài-1: gõ tên mục tiêu hay đơn vị KR dài quá giới hạn thì dòng không lưu được và chỉ hiện câu chung «Chưa lưu được. Rời ô để thử lại.» cho tới khi người soạn tự rút ngắn chữ.
  - Ngoài-5: hiếm khi, xoá một KR thất bại đúng lúc đang gõ KR khác của cùng mục tiêu thì KR đó biến khỏi tài liệu không báo lỗi, dù vẫn còn trên máy chủ và tải lại màn là thấy.
  - Ngoài-6: bài kiểm «không còn khối Kara, không còn góp ý neo» ở khung chi tiết mục tiêu chưa chắc bắt được nếu khối Kara quay lại theo cách khác.
  - Ngoài-7: bài kiểm «bấm ra ngoài khung thì khung vẫn mở» chưa có ca đối chứng cho thấy cú bấm ấy đóng được khung khi không có dòng chưa lưu.
