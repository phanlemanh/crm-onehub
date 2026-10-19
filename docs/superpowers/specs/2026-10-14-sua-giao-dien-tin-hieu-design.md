# Sửa giao diện tín hiệu (TH6) — thiết kế

Hàng TH6 của `docs/plan/lo-trinh-okr.json`, đợt `vong-tin-hieu-1410`, phủ U1–U8 của
`docs/plan/pham-vi-vong-tin-hieu-1410.md`. Cổng Đáng `build` 14/10/2026 (chủ kho), ngưỡng: lượt rà lại trên production
không còn lỗi nào trong tám. Ô cơ hội: `_acceptance/sua-giao-dien-tin-hieu/opportunity.md`.

**Câu giao:** Người gửi tín hiệu đọc rõ hộp gửi và trang Tín hiệu đã gửi ở mọi khổ màn và mọi ngôn ngữ, thấy lỗi báo
đúng chỗ, và đóng biên nhận không bị hỏi lại.

## Ranh giới

- Chỉ sửa trong `apps/app` (thành phần tín hiệu, trang, tệp lời `messages/tin-hieu.ts`, một tệp mới đặt tên màn).
- **Không** sửa `packages/ui` (luật tệp chung đợt r2 trên #375): mọi chỗ cần đều dùng thứ hộp thoại và nút đã có.
- **Không** sửa API, khuôn dữ liệu hay `packages/validation`: đường dẫn màn vẫn cất nguyên như cũ, tên màn suy lúc
  hiện. Tệp tín hiệu kéo về git không đổi một byte.
- Dựng trên đỉnh onehub SAU khi TH4 (#403) gộp — TH4 sửa cùng ba tệp (`danh-sach-tin-hieu.tsx`,
  `hop-gui-tin-hieu.tsx`, `lib/tin-hieu/trang-thai.ts`) và thêm câu báo trước Q3 vào hộp gửi. Bản thiết kế viết
  trên dạng của các tệp đó sau TH4.
- U9 (lớp phủ hộp thoại ở nền tối) ngoài vòng — thuộc bộ giao diện chung.

## Giải pháp từng lỗi

### U1 — bảng bóp cột «Điều đã kể» ở 768–1100px (crm-1)

Gốc: bảng tự dàn, bốn cột phụ khai bề rộng cố định (2 × `w-32`, `w-[36%]`, `w-12`) và cột «Màn» mang đường dẫn thô
không ngắt dòng, nên cột kể nhận phần thừa — đo trên production còn ~80px.

Sửa: gộp «Màn» và «Gửi lúc» thành một cột **«Gửi»** hai dòng (tên màn, dưới là giờ gửi chữ phụ), bề rộng `w-36`;
cột trạng thái hạ từ 36% xuống 30%. Ở 768px khung nội dung ~680px → cột kể còn ~270px; ở 1280px ~600px. Phép đo:
cột «Điều đã kể» là cột **rộng nhất** của bảng ở 768, 900, 1100 và 1280px, trang không cuộn ngang. Dưới `md` giữ
danh sách `Item` như cũ (nếp `docs/design.md`).

### U2 — lỗi tô đỏ ô thứ hai; quá trần vẫn bấm Gửi được (crm-2)

Gốc: lỗi gắn vào `Field` của ô «Điều gì xảy ra» (`data-invalid`), nên đọc như người gõ sai ô đó; nút Gửi chỉ khoá
khi trống.

Sửa:
- Lỗi gửi hiện ở **một vùng báo lỗi của cả hộp**, dưới hai ô, trên chân hộp (`Alert` tông lỗi của `packages/ui`,
  `role="alert"`); không ô nào mang `data-invalid` hay `aria-invalid`.
- Lỗi quá trần (máy chủ trả 429): câu do ứng dụng dựng từ tệp lời theo ngôn ngữ đang chọn và hằng
  `TIN_HIEU.tranMoiNgay` — **không** hiện câu tiếng Việt của máy chủ (sửa luôn LT2 Known limit Ngoài-2). Nút Gửi
  khoá, `aria-describedby` trỏ vùng lỗi. Khoá nhớ theo **ngày giờ Việt Nam**: đóng hộp mở lại trong ngày vẫn khoá
  và vẫn hiện câu đó; sang ngày mới thì mở. Chữ đã gõ giữ nguyên.
- Lỗi máy chủ hay mạng (khác 429): câu chung «Chưa gửi được — thử lại.» ở cùng vùng; nút Gửi bấm lại được.
- Câu lỗi 4xx khác của máy chủ không còn chảy thẳng ra màn: mọi mã khác 429 dùng câu chung.

### U3 — giờ không theo ngôn ngữ; cột «Gửi lúc» lệch lề (crm-3)

- Bộ định dạng giờ theo ngôn ngữ đang chọn (`vi-VN` / `en-GB`), múi giờ Việt Nam như cũ; một hàm dùng chung cho
  bảng, danh sách điện thoại.
- Cột «Gửi lúc» không còn (gộp vào «Gửi», U1), giờ là chữ phụ căn trái cùng lề tên màn.

### U4 — mã crm-N không hiện trên danh sách; hộp xoá chỉ nêu mã (crm-4)

- Dòng chữ phụ dưới tiêu đề mỗi tín hiệu mở đầu bằng mã: `crm-3 · Muốn: …` (bảng) và `crm-3 · <tên màn> · <giờ>`
  (điện thoại). Mã mang `translate="no"`.
- Hộp xoá: tiêu đề «Xoá tín hiệu crm-3?»; thân nêu điều đã kể trong ngoặc «…» (đánh dấu không dịch) rồi câu hệ quả.

### U5 — tiêu điểm nhảy về đầu trang sau xoá; nút ⋮ 24×24 trên điện thoại; nút Gửi khoá không nói vì sao (crm-5)

- **Tiêu điểm sau xoá:** hộp xác nhận không trả tiêu điểm về nút ⋮ đã mất. Xoá xong (danh sách làm mới) tiêu điểm
  tới **nút ⋮ của dòng kế** (dòng ngay dưới; dòng cuối thì dòng ngay trên); dòng đó không có nút xoá được thì tới chính
  dòng đó; hết dòng thì tới nút «Gửi tín hiệu» của trạng thái rỗng. Một vùng `aria-live="polite"` đọc «Đã xoá tín hiệu
  crm-3». Không dùng `useEffect`: dời tiêu điểm trong `onSuccess` sau khi danh sách làm mới xong.
- **Xoá hỏng** (409 đã lấy về, mạng): hộp đóng, dòng còn, vùng báo dưới đầu danh sách nói vì sao theo ngôn ngữ
  đang chọn (sửa LT2 Known limit Ngoài-5). 409 thì câu «Đội sản phẩm vừa lấy tín hiệu này về — không xoá được nữa.»
- **Nút ⋮ trên điện thoại:** danh sách `Item` dùng cỡ `icon-lg` (36×36) — cỡ lớn nhất bộ giao diện chung đang có;
  bảng từ `md` giữ `icon-xs` như các danh sách khác. 44×44 cần một cỡ nút mới trong `packages/ui` → ngoài vòng
  (ghi Known limit, đề xuất về hàng TH7).
- **Nút Gửi khoá vì trống:** một dòng chữ phụ cạnh chân hộp «Kể đủ hai câu rồi bấm Gửi.», nút trỏ tới nó bằng
  `aria-describedby`; dòng ẩn khi đủ chữ.

### U6 — đóng biên nhận vẫn hỏi «Bỏ những gì vừa nhập?»

Gốc: hộp thoại chung tự nhận «đã gõ» từ sự kiện gõ phím (`tuNhan`) và giữ cờ đó sau khi gửi xong, vì hộp gửi không
khai gì cho bộ giữ.

Sửa: hộp gửi khai `coThayDoi` tường minh = đang soạn **và** có chữ ở ít nhất một ô (sau `trim`). Gửi xong hai ô về
rỗng → `coThayDoi` đổi `true → false` → bộ giữ xoá cờ tự nhận (nhánh có sẵn trong `useGiuGoc`). Kết quả:
- biên nhận: Đóng · Esc · dấu X · bấm ra ngoài · «Xem tín hiệu đã gửi» → đóng ngay, không hỏi;
- đang soạn có chữ: Huỷ · Esc · X vẫn hỏi lại như cũ (đối chứng dương);
- gõ rồi xoá hết chữ: đóng ngay.

### U7 — «Gửi từ màn» và cột «Màn» hiện đường dẫn thô

Tệp mới `apps/app/lib/tin-hieu/ten-man.ts`: `tenMan(duong, locale)` trả tên màn theo ngôn ngữ, đọc từ các bảng tên
đã có, không viết tên mới:

| Đoạn đầu đường dẫn | Tên lấy từ |
|---|---|
| `/` và 11 mục của thanh điều hướng (`MUC_RAIL`) | `nhanRail` (tệp lời `khung-ung-dung`) |
| `/agents` | mục «Hội thoại» (cùng `related` của `MUC_RAIL`) |
| `/settings/<mục>` | «Cài đặt › <tên mục>» từ `NHOM_CAI_DAT` + `settingsMessages().thanhBen`; mục lạ → «Cài đặt» |
| `/reminders` | tiêu đề trang Nhắc buổi sáng (`nhacQuaZaloMessages().tieuDe`) |
| `/tin-hieu` | «Tín hiệu đã gửi» (`tinHieuMessages().menu`) |
| `/ngoai-pham-vi` và đường không thuộc ứng dụng | đường dẫn nguyên văn (lối lùi trung thực, hiếm) |

Bài đo duyệt **mọi thư mục cấp một** dưới `apps/app/app/(app)/[slug]/` lúc chạy: thêm một màn mới mà quên khai tên
là bài đỏ gọi tên màn đó. Hộp gửi hiện «Gửi từ màn: Mục tiêu»; giá trị gửi lên máy chủ vẫn là đường dẫn (không đổi
API, tệp kéo về git vẫn mang đường dẫn cho đội sản phẩm). Tín hiệu cũ crm-1..5 tự hiện tên vì suy lúc hiện.

### U8 — chữ trạng thái lặp ý, dùng từ nội bộ «gom», mất nút xoá không nói vì sao

Chữ CRM tự viết (nhãn và câu trạng thái lúc gửi, mô tả hộp, biên nhận, dòng báo). Câu lỗi nói nguyên nhân chung (mạng hoặc máy chủ) và khi nào làm lại; «đã nhận / đã mở» thay cho «lấy về» (bổ sung S4 vòng 1 theo hội đồng E10). Ở trạng thái «Đang xem xét», việc «còn làm được gì» là theo dõi tiến độ; mục Xoá khoá mang lý do riêng trong menu ⋮. Câu sau gom vẫn là câu kit viết
nguyên văn (`cau_nguoi_gui`), không đổi.

| Khoá | Bây giờ (vi) | Sau (vi) | Sau (en) |
|---|---|---|---|
| `nhan.choLayVe` | Chờ lấy về | Đã nhận | Received |
| `trangThai.choKeoVe` | Đã nhận — chờ đội sản phẩm lấy về | Đội sản phẩm chưa mở. Bạn còn xoá được. | Not opened by the product team yet. You can still delete it. |
| `nhan.choGom` | Chờ gom | Đang xem xét | Under review |
| `trangThai.choGom` | Đội sản phẩm đã lấy về — chờ gom nhóm | Đội sản phẩm đang xếp nó cùng những điều tương tự. Theo dõi tiến độ ở đây. | The product team is sorting it with similar signals. Follow its progress here. |
| `trang.banVeChuaDoc` | Trạng thái sau gom chưa đọc được — đang hiện trạng thái lúc gửi. | Chưa đọc được tiến độ mới nhất — đang hiện trạng thái lúc gửi. | Can't read the latest progress — showing the status at sending time. |
| `hop.moTa` | … Đội sản phẩm gom tín hiệu thành việc, … | … Đội sản phẩm xếp những tín hiệu giống nhau thành việc, và bạn theo dõi được tín hiệu của mình. | … The product team turns similar signals into work, and you can follow yours. |
| `hop.daGuiMoTa` | Tín hiệu chờ đội sản phẩm lấy về để gom thành việc. Theo dõi ở «Tín hiệu đã gửi». | Đội sản phẩm sẽ xem nó cùng những điều tương tự. Theo dõi ở «Tín hiệu đã gửi». | The product team will review it with similar signals. Follow it under Sent signals. |
| `nhan.daCoViec` (en) | Already done | (vi giữ «Đã có việc») | Already covered |
| `hop.chuaGui` | Chưa gửi được — thử lại. | Chưa gửi được — mạng hoặc máy chủ đang gián đoạn. Thử lại sau một lát. | Not sent — the network or server was interrupted. Try again in a moment. |
| `trang.xoaHong` (mới) | — | Chưa xoá được {ma} — mạng hoặc máy chủ đang gián đoạn. Thử lại sau một lát. | Couldn't delete {ma} — the network or server was interrupted. Try again in a moment. |
| `trang.xoaHongDaLayVe` (mới) | — | Chưa xoá được {ma} — đội sản phẩm vừa mở tín hiệu này. | Couldn't delete {ma} — the product team just opened this signal. |
| `trang.khongXoaDuoc` (mới) | — | Đội sản phẩm đã mở tín hiệu này — không xoá được nữa. | The product team has opened this signal — it can't be deleted anymore. |

Luật đo (máy): mọi câu và nhãn CRM tự viết cho người gửi — bộ khoá `hop`, `trang`, `nhan`, `trangThai` — không chứa
từ nội bộ trong bảng cấm (`gom`, `kéo về`, `lấy về`, `kit`, `khối`, `bản vẽ`, `lượt`, `hồ sơ`); ở mỗi trạng thái CRM, câu không
lặp lại nhãn của nó. Phần đọc-hiểu (một nhân viên không dùng git có hiểu không) là việc của hội đồng.

**Mất nút xoá:** dòng đã lấy về vẫn có nút ⋮; trong menu, mục «Xoá» bị khoá kèm một dòng giải thích «Đội sản phẩm đã
lấy về — không xoá được nữa.» (luật «nút bị khoá thì có một dòng nói vì sao» của `docs/design.md`).

`CONTEXT.md` mục «Tín hiệu»: thay «chờ lấy về, chờ gom» bằng «đã nhận, đang xem xét» để từ điển khớp chữ trên màn.

## Ô đo của LT2 bị thay

Vòng này cố ý đổi năm điều mà hồ sơ đã ký `gui-tin-hieu-trong-crm` (LT2) khẳng định. Theo luật «eval bị một hồ sơ đã
ký khác thay» (kit 2.24), các ô đó khai `status: not-run` + `superseded_by` trỏ tiêu chí đo lại nó ở hồ sơ này. Bảng
nhận việc thay (máy đọc thẻ `<slug cũ>/<id cũ>`):

| Ô cũ | Điều cũ khẳng định | Thay bởi |
|---|---|---|
| gui-tin-hieu-trong-crm/E1 | dòng «Gửi từ màn» mang đường dẫn bỏ slug | sua-giao-dien-tin-hieu#AC-8 |
| gui-tin-hieu-trong-crm/E3b | lỗi 429 hiện dưới ô, câu máy chủ, nút Gửi bấm lại được | sua-giao-dien-tin-hieu#AC-2 |
| gui-tin-hieu-trong-crm/E5b | dòng đã lấy về không có nút ⋮ | sua-giao-dien-tin-hieu#AC-9 |
| gui-tin-hieu-trong-crm/E13 | ảnh hộp: «Gửi từ màn» == đường dẫn | sua-giao-dien-tin-hieu#AC-10 |
| gui-tin-hieu-trong-crm/E10 | câu sau gom == câu kit viết nguyên văn | sua-giao-dien-tin-hieu#AC-12 |
| gui-tin-hieu-trong-crm/E9 | bộ đọc CRM ra đúng câu kit nguyên văn (răng vong-kit, dòng «ve») | sua-giao-dien-tin-hieu#AC-12 |

Mọi khẳng định khác của bốn ô đó (nút trên thanh đầu trang cùng kiểu cụm, ma trận chín tổ hợp khoá Gửi, mục menu,
biên nhận mang mã, làm mới danh sách, hộp hỏi lại trước khi xoá, một nút chính đầu trang…) được đo lại trong bài của
hồ sơ này (E11, ô AC-11). Danh sách bốn ô chốt ở S3: chạy mọi eval máy của LT2 trên mã mới, VÀ đọc lại câu kỳ vọng của
mọi eval ui-check và judgment của LT2 có `paths` giao với `apps/app/components/tin-hieu/**` hay `messages/tin-hieu.ts`
(E13, E14) — ô thứ năm đỏ hay nói ngược thay đổi của vòng này → DỪNG, trình người, không tự thêm vào bảng. Sửa bài
`tin-hieu.dom.tsx` của LT2 chỉ đổi khẳng định của các ô bị thay, không bớt khẳng định (E11c đếm `expect(` trước/sau).

Hồ sơ LT2 và TH4 (`moi-tin-hieu-cho-quan-tri`, nếu đã gộp) được ghim lại một làn trong PR này vì vùng đo của chúng
chạm cùng tệp. Ô khai thay chỉ hợp lệ khi hồ sơ này có **chữ ký người** (`signed-off`) — nên Cổng Bằng chứng của vòng
này là cổng người, không đi làn máy-tự-thông.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: nút «Gửi tín hiệu» ở đầu màn → hộp hai ô, dòng «Gửi từ màn: <tên màn>» → Gửi → biên nhận «Đã nhận tín hiệu
  crm-N» → Đóng (không hỏi) hoặc «Xem tín hiệu đã gửi» → trang danh sách, dòng đầu mang crm-N (điểm ra: trang
  «Tín hiệu đã gửi»).
- Biên: quá trần ngày (khoá Gửi kèm lý do tới hết ngày); danh sách rỗng; tín hiệu đã lấy về (xoá khoá kèm lý do);
  xoá dòng cuối cùng (tiêu điểm tới nút gửi của trạng thái rỗng).
- Lỗi & quay lại: máy chủ lỗi khi gửi → vùng lỗi dưới hai ô, chữ giữ, bấm Gửi lại; xoá hỏng → dòng còn, vùng báo đầu
  danh sách nói vì sao.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp «Gửi tín hiệu» | kể một điều mình gặp kèm màn đang đứng | nút đầu mọi màn / biên nhận → trang danh sách |
| Trang «Tín hiệu đã gửi» | xem từng tín hiệu của mình đang ở đâu, xoá cái chưa lấy về | menu người dùng, biên nhận / — |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hop-trong | Hộp | hai ô trống, Gửi khoá, dòng «Kể đủ hai câu rồi bấm Gửi.» | gõ |
| ST-hop-dang-go | Hộp | «Gửi từ màn: Mục tiêu», Gửi mở | Gửi / Huỷ (hỏi lại) |
| ST-hop-qua-tran | Hộp | vùng lỗi dưới hai ô «Hôm nay bạn đã gửi 10 tín hiệu — gửi tiếp được từ 0 giờ ngày mai.», Gửi khoá, ô không viền đỏ | đóng, quay lại ngày mai |
| ST-hop-loi | Hộp | vùng lỗi «Chưa gửi được — thử lại.», chữ giữ | Gửi lại |
| ST-hop-da-gui | Hộp | «Đã nhận tín hiệu crm-12», câu biên nhận mới | Đóng (không hỏi) / Xem tín hiệu đã gửi |
| ST-ds-co | Trang | bảng: Điều đã kể (mã · muốn) · Gửi (tên màn / giờ) · Trạng thái · ⋮ | đọc, xoá |
| ST-ds-hep | Trang | cùng bảng ở 768–1100px, cột kể rộng nhất | đọc |
| ST-ds-dt | Trang | danh sách Item 375px, mã · tên màn · giờ, ⋮ 36×36 | đọc, xoá |
| ST-ds-xac-nhan-xoa | Trang | «Xoá tín hiệu crm-3?» + «…điều đã kể…» | Xoá / Giữ lại |
| ST-ds-xoa-khoa | Trang | menu ⋮ của dòng đã lấy về: «Xoá» khoá + lý do | — |
| ST-ds-xoa-hong | Trang | vùng báo đầu danh sách: vì sao chưa xoá được | đọc |
| ST-ds-rong | Trang | câu rỗng + nút «Gửi tín hiệu» | gửi |
| ST-ds-en | Trang | cùng bảng bằng tiếng Anh, giờ kiểu en-GB | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Gửi khoá khi một ô trống hoặc toàn khoảng trắng (như LT2), hoặc khi đã quá trần trong ngày giờ Việt Nam.
- Tiêu điểm sau xoá: nút ⋮ dòng kế → dòng kế → nút gửi của trạng thái rỗng; vùng đọc «Đã xoá tín hiệu crm-N».
- Breakpoint: bảng từ `md` (768) với cột «Gửi» gộp; dưới `md` danh sách Item.
- Ctrl/⌘+Enter gửi như cũ; Esc/X/bấm ngoài ở biên nhận đóng ngay.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Dialog` + `coThayDoi` | dùng | bộ giữ có sẵn nhánh xoá cờ khi khai `true → false` |
| `Alert` (tông lỗi) | dùng | vùng lỗi của cả hộp, không gắn vào ô nào |
| `SimpleTable`, `Item`, `SimpleTableNote` | dùng | nếp danh sách của `docs/design.md` |
| `Button size="icon-lg"` | dùng | cỡ chạm lớn nhất bộ chung có |
| `DropdownMenuItem disabled` + chữ phụ | ghép | mục xoá khoá kèm lý do |
| `ConfirmDialog` (`noiDung`, `onCloseAutoFocus`) | dùng | nêu điều đã kể, không trả tiêu điểm về nút đã mất |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: giữ nguyên khuôn của LT2 đã ký (hộp kể + trang danh sách); vòng này chỉ sửa lỗi trên khuôn đó, không có hướng
IA thứ hai — luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kế hoạch đo (tóm tắt)

- Bài DOM mới `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx` (tiền tố `sgt-`) + cập nhật `tin-hieu.dom.tsx` của LT2
  ở các ô bị thay; bài đơn vị `apps/app/test/ten-man.spec.ts`.
- Răng đo màn `_acceptance/sua-giao-dien-tin-hieu/rang/do-man.mjs` (puppeteer, phiên đo riêng như LT2): bề rộng cột ở
  768/900/1100/1280, khổ 375 × vi/en không cuộn ngang, đóng biên nhận không hỏi, tiêu điểm sau xoá; ảnh vào
  `evidence/`.
- Rà thiết kế tĩnh (`design-gate.mjs`) cho các tệp tín hiệu.

## Soát chuẩn giao diện (`web-design-guidelines`, 14/10)

Soát bản nháp `apps/app/app/proto/_modules/sua-giao-dien-tin-hieu/ban-moi.tsx` theo Web Interface Guidelines:

- Đạt: giờ bằng `Intl.DateTimeFormat` có múi giờ cố định (không lệch hydrat), xoá có hỏi lại, mã và chữ người gõ
  `translate="no"`, nút biểu tượng có tên đọc được, dòng dài có `line-clamp`/`break-words`, cột chữ `min-w-0`.
- Mang sang S3: hai ô giữ `name` và `autoComplete="off"` của thành phần thật (bản nháp bỏ); vùng lỗi của hộp là
  `role="alert"` nên được đọc ngay khi hiện.
- Lệch có chủ ý: chuẩn khuyên nút gửi luôn bấm được rồi báo lỗi; LT2 đã ký «khoá khi một ô rỗng». Vòng này giữ khoá và
  thêm dòng nói vì sao (AC-6) thay vì đổi hành vi đã ký.

## Câu trạng thái sau gom song ngữ (chủ kho chọn làm ở Cổng Phạm vi 14/10)

Câu sau gom hiện là câu kit viết (`cau_nguoi_gui`), chỉ có tiếng Việt, nên giao diện tiếng Anh hiện câu Việt. Bản ghi
kit đã mang mã máy đọc (`cho`, `ten_nhom`, `ly_do`, `hang`, `ho_so`, `trang_thai`). Nếu chủ kho chọn làm (máy khuyên),
vòng thêm **AC-12**: CRM dựng câu từ `cho` + tệp lời vi/en — tên nhóm, lý do và tên việc giữ nguyên chữ người viết
(`translate="no"`); `cho` lạ hay thiếu trường thì rơi về `cau_nguoi_gui`. Bài đo: ma trận mọi giá trị `CHO_TIN_HIEU` (và
mọi nhóm trạng thái của hàng) × {vi, en}, khối mẫu rút từ bộ vẽ kit thật như LT2 E9. Ô E10 của LT2 («câu kit nguyên
văn») khai thay thêm, trỏ AC-12. Không chọn → giữ câu kit, ghi Known limit.
