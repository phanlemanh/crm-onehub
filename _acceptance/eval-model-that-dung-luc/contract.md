---
schema_version: 1
feature: Eval model thật của Kho tài liệu (E15) chỉ gọi model khi đầu vào đổi, tách lỗi hạ tầng khỏi lỗi model, giữ nhật ký theo lượt, và hỏi lại một lần khi sát ngưỡng thay vì đỏ cứng
slug: eval-model-that-dung-luc
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-08T06:19:48Z
design_doc: _acceptance/eval-model-that-dung-luc/design.md
---

# Acceptance Contract: eval-model-that-dung-luc

## Context

E15 của `tro-ly-doc-kho` (`_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`) gọi model thật qua AI Gateway ở mọi lượt ghim lại, kể cả khi lời dặn, model và bộ câu không đổi. Hệ quả:

- Số dư Gateway giảm 47,84 → 32,51 USD trong hai ngày 05–06/10.
- Lỗi hạ tầng bị tính thành câu trả lời sai: 20 câu «loi» làm E15 đỏ 50% lúc 00:39 ngày 05/10.
- Nhật ký bị ghi đè nên không chẩn đoán được.
- Một lần đỏ ở 79,2% với ngưỡng 80%, rồi lượt chạy lại xanh.

Cổng Đáng: chủ kho ký `build` 07/10. Thiết kế: chủ kho duyệt 08/10 qua phiên giám sát; C và D kèm điều kiện, các điều kiện đó là AC-3 tới AC-8 dưới đây.

Source input: `_acceptance/eval-model-that-dung-luc/opportunity.md`, soát mã `cham-bo-do.ts` ngày 08/10, điều kiện của chủ kho ngày 08/10.

## Criteria

- AC-1: Given một câu của E15 không có kết quả eval, hoặc hàng `TaiLieuHoi`/`ZaloHoi` của nó ở trạng thái lỗi, When E15 chấm, Then câu đó mang nhãn `loi`, không vào tử số hay mẫu số của chỉ số nào; And có ít nhất một câu `loi` thì E15 thoát mã 2 với dòng «KHONG DO DUOC: <n> cau loi» kèm id các câu đó; And câu model trả lời sai (trích sai trang, trả lời câu phải từ chối) vẫn mang nhãn `sai`.
- AC-2: Given E15 chạy nhiều lượt, When một lượt bắt đầu, Then nó ghi kế hoạch, kết quả và nhật ký eve vào một thư mục riêng `.acceptance-runs/tro-ly-doc-kho/cham-bo-do/<giờ>-<pid>/`, in đường thư mục đó, và không ghi đè tệp của lượt trước; And khi đã có hơn 10 thư mục lượt thì chỉ giữ 10 thư mục mới nhất.
- AC-3: Given phạm vi băm gồm nội dung mọi tệp git-theo-dõi dưới `apps/agent/agent/**`, mọi tệp khớp `paths` của E15, `bun.lock`, tệp bộ câu, và id model mà Gateway trả về trong phản hồi của lời gọi dò tới hai model E15 dùng, When tính băm, Then đổi riêng bất kỳ một trong năm lớp đầu vào đó cũng cho băm khác; And cùng đầu vào thì cùng băm.
- AC-4: Given bản ghi E15 đã commit ở `HEAD` (`_acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md`) mang cùng băm, `dat: true` và `do_luc` trong vòng 7 ngày, When E15 chạy, Then nó không chạy `eve eval` cho câu nào, thoát 0, và in cùng ghi vào bằng chứng của lượt dòng «DUNG LAI <băm>, do ngay <ngày>» kèm bảng kết quả đã ký; And khi băm khác, khi quá 7 ngày, khi bản ghi không đạt, khi chưa có bản ghi đã commit, hoặc khi chạy với `--do-lai`, thì E15 đo mới và in đúng một lý do «DO MOI: …».
- AC-5: Given một bản ghi đã commit khớp băm hiện tại, When đổi nội dung một tệp trong phạm vi băm (một tệp dưới `apps/agent/agent/`), Then lượt E15 kế tiếp in «DO MOI: bam doi» và không dùng lại.
- AC-6: Given lượt 1 không có câu `loi` và một chỉ số rơi vào vùng xám (với ngưỡng «≥ t» trên n câu: `t − √(t(1−t)/n) ≤ r < t`; chỉ số «≤ t» đối xứng), When E15 chấm, Then nó hỏi lại đúng một lần trên đủ bộ câu của chỉ số đó và kết luận trên tỉ lệ gộp hai lượt, với ngưỡng 80% / 80% / 90% / 10% / 0 giữ nguyên; And lượt 1 có câu `loi` thì không hỏi lại mà thoát 2 theo AC-1.
- AC-7: Given một chỉ số đã hỏi lại theo AC-6, When E15 ghi bằng chứng, Then bằng chứng ghi đủ ba tỉ lệ (lượt 1, lượt 2, gộp); And gộp vẫn không đạt thì E15 thoát 1, không hỏi lần ba; And lượt 2 có câu `loi` thì thoát 2.
- AC-8: Given máy có khoá Gateway, When E15 chạy hai lượt liền và lượt đầu đạt (đo đầy đủ, hoặc dùng lại từ `HEAD`), Then lượt thứ hai in «DUNG LAI», không chạy `eve eval`, và báo số lời gọi model đúng bằng số lời dò (2); And lượt đầu không đạt thì phép đo thoát 2 «KHONG DO DUOC: luot 1 khong dat», không đỏ.
- AC-9: Given diff của vòng so với merge-base với `onehub`, Then các ngưỡng của E15 (0,8 / 0,8 / 0,9 / 0,1 / 0) không đổi; And không tệp nào đổi ngoài `_acceptance/**` và hai tệp máy vẽ `PRODUCT-MAP.md`, `LO-TRINH.html`.
- AC-10: Given một lượt E15 đo mới và đạt, When lượt xong, Then nó in đúng một dòng «GHI BAN GHI: bun _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts --ghi-ban-ghi <tệp bằng chứng của lượt>»; And chạy lệnh đó thì bản ghi được chép vào `_acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md`; And sau khi commit, lượt kế tiếp dùng lại từ `HEAD`; And tệp bản ghi không nằm trong phạm vi băm (commit nó không làm băm đổi).
- AC-11: Given lời gọi dò id model tới một trong hai model của E15 ném lỗi (402, hết ngân sách, mạng, khoá sai), When E15 chạy, Then nó thoát 2 «KHONG DO DUOC: do model <tên> loi: <lý do>», không dùng lại và không đo; And khi dò thành công, bản ghi mang đúng hai id model, mỗi model một id, lấy từ `response.modelId` Gateway trả.
- AC-12: Given tệp chấm từng câu mà một lượt E15 thật đã ghi trong thư mục lượt (kèm trạng thái hàng `TaiLieuHoi`/`ZaloHoi` của từng câu), When chạy `cham-bo-do.ts --cham-lai <thư mục lượt>` (không gọi model, không cần kho đo), Then nó chấm lại bằng chính hàm nhãn và hàm kết luận của `quyet-do.ts`; And thêm một câu trạng thái lỗi vào tệp đó thì lệnh thoát 2 «KHONG DO DUOC: 1 cau loi (<id>)»; And đẩy một chỉ số vào vùng xám thì lệnh in «CAN HOI LAI: <chỉ số> (<n> cau)».

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 08/10.

- **Trục A — kết cục một câu:** đúng trang | từ chối đúng | sai của model | lỗi hạ tầng (không có kết quả, hàng lỗi).
  - Thước CE: các nhánh của `nhanMot` và nhánh lượt Zalo trong `cham-bo-do.ts`.
- **Trục B — quyết dùng lại:** cùng băm và còn hạn | băm khác | quá hạn | lần trước không đạt | chưa có bản ghi đã commit | ép `--do-lai`.
  - Thước CE: điều kiện C của chủ kho ngày 08/10.
- **Trục C — lớp đầu vào của băm:** `apps/agent/agent/**` | `paths` của E15 | `bun.lock` | bộ câu | id model Gateway trả.
  - Thước CE: cùng nguồn với trục B.
- **Trục D — vị trí tỉ lệ so với ngưỡng:** đạt rõ | vùng xám | dưới vùng xám; kèm lượt 1 có hay không có `loi`.
  - Thước CE: điều kiện D của chủ kho.
- **Ô Core:** A4 (AC-1, AC-12) · nhật ký (AC-2) · C toàn bộ (AC-3) · B toàn bộ (AC-4) · C1 thật (AC-5) · D2 (AC-6, AC-7, AC-12) · lượt kép thật (AC-8) · giữ ngưỡng (AC-9) · đường đưa bản ghi vào `HEAD` (AC-10) · lời dò model hỏng (AC-11).
- **Đối chiếu ngành:** [NGÀNH: Bazel — remote cache theo băm của mọi đầu vào hành động] dùng lại kết quả khi băm đầu vào không đổi. Ở đây model thật là đầu vào không băm được trọn vẹn, nên có thêm hạn 7 ngày và id do Gateway trả.
- **Later:**
  - bộ nhớ đệm theo băm cho mọi eval model thật (bộ kit);
  - trần token cho một lượt ghim lại.

## Out of scope

- Mười một eval model thật khác trong `feature_loop.model_evals`: ngoài ranh giới hàng; đề xuất cho bộ kit gửi giám sát dạng `viec-phu`.
- Trần token cho một lượt ghim lại (hoãn; chi phí đã hiện ở `tong_ket.chi_phi`).
- Đổi ngưỡng của E15.
- Đổi mã sản phẩm dưới `apps/agent/**`.

## Notes

- Không migration. Không đổi mã sản phẩm.
- Rủi ro biết trước của C: nhà cung cấp đổi hành vi model mà giữ nguyên id. Hạn 7 ngày giới hạn rủi ro này.
- Lần chấm đầu tiên của vòng phải đo đầy đủ (tốn token một lần). Bản ghi của lần đó được chép vào bằng chứng của `tro-ly-doc-kho` bằng lệnh của AC-10 và commit, để các lượt ghim lại sau dùng lại được.
- Dùng lại chỉ có hiệu lực khi người chạy lượt đo mới (phiên thợ sau một lượt ghim lại) chạy lệnh «GHI BAN GHI» rồi commit. Làn ghim lại không tự ghi vào hồ sơ đã ký, vì làn cấm điều đó. Thiếu bước này thì lượt sau đo mới: tốn token, nhưng không sai.
- Known limits — chấp nhận tại Cổng Bằng chứng 2026-10-10 (Phan Le Manh), từ mục ngoài hợp đồng của S4 round 4 (luật 53: mặc định ghi Known limits):
  - Ngoài-1: Ngưỡng đạt/không đạt của phép đo Kho tài liệu đang ghi ở hai chỗ. Hôm nay hai chỗ giống nhau, nhưng ai sửa một chỗ thì phép đo thật và bài kiểm có thể chấm theo hai ngưỡng khác nhau mà không ai thấy.
  - Ngoài-2: Nếu tệp kết quả của một lượt đo bị sửa tay hoặc hỏng, một câu lỗi hạ tầng có thể bị tính nhầm thành trả lời sai khi chấm lại. Lượt đo thật bình thường không gặp trường hợp này.
  - Ngoài-3: Khi bản ghi kết quả đã lưu bị hỏng, hệ thống báo là chưa có bản ghi và lặng lẽ đo lại bằng model thật, tốn tiền mà không ai biết bản ghi đang hỏng.
  - Ngoài-4: Nếu còn sót một thiết lập cũ trong phiên làm việc, lượt đo có thể ghi ra bản ghi mang dấu vân tay không khớp đầu vào thật, và lượt sau tin nhầm để dùng lại.
  - Ngoài-5: Nếu cách viết danh sách tệp của phép đo này bị đổi, hệ thống sẽ lặng lẽ bỏ sót nhiều tệp khi xét đầu vào đã đổi chưa, và có thể dùng lại kết quả cũ dù mã đã thay.
  - Ngoài-8: Nếu có một lượt đo bị ngắt giữa chừng, phép kiểm tra của vòng này báo đỏ cứng thay vì báo là chưa đo được, cho tới khi có một lượt hoàn tất mới hơn.
  - Ngoài-9: Khi một chỉ số đã rớt hẳn mà chỉ số khác chỉ sát ngưỡng, hệ thống vẫn hỏi lại model thật và tốn tiền dù kết quả cuối đã chắc chắn là không đạt.
  - Ngoài-10: Một phép thử phá cố ý báo đỏ đúng nhưng bằng chứng nó đưa ra về lý do đỏ không đáng tin, nên người duyệt có thể tin nhầm là bài kiểm bắt đúng lỗi.
  - Ngoài-11: Bài kiểm cách gán nhãn cho các câu hỏi chưa thử hết các tổ hợp, nên một nhánh hiếm có thể gán nhãn sai mà không bị bắt.
  - Ngoài-12: Hai tình huống của lượt hỏi lại, gộp vẫn không đạt và lượt hai có câu lỗi, chưa có bài kiểm riêng nên nếu chúng hỏng sẽ không ai biết ngay.
  - Ngoài-13: Phép kiểm chấm lại chỉ xác nhận các dòng tóm tắt có mặt, không đối chiếu kết luận đạt/không đạt với lượt thật, nên một sai lệch kết luận có thể lọt.
  - Ngoài-14: Bài kiểm dấu vân tay đầu vào chưa tách riêng được nhóm tệp khai trong phép đo, nên nếu nhóm đó bị bỏ sót thì bài kiểm vẫn xanh.
  - Ngoài-15: Bài kiểm việc loại câu lỗi khỏi tính toán chỉ thử với nhóm câu đầu, nên nhóm câu chuyển sang Zalo chưa được kiểm tương tự.
  - Ngoài-17: Phép kiểm lượt thứ hai không gọi model dựa vào việc không thấy một dòng chữ, mà chưa chứng minh dòng chữ đó thật sự xuất hiện khi có gọi model, nên nếu chữ đổi thì phép kiểm vẫn xanh.
