---
schema_version: 1
feature: Bộ OKR mẫu — máy dev có một công ty giả chạy OKR đủ một quý (40 người, ba bộ phận, mười phòng ban, OKR năm và quý 4, sáu tuần Cập nhật tuần, quý 3 đã khép, 30 ca góp ý cùng khuôn N1), nạp bằng một lệnh từ chối production và workspace có OKR thật
slug: bo-okr-mau
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, cli]
status: draft
design_doc: docs/superpowers/specs/2026-09-28-bo-okr-mau-design.md
---

# Acceptance Contract: bo-okr-mau

## Context

Chủ kho quyết 2026-09-28: mọi hạng mục OKR còn lại dựng trên dữ liệu mẫu, bật trên dữ
liệu thật. Hạng mục M dựng một bộ mẫu dùng chung trước mọi lượt khác, để mười lượt sau
đo trên cùng một công ty. Không bảng mới, không cột mới, không chạm quyền: bộ nạp ghi
vào các bảng OKR và tổ chức đã có, mọi hàng đi qua khuôn nhập của sản phẩm.

Source input: `docs/plan/lo-trinh-okr.md` mục 5 «Dựng hết bằng dữ liệu mẫu» và dòng M
mục 10 (nhánh `docs/okr-dung-het-bang-du-lieu-mau`, PR #183) ·
`docs/plan/lo-trinh-tro-ly-okr.md` mục N1 · `docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md`
§4.11 · `docs/setup.md` · prompt phiên M ngày 2026-09-28.

## Criteria

- AC-1: Given một kho cục bộ chưa có bộ mẫu — kho sạch, và kho đã có sẵn người và phòng ban ngoài bộ mẫu — When chạy `bun run okr:mau`, Then bộ mẫu vào workspace `WORKSPACE_ID` của kho, và đọc lại qua `toChuc.tree` và bảng thành viên thấy đúng cây viết trong `cong-ty.json`: 40 người mẫu, 3 bộ phận mỗi bộ phận có trưởng, 10 phòng ban mỗi phòng ban có trưởng là người thuộc chính phòng đó, mọi người mẫu có phòng ban chính; người của Tài chính, Nhân sự, Pháp chế mang vai «chỉ OKR», một người mang vai quản trị, còn lại vai thành viên; And mọi người mẫu có thư đuôi `@mau.onehub.test`; người và phòng ban sẵn có đứng nguyên cạnh phần mẫu; kho không có hàng workspace thì lệnh thoát mã 4 với câu ghim bảo chạy `db:seed`, 0 hàng ghi.
- AC-2: Given bộ mẫu đã nạp, When quản trị mẫu gọi `okr.cycles` và `okr.toanCanh` của quý 4 mẫu, Then có ba chu kỳ mẫu — năm, quý 3 pha «Đã đóng», quý 4 pha «Đang chạy» nằm trong năm và không chồng quý 3; ba mục tiêu cấp OneHub của năm đã công bố; mỗi phòng ban mẫu trong 10 có ít nhất một mục tiêu quý 4 đã công bố — kể cả khi kho có phòng ban ngoài bộ mẫu; mọi mục tiêu phòng ban đã công bố căn chỉnh vào một mục tiêu hoặc KR OneHub (đọc qua `okr.cayCanChinh`); có đúng một mục tiêu nháp và một mục tiêu đã bỏ; số mục tiêu và KR mỗi đơn vị không vượt trần mặc định của chương trình.
- AC-3: Given bộ mẫu đã nạp, When đọc mọi KR quý 4 mẫu, Then mỗi kiểu trong sáu kiểu KR có ít nhất ba KR; mọi bộ số (khởi điểm, đích, hiện tại) qua `krInput` và `kiemSoTheoKieu` không lỗi; And có ít nhất năm KR nguồn CRM, mỗi KR có dòng `OkrNguonKr` parse được bằng `parseOkrNguon` với chỉ số thuộc `CHI_SO_OKR`, kiểu KR không phải «mốc» hay «phần trăm», và đúng sáu bản chụp số tuần.
- AC-4: Given bộ mẫu nạp với mốc là một ngày trong tuần T, When quản trị mẫu gọi `okr.hopTuan` cho từng phòng ban của quý 4 mẫu, Then mọi KR quý 4 mẫu đang chạy có lần Cập nhật tuần ở tuần 1 là tuần T − 5; KR kịch bản «đều» có sáu lần, một lần mỗi tuần, tuần cuối là T; KR của người phụ trách kịch bản «chưa gửi» có năm lần, tuần cuối là T − 1; không lần cập nhật, phiên hay bản chụp nào muộn hơn mốc — với mốc là thứ Hai 00:30, thứ Năm, và Chủ nhật 23:30 giờ Việt Nam; có ít nhất ba KR mà mức tự tin đi xuống qua các tuần (cao → vừa → thấp); danh sách «đáng bàn» của toàn công ty có ít nhất hai KR lý do «tụt» và ít nhất hai KR lý do «im» (lần cuối cách mốc từ 14 ngày); giá trị hiện tại của mỗi KR tay bằng giá trị lần cập nhật cuối; And mỗi người phụ trách có đúng một phiên cập nhật đã gửi mỗi tuần mà họ có lần cập nhật.
- AC-5: Given bộ mẫu đã nạp, When quản trị mẫu gọi `okr.bangCham` của quý 3 mẫu, Then mỗi phòng ban có một mục tiêu đã công bố, mọi KR có điểm (số chốt bằng giá trị hiện tại, điểm gợi ý bằng `goiYDiem` tính trên cùng số, điểm người chấm có), ít nhất hai KR có điểm khác gợi ý kèm lý do, mọi mục tiêu có điều học được, số KR chưa chấm là 0; And ba mục tiêu quý 3 có liên kết mang sang tới một mục tiêu quý 4 mẫu (`OkrMangSang`), đọc được ở cả hai phía.
- AC-6: Given hai lần nạp với cùng `--moc 2026-11-12` vào hai kho sạch, When so nội dung hai kho (mã, số, ngày, chữ của mọi hàng bộ mẫu), Then giống nhau từng hàng; And lần nạp không `--moc` đặt tuần 6 là tuần chứa hôm nay theo giờ Việt Nam; `--moc` sai dạng bị từ chối với câu ghim trước khi ghi.
- AC-7: Given bộ mẫu đã nạp và kho có thêm hàng ngoài bộ mẫu (người, phòng ban, công ty, thoả thuận), When chạy `bun run okr:mau` lần hai, Then số hàng bộ mẫu ở mọi bảng bằng lần một, không mã nào nhân đôi, và mọi hàng ngoài bộ mẫu đọc lại không đổi.
- AC-8: Given bộ mẫu đã nạp cùng hàng ngoài bộ mẫu, và sau khi nạp dịch vụ thật đã ghi lên thực thể mẫu (mở họp tuần, `dev:session` của người mẫu, mở và gửi Cập nhật tuần), When chạy `bun run okr:mau --xoa`, Then thoát 0 và không model nào của schema còn hàng mang mã của thực thể mẫu hay trỏ tới thực thể mẫu, mọi hàng ngoài bộ mẫu đọc lại không đổi; nạp lại sau đúng chuỗi đó cũng thoát 0; And một thoả thuận ngoài bộ mẫu giao cho người mẫu làm `--xoa` thoát mã 5 với câu ghim nêu bảng đang giữ, 0 hàng đổi; `--xoa` trên kho chưa có bộ mẫu thoát 0 và báo không có gì để xoá.
- AC-9: Given `DATABASE_URL` trỏ một máy chủ không phải máy cục bộ (tên miền, IP ngoài), hoặc `NODE_ENV=production`, hoặc `VERCEL_ENV` là `production` hay `preview`, kể cả khi đặt `ALLOW_REMOTE_DB=1`, When chạy `bun run okr:mau` (và `--xoa`), Then lệnh thoát mã 2 với câu ghim nêu máy chủ và lý do, trước khi mở kết nối cơ sở dữ liệu nào; And đối chứng: cùng lệnh với `localhost`, `127.0.0.1`, `::1`, và `localhost` kèm `VERCEL_ENV=development` qua được bước chặn.
- AC-10: Given kho cục bộ có một chu kỳ, mục tiêu hoặc KR không thuộc bộ mẫu, When chạy `bun run okr:mau` (và `--xoa`), Then lệnh thoát mã 3 với câu ghim nêu số chu kỳ, mục tiêu, KR thật, và không hàng nào của kho đổi; And đối chứng: kho chỉ có OKR của bộ mẫu (lần nạp trước) thì nạp lại chạy, không bị coi là OKR thật.
- AC-11: Given một bản sao `cong-ty.json` hỏng — KR «tăng tới» có đích nhỏ hơn khởi điểm; trưởng phòng ban không thuộc phòng đó; KR nguồn CRM kiểu «mốc»; mã người trùng — When nạp bản sao đó, Then mỗi ca thoát mã 4 với câu nêu đúng đường dẫn trường hỏng, và không hàng nào của kho đổi.
- AC-12: Given bộ mẫu đã nạp, When người phụ trách kịch bản «chưa gửi» gọi `okr.moCapNhat` rồi `okr.guiCapNhat` cho một KR tay của mình với giá trị mới, và người vai «chỉ OKR» mẫu gọi `okr.toanCanh`, Then lần gửi thành công, đọc lại KR có giá trị mới và đúng một lần cập nhật mới có tuần là tuần T, phiên có thời điểm gửi; người vai «chỉ OKR» đọc được toàn cảnh nhưng gọi danh sách thoả thuận thì bị từ chối như mọi người vai «chỉ OKR»; And sau đó `bun run okr:mau` lần nữa vẫn nạp lại được (lần cập nhật thật trên KR mẫu thuộc bộ mẫu và bị thay).
- AC-13: Given thư mục `apps/agent/evals/okr/ca-gop-y/mau/`, When gọi `docBoCaGopY` trên thư mục đó, Then đọc được ít nhất 30 ca, mỗi ca qua khuôn `caGopY` của `@crm/validation/okr-ca-gop-y`; có ít nhất năm ca trộn Anh–Việt, ít nhất ba ca `khongGopY`, mỗi mã trong `MA_VAN_DE` có ít nhất hai ca, ít nhất bốn ca bộ «ng» có cấp trên; mọi KR trong ca qua `krInput` và `kiemSoTheoKieu` (trừ ca cố ý khai sai số nêu trong `kyVong`); mã ca không trùng; And một thư mục khác chứa ca hợp lệ đọc được bằng cùng hàm, một tệp sai khuôn làm hàm ném lỗi nêu tên tệp và trường; thư mục `ca-gop-y/that/` bị git bỏ qua.
- AC-14: Given một phiên đo có bộ mẫu vừa nạp, When trưởng một phòng ban mẫu đăng nhập và mở OKR «Toàn cảnh» rồi bảng họp tuần của phòng mình trong trình duyệt thật của cây đang xét, Then trang sau đăng nhập không phải màn onboarding; Toàn cảnh hiện đủ 10 phòng ban mẫu với tiến độ; bảng họp tuần có khối «đáng bàn» với ít nhất một KR; ảnh chụp ở 1440 lưu làm bằng chứng. (cross-layer)
- AC-15: Given một phiên của lượt sau đọc `docs/setup.md` và `CONTEXT.md`, When cần máy dev hay phiên đo có bộ mẫu, Then tài liệu cho lệnh nạp, nạp lại, xoá, ghim ngày, cách dùng trong `do:man --chay`, cách đăng nhập làm người mẫu, chỗ đặt ca thật của N1, và vì sao bản xem trước không có bộ mẫu; `CONTEXT.md` có mục «Bộ OKR mẫu». (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — lớp dữ liệu:** tổ chức và vai · OKR năm · OKR quý 4 · sáu tuần Cập nhật tuần · quý 3 đã khép · ca góp ý [thước CE: năm gạch đầu dòng mục 5 lộ trình + model Okr* của schema] → AC-1…AC-5, AC-13
- **Trục B — tình huống lệnh:** kho mới · nạp lại · xoá · OKR thật · không cục bộ / production · tệp hỏng [thước CE: câu «Lệnh nạp từ chối …» + NGÀNH Rails, Laravel] → AC-7…AC-11
- **Trục C — bên đọc:** dịch vụ đọc · thủ tục ghi thật · màn · eval tác nhân [thước CE: danh sách lượt dùng bộ mẫu] → AC-1…AC-5, AC-12, AC-14, AC-13
- **Trục D — thời gian:** ngày nạp · ngày ghim [thước CE: `lyDoCua(kr, homNay)`] → AC-4, AC-6
- Chân ngành: lệnh gieo tự chặn production [NGÀNH: Rails `ProtectedEnvironmentError`] [NGÀNH: Laravel `db:seed --force`] — kho này không có cờ vượt.
- [GIẢ ĐỊNH] Tuần 6 của quý 4 mẫu là tuần chứa ngày nạp, chu kỳ đặt theo tuần chứ không theo lịch quý; tên chu kỳ theo câu chuyện («Quý 4 · mẫu»).
- [GIẢ ĐỊNH] «OKR thật» = chu kỳ, mục tiêu hay KR không mang tiền tố mã bộ mẫu; hàng tổ chức và người ngoài bộ mẫu không chặn nạp.
- [GIẢ ĐỊNH] Hạng mục giao máy dev và phiên đo; bản xem trước ra ngoài phạm vi vì nó dùng chung cơ sở dữ liệu và api với production (điểm quyết định ở Cổng Phạm vi).

## Đường đo

Không có `opportunity.md`: hạng mục đi thẳng từ quyết định lộ trình của chủ kho, không qua
Cổng Đáng, không ngưỡng nghiệm thu. Thước sống của nó là việc các lượt sau dùng lại —
sổ theo dõi mục 10 ghi lượt nào nạp bộ mẫu trong tiền đề của nó.

## Out of scope

- Bản xem trước trên Vercel — dùng chung cơ sở dữ liệu và api production; có bộ mẫu khi
  chủ kho tách cơ sở dữ liệu và api cho preview.
- Chạy trên production, dưới bất kỳ cờ nào.
- Gắn bộ mẫu vào kho mẫu của phiên đo (`crm_<cây>__mau_do`).
- Ca tóm tắt tuần của 9c; đề xuất và tóm tắt AI sinh sẵn.
- Sửa `packages/db/prisma/schema.prisma` hay `prisma/seed.ts`.

## Notes

- Bộ mẫu không chứa dữ liệu thật nên nằm trong git; ca thật của N1 nằm ở
  `apps/agent/evals/okr/ca-gop-y/that/`, ngoài git.
