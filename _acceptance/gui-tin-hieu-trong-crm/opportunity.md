---
schema_version: 1
slug: gui-tin-hieu-trong-crm
feature: «Tôi bấm Gửi tín hiệu ở bất kỳ màn nào, kể điều mình gặp, rồi thấy nó đã vào nhóm nào, thành việc nào, đã giao chưa»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-12T01:21:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: LT2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

> Mở 12/10/2026 từ hàng LT2 của «OKR» (`docs/plan/lo-trinh-okr.json`) bằng `lo-trinh.mjs --mo-o` (kit
> 2.26.0), nhánh `feat/gui-tin-hieu-trong-crm` cắt từ `origin/onehub` `27d47de04`. Chủ kho chốt hàng 08/10
> và bỏ chờ ngày 12/10. Hàng đứng trên LT1 (trang Lộ trình, đã gộp #329) và trên hàng L3 của kit (cửa tín
> hiệu, đã gộp kit main #319, mốc 2.27.0). crm đang cài kit 2.26.0.

## Vấn đề & ai gặp

Gốc: `_acceptance/kiem-cheo-sau-gop/` — mục «Hạng mục cùng lớp» là danh sách chủ kho gom tay; chủ kho đưa bốn ô F9–F12 vào một đợt bằng một câu chat («Đưa F9-F12 vào đợt», 07/10). Cả kho có 10 hồ sơ mang mục gom tay như vậy (đếm lại 12/10 trên 239 hồ sơ), và người nêu điều cần làm ở đó đều là người dùng git.

«Tôi bấm Gửi tín hiệu ở bất kỳ màn nào, kể điều mình gặp, rồi thấy nó đã vào nhóm nào, thành việc nào, đã giao chưa»

**Người gặp** (bốn chốt của chủ kho 08/10):

- **Nhân viên và trưởng phòng ban** — người dùng CRM thật từ 14/10, không dùng git. Họ chỉ XEM lộ trình
  (LT1) và GỬI TÍN HIỆU. Hôm nay CRM không có chỗ nào để kể điều mình gặp: điều đó đi qua chat hay Zalo tới
  chủ kho, và người gửi không biết ý mình đi tới đâu. Hàng `ct` của lộ trình Kho tài liệu («mọi phòng ban
  tự nạp… góp ý gom một chỗ», 14/10) đang chờ đúng chỗ này.
- **Chủ kho** — người chép tay rồi gom, và người trả lời «ý của tôi tới đâu rồi» thay cho máy.
- **Bộ kit** — Cổng Giá trị của hàng L3 đo trên «lượt gom thật đầu tiên của crm trước 01/11». Nguồn tín
  hiệu thật đó chính là nút của hàng này.

**Đo 12/10:**

| Phép đo | Kết quả |
|---|---|
| Chỗ nhận điều người dùng gặp trong CRM | **Không có.** 126 bảng dữ liệu, không bảng nào nhận; «góp ý» trong `CONTEXT.md` là việc Kara làm trên OKR, «Báo sai» chỉ dành cho câu trả lời của trợ lý tài liệu |
| Khuôn tín hiệu của kit có ghi được từ crm không | Mẫu tín hiệu của khuôn (`loai: "tin-hieu"`, `noi_dung: {tieu_de, man}`) qua hàm kiểm của kênh yêu cầu trong crm: **đạt**. Khuôn chung không cần đổi |
| Chỗ hiện trạng thái cho người gửi | Trang Lộ trình (LT1) đọc khối dữ liệu của `LO-TRINH.html` từ chính bản đã dựng. Từ kit 2.27, khi kho khai cửa tín hiệu, khối đó mang thêm danh sách tín hiệu, mỗi tín hiệu một câu trạng thái do kit viết («chưa gom», «lẻ — …», «vào nhóm … → việc … → hồ sơ …: …»). crm chưa khai cửa, chưa cài 2.27 |
| Đếm theo phòng ban | CRM có phòng ban và phòng ban chính của từng người → ngưỡng «từ ≥3 phòng ban» đếm được bằng phòng ban chính của người gửi lúc gửi |
| Bản đang chạy | Gộp vào `onehub` là dựng lại production. Người gửi thấy trạng thái của lần dựng gần nhất, không phải của máy chủ kho |

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Có nút thì người phòng ban gửi: ≥20 tín hiệu một tháng từ ≥3 phòng ban | Nút có mà không ai bấm; Cổng Giá trị của kit L3 không có tín hiệu thật để đo | Đếm điều phòng ban nhắn chủ kho qua chat trong hai tuần đầu từ 14/10 | Chưa thử — đo ngoài vòng, trong lúc vòng chạy |
| 2 | Trạng thái về kịp để người gửi còn tin: trạng thái sau gom chỉ đổi khi chủ kho chạy một lượt gom rồi gộp | Người gửi thấy «đã nhận, chưa gom» nhiều tuần rồi thôi gửi | Khai nhịp gom ở cổng này (đề xuất: mỗi tuần) và đo tuổi của tín hiệu chưa gom | Nhịp gom là việc của chủ kho — ngưỡng dưới đề xuất 7 ngày |
| 3 | Đường vào git (mục dưới): một lệnh kéo tín hiệu về ở đầu mỗi lượt gom là đủ, không cần ứng dụng tự ghi git | Chủ kho phải nhớ kéo; quên là tín hiệu nằm ở CRM mà không vào nhóm | Lượt gom thật đầu tiên trước 01/11 | Chưa thử — đo ở Cổng Giá trị |
| 4 | Khuôn của kit 2.27 vẫn nhận đúng tệp crm viết | Phải đổi khuôn chung | Ca đo hai chiều: tệp crm sinh qua chính bộ đọc của kit | Đạt trên mẫu 12/10. Lệch khi làm → dừng, báo phiên điều phối, KHÔNG sửa khuôn ở crm |
| 5 | Git không cần biết tên người gửi | Người gửi lộ tên trong lịch sử git vĩnh viễn | Tệp chỉ mang mã người gửi mờ; CRM tự nối mã với người để hiện «tín hiệu của tôi» | Hướng làm, chốt ở S1 |

## Câu hỏi lớn: tín hiệu từ CRM vào git của kho bằng đường nào

Ràng buộc chung: CRM chỉ GHI tín hiệu; nguồn sự thật là git; kit đọc tín hiệu từ thư mục nguồn trong cây (bản
vẽ `LO-TRINH.html` phải giống nhau trên mọi máy, nên tệp tín hiệu phải có trong git trước khi vẽ).

| | **Lối 1 — CRM giữ hàng chờ, lượt gom kéo về git** *(máy khuyên)* | Lối 2 — CRM tự commit mỗi tín hiệu | Lối 3 — Quản trị tải tệp về, thả tay vào kho |
|---|---|---|---|
| Gửi | CRM ghi vào bảng riêng, chỉ thêm không sửa; người gửi thấy «đã nhận» ngay | Ứng dụng tạo commit qua GitHub; «đã nhận» chỉ có khi GitHub nhận | Như lối 1 |
| Vào git | Đầu mỗi lượt gom, một lệnh kéo tín hiệu mới về thư mục nguồn theo khuôn kit, commit cùng bản gom | Ngay khi gửi | Quản trị bấm «Tải tín hiệu», chép tệp vào kho, commit |
| Ai ký commit | Người chạy lượt gom (chủ kho). Ứng dụng không giữ khoá ghi git nào | Một khoá GitHub có quyền GHI kho crm-onehub, nằm trong production | Quản trị |
| Spam, rác | Chỉ người đã đăng nhập; trần mỗi người mỗi ngày; chưa kéo về thì quản trị gỡ được; đã kéo thì gom xếp vào «lẻ» kèm lý do | Rác nằm vĩnh viễn trong lịch sử git. Khoá lộ = ghi được mã production, vì `onehub` không bảo vệ nhánh | Như lối 1 |
| Chi phí khác | Bảng mới → vòng thành **T3** (thêm một cổng duyệt kế hoạch). Cần một đường đọc chỉ-đọc từ production về máy gom — chọn ở S1 | Ghi thẳng `onehub` = mỗi tín hiệu một lần dựng production và một lượt CI. Ghi nhánh phụ thì lượt gom vẫn phải gộp nhánh đó — quay về lối 1. Theo luật kho, khoá GitHub chỉ được sống ở tác nhân | Mỗi lượt gom thêm một bước tay — đúng thứ kit đếm là gọi người |
| Đảo ngược | **Rẻ** — tệp cùng khuôn; sau này chuyển sang tự commit không đổi tệp nào | **Khó** — khoá ghi đã nằm ở production, lịch sử git không xoá sạch được | Rẻ |

Máy khuyên **Lối 1**: không có khoá ghi git nào trong ứng dụng, rác không vào git, chỉ một lệnh ở đầu
lượt gom. Cái giá là hạng T3 và trạng thái tới người gửi chậm một nhịp gom cộng một lần gộp. Lối 3 là
lối 1 bỏ lệnh kéo về; máy chọn giữa lệnh và tải tay ở S1, đảo được.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người không dùng git có dùng cửa này để kể điều mình gặp, và có thấy tín hiệu của mình đi tới đâu không?
- Kết quả nào là SỐNG: trong 30 ngày kể từ ngày lên production: ít nhất 20 tín hiệu, từ ít nhất 3 phòng ban (phòng ban chính của người gửi lúc gửi); và vào ngày đo, mọi tín hiệu gửi trước đó quá 7 ngày đã có chỗ sau gom (một nhóm, lẻ kèm lý do, hay đã có việc) và người gửi thấy chỗ đó trong CRM.
- Kết quả nào là CHẾT: hết 30 ngày mà dưới 10 tín hiệu hoặc dưới 2 phòng ban; hoặc có tín hiệu người gửi không thấy trạng thái nào (mất trên đường vào git). Giữa hai ngưỡng → lặp.
- Timebox: 30 ngày kể từ ngày lên production. Sớm nhất là 15/10, vì chỉ gộp khi crm đã nhận kit 2.27.

## Kết quả prototype

Chưa dựng. Vòng chạm màn hình: bản bấm được làm ở nghi thức thiết kế cuối S1, trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khuôn tín hiệu, ba loại được gom, khuôn bản gom | kit main `skills/acceptance/references/tin-hieu-template.md` (hàng L3, #319, mốc 2.27.0) | triết-lý/logic | có — viết đúng khuôn, không đặt khuôn thứ hai | |
| Câu trạng thái của từng tín hiệu (đường đi) | kit main `scripts/tin-hieu.mjs` (`--duong`), khoá `tin_hieu` của khối dữ liệu lộ trình | triết-lý/logic | có — đọc nguyên câu kit viết, CRM không tự suy trạng thái | |
| Hàm kiểm khuôn yêu cầu | kit `dieu-phoi/scripts/hinh-dang.mjs` (`kiemYeuCau`) | triết-lý/logic | có — chỉ dùng làm thước đo hai chiều | |
| Bố cục và màu của `LO-TRINH.html` | trang kit vẽ ở gốc kho | ngôn-ngữ-thiết-kế/hình-thái | không — nút và danh sách dựng bằng `packages/ui` theo `docs/design.md` | |

## Cổng 0

- **decision = build** Căn cứ: chủ kho gõ trong phiên 12/10 «Cổng Đáng gui-tin-hieu-trong-crm: Làm ; đường vào git: lối 1 ; ngưỡng: như đề xuất», trên khuyến nghị của máy bên dưới.
- **disposition = —** Căn cứ: không có bản mẫu dựng trước Cổng Đáng.
- **Ngưỡng UAT chốt cùng lúc ký:** bốn dòng của mục «Ngưỡng chết / ngưỡng UAT» như máy đề xuất, đã gỡ tiền tố đề xuất. Vế «quá 7 ngày đã có chỗ sau gom» nghĩa là chủ kho gom ít nhất mỗi tuần một lần.
- **Đường vào git chốt cùng lúc ký: Lối 1** — CRM giữ hàng chờ, lượt gom kéo tín hiệu về git, người chạy lượt gom ký commit; ứng dụng không giữ khoá ghi git. Đổi lối là một Cổng Đáng mới.

**Máy khuyến nghị:** `build`, **Lối 1**, một vòng 10–12 tiêu chí, gộp chỉ khi crm đã nhận kit 2.27 (từ 15/10).
Hạng: hàng ghi T2; lối 1 thêm một bảng dữ liệu nên chạm đường T3 (`packages/db/prisma`) — vòng chạy T3,
thêm một cổng duyệt kế hoạch. Máy không đổi chữ trên hàng. Vượt 13 tiêu chí thì máy tự tách «lệnh kéo về
git» thành vòng hai, không hỏi lại.

## Thước đo thành công → ứng viên criterion

Gửi:

1. Nút «Gửi tín hiệu» có trên mọi màn trong ứng dụng; bấm mở một hộp kể; màn đang đứng tự ghi theo.
2. Gửi xong, người gửi thấy ngay tín hiệu của mình ở trạng thái «đã nhận, chưa gom».
3. Chặn rác: trần mỗi người mỗi ngày và trần độ dài; vượt trần thì nói rõ vì sao, không mất chữ đã gõ.

Vào git:

4. Lệnh kéo về sinh tệp đúng khuôn kit; bộ đọc của kit đọc 0 lỗi (đo hai chiều trên cùng tệp).
5. Kéo về không trùng, không sót: chạy hai lần ra cùng kết quả; tín hiệu đã kéo không kéo lại; mã tín hiệu ổn định.
6. Tệp trong git không mang tên hay địa chỉ thư của người gửi, chỉ mang mã mờ.
7. Kho khai cửa tín hiệu trong `_acceptance/config.yaml`; kit 2.27 vẽ lại `LO-TRINH.html` có danh sách tín hiệu.

Trạng thái về người gửi:

8. CRM hiện cho người gửi câu trạng thái kit viết cho từng tín hiệu của họ; tín hiệu chưa có trong bản vẽ → «đã nhận, chưa gom».
9. Người gửi chỉ thấy tín hiệu của mình.
10. Bản vẽ không mang danh sách tín hiệu (kho tự host không khai cửa, bản vẽ cũ) → nút vẫn nhận, trạng thái nói rõ, trang không vỡ.

Đường đo:

11. Đếm tín hiệu theo phòng ban chính của người gửi trong 30 ngày, và tuổi của tín hiệu chưa gom — số cho ngưỡng ở trên.
12. `CONTEXT.md` có mục «Tín hiệu», phân biệt với «góp ý» của Kara và «Báo sai».

## Out of scope từ khám phá

- CRM ghi ý định, trạng thái hay nhóm — kit gom, chủ kho chọn nhóm vào bản phạm vi (chốt 08/10).
- Gom bằng AI trong CRM hay trong tác nhân — việc phán là của phiên gom theo skill của kit.
- Đổi khuôn tín hiệu — khuôn thuộc kit; cần đổi thì báo phiên điều phối.
- Ứng dụng tự commit vào git (lối 2) — nếu chủ kho chọn lối 1.
- Báo tin cho người gửi (thư, Zalo) khi trạng thái đổi — mở khi người gửi không tự mở CRM để xem.
- Bầu chọn, xếp ưu tiên theo số tín hiệu — trái luật «không xếp điểm ưu tiên tự động» của kit.
- Đính ảnh chụp màn hình vào tín hiệu — cần chỗ cất tệp và luật riêng tư; để sau.
- Ngăn hồ sơ trong trang Lộ trình — vòng LT1b.
