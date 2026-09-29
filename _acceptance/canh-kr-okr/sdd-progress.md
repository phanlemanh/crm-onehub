# SDD ledger — plan: docs/superpowers/plans/2026-09-28-canh-kr-okr.md

Spec: docs/superpowers/specs/2026-09-28-canh-kr-okr-design.md (đọc được). Hợp đồng: _acceptance/canh-kr-okr/contract.md (approved).

## Pre-flight scan

| Cặp / việc | Sản xuất ↔ tiêu thụ | Thấy gì |
|---|---|---|
| 1 ↔ 3–7, 12 | khuôn `okr-canh-kr`, `okr-mau`, 10 hành động vết ↔ dịch vụ, bộ mẫu | khớp tên (`themViecInput`, `mauNoiDung`, `parseMauNoiDung`, `bangChungVao`) |
| 2 ↔ 3–8, 12 | sáu model ↔ dịch vụ, xoá bộ mẫu | khớp tên model và trường |
| 3 ↔ 4–8 | `OkrCanhKrService`, `okr-canh-kr.contracts.ts`, router, config ↔ các việc sau thêm vào cùng tệp | cùng tệp, tuần tự |
| 4 ↔ 9 | `LienKet` (thêm `chua-chay` ở S2) ↔ khung KR | 9 phải đọc kiểu có `chua-chay` |
| 5 ↔ 9 | `guiCapNhatInput.bangChung?` ↔ ô bằng chứng hộp thoại cập nhật | khớp |
| 6 ↔ 10 | `commentsOutput.dong` ↔ tab Trao đổi | khớp |
| 7 ↔ 11 | `okr.mau`, `taoTuMau` ↔ Cài đặt, hộp thoại đặt mục tiêu | khớp |
| 8 ↔ 3 | `removeKeyResult` xoá việc ↔ bảng `okrViecKr` | khớp |
| 9 | sửa `okr.service.ts` (`objective` trả số việc) trong việc màn | tự nhất quán; máy chủ nhỏ đi kèm màn — chấp nhận |
| 12 ↔ M | `cong-ty.json`, `nap.ts` của M ↔ khuôn việc 1 | M đã gộp (#186), tệp có đủ |
| 13 ↔ tất cả | phép đo đọc mọi thứ | chạy cuối |
| Mỗi việc 1–13 | bài viết trước ↔ mã viết sau | không thấy việc nào tự mâu thuẫn; việc 2 dòng Verify đã sửa lỗi gõ `migration-chi-them` |

- Ruling: chạy việc 1 và 2 tuần tự, không song song — kỹ năng cấm hai tác tử cài song song trên một cây — mất ~10 phút nếu sai.
- Ruling: `canhKr` trả `LienKet` có thêm trạng thái `chua-chay` (sổ quyết định S2, chiến dịch DRAFT) — thiết kế đã sửa theo — nếu sai chỉ thêm một nhãn thừa.

## Tiến độ
Task 1: complete (commits 1cb8c607..855c740a, review clean)
Task 1: minor (deferred): okr-mau.ts:25 — mauKr trả mã LoiSoTheoKieu thô trong message; việc 7/11 phải dịch qua T.soTheoKieu / chữ màn trước khi hiện
Task 1: minor (deferred): mauKr.title dùng trần OKR_MAU.cauMucTieu.max (200) — brief không nêu trần riêng
Task 2: complete (commits 855c740a..626ec75f, review clean; controller chạy lại thước: xanh + chiều đỏ exit 1)
Task 2: minor (deferred): migration-chi-them.mjs:126 — chuỗi chẩn đoán DROP luôn mở đầu «DROP INDEX» kể cả DROP TABLE (chỉ là chữ)
Controller: 3aca20e4 — sửa lint:slop ở dữ liệu bản mẫu S1 (DEM_VIEC thành Map); không thuộc việc nào của kế hoạch
Task 3: review — Important: bài viec-doc-canh phụ thuộc ngày thật (đỏ từ 21/11); đang fix round 1
Task 3: minor (deferred): vết chỉ lọc bốn hành động nên không chứng «đúng năm dòng»; ca người làm không phải thành viên dùng mã không tồn tại; suaViec/danhDauViec kiểm loại trước quyền (400 thay 403); ghi không đổi gì vẫn để vết; ô 403 sua/danh-dau chỉ đếm hàng
- Ruling: gỡ sáng kiến (goViec trên hàng chien-dich/ke-hoach) chỉ cần ghiDuocKr, không cần ganDuoc — gỡ không đọc dữ liệu đối tác — nếu sai: người vai «chỉ OKR» phụ trách KR gỡ được liên kết mình không thấy tên
Task 3: fix round 1/5 (2 addressed, 0 open — ngày thật trong viec-doc-canh; timeout afterAll; commits 0b9cc665)
Task 3: complete (commits 626ec75f..0b9cc665, review clean)
Task 4: implementer DONE (f6ac4695, eba1625f). Carry to 5–8: mọi thủ tục okr.* mới phải thêm vào THU_TUC_CANH_KR và DAU_VAO_HOP_LE ở vai-chi-okr.spec; hành động vết nào mang ảnh sáng kiến phải vào HANH_DONG_SANG_KIEN (canh-kr.ts)
Task 4: review — Important: E3 thiếu ca gắn cùng chiến dịch hai lần; lệch: E3 gắn bằng T. Fix round 1 đang chạy
Task 4: minor (deferred): cột RUNNING/tenPhuTrachC của bảng rò không bao giờ đỏ (trạng thái được canh bởi kiểm hình dạng); dọn test không xoá công ty/kế hoạch gieo; ép kiểu unknown trong vai-chi-okr.spec; thân test ~300 dòng
Task 4: fix round 1/5 (2 addressed, 1 open — đóng kế hoạch còn ghi thẳng DB dù có onboarding.closePlan; commits 00a22915)
Task 4: minor (deferred): vai-chi-okr.spec E4 tạo kế hoạch bằng db.onboardingPlan.create (E4 không đòi thủ tục thật)
Task 4: fix round 2/5 (1 addressed, 0 open — đóng kế hoạch qua onboarding.closePlan; commits 65a1545d)
Task 4: complete (commits 0b9cc665..65a1545d, review clean)
Task 5: implementer bị ngắt vì lỗi mạng API (ENOTFOUND) giữa chừng, chưa commit; đã gọi lại cùng tác tử để làm nốt
Task 5: implementer DONE (79202435). Ghi chú: docs/api.md mục OKR chưa có đoạn cho việc, sáng kiến, bằng chứng, ghi nhận, mẫu — thêm ở việc 13 hoặc đợt sửa cuối
Task 5: review — Important: cổng «xong» dùng m.value thay giaTri (KR mốc nguồn máy); thiếu timeout 30 s ở ba bài; E5 thiếu ca ghi chú 301 ký tự. Fix round 1 đang chạy
Task 5: minor (deferred): ghiBangChung tính lại quyen mỗi mục; themBangChung hai truy vấn KR; guiCapNhat dựa cổng pha riêng thay vì assertKyGhiDuoc (hiện an toàn)
Task 5: fix round 1/5 (3 addressed, 0 open — cổng xong theo giaTri; timeout 30 s; ca ghi chú 301; commits d0bf4751)
Task 5: complete (commits 65a1545d..d0bf4751, review clean)
Task 6: CHƯA BẮT ĐẦU — lần giao đầu bị người dừng để bàn giao sang máy khác (2026-09-28); chỉnh sửa dở ở okr-canh-kr-san.ts đã bỏ. Chạy lại từ đầu.
Controller (bàn giao): pre-push đỏ 3 ca enrichment-queue — nguyên nhân: dungSan() (okr-san.ts) và finally của sang-kien-an (vai-chi-okr.spec) xoá công ty mà không xoá agentTask gắn companyId (companies.create xếp việc tác nhân); đã sửa ở f664b5e5, 63/63 xanh bốn tệp chung
Deferred minor: okr-canh-kr.spec in log lỗi unique của Prisma ở ca gắn lần hai / song song (ca âm cố ý) — đầu ra bài chưa sạch
Controller (máy mới, 2026-09-28): dựng worktree .claude/worktrees/canh-kr-okr từ origin/feat/canh-kr-okr @29e62f6e; bun install, db:generate, db:test --reset; nền okr-canh-kr 17/17 + vai-chi-okr 15/15 xanh
Task 6: BASE 29e62f6e — implementer dispatched (opus)
Task 6: implementer DONE_WITH_CONCERNS (e3ef9b9f). Concerns: api.md/agent.md để việc 13; sửa thêm no-sau-luot-4, muc-nhac-okr.spec, viec-okr-cua-toi.dom; soi-ma luật _count chặt hơn cần; bài agent gieo ghi nhận thẳng DB (agent không có API)
Task 6: review — Spec ✅; Important: hai bài ghi-nhan mới ở okr-nhac.integration.spec.ts chạm DB mà không khai timeout 30 s. Fix round 1 đang chạy
Task 6: minor (deferred): dong xếp bình luận trước khi trùng mili giây với ghi nhận — ca E6 có thể đỏ giả; cần phá hoà bằng id/thứ tự
Task 6: minor (deferred): soi-ma --chieu-do coi exit 1 là «bắt đủ» — lỗi sập (typescript không nạp) cũng exit 1; eval nên khớp dòng ghim «chieu do: 3/3 tep gia bi bat» hoặc mã riêng
Task 6: minor (deferred): soi-ma khoá nhan trong QUAN_HE_DEM quá chặt (đếm người nhận mỗi ghi nhận); chưa phủ groupBy theo người gửi và destructure { okrGhiNhanNhan } = db
Task 6: minor (deferred): nguoiNhan ở vết ghi-nhan giữ thứ tự nhập, go-ghi-nhan before xếp theo userId
Task 6: minor (deferred): goGhiNhan gọi access.quyen trước khi biết hàng tồn tại (giống goBangChung)
Task 6: fix round 1/5 (1 addressed, 0 open — timeout 30 s hai bài agent ghi-nhan; commits e3ef9b9f..5f80dc36)
Task 6: complete (commits 29e62f6e..5f80dc36, review clean)
Task 7: BASE 5f80dc36 — implementer dispatched (opus)
Task 7: implementer DONE_WITH_CONCERNS (81af470b). Concerns: mau() quản trị không lọc trả cả mẫu lưu trữ; donViIds của cấp ca-nhan coi là phòng ban; lỗi luuMau nêu KR theo thứ tự; taoTuMau một dòng vết tao; nới GiaTriDauVao ở ma-tran-thu.ts; auth.e2e + listing-body-limit đỏ tại chỗ vì env (GOOGLE_CLIENT_ID, khoá ingest) — ngoài diff
Task 7: review — Spec ❌: (1) mau() quản trị có bộ lọc chỉ nhận mẫu sống, lệch spec §5, không ghi sổ, không ca kiểm; (2) chiều đỏ E8 (luuMau bỏ parse noiDung) chưa chạy, bài chỉ in số đếm không in hàng đã ghi. Fix round 1 đang chạy
- Ruling: mau() có cap/donViId thì mọi vai nhận mẫu sống hợp cấp/đơn vị; quản trị không lọc nhận tất cả kể cả lưu trữ — spec chia theo vai chưa tính bộ lọc hộp chọn; hộp chọn không nên hiện mẫu taoTuMau từ chối — nếu sai: việc 11 đổi cách gọi, một nhánh ở dịch vụ. Ghi sổ quyết định (fix, S3)
Task 7: minor (deferred): kiểm quản trị viết lại với câu mới T.mau.canQuanTri cạnh canQuyenQuanTri có sẵn (assertQuanTri)
Task 7: minor (deferred): taoTuMau lặp khối viTri + okrObjective.create của createObjective
Task 7: minor (deferred): câu vượt trần với mục tiêu mới nói «đã có n−1 KR» dù mục tiêu có 0
Task 7: minor (deferred): nhánh từ chối taoTuMau chưa kiểm (daLuuTru, khacCap, khongApDung, soKrKhac, caNhanTat, mọi đường ca-nhan); luuTruMau/khoiPhucMau người không quản trị chưa kiểm
Task 7: minor (deferred): ca tu-mau phụ thuộc thứ tự (đếm mục tiêu P1, khôi phục M2, objectiveCap)
Task 7: minor (deferred): okr-canh-kr.spec.ts ~2190 dòng (paths eval ghim tệp — tách là chuyện kế hoạch)
Task 7: minor (deferred): vết luuTru/khoiPhuc mang thêm after.luuTru ngoài { mauId, ten }
Task 7: minor (deferred): luuMauVao noiDung z.unknown() — OpenAPI mất hình noiDung (theo tiền lệ datNguonKrVao)
Task 7: minor (deferred): donViIds cấp ca-nhan coi là phòng ban — spec im lặng; không ca kiểm
Task 7: minor (deferred): auth.e2e + listing-body-limit đỏ tại chỗ chưa đối chiếu với baseline
Task 7: fix round 1/5 (2 addressed, 0 open — ca quản trị có lọc; chiều đỏ E8 in hàng đã ghi; commits 81af470b..aaf29b00; sổ quyết định 87512671)
Task 7: complete (commits 5f80dc36..87512671, review clean)
Task 8: BASE 87512671 — implementer dispatched (opus)
Task 8: implementer DONE_WITH_CONCERNS (ffcd6c53, 17599928). Concerns: sửa chuyen-okr-dialog.tsx thay chuyen-viec-dialog.tsx; en «to-dos» chờ chốt ở việc 9; B vào lại gọi workspace.allowEmail + ensureWorkspaceMembership thẳng (không có thủ tục đăng nhập); cùng giao dịch khi xoá KR chỉ chứng gián tiếp; spec ~2700 dòng
- Ruling: số việc ở hộp thoại chuyển OKR sửa ở chuyen-okr-dialog.tsx, không ở chuyen-viec-dialog.tsx (hộp chuyển kế hoạch 30 ngày) — kế hoạch gọi nhầm tên tệp; AC-9 nói chuyển việc OKR của người nghỉ — nếu sai: hộp chuyển kế hoạch 30 ngày thiếu số việc KR (không thuộc AC nào)
Task 8: review — Spec ✅, Approved, 0 Important
Task 8: complete (commits 87512671..17599928, review clean)
Task 8: minor (deferred): dieuKienChuyen.viec không lọc loai "viec" — sáng kiến đứng ngoài chỉ nhờ ganSangKien không đặt nguoiLamUserId
Task 8: minor (deferred): việc được chuyển không sinh mục okr-duoc-giao cho người nhận (KR/mục tiêu thì có) — cần là quyết định, không phải tình cờ
Task 8: minor (deferred): themViec/themBangChung chen giữa đếm và xoá KR → 500 khoá ngoại thay 400 ghim (giao dịch vẫn cuộn lại)
Task 8: minor (deferred): nhánh loại trừ mục tiêu ca-nhan cho việc chưa có ca kiểm; ép kiểu {} as Record ở bài; okr-canh-kr.spec.ts ~2700 dòng; bun run build chưa chạy
- Ruling: tiếng Anh của «Việc (KR)» là «action(s)» («Actions and initiatives» cạnh sáng kiến = initiatives), không «to-dos» — «OKR to-dos» đã là hàng nhắc viecCuaToi; CONTEXT.md không có từ Anh — nếu sai: đổi chữ ở messages, không đụng mã; việc 9 sửa luôn ba chuỗi chuyển việc ở okr.ts
Task 9: BASE 17599928 — implementer dispatched (opus)
Task 9: implementer DONE_WITH_CONCERNS (2bdfc26e). Concerns: sửa Item ở packages/ui (min-w-0, max-w-full, wrap-anywhere); thêm kr.xong vào canhKr; E11 K3 «—» vs «Thêm»; record=kr:<mã lạ> trần không có nút về khung mục tiêu; Esc ở dòng nhập đóng cả khung; so-kr.dom + okr-sheet.dom chung tiến trình đỏ 30 sẵn có (runner mỗi tệp một tiến trình nên không lộ)
- Ruling: nhận sửa Item ở packages/ui (min-w-0 ở ItemContent, max-w-full + wrap-anywhere ở ItemTitle) — docs/design.md bảo sửa ở packages/ui, kế hoạch tưởng nhầm Item đã có — nếu sai: một Item khác trong app đổi cách ngắt chữ dài (vẫn line-clamp-1)
- Ruling: màn giữ «Thêm» cho người sửa được ở ô Việc trống theo spec ST-bangkr-chua-viec; việc 13 sửa E11 cho khớp; sổ quyết định d-…-14 — nếu sai: bỏ «Thêm», mất lối thêm nhanh
Task 9: review — Spec ❌: (1) record=kr:<mã lạ> trần không có nút về khung mục tiêu (E11 bước 8 sẽ đỏ); (2) Esc ở dòng nhập thoát ra cả khung (lớp dismiss của Radix); (3) trần 2/200/300 viết cứng trong chữ okr-canh-kr.ts. Fix round 1 đang chạy
- Ruling: ô «—» ở cột Việc bấm được vào khung KR cho mọi người xem (spec ST-bangkr-chua-viec «bấm → khung KR»; bản mẫu vẽ «—» trơn) — spec thắng bản mẫu; người chỉ đọc cần đường tới bằng chứng KR mốc — nếu sai: một nút thừa trên ô trống. Đưa vào vòng sửa 1
Task 9: minor (deferred): tiếng Anh hai cột cùng tên «Actions» (cột Việc và nhãn đọc màn cotThaoTac; «Actions for {ten}» mơ hồ)
Task 9: minor (deferred): «{n} initiatives» không có số ít
Task 9: minor (deferred): ma trận 6×6 data-trang-thai gần hằng đúng (trangThaiMan tính từ đầu vào)
Task 9: minor (deferred): RED ghi lại là thiếu mô-đun, không phải hành vi đỏ
Task 9: minor (deferred): ô đánh dấu không có trạng thái đang lưu; bộ chọn sáng kiến không có trạng thái tải/lỗi (lỗi hiện như rỗng)
Task 9: minor (deferred): PickListDialog vẫn lọc tại chỗ khi có onSearchChange (lệch dấu với máy chủ; mục đã chọn có thể biến mất)
Task 9: minor (deferred): luật KR mốc xong Number(currentValue) === 1 viết hai lần ở okr-canh-kr.service.ts
Task 9: minor (deferred): kr-viec.tsx 780 dòng sát trần 800; hai chữ trong JSX («https://…», «· »)
Task 9: fix round 1/5 (4 addressed, 0 open — nút về khi mã KR lạ; Esc tự xử lý qua data-tu-xu-ly-esc ở Sheet/Drawer; trần lấy từ OKR_CANH_KR; ô «—» bấm được; commits 00665517..34fac38f)
Task 9: complete (commits 17599928..34fac38f, review clean)
Task 10: BASE 34fac38f — implementer dispatched (opus)
Task 10: implementer DONE_WITH_CONCERNS (7a7f9b9b). Concerns: menu «…» một mục (theo bản mẫu, spec §4 gom từ 2); chữ ô soạn chung hai chế độ, >500 khoá gửi; «Ghi nhận» ẩn khi mục tiêu chưa công bố; loại chính mình qua users.me; số tab Trao đổi đếm cả ghi nhận; chưa ca chọn KR ở chế độ ghi nhận
Task 10: review — Spec ✅, Approved, 0 Important
Task 10: complete (commits 34fac38f..7a7f9b9b, review clean)
Task 10: minor (deferred): bộ đếm ký tự dùng độ dài thô, khoá gửi dùng độ dài đã trim (có thể «510/500» mà gửi được)
Task 10: minor (deferred): người nhận ẩn ở chế độ bình luận vẫn tính «có thay đổi»; bộ chọn nhắc tên chờ users.me
Task 10: minor (deferred): bộ đếm/FieldError không nối aria-describedby/aria-invalid; lỗi người nhận không nối Combobox
Task 10: minor (deferred): dòng bình luận của dong không khớp comments bị bỏ lặng (render null)
Task 10: minor (deferred): dòng bình luận cũng variant muted — lệch bản mẫu (chỉ ghi nhận muted)
Task 10: minor (deferred): chưa ca DOM chọn KR ở chế độ ghi nhận, khoá >500, gỡ hỏng giữ hộp thoại, KhungSoan truyền objectiveId
Task 10: minor (deferred): menu «…» một mục (bản mẫu) vs spec §4 gom từ hai
Task 11: BASE 7a7f9b9b — implementer dispatched (opus)
Task 11: implementer DONE (05bc0aea). Concerns: lỗi 400 máy chủ hiện cuối form (không đường dẫn); dòng lý do dùng lại câu đã ghim bởi eval dat-okr-trong-crm; ca-nhan lấy phòng ban chính, không có thì không «Bắt đầu từ mẫu»; tiêu đề/loại khoá ở form từ mẫu; Empty thay CardTableEmpty; tệp ngoài brief lib/okr-mau.ts, okr/tu-mau.tsx, mock okr-sheet.dom
Task 11: review — Spec ✅, Approved, 0 Important
Task 11: complete (commits 7a7f9b9b..05bc0aea, review clean)
Task 11: minor (deferred): «Lưu» khoá không nói lý do khi tiêu đề KR hay câu mục tiêu trống; lỗi kiểu số của KR chỉ hiện khi tiêu đề KR đã gõ
Task 11: minor (deferred): mẫu 0 lần dùng hiện «chưa dùng», E16 bước 1 nói «đã dùng N lần» — việc 13 phải khớp
Task 11: minor (deferred): chưa ca khoiPhucMau, sửa mẫu ?mau=<id>, lỗi 400 máy chủ hiện ra, giữ chữ khi lưu hỏng, KR mốc ở form từ mẫu, locMau cấp ca-nhan
Task 11: minor (deferred): okr-canh-kr.dom.tsx 1524 dòng; mock updateObjective nhãn sai; ép kiểu as GoiMay
Task 11: minor (deferred): a11y — nút trong ItemGroup role=list thiếu listitem; FieldError KR không aria-describedby; FieldLabel htmlFor trỏ nút chọn đơn vị
Task 11: minor (deferred): lỗi im — okr.mau hỏng thì «Bắt đầu từ mẫu» biến mất; mẫu mất khi tải lại thì lùi form tay; đơn vị lưu trữ hiện mã thô
Task 11: minor (deferred): người phụ trách không hiện ở chế độ từ mẫu; người tham gia/«vì sao» gõ trước bị bỏ lặng
Task 11: minor (deferred): số nhiều tiếng Anh (1 units, 1 KRs, used 1 times)
Task 11: minor (deferred): hienSo nhập từ tệp tính năng okr/hop-thoai-kr.tsx sang Cài đặt; loiSoTheoKr lặp cauLoiMau; min KR «1» viết cứng (OKR_MAU không có khoá)
Task 12: BASE 05bc0aea — implementer dispatched (opus)
Task 12: implementer DONE_WITH_CONCERNS (ae20dce8, 616e72fb). M chạm: cong-ty.json, khuon.ts, nap.ts, cau-hinh.ts, lenh.ts, nap-canh-kr.ts mới, okr-mau-san.ts (vanTay rút 114 bảng từ db._runtimeDataModel), okr-mau.spec.ts (một khẳng định ca nap-lai-mau). Concerns: Prisma.dmmf không có lúc chạy; E18 gọi xoaTrong vì chốt chặn --xoa của M; hàng ngoài bộ mẫu ghi thẳng DB; docs/setup.md chưa nói bộ mẫu mới
Controller: sổ quyết định d-…-15 (thước M đổi), d-…-16 (E18 gọi xoaTrong); hồ sơ bo-okr-mau cần ghim lại sau S4
Task 12: review — Spec ✅, Approved, 0 Important; d-15/d-16 xác nhận chặt hơn, không nới lời hứa của M
Task 12: complete (commits 05bc0aea..69a98bbf, review clean)
Task 12: minor (deferred): mẫu ngoài bộ mẫu có donViIds trỏ phòng ban mẫu sống sót sau xoá với mã treo (mảng, không khoá ngoại) — sửa hoặc Known limits
Task 12: minor (deferred): lý do ghi thẳng DB cho hàng ngoài bộ mẫu trong báo cáo không đúng (kiemOkrThat chỉ chặn lệnh okr:mau)
Task 12: minor (deferred): bài dùng mauNoiDung.safeParse thay parseMauNoiDung; «?? ""» tạo mã rỗng; bằng chứng không kiểm KR đã xong; BANG_DEM đoán cột khoá cho bảng không id; «7 *» trong bài; docs/setup.md chưa nói bộ mẫu mới (việc 13)
- Ruling: E16 bước 1 nhận «chưa dùng» là N = 0 (sổ quyết định d-…-17) — màn việc 11 in «chưa dùng»; nếu sai: màn in «đã dùng 0 lần»
Task 13: BASE HEAD sau d-17 — implementer dispatched (opus)
Task 13: implementer DONE_WITH_CONCERNS (2286e816..5a120236, 11 commit). soi-ma thiet-ke 82 tệp 0 vi phạm, đỏ 3/3; ty-le 13 cột toEqual, đỏ 3/3; man-canh-kr 160 kiểm 0 hỏng, 23 ảnh, CDP 68 phản hồi/1 canhKr/0 lộ, đối chứng dương 3; 7 bản sao đỏ đều bắt. Năm lệnh chứng exit 0; 16 lệnh ckr_* exit 0. Concerns: E12 chiều đỏ cắt 12 thay 50; E14 chiều đỏ không in tên lộ (máy chủ chặn bộ chọn); K1 gắn thêm kế hoạch thứ hai để chiều đỏ E11 ra «1/3»; lỗi hydrat AppIconRailFallback chập chờn ngoài tính năng; data-da-dung + nhãn vết tiếng Anh «action»
- Ruling: E12 chiều đỏ cắt tiêu đề còn 12 ký tự (tiêu đề E11 gõ dài 21, bản sao cắt 50 là trơ); E14 chiều đỏ bắt ở dòng «không có quyền» vắng, tên lộ in ở bản sao lienKetChoVai của E15 — ý của hai chiều đỏ giữ nguyên, chữ eval phải chỉnh cho khớp vật đo và ghi sổ quyết định — nếu sai: hai dòng chữ eval lệch lời hứa gốc
Task 13: review — Spec ❌ 4 Important: (1) E17 dòng ghim bắn cả khi máy chủ từ chối mauId rỗng — chiều đỏ trơ; (2) E14 bản sao bộ chọn không lộ được tên, chữ eval nói in tên lộ; (3) E12 chữ eval 50 vs script 12; (4) E11 bước 3 thêm vế «cả hai mở được khung KR» không đo. Fix round 1 đang chạy
- Ruling: E17 đỏ = bản sao taoTuMau bỏ ghi okrMucTieuTuMau, ghim chỉ khi mt=1 ∧ nguồn=0; E14 đỏ = bản sao lienKetChoVai phía máy chủ, in tên lộ; E12 chữ «ngắn hơn chuỗi đã gõ (12 ký tự)»; E11 bước 3 đo thật người chỉ đọc mở khung K3; bước 2 nói sáng kiến gieo thêm — sổ quyết định d-…-18 — nếu sai: chữ eval lệch lời hứa gốc
Task 13: minor (deferred): bộ lọc hydrat [\s\S]* có thể nuốt lỗi màn tính năng có liệt thanh biểu tượng; lần xảy ra duy nhất ở màn tính năng, log cắt 200 ký tự — chip riêng task_511f65fa
Task 13: minor (deferred): soi-ma đếm lienKetChoVai khớp nhờ trùng hợp (vetSangKienChoVai ghép với anhSangKienChoVai); lienKetChoVai/design-gate/dấu hiệu vẽ tay/CONTEXT.md không có chiều đỏ riêng
Task 13: minor (deferred): DAU_HIEU chỉ phủ một phần bảng «Vẽ tay» (thiếu <p> chữ phụ, div xếp nhãn/công tắc, className đè)
Task 13: minor (deferred): E16 bước 5 có thể qua rỗng (không đối chứng dương); thân CDP đọc hỏng đếm mà không khẳng định; man-canh-kr.mjs 2518 dòng; ty-le ghi thẳng người dùng (không có thủ tục)
Controller: origin/onehub đã tới 7db7cea3 (#184–#198); #194 may-soan-de-xuat có migration 20261003010000_may_soan_de_xuat trùng mốc với 20261003010000_okr_canh_kr — phải gộp onehub và dời mốc trước soát toàn nhánh và S4
Task 13: fix round 1/5 (4 addressed, 0 open — E17 đỏ phía máy chủ ghim khi mt=1∧nguồn=0; E14 đỏ lienKetChoVai phía máy chủ hai ghim; E12 chữ; E11 đo người chỉ đọc mở khung K3; commits fd933af1..b07f1a13)
Task 13: complete (commits 62f93bd6..b07f1a13, review clean)
Controller: gộp origin/onehub (7db7cea3) + dời migration sang 20261004010000_okr_canh_kr — dispatched (opus), BASE b07f1a13
Controller: gộp onehub xong (cc462094 merge, f40e8205 dời migration 20261004010000_okr_canh_kr, ff5bd4ef PRODUCT-MAP); năm lệnh chứng xanh 3959 pass; 15 ckr_* (trừ man_chrome) exit 0; sổ quyết định dời mốc
Controller: config.yaml có khoá msd_man_duyet_may hai chỗ — sẵn trên onehub, không do lượt này
Final review: MERGE_BASE 7db7cea333090b5dd5d00e4dd9ae2b1bdfb910a0 — dispatched (opus)
Final review: With fixes — 0 Critical, 2 Important: (1) mauKr.title/cauMucTieu min(1) trong khi krInput/mucTieuInput min(3) → mẫu lưu được mà không dùng được; (2) taoTuMau chưa ca khongApDung/daLuuTru/khacCap. Triage: sửa minor Task 1 (gộp vào #1) và Task 7 (#2) trước merge; còn lại giữ hoãn
- Ruling: lượt sửa cuối gồm Important #1, #2 và hai minor chạm người dùng — kr-sheet dùng users.list (chọn được người đã rời, lỗi hiện dưới ô tiêu đề) → okr.thanhVien + lỗi về loiNguoi; demCanh «Thêm» bỏ qua khoá pha — rẻ và người dùng thấy; không làm: gộp enum sáng kiến, _runtimeDataModel, smoke Item (đo màn S4 phủ một phần) — nếu sai: thêm một lượt soát nhỏ
Final fix: dispatched (opus)
Final fix: DONE (a36f0664, 701eab6d). Concerns: người rời sau khi tải bộ chọn nhận ra bằng đọc lại danh sách; khoá pha suy ở màn từ okr.cycles + ghiDuocOPha; bộ chọn chủ ở hop-thoai-kr/hop-thoai-muc-tieu vẫn users.list
Final fix: re-review — All findings addressed (commits d94084a3..701eab6d)
Final fix: parked — khoá pha ở ô bảng KR suy ở màn từ okr.cycles + ghiDuocOPha — Ruling: đứng — cùng hàm server dùng, chỉ là gợi ý hiển thị, lệch luôn về phía khoá; cách sạch hơn (objective() trả cờ khoá) để vòng sau
Final fix: minor (deferred): aria-describedby treo ở sheet-mau-okr khi cauHong; lỗi «người này không còn…» có thể hiện nhầm khi người làm rời đúng lúc bị từ chối vì lý do khác; menu «Sửa KR» vẫn bỏ qua khoá pha; bộ chọn chủ ở hop-thoai-kr/hop-thoai-muc-tieu vẫn users.list; wiring KrSheet okr.thanhVien chưa dựng trong DOM test
S3 complete — 13/13 task + gộp onehub + soát toàn nhánh sạch; chuyển S4
