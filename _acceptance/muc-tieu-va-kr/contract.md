---
schema_version: 1
feature: Mục tiêu và KR trong cùng một khung — danh sách, sheet chi tiết và Chấm điểm
slug: muc-tieu-va-kr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-01T23:53:47Z
design_doc: docs/superpowers/specs/2026-10-02-muc-tieu-va-kr-design.md
---

# Acceptance Contract: muc-tieu-va-kr

## Context

Ở «OKR của tôi», «Theo đơn vị» và «Chấm điểm», tiêu đề mục tiêu nằm ngoài khung còn KR nằm
trong, và hàng mục tiêu không mang con số nào — người đọc không thấy KR nào đo mục tiêu nào,
cũng không thấy các KR cộng lại thành gì. Vòng này đưa mục tiêu vào cùng khung với KR như một
hàng cha có tiến độ lấy từ API, đánh số KR, gộp ô tiến độ, thêm «Vì sao lúc này» và «Góp vào»
vào sheet chi tiết, và chừa sáu điểm cắm cho lượt Kara góp ý. Không đổi API hay dữ liệu.

Source input: prompt (phiên «Phân tích và hoàn thiện OKR», 02/10) + proto
`/proto/muc-tieu-va-kr`.

## Criteria

- AC-1: Given người dùng phụ trách một mục tiêu đã công bố có ≥ 2 KR trong chu kỳ hiện tại,
  When mở «OKR của tôi», Then mục tiêu là một hàng nằm TRONG cùng bảng với các KR của nó (một
  phần tử `table` chứa cả hàng mục tiêu lẫn hàng KR, không có tiêu đề mục tiêu nào nằm ngoài
  khung bảng), và hàng đó hiện % bằng đúng `progress` mà `okr.mine` trả cho mục tiêu, vạch kỳ
  vọng tại `expected`, dấu nhịp, và dòng «Tính từ N KR» với N = số KR. (cross-layer)
- AC-2: Given một đơn vị có ≥ 3 mục tiêu, When mở «Theo đơn vị», Then mỗi mục tiêu là một
  khung riêng mở đầu bằng hàng mục tiêu, ngay sau là các hàng KR của chính nó theo thứ tự mang
  nhãn KR1…KRn; hàng tiêu đề cột không chiếm chỗ nhìn thấy nào (chỉ cho trình đọc màn hình) nên
  tiêu đề cột không lặp ra mắt giữa các khung.
- AC-3: Given danh sách đang mở mọi mục tiêu, When người bấm nút mũi tên (hoặc nhấn Enter/Space
  khi nút có focus) của một mục tiêu, Then các hàng KR của mục tiêu đó rời DOM, nút mang
  `aria-expanded="false"`, URL có `thuMucTieu` chứa id mục tiêu; tải lại trang thì vẫn thu;
  mở lại cái cuối cùng thì khoá rời URL; id trong URL không tồn tại bị bỏ qua; mũi tên không
  chuyển động khi `prefers-reduced-motion: reduce`.
- AC-4: Given các KR kiểu tăng tới, giảm xuống có khởi điểm ≠ 0, mốc, và KR nguồn máy, When
  bảng vẽ, Then mỗi hàng KR có một ô tiến độ gộp: dòng số của `SoCuaKr` như hiện nay («hiện tại / đích»;
  mốc: «Xong»/«Chưa xong») cùng %, thanh và nhịp; dòng phụ dưới tên ghi «<Kiểu> · từ <khởi điểm>» khi khởi điểm ≠
  0; không còn cột «Đích»; KR nguồn máy vẫn có dấu nguồn, số đo cạnh, nút mở sổ số và ghi chú
  chưa chụp như trước.
- AC-5: Given một mục tiêu chưa có KR, When danh sách vẽ, Then dưới hàng mục tiêu có một hàng
  «Mục tiêu này chưa có KR.» và ô tiến độ của mục tiêu ghi «Chưa có KR để tính».
- AC-6: Given một mục tiêu có `whyNow`, góp vào một mục tiêu khác qua một KR, và có ≥ 2 KR, When
  mở sheet chi tiết, tab KR, Then thấy theo thứ tự: khu «Vì sao lúc này» mang đúng `whyNow`;
  khu «Góp vào» liệt mỗi nơi góp «tên mục tiêu · đơn vị · qua KR «tên KR»»; bảng KR đánh số với
  ô tiến độ gộp; dòng «Tiến độ mục tiêu X% tính từ N KR» với X = `progress`; menu từng KR, cột
  việc, cảnh báo thiếu đối trọng và nút Thêm KR vẫn có như trước. `whyNow` trống → không có khu
  «Vì sao lúc này»; không góp vào đâu → không có khu «Góp vào». (cross-layer)
- AC-7: Given một chu kỳ ở pha chấm điểm, When mở «Chấm điểm», Then mỗi mục tiêu là hàng đầu
  của bảng chấm (trong cùng khung với KR) mang tên, người phụ trách và điểm hoặc «đã chấm k/n»;
  KR mang nhãn KR1…KRn; «Điều học được» và «Mang sang» nằm trong cùng khung đó; chấm một KR và
  ghi điều học được vẫn lưu như trước.
- AC-8: Given `SimpleTable`/`SimpleTableRow` của `packages/ui`, When một hàng mang `nested`
  hoặc `joined`, hoặc bảng mang `header="sr-only"`, Then `nested` cho nền hàng con, `joined` bỏ
  vạch dưới (mỗi thuộc tính độc lập), `header="sr-only"` giữ đủ `th` trong DOM nhưng hàng tiêu
  đề không chiếm chỗ nhìn thấy; và không tệp
  nào trong `apps/app/app/(app)/[slug]/okr/**` hay `objective-sheet.tsx` đặt lớp màu nền, viền
  hoặc bo góc lên `SimpleTableRow` tại chỗ gọi.
- AC-9: Given `BangMucTieu` và bảng KR của sheet, When không truyền điểm cắm nào, Then không có
  hàng hay khoảng trống thừa so với khi không có tính năng điểm cắm; When truyền đủ sáu điểm
  cắm, Then nội dung nằm đúng chỗ (cuối hàng nhãn tiêu đề; một hàng trước KR1; một hàng dính
  ngay dưới đúng KR không có vạch giữa; ngay sau tên KR), mở/thu nghe theo `dangMo`/`onDoiMo`,
  và khối bao mỗi mục tiêu mang `data-muc-tieu` (đúng một khối mỗi mục tiêu), hàng mục tiêu
  trong khối mang `data-hang-muc-tieu`, hàng KR mang `data-kr` và nằm trong đúng khối của mục tiêu
  mình.
- AC-10: Given khung 375 px và dữ liệu có ≥ 2 mục tiêu, mỗi mục tiêu ≥ 2 KR, cùng một chu kỳ
  đang ở pha chấm điểm, When mở «Của tôi», «Theo đơn vị», sheet chi tiết và «Chấm điểm»,
  Then không màn nào tràn ngang (`scrollWidth == innerWidth`), và tiến độ của mục tiêu và KR
  nằm dưới tên chứ không thành cột riêng.
- AC-11: Given các hồ sơ đã ký có eval đo những tệp vòng này sửa, When chạy lại các eval máy
  của chúng tại đỉnh nhánh, Then mọi eval đó vẫn đạt kỳ vọng — móc DOM, chữ và mã mà chúng bám
  không bị vòng này làm gãy.
- AC-12: Given ảnh «Của tôi», «Theo đơn vị» và sheet chi tiết ở 1440 px cả hai theme, When một
  người chưa xem proto nhìn, Then họ chỉ ra đúng KR nào thuộc mục tiêu nào và tiến độ của mục
  tiêu là bao nhiêu mà không cần đọc mã. (judgment)
- AC-13: Given «Của tôi» và «Theo đơn vị», When dữ liệu đang tải, tải lỗi hoặc rỗng, Then trạng
  thái đang tải, lỗi (nút Thử lại) và rỗng sẵn có vẫn hiện như trước, cùng mã `data-trang-thai`
  đang có trên onehub (`ST-donvi-dangtai`, `ST-donvi-loi`, `ST-cuatoi-rong`, `ST-donvi-rong`,
  `ST-donvi-chuakychay`), và nút Thử lại gọi tải lại đúng một lần.

## Coverage

- Trục A — bề mặt: Của tôi | Theo đơn vị | sheet chi tiết | Chấm điểm [thước CE: bốn nơi dùng
  `KhoiMucTieu`/`BangKr`/`KhoiMucTieuCham`, grep `apps/app` 02/10 — SUY-TỪ-REPO:
  `apps/app/app/(app)/[slug]/okr/`, `apps/app/components/crm/record-sheet/objective-sheet.tsx`]
- Trục B — dạng dữ liệu: đủ KR | 0 KR | KR mốc | KR giảm xuống / khởi điểm ≠ 0 | KR nguồn máy
  (chưa có số / số đo cạnh) | chưa có kỳ vọng | không `whyNow` / không góp vào [thước CE:
  `krOutput`, `mucTieuOutput` trong `apps/api/src/okr/okr.contracts.ts`; sáu «Kiểu KR» trong
  `CONTEXT.md`]
- Trục C — thao tác: đọc | thu/mở + URL | mở sheet | hành động KR sẵn có | chấm điểm | điểm cắm
  Kara [thước CE: proto `muc-tieu-va-kr` + tin điểm cắm phiên Kara 02/10]
- Trục D — khung nhìn: 1440 | 375 × sáng | tối [thước CE: `~/.claude/rules/web/testing.md`]
- Lớp cắt ngang: móc DOM hồ sơ đã ký (AC-11) · tiếng Việt, `translate="no"` · bàn phím,
  `aria-expanded`, giảm chuyển động (AC-3).
- [NGÀNH: Asana Goals] mục tiêu cha hiện tiến độ tính từ mục tiêu con; [NGÀNH: Perdoo] tiến độ
  objective tính từ key result — ứng viên đã nhận (AC-1).
- Later: bấm hàng KR mở sheet KR; trọng số từng KR hiện trên hàng; Toàn cảnh / Cập nhật tuần
  cùng khuôn.
- Never: thanh góp phần từng KR vào % mục tiêu — thêm nhiễu, % đã đủ.

## Out of scope

- «Toàn cảnh», «Cập nhật tuần», cây căn chỉnh — giữ bố cục hiện có.
- Đổi API để biết chương trình có bật trọng số, nên dòng phụ chỉ ghi «Tính từ N KR».
- Chuyển `DataTable` sang dùng `SimpleTableRow nested`.
- Nội dung Kara (nhãn góp ý, hàng góp ý) — lượt `gop-y-dung-cho`; vòng này chỉ chừa điểm cắm.
- Bấm hàng KR để mở sheet KR (hiện chỉ bấm số mở sổ số).

## Notes

- Hướng ở bậc 1 của «Vẽ tay là bậc cuối» (`SimpleTable` mở rộng); ReUI tra «table with grouped
  parent rows and nested child rows» không có bảng nhóm.
- Móc DOM và chuỗi mã mà các hồ sơ đã ký đang đo: design doc mục «Móc DOM phải giữ» — AC-11.
- `packages/ui/src/components/simple-table.tsx` và `packages/ui/src/lib/row-accent.ts` thuộc
  lượt này; `nen-kara` chạy song song không chạm hai tệp đó; S4 hai bên xếp tuần tự.
