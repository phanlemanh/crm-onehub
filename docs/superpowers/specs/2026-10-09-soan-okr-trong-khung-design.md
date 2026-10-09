# Soạn OKR trong khung bản ghi, Kara bên phải — thiết kế

Ngày 2026-10-09. Slug `soan-okr-trong-khung`, hạng T2. Phiên ngoài đợt `sau-14-10` (sổ phiên ngoài hàng việc, luật 42).
Chủ kho Manh Phan.

Đọc trước: `AGENTS.md`, `docs/design.md`, `docs/ai-ux.md`, `docs/chat-ui.md`, `docs/agent-panel.md`, thiết kế K2
`2026-10-07-soan-okr-trang-rieng-design.md`, thiết kế `2026-09-30-khung-tao-okr-nhu-deal-design.md`. Skill chuẩn UI
của kho `web-design-guidelines` (bản luật lấy ngày 09/10). Tài liệu eve `guides/frontend/overview.mdx` (dòng 101–103:
`stop()` chỉ cắt luồng phía trình duyệt).

## Bài toán

Chi tiết deal, công ty, Mục tiêu, KR mở bằng một khung trượt từ phải, nằm trong chồng `?record=` của
`record-stack.ts`. Soạn OKR thì mở một trang riêng `/okr/soan/<cuộc>` (K2, #312). Hai cách mở cho cùng một loại việc
«xem và làm trên một thứ», và mọi liên kết Kara đưa ra sau này phải biết hai cách.

Trang riêng còn phí chỗ: đầu trang lớn «← Theo đơn vị / Soạn OKR» ăn khoảng 150 px chiều cao; ô hội thoại rỗng chiếm
một phần ba bề ngang; và cột hội thoại không có khung trong khi bản nháp có — chủ kho gọi là «như bị mất khung».

## Quyết định của chủ kho (09/10)

1. Lật quyết định 04/10 «trang riêng, không sheet» của K2. Cuộc soạn mở như khung deal.
2. Kara cố định ở mép phải, bề ngang cố định. Bản nháp là không gian mở thêm về bên trái. Mỗi ô một bề ngang chuẩn,
   khung cao hết màn, không chỗ chết.
3. Áp cho Soạn OKR ngay; khung deal chuyển tab Agent thành cột phải ở K5 `chat-deal-mot-khung`.
4. «Mất khung» là khung ngoài của cột chat (đáp (b) 09/10). Chủ kho duyệt hình phác ba trạng thái (A hẹp, B rộng,
   C điện thoại) trong phiên: «đúng ý».

Sổ: `quyet-dinh-da-chot` của chủ kho. Luật vào `docs/ai-ux.md` mục mới «Kara ở đâu».

## Hướng đã chọn

**Cuộc soạn là một loại bản ghi.** `RECORD_KINDS` thêm `soan`; `?record=soan:<cuộc>` mở cuộc trong `DetailSheet`
qua `RecordSheetHost` — vốn gắn ở `app/(app)/[slug]/layout.tsx` nên mở được trên mọi trang của không gian làm việc.
`recordHref` nhận `soan` (trang nền Theo đơn vị của cuộc).

Phương án bị loại:
- Giữ `?cuocSoan=` riêng với một host sheet riêng (cách trước K2): hai cơ chế mở, chính điều vòng này gỡ.
- Giữ trang, chỉ dọn đầu trang và thêm khung: không cho cách mở chung, chủ kho đã bác.

**Bề ngang lấy từ hai token có sẵn.** `packages/ui/src/styles/globals.css` đã có `--container-assist-rail: 380px`
(cột Kara của thẻ góp ý, `the-gop-y-okr`) và `--container-assist: 800px`. Không đặt số mới:
- cột Kara rộng đúng `--container-assist-rail`;
- ô bản nháp rộng tối đa `--container-assist`, co lại khi màn hẹp.

`SheetContent` thêm cỡ `kara`: bề rộng theo nội dung (`w-auto`), trần `calc(100% - 2rem)`, cao hết màn. Khung neo mép
phải nên khi ô bản nháp xuất hiện, khung mở thêm về bên trái còn cột Kara đứng yên. Không thanh kéo đổi cỡ (thay
AC-2 của K2). Không hoạt ảnh bề rộng — chỉ hoạt ảnh trượt vào sẵn có của sheet.

**Một bề mặt liền, theo khuôn «dock» của ReUI `ai-chat-2`.** Chủ kho chỉ bốn block ReUI (`ai-chat-2`, `-4`, `-6`,
`-8`) ngày 09/10. Chụp và đọc cả bốn (bản xem trước, 1440 px): cả bốn đặt trang/vật phẩm bên trái và cột trợ lý bên
phải — khớp quyết định «Kara bên phải». Điều chung đáng lấy:
- Trang và cột trợ lý là MỘT bề mặt: chia bằng một đường kẻ dọc, không thẻ có viền lồng trong khung, không khoảng đệm
  giữa hai ô. Đây là lời giải đúng cho «mất khung»: không vẽ thêm khung cho cột chat, mà bỏ khung riêng của cả hai ô
  để khung ngoài bao trọn cả hai.
- Đầu mảnh: cột trợ lý có một dòng đầu thấp (dấu + tên + việc phụ); trang không có thẻ tiêu đề riêng. Ở khung soạn:
  hai ô mỗi bên một dòng đầu 44 px thẳng hàng — bản nháp «Bản nháp · Kara · n dòng · sửa lúc …» và «Chỉ dòng chờ»;
  cột Kara «Kara · Lượt n/12» và «Kara đang soạn…» khi bận. «Lượt n/12» rời đầu khung sang cột Kara vì nó nói về Kara.
- Ô soạn dính đáy cột, gợi ý câu nằm ngay trên ô soạn; câu trả lời mang việc làm tiếp (Insert ở `-2`, Approve ở `-8`,
  câu hỏi có lựa chọn ở `-6`) — ở khung soạn những việc đó đã nằm trên dòng nháp (K2), không đổi.

Không lấy: `ai-chat-4` đẩy trang sang trái và để trang dùng được (không lớp phủ). Khung soạn giữ lớp phủ như mọi khung
bản ghi — chủ kho đòi cùng UX với khung deal. Đẩy trang là khuôn cho một Kara chung toàn ứng dụng sau K5, không phải
vòng này. Block Pro chỉ là bản vẽ bố cục (`docs/design.md` bậc 4): dựng lại bằng thành phần của kho, không cài.

Trong `packages/ui`: `KaraArtifact` thêm biến thể không viền cho ô trong khung (`docked`), và khung cột Kara là thành
phần mới ở tệp mới trong `components/kara/` cùng dáng đầu–thân–đáy, không ở chỗ gọi.

**Đầu khung một dòng.** `DetailSheetHeader`: tiêu đề «Soạn OKR», mô tả «<đơn vị> · <chu kỳ>», nút đóng. Bỏ
«← Theo đơn vị» — đóng khung là về trang đang đứng.

**Khổ hẹp.**
- 768–1023 px: khung rộng tối đa `--container-assist`, hai tab «Trò chuyện» / «Bản nháp (n)» của K2, tab trên URL.
- Dưới 768 px: phủ toàn màn (không phải ngăn kéo 88dvh như các bản ghi khác), cùng hai tab.

**Bảo vệ lượt.** Khi Kara đang soạn: bấm ra ngoài khung không đóng; Esc, nút đóng hay vuốt xuống thì hỏi lại bằng
`ConfirmDialog` — nói rõ lượt vẫn chạy và mở lại để xem tiếp. Kara rảnh thì đóng ngay, không hỏi. Đóng khung tháo
thành phần, `useEveAgent` cắt luồng trình duyệt, còn lượt chạy tiếp trên máy chủ eve; mở lại thì `usePhienCuoc` đọc
lại phiên và nối tiếp. Mở một bản ghi khác chồng lên rồi quay lại cũng đi đúng đường đó. `GiuTrangSoan`
(`beforeunload` + chặn liên kết) chuyển thành bộ giữ của khung, bật khi và chỉ khi Kara đang soạn; tải lại giữa lượt
thì khung mở lại từ URL và nối tiếp như khi mở lại.

**Trang nền sau «Đưa vào».** Trang riêng của K2 quay về Theo đơn vị bằng điều hướng nên trang dựng lại; khung thì để
Theo đơn vị sống phía sau suốt cuộc. «Đưa vào» thành công phải làm mới truy vấn của Theo đơn vị (danh sách Mục tiêu
và nút soạn của phòng) để đóng khung là thấy ngay N Mục tiêu mới (AC-13, gap-probe F2).

**Đường cũ.** `/<slug>/okr/soan/<cuộc>` là trang máy chủ đọc cuộc rồi `redirect` sang Theo đơn vị của cuộc với
`record=soan:<cuộc>` (thay, không thêm lịch sử). Cuộc không có → Theo đơn vị mặc định với `record=soan:<id>`, khung
hiện lỗi `KaraState`. `?cuocSoan=<id>` cũ → `record=soan:<id>` bằng `replace`.

## Eval cũ bị thay

Các ô dưới đây của hồ sơ đã ký K2 đo đúng thứ vòng này gỡ (đường trang riêng, thanh kéo). Khi vòng này ký, chúng
khai `status: not-run` kèm `superseded_by` trỏ tiêu chí đo lại (khuôn `EVAL-THAY-BOI-TEMPLATE`, GUIDE §7.1):

| Eval cũ | Đo gì | Tiêu chí mới |
| --- | --- | --- |
| soan-okr-trang-rieng/E1 | «Soạn»/«Tiếp tục» đẩy sang `/okr/soan/<id>`, không có sheet | AC-1 |
| soan-okr-trang-rieng/E1b | màn: URL thành `/okr/soan/<id>`, «← Theo đơn vị» | AC-1 |
| soan-okr-trang-rieng/E2 | màn: thanh kéo, ô 380 px kéo được 300–50% | AC-3 |
| soan-okr-trang-rieng/E2b | DOM: `ResizablePanelGroup` hai ô, tab dưới 1024 | AC-3 |
| soan-okr-trang-rieng/E14 | ma trận màn có kéo thanh bằng chuột và phím | AC-11 |
| soan-okr-trang-rieng/E3 | ma trận sáu trạng thái, gồm ô bản nháp rỗng hiện «Kara đang soạn bản nháp đầu…» (thêm ở S3, xem sổ quyết định) | AC-5 |

Mọi ô khác của K2 (E4–E13, E16) vẫn là lời hứa sống: AC-9 của vòng này chạy lại chúng trên khung mới.

## Ranh giới tệp

Chạm — gửi giám sát qua `yeu-cau/` trước S2:
- `apps/app/app/(app)/[slug]/okr/soan/**` (trừ `bang-nhap.tsx`, `the-nhap.tsx`, `hoi-thoai-soan.tsx` ngoài vỏ khung)
- `apps/app/components/crm/record-sheet/{record-stack.ts,record-sheet-host.tsx,soan-sheet.tsx}`
- `apps/app/components/{detail-sheet.tsx,responsive-sheet.tsx}`, `apps/app/lib/record-href.ts`
- `packages/ui/src/components/sheet.tsx`, `packages/ui/src/components/drawer.tsx`, `packages/ui/src/components/kara/` (khung cột Kara ở tệp mới; biến thể `docked` trong `artifact.tsx`; không đụng `state.tsx`)
- `apps/app/lib/messages/okr-soan.ts`, `docs/ai-ux.md`
- `_acceptance/soan-okr-trang-rieng/evals.yaml` (chỉ năm ô bảng trên), `_acceptance/config.yaml` (khoá `sk_*`)
- thử nghiệm mới `apps/app/test/soan-okr-trong-khung.dom.tsx`, đồ thử `apps/app/test/khung-soan-okr.tsx`

Giáp ranh đã biết (giám sát 09/10): P1 đang ở `okr/soan/**` (K2c S4, K3 S3, K2d chưa mở); P2 ở chồng khung bản ghi
(K4c sắp làm). Đổi `sheet.tsx` chạm `paths` của nhiều hồ sơ đã ký — ghim lại bằng làn máy ở bước cuối.

Giám sát trả lời 09/10 (`tra-loi/soan-trong-khung-1.json`): phiên này là làn P7, hàng K2e.
- K2c giữ `okr/soan/**` tới khi gộp: K2e làm S1–S3 song song, gộp onehub sau K2c rồi mới xin s4.
- Khung cột Kara ở tệp mới trong `kara/`; không sửa `kara/state.tsx` (của K3).
- Không đổi chỗ định dạng ngày giờ trong `nut-soan.tsx`, `danh-sach-cuoc.tsx`, `bang-nhap.tsx` (K3 đổi
  `formatNgayGio` ở đó) — chỉ bọc khung.
- `apps/app/test/khung-soan-okr.tsx`: dựa trên bản K2c (có `datNgonNgu`) sau khi gộp onehub, không viết lại hàm đó.
- L1 cũng sửa `the-nhap.tsx`: PR gộp sau giải xung đột.
- Ghim lại các hồ sơ đã ký có `sheet.tsx`/`drawer.tsx` trong `paths` là một lượt khoá `ghim-lai` dài — khai phút
  ước lượng trong đơn.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Theo đơn vị → «Soạn» → khung trượt từ phải, chỉ cột Kara → nói với Kara → Kara nộp bản nháp đầu → khung
  mở thêm bản nháp bên trái → nhận, sửa, gõ số → «Đưa vào» → biên nhận (điểm ra: đóng khung, về Theo đơn vị).
- Biên: mở bằng liên kết `?record=soan:<id>` trên trang khác (khung mở trên trang đó); «Tiếp tục» một cuộc đã có nháp
  (mở thẳng cỡ rộng); hết lượt («Mở cuộc mới» thay khung bằng cuộc mới); chưa cấu hình cầu nối.
- Lỗi & quay lại: id không có → khung hiện «Kara chưa mở cuộc soạn được», nút đóng; Kara lỗi giữa lượt → «Thử lại» như
  K2; lỡ bấm đóng khi Kara đang soạn → hộp hỏi lại, «Ở lại» giữ khung.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Khung soạn (hẹp) | nói với Kara để có bản nháp đầu | «Soạn», liên kết `record=soan` / bản nháp đầu tới thì thành khung rộng |
| Khung soạn (rộng) | quyết từng dòng nháp và đưa vào | «Tiếp tục», Kara nộp / đóng khung về trang nền |
| Khung soạn (điện thoại) | cùng hai việc trên, hai tab | như trên / đóng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-khung-dang-mo | Khung soạn | đầu khung giữ «Soạn OKR», thân `KaraState working` «Đang mở cuộc soạn…» | chờ / đóng |
| ST-khung-hep-rong | Khung soạn (hẹp) | chỉ cột Kara phủ khung, dòng đầu «Kara · Lượt n/12», lời mở đầu, ô soạn ở đáy | gõ cho Kara |
| ST-khung-dang-soan-dau | Khung soạn (hẹp) | cột Kara «Kara đang soạn…», ô soạn thành «Dừng» | chờ / Dừng |
| ST-khung-rong | Khung soạn (rộng) | bản nháp trái, Kara phải, một bề mặt chia bằng một đường kẻ | quyết dòng, hỏi Kara |
| ST-khung-rong-dang-soan | Khung soạn (rộng) | dòng chờ khoá kèm lý do, «Dừng» | chờ / Dừng |
| ST-khung-hoi-dong | Khung soạn | Kara đang soạn mà người đóng → `ConfirmDialog` «Kara đang soạn. Đóng khung?» | Ở lại / Đóng |
| ST-khung-khong-mo | Khung soạn | `KaraState error` «Kara chưa mở cuộc soạn được» | đóng |
| ST-khung-chua-cau-hinh | Khung soạn | `KaraState unconfigured` | đóng |
| ST-khung-da-dua-vao | Khung soạn (rộng) | biên nhận «Đã tạo N Mục tiêu», không nút quyết | đóng |
| ST-khung-dien-thoai | Khung soạn < 768 | phủ toàn màn, hai tab, tab trên URL | đổi tab |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bề mặt: một đường kẻ dọc chia hai ô; không viền riêng trong khung; dòng đầu hai ô 44 px thẳng hàng.
- Bề ngang: cột Kara = `--container-assist-rail`; bản nháp ≤ `--container-assist`; khung ≤ `100% − 2rem`; không thanh kéo.
- Hai ô và khung không cuộn; mỗi ô cuộn thân riêng; trang nền không cuộn khi khung mở.
- `beforeunload` chỉ khi Kara đang soạn. Esc lần đầu lên hộp hỏi khi đang soạn; focus về nút đã mở khung khi đóng; `overscroll-behavior: contain` trên thân ô.
- Ngưỡng: ≥ 1024 hai ô cạnh nhau; 768–1023 hai tab trong khung; < 768 phủ toàn màn hai tab.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DetailSheet`, `DetailSheetHeader` | dùng | khung bản ghi chung — đúng điều chủ kho đòi |
| `SheetContent` cỡ `kara` | mở rộng (`packages/ui`) | bề rộng theo nội dung từ hai token có sẵn; luật «biến thể ở packages/ui» |
| `DrawerContent` phủ toàn màn | mở rộng (`packages/ui`) | ngăn kéo 88dvh của bản ghi khác không đủ chỗ soạn |
| khung cột Kara | tạo ở tệp mới trong `packages/ui/src/components/kara/` | đầu mảnh–thân cuộn–ô soạn ở đáy, không viền riêng; chưa có thành phần nào |
| `KaraArtifact` biến thể `docked` | mở rộng (`packages/ui`) | bản nháp nằm phẳng trong khung, không thẻ lồng |
| `KaraArtifact`, `KaraState`, `ConfirmDialog`, `Tabs` | dùng | khuôn Kara §5–7 `docs/ai-ux.md`, hỏi lại theo `docs/design.md` |

Tra ReUI «ai chat side panel»: block Pro `ai-chat-2`, `-4`, `-6`, `-8` (bậc 4, bản vẽ bố cục, chủ kho chỉ) — rút bố cục, không cài.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: hai khuôn khả dĩ (danh-sách-chi-tiết vs hội-thoại). Chọn danh-sách-chi-tiết vì cuộc soạn mở trên trang danh
sách như mọi bản ghi; phần hội thoại sống trong ô bên phải theo khuôn trợ lý cạnh vật phẩm — Microsoft 365 Copilot
trong Word, GitHub Copilot Chat trong VS Code, Notion AI đều đặt trợ lý ở cột phải cạnh vật đang sửa; ChatGPT Canvas
và Claude Artifacts đặt chat trái vì ở đó chat là thứ chính, ở CRM bản ghi mới là thứ chính.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Khung deal có cột Kara bên phải — K5 `chat-deal-mot-khung`.
- «Không đọc lại được các lượt trước» trong ảnh chủ kho 09/10 — kiểm riêng.
- Lưu bề ngang theo người dùng; thanh kéo đổi cỡ.
- Kara mở bản ghi từ câu trả lời (liên kết trong tin nhắn) — vòng này chỉ làm cho `?record=soan:` mở được ở mọi trang.
