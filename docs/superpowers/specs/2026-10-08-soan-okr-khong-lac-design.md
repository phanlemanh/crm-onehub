# Trang soạn OKR không lạc — thiết kế

Hàng K2b của dãy P1, đợt `sau-14-10`. Gom ba mục «mở hợp đồng mới» ở Cổng 2 của K2 `soan-okr-trang-rieng`
(Ngoài-3, 4, 5; anh ký lúc 2026-10-08T01:24:38Z — luật 26 coi như đã ký Cổng Đáng `build`).

## Ba lỗi và cách sửa

### Ngoài-3 — khoá URL của trang soạn trùng khoá của tính năng khác

`soan/cau-hinh.ts` khai `thamSo: { tab: "tab", loc: "loc" }`, ngoài `SEARCH_PARAM`
(`apps/app/lib/search-param-keys.ts`). `tab` cũng là `SEARCH_PARAM.record.tab` (tab của ngăn bản ghi), `loc` cũng là
`SEARCH_PARAM.toChuc.loc`. Ở khổ hẹp, mở `?record=…` làm ngăn bản ghi ghi `tab=` của nó, `useTabSoan` đọc giá trị lạ
không thuộc `TAB_SOAN` nên rơi về mặc định «Trò chuyện». Gốc rễ đo được: `useRecordStack().write` (`apps/app/components/crm/record-sheet/record-stack.ts`) ghi `[SEARCH_PARAM.record.tab]: null` mỗi lần mở hay đóng ngăn, nên xoá luôn tab của trang soạn.

Sửa: đăng ký hai khoá riêng trong `SEARCH_PARAM.okr` — `tabSoan: "tabSoan"`, `locSoan: "locSoan"` — và xoá
`thamSo` khỏi `cau-hinh.ts`. `khung-soan.tsx` và `bang-nhap.tsx` đọc khoá từ `SEARCH_PARAM`. Ca kiểm sẵn có
`search-param-keys.test.ts` («gives every feature its own url key») nay canh được hai khoá này.

### Ngoài-4 — hoàn tác cả nhóm thất bại không báo gì

`NhomMucTieu` (`soan/the-nhap.tsx`) gọi `n.hoan(mt, keo)` từ biên nhận nhóm. Lỗi của lệnh được ghi dưới mã dòng
Mục tiêu (`n.loi[mt.id]`), nhưng dòng Mục tiêu đang ẩn trong biên nhận (`trongNhom`), còn `batchDecided` của
`KaraProposalGroup` không có chỗ hiện lỗi.

Sửa: `KaraProposalGroup` (`packages/ui/src/components/kara/proposal.tsx`) nhận thêm `batchDecided.error?: ReactNode`
và vẽ nó bằng `FieldError` mang `data-loi="nhom"` ngay dưới biên nhận nhóm. `NhomMucTieu` truyền `n.loi[mt.id]`. Biên nhận vẫn còn, Hoàn tác
bấm lại được; lần sau thành công thì `datLoi(mt.id, undefined)` xoá câu lỗi (đường sẵn có trong `ghi`).

### Ngoài-5 — lần nộp bị từ chối vẫn thành mốc

`mocTuTranscript` (`soan/moc-nop.ts`) lấy mọi lời gọi `nop_ban_nhap` trong hội thoại và đọc `item.input`, không xét
kết quả. Công cụ trả `ketQua: "da-ghi" | "tu-choi"` (`apps/agent-okr/agent/lib/nop-ban-nhap.ts`, `ketQuaNop`).

Sửa:
- Tập giá trị `KET_QUA_NOP = ["da-ghi", "tu-choi"]` và schema đọc `docKetQuaNop(value): { ketQua, lyDo } | null`
  sống ở `packages/validation/src/okr-cuoc-soan.ts`; `ketQuaNop` của agent dùng chung `KET_QUA_NOP` (một nguồn).
- `mocTuTranscript` chỉ tạo mốc cho lần nộp có `ketQua: "da-ghi"`; lần `tu-choi`, lần lỗi công cụ
  (`failed`), và lần mà kết quả không đọc được đều KHÔNG thành mốc và KHÔNG làm gốc so sánh cho lần sau. Hàm trả
  thêm một danh sách «lần nộp không thành» để hội thoại vẽ dòng hệ thống.
- `gioNopCuoi` (dòng phụ «sửa lúc HH:MM») lấy lần nộp đã ghi cuối, không lấy lần bị từ chối.
- Hội thoại vẽ lần nộp không thành bằng `KaraSystemLine`: «Kara nộp bản nháp chưa được — <lý do>»; kết quả không
  đọc được thì «Kara nộp bản nháp nhưng không đọc được kết quả».

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: trưởng phòng ở tab Bản nháp (khổ hẹp) → bấm tên một bản ghi để mở ngăn bên cạnh → xem → đóng ngăn → vẫn ở tab Bản nháp, bộ lọc giữ nguyên (điểm ra: trang soạn như trước khi mở).
- Biên: Kara nộp ba lần, lần giữa bị từ chối → hội thoại có hai mốc và một dòng hệ thống ở chỗ lần bị từ chối.
- Lỗi & quay lại: Hoàn tác cả nhóm bị từ chối hay mất mạng → câu lỗi dưới biên nhận nhóm → bấm Hoàn tác lần nữa.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trang soạn OKR `/okr/soan/<cuộc>` | Soạn bộ OKR cùng Kara | Theo đơn vị / về Theo đơn vị |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-soan-hep-co-ban-ghi | Trang soạn (khổ hẹp) | Tab Bản nháp còn chọn, ngăn bản ghi mở với tab của nó | Đóng ngăn, sửa bản nháp tiếp |
| ST-soan-hoan-nhom-loi | Trang soạn | Biên nhận «Đã thêm Mục tiêu N và k KR» + câu lỗi dưới nó, nút Hoàn tác còn bấm được | Bấm Hoàn tác lại |
| ST-soan-nop-tu-choi | Trang soạn | Dòng hệ thống «Kara nộp bản nháp chưa được — <lý do>» ở chỗ lần nộp, không có mốc | Chờ Kara nộp lại, hoặc hỏi Kara |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Câu lỗi dưới biên nhận nhóm dùng đúng câu của lỗi từng dòng: «dòng cũ» khi cuộc còn đang soạn, «cuộc đã đóng» khi không, «mất mạng» khi lỗi mạng.
- Khoá URL mới không đổi khi chuyển khổ rộng ↔ hẹp; bộ lọc «chỉ dòng chờ» giữ qua mở/đóng ngăn.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KaraProposalGroup` | mở rộng (`batchDecided.error`) | lỗi của biên nhận nhóm hiện ngay dưới nó, màn gọi không tự dựng |
| `FieldError` | dùng | câu lỗi cùng khuôn với lỗi từng dòng |
| `KaraSystemLine` | dùng | lần nộp không thành là một sự kiện của cuộc, không phải lời Kara |
| `KaraCheckpoint` | dùng | mốc chỉ còn cho lần nộp đã ghi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: (ii) giữ nguyên khuôn K2 đã duyệt 07/10; vòng này không đổi bố cục, chỉ sửa ba trạng thái.

## Ngoài phạm vi

- Ngoài-1, 2, 6, 7 của K2 (anh chọn ghi Known limits).
- Giữ tương thích cho link cũ mang `tab=`/`loc=` của trang soạn.
