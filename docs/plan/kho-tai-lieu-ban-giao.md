# Kho tài liệu — bàn giao để chạy tiếp ở máy khác

Viết 2026-09-27. Mọi thứ cần để chạy tiếp nằm trong nhánh `proto/kho-tai-lieu` của
`origin` (`phanlemanh/crm-onehub`), trừ ba thứ không vào git: tệp `.env`, trí nhớ
của phiên máy, và kết quả thô 1 MB của phiên research. Mục 4 chép lại phần trí nhớ
cần thiết để máy khác không phải học lại.

## 1. Đang ở đâu

**Lượt 0 (nền, không mã) đang làm.** Nghiên cứu xong, bản mẫu xong, một quyết định
đã chốt, lộ trình và sổ theo dõi đã có. Chưa có dòng mã sản phẩm nào ngoài bản mẫu
và trình đọc markdown. Ngày 2026-09-27 chủ kho bỏ hạng mục pháp lý: lộ trình chỉ theo
dõi bàn giao phần mềm. Lượt 0 còn duyệt từ điển; việc chuẩn bị pilot chạy song song, máy
đã soạn mẫu.

| Thứ | Ở đâu |
| --- | --- |
| Lộ trình và sổ theo dõi | `docs/plan/lo-trinh-kho-tai-lieu.md` (mục 8 là sổ) |
| Nghiên cứu nền, bản thiết kế | `docs/plan/kho-tai-lieu-nghien-cuu.md` (mục 0–9, 14–17) |
| Việt Nam, pháp lý, đo lường | `docs/plan/kho-tai-lieu-viet-nam-va-do-luong.md` (mục 10–13, gồm 12 câu cho luật sư) |
| 546 nguồn | `docs/plan/kho-tai-lieu-nguon.md` |
| Hồ sơ 17 luồng research | `docs/plan/kho-tai-lieu-ho-so/` |
| Tài liệu trình bày (Claude Doc) | https://claude.ai/artifact/8B5uoGwQd4eyGb8wCNw8CN — riêng tư, mở được trên mọi máy đã đăng nhập tài khoản chủ kho |
| Trang theo dõi tiến độ (artifact) | https://claude.ai/artifact/12sCbWrWgx6td1vqzR63Yg — dữ liệu trong kho dữ liệu của artifact; phiên máy cập nhật bằng `ArtifactData` sau mỗi hạng mục, cùng lúc với mục 8 |
| Bản mẫu bấm được | `apps/app/app/proto/_modules/kho-tai-lieu/`, 16 trạng thái, đường `/proto/kho-tai-lieu` |
| Trình đọc markdown | `packages/ui/src/components/markdown-reader.tsx` |
| Từ điển | Tám mục mới ở cuối `CONTEXT.md`, dạng «đề xuất, chưa qua Cổng Phạm vi» |

Lịch sử nhánh (mới nhất trên cùng):

| Commit | Việc |
| --- | --- |
| `ad55da4c` | Bỏ hạng mục pháp lý, xoá gói gửi luật sư, tách chuẩn bị pilot khỏi lượt 0 |
| `aa210027` | Kéo `onehub` mới vào (19 commit, không `migration`) |
| `ab55edae` | Khuôn mầm bộ vàng 50 câu hỏi thật |
| `7bdfa9d7` | Mẫu kiểm kê, tin hỏi giờ duyệt, các bước gom tệp Zalo |
| `e131ad28` | Gói gửi luật sư: thư, 12 câu theo thứ tự cần trả lời, phụ lục dữ liệu CRM gửi đi đâu |
| `7d85c530` | Kéo `onehub` mới vào (366 commit), gỡ đụng độ ở `catalog.ts` giữ cả hai phía |
| `e43c7c1f` | Bản mẫu: các việc còn lại ở mục 16, từ điển, `[[Trang#Mục]]` |
| `6e30cbe3` | Bản mẫu: duyệt mọi thay đổi |
| `98158842` | Ba tệp nghiên cứu nền |
| `1aff8fb9` | Trình đọc: hộp ghi chú `role="note"`, chặn ảnh ngoài và liên kết không `https` |
| `7371f8c8` | Trình đọc markdown |
| `142bf3bd` | Bản mẫu đầu tiên |

## 2. Đã chốt

| Ngày | Ai | Quyết định |
| --- | --- | --- |
| 2026-09-26 | Manh Phan | Theo mẫu LLM Wiki: máy soạn bản đề xuất, chủ trang duyệt, trợ lý AI chỉ đọc bản đang dùng |
| 2026-09-26 | Manh Phan | **Duyệt mọi thay đổi**, kể cả sửa chính tả và liên kết; không có bậc tự áp dụng; chỉ xét nới sau pilot có số đo bắt lỗi mồi |
| 2026-09-27 | Manh Phan | **Bỏ hạng mục pháp lý.** Lộ trình chỉ theo dõi bàn giao phần mềm; không lượt nào có cổng luật sư; tuân thủ khi chạy production do chủ kho lo |
| 2026-09-26 | Máy, chủ kho chưa veto | Mặc định ở mục 10.2 của tài liệu trình bày: Postgres `tsvector` + `unaccent` + `pg_trgm`; CodeMirror 6; callout theo GitHub; phạm vi xem theo vai sẵn có; hạn xác minh 90/180 ngày/12 tháng; nhắc trong ứng dụng cộng email; khoá AI riêng; đồ thị ở lượt 4; pilot một phòng ban |

Ngày trong lộ trình là đề xuất của máy, **chưa chốt**.

## 3. Việc kế tiếp

Theo thứ tự, lấy từ mục 4 của lộ trình:

Đường bàn giao phần mềm:

1. Duyệt tám mục từ điển ở cuối `CONTEXT.md`.
2. Mở lượt 1a: `/feature-loop:feature-loop kho-tai-lieu — lượt 1a của docs/plan/lo-trinh-kho-tai-lieu.md`.

Song song, không chặn 1a và 1b (dòng 7 của sổ):

- Gom tệp trong các nhóm Zalo, theo `kho-tai-lieu-kiem-ke.md` mục 3. Gấp: Zalo xoá tệp.
- Kiểm kê tài liệu và hỏi giờ duyệt, theo `kho-tai-lieu-kiem-ke.md` mục 1–2.
- Chọn phòng ban pilot, khoảng 20 tài liệu; gom 50 câu hỏi thật theo
  `kho-tai-lieu-bo-vang.md`, dán bảng gom vào phiên để máy chuẩn hoá.

## 4. Điều máy đã học mà repo chưa ghi

Chép từ trí nhớ của phiên trên máy cũ. Mỗi dòng đã kiểm lại trong phiên đó.

- **Từ điển:** «tác nhân» trong kho này là việc tự động do người dùng dựng. Người trả lời
  câu hỏi trong kho là **trợ lý AI**. Người sở hữu thoả thuận là «người phụ trách», nên
  người sở hữu trang là **chủ trang**.
- **Vai và phạm vi có sẵn:** `packages/validation/src/vai-workspace.ts` khai vai
  `owner/admin/member/okr` và phạm vi `doi-tac/to-chuc/okr/chung` qua `docDuocPhamVi`.
  Đây là nền cho phạm vi xem của trang; đừng dựng cơ chế quyền thứ hai.
- **AI Gateway:** tác nhân hiện gọi Gateway bằng mã model trần, **không** truyền
  `providerOptions` (không ZDR, không chọn vùng). Khoá dùng chung với làn nghiên cứu;
  trần bám ngân sách team 20 USD/tháng, khu OKR 9 USD. Kho tài liệu cần khoá riêng.
- **Neon:** đã gỡ `pg_search` ngày 2026-09-21 (dùng `lakebase_text` nếu cần BM25). Neon
  từng hết hạn mức ngày 2026-09-25 và khoá đăng nhập production; nhịp điều phối tác
  nhân mỗi phút giữ compute thức. Không thêm nhịp thăm dò mới.
- **Streamdown** chỉ nạp được từ `packages/ui` (không phải dependency của `apps/app`),
  nên trình đọc phải sống trong `packages/ui`. Mặc định của nó cho mọi ảnh và mọi giao
  thức; trình đọc đã chặn bằng `urlTransform`.
- **`Alert` của `@crm/ui` đặt `role="alert"`** trước `{...props}`; ghi đè bằng
  `role="note"` cho nội dung tĩnh.
- **Biome ở gốc kho bỏ qua `packages/ui`**; lint gói đó bằng `bun run lint` bên trong
  `packages/ui`. Luật `oxlint` chống cẩu thả cấm `Record<string, …>` mở rộng kiểu một
  hằng đã biết: dùng `satisfies` rồi `new Map(Object.entries(…))`. Biome giới hạn độ
  phức tạp một hàm là 62: tách thành phần sớm.
- **Kiểm bản mẫu trong khung xem:** `.click()` bằng script đôi khi không bật được nút
  Radix (toggle, radio); khi nghi, bấm thật bằng `find` rồi `left_click`. Chủ kho hay
  bấm cùng lúc trong khung xem: thấy địa chỉ tự đổi thì dừng điều khiển.
- **Research nhiều tác nhân** cạn hạn mức tìm web 200 lượt giữa chừng. Chia workflow
  nhỏ; không đọc thô kết quả 1 MB; kiểm lại mọi khẳng định của tác nhân về mã kho.
- **Chủ kho nhắc tiết kiệm token**: không mở workflow lớn khi chưa được đồng ý.

## 5. Chạy tiếp ở máy khác

Cần: Bun, Node 24, Postgres chạy được cho test, Chrome, và `.env` của kho (không nằm
trong git; lấy từ nơi chủ kho giữ bí mật, **không** gửi qua chat).

```bash
git clone https://github.com/phanlemanh/crm-onehub.git crm && cd crm
```

```bash
git config http.version HTTP/1.1
```

```bash
git fetch origin && git switch proto/kho-tai-lieu
```

```bash
git merge origin/onehub
```

Đặt `.env` vào gốc kho, rồi:

```bash
bun install && (cd packages/db && bun run db:generate)
```

Xem bản mẫu (cổng 3300 để không đụng bản dev khác ở 3000):

```bash
cd apps/app && PROTO_ROUTE=1 bunx next dev -p 3300
```

Mở `http://localhost:3300/proto/kho-tai-lieu`.

Kiểm trước khi đẩy, từ gốc kho:

```bash
bun run check-types && bun run lint && bun run lint:slop && bun run test && bun run build
```

**Câu mở phiên cho Claude ở máy mới** (dán nguyên văn):

> Tiếp tục Kho tài liệu của CRM OneHub trên nhánh `proto/kho-tai-lieu`. Đọc theo
> thứ tự: `docs/plan/kho-tai-lieu-ban-giao.md`, mục 8 của
> `docs/plan/lo-trinh-kho-tai-lieu.md`, rồi mục 1 và 17 của
> `docs/plan/kho-tai-lieu-nghien-cuu.md`. Tài liệu trình bày ở
> https://claude.ai/artifact/8B5uoGwQd4eyGb8wCNw8CN. Nói cho tôi đang ở lượt nào và
> việc kế tiếp là gì, rồi làm.

Sau mỗi hạng mục, sửa dòng của nó ở mục 8 của lộ trình, cột «Commit» ở mục 1 tệp này, và
các bản ghi tương ứng trên trang theo dõi tiến độ (`hang-muc`, `viec`, `nhat-ky`, `meta/tong`).
