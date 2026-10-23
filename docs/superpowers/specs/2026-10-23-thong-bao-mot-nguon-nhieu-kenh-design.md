# Một thông báo, nhiều kênh (TB2) — thiết kế

Ngày 2026-10-23 · hồ sơ `_acceptance/thong-bao-mot-nguon-nhieu-kenh/` · hàng TB2 của `docs/plan/lo-trinh-okr.json`
(mã N3, N4 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`) · Cổng Đáng `build` (chủ kho 19/10) · đợt
`lo-trinh-tin-hieu`, dãy S1.

## Một câu

Mỗi thông báo CRM ghi vào chuông là nguồn duy nhất cho mọi kênh: Zalo hay Slack chỉ chuyển tiếp những loại thông báo
người dùng cho phép, chuông thì luôn nhận đủ. Trang «Nhắc buổi sáng» (nơi người dùng đã chọn Zalo hay Slack) có thêm
một bảng loại thông báo × kênh, chia hai mức **Cần làm** và **Để biết**. Ai chưa đổi gì thì Zalo và Slack nhận đúng như
hôm nay.

## Hiện trạng (đo 23/10 trên `86d6114ea`)

- Bảng `ThongBao` (TB1) có ba nguồn ghi (`THONG_BAO.nguon`): nhắc buổi sáng (`ghiThongBao`,
  `apps/agent/agent/lib/thong-bao-ghi.ts`), tác nhân dựng (`ghiThongBaoTacNhan`, `thong-bao-tac-nhan.ts`), tín hiệu đổi
  chỗ (`apps/api/src/lo-trinh/tin-hieu-doi-cho.ts`). 26 loại (`LOAI_THONG_BAO`, `packages/validation/src/thong-bao.ts`).
- Đường DUY NHẤT CRM tự gửi tới một người qua Zalo hay Slack là nhắc buổi sáng: `chayNhac`
  (`apps/agent/agent/lib/nhac-ke-hoach.ts:217`) ghi thông báo TRƯỚC rồi mới chọn kênh (`kenhSeDungCua`,
  `packages/db/src/kenh-thong-bao.ts`) và gửi MỘT tin gộp mọi mục. Mọi tin Zalo khác là trả lời câu người gõ (bot,
  phiên Kara) — không phải thông báo.
- Thông báo của tác nhân dựng và tín hiệu đổi chỗ chỉ nằm trong chuông; không ra Zalo/Slack.
- Cài đặt riêng của người: `NotificationPreference.channel` (AUTO/ZALO/SLACK — một kênh mỗi người) và `dongTroLyOkr`.
  Màn: trang «Nhắc buổi sáng» (`apps/app/app/(app)/[slug]/reminders/page.tsx`) gồm khối Zalo, khối «Nhận nhắc việc
  qua», công tắc «Dòng Trợ lý OKR». `docs/connections.md` gọi chỗ này là «Thông báo của bạn».
- Không có khái niệm mức «Cần làm / Để biết» ở đâu trong mã.

## Lựa chọn

| # | Chọn | Căn cứ |
|---|---|---|
| L1 | Mức của mỗi loại khai MỘT lần trong bảng ở `@crm/validation/thong-bao`, cạnh `LOAI_THONG_BAO`, cùng mặc định kênh ngoài của loại; kiểu `Record<LoaiThongBao, …>` để thêm loại mà quên khai thì không biên dịch | AGENTS.md «Constants belong in one file per area» |
| L2 | **Cần làm** = thông báo chờ chính người nhận làm một việc (duyệt, cập nhật, trả lời, việc quá hạn/sắp hạn, đối soát lệch); **Để biết** = báo tin, không đòi việc gì | **Hỏi chủ kho** — Hỏi-1 (luật chia và bảng mức dưới) |
| L3 | Chuông luôn nhận mọi loại — không có công tắc tắt chuông | `pham-vi-vong-tin-hieu-1410.md` N4 «web luôn bật» |
| L4 | Mặc định kênh ngoài: mọi loại của nhắc buổi sáng **bật**, bốn loại sự kiện (tác nhân xong / cần trả lời / hỏng, tín hiệu đổi chỗ) **tắt** — ai chưa đổi gì nhận đúng như hôm nay | Cổng Đáng: «hành vi Zalo hiện có không đổi» |
| L5 | Cột kênh ngoài là MỘT cột mang tên kênh người đang dùng (Zalo hay Slack, do khối «Nhận nhắc việc qua» chọn), không phải hai cột Zalo và Slack | **Hỏi chủ kho** — Hỏi-2 |
| L6 | Nhắc buổi sáng vẫn gửi MỘT tin gộp; `chayNhac` bỏ khỏi tin các mục người đã tắt, thông báo của các mục ấy vẫn ghi; tắt hết thì không gửi tin, lượt đóng «đã tắt hết» | giữ nguyên byte tin cho người chưa đổi (L4); loại của nhắc sáng chỉ đi trong tin sáng — bật lại một loại thì sáng sau mới có, không gửi ngay |
| L7 | Thông báo sự kiện (hai nguồn còn lại, và mọi nguồn sau này) rẽ ra kênh ngoài qua MỘT điểm: nhịp mỗi phút của tác nhân quét thông báo chưa đẩy, của loại người đã bật, ghi sau lúc người bật, trong 30 phút gần nhất | pham-vi N3 «rẽ từ cùng bản ghi thông báo»: kênh đọc chính bản ghi chuông; API không gọi Zalo/Slack |
| L8 | Đẩy sự kiện ngay (trong một nhịp), không gom vào tin sáng hôm sau | «cần trả lời» chờ người, đợi tới sáng hôm sau là mất nghĩa |
| L9 | Mỗi thông báo đẩy tối đa một lần: giữ chỗ trước khi gửi (ghi lần thử), gửi hỏng thì ghi lỗi và thử lại ở nhịp sau, tối đa 3 lần; Zalo hỏng không đổi sang Slack | `docs/agent.md` «Zalo lỗi thì ném, không đổi sang Slack» |
| L10 | Câu tin sự kiện là câu tiếng Việt của chuông cho cùng thông báo + đường dẫn tới cùng chỗ; khuôn câu của bốn loại sự kiện dời về một nơi cả app và tác nhân đọc | ngôn ngữ người chọn chỉ nằm ở cookie trình duyệt, máy chủ không biết; tin nhắc sáng qua Zalo/Slack hôm nay cũng chỉ tiếng Việt |
| L11 | Bảng cài đặt đặt thành một mục trên trang «Nhắc buổi sáng», không mở trang mới; chuông có lối «Cài đặt thông báo» tới mục đó | `docs/connections.md:180` «Thông báo của bạn» là trang này; `docs/settings.md:45` cài đặt riêng ở menu người dùng |
| L12 | Thủ tục đọc/ghi cài đặt nằm ở router `thongBao` (phạm vi chung), ghi tự phục vụ; không qua router `zalo` | luật 19 của đợt: `thong-bao` là vùng của làn này, kênh Zalo/Slack là của làn Mac Studio |
| L13 | Lưu cài đặt thành hàng riêng mỗi (người, loại) chỉ khi khác mặc định, mang lúc đổi; không lưu hàng cho chuông | mặc định đổi được ở một chỗ (L1); «ghi sau lúc người bật» (L7) cần lúc đổi theo loại |

### Bảng mức (L2)

| Mức | Loại |
|---|---|
| Cần làm | okr-cap-nhat · okr-cho-duyet · okr-tra-lai · okr-hoi-y-gop · okr-kr-im · buoc-qua-han · buoc-sap-han · ke-hoach-im · moc-ngay · goi-y-ke-hoach · viec-qua-han · viec-sap-han · viec-cho-danh-gia · tai-lieu-cho-duyet · ai-doi-soat-lech · tac-nhan-can-tra-loi |
| Để biết | okr-duoc-giao · okr-nhac-ten · okr-ghi-nhan · okr-hoi-y-cong-bo · okr-theo-doi · okr-tom-tat · ai-tran · tac-nhan-xong · tac-nhan-hong · tin-hieu-doi-cho |

## Dữ liệu

```
model CaiDatThongBao {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  loai      String   // một giá trị của LOAI_THONG_BAO, đọc qua khuôn ở @crm/validation/thong-bao
  dayRa     Boolean  // đẩy qua kênh ngoài
  doiLuc    DateTime @updatedAt

  @@unique([userId, loai])
  @@map("caiDatThongBao")
}

ThongBao thêm: dayLan Int @default(0) · dayLuc DateTime? · dayKenh String? · dayLoi String?
```

Migration chỉ thêm bảng và cột (cột mới có mặc định hoặc cho phép rỗng). Hàng cài đặt mang loại không còn trong
`LOAI_THONG_BAO` thì bộ đọc bỏ qua và ghi một dòng nhật ký — không làm hỏng trang.

## Đường đẩy (agent)

1. **Nhắc buổi sáng** — trong `chayNhac`, sau `ghiThongBao` và `kenhSeDungCua`: lọc `viec` theo cài đặt kênh ngoài
   (`dayRaCua(userId)` — hàm đọc một lần, áp mặc định của bảng mức). Rỗng → đóng lượt «da-tat-het», không gửi. Còn mục
   → gửi đúng như nay với danh sách đã lọc. Payload ghi thêm `daGuiKhoa` (khoá thông báo của các mục đã gửi) cho lệnh
   đối chiếu.
2. **Sự kiện** — bước mới `dayThongBaoSuKien()` trong nhịp mỗi phút (`schedules/dispatch.ts`, cạnh
   `donThongBaoDinhKy`): chọn thông báo `nguon ≠ nhac-buoi-sang`, `dayLuc` rỗng hoặc có `dayLoi` với `dayLan < 3`,
   `taoLuc` trong 30 phút, loại người nhận đã bật và `taoLuc ≥ doiLuc` của cài đặt đó. Mỗi thông báo: giữ chỗ bằng
   một lệnh cập nhật có điều kiện (`dayLan` tăng, `dayLuc` đặt), chọn kênh bằng `kenhSeDungCua`, gửi câu tiếng Việt +
   đường dẫn. Không có kênh → ghi `dayKenh: null`, thôi. Gửi hỏng → `dayLoi`, nhịp sau thử lại.
3. Hàm gửi Zalo/Slack dùng lại `guiZalo` và `sendSlackMessage` hiện có; không đổi gì trong `apps/agent/agent/channels`.

## Máy chủ (api)

Router `thongBao` thêm `caiDat` (query: mọi loại theo mức, `dayRa` hiệu lực, có phải mặc định không, kênh đang dùng —
`zalo` | `slack` | `null` — kèm lý do khi `null`) và `luuCaiDat({ loai, dayRa })` (mutation, ghi hàng của người gọi;
trùng mặc định thì xoá hàng). Đầu vào parse bằng khuôn ở `@crm/validation/thong-bao`: loại lạ → BAD_REQUEST. Không có
thủ tục tắt chuông.

## Giao diện (app)

- Mục «Loại thông báo» trên trang «Nhắc buổi sáng», sau khối «Nhận nhắc việc qua». Hai `Card` — «Cần làm», «Để biết» —
  mỗi thẻ một `CardTitle` và một câu `CardDescription` nói mức ấy là gì.
- Trong thẻ: từ `md` là `SimpleTable` ba cột (Loại · Chuông · <tên kênh>); dưới `md` là danh sách `Item`, mỗi dòng
  tên loại + hai `Field orientation="horizontal"` với `Switch`.
- Cột Chuông: `Switch` bật và khoá; câu mô tả mục nói «Chuông luôn nhận mọi loại».
- Cột kênh: tên cột là kênh người đang dùng. Không có kênh → mọi công tắc cột này khoá, một dòng dưới tiêu đề mục nói
  vì sao và trỏ tới khối Zalo ở đầu trang.
- Công tắc lưu ngay; xong thì toast ngắn; hỏng thì toast và trả về giá trị cũ (`docs/settings.md` mục lưu, luật 1).
- Ô bật ra của chuông có nút biểu tượng «Cài đặt thông báo» ở đầu, tới `/[slug]/reminders#loai-thong-bao`.
- Tên loại vi/en thêm vào `apps/app/lib/messages/thong-bao.ts` (chỉ thêm dòng — luật 7 của đợt).

## Đường đo

Lệnh đối chiếu `bun run thong-bao:doi-chieu` của TB1 thêm một khối «Kênh ngoài» cho khoảng ngày: theo ngày, số mục nhắc
sáng đã gửi qua Zalo và qua Slack (từ `payload.daGuiKhoa`), số thông báo sự kiện đã đẩy (từ `dayLuc`, `dayKenh`), số có
thông báo tương ứng trong chuông, số lệch kèm mã; số người có cài đặt khác mặc định. Có lệch → mã thoát 1. Chạy trên
production ở ngày đo của Cổng Giá trị (hai tuần sau khi bật).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở chuông → bấm «Cài đặt thông báo» → tới mục «Loại thông báo» trên trang «Nhắc buổi sáng» → tắt
  «Mục tiêu được giao» ở cột Zalo → toast «Đã lưu» → sáng mai tin Zalo không còn dòng ấy, chuông vẫn có (điểm ra:
  cài đặt đã lưu).
- Biên: chưa nối kênh nào; Zalo chưa bật cho xưởng; người vai chỉ OKR (ít loại liên quan nhưng vẫn thấy đủ bảng);
  điện thoại 375; bật một loại sự kiện rồi có sự kiện ngay sau đó.
- Lỗi & quay lại: tải mục hỏng → `VungTaiLoi` trong mục, phần còn lại của trang vẫn dùng được; lưu hỏng → công tắc trở
  về giá trị cũ, toast nói chưa lưu được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Mục «Loại thông báo» (trang Nhắc buổi sáng) | Chọn loại nào được đẩy qua Zalo hay Slack | Chuông «Cài đặt thông báo», menu người dùng / ở lại trang |
| Ô bật ra của chuông | (có sẵn) thêm lối tới cài đặt | Đầu trang / mục «Loại thông báo» |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cai-dat-cho-tai | Mục loại thông báo | Hai thẻ khung xương | chờ |
| ST-cai-dat-mac-dinh | Mục loại thông báo | Hai thẻ; cột kênh mang tên «Zalo»; mục nhắc sáng bật, bốn loại sự kiện tắt | bật/tắt |
| ST-cai-dat-da-doi | Mục loại thông báo | Như trên, vài công tắc khác mặc định | bật/tắt |
| ST-cai-dat-khong-kenh | Mục loại thông báo | Cột kênh tên «Zalo hay Slack», mọi công tắc khoá; dòng nói chưa nối kênh nào, trỏ khối Zalo | nối Zalo |
| ST-cai-dat-luu-hong | Mục loại thông báo | Công tắc trở về cũ; toast «Chưa lưu được» | thử lại |
| ST-cai-dat-loi | Mục loại thông báo | `VungTaiLoi` trong mục | thử lại |
| ST-chuong-loi-vao-cai-dat | Chuông | Nút biểu tượng «Cài đặt thông báo» ở đầu ô bật ra | bấm |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bật/tắt lưu ngay; trong lúc lưu công tắc đó khoá; không có nút Lưu chung.
- Cột Chuông là công tắc bật và khoá, có tên đọc được «Chuông — luôn bật».
- Mỗi công tắc kênh có tên đọc được «<tên loại> qua <kênh>».
- Đổi kênh ở khối «Nhận nhắc việc qua» thì tên cột đổi theo, không tải lại trang.
- Điện thoại: mỗi loại là một dòng `Item`, hai công tắc xếp dọc, chạm ≥ 44px.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| Card, SimpleTable, Item, Field, Switch, Skeleton/KhungXuong, VungTaiLoi, toast | dùng | đã có ở `packages/ui` / app |
| Nút biểu tượng trong ô bật ra của chuông | dùng | `Button size="icon" variant="ghost"` + `Link`, như các nút đầu ô bật ra hiện có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-cài-đặt (ma trận loại × kênh)
Căn cứ: cài đặt thông báo theo loại × kênh là khuôn quen của các sản phẩm cùng loại — GitHub (Settings › Notifications:
mỗi loại chọn kênh), Linear (Settings › Notifications: mỗi loại × kênh). Một khuôn khả dĩ khác (danh sách loại, mỗi
dòng một ô chọn kênh) thua khi có hai cột cần thấy cùng lúc (chuông luôn bật bên cạnh kênh ngoài).
<!-- UX-SPEC-TEMPLATE>>> -->

## Quét không gian tiêu chí

Bản quét đầy đủ: `_acceptance/thong-bao-mot-nguon-nhieu-kenh/coverage-scan.md`.

## Rủi ro

- Lọc sai làm mất mục trong tin sáng của người chưa đổi gì → AC-2 so từng byte với bản chụp tin trước vòng
  (`apps/agent/test/fixtures/tin-nhac-truoc-tb1.json`).
- Đẩy sự kiện trùng khi hai nhịp chạy chồng → giữ chỗ bằng cập nhật có điều kiện; AC-5 chạy hai nhịp đồng thời.
- Sóng tin khi triển khai (thông báo cũ chưa từng đẩy) → cửa sổ 30 phút và điều kiện «ghi sau lúc bật» (AC-4).
- «Dòng Trợ lý OKR» và dòng «Tóm tắt OKR» của bảng cùng chạm một loại: công tắc cũ quyết có tính tóm tắt hay không
  (cả chuông), dòng mới chỉ quyết có đẩy ra kênh không. Gộp hai công tắc là việc sau (ghi ở Out of scope).
