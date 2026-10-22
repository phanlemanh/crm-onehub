---
slug: che-do-soan-bo-okr
at: 2026-10-22T02:17:04Z
route: http://localhost:3412/proto/che-do-soan-bo-okr
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (gói ảnh gửi chủ kho qua phiên giám sát, kèm thẻ Cổng Phạm vi; bản bấm được chạy ở cổng 3412 trên Mac Studio cho ai muốn bấm)
options: http://localhost:3412/proto/che-do-soan-bo-okr?state=ST-ngan-mot-chip và ?state=ST-ngan-chip-mo-tai-cho (Hỏi-4, lời khuyên ghim trên trạng thái thứ hai)
divergence: opened
ds_skill: web-design-guidelines
states: [ST-soan-co-gop-y, ST-soan-trong, ST-soan-dang-go, ST-soan-kara-dang-doc, ST-soan-da-nhan-gop-y, ST-soan-co-muc-da-cong-bo, ST-soan-kara-tat, ST-soan-hoi-cong-bo, ST-soan-da-cong-bo, ST-soan-chi-xem, ST-soan-dang-tai, ST-soan-loi-tai, ST-soan-dien-thoai, ST-ngan-mot-chip, ST-ngan-chip-mo-tai-cho]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 8
deferred: 3
---
# design-pass — che-do-soan-bo-okr

Bản mẫu render trong host thật của kho sau cờ `PROTO_ROUTE` (`apps/app/app/proto/_modules/che-do-soan-bo-okr/`),
ghép từ component thật của `@crm/ui` (`KaraDock`, `KaraProposal`, `KaraProposalGroup`, `KaraState`, `Textarea`,
`InputGroup`, `Item`, `Progress`, `StatusIndicator`, `ConfirmDialog`, `Tabs`) và khung `PageShell`/`DetailSheet`
cỡ `kara` của app — dữ liệu giả của bộ OKR mẫu (Hải Đăng Logistics, «Phòng Kinh doanh miền Bắc», quý 4/2026), không
đường ghi. Máy chủ dev riêng ở cổng 3412, không đụng 3000/3001 của chủ kho (luật 8). Chụp bằng Chrome không giao
diện qua CDP (chờ khung bản ghi hiện rồi mới chụp), giả lập sáng/tối bằng `prefers-color-scheme`. Luật nạp:
`docs/design.md`, `docs/ai-ux.md` (mục 3, 5, 7, 11), `docs/proto.md`, chuẩn `web-design-guidelines`.

Bản mẫu là ý định, không phải bản chạy: Enter/Tab giữa các ô, tự lưu, chấm lại khi gõ và nhận góp ý không chạy thật —
mỗi trạng thái là một khung tĩnh. Phần chuyển động ấy đo ở S4 trên bản thật.

## Bước phân kỳ

Mở bằng vật thật đang có: ảnh ngăn theo dõi hiện hành
(`evidence/design-pass/hien-hanh-gop-y-dung-cho-ST-b-chi-tiet--desktop-1280--light.png`, bản mẫu đã ký
`gop-y-dung-cho`, trạng thái B) — khối Kara và góp ý neo dưới từng KR chiếm phần lớn chiều cao ngăn. Đó là tiền đề
mà câu giao của VK10 muốn gỡ.

Một quyết định có hai hướng khả dĩ: bấm chip góp ý ở ngăn theo dõi thì mở đâu (Hỏi-4 của sổ quyết định).

- **Mở chế độ Soạn** (trục: góp ý sống ở chỗ sửa) — động cơ: góp ý là lời đề nghị sửa nội dung, nên nằm cạnh chỗ
  sửa; ngăn theo dõi chỉ còn theo dõi, như Tability tách «Edit content» khỏi màn theo dõi; đánh đổi: thêm một khung
  chồng lên khi người chỉ muốn nhận nhanh một câu. Trạng thái `ST-ngan-mot-chip`. **Máy khuyên.**
- **Mở góp ý tại chỗ** (trục: góp ý sống ở chỗ đọc) — động cơ: nhận một câu mà không rời ngăn; đánh đổi: khối góp ý
  quay lại chỗ theo dõi dưới dạng hộp nổi — đúng cái vòng này gỡ, và có hai nơi quyết cùng một đề xuất. Trạng thái
  `ST-ngan-chip-mo-tai-cho`, lời khuyên ghim ngay trên trạng thái.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-ngan-chip-mo-tai-cho | desktop-1280 | light | evidence/design-pass/ST-ngan-chip-mo-tai-cho--desktop-1280--light.png |
| ST-ngan-mot-chip | desktop-1280 | dark | evidence/design-pass/ST-ngan-mot-chip--desktop-1280--dark.png |
| ST-ngan-mot-chip | desktop-1280 | light | evidence/design-pass/ST-ngan-mot-chip--desktop-1280--light.png |
| ST-ngan-mot-chip | mobile-375 | light | evidence/design-pass/ST-ngan-mot-chip--mobile-375--light.png |
| ST-soan-chi-xem | desktop-1280 | light | evidence/design-pass/ST-soan-chi-xem--desktop-1280--light.png |
| ST-soan-co-gop-y | desktop-1280 | dark | evidence/design-pass/ST-soan-co-gop-y--desktop-1280--dark.png |
| ST-soan-co-gop-y | desktop-1280 | light | evidence/design-pass/ST-soan-co-gop-y--desktop-1280--light.png |
| ST-soan-co-gop-y | mobile-375 | light | evidence/design-pass/ST-soan-co-gop-y--mobile-375--light.png |
| ST-soan-co-muc-da-cong-bo | desktop-1280 | dark | evidence/design-pass/ST-soan-co-muc-da-cong-bo--desktop-1280--dark.png |
| ST-soan-co-muc-da-cong-bo | desktop-1280 | light | evidence/design-pass/ST-soan-co-muc-da-cong-bo--desktop-1280--light.png |
| ST-soan-da-cong-bo | desktop-1280 | light | evidence/design-pass/ST-soan-da-cong-bo--desktop-1280--light.png |
| ST-soan-da-nhan-gop-y | desktop-1280 | light | evidence/design-pass/ST-soan-da-nhan-gop-y--desktop-1280--light.png |
| ST-soan-dang-go | desktop-1280 | light | evidence/design-pass/ST-soan-dang-go--desktop-1280--light.png |
| ST-soan-dang-tai | desktop-1280 | light | evidence/design-pass/ST-soan-dang-tai--desktop-1280--light.png |
| ST-soan-dien-thoai | desktop-1280 | light | evidence/design-pass/ST-soan-dien-thoai--desktop-1280--light.png |
| ST-soan-dien-thoai | mobile-375 | light | evidence/design-pass/ST-soan-dien-thoai--mobile-375--light.png |
| ST-soan-hoi-cong-bo | desktop-1280 | dark | evidence/design-pass/ST-soan-hoi-cong-bo--desktop-1280--dark.png |
| ST-soan-hoi-cong-bo | desktop-1280 | light | evidence/design-pass/ST-soan-hoi-cong-bo--desktop-1280--light.png |
| ST-soan-hoi-cong-bo | mobile-375 | light | evidence/design-pass/ST-soan-hoi-cong-bo--mobile-375--light.png |
| ST-soan-kara-dang-doc | desktop-1280 | light | evidence/design-pass/ST-soan-kara-dang-doc--desktop-1280--light.png |
| ST-soan-kara-tat | desktop-1280 | light | evidence/design-pass/ST-soan-kara-tat--desktop-1280--light.png |
| ST-soan-loi-tai | desktop-1280 | light | evidence/design-pass/ST-soan-loi-tai--desktop-1280--light.png |
| ST-soan-trong | desktop-1280 | light | evidence/design-pass/ST-soan-trong--desktop-1280--light.png |
| ST-soan-trong | mobile-375 | light | evidence/design-pass/ST-soan-trong--mobile-375--light.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu chạy trong khung bản ghi thật của app, nền là đầu trang khu Mục tiêu.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Khung tài liệu bỏ `KaraArtifact` (khối ấy luôn gắn nhãn «Kara» trên đầu) — tài liệu là chữ của người, nên dựng bằng `KaraDock` với dòng đầu thường.
- Nhóm góp ý có hai nhãn «Kara» chồng nhau — bỏ nhãn tự thêm, giữ nhãn của `KaraProposalGroup` (luật nhãn một lần mỗi nhóm, `docs/ai-ux.md` mục 3).
- Mũi tên khởi điểm → đích dời ra giữa hai ô; «KR 1» không còn gãy dòng.
- Dòng tài liệu dùng `Textarea` biến thể và cỡ `composer` — bỏ khoảng trống cao giữa tên mục tiêu và dòng «Vì sao».
- Bộ trống: nút đọc «Công bố» (khoá) thay vì «Công bố 0 mục tiêu»; dòng đầu đọc «Không có mục tiêu nháp».
- Trạng thái chỉ xem: mọi ô khoá, bỏ «Thêm KR», «Thêm mục tiêu», cột bên không hiện.
- Chân cột bên có đường chia — nút «Kara đọc lại bộ» thôi đè lên thẻ góp ý đang cuộn.
- Nhãn trạng thái dài nhất của bản mẫu làm trang rộng 438 px ở khổ 375 — rút ngắn.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Dòng tài liệu chưa có thang chữ: tên mục tiêu và dòng KR cùng cỡ chữ (`Textarea` `composer` chỉ có một cỡ) — đề xuất biến thể «dòng tài liệu» trong `packages/ui` với hai cỡ (tiêu đề mục tiêu, dòng KR), không viền, tự cao theo chữ (bậc 5 của `docs/design.md`).
- Khung vật phẩm trung tính chưa có: `KaraArtifact` luôn gắn nhãn Kara — đề xuất một ô «docked» không nhãn (hay tách phần đầu khỏi nhãn) trong `packages/ui/src/components/kara/`; bản mẫu tạm dùng `KaraDock` + `KaraDockHeader`.
- Hộp hỏi lại khi công bố phủ kín khung (lớp phủ của `ConfirmDialog`), người không còn thấy bộ mình sắp công bố — đề xuất thân hộp liệt tên các mục tiêu sẽ công bố (đưa vào AC công bố), không đổi `ConfirmDialog`.

Quan sát ngoài vòng (không tính vào hai nhóm): trên đường `/proto`, chữ của `packages/ui` rơi về tiếng Anh («2 suggestions», «Why?», «Kara isn't turned on here») vì vỏ bản mẫu không đặt ngôn ngữ; app thật có bản tiếng Việt («2 đề xuất»).
