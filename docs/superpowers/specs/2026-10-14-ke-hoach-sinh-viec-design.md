# Kế hoạch sinh việc — thiết kế (DA3)

Hồ sơ: `_acceptance/ke-hoach-sinh-viec/` · hàng DA3 của `docs/plan/lo-trinh-viec-du-an.json` · Cổng Đáng ký 14/10 (manh).
Đọc mã tại `origin/onehub` c4b46acd6, sau khi DA1 (`viec-chung`, #386) đã gộp.

## 1. Vấn đề

Hôm nay, tạo kế hoạch 30 ngày từ khuôn sinh ra các bước. Mọi bước để trống người làm (`onboarding.service.ts:413`). Bước không phải Việc: nó không có «Chưa làm · Đang làm · Chờ đánh giá», không hiện ở Việc của tôi, và không vào được Kanban (DA2) hay Gantt (DA4).

Deal chuyển sang giai đoạn thắng thì không có gì xảy ra (`deals.service.ts:638`). Người phụ trách deal phải tự nhớ mà mở kế hoạch.

Ngưỡng đã ký (`opportunity.md`):
- **(a)** ≥ 70 % việc sinh từ khuôn được người làm chuyển khỏi «Chưa làm» trước hoặc đúng ngày hạn.
- **(b)** Mọi deal thắng của công ty chưa có kế hoạch mở đều có gợi ý, và ≥ 50 % gợi ý được xử lý trong 3 ngày.

## 2. Hướng đã chọn (nháp theo khuyến nghị — Hỏi-1 ở Cổng Phạm vi)

**Bước là bản chiếu của Việc.** Mỗi bước sinh từ khuôn, và mỗi bước thêm tay sau DA3, mang đúng một Việc qua `OnboardingStep.viecId` (duy nhất). Từ đó:

- **Việc là nguồn sự thật** cho người làm, hạn, tiêu đề và trạng thái xong.
- **Mọi lệnh ghi lên một bước đã nối đi qua Việc** — `assignStep`, `setStepDone`, `rescheduleStep`, `removeStep` và «xong n» của bước. Ngược lại, mọi lệnh ghi lên Việc đã nối gọi cùng một hàm `chieuLenBuoc(tx, viecId)` trong cùng giao dịch, và hàm này chép bốn cột của bước:

  | Cột của bước | Lấy từ Việc |
  |---|---|
  | `assigneeId` | `nguoiThucHienId` |
  | `dueAt` | `hanNgay` |
  | `label` | `tieuDe` |
  | `completedAt` | `khepLuc` khi trạng thái là Xong, ngoài ra để trống |

- **Sáu nơi đang đọc bước không đổi**: danh mục «Bước x/y» và cột tắc, chỉ số KR «bước đúng hạn» (`okr-chi-so.ts`), nhắc «kế hoạch im», Tổng quan, kiểm xoá phòng ban, chuyển việc. Hồ sơ đã ký của các bên đọc đó không phải đo lại hành vi.
- **Kế hoạch tạo trước DA3 giữ nguyên.** Bước của chúng không có Việc và chạy y như cũ. Chép bước cũ sang Việc là việc của một hàng khác, cần cổng riêng như DA1b.

**Đóng kế hoạch khi còn bước dở (Hỏi-3).** Lộ trình đã bác việc tự đóng hay xoá việc khi đóng bản ghi cha, và ghi «hỏi người dùng thay vì tự làm» (`da_bac` x4). Vì vậy hộp đóng kế hoạch hỏi người. Máy khuyên đánh dấu sẵn «Huỷ N việc còn mở», vì đóng kế hoạch nghĩa là đợt onboard đã kết thúc. Lối khác là để trống ô: Việc giữ nguyên và vẫn nhắc mỗi sáng cho tới khi người làm tự khép.

**Lối khác (A) — Việc thay bước cho kế hoạch mới.** Kế hoạch mới không có bước nữa, chỉ có Việc gắn kế hoạch kèm phòng ban. Lối này gỡ hẳn «loại việc thứ hai» cho kế hoạch mới.
- Giá: viết lại sáu bên đọc bước để đọc gộp cả bước lẫn Việc, và ghim lại các hồ sơ đã ký của chúng: `quan-ly-danh-muc-30-ngay`, `ke-hoach-la-mot-ban-ghi`, `may-nhac-truoc-nguoi`, chỉ số KR…
- Ước khoảng gấp đôi khối S3, và DA4 lùi theo.

Vì sao khuyên B: DA3 là đường găng tới Gantt. B gom «một nguồn sự thật» vào một hàm, trong khi A trải nó ra sáu bên đọc. Hàng chép bước cũ sang Việc về sau là chỗ gỡ hẳn bảng bước. Khi đó mọi bước mới đã có Việc, nên việc chép chỉ còn kế hoạch cũ.

## 3. Tạo kế hoạch từ khuôn

`createFromTemplate` nhận thêm `nguoiTheoPhongBan: { departmentId, userId }[]`.
- Ô tạo kế hoạch (`tao-ke-hoach.tsx`) hiện một hàng cho mỗi phòng ban có trong khuôn. Mỗi hàng có một ô chọn người, điền sẵn trưởng phòng (`Department.headUserId`). Phòng ban không có trưởng phòng, hoặc trưởng phòng mang vai «chỉ OKR», thì điền sẵn người cầm trịch.
- Ô chọn người dùng đúng danh sách `nguoiNhanViec`, tức đã loại vai «chỉ OKR». Máy chủ vẫn kiểm lại bằng `kiemNguoiNhanViec`. Người mang vai «chỉ OKR» bị từ chối 400 kèm tên phòng ban, và không ghi gì cả.
- Trong cùng một giao dịch, mỗi bước của khuôn sinh ra một `OnboardingStep` và một `Viec`:
  - Người giao là người tạo kế hoạch; người thực hiện là người đã chọn cho phòng ban.
  - Hạn = `startedAt + offsetDays`, quy theo ngày giờ Việt Nam như `han-viec-theo-ngay`.
  - Việc gắn kế hoạch qua `ViecGan.planId`.
  - Ghi vết «tao» với nguồn `khuon`.
- Bỏ trống mảng `nguoiTheoPhongBan` thì máy chủ tự điền mặc định như trên. Bên gọi cũ (REST `POST /onboarding/plans`, Tác nhân) vẫn chạy được, và kết quả không bao giờ còn bước vô chủ.

## 4. Thêm bước tay (nối E6 `dieu-phoi-va`)

`addStep` sau DA3 luôn sinh Việc kèm bước. Người làm là `assigneeId` nếu có truyền, nếu không thì theo luật mặc định của mục 3. Hai AC-4/AC-5 của E6 (kế hoạch rỗng thêm được bước, «Thêm bước ở bộ phận khác») giữ nguyên hành vi.

## 5. Các lệnh trên bước đã nối

| Lệnh | Đi qua |
|---|---|
| `assignStep` | `doiNguoiThucHien` |
| `setStepDone(done)` | `doiTrangThai` sang Xong, hoặc từ Xong về «Đang làm» khi bỏ đánh dấu |
| `rescheduleStep` | `suaViec` (hạn) |
| `removeStep` | chuyển Việc sang Huỷ, gỡ nối, rồi xoá bước — Việc còn lại kèm lịch sử |
| «xong n» trỏ bước (`datBuocXong`) | `doiTrangThai`, nguồn `zalo`/`slack` |
| `transferWork` (chuyển việc khi nghỉ) | chuyển Việc bằng `chuyenViecTrongGiaoDich` như DA1, rồi `chieuLenBuoc`; không ghi thẳng `assigneeId` của bước đã nối |
| `closePlan` khi còn bước dở (Hỏi-3) | hộp đóng hỏi «Huỷ N việc còn mở của kế hoạch?», đánh dấu sẵn: chọn huỷ → các Việc đó sang Huỷ bằng đường hệ thống (nguồn `dong-ke-hoach`, được phép dù Huỷ bị chặn ở người dùng) rồi chiếu; bỏ chọn → Việc giữ nguyên và còn nhắc |
| `reopenPlan` | không hồi Việc đã Huỷ lúc đóng — người mở lại thì thêm bước mới |

Phía Việc, ba thao tác bị chặn trên Việc đã nối (400 kèm lý do «gỡ bước ở kế hoạch»): chuyển sang Huỷ, xoá Việc, và gỡ gắn kế hoạch. Nếu không chặn, bước sẽ mồ côi hoặc «Bước x/y» kẹt vĩnh viễn.

Quyền đổi trạng thái theo đồ thị `DO_THI` của Việc. Nhờ vậy, người được giao bước đóng được bước của mình — đúng mẫu «người được giao luôn đóng được việc của mình».

## 6. Nhắc buổi sáng

Bước đã nối không phát `buoc-qua-han`/`buoc-sap-han` nữa: Việc của nó đã phát `viec-qua-han`/`viec-sap-han` cho cùng một người, nên phát cả hai là nhắc trùng. Bước chưa nối (kế hoạch cũ) vẫn nhắc như cũ. `ke-hoach-im` và `moc-ngay` không đổi.

## 7. Gợi ý mở kế hoạch khi deal thắng — TÁCH sang DA3b

> Mục này không thuộc hợp đồng `ke-hoach-sinh-viec`. Hợp đồng nháp 15 tiêu chí rơi nhóm «phải tách» của thẻ Cổng Phạm vi, nên vế gợi ý (ngưỡng (b) và câu hỏi nơi hiện gợi ý) dời sang hàng DA3b, hồ sơ `goi-y-mo-ke-hoach` (sổ d-20261014T061219Z-15). Thiết kế dưới đây giữ làm đầu vào của vòng đó; riêng việc `createFromTemplate` đóng gợi ý đang chờ sẽ làm ở DA3b.

**Bảng mới `GoiYKeHoach`:**
- Trường: `id`, `dealId`, `chuyenLuc`, `companyId`, `nguoiNhanId` (người phụ trách deal lúc sinh), `trangThai` (`CHO | DA_MO | BO_QUA`), `sinhLuc`, `xuLyLuc?`, `xuLyBoiId?`, `planId?`.

**Luật tất định, ở máy chủ, trong cùng giao dịch:**
- Luật sống ở một hàm `sinhGoiYKeHoach(tx, { dealId, now })` trong `packages/db`.
- Hàm được gọi ở `chuyenGiaiDoanTrongTx`, nhánh «chưa đóng → đóng» và `laChotDuoc(den.kind)`, nên phủ cả `setStage`, `bulkSetStage` và lưu trữ giai đoạn. Hàm cũng được gọi ở `DealsService.create` khi deal tạo thẳng ở giai đoạn thắng.
- Sinh gợi ý ⟺ lần chuyển này đi từ một giai đoạn **không phải thắng** (mở hay thua) sang một giai đoạn **thắng**, công ty của deal không có kế hoạch mở (`closedAt` trống), và deal không có gợi ý nào đang «chờ».
- Ma trận viết trước, theo loại giai đoạn đi × đến:

  | Đi \ đến | mở | thắng | thua |
  |---|---|---|---|
  | mở | không | **sinh** | không |
  | thắng (khác cột) | không | không (vẫn là một lần thắng) | không |
  | thua | không | **sinh** | không |

- Đơn vị là **lần chuyển sang thắng**, không phải deal. Câu ngưỡng đã ký nói «mọi deal chuyển sang giai đoạn thắng … đều sinh một gợi ý». Vì vậy deal thắng, gợi ý bị bỏ qua, mở lại rồi thắng lần nữa thì sinh gợi ý mới. Chỉ khi gợi ý cũ còn «chờ» thì không sinh thêm.
- Trường thêm: `chuyenLuc` — giờ của lần chuyển sinh ra gợi ý. Việc chặn trùng dựa trên khoá dòng deal `FOR UPDATE` sẵn có trong `chuyenGiaiDoanTrongTx`.

**Xử lý:**
- «Mở kế hoạch» mở ô tạo kế hoạch, điền sẵn công ty. Ô ghi `planId` và chuyển `DA_MO` khi kế hoạch được tạo.
- «Bỏ qua» chuyển `BO_QUA`.
- Tạo kế hoạch cho công ty bằng bất kỳ đường nào cũng chuyển mọi gợi ý `CHO` của công ty đó sang `DA_MO`. Việc này nằm trong cùng giao dịch của `createFromTemplate`.
- Quyền xử lý: người nhận gợi ý hoặc quản trị; người khác nhận 403.

**Nơi hiện (nháp theo khuyến nghị — câu hỏi của DA3b):**
- Thẻ ở đầu sheet deal đã thắng, có hai nút.
- Một dòng `goi-y-ke-hoach` trong nhắc buổi sáng của người nhận, chừng nào gợi ý còn `CHO`.

**Thủ tục mới:** `onboarding.goiYCuaDeal({ dealId })` và `onboarding.xuLyGoiY({ id, hanhDong: "bo-qua" })`.

## 8. Ngày bắt đầu (Hỏi-2)

Chủ kho mở dòng «không làm: ngày bắt đầu cho bước» ngày 14/10, làm điều kiện cho DA4.

Máy khuyên **không** đưa ngày bắt đầu vào DA3:
- Trước Gantt, không màn nào đọc nó. Một trường không ai đọc thì không đo được bằng hành vi.
- DA4 phải thêm ngày bắt đầu cho **Việc** đằng nào cũng phải làm, vì Gantt vẽ Việc. Với hướng B, bước lấy ngày từ Việc của nó.

Lối khác: thêm `offsetBatDauNgay` vào bước khuôn và `batDauNgay` vào Việc ngay ở DA3. Giá: thêm một khối cho khuôn, ô tạo kế hoạch và một AC đọc lại; DA4 bớt một trường.

PR DA3 vẫn ghi vào `chay_khi` của DA4 rằng điều kiện ngày bắt đầu đã thoả (chủ kho 14/10). Hai dòng «không làm» nằm ở tệp của Mac Studio, nên Mac Studio tự gạch (Điều phối M5 xác nhận 14/10).

## 9. Thước đo ngưỡng

`_acceptance/ke-hoach-sinh-viec/do-nguong.mjs` đọc cơ sở dữ liệu, theo khuôn `viec-chung/do-nguong.mjs`:
- **(a)** Mẫu số là Việc có vết «tao» nguồn `khuon`, tạo trong cửa sổ, có **hạn ≤ `--den`**, và **không** ở trạng thái Huỷ. Việc chưa tới hạn lúc đọc còn có thể đạt nên chưa phán được; Việc bị Huỷ (gỡ bước, đóng kế hoạch) không còn là việc phải làm. Tử số là Việc có `roiChuaLamLuc ≤ cuối ngày hạn` giờ Việt Nam.
- **(b)** Mỗi **lần chuyển sang thắng** trong cửa sổ được đọc từ dòng hoạt động `STAGE_CHANGE` (`meta.from` → `meta.to`). Chỉ tính lần chuyển từ giai đoạn không-thắng sang thắng, và lúc đó công ty không có kế hoạch mở. Mỗi lần như vậy phải khớp một gợi ý (cùng deal, `chuyenLuc` bằng giờ chuyển) hoặc một gợi ý «chờ» đã có của deal; không khớp thì cộng vào `dealThangThieuGoiY`. Sau đó lấy tỉ lệ gợi ý có `xuLyLuc − sinhLuc ≤ 3 ngày`, tính trên các gợi ý sinh trước `--den` ít nhất 3 ngày.
- Dùng một bộ dữ liệu gieo để dựng được cả chiều xanh lẫn chiều đỏ.

## 10. Ngoài phạm vi

- Ngày bắt đầu (nếu chủ kho giữ khuyến nghị).
- Chép bước cũ sang Việc.
- Gắn kế hoạch với deal.
- Khuôn theo loại deal.
- Bản bàn giao do AI viết (thuộc tác tử).
- Tự mở kế hoạch không hỏi.
- Việc con và Kanban (DA2).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (tạo): danh mục 30 ngày hay sheet công ty → «Tạo kế hoạch» → chọn công ty (khoá nếu mở từ công ty/gợi ý), khuôn, ngày bắt đầu → khối «Người làm theo phòng ban» hiện một hàng mỗi phòng ban của khuôn, điền sẵn → «Tạo» (điểm ra: sheet kế hoạch vừa tạo, thẻ Bước, mỗi bước có người làm và chip trạng thái Việc).
- Suôn sẻ (gợi ý): người phụ trách kéo deal sang cột thắng → mở sheet deal → thẻ «Deal đã thắng — mở kế hoạch 30 ngày?» → «Mở kế hoạch» → ô tạo như trên, công ty khoá → «Tạo» (điểm ra: sheet kế hoạch; thẻ gợi ý không còn).
- Biên: phòng ban không có trưởng phòng → điền sẵn người cầm trịch, dòng phụ «Phòng chưa có trưởng phòng»; khuôn chỉ một phòng ban → một hàng; người xem không phải người nhận → không có thẻ gợi ý.
- Lỗi & quay lại: máy chủ từ chối người «chỉ OKR» (dữ liệu cũ lọt danh sách) → lời lỗi dưới nút Tạo, mọi lựa chọn còn nguyên, sửa hàng đó rồi Tạo lại; «Bỏ qua» lỡ tay → không hoàn tác ở thẻ (gợi ý chỉ là lời nhắc), vẫn tạo kế hoạch bằng nút thường.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ô tạo kế hoạch (`TaoKeHoach`) | Chọn khuôn và người làm cho từng phòng ban | danh mục, sheet công ty, thẻ gợi ý / sheet kế hoạch mới |
| Thẻ gợi ý trong sheet deal | Quyết mở kế hoạch hay bỏ qua cho deal vừa thắng | sheet deal đã thắng / ô tạo kế hoạch |
| Thẻ Bước của sheet kế hoạch (`plan-steps`) | Thấy ai làm bước nào, trạng thái tới đâu | sheet kế hoạch / khung Việc của bước |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-o-tao-cho-tai | Ô tạo kế hoạch | khung xám ở khối người làm, «Đang tải khuôn…» | chờ / đóng ô |
| ST-o-tao-loi | Ô tạo kế hoạch | «Không tải được khuôn.» + nút «Thử lại» | Thử lại / đóng ô |
| ST-o-tao-rong | Ô tạo kế hoạch | «Khuôn này chưa có bước nào.», nút Tạo khoá | chọn khuôn khác |
| ST-o-tao-loi-gui | Ô tạo kế hoạch | lời máy chủ dưới nút Tạo (vd «… chỉ OKR …»), lựa chọn giữ nguyên | sửa hàng phòng ban, Tạo lại |
| ST-the-goi-y-cho | Sheet deal | thẻ «Deal đã thắng — mở kế hoạch 30 ngày?», «Mở kế hoạch» · «Bỏ qua» | mở kế hoạch / bỏ qua |
| ST-the-goi-y-an | Sheet deal | không có thẻ (đã xử lý, không phải người nhận, chưa thắng) | — |
| ST-buoc-co-viec | Thẻ Bước | người làm + chip trạng thái Việc (Chưa làm · Đang làm · Chờ đánh giá · Xong) | bấm bước mở khung Việc |
| ST-buoc-cu | Thẻ Bước | như hôm nay (không chip) cho kế hoạch tạo trước DA3 | giao / xong như cũ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khối người làm: một hàng mỗi phòng ban theo thứ tự xuất hiện trong khuôn; ô chọn dùng lại `nguoiNhanViec` (đã loại «chỉ OKR»); đổi khuôn thì dựng lại khối và điền lại mặc định.
- ≤ 640px: hàng phòng ban xếp dọc (nhãn trên, ô chọn dưới); thẻ gợi ý hai nút xuống dòng, không tràn ngang.
- «Bỏ qua» ẩn thẻ ngay (lạc quan), lỗi thì thẻ hiện lại kèm toast lời máy chủ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `TaoKeHoach` | mở rộng | thêm khối người làm, giữ nguyên trường cũ |
| Ô chọn người của `giao-viec` (viec-chung) | dùng | cùng nguồn `nguoiNhanViec`, cùng hành vi lọc vai |
| Thẻ gợi ý | ghép | `Alert`/`Card` của `@crm/ui` + hai `Button`, theo dải lưu trữ dùng chung V2e ở đầu sheet |
| `trang-thai-viec` (viec-chung) | dùng | chip trạng thái trên dòng bước |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — ba chỗ chạm đều là phần mở rộng của sheet bản ghi và ô tạo đã có (danh mục → sheet), không có khuôn thứ hai khả dĩ nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
