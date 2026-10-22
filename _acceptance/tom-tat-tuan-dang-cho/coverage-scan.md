# Quét độ phủ — tom-tat-tuan-dang-cho (HT4)

Preset: entity-feature, lát trạng thái của một khối (khối Tóm tắt tuần ở Họp tuần). Chạy 22/10 ở S1.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, khu OKR — chân sản phẩm: đào repo (`CONTEXT.md` mục «Tóm tắt tuần», «Chế độ ẩn»;
  `apps/agent/agent/lib/okr/lich-tom-tat.ts`; `packages/db/src/okr-tom-tat.ts`; `docs/ai-ux.md` §7).
- Chân ngành: Linear Pulse — bản tóm tắt AI có lịch cố định (thứ Hai hằng tuần hoặc mỗi ngày làm việc, 7:00 giờ địa
  phương), nên giờ bản tới biết trước được (`https://linear.app/docs/pulse`). Không thấy Pulse hiện dòng «bản kế tới
  lúc nào» — chỗ này là cận kề, không phải chuẩn.

## Trục

- Trục A — nấc Tóm tắt tuần của phòng: tắt (AI tắt) | việc tắt | đơn vị chưa bật | chế độ ẩn | bật
  [thước CE: `nacCuaDonVi` — `packages/db/src/okr-tro-ly-danh-muc.ts`, đủ năm giá trị trả về]
- Trục B — lịch sử bản của phòng trong chu kỳ: chưa từng có việc hay bản | bản tuần mới nhất đang hiện | bản tuần mới
  nhất bị giữ hay không làm được | bản cũ quá 8 ngày
  [thước CE: `docTomTatChoNguoiXem` + `tuanMoiNhat` — `packages/db/src/okr-tom-tat.ts`; `CONTEXT.md` «Tóm tắt tuần»]
- Trục C — lúc mở so với lượt xếp: trước giờ xếp của tuần | đã tới giờ, lượt xếp ngày đó chưa xong | lượt xếp ngày
  đó đã xong mà phòng không được xếp | đang soạn (việc mở)
  [thước CE: `xepTrongNgay`, `damBaoLichTomTat` — `apps/agent/agent/lib/okr/lich-tom-tat.ts`]
- Trục D — Kara sẵn sàng chạy việc tóm tắt: sẵn sàng | hết trần tháng | chưa có khoá mô hình
  [thước CE: `quaTranChung` — `packages/db/src/okr-tro-ly.ts`, đủ hai lý do không sẵn sàng của nó]

Không gian: 5 × 4 × 4 × 3 = 240 ô. Gạch ngay: mọi ô A ≠ bật (khối không hiện, một ô đại diện «ẩn hoàn toàn»); mọi ô
C = đang soạn (khối đã có trạng thái riêng); B ≠ chưa từng ở A = bật thu về một ô «giữ hành vi cũ». Còn 12 ô có nghĩa
ở lát A = bật × B = chưa từng.

## Core

1. bật × chưa từng × trước giờ × sẵn sàng — dòng nêu thứ, ngày, giờ bản đầu tiên. Lõi của câu giao.
2. bật × chưa từng × đã tới giờ, lượt chưa xong × sẵn sàng — dòng nói bản đang được xếp; nếu không, máy sẽ báo
   tuần sau trong khi bản tới trong vài phút.
3. bật × chưa từng × lượt đã xong, phòng không được xếp × sẵn sàng — dòng nêu lần xếp tuần sau (phòng bật sau giờ xếp).
4. bật × chưa từng × bất kỳ × hết trần tháng — dòng tạm dừng tới đầu tháng sau; lần xếp kế rơi sang tháng sau thì
   vẫn nêu giờ (trần đã mở lại).
5. bật × chưa từng × bất kỳ × chưa có khoá — dòng tạm dừng, không ngày.
6. A ≠ bật (cả chế độ ẩn) — khối không hiện gì, như trước.
7. B ≠ chưa từng — không có dòng chờ, hành vi như trước.
8. Giờ API báo trùng giờ agent xếp thật — một luật cho hai bên.

## Later

- B = bản tuần mới nhất bị giữ / bản cũ quá 8 ngày × bật: dòng «bản kế tiếp tới lúc …». Câu giao chỉ nói «chưa có
  bản»; mở khi có vòng cho trạng thái giữ lại.
- Khối tự làm mới khi tới giờ bản (không cần tải lại).
- Báo trước qua tin nhắc buổi sáng / Zalo rằng phòng vừa bật tóm tắt.

## Never

- Nêu số tiền, trần hay chi phí AI cho trưởng phòng — đó là chỗ của quản trị (Sức khoẻ chương trình).
- Hiện dòng chờ ở chế độ ẩn — `CONTEXT.md`: ở nấc này người dùng không thấy gì.

## Cross-cutting áp mọi ô Core

- Giờ hiện theo múi giờ VN (`Asia/Ho_Chi_Minh`) bất kể múi giờ máy người xem.
- Chữ qua `lib/messages`, có bản `en`; gọi Kara đúng `docs/ai-ux.md`.
- Nhìn thấy trọn ở 375 và 1440 (không dùng phần bị ẩn dưới 640 px).
- Chu kỳ không ở pha đang chạy: lịch không xếp, nên không có dòng chờ.
