# Cập nhật gần đây — thiết kế (VK12 `cap-nhat-gan-day`)

Hàng VK12 của `docs/plan/lo-trinh-okr.json` (nhóm okr, T2, đứng trên VK2 đã gộp), mã `B5c` của
`docs/plan/pham-vi-okr-vo-khu-1810.md`. Cổng Đáng ký `build` 19/10 ở thẻ mở đợt `vo-khu-muc-tieu`; chủ kho giao
MacBook Pro làm thay ngày 26/10 (crm-onehub#375). Bản mẫu: `/proto/cap-nhat-gan-day`.

## Ý định và vì sao

Câu giao: «Trưởng đơn vị mở Cập nhật gần đây trước buổi họp tuần, đọc mọi lần cập nhật của bộ OKR mình dẫn, mới nhất
trước, và trả lời ngay dưới từng lần».

Hôm nay một lần cập nhật KR chỉ đọc được trong Lịch sử của chi tiết từng KR, và bình luận thì nằm ở thẻ Trao đổi của
từng mục tiêu. Không có chỗ nào đọc chung mọi lần cập nhật của các bộ OKR mình dẫn. Trước buổi họp tuần, trưởng đơn
vị phải mở từng KR. Tability có «Recent updates»: một dòng tin lọc theo kế hoạch đang theo dõi.

## Mục tiêu

- Một trang «Cập nhật gần đây» ở đầu thanh bên khu Mục tiêu, ngay dưới «Của tôi» (`/okr/cap-nhat-gan-day`).
- Một dòng cho mỗi lần cập nhật KR của chu kỳ đang chọn, mới nhất trước, có phân trang.
- Lọc phạm vi bằng đúng ba chip của khu: Tất cả · Tôi dẫn · Đang theo dõi, ghi trên đường dẫn.
- Trả lời ngay dưới lần cập nhật mới nhất của mỗi KR. Lần trả lời là bình luận của mục tiêu, gắn KR, nên cũng hiện ở
  thẻ Trao đổi.
- Bấm một dòng thì mở chi tiết KR.

## Không làm

- Trả lời trên từng lần cập nhật cũ, và cảm xúc — hàng HT5 (cần khoá lần cập nhật cho bình luận, T3).
- Nhắc tên người trong lần trả lời — vẫn làm ở thẻ Trao đổi.
- Gom theo tuần, tìm kiếm, lọc theo một bộ hay một người cụ thể.
- Lần cập nhật của mục tiêu cá nhân, mục tiêu nháp hay đã bỏ.
- Sửa hay xoá một lần cập nhật.

## Điều làm vòng này hỏng dù chạy đúng

- Người xem thấy lần cập nhật của một OKR giới hạn mà họ không được xem, hay số đếm lộ ra nó.
- «Tôi dẫn» của một trưởng bộ phận kéo theo phòng ban con, hoặc ra bộ OneHub — trái `CONTEXT.md`.
- Trả lời ở dòng tin mà không thấy trong thẻ Trao đổi của mục tiêu: hai nơi, hai sự thật.
- Dòng tin chậm dần theo số lần cập nhật — một chu kỳ cả công ty có thể có hàng chục nghìn lần.

## Ràng buộc

- Trí khôn không nằm ở API; đây là lần đọc thuần (`docs/api.md`).
- Mọi lần đọc `okrCheckIn`, `okrComment`, `okrFollow` mang `dieuKienXemMucTieu` (`soi-ma.mjs --ca xem` bắt).
- Lọc, xếp, phân trang trong Prisma; số lần truy vấn cố định, không theo số đơn vị hay số lần cập nhật.
- Thời điểm của một lần cập nhật là `submittedAt` của phiên cập nhật (`docs/api.md`, «Weekly numbers…»).
- Không migration, không chạm `packages/db/prisma` (D5 lối a, chủ kho 24/10): T2.
- Thủ tục mới thuộc phạm vi `okr`: vai «chỉ OKR» đọc được, nên thêm vào tập của `apps/api/test/vai-chi-okr.spec.ts`.
- Dữ liệu mẫu vào qua đường ghi thật (CLAUDE.md «Lộ trình là việc dựng»).

## Cách làm

### Máy chủ

Thủ tục chỉ đọc mới `okr.capNhatGanDay` (`POST /okr/updates/list`) trong một dịch vụ riêng `OkrCapNhatGanDayService`
(như `OkrMoiKrService` của VK11), phần thuần trong `cap-nhat-gan-day.ts`, hợp đồng trong
`okr-cap-nhat-gan-day.contracts.ts`, hằng trong `OKR_XEM` (`okr-xem.config.ts`).

- Vào: `{ cycleId, phamVi: "tat-ca" | "toi-dan" | "theo-doi", trang }`. `PHAM_VI_BO` của
  `@crm/validation/okr-tham-so` là nguồn của ba giá trị.
- Tập gốc: mọi `OkrCheckIn` có KR thuộc mục tiêu `cong-bo`, cấp OneHub, bộ phận hay phòng ban, của `cycleId`, và qua
  `dieuKienXemMucTieu(nguCanhXem)` của người xem.
- Phạm vi theo bộ, cùng định nghĩa với `okr.danhSachBo` (`bo-okr.ts`, `khoaDonViDong`):
  - Tôi dẫn: mục tiêu cấp bộ phận có `divisionId` trong `q.truongBoPhan`, hoặc cấp phòng ban có `departmentId` trong
    `q.truongPhongBan`. Không kéo phòng ban con, không có bộ OneHub.
  - Đang theo dõi: mục tiêu thuộc một bộ mà người xem theo dõi ít nhất một mục tiêu của chu kỳ (đọc `okrFollow` qua
    `dieuKienXemMucTieu`, quy về khoá bộ, rồi dựng điều kiện `where` từ các khoá).
- Xếp: `session.submittedAt` giảm dần, rồi `createdAt`, rồi `id`. Trang cỡ `OKR_XEM.capNhatGanDay.coTrang` (20).
- Ra: `{ rows, total, facetCounts: { phamVi: [{ value, count }] } }`. Số của mỗi chip là `count` của tập gốc theo phạm
  vi đó; `total` bằng số của chip đang chọn.
- Mỗi dòng: `checkInId`, thời điểm, người cập nhật, chủ KR khi cập nhật thay (`onBehalf`), KR (id, tên, kiểu, đơn vị
  đo), mục tiêu (id, tên), bộ (khoá, tên), giá trị, mức tự tin, ghi chú, `moiNhat` (đây là lần mới nhất của KR), và
  khi `moiNhat` thì `traLoi`: bình luận của mục tiêu gắn đúng KR ấy có `createdAt` từ thời điểm của lần này trở đi, cũ
  trước, và `mentionNguoiCapNhat`: id người viết lần ấy, rỗng khi đó là chính người xem hay người ấy không còn là thành
  viên (Hỏi-2).
- Số truy vấn cố định: quyền (một), theo dõi (một), ba lần đếm, một trang, một lần tìm lần mới nhất của các KR trên
  trang, một lần đọc bình luận của các KR ấy, một lần đọc tên người.

Trả lời đi qua `okr.addComment` sẵn có với `{ objectiveId, keyResultId, body, mentionUserIds }` — không thêm đường
ghi. `mentionUserIds` là `[mentionNguoiCapNhat]` khi có (Hỏi-2, soạn theo khuyến nghị): người viết lần cập nhật nhận tin
«được nhắc tên» qua đường sẵn có của bản tin sáng; người trả lời không tự chọn nhắc tên. Lần trả lời vì vậy hiện ngay ở thẻ Trao đổi của mục tiêu, mang nhãn KR, và chịu mọi luật sẵn có (chu kỳ đã ẩn,
quyền xem, độ dài).

### Màn hình

- `tab-okr.ts`: nhóm đầu thanh bên thành `["cua-toi", "cap-nhat-gan-day"]`, `DUONG_MUC["cap-nhat-gan-day"] =
  "/okr/cap-nhat-gan-day"`; nhãn ở `okr-vo-khu` messages. Thanh bên giữ `kyOkr` như mọi mục.
- Trang `/okr/cap-nhat-gan-day`: `page.tsx` dựng tiêu đề và một câu mô tả; nội dung `PageShell width="page"` (một cột
  chữ, `docs/design.md`).
- Hàng công cụ: `ToggleGroup variant="outline" size="sm"` ba chip, `count` từ `facetCounts`, ghi `phamViBo` lên đường
  dẫn bằng `parseAsPhamViBo` của VK3 (mặc định «Tất cả» — Hỏi-1, soạn theo khuyến nghị). Trang hiện tại ghi ở tham số trang bằng `nuqs`.
- Dòng tin: `ItemGroup` các `Item variant="outline"`; ảnh người, «<người> [thay cho <chủ KR>] · <thời điểm>», tên KR
  (nút mở chi tiết KR), «<mục tiêu> · <bộ>», giá trị theo kiểu KR (`giaTri` như Lịch sử KR), `ConfidenceIndicator`, ghi
  chú. Lần mới nhất: các lần trả lời rồi nút «Trả lời» mở ô `InputGroup` (Huỷ · Gửi). Lần cũ: «Có lần cập nhật mới
  hơn — trả lời ở đó.»
- Bấm tên KR hay vùng trống của dòng: `useMoNganKr(keyResultId)` — chi tiết KR một chỗ (VK7). Bấm trong ô trả lời
  không mở.
- Chân: `TablePagination` của `packages/ui`, số «1–20 trong số N».
- Ma trận lối mở KR (`_acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs`) thêm ô `cap-nhat-gan-day` (D8), kèm một dòng
  sổ `fix` ở hồ sơ `ngan-kr-mot-cho`.
- Thước thanh bên của `vo-khu-muc-tieu` (`rang/do-man-lib.mjs`, `DO.soMuc`) từ 6 lên 7 (D7), kèm dòng sổ `fix` ở
  hồ sơ `vo-khu-muc-tieu`.

### Dữ liệu mẫu

- Ca mẫu cho bài kiểm API `apps/api/scripts/okr-mau/ca-cap-nhat-gan-day.ts` (khuôn `ca-moi-kr.ts`): cây B1 (P1, P2),
  B2 (P3), OneHub; người A trưởng P1, người B trưởng B1, người C thành viên; các lần cập nhật ở mốc thời gian ghim,
  một lần cập nhật thay, một OKR giới hạn, một mục tiêu cá nhân, một nháp, một ở chu kỳ khác; theo dõi và trả lời —
  tất cả qua `OkrCapNhatService`, `OkrTraoDoiService` với đồng hồ ghim.
- Bộ OKR mẫu (`bun run okr:mau`) thêm theo dõi và vài lần trả lời qua `OkrTraoDoiService` (khuôn `nap-hoi-y.ts`), để
  «Đang theo dõi» và lần trả lời có mà xem trên phiên đo và bản demo.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên › Cập nhật gần đây → chip «Tôi dẫn» → đọc từ trên xuống → «Trả lời» dưới lần mới nhất → Gửi →
  lần trả lời hiện ngay dưới dòng (điểm ra: bấm tên KR mở chi tiết KR; đóng về đúng trang và chip).
- Biên: chu kỳ chưa có lần cập nhật nào; «Đang theo dõi» rỗng vì chưa theo dõi mục tiêu nào; người không dẫn đơn vị
  nào bấm «Tôi dẫn» (chip đếm 0, câu rỗng); lần cập nhật cũ không có ô trả lời; người xem hẹp chỉ thấy phần mình được
  xem; nhiều trang.
- Lỗi & quay lại: tải lỗi → `VungTaiLoi` có Thử lại, tiêu đề còn; gửi trả lời hỏng → câu lỗi ngay dưới ô, chữ đã gõ
  còn nguyên, Gửi lại được; chu kỳ đã ẩn → câu của máy chủ «chu kỳ đã ẩn» dưới ô.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cập nhật gần đây (`/okr/cap-nhat-gan-day`) | đọc mọi lần cập nhật của chu kỳ, mới nhất trước, và trả lời | thanh bên khu / chi tiết KR |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cng-cho | Cập nhật gần đây | tiêu đề, mô tả, khung xương bốn dòng tin | chờ |
| ST-cng-loi | Cập nhật gần đây | `VungTaiLoi` «Chưa tải được các lần cập nhật» | Thử lại |
| ST-cng-chuachuky | Cập nhật gần đây | `ChuaChuKy` như các màn khác của khu | tạo / chọn chu kỳ |
| ST-cng-rong | Cập nhật gần đây | `Empty` «Chu kỳ này chưa có lần cập nhật nào» | chờ người cập nhật |
| ST-cng-rongloc | Cập nhật gần đây | `Empty` «Chưa có lần cập nhật nào ở «<chip>»» + «Xem tất cả» | về Tất cả |
| ST-cng-codulieu | Cập nhật gần đây | hàng chip, dòng tin, chân phân trang | lọc, trả lời, mở KR, sang trang |
| ST-cng-traloi | Cập nhật gần đây | ô trả lời mở dưới lần mới nhất (Huỷ · Gửi) | gửi / huỷ |
| ST-cng-traloiloi | Cập nhật gần đây | câu lỗi dưới ô, chữ đã gõ còn | sửa, gửi lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- `phamViBo` và trang ở đường dẫn (`nuqs`); đổi chip về trang 1; đổi chu kỳ ở đầu thanh bên về trang 1, giữ chip.
- Thời điểm theo `Intl` (giờ tương đối trong ngày, ngày giờ ngắn ngoài ngày đó), không chuỗi viết tay.
- Ô trả lời: `aria-label` gọi tên người cập nhật; Gửi tắt khi rỗng hay đang gửi; tối đa như bình luận
  (`BINH_LUAN_TOI_DA`); Esc hay Huỷ đóng ô, chữ chưa gửi thì hỏi lại qua bộ giữ thay đổi.
- Dưới `md`: hàng chip cuộn ngang trong chính nó; thanh bên khu thành hàng cuộn; trang không tràn ngang.
- Tên người, KR, mục tiêu, bộ, ghi chú, lần trả lời là dữ liệu người nhập: `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `AreaSidebarItem` | dùng | mục thứ bảy của thanh bên khu |
| `ToggleGroup` | dùng | chip phạm vi, như Bộ OKR (VK3) |
| `Item`, `ItemGroup` | ghép | danh sách không bảng theo `docs/design.md` |
| `PersonAvatar`, `ConfidenceIndicator` | dùng | người và mức tự tin như Lịch sử KR |
| `InputGroup` | dùng | ô trả lời có nút trong khung |
| `TablePagination` | dùng | chân của bề mặt |
| `Empty`, `VungTaiLoi`, `Skeleton` | dùng | trạng thái theo «Nếp màn trong app» |
| chi tiết KR (`useMoNganKr`) | dùng | một ngăn cho mọi chỗ bấm KR (VK7) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — đọc tuần tự từ mới tới cũ rồi trả lời tại chỗ; bản mẫu `ManCapNhat` của
`vo-khu-muc-tieu` (2790552ac) và «Recent updates» của Tability đều là một cột dòng tin.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đường đo

- Một dòng cho mọi lần cập nhật của chu kỳ: bài kiểm API đối chiếu tập `checkInId` của mọi trang với tập viết trước
  của ca mẫu; bàn đo màn đối chiếu số dòng đếm trên màn với `total` của API trên phiên đo.
- Lượt mở trước buổi họp tuần (Cổng Giá trị, sau khi bật): mỗi lần gọi `okr.capNhatGanDay` là một dòng `tRPC` trong
  nhật ký API mang người và vai (`LoggingMiddleware`); đếm người dẫn đơn vị mở trang trong 24 giờ trước buổi họp.

## Để lại cho người dựng

- Tên hàm, tên tệp chữ, cách tách component trong thư mục trang.
- Cách lấy «lần mới nhất của KR» trong một truy vấn (`distinct` theo KR hay nhóm theo KR).
- Câu chữ cuối của tiêu đề, mô tả, câu rỗng — theo `CONTEXT.md` và luật nhãn của `docs/design.md`.
