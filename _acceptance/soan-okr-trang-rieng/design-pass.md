---
slug: soan-okr-trang-rieng
at: 2026-10-07T13:49:21Z
route: http://localhost:<cổng phiên đo>/proto/soan-okr-trang-rieng
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (gui-kem-the-cong)
options:
divergence: skipped — khuôn «hội thoại hẹp cạnh bản nháp rộng» và bốn câu khung đã chốt 04/10 trên đề xuất có đối chiếu Canvas/Artifacts/Copilot Pages; chỗ rẽ còn lại (ngưỡng hai ô) đã chốt sau gap-probe F1
ds_skill: web-design-guidelines
states: [ST-soan-dang-mo, ST-soan-mo-dau, ST-soan-co-nhap, ST-soan-dang-soan, ST-soan-moc, ST-soan-da-quyet, ST-soan-con-thieu, ST-soan-hoi-dong, ST-soan-loi, ST-soan-het-luot, ST-soan-da-dua-vao, ST-soan-khong-mo, ST-soan-hep]
breakpoints: [mobile-375, tablet-768, desktop-1440]
themes: [light, dark]
patched: 4
deferred: 6
---
# design-pass — soan-okr-trang-rieng

Bản mẫu chạy trong chính ứng dụng sau cờ `PROTO_ROUTE=1`, trên phiên đo riêng của cây (`bun run do:man`, cổng tự
do 4100–4899, không đụng 3000/3001), dựng bằng thành phần thật: `KaraArtifact`, `KaraProposalGroup`,
`KaraProposal` (inline), `KaraTranscript`/`KaraTurn`/`KaraCheckpoint`/`KaraSystemLine`, `KaraComposer`, `KaraState`,
`Tabs`, `Field`, `InputGroup`, đầu trang `PageShell`. Dữ liệu giả, không đường ghi. Chia cố định 380 px vì
`resizable` chỉ cài ở S3 (`docs/proto.md`). Răng chụp: `rang/chup-proto.mjs` (chụp phần tử `[data-soan-trang]`,
đếm tràn ngang và lỗi console). Lượt cuối: tràn ngang 0; lỗi console 1 ở lượt đầy đủ — cảnh báo «script tag» của
khung ứng dụng, không đến từ bản mẫu (lượt chụp lại bốn trạng thái: 0).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-soan-dang-mo | 1440 | light | evidence/design-pass/ST-soan-dang-mo--1440--light.png |
| ST-soan-dang-mo | 1440 | dark | evidence/design-pass/ST-soan-dang-mo--1440--dark.png |
| ST-soan-dang-mo | 768 | light | evidence/design-pass/ST-soan-dang-mo--768--light.png |
| ST-soan-dang-mo | 768 | dark | evidence/design-pass/ST-soan-dang-mo--768--dark.png |
| ST-soan-dang-mo | 375 | light | evidence/design-pass/ST-soan-dang-mo--375--light.png |
| ST-soan-dang-mo | 375 | dark | evidence/design-pass/ST-soan-dang-mo--375--dark.png |
| ST-soan-mo-dau | 1440 | light | evidence/design-pass/ST-soan-mo-dau--1440--light.png |
| ST-soan-mo-dau | 1440 | dark | evidence/design-pass/ST-soan-mo-dau--1440--dark.png |
| ST-soan-mo-dau | 768 | light | evidence/design-pass/ST-soan-mo-dau--768--light.png |
| ST-soan-mo-dau | 768 | dark | evidence/design-pass/ST-soan-mo-dau--768--dark.png |
| ST-soan-mo-dau | 375 | light | evidence/design-pass/ST-soan-mo-dau--375--light.png |
| ST-soan-mo-dau | 375 | dark | evidence/design-pass/ST-soan-mo-dau--375--dark.png |
| ST-soan-co-nhap | 1440 | light | evidence/design-pass/ST-soan-co-nhap--1440--light.png |
| ST-soan-co-nhap | 1440 | dark | evidence/design-pass/ST-soan-co-nhap--1440--dark.png |
| ST-soan-co-nhap | 768 | light | evidence/design-pass/ST-soan-co-nhap--768--light.png |
| ST-soan-co-nhap | 768 | dark | evidence/design-pass/ST-soan-co-nhap--768--dark.png |
| ST-soan-co-nhap | 375 | light | evidence/design-pass/ST-soan-co-nhap--375--light.png |
| ST-soan-co-nhap | 375 | dark | evidence/design-pass/ST-soan-co-nhap--375--dark.png |
| ST-soan-dang-soan | 1440 | light | evidence/design-pass/ST-soan-dang-soan--1440--light.png |
| ST-soan-dang-soan | 1440 | dark | evidence/design-pass/ST-soan-dang-soan--1440--dark.png |
| ST-soan-dang-soan | 768 | light | evidence/design-pass/ST-soan-dang-soan--768--light.png |
| ST-soan-dang-soan | 768 | dark | evidence/design-pass/ST-soan-dang-soan--768--dark.png |
| ST-soan-dang-soan | 375 | light | evidence/design-pass/ST-soan-dang-soan--375--light.png |
| ST-soan-dang-soan | 375 | dark | evidence/design-pass/ST-soan-dang-soan--375--dark.png |
| ST-soan-moc | 1440 | light | evidence/design-pass/ST-soan-moc--1440--light.png |
| ST-soan-moc | 1440 | dark | evidence/design-pass/ST-soan-moc--1440--dark.png |
| ST-soan-moc | 768 | light | evidence/design-pass/ST-soan-moc--768--light.png |
| ST-soan-moc | 768 | dark | evidence/design-pass/ST-soan-moc--768--dark.png |
| ST-soan-moc | 375 | light | evidence/design-pass/ST-soan-moc--375--light.png |
| ST-soan-moc | 375 | dark | evidence/design-pass/ST-soan-moc--375--dark.png |
| ST-soan-da-quyet | 1440 | light | evidence/design-pass/ST-soan-da-quyet--1440--light.png |
| ST-soan-da-quyet | 1440 | dark | evidence/design-pass/ST-soan-da-quyet--1440--dark.png |
| ST-soan-da-quyet | 768 | light | evidence/design-pass/ST-soan-da-quyet--768--light.png |
| ST-soan-da-quyet | 768 | dark | evidence/design-pass/ST-soan-da-quyet--768--dark.png |
| ST-soan-da-quyet | 375 | light | evidence/design-pass/ST-soan-da-quyet--375--light.png |
| ST-soan-da-quyet | 375 | dark | evidence/design-pass/ST-soan-da-quyet--375--dark.png |
| ST-soan-con-thieu | 1440 | light | evidence/design-pass/ST-soan-con-thieu--1440--light.png |
| ST-soan-con-thieu | 1440 | dark | evidence/design-pass/ST-soan-con-thieu--1440--dark.png |
| ST-soan-con-thieu | 768 | light | evidence/design-pass/ST-soan-con-thieu--768--light.png |
| ST-soan-con-thieu | 768 | dark | evidence/design-pass/ST-soan-con-thieu--768--dark.png |
| ST-soan-con-thieu | 375 | light | evidence/design-pass/ST-soan-con-thieu--375--light.png |
| ST-soan-con-thieu | 375 | dark | evidence/design-pass/ST-soan-con-thieu--375--dark.png |
| ST-soan-hoi-dong | 1440 | light | evidence/design-pass/ST-soan-hoi-dong--1440--light.png |
| ST-soan-hoi-dong | 1440 | dark | evidence/design-pass/ST-soan-hoi-dong--1440--dark.png |
| ST-soan-hoi-dong | 768 | light | evidence/design-pass/ST-soan-hoi-dong--768--light.png |
| ST-soan-hoi-dong | 768 | dark | evidence/design-pass/ST-soan-hoi-dong--768--dark.png |
| ST-soan-hoi-dong | 375 | light | evidence/design-pass/ST-soan-hoi-dong--375--light.png |
| ST-soan-hoi-dong | 375 | dark | evidence/design-pass/ST-soan-hoi-dong--375--dark.png |
| ST-soan-loi | 1440 | light | evidence/design-pass/ST-soan-loi--1440--light.png |
| ST-soan-loi | 1440 | dark | evidence/design-pass/ST-soan-loi--1440--dark.png |
| ST-soan-loi | 768 | light | evidence/design-pass/ST-soan-loi--768--light.png |
| ST-soan-loi | 768 | dark | evidence/design-pass/ST-soan-loi--768--dark.png |
| ST-soan-loi | 375 | light | evidence/design-pass/ST-soan-loi--375--light.png |
| ST-soan-loi | 375 | dark | evidence/design-pass/ST-soan-loi--375--dark.png |
| ST-soan-het-luot | 1440 | light | evidence/design-pass/ST-soan-het-luot--1440--light.png |
| ST-soan-het-luot | 1440 | dark | evidence/design-pass/ST-soan-het-luot--1440--dark.png |
| ST-soan-het-luot | 768 | light | evidence/design-pass/ST-soan-het-luot--768--light.png |
| ST-soan-het-luot | 768 | dark | evidence/design-pass/ST-soan-het-luot--768--dark.png |
| ST-soan-het-luot | 375 | light | evidence/design-pass/ST-soan-het-luot--375--light.png |
| ST-soan-het-luot | 375 | dark | evidence/design-pass/ST-soan-het-luot--375--dark.png |
| ST-soan-da-dua-vao | 1440 | light | evidence/design-pass/ST-soan-da-dua-vao--1440--light.png |
| ST-soan-da-dua-vao | 1440 | dark | evidence/design-pass/ST-soan-da-dua-vao--1440--dark.png |
| ST-soan-da-dua-vao | 768 | light | evidence/design-pass/ST-soan-da-dua-vao--768--light.png |
| ST-soan-da-dua-vao | 768 | dark | evidence/design-pass/ST-soan-da-dua-vao--768--dark.png |
| ST-soan-da-dua-vao | 375 | light | evidence/design-pass/ST-soan-da-dua-vao--375--light.png |
| ST-soan-da-dua-vao | 375 | dark | evidence/design-pass/ST-soan-da-dua-vao--375--dark.png |
| ST-soan-khong-mo | 1440 | light | evidence/design-pass/ST-soan-khong-mo--1440--light.png |
| ST-soan-khong-mo | 1440 | dark | evidence/design-pass/ST-soan-khong-mo--1440--dark.png |
| ST-soan-khong-mo | 768 | light | evidence/design-pass/ST-soan-khong-mo--768--light.png |
| ST-soan-khong-mo | 768 | dark | evidence/design-pass/ST-soan-khong-mo--768--dark.png |
| ST-soan-khong-mo | 375 | light | evidence/design-pass/ST-soan-khong-mo--375--light.png |
| ST-soan-khong-mo | 375 | dark | evidence/design-pass/ST-soan-khong-mo--375--dark.png |
| ST-soan-hep | 1440 | light | evidence/design-pass/ST-soan-hep--1440--light.png |
| ST-soan-hep | 1440 | dark | evidence/design-pass/ST-soan-hep--1440--dark.png |
| ST-soan-hep | 768 | light | evidence/design-pass/ST-soan-hep--768--light.png |
| ST-soan-hep | 768 | dark | evidence/design-pass/ST-soan-hep--768--dark.png |
| ST-soan-hep | 375 | light | evidence/design-pass/ST-soan-hep--375--light.png |
| ST-soan-hep | 375 | dark | evidence/design-pass/ST-soan-hep--375--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu là cả trang trong ứng dụng thật (đầu trang có lối về Theo đơn vị).
  Lối vào (nút «Soạn» trên Theo đơn vị) chụp ở S4 (E1b).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- «← Theo đơn vị» nằm ngang hàng tiêu đề, đọc như một phần tiêu đề → đưa lên trên tiêu đề.
- Bản mẫu đặt `h-dvh` trong khung danh mục proto, ô soạn trôi khỏi màn → bỏ, trang chảy hết chiều cao (trang thật cuộn
  riêng từng ô — E2 đo).
- Dưới 1024 px bản mẫu chưa theo ngưỡng mới → hai tab, chọn sẵn tab theo trạng thái (bản nháp hay hội thoại).
- KR đã nhận mất ô Khởi điểm/Đích vì biên nhận của `ProposedChange` bỏ `fields` → ô số đặt ngay dưới biên nhận ở màn
  gọi (như mã hôm nay), đúng AC-4.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- N2-1 · Dạng `inline` của `ProposedChange` luôn vẽ dấu tia sáng trên mỗi dòng; trong `KaraProposalGroup` nhãn Kara đã
  có ở đầu nhóm → dấu lặp, trái §3 `docs/ai-ux.md`. Đề xuất: thêm prop tắt dấu vào `proposed-change.tsx` (chỉ thêm
  dòng; tệp trong ranh giới K3 cùng dãy P1 — xin chạm), `KaraProposal` trong nhóm tắt nó.
- N2-2 · `KaraCheckpoint` luôn ghép «Kara sửa bản nháp: …» → mốc đầu đọc «Kara sửa bản nháp: Bản nháp đầu: 2 Mục
  tiêu · 5 KR» (lặp chữ, sai động từ). Đề xuất: thêm prop chữ tuỳ chọn vào `transcript.tsx` (chỉ thêm dòng; tệp thuộc
  «chung chỉ thêm» của K3 — xin chạm) để mốc đầu đọc «Kara soạn bản nháp đầu: 2 Mục tiêu · 5 KR».
- N2-3 · Khi Kara soạn, mỗi dòng chờ lặp chữ «Kara đang soạn — xong sẽ quyết được» (9 lần trên một màn) trong khi đầu
  khung đã nói. Đề xuất (trong ranh giới K2, `kara/proposal.tsx`): trong `KaraArtifact` bận, lý do khoá ở từng dòng chỉ
  dành cho trình đọc màn hình (`aria-describedby` giữ nguyên — AC-7), chữ nhìn thấy một lần ở đầu khung.
- N2-4 · Nhãn nhóm đếm «0 đề xuất» khi mọi dòng đã quyết, và ở 375 px đầu nhóm xuống dòng rời rạc. Đề xuất (trong ranh
  giới K2, `kara/proposal.tsx`): hết dòng chờ thì nhãn ghi «đã quyết hết»; đầu nhóm cho nút «Vì sao?» và nút nhóm
  xuống hàng riêng ở khổ hẹp.
- N2-5 · «Hỏi Kara về dòng này» là nút chữ thứ tư ngay cạnh «Bỏ qua» — hai nút chữ liền nhau khó tách. Đề xuất: chuyển
  thành nút biểu tượng có tên ở cuối hàng (cần chỗ hành động phụ trong `ProposedChange`) hoặc giữ nút chữ — người chọn.
- N2-6 · `resizable` chưa cài khi dựng bản mẫu → chia cố định 380 px; cảm giác kéo chỉ thấy ở S4 (E2, E14).
