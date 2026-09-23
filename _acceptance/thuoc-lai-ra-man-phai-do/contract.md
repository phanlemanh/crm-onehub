---
schema_version: 1
feature: Thước lái-ra-màn phải đỏ được — một nguồn danh sách, hỏng một chiều là hỏng, bộ vẽ chết là đỏ, và đếm đủ thay vì "có ít nhất một"
slug: thuoc-lai-ra-man-phai-do
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-23T11:15:00Z
design_doc: docs/superpowers/specs/2026-09-12-thuoc-lai-ra-man-phai-do-design.md
veto_state: mo
veto_opened_at: 2026-09-12T05:47:24Z
---

# Acceptance Contract: thuoc-lai-ra-man-phai-do

## Context

Thước «lái từng component ra màn» của hồ sơ `chan-lai-component-ra-man` (ký
06/09) đã ngừng canh mà không ai được báo. Commit `84440ce` xoá 19 component
AI Elements; sáu trong số đó vẫn nằm trong danh sách thước đi kiểm, bản vẽ
`evidence/ve-that.json` co từ 461 dòng xuống 15, và 114/114 ca vẫn XANH.

Bốn lỗ độc lập cùng góp vào màu xanh đó: bên VẼ lấy danh sách từ file bằng
chứng đã commit (quá khứ) trong khi bên CHẤM quét kho tươi (hiện tại) — hai
đầu trôi khỏi nhau; bên chấm xếp «không vẽ được» bằng phép VÀ nên một module
không nạp được (chỉ có `loi_dong`) lọt lưới; `chayBanVe` nuốt lỗi của bộ vẽ
rồi chấm tiếp; và câu khẳng định cuối chỉ đòi «có ít nhất một component vẽ
được», nên 49/50 hỏng vẫn xanh.

Cộng thêm một tác dụng phụ vận hành: bản vẽ vừa là vật-do-lần-chạy-sinh vừa
được commit, nên mọi `bun run test`, mọi làn ghim-lại và cả móc trước-khi-đẩy
đều làm bẩn cây ở hồ sơ khác — một `git add -A` sẽ ghi đè bằng chứng đã ký.

Vòng này sửa THƯỚC, không sửa hồ sơ đã ký: hợp đồng, bằng chứng và chữ ký của
`chan-lai-component-ra-man` giữ nguyên; chỉ `rang/*.mjs` và bộ ca của nó đổi.

Source input: prompt (phiên 12/09, sau khi làn ghim-lại `go-khoa-goc-nhin` lộ
ra cây bẩn ở hồ sơ khác)

## Criteria

- AC-1: Given danh sách component cần kiểm, When bên VẼ dựng bản vẽ, Then nó
  rút danh sách từ ĐÚNG hàm quét kho mà bên CHẤM dùng (`docMacDinh`), không
  đọc `evidence/mac-dinh.json` đã commit; xoá một component thật khỏi kho thì
  danh sách của cả hai đầu ngắn đi cùng lúc.
- AC-2: Given một component nạp được module nhưng hỏng ở đúng MỘT trạng thái
  (chỉ `loi_dong`, hoặc chỉ `loi_mo`), When bên CHẤM phân nhóm, Then nó xếp
  component đó vào nhóm «không vẽ được» và nêu tên — không còn đòi cả hai lỗi
  cùng khác null.
- AC-3: Given bộ vẽ chạy không trọn (lệnh `bun test` thoát khác 0), When thước
  chạy, Then thước thoát khác 0 với thông điệp ghim tên bước vẽ — không chấm
  tiếp trên bản vẽ cũ còn sót trên đĩa.
- AC-4: Given danh sách N component cần vẽ, When thước kết luận, Then nó đòi
  số vẽ được ĐÚNG BẰNG N và gọi tên từng cái thiếu khi lệch — câu «có ít nhất
  một component vẽ được» bị gỡ bỏ.
- AC-5: Given cây kho sạch, When chạy `bun run test` hoặc móc trước-khi-đẩy,
  Then không file nào dưới `_acceptance/chan-lai-component-ra-man/evidence/`
  bị sửa — bản vẽ của lượt chạy đi vào chỗ tạm; chỉ lệnh thước gọi có chủ đích
  mới ghi đè bằng chứng. (cross-layer)
- AC-7: Given thước đã sửa và bản vẽ đã dời sang chỗ tạm, When chạy đúng LỆNH
  CỔNG của kho (không gọi thẳng script) trên bản sao có một component bị phá,
  Then lệnh cổng thoát khác 0 với thông điệp ghim tên ca — dây nối giữa cổng
  và thước còn sống sau khi đường bản vẽ đổi chỗ. (cross-layer)

## Coverage

- Trục chỗ hỏng: danh sách lệch nguồn (AC-1) | phân loại lỗi (AC-2) | bộ vẽ chết (AC-3) | câu khẳng định luôn đúng (AC-4) [thước CE: bốn lỗ đo được của vấp 12/09, mỗi lỗ đúng một AC]
- Trục hướng lọt: im lặng không ai đỏ (AC-1, AC-2, AC-3, AC-4) | ồn sai đỏ nhầm — bỏ khỏi hợp đồng cùng AC-6, xem `d-20260923T105729Z-12` [thước CE: lưới chỉ có chiều đỏ sẽ đỏ cả khi vật lành]
- Trục tác dụng phụ: bẩn cây (AC-5) | nuốt bằng chứng hồ sơ khác (AC-5) [thước CE: ba lượt ghi đè đo được trong một phiên]
- Trục sức sống của thước: bỏ khỏi hợp đồng — AC-6 cũ (cặp hai chiều của chính bộ đo) đã descope, xem `d-20260923T105729Z-12` [thước CE: ca in hai dòng mốc vô điều kiện phải trượt]
- Trục dây nối: thước còn được lệnh cổng gọi sau khi đường bản vẽ đổi chỗ (AC-7) [thước CE: thước đỏ-được mà không ai gọi = y hệt trước vòng này]

## Out of scope

- Không đo thước của thước: AC-6 cũ (cặp hai chiều của chính bộ đo) bỏ khỏi
  hợp đồng theo luật chiều rộng (a) của kit — xem `d-20260923T105729Z-12`.
- Không sửa hợp đồng, bằng chứng hay chữ ký của `chan-lai-component-ra-man`
  (ký 06/09) — hồ sơ đã ký không kéo vào diff; vòng này chỉ đụng `rang/*.mjs`
  và bộ ca.
- Không khôi phục 19 component AI Elements đã xoá ở `84440ce` — việc xoá là
  có chủ đích; vòng này chỉ làm cho việc xoá không còn đi qua thước trong im
  lặng.
- Không đụng các thước khác của kho (`nen-chat-ai-elements`, `cua-vao-*`…),
  kể cả khi chúng có thể mắc cùng lớp lỗi — quét cả lớp là việc riêng.
- Không đổi cách kho chạy test (`bun run test`), không đổi `gate-shape.json`.

## Notes

- Hồ sơ này thay thế phần THƯỚC của `chan-lai-component-ra-man`; con trỏ
  «thay thế» ghi ở `_acceptance/chan-lai-component-ra-man/decisions.jsonl`
  bằng một entry `revisit` — không sửa file nào khác của hồ sơ đó.
