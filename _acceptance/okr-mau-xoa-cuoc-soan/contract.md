---
schema_version: 1
feature: "Gỡ bộ OKR mẫu (`bun run okr:mau --xoa`, và nạp lại) gỡ luôn cuộc soạn OKR trên chu kỳ, đơn vị hay người mẫu cùng đề xuất của chúng, đếm chúng vào dòng in, và giữ hàng chi phí AI"
slug: okr-mau-xoa-cuoc-soan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, db]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-10T22:42:23Z
design_doc: docs/superpowers/specs/2026-10-11-okr-mau-xoa-cuoc-soan-design.md
---

# Acceptance Contract: okr-mau-xoa-cuoc-soan

## Context

Tái hiện 2026-10-10 (anh Mạnh): nạp bộ mẫu, `le-hai-dang` bật Soạn OKR cho `mau-okr-pb-kd-bac`,
`nguyen-thi-lan` mở một cuộc soạn trên `mau-okr-chu-ky-nam-ke`, rồi `bun run okr:mau --xoa`: thoát 0, báo đã
xoá hết, nhưng còn một hàng `okrCuocSoan` (`cycleId='mau-okr-chu-ky-nam-ke'`, `departmentId='mau-okr-pb-kd-bac'`).
Bảng không có khoá ngoại; `xoaTrong` không biết nó; đề xuất của cuộc mang `objectiveId` rỗng nên đường xoá đề
xuất theo Mục tiêu cũng không chạm tới.

Source input: lời giao trong phiên 2026-10-11 · design doc · `docs/setup.md` «Bộ OKR mẫu».

## Criteria

- AC-1 (cross-layer): Given bộ mẫu đã nạp, `le-hai-dang` bật soạn cho đúng phòng `mau-okr-pb-kd-bac` qua thủ tục cấu hình thật, `nguyen-thi-lan` mở một cuộc qua `okr.soanMo` thật trên `mau-okr-chu-ky-nam-ke`, và cuộc có hai đề xuất ghi bằng bộ ghi thật của tác tử (một chờ, một đã bác), cùng ba cuộc ghi bằng bộ mở cuộc thật mà mỗi cuộc chỉ một vế trỏ bộ mẫu — chỉ `departmentId`, chỉ `divisionId`, chỉ `nguoiMoUserId` — mỗi cuộc một đề xuất, When chạy `bun run okr:mau --xoa`, Then lệnh thoát 0; không còn hàng `okrCuocSoan` nào có `cycleId`, `divisionId` hay `departmentId` bắt đầu `mau-okr-` hoặc `nguoiMoUserId` là người mẫu (mỗi vế có ca riêng); không còn `okrDeXuat` nào mang mã của bốn cuộc đó; quét mọi cột `id`/`*Id` của kho tìm mã người, bộ phận, phòng ban, chu kỳ, Mục tiêu và KR mẫu (chụp trước khi xoá; tập này không gồm mã cuộc soạn) ra rỗng, trừ đúng một khoá đã khai giới hạn — `okrProgramConfig.createdById` (xem Out of scope); và nạp lại ngay sau đó thoát 0.
- AC-2: Given cùng kho của AC-1, When `--xoa` chạy xong, Then dòng in bắt đầu «Đã xoá bộ OKR mẫu:» và chứa đúng «4 cuộc soạn OKR với 5 đề xuất soạn».
- AC-3: Given kho không còn bộ mẫu nhưng còn một cuộc soạn mồ côi trỏ `mau-okr-chu-ky-nam-ke`, `mau-okr-pb-kd-bac` và `nguyen-thi-lan` (đúng hình hàng sót của ca tái hiện, ghi bằng bộ mở cuộc thật) cùng một đề xuất của nó, When chạy `--xoa`, Then lệnh thoát 0, cuộc và đề xuất không còn, dòng in là «Đã xoá bộ OKR mẫu:» có «1 cuộc soạn OKR với 1 đề xuất soạn» — không phải «không có bộ mẫu».
- AC-4: Given cùng kho của AC-1 có thêm một cuộc soạn ngoài bộ mẫu (chu kỳ, phòng và người mở không mang mã mẫu) với một đề xuất, When chạy `--xoa`, Then cuộc và đề xuất ngoài bộ mẫu còn nguyên từng cột.
- AC-5: Given bộ mẫu có một cuộc soạn mở qua `okr.soanMo` và đề xuất của nó, When nạp lại (`bun run okr:mau` không cờ), Then lệnh thoát 0, không còn cuộc nào trỏ mã mẫu và không còn đề xuất của cuộc cũ; số hàng các bảng của bộ mẫu bằng lần nạp trước.
- AC-6: Given cuộc soạn của AC-1 có một hàng chi phí AI (`tinhNang = "okr.soan"`, `taskId` là mã cuộc, `sessionId` là phiên của cuộc) ghi bằng bộ ghi chi phí thật, When chạy `--xoa`, Then hàng chi phí còn nguyên từng cột và tổng chi tiêu AI của tháng (`chiTieuKhung`) bằng đúng trước khi xoá.
- AC-7: Given bộ mẫu có cuộc soạn và đề xuất, và một thoả thuận ngoài bộ mẫu do người mẫu làm chủ, When chạy `--xoa`, Then lệnh thoát 5 và mọi bảng của kho giống hệt trước, kể cả `okrCuocSoan` và `okrDeXuat`.
- AC-8 (judgment): Given `docs/setup.md` mục «Bộ OKR mẫu», When người mới đọc, Then họ biết `--xoa` và nạp lại gỡ cuộc soạn trên chu kỳ, đơn vị hay người mẫu cùng đề xuất của chúng (kể cả cuộc sót từ lần xoá trước), và biết hàng chi phí AI của các cuộc đó được giữ vì chúng là tiền đã tiêu và nuôi trần chi phí tháng; và mục không tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật mà `CONTEXT.md` không có.
- AC-9: Given bảy bản sao phá vật thật — (a) bỏ lệnh xoá `okrCuocSoan`, (b) bỏ lệnh xoá `okrDeXuat` theo mã cuộc, (c) chọn cuộc chỉ theo `cycleId` thuộc danh sách chu kỳ mẫu đang có, bỏ mọi vế tiền tố, (d) thêm lệnh xoá `aiChiPhi` theo mã cuộc, (e) bỏ số cuộc soạn khỏi dòng in, (f) bỏ vế `departmentId`, (g) bỏ vế `nguoiMoUserId` — When chạy phép đo tương ứng trên bản sao, Then mỗi phép đo xanh trước khi phá và đỏ sau khi phá với đúng thông điệp ghim của nó, và tệp thật không đổi.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`). Trục: loại hàng sinh ra khi soạn (cuộc · đề xuất mọi trạng
thái · chi phí AI · nhật ký sự kiện · vết · Mục tiêu do «Đưa vào» tạo) × đường gỡ (`--xoa` · nạp lại · nạp hỏng tự
dọn) × trạng thái kho (bộ đủ · chỉ còn cuộc mồ côi · có cuộc ngoài bộ mẫu · dữ liệu ngoài giữ người mẫu). Thước CE:
bốn bảng tác tử soạn khai được ghi (`docs/agent.md`), ba lời gọi `xoaTrong` trong `nap.ts`, mã thoát ở
`docs/setup.md`. Core → AC-1…AC-7. Nạp hỏng tự dọn phủ gián tiếp (cùng `xoaTrong`); Mục tiêu do «Đưa vào» tạo ở
Out of scope.

## Out of scope

- Mục tiêu do «Đưa vào bộ OKR» hay chốt hỏi ý tạo trong chu kỳ mẫu: chúng mang mã không có tiền tố `mau-okr-`, nên `--xoa` từ chối mã 3 khi có chúng. Lỗi khác, việc riêng.
- Xoá `agentEvent` của phiên soạn (không cột nào trỏ mã mẫu; nhật ký vận hành).
- Phiên eve trong kho phiên của `apps/agent-okr`.
- Vết `okrTrail` của cuộc soạn: tác tử soạn không ghi vết (bốn bảng nó ghi là `okrDeXuat`, `okrCuocSoan`, `aiChiPhi`, `agentEvent` — `docs/agent.md`); vết `soan-okr:` do «Đưa vào bộ OKR» ghi mang `cycleId`/`objectiveId` của chu kỳ và Mục tiêu mẫu nên đã đi theo đường xoá vết hiện có.
- Thêm khoá ngoại cho `okrCuocSoan` (đường T3 `packages/db/prisma`).
- Phiên bản cấu hình chương trình OKR (`okrProgramConfig`) do người mẫu tạo — vd bật Soạn OKR bằng `le-hai-dang` ở bước 2 của ca tái hiện — còn lại sau `--xoa`, trỏ người đã xoá. Xoá nó là lùi cấu hình của cả workspace về bản trước; quyết định riêng, việc riêng (sổ quyết định, dòng `descope` sau seal).

## Notes

- Không ui-check: hồ sơ không có mặt người nhìn (`surfaces: [cli, db]`).
- Hàng chi phí còn lại trỏ `taskId` của một cuộc đã xoá; không bộ đọc nào đi từ chi phí sang cuộc.
- Known limits: sau `--xoa`, phiên bản `okrProgramConfig` do người mẫu tạo vẫn còn, `createdById` trỏ người đã xoá, và `aiSoanDonVi` có thể còn mã đơn vị mẫu.
