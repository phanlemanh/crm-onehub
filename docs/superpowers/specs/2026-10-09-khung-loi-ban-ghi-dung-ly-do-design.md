# K4b `khung-loi-ban-ghi-dung-ly-do` — khung bản ghi tải lỗi nói đúng lý do

Hàng K4b của đợt `sau-14-10`, dãy P2, ưu tiên 2.5, sau K4 `khung-ban-ghi-kara` (#306). Cổng Đáng: anh ký `build`
2026-10-08T02:23:55Z (luật 25), từ Ngoài-4 của K4. Ô cơ hội: `_acceptance/khung-loi-ban-ghi-dung-ly-do/opportunity.md`.

## Vấn đề

| Ngăn | Tệp | Lỗi tải hôm nay |
| --- | --- | --- |
| Cá nhân | `contact-sheet.tsx` | `RecordSheetFrame error={message}` → `KhungTaiLoi` «Không tải được bản ghi này» + «Kiểm tra kết nối rồi thử lại.» + «Thử lại» |
| Công ty | `company-sheet.tsx` | như trên |
| Thoả thuận | `deal-sheet.tsx` | như trên |
| Kế hoạch | `plan-sheet.tsx` | như trên nhưng KHÔNG có `onRetry` → khung không có nút nào |
| Mục «Kế hoạch» trong ngăn công ty | `company-plans.tsx` | `KhungTaiLoi` + «Thử lại» |

Mọi mã lỗi tRPC đều ra cùng một khung: `NOT_FOUND` (bản ghi đã bị xoá vĩnh viễn — `contacts.service.ts` ném
`NotFoundException`) và `FORBIDDEN` (người xem không thuộc workspace — `auth.middleware.ts` ném `NOT_A_MEMBER`) vẫn bảo
«kiểm tra kết nối» và «Thử lại» không bao giờ được.

## Cách làm

Tiền lệ: `objective-sheet.tsx` đọc `query.error?.data?.code === "NOT_FOUND"` và hiện «không thấy» kèm nút đóng ngăn
(`useRecordStack().close`). K4b đưa cách đó vào khung chung của ngăn bản ghi:

- `record-parts.tsx`: hàm `lyDoLoi(loi)` nhận lỗi của truy vấn (`{ data?: { code?: string } | null } | null`) và trả
  `"khong-con"` cho `NOT_FOUND`, `"khong-quyen"` cho `FORBIDDEN`, `"mat-ket-noi"` cho mọi mã khác.
- `KhungTaiLoi({ lyDo, onRetry })`: `khong-con` → «Bản ghi này không còn» + một câu + nút «Đóng» (đóng ngăn đang mở,
  quay về ngăn trước nếu có); `khong-quyen` → «Bạn không có quyền xem bản ghi này» + một câu + «Đóng»; `mat-ket-noi` →
  khung cũ («Không tải được bản ghi này» + «Kiểm tra kết nối rồi thử lại.» + «Thử lại»). Hai lý do đầu không có «Thử
  lại» — thử lại không đổi được kết quả. Không in thông điệp lỗi thô. `data-khung-tai-loi` giữ nguyên, thêm
  `data-ly-do="<lý do>"`.
- `KhungTaiLoi` nhận thêm `coDong` (mặc định có): mục «Kế hoạch» trong ngăn công ty truyền `coDong={false}` — ngăn công
  ty vẫn dùng được, nên hai lý do đầu chỉ có tiêu đề và câu giải thích.
- Mã lỗi thật được đo trên máy chủ của cây (eval E9, phiên đo `tien-de`): bản ghi không còn ở `contacts.byId`,
  `companies.byId`, `deals.byId`, `onboarding.planById` và `onboarding.plansOfCompany`, cùng người không thuộc workspace
  (xoá dòng `member` của phiên) — để lời hứa không dựa vào lỗi viết tay của bài DOM.
- `RecordSheetFrame` nhận thêm `lyDo` và chuyển cho `KhungTaiLoi`. Bốn ngăn truyền `lyDo={lyDoLoi(query.error)}`;
  `plan-sheet.tsx` thêm `onRetry={() => void query.refetch()}`. `company-plans.tsx` truyền `lyDo` cho khung của nó.
- Chữ mới ở `lib/messages/kara-ban-ghi.ts` (khối `khung`, có sẵn `loiMoTa`): `khongCon`, `khongQuyen` mỗi khối
  `tieuDe`, `moTa`, `dong`; en và vi.

«Đóng» dùng `Button variant="outline" size="sm"` như tiền lệ của ngăn mục tiêu; `KaraRetry` giữ cho lỗi mạng.

## Vòng đời (luật 14 — ba câu)

1. **Dọn thế nào:** không đổi — K4b chỉ đổi cách báo khi một bản ghi đã bị xoá vĩnh viễn được mở lại.
2. **«Lịch sử»:** không đổi.
3. **Danh sách mặc định:** không đổi; «Đóng» trả người dùng về danh sách hay ngăn trước.

## Ngoài phạm vi

- Bản ghi đã lưu trữ (không xoá) — vẫn mở bình thường, dải báo lưu trữ là việc của V2.
- Phiên hết hạn (`UNAUTHORIZED`) — đường đăng nhập lại đã có (`phien-chet-ve-dang-nhap`, #184); K4b xếp nó vào «mất kết
  nối» như hôm nay.
- Ngăn mục tiêu và KR của OKR — đã có cách riêng.
- Mục con khác trong ngăn (dòng thời gian, hoạt động web) — K6b/K6c/K6e.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở `?record=<loại>:<id>` → ngăn hiện bản ghi.
- Biên: bản ghi đã bị xoá → «Bản ghi này không còn» + «Đóng» → về danh sách; người xem không thuộc workspace → «Bạn
  không có quyền xem bản ghi này» + «Đóng».
- Lỗi & quay lại: mất mạng hay máy chủ lỗi → «Không tải được bản ghi này» + «Thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn cá nhân / công ty / thoả thuận / kế hoạch | xem và làm việc với một bản ghi | đường dẫn, danh sách, thông báo / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-klg-khong-con | Ngăn bản ghi | «Bản ghi này không còn» + câu giải thích + «Đóng» | bấm Đóng |
| ST-klg-khong-quyen | Ngăn bản ghi | «Bạn không có quyền xem bản ghi này» + câu giải thích + «Đóng» | bấm Đóng |
| ST-klg-mat-ket-noi | Ngăn bản ghi (cả kế hoạch) | «Không tải được bản ghi này» + «Kiểm tra kết nối rồi thử lại.» + «Thử lại» | bấm Thử lại |
| ST-klg-ke-hoach-cong-ty | Mục «Kế hoạch» trong ngăn công ty | khung theo đúng lý do như trên | Đóng hoặc Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Đóng» đóng ngăn đang mở (về ngăn trước nếu đang chồng ngăn, về danh sách nếu không).
- Không lý do nào in thông điệp lỗi thô của máy chủ.
- 390: khung nằm gọn trong ngăn, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Empty` (`border="solid"`, `size="compact"`) | dùng | khung lỗi sẵn có của `KhungTaiLoi` |
| `Button variant="outline" size="sm"` | dùng | nút «Đóng» như tiền lệ ngăn mục tiêu OKR |
| `KaraRetry` | dùng | nút «Thử lại» duy nhất của kho |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: chỉ đổi trạng thái lỗi bên trong ngăn bản ghi (chi tiết của danh sách); luồng hiển nhiên, theo tiền lệ ngăn mục tiêu OKR.
<!-- UX-SPEC-TEMPLATE>>> -->
