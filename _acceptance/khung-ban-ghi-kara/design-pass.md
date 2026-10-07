---
slug: khung-ban-ghi-kara
at: 2026-10-07T13:45:10Z
route: http://localhost:3350/proto/khung-ban-ghi-kara
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-2 (ghim — anh bấm bản mẫu và đọc ảnh tại Cổng Phạm vi, không đồng bộ)
options:
divergence: skipped — đi theo khuôn đã chốt: sáu khối Kara của bo-xuong-kara và luật docs/ai-ux.md §2–7; mỗi bề mặt chỉ có một hướng khả dĩ
ds_skill: web-design-guidelines
states: [ST-kara-rong, ST-kara-dang-mo, ST-kara-dang-lam, ST-kara-tra-loi, ST-kara-loi, ST-kara-chua-bat, ST-kara-ban, ST-kara-ket-thuc, ST-de-xuat-cho, ST-de-xuat-da-nhan, ST-de-xuat-da-bo, ST-de-xuat-hoan-tac-loi, ST-khung-loi, ST-tra-cuu-dang-chay, ST-them-nhanh-hoi]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 2
deferred: 3
---
# design-pass — khung-ban-ghi-kara

Bản mẫu chạy trên máy chủ dev riêng của cây (cổng 3350, `PROTO_ROUTE=1`), dựng bằng `DetailSheet` thật của
`apps/app` cùng các khối Kara thật trong `packages/ui`, dữ liệu giả, không đường ghi. Cổng 3000 của anh không bị
chạm. Ảnh chụp bằng puppeteer-core của kho, nền sáng, deviceScaleFactor 2; không trang nào tràn ngang, không lỗi
trang.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-de-xuat-cho | desktop-1280 | light | evidence/design-pass/ST-de-xuat-cho--desktop-1280.png |
| ST-de-xuat-cho | mobile-375 | light | evidence/design-pass/ST-de-xuat-cho--mobile-375.png |
| ST-de-xuat-da-bo | desktop-1280 | light | evidence/design-pass/ST-de-xuat-da-bo--desktop-1280.png |
| ST-de-xuat-da-bo | mobile-375 | light | evidence/design-pass/ST-de-xuat-da-bo--mobile-375.png |
| ST-de-xuat-da-nhan | desktop-1280 | light | evidence/design-pass/ST-de-xuat-da-nhan--desktop-1280.png |
| ST-de-xuat-da-nhan | mobile-375 | light | evidence/design-pass/ST-de-xuat-da-nhan--mobile-375.png |
| ST-de-xuat-hoan-tac-loi | desktop-1280 | light | evidence/design-pass/ST-de-xuat-hoan-tac-loi--desktop-1280.png |
| ST-de-xuat-hoan-tac-loi | mobile-375 | light | evidence/design-pass/ST-de-xuat-hoan-tac-loi--mobile-375.png |
| ST-kara-ban | desktop-1280 | light | evidence/design-pass/ST-kara-ban--desktop-1280.png |
| ST-kara-ban | mobile-375 | light | evidence/design-pass/ST-kara-ban--mobile-375.png |
| ST-kara-chua-bat | desktop-1280 | light | evidence/design-pass/ST-kara-chua-bat--desktop-1280.png |
| ST-kara-chua-bat | mobile-375 | light | evidence/design-pass/ST-kara-chua-bat--mobile-375.png |
| ST-kara-dang-lam | desktop-1280 | light | evidence/design-pass/ST-kara-dang-lam--desktop-1280.png |
| ST-kara-dang-lam | mobile-375 | light | evidence/design-pass/ST-kara-dang-lam--mobile-375.png |
| ST-kara-dang-mo | desktop-1280 | light | evidence/design-pass/ST-kara-dang-mo--desktop-1280.png |
| ST-kara-dang-mo | mobile-375 | light | evidence/design-pass/ST-kara-dang-mo--mobile-375.png |
| ST-kara-ket-thuc | desktop-1280 | light | evidence/design-pass/ST-kara-ket-thuc--desktop-1280.png |
| ST-kara-ket-thuc | mobile-375 | light | evidence/design-pass/ST-kara-ket-thuc--mobile-375.png |
| ST-kara-loi | desktop-1280 | light | evidence/design-pass/ST-kara-loi--desktop-1280.png |
| ST-kara-loi | mobile-375 | light | evidence/design-pass/ST-kara-loi--mobile-375.png |
| ST-kara-rong | desktop-1280 | light | evidence/design-pass/ST-kara-rong--desktop-1280.png |
| ST-kara-rong | mobile-375 | light | evidence/design-pass/ST-kara-rong--mobile-375.png |
| ST-kara-tra-loi | desktop-1280 | light | evidence/design-pass/ST-kara-tra-loi--desktop-1280.png |
| ST-kara-tra-loi | mobile-375 | light | evidence/design-pass/ST-kara-tra-loi--mobile-375.png |
| ST-khung-loi | desktop-1280 | light | evidence/design-pass/ST-khung-loi--desktop-1280.png |
| ST-khung-loi | mobile-375 | light | evidence/design-pass/ST-khung-loi--mobile-375.png |
| ST-them-nhanh-hoi | desktop-1280 | light | evidence/design-pass/ST-them-nhanh-hoi--desktop-1280.png |
| ST-them-nhanh-hoi | mobile-375 | light | evidence/design-pass/ST-them-nhanh-hoi--mobile-375.png |
| ST-tra-cuu-dang-chay | desktop-1280 | light | evidence/design-pass/ST-tra-cuu-dang-chay--desktop-1280.png |
| ST-tra-cuu-dang-chay | mobile-375 | light | evidence/design-pass/ST-tra-cuu-dang-chay--mobile-375.png |

## Cảnh ngữ-cảnh

- Không cần cảnh riêng: bản mẫu dựng trong khung ngăn bản ghi thật (`DetailSheet` với tiêu đề, hàng nút, tab), nên người duyệt thấy đúng chỗ vật sống.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Chữ của các khối `packages/ui` hiện tiếng Anh («Kara took 3 steps», «Why?») vì bản mẫu chưa bọc `LocaleProvider` — đã bọc `locale="vi"`.
- Nhãn nguồn hiện «Kara 1 đề xuất» thiếu dấu ngăn — đổi `text` sang `scope` của `KaraLabel` để ra «Kara · 1 đề xuất».

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Nút gọi Kara (tra cứu) phải tự nhập icon `AiGenerate` ở chỗ gọi — ai-ux §2 cấm, và màn OKR (`okr/nhom-kara.tsx`) cũng đang làm vậy. Đề xuất: một nút gọi Kara dùng chung (`NutKara`) trong `packages/ui/src/components/kara/ban-ghi.tsx` — đã nằm trong ranh giới K4, làm ở S3 nếu anh đồng ý.
- Dòng biên nhận `ProposedChangeReceipt` trong ô thuộc tính hẹp (khổ 375) xuống hai dòng: «✓ Đã thêm theo Kara» rồi «Hoàn tác» ở dòng dưới — thành phần chưa có cách xếp gọn cho ô hẹp. Đề xuất: giữ như vậy ở K4 (đọc được, bấm được), ghi Known limits nếu anh thấy chấp nhận được.
- Tab Kara cuộn bằng `MessageScroller`, còn `KaraTranscript` cuộn bằng `Conversation` của AI Elements — hai cơ chế cuộn cho cùng một việc tới khi K5 gom Chat và Deal về một khung (sổ quyết định đã ghi).
