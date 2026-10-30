---
schema_version: 1
feature: Người phụ trách KR mở chi tiết KR, ghi giá trị mới, mức tự tin và ghi chú ngay trong ngăn, thấy điểm mới trên Lịch sử và sang KR kế mà không mở hộp thoại nào
slug: cap-nhat-trong-ngan-kr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-30
design_doc: _acceptance/cap-nhat-trong-ngan-kr/design.md
---

# Acceptance Contract: cap-nhat-trong-ngan-kr

## Context

Cập nhật một KR hôm nay mở hộp thoại giữa màn (`HopThoaiCapNhatKr`) từ bốn lối — nút đầu ngăn KR, dòng Họp tuần, dòng
KR của bảng theo đơn vị, menu «…» của ngăn mục tiêu. Hộp che ngăn, tự vẽ biểu đồ gom theo tuần lệch với Lịch sử mỗi lần
một điểm (SV7), và mọi lối ghi chung `entry: "sheet"`. Mọi ngăn bản ghi khác đã ghi tại chỗ. Vòng này thay hộp bằng một
khối cập nhật trong ngăn KR, giữa ô số và Lịch sử, theo `docs/design.md` mục «Ghi vào bản ghi: ngay trong ngăn».

Source input: hàng SV8 `docs/plan/lo-trinh-okr.json` · Cổng Đáng `_acceptance/cap-nhat-trong-ngan-kr/opportunity.md`
(chủ kho 30/10, `build`) · trang tri thức `crm-onehub-nguon:wiki/chu-de/ghi-trong-ngan.md` · bản mẫu
`/proto/cap-nhat-trong-ngan-kr`.

Đo bằng DOM dựng `RecordSheetHost` và màn thật trên dữ liệu parse bằng schema thật, bài API trên CSDL thử cho lần ghi,
và phiên đo màn riêng của cây trên bộ OKR mẫu ở khổ 1280×800 và 375×812.

## Criteria

- AC-1: Given người sửa được KR K (`coNutCapNhat` đúng) và K đến hạn chưa cập nhật (Hỏi-1), When mở chi tiết K, Then
  khối cập nhật nằm giữa ô số và Lịch sử, mở sẵn, có ô giá trị, mức tự tin, ghi chú và đúng một nút chính «Gửi cập
  nhật»; Given K đã cập nhật trong tuần này, Then khối thu thành một dòng nêu lần mới nhất, bấm thì mở và con trỏ vào ô
  giá trị. And Given người ghi không phải người phụ trách (trưởng đơn vị ghi hộ), Then khối hiện dòng «Ghi hộ <tên người
  phụ trách>»; người phụ trách tự ghi thì không có dòng ấy.
- AC-2: Given người không sửa được K, hoặc kỳ đang chấm điểm hay đã đóng, hoặc mục tiêu đã bỏ, When mở chi tiết K, Then
  không có khối cập nhật và ngăn như trạng thái chỉ đọc hôm nay.
- AC-3: Given khối đang mở, When gõ một giá trị hợp lệ, Then biểu đồ của Lịch sử hiện thêm đúng một chấm nét đứt tại giá
  trị ấy và khối hiện một dòng mức đổi so với lần mới nhất («12 → 14 (+2 đại lý)»; KR mốc «Chưa xong → Xong»); khối không
  vẽ biểu đồ hay khối «lần trước» riêng. Xoá giá trị thì chấm và dòng mức đổi biến mất.
- AC-4: Given đã nhập giá trị, mức tự tin, ghi chú, When bấm «Gửi cập nhật» hoặc Ctrl/⌘+Enter, Then thêm đúng một
  `OkrCheckIn` của K mang đúng ba giá trị ấy (cross-layer); ngăn K vẫn mở; dòng đầu Lịch sử là lần vừa gửi; biểu đồ thêm
  một điểm liền và không còn chấm nét đứt; ô «Hiện tại» bằng giá trị vừa gửi; khối thu lại. And Given KR mốc, When chọn
  Xong, dán liên kết bằng chứng và gửi, Then `OkrCheckIn` lưu Xong và đúng liên kết ấy.
- AC-5: Given máy chủ từ chối lần gửi, When gửi, Then khối báo lỗi ngay trong khối bằng câu người đọc được, nháp giữ
  nguyên, không thêm `OkrCheckIn` nào, ngăn vẫn mở.
- AC-6: Given khối có nháp chưa gửi, When đóng ngăn hoặc bấm ‹ ›, Then hỏi lại trước khi bỏ nháp; chọn ở lại thì ngăn và
  nháp giữ nguyên; chọn bỏ thì đóng hay sang KR kế. Không nháp thì không hỏi.
- AC-7: Given dòng Họp tuần, dòng KR của bảng theo đơn vị, hay menu «…» của ngăn mục tiêu có lối «Cập nhật» cho K, When
  bấm nó, Then mở chi tiết K (không Dialog nào mở), khối mở, được cuộn tới và con trỏ ở ô giá trị; lối Họp tuần giữ thứ
  tự bảng cho ‹ ›; mỗi lối ghi `entry` riêng (`hop-tuan` · `bang-don-vi` · `muc-tieu`; khối trong ngăn ghi `sheet`).
- AC-8: Given chi tiết K, When nhìn đầu ngăn, Then không còn nút chính «Cập nhật»; ‹ › và đếm giữ nguyên. When gửi xong
  rồi bấm › sang KR kế, Then khối của KR kế mở hay thu theo trạng thái của chính nó, không mang nháp hay mức đổi của K —
  kể cả khi ngăn mở từ lối Họp tuần (`tab=cap-nhat` không ép KR kế mở khối; `thuTuKr` giữ nguyên).
- AC-9: Given khổ 375 (chi tiết KR là ngăn kéo), When làm AC-1, AC-4, AC-7, Then khối nằm trong ngăn kéo, gửi được, và
  không lớp nào khác (hộp thoại, ngăn kéo thứ hai) mở chồng lên.
- AC-10: Given đã sửa, When chạy bộ bài kiểm và các thước đã ký đang đo cập nhật KR, Then mọi bài xanh và hộp
  `HopThoaiCapNhatKr` không còn được dựng ở đâu trong app. Mỗi assertion của thước đã ký chạm hộp (ma trận dựng bằng grep,
  `_acceptance/cap-nhat-trong-ngan-kr/thuoc-da-ky.md`) mang đúng một nhãn — giữ · chuyển chỗ đo · thay lời hứa; không
  assertion nào mất mà không có nhãn «thay lời hứa», và mỗi ô «thay lời hứa» nằm trong Hỏi-2 đã được chủ kho trả lời; mỗi
  hồ sơ đã ký bị chạm có một dòng sổ `fix` (luật 34).

## Coverage

Quét theo trục (skill `morphological-scan`, preset entity-feature; bản quét ở `coverage-scan.md`):

- Trục A — trạng thái KR với người xem: sửa được và đến hạn · sửa được, đã cập nhật · không sửa được hay kỳ khoá ·
  ghi hộ [thước CE: `coNutCapNhat` của `cap-nhat-kr.tsx` + `Alert data-ghi-ho` của hộp hiện tại] → AC-1, AC-2.
- Trục B — kiểu KR: số tăng · số giảm · mốc [thước CE: `kr.kind` và `XemTruocMoc`/`XemTruocSo` của hộp hiện tại] → AC-3,
  AC-4.
- Trục C — vòng đời một lần ghi: thu · mở · đang gõ · gửi được · gửi lỗi · bỏ nháp [thước CE: mục «Ghi vào bản ghi»] →
  AC-1, AC-3, AC-4, AC-5, AC-6.
- Trục D — lối vào: trong ngăn · dòng Họp tuần · dòng bảng theo đơn vị · menu ngăn mục tiêu [thước CE: bốn lối mở hộp
  hôm nay] → AC-1, AC-7, AC-8.
- Trục E — khổ: ≥ md · < md [thước CE: ngăn kéo < 768 của `RecordSheetHost`] → AC-9.
- Cắt ngang: không hồi quy và thước đã ký → AC-10.

## Đường đo

- «Mở một KR đến hạn chưa cập nhật: khối mở sẵn, gửi xong ngăn vẫn mở, Lịch sử thêm dòng đầu và biểu đồ thêm điểm» · số
  từ: phiên đo màn đọc `[data-khoi-cap-nhat-kr]`, `[data-lich-su-kr]` trước và sau gửi, đếm `OkrCheckIn` bằng SQL · bảo
  đảm bởi: AC-1, AC-4.
- «Bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối» · số từ: phiên đo màn đọc vị trí khối trong khung nhìn
  và phần tử có tiêu điểm · bảo đảm bởi: AC-7.
- «Không Dialog nào mở trong cả luồng» · số từ: phiên đo màn đếm `[role=dialog]` khác ngăn ở mọi bước · bảo đảm bởi:
  AC-7, AC-9, AC-10.

## Out of scope

- `Sheet` sửa mục tiêu hay sửa KR chồng lên ngăn — nợ đã ghi ở lộ trình, hàng khác.
- Ghim bằng chứng thành ô riêng trong ngăn; chip người phụ trách đè tên KR ở bảng KR của ngăn mục tiêu (khổ 1280).
- Gửi nhiều KR một lần, hay ô nhập trên dòng Họp tuần (`docs/design.md` «Bấm vào KR và cập nhật»).
- Trang «Cập nhật tuần» (`cap-nhat-tuan`) — giữ nguyên; vòng này chỉ dùng lại ba ô của nó.

## Notes

- Không loại bản ghi mới, không nút xoá, không trạng thái kết thúc — ba câu của `docs/vong-doi.md` không áp.
- Hỏi-2 (thay lời hứa đã ký): hai lời hứa đã ký đổi hình theo luật «Ghi vào bản ghi» chủ kho chốt 30/10 — khối «lần
  trước» trong hộp (`hop-cap-nhat-lan-truoc`) nay là dòng đầu Lịch sử cộng dòng mức đổi trong khối; nút «Cập nhật» đầu ngăn
  KR (VK7 `ngan-kr-mot-cho`, HT2) nay là khối trong ngăn. Ma trận đầy đủ dựng ở S3 trước khi sửa thước.
- Không migration. `entry` mới thêm vào danh sách `LOI_VAO` của `packages/validation/src/okr-cap-nhat.ts`.
- Ngoài-1 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Công cụ canh việc mất bài kiểm có thể im lặng khi ai đó xoá bớt các câu kiểm giống hệt nhau, hoặc sửa nội dung bên trong một câu kiểm nhiều dòng. Người dùng cuối không bị ảnh hưởng trực tiếp; rủi ro là một bài kiểm cũ bị yếu đi mà không ai được báo. — `_acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs`
- Ngoài-2 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Công cụ canh không theo dõi các thước đo màn đã ký viết theo kiểu khác, nên nếu ai xoá câu kiểm ở đó thì không có cảnh báo tự động. Hiện chưa thấy câu kiểm nào bị mất, nên người dùng chưa gặp ảnh hưởng nào. — `_acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs`
- Ngoài-3 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Công cụ canh so các câu kiểm theo chữ chứ không theo số lần xuất hiện, nên xoá bớt bản trùng không bị phát hiện. Người dùng cuối không thấy gì khác; chỉ là bài kiểm có thể yếu đi âm thầm. — `_acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs`
- Ngoài-4 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Hôm nay khối cập nhật vẫn quyết đúng mở hay thu theo tuần. Nhưng nếu sau này luật «tuần này» đổi ở một nơi mà quên nơi kia, khối có thể mở hay thu sai so với dữ liệu thật. — `apps/app/components/crm/record-sheet/khoi-cap-nhat-kr.tsx`
- Ngoài-6 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Đang gõ dở một cập nhật KR mà bấm tên mục tiêu ở đầu ngăn thì ngăn chuyển sang mục tiêu và phần đã gõ mất, không hỏi lại. — `apps/app/components/crm/record-sheet/kr-sheet.tsx`
- Ngoài-7 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Trong một chuỗi thao tác hiếm, lần mở KR kế tiếp có thể đặt con trỏ vào nút ‹ › thay vì ô giá trị, người dùng phải bấm vào ô giá trị. — `apps/app/components/crm/record-sheet/kr-sheet.tsx`
- Ngoài-8 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Sát ranh giới tuần (khuya Chủ nhật, sáng Thứ hai giờ VN), nếu máy chủ tính tuần lệch thì khối có thể mở hay thu sai mà bài kiểm hiện tại không bắt được. — `apps/app/test/cap-nhat-trong-ngan-kr.dom.tsx`
- Ngoài-10 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Nếu sau khi gửi ngăn KR đóng hẳn thay vì thu lại, thước màn cũ này vẫn báo xanh. — `_acceptance/canh-kr-okr/rang/man-canh-kr.mjs`
- Ngoài-11 (máy định tuyến 2026-10-30, đề xuất S4 known-limits): Nếu sau khi gửi từ lối cập nhật tuần mà khối không thu lại đúng, hoặc ngăn đóng, thước màn cũ này vẫn báo xanh. — `_acceptance/cap-nhat-tuan-okr/rang/man-cap-nhat.mjs`
- Known limits — chọn ở Cổng Bằng chứng 2026-10-30:
  - Ngoài-1: Công cụ canh việc mất bài kiểm có thể im lặng khi ai đó xoá bớt các câu kiểm giống hệt nhau, hoặc sửa nội dung bên trong một câu kiểm nhiều dòng. Người dùng cuối không bị ảnh hưởng trực tiếp; rủi ro là một bài kiểm cũ bị yếu đi mà không ai được báo.
  - Ngoài-2: Công cụ canh không theo dõi các thước đo màn đã ký viết theo kiểu khác, nên nếu ai xoá câu kiểm ở đó thì không có cảnh báo tự động. Hiện chưa thấy câu kiểm nào bị mất, nên người dùng chưa gặp ảnh hưởng nào.
  - Ngoài-3: Công cụ canh so các câu kiểm theo chữ chứ không theo số lần xuất hiện, nên xoá bớt bản trùng không bị phát hiện. Người dùng cuối không thấy gì khác; chỉ là bài kiểm có thể yếu đi âm thầm.
  - Ngoài-4: Hôm nay khối cập nhật vẫn quyết đúng mở hay thu theo tuần. Nhưng nếu sau này luật «tuần này» đổi ở một nơi mà quên nơi kia, khối có thể mở hay thu sai so với dữ liệu thật.
  - Ngoài-6: Đang gõ dở một cập nhật KR mà bấm tên mục tiêu ở đầu ngăn thì ngăn chuyển sang mục tiêu và phần đã gõ mất, không hỏi lại.
  - Ngoài-7: Trong một chuỗi thao tác hiếm, lần mở KR kế tiếp có thể đặt con trỏ vào nút ‹ › thay vì ô giá trị, người dùng phải bấm vào ô giá trị.
  - Ngoài-8: Sát ranh giới tuần (khuya Chủ nhật, sáng Thứ hai giờ VN), nếu máy chủ tính tuần lệch thì khối có thể mở hay thu sai mà bài kiểm hiện tại không bắt được.
  - Ngoài-10: Nếu sau khi gửi ngăn KR đóng hẳn thay vì thu lại, thước màn cũ này vẫn báo xanh.
  - Ngoài-11: Nếu sau khi gửi từ lối cập nhật tuần mà khối không thu lại đúng, hoặc ngăn đóng, thước màn cũ này vẫn báo xanh.
