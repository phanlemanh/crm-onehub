# Kara góp ý OKR — lượt 2 — thiết kế

Hàng K3, đợt `sau-14-10` (ưu tiên 2.0, sau K2). Lượt hai của «Kara góp ý OKR» (`gop-y-dung-cho`, đã gộp). Gom mười
lăm mục của lộ trình (`de-xuat-lo-trinh.md` dòng 91): G1, G4–G7, #1–#6, C4e. Hồ sơ: `_acceptance/kara-gop-y-luot-2/`.
Hiện trạng mã soát ngày 09/10 trên `c1067c16` — không mục nào đã được sửa ở vòng khác.

## Bốn câu chốt ở Cổng 1 (máy khuyên)

| # | Câu | Máy khuyên | Vì sao | Lối khác |
|---|---|---|---|---|
| Q1 | G6 «một khuôn ngày giờ» có gồm ba tệp `soan/` không | **Có** — làm trong K3, xin `cham-tep` (P1-36) | Hàng K3 gốc ghi «cả bốn chỗ»; K2 thêm chỗ thứ năm (`bang-nhap.tsx`) | Tách hàng riêng: K3 chỉ sửa hai chỗ trong ranh giới, ngày giờ vẫn lệch ở trang soạn |
| Q2 | #5 người phụ trách nhiều KR | **API cho phép nhờ cả Mục tiêu khi người đó sửa được ít nhất một KR** (`assertSuaDich`, trong ranh giới, không đổi schema) | Danh sách đã tự lọc theo KR người đó sửa được | Truyền danh sách KR: đổi schema ở ba chỗ ngoài ranh giới (`okr.contracts.ts`, `packages/db/src/okr-tro-ly.ts`, `apps/agent`) |
| Q3 | #2 không chờ mãi | **Client ghi mốc lúc khung thấy Kara đang đọc; quá trần 30 s thì sang lỗi có Thử lại** | Không cần API; trần đã có ở `TRO_LY_OKR_TRAN` (`@crm/validation/okr-tro-ly`) | Đếm từ lúc Kara bắt đầu thật: thêm `createdAt` vào `troLyDanhSach` (ngoài ranh giới) |
| Q4 | Chữ đếm | **Giữ «góp ý chờ»**; màn góp ý dùng `KaraProposal` từng dòng, không dùng `KaraProposalGroup` (nhóm tự in «N đề xuất» trùng nhãn vùng) | Một từ cho một thứ trên cùng màn; `messages-guard` đang ghim «góp ý chờ» | Đổi sang «đề xuất» khắp nơi: đổi ghim và chữ tab Vết |

## Cách sửa, theo thứ tự làm

1. **Khung chung (nền cho mọi trạng thái).** Vùng Kara trong khung Mục tiêu bọc bằng `DetailSheetSection` như hai vùng
   bên cạnh, giữ `data-vung-kara`; bọc `KaraBusyProvider`. Trạng thái: đang đọc → `KaraState working`; rỗng →
   `KaraState empty` kèm nút «Nhờ Kara đọc lại» (prop `action` mới, chỉ thêm, `state.tsx`); lỗi → `KaraState error` +
   `KaraRetry`; tắt hay hết lượt → `KaraState off` nói lý do và khi nào mở lại (prop `describedBy` mới). Mỗi góp ý là
   `KaraProposal` với `media={false}`: dấu tia sáng chỉ còn ở nhãn vùng (G7, `docs/ai-ux.md` §2–3).
2. **Lỗi không làm vùng biến mất (Ngoài-14).** Danh sách tải lỗi → `KaraState error`; Thử lại tải lại danh sách, không
   gọi «Nhờ Kara».
3. **Nhờ Kara lỗi có phản hồi (Ngoài-15).** `troLyDeXuat` lỗi → `KaraState error` «Kara chưa đọc được Mục tiêu này» +
   Thử lại; nút không sáng lại im lặng.
4. **Không chờ mãi (Ngoài-13).** Mốc chờ = lúc khung thấy `dangSoan` lần đầu, kể cả khi người khác bấm; quá trần → lỗi.
   Trần là `TRO_LY_OKR_TRAN.tranChoMs`, đọc qua đúng đường nhập `gop-y-kara.ts` đang dùng (`@crm/validation/okr-tro-ly`, không qua `@crm/db` ở client); bàn đo
   màn chờ trần thật, không thêm biến môi trường.
5. **«Thử lại» không xám im lặng (KL Ngoài-4).** Nút Kara khoá hay ẩn → hiện `KaraState off` với lý do thay cho Thử lại.
6. **Lỗi từng dòng thành câu (C4e).** Lỗi khi quyết một góp ý ánh xạ theo mã lỗi sang câu của `okr-gop-y.ts`; không in
   `e.message`, không in «Chưa sẵn sàng — …» của trang quản trị.
7. **Căn chỉnh có Hoàn tác (Ngoài-11).** Sau khi nhận «Căn chỉnh», client chụp danh sách liên kết căn chỉnh trước lần nhận,
   làm mới, rồi lấy liên kết có SAU mà không có TRƯỚC và khớp đích của kết quả (`targetObjectiveId`/`targetKeyResultId`);
   có thì biên nhận có Hoàn tác gọi `removeAlignment` với đúng id đó; không có (đích đã căn sẵn) thì biên nhận không có
   Hoàn tác — không bao giờ gỡ liên kết người dùng tự tạo.
8. **Hai Hoàn tác không đua (KL Ngoài-16).** Mỗi lần quyết hay hoàn tác giữ trạng thái và lỗi theo mã góp ý
   (`mutateAsync` theo từng lần), không dùng callback chung của một mutation.
9. **Chip không đứng số cũ (KL Ngoài-1).** Đóng khung trước khi Kara đọc xong → vẫn hỏi lại ở mức QueryClient tới khi
   việc xong, rồi làm mới chip và «Của tôi».
10. **Người phụ trách nhiều KR (#5).** `assertSuaDich`: thiếu `keyResultId` mà người gọi sửa được ít nhất một KR của
    Mục tiêu → cho nhờ cả Mục tiêu; client gửi Mục tiêu thay cho `krSuaDuoc[0]`. Danh sách trả về đã lọc theo KR sửa được.
11. **Số ít, số nhiều tiếng Anh (G1)**: `soCho`, `lyDo`, `chip`, `chipAria`, `coCho` tách số ít theo mẫu `okr-so.ts`.
12. **Câu dẫn đúng mọi trường hợp (G5)**: câu trung tính «Góp ý nằm trong vùng Kara của Mục tiêu này» thay «Quyết ngay
    dưới từng KR».
13. **Focus đúng KR (G4)**: dòng dẫn trong hộp Sửa KR mang mã KR (khoá URL mới cạnh `neoGopY`, P1-35); khung Mục tiêu
    cuộn tới và đặt focus vào góp ý đầu tiên của KR đó, làm nổi bằng `highlighted` của `KaraProposal`.
14. **Một khuôn ngày giờ (G6)**: hàm chung trong `packages/ui/src/lib/format.ts` (giờ Việt Nam, khuôn theo locale);
    năm chỗ gọi nó: `nhom-kara.tsx`, `bang-vet.tsx` (kéo theo hai tab Ghi nhận và Trao đổi), `soan/nut-soan.tsx`,
    `soan/danh-sach-cuoc.tsx`, `soan/bang-nhap.tsx`.

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở khung Mục tiêu → vùng Kara (có khung) liệt góp ý chờ → nhận «Căn chỉnh» → biên nhận có Hoàn tác.
- Biên: người phụ trách hai KR mở khung → nhờ Kara cho cả Mục tiêu → góp ý chỉ của KR mình sửa được.
- Lỗi & quay lại: danh sách tải lỗi / Nhờ Kara lỗi / Kara đọc quá lâu → `KaraState error` có Thử lại; hết lượt → câu
  nói khi nào mở lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Khung Mục tiêu (`ObjectiveSheet`) | Xem và quyết góp ý của Kara cho một Mục tiêu | Danh sách OKR, «Của tôi», dòng dẫn trong hộp Sửa / đóng khung |
| Hộp Sửa KR, hộp Sửa Mục tiêu | Sửa một KR hay Mục tiêu | Khung Mục tiêu / dòng dẫn sang vùng Kara |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-gy-co-khung | Khung Mục tiêu | Vùng Kara có khung như vùng bên cạnh, góp ý không mang dấu tia sáng riêng | Quyết từng góp ý |
| ST-gy-dang-doc | Khung Mục tiêu | «Kara đang đọc Mục tiêu này…» | Chờ |
| ST-gy-qua-han | Khung Mục tiêu | «Kara chưa đọc được Mục tiêu này» + Thử lại | Bấm Thử lại |
| ST-gy-tai-loi | Khung Mục tiêu | Vùng còn, câu lỗi tải + Thử lại tải lại danh sách | Bấm Thử lại |
| ST-gy-nho-loi | Khung Mục tiêu | Câu lỗi Nhờ Kara + Thử lại | Bấm Thử lại |
| ST-gy-het-luot | Khung Mục tiêu | Câu nói vì sao Kara tạm nghỉ và khi nào mở lại; không có nút xám | Quay lại sau |
| ST-gy-can-chinh-hoan | Khung Mục tiêu | Biên nhận «Đã góp vào …» có Hoàn tác | Hoàn tác nếu nhầm |
| ST-gy-loi-dong | Khung Mục tiêu | Câu lỗi sản phẩm dưới góp ý, không mã máy | Quyết lại |
| ST-gy-neo-kr | Khung Mục tiêu | Góp ý đầu tiên của KR được focus và làm nổi | Quyết góp ý đó |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thử lại của «tải lỗi» chỉ tải lại danh sách; Thử lại của «Nhờ Kara lỗi» và «quá hạn» gọi lại Kara (tính một lượt).
- Ngày giờ ở năm chỗ cùng khuôn và cùng giờ Việt Nam ở cả hai ngôn ngữ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KaraState` | mở rộng (`action` cho empty, `describedBy` cho off) | trạng thái rỗng có nút đọc lại; nút cần lời giải thích cho trình đọc màn hình |
| `KaraRetry`, `KaraBusyProvider` | dùng | một nút Thử lại, khoá khi Kara bận |
| `KaraProposal` | dùng (`media={false}`, `highlighted`) | góp ý từng dòng, làm nổi khi neo từ dòng dẫn |
| `DetailSheetSection` | dùng | khung vùng giống hai vùng bên cạnh |
| `ProposedChangeReceipt` | dùng | biên nhận Căn chỉnh có Hoàn tác |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: khung chi tiết có vùng
Căn cứ: (ii) giữ khuôn `gop-y-dung-cho` đã duyệt; vòng này đổi trạng thái và chữ trong vùng, không đổi bố cục khung.

## Ngoài phạm vi

- Đổi schema `troLyDichInput` / `troLyDanhSach` (Q2, Q3 lối khác).
- Bộ quét đóng việc Kara treo ở máy chủ (`okr-tro-ly.ts:385` dùng lại việc treo) — Thử lại sau quá hạn chờ thêm một trần.
- Đổi chữ «góp ý chờ» sang «đề xuất» (Q4 lối khác).
- Các mục khác của `gop-y-dung-cho` đã định đoạt ở Cổng 2 của nó (Known limits / wont-fix ngoài Ngoài-1, 4, 16).
