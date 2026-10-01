---
schema_version: 1
feature: Vá Trợ lý OKR sau lượt thử 30/09 — nhận vé OIDC khi kiểm khoá mô hình, khoá Gateway riêng cho Trợ lý OKR, bỏ đề xuất Căn chỉnh chồng cùng nhánh, sửa luật «KR đọc như một việc» bắt nhầm khi bỏ dấu và không để hai giọng trái nhau trong hộp sửa KR, kèm hai vá chữ
slug: va-tro-ly-okr-sau-thu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-30T21:23:28Z
design_doc: docs/superpowers/specs/2026-10-01-va-tro-ly-okr-sau-thu-design.md
---

# Acceptance Contract: va-tro-ly-okr-sau-thu

## Context

Lượt thử Trợ lý OKR ngày 30/09 trên demo và prod tìm ra bốn chỗ hỏng: prod báo «Chưa có
khoá mô hình» dù tác tử gọi model được qua OIDC, nên mọi việc góp ý và tóm tắt tuần bị
đóng; khoá riêng chủ kho chốt 26/09 chưa có; trợ lý đề xuất Căn chỉnh chồng lên nhánh đã
căn chỉnh; hộp sửa KR có gợi ý tĩnh và trợ lý nói ngược nhau vì luật động từ bỏ dấu rồi
mới so. Vòng này vá cả bốn và hai chỗ chữ nhỏ, không đổi cấu trúc dữ liệu.

Source input: prompt (chủ kho 30/09–01/10, sau lượt thử trên demo `origin/onehub` 9ee65d12
và thẻ Trợ lý OKR trên https://www.onehub.center/onehub-center/settings/okr); thiết kế
`docs/superpowers/specs/2026-10-01-va-tro-ly-okr-sau-thu-design.md`.

## Criteria

- AC-1: Given hàm nguồn khoá mới và một ma trận viết trước gồm {chỉ `OKR_AI_GATEWAY_API_KEY`, chỉ `AI_GATEWAY_API_KEY`, cả hai, chỉ header `x-vercel-oidc-token` mang vé đúng khuôn còn hạn, chỉ biến `VERCEL_OIDC_TOKEN` còn hạn, không có gì, vé hết hạn, vé không phải JWT, lấy vé ném lỗi, khoá chỉ có khoảng trắng}, When gọi hàm cho từng ô trên một máy không liên kết Vercel (không `.vercel`, không phiên đăng nhập CLI), Then mỗi ô ra đúng một trong `khoa-rieng` · `khoa-chung` · `oidc` · không có theo thứ tự khoá riêng → khoá chung → vé OIDC; không ô nào ném lỗi, không ô nào gọi model hay gọi mạng.
- AC-2: Given kho kiểm có Trợ lý OKR bật, không khoá nào trong biến môi trường và vé OIDC chỉ đến qua header của request context, When nhịp điều phối chạy việc `okr-kiem-san-sang` rồi một việc `okr-de-xuat` đi tới bước chặn trước khi gửi, Then việc kiểm đóng với `san-sang-oidc`, `okr.troLySanSang` trả sẵn sàng, việc góp ý không bị đóng `khong-chay:chua-co-khoa-mo-hinh`; And When không có vé nào, Then việc kiểm đóng `chua-co-khoa-mo-hinh` và việc góp ý bị đóng với mã đó như trước. (cross-layer)
- AC-3: Given kết quả kiểm gần nhất cũ hơn hạn kiểm lại và KHÁC nguồn khoá hiện tại — bảng viết trước {thiếu khoá → nay có vé OIDC, hàng cũ `san-sang` → nay có khoá chung, `san-sang-oidc` → nay có khoá riêng, `san-sang-khoa-chung` → nay không còn gì} — When các nhịp điều phối kế chạy, Then trong một nhịp đúng một việc kiểm mới được xếp và đóng với kết quả của nguồn mới, `okr.troLySanSang` theo nguồn mới mà không ai tắt bật; And Given kết quả gần nhất trùng nguồn hiện tại hoặc chưa quá hạn, Then không việc kiểm nào được xếp, kể cả qua nhiều nhịp; hàng cũ `san-sang` vẫn đọc được là sẵn sàng cho tới lượt kiểm lại. (cross-layer)
- AC-4: Given mục năng lực «AI model» của tác tử (nói về mọi việc AI, không riêng OKR) và ma trận viết trước {chỉ header OIDC, không gì, chỉ khoá chung, chỉ khoá riêng, riêng + chung, riêng + header OIDC, riêng + biến OIDC}, When đọc mục ở từng ô, Then mục bật đúng khi có khoá chung hoặc vé OIDC, bất kể khoá riêng có hay không — mục hỏi hàm nguồn khoá ở chế độ bỏ qua khoá riêng, không lọc theo giá trị hàm trả cho Trợ lý OKR, và không đọc biến riêng.
- AC-5: Given `OKR_AI_GATEWAY_API_KEY` có giá trị, When dựng model của Trợ lý OKR, Then nhà Gateway được tạo với đúng khoá đó; When biến vắng, Then model đi qua Gateway mặc định (khoá chung hoặc OIDC) như trước; And trong cả hai ca mỗi lời gọi mang `zeroDataRetention: true`, nhãn `onehub:tro-ly-okr` và trần ra của Trợ lý.
- AC-6: Given biến `OKR_AI_GATEWAY_API_KEY`, When đọc `.env.example`, `turbo.json` `globalPassThroughEnv`, pass-through `dev` của tác tử và `docs/environment.md`, Then biến có mặt ở cả bốn chỗ kèm một câu nói nó làm gì và thiếu thì rơi về đâu; và không nằm trong `env` của turbo (bí mật chỉ đi qua pass-through).
- AC-7: Given kết quả kiểm gần nhất ở từng giá trị {`san-sang-khoa-rieng`, `san-sang-khoa-chung`, `san-sang-oidc`, `san-sang` cũ, `chua-co-khoa-mo-hinh`}, When quản trị mở Cài đặt › Chương trình OKR, Then `okr.aiChiTieu` trả `nguonKhoa` tương ứng (`khoa-rieng` · `khoa-chung` · `oidc` · `chua-ro` · null) và thẻ Trợ lý OKR hiện đúng dòng của bảng trạng thái ST-caidat-* trong thiết kế — hàng cũ `san-sang` hiện «Sẵn sàng» không kèm nguồn, không bao giờ hiện chữ thiếu khoá; ca thiếu khoá có câu nói cắm biến nào vào dự án tác tử hoặc bật OIDC của dự án đó; thẻ không có ô nhập khoá. (cross-layer)
- AC-8: Given một Mục tiêu đã căn chỉnh tới một KR của Mục tiêu X (và một Mục tiêu khác căn chỉnh thẳng tới X), When dựng gói góp ý cho từng Mục tiêu, Then danh sách đích Căn chỉnh không còn X lẫn bất kỳ KR nào của X, còn Mục tiêu cấp trên Y không liên quan vẫn có; And When trợ lý vẫn nộp một dòng Căn chỉnh tới X, Then dòng bị ghi `bi-loai` mã `id-ngoai-goi` (đích không còn trong gói) và không hiện ở `okr.troLyDanhSach`; And Given một dòng Căn chỉnh `cho` tới KR của X ghi trước khi Mục tiêu nhận căn chỉnh tới X, When đọc lại danh sách, Then dòng không hiện. (cross-layer)
- AC-9: Given bảng ca viết trước cho luật «KR đọc như một việc» — mỗi động từ của danh sách một cặp câu có dấu và câu gõ không dấu, cộng các cặp trùng mặt chữ khi bỏ dấu («Hợp đồng…»/«Họp…», «Gói…»/«Gọi…», «Lâm…»/«Làm…») và «Hợp đồng bán lẻ chốt được đạt 6 tỷ đồng», When chạy luật, Then câu mở bằng động từ việc (có dấu hoặc gõ không dấu) bị gắn `kr-la-viec`, câu mở bằng chữ trùng mặt khi bỏ dấu thì không; mọi ca cũ của luật vẫn giữ kỳ vọng.
- AC-10: Given hộp sửa KR có cột góp ý rỗng, When dưới ô của hộp đang có gợi ý tĩnh, Then mô tả rỗng là «Trợ lý OKR không có góp ý thêm ngoài gợi ý dưới ô.»; When không có gợi ý tĩnh, Then mô tả giữ «… đã đọc ổn.»; gợi ý tĩnh luôn hiện.
- AC-11: Given KR có đơn vị đo và dòng xu hướng, When mở hộp sửa KR, Then dòng xu hướng kết thúc bằng giá trị ước kèm đơn vị («… khoảng 6,61 tỷ đồng»), KR không đơn vị thì như cũ; And Given cột góp ý đã quyết hết mọi dòng, Then đầu cột ghi «Đã quyết hết đề xuất. …» thay cho «0 đề xuất. …».
- AC-12: Given bộ OKR mẫu trên máy đo với khoá chung của tác tử, When mở hộp sửa KR «Hợp đồng bán lẻ chốt được đạt 6 tỷ đồng» của Kinh doanh miền Bắc và thẻ Trợ lý OKR ở Cài đặt bằng quản trị mẫu, Then hộp KR không có gợi ý «đọc như một việc làm» và dòng xu hướng có «tỷ đồng»; thẻ hiện «Sẵn sàng · khoá chung của tác tử»; ở 1440 và 390 không màn nào tràn ngang.
- AC-13: Given diff của lượt, When đọc, Then diff giữ luật kho — không chú thích trong mã, trí khôn ở `apps/agent`, khuôn parse ở biên trong `packages/validation`, hằng tinh chỉnh (tên biến khoá, danh sách động từ) ở tệp cấu hình của khu, giao diện chỉ dùng thành phần của `packages/ui`; `docs/agent.md` nói hàm nguồn khoá và khoá riêng; chữ trên màn dùng «tác tử» như các câu sẵn có (không «tác nhân», từ đó của **Tác nhân** trong `CONTEXT.md`). (judgment)

## Coverage

Quét tay theo bốn việc chủ kho đã chốt, không qua `morphological-scan` (entry d-20260930T211805Z-1).

- Trục A — nguồn khoá: khoá riêng · khoá chung · vé OIDC qua header · vé OIDC qua biến · không có · vé hết hạn · vé sai khuôn · lấy vé ném lỗi · khoá rỗng · tổ hợp riêng + chung/OIDC [thước CE: `getGatewayAuthToken` của `@ai-sdk/gateway` 4.0.69, `getVercelOidcToken` của `@vercel/oidc` 3.2.0]
- Trục F — đổi nguồn sau khi đã kiểm: thêm vé · thêm khoá chung · thêm khoá riêng · gỡ hết · hàng cũ không nguồn · không đổi
- Trục B — nơi dùng nguồn khoá: kiểm sẵn sàng · chặn trước khi gửi · năng lực «AI model» · dựng model · thẻ Cài đặt [thước CE: grep `coKhoaMoHinh`, `MO_HINH_AI`, `khoaMoHinh` trên `origin/onehub` 9ee65d12]
- Trục C — quan hệ căn chỉnh sẵn có: tới Mục tiêu X · tới KR của X · không liên quan · dòng `cho` cũ [thước CE: mô hình `OkrAlignment` — đích là Mục tiêu hoặc KR]
- Trục D — mặt chữ động từ: có dấu khớp · gõ không dấu khớp · trùng mặt khi bỏ dấu [thước CE: `OKR_KIEM.dongTuViec`]
- Trục E — hai giọng: gợi ý tĩnh có · không × cột KR (hộp Mục tiêu không có gợi ý tĩnh — entry d-20260930T212527Z-7)
- [GIẢ ĐỊNH] Việc kiểm sẵn sàng chạy trong nhịp điều phối nên có header OIDC trên Vercel; đo lại trên prod sau deploy.
- [GIẢ ĐỊNH] Căn chỉnh chồng loại trọn nhánh, kể cả KR khác của cùng Mục tiêu cấp trên.
- [GIẢ ĐỊNH] Gợi ý tĩnh luôn hiện; chỉ lời của Trợ lý đổi khi hai bên cùng có mặt.

## Out of scope

- Ô nhập khoá trong Cài đặt, và chuyển các khoá khác của tác tử sang Cài đặt — khoá của nơi chạy máy chủ ở biến môi trường.
- Việc đối soát chi phí với báo cáo AI Gateway (`ai-doi-soat`) vẫn đọc `AI_GATEWAY_API_KEY`; không dùng khoá riêng hay OIDC ở lượt này.
- Kiểm lại trước hạn 10 phút khi nguồn đổi — hạn giữ như cũ để không xếp dồn việc kiểm.
- Trần tiền đặt trên khoá riêng ở phía Gateway — chủ kho đặt trong Vercel khi tạo khoá.
- Đổi lời hay luật của các gợi ý tĩnh khác (`thieu-khoi-diem`, `dich-bang-khoi-diem`, `thieu-doi-trong`).
- Đổi thời gian hiện của nút Hoàn tác (mặc định toàn ứng dụng).

## Notes

- Sau khi gộp và deploy, chủ kho soát thẻ Trợ lý OKR trên prod lên «Sẵn sàng · qua Vercel» trong khoảng 10 phút; không lên thì giả định đầu tiên của Coverage sai và vòng mở lại.
