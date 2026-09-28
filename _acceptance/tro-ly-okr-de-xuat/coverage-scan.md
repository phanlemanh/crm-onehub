# Quét độ phủ tiêu chí — tro-ly-okr-de-xuat

Preset: entity-feature (danh từ trung tâm là **Đề xuất**), cộng trục kiểu hỏng của
risk-premortem và trục nấc công tắc.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, bản rẽ của `trycompai/crm` — chân sản phẩm: mục «OneHub
  là gì» và các mục Trợ lý OKR, Đề xuất [SUY-TỪ-REPO: CONTEXT.md]; lộ trình
  [SUY-TỪ-REPO: docs/plan/lo-trinh-tro-ly-okr.md]; thiết kế §4.3, 4.5, 4.9, 4.11, 6.3
  [SUY-TỪ-REPO: docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md]; hồ sơ
  cơ hội [SUY-TỪ-REPO: _acceptance/tro-ly-okr-de-xuat/opportunity.md]; nền 9a
  [SUY-TỪ-REPO: _acceptance/tro-ly-okr-nen/contract.md].
- Chân ngành: góp ý AI đứng cạnh bản gốc, người chọn «Update» hay «Dismiss» từng gợi ý
  [NGÀNH: Tability AI feedback F02 — docs/reports/2026-09-26-tro-ly-okr/01-tability-chinh-chu.md];
  lập kế hoạch có AI gợi ý mà người chốt [NGÀNH: Cascade AI-assisted planning —
  03-doi-thu-okr.md]; chế độ ẩn trước khi bật (mô hình mới chạy song song trên lưu lượng
  thật, kết quả không tới người dùng) [NGÀNH: shadow deployment — thực hành phát hành mô
  hình ML, cùng khuôn «dark launch»].

## Trục

- **Trục A — loại dòng:** A1 viết lại tên Mục tiêu · A2 viết lại «vì sao lúc này» ·
  A3 viết lại tên KR · A4 câu hỏi chất lượng · A5 Căn chỉnh · A6 dòng xu hướng (mã, không
  model)
  [thước CE: bảng «Người dùng thấy» của 9b trong lộ trình mục 5; `dongDeXuat` của
  `packages/validation/src/okr-tro-ly.ts`]
- **Trục B — vòng đời một đề xuất:** B1 sinh (bấm → hàng việc → bộ kiểm → ghi) · B2 hiện
  (đang soạn, rỗng, lỗi, tắt, hết trần) · B3 quyết (nhận, sửa rồi nhận, bác, bỏ qua) ·
  B4 hết hạn và không mời lại · B5 đo (nhận/sửa/bác/hoàn tác, độ trễ, chi phí)
  [thước CE: preset entity-feature «Lifecycle»; bảng «Luật của sổ đề xuất» §4.9]
- **Trục C — người × nấc:** C1 người sửa được Mục tiêu (chủ, trưởng đơn vị, quản trị ở cấp
  OneHub) · C2 người phụ trách KR · C3 người không sửa được và vai «chỉ OKR» · C4 quản
  trị chương trình ở chế độ ẩn · C5 máy (dispatch, dọn việc treo, kiểm sẵn sàng) —
  mỗi người đứng ở ba nấc tắt · chế độ ẩn · bật
  [thước CE: §4.7 bảng «Phạm vi và principal»; AC «một phép đo cho mỗi đường vào» của
  `vai-chi-okr`]
- **Trục D — kiểu hỏng:** sai (số mới, id ngoài gói, từ cấm, NG) · chết (việc bị đóng giữa
  chừng, kiểm khoá cũ chặn, quá 30 giây) · rò (lộ ở chế độ ẩn, người không quyền gọi được) ·
  vượt tiền (trần người/ngày, trần tháng, chạy lại khi đầu vào không đổi) · trùng (mời lại
  dòng đã bác, quyết hai lần)
  [thước CE: preset risk-premortem; «Ngoài-32, Ngoài-33, Ngoài-36» của Cổng Bằng chứng 9a]

## Ô có nghĩa (A × D, đường vào và nấc ghi trong ô)

| | sai | chết | rò | vượt tiền | trùng |
|---|---|---|---|---|---|
| A1–A3 viết lại | **1** số mới, từ cấm, NG | **6** đóng giữa chừng · **7** khoá cũ | **8** ẩn lộ ra người · **9** người không sửa được | **10** trần người/ngày, dùng lại theo băm | **4** mời lại đã bác · **5** quyết hai lần |
| A4 câu hỏi | **2** hỏi trùng luật lượt 7 | như 6 | như 8 | như 10 | **4** hỏi lại mã đã bỏ qua |
| A5 Căn chỉnh | **3** đích ngoài tập máy chủ lọc | như 6 | — | — | **4** mời lại đích đã bác |
| A6 xu hướng | **11** số sai, hiện ở KR không có dữ liệu | — | — | — | — |
| B2 hiện | **12** đủ trạng thái rỗng, lỗi, tắt, hết trần | **12** quá 30 giây | — | — | — |
| B3 quyết | **13** ghi qua đường có quyền, một hàng vết | — | **9** | — | **5** |
| B5 đo | **14** tỷ lệ, độ trễ, chi phí đọc được | — | — | **15** chi phí mỗi đề xuất nhận | — |
| C4 chế độ ẩn | **16** máy chạy khi sửa, quản trị chấm | — | **8** | **10** lượt ẩn tính vào trần tháng | — |
| Eval | **17** ca mẫu M, judge ZDR | — | **18** judge qua nhà cung cấp không ZDR | — | — |

## Core → ứng viên AC

1. Bộ kiểm lúc ghi: không số mới, id thuộc gói, từ cấm, NG (A1–A5 × sai) → AC-4.
2. Câu hỏi của model không lặp mã luật lượt 7 đã hỏi (A4 × sai) → AC-4.
3. Căn chỉnh chỉ trong tập đích máy chủ đã lọc (A5 × sai) → AC-4.
4. Bác rồi không mời lại, theo khoá từng loại dòng (× trùng) → AC-5.
5. Quyết một lần, nhận ghi qua đường có quyền trong một giao dịch, một hàng vết mang
   «theo đề xuất của Trợ lý OKR» (B3) → AC-6, AC-7.
6. Việc không bị đóng giữa chừng khi phiên con chạy lâu (× chết, Ngoài-32) → AC-10.
7. Kiểm khoá cũ không chặn sau khi khoá đã cắm (× chết, Ngoài-33) → AC-11.
8. Chế độ ẩn: người dùng không thấy gì ở mọi đường vào; quản trị thấy (× rò) → AC-12.
9. Nút chỉ với người sửa được; người khác và vai «chỉ OKR» bị từ chối ở tRPC và REST
   (C3 × rò) → AC-1, AC-9.
10. Trần người/ngày, dùng lại theo băm, ẩn tính vào trần tháng (× vượt tiền) → AC-3, AC-12.
11. Dòng xu hướng tính bằng mã, chỉ hiện ở KR có dữ liệu (A6) → AC-8.
12. Đủ trạng thái của hộp thoại (B2) → AC-2.
13. Thước nhận · sửa · bác · hoàn tác, độ trễ, chi phí (B5) → AC-13.
14. Eval ca mẫu có judge ZDR, đổi sang ca thật là đổi thư mục (Eval) → AC-14.

## Later

- Góp ý trên màn Cập nhật tuần — thiết kế §6.3 «Ngoài phạm vi».
- Trạng thái `da-sua-theo` cho dòng câu hỏi khi trường đổi trong 7 ngày (đọc `OkrTrail`)
  — đếm được sau bằng thước SQL, không cần máy chạy ở lượt này; lượt này chỉ có «bỏ qua».
- Hiệu chỉnh judge bộ NG với người (20 đầu ra) — bộ NG chạy bằng mã chặn cứng và judge
  tham khảo; hiệu chỉnh ở lượt kế (§4.11 «chủ kho chấm một bộ mỗi lượt»).
- Màn quản trị vẽ biểu đồ tỷ lệ theo tuần — lượt này có con số và thước SQL.

## Never

- Máy ghi thẳng vào OKR khi không ai bấm nhận — luật 9a «máy không ghi vào OKR».
- Góp ý tự đến với người dùng khi không ai bấm — hồ sơ cơ hội bác (mùa đầu giữ «khi bấm»).
- Trợ lý điền số, khởi điểm, đích hay mức tự tin — NG-05.
- Đọc dữ liệu đối tác để góp ý — vai «chỉ OKR» và cách ly 9a.
- Điểm tổng cho cả bộ OKR — tinh thần NG-07 (thiết kế F06).

## Cross-cutting áp mọi ô Core

- ZDR cho mọi lời gọi model, kể cả judge của eval.
- Trạng thái đang tải, rỗng, lỗi trên mọi bề mặt mới; nhãn mang đủ tên «Trợ lý OKR».
- Chữ người nhập không dịch, đánh dấu `translate="no"`.
- Mọi hằng tinh chỉnh được (trần ngày, nhịp hỏi lại, trần chờ, nhịp chế độ ẩn) ở một tệp
  cấu hình theo khu.
