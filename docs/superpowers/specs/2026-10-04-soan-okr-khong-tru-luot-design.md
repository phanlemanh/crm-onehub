# Soạn OKR: lượt không tới Trợ lý thì không bị tính; «Thử lại» nói vì sao

Hàng R1h của `docs/plan/lo-trinh-okr.json` (#7, #8 của khảo sát lộ trình 04/10). Chủ kho chốt
04/10: phòng ban dùng Soạn OKR cho quý 4. Cổng Đáng ký 04/10 (`opportunity.md`).

## Vì sao

**#7.** Cửa `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts` gọi `okr.soanTangLuot` (dòng
90–100) trước khi chuyển lượt lên `apps/agent-okr` (dòng 131). Lượt bị tính ngay cả khi:

- không nối được tới trợ lý (`fetch` ném lỗi → 502 `tro-ly-okr-khong-noi-duoc`);
- trợ lý trả 4xx hay 5xx (cầu nối sai bí mật → 401, máy trợ lý hỏng → 5xx);
- mở phiên trợ lý trả 2xx nhưng cửa không dùng được kết quả (không đọc được mã phiên, ghi phiên
  hỏng, thua đua với một lần mở khác).

Thiệt hại kép: `soLuot` chạm trần `luotMoiCuoc` (12) sớm hơn, và cuộc mà lượt đầu đã hỏng vẫn bị
tính vào trần `cuocMoiDonViMoiKy` (3) vì `demCuocTrongKy` đếm cuộc có `soLuot > 0`.

**#8.** `dung-cuoc-soan.ts:228-240` — «Thử lại» có ba đường im:

- gửi lại tin cuối (`guiThang`) nuốt lỗi; chỗ báo lỗi giữ đúng câu chung cũ, nên bấm xong không
  thấy gì đổi;
- mở lại cuộc (`soanMo` với `thuLaiCuocId`) ném lỗi (`ConflictException` khi đổi phiên thua, lỗi
  mạng) thì không ai bắt;
- câu báo lỗi chỉ có hai bản chung («quá 45 giây», «dừng giữa chừng») — không nói không nối được,
  hết phiên đăng nhập hay chưa đếm được lượt.

## Thiết kế

### Giữ chỗ rồi hoàn lại, ngay tại cửa

Cửa vẫn tăng lượt TRƯỚC khi chuyển (giữ chỗ), để trần không thủng khi hai lượt đi song song. Khi
cửa sắp trả cho người dùng một kết quả hỏng sau khi đã giữ chỗ, cửa hoàn đúng một lượt cho đúng
cuộc đó:

| Kết quả sau khi giữ chỗ | Hoàn? | Cửa trả |
|---|---|---|
| `fetch` ném lỗi, người dùng KHÔNG tự huỷ | có | 502 `{ error: "tro-ly-okr-khong-noi-duoc", detail, luot: "da-hoan" }` |
| Trợ lý không trả lời trong `CUA_OKR.choTroLyMs` (cửa tự cắt) | có | 504 `{ error: "tro-ly-okr-qua-han", luot: "da-hoan" }` |
| `fetch` ném lỗi vì `request.signal` đã huỷ (người dùng rời trang, bấm dừng) | không | như hôm nay |
| Trợ lý trả 3xx hoặc 4xx | có | status của Trợ lý, `{ error: "tro-ly-okr-tu-choi", luot: "da-hoan" }` |
| Trợ lý trả 5xx | có | status của Trợ lý, `{ error: "tro-ly-okr-loi", luot: "da-hoan" }` |
| mở phiên: Trợ lý `ok` nhưng không đọc được mã phiên | có | 502 `{ error: "khong-doc-duoc-phien", luot: "da-hoan" }` |
| mở phiên: ghi phiên hỏng / thua đua | có | 502 `khong-ghi-duoc-phien` / 409 `da-co-phien`, thêm `luot: "da-hoan"` |
| Trợ lý trả `ok` và cửa dùng được | không — lượt tính như hôm nay | như hôm nay |

`luot: "da-hoan"` chỉ có mặt khi `hoanLuot` THẬT SỰ trừ (`{ tru: true }`). Đó là căn cứ duy nhất để
màn nói «Lượt này không bị tính»: lỗi của luồng GET, lỗi mất mạng phía trình duyệt và lượt mà
hoàn hỏng đều không mang trường này, nên màn không hứa điều không đúng.

Thời hạn `CUA_OKR.choTroLyMs` nằm trong `cua-okr-config.ts` (một chỗ cho số có thể chỉnh). POST
của eve trả ngay khi nhận lượt, nên thời hạn chỉ cắt khi Trợ lý treo; nó phải ngắn hơn thời hạn
hàm của route để cửa còn kịp hoàn. Cửa phân biệt hai lối huỷ bằng `request.signal.aborted`: người
dùng huỷ thì không hoàn, thời hạn của cửa cắt thì hoàn.

Vì sao không hoàn khi người dùng tự huỷ: lượt có thể đã tới trợ lý trước khi huỷ, và trợ lý vẫn
chạy lượt đó. Hoàn ở đây mở một đường gửi rồi huỷ liên tục để chạy trợ lý không giới hạn.

Hoàn lượt là hàm mới `hoanLuot(db, cuocId)` trong `packages/db/src/okr-cuoc-soan.ts`, cạnh
`tangLuot`: một `updateMany` có điều kiện `soLuot > 0`, trừ 1, không chạm cuộc khác, không bao giờ
xuống dưới 0. Cửa gọi nó thẳng qua `db`, như cửa đã gọi `capNhatPhien` và `noiPhienMoCoi`.

Không thêm thủ tục tRPC: mọi thủ tục `soan*` lộ cho người dùng qua REST và tRPC, nên một thủ tục
«hoàn lượt» là đường để người dùng tự hoàn lượt đã thành công. Hoàn chỉ xảy ra trong mã máy chủ
của cửa, sau một kết quả hỏng mà cửa tự thấy.

Hoàn lượt mà kho hỏng thì cửa vẫn trả status của lỗi gốc, thân không mang `luot: "da-hoan"`. Lượt
đó mất như hôm nay, và cửa ghi một dòng `console.error` có tên (`hoan-luot-hong`, mã cuộc) — cùng
cách `app/api/[...path]/route.ts` ghi lỗi — để không im lặng.

`demCuocTrongKy` giữ nguyên (`soLuot > 0`): cuộc mà mọi lượt đều hỏng quay về 0 và tự rời khỏi
trần cuộc của kỳ, không cần đổi hàm đếm.

### Lượt tới trợ lý rồi mới hỏng: ngoài lượt này

eve trả lời POST ngay (`sessionId`, `continuationToken`); luồng sự kiện là GET riêng. POST thành
công nghĩa là trợ lý đã nhận lượt. Lượt nhận rồi mới hỏng trong luồng (mô hình lỗi, Gateway hết
ngân sách → `turn.failed`) thì cửa không thấy, nên vẫn tính. Muốn hoàn ca này phải để
`apps/agent-okr` tự hoàn khi lượt hỏng — ngoài ranh giới tệp của P5 và cần một vòng riêng (trình
ở Cổng Phạm vi).

### «Thử lại» nói vì sao

Một hàm thuần mới `lyDoHong` trong `loi-cua.ts` đọc lỗi của phiên (`agent.error`), cờ quá 45 giây
và lỗi của lần mở lại, rồi trả `{ ma, daHoan }`: `ma` là đúng một mã trong tập đóng dưới đây,
`daHoan` đúng khi và chỉ khi thân lỗi mang `luot: "da-hoan"`. Câu «Lượt này không bị tính.» là một
dòng riêng (`hoiThoai.khongTinh`), chỉ hiện khi `daHoan`.

| Mã | Khi nào | Câu (vi) |
|---|---|---|
| `khong-noi-duoc` | 502 `tro-ly-okr-khong-noi-duoc` | Không nối được tới Trợ lý OKR. |
| `qua-han` | 504 `tro-ly-okr-qua-han` | Trợ lý OKR không trả lời kịp. |
| `tro-ly-tu-choi` | `tro-ly-okr-tu-choi`; status 4xx khác mọi mã cửa đã có tên | Trợ lý OKR từ chối lượt này. |
| `tro-ly-loi` | `tro-ly-okr-loi`; status 5xx khác mọi mã cửa đã có tên | Trợ lý OKR đang gặp lỗi. |
| `chua-dem-duoc-luot` | 502 `khong-dem-duoc-luot` | Chưa đếm được lượt nên chưa gửi. Thử lại sau ít phút. |
| `chua-mo-duoc-phien` | 502 `khong-doc-duoc-phien`, `khong-ghi-duoc-phien` | Chưa mở được phiên trò chuyện. |
| `het-dang-nhap` | 401 `chua-dang-nhap` | Phiên đăng nhập đã hết — tải lại trang để đăng nhập lại. |
| `mat-mang` | lỗi không có status (trình duyệt mất mạng) | Mất kết nối mạng. Kiểm tra mạng rồi thử lại. |
| `chua-mo-lai-duoc` | lần mở lại cuộc ném lỗi | Chưa mở lại được cuộc này. Thử lại sau ít phút. |
| `qua-45s` | quá 45 giây không có hồi âm (giữ câu cũ) | Quá 45 giây không có hồi âm. Bản nháp bên cạnh giữ nguyên. |
| `dung-giua-chung` | phiên dừng giữa chừng, không có lỗi HTTP (giữ câu cũ) | Phiên trò chuyện đã dừng giữa chừng. Bản nháp bên cạnh giữ nguyên. |

Các ca đã có chỗ riêng giữ nguyên: từ chối lượt có tên (`lyDoLuot`), chưa cấu hình, phiên khác
đang sống, mở lại trả `ok: false` (câu `lyDo` sẵn có). «Thử lại» rơi vào một trong các ca này thì
chỗ báo lỗi chung biến mất và thông báo có tên của ca hiện ra — cũng là một thay đổi nhìn thấy.

`LuotLoi` hiện câu của mã mới nhất. Mỗi lần bấm «Thử lại» mà vẫn hỏng, chỗ báo lỗi thêm dòng
«Đã thử lại N lần», nên một lần bấm luôn thấy được. Nút khoá trong lúc lần thử đang chạy. Câu
nằm trong vùng `aria-live="polite"`.

Chữ «Trợ lý OKR» giữ như phần còn lại của màn; đổi sang Kara là hàng K6a, sau.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: màn soạn → gửi tin → Trợ lý trả lời (không đổi).
- Biên: lượt không tới trợ lý → chỗ báo lỗi nói vì sao, kèm «Lượt này không bị tính»; số lượt còn lại không giảm.
- Lỗi & quay lại: bấm «Thử lại» → nút khoá, chờ → qua: chỗ báo lỗi biến mất; vẫn hỏng: câu của lý do mới + «Đã thử lại N lần», nút mở lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Màn soạn (`ManSoan` › `HoiThoaiSoan`) | Trò chuyện với Trợ lý để soạn bản nháp OKR | Theo đơn vị `?cuocSoan=` / Đưa vào bộ OKR |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-soan-loi-khong-noi | Màn soạn | `Alert` lỗi: «Trợ lý OKR chưa trả lời được» + «Không nối được tới Trợ lý OKR.» + «Lượt này không bị tính.» (chỉ khi cửa đã hoàn) + nút «Thử lại» | Bấm «Thử lại» |
| ST-soan-loi-mat-mang | Màn soạn | «Mất kết nối mạng. Kiểm tra mạng rồi thử lại.», không câu «không bị tính» | Bấm «Thử lại» khi có mạng |
| ST-soan-loi-dang-thu | Màn soạn | Cùng `Alert`, nút «Thử lại» khoá | Chờ |
| ST-soan-loi-thu-lai-van-hong | Màn soạn | Câu của lý do mới + «Đã thử lại N lần» | Bấm lại, hoặc rời màn |
| ST-soan-loi-mo-lai-hong | Màn soạn | «Chưa mở lại được cuộc này. Thử lại sau ít phút.» + «Đã thử lại N lần» | Bấm lại sau |
| ST-soan-loi-het-dang-nhap | Màn soạn | «Phiên đăng nhập đã hết — tải lại trang để đăng nhập lại.» | Tải lại trang |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Câu lý do và dòng đếm nằm trong vùng `aria-live="polite"`; nút «Thử lại» `disabled` khi lần thử đang chạy (gửi lại đang `submitted` hay mở lại đang `isPending`).
- Ở 390 px câu xuống dòng trong `Alert`, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`, `Button` (`@crm/ui`) | dùng | `LuotLoi` đã dựng bằng chúng; chỉ đổi chữ và thêm một dòng |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: màn soạn đã là hội thoại với Trợ lý; lượt này chỉ đổi nội dung chỗ báo lỗi có sẵn, không đổi khuôn — luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Tệp chạm

- `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts` — hoàn lượt, thời hạn chờ Trợ lý.
- `apps/app/lib/cua-okr-config.ts` — `choTroLyMs`, ba mã lỗi mới của cửa.
- `packages/db/src/okr-cuoc-soan.ts` — `hoanLuot` (điều phối duyệt 04/10 12:50).
- `apps/app/app/(app)/[slug]/okr/soan/loi-cua.ts`, `dung-cuoc-soan.ts`, `hoi-thoai-soan.tsx`, `kieu.ts` — lý do và «Thử lại».
- `apps/app/lib/messages/okr-soan.ts` — chỉ THÊM khoá; `apps/app/test/messages-guard.spec.ts` ghim.
- `docs/api.md`, `docs/agent.md` — câu «`soanTangLuot` là chỗ duy nhất đếm lượt» thêm vế hoàn lượt ở cửa.
- Tệp kiểm MỚI (không sửa tệp kiểm của hồ sơ đã ký): `packages/db/test/okr-hoan-luot.spec.ts`,
  `apps/app/test/soan-okr-khong-tru-luot.spec.ts`, `apps/app/test/soan-okr-ly-do-loi.spec.ts`,
  `apps/app/test/soan-okr-thu-lai.dom.tsx`, `apps/app/test/soan-okr-hoan-hong.spec.ts`,
  `apps/api/test/soan-okr-hoan-luot.spec.ts`.

Không chạm: `nut-soan.tsx` (P1), `nop_ban_nhap.ts` và `packages/validation/src/okr-cuoc-soan.ts`
(PR #248), `schema.prisma`, `apps/agent-okr/**`.
