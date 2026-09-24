# Lỗi cầu nối Zalo nói đúng nguyên nhân — thiết kế

Ngày 2026-09-24 · hồ sơ `_acceptance/loi-tac-tu-zalo-noi-dung-nguyen-nhan/` · T2

## Vì sao

Cổng Bằng chứng của `noi-zalo-cho-nguoi-moi` hai lần tách phát hiện này ra thành
hợp đồng riêng: Ngoài-6 ở vòng 1, rồi Ngoài-8 ở vòng 3. Hiện nay mọi hỏng hóc
trên đường API → tác tử → Zalo đều thành một câu «Tác tử chưa nối được», trả 400,
và API không ghi dòng log nào có mã hay nguyên nhân. Người dùng đọc sai nguyên nhân,
còn người vận hành không có dấu vết để tra. Known limits Ngoài-1 vòng 1 (= Ngoài-5
vòng 3) cùng lớp lỗi, nên gộp vào phạm vi này.

Hai chỗ trong mã sinh ra lỗi:

1. `apps/api/src/zalo/zalo-cau-noi.service.ts` gom năm kết cục khác nhau thành
   `lyDo: string`: thiếu cầu nối, lỗi mạng, 401, mã khác 2xx, thân sai khuôn. Mã
   khác 2xx không được ghi log. Lỗi sai khuôn thì ghi chung một dòng với lỗi mạng.
   `zalo.service.ts` bỏ qua `lyDo` và luôn ném `ZALO_THONG_DIEP.khongCauNoi`.
2. `apps/agent/agent/lib/zalo-bot-xuong.ts` **ném ngoại lệ** mỗi khi Zalo hỏng:
   `getMe` lỗi mạng hay sai khuôn, `sendMessage` hỏng, Slack gửi hỏng. Route eve
   biến ngoại lệ thành 500, và API đọc 500 thành «chưa nối». Riêng `getMe` còn một
   lỗi thứ hai: **mọi** mã khác 200, kể cả 5xx của Zalo, đều bị đọc thành «Zalo
   không nhận token này». Hệ quả là quản trị viên đi thay token trong lúc Zalo đang
   sập.

## Thiết kế

Chủ kho duyệt lối **B** ở brainstorm ngày 24/09: câu lỗi sống ở API, app hiện
`e.message`, đúng như `luuBot` đang làm.

### Tầng Zalo — tác tử phân loại, trả kết quả có kiểu thay vì ném

- `datBot`: `getMe` chia ba kết cục.
  - **Token sai**: Zalo trả HTTP 4xx, hoặc thân `ok:false` mang `error_code` 4xx.
    Giữ câu cũ `ZALO.loi.tokenSai`.
  - **Zalo không trả lời được**: lỗi mạng, HTTP 5xx hay mã khác, thân sai khuôn.
    Trả outcome mới `zalo-loi`, reason `ZALO.loi.zaloKhongTraLoi`. Không ghi cột
    nào: `getMe` chạy trước mọi lần `ghiCot`, nên bot đang dùng giữ nguyên.
  - **Được**: như cũ.
- `guiThu`: bọc phần gửi Zalo hoặc Slack. Gửi hỏng thì trả `guiDuoc: false` thay
  vì ném. Gửi được, hoặc không có kênh nào, thì `guiDuoc: true`.
- Mỗi lần hỏng in đúng một dòng `console.error` có tiền tố `[zalo]`. Dòng này nêu
  method (`getMe`, `sendMessage`, `slack`) và lớp hỏng (`http-<mã>`, `mang
  (<tên lỗi>)`, `sai-khuon`). Nó không chứa Bot Token, dù địa chỉ gọi Zalo mang
  token trong đường dẫn (`/bot<token>/…`). Chuỗi mô tả lỗi đi qua một hàm che token
  trước khi in.
- `packages/validation/src/zalo-cau-noi.ts`: `datBotPhanHoi` thêm nhánh
  `{outcome: "zalo-loi", reason}`, `guiThuPhanHoi` thêm `guiDuoc`. Bộ đọc mã lỗi
  Zalo (`error_code` trong thân `ok:false`) nằm ở
  `packages/validation/src/zalo-update.ts`, cạnh `loiZalo` đã có.

### Tầng cầu nối — API gọi tên nguyên nhân, ghi log một dòng

- `KetCauNoi` đổi `lyDo: string` thành `nguyenNhan`, một tập đóng năm giá trị:
  `thieu-cau-noi` · `khong-toi-duoc` · `sai-khoa` (401) · `tac-tu-loi` (mã khác
  2xx, mang `status`) · `sai-khuon` (thân không phải JSON hoặc zod từ chối).
- Mỗi kết cục hỏng ghi **đúng một** dòng `logger.warn` dạng
  `{ message: "Zalo bridge call failed", duong, nguyenNhan, status?, loi? }`.
  `loi` là tên lớp lỗi, hoặc danh sách đường dẫn zod bị từ chối. Dòng này không
  chứa header, thân phản hồi hay khoá cầu nối (`docs/api.md` › Logging).
- `ZALO_THONG_DIEP` bỏ `khongCauNoi`, thêm một câu cho mỗi nguyên nhân (câu cho
  `tac-tu-loi` nhận mã) và hai câu `guiHong.zalo` / `guiHong.slack`. `luuBot`
  không phải đổi logic: nhánh `outcome !== "valid"` đã ném `reason` của tác tử,
  nên `zalo-loi` tự đi qua đó.
- Số 401 đi vào `ZALO_API` trong `zalo.config.ts`, không để số trần trong mã.
- Mã HTTP vẫn là 400 (`BadRequestException`). Đổi sang 502/503 là việc sau: phải
  chạm `DomainErrorMiddleware` dùng chung cho mọi router.

### Chữ trên màn

Người dùng không biết «tác tử» là gì, và chữ này dễ lẫn với **Tác nhân** trong
`CONTEXT.md`. Vì vậy câu hiển thị gọi nó là «dịch vụ nhắc việc» — chữ thường,
không đúc thuật ngữ. Mỗi câu nói người đọc làm gì tiếp: thử lại sau ít phút, hoặc
báo người cài đặt CRM. Tên biến môi trường chỉ nằm trong log, không lên màn.

| Nguyên nhân | Câu (bản duyệt ở Cổng Phạm vi) |
|---|---|
| thieu-cau-noi | CRM chưa được nối với dịch vụ nhắc việc. Báo người cài đặt CRM. |
| khong-toi-duoc | Không gọi được dịch vụ nhắc việc — có thể nó đang tắt hoặc đang khởi động. Thử lại sau ít phút. |
| sai-khoa | Dịch vụ nhắc việc không nhận khoá của CRM. Báo người cài đặt CRM. |
| tac-tu-loi | Dịch vụ nhắc việc gặp lỗi (mã N). Thử lại; nếu vẫn lỗi, báo người cài đặt CRM. |
| sai-khuon | Dịch vụ nhắc việc trả lời theo khuôn CRM không đọc được — có thể hai bên đang chạy hai phiên bản khác nhau. Báo người cài đặt CRM. |
| zalo-loi (datBot) | Zalo đang không trả lời nên chưa kiểm được token. Bot đang dùng giữ nguyên; thử lại sau ít phút. |
| guiHong.zalo | Zalo chưa nhận tin thử. Thử lại sau ít phút. |
| guiHong.slack | Slack chưa nhận tin thử. Thử lại sau ít phút. |

### Màn Thông báo của bạn

`khoi-zalo.tsx` hiện câu cố định `t.guiThuLoi` và bỏ qua lỗi API trả về. Bản mới
giữ khung `<p role="alert">` sẵn có, nhưng hiện `e.message`. Chỉ khi thông điệp
rỗng mới lùi về `t.guiThuLoi`, tức câu cũ hai thứ tiếng. Màn Kết nối › Zalo
(`o-token.tsx`, `trang-thai-webhook.tsx`) đã hiện `e.message`, nên không phải sửa.

### Lệch phiên bản khi triển khai

API và tác tử lên Vercel riêng. Ghép hai phiên bản thì ra hai ca:

- **API mới + tác tử cũ.** Tác tử cũ không có trường `guiDuoc`, nhưng nó cũng không
  bao giờ trả 200 khi gửi hỏng (nó ném, nên trả 500). Vì vậy
  `guiDuoc: z.boolean().default(true)` đọc đúng sự thật.
- **API cũ + tác tử mới.** API cũ bỏ qua `guiDuoc`, nên một lần gửi hỏng hiện thành
  «đã gửi». Ca này chỉ kéo dài trong cửa sổ triển khai, và đã ghi vào Known limits.
  Nếu triển khai tay thì cho API lên trước.

### Ranh giới với phiên đang chạy song song

Phiên `goi-thu-hong-man-noi-that` (Ngoài-2 vòng 3) sửa hai chỗ: nhánh
`xac-minh-hong` của `datBot` và màn Kết nối. Vòng này chạm ba chỗ khác: phần
`getMe` ở đầu `datBot`, hàm `guiThu`, và màn Thông báo. Cả hai phiên có thể cùng
thêm nhánh vào `datBotPhanHoi`. Phiên nào lên `onehub` sau thì gộp; hai nhánh
union độc lập với nhau.

### Test hai hồ sơ đã ký phải đổi

`apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts` (E15 của hồ sơ đã ký) có hai khẳng
định chứa chuỗi «Tác tử chưa nối được». Lời hứa của E15 là «lỗi yêu cầu, không
ném», và lời hứa đó vẫn đúng. Chỉ chuỗi câu đổi: `toContain` chuyển sang câu mới
của từng nguyên nhân. Hai tệp spec do `nzm_giu_da_ky` / `zqw_giu_nqz` canh
(`nhac-qua-zalo.integration.spec.ts`, `zalo-qua-webhook.integration.spec.ts`)
không bị chạm. Zalo giả dùng chung (`apps/agent/test/support/zalo-gia.ts`) chỉ
được thêm núm mới, không đổi núm cũ.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Thông báo của bạn → bấm «Gửi thử nhắc ngay» → toast «Đã gửi thử qua Zalo/Slack» (điểm ra: ở lại màn).
- Biên: chưa có kênh → câu «chưa có kênh nào» (đã có, không đổi).
- Lỗi & quay lại: gửi hỏng ở bất kỳ chặng nào → dòng đỏ dưới khối Zalo nêu nguyên nhân + việc làm tiếp → bấm lại «Gửi thử» xoá dòng đỏ và thử lại. Kết nối › Zalo: lưu bot hỏng → câu nguyên nhân trong ô token / toast như hiện nay.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Thông báo của bạn | chọn kênh nhận nhắc và thử nó | menu Cài đặt / ở lại |
| Cài đặt › Kết nối › Zalo | quản trị viên đặt bot của xưởng | Kết nối / ở lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-thong-bao-gui-thu-hong | Thông báo của bạn | `<p role="alert">` đỏ với câu nguyên nhân từ API (vd «Zalo chưa nhận tin thử. Thử lại sau ít phút.») | bấm «Gửi thử nhắc ngay» lần nữa, hoặc báo người cài đặt CRM |
| ST-thong-bao-gui-thu-hong-rong | Thông báo của bạn | lỗi không có thông điệp → câu cũ `guiThuLoi` theo tiếng đang chọn | thử lại |
| ST-ket-noi-zalo-luu-hong | Kết nối › Zalo | câu nguyên nhân (vd «Zalo đang không trả lời…») ở chỗ đang hiện lỗi hôm nay | thử lại sau; bot cũ vẫn chạy |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bấm «Gửi thử» lần nữa xoá dòng lỗi trước khi gọi (`onMutate`, đã có).
- Câu lỗi là dữ liệu hệ thống, không phải chữ người nhập — không đánh dấu `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `<p role="alert">` trong `khoi-zalo.tsx` | dùng | khung báo lỗi đã có, chỉ đổi chữ bên trong |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: không đổi IA — màn Thông báo đã là một cột; vòng này chỉ đổi nội dung một dòng báo lỗi, không có ≥2 khuôn khả dĩ nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Test

- `apps/api/test/loi-tac-tu-zalo.spec.ts`
  - Ma trận cầu nối 6 × 2: năm nguyên nhân (sai khuôn tách hai ô) nhân hai thao tác, dùng tác tử giả
    `Bun.serve`. Mỗi ô bắt `Logger.prototype.warn` để kiểm dòng log.
  - Chuỗi thật: API → route eve thật → Zalo giả `zaloMayChu`, cho `getMe` và
    `sendMessage` hỏng. Ca lỗi mạng trỏ `ZALO_API_URL` vào một cổng không ai nghe.
    Bắt `console.error` của tác tử đang chạy cùng tiến trình.
  - Ca lệch phiên bản: phản hồi `guiThu` thiếu `guiDuoc`.
- `apps/agent/test/loi-tac-tu-zalo.integration.spec.ts`: `guiThu` với
  `slackFetcher` hỏng, vì đường Slack không giả được qua biến môi trường.
- `apps/app/test/loi-tac-tu-zalo.dom.tsx`: `khoi-zalo` hiện câu API, và lùi về câu
  cũ khi thông điệp rỗng.
- Mỗi phép đo có cặp hai chiều trên cùng fixture: ô lành thì xanh, bản sao bị phá
  thì đỏ với thông điệp ghim.
- Ca «không tới được» dùng `http://127.0.0.1:1`. Trước mỗi ô, test thăm dò thật
  sự bị từ chối kết nối; không bị từ chối thì dừng với thông điệp «cổng đã bị cấp
  lại — lỗi môi trường», chứ không chấm ô đó. Lý do: cổng mượn rồi đóng có thể bị
  tiến trình test chạy song song lấy lại.
- Phép dò «không lộ bí mật» tuần tự hoá đối số log bằng `Bun.inspect`, giống cách
  console in ra. Không dùng `JSON.stringify`, vì hàm này biến một `Error` thành
  `{}` và làm mất cả `message` lẫn `stack`.
- «Sai khuôn» có hai ô: JSON sai khuôn, và thân không phải JSON (HTML). Nếu gộp
  `res.json()` vào cùng `try` với `fetch`, ca HTML sẽ bị đọc nhầm thành lỗi mạng.
