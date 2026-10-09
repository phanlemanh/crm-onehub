---
schema_version: 1
feature: "Kara góp ý OKR lượt 2: vùng Kara dùng khung chung và không biến mất khi lỗi, không chờ mãi, Căn chỉnh có Hoàn tác, người phụ trách nhiều KR nhờ được Kara, chữ và ngày giờ nhất quán"
slug: kara-gop-y-luot-2
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-09
design_doc: docs/superpowers/specs/2026-10-09-kara-gop-y-luot-2-design.md
---

# Acceptance Contract: kara-gop-y-luot-2

## Context

Hàng K3 của dãy P1, đợt `sau-14-10`; Cổng Đáng `build` theo luật 16 (2026-10-07T13:13:50Z). Lượt hai của «Kara góp
ý OKR» (`gop-y-dung-cho`, đã gộp). Gom mười lăm mục của hàng K3 trong lộ trình: G1, G4–G7, #1–#6 (Ngoài-11, 13, 14,
15 và ba Known limits Ngoài-1, 4, 16 của `gop-y-dung-cho`), C4e. Bốn câu Q1–Q4 của design doc chốt ở cổng này.

Source input: `opportunity.md` · design doc · `_acceptance/gop-y-dung-cho/{contract,review-findings,decisions}` ·
`docs/ai-ux.md` §2, §3, §5–7 · `.acceptance-runs/soan-okr-trang-rieng/giu/k3-dau-vao.md` (soát hiện trạng 09/10).

## Criteria

- AC-1: Given khung Mục tiêu có góp ý của Kara, When mở khung ở khổ 1440 và 390, Then vùng Kara là một `DetailSheetSection` như hai vùng bên cạnh (mang `data-vung-kara`), mỗi góp ý là `KaraProposal` không vẽ dấu tia sáng riêng (dấu chỉ còn ở nhãn vùng), và khi Kara đang làm thì các nút quyết trong vùng tự khoá qua `KaraBusyProvider`.
- AC-2: Given danh sách góp ý của Mục tiêu tải lỗi (máy chủ trả lỗi hay mất mạng), When khung đang mở, Then vùng Kara vẫn hiện với `KaraState` lỗi «Kara chưa <tải góp ý> được» và Thử lại; bấm Thử lại tải lại danh sách (không gọi Nhờ Kara, không trừ lượt); chip ngoài danh sách và vùng không mâu thuẫn (không còn ca chip ghi «N góp ý» mà vùng biến mất).
- AC-3: Given người bấm «Nhờ Kara góp ý» và máy chủ từ chối hay lỗi, When lời gọi kết thúc, Then vùng hiện `KaraState` lỗi với câu sản phẩm và Thử lại; nút không sáng lại im lặng.
- AC-4: Given khung mở khi Kara đang đọc Mục tiêu (do chính người này, người khác, hay một lần mở trước), When quá trần chờ của góp ý (30 giây, `TRO_LY_OKR_TRAN.tranChoMs` của `@crm/validation/okr-tro-ly`) tính từ lúc khung thấy Kara đang đọc, Then vùng sang `KaraState` lỗi có Thử lại thay cho «Kara đang đọc…» mãi; dưới trần thì vẫn là «đang đọc».
- AC-5: Given nút Kara khoá hay ẩn (hết lượt trong ngày, Kara tạm nghỉ, đơn vị chưa bật), When vùng ở trạng thái lỗi hay rỗng, Then vùng hiện `KaraState off` nói vì sao và khi nào mở lại; không có nút «Thử lại» nào bị xám mà không lời giải thích.
- AC-6: Given quyết một góp ý (nhận, sửa, bác, hoàn tác) mà máy chủ trả lỗi — không có góp ý mang mã đó, góp ý đã cũ, chưa sẵn sàng, mất mạng — When lỗi về, Then dưới góp ý hiện câu sản phẩm theo từng loại lỗi từ `okr-gop-y.ts`, không chứa mã thô, tên «Trợ lý OKR», hay câu tiếng Anh của trình duyệt.
- AC-7: Given góp ý loại «Căn chỉnh» vừa được nhận, When biên nhận hiện, Then biên nhận có Hoàn tác khi lần nhận tạo ra một liên kết mới; bấm Hoàn tác gỡ đúng liên kết vừa tạo (có sau lần nhận mà không có trước, khớp đích của kết quả nhận) và biên nhận chuyển sang «Đã hoàn tác» — đúng Hoàn tác của lượt một, góp ý ở máy chủ giữ trạng thái đã nhận; không bao giờ gỡ một liên kết có từ trước, kể cả cùng đích; Hoàn tác lỗi thì câu lỗi hiện dưới biên nhận.
- AC-8: Given hai KR vừa nhận, When bấm Hoàn tác trên KR thứ nhất rồi ngay trên KR thứ hai trước khi lần đầu xong, Then biên nhận của mỗi KR chuyển sang «Đã hoàn tác» khi lần của nó xong, và lỗi của lần nào hiện dưới đúng KR của lần đó.
- AC-9: Given người bấm Nhờ Kara rồi đóng khung trước khi Kara đọc xong, When Kara đọc xong, Then chip «Kara · N góp ý chờ» trên danh sách và mục «Của tôi» đổi sang số mới mà không cần tải lại trang.
- AC-10 (cross-layer): Given người phụ trách hai KR của một Mục tiêu mà không sửa được Mục tiêu đó, When nhờ Kara góp ý, Then máy chủ nhận lời nhờ cho cả Mục tiêu (không còn `Forbidden`), Kara đọc cả hai KR, và danh sách góp ý người đó thấy chỉ gồm góp ý của KR họ sửa được — không gồm góp ý cấp Mục tiêu, và quyết một góp ý cấp Mục tiêu bị từ chối; người không sửa được KR nào vẫn bị từ chối nhờ.
- AC-11: Given giao diện tiếng Anh, When số góp ý chờ là 1 và là 2, Then năm câu đếm (`soCho`, `lyDo`, `chip`, `chipAria`, `coCho`) dùng số ít khi 1 và số nhiều khi khác 1; bản tiếng Việt không đổi.
- AC-12: Given hộp Sửa Mục tiêu có góp ý chờ, When đọc dòng dẫn sang vùng Kara, Then câu dẫn đúng cho cả khi góp ý nằm dưới từng KR lẫn khi có câu hỏi cho cả bộ KR (không còn «Quyết ngay dưới từng KR» khi góp ý không nằm dưới KR).
- AC-13: Given hộp Sửa KR có góp ý chờ cho KR đó, When bấm dòng dẫn «Xem góp ý», Then khung Mục tiêu mở, cuộn tới và đặt focus vào góp ý đầu tiên của chính KR đó, góp ý đó được làm nổi; focus không rơi về `body`.
- AC-14: Given năm chỗ ghi thời gian — giờ Kara đọc (`nhom-kara.tsx`), tab Vết, nút soạn, danh sách cuộc soạn, dòng «sửa lúc» của bản nháp — When cùng một thời điểm hiện ở tiếng Việt và tiếng Anh, Then cả năm chỗ gọi một hàm định dạng chung, cùng giờ Việt Nam và cùng thứ tự ngày–tháng theo ngôn ngữ; tab Ghi nhận và Trao đổi (dùng chung hàm của tab Vết) theo khuôn mới.
- AC-15: Given diff của vòng này — nhánh còn mở thì từ điểm rẽ khỏi `onehub`, đã lên `onehub` thì diff của chính merge đưa hồ sơ lên — When liệt tệp đổi, Then mọi tệp nằm trong ranh giới hàng K3 hoặc danh sách `cham-tep` đã duyệt (P1-35, P1-36); tệp «chỉ thêm» chỉ có dòng thêm; và màn thật (phiên đo `do:man`) ở 1440 và 390 khớp bảng trạng thái của design doc với ảnh mỗi trạng thái.

## Coverage

Bỏ quét không gian AC (entry `descope` «bỏ coverage-scan» trong sổ quyết định): phạm vi là danh sách đóng mười lăm mục
của hàng K3 trong lộ trình, mỗi mục đã có kịch bản fail và tệp:dòng (soát 09/10). Ánh xạ: khung chung + G7 (AC-1),
Ngoài-14 (AC-2), Ngoài-15 (AC-3), Ngoài-13 (AC-4), KL Ngoài-4 (AC-5), C4e (AC-6), Ngoài-11 (AC-7), KL Ngoài-16 (AC-8),
KL Ngoài-1 (AC-9), #5 (AC-10), G1 (AC-11), G5 (AC-12), G4 (AC-13), G6 (AC-14); AC-15 ranh giới và màn thật. Mỗi eval
máy khai chiều đỏ trên vật thật.

## Đường đo

Ngưỡng ở `opportunity.md` (đang `[đề xuất]`) đo ở lái-thử người-lạ trước R1 và ca thật của hàng N1 → 9b:

- «0 lần vấp vùng Kara biến mất / chờ mãi / không hoàn tác được Căn chỉnh / nhờ không được cho KR của mình»: nhật ký vấp
  của lái-thử; kịch bản gây tải lỗi (tắt mạng), một Mục tiêu Kara đang đọc dở, một lần nhận Căn chỉnh, và đăng nhập người
  phụ trách hai KR. AC-2, AC-4, AC-7, AC-10, AC-15 bảo đảm.

## Out of scope

- Đổi schema `troLyDichInput` hay `troLyDanhSach` (lối khác của Q2, Q3).
- Bộ quét đóng việc Kara treo ở máy chủ — Thử lại sau quá hạn có thể chờ thêm một trần nữa.
- Đổi chữ «góp ý chờ» sang «đề xuất» (lối khác của Q4).
- Các mục khác của `gop-y-dung-cho` đã định đoạt ở Cổng 2 của nó.
- Bố cục khung Mục tiêu, bảng KR và danh sách OKR.

## Notes

- `cham-tep` (P1-35, P1-36): `packages/ui/src/components/kara/state.tsx` (prop thêm), `apps/app/lib/okr-search-params.ts`
  (một khoá), `apps/app/test/messages-guard.spec.ts`, `packages/ui/src/lib/format.ts` (một hàm), ba tệp `soan/`, tệp kiểm
  API mới, `_acceptance/config.yaml`, design doc, kế hoạch, bản đồ.
- Known limits (Ngoài-1, Cổng 2): quyền nhờ Kara cho cả Mục tiêu đếm chủ KR bằng Prisma (`coKrSuaDuoc`), không qua
  `ghiDuocKr`; luật ai sửa được KR mở rộng thì nút hiện mà máy chủ trả 403.
- Known limits (Ngoài-2, Cổng 2): Hoàn tác Căn chỉnh đoán mã liên kết vừa tạo bằng so cache; cache trống hay làm mới lỗi
  thì biên nhận không có Hoàn tác.
- Known limits (Ngoài-3, Ngoài-7, Cổng 2): vòng hỏi lại sau khi đóng khung dừng ở lần tải lỗi đầu, số góp ý chờ trên chip
  và Của tôi giữ số cũ tới khi tải lại trang.
- Known limits (Ngoài-5, Cổng 2): nhận Căn chỉnh thì dòng góp ý biến mất một thoáng trước khi hiện biên nhận.
- Known limits (Ngoài-8, Cổng 2): E5 đếm «Thử lại xám» trên trạng thái off không dựng nút Thử lại.
- Known limits (Ngoài-9, Cổng 2): «giờ Việt Nam» của AC-14 đo bằng đọc mã; phép đo đầu ra chạy với TZ đã là giờ Việt Nam.
