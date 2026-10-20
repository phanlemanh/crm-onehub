---
schema_version: 1
feature: Chủ kho nhận trong ngày một đợt gom đề xuất sẵn nhóm và hàng mỗi khi có tín hiệu mới, và chỉ cần sửa hay phủ quyết
slug: gom-tin-hieu-tu-chay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-10-20T13:45:00Z
design_doc: docs/superpowers/specs/2026-10-20-gom-tin-hieu-tu-chay-design.md
---

# Acceptance Contract: gom-tin-hieu-tu-chay

## Context

Một lịch của kho tự chạy skill gom tín hiệu và skill cắt lượt của kit mỗi khi tín hiệu mới lên `onehub`, rồi giao kết
quả thành một PR nháp: một bản gom mới, các hàng đề xuất trong tệp lộ trình và trang lộ trình vẽ lại. Lệnh tất định
của kit (răng phủ, kiểm câu, răng cắt lượt) quyết đề xuất có được giao hay không. Chủ kho sửa trên nhánh của PR, đóng
PR để phủ quyết, hoặc để chủ nhóm tệp lộ trình gộp; máy không gộp (luật 22 của đợt).

Source input: `_acceptance/gom-tin-hieu-tu-chay/opportunity.md` (Cổng Đáng `build` 19/10, hàng TH2 của
`docs/plan/lo-trinh-okr.json`, mã G1 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`).

## Criteria

- AC-1: Given tệp lịch của kho, Then nó chạy khi có lần đẩy lên `onehub` chạm thư mục nguồn tín hiệu, mỗi ngày một lần theo lịch, và chạy tay được; chỉ chạy ở kho `phanlemanh/crm-onehub`, một lượt một lúc, có trần phút, chỉ xin quyền ghi nội dung và PR; Given một lượt mà mọi tín hiệu trên `onehub` đã có chỗ trong một bản gom, When lượt chạy, Then lượt không gọi mô hình, không commit, không đẩy, không đụng PR nào, và in «không có tín hiệu nào chưa có chỗ — không gọi mô hình» với mã 0.
- AC-2: (cross-layer) Given các tín hiệu chưa có chỗ trên `onehub` và chưa có PR đề xuất nào, When lượt chạy và phiên gom ghi một bản gom cùng các hàng mà ba lệnh tất định đều xanh, Then nhánh `tin-hieu/gom` trên `origin` là đỉnh `onehub` cộng các commit của lượt, chứa đúng một bản gom mới, các tệp lộ trình bị đổi và `LO-TRINH.html` vẽ lại; lượt mở đúng một PR NHÁP vào `onehub` với tiêu đề `TH2 · chore(gom-tin-hieu-tu-chay): Đợt tín hiệu <ngày>`; thân PR liệt mỗi nhóm bằng tên nhóm, số tín hiệu và hàng đề xuất của nó, liệt tín hiệu lẻ kèm lý do và tín hiệu đã phủ kèm việc đã giao, có ba dòng nói cách sửa, cách phủ quyết và ai gộp, và mang dòng dấu máy đọc của tập tín hiệu; không đường nào của lượt gộp PR hay chuyển PR sang sẵn sàng.
- AC-3: Given phiên gom đã chạy xong, When răng phủ đỏ (một tín hiệu chưa có chỗ hay ở hai chỗ), kiểm câu đỏ (tên nhóm hay lý do lọt mã, từ nội bộ), răng cắt lượt đỏ, hay phiên gom không ghi bản gom mới nào hoặc ghi hơn một, Then lượt kết thúc đỏ, không đẩy, không mở hay sửa PR, và nhật ký in nguyên các dòng lỗi của lệnh đỏ gọi tên tín hiệu hay tệp.
- AC-4: Given phiên gom đã chạy xong, When một tệp bị đổi, thêm hay xoá nằm ngoài vùng cho phép — thư mục bản gom, các tệp lộ trình khai ở `lo_trinh.tep`, `LO-TRINH.html` — dù đã commit hay còn bẩn, Then lượt kết thúc đỏ, không đẩy, không mở hay sửa PR, và gọi tên từng tệp ngoài vùng.
- AC-5: Given một PR đề xuất đang mở, When nhánh của nó có ít nhất một commit không phải của tài khoản máy, Then lượt không gọi mô hình, không đẩy, không sửa thân PR, và in câu nói đề xuất đang có sửa của người; When nhánh chỉ có commit của máy và dấu tập trong thân PR trùng dấu của lượt, Then lượt không gọi mô hình và không đẩy; When nhánh chỉ có commit của máy và có tín hiệu mới (dấu khác), Then lượt dựng lại nhánh từ đỉnh `onehub` gồm mọi tín hiệu chưa có chỗ, đẩy ép, sửa thân của chính PR đó và không mở PR thứ hai.
- AC-6: Given PR đề xuất gần nhất đã đóng mà không gộp, When dấu tập của lượt trùng dấu trong thân PR đó, Then lượt không gọi mô hình, không đẩy, không mở PR, và in câu nói đề xuất cho các tín hiệu này đã bị phủ quyết và đang chờ tín hiệu mới; When có tín hiệu mới (dấu khác), Then lượt gọi phiên gom với lời dặn mang tên các nhóm của đề xuất đã bị phủ quyết, và mở một PR nháp mới gồm mọi tín hiệu chưa có chỗ, kể cả tín hiệu của đề xuất cũ.
- AC-7: Given lượt có tín hiệu chưa có chỗ, When thiếu khoá mô hình, không có lệnh `claude`, phiên gom thoát khác 0, hay phiên gom quá trần phút, Then lượt kết thúc đỏ, không đẩy, không mở PR, và in một câu tiếng Việt gọi tên nguyên nhân và việc chủ kho phải làm (đặt bí mật nào, hay chạy tay lại); khoá không bao giờ xuất hiện trong nhật ký; Given tài liệu của kho, Then nó nói lịch gom làm gì, khi nào chạy, ba việc chủ kho làm với PR đề xuất, và các việc cài một lần trước lượt thật đầu tiên. (judgment)
- AC-8: Given lịch sử của `onehub` và các PR đề xuất, When chạy lệnh đo, Then lệnh in giờ chờ của MỌI tín hiệu trên `onehub` — từ lúc tệp tín hiệu lên `onehub` (commit trên đường cha thứ nhất của `onehub` đưa tệp vào, kể cả qua commit gộp của nhánh hàng chờ) tới lúc PR đề xuất đầu tiên chứa nó được mở, hoặc tới lúc đo nếu chưa có PR nào chứa nó — và gọi tên tín hiệu đã chờ quá 48 giờ mà chưa có chỗ; cho mỗi bản gom đã gộp, lệnh in số nhóm chủ kho đã sửa trên tổng số nhóm — so bản gom ở lần đẩy cuối cùng của máy trước commit đầu tiên của người (hoặc trước lúc gộp) với bản gom đã gộp; nhóm đổi tên, đổi tín hiệu, thêm hay bớt đều tính là sửa; dòng cuối so hai số với ngưỡng 2 ngày và một nhóm trên năm; không có tín hiệu nào thì in đúng điều đó với mã 0.

## Coverage

- Trục A — Tình trạng tín hiệu lúc lượt chạy: không có tín hiệu chưa có chỗ | có tín hiệu chưa có chỗ | tín hiệu sai khuôn [thước CE: ba phần JSON của `tin-hieu.mjs --chua-gom` — `tin_hieu`, `da_giao`, `loi`, khuôn ở `skills/acceptance/references/tin-hieu-template.md` của kit] → AC-1, AC-2, AC-3
- Trục B — PR đề xuất đang có: chưa có | mở, chỉ của máy, cùng dấu | mở, chỉ của máy, khác dấu | mở, có sửa của người | đóng không gộp, cùng dấu | đóng không gộp, khác dấu | đã gộp [thước CE: các trạng thái PR của GitHub; [NGÀNH: Renovate] thôi dựng lại PR khi có commit của người khác; [NGÀNH: Dependabot] đóng PR là bỏ qua đúng bản đó tới khi có bản mới] → AC-2, AC-5, AC-6
- Trục C — Kết cục phiên gom: xanh cả ba lệnh | răng phủ đỏ | kiểm câu đỏ | răng cắt lượt đỏ | không/nhiều bản gom | chạm ngoài vùng | thoát khác 0 | quá trần | thiếu khoá hay thiếu lệnh [thước CE: mã thoát 0/1/2 của `tin-hieu.mjs` và `cat-luot.mjs`; hợp đồng `claude -p`: mã thoát và tệp ghi trong thư mục làm việc] → AC-2, AC-3, AC-4, AC-7
- Trục D — Ai làm gì với đề xuất: chủ kho sửa | chủ kho đóng | chủ nhóm gộp | không ai làm gì [thước CE: câu giao hàng TH2; luật 22 của đợt] → AC-2, AC-5, AC-6, AC-8
- Cắt ngang: máy không bao giờ gộp hay chuyển sẵn sàng; khoá không vào nhật ký; lượt hỏng luôn đỏ và gọi tên → AC-2, AC-3, AC-4, AC-7
- [GIẢ ĐỊNH] Đồng hồ «trong ngày» và «2 ngày» bắt đầu khi tín hiệu lên `onehub`, không phải khi lên nhánh hàng chờ (Hỏi-3 của sổ) → AC-1, AC-8
- [GIẢ ĐỊNH] Bộ chạy dựng tạm ở crm, kit nhận về sau (Hỏi-4); máy đứng yên khi PR có sửa của người (Hỏi-5) → AC-5
- Quét đầy đủ (Core / Later / Never): `_acceptance/gom-tin-hieu-tu-chay/coverage-scan.md`

## Vòng đời của đề xuất (ba câu của `docs/vong-doi.md` — máy đề xuất, chủ kho chốt)

1. Dọn thế nào: kết cục nghiệp vụ — gộp, hoặc đóng PR (phủ quyết). Kho không xoá gì; bản gom bị phủ quyết không vào `onehub`.
2. «Lịch sử»: bản gom đã gộp là lịch sử trong git, răng phủ đọc nó ở mọi lượt sau; PR đã đóng là vết phủ quyết.
3. Mặc định thấy gì: một PR nháp đang mở trong danh sách PR của kho; đề xuất đã đóng tìm lại ở PR đã đóng của nhánh `tin-hieu/gom`.

## Đường đo

- Thước: mỗi tín hiệu có chỗ trong một bản gom đề xuất trong vòng 2 ngày · số từ: lệnh đo `do-gom` (giờ chờ từng tín hiệu, từ git và PR đã gộp) · bảo đảm bởi: AC-8 (lệnh đo), AC-1 (lịch chạy khi đẩy và mỗi ngày), AC-5, AC-6 (không đứng yên vô hạn khi chưa có người sửa)
- Thước: chủ kho sửa ít hơn một nhóm trên năm · số từ: lệnh đo `do-gom` (so bản gom xanh đầu tiên của máy với bản đã gộp) · bảo đảm bởi: AC-8, AC-5 (sửa của người nằm trên nhánh, không bị đè, nên đếm được)
- Thước (vế CHẾT): một PR đề xuất đỏ, chạm ngoài vùng hay tự gộp · số từ: AC-3, AC-4, AC-2 · bảo đảm bởi: các eval của ba tiêu chí đó

## Out of scope

- Máy tự gộp hay tự chuyển PR đề xuất sang sẵn sàng (luật 22 của đợt).
- Báo tin riêng cho chủ kho ngoài thông báo PR của GitHub — hàng TB1/N5.
- Trạng thái tín hiệu đọc từ nguồn sống sau gom — hàng TH3.
- Lộ trình nhiều sản phẩm, gom tín hiệu theo sản phẩm — L6.
- Máy học từ lần chủ kho sửa nhóm.
- Lượt chạy thật đầu tiên trên kho GitHub và các việc cài một lần (khoá mô hình, quyền đọc kho kit) — chủ kho làm sau khi gộp.

## Notes

- Phép phán (nhóm, tên nhóm, hàng) thuộc hai skill của kit, cài qua chợ gói trong Actions; crm không chép chữ skill. Lỗi của skill khi chạy không người trông thì mở chip sang kho kit.
- Mọi bằng chứng của vòng chạy trên kho tạm với `claude` giả và `gh` giả theo đúng hợp đồng thật của chúng.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-21:
  - Ngoài-1: Hôm nay câu báo thiếu khoá đã nêu đúng khoá cần đặt. Nhưng nếu sau này ai đó lỡ thêm lại một tên khoá thừa vào câu báo, bài kiểm tự động sẽ không kêu, và chủ kho có thể bị dặn đi đặt một khoá lịch không dùng.
  - Ngoài-2: Nếu sau này tệp lịch lấy khoá từ một bí mật tên khác với tên biến, câu báo vẫn bảo chủ kho đặt bí mật theo tên cũ và bài kiểm không phát hiện, làm chủ kho đặt nhầm chỗ.
  - Ngoài-4: Nếu tệp lộ trình bị hỏng, đề xuất vẫn được giao nhưng thân PR ghi mọi nhóm là chưa có hàng đề xuất, khiến chủ kho tưởng máy chưa cắt hàng chứ không biết tệp đọc không được. Số đo thời gian chờ cũng có thể lệch mà không báo.
  - Ngoài-5: Người tự dựng kho sẽ không thấy các chìa khoá của lịch gom trong tệp mẫu cấu hình, nên có thể không biết cần đặt gì cho lịch này. Chức năng vẫn chạy bình thường.
  - Ngoài-6: Nếu chủ kho đẩy sửa lên nhánh đề xuất đúng lúc máy đang gom (có thể kéo dài tới 25 phút), lần đẩy của máy sẽ đè mất sửa đó mà không báo.
  - Ngoài-7: Khi lệnh lấy nhánh đề xuất về bị hỏng, máy có thể coi như không có sửa của người và đẩy đè lên bản chủ kho đã sửa.
  - Ngoài-8: Bài kiểm chỉ thử một trong hai nhóm bị phủ quyết, nên nếu máy đánh rơi nhóm còn lại khi dặn lại mô hình thì bài kiểm vẫn báo xanh.
  - Ngoài-9: Bài kiểm trang lộ trình dùng bản vẽ giả nên chưa chứng minh được hàng do mô hình viết sẽ hiện đúng trên trang lộ trình thật; một hàng sai khuôn có thể làm trang thật thành trang báo lỗi mà bài kiểm vẫn xanh.
  - Ngoài-10: Bài kiểm không phân biệt được trường hợp hàng đề xuất của nhóm này bị ghi sang dòng của nhóm khác trong thân PR.
  - Ngoài-11: Bài kiểm lệnh đo chưa thử trường hợp vừa chờ quá lâu vừa bị sửa nhiều, nên lỗi riêng ở trường hợp kép này sẽ không bị bắt.
  - Ngoài-12: Bài kiểm trường hợp PR đã gộp chỉ chắc rằng máy không nói là bị phủ quyết, chứ không chắc máy làm tiếp đúng việc, nên một lỗi khác ở nhánh này có thể lọt.
