---
schema_version: 1
feature: "Hai hồ sơ đã ký có thước tự hết hạn ghim lại được: thước «vòng này» neo cặp sha gộp, bộ đọc evals dùng chung với kit"
slug: neo-thuoc-het-han
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [tooling]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-15-neo-thuoc-het-han-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-15T02:04:57Z
---

# Acceptance Contract: neo-thuoc-het-han

## Context

Hàng F8 của `docs/plan/lo-trinh-okr.json` (đợt r2, dãy P7), câu giao «Ghim lại các hồ sơ đã ký chạy được».
Đo ở onehub `aba7f6418` (15/10): `so-okr-tu-chay` E23 và E25 thoát 2 vì phạm vi «vòng này» lấy theo
`origin/onehub` nên rỗng sau khi PR #162 gộp; `lam-moi-chuyen-viec-qua-loi-chung` E5 thoát 2 vì `Bun.YAML`
không đọc được bốn `evals.yaml` mà bộ đọc của kit đọc được, và E5 neo «vòng này» bằng `merge-base` (Ngoài-1 của
hồ sơ). Ngoài-3 của cùng hồ sơ: bộ ghi `invalidateQueries` bỏ lời gọi không khoá. `cap-nhat-tuan-okr` E7 đo
xanh ở mốc nền — không chạm. Luật neo: `_acceptance/thuoc-khong-tu-het-han/contract.md` AC-3 (đã ký).

## Criteria

- AC-3: Given cây ở đỉnh nhánh, When chạy lệnh của `lam-moi-chuyen-viec-qua-loi-chung/E5`
  (`config:executors.script.lmcv_khong_hoi_quy`), Then thoát 0; script đọc mọi `evals.yaml` bằng bộ đọc
  `lib/eval-yaml` của kit (bốn tệp `Bun.YAML` từ chối đọc được); dòng mốc nêu cặp `100847e8a^1..100847e8a`; script
  không còn gọi `merge-base` hay nhắc `origin/onehub`; ref cặp gộp không giải được thì in «KHONG DO DUOC» và thoát 2.
- AC-4: Given bộ ghi `invalidateQueries` trong `apps/app/test/lam-moi-chuyen-viec.dom.tsx`, When một lời gọi
  không có `queryKey` xảy ra, Then bộ ghi vẫn đếm nó; ca «loi-khong-lam-moi» của E3 vẫn xanh trên dialog hiện tại;
  và trên bản sao dialog chèn `invalidateQueries()` không đối số vào nhánh lỗi, ca đó đỏ với thông điệp ghim
  «khong lam moi khi loi».
- AC-5: Given bản sao răng đã sửa, When trả răng về chỗ hỏng cũ (E5 về `Bun.YAML`), Then bản sao thoát khác 0 với đúng thông điệp cũ đã ghim ở bảng mốc nền của thiết kế; mỗi đột
  biến khai trước trong răng chiều đỏ, thiếu đột biến nào thì răng in «HONG THIEU» và thoát 1; và bản sao E5 với sha
  cặp gộp đổi thành một sha không có thoát đúng 2, in «KHONG DO DUOC», stderr không có dòng `at ` của stack trace.
- AC-6: Given các commit của vòng này (commit không phải gộp, mang slug trong tiêu đề), When so từng commit với cha
  của nó, Then hợp các tệp đổi nằm trong danh sách: tệp đã xin ở yêu cầu P7-24, tệp của chính hồ sơ này,
  `docs/superpowers/**/*neo-thuoc-het-han*`, `_acceptance/config.yaml`, `PRODUCT-MAP.md`, `LO-TRINH.html`; trong
  `evals.yaml` của lam-moi chỉ eval E5, E3 đổi và chỉ đổi trường `expected`; mọi tệp dưới
  `_acceptance/so-okr-tu-chay/` ở đỉnh giống hệt bản ở mốc nền (hoàn lại, «F8: b1»); ở `_acceptance/config.yaml`
  chỉ thêm khoá, không đổi giá trị khoá có sẵn; không commit nào của vòng chạm `_acceptance/cap-nhat-tuan-okr/`;
  và kết quả không đổi khi cây có thêm một commit không thuộc vòng sửa các tệp đó.
- AC-7: Given hồ sơ `lam-moi-chuyen-viec-qua-loi-chung`, When đọc dòng ghim mới nhất trong
  `run-log.jsonl` của hồ sơ, Then đó là dòng `repin` mọi suite và eval đạt kỳ vọng, `sha` bằng
  `verified_commit` của báo cáo, không cũ hơn commit cuối sửa tệp của hồ sơ đó, và `recheck-evidence` của kit xanh.

## Coverage

- Trục A — eval hàng F8 nêu: so-okr E23 · so-okr E25 · lam-moi E5 · lam-moi Ngoài-3 (E3) · cap-nhat E7.
  Thước CE: ghi chú của hàng F8 trong `docs/plan/lo-trinh-okr.json` [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json].
- Trục B — kiểu hỏng: neo trôi theo nhánh · bộ đọc YAML khác kit · bộ ghi lọc mất lời gọi · đã xanh (không sửa).
  Thước CE: kết quả chạy từng lệnh ở mốc nền `aba7f6418` (bảng ở thiết kế).
- Trục C — chiều đo: xanh ở đỉnh · đỏ khi trả về chỗ hỏng · phạm vi · ghim.
  Thước CE: khuôn đo của `thuoc-khong-tu-het-han` AC-3 [SUY-TỪ-REPO: _acceptance/thuoc-khong-tu-het-han/contract.md].
- Core: A3–A4 × B1–B3 (AC-3, AC-4), C3 (AC-5), C4 (AC-6), C5 (AC-7, chỉ lam-moi). Later: A1–A2 (so-okr E23/E25, sang F28
  cùng bản vá `vao-f28-so-okr-tu-chay.patch`). Never: A5 (E7 đã xanh — đo, không sửa).

## Đường đo

Ô cơ hội của hàng không khai ngưỡng nghiệm thu (mục «Ngưỡng chết / ngưỡng UAT» còn trống), nên không có thước
sau-gộp. Vòng ship thẳng sau ghim.

## Out of scope

- Sửa `cap-nhat-tuan-okr` E7 (đo xanh ở mốc nền, 202 khẳng định).
- Quét toàn kho tìm thước trôi khác ngoài bốn eval hàng F8 nêu.
- Đổi bộ đọc YAML của kit hay của Bun; sửa bốn `evals.yaml` mà `Bun.YAML` từ chối.
- Ca `app-rieng` của agent-okr đỏ sẵn ở đường nền (r2·P0, hồ sơ `tran-cho-app-rieng`).
- Ghim lại `so-okr-tu-chay` — chuyển sang F28 (chủ kho chọn «F8: b», 15/10). Lượt ghim 15/10 đỏ ở ba eval ngoài hàng F8:
  E8 `soi-ma --ca chi-them` quét rác gitignore `apps/*/.eve/dev-runtime/snapshots/**`; E12/E14 `man-so-tu-chay`
  trôi theo màn KR đổi sau PR #162 (169 khẳng định, 15 hỏng). Nhật ký: `.acceptance-runs/so-okr-tu-chay/repin-*/`.
- Neo E23/E25 của `so-okr-tu-chay` vào cặp gộp `f2acca7f1` — chủ kho chọn «F8: b1» (15/10): PR chạm
  `_acceptance/so-okr-tu-chay/` thì lưới trước gộp đòi ghim hồ sơ đó (đang đỏ E8, E12, E14), nên bốn tệp của nó hoàn
  lại nguyên bản onehub. Bản vá đã làm và đã đo xanh (S4 r3, 5e50f1918) lưu ở
  `_acceptance/neo-thuoc-het-han/vao-f28-so-okr-tu-chay.patch` cho F28 áp lại.

## Notes

- Yêu cầu chạm tệp hồ sơ đã ký: P7-24.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-15:
  - Ngoài-1: Phép kiểm «hồ sơ cũ đã được trả về nguyên bản» hiện chỉ nhìn các tệp mà vòng này có chạm vào. Nếu sau này có người sửa lén hồ sơ đó bằng đường khác thì phép kiểm có thể không thấy, dù hôm nay hồ sơ vẫn sạch.
  - Ngoài-2: Nếu máy chạy kiểm tra thiếu lịch sử git, phép kiểm «không đổi giá trị cấu hình có sẵn» sẽ tự tắt mà vẫn báo đạt. Với cách chạy hiện nay điều này chưa xảy ra.
  - Ngoài-3: Phép kiểm cấu hình chỉ bắt được việc đổi giá trị đơn lẻ, chưa bắt được việc xoá hay sửa một mục trong danh sách cấu hình. Một thay đổi như vậy trong tương lai có thể lọt qua mà không ai được báo.
  - Ngoài-4: Nếu lệnh git trong phép kiểm phạm vi bị lỗi giữa chừng, phép kiểm có thể lặng lẽ bỏ qua một số commit mà vẫn báo đạt. Chỉ xảy ra khi môi trường chạy kiểm tra có sự cố.
  - Ngoài-5: Việc bốn hồ sơ khó đọc nay đọc được mới được kiểm gián tiếp, bằng cách xem mã cũ đã bị bỏ chưa, chứ chưa có phép thử trực tiếp cho thấy bốn hồ sơ đó thật sự được đọc ra. Nếu bộ đọc lặng lẽ trả về rỗng thì phép kiểm vẫn xanh.
  - Ngoài-6: Ba phép kiểm phạm vi chưa được thử bằng một ca cố ý vi phạm để chứng minh chúng báo đỏ đúng lúc. Hiện chúng chỉ được thấy là im lặng trên lịch sử thật, nên nếu chúng hỏng ngầm thì khó phát hiện.
  - Ngoài-7: Phép kiểm «hồ sơ cũ về đúng nguyên bản» không quét hết mọi tệp trong hồ sơ, và bỏ qua hẳn tệp nhật ký. Hôm nay hồ sơ vẫn sạch, nhưng một thay đổi lọt vào tệp nhật ký sẽ không bị phát hiện.
  - Ngoài-8: Phép thử kiểm tra «thước còn đo đúng sau khi có commit mới» có thể báo đạt ngay cả khi lượt đo trước đó không đo được gì. Vì vậy một lần báo đạt chưa chắc chứng minh thước thật sự bắt được thay đổi, nhưng không làm hỏng kết quả nào mà hồ sơ đã hứa.
  - Ngoài-9: Phép thử đối chứng chỉ kiểm tra rằng kết quả đổi đi khi thêm commit giả, chứ không kiểm tra rằng kết quả đổi đúng vì dấu của commit giả. Có thể có lần báo đạt mà thước thật ra đổi vì lý do khác, nên độ tin của phép thử này yếu hơn vẻ ngoài.
  - Ngoài-10: Bộ kiểm phạm vi hiện xanh nhưng chưa có ca thử chứng minh nó thật sự bắt được một commit đổi giá trị cấu hình có sẵn hay đụng vào hồ sơ cập nhật tuần OKR. Nếu ai đó vi phạm hai luật này, có thể không có gì báo đỏ.
  - Ngoài-11: Bước kiểm dòng ghim lại chỉ xét những eval mà dòng ghim tự liệt kê. Nếu một dòng ghim bỏ sót vài eval thì vẫn được coi là xanh, nên «mọi eval đều đạt» chưa được bảo đảm đầy đủ.
  - Ngoài-12: Việc bốn tệp mô tả kiểm thử nay đọc được chỉ được xác nhận gián tiếp, qua việc lệnh chạy xong không lỗi. Nếu bộ đọc mới đọc ra rỗng thì bước kiểm vẫn có thể báo xanh.
  - Ngoài-13: Nếu một lượt ghim lại bị ngắt giữa chừng, bước kiểm tra có thể bỏ qua dòng hỏng và tin vào lượt ghim xanh cũ hơn, khiến hồ sơ trông đã đạt dù lượt mới nhất chưa đạt.
  - Ngoài-14: Mốc gộp cố định được ghi ở nhiều chỗ, nên sau này đổi mốc mà quên một chỗ thì phép kiểm sẽ lệch nhau. Hiện tại chưa gây sai kết quả.
  - Ngoài-15: Một phép thử đối chứng đo hơi khác điều nó tự mô tả, nhưng vẫn cho kết quả đúng nên không ảnh hưởng người dùng.
  - Ngoài-16: Khi phép kiểm gặp lỗi, thư mục làm việc tạm có thể bị bỏ lại và tích dần trên máy; không ảnh hưởng kết quả nghiệm thu.
  - Ngoài-17: Phép thử đối chứng chứng minh được ít hơn vẻ ngoài: nó có thể xanh ngay cả khi bản sao hỏng vì lý do khác, nên độ tin cậy của phép kiểm thước neo thấp hơn kỳ vọng.
  - Ngoài-18: Phép kiểm chỉ đọc dòng nhãn in ra chứ không kiểm tệp thật được soi, nên nếu script trôi phạm vi mà vẫn in nhãn đúng thì phép kiểm không phát hiện.
  - Ngoài-19: Phép kiểm phạm vi chưa từng được thử bằng một vi phạm cố ý, nên nếu nó hỏng im lặng thì vẫn báo xanh và không ai biết.
