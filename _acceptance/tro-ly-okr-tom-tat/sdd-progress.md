# SDD ledger — plan: docs/superpowers/plans/2026-09-30-tro-ly-okr-tom-tat.md

Spec: docs/superpowers/specs/2026-09-30-tro-ly-okr-tom-tat-design.md (đọc được). Chạy tuần tự trong cây happy-rubin-36de0b, nhánh feat/tro-ly-okr-tom-tat.

## Preflight scan

| Cặp / việc | Bên làm ra → bên dùng | Thấy gì |
|---|---|---|
| T1 → T3, T7, T10 | `@crm/db/okr-hop-tuan` (lyDoCua) → gói, dòng nhắc, thước | khớp tên |
| T2 → T3 | `kiemBanTomTat`, `noiDungTomTat` → `ghiTomTat` | T2 nói tỷ lệ giữ lại là tham số nhưng chữ ký ghi `(cau, goi)` — lệch |
| T2 → T7 | nhánh `okr-tom-tat` của `mucNhac` → dòng nhắc | khớp |
| T3 → T4 | `trangThaiTuan` (chuaCapNhat) → việc xếp | T4 cần «có cập nhật trong cửa sổ» theo (chu kỳ, phòng) — dùng được `trangThaiTuan`, khớp |
| T3 → T5 | `dungGoiTomTat`, `goiKiemTomTatTu`, `ghiTomTat` → tool nộp | khớp |
| T3 → T6 | `docTomTatChoNguoiXem`, `trangThaiTuan`, `banTuanChoQuanTri` → thủ tục | khớp |
| T3 ↔ T7 | T3 liệt `viecTomTatCanNhac` «xem Task 7», T7 sửa cùng tệp | chủ sở hữu hàm là T7 |
| T4 ↔ T5 | cùng `apps/agent/agent/lib/okr/*`; T4 sửa `viec.ts`, T5 sửa `doc.ts`, `so-chi-phi.ts` | không chồng tệp |
| T6 → T9 | `okr.troLyTomTat*`, `zalo.cuaToi`, `zalo.luuDongTroLyOkr` → màn | khớp |
| T8 → T9 | `InlineCitation*` (`nhan`) → khối tóm tắt | khớp |
| T7 → T10 | `chayNhac` với kênh giả → kịch bản màn (E9) | khớp |
| T1 tự thân | test đòi `apps/api/src/okr/hop-tuan.ts` không còn; files git mv | khớp |
| T2 tự thân | chữ ký `kiemBanTomTat` thiếu tham số tỷ lệ | lệch — phán quyết 1 |
| T3 tự thân | bài «ghi lần hai ném» khớp «trùng thì ném» | khớp |
| T4 tự thân | outcome hết trần `khong-chay:het-tran-thang:<n>`; E3 đòi mã chứa `het-tran-thang` | khớp |
| T5 tự thân | nộp từ việc góp ý bị từ chối — `nopDeXuatVao` và `nopTomTatVao` đều kiểm loại | khớp |
| T6 tự thân | lệnh generate | khớp |
| T7 tự thân | bài nhắc sẵn có `test/nhac*.spec.ts test/tin-nhac*.spec.ts` — tên tệp đoán | phán quyết 3 |
| T8 tự thân | CLI cài vào `packages/ui`, cổng mồ côi đòi tới màn trong cùng thay đổi — T8 chưa có màn | phán quyết 4 |
| T9 tự thân | verify «node _acceptance/... tts_san_thiet_ke» là chỗ trống | phán quyết 2 |
| T10, T11 tự thân | tai-lieu.mjs chạy sau T11 | khớp (ghi rõ trong T10) |

Ruling: 1 — `kiemBanTomTat(cau, goi, { tyLeGiuLai })`; `ghiTomTat` truyền `OKR_TOM_TAT.tyLeGiuLai` — validation không nhập @crm/db — sai thì một lần đổi chữ ký.
Ruling: 2 — verify thiết kế tĩnh của T9 là lệnh `executors.script.tts_san_thiet_ke` trong `_acceptance/config.yaml`, chạy nguyên văn — plan viết tắt — sai thì chạy nhầm lệnh.
Ruling: 3 — T7 chạy bài nhắc sẵn có bằng cách tìm đúng tên tệp test của `tin-nhac`/`nhac-ke-hoach` trong `apps/agent/test` thay vì glob đoán — sai thì bỏ sót hồi quy nhắc.
Ruling: 4 — T8 được phép để `inline-citation.tsx` chưa có màn dùng ở commit của T8 nếu cổng mồ côi chỉ chạy ở `bun run test` toàn kho; T9 nối màn; nếu pre-commit/pre-push đỏ vì mồ côi thì gộp T8 vào T9 — sai thì một commit đỏ cục bộ.

## Tasks
Ruling: 5 — «Commit phá thử, rồi hoàn lại» trong các task đọc là: commit phần việc trước, phá tạm không commit, hoàn lại bằng git checkout đúng tệp — tránh commit bản phá vào lịch sử nhánh — sai thì mất một vết phá-thử trong git (đầu ra đỏ vẫn nằm trong báo cáo).
Task 1: dispatched (base 7aef4f42)
Task 1: fix round 1/5 (2 addressed, 0 open — TUAN_MS nhân bản, import ngược trong test; commits 5f45fdcc..752ee8c7)
Task 1: complete (commits 7aef4f42..752ee8c7, review clean)
Task 1: minor (deferred): MUC_TU_TIN/MucTuTin nằm trong okr-tro-ly-danh-muc.ts (tệp danh mục trợ lý) để phá vòng phụ thuộc db↔validation — lệch ngữ nghĩa nhẹ
Task 1: minor (deferred): ky-vong-khong-doi.mjs so phần không-import thay vì quét git diff -U0 theo dòng như brief — chặt hơn, cùng thông điệp
Ruling: 6 — bộ kiểm câu KHÔNG nhận |chenhTuTin| làm số tham chiếu; tập tham chiếu khớp đúng Đường đo của hợp đồng (giá trị lần dẫn, lần trước, chênh lệch giá trị, khởi điểm, đích, tiến độ, ngày dd/mm); chữ chỉ dẫn subagent (Task 5) dặn tả mức tự tin bằng chữ («từ vừa xuống thấp»), không viết số bậc — để bộ kiểm và thước độc lập đo cùng một định nghĩa — sai thì vài câu nói «tụt 2 bậc» bị bỏ.
Task 2: fix round 1/5 (3 addressed, 0 open — R6 chenhTuTin khỏi tham chiếu, 1,200,000 lọt, ca tu-cam cụ thể; commits 8149d874..0e8f8415)
Task 2: complete (commits 752ee8c7..0e8f8415, review clean)
Task 2: minor (deferred): `1.200k` chỉ còn cách đọc Anh (1200); `3 triệu 500 nghìn` tách hai số (hành vi sẵn có của trichSo) — so-lech-lot (Task 10) phải xử lý giống hoặc ghi rõ khác biệt
Task 2: minor (deferred): trung-cau so với câu đã giữ; bên gọi kiemCauTomTat trực tiếp phải truyền `truoc` theo cách đó
Task 2: note: sửa kèm ngoài gói validation để check-types xanh: apps/agent/agent/lib/tin-nhac.ts (LoaiTin, TIEU_DE «Tóm tắt tuần»), apps/agent/agent/lib/tra-loi-nhac.ts (kiểu loai) — Task 7 điền hành vi thật
Ruling: 7 — bài của Task 3 đặt ở apps/api/test/okr-tom-tat-db.spec.ts (chạy qua bun run test) chứ không ở packages/db/test: bộ OKR mẫu (napBoOkrMau, okr-mau-san.ts) nằm ở apps/api và packages/db không được nhập ngược apps/api — sai thì bài nằm lệch gói so với mã nó đo.
Task 2: fix round 2/5 (1 addressed, 0 open — lint:slop spread rỗng có điều kiện ở test; commit 30fb5793) — lỗi sót phát hiện khi Task 3 chạy lint
Task 3: dispatched (base 0e8f8415, head bd4a6622); review đang chạy
Task 3: note: @crm/db không nhập được @crm/validation → hàm nhận tham số `luat: LuatTomTat`, bản ráp sẵn `LUAT_TOM_TAT` ở @crm/validation/okr-kiem-tom-tat; Task 5, 6, 7 phải truyền LUAT_TOM_TAT
Ruling: 8 — «tiến độ» trong tập tham chiếu = tiến độ tính từ khởi điểm, đích và GIÁ TRỊ CỦA LẦN CẬP NHẬT ĐƯỢC DẪN (không currentValue của KR) — ở gói, lúc ghi và lúc hiện, khớp chữ Đường đo — sai thì câu tiến độ nói số cũ của tuần đó vẫn hiện sau khi KR tiến thêm (đúng ý «tóm tắt của tuần đó»).
Ruling: 9 — cửa sổ gói neo vào mốc cố định `moc` = createdAt của việc okr-tom-tat-tuan (không đồng hồ tường), bắt buộc ở dungGoiTomTat và ghiTomTat — gói lúc dựng chỉ dẫn và lúc nộp giống hệt nhau — sai thì lần cập nhật sát mép cửa sổ tính khác một chút.
Ruling: 10 — phòng ban đã lưu trữ: docTomTatChoNguoiXem trả null, bảng quản trị bỏ phòng đó — thiết kế «phòng lưu trữ bỏ qua» — sai thì quản trị không thấy bản cũ của phòng vừa lưu trữ.
Task 3: fix round 1/5 (6 addressed, 0 open — tiến độ theo lần dẫn R8, moc bắt buộc R9, kiểu một chỗ, parse hàng dùng, chuDauVao chung, lưu trữ R10; commit 2708893c)
Task 3: complete (commits 0e8f8415..2708893c, review clean)
Task 3: minor (deferred): okr-tom-tat.ts:391 nhánh chết do NguonGoi.tienDo nullable; banTuanChoQuanTri parse mọi việc của chu kỳ (kể cả phòng lưu trữ) — hỏng một payload thì bảng quản trị ném
Task 3: note: Task 5 phải gọi ghiTomTat/dungGoiTomTat với moc = createdAt của việc okr-tom-tat-tuan
Ruling: 11 — việc xếp ngày mai commit trong giao dịch RIÊNG trước vòng phòng ban (lệch phán quyết Task 4 «cùng giao dịch»): cùng giao dịch thì lỗi giữa vòng lùi luôn việc kế và chuỗi đứt — đúng mục đích «ghi trước» — sai thì một lỗi giữa vòng vẫn để lại việc kế (mong muốn).
Task 4: complete (commits 2708893c..a1e8c42c, review clean)
Task 4: minor (deferred): «hôm qua» tính theo now, không theo dueAt của việc xếp — tác tử tắt qua nửa đêm thì lỡ một ngày cập nhật không báo; sửa: neo ngày vào dueAt
Task 4: minor (deferred): thuTrongTuan chép từ okr-nhac.ts:163 — nên xuất một hàm dùng chung từ @crm/db/onboarding-nhac
Task 4: minor (deferred): bài cn-sang-t2 sửa updateWeekday không bọc try/finally — đỏ giữa chừng gây đỏ dây chuyền
Ruling: 12 — đoạn dặn «Tóm tắt tuần» chỉ vào nhánh chỉ dẫn động của việc tóm tắt; instructions.md trả về gần bản 9b nhất — phiên góp ý đã chạy thật không được đổi lời dặn khi chưa đo lại — sai thì phiên tóm tắt thiếu phần phương pháp chung (vẫn có ở instructions.md).
Ruling: 13 — AC-13 «mọi bước của lượt đó thuộc nhóm okr.tom-tat» đọc là mọi bước của PHIÊN CON; bước chuyển tiếp của phiên gốc giữ okr.chuyen-tiep như 9b; thước chi-phi-tom-tat (Task 10) cộng okr.tom-tat với các dòng okr.chuyen-tiep có taskId là việc okr-tom-tat-tuan — giữ một định nghĩa nhóm cho cả hai việc — sai thì nhóm chi phí trên màn quản trị tách «chuyển tiếp» như 9b. Ghi sổ quyết định để trình Cổng Bằng chứng.
Ruling: 14 — vì Task 5 chạm apps/agent/agent/subagents/tro_ly_okr/**, hồ sơ 9b (tro-ly-okr-de-xuat) phải ghim lại bằng làn eval có E22 thật trước khi gộp; làm ở S4/S5 cùng chiến dịch ghim lại — sai thì CI chặn gộp vì bằng chứng 9b cũ.
Task 5: fix round 1/5 (4 addressed — lời dặn tóm tắt vào nhánh động R12, lỗi có tên phòng rỗng, tuTinTruoc cùng nguồn, ca đã đóng/payload hỏng; commit 902cca70)
Task 5: fix round 2/5 (1 addressed — câu gạt lệnh nop_de_xuat trong đoạn dặn tóm tắt; commit 59d70966)
Task 5: complete (commits a1e8c42c..59d70966, review clean)
Task 5: minor (deferred): bài cách ly dùng danh sách cấm cứng 22 bảng; đường ghi chạm okrCheckInSession/user qua select lồng không có trong DANH_SACH_DOC
Task 5: minor (deferred): sổ chi phí có lượt đọc kho trước khi ghi (AgentTask.sessionId không chỉ mục); lỗi đọc làm mất dòng chi phí
Task 5: minor (deferred): «Act at once» nay đứng sau đoạn gạt lệnh — chưa đo model thật (E17 sẽ đo); câu «one department's week» lặp hai lần
Task 5: minor (deferred): agent.ts còn câu thêm vào mô tả subagent mà phiên gốc thấy
Task 5: spawned chip task_3d9ac321 — ghi chú chứa </du-lieu-okr> đóng sớm khối dữ liệu (chung 9b)
Ruling: 16 — thước soi-ma --ca xem của hồ sơ gioi-han-duyet-cay-okr đỏ 9 lỗi: 5 có sẵn trên onehub (okr.service/tai-co-cau/hoi-y, MIEN_XEM cũ), 4 của okr-tom-tat.ts (lọc quyền xem ở bước sau, không tại lời gọi). Không nằm trong pre-push. Xử lý ở S5 khi pre-merge nói hồ sơ nào phải ghim lại: thêm MIEN_XEM có lý do cho 4 lỗi của mình, còn 5 lỗi cũ trình chủ kho — sai thì làn ghim lại gioi-han-duyet-cay-okr đỏ và chặn gộp.
Task 6: complete (commits 59d70966..2afc431c, review clean)
Task 6: minor (deferred, NÊN sửa trước S4): tro-ly-okr-tom-tat-doc.spec.ts:435 đối chứng loc-het chỉ `> 0` — E22 đòi «nhận đủ câu» → toBe(số câu); tro-ly-okr-tom-tat-phan-hoi.spec.ts:189 thiếu ca phòng lưu trữ và ca bản bị bản mới thay
Task 6: minor (deferred): troLyTomTat đọc cấu hình hai lần (nacTomTatPhong + docTomTatChoNguoiXem), quyen dựng cả cây tổ chức; dọn AgentTask theo kind không theo tiền tố, subject 'okr-tom-tat-xep:thu' không tiền tố TEST_RUN_ID
Task 6: note: chưa chạy bun run build — chạy ở cuối S3
Ruling: 17 — tiêu đề nhóm của dòng báo trong tin nhắc là «Trợ lý OKR» (như bản mẫu ST-nhac-tin-mau), dòng giữ «Tóm tắt tuần Phòng <tên> · <n> KR đáng bàn» — tránh chữ lặp — sai thì đổi một chuỗi.
Task 7: fix round 1/5 (4 addressed — R17 tiêu đề «Trợ lý OKR», một truy vấn KR, krSoTrongGoi chung, cuaSoSuKien chung; commit d54d1525)
Task 7: complete (commits 2afc431c..d54d1525, review clean)
Task 7: minor (deferred): chưa có ca đếm số truy vấn KR (một truy vấn cho nhiều bản)
Task 7: note (cho Task 11 tài liệu): n tính theo now của tin, gói theo moc của bản; cuaSoSuKien là nguồn chung cửa sổ sự kiện; @crm/validation/okr-tham-so mới; search-param-keys.ts của hãng bị chạm; donOkr in dạng pb%3A<id>; dòng tóm tắt bị cắt khi tin ≥ 10 việc người, không gửi bù
Task 7: spawned chip task_ce08e32d — câu gợi ý «xong 2» của Zalo khi tin không có mục đánh dấu được (có từ trước)
Ruling: 18 — InlineCitation bỏ handler Enter/Space tự viết (nút <button> tự kích hoạt trong trình duyệt); bài DOM mô phỏng mặc định trình duyệt (keydown rồi click / user-event); bỏ mục miễn «Enter» ở chu-cung.mjs; Enter/Space thật được soi ở phép đo màn E9 — giảm phí bản rẽ và rủi ro keyup — sai thì bàn phím hỏng trên một trình duyệt lạ, E9 bắt.
Task 8: fix round 1/5 (3 addressed — bỏ handler phím R18, aria-label hộp thẻ, số bán kính docs; commit f87f4bf6)
Task 8: complete (commits d54d1525..f87f4bf6, review clean)
Task 8: minor (deferred): open điều khiển từ ngoài không đồng bộ cachMo; bấm trong thẻ bằng chuột không ghim; Badge h-5 (20px) dưới 24px mục tiêu chạm WCAG 2.5.8 — soi ở E9; ml-1 / p-4 pl-8 trong thành phần (di sản thượng nguồn); bản rẽ 295 dòng so với AI Elements — nên gửi lên thượng nguồn
Task 9: fix round 1/5 (5 addressed — nguồn từng câu ở ngăn quản trị, popover panel max-w, SheetBody, h3/useId, ca nhánh rỗng; commit b2b82cb3)
Task 9: complete (commits f87f4bf6..b2b82cb3, review clean)
Task 9: minor (deferred): khi đang soạn mà còn bản cũ thì khối thay bản cũ bằng shimmer; ngăn đóng thì nội dung trống lúc trượt; InlineCitationSource truncate tên KR dài không xem đủ — soi ở E9; TDD đảo thứ tự (mã trước bài)
Task 10: note: thước số lệch chặt hơn bộ kiểm ở «3 triệu 500 nghìn» và chuỗi dạng ngày không phải ngày nguồn — E17 có thể đỏ đúng chỗ đó (là chỗ lệch thật, sửa bộ kiểm nếu S4 thấy); E17 thêm chốt «mọi việc đóng da-nop» ngoài expected
Task 10: minor (deferred, ĐƯA VÀO ĐỢT SỬA CUỐI): bộ kiểm câu (Task 2) tách «3 triệu 500 nghìn» thành 3tr + 500k nên nhận câu 3,5 triệu khi kho có 3tr và chênh 500k — lỗ AC-3 thật; thước so-lech-lot đọc đúng 3.500.000
Task 10: minor (deferred): bài tĩnh độc lập của so-lech-lot chỉ quét import tĩnh; mốc mặc định E17 giả định cập nhật thứ Hai; bộ đọc số không có dấu âm; chốt da-nop của E17 nên ghi vào Notes contract ở Cổng 2
Task 10: fix round 1/5 (4 addressed — mở từ tin trước khối, trần tiền mỗi mốc, skip → mã 2, SQL nấc khong-ro; commit 7b3b459c)
Task 10: complete (commits b2b82cb3..7b3b459c, review clean)
Task 10: minor (deferred): E15 chưa gieo bản thiếu nấc có số khác 0 nên nhóm khong-ro chưa có chiều đỏ
Task 11: fix round 1/5 (3 addressed — dòng skill sai, hai bước cắt, ghi chú 9b đã gộp; commit fb721520)
Task 11: complete (commits 7b3b459c..fb721520, review clean)
Final review: Needs fixes — I-1 bộ kiểm đọc chuỗi nhân/Nk khác thước; I-2 khối hiện bản tuần trước khi tuần này bị giữ/không cập nhật; + bảng xếp mục hoãn
Ruling: 19 — khối tóm tắt chỉ trả bản của TUẦN MỚI NHẤT đã xếp cho (chu kỳ, phòng); tuần đó bị giữ lại / không làm được / chưa cập nhật thì không hiện bản tuần trước (sửa câu «bản hiện mới nhất trong 8 ngày» của thiết kế) — bản bị giữ lại không được để bản cũ đứng thay — sai thì ngày có bản bị giữ, bảng họp tuần không có khối thay vì bản cũ.
Ruling: 20 — đợt sửa cuối gồm: trước S4 (I-1, I-2, siết bài T6, bỏ câu lặp lời dặn, Notes hợp đồng) và trước gộp (M-1..M-6, M-10, năm dòng MIEN_XEM có lý do ở soi-ma của gioi-han-duyet-cay-okr, danh sách đọc, nhánh chết T3, thuTrongTuan dùng chung, try/finally T4, tên KR dài trong thẻ trích dẫn, chiều đỏ nhóm khong-ro); để lại: M-7, M-8, M-9, M-11, các mục «để lại» của bảng — sai thì vài mục nhỏ còn lại thành Known limits ở Cổng Bằng chứng.
Final fix wave: commits 0cd47df2..b968c68f (A1–A5, B1–B14); kr-may đỏ có sẵn trên onehub (đã xác minh bằng cách lùi mã về fcff16b6) → chip task_c206cea6
