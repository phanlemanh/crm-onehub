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

## Thiết kế

### «Thử lại» khi phiên đang bận: huỷ, dừng, chờ khép, rồi mới gửi

Nhánh `busy` của `thuLai`:

1. Ghi tin cần gửi lại vào một ref (`choGuiLai`) và bật cờ `dangChoKhep`.
2. Gửi yêu cầu huỷ lượt qua cửa: `POST ${OKR_SOAN_CUA.host}/eve/v1/session/<phiên>/cancel` kèm
   `okrSoanHeader(cuoc.id)`. Cửa đã phục vụ đường này (`CUA_OKR.dangDuong.huyLuot`) và không tính
   nó là lượt. Yêu cầu huỷ hỏng thì không chặn bước sau — eve coi huỷ là «bắn rồi quên»
   (`no_active_turn` cũng là thành công).
3. `agent.stop()`.
4. Gửi lại khi **cả hai** điều đã xong: `onFinish` của `useEveAgent` (chạy trong `finally` của
   lượt cũ, sau khi store về `ready` — đã đọc mã `eve-agent-store.js` 0.29.4: `catch` đặt `ready`
   cho lỗi huỷ, `finally` gọi `onFinish`) và yêu cầu huỷ đã có hồi âm (thành công hay hỏng). Hai cờ
   `daKhep`, `daHuy` trong một ref; điều nào tới sau thì gửi `guiThang(tin)` — đúng một lần — rồi xoá
   ref, tắt `dangChoKhep`. Chờ hồi âm huỷ vì tài liệu eve dặn huỷ rồi chờ phiên đỗ mới gửi; cửa chỉ
   trả hồi âm huỷ sau khi Trợ lý đã nhận lệnh huỷ.
5. **Trần chờ khép** `SOAN_UI.choKhepMs` (15 giây): hẹn giờ đặt ngay trong `thuLai` (bộ xử lý sự kiện,
   không `useEffect`). Quá trần mà chưa gửi lại được thì bỏ tin chờ, tắt `dangChoKhep`, bật
   `loiGuiLai` — chỗ báo lỗi nói «Chưa gửi lại được…» và nút mở lại, không có đường khoá mãi.

Không dùng `useEffect`: `onFinish` là callback của eve, chạy như một bộ xử lý sự kiện.

### Gửi lại hỏng thì nói ra

`guiThang` thôi nuốt lỗi im lặng: lần gửi bị từ chối (eve ném trước khi gửi, thường là phiên vẫn
bận) bật cờ `loiGuiLai`. Bấm «Thử lại» lúc đó đi nhánh theo trạng thái thật: phiên bận thì lại huỷ →
dừng → chờ; phiên rảnh thì gửi thẳng.
`hong` tính thêm cờ này, nên chỗ báo lỗi hiện câu riêng `hoiThoai.chuaGuiLai` («Chưa gửi lại được
— lượt trước chưa dừng hẳn. Thử lại sau ít phút.») kèm «Đã thử lại N lần». Lần bấm «Thử lại» kế
tiếp và lần gửi thành công tắt cờ.

Câu này KHÔNG là một mã mới trong `MA_LY_DO_HONG`: bài E7 của R1h (đã ký) so tập mã lý do với tập
khoá câu `lyDoHong`; thêm mã làm bài đã ký đỏ. Câu riêng đi bằng một khoá chữ riêng.

### Trong lúc chờ lượt cũ khép

`dangThu` tính thêm `dangChoKhep`, nên chỗ báo lỗi vẫn hiện, nút «Thử lại» khoá, dòng «Đã thử lại
N lần» còn nguyên. Câu lý do giữ câu trước khi bấm («Quá 45 giây…», qua `lyDoTruoc` sẵn có).

### Không đổi

- «Thử lại» khi phiên không bận (lỗi HTTP, mất mạng, mở lại cuộc) giữ đúng hành vi của R1h.
- Lượt bị huỷ đã tới Trợ lý nên vẫn tính, đúng luật của R1h (cửa chỉ hoàn lượt không tới được).

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Trợ lý im quá 45 giây → «Quá 45 giây…» + «Thử lại» → bấm → nút khoá, «Đã thử lại 1 lần» → lượt cũ khép → tin cuối gửi lại → Trợ lý trả lời, chỗ báo lỗi biến mất.
- Biên: lượt cũ khép rất chậm → chỗ báo lỗi đứng yên, nút khoá, không gửi đôi.
- Lỗi & quay lại: gửi lại bị từ chối → «Chưa gửi lại được — lượt trước chưa dừng hẳn. Thử lại sau ít phút.» + «Đã thử lại N lần», nút mở lại.

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

- `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts` — `thuLai`, `guiThang`, `onFinish`, `dangChoKhep`, `loiGuiLai`.
- `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx` — câu `chuaGuiLai` trong `LuotLoi`.
- `apps/app/app/(app)/[slug]/okr/soan/cau-hinh.ts` — đoạn đường huỷ (nếu cần hằng).
- `apps/app/lib/messages/okr-soan.ts` — chỉ thêm khoá `hoiThoai.chuaGuiLai` (vi + en); `messages-guard.spec.ts` không cần ghim (không phải hàm).
- Tệp kiểm MỚI: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`, `apps/app/test/soan-okr-huy-luot.spec.ts`; rang `_acceptance/thu-lai-sau-45-giay/rang/thu-lai-45s-man-that.mjs`.

Không chạm: `nut-soan.tsx` (P1), `khung-soan-okr.tsx` và mọi tệp kiểm của hồ sơ đã ký, cửa `route.ts`.
