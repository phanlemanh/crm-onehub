# Ca chập chờn cách ly — thiết kế

Hàng F11 của `docs/plan/lo-trinh-okr.json`, đợt `sau-14-10`, thợ P5. Chủ kho duyệt thiết kế ngắn ngày 08/10/2026, rồi duyệt lại bản sửa sau khi tái hiện.

## Vấn đề

Một số ca kiểm đỏ theo trạng thái của máy chứ không theo mã. Mỗi lần đỏ, cả lượt dài (ghim lại, S4, pre-push) phải chạy lại từ đầu. Hai lần đêm 05–06/10 mất khoảng 2 giờ 20 phút.

### Soát ngày 08/10

Nguồn: lịch sử CI 01–07/10 và nhật ký đợt `dieu-phoi-1410/trang-thai/P4.md`.

| Ca | Còn chập chờn? | Căn cứ |
| --- | --- | --- |
| `apps/agent-okr/test/app-rieng.integration.spec.ts` «chạy cạnh apps/agent» | còn, gốc chưa rõ | 06/10 01:54: `Expected: 404 Received: 503 … timed out after 5000ms`, lặp 3/3 khi chạy riêng. Dời `.eve/dev-runtime` và `.eve/dev-hosts` ra ngoài thì xanh 5/5. CI không thấy lỗi này vì job chính chạy Node < 24 nên bỏ ca. |
| eve mồ côi của một lượt test bị giết | còn, đã tái hiện | 08/10: SIGKILL tiến trình `bun test` của `app-rieng` giữa lượt để lại một `eve dev` sống, cha là 1. Lượt sau đỏ có tên: «goc … dang co eve dev khong phai cua bai thu (pid …); dung no bang: kill …». Tái hiện 1/1. |
| `apps/api/test/tai-lieu-khong-ro.spec.ts`, `tai-lieu-thay-trang.spec.ts` | còn | CI run 37273745274 a1 (05/10): `(fail) (unnamed) [5000.98ms]`, hook hết giờ ngay sau khi Nest khởi tạo. `dungSan()` và `beforeAll` riêng của hai spec đều chạy dưới trần mặc định 5 s của bun. Kho không có `bunfig.toml` nào đặt `timeout` cho `apps/api`. |
| `nguoi-huy` | đã sửa | PR #294 (77f7afa9). Sáu lượt CI sau đó đều xanh. |

### Tái hiện ngày 08/10 (eve 0.29.4, cùng bản với đêm 06/10)

| Kịch bản | Kết quả |
| --- | --- |
| Đường nền trên cây có `.eve/dev-runtime` và `.eve/dev-hosts` sót | xanh |
| SIGKILL thẳng vào `eve dev` rồi chạy ca | xanh; không tiến trình nào sống sót |
| SIGKILL tiến trình test giữa lượt | eve mồ côi; lượt sau đỏ có tên |
| giết eve mồ côi theo lời nhắc, để sót `dev-runtime`, `dev-hosts`, `dev-cleanup-intent`, `dev-server-state.v1.json` | xanh; eve tự dọn hai tệp trạng thái |

Kết luận: giả thuyết «trạng thái `.eve` sót gây 503» không tái hiện được. Bản thiết kế đầu có bước dọn `.eve`; bước đó đã bỏ.

## Cách làm

Sửa ở tầng test. Mã sản phẩm không đổi.

1. **Dọn eve mồ côi của lượt bị ngắt.**
   - `khoiDongEve` (`apps/agent-okr/test/support/khoi-dong.ts`) ghi pid của từng `eve dev` nó sinh vào tệp chủ khoá của gốc, `chu.json` dưới `KHOI_DONG.khoa.thuMuc`. Tệp đó hôm nay chỉ ghi `pid` và `tep` của tiến trình test.
   - Lượt sau gặp khoá cũ (chủ đã chết) thì dừng đúng các pid đã ghi, trước khi gỡ khoá và khởi động. Chỉ dừng pid nào còn sống và có dòng lệnh đúng là `eve dev` của chính gốc đó.
   - Eve không có trong tệp khoá (người khác khởi động bằng tay) không bị đụng tới; ca giữ lỗi có tên như hôm nay. Pid đã ghi mà nay thuộc một tiến trình khác (pid bị tái dùng) cũng không bị đụng tới.
2. **Chờ route thật sẵn sàng, có trần.**
   - Sau `/eve/v1/health`, `khoiDongEve` hỏi `/health` của app cho tới khi nhận một mã khác 503 (200 hoặc 404 đều là đã sẵn sàng). Từ chối kết nối được tính là chưa sẵn sàng.
   - Trần là `KHOI_DONG.sanSang`, nhỏ hơn trần hook mà `app-rieng` dành cho mỗi gốc. Nhờ vậy lỗi có tên luôn ra trước khi hook hết giờ.
   - Hết trần thì ném lỗi gọi tên route và mã cuối cùng (hoặc «khong ket noi»).
   - Bước này không chữa gốc 503 của đêm 06/10, vì gốc đó chưa rõ. Nó chỉ đổi kết cục: nếu 503 là nhất thời thì ca chờ qua được; nếu không thì ca đỏ có tên, thay vì hết giờ 5 s không tên.
3. **Trần hook dựng Nest có tên.**
   - `beforeAll` của `dungSan()` (`apps/api/test/tai-lieu-san.ts`) và `beforeAll` riêng của `tai-lieu-khong-ro` và `tai-lieu-thay-trang` nhận trần `TAI_LIEU_SAN.hookMs`.
   - Hằng đó khai một lần trong `tai-lieu-san.ts`.
4. **Công tắc bỏ ca tới được test.** Thêm `SOKR_KHONG_CHAY_AGENT_CU` vào `globalPassThroughEnv` của `turbo.json`, để `SOKR_KHONG_CHAY_AGENT_CU=1 bun run test` bỏ được ca «chạy cạnh».

Hằng mới nằm trong khối cấu hình có sẵn của từng vùng: `KHOI_DONG` cho eve, `TAI_LIEU_SAN` cho Nest.

## Đã cân và bỏ

- **Dọn `.eve/dev-runtime`, `dev-hosts`, `dev-cleanup-intent` trước khi khởi động.** Bỏ vì không tái hiện được lỗi từ trạng thái đó, và chính eve đã tự dọn tệp trạng thái của nó.
- **Giết mọi `eve dev` đang nghe ở gốc.** Bỏ vì sẽ giết cả eve người khởi động bằng tay. Chỉ dừng pid mà chính bài thử đã ghi.
- **Sổ cách ly** (tệp liệt ca chập chờn và người phụ trách, CI chạy ở job không chặn). Bỏ ở vòng này vì mọi ca trong ranh giới đều có cách sửa. Dựng khi gặp một ca không sửa kín được, hoặc khi 503 quay lại.
- **Nâng trần chung toàn gói** (`bunfig.toml timeout`). Bỏ vì nó che mọi ca chậm khác.
- **Sửa trong eve.** eve là gói ngoài.

## Ngoài ranh giới (yêu cầu `P5-5`, giám sát đã nhận)

- `goi-soan.integration.spec.ts:376` và `tasks.integration.spec.ts:337` → hàng F17 `ca-chap-chon-con-lai`.
- `trinh-soan-lien-ket.dom.tsx:205` → P4, hàng F14.

## Chạm tệp ngoài ranh giới hàng

Giám sát đã duyệt ở yêu cầu `P5-4` và `P5-6`:

- `apps/agent-okr/test/support/khoi-dong.ts`
- `apps/api/test/tai-lieu-san.ts`
- `turbo.json` (chỉ thêm một dòng; chủ kho đồng ý khi duyệt thiết kế)
- `apps/agent-okr/test/khoi-dong-don.spec.ts` (tệp mới)

## Kiểm chứng

- Kiểm đơn vị cho bước dọn eve mồ côi và bước chờ route.
  - Dùng một gốc tạm có `node_modules/.bin/eve` giả.
  - Tệp khoá do chính hàm ghi khoá của `khoi-dong.ts` viết, không viết tay.
  - Mỗi nhánh có cặp hai chiều trên cùng một bàn thử.
- Một bàn đo tái hiện thật, chạy ba lượt liền:
  - Chạy `app-rieng`, đợi eve con lên, SIGKILL tiến trình test, khẳng định eve mồ côi còn sống.
  - Chạy lại ca «chạy cạnh»: phải xanh, và eve mồ côi phải đã bị dừng.
  - Chiều đỏ: trên bản sao đã gỡ bước dọn, cùng bàn đo đỏ đúng thông điệp «dang co eve dev khong phai cua bai thu».
- Bản sao phá-thử cho ba hook Nest: ma trận 3 hook × 2 chiều, mỗi lần cài một lần ngủ 6 s vào hook.
- Công tắc: chạy `bun run test` qua turbo với biến bật, thấy ca «chạy cạnh» bị bỏ thật. Đối chứng không bật biến thì ca chạy.
