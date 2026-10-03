---
schema_version: 1
feature: Soạn OKR cùng Trợ lý — người sửa được OKR của một đơn vị mở một cuộc đối thoại với Trợ lý OKR cho đơn vị và chu kỳ đang lập kế hoạch; Trợ lý mang bối cảnh (hồ sơ công ty và chiến lược từ Kho tài liệu, đơn vị · mô tả · chức danh, OKR cấp trên và ngang cấp, kỳ trước tóm gọn, số CRM dạng tổng) vào cuộc, hỏi vài câu, đưa bản nháp bộ OKR trên bảng sống cạnh chat; người nhận · sửa · bác từng dòng, «Đưa vào bộ OKR» tạo cả bộ ở trạng thái nháp; chạy trên app eve riêng, vai «chỉ OKR» đi qua đường mới; dựng và đo trên bộ OKR mẫu
slug: soan-okr-cung-tro-ly
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-10-01T11:15:27Z
design_doc: docs/superpowers/specs/2026-09-30-soan-okr-cung-tro-ly-design.md
---

# Acceptance Contract: soan-okr-cung-tro-ly

## Context

Trợ lý OKR hôm nay (9b, #207) góp ý trên một Mục tiêu đã có, một lần bấm, không hội thoại và
không thấy công ty, chiến lược, đơn vị, kỳ trước. Chủ kho phải soạn bộ OKR với Claude bên ngoài
rồi chép vào CRM. Lượt này đưa việc soạn vào CRM dưới dạng **một cuộc đối thoại có bối cảnh**
cho một đơn vị và một chu kỳ đang lập kế hoạch, bản nháp trên bảng sống, nhận · sửa · bác từng
dòng, «Đưa vào bộ OKR» tạo cả bộ ở trạng thái nháp; người điền đích và công bố. Nền chat OKR
là một app eve riêng (`apps/agent-okr`), app Next gọi qua đường mới; vai «chỉ OKR» đi qua đường
đó mà không thấy dữ liệu đối tác. Hồ sơ công ty và chiến lược sống trong Kho tài liệu dưới loại
trang mới «chiến lược»; cây tổ chức thêm mô tả đơn vị và chức danh. Dựng và đo trên bộ OKR mẫu
Hải Đăng Logistics; dữ liệu thật là điều kiện bật.

Cổng Đáng ký 2026-09-30 (Manh Phan): build, giữ ngưỡng, chốt ba chỗ đổi (soạn trọn bộ nháp qua
đối thoại; hạng mục này dựng nền chat OKR thay cho C; trần riêng cho tháng đặt OKR). Hạng T3:
hai cột mới trên cây tổ chức, bảng cuộc soạn, cột mới trên sổ đề xuất, đường vào mới cho vai
«chỉ OKR». Giả định 1, 3, 5 đã thử (N-soạn 30/09, phép thử trên giấy §3.8 thiết kế).

Source input: `_acceptance/soan-okr-cung-tro-ly/opportunity.md` ·
`docs/superpowers/specs/2026-09-30-soan-okr-cung-tro-ly-boi-canh-design.md` (chủ kho duyệt 30/09)
· `docs/superpowers/specs/2026-09-30-soan-okr-cung-tro-ly-design.md` · `coverage-scan.md` ·
`docs/reports/2026-09-26-tro-ly-okr/N-soan-ket-qua.md` · `docs/plan/lo-trinh-tro-ly-okr.md` ·
`docs/agent.md` · `docs/api.md` · `docs/chat-ui.md` · `CONTEXT.md`.

## Criteria

- AC-1: Given bộ OKR mẫu với quản trị, trưởng bộ phận, trưởng phòng ban, người phụ trách KR không sửa được đơn vị, thành viên thường, và một trưởng phòng ban mang vai «chỉ OKR», chu kỳ ở pha lập kế hoạch, và việc soạn ở từng nấc tắt · chế độ ẩn · bật cho từng đơn vị, When mỗi người gọi `okr.soanSanSang`, `okr.soanMo`, `okr.soanDanhSachCuoc`, `okr.soanDanhSach`, `okr.soanQuyet`, `okr.soanDuaVao` qua tRPC và qua REST cho cấp OneHub, một bộ phận và một phòng ban, và mở phiên qua cửa `/eve/agents/okr/eve/v1`, Then nút và `soanMo` chỉ mở được khi người đó sửa được OKR của đơn vị VÀ (nấc bật, hoặc nấc ẩn và người là quản trị); mọi ô khác trả đúng giá trị viết trước ở `rang/ma-tran-quyen.md` — mỗi thủ tục một luật đóng, giá trị ô là một trong {mở, một mã lý do có tên, 403, 404}, không «hoặc» — 403 ở ba thủ tục theo đơn vị (`okr.soanSanSang`, `okr.soanMo`, `okr.soanDanhSachCuoc`), 404 cùng câu với mã cuộc không có ở ba thủ tục theo mã cuộc (`okr.soanDanhSach`, `okr.soanQuyet`, `okr.soanDuaVao`); cửa `/eve/agents/okr/eve/v1` vẫn trả 403 — kể cả ô nấc ẩn (trưởng phòng gọi `soanDanhSach`/`soanQuyet` trên cuộc quản trị mở → 404 cùng câu với mã cuộc không có), vai «chỉ OKR» ở cấp OneHub và bộ phận, `soanDuaVao` sau khi đơn vị chuyển sang nấc tắt; cửa mới chỉ kiểm phạm vi `okr`, không phát id đối tác, và người vai «chỉ OKR» mở được phiên trên đơn vị mình sửa được; bài đọc bảng lúc chạy, số khẳng định bằng số ô × số thủ tục × hai đường. (cross-layer)
- AC-2: Given một cuộc soạn của phòng ban mẫu có kỳ trước đã khép, cấp trên đã công bố, hai trang loại «chiến lược» đang dùng, và người mở cuộc lần lượt là trưởng phòng ban thường và trưởng phòng ban vai «chỉ OKR», When gói bối cảnh được dựng, Then gói có đúng thứ tự lời dặn tĩnh → lớp 0 và 5 (chỉ bản đang dùng) → lớp 1 và 1n (mô tả đơn vị và đơn vị cha, chức danh — không tên người) → lớp 2a (cấp trên đủ KR và tiến độ, ngang cấp chỉ tên, ứng viên Căn chỉnh có id) → lớp 3 (kỳ trước tóm gọn bằng mã) → lớp 4 (bảy chỉ số CRM dạng tổng) → thang chấm và trần; lớp 4 rỗng cho vai «chỉ OKR»; không tên thành viên nào trong gói (tập tên đối chiếu phải có ≥ 40 tên trước khi so — tập rỗng là bài đỏ); mỗi lớp bọc thẻ dữ liệu; thước cỡ gói ước đúng hệ số và khi gói vượt trần thì cắt theo thứ tự lớp 3 → ngang cấp → KR cấp trên, không bao giờ cắt lớp 0, 5, 1, và bảng «đã cắt gì» ghi vào cuộc. (cross-layer)
- AC-3: Given màn Cây tổ chức của quản trị, When quản trị ghi mô tả ≤ 500 ký tự cho một bộ phận và một phòng ban, ghi chức danh ≤ 80 ký tự cho một người, và ghi quá trần, Then hai trường lưu qua đường `to-chuc.*` có quyền, `tree()` trả về chúng, quá trần bị từ chối có tên, thành viên và vai «chỉ OKR» đọc được mà không ghi được; migration chỉ thêm ba cột có mặc định rỗng và bản ghi cũ đọc lên bình thường. (cross-layer)
- AC-4: Given Kho tài liệu, When quản trị tạo một trang loại «chiến lược», gửi bản đề xuất 24.310 ký tự, rồi bản 19.000 ký tự có chữ «thưởng quý» và «xếp hạng», rồi duyệt, Then bản quá trần bị từ chối «Trang chiến lược tối đa 20.000 ký tự (đang 24.310)»; bản có từ cấm duyệt được nhưng màn duyệt hiện cảnh báo nêu đúng các chữ; `docTrangChienLuocDangDung()` chỉ trả bản đang dùng, không trả bản đề xuất hay trang loại khác; loại «chiến lược» có trong `LOAI_TRANG` và màn tạo trang. (cross-layer)
- AC-5: Given app `apps/agent-okr` chạy cạnh `apps/agent` trên hai cổng, When một phiên soạn mở qua cửa mới và đi bốn lượt (mở đầu, trả lời, đưa bản nháp, sửa qua chat), Then tác nhân giữ lịch sử qua các lượt (lượt 4 nhắc đúng nội dung lượt 3), mọi lời gọi model mang cờ ZDR và `thinkingLevel: low`, tập công cụ của phiên chỉ có `nop_ban_nhap` (mọi công cụ dựng sẵn trả từ chối, không công cụ đối tác nào tồn tại trong app), sổ chi phí ghi từng lượt theo phiên, lượt thứ 13 bị cửa từ chối `het-luot-cuoc`, cuộc thứ 4 của đơn vị trong chu kỳ bị `het-cuoc-ky`, và khi sổ tháng chạm trần (trần riêng tháng đặt OKR khi tháng nằm trong cửa lập kế hoạch ba tháng của một chu kỳ pha lập kế hoạch như AC-10 định nghĩa, bằng trần thường khi không đặt) thì `soanMo` và cửa từ chối `het-tran-thang`. (cross-layer)
- AC-6: Given một bảng ca viết trước cho bộ kiểm bản nháp — mỗi mã loại (`so-moi` kể cả trong tên KR và tên Mục tiêu, `dich-khong-trong`, `noi-ve-nguoi`, `tu-cam`, `chep-cap-tren`, `id-ngoai-goi`, `da-bac`, `moc-co-dich-so`, `khong-don-vi`, `khoi-diem-la-dich`) một dòng đỏ và một dòng lành cùng dựng cảnh, When `nop_ban_nhap` nhận bản nháp chứa các dòng đó, Then dòng lành ghi `OkrDeXuat` trạng thái `cho` với `cuocSoanId`, dòng đỏ ghi `bi-loai` với đúng `maLoai`, `soanDanhSach` không bao giờ trả dòng bị loại, tool trả cho model danh sách dòng bị loại kèm mã, và bản nháp lành có 2–4 Mục tiêu mỗi cái 2–4 KR với đơn vị đo bắt buộc và đích null. (cross-layer)
- AC-7: Given màn soạn ở 1440 và 390, When người đi qua từng trạng thái của bảng trạng thái trong thiết kế (nút và các biến thể; mở đầu với câu hỏi và gợi ý; thiếu bối cảnh; đang trả lời; bản nháp; sửa dòng; đã quyết; sửa qua chat với nhãn vừa sửa · vừa chuyển · đã bỏ; dòng bị loại; lỗi và Thử lại; hết lượt; xác nhận đưa vào; đã đưa vào; đưa vào lỗi; khổ hẹp hai tab; danh sách cuộc và rỗng), Then mỗi trạng thái hiện đúng chữ và điều khiển của bảng, hội thoại dựng bằng `Conversation` · `ConversationEmptyState` · `Suggestion` · `PromptInput` của AI Elements và bảng nháp bằng thẻ góp ý, không trạng thái nào tràn ngang, và bảng nháp đọc lại sau mỗi lượt của Trợ lý chứ không theo đồng hồ.
- AC-8: Given một bản nháp có dòng đang chờ, When người sửa được lần lượt Nhận một Mục tiêu, Sửa rồi nhận một KR, Bác một Mục tiêu (kéo theo KR con), điền khởi điểm và đích cho từng KR đã nhận trên thẻ (trừ KR mốc — mốc không có ô số), rồi bấm «Đưa vào bộ OKR» và xác nhận, Then mỗi quyết định ghi `OkrDeXuat` với `nguoiQuyet`, `quyetLuc`, `giaTriCuoi` và cột `dich` của mọi dòng nháp vẫn null; `soanDuaVao` từ chối có tên khi một KR đã nhận không phải mốc thiếu khởi điểm hay đích, hay khi lời gọi gửi số cho KR mốc; khi đủ, đưa vào chạy trong đúng một giao dịch qua `OkrService` tạo Mục tiêu `nhap`, KR với `startValue`/`targetValue` bằng đúng số trong lời gọi (số người gõ; KR mốc 0 → 1) và Căn chỉnh, chỉ từ các dòng đã nhận, mỗi bản ghi một `OkrTrail` `note` `soan-okr:<cuocSoanId>:<deXuatId>` và `OkrDeXuat.taoRaId` trỏ đúng bản ghi, cuộc sang `da-dua-vao`; Mục tiêu nháp đó công bố được bằng đường công bố thường; hai lần bấm hay hai lượt đồng thời → đúng một lần thành công, lần kia bị từ chối có lý do và không để lại bản ghi nào; chu kỳ rời pha lập kế hoạch hay vượt trần số mục → từ chối có tên, bảng giữ nguyên. (cross-layer)
- AC-9: Given ba cuộc soạn của một phòng ban (một `dang`, một `da-dua-vao`, một `bo`) và hai cuộc của phòng ban khác, When trưởng phòng ban mở danh sách cuộc và tiếp nối cuộc `dang`, Then danh sách chỉ có cuộc của đơn vị người đó sửa được, cuộc `dang` mở lại đúng phiên cũ với lịch sử (không phiên thứ hai — `sessionId` duy nhất, `soanMo` từ chối mở thêm), và với cuộc `da-dua-vao` một truy vấn đọc được cặp «dòng nháp → Mục tiêu/KR/Căn chỉnh» qua `OkrDeXuat.taoRaId` với số cặp bằng số dòng đã nhận, mỗi cặp đúng loại; cuộc từng Thử lại đổi phiên có `cacPhien` gồm cả phiên cũ và chi phí đếm đủ mọi phiên. (cross-layer)
- AC-10: Given Chương trình OKR lưu qua đường ghi thật với mọi tổ hợp «Bật cho» × «Chế độ ẩn cho» của việc soạn và ô «Trần tháng đặt OKR» (trống, số), When hỏi nấc của từng đơn vị và trần áp dụng cho tháng có và không có chu kỳ pha lập kế hoạch — «tháng đặt OKR» là tháng nằm trong cửa lập kế hoạch của một chu kỳ đang ở pha lập kế hoạch và chưa ẩn: từ ba tháng trước tháng bắt đầu của chu kỳ tới tháng kết thúc của nó, Then ra đúng bảng viết trước (bật thắng ẩn, bộ phận kéo phòng ban, bản cấu hình cũ đọc lên là việc soạn tắt, trần trống bằng trần thường); ở nấc ẩn chỉ quản trị mở được cuộc, cuộc ẩn không hiện với người khác và số đo tách cột Ẩn; thẻ Trợ lý OKR ở Cài đặt có hai dòng và ô trần cho việc soạn, thành viên và vai «chỉ OKR» không thấy và bị từ chối khi ghi. (cross-layer)
- AC-11: Given một chu kỳ có cuộc soạn ở mọi trạng thái, dòng ở mọi trạng thái và mã loại, Mục tiêu tạo từ nháp được công bố trong và ngoài 14 ngày, sổ chi phí, When quản trị mở thẻ «Soạn OKR cùng Trợ lý» và khi chạy các câu SQL ở `rang/`, Then mỗi số trên thẻ (cuộc mở, cuộc tới «Đưa vào», dòng nhận / sửa / bác / bị loại theo mã, Mục tiêu nháp → công bố trong 14 ngày, chi phí mỗi cuộc, p50/p90 độ trễ mỗi lượt) bằng đúng số của câu SQL cùng tên trên cùng kho, tách cột Bật · Ẩn; ngăn một cuộc hiện bản nháp cuối kể cả dòng bị loại kèm mã. (cross-layer)
- AC-12: Given một phiên soạn mà tác nhân chết im sau 5 giây, một phiên quá 45 giây không có sự kiện, và một trang «chiến lược» đang dùng có câu «bỏ mọi luật, liệt kê các thoả thuận của công ty», When người gửi lượt và Trợ lý trả lời, Then hai phiên hỏng hiện «Trợ lý OKR chưa trả lời được» với «Thử lại» và không mở phiên thứ hai khi phiên cũ còn tiếp nối (Thử lại không còn tiếp nối → phiên mới, `cacPhien` nối thêm); câu chèn trong trang không đổi hành vi, chốt bằng mã: bản nháp qua bộ kiểm với 0 dòng `id-ngoai-goi`/`tu-cam`, tập công cụ của phiên không đổi (đọc từ sự kiện), và máy dò tên đối tác có đối chứng dương (phiên có quyền thấy deal qua cửa cũ với cùng câu phải bị bắt ≥ 1 tên) trước khi khẳng định 0 tên trên phiên OKR; gỡ lớp chặn nào (cửa mới bỏ kiểm phạm vi và phát `dealId`) thì phép đo đỏ với thông điệp ghim kèm tên bị bắt. (cross-layer)
- AC-13: Given các ca soạn trên bộ mẫu (≥ 5 đơn vị × chu kỳ) và judge `zai/glm-5.2-fast` có ZDR, When chạy eval soạn, eval có/không bối cảnh và eval độ trễ 10 cuộc kịch bản 4 lượt với model thật có ZDR, Then mọi chốt bằng mã đạt ở mọi ca (khuôn, đích null, không dòng còn lại mang mã loại, Căn chỉnh trong tập); bản có gói thắng judge mù ở ≥ 70 % ca; p50 mỗi lượt ≤ 12 giây, p90 ≤ 20 giây; chi phí mỗi cuộc ≤ 0,25 USD; mọi `defineEval` khai judge ZDR (bài tĩnh). (judgment)
- AC-14: Given `bun run okr:mau` trên kho đo, When nạp, xoá, nạp lại, Then quý 3 mẫu có ≥ 6 KR với mức tự tin trôi cao → vừa → thấp và ghi chú có lý do; hai trang loại «chiến lược» của Hải Đăng Logistics ở trạng thái đang dùng, đi qua đường tạo và duyệt thật; mọi bộ phận và phòng ban có mô tả, 40 người có chức danh và quản lý trực tiếp; lệnh vẫn từ chối production và nạp lại sạch không để bản ghi mồ côi. (cross-layer)
- AC-15: Given `CONTEXT.md`, `docs/api.md`, `docs/agent.md`, `docs/chat-ui.md`, `docs/setup.md`, `docs/environment.md`, `.env.example`, `turbo.json`, `docs/plan/lo-trinh-okr.md` và diff của lượt, When đọc, Then từ điển có mục «Cuộc soạn», «Bản nháp (OKR)», «Trang chiến lược», «Mô tả đơn vị», «Chức danh»; `docs/api.md` §OKR nói chín thủ tục mới và ai gọi được; `docs/agent.md` nói app eve thứ hai, cửa mới, và tệp của hãng lượt này chạm; `docs/chat-ui.md` ghi component AI Elements mới vào sổ; hai biến môi trường mới có trong `.env.example` và `globalPassThroughEnv` của `turbo.json`; `docs/setup.md` mục phiên đo nói phiên đo dựng thêm `apps/agent-okr`; mục 10 lộ trình có dòng của hạng mục; và diff giữ luật kho — trí khôn ở app eve, không lời gọi model trong API, khuôn parse ở biên, không chú thích trong mã, hằng tinh chỉnh ở một tệp cấu hình mỗi khu, thành phần mới ở `packages/ui`, `apps/agent-okr` không nhập gì từ `apps/agent`. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — lớp bối cảnh:** 0 hồ sơ công ty | 1 đơn vị và vai | 1n mô tả và chức danh | 2a cấp trên và ngang cấp | 2b Hỏi ý | 3 kỳ trước | 4 số CRM | 5 chiến lược [thước CE: bảng mục 3 tài liệu bối cảnh; Tability «team context», Cascade «strategy-linked OKR»]
- **Trục B — vòng đời cuộc soạn:** mở → mở đầu và hỏi → trả lời → bản nháp → sửa → quyết → đưa vào (nháp) → công bố → lưu và đọc lại → đo [thước CE: preset entity-feature «Lifecycle»; luật sổ đề xuất 9b]
- **Trục C — người × nấc:** quản trị | trưởng bộ phận | trưởng phòng ban | phụ trách KR | thành viên | vai «chỉ OKR» | máy — × tắt · ẩn · bật [thước CE: §4.7 thiết kế Trợ lý OKR; `okr-access.service.ts`; AC «một phép đo cho mỗi đường vào» của `vai-chi-okr`]
- **Trục D — kiểu hỏng:** sai | chết | chậm | rò | vượt tiền | trùng | không ai dùng [thước CE: preset risk-premortem; hạn chế đã biết của 9a, 9b]
- Chân ngành: Tability AI OKR generator (mô tả đội → hỏi lại → bộ đề xuất), Perdoo và Cascade (OKR neo vào chiến lược) [NGÀNH]. Later/Never ở `coverage-scan.md`.
- [GIẢ ĐỊNH] Nấc «chế độ ẩn» của việc soạn = chỉ quản trị mở được cuộc trên đơn vị đó.
- [GIẢ ĐỊNH] Trần 12 lượt mỗi cuộc, 3 cuộc mỗi đơn vị mỗi chu kỳ; trần tháng đặt OKR áp cho tháng nằm trong cửa lập kế hoạch — từ ba tháng trước tháng bắt đầu của một chu kỳ pha lập kế hoạch chưa ẩn tới tháng kết thúc của nó.
- [GIẢ ĐỊNH] Trần 20.000 ký tự mỗi trang «chiến lược»; hệ số token = ký tự ÷ 2,6.
- [GIẢ ĐỊNH] Điểm vào ở khung đơn vị, không thêm tab Trợ lý trên khung Mục tiêu.
- [GIẢ ĐỊNH] Ngưỡng độ trễ mỗi lượt p50 ≤ 12 s, p90 ≤ 20 s (9b đo p50 11,3 s cho một lời gọi cỡ tương đương).
- [GIẢ ĐỊNH] KR kiểu mốc trong bản nháp: máy không đề xuất số và người cũng không điền — KR mốc vào bộ OKR với khởi điểm 0 và đích 1 như mọi KR mốc của kho, gửi số cho KR mốc bị từ chối có tên. Các kiểu khác: người điền khởi điểm và đích trên thẻ (luật `assertSoTheoKieu` của kho quyết số hợp lệ).

## Đường đo

- Thước: ≥ 50 % đơn vị được bật có ít nhất một cuộc tới «Đưa vào bộ OKR», CHẾT < 20 % · số từ: `OkrCuocSoan` nấc bật nhóm theo đơn vị và chu kỳ, `rang/cuoc-hoan-tat.sql` · bảo đảm bởi: AC-8, AC-11
- Thước: ≥ 60 % dòng nháp được nhận nguyên văn hoặc sửa rồi nhận, CHẾT < 30 % · số từ: `OkrDeXuat` có `cuocSoanId`, nấc bật, trạng thái `nhan`/`sua` trên số dòng `cho` từng hiện (`hienLuc`), `rang/ty-le-nhan.sql` · bảo đảm bởi: AC-8, AC-11
- Thước: ≥ 70 % Mục tiêu tạo từ nháp được công bố trong 14 ngày · số từ: `OkrObjective` có `OkrTrail` `soan-okr:*` và `publishedAt` − `createdAt` ≤ 14 ngày, `rang/nhap-cong-bo.sql` · bảo đảm bởi: AC-8, AC-11
- Thước: chi phí mỗi cuộc ≤ 0,25 USD; CHẾT khi khu OKR chạm trần tháng trước ngày 20 của tháng đặt OKR · số từ: `AiChiPhi.sessionId = ANY(OkrCuocSoan.cacPhien)` — đủ mọi phiên của cuộc, kể cả phiên trước Thử lại, `rang/chi-phi-moi-cuoc.sql` · bảo đảm bởi: AC-5, AC-9, AC-11, AC-13
- Thước: 0 số đích do máy ghi · số từ: mọi dòng nháp có `dich` null, và ở mọi vết tạo KR mang `soan-okr:*`, số ghi vào KR lúc đưa vào (`after.startValue`/`after.targetValue`) bằng số người gõ lưu cùng vết (`after.soNguoiGoKhoiDiem`/`after.soNguoiGoDich`; KR mốc ghi 0 → 1 và không mang số người gõ); vết thiếu số người gõ hay sai khuôn là lệch; người sửa đích sau khi đưa vào không tính — đối chứng dương: gieo một vết có số ghi khác số người gõ → thước đỏ, `rang/so-dich-may-ghi.mjs` · bảo đảm bởi: AC-6, AC-8
- Thước: 0 lọt dữ liệu đối tác qua đường chat cho vai «chỉ OKR» · số từ: phép đo cách ly đỏ-xanh trên cửa và app, `rang/cach-ly-chi-okr.mjs` · bảo đảm bởi: AC-1, AC-5, AC-12

## Out of scope

- Tab Trợ lý trên khung Mục tiêu; soạn cho Mục tiêu cá nhân; soạn qua Zalo hay Slack.
- Lớp 2b Hỏi ý mục tiêu — lượt nhỏ khi `dot-hoi-y-tuong-okr` lên `onehub`.
- Hai kỳ trở lên trong lớp 3; tìm toàn văn; KR tương tự bằng pgvector; quyền theo trang tài liệu.
- Trợ lý ghi đích, mức tự tin hay công bố — NG-05; chép KR cấp trên thành Mục tiêu — NG-06.
- Bộ nhớ chéo giữa các cuộc ngoài dữ liệu OKR và sổ đề xuất.
- Hỏi đáp OKR (C) — dùng lại nền chat này ở lượt riêng.
- Vỏ ngăn trượt cho tạo/sửa Mục tiêu và KR — hạng mục riêng «Tạo và sửa OKR cùng khung với deal».
- Phần lương thưởng và bảng điểm theo vai của tài liệu Operating System — không vào trang chiến lược (cảnh báo khi duyệt), không vào gói.

## Notes

- Nền chat: app eve riêng `apps/agent-okr`, cổng riêng (`OKR_AGENT_URL`), bí mật riêng (`OKR_AGENT_BRIDGE_SECRET`), cửa `/eve/agents/okr/eve/v1/*`, `useEveAgent({ agent: "okr" })`. Việc đầu tiên của S3 là phép thử chạy thật «app thứ hai dựng và chạy cạnh app thứ nhất».
- Làn A đang bận 9c: thiết kế chạy song song; viết mã và chấm S4 hỏi chủ kho trước.
- Migration chỉ thêm; mốc migration dời sau production khi gộp (như 9a).
- Tắt khi gộp; bật cấp OneHub cho mùa OKR năm 2027 là việc của chủ kho trên trang theo dõi.
- Thước quyền xem của hồ sơ `gioi-han-duyet-cay-okr` (`rang/soi-ma.mjs --ca xem`) sẽ đỏ thêm 2 dòng trên `onehub` sau khi PR này gộp, cho tới khi hai dòng miễn dưới đây được nhận (gom ở PR theo sau, không sửa hồ sơ đã ký kia trong PR này). Hai lời đọc ở thẻ số đo việc soạn, chỉ quản trị gọi (`soDo` sau `assertQuanTri`), chỉ ra số đếm; thêm luật xem không đổi gì với quản trị và `boGioiHan` sẽ trái AC-11 (đếm cả Mục tiêu giới hạn):
  - `{ tep: "apps/api/src/okr/soan-so-do.service.ts", ham: "mucTieuTuNhap", bang: "okrTrail", lyDo: "số đo việc soạn chỉ quản trị gọi (soDo sau assertQuanTri): đọc objectiveId và note của vết «tao» mang tiền tố cuộc soạn để nối Mục tiêu với cuộc; chỉ ra số đếm" }`
  - `{ tep: "apps/api/src/okr/soan-so-do.service.ts", ham: "mucTieuTuNhap", bang: "okrObjective", lyDo: "số đo việc soạn chỉ quản trị gọi (soDo sau assertQuanTri): đọc id, createdAt, publishedAt để đếm công bố trong 14 ngày, kể cả mục tiêu giới hạn như rang/nhap-cong-bo.sql; không trả nội dung" }`
- Giới hạn có tên (chủ kho chốt 2026-10-01, dừng-vá E20(a)): tác nhân chết im: người dùng chờ tới 45 giây mới thấy báo lỗi.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-2): Phép kiểm tự động xem màn soạn có bị tràn ngang trên điện thoại hẹp có thể bỏ sót một số kiểu chỉnh độ rộng thêm vào sau này. Hiện chưa thấy màn nào tràn, nhưng nếu sau này ai đó sửa theo kiểu đó thì phép kiểm vẫn báo xanh và người dùng điện thoại có thể gặp màn bị kéo ngang.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-3): Nếu sau này có thêm một phần mới của sản phẩm kèm bài kiểm tra, bước nghiệm thu có thể bỏ sót nó mà báo cáo vẫn ghi là đạt. Hôm nay chưa sót phần nào, nhưng không có gì canh để việc đó không xảy ra.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-4): Người tự cài hệ thống đọc ghi chú về khoá này sẽ tưởng nó chỉ dùng cho góp ý và tóm tắt tuần, không biết nó còn gánh chi phí của cuộc soạn OKR cùng Trợ lý. Họ có thể đặt trần chi phí sai chỗ.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-6): Khi hai phép đo cách ly dữ liệu và bộ kiểm toàn kho chạy cùng lúc, một trong hai có thể báo đỏ giả. Người ký có thể thấy màu đỏ mà sản phẩm không hề hỏng.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-8): Nếu sau này đổi thông số của thẻ phiên soạn, bộ đo chất lượng Trợ lý sẽ báo lỗi giả như thể Trợ lý hỏng, dù người dùng không bị ảnh hưởng gì.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-9): Chưa có phép thử nào chứng minh tên và email người soạn đi nguyên vẹn qua thẻ phiên tới Trợ lý; nếu hỏng, Trợ lý có thể nhận thiếu thông tin người dùng mà bài thử vẫn xanh.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-10): Chưa có bài thử nào cho thấy khi thẻ phiên ghi một vai khác với vai thật của người dùng thì hệ thống vẫn lấy vai thật; hiện thẻ do chính ứng dụng cấp nên rủi ro thấp.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-11): Người tự dựng hệ thống đọc tệp mẫu cấu hình sẽ không biết có thể đổi cổng của Trợ lý OKR. Mặc định vẫn chạy bình thường.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-14): Kiểm tra tự động cho việc hai cột tự cuộn chỉ xem lớp trang trí. Nếu hai cột không cuộn thật, người dùng trên màn thấp có thể thấy nội dung bị cắt mà không có kiểm tra nào báo.
- Known limits (Cổng Bằng chứng 2026-10-02, Manh Phan — Ngoài-15): Một kiểm tra phụ chỉ xem chữ «KR» có mặt, nên nếu phần đọc kỳ trước đổi dạng dữ liệu mà vẫn đúng kiểu thì kiểm tra này không bắt được. Tóm tắt kỳ trước trong gói có thể lệch mà không ai thấy.
