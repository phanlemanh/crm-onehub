---
schema_version: 1
feature: Lượt kiểm chéo đêm xếp sau mọi đơn thợ khi xin khoá, và khi làn chạm trần thì lưu hồ sơ đã đo để đêm sau chạy tiếp phần còn lại
slug: kiem-cheo-chay-quang-lang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-10
design_doc: _acceptance/kiem-cheo-chay-quang-lang/design.md
---

# Acceptance Contract: kiem-cheo-chay-quang-lang

## Context

Đêm 10/10 lượt kiểm chéo của F9 giữ khoá `s4` của cả đợt suốt 80′ và chỉ đo được 22/146 hồ sơ: làn chạm trần (mã 4),
`dem.mjs` báo «không chạy được» và không giữ lại gì. Anh giao hai việc (sổ luật đợt, dòng 554): kiểm chéo xếp sau mọi đơn thợ,
và chạy tiếp từ hồ sơ đang dừng. Vòng này thay `kiem-cheo-sau-gop/E2` (AC-5 cũ: đơn kiểm chéo mang `moc` xếp trước đơn thợ).

## Criteria

- AC-1: Given hàng chờ có đơn mang `phien: kiem-cheo` (có hay không có `moc`) và đơn của thợ cùng tài nguyên, When bộ phát
  lịch xếp hàng và cấp lượt, Then mọi đơn thợ đứng trước đơn `kiem-cheo`, và đơn `kiem-cheo` chỉ được cấp khi không còn đơn
  thợ nào chờ tài nguyên đó; thứ tự giữa các đơn thợ giữ nguyên luật cũ (ghim lại mở merge trước, rồi mốc, rồi giờ xin).
- AC-2: Given làn thoát mã 4 (chạm trần) sau khi chạy xong k trong N hồ sơ của tập đo đêm đó, theo thứ tự đã truyền, When lượt
  đọc đầu ra của chính làn đó, Then hồ sơ đã đo trọn là các hồ sơ đứng trước hồ sơ cuối cùng có dòng `[lane]` của eval; eval lệch
  (theo mã kỳ vọng ở `D`) của các hồ sơ đó được phân loại như một lượt thường, eval của hồ sơ dở bị bỏ; lượt ghi
  `.acceptance-runs/kiem-cheo/tien-do.json` với `tu` giữ nguyên, `den` = đỉnh đêm đó, `xong` = hợp của hồ sơ xong cũ không bị
  chạm và hồ sơ xong đêm nay, `do` = `do` cũ trừ hồ sơ đo lại cộng `do` đêm nay; tệp ngày ghi `ket_qua: chua-xong` nêu k/N; mốc
  KHÔNG tiến. Trên nhật ký thật đêm 10/10 (sha256 ghim) với danh sách 146 hồ sơ của tệp ngày đêm đó, hồ sơ xong là 21 và hồ sơ dở
  là `cron-theo-ban-khai`.
- AC-3: Given `tien-do.json` có `tu` bằng mốc hiện tại, When lượt kế chạy với đỉnh `D'`, Then tập đo = tập hồ sơ bị chạm trong
  `tu..D'` trừ những hồ sơ trong `xong` không bị chạm trong `den..D'`; không hồ sơ nào trong `xong` mà không bị chạm được đo lại.
- AC-4: Given lượt kế đo hết phần còn lại (làn thoát 0 hoặc 1), When báo, Then `do` của tiến độ được gộp với `do` đêm nay TRƯỚC
  khi kết luận: tệp ngày ghi `do` khi `do` đã gộp có ít nhất một `do-moi` (kể cả `do-moi` chỉ có ở đêm trước), `xanh` khi không;
  mốc tiến tới `D'`, `tien-do.json` bị xoá.
- AC-5: Given `tien-do.json` hỏng, hoặc `tu` khác mốc hiện tại, When lượt chạy, Then nó đo trọn tập như chưa có tiến độ và ghi
  một dòng lý do vào tệp ngày; và Given `tien-do.json` hợp lệ mà lượt dừng vì hạ tầng (dựng cây lỗi, suite đỏ ở `D'`, làn thoát
  mã khác 0, 1, 4), Then `tien-do.json` giữ nguyên từng byte và mốc đứng.
- AC-6: Given `_acceptance/kiem-cheo-sau-gop/evals.yaml`, When hồ sơ này đã ký, Then E2 mang `status: not-run` và
  `superseded_by: kiem-cheo-chay-quang-lang#AC-1`, và kiểm lại bằng chứng của `kiem-cheo-sau-gop` nhận con trỏ.
- AC-7: Given một lượt có chạy làn, When ghi tệp ngày, Then tệp ngày có `tap_lan` (danh sách hồ sơ đã đưa cho làn, đúng thứ tự)
  để đếm được hồ sơ bị đo lại qua các đêm.

## Coverage

- Trục A — đơn trong hàng chờ: chỉ thợ | chỉ kiểm chéo | cả hai, kiểm chéo có `moc` | cả hai, không `moc` | ghim lại mở merge
  [thước CE: `lich.mjs` và bài kiểm `lich.test.mjs` hiện có]
- Trục B — kết cục làn: xanh | đỏ (mã 1) | chạm trần (mã 4) sau 0, k, N hồ sơ | lỗi khác [thước CE: nhật ký đêm 10/10, mã thoát của làn]
- Trục C — tiến độ lưu: vắng | đúng mốc, đỉnh không đổi | đúng mốc, đỉnh mới chạm hồ sơ đã xong | khác mốc | hỏng
- Core → AC: A → AC-1; B → AC-2, AC-4, AC-5; C → AC-2, AC-3, AC-4, AC-5; nối F9 → AC-6; đường đo → AC-7.

## Đường đo

- «Không hồ sơ nào bị đo lại khi không bị chạm» · đọc `tap_lan` của các tệp ngày nối nhau đối chiếu `tepDoi` · AC-7.
- «0 lần kiểm chéo được cấp khoá khi còn đơn thợ chờ» · chưa có nhật ký cấp lượt của bộ phát lịch; đo bằng tay từ
  `khoa/s4/chu.json` lúc cấp và thư mục `xin/` — giới hạn khai, xem Notes.

## Out of scope

- Bỏ bớt 7 suite (13′) khỏi lượt đêm — một thay đổi riêng của cách gọi làn.
- Khởi động lại bộ phát lịch đang chạy (pid 16906) — giám sát làm sau khi gộp.
- Phân loại 12 hồ sơ đỏ/không đo của đêm 10/10 — hàng F25.

## Notes

- Hồ sơ đang chạy dở khi làn chạm trần không tính là xong; eval đã chạy của nó bị bỏ và chạy lại đêm sau.
- Ngưỡng «0 lần kiểm chéo nhận khoá khi còn đơn thợ» chưa có thước máy: bộ phát lịch không ghi hàng chờ lúc cấp lượt.
- Thẻ thay thế `kiem-cheo-sau-gop/E2` cho bộ kit: hồ sơ này nêu `kiem-cheo-sau-gop/E2`.
- Known limit (Cổng 2, Ngoài-1): đường mã 4 đọc dòng `[lane]` viết cho người của bộ kit; kit đổi chữ dòng đó thì lượt ra
  `chua-xong` 0/N mỗi đêm mà không báo lỗi.
- Known limit (Cổng 2, Ngoài-2): năm tệp sửa ở vòng này chưa qua `biome format`.
- Known limit (Cổng 2, Ngoài-3, Ngoài-4, Ngoài-5): ca «lan chay het nhung phan loai vuot tran» không kiểm `do-moi` của đêm
  trước còn sống; `--tran-phut` của làn chỉ so với chính hằng `lanPhut`, không ghim `lanPhut` < `tranPhut`; `suiteDoTrongNhatKy`
  chỉ thử trên dòng gõ tay.
- Known limit (Cổng 2, Ngoài-6): mỏ neo đột biến M1b của `dieu-phoi-hai-tang` (`mocCua(hangViec, d.slug), d.luc]`) đã vắng
  trong `lich.mjs` từ F9; `dieu-phoi-hai-tang/E25` thoát 2 khi lượt kiểm chéo đêm đo nó.
- Known limit (Cổng 2, Ngoài-7, chấp nhận): `dem.mjs` vẫn tính và ghi `moc` vào đơn kiểm chéo dù lịch không còn đọc.
- Known limit (Cổng 2, Ngoài-8, Ngoài-9, Ngoài-10): E1 và E3 khai bản sao đột biến mà bài kiểm không chạy; `noi-f9.mjs` tự
  đưa con trỏ hằng vào `chungThayBoi` thay vì đo đường kiểm lại thật.
