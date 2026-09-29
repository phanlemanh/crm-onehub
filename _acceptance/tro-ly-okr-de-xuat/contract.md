---
schema_version: 1
feature: Góp ý khi bấm — người sửa được một Mục tiêu hay KR bấm «Nhờ Trợ lý OKR góp ý» trong hộp thoại sửa, nhận vài đề xuất (câu cũ cạnh câu mới, câu hỏi chất lượng, chỗ Căn chỉnh) rồi nhận, sửa hay bác từng dòng; dòng xu hướng tính bằng mã cạnh ô đích; quản trị bật theo ba nấc tắt · chế độ ẩn · bật cho từng việc và từng đơn vị; dựng và đo trên bộ OKR mẫu, dữ liệu thật là điều kiện bật
slug: tro-ly-okr-de-xuat
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-28T08:10:11Z
design_doc: docs/superpowers/specs/2026-09-28-tro-ly-okr-de-xuat-design.md
---

# Acceptance Contract: tro-ly-okr-de-xuat

## Context

Lượt 9b của lộ trình Trợ lý OKR, làn A. Nền 9a (#182) đã có subagent `tro_ly_okr`, sổ chi phí,
trần $9, công tắc hai nấc theo việc × đơn vị, bảng `OkrDeXuat` — nhưng chưa màn nào gọi trợ lý
và chưa ai thấy đề xuất. Lượt này thêm nút và cột đề xuất trên hộp thoại Mục tiêu và KR,
năm thủ tục mới, bộ kiểm bằng mã, luật sổ đề xuất, ghi có giao dịch khi nhận, dòng xu hướng
(DO-06), chế độ ẩn, thẻ số đo cho quản trị, eval trên ca mẫu của hạng mục M có judge ZDR,
và vá hai lỗi 9a tách ra (việc bị đóng giữa chừng; kiểm khoá cũ chặn mãi).

Thay đổi 28/09 (Manh Phan): dựng trên bộ OKR mẫu `bo-okr-mau`, không chờ N1; bật khi N1 có ít
nhất 12 ca thật đạt cùng ngưỡng như ca mẫu. ZDR bắt buộc, trần $9/tháng của khu OKR giữ nguyên.

Hạng T3 thay cho T2 của lộ trình: chế độ ẩn theo đơn vị và chỗ ghi dòng bị bộ kiểm loại
cần một migration chỉ thêm (thiết kế §3.1, §5, §12).

Source input: `docs/plan/lo-trinh-tro-ly-okr.md` mục 5 «9b»; `docs/plan/lo-trinh-okr.md` mục 5
«Dựng hết bằng dữ liệu mẫu» và dòng 9b mục 10 (PR #183); thiết kế `12-kien-truc-va-lo-trinh.md`
§4.3, 4.5, 4.7, 4.9, 4.11, 6.3; `_acceptance/tro-ly-okr-de-xuat/opportunity.md`;
`_acceptance/tro-ly-okr-nen/` (Ngoài-32, Ngoài-33).

## Criteria

- AC-1: Given bộ OKR mẫu với người sửa được một Mục tiêu (quản trị ở cấp OneHub, trưởng phòng ban ở Mục tiêu phòng ban), người phụ trách một KR, một thành viên không sửa được, một người vai «chỉ OKR», và đơn vị ở từng nấc tắt · chế độ ẩn · bật, When mỗi người mở hộp thoại sửa Mục tiêu và hộp thoại sửa KR, và gọi `okr.troLySanSang`, `okr.troLyDeXuat`, `okr.troLyDanhSach` và `okr.troLyQuyet` (nhận, sửa, bác, bỏ qua) qua tRPC và qua REST, Then nút «Nhờ Trợ lý OKR góp ý» chỉ hiện khi đơn vị ở nấc bật VÀ người đó sửa được đúng thứ đang mở (hộp KR: chỉ KR đó); `troLyDanhSach` chỉ trả dòng của những Mục tiêu và KR người gọi sửa được (người phụ trách KR: đúng dòng của KR đó); `troLyQuyet` — kể cả bác và bỏ qua, vốn không ghi OKR — từ chối 403 khi người gọi không sửa được đích của dòng; mọi ô còn lại của ma trận người × nấc × thủ tục không có nút và trả 403 hoặc lý do không sẵn sàng có tên; ma trận viết trước, số khẳng định bằng số ô × số thủ tục × hai đường. (cross-layer)
- AC-2: Given hộp thoại sửa Mục tiêu có nút góp ý, When người dùng đi qua từng trạng thái của bảng trạng thái trong thiết kế (nút; nút khoá vì còn sửa chưa lưu; đang soạn; có dòng; sửa một dòng; đã quyết; rỗng «không thấy chỗ nào cần sửa»; lỗi hoặc quá 30 giây với «Thử lại»; lỗi khi nhận; hết trần tháng «tạm nghỉ tới 01/MM»; hết lượt ngày; đang có đề xuất chờ) ở 1440 và 390, Then mỗi trạng thái hiện đúng chữ và điều khiển của bảng, không trạng thái nào tràn ngang, hộp chỉ mở rộng khi cột hiện, và ngừng hỏi lại khi đóng cột hay đóng hộp. (cross-layer)
- AC-3: Given người A có nút góp ý trên một Mục tiêu, When A bấm lần đầu, bấm lại khi đầu vào chưa đổi (kể cả khi lần trước ra «không thấy gì»), sửa tên rồi bấm, và bấm tới quá trần ngày, Then lần đầu ghi đúng một hàng `okr-de-xuat` nấc bật; lần bấm lại không ghi hàng mới và trả cùng kết quả; lần sau khi sửa ghi hàng mới; lượt thứ (trần ngày + 1) gọi model trả `het-tran-ngay` và không ghi hàng, trong khi lượt trả kết quả cũ vẫn chạy; và mọi hàng đều bị từ chối `het-tran-thang` khi chi tiêu tháng ≥ trần. (cross-layer)
- AC-4: Given một bảng ca viết trước cho bộ kiểm — mỗi mã loại (`id-ngoai-goi`, `so-moi`, `tu-cam`, `noi-ve-nguoi`, `chep-cap-tren`, `trung-luat`, `dich-ngoai-tap`, `da-bac`, `dang-cho`, `khong-doi`) một dòng đỏ và một dòng lành cùng dựng cảnh, When `nop_de_xuat` nhận các dòng đó, Then dòng lành được ghi trạng thái `cho`, mỗi dòng đỏ được ghi trạng thái `bi-loai` với đúng `maLoai` và không bao giờ trả về từ `troLyDanhSach`; And When `troLyDanhSach` đọc lại sau khi số của KR đổi, Then bộ kiểm chạy lại và một dòng nay mang số không còn trong đầu vào không hiện. (cross-layer)
- AC-5: Given một dòng viết lại tên KR đã bị bác, một câu hỏi `kr-la-viec` đã bỏ qua, và một Căn chỉnh tới đích X đã bác, When trợ lý nộp lại đúng các khoá đó ở lượt sau, Then cả ba bị loại `da-bac`; When người dùng tự sửa tên KR đó rồi bấm lại, Then khoá viết lại tên KR mở ra; And Given một dòng `cho` có `truoc` khác giá trị hiện tại, When đọc danh sách, Then dòng thành `het-han` và không hiện.
- AC-6: Given một dòng viết lại tên Mục tiêu, một dòng viết lại tên KR, một Căn chỉnh và một câu hỏi đang chờ, When người sửa được lần lượt Nhận, Sửa rồi nhận (giá trị khác câu mới), Nhận Căn chỉnh và Bỏ qua câu hỏi, Then mỗi lần Nhận hay Sửa ghi đổi qua đường có quyền của OKR trong đúng một giao dịch với cập nhật trạng thái có điều kiện: trường đổi đúng giá trị, đúng một hàng `OkrTrail` có `note` `tro-ly-okr:<deXuatId>`, `OkrDeXuat` thành `nhan`/`sua` với `giaTriCuoi`, `nguoiQuyet`, `quyetLuc`; tab Vết hiện «theo đề xuất của Trợ lý OKR»; câu hỏi thành `bo-qua` không ghi OKR; And When hai lần quyết cùng một dòng chạy đồng thời, hoặc nhận khi chu kỳ đã khoá sửa hoặc trần số mục chặn, Then đúng một lần thành công, lần kia bị từ chối có lý do và không để lại hàng vết nào. (cross-layer)
- AC-7: Given `updateObjective`, `updateKeyResult`, `addAlignment` đã tách thân thành biến thể nhận giao dịch, When chạy các bài kiểm OKR sẵn có của API, Then tất cả xanh không sửa kỳ vọng nào; And When người dùng bấm «Hoàn tác» ở toast sau một lần Nhận trên màn, Then trường đọc lại qua API bằng `truoc` (khác `sau`) qua đường sửa thường, và thước hoàn tác đếm đúng dòng đó. (cross-layer)
- AC-8: Given một bảng điểm viết trước cho hàm xu hướng (ba điểm trở lên theo mỗi kiểu KR tăng tới · giảm xuống · giữ trên · giữ dưới · phần trăm; dưới ba điểm; KR mốc), When tính, Then mỗi ca ra đúng mức mỗi tuần và giá trị ước cuối kỳ (hoặc không có dòng); And When người phụ trách mở hộp thoại KR có nguồn CRM với ít nhất ba bản chụp, hoặc KR mang sang có ít nhất ba lần cập nhật, ở đơn vị nấc bật, Then dưới ô Đích có dòng xu hướng bằng đúng số hàm tính; KR khác, hoặc đơn vị không ở nấc bật, không có dòng. (cross-layer)
- AC-9: Given Chương trình OKR lưu qua đường ghi thật với mọi tổ hợp «Bật cho» × «Chế độ ẩn cho» (không đơn vị nào · toàn công ty · danh sách) cho từng việc, When hỏi nấc của từng đơn vị (OneHub, bộ phận, phòng ban trong bộ phận, Mục tiêu cá nhân), Then ra đúng nấc của bảng viết trước — bật thắng ẩn, bộ phận kéo phòng ban, danh sách rỗng là không đơn vị nào; một hàng cấu hình cũ đọc lên là mọi việc tắt; And When quản trị mở Cài đặt › Chương trình OKR, Then thẻ Trợ lý OKR có hai dòng «Bật cho» và «Chế độ ẩn cho» mỗi việc, lưu thành một phiên bản mới mang đúng các trường; thành viên và vai «chỉ OKR» không thấy và bị từ chối khi ghi. (cross-layer)
- AC-10: Given một Mục tiêu ở đơn vị chế độ ẩn, When người sửa được lưu nó với tên đổi, lưu lại lần nữa trong vòng 30 phút, và lưu khi trần lượt ẩn ngày đã đủ, Then lần đầu ghi đúng một hàng `okr-de-xuat` chế độ ẩn, hai lần sau không ghi; kết quả của lượt ẩn không hiện ở hộp thoại, ở `troLyDanhSach`, ở REST với bất kỳ người dùng nào; quản trị đọc được nó qua `okr.troLyAn` và thẻ «Góp ý của Trợ lý OKR»; chi phí của lượt ẩn có trong sổ và trong trần tháng. (cross-layer)
- AC-11: Given một việc góp ý mà phiên con `tro_ly_okr` chạy 90 giây có sự kiện đều, và một việc mà phiên con chết im sau 5 giây, When dọn việc treo chạy mỗi nhịp, Then việc thứ nhất không bị đóng `hong:het-lease` và kết thúc bằng mã của trợ lý; việc thứ hai đóng `hong:het-lease` trong vòng 90 giây kể từ sự kiện cuối, không phiên thứ hai.
- AC-12: Given Trợ lý OKR đang bật và việc kiểm sẵn sàng gần nhất ra «chưa có khoá mô hình», When khoá mô hình được cắm và thời gian trôi qua hạn của kết quả kiểm, Then trong vòng một nhịp dispatch sau hạn một việc kiểm mới được xếp (không gọi model) và `troLySanSang` trả sẵn sàng — không ai tắt bật; trước hạn thì không xếp lại; nhiều nhịp liền không xếp trùng.
- AC-13: Given một tháng có đề xuất ở mọi trạng thái cả hai nấc, lần hoàn tác trong và ngoài 7 ngày, dòng bị loại, và sổ chi phí, When quản trị mở thẻ «Góp ý của Trợ lý OKR» và khi chạy các câu SQL ở `rang/`, Then mỗi số trên thẻ (lượt, đề xuất đã hiện / sinh ra, nhận/sửa/bác/bỏ qua %, hoàn tác %, p50/p90, câu bị loại % theo mã, chi phí mỗi đề xuất được nhận ở cột Bật, chi phí mỗi lượt ở cột Ẩn) bằng đúng số của câu SQL cùng tên trên cùng kho, tách nấc bật và chế độ ẩn; «đã hiện» là dòng có `hienLuc` (ghi khi `troLyDanhSach` trả dòng lần đầu), nên dòng hết hạn chưa từng hiện không vào mẫu số; chi phí của nấc bật chỉ gồm sổ chi phí của việc nấc bật; And When quản trị mở một lượt, Then ngăn hiện từng dòng kể cả dòng bị loại và mã loại. (cross-layer)
- AC-14: Given các ca của `apps/agent/evals/okr/ca-gop-y/mau/` đọc bằng `docBoCaGopY`, When chạy eval Viết lại và NG với model thật có ZDR và judge `zai/glm-5.2-fast` có ZDR, Then mọi chốt bằng mã đạt ở mọi ca (không dòng nào còn lại mang mã loại; ca `khongGopY` không có dòng viết lại; mỗi `kyVong.vanDe` có dòng đúng trường; ca NG không `chep-cap-tren`, `noi-ve-nguoi`, `tu-cam`); điểm judge bộ Viết lại ≥ 0,7 sau khi chủ kho chấm 20 đầu ra và judge khớp ≥ 85%; mọi `defineEval` có judge khai ZDR (bài tĩnh); And When chạy eval độ trễ 20 lượt thật trên Mục tiêu của bộ mẫu, Then p50 ≤ 8 giây và p90 ≤ 15 giây. (judgment)
- AC-15: Given `CONTEXT.md`, `docs/api.md`, `docs/agent.md` và diff của lượt, When đọc, Then `CONTEXT.md` có mục «Chế độ ẩn»; `docs/api.md` §OKR nói bảy thủ tục mới, ai gọi được, và việc kích chế độ ẩn khi lưu; `docs/agent.md` mục chỗ rẽ liệt kê tệp của hãng lượt này chạm; và diff giữ luật kho — trí khôn ở `apps/agent`, khuôn parse ở biên trong `packages/validation`, không chú thích trong mã, hằng tinh chỉnh ở một tệp cấu hình mỗi khu, thành phần mới ở `packages/ui`. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — loại dòng:** viết lại tên Mục tiêu · «vì sao lúc này» · tên KR · câu hỏi · Căn chỉnh · xu hướng (mã)  [thước CE: bảng «Người dùng thấy» của 9b lộ trình mục 5; `dongDeXuat`]
- **Trục B — vòng đời một đề xuất:** sinh · hiện · quyết · hết hạn và không mời lại · đo  [thước CE: preset entity-feature «Lifecycle»; bảng «Luật của sổ đề xuất» §4.9 thiết kế]
- **Trục C — người × nấc:** người sửa được · người phụ trách KR · người không sửa được và vai «chỉ OKR» · quản trị ở chế độ ẩn · máy — × tắt · chế độ ẩn · bật  [thước CE: §4.7 thiết kế; AC «một phép đo cho mỗi đường vào» của `vai-chi-okr`]
- **Trục D — kiểu hỏng:** sai · chết · rò · vượt tiền · trùng  [thước CE: preset risk-premortem; Ngoài-32, Ngoài-33, Ngoài-36 của 9a]
- Chân ngành: góp ý đứng cạnh bản gốc, nhận hay bỏ từng gợi ý [NGÀNH: Tability AI feedback]; chế độ ẩn trước khi bật [NGÀNH: shadow deployment của mô hình ML].
- [GIẢ ĐỊNH] Hạng T3 vì chế độ ẩn theo đơn vị và chỗ ghi dòng bị loại cần cột mới; phương án T2 ở thiết kế §12.
- [GIẢ ĐỊNH] Chế độ ẩn do máy kích khi Mục tiêu hay KR trong phạm vi chế độ ẩn được lưu với chữ đổi; mỗi Mục tiêu tối đa một lượt ẩn trong 30 phút; cả workspace tối đa 40 lượt ẩn mỗi ngày.
- [GIẢ ĐỊNH] Nhận ghi ngay từng dòng, không đợi «Lưu»; nút góp ý khoá khi form còn sửa chưa lưu.
- [GIẢ ĐỊNH] Trần người/ngày 20 lượt gọi model; lượt trả kết quả cũ không tính.
- [GIẢ ĐỊNH] Dòng xu hướng đi theo nấc bật của việc góp ý, dù nó không gọi model.
- [GIẢ ĐỊNH] Judge là `zai/glm-5.2-fast` có ZDR; hiệu chỉnh bộ Viết lại ở lượt này, bộ NG ở lượt kế.

## Đường đo

- Thước: tỷ lệ đề xuất được nhận (nguyên văn hoặc sửa rồi nhận) ≥ 30%, CHẾT < 10% sau ≥ 30 đề xuất đã hiện · số từ: `OkrDeXuat` nấc bật có trạng thái `nhan`/`sua` trên số dòng nấc bật có `hienLuc` khác rỗng (dòng từng hiện cho người, kể cả sau đó hết hạn), đọc bằng `rang/ty-le-quyet.sql` · bảo đảm bởi: AC-6, AC-13
- Thước: hoàn tác ≤ 10% số đã nhận, CHẾT > 30% · số từ: `OkrTrail` của trường đã nhận quay về `truoc` trong 7 ngày, `rang/hoan-tac.sql` · bảo đảm bởi: AC-7, AC-13
- Thước: độ trễ p50 ≤ 8 giây, p90 ≤ 15 giây · số từ: `AgentTask.createdAt` tới `OkrDeXuat.createdAt` đầu tiên (hay `finishedAt` khi không có dòng), `rang/do-tre.sql` · bảo đảm bởi: AC-13, AC-14
- Thước: 0 dòng có số mới lọt qua bộ kiểm · số từ: một bộ trích số riêng, độc lập với bộ kiểm (chữ số có dấu chấm hay phẩy, hậu tố tỷ/triệu/nghìn/%, số viết bằng chữ), chạy trên `sau` so với `truoc` và ô số của mọi dòng từng hiện, `rang/so-moi-lot.mjs` · bảo đảm bởi: AC-4
- Thước: chi phí mỗi đề xuất được nhận ≤ 0,05 US$, tháng ≤ 9 US$, CHẾT khi chạm trần trước ngày 20 · số từ: `AiChiPhi` nối qua `taskId` tới việc nấc bật chia số `nhan`+`sua` nấc bật (chi phí chế độ ẩn không vào tử số; cột Ẩn đọc chi phí mỗi lượt), và ngày đầu tiên tổng `okr.*` cộng dồn cả hai nấc ≥ trần, `rang/chi-phi-moi-nhan.sql` · bảo đảm bởi: AC-10, AC-13

## Out of scope

- Góp ý trên màn Cập nhật tuần; góp ý khi tạo Mục tiêu mới.
- Trạng thái `da-sua-theo` cho câu hỏi khi trường đổi trong 7 ngày — đếm sau bằng thước SQL.
- Hiệu chỉnh judge bộ NG với người — lượt kế.
- Lý do `het-tran-gateway` — chưa đường nào sinh, không thuộc góp ý.
- Tóm tắt tuần (9c) — lượt này chỉ thêm hai cột chế độ ẩn cho nó.
- Chuyển ca thật N1 vào và bật cho người dùng — việc của chủ kho khi N1 có ca.
- Máy ghi vào OKR không qua người; góp ý tự đến với người dùng; điền số, đích, mức tự tin (NG-05); đọc dữ liệu đối tác.

## Notes

- Độ trễ góp ý khi bấm phụ thuộc tải máy đo: round 3 đo dưới tải ra p50 11,3 s / p90 22,5 s (trên ngưỡng 8 s / 15 s của AC-14), round 2 và round 4 máy rảnh lọt ngưỡng (round 4: 6,7 s / 11,1 s). Chủ kho gỡ giới hạn đã khai sau round 4 (29/09): E24 lại đòi thoát 0 và đo khi máy rảnh. Mọi công tắc tắt khi gộp; độ trễ trên OKR thật vẫn đo lại ở Cổng Giá trị trước khi bật cho người dùng.

### Known limits (Cổng Bằng chứng, 2026-09-29)

- Ngoài-1: báo cáo kiểm luật kho (`rang/luat-kho.mjs`) kết luận luật «không viết hai lần một đơn vị» đạt chỉ vì không phán quyết tay nào chứa chữ «TRÙNG»; dòng `1_000` ở thẻ số đo cùng nghĩa với giây của API nhưng nhãn tránh chữ đó.
- Ngoài-4: bộ kiểm góp ý (`apps/agent/evals/okr/gop-y.eval.ts`) tự khai lại đơn vị phút thay vì nhập `MINUTE_MS` dùng chung.
- Ngoài-5: phán quyết tay cho `NGAY_MS` trong cấu hình kiểm luật kho không khớp dòng nào, vì tệp cấu hình bị bỏ khỏi phần quét số.
- Ngoài-7: bộ quét luật kho chỉ lần theo import «./»; import «../» rơi thành «nguồn ngoài kho» mà báo cáo vẫn ghi sạch. Hiện chưa tệp nào dùng kiểu đó.
- Ngoài-8: danh sách dấu câu của bộ kiểm số viết bằng chữ có bản chép thứ hai trong biểu thức tách từ; thêm dấu vào cấu hình sẽ không có tác dụng.
- Ngoài-9: «một»/«năm» đứng trước «tỷ lệ», «tỷ trọng», «tỷ suất» bị đọc thành số mới, nên câu viết lại tốt có cụm đó bị loại lặng lẽ.
- Ngoài-10: phép đo số mới lọt qua (`rang/so-moi-lot.mjs`) dùng chung bảng quy tắc với bộ kiểm, nên một lỗi trong bảng làm cả hai cùng bỏ sót.
- Ngoài-11: bài kiểm bấm nút Hoàn tác khi hộp thoại mở chỉ kiểm tên class chứ không thử bấm thật.
- Ngoài-12: bài kiểm đóng hộp thoại khi bấm trong thông báo dùng thông báo giả viết tay đúng bộ chọn, không dùng thông báo thật.
- Ngoài-13: bài kiểm «bấm nút trong thông báo không đóng hộp» thiếu đối chứng dương (bấm chỗ khác thì đóng).
- Ngoài-15: ba biến `TDX_*` chỉ dùng cho bài đo góp ý chưa được khai trong `.env.example`.
- Ngoài-16: tiền tố ghi chú vết «tro-ly-okr:» được viết lại bằng regex ở màn tab Vết thay vì dùng chung một nguồn với phía ghi.
- Ngoài-17: thẻ «Góp ý của Trợ lý OKR» của quản trị đọc cả tháng lượt ẩn rồi mới lọc và cắt 50 trong bộ nhớ; có thể chậm dần khi số lượt lớn lên.
- Ngoài-20: khi kích lượt ẩn sau lưu hỏng, nhật ký chỉ ghi tên lớp lỗi, nuốt thông điệp lỗi.
- Ngoài-21: ca «không thấy dòng ẩn» ở nấc ẩn chỉ khẳng định danh sách rỗng, trong khi API về cấu trúc đã luôn trả rỗng ở nấc đó; một bài khác trong cùng tệp vẫn canh bộ lọc.
- Ngoài-22: bài kiểm nộp mười dòng bị loại dùng danh sách mười mã chép cứng, không rút từ `MA_LOAI_DE_XUAT`; mã thứ mười một sẽ không được kiểm.

## Iterations
