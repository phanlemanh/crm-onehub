# Thiết kế: zalo-cau-thu-hai-lien-ket (l7)

Hàng `l7` của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`), mốc 30/10. Cổng Đáng `build` (chủ kho, 14:59Z
19/10, ghi ở `opportunity.md`). Câu giao: «Hỏi Kho qua Zalo từ câu thứ hai trở đi trong ngày, trợ lý kho vẫn trả lời đúng
chỉ dẫn». Nguồn: mục Ngoài-4 của `l6` (`_acceptance/zalo-tro-ly-kho-chi-dan/review-findings.md`, quyết «mở hợp đồng mới»
ở `decisions.jsonl` dòng 15).

## Chuyện gì đang hỏng

Một người hỏi Kho qua Zalo nhiều câu trong một ngày. `hoiTacTu` (`apps/agent/agent/lib/zalo-hoi.ts`) đặt token phiên
`tokenPhien(chatId, crmUserId, now)` theo ngày, nên câu thứ hai trở đi đi vào **cùng một phiên gốc eve** với câu một.
Mỗi câu có hàng `ZaloHoi` riêng mang `hoiId` riêng trong `auth.attributes` của lượt.

Hook `apps/agent/agent/hooks/lien-ket-hoi.ts` (của `l6`) chỉ nghe `session.started`. Sự kiện đó chạy một lần mỗi phiên,
nên chỉ câu đầu ngày được hook gắn `ZaloHoi.sessionId` sớm. Câu thứ hai chỉ được gắn khi `moPhien`
(`zalo-tra-loi.ts`) nhận mã phiên từ `send` trả về — đúng cuộc đua mà `l6` đã đóng cho câu một.

Phiên con `tro_ly_kho` mở mới ở mỗi lần gọi (tài liệu eve `subagents.mdx`: «Each delegated subagent spins up its own child
session»), nên bộ nạp chỉ dẫn `subagents/tro_ly_kho/instructions.ts` chạy lại ở mỗi câu. `moHoi`
(`lib/tai-lieu-hoi.ts`) tìm `ZaloHoi` đang hỏi có `sessionId` = phiên gốc, thử `timHoi.soLan` × `timHoi.cachMs`
(8 × 250 ms). Câu hai chưa được gắn trong cửa sổ đó → bộ nạp trả chỉ dẫn dừng của `l6` (AC-5 của `l6`) → trợ lý kho
không trả lời câu, người hỏi nhận câu lỗi.

## Hướng sửa

Hook `lien-ket-hoi.ts` nghe thêm `turn.started`, gọi đúng `lienKetPhienGoc(ctx)` như `session.started`.

- Tài liệu eve `docs/guides/hooks.md` mục «Execution order»: hook chạy sau khi sự kiện được ghi, **trước** các bộ giải
  động. `turn.started` đến trước bước model đầu của lượt, nên liên kết có trước khi agent gốc gọi `tro_ly_kho`.
- `ctx.session.auth.current` là người gọi **của lượt đang chạy** (tài liệu eve `patterns/multi-tenant-memory.md`:
  «`auth.current` identifies the caller of the active turn»). `attribute()` của `session-purpose.ts` đọc `current`
  trước `initiator`, nên ở câu hai hook đọc `hoiId` của câu hai, không phải của câu một.
- Chỉ dẫn gốc `instructions/task.ts` đã giải lại ở `turn.started` cho purpose `zalo`; hook đi cùng nếp đó.
- Hook của agent gốc không chạy cho lượt của phiên con (`hooks.md` «Subagent isolation»), nên `turn.started` của
  `tro_ly_kho` không đi qua hook này.

### Dòng nhật ký giữ nguyên luật của l6

`lienKetPhienGoc` in dòng `[lien-ket-hoi]` mỗi khi, sau lần ghi, hàng mang đúng mã phiên — kể cả khi `moPhien` đã ghi
trước. Giữ nguyên: câu đầu ngày (`session.started` rồi `turn.started`) có hai dòng, câu sau có ít nhất một dòng. Luật
«chỉ in khi chính lần gọi ghi được hàng» bị loại: trên eve thật `send` của phiên đã có có thể trả mã trước khi
`turn.started` tới hook, `moPhien` ghi trước, hook đổi 0 hàng và không in — phép đo mất bằng chứng hook đã chạy với
`hoiId` đúng và đỏ giả trên một bản vá đúng. `lib/tai-lieu-lien-ket.ts` không đổi.

Câu thứ hai trở đi chỉ có dòng `[lien-ket-hoi]` khi hook chạy ở `turn.started` (cây chưa vá không có đường nào khác in
dòng đó cho câu ấy), nên «mỗi câu có ít nhất một dòng mang `zaloHoiId` của nó» là cái thước phân biệt.

### Không đổi

- `moPhien` vẫn ghi `sessionId` sau khi `send` trả về (lưới thứ hai; điều kiện `where` của nó không đổi).
- Kênh `channels/zalo.ts` (vùng của làn Mac Studio, luật 21 của đợt) không chạm.
- Bộ nạp chỉ dẫn, `moHoi`, cửa sổ tra lại giữ nguyên.

## Phép đo đầu-cuối

Bài kiểm trên Postgres chứng logic, nhưng điều l7 hứa đứng trên một sự kiện của eve thật: `turn.started` của câu hai
chạy qua hook với `auth.current` mang `hoiId` mới. Chỉ eve thật nói được điều đó.

Lượt đo: `rang/do.ts` chạy `eve eval evals/tro-ly-kho/cau-thu-hai.eval.ts` trên kho đo dùng-một-lần (`mot-luot.sh`,
như `rang/cham-bo-do.ts` của `tro-ly-doc-kho`). Tám người đã nối Zalo, mỗi người hỏi **ba câu kho liên tiếp** qua
`/zalo/webhook` (Zalo giả nhận câu trả lời), câu sau gửi khi câu trước đã kết thúc. Câu lấy từ bộ mẫu
`_acceptance/bo-cau-hoi-mau/bo-mau.json`, tầng có trang S1, S2, S7 (30 câu), 24 câu đầu theo mã, chia tám chuỗi ba câu cố
định trong `rang/chuoi.json`; trang gieo từ trang mẫu của bộ như `rang/cham-bo-do.ts`. Model là model mặc định của
nhánh — đổi model là việc của `re-mo-hinh-mac-dinh`.

Bằng chứng chép vào `evidence/`: `ket-qua.jsonl` (mỗi câu: người, thứ tự trong ngày, `zaloHoiId`, `sessionId`,
`ketQua`, hàng `TaiLieuHoi` kênh ZALO và trạng thái), `eve.log`, `eve-log.txt` (băm hai tệp), `do.md`.
`rang/so-do.ts` đọc bằng chứng và quyết.

Vì sao phép đo phân biệt được: trên cây chưa vá không có hook ở `turn.started`, nên câu thứ hai và thứ ba không bao giờ
có dòng `[lien-ket-hoi]` mang `zaloHoiId` của chúng. Đó là cái thước đếm, cạnh trạng thái hàng.

## Thu phạm vi sau lượt đo 2 (chủ kho, 2026-10-19)

Lượt đo 2 có 2/8 người kẹt ngay câu đầu: agent gốc Zalo với model mặc định chạy `bash`/`read_file`, gọi `tro_ly_kho` thêm
lần với câu tự đặt (4 dòng chỉ dẫn dừng), lượt quá hạn chờ, câu sau bị «đang bận». Lỗi nằm ở lời dặn agent gốc Zalo (làn
Mac Studio), không ở đường câu thứ hai. AC-5 nay chỉ chấm câu thứ hai, thứ ba của người có câu đầu đã trả lời, đòi tối
thiểu 6/8 người như vậy (Hỏi-3); dòng chỉ dẫn dừng chỉ đếm. Thước gắn từng tin Zalo giả nhận vào đúng câu theo khoảng thời
gian gửi và so với câu trả lời dựng từ `TaiLieuHoi` của chính câu; eval chờ 5 giây lắng sau khi câu xong.

## Đặc tả UX

Không chạm giao diện (surface `agent`). Bỏ — dòng sổ `descope` «bỏ đặc-tả-UX».

## Hai câu cho người ở Cổng Phạm vi

- **Hỏi-1 — vá hẹp hay vá rộng.** Khuyên: hook nghe `turn.started` (bản này). Lối khác: `moHoi` ưu tiên `hoiId` của lượt
  thay vì tra theo phiên gốc — đóng luôn ca câu trước còn mở (Out of scope), nhưng đổi hành vi bộ nạp chỉ dẫn mà l6 đã
  ký, và cần chứng trước rằng eve chuyển `auth` của lượt gốc sang phiên con.
- **Hỏi-2 — ngưỡng lỗi model và trần chi của lượt đo.** Khuyên: câu lỗi gọi model ≤ 1/24, trần 2 USD mỗi lượt đo, quá
  trần thì dừng không chạy lại. Lối khác: không ngưỡng, chạy lại riêng câu lỗi tới khi đủ 24 — chắc xanh hơn, chi không
  biết trước.

## Ngoài phạm vi (ghi vào hợp đồng)

- Câu trước còn hàng `TaiLieuHoi` đang hỏi khi câu sau tới (lượt câu trước chưa xong, quá hạn phía Zalo):
  `hangDangHoi(goc)` có thể trả hàng câu trước. `dangBan` chặn câu sau khi câu trước còn trong hạn; ca vượt hạn là việc
  riêng.
- Đổi model mặc định, chất lượng câu trả lời — `re-mo-hinh-mac-dinh`, `bo-cau-hoi-mau`.
- Kênh CRM (`purpose: kho`) mỗi câu một phiên (`tokenHoiKho`), không có câu thứ hai trong phiên; hook mới vẫn chạy cho nó
  và chỉ cần không làm hỏng (AC-2).
