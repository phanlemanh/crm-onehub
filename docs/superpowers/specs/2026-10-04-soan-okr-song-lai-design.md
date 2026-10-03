# Soạn OKR khi chưa cấu hình — không mời, không trừ lượt, nói thẳng

Lượt 0 của lộ trình bộ xương Kara (đề xuất 04/10, `.acceptance-runs/lai-thu-prod-0410/`).

## Vì sao

Đo trên production 04/10: bốn cuộc soạn (`okrCuocSoan`, 02–03/10) đều `soLuot = 0`. Mở phiên
`POST /eve/agents/okr/eve/v1/session` trả 503 `chua-cau-hinh-tro-ly-okr` vì `okrBridgeConfigured()`
sai — app production thiếu `OKR_AGENT_URL` và `OKR_AGENT_BRIDGE_SECRET`, Vercel chưa có dự án cho
`apps/agent-okr`. Người dùng vẫn thấy nút «Draft OKRs with the Assistant», mở cuộc, bị tính một
trong ba cuộc của kỳ, rồi chỉ thấy «The OKR Assistant did not answer».

Ba chỗ hỏng, ba chỗ sửa:

1. Nút mời mở cuộc dù máy chủ không thể trả lời.
2. Cuộc chưa từng có lượt nào vẫn bị tính vào trần ba cuộc mỗi đơn vị mỗi kỳ.
3. Không có hướng dẫn dựng `apps/agent-okr` trên Vercel; chủ kho không có đường tự bật.

## Thiết kế

### Cờ cầu nối đi từ trang server xuống

Chỉ `apps/app` đọc bí mật cầu nối (`OKR_AGENT_BRIDGE_SECRET`); API không bao giờ đọc nó
(`docs/environment.md`). Nên cờ sinh ở trang server `okr/theo-don-vi/page.tsx`:
`okrBridgeConfigured()` từ `lib/agent-bridge.ts`, truyền qua `TheoDonVi` xuống `NutSoan` thành prop
`cauNoi: boolean`. Đúng luật «trang server tính, component client vẽ» của `AGENTS.md`: tệp client
không import `agent-bridge`.

### Nút soạn khi `cauNoi = false`

`NutSoan` vẫn hỏi `okr.soanSanSang` như hôm nay. Không gian kết quả là 11: 8 mã lý do của `soanSanSangOutput` và 3 biến thể bật (nấc bật không cuộc đang, nấc bật có cuộc đang, nấc ẩn). Kết quả nào hôm nay **không có nút** (đơn vị lưu
trữ, chưa bật, chế độ ẩn với người thường, người không sửa được) thì vẫn không có nút. Mọi kết quả
còn lại — bật, tiếp tục cuộc đang soạn, hết cuộc kỳ, tạm nghỉ, chưa có khoá mô hình, chế độ ẩn với
quản trị — đều thay bằng **một** nút khoá mới `nut-chua-cau-hinh` dựng bằng `NutTat` có sẵn: nút
mờ «Soạn OKR cùng Trợ lý» + `FieldDescription` nối bằng `aria-describedby`. Không «Tiếp tục cuộc
đang soạn», không nút danh sách cuộc, không gọi `soanMo`.

Chữ (`lib/messages/okr-soan.ts`, `nut.chuaCauHinh`), không gọi tên AI để khỏi lẫn «Trợ lý»/«Kara»
trước lượt đổi tên:

- vi: «Tính năng soạn nháp chưa được bật trên máy chủ này — quản trị viên OneHub cần bật nó.»
- en: «Drafting isn't turned on for this server yet — a OneHub admin needs to turn it on.»

Câu nói bước kế (ai bật), không gợi ý cho lập trình viên (`docs/ai-ux.md` §7).

### Màn soạn mở bằng URL cũ

`?cuocSoan=<id>` vẫn mở `ManSoan`. Với `cauNoi = false`, `ManSoan` dựng khung (tiêu đề, mô tả đơn
vị · kỳ) và thân là `Empty` với cùng câu trên — không `Conversation`, không `PromptInput`, không
gọi `useCuocSoan` (hook mở phiên eve). Không request nào tới `/eve/agents/okr`, nên không lượt nào
bị tính.

### 503 «chưa cấu hình» giữa phiên

Phòng khi trang thấy cờ bật mà cửa vẫn trả 503 `chua-cau-hinh-tro-ly-okr` (bí mật lệch giữa hai
dự án, hoặc vừa bị gỡ): `cua-okr-config.ts` thêm hằng `trangThaiChuaCauHinh: 503` mà `route.ts` dùng thay số viết tay, `loi-cua.ts` thêm `laChuaCauHinh(loi)` so cả mã lẫn trạng thái với hằng đó; hội thoại hiện câu `nut.chuaCauHinh`
ở chỗ báo lỗi, không «did not answer», không «Thử lại». Mọi lỗi khác giữ nguyên.

### Trần cuộc chỉ đếm cuộc đã có lượt

`demCuocTrongKy` (`packages/db/src/okr-cuoc-soan.ts`) thêm điều kiện `soLuot > 0`. Hệ quả:

- Bốn cuộc hỏng trên production tự hết bị tính — không sửa dữ liệu.
- «x/3 cuộc» trên nút và danh sách bằng số cuộc thật sự đã dùng.
- Cuộc đã có lượt vẫn tính ở mọi trạng thái (`dang`, `da-dua-vao`, `bo`).
- Giá phải nhận: một đơn vị mở rồi bỏ cuộc rỗng bao nhiêu lần cũng được. Không tốn AI — lượt chỉ
  được tính khi cửa nhận lượt (`tangLuot`), và cửa đã từ chối trước bước đó khi chưa cấu hình.

`soan.service.ts` không đổi: `sanSang` và `mo` đã đọc qua `demCuocTrongKy`.

### Hướng dẫn triển khai `apps/agent-okr`

`docs/setup.md` thêm mục «Deploying `apps/agent-okr` to Vercel», lấy dự án `crm-onehub-agent` làm
mẫu (đọc bằng `vercel project inspect` 04/10: Root `apps/agent`, preset Other, build `bun run
build`, Node 24.x):

- Dự án mới: Root `apps/agent-okr`, preset Other, build `bun run build`, Node 24.x.
- Biến của dự án `agent-okr`: `OKR_AGENT_BRIDGE_SECRET`, `DATABASE_URL`, `OKR_AI_GATEWAY_API_KEY`
  (vắng thì `AI_GATEWAY_API_KEY`, vắng nữa thì OIDC của Vercel) — đúng danh sách
  `apps/agent-okr/turbo.json` truyền qua.
- Biến thêm vào `crm-onehub-app`: `OKR_AGENT_URL` (URL production của dự án mới),
  `OKR_AGENT_BRIDGE_SECRET` (cùng giá trị).
- Kiểm: `GET <OKR_AGENT_URL>/health` trả `cay`; rồi nút soạn ở «Theo đơn vị» mở được.

Việc tạo dự án và đặt khoá là của chủ kho.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (chưa cấu hình): «Theo đơn vị» → thấy nút soạn mờ + một câu vì sao → không có gì để bấm (điểm ra: ở lại trang).
- Biên: đơn vị chưa bật / ẩn / lưu trữ → vẫn không có nút như hôm nay; người không sửa được → không có nút.
- Lỗi & quay lại: mở bằng URL cũ `?cuocSoan=` → màn soạn trống với cùng câu → đóng (✕) về «Theo đơn vị»; cửa trả 503 chưa cấu hình giữa phiên → câu đó ở chỗ báo lỗi, không Thử lại → đóng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thanh công cụ «Theo đơn vị» | cho biết soạn nháp chưa bật và ai bật | trang OKR / ở lại |
| Màn soạn (sheet) | nói thẳng cuộc này không mở được vì chưa bật | URL `?cuocSoan=` / đóng về «Theo đơn vị» |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-soan-nut-chua-cau-hinh | Thanh công cụ | nút «Soạn OKR cùng Trợ lý» mờ + «Tính năng soạn nháp chưa được bật trên máy chủ này — quản trị viên OneHub cần bật nó.» | báo quản trị viên |
| ST-soan-chua-cau-hinh | Màn soạn | tiêu đề + mô tả đơn vị · kỳ; `Empty` cùng câu; không ô soạn | đóng |
| ST-soan-loi-chua-cau-hinh | Màn soạn | hội thoại cũ giữ nguyên; chỗ báo lỗi hiện cùng câu, không «Thử lại» | đóng |
| ST-soan-nut | Thanh công cụ | (cấu hình đủ) như hôm nay — không đổi | mở cuộc |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nút mờ dùng `disabled` + `aria-describedby` trỏ câu mô tả (mẫu `NutTat`); không focus bẫy, không toast.
- 1440 và 390: câu mô tả xuống dòng trong thanh công cụ, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `NutTat` (nut-soan.tsx) | dùng | đã là mẫu nút khoá + lý do của cùng thanh |
| `Empty` (`@crm/ui`) | dùng | `ai-ux.md` §7 chọn `Empty` cho trạng thái không làm được |
| `Sheet` khung màn soạn | dùng | giữ khung hiện có; trang riêng là lượt 2 |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi IA — chỉ thêm trạng thái tắt cho một nút và một màn đã có; luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Không làm

- Trang riêng, bố cục hai nửa, bản nháp kiểu Artifact — lượt 2.
- Đổi tên «Trợ lý» → «Kara», `KaraMark` — lượt 1.
- API tự từ chối `soanMo` khi chưa cấu hình — API không đọc biến cầu nối; cuộc rỗng không còn bị tính nên không cần.
- Đóng hay xoá bốn cuộc hỏng trên production — tự hết bị tính.
- Tạo dự án Vercel, đặt khoá — việc của chủ kho.

## Hồ sơ đã ký bị thay

`soan-okr-cung-tro-ly` AC-5 / E9 hứa «cuộc thứ 4 của đơn vị trong chu kỳ bị `het-cuoc-ky`» với
nghĩa đếm mọi cuộc. Lượt này thu hẹp «cuộc» thành «cuộc đã có ít nhất một lượt». Bài
`apps/api/test/soan-okr-tran.spec.ts` của E9 được sửa để ba cuộc đầu có lượt trước khi mở cuộc
thứ tư; vế «đơn vị khác vẫn mở» và mọi vế trần tháng giữ nguyên. Bài `packages/db/test/okr-cuoc-soan.spec.ts`
«đếm mọi trạng thái» đổi kỳ vọng theo nghĩa mới.
