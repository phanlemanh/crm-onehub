---
schema_version: 1
slug: zalo-tro-ly-kho-chi-dan
feature: Câu Kho hỏi qua Zalo được trợ lý kho trả lời theo đúng chỉ dẫn kho
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-15T23:44:49Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Nhân viên hỏi quy định công ty qua Zalo thì agent gốc chuyển câu cho trợ lý kho (`tro_ly_kho`). Hai lượt đo bộ 50 câu
mẫu trên Gemini 3.8 Flash ngày 15/10 (hồ sơ `re-mo-hinh-mac-dinh`) có 4 và 3 câu Zalo lỗi; lượt GLM 5.3 có 3 câu lỗi
và lượt GLM 5.3 Flash có 8 câu lỗi lượt một. Trong nhật ký eve của các lượt đó, bộ nạp chỉ dẫn của phiên con
`tro_ly_kho` ném «This session is not a library question» (Gemini 1 lần, GLM 5.3 2 lần, GLM 5.3 Flash 30 lần); eve
bỏ qua chỉ dẫn và phiên con chạy với chỉ dẫn mặc định của khung, đi dò `/workspace`, chạm trần token ra hoặc trả sai
khuôn kết quả.

Căn cứ Cổng Đáng: chủ kho ký ở phiên giám sát lúc 2026-10-15T23:44:49Z, nguyên văn «phiên giám sát này build», trả
lời thẻ Cổng Đáng có đề xuất giao dãy P6; giám sát chuyển cho dãy P6 (yêu cầu P6-16, `tra-loi/P6-16.json`). Lựa chọn
lối D (giữ `re-mo-hinh-mac-dinh` mở, sửa đường Zalo rồi đo lại) chủ kho gõ ở phiên P6: «Chọn D».

Câu giao: Câu Kho hỏi qua Zalo được trợ lý kho trả lời theo đúng chỉ dẫn kho: phiên con `tro_ly_kho` mở từ agent gốc
trên Zalo không còn chạy thiếu chỉ dẫn («This session is not a library question»), không đi lạc vào bash tới trần
token ra; đo lại bộ 50 câu trên Gemini thì tổng câu lỗi model không quá lượt đã ký (2).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau bản sửa, trợ lý kho trên Gemini 3.8 Flash còn câu lỗi nào do phiên con thiếu chỉ dẫn không, và tổng câu lỗi có về mức lượt đã ký không?
- Kết quả nào là SỐNG: 0 dòng «Dynamic instructions resolver (session.started) threw» trong nhật ký eve của lượt đo, và tổng câu lỗi model hai lượt không quá 2.
- Thêm ở S1 theo phản biện (gap-probe P0-1): sau bản sửa, phiên con thiếu câu hỏi trả chỉ dẫn dừng thay vì ném lỗi, nên ngưỡng SỐNG đếm thêm 0 dòng «[tro-ly-kho] khong tim thay cau hoi», và mọi phiên gốc có dòng «[lien-ket-hoi]».
- Kết quả nào là CHẾT: còn dòng resolver ném lỗi, hoặc tổng câu lỗi quá 2 — đặt số cạnh hai lượt Gemini ngày 15/10, chủ kho quyết.
- Timebox: trong ngày 16/10.

## Cổng 0

- **decision = build.** Căn cứ: chủ kho ký «phiên giám sát này build» lúc 2026-10-15T23:44:49Z.
- **Ngưỡng UAT chốt cùng lúc ký:** như mục trên.

## Thước đo thành công → ứng viên criterion

- Số dòng resolver ném lỗi trong nhật ký eve của lượt đo bộ 50 câu: 0.
- Tổng câu lỗi model hai lượt trên Gemini: không quá 2.

## Out of scope từ khám phá

- Đổi model mặc định — việc của `re-mo-hinh-mac-dinh`.
- Máy soạn (`may_soan`) gọi làm phiên con có cùng kiểu tra theo phiên gốc — rủi ro cùng lớp, việc riêng.
