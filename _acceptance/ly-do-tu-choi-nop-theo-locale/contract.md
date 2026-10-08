---
schema_version: 1
feature: "Lý do Kara nộp bản nháp bị từ chối hiện thành câu theo ngôn ngữ người dùng, không lộ mã máy"
slug: ly-do-tu-choi-nop-theo-locale
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-09
design_doc: docs/superpowers/specs/2026-10-09-ly-do-tu-choi-nop-theo-locale-design.md
---

# Acceptance Contract: ly-do-tu-choi-nop-theo-locale

## Context

Hàng K2c của dãy P1, đợt `sau-14-10`. Ngoài-1 của K2b `soan-okr-khong-lac`: anh chọn «mở hợp đồng mới» ở Cổng 2
lúc 2026-10-08T16:47:19Z; luật 26 coi như đã ký Cổng Đáng `build`. K2b đã gộp ở #322.

Hôm nay `m.moc.nopKhongThanh(lyDo)` ghép thẳng chuỗi `lyDo` mà agent trả — một trong bảy mã máy không dấu của
`TRO_LY_OKR_SOAN.tuChoi` — vào câu trên màn, ở cả hai ngôn ngữ.

Source input: `opportunity.md` · design doc · `review-findings.md` của `soan-okr-khong-lac` (Ngoài-1) ·
`docs/ai-ux.md` §7, §9.

## Criteria

- AC-1: Given hội thoại soạn ở tiếng Việt có một lần Kara nộp bị từ chối, When lý do là từng mã trong tập bảy mã từ chối (ma trận viết trước, mỗi mã một ca), Then dòng hệ thống ở chỗ lần nộp đó là «Kara nộp bản nháp chưa được — <câu tiếng Việt của mã>», với câu đúng bằng câu của mã trong bảng câu duyệt ở Cổng 1 (chép thành `rang/cau-da-duyet.json`), câu có dấu tiếng Việt, và dòng không chứa chuỗi mã máy.
- AC-2: Given cùng ma trận bảy mã ở tiếng Anh, When dựng hội thoại, Then dòng hệ thống là «Kara could not submit the draft — <câu tiếng Anh của mã>», với câu đúng bằng câu tiếng Anh của mã trong bảng câu đã duyệt, và không chứa chuỗi mã máy nào.
- AC-3: Given một lần nộp bị từ chối với lý do không thuộc tập (chuỗi tự do, hoặc mã của một bản agent mới hơn app) và một lần với lý do rỗng, When dựng hội thoại ở mỗi ngôn ngữ, Then dòng hệ thống chỉ là câu không lý do («Kara nộp bản nháp chưa được» / «Kara could not submit the draft»), không hiện chuỗi lạ; lần nộp đó vẫn không thành mốc và không làm gốc so sánh (luật của K2b giữ nguyên).
- AC-4: Given `packages/validation/src/okr-cuoc-soan.ts` và `apps/agent-okr/agent/lib/config.ts`, When đọc nguồn của tập mã từ chối, Then tập khai đúng một chỗ (`LY_DO_TU_CHOI_NOP` trong `packages/validation`); `TRO_LY_OKR_SOAN.tuChoi` của agent chính là đối tượng đó; trong agent, app và validation không còn khai báo thứ hai nào chứa một giá trị mã; mỗi gốc quét có ít nhất một tệp.
- AC-5: Given bảy giá trị chuỗi của `TRO_LY_OKR_SOAN.tuChoi` ở commit `577f23b2b` (chép thành tệp mẫu theo tên trong hồ sơ), When so với tập mới, Then cùng bảy khoá và từng giá trị giống hệt — transcript của cuộc đã lưu vẫn đọc ra mã; và kết quả nộp `tu-choi` dựng bằng schema kết quả thật của agent (`ketQuaNop.parse`) cho từng mã đi qua `docKetQuaNop` ra đúng mã đó.
- AC-6: Given `okrSoanMessages` ở hai ngôn ngữ, When kiểm bản đồ câu lý do, Then mỗi ngôn ngữ có đúng một câu cho mỗi mã, khoá bằng đúng tập mã, và từng câu bằng câu của bảng đã duyệt; thiếu một mã thì `check-types` đỏ; bài kiểm khoá thông điệp (`messages-guard`) xanh.
- AC-7: Given năm bản sao phá vật thật — (a) màn hội thoại ghép lại chuỗi lý do thô, (b) `docKetQuaNop` trả chuỗi lý do thay cho mã, (c) `config.ts` của agent khai lại tập mã riêng thay vì trỏ vào `packages/validation`, (d) bản đồ câu tiếng Việt bỏ một mã, (e) một giá trị mã trong `LY_DO_TU_CHOI_NOP` đổi — When chạy bài đo của AC-1, AC-3, AC-4, AC-5, AC-6 trên từng bản sao, Then mỗi bản sao làm bài đo của vế nó phá đỏ với thông điệp ghim, và tệp sản phẩm sau lượt đo giống hệt trước lượt.
- AC-8: Given diff của vòng này — khi nhánh còn mở thì từ điểm rẽ khỏi `onehub` tới `HEAD`, khi hồ sơ đã lên `onehub` thì diff của chính merge đưa nó lên (thước tự tìm merge đó) — When liệt tệp đổi, Then mọi tệp nằm trong ranh giới hàng K2c hoặc danh sách `cham-tep` đã duyệt; trong `config.ts` của agent chỉ khối `tuChoi` và một dòng import đổi; trong `nop-ban-nhap.ts` (thuộc ranh giới hàng) chỉ dòng `lyDo` của `ketQuaNop`, hàm `tuChoi` và dòng import đổi; `_acceptance/config.yaml` chỉ thêm dòng.
- AC-9: Given phiên đo riêng của cây (`do:man`), agent-okr chạy thật với mô hình giả có kịch bản viết trước (nộp hợp lệ · nộp khi chu kỳ đã rời pha Lập kế hoạch · nộp lại), When mở trang soạn ở tiếng Việt khổ 390 và 1440 và ở tiếng Anh khổ 1440, Then dòng hệ thống ở chỗ lần nộp bị từ chối là đúng câu của mã `chuKyKhongLapKeHoach` trong bảng đã duyệt theo ngôn ngữ trang, không chứa chuỗi mã máy; sau khi tải lại trang (đọc từ transcript đã lưu) dòng đó vẫn y hệt; ảnh mỗi khổ và ngôn ngữ, trước và sau khi tải lại.

## Coverage

Bỏ quét không gian AC (entry `descope` «bỏ coverage-scan» trong sổ quyết định). Không gian đã liệt kê đủ bằng tay:
bảy mã × hai ngôn ngữ (AC-1, AC-2) cộng hai ca ngoài tập — mã lạ và rỗng (AC-3); nguồn của tập (AC-4), giá trị cũ
và đường ghi thật → đọc (AC-5), bản đồ câu (AC-6). AC-7 bảo đảm chiều đỏ trên vật thật, AC-8 ranh giới, AC-9 đi
trọn đường agent → lưu → tải → màn ở cả hai ngôn ngữ.

## Đường đo

Ngưỡng ở `opportunity.md` (đang `[đề xuất]`) đo ở lái-thử người-lạ trước R1:

- «Người thử kể lại đúng lý do, không gặp chữ không dấu, ở cả hai ngôn ngữ»: nhật ký vấp của lái-thử; kịch bản gây
  một lần nộp bị từ chối bằng cách đưa chu kỳ rời pha Lập kế hoạch giữa hai lần nộp. AC-1, AC-2, AC-9 bảo đảm.

## Out of scope

- Ngoài-2 đến Ngoài-10 của K2b — anh đã định đoạt riêng; Ngoài-4 (thước «một chỗ khai» không quét phía màn) là hàng K2d.
- Đổi lời Kara, hay cách agent nộp lại sau lần bị từ chối (`apps/agent-okr/agent/instructions.md`).
- Đổi giá trị chuỗi của các mã (sẽ làm transcript của cuộc đã lưu mất lý do).
- Lỗi công cụ (`dongTrungKhoa` hiện ném lỗi chứ không trả `tu-choi`) — dòng «chưa được» không lý do của K2b giữ nguyên.

## Notes

- Tệp ngoài ranh giới xin `cham-tep` (`yeu-cau/P1-33.json`): `apps/agent-okr/agent/lib/config.ts` (khối `tuChoi`),
  `_acceptance/config.yaml` (thêm khoá `k2c_*`), design doc, kế hoạch, bản đồ sản phẩm.
- Chiều đỏ của AC-7 và AC-9 sửa tạm tệp sản phẩm trong cây rồi trả lại trong `finally`; lượt đo phải chạy tuần tự.
