# Lý do từ chối nộp theo ngôn ngữ — thiết kế

Hàng K2c, đợt `sau-14-10`. Ngoài-1 của K2b `soan-okr-khong-lac` (Cổng 2, 2026-10-08T16:47:19Z, anh chọn «mở hợp
đồng mới»). Hồ sơ: `_acceptance/ly-do-tu-choi-nop-theo-locale/`.

## Lỗi

Khi công cụ `nop_ban_nhap` từ chối, agent trả `{ ketQua: "tu-choi", lyDo }` với `lyDo` là một trong bảy chuỗi của
`TRO_LY_OKR_SOAN.tuChoi` (`apps/agent-okr/agent/lib/config.ts`) — mã máy không dấu như «chu ky khong o pha lap ke
hoach». App đọc kết quả bằng `docKetQuaNop` (`lyDo: z.string()`), `luotNop` chuyển nguyên chuỗi sang
`NopKhongThanh.lyDo`, và `hoi-thoai-soan.tsx` ghép nó vào `m.moc.nopKhongThanh(lyDo)`. Người dùng thấy mã máy, và ở
tiếng Anh thấy câu tiếng Anh nối mã tiếng Việt.

## Cách sửa

1. **Tập mã một chỗ, ở biên chung.** `packages/validation/src/okr-cuoc-soan.ts` khai
   `LY_DO_TU_CHOI_NOP = { cuocKhongThuocPhien: "cuoc khong thuoc phien", … } as const` — đúng bảy khoá và bảy giá trị
   hiện có — cùng kiểu `LyDoTuChoiNop` (tên khoá). `TRO_LY_OKR_SOAN.tuChoi` của agent trỏ vào đối tượng này
   (`tuChoi: LY_DO_TU_CHOI_NOP`). Giá trị chuỗi KHÔNG đổi: chúng là dữ liệu đã lưu trong transcript của mọi cuộc cũ, và
   Kara (mô hình) đọc chúng trong kết quả công cụ.
2. **Bên ghi chặt.** `ketQuaNop.lyDo` của agent thành «một giá trị của tập, hoặc chuỗi rỗng» thay cho `z.string()` —
   một `tuChoi(...)` với chuỗi lạ ném ngay ở agent, không chảy xuống app.
3. **Đọc thành mã ở biên.** `docKetQuaNop` trả `lyDo: LyDoTuChoiNop | null`: giá trị thuộc tập → khoá của nó; rỗng hay
   lạ → `null`. Không còn chuỗi tự do nào đi qua app. Kết quả có `ketQua` hợp lệ mà `lyDo` lạ vẫn đọc được (không
   rơi về «không đọc được kết quả») — một bản agent mới hơn app không làm hỏng màn.
4. **Câu theo ngôn ngữ.** `okrSoanMessages` thêm `moc.lyDoTuChoi: Record<LyDoTuChoiNop, string>` (satisfies — thiếu
   một mã là lỗi kiểu) cho vi và en; `hoi-thoai-soan.tsx` gọi
   `m.moc.nopKhongThanh(hong.lyDo ? m.moc.lyDoTuChoi[hong.lyDo] : null)`.

Câu đề xuất (người duyệt sửa ở Cổng 1 nếu cần):

| Mã | vi | en |
|---|---|---|
| `cuocKhongThuocPhien` | cuộc soạn này thuộc một cuộc trò chuyện khác | this drafting session belongs to another conversation |
| `cuocKhongDang` | cuộc soạn đã đóng | the drafting session has closed |
| `donViChuaBat` | đơn vị chưa bật Kara soạn OKR | Kara drafting isn't turned on for this unit |
| `saiMucDich` | cuộc trò chuyện này không dùng để soạn OKR | this conversation isn't for drafting OKRs |
| `chuKyKhongLapKeHoach` | chu kỳ đã rời pha «Lập kế hoạch» | the cycle has left Planning |
| `dongTrungKhoa` | bản nháp có hai dòng trùng nhau | the draft has two duplicate lines |
| `phienKhongSong` | cuộc trò chuyện đã hết hạn — mở lại trang soạn | the conversation has expired — reopen the drafting page |

Câu theo `docs/ai-ux.md` §7 («Kara chưa <làm gì> được», không gợi ý cho lập trình viên) và §9 (mọi chữ qua
`lib/messages`); «pha «Lập kế hoạch»» dùng đúng nhãn pha của `okr.ts`.

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Kara nộp bản nháp, máy chủ ghi — không đổi so với K2b.
- Biên: Kara nộp khi chu kỳ đã rời pha Lập kế hoạch → dòng hệ thống nói đúng lý do bằng ngôn ngữ của trang.
- Lỗi & quay lại: lý do không nhận ra (agent mới hơn app) → dòng hệ thống không lý do; người hỏi Kara hoặc chờ Kara nộp lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trang soạn OKR `/okr/soan/<cuộc>` | Soạn bộ OKR cùng Kara | Theo đơn vị / về Theo đơn vị |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-soan-nop-tu-choi-co-ly-do | Trang soạn | Dòng hệ thống «Kara nộp bản nháp chưa được — <câu lý do theo ngôn ngữ>» | Chờ Kara nộp lại, hoặc hỏi Kara |
| ST-soan-nop-tu-choi-ly-do-la | Trang soạn | Dòng hệ thống «Kara nộp bản nháp chưa được», không lý do | Hỏi Kara vì sao |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ngôn ngữ của câu lý do theo ngôn ngữ của trang (cookie `lang`), không theo ngôn ngữ của cuộc trò chuyện.
- Cuộc đã lưu trước vòng này hiện câu mới khi mở lại — transcript mang đúng giá trị mã cũ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KaraSystemLine` | dùng | dòng hệ thống của K2b, chỉ đổi chữ bên trong |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: (ii) giữ nguyên khuôn K2 đã duyệt 07/10; vòng này chỉ đổi chữ trong một dòng hệ thống.

## Đo

- Bài DOM ma trận bảy mã × hai ngôn ngữ, cộng hai ca ngoài tập (E1–E3).
- Thước «một chỗ khai» duyệt thư mục bằng `fs.readdirSync`, đếm tệp mỗi gốc (bài học Ngoài-4 của K2b: glob coi
  `[slug]` là lớp ký tự, gốc quét rỗng mà thước vẫn xanh) (E4).
- Giá trị cũ theo tệp mẫu chép từ `577f23b2b`, round-trip từ schema ghi thật của agent (E5).
- Thước ranh giới tự tìm merge của hồ sơ khi đã lên onehub — không tự hết hạn sau merge như E9 của K2b (E8).
- Màn thật ở vi 390, vi 1440, en 1440, mỗi lượt một phiên soạn riêng (E9).

## Ngoài phạm vi

- Ngoài-2 đến Ngoài-10 của K2b; Ngoài-4 là K2d.
- Đổi giá trị chuỗi của mã; đổi lời Kara hay cách agent nộp lại.
