# Soạn OKR: «Thử lại» sau 45 giây im phải gửi lại thật, hoặc nói vì sao không

Ngoài-3 round 2 của `soan-okr-khong-tru-luot` (R1h, PR #251). Chủ kho chọn mở hợp đồng mới 04/10,
làm ngay sau khi R1h gộp.

## Vì sao

Khi Trợ lý đang trả lời mà quá 45 giây không có sự kiện (`SOAN_UI.hanKhongSuKienMs`), chỗ báo lỗi
hiện «Quá 45 giây không có hồi âm» với nút «Thử lại». Bấm thì `thuLai`
(`okr/soan/dung-cuoc-soan.ts`) làm:

```ts
if (busy) agent.stop();
void guiThang(tin);
```

Trong eve 0.29.4, `stop()` chỉ huỷ `AbortController` của lượt đang chạy. Trạng thái của store chỉ
về `ready` trong khối `catch`/`finally` của lượt cũ, ở một vi tác vụ sau. `send()` gọi ngay sau
đó thấy trạng thái vẫn `submitted`/`streaming` nên ném «eve session is already processing a turn».
`guiThang` bắt lỗi rồi `return` im lặng. Kết quả:

- lượt đang chạy bị dừng phía trình duyệt, tin không được gửi lại;
- trạng thái về `ready`, nên `qua45s`, `hong` và `dangThu` đều tắt — chỗ báo lỗi biến mất, không
  nói gì, không có «Đã thử lại 1 lần».

Thêm một chỗ hở: `stop()` chỉ cắt luồng phía trình duyệt. Lượt phía Trợ lý vẫn chạy. Theo tài liệu
eve («Message delivery and queueing»), eve không có hàng đợi tin bền; gửi tin mới khi một lượt đang
chạy thì kết quả bất định, và cách đúng là huỷ lượt (`POST session/:id/cancel`) rồi chờ phiên đỗ
lại mới gửi.

## Thiết kế (bản 2 — 05/10, đổi khuôn sau S4 round 1)

Bản 1 dừng luồng phía trình duyệt bằng `agent.stop()` rồi gửi lại khi `onFinish` cộng hồi âm huỷ
đều tới. S4 round 1 chỉ ra, và tài liệu eve 0.29.4 đã cài xác nhận, rằng khuôn đó sai:

- `guides/frontend/overview.mdx`: `stop()` chỉ cắt luồng phía trình duyệt, lượt phía máy chủ vẫn
  chạy. Muốn dừng lượt thì gọi route huỷ, «giữ luồng mở tới khi mốc huỷ về; đừng dùng `stop()` cho
  việc này».
- `channels/eve.mdx`: huỷ là bất đồng bộ. `accepted` chỉ nghĩa là đã nhận lệnh; kết quả thật là
  `turn.cancelled` rồi `session.waiting` trên luồng. `no_active_turn` cũng là thành công.
- `concepts/sessions-runs-and-streaming.md`: `session.waiting` mang `continuationToken` hiện hành;
  token cũ bị từ chối.
- Mã `eve/client` 0.29.4: luồng của một lần gửi đọc từ con trỏ cũ và dừng ở mốc khép đầu tiên. Sau
  `stop()`, con trỏ nằm trước mốc khép của lượt cũ, nên luồng của lần gửi lại dừng ở
  `session.waiting` của lượt CŨ và câu trả lời mới không bao giờ hiện — một đường im lặng mới.

Bản 2 làm đúng theo tài liệu:

1. Nhánh `busy` của `thuLai` ghi tin cần gửi lại vào ref `choGuiLai` (`tin`, `daKhep`, `daHuy`),
   bật `dangChoKhep`, đặt hẹn giờ trần `SOAN_UI.choKhepMs` (15 giây, trong bộ xử lý sự kiện).
2. Gửi yêu cầu huỷ qua cửa: `POST ${OKR_SOAN_CUA.host}/eve/v1/session/<phiên>/cancel`, kèm
   `okrSoanHeader(cuoc.id)` và thân `{ turnId }` — `turnId` của `turn.started` cuối ĐỨNG SAU
   `message.received` cuối (sự kiện cũ cộng dồn từ `initialEvents` không được dùng); không có thì
   thân rỗng. `turnId` làm một lệnh huỷ tới muộn thành no-op thay vì huỷ nhầm lượt mới. Ghi lại số
   sự kiện lúc bấm để bước 3 chỉ xét sự kiện mới.
3. **Không gọi `agent.stop()`.** Luồng giữ mở; khi máy chủ khép lượt cũ, luồng nhận
   `turn.cancelled` rồi `session.waiting`, store về `ready` và gọi `onFinish`. Nhưng `onFinish` chạy
   ở MỌI lần lượt khép (phản biện bản 2), nên phân loại sự kiện từ lúc bấm:
   - có `turn.cancelled` (của T nếu có T) rồi `session.waiting` → khép-vì-huỷ: đặt `daKhep`;
   - có `session.waiting` mà không `turn.cancelled` → lượt tự xong (có khi chính nhờ huỷ trả
     `no_active_turn` với một lượt còn xếp hàng): bỏ chuỗi chờ, KHÔNG gửi lại;
   - không có mốc khép (lỗi luồng, `session.failed`) → bỏ chuỗi chờ, bật `loiGuiLai`.
4. Hồi âm huỷ được parse ở biên bằng một khuôn zod (`huy-luot.ts`): status 2xx (eve thật trả 202)
   VÀ thân `{ ok: true, sessionId: <phiên>, status: "accepted" | "no_active_turn" }`. Khớp → `daHuy`. Không khớp
   (status khác, thân lạ) hay lỗi mạng → bỏ tin chờ, tắt `dangChoKhep`, bật `loiGuiLai`: không gửi
   bừa vào một lượt chưa huỷ, và người thấy «Chưa gửi lại được…» thay vì một lời từ chối chung.
5. Đủ cả `daKhep` và `daHuy` (thứ tự nào cũng được) → gửi lại đúng một lần qua `guiLai`. Một hồi âm
   huỷ hay một `onFinish` thuộc chuỗi chờ đã bỏ (quá trần, lỗi) không chạm chuỗi chờ mới: so định
   danh của ref.
6. Quá trần mà chưa gửi lại → **lối thoát**: `agent.stop()` (chỗ duy nhất gọi `stop`), bỏ tin chờ,
   bật `loiGuiLai`, nút mở lại. Luồng chết (nửa mở, lượt kẹt) không bao giờ có mốc khép; không có lối
   thoát thì «Thử lại» lặp vòng huỷ–chờ mãi. Sau `stop` phiên rảnh phía trình duyệt nên bấm tiếp là
   gửi thẳng; máy chủ còn bận thì trả 409 và màn đi đường lỗi có tên của R1h. Giá đã biết (Out of
   scope): máy chủ khép lượt cũ muộn hơn thì lần gửi kế có thể không hiện câu trả lời tới khi tải lại.

Gọi huỷ bằng `fetch` cộng khuôn zod chứ không bằng `ClientSession.cancel()` của eve: khung kiểm
dùng chung `khung-soan-okr.tsx` giả `eve/client` mà không có `cancel`, và hợp đồng không cho sửa
khung đó (OOS-5). Khuôn zod mô tả đúng thân mà tài liệu eve ghi, nên ranh giới parse vẫn ở biên.

Không dùng `useEffect`: `onFinish` là callback của eve, chạy như một bộ xử lý sự kiện.

### Gửi lại hỏng thì nói ra

Cờ `loiGuiLai` chỉ bật cho lần GỬI LẠI (hàm `guiLai`) và cho lệnh huỷ hỏng, không cho mọi lần gửi:
app dev chạy StrictMode nên lượt mở đầu có thể gửi hai lần và lần hai bị eve từ chối — chuyện đó
không phải lỗi của người (đo màn E7 bản 1 thấy câu hiện oan). Chỗ báo lỗi hiện câu riêng
`hoiThoai.chuaGuiLai` kèm «Đã thử lại N lần»; một lần gửi lại thành công tắt cờ.

Câu này KHÔNG là một mã mới trong `MA_LY_DO_HONG`: bài E7 của R1h (đã ký) so tập mã lý do với tập
khoá câu `lyDoHong`; thêm mã làm bài đã ký đỏ.

### Trong lúc chờ lượt cũ khép

`dangThu` tính thêm `dangChoKhep`, nên chỗ báo lỗi vẫn hiện, nút khoá, dòng «Đã thử lại N lần» còn
nguyên, câu lý do giữ câu trước khi bấm. Ô soạn vẫn khoá vì phiên còn bận.

### Không đổi

- «Thử lại» khi phiên không bận (lỗi HTTP, mất mạng, mở lại cuộc) giữ đúng hành vi của R1h.
- Lượt bị huỷ đã tới Trợ lý nên vẫn tính, đúng luật của R1h (cửa chỉ hoàn lượt không tới được).

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Trợ lý im quá 45 giây → «Quá 45 giây…» + «Thử lại» → bấm → nút khoá, «Đã thử lại 1 lần» → máy chủ khép lượt cũ (`turn.cancelled`, `session.waiting`) → tin cuối gửi lại → câu trả lời mới của Trợ lý hiện, chỗ báo lỗi biến mất.
- Biên: lượt cũ khép rất chậm → chỗ báo lỗi đứng yên, nút khoá, không gửi đôi.
- Lỗi & quay lại: lệnh huỷ hỏng, hoặc gửi lại bị từ chối → «Chưa gửi lại được — lượt trước chưa dừng hẳn. Thử lại sau ít phút.» + «Đã thử lại N lần», nút mở lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Màn soạn (`ManSoan` › `HoiThoaiSoan`) | Trò chuyện với Trợ lý để soạn bản nháp OKR | Theo đơn vị `?cuocSoan=` / Đưa vào bộ OKR |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-soan-qua-45s | Màn soạn | `Alert` «Trợ lý OKR chưa trả lời được» + «Quá 45 giây không có hồi âm…» + «Thử lại» | Bấm «Thử lại» |
| ST-soan-cho-khep | Màn soạn | Cùng `Alert`, nút khoá, «Đã thử lại 1 lần» | Chờ |
| ST-soan-chua-gui-lai | Màn soạn | «Chưa gửi lại được — lượt trước chưa dừng hẳn. Thử lại sau ít phút.» + «Đã thử lại N lần» | Bấm lại sau |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Câu lý do và dòng đếm trong vùng `aria-live="polite"` sẵn có của `LuotLoi`; nút `disabled` khi `dangThu`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Alert*`, `Button` (`@crm/ui`) qua `LuotLoi` sẵn có | dùng | Chỉ thêm một câu; không khối mới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: màn soạn đã là hội thoại; lượt này chỉ sửa hành vi nút «Thử lại» trong chỗ báo lỗi có sẵn — luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Tệp chạm

- `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts` — `thuLai`, `guiLai`, `onFinish`, `dangChoKhep`, `loiGuiLai`; bỏ `agent.stop()` khỏi nhánh bận.
- `apps/app/app/(app)/[slug]/okr/soan/huy-luot.ts` (MỚI) — gọi route huỷ qua cửa, khuôn zod của hồi âm, lấy `turnId` cuối từ sự kiện.
- `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx` — câu `chuaGuiLai` trong `LuotLoi`.
- `apps/app/app/(app)/[slug]/okr/soan/cau-hinh.ts` — `choKhepMs`.
- `apps/app/lib/messages/okr-soan.ts` — chỉ thêm khoá `hoiThoai.chuaGuiLai` (vi + en).
- `apps/app/test/soan-okr-hong.dom.tsx` — chỉ khối «hong — Thu lai roi van im» (AC-6).
- Tệp kiểm MỚI: `soan-okr-thu-lai-45s.dom.tsx`, `soan-okr-huy-luot.spec.ts`, `soan-okr-store-eve-huy.spec.ts`; rang `giu-r1h.mjs`, `thu-lai-45s-man-that.mjs`.

Không chạm: `nut-soan.tsx` (P1), `khung-soan-okr.tsx`, cửa `route.ts`.
