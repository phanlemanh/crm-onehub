# Màu trạng thái chung — thiết kế

Hàng NM3 của `docs/plan/lo-trinh-okr.json`, dãy P4 của đợt r2. Câu giao: «Cùng một nghĩa — xong, chờ, hỏng, nháp,
đang chạy — mang cùng một màu ở OKR, Kara, lịch họp và Tài liệu». Cổng Đáng ký build 12/10 (`opportunity.md`).
LT1 đã đặt bảng nghĩa → màu ở `packages/ui/src/lib/status-tone.ts` (`toneTheoNghia`) và mục «Màu trạng thái» của
`docs/design.md`; NM3 dời các khu còn tự khai màu về bảng đó.

## Hiện trạng (onehub f46c0bbda)

`docs/design.md` gọi tên năm khu còn tự khai. Quét `git grep` các mẫu `Record<…, StatusTone>`, `tone: "<giá trị>"`
trong `apps/app` và `packages/ui/src` (trừ bản mẫu `/proto`, bài kiểm, chính `status-tone.ts` và
`status-indicator.tsx`) ra **13 chỗ**:

| # | Khu | Tệp | Bảng |
| --- | --- | --- | --- |
| 1 | OKR — độ tự tin, nhịp | `packages/ui/src/components/okr-status.tsx` | `TONE_TU_TIN`, `TONE_NHIP` |
| 2 | Kara — các bước | `packages/ui/src/components/kara/steps.tsx` | `TONE` |
| 3 | Lịch họp — người dự | `packages/ui/src/components/attendee-list.tsx` | `RESPONSE_TONE` |
| 4 | OKR — trạng thái mục tiêu | `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx` | `TONE_TRANG_THAI` |
| 5 | Tài liệu — nguồn | `apps/app/app/(app)/[slug]/tai-lieu/bang-nguon.tsx` | `DANG` |
| 6 | OKR — cập nhật tuần | `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx` | `TONE_TU_TIN` (bản sao của #1) |
| 7 | OKR — cuộc soạn | `apps/app/app/(app)/[slug]/okr/soan/danh-sach-cuoc.tsx` | `TONE_CUOC` |
| 8 | OKR — tóm tắt quản trị | `apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/tom-tat-quan-tri.tsx` | hàm `hienTrangThai` |
| 9 | Cài đặt OKR — pha chu kỳ | `apps/app/app/(app)/[slug]/settings/okr/bang-chu-ky.tsx` | `TONE_PHA` |
| 10 | Bản ghi — việc gắn KR | `apps/app/components/crm/record-sheet/kr-viec.tsx` | `TONE_GOC` |
| 11 | Làm giàu — hàng đợi | `apps/app/components/enrichment-queue.tsx` | `STATE_TONE` |
| 12 | Làm giàu — trạng thái | `apps/app/lib/enrichment-status.ts` | `PRESENTATION`, `QUEUED` |
| 13 | Thoả thuận — giai đoạn | `apps/app/lib/giai-doan.ts` | `TONE` |

Cùng một nghĩa đang mang nhiều màu: «đang chạy» là `success` ở #9 và #10, `primary` ở #11, `warning` ở #7,
`neutral` ở #5 và #8, `info` ở #2, #12, #13. Các trạng thái kết thúc (đã bỏ, đã đóng, bỏ qua, lưu trữ) không có
nghĩa nào trong bảng; mỗi khu tự chọn `neutral` hoặc `warning`.

## Phương án

1. **Bảng nghĩa thêm một dòng «đã kết thúc» → `neutral`** (Hỏi-2): `TONE_THEO_NGHIA.ketThuc = "neutral"`, và
   `docs/design.md` thêm dòng «đã kết thúc, đã bỏ, đã đóng | `neutral`». Bài kiểm có sẵn (`status-tone.spec.ts`)
   giữ hai bên khớp.
2. **Mỗi khu khai `NGHIA_<…>: Record<TrangThai, NghiaTrangThai>`** và gọi `toneTheoNghia(...)`, đúng nếp
   `NGHIA_MUC_TIN` mà LT1 đã dựng ở `ly-do-noi-gop.tsx`. Không khu nào còn khai `StatusTone`. Bản sao #6 dùng lại
   bảng nghĩa của #1.
3. **Bài canh**: một bài quét mã nguồn đỏ khi có tệp ngoài `status-tone.ts` khai bảng trạng thái → `StatusTone`.
   Bản mẫu `/proto` và màu chọn tại chỗ trong JSX (`tone={tre ? "error" : "neutral"}`) nằm ngoài bài canh.
4. **Phạm vi 13 khu** (Hỏi-1). Lối khác: năm khu như ghi chú hàng, tám khu còn lại vào danh sách miễn của bài canh.
5. `docs/design.md` thôi câu «Năm khu cũ còn tự khai…» và nói bài canh giữ luật «một bảng».

### Bảng ánh xạ từng trạng thái (Hỏi-3)

Cột «Đổi màu» là thứ người dùng sẽ thấy khác. Dòng **đậm** là chỗ máy không tự chắc nghĩa.

| Khu | Trạng thái | Nghĩa | Màu hôm nay → mới | Đổi màu |
| --- | --- | --- | --- | --- |
| #1 #6 | tự tin cao · vừa · **thấp** | xong · chờ · **hỏng** | success · warning · error | không |
| #1 | đúng nhịp · chậm nhịp · trượt | xong · chờ · hỏng | success · warning · error | không |
| #1 | chưa có kỳ vọng · mốc chưa xong · mốc xong | nháp · nháp · xong | neutral · neutral · success | không |
| #2 | xong · đang chạy · lỗi · chưa lưu · bỏ qua | xong · đang chạy · hỏng · chờ · đã kết thúc | như cũ | không |
| #3 | đồng ý · từ chối · có thể · chưa trả lời | xong · hỏng · chờ · nháp | như cũ | không |
| #4 | nháp · chờ duyệt · công bố · đã bỏ | nháp · chờ · xong · đã kết thúc | như cũ | không |
| #5 | **chờ đọc · chờ soạn** | **đang chạy** | neutral → info | có |
| #5 | đang soạn | đang chạy | neutral → info | có |
| #5 | đã soạn · cần gỡ tay · lỗi | xong · chờ · hỏng | như cũ | không |
| #7 | đang soạn | đang chạy | warning → info | có |
| #7 | đã đưa vào · bỏ | xong · đã kết thúc | như cũ | không |
| #8 | đã hiện · **qua bộ kiểm, chỉ quản trị thấy** · giữ lại · không làm được | xong · **chờ** · chờ · hỏng | success · info → warning · warning · error | có (qua bộ kiểm) |
| #8 | đang soạn · chưa cập nhật | đang chạy · nháp | neutral → info · neutral | có (đang soạn) |
| #9 | **lập kế hoạch** · đang chạy · chấm điểm · đã đóng | **nháp** · đang chạy · chờ · đã kết thúc | info → neutral · success → info · warning · neutral | có |
| #10 | chưa chạy · đang chạy · đã đóng | nháp · đang chạy · đã kết thúc | neutral · success → info · neutral | có (đang chạy) |
| #10 | **đã lưu trữ · đã xoá** | **đã kết thúc** | warning → neutral | có |
| #11 | đang chạy · **trong hàng đợi** · lỗi | đang chạy · **đang chạy** · hỏng | primary → info · neutral → info · error | có |
| #12 | **chờ** · đang chạy · xong · lỗi · bỏ qua · **trong hàng đợi** | **nháp** · đang chạy · xong · hỏng · đã kết thúc · **đang chạy** | neutral · info · success · error · neutral · neutral → info | có (hàng đợi) |
| #13 | đang mở · thắng · thua | đang chạy · xong · hỏng | như cũ | không |

Ba nhóm còn tranh cãi:

- **Việc máy đang xếp hàng** (#5 chờ đọc/chờ soạn, #11 và #12 trong hàng đợi): khuyên «đang chạy» — máy đang lo,
  người không phải làm gì; «chờ» (vàng) đọc thành «người phải làm gì đó».
- **Độ tự tin thấp** (#1, #6): khuyên giữ «hỏng» (đỏ) — đổi sang «chờ» thì vừa và thấp cùng một màu.
- **Liên kết trỏ việc đã lưu trữ hay đã xoá** (#10), **«qua bộ kiểm, chỉ quản trị thấy»** (#8), **«lập kế hoạch»** (#9):
  khuyên như bảng — kết thúc, chờ, nháp.

Phương án loại: (a) đổi bảng nghĩa theo màu đang dùng của từng khu — trái câu giao «cùng nghĩa cùng màu»; (b) thêm
nghĩa «đang xếp hàng» riêng — thêm một màu thứ sáu mà người dùng phải học, trong khi với họ hàng đợi và đang chạy là
cùng một việc: chờ máy.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: không đổi luồng nào — người dùng mở các màn như hôm nay, chấm và nhãn trạng thái mang màu theo nghĩa.
- Biên: trạng thái lạ (giá trị ngoài bảng) — kiểu dữ liệu chặn ở lúc dựng, không có nhánh chạy.
- Lỗi & quay lại: không đổi.
- Trình đọc màn hình: không đổi; nhãn chữ cạnh chấm giữ nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| 13 khu ở bảng «Hiện trạng» | không đổi | không đổi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-mau-theo-nghia | 13 khu | Chấm trạng thái mang màu của nghĩa ở bảng ánh xạ | Như hôm nay |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Một trạng thái đổi nghĩa thì đổi màu ở mọi khu cùng lúc, vì màu chỉ đọc từ một bảng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `StatusIndicator`, `IndicatorDot` | dùng | thành phần chấm trạng thái có sẵn |
| `toneTheoNghia` | mở rộng | thêm nghĩa «đã kết thúc» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: không đổi — vòng chỉ đổi giá trị màu, không đổi cấu trúc màn.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- Bài quét mã nguồn (bài canh): không tệp nào ngoài `status-tone.ts` khai bảng trạng thái → `StatusTone`; chiều đỏ
  cấy một bảng vào bản sao.
- Bài bảng ánh xạ: mỗi khu xuất bảng nghĩa của mình; ma trận viết trước theo bảng trên (mọi trạng thái của 13 khu)
  so `toneTheoNghia(nghia)` với màu kỳ vọng; đếm đủ số ô.
- Bài DOM: dựng bốn thành phần dùng chung (`OkrConfidence`/`OkrPace`, `KaraSteps`, `AttendeeList`) và màn Tài liệu ›
  Nguồn với mỗi trạng thái, đọc `data-tone` thật trên DOM.
- Bài bảng thiết kế: `status-tone.spec.ts` có sẵn — bảng nghĩa và `docs/design.md` cùng sáu dòng.

## Ngoài phạm vi

- Bản mẫu dưới `/proto` — vật thiết kế, không lên màn thật.
- Màu chọn tại chỗ trong JSX theo một điều kiện (`dong-buoc.tsx`, `hop-tuan.tsx`, `cham-diem.tsx`…) — không phải
  bảng trạng thái; đưa về nghĩa là một hàng sau nếu cần.
- Biến thể `Badge` của nhãn trạng thái (`BIEN_THE_TRANG_THAI` ở `tien-do-kr.tsx`) — nhãn chữ, không phải chấm.
