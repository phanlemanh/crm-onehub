# Hộp thông báo trên web (TB1) — thiết kế

Ngày 2026-10-14 · hồ sơ `_acceptance/hop-thong-bao-tren-web/` · hàng TB1 của `docs/plan/lo-trinh-okr.json` · Cổng Đáng
`build`, Lối 1 (chủ kho 02:34Z).

## Một câu

Mỗi sáng, cùng lượt nhắc buổi sáng, CRM ghi mỗi mục nhắc của mỗi người thành một **thông báo** — kể cả người chưa nối
Zalo hay Slack. Chuông trên đầu trang mang số chưa đọc; bấm một thông báo là tới đúng chỗ cần làm và thông báo thành
đã đọc. Zalo và Slack không đổi gì ở vòng này.

## Hiện trạng (đo 14/10 trên `762acca38`)

- Một nguồn «điều cần báo»: `viecCanNhac` (`packages/db/src/onboarding-nhac.ts:478`) gom 21 loại mục (`THU_TU_NHAC`)
  từ onboarding, Việc, OKR, tài liệu, tóm tắt OKR, AI.
- `lenLichNhac` (`apps/agent/agent/lib/nhac-ke-hoach.ts:113`) tạo một hàng `AgentTask` `nhac-ke-hoach` mỗi người mỗi
  ngày cho MỌI người có mục, không xét kênh. `chayNhac` (`:209`) tính lại mục lúc gửi, rồi chọn kênh; người không có
  kênh đóng lượt `khong-khop`/`khong-slack` ở `:229` — mục bị bỏ.
- Đường dẫn mỗi mục có sẵn ở `duongMo` (`:160`): Việc và kế hoạch tới đúng bản ghi; OKR tới mục tiêu; tài liệu chờ
  duyệt, cập nhật tuần, hỏi ý, tóm tắt, AI tới trang đã lọc — các loại này là mục gộp (số tài liệu chờ, lượt cập nhật
  của cả tuần), nên trang đã lọc chính là chỗ cần làm.
- Đầu trang có mẫu nút đếm + ô bật ra + hỏi lại định kỳ: `apps/app/components/enrichment-queue.tsx`.

## Lựa chọn

| # | Chọn | Căn cứ |
|---|---|---|
| L1 | Nguồn duy nhất của vòng là lượt nhắc buổi sáng; ghi trong `chayNhac` **trước** khi chọn kênh | Cổng Đáng Lối 1; chỗ chọn kênh là chỗ người không kênh bị bỏ |
| L2 | Một bảng `ThongBao` (một hàng một thông báo), một khuôn nội dung ở `packages/validation/src/thong-bao.ts` | AGENTS.md «parse at the boundary»; TB2 rẽ Zalo/Slack từ cùng bảng |
| L3 | Nội dung lưu là mục nhắc nguyên khuôn (mã, loại, tham số), không lưu chữ; app dựng chữ theo ngôn ngữ người xem | App song ngữ; agent.md: payload chỉ mang mã và loại |
| L4 | Đường dẫn lưu là đường trong app không mang slug, dựng bởi CÙNG hàm với tin Zalo (tách phần đường của `duongMo` thành hàm thuần dùng chung) | «tới đúng chỗ» một nguồn; Zalo giữ nguyên byte |
| L5 | Số trên chuông = số thông báo chưa đọc; mở chuông KHÔNG đổi số | câu giao «biết số chưa đọc»; HubSpot bị than vì xoá số khi mới mở |
| L6 | Đã đọc khi bấm thông báo, hoặc «Đánh dấu tất cả đã đọc»; ghi riêng lúc bấm mở (đường đo) | ngưỡng «đã bấm mở» phải tách khỏi «đánh dấu tất cả» |
| L7 | Cập nhật bằng hỏi lại định kỳ (60 giây) + khi quay lại thẻ | app không có websocket; docs/api.md «background writes need refetchInterval» |
| L8 | Thủ tục ở router `thongBao` phạm vi chung (`PhamViChungMiddleware`), ghi tự phục vụ | mọi vai kể cả chỉ-OKR có nhắc; docs/api.md bảng phạm vi |
| L9 | Mục lặp: một thông báo cho mỗi (người, mục) còn nằm liên tục trong danh sách nhắc; mục rời rồi quay lại thì ghi mới | **Hỏi chủ kho** — Hỏi-2 |
| L10 | Vòng đời: không xoá, không lưu trữ; máy tự dọn thông báo quá 90 ngày; danh sách hiện mọi thông báo còn giữ, lọc «Chưa đọc» | **Hỏi chủ kho** — Hỏi-1 (ba câu của `docs/vong-doi.md` là phán xét người) |

## Dữ liệu

```
model ThongBao {
  id          String    @id @default(cuid())
  nguoiNhanId String
  nguoiNhan   User      @relation("ThongBaoNguoiNhan", fields: [nguoiNhanId], references: [id], onDelete: Cascade)
  nguon       String    // "nhac-buoi-sang" — khuôn ở @crm/validation/thong-bao
  khoa        String    // mã mục nhắc (maViec), dùng để gộp mục lặp
  noiDung     Json      // mục nhắc nguyên khuôn, đọc qua parseNoiDungThongBao
  duongDan    String    // đường trong app, không slug
  taoLuc      DateTime  @default(now())
  ngayDau     String    // ngày VN thông báo được tạo (YYYY-MM-DD)
  thayNgay    String    // ngày VN gần nhất mục còn trong danh sách nhắc
  docLuc      DateTime?
  moLuc       DateTime?

  @@unique([nguoiNhanId, khoa, ngayDau])   // chạy lại cùng ngày không nhân đôi
  @@index([nguoiNhanId, docLuc])
  @@index([nguoiNhanId, taoLuc])
  @@index([taoLuc])
  @@map("thongBao")
}
```

Migration chỉ thêm bảng. Người bị xoá → thông báo của họ đi theo (`Cascade`, như con của bản ghi).

## Đường ghi (agent)

Trong `chayNhac`, ngay sau khi có `viec` (đã `conMaDuoc`) và TRƯỚC `kenhSeDungCua`:

1. Ghi `payload.mucTinh = { ngay, khoa: [...] }` vào hàng AgentTask — danh sách mọi mục đã tính, ghi TRƯỚC và độc
   lập với bước 2. Đây là mẫu số của lệnh đối chiếu; lệnh không bao giờ lấy mẫu số từ bảng `ThongBao`.
2. `ghiThongBao(db, userId, viec, ngayVN)` (`apps/agent/agent/lib/thong-bao-ghi.ts`): một giao dịch; với mỗi mục, tìm
   thông báo cùng `(người, khoa)` có `thayNgay` = ngày nhắc liền trước hay chính hôm nay → cập nhật `thayNgay` và
   `noiDung` theo sáng mới nhất; không có → tạo mới. Chạy lại trong ngày (lượt bị thử lại) không đổi gì. `khoa` của
   mỗi loại chỉ mang mã bản ghi (hay mã kỳ/tuần với mục gộp), không mang số đếm — mục gộp như «n tài liệu chờ duyệt»
   giữ một thông báo và cập nhật số.
3. Ghi thông báo hỏng → lỗi được ghi vào nhật ký và vào `payload.thongBaoLoi`, lượt Zalo/Slack vẫn chạy như cũ; gửi
   Zalo/Slack hỏng không xoá thông báo đã ghi.

Thứ tự thi công bắt buộc: commit đầu tiên của S3 là bản chụp tin Zalo/Slack của mọi loại mục sinh từ mã chưa sửa
(`apps/agent/test/fixtures/tin-nhac-truoc-tb1.json`), TRƯỚC mọi commit sửa `nhac-ke-hoach.ts` — E3 kiểm thứ tự đó bằng git.

## Máy chủ (api)

Router `thongBao` (module mới `apps/api/src/thong-bao/`): `chuong` (số chưa đọc + 20 thông báo mới nhất), `danhSach`
(phân trang theo con trỏ, `chiChuaDoc`), `moMot(id)` (đặt `docLuc`, `moLuc`; của người khác → NOT_FOUND),
`docHet()` (đặt `docLuc` cho mọi chưa đọc của người gọi). Mọi truy vấn lọc `nguoiNhanId = người gọi`. Lịch dọn: hàng
quá 90 ngày (theo `taoLuc`) mà mục đã thôi nằm liên tục trong danh sách nhắc (`thayNgay` trước hôm qua) xoá bởi bước dọn mới trong nhịp chạy mỗi phút của agent (`schedules/dispatch.ts`, cạnh `kiemBot` đang dọn bảng Zalo) — tác nhân không có lượt dọn định kỳ nào sẵn để nối vào (đo ở S2).

## Giao diện (app)

- `ChuongThongBao` trên đầu trang, trước nút «Gửi tín hiệu», mọi vai. Nút viền cỡ nhỏ như «Hàng làm giàu»: biểu tượng
  chuông + số chưa đọc bên cạnh (0 → chỉ biểu tượng; >99 → «99+»), `aria-label` mang số («Thông báo, 3 chưa đọc»).
- Bấm → ô bật ra ở mọi khổ (khuôn `PopoverContent size="panel"`, tự co theo màn ở 375): tiêu đề «Thông báo» + nút «Đánh dấu tất cả đã đọc»;
  hai nhóm «Hôm nay» / «Trước đó» theo ngày giờ Việt Nam; mỗi dòng là một `Link` (chấm chưa đọc, câu theo loại, giờ);
  chân «Xem tất cả» → `/[slug]/thong-bao`.
- Trang `/[slug]/thong-bao`: `PageShell` (tiêu đề «Thông báo», một câu mô tả), lọc `Tất cả | Chưa đọc` bằng
  `ToggleGroup` ghi lên URL qua `nuqs`, danh sách `Item` chia theo ngày, «Xem thêm» nạp trang sau.
- Câu theo loại sống ở `apps/app/lib/messages/thong-bao.ts` (vi/en), một hàm dựng câu từ khuôn nội dung.

## Đường đo

Lệnh `bun run thong-bao:doi-chieu -- --tu <ngày> --den <ngày>` (chỉ đọc) in theo ngày: số người có lượt nhắc, số có/không
kênh, số mục đã tính (`payload.mucTinh`), số mục có thông báo, số mục mất (phải 0) kèm mã — lượt
không có `payload.mucTinh` tính cả lượt là mất; và trong khoảng: số người có
thông báo, số người đã bấm mở ít nhất một (`moLuc`). Chạy trên production ở ngày đo của Cổng Giá trị.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thấy số cạnh chuông → bấm chuông → đọc danh sách «Hôm nay» → bấm một dòng → tới bản ghi hay trang
  đã lọc, dòng thành đã đọc, số giảm một (điểm ra: chỗ cần làm).
- Biên: không có thông báo nào; hơn 99 chưa đọc; thông báo dẫn tới bản ghi đã xoá hay không còn quyền xem; người vai
  chỉ-OKR; điện thoại 375.
- Lỗi & quay lại: tải chuông hỏng → chuông vẫn bấm được, ô bật ra nói không tải được và có nút thử lại; «Đánh dấu tất
  cả» hỏng → số giữ nguyên, toast nói chưa đánh dấu được; mở bản ghi không còn → ngăn bản ghi nói lý do như hiện nay.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Chuông (ô bật ra) | Thấy điều mới và đi tới chỗ cần làm | Mọi màn / bản ghi, trang đã lọc, trang Thông báo |
| Trang Thông báo | Xem lại mọi thông báo còn giữ | Chân ô bật ra «Xem tất cả» / bản ghi, trang đã lọc |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-chuong-cho-tai | Chuông | Nút chuông không số; ô bật ra hiện khung xương ba dòng | chờ |
| ST-chuong-rong | Chuông | «Chưa có thông báo nào. CRM báo ở đây mỗi sáng khi có việc cần bạn.» | đóng |
| ST-chuong-co-chua-doc | Chuông | Số cạnh chuông; dòng chưa đọc có chấm | bấm một dòng |
| ST-chuong-99 | Chuông | Số «99+» cạnh chuông | bấm |
| ST-chuong-loi | Chuông | «Không tải được thông báo.» + Thử lại | thử lại |
| ST-chuong-het-chua-doc | Chuông | Không số; nút «Đánh dấu tất cả đã đọc» khoá | bấm dòng cũ hoặc «Xem tất cả» |
| ST-trang-cho-tai | Trang Thông báo | Tiêu đề + khung xương dòng | chờ |
| ST-trang-rong | Trang Thông báo | Câu rỗng như chuông | quay lại |
| ST-trang-loc-chua-doc-rong | Trang Thông báo | «Bạn đã đọc hết.» + nút «Xem tất cả» | bỏ lọc |
| ST-trang-co | Trang Thông báo | Nhóm theo ngày; «Xem thêm» khi còn trang sau | bấm dòng, xem thêm |
| ST-trang-loi | Trang Thông báo | `VungTaiLoi` | thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bấm dòng: đánh dấu đã đọc trước, rồi chuyển trang; Cmd/Ctrl+bấm mở thẻ mới vẫn đánh dấu.
- Số chưa đọc cập nhật mỗi 60 giây và khi quay lại thẻ; đổi số được đọc lên bằng vùng `aria-live="polite"`.
- «Hôm nay» là ngày giờ Việt Nam của `taoLuc`; giờ hiển thị theo ngôn ngữ đã chọn.
- Điện thoại: ô bật ra co theo bề rộng màn, dòng cao ≥ 44px.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| Popover (`size="panel"`), Button, Item, ToggleGroup, PageShell, Skeleton, VungTaiLoi, Empty | dùng | đã có ở `packages/ui` / app |
| StatusIndicator (chấm chưa đọc) | dùng | bảng «Dấu hiệu vẽ tay» cấm chấm tự vẽ |
| Nút đếm trên đầu trang | ghép | cùng khuôn nút «Hàng làm giàu» (`enrichment-queue.tsx`): nút viền + chữ số, không mảnh mới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: chuông là danh sách, chi tiết là chính bản ghi đích; hai khuôn khả dĩ (danh-sách-chi-tiết, bảng-điều-khiển) —
tra Mobbin ở S1-D luồng «notification center» web (Linear, GitHub, HubSpot) và ghi lại đã rút gì trong `design-pass.md`.
<!-- UX-SPEC-TEMPLATE>>> -->

## Quét không gian tiêu chí

Bản quét đầy đủ: `_acceptance/hop-thong-bao-tren-web/coverage-scan.md`.

## Rủi ro

- Chuông thành rác nếu luật gộp sai (Hỏi-2) — đo bằng số thông báo mới mỗi người mỗi ngày trong lệnh đối chiếu.
- Lượt nhắc một ngày không chạy (tác nhân tắt) làm đứt «liên tục» → mục còn mở được ghi lại một lần. Chấp nhận: lặp một dòng tốt hơn mất một dòng.
- Bảng phình: ước ≤ 30 người × ≤ 10 mục mới/ngày × 90 ngày ≈ 27.000 hàng — nhỏ.
- Lượt nhắc dài hơn một giao dịch — ghi thông báo trong một giao dịch theo người, không theo cả xưởng.
